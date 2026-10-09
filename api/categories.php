<?php
/**
 * Janogon News - Categories API
 * Fetches all categories from MariaDB `categories` table.
 * Supports GET (list all categories) and POST (create/update category).
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

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// -------------------------------------------------------------
// 1. GET: LIST ALL CATEGORIES FROM MARIADB
// -------------------------------------------------------------
if ($requestMethod === 'GET') {
    try {
        if ($pdo) {
            $stmt = $pdo->query("SELECT `id`, `name`, `name_bn`, `name_en`, `slug`, `created_at` FROM `categories` ORDER BY `id` ASC");
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($categories)) {
                echo json_encode([
                    'success' => true,
                    'total' => count($categories),
                    'source' => 'mariadb',
                    'data' => $categories
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        // If table is empty, return empty success response
        echo json_encode([
            'success' => true,
            'total' => 0,
            'source' => 'empty',
            'data' => []
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'ক্যাটাগরি ফেচ করতে ব্যর্থ: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 2. POST: CREATE OR UPDATE CATEGORY
// -------------------------------------------------------------
if ($requestMethod === 'POST') {
    try {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true) ?: $_POST;

        $name = trim($input['name'] ?? ($input['name_bn'] ?? ''));
        $nameBn = trim($input['name_bn'] ?? $name);
        $nameEn = trim($input['name_en'] ?? ($input['slug'] ?? ''));
        $slug = trim($input['slug'] ?? '');

        if (!$name) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ক্যাটাগরির নাম আবশ্যক।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!$slug) {
            $slug = preg_replace('/[^a-zA-Z0-9_-]/', '-', strtolower($nameEn ?: $name));
            $slug = trim(preg_replace('/-+/', '-', $slug), '-');
        }

        if ($pdo) {
            $stmt = $pdo->prepare("
                INSERT INTO `categories` (`name`, `name_bn`, `name_en`, `slug`)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `name_bn` = VALUES(`name_bn`), `name_en` = VALUES(`name_en`)
            ");
            $stmt->execute([$name, $nameBn, $nameEn, $slug]);
            $newId = $pdo->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'ক্যাটাগরি সফলভাবে সংরক্ষিত হয়েছে।',
                'data' => [
                    'id' => $newId ?: $slug,
                    'name' => $name,
                    'name_bn' => $nameBn,
                    'name_en' => $nameEn,
                    'slug' => $slug
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        throw new Exception('ডাটাবেজ কানেকশন সক্রিয় নেই।');

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'ক্যাটাগরি সেভ করতে ব্যর্থ: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
