<?php
/**
 * Jonogon News (জনগণ.নিউজ) - Bulletproof News CRUD REST API for MariaDB / cPanel
 * Target Table: `news_posts` (Auto-migrating UTF-8 Multi-language Schema)
 */
ini_set('memory_limit', '1024M');
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

// -------------------------------------------------------------
// HELPER: Auto-detect active table (Fast, cached, no DDL overhead)
// -------------------------------------------------------------
function getAndEnsureNewsTable($pdo) {
    return 'news_posts';
}

function normalizeNewsImageUrl($url) {
    if (!$url || !is_string($url)) return '';
    $url = trim($url);
    if (strpos($url, 'backblazeb2.com') !== false) {
        if (preg_match('#(uploads/\d{4}/\d{2}/[^?\&"\']+)#', $url, $m)) {
            return 'https://jonogon.news/' . $m[1];
        }
    }
    return $url;
}

// -------------------------------------------------------------
// 1. GET: Fetch News Articles (Optimized Query & Caching)
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        if (!$pdo) {
            throw new Exception('MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই: ' . ($dbError ?? 'Unknown error'));
        }

        // Fast caching header for public queries
        header('Cache-Control: public, max-age=15, stale-while-revalidate=60');

        $tableName = getAndEnsureNewsTable($pdo);
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;
        $postId = isset($_GET['id']) ? trim($_GET['id']) : null;
        $full = isset($_GET['full']) && $_GET['full'] === '1';

        // Select full content only for single post or when explicitly requested
        $isSingle = !empty($postId) || !empty($slug);
        if ($isSingle || $full) {
            $cols = "*";
        } else {
            // Optimized lightweight card fields (omits huge content_bn, content_en, and blocks JSON)
            $cols = "`id`, `post_id`, `slug`, `title_bn`, `title_en`, `kicker`, `subtitle`, `excerpt_bn`, `excerpt_en`, `category_id`, `category_bn`, `category_en`, `categories`, `card_category`, `card_image_position`, `image_caption`, `featured_image`, `gallery_images`, `author`, `author_id`, `author_avatar`, `reporter_name`, `read_time`, `is_lead_hero`, `is_highlighted`, `is_breaking`, `is_featured`, `is_video`, `youtube_url`, `video_duration`, `status`, `status_note`, `views`, `shares_count`, `tags`, `seo_title`, `seo_description`, `seo_keywords`, `created_at`, `updated_at`, `published_at`";
        }

        $query = "SELECT {$cols} FROM `{$tableName}` WHERE 1=1";
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

        $articles = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $parsedBlocks = [];
            if (!empty($row['blocks'])) {
                if (is_array($row['blocks'])) {
                    $parsedBlocks = $row['blocks'];
                } else {
                    $decoded = json_decode($row['blocks'], true);
                    $parsedBlocks = is_array($decoded) ? $decoded : [];
                }
            }

            $featuredImg = normalizeNewsImageUrl($row['featured_image'] ?? ($row['thumbnail_image'] ?? ''));

            $articles[] = [
                'id' => $row['post_id'] ?? ('news-' . ($row['id'] ?? uniqid())),
                'db_id' => (int)($row['id'] ?? 0),
                'postId' => $row['post_id'] ?? '',
                'post_id' => $row['post_id'] ?? '',
                'slug' => $row['slug'] ?? '',
                'title' => $row['title_bn'] ?? ($row['title'] ?? ''),
                'titleBn' => $row['title_bn'] ?? ($row['title'] ?? ''),
                'titleEn' => $row['title_en'] ?? ($row['title_bn'] ?? ($row['title'] ?? '')),
                'kicker' => $row['kicker'] ?? '',
                'subtitle' => $row['subtitle'] ?? '',
                'content' => $row['content_bn'] ?? ($row['content'] ?? ''),
                'contentBn' => $row['content_bn'] ?? ($row['content'] ?? ''),
                'contentEn' => $row['content_en'] ?? '',
                'excerpt' => $row['excerpt_bn'] ?? ($row['excerpt'] ?? ''),
                'excerptBn' => $row['excerpt_bn'] ?? ($row['excerpt'] ?? ''),
                'excerptEn' => $row['excerpt_en'] ?? '',
                'blocks' => $parsedBlocks,
                'category' => $row['category_id'] ?? 'bangladesh',
                'categoryId' => $row['category_id'] ?? 'bangladesh',
                'categoryBn' => $row['category_bn'] ?? 'বাংলাদেশ',
                'categoryEn' => $row['category_en'] ?? 'Bangladesh',
                'categories' => !empty($row['categories']) ? (is_array($row['categories']) ? $row['categories'] : json_decode($row['categories'], true)) : [$row['category_id'] ?? 'bangladesh'],
                'cardCategory' => $row['card_category'] ?? ($row['category_bn'] ?? 'সারাদেশ । বাংলাদেশ'),
                'cardImagePosition' => $row['card_image_position'] ?? 'center center',
                'cardTitleFontSize' => isset($row['card_title_font_size']) && $row['card_title_font_size'] ? (int)$row['card_title_font_size'] : 24,
                'cardKickerFontSize' => isset($row['card_kicker_font_size']) && $row['card_kicker_font_size'] ? (int)$row['card_kicker_font_size'] : 15,
                'cardColorMode' => $row['card_color_mode'] ?? 'dual',
                'cardManualLineBreak' => $row['card_manual_line_break'] ?? '',
                'cardCaption' => $row['card_caption'] ?? ($row['image_caption'] ?? 'ছবি: সংগৃহীত'),
                'imageUrl' => $featuredImg,
                'featuredImage' => $featuredImg,
                'thumbnail_image' => $featuredImg,
                'galleryImages' => !empty($row['gallery_images']) ? (is_array($row['gallery_images']) ? $row['gallery_images'] : json_decode($row['gallery_images'], true)) : [],
                'author' => $row['author'] ?? 'জনগণ নিউজ ডেস্ক',
                'authorId' => $row['author_id'] ?? 'user-1',
                'authorAvatar' => $row['author_avatar'] ?? '',
                'reporterName' => $row['reporter_name'] ?? '',
                'readTime' => $row['read_time'] ?? '৪ মিনিট পড়তে',
                'status' => $row['status'] ?? 'published',
                'statusNote' => $row['status_note'] ?? ($row['revision_note'] ?? ''),
                'views' => (int)($row['views'] ?? 0),
                'sharesCount' => (int)($row['shares_count'] ?? 0),
                'isLeadHero' => !empty($row['is_lead_hero']) ? true : false,
                'isHighlighted' => !empty($row['is_highlighted']) ? true : false,
                'isBreaking' => !empty($row['is_breaking']) ? true : false,
                'isFeatured' => !empty($row['is_featured']) ? true : false,
                'isVideo' => !empty($row['is_video']) ? true : false,
                'youtubeUrl' => $row['youtube_url'] ?? '',
                'videoDuration' => $row['video_duration'] ?? '',
                'tags' => !empty($row['tags']) ? (is_array($row['tags']) ? $row['tags'] : (json_decode($row['tags'], true) ?: $row['tags'])) : [],
                'metaTitle' => $row['seo_title'] ?? ($row['meta_title'] ?? ''),
                'metaDesc' => $row['seo_description'] ?? ($row['meta_desc'] ?? ''),
                'seoKeywords' => $row['seo_keywords'] ?? ($row['focus_keyword'] ?? ''),
                'dateBn' => $row['date_bn'] ?? date('d M Y', strtotime($row['created_at'] ?? 'now')),
                'dateEn' => $row['date_en'] ?? date('d M Y', strtotime($row['created_at'] ?? 'now')),
                'createdAt' => $row['created_at'] ?? date('Y-m-d H:i:s'),
                'updatedAt' => $row['updated_at'] ?? date('Y-m-d H:i:s'),
                'publishedAt' => $row['published_at'] ?? ($row['created_at'] ?? date('Y-m-d H:i:s'))
            ];
        }
        $stmt = null;

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
// 2. DELETE: Remove News Article (Checked before POST create)
// -------------------------------------------------------------
$rawDeleteInput = file_get_contents('php://input');
$deletePayload = json_decode($rawDeleteInput, true) ?: [];
$deleteAction = $_GET['action'] ?? ($deletePayload['action'] ?? '');

if ($method === 'DELETE' || ($method === 'POST' && in_array($deleteAction, ['delete', 'delete_post', 'remove']))) {
    try {
        if (!$pdo) {
            throw new Exception('MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই: ' . ($dbError ?? 'Unknown error'));
        }

        $tableName = getAndEnsureNewsTable($pdo);
        $id = $_GET['id'] ?? ($deletePayload['id'] ?? ($deletePayload['post_id'] ?? null));
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'পোস্ট আইডি প্রয়োজন।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Direct, instant MariaDB deletion as in 29fbdf3
        $stmt = $pdo->prepare("DELETE FROM `{$tableName}` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?");
        $stmt->execute([$id, $id, $id]);

        // Also clean up from legacy news table if present
        try {
            $pdo->prepare("DELETE FROM `news` WHERE `id` = ? OR `post_id` = ? OR `slug` = ?")->execute([$id, $id, $id]);
        } catch (Exception $e) {}

        // Non-blocking B2 asset cleanup (isolated try/catch so B2 never blocks DB deletion)
        try {
            if (file_exists(__DIR__ . '/b2_storage.php')) {
                require_once __DIR__ . '/b2_storage.php';
                if (function_exists('deletePostAssetsAndRecord')) {
                    deletePostAssetsAndRecord($pdo, $id);
                }
            }
        } catch (Exception $b2Ex) {}

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

// -------------------------------------------------------------
// 3. POST: Create or Update News
// -------------------------------------------------------------
if ($method === 'POST') {
    try {
        if (!$pdo) {
            throw new Exception('MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই: ' . ($dbError ?? 'Unknown error'));
        }

        $tableName = getAndEnsureNewsTable($pdo);
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        if (!$data) {
            $data = $_POST;
        }

        $titleBn = trim($data['titleBn'] ?? ($data['title_bn'] ?? ($data['title'] ?? '')));
        $titleEn = trim($data['titleEn'] ?? ($data['title_en'] ?? ''));
        $kicker = trim($data['kicker'] ?? '');
        $subtitle = trim($data['subtitle'] ?? '');
        $contentBn = $data['contentBn'] ?? ($data['content_bn'] ?? ($data['content'] ?? ''));
        $contentEn = $data['contentEn'] ?? ($data['content_en'] ?? '');
        $excerptBn = $data['excerptBn'] ?? ($data['excerpt_bn'] ?? ($data['excerpt'] ?? $titleBn));
        $excerptEn = $data['excerptEn'] ?? ($data['excerpt_en'] ?? '');
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

        $blocks = is_array($data['blocks'] ?? null) ? json_encode($data['blocks'], JSON_UNESCAPED_UNICODE) : ($data['blocks'] ?? null);
        $categories = is_array($data['categories'] ?? null) ? json_encode($data['categories'], JSON_UNESCAPED_UNICODE) : null;
        $categoryId = $data['category'] ?? ($data['categoryId'] ?? ($data['category_id'] ?? 'bangladesh'));
        $categoryBn = $data['categoryBn'] ?? ($data['category_bn'] ?? 'বাংলাদেশ');
        $categoryEn = $data['categoryEn'] ?? ($data['category_en'] ?? 'Bangladesh');
        $cardCategory = $data['cardCategory'] ?? ($data['card_category'] ?? 'সারাদেশ । বাংলাদেশ');
        $cardCaption = $data['imageCaption'] ?? ($data['cardCaption'] ?? ($data['card_caption'] ?? 'ছবি: সংগৃহীত'));
        $featuredImage = $data['imageUrl'] ?? ($data['featuredImage'] ?? ($data['featured_image'] ?? ''));
        $galleryImages = is_array($data['galleryImages'] ?? null) ? json_encode($data['galleryImages'], JSON_UNESCAPED_UNICODE) : null;
        $author = $data['author'] ?? 'জনগণ নিউজ ডেস্ক';
        $authorId = $data['authorId'] ?? ($data['author_id'] ?? 'user-1');
        $authorAvatar = $data['authorAvatar'] ?? ($data['author_avatar'] ?? '');
        $reporterName = $data['reporterName'] ?? ($data['reporter_name'] ?? '');
        $readTime = $data['readTime'] ?? ($data['read_time'] ?? '৪ মিনিট পড়তে');
        $status = strtolower($data['status'] ?? 'published');
        $statusNote = $data['statusNote'] ?? ($data['revisionNote'] ?? ($data['revision_note'] ?? null));
        $views = (int)($data['views'] ?? 0);
        $sharesCount = (int)($data['sharesCount'] ?? ($data['shares_count'] ?? 0));
        $isLeadHero = !empty($data['isLeadHero']) ? 1 : 0;
        $isBreaking = !empty($data['isBreaking']) ? 1 : 0;
        $isFeatured = !empty($data['isFeatured']) || !empty($data['isHighlighted']) ? 1 : 0;
        $isHighlighted = !empty($data['isHighlighted']) ? 1 : 0;
        $isVideo = !empty($data['isVideo']) ? 1 : 0;
        $youtubeUrl = $data['youtubeUrl'] ?? ($data['youtube_url'] ?? '');
        $videoDuration = $data['videoDuration'] ?? ($data['video_duration'] ?? null);
        $tags = is_array($data['tags'] ?? null) ? json_encode($data['tags'], JSON_UNESCAPED_UNICODE) : ($data['tags'] ?? '');
        $seoTitle = $data['metaTitle'] ?? ($data['seo_title'] ?? $titleBn);
        $seoDesc = $data['metaDesc'] ?? ($data['seo_description'] ?? $excerptBn);
        $seoKeywords = $data['focusKeyword'] ?? ($data['seo_keywords'] ?? '');

        // Fetch actual table columns to dynamically adapt query
        $colStmt = $pdo->query("SHOW COLUMNS FROM `{$tableName}`");
        $colsMap = [];
        while ($c = $colStmt->fetch(PDO::FETCH_ASSOC)) {
            $colsMap[strtolower($c['Field'])] = true;
        }

        // Map all candidate fields
        $fieldsPayload = [
            'post_id' => $postId,
            'slug' => $slug,
            'title_bn' => $titleBn,
            'title_en' => $titleEn,
            'title' => $titleBn,
            'kicker' => $kicker,
            'subtitle' => $subtitle,
            'excerpt_bn' => $excerptBn,
            'excerpt_en' => $excerptEn,
            'excerpt' => $excerptBn,
            'content_bn' => $contentBn,
            'content_en' => $contentEn,
            'content' => $contentBn,
            'blocks' => $blocks,
            'category_id' => $categoryId,
            'category_bn' => $categoryBn,
            'category_en' => $categoryEn,
            'categories' => $categories,
            'card_category' => $cardCategory,
            'card_image_position' => $data['cardImagePosition'] ?? ($data['card_image_position'] ?? ($data['imagePosition'] ?? 'center center')),
            'card_title_font_size' => isset($data['cardTitleFontSize']) ? (int)$data['cardTitleFontSize'] : (isset($data['card_title_font_size']) ? (int)$data['card_title_font_size'] : 24),
            'card_kicker_font_size' => isset($data['cardKickerFontSize']) ? (int)$data['cardKickerFontSize'] : (isset($data['card_kicker_font_size']) ? (int)$data['card_kicker_font_size'] : 15),
            'card_color_mode' => $data['cardColorMode'] ?? ($data['card_color_mode'] ?? 'dual'),
            'card_manual_line_break' => $data['cardManualLineBreak'] ?? ($data['card_manual_line_break'] ?? ''),
            'image_caption' => $cardCaption,
            'card_caption' => $cardCaption,
            'featured_image' => $featuredImage,
            'thumbnail_image' => $featuredImage,
            'gallery_images' => $galleryImages,
            'author' => $author,
            'author_id' => $authorId,
            'author_avatar' => $authorAvatar,
            'reporter_name' => $reporterName,
            'read_time' => $readTime,
            'is_lead_hero' => $isLeadHero,
            'is_highlighted' => $isHighlighted,
            'is_breaking' => $isBreaking,
            'is_featured' => $isFeatured,
            'is_video' => $isVideo,
            'youtube_url' => $youtubeUrl,
            'video_duration' => $videoDuration,
            'status' => $status,
            'status_note' => $statusNote,
            'views' => $views,
            'shares_count' => $sharesCount,
            'tags' => $tags,
            'seo_title' => $seoTitle,
            'seo_description' => $seoDesc,
            'seo_keywords' => $seoKeywords
        ];

        // Filter only existing columns
        $validFields = [];
        foreach ($fieldsPayload as $key => $val) {
            if (isset($colsMap[strtolower($key)])) {
                $validFields[$key] = $val;
            }
        }

        // Check if row already exists
        $checkStmt = $pdo->prepare("SELECT `id` FROM `{$tableName}` WHERE `post_id` = ? OR `slug` = ? LIMIT 1");
        $checkStmt->execute([$postId, $slug]);
        $existing = $checkStmt->fetch();

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
            $stmt = $pdo->prepare($updateSql);
            $stmt->execute($values);
            $dbId = $existing['id'];
            $msg = "সংবাদটি cPanel MariaDB (`{$tableName}`) টেবিলে সফলভাবে আপডেট হয়েছে!";
        } else {
            $colNames = array_keys($validFields);
            $placeholders = array_fill(0, count($colNames), '?');
            $values = array_values($validFields);

            $insertSql = "INSERT INTO `{$tableName}` (" . implode(', ', array_map(fn($k) => "`$k`", $colNames)) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $pdo->prepare($insertSql);
            $stmt->execute($values);
            $dbId = $pdo->lastInsertId();
            $msg = "সংবাদটি cPanel MariaDB (`{$tableName}`) টেবিলে সফলভাবে সংরক্ষিত হয়েছে!";
        }

        // Also update/mirror into legacy news table if it exists
        try {
            $checkNewsTable = $pdo->query("SHOW TABLES LIKE 'news'");
            if ($checkNewsTable && $checkNewsTable->rowCount() > 0 && $tableName !== 'news') {
                $newsColsStmt = $pdo->query("SHOW COLUMNS FROM `news`");
                $newsColsMap = [];
                while ($nc = $newsColsStmt->fetch(PDO::FETCH_ASSOC)) {
                    $newsColsMap[strtolower($nc['Field'])] = true;
                }
                $validNewsFields = [];
                foreach ($fieldsPayload as $k => $v) {
                    if (isset($newsColsMap[strtolower($k)])) {
                        $validNewsFields[$k] = $v;
                    }
                }
                $checkExistingNews = $pdo->prepare("SELECT `id` FROM `news` WHERE `post_id` = ? OR `slug` = ? LIMIT 1");
                $checkExistingNews->execute([$postId, $slug]);
                $exNews = $checkExistingNews->fetch();
                if ($exNews) {
                    $nSets = [];
                    $nVals = [];
                    foreach ($validNewsFields as $k => $v) {
                        if ($k !== 'id') {
                            $nSets[] = "`{$k}` = ?";
                            $nVals[] = $v;
                        }
                    }
                    $nVals[] = $exNews['id'];
                    $pdo->prepare("UPDATE `news` SET " . implode(', ', $nSets) . " WHERE `id` = ?")->execute($nVals);
                } else {
                    $nCols = array_keys($validNewsFields);
                    $nPlc = array_fill(0, count($nCols), '?');
                    $pdo->prepare("INSERT INTO `news` (" . implode(', ', array_map(fn($k) => "`$k`", $nCols)) . ") VALUES (" . implode(', ', $nPlc) . ")")->execute(array_values($validNewsFields));
                }
            }
        } catch (Exception $mirrorEx) {}

        echo json_encode([
            'success' => true,
            'message' => $msg,
            'table' => $tableName,
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
