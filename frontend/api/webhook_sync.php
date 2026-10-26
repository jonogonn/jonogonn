<?php
/**
 * Janogon News (জনগণ.নিউজ) - Secure HTTPS Replica Webhook Receiver
 * Path: /api/webhook_sync.php
 * 
 * Secure endpoint on Secondary Hosting that receives news updates from Primary Hosting.
 * Security features:
 * 1. Only accepts POST requests with valid HMAC-SHA256 signature and fresh timestamp.
 * 2. Unauthorized access gets zero information (HTTP 403/404).
 * 3. Never outputs internal database credentials, stack traces, or server environment.
 * 4. Executes locally into localhost MariaDB (100% bypasses external port 3306 firewall).
 */

header('Content-Type: application/json; charset=utf-8');

// 1. Strict Method Check (Disallow GET, HEAD, etc.)
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// 2. Validate HMAC Signature & Timestamp
$secret = defined('REPLICA_SYNC_SECRET') ? trim(REPLICA_SYNC_SECRET) : '';
if (empty($secret)) {
    http_response_code(500);
    echo json_encode(['error' => 'Service unavailable']);
    exit;
}

$reqTimestamp = (int)($_SERVER['HTTP_X_SYNC_TIMESTAMP'] ?? 0);
$reqSignature = trim($_SERVER['HTTP_X_SYNC_SIGNATURE'] ?? '');

// Prevent replay attacks (must be within 5 minutes)
if (abs(time() - $reqTimestamp) > 300 || empty($reqSignature)) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty payload']);
    exit;
}

// Verify HMAC
$expectedSignature = hash_hmac('sha256', $reqTimestamp . '.' . $rawInput, $secret);
if (!hash_equals($expectedSignature, $reqSignature)) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$payloadObj = json_decode($rawInput, true);
if (!is_array($payloadObj) || empty($payloadObj['action'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload format']);
    exit;
}

$action = $payloadObj['action'];
$data   = $payloadObj['payload'] ?? [];

$pdo = getDB();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['error' => 'Database service temporarily unavailable']);
    exit;
}

try {
    // Ensure table structure exists locally on replica
    if (function_exists('provisionDatabaseSchema')) {
        $checkTable = $pdo->query("SHOW TABLES LIKE 'news_posts'");
        if (!$checkTable || $checkTable->rowCount() === 0) {
            provisionDatabaseSchema($pdo);
        }
    }

    if ($action === 'save_news' && !empty($data)) {
        $tableName = 'news_posts';
        $postId = $data['post_id'] ?? ($data['id'] ?? null);
        $slug   = $data['slug'] ?? '';

        if (!$postId && !$slug) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing post identifier']);
            exit;
        }

        // Check if row exists locally
        $checkStmt = $pdo->prepare("SELECT `id` FROM `{$tableName}` WHERE `post_id` = ? OR `slug` = ? LIMIT 1");
        $checkStmt->execute([$postId, $slug]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        // Filter valid columns
        $colsStmt = $pdo->query("SHOW COLUMNS FROM `{$tableName}`");
        $colsMap = [];
        while ($c = $colsStmt->fetch(PDO::FETCH_ASSOC)) {
            $colsMap[strtolower($c['Field'])] = true;
        }

        $validFields = [];
        foreach ($data as $k => $v) {
            if (isset($colsMap[strtolower($k)])) {
                $validFields[$k] = is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : $v;
            }
        }

        if ($existing) {
            $setClauses = [];
            $values = [];
            foreach ($validFields as $key => $val) {
                if ($key !== 'id') {
                    $setClauses[] = "`{$key}` = ?";
                    $values[] = $val;
                }
            }
            $values[] = $existing['id'];

            $updateSql = "UPDATE `{$tableName}` SET " . implode(', ', $setClauses) . " WHERE `id` = ?";
            $pdo->prepare($updateSql)->execute($values);
        } else {
            $colNames = array_keys($validFields);
            $placeholders = array_fill(0, count($colNames), '?');
            $values = array_values($validFields);

            $insertSql = "INSERT INTO `{$tableName}` (" . implode(', ', array_map(fn($k) => "`$k`", $colNames)) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $pdo->prepare($insertSql)->execute($values);
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'saved']);
        exit;
    }

    if ($action === 'delete_news' && !empty($data)) {
        $id = $data['id'] ?? ($data['post_id'] ?? ($data['slug'] ?? null));
        if ($id) {
            $pdo->prepare("DELETE FROM `news_posts` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?")->execute([$id, $id, $id]);
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'deleted']);
        exit;
    }

    if ($action === 'bulk_sync' && !empty($data['articles']) && is_array($data['articles'])) {
        $articles = $data['articles'];
        $syncedCount = 0;

        foreach ($articles as $art) {
            if (!is_array($art) || empty($art['slug'])) continue;

            $colsStmt = $pdo->query("SHOW COLUMNS FROM `news_posts`");
            $colsMap = [];
            while ($c = $colsStmt->fetch(PDO::FETCH_ASSOC)) {
                $colsMap[strtolower($c['Field'])] = true;
            }

            $valid = [];
            foreach ($art as $k => $v) {
                if (isset($colsMap[strtolower($k)]) && $k !== 'id') {
                    $valid[$k] = is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : $v;
                }
            }

            if (!empty($valid)) {
                $cols = array_keys($valid);
                $escapedCols = array_map(fn($c) => "`$c`", $cols);
                $placeholders = implode(', ', array_fill(0, count($cols), '?'));
                $replaceSql = "REPLACE INTO `news_posts` (" . implode(', ', $escapedCols) . ") VALUES ({$placeholders})";
                $pdo->prepare($replaceSql)->execute(array_values($valid));
                $syncedCount++;
            }
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'synced_articles' => $syncedCount]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unsupported action']);
    exit;

} catch (Exception $e) {
    // Log error internally only, never disclose details to caller
    @error_log("[Webhook Sync Error] " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal synchronization error']);
    exit;
}
