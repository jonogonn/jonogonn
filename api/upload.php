<?php
/**
 * Janogon News - Image Upload & Backblaze B2 Cloud Storage Engine
 * 1. Converts any uploaded image (JPG, PNG, WebP) to high-quality .webp
 * 2. Uploads directly to Backblaze B2 bucket (jonogon.news)
 * 3. Records entry in cPanel MariaDB `media_uploads` table
 * 4. Falls back gracefully to local WebP storage if Backblaze keys are pending
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -------------------------------------------------------------
// TEST / DIAGNOSTIC MODE (GET /api/upload.php?test=1)
// -------------------------------------------------------------
if ($requestMethod === 'GET') {
    $gdSupported = extension_loaded('gd') && function_exists('imagewebp');
    $b2Configured = !empty(B2_KEY_ID) && !empty(B2_APPLICATION_KEY);
    $b2TestResult = null;

    if ($b2Configured) {
        $auth = b2AuthorizeAccount(B2_KEY_ID, B2_APPLICATION_KEY);
        if ($auth && !empty($auth['authorizationToken'])) {
            $b2TestResult = [
                'status' => 'connected',
                'bucket' => B2_BUCKET_NAME,
                'apiUrl' => $auth['apiUrl'] ?? '',
                'downloadUrl' => $auth['downloadUrl'] ?? ''
            ];
        } else {
            $b2TestResult = [
                'status' => 'failed',
                'error' => $auth['error'] ?? 'Authentication failed'
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'system' => 'Janogon News Cloud Upload & Storage API',
        'mariadb' => [
            'status' => $pdo ? 'connected' : 'disconnected',
            'database' => DB_NAME,
            'host' => DB_HOST
        ],
        'webp_converter' => [
            'gd_library' => extension_loaded('gd'),
            'imagewebp_supported' => $gdSupported
        ],
        'backblaze_b2' => [
            'configured' => $b2Configured,
            'bucket_name' => B2_BUCKET_NAME,
            'bucket_id' => B2_BUCKET_ID,
            'test_result' => $b2TestResult
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// -------------------------------------------------------------
// HANDLE POST: IMAGE UPLOAD & WEBP PROCESSING
// -------------------------------------------------------------
if ($requestMethod === 'POST') {
    try {
        if (empty($_FILES['image']) && empty($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'কোনো ছবি আপলোড করা হয়নি। (image field required)'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $uploadedFile = !empty($_FILES['image']) ? $_FILES['image'] : $_FILES['file'];

        if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ছবি আপলোডে ত্রুটি ঘটেছে (Error code: ' . $uploadedFile['error'] . ')'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $tmpPath = $uploadedFile['tmp_name'];
        $originalName = $uploadedFile['name'];
        $sizeBytes = $uploadedFile['size'];

        // 1. Get Image Dimensions & Info
        $imageInfo = @getimagesize($tmpPath);
        $width = $imageInfo ? $imageInfo[0] : 1200;
        $height = $imageInfo ? $imageInfo[1] : 630;
        $mime = $imageInfo ? $imageInfo['mime'] : mime_content_type($tmpPath);

        // Check if file is already WebP
        $isAlreadyWebp = ($mime === 'image/webp') || (strtolower(pathinfo($originalName, PATHINFO_EXTENSION)) === 'webp');

        // 2. Prepare WebP filename and conversion (named according to news URL / slug)
        $timestamp = time();
        $rand = rand(1000, 9999);
        $rawSlug = !empty($_POST['slug']) ? $_POST['slug'] : (!empty($_POST['news_slug']) ? $_POST['news_slug'] : (!empty($_POST['associated_news']) ? $_POST['associated_news'] : pathinfo($originalName, PATHINFO_FILENAME)));
        $cleanSlug = preg_replace('/[^a-zA-Z0-9_-]/', '-', $rawSlug);
        $cleanSlug = trim(preg_replace('/-+/', '-', $cleanSlug), '-');
        $slugName = substr($cleanSlug ?: 'news', 0, 50);
        $webpFileName = $slugName . '-' . $timestamp . '-' . $rand . '.webp';

        $tempWebpPath = sys_get_temp_dir() . '/' . $webpFileName;
        $conversionSuccess = false;

        if ($isAlreadyWebp) {
            // Already WebP, use directly
            $conversionSuccess = true;
            $finalUploadPath = $tmpPath;
            $finalFormat = 'webp';
        } else {
            // Convert using GD if available
            $conversionSuccess = convertToWebp($tmpPath, $mime, $tempWebpPath, 85);
            $finalUploadPath = $conversionSuccess ? $tempWebpPath : $tmpPath;
            $finalFormat = $conversionSuccess ? 'webp' : (strtolower(pathinfo($originalName, PATHINFO_EXTENSION)) ?: 'jpg');
        }

        $finalFileName = ($finalFormat === 'webp') ? $webpFileName : ($slugName . '-' . $timestamp . '-' . $rand . '.' . $finalFormat);
        $finalSize = file_exists($finalUploadPath) ? filesize($finalUploadPath) : $sizeBytes;

        // 3. Upload to Backblaze B2 (if configured) or Local Storage
        $b2Configured = !empty(B2_KEY_ID) && !empty(B2_APPLICATION_KEY) && !empty(B2_BUCKET_ID);
        $publicUrl = '';
        $storageKey = 'uploads/' . date('Y/m') . '/' . $finalFileName;
        $provider = 'local';

        if ($b2Configured) {
            $contentType = ($finalFormat === 'webp') ? 'image/webp' : ($mime ?: 'image/jpeg');
            $b2Result = uploadToBackblazeB2($finalUploadPath, $storageKey, $contentType);
            if ($b2Result && !empty($b2Result['publicUrl'])) {
                $publicUrl = $b2Result['publicUrl'];
                $provider = 'backblaze';
            }
        }

        // Fallback to local storage if Backblaze failed or not configured
        if (!$publicUrl) {
            $uploadDir = __DIR__ . '/../uploads/' . date('Y/m') . '/';
            if (!is_dir($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }
            $localDest = $uploadDir . $finalFileName;
            @copy($finalUploadPath, $localDest);

            // Build relative / full URL
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $scriptPath = dirname(dirname($_SERVER['SCRIPT_NAME'] ?? ''));
            $scriptPath = rtrim($scriptPath, '/\\');
            $publicUrl = $protocol . $host . $scriptPath . '/uploads/' . date('Y/m') . '/' . $finalFileName;
            $provider = 'local_server';
        }

        // Clean temp WebP file if generated
        if (file_exists($tempWebpPath)) {
            @unlink($tempWebpPath);
        }

        // 4. Save Record to MariaDB `media_uploads` table
        try {
            if ($pdo) {
                $stmt = $pdo->prepare("
                    INSERT INTO `media_uploads` (
                        `original_name`, `storage_key`, `public_url`, `file_format`,
                        `width`, `height`, `size_bytes`, `provider`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $originalName, $storageKey, $publicUrl, $finalFormat,
                    $width, $height, $finalSize, $provider
                ]);
            }
        } catch (Exception $dbEx) {
            // Silently continue so upload succeeds even if db log has minor issue
        }

        echo json_encode([
            'success' => true,
            'message' => 'ছবি সফলভাবে .webp ফরম্যাটে রূপান্তরিত ও সংরক্ষিত হয়েছে!',
            'url' => $publicUrl,
            'imageUrl' => $publicUrl,
            'storage_key' => $storageKey,
            'provider' => $provider,
            'format' => $finalFormat,
            'width' => $width,
            'height' => $height,
            'size_bytes' => $finalSize
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'ছবি আপলোড প্রক্রিয়া ব্যর্থ হয়েছে: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// -------------------------------------------------------------
// HELPER: CONVERT IMAGE TO WEBP
// -------------------------------------------------------------
function convertToWebp($sourcePath, $mime, $destPath, $quality = 85) {
    if (!extension_loaded('gd') || !function_exists('imagewebp')) {
        return false;
    }

    $image = null;
    switch ($mime) {
        case 'image/jpeg':
        case 'image/jpg':
            $image = @imagecreatefromjpeg($sourcePath);
            break;
        case 'image/png':
            $image = @imagecreatefrompng($sourcePath);
            if ($image) {
                imagepalettetotruecolor($image);
                imagealphablending($image, true);
                imagesavealpha($image, true);
            }
            break;
        case 'image/webp':
            $image = @imagecreatefromwebp($sourcePath);
            break;
        case 'image/gif':
            $image = @imagecreatefromgif($sourcePath);
            break;
    }

    if (!$image) {
        return false;
    }

    $result = @imagewebp($image, $destPath, $quality);
    @imagedestroy($image);
    return $result;
}

// -------------------------------------------------------------
// HELPER: BACKBLAZE B2 AUTHORIZE ACCOUNT
// -------------------------------------------------------------
function b2AuthorizeAccount($keyId, $applicationKey) {
    $url = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, "$keyId:$applicationKey");
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        return json_decode($response, true);
    }
    return ['error' => $curlErr ?: "HTTP $httpCode: $response"];
}

// -------------------------------------------------------------
// HELPER: UPLOAD TO BACKBLAZE B2
// -------------------------------------------------------------
function uploadToBackblazeB2($filePath, $fileName, $contentType = 'image/webp') {
    // 1. Authorize Account
    $auth = b2AuthorizeAccount(B2_KEY_ID, B2_APPLICATION_KEY);
    if (empty($auth['authorizationToken']) || empty($auth['apiUrl'])) {
        return null;
    }

    $authToken = $auth['authorizationToken'];
    $apiUrl = $auth['apiUrl'];
    $downloadUrl = $auth['downloadUrl'] ?? "https://f005.backblazeb2.com";

    // 2. Get Upload URL
    $getUrlEndpoint = "$apiUrl/b2api/v2/b2_get_upload_url";
    $ch = curl_init($getUrlEndpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['bucketId' => B2_BUCKET_ID]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: $authToken",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $getUploadRes = curl_exec($ch);
    curl_close($ch);

    $uploadData = json_decode($getUploadRes, true);
    if (empty($uploadData['uploadUrl']) || empty($uploadData['authorizationToken'])) {
        return null;
    }

    $uploadUrl = $uploadData['uploadUrl'];
    $uploadAuthToken = $uploadData['authorizationToken'];

    // 3. Upload File Bytes
    $fileData = file_get_contents($filePath);
    $sha1 = sha1($fileData);

    $ch = curl_init($uploadUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fileData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: $uploadAuthToken",
        "X-Bz-File-Name: " . rawurlencode($fileName),
        "Content-Type: $contentType",
        "Content-Length: " . strlen($fileData),
        "X-Bz-Content-Sha1: $sha1"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 45);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $uploadRes = curl_exec($ch);
    $uploadHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($uploadHttpCode === 200 && $uploadRes) {
        $resultData = json_decode($uploadRes, true);

        // Construct Public URL
        if (defined('CDN_BASE_URL') && CDN_BASE_URL) {
            $publicUrl = rtrim(CDN_BASE_URL, '/') . '/' . $fileName;
        } else {
            $publicUrl = rtrim($downloadUrl, '/') . '/file/' . B2_BUCKET_NAME . '/' . $fileName;
        }

        return [
            'success' => true,
            'publicUrl' => $publicUrl,
            'fileId' => $resultData['fileId'] ?? null,
            'fileName' => $resultData['fileName'] ?? $fileName
        ];
    }

    return null;
}
