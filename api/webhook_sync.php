<?php
/**
 * Janogon News (জনগণ.নিউজ) - Secure HTTPS Bi-Directional Webhook Receiver
 * Path: /api/webhook_sync.php
 * 
 * Secure endpoint on BOTH Hosting Servers that receives updates from the other peer.
 * Modules supported:
 * 1. save_news / delete_news / bulk_sync
 * 2. save_setting / save_settings_batch (founderBn, site_settings, contact, branding, etc.)
 * 3. save_sections (homepage modular layout)
 * 4. save_categories (categories & master groups)
 * 5. save_podcasts / save_video_news / save_emergency
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

// Replay attack prevention: window of 10 minutes
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

try {
    // -------------------------------------------------------------
    // 1. SITE SETTINGS SYNC (founderBn, branding, footer, social)
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
    // 2. HOMEPAGE SECTIONS SYNC
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
    // 3. CATEGORIES & MASTER GROUPS SYNC
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
    // 4. PODCASTS SYNC
    // -------------------------------------------------------------
    if ($action === 'save_podcasts' && is_array($data)) {
        $items = (isset($data['titleBn']) || isset($data['title_bn'])) ? [$data] : (array_values($data));
        $syncedIds = [];
        $colStmt = $pdo->query("SHOW COLUMNS FROM `podcasts`");
        $podCols = [];
        while ($c = $colStmt->fetch(PDO::FETCH_ASSOC)) {
            $podCols[strtolower($c['Field'])] = true;
        }

        foreach ($items as $idx => $p) {
            if (!is_array($p)) continue;
            $podId = trim($p['id'] ?? ($p['podcast_id'] ?? ''));
            if (!$podId) $podId = 'pod-' . time() . '-' . rand(100, 999);
            $syncedIds[] = $podId;

            $titleBn = trim($p['titleBn'] ?? ($p['title_bn'] ?? ($p['title'] ?? '')));
            if (!$titleBn) continue;

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

    // -------------------------------------------------------------
    // 5. VIDEO NEWS SYNC
    // -------------------------------------------------------------
    if ($action === 'save_video_news' && is_array($data)) {
        $items = isset($data[0]) ? $data : [$data];
        $vnStmt = $pdo->prepare("
            INSERT INTO `video_news` (
                `video_id`, `title_bn`, `title_en`, `category`, `category_bn`, `category_en`,
                `youtube_url`, `youtube_id`, `image_url`, `thumbnail`, `video_duration`, `date_bn`, `date_en`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                `title_bn` = VALUES(`title_bn`),
                `title_en` = VALUES(`title_en`),
                `category` = VALUES(`category`),
                `category_bn` = VALUES(`category_bn`),
                `category_en` = VALUES(`category_en`),
                `youtube_url` = VALUES(`youtube_url`),
                `youtube_id` = VALUES(`youtube_id`),
                `image_url` = VALUES(`image_url`),
                `thumbnail` = VALUES(`thumbnail`),
                `video_duration` = VALUES(`video_duration`),
                `date_bn` = VALUES(`date_bn`),
                `date_en` = VALUES(`date_en`),
                `updated_at` = CURRENT_TIMESTAMP
        ");
        foreach ($items as $v) {
            if (empty($v['titleBn']) && empty($v['title_bn'])) continue;
            $vId = trim($v['id'] ?? ($v['videoId'] ?? ($v['video_id'] ?? '')));
            if (!$vId) $vId = 'vnews-' . round(microtime(true) * 1000);
            $titleBn = trim($v['titleBn'] ?? ($v['title_bn'] ?? ''));
            $titleEn = trim($v['titleEn'] ?? ($v['title_en'] ?? $titleBn));
            $category = trim($v['category'] ?? ($v['category_id'] ?? 'bangladesh'));
            $categoryBn = trim($v['categoryBn'] ?? ($v['category_bn'] ?? 'বাংলাদেশ'));
            $categoryEn = trim($v['categoryEn'] ?? ($v['category_en'] ?? 'Bangladesh'));
            $ytUrl = trim($v['youtubeUrl'] ?? ($v['youtube_url'] ?? ($v['videoUrl'] ?? '')));
            $ytId = trim($v['youtubeId'] ?? ($v['youtube_id'] ?? ''));
            $img = trim($v['imageUrl'] ?? ($v['image_url'] ?? ($v['thumbnail'] ?? '')));
            $thumb = trim($v['thumbnail'] ?? $img);
            $duration = trim($v['videoDuration'] ?? ($v['video_duration'] ?? ($v['duration'] ?? '০৩:৪৫')));
            $dateBn = trim($v['dateBn'] ?? ($v['date_bn'] ?? ''));
            $dateEn = trim($v['dateEn'] ?? ($v['date_en'] ?? ''));

            $vnStmt->execute([
                $vId, $titleBn, $titleEn, $category, $categoryBn, $categoryEn,
                $ytUrl, $ytId, $img, $thumb, $duration, $dateBn, $dateEn
            ]);
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'video_news_synced']);
        exit;
    }

    // -------------------------------------------------------------
    // 6. EMERGENCY SERVICES SYNC
    // -------------------------------------------------------------
    if ($action === 'save_emergency' && is_array($data)) {
        $items = isset($data[0]) ? $data : [$data];
        $emgStmt = $pdo->prepare("
            INSERT INTO `emergency_services` (
                `service_id`, `name_bn`, `name_en`, `phone`, `number`, `district`,
                `category`, `category_bn`, `category_en`, `description_bn`, `description_en`,
                `website_url`, `icon`, `order_index`, `is_active`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                `name_bn` = VALUES(`name_bn`),
                `name_en` = VALUES(`name_en`),
                `phone` = VALUES(`phone`),
                `number` = VALUES(`number`),
                `category` = VALUES(`category`),
                `category_bn` = VALUES(`category_bn`),
                `category_en` = VALUES(`category_en`),
                `description_bn` = VALUES(`description_bn`),
                `description_en` = VALUES(`description_en`),
                `website_url` = VALUES(`website_url`),
                `icon` = VALUES(`icon`),
                `order_index` = VALUES(`order_index`),
                `is_active` = VALUES(`is_active`)
        ");
        foreach ($items as $idx => $e) {
            if (!is_array($e)) continue;
            $srvId = $e['id'] ?? ($e['service_id'] ?? ('srv-' . ($idx + 1)));
            $nameBn = $e['nameBn'] ?? ($e['name_bn'] ?? '');
            $nameEn = $e['nameEn'] ?? ($e['name_en'] ?? $nameBn);
            $num = $e['number'] ?? ($e['phone'] ?? '');
            $catBn = $e['categoryBn'] ?? ($e['category_bn'] ?? 'জরুরি সেবা');
            $catEn = $e['categoryEn'] ?? ($e['category_en'] ?? 'Emergency');
            $descBn = $e['descriptionBn'] ?? ($e['description_bn'] ?? '');
            $descEn = $e['descriptionEn'] ?? ($e['description_en'] ?? $descBn);
            $web = $e['websiteUrl'] ?? ($e['website_url'] ?? '');
            $icon = $e['icon'] ?? 'phone';
            $order = (int)($e['orderIndex'] ?? ($e['order_index'] ?? $idx));
            $active = (!isset($e['isActive']) || !empty($e['isActive'])) && (!isset($e['is_active']) || !empty($e['is_active'])) ? 1 : 0;

            if ($srvId && $nameBn) {
                $emgStmt->execute([
                    $srvId, $nameBn, $nameEn, $num, $num, 'সারাদেশ',
                    $catBn, $catBn, $catEn, $descBn, $descEn,
                    $web, $icon, $order, $active
                ]);
            }
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'emergency_synced']);
        exit;
    }

    // -------------------------------------------------------------
    // 7. ADS CONFIG SYNC
    // -------------------------------------------------------------
    if ($action === 'save_ads' && is_array($data)) {
        if (isset($data['adSenseEnabled'])) {
            $pdo->prepare("INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES ('adSenseEnabled', ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)")
                ->execute([$data['adSenseEnabled'] ? '1' : '0']);
        }
        if (!empty($data['adSenseClientId']) || !empty($data['adsenseClientId'])) {
            $cId = !empty($data['adSenseClientId']) ? $data['adSenseClientId'] : $data['adsenseClientId'];
            $pdo->prepare("INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES ('adSenseClientId', ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)")
                ->execute([$cId]);
        }
        if (!empty($data['adSlots']) && is_array($data['adSlots'])) {
            $pdo->prepare("INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES ('adSlots', ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)")
                ->execute([json_encode($data['adSlots'], JSON_UNESCAPED_UNICODE)]);
        }

        $slotsToProcess = !empty($data['adSlots']) && is_array($data['adSlots']) ? $data['adSlots'] : $data;
        $adsStmt = $pdo->prepare("
            INSERT INTO `ads_config` (
                `slot_id`, `ad_slot`, `slot_name_bn`, `slot_name_en`, `ad_code`, `custom_html`, `banner_image_url`, `image_url`, `target_url`, `is_active`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                `ad_slot` = VALUES(`ad_slot`),
                `slot_name_bn` = VALUES(`slot_name_bn`),
                `slot_name_en` = VALUES(`slot_name_en`),
                `ad_code` = VALUES(`ad_code`),
                `custom_html` = VALUES(`custom_html`),
                `banner_image_url` = VALUES(`banner_image_url`),
                `image_url` = VALUES(`image_url`),
                `target_url` = VALUES(`target_url`),
                `is_active` = VALUES(`is_active`)
        ");
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

            $adsStmt->execute([
                $slotId, $slotId, $nameBn, $nameEn, $adCode, $adCode, $imageUrl, $imageUrl, $targetUrl, $isActive
            ]);
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'ads_synced']);
        exit;
    }

    // -------------------------------------------------------------
    // 8. NEWS ARTICLES SYNC
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

        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'news_saved']);
        exit;
    }

    if ($action === 'delete_news' && !empty($data)) {
        $id = $data['id'] ?? ($data['post_id'] ?? ($data['slug'] ?? null));
        if ($id) {
            $pdo->prepare("DELETE FROM `news_posts` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?")->execute([$id, $id, $id]);
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

    http_response_code(400);
    echo json_encode(['error' => 'Unsupported action']);
    exit;

} catch (Exception $e) {
    @error_log("[Webhook Sync Error] " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal synchronization error']);
    exit;
}
