<?php
/**
 * Jonogon News (জনগণ.নিউজ) - Master News CRUD REST API for MariaDB / cPanel
 * Table: `news_posts` (UTF-8 Multi-language schema)
 */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Helper to determine active table name
function getNewsTableName($pdo) {
    static $tbl = null;
    if ($tbl !== null) return $tbl;
    try {
        $check = $pdo->query("SHOW TABLES LIKE 'news_posts'");
        if ($check && $check->rowCount() > 0) {
            $tbl = 'news_posts';
            return $tbl;
        }
    } catch (Exception $e) {}
    $tbl = 'news';
    return $tbl;
}

// -------------------------------------------------------------
// 1. GET: Fetch News Articles
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        if (!$pdo) {
            throw new Exception('ডাটাবেজ সংযোগ সক্রিয় নেই।');
        }

        $tableName = getNewsTableName($pdo);
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;
        $postId = isset($_GET['id']) ? trim($_GET['id']) : null;

        $query = "SELECT * FROM `{$tableName}` WHERE 1=1";
        $params = [];

        if ($postId) {
            $query .= " AND (`post_id` = ? OR `id` = ?)";
            $params[] = $postId;
            $params[] = $postId;
        } elseif ($slug) {
            $query .= " AND `slug` = ?";
            $params[] = $slug;
        } else {
            if ($status && $status !== 'all') {
                $query .= " AND `status` = ?";
                $params[] = $status;
            }

            if ($category && $category !== 'all') {
                $query .= " AND (`category_id` = ? OR `category_bn` = ?)";
                $params[] = $category;
                $params[] = $category;
            }
        }

        $query .= " ORDER BY `created_at` DESC LIMIT " . max(1, min(500, $limit));

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rawArticles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Normalize article fields for frontend compatibility
        $articles = array_map(function($row) {
            return [
                'id' => $row['post_id'] ?? ('news-' . $row['id']),
                'db_id' => (int)($row['id'] ?? 0),
                'postId' => $row['post_id'] ?? '',
                'slug' => $row['slug'] ?? '',
                'titleBn' => $row['title_bn'] ?? ($row['title'] ?? ''),
                'titleEn' => $row['title_en'] ?? '',
                'title' => $row['title_bn'] ?? ($row['title'] ?? ''),
                'kicker' => $row['kicker'] ?? '',
                'subtitle' => $row['subtitle'] ?? '',
                'excerptBn' => $row['excerpt_bn'] ?? ($row['excerpt'] ?? ''),
                'excerptEn' => $row['excerpt_en'] ?? '',
                'excerpt' => $row['excerpt_bn'] ?? ($row['excerpt'] ?? ''),
                'contentBn' => $row['content_bn'] ?? ($row['content'] ?? ''),
                'contentEn' => $row['content_en'] ?? '',
                'content' => $row['content_bn'] ?? ($row['content'] ?? ''),
                'category' => $row['category_id'] ?? 'bangladesh',
                'categoryId' => $row['category_id'] ?? 'bangladesh',
                'categoryBn' => $row['category_bn'] ?? 'বাংলাদেশ',
                'categoryEn' => $row['category_en'] ?? 'Bangladesh',
                'cardCategory' => $row['card_category'] ?? 'সারাদেশ । বাংলাদেশ',
                'cardCaption' => $row['image_caption'] ?? ($row['card_caption'] ?? 'ছবি: সংগৃহীত'),
                'imageUrl' => $row['featured_image'] ?? '',
                'featuredImage' => $row['featured_image'] ?? '',
                'galleryImages' => !empty($row['gallery_images']) ? (json_decode($row['gallery_images'], true) ?: []) : [],
                'author' => $row['author'] ?? 'মোঃ বিপ্লব হোসেন',
                'authorId' => $row['author_id'] ?? 'user-1',
                'authorAvatar' => $row['author_avatar'] ?? '',
                'reporterName' => $row['reporter_name'] ?? '',
                'readTime' => $row['read_time'] ?? '৪ মিনিট পড়তে',
                'isLeadHero' => !empty($row['is_lead_hero']),
                'isHighlighted' => !empty($row['is_highlighted']),
                'isBreaking' => !empty($row['is_breaking']),
                'isFeatured' => !empty($row['is_featured']),
                'isVideo' => !empty($row['is_video']),
                'youtubeUrl' => $row['youtube_url'] ?? '',
                'videoDuration' => $row['video_duration'] ?? '',
                'status' => $row['status'] ?? 'published',
                'statusNote' => $row['status_note'] ?? ($row['revision_note'] ?? ''),
                'views' => (int)($row['views'] ?? 0),
                'sharesCount' => (int)($row['shares_count'] ?? 0),
                'tags' => !empty($row['tags']) ? (json_decode($row['tags'], true) ?: $row['tags']) : [],
                'metaTitle' => $row['seo_title'] ?? ($row['meta_title'] ?? ''),
                'metaDesc' => $row['seo_description'] ?? ($row['meta_desc'] ?? ''),
                'seoKeywords' => $row['seo_keywords'] ?? ($row['focus_keyword'] ?? ''),
                'dateBn' => $row['date_bn'] ?? date('d M Y'),
                'dateEn' => $row['date_en'] ?? date('d M Y'),
                'createdAt' => $row['created_at'] ?? date('Y-m-d H:i:s'),
                'updatedAt' => $row['updated_at'] ?? date('Y-m-d H:i:s'),
                'publishedAt' => $row['published_at'] ?? ($row['created_at'] ?? date('Y-m-d H:i:s'))
            ];
        }, $rawArticles);

        echo json_encode([
            'success' => true,
            'table' => $tableName,
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

// -------------------------------------------------------------
// 2. POST: Create or Update News
// -------------------------------------------------------------
if ($method === 'POST') {
    try {
        if (!$pdo) {
            throw new Exception('ডাটাবেজ সংযোগ সক্রিয় নেই।');
        }

        $tableName = getNewsTableName($pdo);
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        if (!$data) {
            $data = $_POST;
        }

        $titleBn = trim($data['titleBn'] ?? ($data['title'] ?? ''));
        $titleEn = trim($data['titleEn'] ?? '');
        $kicker = trim($data['kicker'] ?? '');
        $subtitle = trim($data['subtitle'] ?? '');
        $contentBn = $data['contentBn'] ?? ($data['content'] ?? '');
        $contentEn = $data['contentEn'] ?? '';
        $excerptBn = $data['excerptBn'] ?? ($data['excerpt'] ?? $titleBn);
        $excerptEn = $data['excerptEn'] ?? '';
        $slug = trim($data['slug'] ?? '');
        $postId = trim($data['id'] ?? ($data['postId'] ?? ($data['post_id'] ?? '')));

        if (!$titleBn) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'সংবাদের শিরোনাম প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!$slug) {
            $slug = 'post-' . time() . '-' . rand(100, 999);
        }

        if (!$postId) {
            $postId = 'news-' . time() . '-' . rand(100, 999);
        }

        $categoryId = $data['category'] ?? ($data['categoryId'] ?? ($data['category_id'] ?? 'bangladesh'));
        $categoryBn = $data['categoryBn'] ?? ($data['category_bn'] ?? 'বাংলাদেশ');
        $categoryEn = $data['categoryEn'] ?? ($data['category_en'] ?? 'Bangladesh');
        $cardCategory = $data['cardCategory'] ?? ($data['card_category'] ?? 'সারাদেশ । বাংলাদেশ');
        $cardCaption = $data['imageCaption'] ?? ($data['cardCaption'] ?? ($data['card_caption'] ?? 'ছবি: সংগৃহীত'));
        $featuredImage = $data['imageUrl'] ?? ($data['featuredImage'] ?? ($data['featured_image'] ?? ''));
        $galleryImages = is_array($data['galleryImages'] ?? null) ? json_encode($data['galleryImages'], JSON_UNESCAPED_UNICODE) : null;
        $author = $data['author'] ?? 'মোঃ বিপ্লব হোসেন';
        $authorId = $data['authorId'] ?? ($data['author_id'] ?? 'user-1');
        $authorAvatar = $data['authorAvatar'] ?? ($data['author_avatar'] ?? '');
        $reporterName = $data['reporterName'] ?? ($data['reporter_name'] ?? '');
        $readTime = $data['readTime'] ?? ($data['read_time'] ?? '৪ মিনিট পড়তে');
        $status = $data['status'] ?? 'published';
        $statusNote = $data['statusNote'] ?? ($data['revisionNote'] ?? ($data['revision_note'] ?? null));
        $views = (int)($data['views'] ?? 0);
        $sharesCount = (int)($data['sharesCount'] ?? ($data['shares_count'] ?? 0));
        $isLeadHero = !empty($data['isLeadHero']) ? 1 : 0;
        $isBreaking = !empty($data['isBreaking']) ? 1 : 0;
        $isFeatured = !empty($data['isFeatured']) || !empty($data['isHighlighted']) ? 1 : 0;
        $isVideo = !empty($data['isVideo']) ? 1 : 0;
        $youtubeUrl = $data['youtubeUrl'] ?? ($data['youtube_url'] ?? '');
        $videoDuration = $data['videoDuration'] ?? ($data['video_duration'] ?? null);
        $tags = is_array($data['tags'] ?? null) ? json_encode($data['tags'], JSON_UNESCAPED_UNICODE) : ($data['tags'] ?? '');
        $seoTitle = $data['metaTitle'] ?? ($data['seo_title'] ?? $titleBn);
        $seoDesc = $data['metaDesc'] ?? ($data['seo_description'] ?? $excerptBn);
        $seoKeywords = $data['focusKeyword'] ?? ($data['seo_keywords'] ?? '');

        if ($tableName === 'news_posts') {
            // Check if exists
            $checkStmt = $pdo->prepare("SELECT `id` FROM `news_posts` WHERE `post_id` = ? OR `slug` = ? LIMIT 1");
            $checkStmt->execute([$postId, $slug]);
            $existing = $checkStmt->fetch();

            if ($existing) {
                $updateSql = "
                    UPDATE `news_posts` SET
                        `title_bn` = ?,
                        `title_en` = ?,
                        `kicker` = ?,
                        `subtitle` = ?,
                        `excerpt_bn` = ?,
                        `excerpt_en` = ?,
                        `content_bn` = ?,
                        `content_en` = ?,
                        `category_id` = ?,
                        `category_bn` = ?,
                        `category_en` = ?,
                        `card_category` = ?,
                        `image_caption` = ?,
                        `featured_image` = ?,
                        `gallery_images` = ?,
                        `author` = ?,
                        `author_id` = ?,
                        `author_avatar` = ?,
                        `reporter_name` = ?,
                        `read_time` = ?,
                        `is_lead_hero` = ?,
                        `is_breaking` = ?,
                        `is_featured` = ?,
                        `is_video` = ?,
                        `youtube_url` = ?,
                        `video_duration` = ?,
                        `status` = ?,
                        `status_note` = ?,
                        `seo_title` = ?,
                        `seo_description` = ?,
                        `seo_keywords` = ?
                    WHERE `id` = ?
                ";
                $stmt = $pdo->prepare($updateSql);
                $stmt->execute([
                    $titleBn, $titleEn, $kicker, $subtitle, $excerptBn, $excerptEn,
                    $contentBn, $contentEn, $categoryId, $categoryBn, $categoryEn,
                    $cardCategory, $cardCaption, $featuredImage, $galleryImages,
                    $author, $authorId, $authorAvatar, $reporterName, $readTime,
                    $isLeadHero, $isBreaking, $isFeatured, $isVideo, $youtubeUrl,
                    $videoDuration, $status, $statusNote, $seoTitle, $seoDesc,
                    $seoKeywords, $existing['id']
                ]);
                $dbId = $existing['id'];
                $msg = 'সংবাদটি cPanel MariaDB (`news_posts`) টেবিলে সফলভাবে আপডেট হয়েছে!';
            } else {
                $insertSql = "
                    INSERT INTO `news_posts` (
                        `post_id`, `slug`, `title_bn`, `title_en`, `kicker`, `subtitle`,
                        `excerpt_bn`, `excerpt_en`, `content_bn`, `content_en`, `category_id`,
                        `category_bn`, `category_en`, `card_category`, `image_caption`,
                        `featured_image`, `gallery_images`, `author`, `author_id`, `author_avatar`,
                        `reporter_name`, `read_time`, `is_lead_hero`, `is_breaking`, `is_featured`,
                        `is_video`, `youtube_url`, `video_duration`, `status`, `status_note`,
                        `views`, `shares_count`, `seo_title`, `seo_description`, `seo_keywords`
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?
                    )
                ";
                $stmt = $pdo->prepare($insertSql);
                $stmt->execute([
                    $postId, $slug, $titleBn, $titleEn, $kicker, $subtitle,
                    $excerptBn, $excerptEn, $contentBn, $contentEn, $categoryId,
                    $categoryBn, $categoryEn, $cardCategory, $cardCaption,
                    $featuredImage, $galleryImages, $author, $authorId, $authorAvatar,
                    $reporterName, $readTime, $isLeadHero, $isBreaking, $isFeatured,
                    $isVideo, $youtubeUrl, $videoDuration, $status, $statusNote,
                    $views, $sharesCount, $seoTitle, $seoDesc, $seoKeywords
                ]);
                $dbId = $pdo->lastInsertId();
                $msg = 'সংবাদটি cPanel MariaDB (`news_posts`) টেবিলে সফলভাবে সংরক্ষিত হয়েছে!';
            }
        } else {
            // Legacy `news` table fallback
            $checkStmt = $pdo->prepare("SELECT `id` FROM `news` WHERE `post_id` = ? OR `slug` = ? LIMIT 1");
            $checkStmt->execute([$postId, $slug]);
            $existing = $checkStmt->fetch();

            if ($existing) {
                $stmt = $pdo->prepare("UPDATE `news` SET `title` = ?, `slug` = ?, `content` = ?, `excerpt` = ?, `featured_image` = ?, `status` = ?, `category_id` = ? WHERE `id` = ?");
                $stmt->execute([$titleBn, $slug, $contentBn, $excerptBn, $featuredImage, $status, $categoryId, $existing['id']]);
                $dbId = $existing['id'];
                $msg = 'সংবাদটি MariaDB টেবিলে আপডেট হয়েছে!';
            } else {
                $stmt = $pdo->prepare("INSERT INTO `news` (`post_id`, `slug`, `title`, `content`, `excerpt`, `featured_image`, `status`, `category_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$postId, $slug, $titleBn, $contentBn, $excerptBn, $featuredImage, $status, $categoryId]);
                $dbId = $pdo->lastInsertId();
                $msg = 'সংবাদটি MariaDB টেবিলে সংরক্ষিত হয়েছে!';
            }
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

// -------------------------------------------------------------
// 3. DELETE: Remove News Article
// -------------------------------------------------------------
if ($method === 'DELETE') {
    try {
        if (!$pdo) {
            throw new Exception('ডাটাবেজ সংযোগ সক্রিয় নেই।');
        }

        $tableName = getNewsTableName($pdo);
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'পোস্ট আইডি প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM `{$tableName}` WHERE `id` = ? OR `post_id` = ?");
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
