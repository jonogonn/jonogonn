<?php
/**
 * Janogon News - Media Library & Asset Archive API
 * 1. GET: Fetch all uploaded media assets and metadata
 * 2. GET ?action=download_zip: Generate and stream a complete ZIP archive of all media files
 * 3. DELETE: Delete media asset from database/storage
 */

require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

// -------------------------------------------------------------
// 1. GENERATE & DOWNLOAD BULK ZIP ARCHIVE
// -------------------------------------------------------------
if ($action === 'download_zip') {
    try {
        // Fetch all actual uploaded media items
        $mediaItems = [];
        if ($pdo) {
            $stmt = $pdo->query("SELECT `id`, `original_name`, `storage_key`, `public_url`, `file_format` FROM `media_uploads` ORDER BY `id` DESC");
            $mediaItems = $stmt->fetchAll();
        }

        if (empty($mediaItems)) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'কোনো ছবি পাওয়া যায়নি।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Create Temporary Zip File
        $zipFileName = 'jonogon_media_archive_' . date('Y-m-d_His') . '.zip';
        $tempZipPath = sys_get_temp_dir() . '/' . $zipFileName;

        $zip = new ZipArchive();
        if ($zip->open($tempZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'ZIP ফাইল তৈরি করতে সমস্যা হয়েছে।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $addedCount = 0;
        foreach ($mediaItems as $item) {
            $url = $item['public_url'] ?? '';
            $storageKey = $item['storage_key'] ?? ('uploads/' . ($item['original_name'] ?? 'image.webp'));
            $zipEntryPath = ltrim($storageKey, '/\\');

            // 1. Try local file path first
            $localPath = __DIR__ . '/../' . ltrim($storageKey, '/\\');
            if (file_exists($localPath)) {
                $zip->addFile($localPath, $zipEntryPath);
                $addedCount++;
                continue;
            }

            // 2. Fetch from remote URL (Backblaze B2 / CDN)
            if ($url && filter_var($url, FILTER_VALIDATE_URL)) {
                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 15);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                $fileContent = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($httpCode === 200 && $fileContent) {
                    $zip->addFromString($zipEntryPath, $fileContent);
                    $addedCount++;
                }
            }
        }

        // Add a clean README file inside the zip archive for documentation
        $zip->addFromString('README_ARCHIVE_INFO.txt', "========================================\r\nJONOGON NEWS - MEDIA ASSET ARCHIVE\r\nGenerated on: " . date('Y-m-d H:i:s T') . "\r\nTotal Files: " . $addedCount . "\r\nFolder Structure: uploads/YYYY/MM/filename.webp\r\n========================================\r\nThis ZIP archive contains all web-optimized WebP news assets and illustrations.\r\n");

        $zip->close();

        if (!file_exists($tempZipPath) || filesize($tempZipPath) === 0) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'ZIP ফাইলে কোনো ইমেজ যুক্ত করা যায়নি।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Stream the ZIP file to browser
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $zipFileName . '"');
        header('Content-Length: ' . filesize($tempZipPath));
        header('Pragma: no-cache');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

        readfile($tempZipPath);
        @unlink($tempZipPath);
        exit;

    } catch (Exception $e) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'ZIP এক্সপোর্ট ত্রুটি: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 2. GET: FETCH MEDIA ASSETS LIST (JSON)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json; charset=utf-8');
    try {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 200;
        $mediaList = [];

        if ($pdo) {
            $stmt = $pdo->prepare("SELECT * FROM `media_uploads` ORDER BY `created_at` DESC LIMIT ?");
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->execute();
            $mediaList = $stmt->fetchAll();
        }

        echo json_encode([
            'success' => true,
            'total' => count($mediaList),
            'data' => $mediaList
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 3. DELETE: REMOVE MEDIA ASSET
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    header('Content-Type: application/json; charset=utf-8');
    try {
        $id = $_GET['id'] ?? '';
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'মিডিয়া আইডি দেওয়া হয়নি।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($pdo) {
            $stmt = $pdo->prepare("DELETE FROM `media_uploads` WHERE `id` = ?");
            $stmt->execute([$id]);
        }

        echo json_encode(['success' => true, 'message' => 'মিডিয়া ফাইল ডাটাবেজ থেকে সরানো হয়েছে।'], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
