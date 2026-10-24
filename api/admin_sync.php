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
            $secStmt = $pdo->query("SELECT * FROM `homepage_sections` ORDER BY `order_index` ASC, `id` ASC");
            $secRows = $secStmt ? $secStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $homepageSections = [];
            foreach ($secRows as $idx => $r) {
                $cfg = json_decode($r['config_json'] ?? '{}', true) ?: [];
                $homepageSections[] = array_merge($cfg, [
                    'id' => $r['section_id'] ?: ($cfg['id'] ?? ('sec-' . $r['id'])),
                    'nameBn' => $r['title_bn'] ?: ($r['name_bn'] ?: ($cfg['nameBn'] ?? '')),
                    'nameEn' => $r['title_en'] ?: ($r['name_en'] ?: ($cfg['nameEn'] ?? '')),
                    'isVisible' => (bool)$r['is_visible'],
                    'orderIndex' => (int)($r['order_index'] ?? $idx),
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
                $thumb = $r['thumbnail'] ?: '';
                if ($ytId && (empty($thumb) || strpos($thumb, 'unsplash') !== false)) {
                    $thumb = "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg";
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
                    'thumbnail' => $thumb,
                    'dateBn' => !empty($r['created_at']) ? date('d F Y', strtotime($r['created_at'])) : ''
                ];
            }
            $results['podcasts'] = $podcasts;
        }

                // Video News
        if (!$type || $type === 'videoNews' || $type === 'video_news' || $type === 'all') {
            $vnStmt = $pdo->query("SELECT * FROM `video_news` ORDER BY `created_at` DESC, `id` DESC");
            $vnRows = $vnStmt ? $vnStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            $vNews = [];
            foreach ($vnRows as $r) {
                $ytId = $r['youtube_id'] ?: '';
                if (!$ytId && preg_match('/(?:v=|\/embed\/|youtu\.be\/|\/v\/|watch\?v=)([a-zA-Z0-9_-]{11})/', $r['youtube_url'] ?? '', $m)) {
                    $ytId = $m[1];
                }
                $thumb = $r['image_url'] ?: ($r['thumbnail'] ?: ($ytId ? "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg" : ''));
                $vNews[] = [
                    'id' => $r['video_id'] ?: ('vnews-' . $r['id']),
                    'db_id' => (int)$r['id'],
                    'videoId' => $r['video_id'] ?: ('vnews-' . $r['id']),
                    'titleBn' => $r['title_bn'] ?: '',
                    'titleEn' => $r['title_en'] ?: '',
                    'category' => $r['category'] ?: 'bangladesh',
                    'categoryBn' => $r['category_bn'] ?: 'বাংলাদেশ',
                    'categoryEn' => $r['category_en'] ?: 'Bangladesh',
                    'youtubeUrl' => $r['youtube_url'] ?: ($ytId ? "https://www.youtube.com/watch?v={$ytId}" : ''),
                    'youtubeId' => $ytId,
                    'imageUrl' => $thumb,
                    'thumbnail' => $thumb,
                    'videoDuration' => $r['video_duration'] ?: '০৩:৪৫',
                    'duration' => $r['video_duration'] ?: '০৩:৪৫',
                    'dateBn' => $r['date_bn'] ?: date('d M Y', strtotime($r['created_at'])),
                    'dateEn' => $r['date_en'] ?: date('d M Y', strtotime($r['created_at'])),
                    'createdAt' => $r['created_at'],
                    'updatedAt' => $r['updated_at']
                ];
            }
            $results['videoNews'] = $vNews;
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

        // 9. Team Members Order
        if (!$type || $type === 'team_order' || $type === 'teamOrder' || $type === 'all') {
            $tStmt = $pdo->query("SELECT `setting_value` FROM `site_settings` WHERE `setting_key` = 'team_members_order' LIMIT 1");
            $tRow = $tStmt ? $tStmt->fetch(PDO::FETCH_ASSOC) : null;
            $results['teamOrder'] = $tRow ? json_decode($tRow['setting_value'] ?? '[]', true) : [];
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
                $pdo->beginTransaction();
                $pdo->exec("DELETE FROM `homepage_sections`");
                $secStmt = $pdo->prepare("
                    INSERT INTO `homepage_sections` (
                        `section_id`, `title_bn`, `name_bn`, `title_en`, `name_en`, `is_visible`, `order_index`, `layout_type`, `config_json`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                foreach ($data as $idx => $s) {
                    $secId = $s['id'] ?? ('sec-' . $idx);
                    $titleBn = $s['nameBn'] ?? ($s['title_bn'] ?? '');
                    $titleEn = $s['nameEn'] ?? ($s['title_en'] ?? '');
                    $visible = !empty($s['isVisible']) ? 1 : 0;
                    $layout = $s['type'] ?? ($s['layout_type'] ?? 'main');
                    $configJson = json_encode($s, JSON_UNESCAPED_UNICODE);
                    $secStmt->execute([$secId, $titleBn, $titleBn, $titleEn, $titleEn, $visible, $idx, $layout, $configJson]);
                }
                $pdo->commit();
            }
            echo json_encode(['success' => true, 'message' => 'হোমপেজ লেআউট সেকশনগুলো MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 3. Save Categories & Master Groups
        if ($module === 'categories' || $module === 'categoryMasterGroups') {
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

            echo json_encode(['success' => true, 'message' => 'ক্যাটাগরি ও মেনু ডাটা MariaDB-তে সংরক্ষিত হয়েছে।']);
            exit;
        }

        // 4. Save Podcasts
        if ($module === 'podcasts' || $module === 'podcastSubjects') {
            // Auto-migrate columns if needed
            try {
                $checkCols = $pdo->query("SHOW COLUMNS FROM `podcasts`")->fetchAll(PDO::FETCH_ASSOC);
                $cMap = [];
                foreach ($checkCols as $c) {
                    $cMap[strtolower($c['Field'])] = true;
                }
                $needCols = [
                    'podcast_id' => "VARCHAR(64) NOT NULL UNIQUE",
                    'title_bn' => "VARCHAR(500) NOT NULL",
                    'title_en' => "VARCHAR(500) NULL",
                    'subject_id' => "VARCHAR(100) NOT NULL DEFAULT 'politics'",
                    'subject_bn' => "VARCHAR(150) NOT NULL DEFAULT 'রাজনীতি ও রাষ্ট্র'",
                    'subject_en' => "VARCHAR(150) NOT NULL DEFAULT 'Politics & Governance'",
                    'youtube_url' => "TEXT NULL",
                    'youtube_id' => "VARCHAR(50) NULL",
                    'video_url' => "TEXT NULL",
                    'audio_url' => "TEXT NULL",
                    'host_bn' => "VARCHAR(150) NOT NULL DEFAULT 'মোঃ বিপ্লব হোসেন'",
                    'host_en' => "VARCHAR(150) NOT NULL DEFAULT 'Md. Biplob Hossain'",
                    'host_name' => "VARCHAR(150) NULL",
                    'guest_bn' => "VARCHAR(150) NULL",
                    'guest_en' => "VARCHAR(150) NULL",
                    'duration' => "VARCHAR(50) NOT NULL DEFAULT '২৫:০০'",
                    'thumbnail' => "TEXT NULL",
                    'status' => "VARCHAR(50) NOT NULL DEFAULT 'published'",
                    'views' => "BIGINT(20) UNSIGNED NOT NULL DEFAULT 0",
                    'is_featured' => "TINYINT(1) NOT NULL DEFAULT 0"
                ];
                foreach ($needCols as $col => $def) {
                    if (!isset($cMap[strtolower($col)])) {
                        try {
                            $pdo->exec("ALTER TABLE `podcasts` ADD COLUMN `{$col}` {$def}");
                        } catch (Exception $alterEx) {}
                    }
                }
            } catch (Exception $e) {}

            $colStmt = $pdo->query("SHOW COLUMNS FROM `podcasts`");
            $podCols = [];
            while ($c = $colStmt->fetch(PDO::FETCH_ASSOC)) {
                $podCols[strtolower($c['Field'])] = true;
            }

            if (is_array($data)) {
                $items = (isset($data['titleBn']) || isset($data['title_bn'])) ? [$data] : (array_values($data));
                $syncedIds = [];

                foreach ($items as $idx => $p) {
                    if (!is_array($p)) continue;

                    $podId = trim($p['id'] ?? ($p['podcast_id'] ?? ''));
                    if (!$podId) {
                        $podId = 'pod-' . time() . '-' . rand(100, 999);
                    }
                    $syncedIds[] = $podId;

                    $titleBn = trim($p['titleBn'] ?? ($p['title_bn'] ?? ($p['title'] ?? '')));
                    if (!$titleBn) continue;

                    $titleEn = trim($p['titleEn'] ?? ($p['title_en'] ?? ''));
                    $subId = trim($p['subjectId'] ?? ($p['subject_id'] ?? 'politics'));
                    $subBn = trim($p['subjectBn'] ?? ($p['subject_bn'] ?? 'রাজনীতি ও রাষ্ট্র'));
                    $subEn = trim($p['subjectEn'] ?? ($p['subject_en'] ?? 'Politics & Governance'));
                    $ytUrl = trim($p['youtubeUrl'] ?? ($p['youtube_url'] ?? ($p['videoUrl'] ?? ($p['video_url'] ?? ''))));

                    $ytId = trim($p['youtubeId'] ?? ($p['youtube_id'] ?? ''));
                    if (empty($ytId) && preg_match('/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/', $ytUrl, $m)) {
                        $ytId = $m[1];
                    }

                    $hostBn = trim($p['hostBn'] ?? ($p['host_bn'] ?? ($p['host_name'] ?? 'মোঃ বিপ্লব হোসেন')));
                    $hostEn = trim($p['hostEn'] ?? ($p['host_en'] ?? 'Md. Biplob Hossain'));
                    $guestBn = trim($p['guestBn'] ?? ($p['guest_bn'] ?? ''));
                    $guestEn = trim($p['guestEn'] ?? ($p['guest_en'] ?? ''));
                    $duration = trim($p['duration'] ?? '২৫:০০');
                    $thumbnail = trim($p['thumbnail'] ?? ($p['thumbnail_url'] ?? ''));
                    if ($ytId && (empty($thumbnail) || strpos($thumbnail, 'unsplash') !== false)) {
                        $thumbnail = "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg";
                    }

                    $rowFields = [
                        'podcast_id' => $podId,
                        'title_bn' => $titleBn,
                        'title_en' => $titleEn,
                        'subject_id' => $subId,
                        'subject_bn' => $subBn,
                        'subject_en' => $subEn,
                        'youtube_url' => $ytUrl,
                        'youtube_id' => $ytId,
                        'video_url' => $ytUrl,
                        'audio_url' => $p['audioUrl'] ?? ($p['audio_url'] ?? ''),
                        'host_bn' => $hostBn,
                        'host_en' => $hostEn,
                        'host_name' => $hostBn,
                        'guest_bn' => $guestBn,
                        'guest_en' => $guestEn,
                        'duration' => $duration,
                        'thumbnail' => $thumbnail,
                        'status' => 'published'
                    ];

                    $validFields = [];
                    foreach ($rowFields as $k => $v) {
                        if (isset($podCols[strtolower($k)])) {
                            $validFields[$k] = $v;
                        }
                    }

                    $chk = $pdo->prepare("SELECT `id` FROM `podcasts` WHERE `podcast_id` = ? LIMIT 1");
                    $chk->execute([$podId]);
                    $exists = $chk->fetch(PDO::FETCH_ASSOC);

                    if ($exists) {
                        $setClauses = [];
                        $vals = [];
                        foreach ($validFields as $k => $v) {
                            $setClauses[] = "`{$k}` = ?";
                            $vals[] = $v;
                        }
                        $vals[] = $exists['id'];
                        $upStmt = $pdo->prepare("UPDATE `podcasts` SET " . implode(', ', $setClauses) . " WHERE `id` = ?");
                        $upStmt->execute($vals);
                    } else {
                        $colNames = array_keys($validFields);
                        $placeholders = array_fill(0, count($colNames), '?');
                        $insStmt = $pdo->prepare("INSERT INTO `podcasts` (" . implode(', ', array_map(fn($k) => "`$k`", $colNames)) . ") VALUES (" . implode(', ', $placeholders) . ")");
                        $insStmt->execute(array_values($validFields));
                    }
                }

                if (count($syncedIds) > 0 && !isset($data['titleBn']) && !isset($data['title_bn'])) {
                    $ph = implode(',', array_fill(0, count($syncedIds), '?'));
                    $delStmt = $pdo->prepare("DELETE FROM `podcasts` WHERE `podcast_id` NOT IN ($ph)");
                    $delStmt->execute($syncedIds);
                }
            }

            echo json_encode(['success' => true, 'message' => 'পডকাস্ট ডাটা MariaDB podcasts টেবিলে সফলভাবে সংরক্ষিত হয়েছে।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

                // Video News
        if ($module === 'videoNews' || $module === 'video_news') {
            if (is_array($data)) {
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
                $items = isset($data[0]) ? $data : [$data];
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
                    if (!$ytId && $ytUrl && preg_match('/(?:v=|\/embed\/|youtu\.be\/|\/v\/|watch\?v=)([a-zA-Z0-9_-]{11})/', $ytUrl, $m)) {
                        $ytId = $m[1];
                    }
                    $img = trim($v['imageUrl'] ?? ($v['image_url'] ?? ($v['thumbnail'] ?? '')));
                    if (!$img && $ytId) $img = "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg";
                    $thumb = trim($v['thumbnail'] ?? $img);
                    $duration = trim($v['videoDuration'] ?? ($v['video_duration'] ?? ($v['duration'] ?? '০৩:৪৫')));
                    $dateBn = trim($v['dateBn'] ?? ($v['date_bn'] ?? ''));
                    $dateEn = trim($v['dateEn'] ?? ($v['date_en'] ?? ''));

                    $vnStmt->execute([
                        $vId, $titleBn, $titleEn, $category, $categoryBn, $categoryEn,
                        $ytUrl, $ytId, $img, $thumb, $duration, $dateBn, $dateEn
                    ]);
                }
            }
            echo json_encode(['success' => true, 'message' => 'ভিডিও সংবাদ MariaDB-তে সংরক্ষণ করা হয়েছে।'], JSON_UNESCAPED_UNICODE);
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

        // 8. Save Team Members Order
        if ($module === 'team_order' || $module === 'teamOrder' || $module === 'team_members') {
            $jsonVal = is_array($data) ? json_encode($data, JSON_UNESCAPED_UNICODE) : (string)$data;
            $stmt = $pdo->prepare("INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES ('team_members_order', ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)");
            $stmt->execute([$jsonVal]);
            echo json_encode(['success' => true, 'message' => 'টিম সদস্যদের ক্রম MariaDB-তে সফলভাবে সংরক্ষিত হয়েছে।']);
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
