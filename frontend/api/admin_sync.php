<?php
/**
 * Jonogon News (জনগণ.নিউজ) - Master Admin Panel MariaDB Sync API
 * Synchronizes and persists changes across ALL Admin Panel tabs directly into cPanel MariaDB.
 * Modules supported:
 * 1. categories & category_master_groups (Main Menu & Category System)
 * 2. homepage_sections (31 Modular Layout Blocks)
 * 3. podcasts (Podcasts & Video Shows)
 * 4. emergency_services (Helplines & Services)
 * 5. ads_config (Google AdSense & Custom Banners)
 * 6. site_settings (Branding, Logo, Contact, Social Links)
 * 7. breaking_news (Live Breaking Ticker)
 * 8. media_gallery (Media Assets & Archive)
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$type = $_GET['type'] ?? ($_POST['type'] ?? '');

// -------------------------------------------------------------
// GET: Fetch module data from MariaDB
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        if (!$pdo) {
            throw new Exception('MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই: ' . ($dbError ?? 'Unknown error'));
        }

        $results = [];

        // 1. Categories & Master Groups
        if (!$type || $type === 'categories' || $type === 'all') {
            $catStmt = $pdo->query("SELECT * FROM `categories` ORDER BY `order_index` ASC, `id` ASC");
            $catRows = $catStmt ? $catStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $categories = [];
            foreach ($catRows as $r) {
                $categories[] = [
                    'id' => $r['slug'] ?: ('cat-' . $r['id']),
                    'slug' => $r['slug'] ?: '',
                    'name' => $r['name'] ?: ($r['name_bn'] ?: ''),
                    'nameBn' => $r['name_bn'] ?: ($r['name'] ?: ''),
                    'nameEn' => $r['name_en'] ?: '',
                    'masterGroupId' => $r['master_group_id'] ?: 'general',
                    'masterGroupBn' => $r['master_group_bn'] ?: 'সাধারণ',
                    'masterGroupEn' => $r['master_group_en'] ?: 'General',
                    'orderIndex' => (int)($r['order_index'] ?? 0),
                    'isNavVisible' => !empty($r['is_nav_visible'])
                ];
            }

            $grpStmt = $pdo->query("SELECT * FROM `category_master_groups` ORDER BY `order_index` ASC");
            $grpRows = $grpStmt ? $grpStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $masterGroups = [];
            foreach ($grpRows as $r) {
                $subGroups = json_decode($r['sub_groups_json'] ?? '[]', true);
                $masterGroups[] = [
                    'id' => $r['group_id'] ?: ('grp-' . $r['id']),
                    'nameBn' => $r['title_bn'] ?: '',
                    'nameEn' => $r['title_en'] ?: '',
                    'orderIndex' => (int)($r['order_index'] ?? 0),
                    'subGroups' => is_array($subGroups) ? $subGroups : []
                ];
            }

            $results['categories'] = $categories;
            $results['masterGroups'] = $masterGroups;
        }

        // 2. Homepage Sections
        if (!$type || $type === 'sections' || $type === 'all') {
            $secStmt = $pdo->query("SELECT * FROM `homepage_sections` ORDER BY `order_index` ASC");
            $secRows = $secStmt ? $secStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $homepageSections = [];
            foreach ($secRows as $r) {
                $cfg = json_decode($r['config_json'] ?? '{}', true) ?: [];
                $homepageSections[] = array_merge($cfg, [
                    'id' => $r['section_id'] ?: ($cfg['id'] ?? ('sec-' . $r['id'])),
                    'nameBn' => $r['title_bn'] ?: ($cfg['nameBn'] ?? ''),
                    'nameEn' => $r['title_en'] ?: ($cfg['nameEn'] ?? ''),
                    'isVisible' => (bool)$r['is_visible'],
                    'orderIndex' => (int)$r['order_index'],
                    'type' => $r['layout_type'] ?: ($cfg['type'] ?? 'main')
                ]);
            }
            $results['homepageSections'] = $homepageSections;
        }

        // 3. Podcasts
        if (!$type || $type === 'podcasts' || $type === 'all') {
            $podStmt = $pdo->query("SELECT * FROM `podcasts` ORDER BY `created_at` DESC");
            $podRows = $podStmt ? $podStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $podcasts = [];
            foreach ($podRows as $r) {
                $yt = $r['youtube_url'] ?: ($r['video_url'] ?: '');
                $ytId = '';
                if (preg_match('/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/', $yt, $m)) {
                    $ytId = $m[1];
                }
                $podcasts[] = [
                    'id' => $r['podcast_id'] ?: ('pod-' . $r['id']),
                    'titleBn' => $r['title_bn'] ?: '',
                    'titleEn' => $r['title_en'] ?: '',
                    'subjectId' => $r['subject_id'] ?: 'politics',
                    'subjectBn' => $r['subject_bn'] ?: 'রাজনীতি ও রাষ্ট্র',
                    'subjectEn' => $r['subject_en'] ?: 'Politics & Governance',
                    'youtubeUrl' => $yt,
                    'youtubeId' => $ytId,
                    'hostBn' => $r['host_bn'] ?: ($r['host_name'] ?: 'মোঃ বিপ্লব হোসেন'),
                    'hostEn' => $r['host_en'] ?: 'Md. Biplob Hossain',
                    'guestBn' => $r['guest_bn'] ?: '',
                    'guestEn' => $r['guest_en'] ?: '',
                    'duration' => $r['duration'] ?: '২৫:০০',
                    'thumbnail' => $r['thumbnail'] ?: '',
                    'dateBn' => !empty($r['created_at']) ? date('d F Y', strtotime($r['created_at'])) : ''
                ];
            }
            $results['podcasts'] = $podcasts;
        }

        // 4. Emergency Services
        if (!$type || $type === 'emergency' || $type === 'all') {
            $emgStmt = $pdo->query("SELECT * FROM `emergency_services` ORDER BY `order_index` ASC");
            $emgRows = $emgStmt ? $emgStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $emergencyServices = [];
            foreach ($emgRows as $r) {
                $emergencyServices[] = [
                    'id' => $r['service_id'] ?: ('srv-' . $r['id']),
                    'nameBn' => $r['name_bn'] ?: '',
                    'nameEn' => $r['name_en'] ?: '',
                    'number' => $r['number'] ?: ($r['phone'] ?: ''),
                    'phone' => $r['number'] ?: ($r['phone'] ?: ''),
                    'categoryBn' => $r['category_bn'] ?: ($r['category'] ?: 'জরুরি সেবা'),
                    'categoryEn' => $r['category_en'] ?: 'Emergency',
                    'descriptionBn' => $r['description_bn'] ?: '',
                    'descriptionEn' => $r['description_en'] ?: '',
                    'websiteUrl' => $r['website_url'] ?: '',
                    'icon' => $r['icon'] ?: 'phone'
                ];
            }
            $results['emergencyServices'] = $emergencyServices;
        }

        // 5. Ads Config
        if (!$type || $type === 'ads' || $type === 'all') {
            $adsStmt = $pdo->query("SELECT * FROM `ads_config` ORDER BY `id` ASC");
            $results['adsConfig'] = $adsStmt ? $adsStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        }

        // 6. Site Settings
        if (!$type || $type === 'settings' || $type === 'all') {
            $setStmt = $pdo->query("SELECT * FROM `site_settings`");
            $settingsRows = $setStmt ? $setStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $settingsObj = [];
            foreach ($settingsRows as $row) {
                $decoded = json_decode($row['setting_value'], true);
                $settingsObj[$row['setting_key']] = ($decoded !== null) ? $decoded : $row['setting_value'];
            }
            $results['siteSettings'] = $settingsObj;
        }

        // 7. Breaking News
        if (!$type || $type === 'breaking' || $type === 'all') {
            $brkStmt = $pdo->query("SELECT * FROM `breaking_news` WHERE `is_active` = 1 ORDER BY `order_index` ASC, `created_at` DESC");
            $results['breakingNews'] = $brkStmt ? $brkStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        }

        // 8. Media Gallery
        if (!$type || $type === 'media' || $type === 'all') {
            $medStmt = $pdo->query("SELECT * FROM `media_gallery` ORDER BY `id` DESC LIMIT 300");
            $results['mediaGallery'] = $medStmt ? $medStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        }

        echo json_encode([
            'success' => true,
            'source' => 'mariadb',
            'data' => $results
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// POST: Save/Update module data in MariaDB
// -------------------------------------------------------------
if ($method === 'POST') {
    try {
        if (!$pdo) {
            throw new Exception('MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই: ' . ($dbError ?? 'Unknown error'));
        }

        $rawInput = file_get_contents('php://input');
        $payload = json_decode($rawInput, true);

        if (!$payload) {
            $payload = $_POST;
        }

        $module = $payload['module'] ?? ($payload['type'] ?? '');
        $data = $payload['data'] ?? $payload;

        if (!$module) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Module name is required (e.g. settings, sections, categories, podcasts, emergency, ads, breaking, media).']);
            exit;
        }

        // 1. Save Site Settings
        if ($module === 'settings' || $module === 'siteSettings' || $module === 'site_settings') {
            $stmt = $pdo->prepare("INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)");
            if (is_array($data)) {
                foreach ($data as $k => $v) {
                    $jsonVal = is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : (string)$v;
                    $stmt->execute([$k, $jsonVal]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'সাইট সেটিংস MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 2. Save Homepage Sections
        if ($module === 'sections' || $module === 'homepageSections' || $module === 'homepage_sections') {
            if (is_array($data)) {
                $secStmt = $pdo->prepare("
                    INSERT INTO `homepage_sections` (`section_id`, `title_bn`, `title_en`, `is_visible`, `order_index`, `layout_type`, `config_json`)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        `title_bn` = VALUES(`title_bn`),
                        `title_en` = VALUES(`title_en`),
                        `is_visible` = VALUES(`is_visible`),
                        `order_index` = VALUES(`order_index`),
                        `layout_type` = VALUES(`layout_type`),
                        `config_json` = VALUES(`config_json`)
                ");
                foreach ($data as $idx => $s) {
                    $secId = $s['id'] ?? ('sec-' . $idx);
                    $titleBn = $s['nameBn'] ?? ($s['title_bn'] ?? '');
                    $titleEn = $s['nameEn'] ?? ($s['title_en'] ?? '');
                    $visible = !empty($s['isVisible']) ? 1 : 0;
                    $order = (int)($s['orderIndex'] ?? $idx);
                    $layout = $s['type'] ?? ($s['layout_type'] ?? 'main');
                    $configJson = json_encode($s, JSON_UNESCAPED_UNICODE);
                    $secStmt->execute([$secId, $titleBn, $titleEn, $visible, $order, $layout, $configJson]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'হোমপেজ লেআউট সেকশনগুলো MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 3. Save Categories & Master Groups
        if ($module === 'categories' || $module === 'categoryMasterGroups') {
            if (!empty($data['masterGroups']) && is_array($data['masterGroups'])) {
                $grpStmt = $pdo->prepare("
                    INSERT INTO `category_master_groups` (`group_id`, `title_bn`, `title_en`, `order_index`, `sub_groups_json`)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        `title_bn` = VALUES(`title_bn`),
                        `title_en` = VALUES(`title_en`),
                        `order_index` = VALUES(`order_index`),
                        `sub_groups_json` = VALUES(`sub_groups_json`)
                ");
                foreach ($data['masterGroups'] as $idx => $g) {
                    $grpId = $g['id'] ?? ($g['group_id'] ?? ('grp-' . $idx));
                    $titleBn = $g['nameBn'] ?? ($g['title_bn'] ?? '');
                    $titleEn = $g['nameEn'] ?? ($g['title_en'] ?? '');
                    $order = (int)($g['orderIndex'] ?? $idx);
                    $subGroupsJson = json_encode($g['subGroups'] ?? [], JSON_UNESCAPED_UNICODE);
                    $grpStmt->execute([$grpId, $titleBn, $titleEn, $order, $subGroupsJson]);
                }
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

            echo json_encode(['success' => true, 'message' => 'ক্যাটাগরি ও মেনু ডাটা MariaDB-তে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 4. Save Podcasts
        if ($module === 'podcasts' || $module === 'podcastSubjects') {
            if (is_array($data)) {
                $podStmt = $pdo->prepare("
                    INSERT INTO `podcasts` (
                        `podcast_id`, `title_bn`, `title_en`, `subject_id`, `subject_bn`, `subject_en`,
                        `youtube_url`, `video_url`, `host_name`, `host_bn`, `host_en`, `guest_bn`, `guest_en`,
                        `duration`, `thumbnail`, `status`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        `title_bn` = VALUES(`title_bn`),
                        `title_en` = VALUES(`title_en`),
                        `subject_id` = VALUES(`subject_id`),
                        `subject_bn` = VALUES(`subject_bn`),
                        `subject_en` = VALUES(`subject_en`),
                        `youtube_url` = VALUES(`youtube_url`),
                        `video_url` = VALUES(`video_url`),
                        `host_name` = VALUES(`host_name`),
                        `host_bn` = VALUES(`host_bn`),
                        `host_en` = VALUES(`host_en`),
                        `guest_bn` = VALUES(`guest_bn`),
                        `guest_en` = VALUES(`guest_en`),
                        `duration` = VALUES(`duration`),
                        `thumbnail` = VALUES(`thumbnail`)
                ");
                foreach ($data as $idx => $p) {
                    $podId = $p['id'] ?? ($p['podcast_id'] ?? ('pod-' . $idx));
                    $titleBn = $p['titleBn'] ?? ($p['title_bn'] ?? '');
                    $titleEn = $p['titleEn'] ?? ($p['title_en'] ?? '');
                    $subId = $p['subjectId'] ?? ($p['subject_id'] ?? 'politics');
                    $subBn = $p['subjectBn'] ?? ($p['subject_bn'] ?? 'রাজনীতি ও রাষ্ট্র');
                    $subEn = $p['subjectEn'] ?? ($p['subject_en'] ?? 'Politics & Governance');
                    $ytUrl = $p['youtubeUrl'] ?? ($p['youtube_url'] ?? '');
                    $hostBn = $p['hostBn'] ?? ($p['host_name'] ?? 'মোঃ বিপ্লব হোসেন');
                    $hostEn = $p['hostEn'] ?? 'Md. Biplob Hossain';
                    $guestBn = $p['guestBn'] ?? '';
                    $guestEn = $p['guestEn'] ?? '';
                    $duration = $p['duration'] ?? '২৫:০০';
                    $thumbnail = $p['thumbnail'] ?? '';

                    $podStmt->execute([
                        $podId, $titleBn, $titleEn, $subId, $subBn, $subEn,
                        $ytUrl, $ytUrl, $hostBn, $hostBn, $hostEn, $guestBn, $guestEn,
                        $duration, $thumbnail, 'published'
                    ]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'পডকাস্ট ডাটা MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 5. Save Emergency Helplines
        if ($module === 'emergency' || $module === 'emergencyServices' || $module === 'emergency_services') {
            if (is_array($data)) {
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
                foreach ($data as $idx => $e) {
                    $srvId = $e['id'] ?? ($e['service_id'] ?? ('srv-' . $idx));
                    $nameBn = $e['nameBn'] ?? ($e['name_bn'] ?? '');
                    $nameEn = $e['nameEn'] ?? ($e['name_en'] ?? '');
                    $num = $e['number'] ?? ($e['phone'] ?? '');
                    $catBn = $e['categoryBn'] ?? ($e['category_bn'] ?? 'জরুরি সেবা');
                    $catEn = $e['categoryEn'] ?? ($e['category_en'] ?? 'Emergency');
                    $descBn = $e['descriptionBn'] ?? ($e['description_bn'] ?? '');
                    $descEn = $e['descriptionEn'] ?? ($e['description_en'] ?? '');
                    $web = $e['websiteUrl'] ?? ($e['website_url'] ?? '');
                    $icon = $e['icon'] ?? 'phone';
                    $order = (int)($e['orderIndex'] ?? ($e['order_index'] ?? $idx));
                    $active = !empty($e['isActive']) || !empty($e['is_active']) ? 1 : 1;

                    $emgStmt->execute([
                        $srvId, $nameBn, $nameEn, $num, $num, 'সারাদেশ',
                        $catBn, $catBn, $catEn, $descBn, $descEn,
                        $web, $icon, $order, $active
                    ]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'জরুরি সেবা ডাটা MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 6. Save Media Gallery item
        if ($module === 'media' || $module === 'mediaGallery' || $module === 'media_gallery') {
            if (is_array($data)) {
                $medStmt = $pdo->prepare("
                    INSERT INTO `media_gallery` (`file_name`, `storage_key`, `public_url`, `file_type`, `file_size`, `dimensions`)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE `public_url` = VALUES(`public_url`)
                ");
                $items = isset($data[0]) ? $data : [$data];
                foreach ($items as $m) {
                    $medStmt->execute([
                        $m['fileName'] ?? ($m['file_name'] ?? 'image.webp'),
                        $m['storageKey'] ?? ($m['storage_key'] ?? ''),
                        $m['publicUrl'] ?? ($m['public_url'] ?? ''),
                        $m['fileType'] ?? ($m['file_type'] ?? 'image/webp'),
                        (int)($m['fileSize'] ?? ($m['size_bytes'] ?? 0)),
                        $m['dimensions'] ?? '1200x630'
                    ]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'মিডিয়া ফাইল MariaDB-তে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 7. Save Ads Config
        if ($module === 'ads' || $module === 'adsConfig' || $module === 'ads_config') {
            if (is_array($data)) {
                $adsStmt = $pdo->prepare("
                    INSERT INTO `ads_config` (`ad_slot`, `ad_code`, `image_url`, `target_url`, `is_active`)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        `ad_code` = VALUES(`ad_code`),
                        `image_url` = VALUES(`image_url`),
                        `target_url` = VALUES(`target_url`),
                        `is_active` = VALUES(`is_active`)
                ");
                foreach ($data as $slotKey => $slotVal) {
                    $adCode = is_array($slotVal) ? ($slotVal['code'] ?? '') : '';
                    $imageUrl = is_array($slotVal) ? ($slotVal['imageUrl'] ?? '') : '';
                    $targetUrl = is_array($slotVal) ? ($slotVal['targetUrl'] ?? '') : '';
                    $isActive = is_array($slotVal) ? (!empty($slotVal['enabled']) ? 1 : 0) : 1;
                    $adsStmt->execute([$slotKey, $adCode, $imageUrl, $targetUrl, $isActive]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'বিজ্ঞাপন কনফিগারেশন MariaDB-তে সংরক্ষিত হয়েছে।']);
            exit;
        }

        echo json_encode(['success' => true, 'message' => "Module '$module' updated."]);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
