<?php
/**
 * Jonogon News (জনগণ.নিউজ) - Video News CRUD REST API for MariaDB
 * Target Table: `video_news` (Always ordered by newest first: created_at DESC, id DESC)
 */
ini_set('memory_limit', '512M');
date_default_timezone_set('Asia/Dhaka');
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// -------------------------------------------------------------
// Ensure table exists
// -------------------------------------------------------------
function ensureVideoNewsTable($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `video_news` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `video_id` VARCHAR(100) NOT NULL UNIQUE,
            `title_bn` VARCHAR(500) NOT NULL,
            `title_en` VARCHAR(500) NULL,
            `category` VARCHAR(100) DEFAULT 'bangladesh',
            `category_bn` VARCHAR(150) DEFAULT 'বাংলাদেশ',
            `category_en` VARCHAR(150) DEFAULT 'Bangladesh',
            `youtube_url` TEXT NULL,
            `youtube_id` VARCHAR(50) NULL,
            `image_url` TEXT NULL,
            `thumbnail` TEXT NULL,
            `video_duration` VARCHAR(50) DEFAULT '০৩:৪৫',
            `date_bn` VARCHAR(100) NULL,
            `date_en` VARCHAR(100) NULL,
            `order_index` INT DEFAULT 0,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (`created_at`),
            INDEX (`order_index`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
}

function extractYtId($url) {
    if (!$url || !is_string($url)) return '';
    if (preg_match('/(?:v=|\/embed\/|youtu\.be\/|\/v\/|watch\?v=)([a-zA-Z0-9_-]{11})/', $url, $m)) {
        return $m[1];
    }
    return '';
}

// -------------------------------------------------------------
// 1. GET: Fetch all Video News (Newest first)
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        if (!$pdo) {
            throw new Exception('MariaDB connection error: ' . ($dbError ?? 'Unknown error'));
        }
        ensureVideoNewsTable($pdo);

        $stmt = $pdo->query("SELECT * FROM `video_news` ORDER BY `created_at` DESC, `id` DESC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $videos = [];
        foreach ($rows as $r) {
            $ytId = $r['youtube_id'] ?: extractYtId($r['youtube_url']);
            $thumb = $r['image_url'] ?: ($r['thumbnail'] ?: ($ytId ? "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg" : ''));
            $videos[] = [
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

        echo json_encode([
            'success' => true,
            'count' => count($videos),
            'data' => $videos
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 2. DELETE: Remove Video News
// -------------------------------------------------------------
$rawDeleteInput = @file_get_contents('php://input');
$deletePayload = json_decode($rawDeleteInput, true) ?: [];
$deleteAction = $_GET['action'] ?? ($deletePayload['action'] ?? '');

if ($method === 'DELETE' || ($method === 'POST' && in_array($deleteAction, ['delete', 'remove']))) {
    try {
        if (!$pdo) throw new Exception('MariaDB connection error');
        ensureVideoNewsTable($pdo);

        $id = $_GET['id'] ?? ($deletePayload['id'] ?? ($deletePayload['video_id'] ?? ($deletePayload['videoId'] ?? null)));
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Video ID is required.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $delStmt = $pdo->prepare("DELETE FROM `video_news` WHERE `id` = ? OR `video_id` = ?");
        $delStmt->execute([$id, $id]);

        echo json_encode(['success' => true, 'message' => 'ভিডিওটি সফলভাবে মুছে ফেলা হয়েছে।'], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 3. POST: Create or Update Video News
// -------------------------------------------------------------
if ($method === 'POST') {
    try {
        if (!$pdo) throw new Exception('MariaDB connection error');
        ensureVideoNewsTable($pdo);

        $rawInput = @file_get_contents('php://input');
        $payload = json_decode($rawInput, true) ?: $_POST;

        // If bulk array sent (from sync)
        if (isset($payload['data']) && is_array($payload['data'])) {
            $items = $payload['data'];
        } elseif (isset($payload[0]) && is_array($payload[0])) {
            $items = $payload;
        } else {
            $items = [$payload];
        }

        $stmt = $pdo->prepare("
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

        $inserted = [];
        foreach ($items as $item) {
            if (empty($item['titleBn']) && empty($item['title_bn'])) continue;

            $vId = trim($item['id'] ?? ($item['videoId'] ?? ($item['video_id'] ?? '')));
            if (!$vId) {
                $vId = 'vnews-' . round(microtime(true) * 1000);
            }

            $titleBn = trim($item['titleBn'] ?? ($item['title_bn'] ?? ''));
            $titleEn = trim($item['titleEn'] ?? ($item['title_en'] ?? $titleBn));
            $category = trim($item['category'] ?? ($item['category_id'] ?? 'bangladesh'));
            $categoryBn = trim($item['categoryBn'] ?? ($item['category_bn'] ?? 'বাংলাদেশ'));
            $categoryEn = trim($item['categoryEn'] ?? ($item['category_en'] ?? 'Bangladesh'));
            $ytUrl = trim($item['youtubeUrl'] ?? ($item['youtube_url'] ?? ($item['videoUrl'] ?? '')));
            $ytId = trim($item['youtubeId'] ?? ($item['youtube_id'] ?? ''));
            if (!$ytId && $ytUrl) {
                $ytId = extractYtId($ytUrl);
            }
            $img = trim($item['imageUrl'] ?? ($item['image_url'] ?? ($item['thumbnail'] ?? '')));
            if (!$img && $ytId) {
                $img = "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg";
            }
            $thumb = trim($item['thumbnail'] ?? $img);
            $duration = trim($item['videoDuration'] ?? ($item['video_duration'] ?? ($item['duration'] ?? '০৩:৪৫')));
            $dateBn = trim($item['dateBn'] ?? ($item['date_bn'] ?? ''));
            $dateEn = trim($item['dateEn'] ?? ($item['date_en'] ?? ''));

            $stmt->execute([
                $vId, $titleBn, $titleEn, $category, $categoryBn, $categoryEn,
                $ytUrl, $ytId, $img, $thumb, $duration, $dateBn, $dateEn
            ]);

            $inserted[] = [
                'id' => $vId,
                'videoId' => $vId,
                'titleBn' => $titleBn,
                'titleEn' => $titleEn,
                'category' => $category,
                'categoryBn' => $categoryBn,
                'categoryEn' => $categoryEn,
                'youtubeUrl' => $ytUrl,
                'youtubeId' => $ytId,
                'imageUrl' => $img,
                'thumbnail' => $thumb,
                'videoDuration' => $duration,
                'dateBn' => $dateBn,
                'dateEn' => $dateEn
            ];
        }

        echo json_encode([
            'success' => true,
            'message' => 'ভিডিও সংবাদ ডাটাবেজে সংরক্ষণ করা হয়েছে।',
            'data' => count($inserted) === 1 ? $inserted[0] : $inserted
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
