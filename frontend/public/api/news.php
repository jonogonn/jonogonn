<?php
/**
 * News CRUD REST API for MariaDB
 */
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Handle GET: Fetch news
if ($method === 'GET') {
    try {
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

        $query = "SELECT * FROM `news` WHERE 1=1";
        $params = [];

        if ($status && $status !== 'all') {
            $query .= " AND `status` = ?";
            $params[] = $status;
        }

        if ($category && $category !== 'all') {
            $query .= " AND (`category_id` = ? OR `category_bn` = ?)";
            $params[] = $category;
            $params[] = $category;
        }

        $query .= " ORDER BY `created_at` DESC LIMIT " . max(1, min(500, $limit));

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $articles = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'count' => count($articles),
            'data' => $articles
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Handle POST: Create or Update News
if ($method === 'POST') {
    try {
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        if (!$data) {
            $data = $_POST;
        }

        $title = trim($data['titleBn'] ?? $data['title'] ?? '');
        $titleEn = trim($data['titleEn'] ?? '');
        $kicker = trim($data['kicker'] ?? '');
        $content = $data['contentBn'] ?? $data['content'] ?? '';
        $excerpt = $data['excerptBn'] ?? $data['excerpt'] ?? $title;
        $slug = trim($data['slug'] ?? '');
        $postId = trim($data['id'] ?? $data['post_id'] ?? '');

        if (!$title) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'সংবাদের শিরোনাম প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!$slug) {
            $slug = 'post-' . time() . '-' . rand(100, 999);
        }

        $categoryId = $data['category'] ?? $data['category_id'] ?? 'bangladesh';
        $categoryBn = $data['categoryBn'] ?? $data['category_bn'] ?? 'বাংলাদেশ';
        $categoryEn = $data['categoryEn'] ?? $data['category_en'] ?? 'Bangladesh';
        $cardCategory = $data['cardCategory'] ?? $data['card_category'] ?? 'সারাদেশ । বাংলাদেশ';
        $cardCaption = $data['cardCaption'] ?? $data['card_caption'] ?? 'ছবি: সংগৃহীত';
        $featuredImage = $data['imageUrl'] ?? $data['featured_image'] ?? '';
        $author = $data['author'] ?? 'জনগণ নিউজ ডেস্ক';
        $status = $data['status'] ?? 'published';
        $revisionNote = $data['revisionNote'] ?? $data['revision_note'] ?? null;
        $views = (int)($data['views'] ?? 0);
        $isLeadHero = !empty($data['isLeadHero']) ? 1 : 0;
        $isHighlighted = !empty($data['isHighlighted']) ? 1 : 0;
        $isBreaking = !empty($data['isBreaking']) ? 1 : 0;
        $isVideo = !empty($data['isVideo']) ? 1 : 0;
        $videoDuration = $data['videoDuration'] ?? null;
        $tags = is_array($data['tags'] ?? null) ? json_encode($data['tags'], JSON_UNESCAPED_UNICODE) : ($data['tags'] ?? '');
        $metaTitle = $data['metaTitle'] ?? $title;
        $metaDesc = $data['metaDesc'] ?? $excerpt;
        $focusKeyword = $data['focusKeyword'] ?? '';
        $dateBn = $data['dateBn'] ?? date('d M Y');
        $dateEn = $data['dateEn'] ?? date('d M Y');

        // Check if post exists by post_id or slug
        $existing = null;
        if ($postId) {
            $checkStmt = $pdo->prepare("SELECT `id` FROM `news` WHERE `post_id` = ? OR `slug` = ? LIMIT 1");
            $checkStmt->execute([$postId, $slug]);
            $existing = $checkStmt->fetch();
        } else {
            $checkStmt = $pdo->prepare("SELECT `id` FROM `news` WHERE `slug` = ? LIMIT 1");
            $checkStmt->execute([$slug]);
            $existing = $checkStmt->fetch();
        }

        if ($existing) {
            // UPDATE
            $updateSql = "
                UPDATE `news` SET
                    `title` = ?,
                    `title_en` = ?,
                    `kicker` = ?,
                    `slug` = ?,
                    `category_id` = ?,
                    `category_bn` = ?,
                    `category_en` = ?,
                    `card_category` = ?,
                    `card_caption` = ?,
                    `excerpt` = ?,
                    `content` = ?,
                    `featured_image` = ?,
                    `author` = ?,
                    `status` = ?,
                    `revision_note` = ?,
                    `is_lead_hero` = ?,
                    `is_highlighted` = ?,
                    `is_breaking` = ?,
                    `is_video` = ?,
                    `video_duration` = ?,
                    `tags` = ?,
                    `meta_title` = ?,
                    `meta_desc` = ?,
                    `focus_keyword` = ?,
                    `date_bn` = ?,
                    `date_en` = ?
                WHERE `id` = ?
            ";
            $stmt = $pdo->prepare($updateSql);
            $stmt->execute([
                $title, $titleEn, $kicker, $slug, $categoryId, $categoryBn, $categoryEn,
                $cardCategory, $cardCaption, $excerpt, $content, $featuredImage, $author,
                $status, $revisionNote, $isLeadHero, $isHighlighted, $isBreaking, $isVideo,
                $videoDuration, $tags, $metaTitle, $metaDesc, $focusKeyword, $dateBn, $dateEn,
                $existing['id']
            ]);

            $dbId = $existing['id'];
            $msg = 'সংবাদটি MariaDB ডাটাবেজে সফলভাবে আপডেট হয়েছে!';
        } else {
            // INSERT
            if (!$postId) {
                $postId = 'news-' . time() . '-' . rand(100, 999);
            }
            $insertSql = "
                INSERT INTO `news` (
                    `post_id`, `title`, `title_en`, `kicker`, `slug`, `category_id`,
                    `category_bn`, `category_en`, `card_category`, `card_caption`,
                    `excerpt`, `content`, `featured_image`, `author`, `status`,
                    `revision_note`, `views`, `is_lead_hero`, `is_highlighted`,
                    `is_breaking`, `is_video`, `video_duration`, `tags`,
                    `meta_title`, `meta_desc`, `focus_keyword`, `date_bn`, `date_en`
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?
                )
            ";
            $stmt = $pdo->prepare($insertSql);
            $stmt->execute([
                $postId, $title, $titleEn, $kicker, $slug, $categoryId,
                $categoryBn, $categoryEn, $cardCategory, $cardCaption,
                $excerpt, $content, $featuredImage, $author, $status,
                $revisionNote, $views, $isLeadHero, $isHighlighted,
                $isBreaking, $isVideo, $videoDuration, $tags,
                $metaTitle, $metaDesc, $focusKeyword, $dateBn, $dateEn
            ]);
            $dbId = $pdo->lastInsertId();
            $msg = 'সংবাদটি MariaDB ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে!';
        }

        echo json_encode([
            'success' => true,
            'message' => $msg,
            'id' => $dbId,
            'post_id' => $postId,
            'slug' => $slug,
            'status' => $status
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'MariaDB Save Error: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Handle DELETE
if ($method === 'DELETE') {
    try {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'পোস্ট আইডি প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM `news` WHERE `id` = ? OR `post_id` = ?");
        $stmt->execute([$id, $id]);

        echo json_encode([
            'success' => true,
            'message' => 'পোস্টটি MariaDB থেকে মুছে ফেলা হয়েছে।'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
