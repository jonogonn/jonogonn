<?php
/**
 * Janogon News (জনগণ.নিউজ) - Universal MariaDB Webhook Receiver
 * Path: /api/webhook_sync.php
 * 
 * Supports dynamic and atomic synchronization for ALL 19 Tables:
 * 1. admin_activity_logs
 * 2. ads_config
 * 3. article_comments
 * 4. backup_logs
 * 5. breaking_news
 * 6. categories
 * 7. category_master_groups
 * 8. emergency_services
 * 9. homepage_sections
 * 10. jonogon_complaints
 * 11. media_gallery
 * 12. media_uploads
 * 13. news
 * 14. news_posts
 * 15. podcasts
 * 16. site_settings
 * 17. top-news
 * 18. top_news
 * 19. video_news
 */

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$secret = defined('REPLICA_SYNC_SECRET') ? trim(REPLICA_SYNC_SECRET) : '';
if (empty($secret)) {
    http_response_code(500);
    echo json_encode(['error' => 'Service unavailable']);
    exit;
}

$reqTimestamp = (int)($_SERVER['HTTP_X_SYNC_TIMESTAMP'] ?? 0);
$reqSignature = trim($_SERVER['HTTP_X_SYNC_SIGNATURE'] ?? '');

// Replay window of 10 minutes
if (abs(time() - $reqTimestamp) > 600 || empty($reqSignature)) {
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

// Whitelist of valid project tables
$allowedTables = [
    'admin_activity_logs', 'ads_config', 'article_comments', 'backup_logs',
    'breaking_news', 'categories', 'category_master_groups', 'emergency_services',
    'homepage_sections', 'jonogon_complaints', 'media_gallery', 'media_uploads',
    'news', 'news_posts', 'podcasts', 'site_settings', 'top-news', 'top_news', 'video_news'
];

try {
    // -------------------------------------------------------------
    // UNIVERSAL HANDLER 1: DYNAMIC ROWS REPLICATION (ANY TABLE)
    // -------------------------------------------------------------
    if ($action === 'sync_table_rows' && !empty($data['table']) && !empty($data['rows']) && is_array($data['rows'])) {
        $table = trim($data['table']);
        if (!in_array($table, $allowedTables)) {
            http_response_code(400);
            echo json_encode(['error' => 'Table not allowed for sync']);
            exit;
        }

        // Fetch valid columns on target
        $colStmt = $pdo->query("SHOW COLUMNS FROM `{$table}`");
        $targetCols = [];
        while ($c = $colStmt->fetch(PDO::FETCH_ASSOC)) {
            $targetCols[strtolower($c['Field'])] = true;
        }

        $syncedCount = 0;
        foreach ($data['rows'] as $row) {
            if (!is_array($row)) continue;

            $validRow = [];
            foreach ($row as $k => $v) {
                if (isset($targetCols[strtolower($k)])) {
                    $validRow[$k] = is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : $v;
                }
            }

            if (!empty($validRow)) {
                $cols = array_keys($validRow);
                $escapedCols = array_map(fn($c) => "`$c`", $cols);
                $placeholders = implode(', ', array_fill(0, count($cols), '?'));
                $sql = "REPLACE INTO `{$table}` (" . implode(', ', $escapedCols) . ") VALUES ({$placeholders})";
                $pdo->prepare($sql)->execute(array_values($validRow));
                $syncedCount++;
            }
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'table' => $table, 'synced_rows' => $syncedCount]);
        exit;
    }

    // -------------------------------------------------------------
    // UNIVERSAL HANDLER 2: DYNAMIC ROW DELETION (ANY TABLE)
    // -------------------------------------------------------------
    if ($action === 'delete_table_row' && !empty($data['table']) && !empty($data['column']) && isset($data['value'])) {
        $table  = trim($data['table']);
        $column = preg_replace('/[^a-zA-Z0-9_]/', '', $data['column']);
        $value  = $data['value'];

        if (!in_array($table, $allowedTables) || empty($column)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid delete parameters']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM `{$table}` WHERE `{$column}` = ?");
        $stmt->execute([$value]);

        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'deleted', 'table' => $table]);
        exit;
    }

    // -------------------------------------------------------------
    // MODULE HANDLERS: SITE SETTINGS
    // -------------------------------------------------------------
    if ($action === 'save_setting' || $action === 'save_settings_batch') {
        $stmt = $pdo->prepare("INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)");
        if (is_array($data)) {
            foreach ($data as $k => $v) {
                $jsonVal = is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : (string)$v;
                $stmt->execute([$k, $jsonVal]);
            }
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'settings_synced']);
        exit;
    }

    // -------------------------------------------------------------
    // MODULE HANDLERS: HOMEPAGE SECTIONS
    // -------------------------------------------------------------
    if ($action === 'save_sections' && is_array($data)) {
        $sectionsList = isset($data['homepageSections']) ? $data['homepageSections'] : (isset($data['sections']) ? $data['sections'] : $data);
        if (is_array($sectionsList) && count($sectionsList) >= 7) {
            $pdo->beginTransaction();
            $pdo->exec("DELETE FROM `homepage_sections`");
            $secStmt = $pdo->prepare("
                INSERT INTO `homepage_sections` (
                    `section_id`, `title_bn`, `name_bn`, `title_en`, `name_en`, `is_visible`, `order_index`, `layout_type`, `config_json`
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($sectionsList as $idx => $s) {
                $secId = $s['id'] ?? ('sec-' . $idx);
                $titleBn = $s['nameBn'] ?? ($s['title_bn'] ?? '');
                $titleEn = $s['nameEn'] ?? ($s['title_en'] ?? '');
                $visible = (!isset($s['isVisible']) || !empty($s['isVisible'])) ? 1 : 0;
                $layout = $s['type'] ?? ($s['layout_type'] ?? 'main');
                $configJson = json_encode($s, JSON_UNESCAPED_UNICODE);
                $secStmt->execute([$secId, $titleBn, $titleBn, $titleEn, $titleEn, $visible, $idx, $layout, $configJson]);
            }
            $pdo->commit();
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'sections_synced']);
        exit;
    }

    // -------------------------------------------------------------
    // MODULE HANDLERS: CATEGORIES & MASTER GROUPS
    // -------------------------------------------------------------
    if ($action === 'save_categories' && is_array($data)) {
        if (!empty($data['masterGroups']) && is_array($data['masterGroups'])) {
            $pdo->beginTransaction();
            $pdo->exec("DELETE FROM `category_master_groups`");
            $grpStmt = $pdo->prepare("
                INSERT INTO `category_master_groups` (
                    `group_id`, `group_key`, `title_bn`, `name_bn`, `title_en`, `name_en`, `order_index`, `sub_groups_json`
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($data['masterGroups'] as $idx => $g) {
                $grpId = $g['id'] ?? ($g['group_id'] ?? ('grp-' . $idx));
                $titleBn = $g['nameBn'] ?? ($g['title_bn'] ?? '');
                $titleEn = $g['nameEn'] ?? ($g['title_en'] ?? '');
                $subGroupsJson = json_encode($g['subGroups'] ?? [], JSON_UNESCAPED_UNICODE);
                $grpStmt->execute([$grpId, $grpId, $titleBn, $titleBn, $titleEn, $titleEn, $idx, $subGroupsJson]);
            }
            $pdo->commit();
        }

        if (!empty($data['categories']) && is_array($data['categories'])) {
            $catStmt = $pdo->prepare("
                INSERT INTO `categories` (
                    `slug`, `name`, `name_bn`, `name_en`, `master_group_id`, `master_group_bn`, `master_group_en`, `order_index`, `is_nav_visible`
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    `name` = VALUES(`name`),
                    `name_bn` = VALUES(`name_bn`),
                    `name_en` = VALUES(`name_en`),
                    `master_group_id` = VALUES(`master_group_id`),
                    `master_group_bn` = VALUES(`master_group_bn`),
                    `master_group_en` = VALUES(`master_group_en`),
                    `order_index` = VALUES(`order_index`),
                    `is_nav_visible` = VALUES(`is_nav_visible`)
            ");
            foreach ($data['categories'] as $idx => $c) {
                $slug = $c['slug'] ?? ($c['id'] ?? ('cat-' . $idx));
                $nameBn = $c['nameBn'] ?? ($c['name_bn'] ?? ($c['name'] ?? ''));
                $nameEn = $c['nameEn'] ?? ($c['name_en'] ?? '');
                $name = $c['name'] ?? $nameBn;
                $grpId = $c['masterGroupId'] ?? ($c['master_group_id'] ?? 'general');
                $grpBn = $c['masterGroupBn'] ?? ($c['master_group_bn'] ?? 'সাধারণ');
                $grpEn = $c['masterGroupEn'] ?? ($c['master_group_en'] ?? 'General');
                $order = (int)($c['orderIndex'] ?? ($c['order_index'] ?? $idx));
                $navVisible = !empty($c['isNavVisible']) || !empty($c['is_nav_visible']) ? 1 : 1;
                $catStmt->execute([$slug, $name, $nameBn, $nameEn, $grpId, $grpBn, $grpEn, $order, $navVisible]);
            }
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'categories_synced']);
        exit;
    }

    // -------------------------------------------------------------
    // MODULE HANDLERS: NEWS POSTS & BULK SYNC
    // -------------------------------------------------------------
    if ($action === 'save_news' && !empty($data)) {
        $tableName = 'news_posts';
        $postId = $data['post_id'] ?? ($data['id'] ?? null);
        $slug   = $data['slug'] ?? '';

        if (!$postId && !$slug) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing post identifier']);
            exit;
        }

        $checkStmt = $pdo->prepare("SELECT `id` FROM `{$tableName}` WHERE `post_id` = ? OR `slug` = ? LIMIT 1");
        $checkStmt->execute([$postId, $slug]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

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

        // Mirror to legacy news table if exists
        try {
            $chkNews = $pdo->query("SHOW TABLES LIKE 'news'");
            if ($chkNews && $chkNews->rowCount() > 0) {
                $pdo->prepare("REPLACE INTO `news` (`post_id`, `slug`, `title_bn`, `content_bn`) VALUES (?, ?, ?, ?)")
                    ->execute([$postId, $slug, $validFields['title_bn'] ?? ($validFields['title'] ?? ''), $validFields['content_bn'] ?? '']);
            }
        } catch (Exception $ex) {}

        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'news_saved']);
        exit;
    }

    if ($action === 'delete_news' && !empty($data)) {
        $id = $data['id'] ?? ($data['post_id'] ?? ($data['slug'] ?? null));
        if ($id) {
            $pdo->prepare("DELETE FROM `news_posts` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?")->execute([$id, $id, $id]);
            try {
                $pdo->prepare("DELETE FROM `news` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?")->execute([$id, $id, $id]);
            } catch (Exception $ex) {}
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'news_deleted']);
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

    // -------------------------------------------------------------
    // MODULE HANDLERS: PODCASTS, VIDEO NEWS, EMERGENCY, ADS
    // -------------------------------------------------------------
    if ($action === 'save_podcasts' && is_array($data)) {
        $items = (isset($data['titleBn']) || isset($data['title_bn'])) ? [$data] : (array_values($data));
        $colStmt = $pdo->query("SHOW COLUMNS FROM `podcasts`");
        $podCols = [];
        while ($c = $colStmt->fetch(PDO::FETCH_ASSOC)) {
            $podCols[strtolower($c['Field'])] = true;
        }

        foreach ($items as $idx => $p) {
            if (!is_array($p)) continue;
            $validFields = [];
            foreach ($p as $k => $v) {
                if (isset($podCols[strtolower($k)])) {
                    $validFields[$k] = is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : $v;
                }
            }
            if (!empty($validFields)) {
                $cols = array_keys($validFields);
                $escaped = array_map(fn($c) => "`$c`", $cols);
                $ph = implode(', ', array_fill(0, count($cols), '?'));
                $pdo->prepare("REPLACE INTO `podcasts` (" . implode(', ', $escaped) . ") VALUES ($ph)")->execute(array_values($validFields));
            }
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'podcasts_synced']);
        exit;
    }

    if ($action === 'save_video_news' && is_array($data)) {
        $items = isset($data[0]) ? $data : [$data];
        $colStmt = $pdo->query("SHOW COLUMNS FROM `video_news`");
        $vCols = [];
        while ($c = $colStmt->fetch(PDO::FETCH_ASSOC)) {
            $vCols[strtolower($c['Field'])] = true;
        }

        foreach ($items as $v) {
            if (!is_array($v)) continue;
            $validRow = [];
            foreach ($v as $k => $val) {
                if (isset($vCols[strtolower($k)])) {
                    $validRow[$k] = is_array($val) ? json_encode($val, JSON_UNESCAPED_UNICODE) : $val;
                }
            }
            if (!empty($validRow)) {
                $cols = array_keys($validRow);
                $escaped = array_map(fn($c) => "`$c`", $cols);
                $ph = implode(', ', array_fill(0, count($cols), '?'));
                $pdo->prepare("REPLACE INTO `video_news` (" . implode(', ', $escaped) . ") VALUES ($ph)")->execute(array_values($validRow));
            }
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'video_news_synced']);
        exit;
    }

    if ($action === 'save_emergency' && is_array($data)) {
        $items = isset($data[0]) ? $data : [$data];
        $colStmt = $pdo->query("SHOW COLUMNS FROM `emergency_services`");
        $eCols = [];
        while ($c = $colStmt->fetch(PDO::FETCH_ASSOC)) {
            $eCols[strtolower($c['Field'])] = true;
        }

        foreach ($items as $e) {
            if (!is_array($e)) continue;
            $validRow = [];
            foreach ($e as $k => $val) {
                if (isset($eCols[strtolower($k)])) {
                    $validRow[$k] = is_array($val) ? json_encode($val, JSON_UNESCAPED_UNICODE) : $val;
                }
            }
            if (!empty($validRow)) {
                $cols = array_keys($validRow);
                $escaped = array_map(fn($c) => "`$c`", $cols);
                $ph = implode(', ', array_fill(0, count($cols), '?'));
                $pdo->prepare("REPLACE INTO `emergency_services` (" . implode(', ', $escaped) . ") VALUES ($ph)")->execute(array_values($validRow));
            }
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'emergency_synced']);
        exit;
    }

    if ($action === 'save_ads' && is_array($data)) {
        $slotsToProcess = !empty($data['adSlots']) && is_array($data['adSlots']) ? $data['adSlots'] : $data;
        foreach ($slotsToProcess as $slotKey => $slotVal) {
            if ($slotKey === 'adSenseEnabled' || $slotKey === 'adSenseClientId' || $slotKey === 'adsenseClientId') continue;
            if (!is_array($slotVal)) continue;

            $slotId = $slotKey;
            $adCode = $slotVal['code'] ?? ($slotVal['ad_code'] ?? ($slotVal['custom_html'] ?? ''));
            $imageUrl = $slotVal['imageUrl'] ?? ($slotVal['banner_image_url'] ?? ($slotVal['image_url'] ?? ''));
            $targetUrl = $slotVal['targetUrl'] ?? ($slotVal['target_url'] ?? '');
            $isActive = !empty($slotVal['enabled']) || !empty($slotVal['is_active']) ? 1 : 0;
            $nameBn = $slotVal['altText'] ?? ($slotVal['fallbackText'] ?? ($slotVal['nameBn'] ?? $slotId));
            $nameEn = $slotVal['nameEn'] ?? $slotId;

            $pdo->prepare("REPLACE INTO `ads_config` (`slot_id`, `ad_slot`, `slot_name_bn`, `slot_name_en`, `ad_code`, `custom_html`, `banner_image_url`, `image_url`, `target_url`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                ->execute([$slotId, $slotId, $nameBn, $nameEn, $adCode, $adCode, $imageUrl, $imageUrl, $targetUrl, $isActive]);
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'ads_synced']);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unsupported action']);
    exit;

} catch (Exception $e) {
    @error_log("[Webhook Sync Error] " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal synchronization error']);
    exit;
}
