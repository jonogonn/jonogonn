<?php
/**
 * Jonogon News (জনগণ.নিউজ) - Top 10 News (Shorts Style) REST API for MariaDB
 * Target Table: `top_news` (and view `top-news`)
 * Ordered by: `order_index` ASC, `rank` ASC, `id` ASC
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
// Ensure table exists & optional view `top-news`
// -------------------------------------------------------------
function ensureTopNewsTable($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `top_news` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `news_id` VARCHAR(100) NOT NULL UNIQUE,
            `rank` INT DEFAULT 1,
            `title_bn` VARCHAR(500) NOT NULL,
            `title_en` VARCHAR(500) NULL,
            `category` VARCHAR(100) DEFAULT 'top-10',
            `category_bn` VARCHAR(150) DEFAULT 'শীর্ষ সংবাদ',
            `category_en` VARCHAR(150) DEFAULT 'Top News',
            `youtube_url` TEXT NULL,
            `youtube_id` VARCHAR(50) NULL,
            `video_url` TEXT NULL,
            `image_url` TEXT NULL,
            `thumbnail` TEXT NULL,
            `video_duration` VARCHAR(50) DEFAULT '০০:৫৮',
            `views` INT DEFAULT 1500,
            `date_bn` VARCHAR(100) NULL,
            `date_en` VARCHAR(100) NULL,
            `order_index` INT DEFAULT 0,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (`rank`),
            INDEX (`order_index`),
            INDEX (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    try {
        $pdo->exec("CREATE OR REPLACE VIEW `top-news` AS SELECT * FROM `top_news`");
    } catch (Exception $e) {
        // View creation optional if privileges restricted
    }

    // Seed 10 realistic Top News items if empty
    $count = (int)$pdo->query("SELECT COUNT(*) FROM `top_news`")->fetchColumn();
    if ($count === 0) {
        seedInitialTopNews($pdo);
    }
}

function extractYtShortId($url) {
    if (!$url || !is_string($url)) return '';
    // YouTube Shorts: youtube.com/shorts/{id} or watch?v={id} or youtu.be/{id}
    if (preg_match('/(?:shorts\/|v=|\/embed\/|youtu\.be\/|\/v\/|watch\?v=)([a-zA-Z0-9_-]{11})/', $url, $m)) {
        return $m[1];
    }
    return '';
}

function seedInitialTopNews($pdo) {
    $seeds = [
        [
            'news_id' => 'top-news-1',
            'rank' => 1,
            'title_bn' => 'স্মার্ট জাতীয় পরিচয়পত্র সেবা নিয়ে নির্বাচন কমিশনের নতুন নির্দেশনা',
            'title_en' => 'Election Commission announces new guidelines for Smart NID services',
            'category' => 'national',
            'category_bn' => 'জাতীয়',
            'category_en' => 'National',
            'youtube_url' => 'https://www.youtube.com/shorts/5qap5aO4i9A',
            'youtube_id' => '5qap5aO4i9A',
            'image_url' => 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০০:৫৮',
            'views' => 4820,
            'order_index' => 1
        ],
        [
            'news_id' => 'top-news-2',
            'rank' => 2,
            'title_bn' => 'টি-টোয়েন্টি সিরিজে ইতিহাস গড়ল বাংলাদেশ দল',
            'title_en' => 'Bangladesh cricket team sets historic milestone in T20 series',
            'category' => 'sports',
            'category_bn' => 'খেলাধুলা',
            'category_en' => 'Sports',
            'youtube_url' => 'https://www.youtube.com/shorts/kJQP7kiw5Fk',
            'youtube_id' => 'kJQP7kiw5Fk',
            'image_url' => 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০০:৪৫',
            'views' => 3950,
            'order_index' => 2
        ],
        [
            'news_id' => 'top-news-3',
            'rank' => 3,
            'title_bn' => 'রাজধানীতে মেট্রোরেলের নতুন রুটের পরীক্ষামূলক যাত্রা শুরু',
            'title_en' => 'Trial runs begin on Dhaka Metro Rail extended passenger route',
            'category' => 'bangladesh',
            'category_bn' => 'বাংলাদেশ',
            'category_en' => 'Bangladesh',
            'youtube_url' => 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
            'youtube_id' => 'dQw4w9WgXcQ',
            'image_url' => 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০১:১০',
            'views' => 3420,
            'order_index' => 3
        ],
        [
            'news_id' => 'top-news-4',
            'rank' => 4,
            'title_bn' => 'কৃত্রিম বুদ্ধিমত্তা নিয়ে টেক জায়ান্টদের যুগান্তকারী উদ্ভাবন',
            'title_en' => 'Breakthrough developments in generative artificial intelligence',
            'category' => 'technology',
            'category_bn' => 'প্রযুক্তি',
            'category_en' => 'Technology',
            'youtube_url' => 'https://www.youtube.com/shorts/L_LUpnjgPso',
            'youtube_id' => 'L_LUpnjgPso',
            'image_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০০:৫২',
            'views' => 2840,
            'order_index' => 4
        ],
        [
            'news_id' => 'top-news-5',
            'rank' => 5,
            'title_bn' => 'বিশ্ববাজারে জ্বালানি তেলের দামে বড় পতন',
            'title_en' => 'Significant decrease observed in global crude oil market prices',
            'category' => 'economy',
            'category_bn' => 'অর্থনীতি',
            'category_en' => 'Economy',
            'youtube_url' => 'https://www.youtube.com/shorts/3JZ_D3ELwOQ',
            'youtube_id' => '3JZ_D3ELwOQ',
            'image_url' => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০০:৪০',
            'views' => 2410,
            'order_index' => 5
        ],
        [
            'news_id' => 'top-news-6',
            'rank' => 6,
            'title_bn' => 'জলবায়ু শীর্ষ সম্মেলনে উন্নয়নশীল দেশগুলোর ঐতিহাসিক দাবি',
            'title_en' => 'Historic climate adaptation consensus reached at international summit',
            'category' => 'international',
            'category_bn' => 'আন্তর্জাতিক',
            'category_en' => 'International',
            'youtube_url' => 'https://www.youtube.com/shorts/9bZkp7q19f0',
            'youtube_id' => '9bZkp7q19f0',
            'image_url' => 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০১:০৫',
            'views' => 2190,
            'order_index' => 6
        ],
        [
            'news_id' => 'top-news-7',
            'rank' => 7,
            'title_bn' => 'চলতি অর্থবছরে রেমিট্যান্স প্রবাহে নতুন রেকর্ড স্থাপন',
            'title_en' => 'Record foreign remittance inflows recorded for expatriate workforce',
            'category' => 'economy',
            'category_bn' => 'প্রবাস ও অর্থনীতি',
            'category_en' => 'Remittance',
            'youtube_url' => 'https://www.youtube.com/shorts/21X5lGlDOfg',
            'youtube_id' => '21X5lGlDOfg',
            'image_url' => 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০০:৪৭',
            'views' => 1980,
            'order_index' => 7
        ],
        [
            'news_id' => 'top-news-8',
            'rank' => 8,
            'title_bn' => 'এইচএসসি ও সমমানের পরীক্ষার চূড়ান্ত ফলাফল প্রকাশিত',
            'title_en' => 'National Higher Secondary Certificate examination results announced',
            'category' => 'education',
            'category_bn' => 'শিক্ষা',
            'category_en' => 'Education',
            'youtube_url' => 'https://www.youtube.com/shorts/oHg5SJYRHA0',
            'youtube_id' => 'oHg5SJYRHA0',
            'image_url' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০০:৫৮',
            'views' => 1760,
            'order_index' => 8
        ],
        [
            'news_id' => 'top-news-9',
            'rank' => 9,
            'title_bn' => 'স্বাস্থ্যখাতে আধুনিক প্রযুক্তির ব্যবহার বাড়াতে নতুন নীতিমালা',
            'title_en' => 'New healthcare policy framework prioritizes modern medical technology',
            'category' => 'health',
            'category_bn' => 'স্বাস্থ্য',
            'category_en' => 'Health',
            'youtube_url' => 'https://www.youtube.com/shorts/fJ9rUzIMcZQ',
            'youtube_id' => 'fJ9rUzIMcZQ',
            'image_url' => 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০০:৫০',
            'views' => 1530,
            'order_index' => 9
        ],
        [
            'news_id' => 'top-news-10',
            'rank' => 10,
            'title_bn' => 'শীতের আগমনে দেশের পর্যটন কেন্দ্রগুলোতে পর্যটকদের ভিড়',
            'title_en' => 'Winter tourism peaks across major coastal and scenic resorts',
            'category' => 'lifestyle',
            'category_bn' => 'ভ্রমণ ও বিনোদন',
            'category_en' => 'Lifestyle',
            'youtube_url' => 'https://www.youtube.com/shorts/60ItHLz5WEA',
            'youtube_id' => '60ItHLz5WEA',
            'image_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=1000&fit=crop&q=80',
            'video_duration' => '০১:১৫',
            'views' => 1340,
            'order_index' => 10
        ]
    ];

    $stmt = $pdo->prepare("
        INSERT INTO `top_news` (
            `news_id`, `rank`, `title_bn`, `title_en`, `category`, `category_bn`, `category_en`,
            `youtube_url`, `youtube_id`, `image_url`, `thumbnail`, `video_duration`, `views`, `order_index`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($seeds as $s) {
        $stmt->execute([
            $s['news_id'],
            $s['rank'],
            $s['title_bn'],
            $s['title_en'],
            $s['category'],
            $s['category_bn'],
            $s['category_en'],
            $s['youtube_url'],
            $s['youtube_id'],
            $s['image_url'],
            $s['image_url'],
            $s['video_duration'],
            $s['views'],
            $s['order_index']
        ]);
    }
}

// -------------------------------------------------------------
// 1. GET: Fetch all Top 10 News
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        if (!$pdo) throw new Exception('MariaDB connection error: ' . ($dbError ?? 'Unknown error'));
        ensureTopNewsTable($pdo);

        $stmt = $pdo->query("SELECT * FROM `top_news` WHERE `is_active` = 1 ORDER BY `order_index` ASC, `rank` ASC, `id` ASC LIMIT 20");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $items = [];
        $idx = 1;
        foreach ($rows as $r) {
            $ytId = $r['youtube_id'] ?: extractYtShortId($r['youtube_url']);
            $thumb = $r['image_url'] ?: ($r['thumbnail'] ?: ($ytId ? "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg" : ''));
            $items[] = [
                'id' => $r['news_id'] ?: ('top-' . $r['id']),
                'db_id' => (int)$r['id'],
                'newsId' => $r['news_id'] ?: ('top-' . $r['id']),
                'rank' => (int)($r['rank'] ?: $idx),
                'titleBn' => $r['title_bn'] ?: '',
                'titleEn' => $r['title_en'] ?: '',
                'category' => $r['category'] ?: 'top-10',
                'categoryBn' => $r['category_bn'] ?: 'শীর্ষ সংবাদ',
                'categoryEn' => $r['category_en'] ?: 'Top News',
                'youtubeUrl' => $r['youtube_url'] ?: ($ytId ? "https://www.youtube.com/shorts/{$ytId}" : ''),
                'youtubeId' => $ytId,
                'videoUrl' => $r['video_url'] ?: '',
                'imageUrl' => $thumb,
                'thumbnail' => $thumb,
                'videoDuration' => $r['video_duration'] ?: '০০:৫৮',
                'duration' => $r['video_duration'] ?: '০০:৫৮',
                'views' => (int)($r['views'] ?: (1200 + ($r['id'] * 150))),
                'dateBn' => $r['date_bn'] ?: date('d M Y', strtotime($r['created_at'])),
                'dateEn' => $r['date_en'] ?: date('d M Y', strtotime($r['created_at'])),
                'orderIndex' => (int)$r['order_index'],
                'isActive' => (bool)$r['is_active'],
                'createdAt' => $r['created_at'],
                'updatedAt' => $r['updated_at']
            ];
            $idx++;
        }

        echo json_encode([
            'success' => true,
            'count' => count($items),
            'data' => $items
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 2. DELETE: Remove Top News
// -------------------------------------------------------------
$rawDeleteInput = @file_get_contents('php://input');
$deletePayload = json_decode($rawDeleteInput, true) ?: [];
$deleteAction = $_GET['action'] ?? ($deletePayload['action'] ?? '');

if ($method === 'DELETE' || ($method === 'POST' && in_array($deleteAction, ['delete', 'remove']))) {
    try {
        if (!$pdo) throw new Exception('MariaDB connection error');
        ensureTopNewsTable($pdo);

        $id = $_GET['id'] ?? ($deletePayload['id'] ?? ($deletePayload['news_id'] ?? ($deletePayload['newsId'] ?? null)));
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'News ID is required.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $delStmt = $pdo->prepare("DELETE FROM `top_news` WHERE `id` = ? OR `news_id` = ?");
        $delStmt->execute([$id, $id]);

        echo json_encode(['success' => true, 'message' => 'শীর্ষ সংবাদটি সফলভাবে মুছে ফেলা হয়েছে।'], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 3. POST: Create or Update Top News
// -------------------------------------------------------------
if ($method === 'POST') {
    try {
        if (!$pdo) throw new Exception('MariaDB connection error');
        ensureTopNewsTable($pdo);

        $rawInput = @file_get_contents('php://input');
        $payload = json_decode($rawInput, true) ?: $_POST;

        // Bulk array support
        if (isset($payload['data']) && is_array($payload['data'])) {
            $items = $payload['data'];
        } elseif (isset($payload[0]) && is_array($payload[0])) {
            $items = $payload;
        } else {
            $items = [$payload];
        }

        $stmt = $pdo->prepare("
            INSERT INTO `top_news` (
                `news_id`, `rank`, `title_bn`, `title_en`, `category`, `category_bn`, `category_en`,
                `youtube_url`, `youtube_id`, `video_url`, `image_url`, `thumbnail`, `video_duration`,
                `views`, `date_bn`, `date_en`, `order_index`, `is_active`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                `rank` = VALUES(`rank`),
                `title_bn` = VALUES(`title_bn`),
                `title_en` = VALUES(`title_en`),
                `category` = VALUES(`category`),
                `category_bn` = VALUES(`category_bn`),
                `category_en` = VALUES(`category_en`),
                `youtube_url` = VALUES(`youtube_url`),
                `youtube_id` = VALUES(`youtube_id`),
                `video_url` = VALUES(`video_url`),
                `image_url` = VALUES(`image_url`),
                `thumbnail` = VALUES(`thumbnail`),
                `video_duration` = VALUES(`video_duration`),
                `views` = VALUES(`views`),
                `date_bn` = VALUES(`date_bn`),
                `date_en` = VALUES(`date_en`),
                `order_index` = VALUES(`order_index`),
                `is_active` = VALUES(`is_active`),
                `updated_at` = CURRENT_TIMESTAMP
        ");

        $inserted = [];
        $orderCounter = 1;
        foreach ($items as $item) {
            if (empty($item['titleBn']) && empty($item['title_bn'])) continue;

            $newsId = trim($item['id'] ?? ($item['newsId'] ?? ($item['news_id'] ?? '')));
            if (!$newsId) {
                $newsId = 'top-news-' . round(microtime(true) * 1000) . '-' . rand(10, 99);
            }

            $rank = (int)($item['rank'] ?? ($item['orderIndex'] ?? ($item['order_index'] ?? $orderCounter)));
            $titleBn = trim($item['titleBn'] ?? ($item['title_bn'] ?? ''));
            $titleEn = trim($item['titleEn'] ?? ($item['title_en'] ?? $titleBn));
            $category = trim($item['category'] ?? ($item['category_id'] ?? 'top-10'));
            $categoryBn = trim($item['categoryBn'] ?? ($item['category_bn'] ?? 'শীর্ষ সংবাদ'));
            $categoryEn = trim($item['categoryEn'] ?? ($item['category_en'] ?? 'Top News'));
            $ytUrl = trim($item['youtubeUrl'] ?? ($item['youtube_url'] ?? ''));
            $ytId = trim($item['youtubeId'] ?? ($item['youtube_id'] ?? ''));
            if (!$ytId && $ytUrl) {
                $ytId = extractYtShortId($ytUrl);
            }
            $videoUrl = trim($item['videoUrl'] ?? ($item['video_url'] ?? ''));
            $img = trim($item['imageUrl'] ?? ($item['image_url'] ?? ($item['thumbnail'] ?? '')));
            if (!$img && $ytId) {
                $img = "https://img.youtube.com/vi/{$ytId}/hqdefault.jpg";
            }
            $thumb = trim($item['thumbnail'] ?? $img);
            $duration = trim($item['videoDuration'] ?? ($item['video_duration'] ?? ($item['duration'] ?? '০০:৫৮')));
            $views = (int)($item['views'] ?? (1200 + rand(100, 2500)));
            $dateBn = trim($item['dateBn'] ?? ($item['date_bn'] ?? ''));
            $dateEn = trim($item['dateEn'] ?? ($item['date_en'] ?? ''));
            $orderIndex = (int)($item['orderIndex'] ?? ($item['order_index'] ?? $rank));
            $isActive = isset($item['isActive']) ? ($item['isActive'] ? 1 : 0) : (isset($item['is_active']) ? ($item['is_active'] ? 1 : 0) : 1);

            $stmt->execute([
                $newsId, $rank, $titleBn, $titleEn, $category, $categoryBn, $categoryEn,
                $ytUrl, $ytId, $videoUrl, $img, $thumb, $duration,
                $views, $dateBn, $dateEn, $orderIndex, $isActive
            ]);

            $inserted[] = [
                'id' => $newsId,
                'newsId' => $newsId,
                'rank' => $rank,
                'titleBn' => $titleBn,
                'titleEn' => $titleEn,
                'category' => $category,
                'categoryBn' => $categoryBn,
                'categoryEn' => $categoryEn,
                'youtubeUrl' => $ytUrl,
                'youtubeId' => $ytId,
                'videoUrl' => $videoUrl,
                'imageUrl' => $img,
                'thumbnail' => $thumb,
                'videoDuration' => $duration,
                'views' => $views,
                'dateBn' => $dateBn,
                'dateEn' => $dateEn,
                'orderIndex' => $orderIndex,
                'isActive' => (bool)$isActive
            ];
            $orderCounter++;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Top 10 News saved successfully to database.',
            'data' => count($inserted) === 1 ? $inserted[0] : $inserted
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

