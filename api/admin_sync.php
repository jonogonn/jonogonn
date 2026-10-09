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
            throw new Exception('ডাটাবেজ সংযোগ সক্রিয় নেই।');
        }

        $results = [];

        // 1. Categories & Master Groups
        if (!$type || $type === 'categories' || $type === 'all') {
            $catStmt = $pdo->query("SELECT * FROM `categories` ORDER BY `order_index` ASC, `id` ASC");
            $categories = $catStmt ? $catStmt->fetchAll(PDO::FETCH_ASSOC) : [];

            $grpStmt = $pdo->query("SELECT * FROM `category_master_groups` ORDER BY `order_index` ASC");
            $masterGroups = $grpStmt ? $grpStmt->fetchAll(PDO::FETCH_ASSOC) : [];

            $results['categories'] = $categories;
            $results['masterGroups'] = $masterGroups;
        }

        // 2. Homepage Sections
        if (!$type || $type === 'sections' || $type === 'all') {
            $secStmt = $pdo->query("SELECT * FROM `homepage_sections` ORDER BY `order_index` ASC");
            $results['homepageSections'] = $secStmt ? $secStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        }

        // 3. Podcasts
        if (!$type || $type === 'podcasts' || $type === 'all') {
            $podStmt = $pdo->query("SELECT * FROM `podcasts` ORDER BY `created_at` DESC");
            $results['podcasts'] = $podStmt ? $podStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        }

        // 4. Emergency Services
        if (!$type || $type === 'emergency' || $type === 'all') {
            $emgStmt = $pdo->query("SELECT * FROM `emergency_services` ORDER BY `order_index` ASC");
            $results['emergencyServices'] = $emgStmt ? $emgStmt->fetchAll(PDO::FETCH_ASSOC) : [];
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
            throw new Exception('ডাটাবেজ সংযোগ সক্রিয় নেই।');
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
            echo json_encode(['success' => false, 'message' => 'Module name is required (e.g. settings, sections, categories, podcasts, emergency, ads, breaking).']);
            exit;
        }

        // 1. Save Site Settings
        if ($module === 'settings') {
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
        if ($module === 'sections') {
            if (is_array($data)) {
                $stmt = $pdo->prepare("
                    INSERT INTO `homepage_sections` (
                        `section_id`, `title_bn`, `title_en`, `category_slug`, `layout_type`,
                        `item_count`, `is_visible`, `order_index`, `custom_badge_bn`, `custom_badge_en`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        `title_bn` = VALUES(`title_bn`),
                        `title_en` = VALUES(`title_en`),
                        `category_slug` = VALUES(`category_slug`),
                        `layout_type` = VALUES(`layout_type`),
                        `item_count` = VALUES(`item_count`),
                        `is_visible` = VALUES(`is_visible`),
                        `order_index` = VALUES(`order_index`),
                        `custom_badge_bn` = VALUES(`custom_badge_bn`),
                        `custom_badge_en` = VALUES(`custom_badge_en`)
                ");

                foreach ($data as $index => $sec) {
                    $secId = $sec['id'] ?? ($sec['section_id'] ?? ('sec-' . $index));
                    $titleBn = $sec['titleBn'] ?? ($sec['title_bn'] ?? '');
                    $titleEn = $sec['titleEn'] ?? ($sec['title_en'] ?? '');
                    $catSlug = $sec['categorySlug'] ?? ($sec['category_slug'] ?? ($sec['category'] ?? null));
                    $layout = $sec['layoutType'] ?? ($sec['layout_type'] ?? 'grid_3');
                    $count = (int)($sec['itemCount'] ?? ($sec['item_count'] ?? 6));
                    $visible = !empty($sec['isVisible']) || !empty($sec['is_visible']) ? 1 : 0;
                    $order = (int)($sec['orderIndex'] ?? ($sec['order_index'] ?? $index));
                    $badgeBn = $sec['customBadgeBn'] ?? ($sec['custom_badge_bn'] ?? null);
                    $badgeEn = $sec['customBadgeEn'] ?? ($sec['custom_badge_en'] ?? null);

                    $stmt->execute([$secId, $titleBn, $titleEn, $catSlug, $layout, $count, $visible, $order, $badgeBn, $badgeEn]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'হোমপেজ লেআউট সেকশনগুলো MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 3. Save Categories & Master Groups
        if ($module === 'categories') {
            if (!empty($data['masterGroups']) && is_array($data['masterGroups'])) {
                $grpStmt = $pdo->prepare("
                    INSERT INTO `category_master_groups` (`group_key`, `name_bn`, `name_en`, `order_index`, `icon`)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE `name_bn` = VALUES(`name_bn`), `name_en` = VALUES(`name_en`), `order_index` = VALUES(`order_index`), `icon` = VALUES(`icon`)
                ");
                foreach ($data['masterGroups'] as $idx => $g) {
                    $grpStmt->execute([
                        $g['id'] ?? ($g['group_key'] ?? ('grp-' . $idx)),
                        $g['nameBn'] ?? ($g['name_bn'] ?? ''),
                        $g['nameEn'] ?? ($g['name_en'] ?? ''),
                        (int)($g['orderIndex'] ?? ($g['order_index'] ?? $idx)),
                        $g['icon'] ?? 'folder'
                    ]);
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
        if ($module === 'podcasts') {
            if (is_array($data)) {
                $podStmt = $pdo->prepare("
                    INSERT INTO `podcasts` (
                        `podcast_id`, `title_bn`, `title_en`, `subject_id`, `subject_bn`,
                        `youtube_url`, `host_bn`, `guest_bn`, `duration`, `thumbnail`, `is_featured`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        `title_bn` = VALUES(`title_bn`),
                        `title_en` = VALUES(`title_en`),
                        `subject_id` = VALUES(`subject_id`),
                        `subject_bn` = VALUES(`subject_bn`),
                        `youtube_url` = VALUES(`youtube_url`),
                        `host_bn` = VALUES(`host_bn`),
                        `guest_bn` = VALUES(`guest_bn`),
                        `duration` = VALUES(`duration`),
                        `thumbnail` = VALUES(`thumbnail`),
                        `is_featured` = VALUES(`is_featured`)
                ");
                foreach ($data as $idx => $p) {
                    $podId = $p['id'] ?? ($p['podcast_id'] ?? ('pod-' . $idx));
                    $titleBn = $p['titleBn'] ?? ($p['title_bn'] ?? '');
                    $titleEn = $p['titleEn'] ?? ($p['title_en'] ?? '');
                    $subId = $p['subjectId'] ?? ($p['subject_id'] ?? 'politics');
                    $subBn = $p['subjectBn'] ?? ($p['subject_bn'] ?? 'রাজনীতি');
                    $ytUrl = $p['youtubeUrl'] ?? ($p['youtube_url'] ?? '');
                    $hostBn = $p['hostBn'] ?? ($p['host_bn'] ?? 'মোঃ বিপ্লব হোসেন');
                    $guestBn = $p['guestBn'] ?? ($p['guest_bn'] ?? '');
                    $duration = $p['duration'] ?? '২৫:০০';
                    $thumbnail = $p['thumbnail'] ?? '';
                    $featured = !empty($p['isFeatured']) || !empty($p['is_featured']) ? 1 : 0;

                    $podStmt->execute([$podId, $titleBn, $titleEn, $subId, $subBn, $ytUrl, $hostBn, $guestBn, $duration, $thumbnail, $featured]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'পডকাস্ট ডাটা MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 5. Save Emergency Helplines
        if ($module === 'emergency') {
            if (is_array($data)) {
                $emgStmt = $pdo->prepare("
                    INSERT INTO `emergency_services` (
                        `service_id`, `name_bn`, `name_en`, `number`, `category_bn`,
                        `description_bn`, `website_url`, `icon`, `order_index`, `is_active`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        `name_bn` = VALUES(`name_bn`),
                        `name_en` = VALUES(`name_en`),
                        `number` = VALUES(`number`),
                        `category_bn` = VALUES(`category_bn`),
                        `description_bn` = VALUES(`description_bn`),
                        `website_url` = VALUES(`website_url`),
                        `icon` = VALUES(`icon`),
                        `order_index` = VALUES(`order_index`),
                        `is_active` = VALUES(`is_active`)
                ");
                foreach ($data as $idx => $e) {
                    $srvId = $e['id'] ?? ($e['service_id'] ?? ('srv-' . $idx));
                    $nameBn = $e['nameBn'] ?? ($e['name_bn'] ?? '');
                    $nameEn = $e['nameEn'] ?? ($e['name_en'] ?? '');
                    $num = $e['number'] ?? '';
                    $catBn = $e['categoryBn'] ?? ($e['category_bn'] ?? 'জরুরি সেবা');
                    $descBn = $e['descriptionBn'] ?? ($e['description_bn'] ?? '');
                    $web = $e['websiteUrl'] ?? ($e['website_url'] ?? '');
                    $icon = $e['icon'] ?? 'phone';
                    $order = (int)($e['orderIndex'] ?? ($e['order_index'] ?? $idx));
                    $active = !empty($e['isActive']) || !empty($e['is_active']) ? 1 : 1;

                    $emgStmt->execute([$srvId, $nameBn, $nameEn, $num, $catBn, $descBn, $web, $icon, $order, $active]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'জরুরি সেবা ডাটা MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 6. Save Ads Config
        if ($module === 'ads') {
            if (is_array($data)) {
                $adsStmt = $pdo->prepare("
                    INSERT INTO `ads_config` (
                        `slot_id`, `slot_name_bn`, `slot_name_en`, `ad_type`, `client_id`,
                        `slot_code`, `banner_image_url`, `target_url`, `display_location`, `is_active`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        `slot_name_bn` = VALUES(`slot_name_bn`),
                        `slot_name_en` = VALUES(`slot_name_en`),
                        `ad_type` = VALUES(`ad_type`),
                        `client_id` = VALUES(`client_id`),
                        `slot_code` = VALUES(`slot_code`),
                        `banner_image_url` = VALUES(`banner_image_url`),
                        `target_url` = VALUES(`target_url`),
                        `display_location` = VALUES(`display_location`),
                        `is_active` = VALUES(`is_active`)
                ");
                foreach ($data as $idx => $a) {
                    $slotId = $a['id'] ?? ($a['slot_id'] ?? ('slot-' . $idx));
                    $nameBn = $a['slotNameBn'] ?? ($a['slot_name_bn'] ?? '');
                    $nameEn = $a['slotNameEn'] ?? ($a['slot_name_en'] ?? '');
                    $adType = $a['adType'] ?? ($a['ad_type'] ?? 'adsense');
                    $clientId = $a['clientId'] ?? ($a['client_id'] ?? '');
                    $slotCode = $a['slotCode'] ?? ($a['slot_code'] ?? '');
                    $banner = $a['bannerImageUrl'] ?? ($a['banner_image_url'] ?? '');
                    $target = $a['targetUrl'] ?? ($a['target_url'] ?? '');
                    $loc = $a['displayLocation'] ?? ($a['display_location'] ?? 'header_top');
                    $active = !empty($a['isActive']) || !empty($a['is_active']) ? 1 : 1;

                    $adsStmt->execute([$slotId, $nameBn, $nameEn, $adType, $clientId, $slotCode, $banner, $target, $loc, $active]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'বিজ্ঞাপন কনফিগারেশন MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 7. Save Breaking News
        if ($module === 'breaking') {
            if (is_array($data)) {
                $brkStmt = $pdo->prepare("
                    INSERT INTO `breaking_news` (`text_bn`, `text_en`, `article_id`, `article_slug`, `link_url`, `is_active`, `order_index`)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $pdo->exec("TRUNCATE TABLE `breaking_news`");
                foreach ($data as $idx => $b) {
                    $textBn = is_string($b) ? $b : ($b['textBn'] ?? ($b['text_bn'] ?? ''));
                    $textEn = is_array($b) ? ($b['textEn'] ?? ($b['text_en'] ?? '')) : '';
                    $artId = is_array($b) ? ($b['articleId'] ?? ($b['article_id'] ?? null)) : null;
                    $artSlug = is_array($b) ? ($b['articleSlug'] ?? ($b['article_slug'] ?? null)) : null;
                    $link = is_array($b) ? ($b['linkUrl'] ?? ($b['link_url'] ?? null)) : null;
                    $active = is_array($b) ? (!empty($b['isActive']) || !empty($b['is_active']) ? 1 : 1) : 1;

                    if ($textBn) {
                        $brkStmt->execute([$textBn, $textEn, $artId, $artSlug, $link, $active, $idx]);
                    }
                }
            }
            echo json_encode(['success' => true, 'message' => 'ব্রেকিং নিউজ MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 8. Save Admin Members / Team Access
        if ($module === 'members' || $module === 'admin_users') {
            if (is_array($data)) {
                $memStmt = $pdo->prepare("
                    INSERT INTO `admin_members` (
                        `user_code`, `username`, `temp_password`, `name`, `designation`,
                        `role`, `phone`, `email`, `avatar`, `status`, `allowed_tabs`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        `name` = VALUES(`name`),
                        `designation` = VALUES(`designation`),
                        `role` = VALUES(`role`),
                        `phone` = VALUES(`phone`),
                        `avatar` = VALUES(`avatar`),
                        `status` = VALUES(`status`),
                        `allowed_tabs` = VALUES(`allowed_tabs`),
                        `temp_password` = VALUES(`temp_password`)
                ");
                foreach ($data as $m) {
                    $userCode = $m['user_code'] ?? ($m['userCode'] ?? ('JNG-' . rand(1000, 9999)));
                    $username = $m['username'] ?? '';
                    $tempPass = $m['temp_password'] ?? ($m['password'] ?? '');
                    $name = $m['name'] ?? '';
                    $designation = $m['designation'] ?? 'টিম সদস্য';
                    $role = $m['role'] ?? 'Reporter';
                    $phone = $m['phone'] ?? '';
                    $email = $m['email'] ?? '';
                    $avatar = $m['avatar'] ?? '';
                    $status = $m['status'] ?? 'active';
                    $allowedTabs = is_array($m['allowed_tabs'] ?? null) ? json_encode($m['allowed_tabs'], JSON_UNESCAPED_UNICODE) : (is_string($m['allowed_tabs'] ?? null) ? $m['allowed_tabs'] : json_encode(['overview', 'create-post', 'edit-post']));

                    if ($username && $email) {
                        $memStmt->execute([$userCode, $username, $tempPass, $name, $designation, $role, $phone, $email, $avatar, $status, $allowedTabs]);
                    }
                }
            }
            echo json_encode(['success' => true, 'message' => 'টিম মেম্বার ডাটা MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        echo json_encode(['success' => false, 'message' => 'অজ্ঞাত মডিউল: ' . $module]);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sync Error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
