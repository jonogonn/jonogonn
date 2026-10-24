<?php
/**
 * Janogon News - Citizen Complaints API (অভিযোগ বক্স)
 * Stores and manages citizen complaints submitted through the complaint box.
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function ensureComplaintsTable($pdo) {
    if (!$pdo) return;
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `jonogon_complaints` (
            `id` VARCHAR(64) PRIMARY KEY,
            `title` VARCHAR(255) NOT NULL,
            `category` VARCHAR(64) DEFAULT 'corruption',
            `district` VARCHAR(64) DEFAULT 'dhaka',
            `name` VARCHAR(150) DEFAULT NULL,
            `phone` VARCHAR(50) DEFAULT NULL,
            `description` TEXT NOT NULL,
            `is_anonymous` TINYINT(1) DEFAULT 1,
            `file_name` VARCHAR(255) DEFAULT NULL,
            `status` ENUM('pending', 'reviewing', 'resolved', 'rejected') DEFAULT 'pending',
            `admin_notes` TEXT DEFAULT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (`category`),
            INDEX (`status`),
            INDEX (`district`),
            INDEX (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Exception $e) {}
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($pdo) {
    ensureComplaintsTable($pdo);
}

// -------------------------------------------------------------------------
// 1. GET: FETCH COMPLAINTS
// -------------------------------------------------------------------------
if ($method === 'GET') {
    try {
        if (!$pdo) {
            echo json_encode(['success' => true, 'complaints' => []]);
            exit;
        }

        $status = $_GET['status'] ?? '';
        $search = trim($_GET['search'] ?? '');

        $sql = "SELECT * FROM `jonogon_complaints` WHERE 1=1";
        $params = [];

        if ($status && $status !== 'all') {
            $sql .= " AND `status` = ?";
            $params[] = $status;
        }

        if ($search) {
            $sql .= " AND (`id` LIKE ? OR `title` LIKE ? OR `name` LIKE ? OR `phone` LIKE ? OR `district` LIKE ?)";
            $wildcard = "%{$search}%";
            $params = array_merge($params, [$wildcard, $wildcard, $wildcard, $wildcard, $wildcard]);
        }

        $sql .= " ORDER BY `created_at` DESC LIMIT 300";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $complaints = array_map(function($r) {
            return [
                'id' => $r['id'],
                'title' => htmlspecialchars_decode($r['title'], ENT_QUOTES),
                'category' => $r['category'],
                'district' => $r['district'],
                'name' => $r['name'] ? htmlspecialchars_decode($r['name'], ENT_QUOTES) : '',
                'phone' => $r['phone'] ? htmlspecialchars_decode($r['phone'], ENT_QUOTES) : '',
                'description' => htmlspecialchars_decode($r['description'], ENT_QUOTES),
                'isAnonymous' => (bool)$r['is_anonymous'],
                'fileName' => $r['file_name'],
                'status' => $r['status'],
                'adminNotes' => $r['admin_notes'],
                'createdAt' => $r['created_at']
            ];
        }, $rows);

        echo json_encode(['success' => true, 'complaints' => $complaints], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage(), 'complaints' => []]);
        exit;
    }
}

// -------------------------------------------------------------------------
// 2. POST: CREATE OR UPDATE STATUS / ADMIN NOTES
// -------------------------------------------------------------------------
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?: $_POST;

    $action = $input['action'] ?? 'create';

    // Update Status or Admin Notes
    if ($action === 'update_status' || isset($input['status_update'])) {
        $id = trim($input['id'] ?? '');
        $newStatus = trim($input['status'] ?? 'pending');
        $notes = trim($input['admin_notes'] ?? '');

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing complaint ID']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE `jonogon_complaints` SET `status` = ?, `admin_notes` = ? WHERE `id` = ?");
            $stmt->execute([$newStatus, $notes, $id]);
            echo json_encode(['success' => true, 'message' => 'অভিযোগের স্ট্যাটাস আপডেট হয়েছে।']);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }

    // New Complaint Submission
    $id = trim($input['id'] ?? ('JONOGON-' . rand(100000, 999999)));
    $title = trim($input['title'] ?? '');
    $category = trim($input['category'] ?? 'corruption');
    $district = trim($input['district'] ?? 'dhaka');
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $description = trim($input['description'] ?? '');
    $isAnonymous = !empty($input['isAnonymous']) ? 1 : 0;
    $fileName = trim($input['fileName'] ?? '');

    if (!$title || !$description) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Title and description are required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO `jonogon_complaints` 
            (`id`, `title`, `category`, `district`, `name`, `phone`, `description`, `is_anonymous`, `file_name`, `status`, `created_at`) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
            ON DUPLICATE KEY UPDATE 
            `title`=VALUES(`title`), `description`=VALUES(`description`), `status`=VALUES(`status`)");
        $stmt->execute([$id, $title, $category, $district, $name, $phone, $description, $isAnonymous, $fileName]);

        echo json_encode([
            'success' => true,
            'id' => $id,
            'message' => 'অভিযোগ সফলভাবে গ্রহণ করা হয়েছে।'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

// -------------------------------------------------------------------------
// 3. DELETE COMPLAINT
// -------------------------------------------------------------------------
if ($method === 'DELETE') {
    $id = trim($_GET['id'] ?? '');
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid ID']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM `jonogon_complaints` WHERE `id` = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'অভিযোগ মুছে ফেলা হয়েছে।']);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}
