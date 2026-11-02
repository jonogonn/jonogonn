<?php
/**
 * Janogon News - High-Performance Cloudflare CDN & Backblaze B2 Streamer
 * 1. Receives clean URL: /uploads/YYYY/MM/file.webp
 * 2. Streams real WebP image directly from Backblaze B2 using auto-renewed token
 * 3. Sends 1-Year Cloudflare Edge Cache headers (max-age=31536000, immutable)
 * 4. Enables Zero Egress Cost via Cloudflare + Backblaze Bandwidth Alliance
 */

// Turn off output buffering for fast streaming
if (ob_get_level()) {
    ob_end_clean();
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/b2_storage.php';

// Extract requested file path
$file = isset($_GET['file']) ? trim($_GET['file']) : '';
if (!$file) {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
    if (preg_match('#(?:^|/)uploads/(.+)$#i', $uri, $m)) {
        $file = $m[1];
    }
}

// Clean file path to prevent directory traversal
$file = str_replace('\\', '/', $file);
$file = preg_replace('#\.\./#', '', $file);
$file = ltrim($file, '/');

// If 'uploads/' prefix is already in path, strip it for consistency
if (str_starts_with($file, 'uploads/')) {
    $file = substr($file, 8);
}

if (empty($file)) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Bad Request: Missing image file path.';
    exit;
}

// 1. Check if file exists on local disk (if ever cached locally)
$localPath = __DIR__ . '/../uploads/' . $file;
if (file_exists($localPath) && is_file($localPath)) {
    $mime = mime_content_type($localPath) ?: 'image/webp';
    $size = filesize($localPath);
    $mtime = filemtime($localPath);
    $etag = '"' . md5($file . $mtime . $size) . '"';

    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
        http_response_code(304);
        exit;
    }

    header('Content-Type: ' . $mime);
    header('Content-Length: ' . $size);
    header('Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable');
    header('ETag: ' . $etag);
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
    header('Access-Control-Allow-Origin: *');
    header('X-Content-Source: LocalDisk');
    readfile($localPath);
    exit;
}

// 2. Fetch from Backblaze B2 using Cached Download Token
$storageKey = 'uploads/' . $file;

// Ensure download authorization token
function getProxyB2Token() {
    $cacheFile = __DIR__ . '/.b2_token_cache.json';
    if (file_exists($cacheFile)) {
        $cache = json_decode(@file_get_contents($cacheFile), true);
        if ($cache && !empty($cache['downloadToken']) && !empty($cache['expiresAt']) && $cache['expiresAt'] > time() + 3600) {
            return $cache['downloadToken'];
        }
    }

    if (function_exists('b2AuthorizeAccountHelper') && defined('B2_BUCKET_ID')) {
        $auth = b2AuthorizeAccountHelper();
        if ($auth && !empty($auth['apiUrl']) && !empty($auth['authorizationToken'])) {
            $apiUrl = $auth['apiUrl'];
            $authToken = $auth['authorizationToken'];
            $ch = curl_init("$apiUrl/b2api/v2/b2_get_download_authorization");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'bucketId' => B2_BUCKET_ID,
                'fileNamePrefix' => 'uploads/',
                'validDurationInSeconds' => 604800 // 7 days
            ]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: $authToken",
                "Content-Type: application/json"
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 8);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            $res = curl_exec($ch);
            curl_close($ch);

            if ($res) {
                $j = json_decode($res, true);
                if (!empty($j['authorizationToken'])) {
                    $token = $j['authorizationToken'];
                    @file_put_contents($cacheFile, json_encode([
                        'downloadToken' => $token,
                        'expiresAt' => time() + 518400 // refresh in 6 days
                    ]));
                    return $token;
                }
            }
        }
    }
    return '';
}

$b2Token = getProxyB2Token();
$b2Url = "https://f005.backblazeb2.com/file/" . B2_BUCKET_NAME . "/" . $storageKey;
if ($b2Token) {
    $b2Url .= "?Authorization=" . $b2Token;
}

// 3. Request Image from B2 with Conditional GET support
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$defaultMime = match($ext) {
    'webp' => 'image/webp',
    'png' => 'image/png',
    'jpg', 'jpeg' => 'image/jpeg',
    'gif' => 'image/gif',
    'svg' => 'image/svg+xml',
    default => 'image/webp'
};

$ch = curl_init($b2Url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 12);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$rawResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode === 200 && $rawResponse) {
    $headers = substr($rawResponse, 0, $headerSize);
    $body = substr($rawResponse, $headerSize);

    // Parse Content-Type from B2 or fallback
    $contentType = $defaultMime;
    if (preg_match('/content-type:\s*([^\r\n]+)/i', $headers, $m)) {
        $contentType = trim($m[1]);
    }

    $etag = '"' . md5($file . strlen($body)) . '"';

    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
        http_response_code(304);
        exit;
    }

    // High performance Cloudflare Edge & Browser Caching headers
    http_response_code(200);
    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . strlen($body));
    header('Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable');
    header('ETag: ' . $etag);
    header('Access-Control-Allow-Origin: *');
    header('X-Content-Source: BackblazeB2-Proxy');
    header('X-Proxy-Cache: Cloudflare-Ready');

    echo $body;
    exit;
}

// If B2 returned 404 / not found
http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: public, max-age=60'); // short 1-min cache for missing
echo 'Image not found in B2 storage: ' . htmlspecialchars($storageKey);
exit;
