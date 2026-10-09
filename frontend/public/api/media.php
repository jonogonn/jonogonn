<?php
/**
 * Janogon News - Media Library & Asset Archive API
 * 1. Direct Backblaze B2 Cloud Integration (queries b2_list_file_names)
 * 2. Generates Download Authorization Token for private/free Backblaze B2 buckets
 * 3. GET: Returns real images from Backblaze B2 with valid download authorization tokens
 * 4. GET ?action=download_zip: Generates and streams complete ZIP archive
 * 5. DELETE: Deletes file from Backblaze B2 & MariaDB
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

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

// -------------------------------------------------------------
// PROXY IMAGE FOR CORS-SAFE CANVAS EXPORT
// -------------------------------------------------------------
if ($action === 'proxy_image') {
    $targetUrl = $_GET['url'] ?? '';
    if (empty($targetUrl) || !filter_var($targetUrl, FILTER_VALIDATE_URL)) {
        http_response_code(400);
        exit(json_encode(['error' => 'Invalid or missing image URL']));
    }
    $ch = curl_init($targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $imgData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'image/jpeg';
    curl_close($ch);

    if ($httpCode === 200 && $imgData) {
        header('Content-Type: ' . $cType);
        header('Access-Control-Allow-Origin: *');
        header('Cache-Control: public, max-age=86400');
        echo $imgData;
        exit;
    }
    http_response_code(404);
    exit(json_encode(['error' => 'Failed to retrieve image']));
}


// -------------------------------------------------------------
// HELPER: BACKBLAZE B2 AUTHORIZE
// -------------------------------------------------------------
function b2Auth() {
    if (empty(B2_KEY_ID) || empty(B2_APPLICATION_KEY)) {
        return null;
    }
    $url = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, B2_KEY_ID . ":" . B2_APPLICATION_KEY);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $res = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http === 200 && $res) {
        return json_decode($res, true);
    }
    return null;
}

// -------------------------------------------------------------
// HELPER: GET B2 DOWNLOAD AUTHORIZATION TOKEN
// -------------------------------------------------------------
function getB2DownloadToken($auth, $validSeconds = 604800) {
    if (!$auth || empty($auth['apiUrl']) || empty($auth['authorizationToken'])) {
        return '';
    }
    $url = $auth['apiUrl'] . "/b2api/v2/b2_get_download_authorization";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'bucketId' => B2_BUCKET_ID,
        'fileNamePrefix' => '',
        'validDurationInSeconds' => $validSeconds
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: " . $auth['authorizationToken'],
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $res = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http === 200 && $res) {
        $data = json_decode($res, true);
        return $data['authorizationToken'] ?? '';
    }
    return '';
}

// -------------------------------------------------------------
// HELPER: FETCH FILES DIRECTLY FROM BACKBLAZE B2 BUCKET
// -------------------------------------------------------------
function getB2FilesList() {
    $auth = b2Auth();
    if (!$auth || empty($auth['authorizationToken']) || empty($auth['apiUrl'])) {
        return [];
    }

    $apiUrl = $auth['apiUrl'];
    $authToken = $auth['authorizationToken'];
    $downloadUrl = $auth['downloadUrl'] ?? "https://f005.backblazeb2.com";
    $dlToken = getB2DownloadToken($auth, 604800); // 7 days token

    $listUrl = "$apiUrl/b2api/v2/b2_list_file_names";
    $ch = curl_init($listUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'bucketId' => B2_BUCKET_ID,
        'maxFileCount' => 1000
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: $authToken",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $listRes = curl_exec($ch);
    $listHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($listHttpCode !== 200 || !$listRes) {
        return [];
    }

    $data = json_decode($listRes, true);
    $rawFiles = $data['files'] ?? [];
    $mediaList = [];

    foreach ($rawFiles as $file) {
        if (($file['action'] ?? '') === 'upload') {
            $fileName = $file['fileName'];
            $baseName = basename($fileName);
            $ext = strtolower(pathinfo($baseName, PATHINFO_EXTENSION) ?: 'webp');

            // Construct Direct B2 Download URL with Authorization Token
            $publicUrl = rtrim($downloadUrl, '/') . '/file/' . B2_BUCKET_NAME . '/' . ltrim($fileName, '/');
            if ($dlToken) {
                $publicUrl .= '?Authorization=' . $dlToken;
            }

            $mediaList[] = [
                'id' => $file['fileId'] ?? ('b2-' . md5($fileName)),
                'file_id' => $file['fileId'] ?? '',
                'original_name' => $baseName,
                'storage_key' => $fileName,
                'public_url' => $publicUrl,
                'file_format' => $ext,
                'width' => 1200,
                'height' => 630,
                'size_bytes' => $file['contentLength'] ?? 80000,
                'provider' => 'backblaze',
                'associated_news' => '',
                'created_at' => !empty($file['uploadTimestamp']) ? date('Y-m-d H:i:s', (int)($file['uploadTimestamp'] / 1000)) : date('Y-m-d H:i:s')
            ];
        }
    }

    return $mediaList;
}

// -------------------------------------------------------------
// 1. GENERATE & STREAM BULK ZIP ARCHIVE
// -------------------------------------------------------------
if ($action === 'download_zip') {
    try {
        $mediaItems = getB2FilesList();

        if (empty($mediaItems) && $pdo) {
            $stmt = $pdo->query("SELECT `id`, `original_name`, `storage_key`, `public_url`, `file_format` FROM `media_uploads` ORDER BY `id` DESC");
            $mediaItems = $stmt->fetchAll() ?: [];
        }

        if (empty($mediaItems)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Backblaze B2-তে কোনো ছবি পাওয়া যায়নি।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $zipFileName = 'jonogon_media_archive_' . date('Y-m-d_His') . '.zip';
        $tempZipPath = sys_get_temp_dir() . '/' . $zipFileName;

        $zip = new ZipArchive();
        if ($zip->open($tempZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'ZIP ফাইল তৈরি করতে ব্যর্থ হয়েছে।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $addedCount = 0;
        foreach ($mediaItems as $item) {
            $url = $item['public_url'] ?? '';
            $storageKey = $item['storage_key'] ?? ('uploads/' . ($item['original_name'] ?? 'image.webp'));
            $zipEntryPath = ltrim($storageKey, '/\\');

            // 1. Try local file path
            $localPath = __DIR__ . '/../' . ltrim($storageKey, '/\\');
            if (file_exists($localPath)) {
                $zip->addFile($localPath, $zipEntryPath);
                $addedCount++;
                continue;
            }

            // 2. Fetch from B2 URL with token
            if ($url && filter_var($url, FILTER_VALIDATE_URL)) {
                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 20);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                $fileContent = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if ($httpCode === 200 && $fileContent) {
                    $zip->addFromString($zipEntryPath, $fileContent);
                    $addedCount++;
                }
            }
        }

        $zip->addFromString('README_ARCHIVE_INFO.txt', "========================================\r\nJONOGON NEWS - BACKBLAZE B2 ASSET ARCHIVE\r\nGenerated on: " . date('Y-m-d H:i:s T') . "\r\nTotal Files: " . $addedCount . "\r\nBucket: " . B2_BUCKET_NAME . "\r\n========================================\r\n");
        $zip->close();

        if (!file_exists($tempZipPath) || filesize($tempZipPath) === 0) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'ZIP ফাইলে ছবি যুক্ত করা যায়নি।'], JSON_UNESCAPED_UNICODE);
            exit;
        }

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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'ZIP এক্সপোর্ট ত্রুটি: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 2. GET: FETCH REAL MEDIA ASSETS FROM BACKBLAZE B2
// -------------------------------------------------------------
if ($requestMethod === 'GET') {
    try {
        $mediaList = getB2FilesList();

        // 1. Sync B2 files into media_gallery in MariaDB if connected
        if ($pdo && !empty($mediaList)) {
            $mStmt = $pdo->prepare("
                INSERT INTO `media_gallery` (`file_name`, `storage_key`, `public_url`, `file_type`, `file_size`, `dimensions`)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE `public_url` = VALUES(`public_url`)
            ");
            foreach ($mediaList as $f) {
                $chk = $pdo->prepare("SELECT id FROM `media_gallery` WHERE `storage_key` = ?");
                $chk->execute([$f['storage_key']]);
                if (!$chk->fetch()) {
                    $mStmt->execute([
                        $f['original_name'],
                        $f['storage_key'],
                        $f['public_url'],
                        'image/' . ($f['file_format'] ?? 'webp'),
                        $f['size_bytes'] ?? 0,
                        ($f['width'] ?? 1200) . 'x' . ($f['height'] ?? 630)
                    ]);
                }
            }
        }

        // 2. Fetch and return from MariaDB `media_gallery` table
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM `media_gallery` ORDER BY `id` DESC LIMIT 500");
            $galleryRows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
            if (!empty($galleryRows)) {
                $formattedList = [];
                foreach ($galleryRows as $row) {
                    $formattedList[] = [
                        'id' => $row['id'],
                        'original_name' => $row['file_name'],
                        'file_name' => $row['file_name'],
                        'storage_key' => $row['storage_key'],
                        'public_url' => $row['public_url'],
                        'file_format' => str_replace('image/', '', $row['file_type'] ?: 'webp'),
                        'size_bytes' => (int)$row['file_size'],
                        'dimensions' => $row['dimensions'] ?: '1200x630',
                        'provider' => 'backblaze',
                        'created_at' => $row['created_at']
                    ];
                }

                echo json_encode([
                    'success' => true,
                    'total' => count($formattedList),
                    'data' => $formattedList,
                    'source' => 'mariadb_gallery'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        if (!empty($mediaList)) {
            echo json_encode([
                'success' => true,
                'total' => count($mediaList),
                'data' => $mediaList,
                'source' => 'backblaze_b2'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Fallback to MariaDB media_uploads
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM `media_uploads` ORDER BY `created_at` DESC LIMIT 200");
            $dbList = $stmt->fetchAll() ?: [];
            if (!empty($dbList)) {
                echo json_encode([
                    'success' => true,
                    'total' => count($dbList),
                    'data' => $dbList,
                    'source' => 'mariadb'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        echo json_encode([
            'success' => true,
            'total' => 0,
            'data' => [],
            'source' => 'empty'
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 3. DELETE: REMOVE FILE FROM BACKBLAZE B2 & DB
// -------------------------------------------------------------
if ($requestMethod === 'DELETE') {
    try {
        $fileId = $_GET['file_id'] ?? ($_GET['id'] ?? '');
        $fileName = $_GET['file_name'] ?? ($_GET['fileName'] ?? '');

        if ($fileId && $fileName) {
            $auth = b2Auth();
            if ($auth && !empty($auth['apiUrl']) && !empty($auth['authorizationToken'])) {
                $delUrl = $auth['apiUrl'] . "/b2api/v2/b2_delete_file_version";
                $ch = curl_init($delUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                    'fileName' => $fileName,
                    'fileId' => $fileId
                ]));
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    "Authorization: " . $auth['authorizationToken'],
                    "Content-Type: application/json"
                ]);
                curl_setopt($ch, CURLOPT_TIMEOUT, 15);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                curl_exec($ch);
                curl_close($ch);
            }
        }

        if ($pdo) {
            if (is_numeric($fileId)) {
                $stmt = $pdo->prepare("DELETE FROM `media_uploads` WHERE `id` = ?");
                $stmt->execute([$fileId]);
                $stmt2 = $pdo->prepare("DELETE FROM `media_gallery` WHERE `id` = ?");
                $stmt2->execute([$fileId]);
            }
            if ($fileName) {
                $stmt3 = $pdo->prepare("DELETE FROM `media_gallery` WHERE `file_name` = ? OR `storage_key` LIKE ?");
                $stmt3->execute([$fileName, "%$fileName%"]);
            }
        }

        echo json_encode(['success' => true, 'message' => 'মিডিয়া ফাইল সফলভাবে মুছে ফেলা হয়েছে।'], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
