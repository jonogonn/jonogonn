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
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
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
// PROXY IMAGE FOR CORS-SAFE CANVAS EXPORT & B2 PRIVATE BUCKET
// -------------------------------------------------------------
if ($action === 'proxy_image') {
    $targetUrl = $_GET['url'] ?? '';
    if (empty($targetUrl)) {
        http_response_code(400);
        exit(json_encode(['error' => 'Invalid or missing image URL']));
    }

    // Fetch directly from Backblaze B2 using download authorization token
    $parsedPath = parse_url($targetUrl, PHP_URL_PATH) ?: $targetUrl;
    $relPath = ltrim($parsedPath, '/');
    $cleanSubPath = '';
    if (strpos($relPath, 'uploads/') !== false) {
        $cleanSubPath = substr($relPath, strpos($relPath, 'uploads/'));
    } elseif (strpos($targetUrl, 'uploads/') !== false) {
        $cleanSubPath = substr($targetUrl, strpos($targetUrl, 'uploads/'));
        $cleanSubPath = explode('?', $cleanSubPath)[0];
    }

    $storageKey = $cleanSubPath ?: basename($parsedPath);
    if ($storageKey) {
        $auth = b2Auth();
        if ($auth && !empty($auth['authorizationToken'])) {
            $dlToken = getB2DownloadToken($auth, 3600);
            $downloadUrl = $auth['downloadUrl'] ?? "https://f005.backblazeb2.com";
            $b2DirectUrl = rtrim($downloadUrl, '/') . '/file/' . B2_BUCKET_NAME . '/' . ltrim($storageKey, '/');
            if ($dlToken) {
                $b2DirectUrl .= '?Authorization=' . $dlToken;
            }

            $ch = curl_init($b2DirectUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 20);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            $imgData = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $cType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'image/webp';
            curl_close($ch);

            if ($httpCode === 200 && $imgData) {
                // Save locally if local folder exists
                if (!empty($localFilePath)) {
                    $dir = dirname($localFilePath);
                    if (!is_dir($dir)) @mkdir($dir, 0755, true);
                    @file_put_contents($localFilePath, $imgData);
                }
                header('Content-Type: ' . $cType);
                header('Access-Control-Allow-Origin: *');
                header('Cache-Control: public, max-age=31536000');
                echo $imgData;
                exit;
            }
        }
    }

    // 3. Fallback: Generic cURL fetch
    if (filter_var($targetUrl, FILTER_VALIDATE_URL)) {
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

function getCachedB2DownloadAuth() {
    $cacheFile = __DIR__ . '/.b2_token_cache.json';
    if (file_exists($cacheFile)) {
        $cached = json_decode(file_get_contents($cacheFile), true);
        if ($cached && !empty($cached['token']) && !empty($cached['downloadUrl']) && ($cached['expires_at'] ?? 0) > time()) {
            return $cached;
        }
    }

    $auth = b2Auth();
    if (!$auth) return null;
    $dlToken = getB2DownloadToken($auth, 604800);
    $data = [
        'token' => $dlToken,
        'downloadUrl' => $auth['downloadUrl'] ?? "https://f005.backblazeb2.com",
        'expires_at' => time() + 86400 * 5
    ];
    @file_put_contents($cacheFile, json_encode($data));
    return $data;
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
        // Strictly fetch ONLY images that are present in MariaDB `media_gallery` table
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM `media_gallery` ORDER BY `id` DESC");
            $galleryRows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

            $b2Dl = getCachedB2DownloadAuth();
            $dlToken = $b2Dl['token'] ?? '';
            $downloadUrl = $b2Dl['downloadUrl'] ?? "https://f005.backblazeb2.com";

            $formattedList = [];
            foreach ($galleryRows as $row) {
                $pubUrl = !empty($row['public_url']) ? $row['public_url'] : ($row['file_url'] ?? '');
                $stKey = !empty($row['storage_key']) ? $row['storage_key'] : ($row['file_name'] ?? '');
                $fName = !empty($row['file_name']) ? $row['file_name'] : ($row['original_name'] ?? basename($pubUrl));
                $oName = !empty($row['original_name']) ? $row['original_name'] : $fName;

                if ($dlToken && $stKey && (strpos($pubUrl, 'cdn.jonogon.news') !== false || strpos($pubUrl, 'backblazeb2.com') !== false || empty($pubUrl))) {
                    $workingUrl = rtrim($downloadUrl, '/') . '/file/' . B2_BUCKET_NAME . '/' . ltrim($stKey, '/') . '?Authorization=' . $dlToken;
                } else {
                    $workingUrl = $pubUrl;
                }

                $formattedList[] = [
                    'id' => (int)$row['id'],
                    'original_name' => $oName,
                    'file_name' => $fName,
                    'storage_key' => $stKey,
                    'public_url' => $workingUrl,
                    'file_url' => $workingUrl,
                    'file_format' => str_replace('image/', '', $row['file_type'] ?: 'webp'),
                    'size_bytes' => (int)($row['file_size'] ?? 0),
                    'dimensions' => $row['dimensions'] ?: '1200x630',
                    'provider' => $row['storage_provider'] ?? 'backblaze',
                    'caption' => $row['caption'] ?? '',
                    'category' => $row['category'] ?? 'general',
                    'associated_news' => $row['category'] ?? 'general gallery',
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

        echo json_encode([
            'success' => true,
            'total' => 0,
            'data' => [],
            'message' => 'MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই।'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// 3. DELETE / BULK DELETE: REMOVE FILES FROM B2 & DB
// -------------------------------------------------------------
require_once __DIR__ . '/b2_storage.php';

function deleteMediaItemFromAll($b2Auth, $pdo, $id, $storageKey, $fileName, $fileId = '') {
    return deleteMediaComplete($pdo, $id, $storageKey, $fileName, $fileId, $b2Auth);
}

if ($requestMethod === 'DELETE' || ($requestMethod === 'POST' && in_array($action, ['delete', 'delete_multiple', 'bulk_delete']))) {
    try {
        $rawInput = file_get_contents('php://input');
        $payload = json_decode($rawInput, true) ?: [];

        $itemsToDelete = [];
        if (!empty($payload['items']) && is_array($payload['items'])) {
            $itemsToDelete = $payload['items'];
        } elseif (!empty($payload['ids']) && is_array($payload['ids'])) {
            foreach ($payload['ids'] as $id) {
                $itemsToDelete[] = ['id' => $id];
            }
        } else {
            $id = $payload['id'] ?? ($_GET['id'] ?? '');
            $fileId = $payload['file_id'] ?? ($_GET['file_id'] ?? '');
            $fileName = $payload['file_name'] ?? ($_GET['file_name'] ?? ($_GET['fileName'] ?? ''));
            $storageKey = $payload['storage_key'] ?? ($_GET['storage_key'] ?? $fileName);
            if ($id || $fileName || $storageKey || $fileId) {
                $itemsToDelete[] = [
                    'id' => $id,
                    'file_id' => $fileId,
                    'file_name' => $fileName,
                    'storage_key' => $storageKey
                ];
            }
        }

        $b2Auth = b2Auth();
        $deletedCount = 0;

        foreach ($itemsToDelete as $item) {
            $id = $item['id'] ?? '';
            $fileId = $item['file_id'] ?? '';
            $storageKey = $item['storage_key'] ?? ($item['fileName'] ?? '');
            $fileName = $item['file_name'] ?? ($item['original_name'] ?? basename($storageKey));

            // If storage_key is missing, lookup row from DB
            if (empty($storageKey) && !empty($id) && $pdo) {
                try {
                    $q = $pdo->prepare("SELECT `storage_key`, `file_name` FROM `media_gallery` WHERE `id` = ?");
                    $q->execute([$id]);
                    $r = $q->fetch(PDO::FETCH_ASSOC);
                    if ($r) {
                        $storageKey = $r['storage_key'] ?: $storageKey;
                        $fileName = $r['file_name'] ?: $fileName;
                    }
                } catch (Exception $e) {}
            }

            deleteMediaItemFromAll($b2Auth, $pdo, $id, $storageKey, $fileName, $fileId);
            $deletedCount++;
        }

        echo json_encode([
            'success' => true,
            'message' => "সফলভাবে {$deletedCount}টি ছবি Backblaze B2 ও MariaDB ডাটাবেজ থেকে মুছে ফেলা হয়েছে।",
            'deleted_count' => $deletedCount
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
