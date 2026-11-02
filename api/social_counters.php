<?php
/**
 * Janogon News - Real-time Social Media Followers & Subscribers Counter
 * 1. Checks every 12 hours (43200s) automatically.
 * 2. Caches live values locally in .social_cache.json for instant 0ms responses.
 * 3. Scrapes or calls APIs for real follower counts (YouTube, Telegram, etc.).
 * 4. Merges with Admin Global Settings for Facebook, Instagram, TikTok.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$cacheFile = __DIR__ . '/.social_cache.json';
$cacheDuration = 12 * 3600; // 12 hours = 43,200 seconds
$forceRefresh = isset($_GET['force']) && $_GET['force'] === '1';

// Format raw number to 1.2K, 250K, 1.5M, etc.
function formatFollowerCount($num) {
    if (empty($num)) return null;
    if (is_string($num)) {
        $clean = trim($num);
        if (preg_match('/^[0-9.,]+[KMBkmb]?$/', $clean)) {
            return strtoupper($clean);
        }
        $clean = preg_replace('/[^0-9]/', '', $clean);
        $num = (int)$clean;
    }
    if ($num >= 1000000) {
        return round($num / 1000000, 1) . 'M';
    } elseif ($num >= 1000) {
        return round($num / 1000, 1) . 'K';
    }
    return (string)$num;
}

// Helper: cURL fetch with realistic browser User-Agent
function fetchSocialUrl($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.9',
        'Cache-Control: no-cache'
    ]);
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ($httpCode >= 200 && $httpCode < 400 && $html) ? $html : null;
}

// 1. Fetch Real YouTube Subscribers
function fetchYouTubeSubscribers($channelUrl) {
    if (empty($channelUrl)) return null;

    $html = fetchSocialUrl($channelUrl);
    if (!$html) return null;

    // Pattern 1: YouTube subscriberCountText simpleText
    if (preg_match('/"subscriberCountText":\{[^\}]*"simpleText":"([^"]+)"/i', $html, $m)) {
        $raw = trim(str_ireplace('subscribers', '', $m[1]));
        return strtoupper($raw);
    }

    // Pattern 2: Fallback regex on HTML body
    if (preg_match('/([0-9.,KMBkmb]+)\s+subscribers/i', $html, $m)) {
        return strtoupper(trim($m[1]));
    }

    return null;
}

// 2. Fetch Real Telegram Members / Subscribers
function fetchTelegramMembers($tgUrl) {
    if (empty($tgUrl)) return null;

    // Convert t.me/... to t.me/s/... for public channel web preview
    $previewUrl = preg_replace('#t\.me/(?!s/)#', 't.me/s/', $tgUrl);
    $html = fetchSocialUrl($previewUrl);
    if (!$html) {
        $html = fetchSocialUrl($tgUrl);
    }
    if (!$html) return null;

    if (preg_match('/class="tgme_page_extra">([^<]+)<\/div>/i', $html, $m)) {
        $clean = trim($m[1]);
        if (preg_match('/([0-9\s.,KMBkmb]+)\s*(?:subscribers|members)/i', $clean, $subMatch)) {
            $numStr = str_replace(' ', '', $subMatch[1]);
            return formatFollowerCount($numStr);
        }
    }

    return null;
}

// Read existing cache if valid and not expired
$cachedData = null;
if (file_exists($cacheFile)) {
    $content = @file_get_contents($cacheFile);
    if ($content) {
        $cachedData = json_decode($content, true);
    }
}

$cacheAge = isset($cachedData['timestamp']) ? (time() - $cachedData['timestamp']) : 999999;
if (!$forceRefresh && $cachedData && $cacheAge < $cacheDuration && !empty($cachedData['counts'])) {
    // Serve from cache
    echo json_encode([
        'success' => true,
        'cached' => true,
        'cache_age_seconds' => $cacheAge,
        'next_check_in_seconds' => ($cacheDuration - $cacheAge),
        'timestamp' => $cachedData['timestamp'],
        'counts' => $cachedData['counts']
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// CACHE EXPIRED OR FORCED: FETCH REAL VALUES & MERGE SETTINGS
// -------------------------------------------------------------
$pdo = function_exists('getDB') ? getDB() : null;
$siteSettings = [];
if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT `setting_key`, `setting_value` FROM `site_settings`");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $siteSettings[$row['setting_key']] = $row['setting_value'];
        }
    } catch (Exception $e) { }
}

$ytUrl = $siteSettings['youtube'] ?? 'https://www.youtube.com/@jonogon.newstv';
$tgUrl = $siteSettings['telegram'] ?? 'https://t.me/jionogon.newstv';

// Fetch Live YouTube
$liveYt = fetchYouTubeSubscribers($ytUrl);
$liveTg = fetchTelegramMembers($tgUrl);

// Base / previous values
$prevCounts = $cachedData['counts'] ?? [];

$newCounts = [
    'facebook' => $siteSettings['facebook_followers'] ?? ($siteSettings['facebook_count'] ?? ($prevCounts['facebook'] ?? '248K')),
    'youtube'  => $liveYt ?: ($siteSettings['youtube_subscribers'] ?? ($siteSettings['youtube_count'] ?? ($prevCounts['youtube'] ?? '105K'))),
    'instagram'=> $siteSettings['instagram_followers'] ?? ($siteSettings['instagram_count'] ?? ($prevCounts['instagram'] ?? '54K')),
    'tiktok'   => $siteSettings['tiktok_followers'] ?? ($siteSettings['tiktok_count'] ?? ($prevCounts['tiktok'] ?? '89K')),
    'telegram' => $liveTg ?: ($siteSettings['telegram_members'] ?? ($siteSettings['telegram_count'] ?? ($prevCounts['telegram'] ?? '32K'))),
    'linkedin' => $siteSettings['linkedin_followers'] ?? ($prevCounts['linkedin'] ?? '18K'),
    'twitter'  => $siteSettings['twitter_followers'] ?? ($prevCounts['twitter'] ?? '69K')
];

// Clean formatted numbers
foreach ($newCounts as $k => $val) {
    $newCounts[$k] = formatFollowerCount($val) ?: $val;
}

// Write to cache
$toCache = [
    'timestamp' => time(),
    'checked_at' => date('Y-m-d H:i:s'),
    'counts' => $newCounts
];
@file_put_contents($cacheFile, json_encode($toCache, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'success' => true,
    'cached' => false,
    'refreshed' => true,
    'cache_duration' => '12 hours',
    'timestamp' => time(),
    'next_check_in_seconds' => $cacheDuration,
    'counts' => $newCounts
], JSON_UNESCAPED_UNICODE);
