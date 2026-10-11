<?php
/**
 * Jonogon News (জনগণ.নিউজ) - Dedicated Podcasts REST API for MariaDB
 * Target Table: `podcasts`
 */
ini_set('memory_limit', '512M');
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function ensurePodcastsTableInApi($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `podcasts` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `podcast_id` VARCHAR(64) NOT NULL UNIQUE,
            `title_bn` VARCHAR(500) NOT NULL,
            `title_en` VARCHAR(500) NULL,
            `subject_id` VARCHAR(100) NOT NULL DEFAULT 'politics',
            `subject_bn` VARCHAR(150) NOT NULL DEFAULT 'রাজনীতি ও রাষ্ট্র',
            `subject_en` VARCHAR(150) NOT NULL DEFAULT 'Politics & Governance',
            `youtube_url` TEXT NULL,
            `youtube_id` VARCHAR(50) NULL,
            `audio_url` TEXT NULL,
            `video_url` TEXT NULL,
            `host_bn` VARCHAR(150) NOT NULL DEFAULT 'মোঃ বিপ্লব হোসেন',
            `host_en` VARCHAR(150) NOT NULL DEFAULT 'Md. Biplob Hossain',
            `host_name` VARCHAR(150) NULL,
            `guest_bn` VARCHAR(150) NULL,
            `guest_en` VARCHAR(150) NULL,
            `duration` VARCHAR(50) NOT NULL DEFAULT '২৫:০০',
            `thumbnail` TEXT NULL,
            `status` VARCHAR(50) NOT NULL DEFAULT 'published',
            `views` BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
            `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $existing = [];
    $stmt = $pdo->query("SHOW COLUMNS FROM `podcasts`");
    while ($col = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $existing[strtolower($col['Field'])] = true;
    }

    $required = [
        'podcast_id' => "VARCHAR(64) NOT NULL UNIQUE",
        'title_bn' => "VARCHAR(500) NOT NULL",
        'title_en' => "VARCHAR(500) NULL",
        'subject_id' => "VARCHAR(100) NOT NULL DEFAULT 'politics'",
        'subject_bn' => "VARCHAR(150) NOT NULL DEFAULT 'রাজনীতি ও রাষ্ট্র'",
        'subject_en' => "VARCHAR(150) NOT NULL DEFAULT 'Politics & Governance'",
        'youtube_url' => "TEXT NULL",
        'youtube_id' => "VARCHAR(50) NULL",
        'audio_url' => "TEXT NULL",
        'video_url' => "TEXT NULL",
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

    foreach ($required as $col => $def) {
        if (!isset($existing[strtolower($col)])) {
            try {
                $pdo->exec("ALTER TABLE `podcasts` ADD COLUMN `{$col}` {$def}");
            } catch (Exception $e) {}
        }
    }
}

// -------------------------------------------------------------
// 1. GET: Fetch Podcasts
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        if (!$pdo) {
            throw new Exception('MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই: ' . ($dbError ?? 'Unknown error'));
        }

        ensurePodcastsTableInApi($pdo);

        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $subject = isset($_GET['subject']) ? trim($_GET['subject']) : null;
        $podId = isset($_GET['id']) ? trim($_GET['id']) : null;

        $query = "SELECT * FROM `podcasts` WHERE 1=1";
        $params = [];

        if ($podId) {
            $query .= " AND (`podcast_id` = ? OR `id` = ?)";
            $params[] = $podId;
            $params[] = $podId;
        } elseif ($subject && $subject !== 'all') {
            $query .= " AND `subject_id` = ?";
            $params[] = $subject;
        }

        $query .= " ORDER BY `created_at` DESC LIMIT " . max(1, min(200, $limit));

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);

        $podcasts = [];
        while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $yt = $r['youtube_url'] ?? ($r['video_url'] ?? '');
            $ytId = $r['youtube_id'] ?? '';
            if (empty($ytId) && preg_match('/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/', $yt, $m)) {
                $ytId = $m[1];
            }

            $thumb = $r['thumbnail'] ?: '';
            if ($ytId && (empty($thumb) || strpos($thumb, 'unsplash') !== false)) {
                $thumb = "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg";
            }

            $podcasts[] = [
                'id' => $r['podcast_id'] ?: ('pod-' . $r['id']),
                'podcast_id' => $r['podcast_id'] ?: ('pod-' . $r['id']),
                'db_id' => (int)$r['id'],
                'titleBn' => $r['title_bn'] ?: '',
                'titleEn' => $r['title_en'] ?: '',
                'subjectId' => $r['subject_id'] ?: 'politics',
                'subjectBn' => $r['subject_bn'] ?: 'রাজনীতি ও রাষ্ট্র',
                'subjectEn' => $r['subject_en'] ?: 'Politics & Governance',
                'youtubeUrl' => $yt,
                'youtubeId' => $ytId,
                'hostBn' => $r['host_bn'] ?: ($r['host_name'] ?? 'মোঃ বিপ্লব হোসেন'),
                'hostEn' => $r['host_en'] ?: 'Md. Biplob Hossain',
                'guestBn' => $r['guest_bn'] ?: '',
                'guestEn' => $r['guest_en'] ?: '',
                'duration' => $r['duration'] ?: '২৫:০০',
                'thumbnail' => $thumb,
                'dateBn' => !empty($r['created_at']) ? date('d F Y', strtotime($r['created_at'])) : '',
                'dateEn' => !empty($r['created_at']) ? date('d M Y', strtotime($r['created_at'])) : '',
                'createdAt' => $r['created_at'] ?? date('Y-m-d H:i:s')
            ];
        }

        echo json_encode([
            'success' => true,
            'count' => count($podcasts),
            'data' => $podcasts
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 2. DELETE: Remove Podcast
// -------------------------------------------------------------
$rawDeleteInput = file_get_contents('php://input');
$deletePayload = json_decode($rawDeleteInput, true) ?: [];
$deleteAction = $_GET['action'] ?? ($deletePayload['action'] ?? '');

if ($method === 'DELETE' || ($method === 'POST' && in_array($deleteAction, ['delete', 'delete_podcast', 'remove']))) {
    try {
        if (!$pdo) {
            throw new Exception('MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই: ' . ($dbError ?? 'Unknown error'));
        }

        ensurePodcastsTableInApi($pdo);

        $id = $_GET['id'] ?? ($deletePayload['id'] ?? ($deletePayload['podcast_id'] ?? null));
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'পডকাস্ট আইডি প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM `podcasts` WHERE `id` = ? OR `podcast_id` = ?");
        $stmt->execute([$id, $id]);

        echo json_encode([
            'success' => true,
            'message' => 'পডকাস্ট পর্বটি MariaDB ডাটাবেজ থেকে মুছে ফেলা হয়েছে।'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 3. POST: Create or Update Podcast
// -------------------------------------------------------------
if ($method === 'POST') {
    try {
        if (!$pdo) {
            throw new Exception('MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই: ' . ($dbError ?? 'Unknown error'));
        }

        ensurePodcastsTableInApi($pdo);

        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);
        if (!$data) {
            $data = $_POST;
        }

        $titleBn = trim($data['titleBn'] ?? ($data['title_bn'] ?? ($data['title'] ?? '')));
        if (!$titleBn) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'পডকাস্টের শিরোনাম প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $titleEn = trim($data['titleEn'] ?? ($data['title_en'] ?? ''));
        $podId = trim($data['id'] ?? ($data['podcast_id'] ?? ''));
        if (!$podId) {
            $podId = 'pod-' . time() . '-' . rand(100, 999);
        }

        $subId = trim($data['subjectId'] ?? ($data['subject_id'] ?? 'politics'));
        $subBn = trim($data['subjectBn'] ?? ($data['subject_bn'] ?? 'রাজনীতি ও রাষ্ট্র'));
        $subEn = trim($data['subjectEn'] ?? ($data['subject_en'] ?? 'Politics & Governance'));
        $ytUrl = trim($data['youtubeUrl'] ?? ($data['youtube_url'] ?? ($data['videoUrl'] ?? ($data['video_url'] ?? ''))));

        $ytId = trim($data['youtubeId'] ?? ($data['youtube_id'] ?? ''));
        if (empty($ytId) && preg_match('/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/', $ytUrl, $m)) {
            $ytId = $m[1];
        }

        $hostBn = trim($data['hostBn'] ?? ($data['host_bn'] ?? ($data['host_name'] ?? 'মোঃ বিপ্লব হোসেন')));
        $hostEn = trim($data['hostEn'] ?? ($data['host_en'] ?? 'Md. Biplob Hossain'));
        $guestBn = trim($data['guestBn'] ?? ($data['guest_bn'] ?? ''));
        $guestEn = trim($data['guestEn'] ?? ($data['guest_en'] ?? ''));
        $duration = trim($data['duration'] ?? '২৫:০০');
        $thumbnail = trim($data['thumbnail'] ?? ($data['thumbnail_url'] ?? ''));
        if ($ytId && (empty($thumbnail) || strpos($thumbnail, 'unsplash') !== false)) {
            $thumbnail = "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg";
        }

        $colStmt = $pdo->query("SHOW COLUMNS FROM `podcasts`");
        $colsMap = [];
        while ($c = $colStmt->fetch(PDO::FETCH_ASSOC)) {
            $colsMap[strtolower($c['Field'])] = true;
        }

        $fieldsPayload = [
            'podcast_id' => $podId,
            'title_bn' => $titleBn,
            'title_en' => $titleEn,
            'subject_id' => $subId,
            'subject_bn' => $subBn,
            'subject_en' => $subEn,
            'youtube_url' => $ytUrl,
            'youtube_id' => $ytId,
            'video_url' => $ytUrl,
            'audio_url' => $data['audioUrl'] ?? ($data['audio_url'] ?? ''),
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
        foreach ($fieldsPayload as $k => $v) {
            if (isset($colsMap[strtolower($k)])) {
                $validFields[$k] = $v;
            }
        }

        $chk = $pdo->prepare("SELECT `id` FROM `podcasts` WHERE `podcast_id` = ? LIMIT 1");
        $chk->execute([$podId]);
        $existing = $chk->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $setClauses = [];
            $vals = [];
            foreach ($validFields as $k => $v) {
                if ($k !== 'id') {
                    $setClauses[] = "`{$k}` = ?";
                    $vals[] = $v;
                }
            }
            $vals[] = $existing['id'];
            $upSql = "UPDATE `podcasts` SET " . implode(', ', $setClauses) . " WHERE `id` = ?";
            $stmt = $pdo->prepare($upSql);
            $stmt->execute($vals);
            $dbId = $existing['id'];
            $msg = 'পডকাস্ট পর্বটি MariaDB ডাটাবেজে সফলভাবে আপডেট হয়েছে!';
        } else {
            $colNames = array_keys($validFields);
            $placeholders = array_fill(0, count($colNames), '?');
            $insSql = "INSERT INTO `podcasts` (" . implode(', ', array_map(fn($k) => "`$k`", $colNames)) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $pdo->prepare($insSql);
            $stmt->execute(array_values($validFields));
            $dbId = $pdo->lastInsertId();
            $msg = 'পডকাস্ট পর্বটি MariaDB ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে!';
        }

        echo json_encode([
            'success' => true,
            'message' => $msg,
            'id' => $dbId,
            'podcast_id' => $podId
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'MariaDB Save Error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
