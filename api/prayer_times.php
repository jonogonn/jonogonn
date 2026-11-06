<?php
/**
 * Prayer Times API Proxy & Cache for Jonogon News
 * Proxies Muslims Day monthly prayer time data and caches locally for ultra-fast response.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$city = isset($_GET['city']) ? trim(strtolower($_GET['city'])) : 'dhaka';
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
$month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('n');

// Map district name variants to Muslims Day API slugs
$cityMap = [
    'chittagong' => 'chattogram',
    'comilla'    => 'cumilla',
    'barisal'    => 'barishal',
    'bogra'      => 'bogura',
    'jessore'    => 'jashore',
    'coxsbazar'  => 'coxs-bazar',
    'coxs_bazar' => 'coxs-bazar',
    'chapainawabganj' => 'chapai-nawabganj'
];

if (isset($cityMap[$city])) {
    $city = $cityMap[$city];
}

// Sanitize city slug
$city = preg_replace('/[^a-z0-9\-]/', '', $city);
if (empty($city)) {
    $city = 'dhaka';
}

$cacheDir = __DIR__;
$cacheFile = $cacheDir . '/.prayer_cache_' . $city . '_' . $year . '_' . $month . '.json';

// Serve from cache if existing and recent (less than 7 days old)
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 7 * 86400)) {
    $cachedData = file_get_contents($cacheFile);
    if (!empty($cachedData)) {
        echo $cachedData;
        exit;
    }
}

// Fetch from Muslims Day API
$targetUrl = "https://muslimsday.com/api/prayer-times/month?country=bangladesh&city=" . urlencode($city) . "&year=" . $year . "&month=" . $month . "&method=" . urlencode("University of Islamic Sciences, Karachi") . "&madhab=hanafi";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Referer: https://muslimsday.com/'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode === 200 && !empty($response)) {
    $decoded = json_decode($response, true);
    if ($decoded && isset($decoded['days']) && is_array($decoded['days'])) {
        @file_put_contents($cacheFile, $response);
        echo $response;
        exit;
    }
}

// Fallback: If specific district failed (e.g. small district not listed in API), fetch Dhaka as baseline
if ($city !== 'dhaka') {
    $dhakaCacheFile = $cacheDir . '/.prayer_cache_dhaka_' . $year . '_' . $month . '.json';
    if (file_exists($dhakaCacheFile)) {
        echo file_get_contents($dhakaCacheFile);
        exit;
    }
}

http_response_code($httpCode ?: 500);
echo json_encode([
    'error' => 'Failed to retrieve prayer times from source',
    'http_code' => $httpCode,
    'city' => $city
]);
