<?php
/**
 * Janogon News - Article Reader Comments API
 * Stores and fetches reader comments from MariaDB `article_comments` table.
 * Supports:
 *   - GET  ?post_id=<id|slug>    : Fetch approved comments for an article
 *   - POST { post_id, name, text, email } : Submit new reader comment
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function convertDigitsToBn($number) {
    $bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    $en = ['0','1','2','3','4','5','6','7','8','9'];
    return str_replace($en, $bn, (string)$number);
}

function formatRelativeDateBn($datetimeStr) {
    if (!$datetimeStr) return 'এইমাত্র';
    $time = strtotime($datetimeStr);
    $now = time();
    $diff = $now - $time;

    if ($diff < 60) {
        return 'এইমাত্র';
    }
    if ($diff < 3600) {
        $mins = floor($diff / 60);
        return convertDigitsToBn($mins) . ' মিনিট আগে';
    }
    if ($diff < 86400) {
        $hours = floor($diff / 3600);
        return convertDigitsToBn($hours) . ' ঘণ্টা আগে';
    }
    if ($diff < 172800) {
        return 'গতকাল, ' . date('h:i A', $time);
    }

    $bnMonths = [
        1 => 'জানুয়ারি', 2 => 'ফেব্রুয়ারি', 3 => 'মার্চ', 4 => 'এপ্রিল',
        5 => 'মে', 6 => 'জুন', 7 => 'জুলাই', 8 => 'আগস্ট',
        9 => 'সেপ্টেম্বর', 10 => 'অক্টোবর', 11 => 'নভেম্বর', 12 => 'ডিসেম্বর'
    ];
    $day = convertDigitsToBn(date('j', $time));
    $m = (int)date('n', $time);
    $month = $bnMonths[$m] ?? '';
    $year = convertDigitsToBn(date('Y', $time));
    return "{$day} {$month} {$year}";
}

function formatRelativeDateEn($datetimeStr) {
    if (!$datetimeStr) return 'Just now';
    $time = strtotime($datetimeStr);
    $diff = time() - $time;

    if ($diff < 60) return 'Just now';
    if ($diff < 3600) return floor($diff / 60) . ' mins ago';
    if ($diff < 86400) return floor($diff / 3600) . ' hours ago';
    if ($diff < 172800) return 'Yesterday, ' . date('h:i A', $time);
    return date('d M Y', $time);
}

function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// -------------------------------------------------------------------------
// 1. GET: FETCH COMMENTS FOR AN ARTICLE (OR ALL COMMENTS FOR ADMIN)
// -------------------------------------------------------------------------
if ($method === 'GET') {
    $postId = trim($_GET['post_id'] ?? $_GET['article_id'] ?? '');

    try {
        if (!$pdo) {
            throw new Exception("Database connection is not available.");
        }

        // If no post_id specified, return recent approved comments (or limit 100)
        if (empty($postId)) {
            $stmt = $pdo->query("SELECT `id`, `post_id`, `user_name`, `user_email`, `comment_text`, `status`, `created_at` 
                                  FROM `article_comments` 
                                  WHERE `status` = 'approved' 
                                  ORDER BY `id` DESC LIMIT 50");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            // Find all identifiers that could belong to this post (id, post_id, slug)
            $possibleIds = [$postId];
            try {
                $checkPost = $pdo->prepare("SELECT id, post_id, slug FROM news_posts WHERE id = ? OR post_id = ? OR slug = ? LIMIT 1");
                $checkPost->execute([$postId, $postId, $postId]);
                $postData = $checkPost->fetch(PDO::FETCH_ASSOC);
                if ($postData) {
                    if (!empty($postData['id'])) $possibleIds[] = (string)$postData['id'];
                    if (!empty($postData['post_id'])) $possibleIds[] = (string)$postData['post_id'];
                    if (!empty($postData['slug'])) $possibleIds[] = (string)$postData['slug'];
                }
            } catch (Exception $e) {}

            $possibleIds = array_values(array_unique(array_filter($possibleIds)));
            $placeholders = implode(',', array_fill(0, count($possibleIds), '?'));

            $stmt = $pdo->prepare("SELECT `id`, `post_id`, `user_name`, `user_email`, `comment_text`, `status`, `created_at` 
                                   FROM `article_comments` 
                                   WHERE `post_id` IN ($placeholders) AND `status` = 'approved' 
                                   ORDER BY `id` DESC");
            $stmt->execute($possibleIds);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $formattedComments = array_map(function($row) {
            return [
                'id' => (string)$row['id'],
                'post_id' => $row['post_id'],
                'name' => htmlspecialchars_decode($row['user_name'], ENT_QUOTES),
                'email' => $row['user_email'] ? htmlspecialchars_decode($row['user_email'], ENT_QUOTES) : '',
                'text' => htmlspecialchars_decode($row['comment_text'], ENT_QUOTES),
                'status' => $row['status'],
                'date' => formatRelativeDateBn($row['created_at']),
                'date_en' => formatRelativeDateEn($row['created_at']),
                'created_at' => $row['created_at']
            ];
        }, $rows);

        echo json_encode([
            'success' => true,
            'count' => count($formattedComments),
            'comments' => $formattedComments
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'মন্তব্য আনতে সমস্যা হয়েছে: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------------------
// 2. POST: SUBMIT A NEW COMMENT
// -------------------------------------------------------------------------
if ($method === 'POST') {
    // Parse JSON body or $_POST
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = $_POST;
    }

    $postId = trim($input['post_id'] ?? $input['article_id'] ?? '');
    $name = trim($input['name'] ?? $input['user_name'] ?? '');
    $email = trim($input['email'] ?? $input['user_email'] ?? '');
    $text = trim($input['text'] ?? $input['comment'] ?? $input['comment_text'] ?? '');

    if (empty($postId)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'সংবাদের আইডি (post_id) প্রয়োজন।'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($name)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'দয়া করে আপনার নাম লিখুন।'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($text)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'দয়া করে আপনার মন্তব্য লিখুন।'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        if (!$pdo) {
            throw new Exception("Database connection is not available.");
        }

        // Canonical post_id normalization: if exists in news_posts, use post_id or id
        $canonicalPostId = $postId;
        try {
            $checkPost = $pdo->prepare("SELECT id, post_id, slug FROM news_posts WHERE id = ? OR post_id = ? OR slug = ? LIMIT 1");
            $checkPost->execute([$postId, $postId, $postId]);
            $postData = $checkPost->fetch(PDO::FETCH_ASSOC);
            if ($postData) {
                $canonicalPostId = $postData['post_id'] ?: (string)$postData['id'];
            }
        } catch (Exception $e) {}

        $cleanName = htmlspecialchars(strip_tags(mb_substr($name, 0, 150)), ENT_QUOTES, 'UTF-8');
        $cleanEmail = !empty($email) ? htmlspecialchars(strip_tags(mb_substr($email, 0, 150)), ENT_QUOTES, 'UTF-8') : null;
        $cleanText = htmlspecialchars(strip_tags($text), ENT_QUOTES, 'UTF-8');
        $clientIp = getClientIP();

        $stmt = $pdo->prepare("INSERT INTO `article_comments` (`post_id`, `user_name`, `user_email`, `comment_text`, `status`, `ip_address`, `created_at`) 
                               VALUES (?, ?, ?, ?, 'approved', ?, NOW())");
        $stmt->execute([$canonicalPostId, $cleanName, $cleanEmail, $cleanText, $clientIp]);
        $newId = $pdo->lastInsertId();

        $now = date('Y-m-d H:i:s');
        $newComment = [
            'id' => (string)$newId,
            'post_id' => $canonicalPostId,
            'name' => htmlspecialchars_decode($cleanName, ENT_QUOTES),
            'email' => $cleanEmail ? htmlspecialchars_decode($cleanEmail, ENT_QUOTES) : '',
            'text' => htmlspecialchars_decode($cleanText, ENT_QUOTES),
            'status' => 'approved',
            'date' => 'এইমাত্র',
            'date_en' => 'Just now',
            'created_at' => $now
        ];

        echo json_encode([
            'success' => true,
            'message' => 'আপনার মন্তব্য সফলভাবে জমা হয়েছে!',
            'comment' => $newComment
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'মন্তব্য সংরক্ষণ করতে ত্রুটি হয়েছে: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------------------
// 3. DELETE (OPTIONAL ADMIN REMOVAL)
// -------------------------------------------------------------------------
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid comment ID.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM `article_comments` WHERE `id` = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'মন্তব্য মুছে ফেলা হয়েছে।'], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
