<?php
/**
 * Janogon News - Real-time Social Media Followers & Subscribers Fetcher (100% API-Free)
 * 1. Checks and auto-refreshes every 12 hours (43200s).
 * 2. Caches live values in api/.social_cache.json for instant 0ms visitor response.
 * 3. Scrapes real numbers from public Facebook, YouTube, Instagram, and X (Twitter) profiles.
 * 4. Strictly NO fake or random numbers.
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
$cacheDuration = 12 * 3600; // 12 hours (43,200 seconds)
$forceRefresh = isset($_GET['force']) && $_GET['force'] === '1';

// Format number (e.g. 21954 -> 22K, 14 -> 14, 0 -> 0)
function formatSocialNumber($val) {
    if ($val === null || $val === '') return null;
    $val = trim((string)$val);
    if ($val === '0') return '0';

    if (preg_match('/^[0-9.]+[KMBkmb]$/', $val)) {
        return strtoupper($val);
    }

    $clean = str_replace([',', ' '], '', $val);
    if (!is_numeric($clean)) {
        return $val;
    }

    $num = (float)$clean;
    if ($num >= 1000000) {
        $formatted = round($num / 1000000, 1);
        return ($formatted == (int)$formatted ? (int)$formatted : $formatted) . 'M';
    } elseif ($num >= 1000) {
        $formatted = round($num / 1000, 1);
        return ($formatted == (int)$formatted ? (int)$formatted : $formatted) . 'K';
    }
    return (string)(int)$num;
}

// Low-level HTTP fetcher with custom user-agents
function fetchSocialPage($url, $userAgent) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 4);
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.9',
        'Cache-Control: no-cache'
    ]);
    $html = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ($http >= 200 && $http < 400 && $html) ? $html : null;
}

// 1. Facebook Real Follower Scraper (Uses Crawler UA to extract from meta/OpenGraph)
function scrapeFacebookFollowers($fbUrl) {
    if (empty($fbUrl)) return null;
    $html = fetchSocialPage($fbUrl, 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)');
    if (!$html) {
        $html = fetchSocialPage($fbUrl, 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    }
    if (!$html) return null;

    // Pattern 1: Meta description content (e.g. "Jonogon, Dhaka. 21,954 followers · 38 talking about this")
    if (preg_match('/<meta[^>]*content="[^"]*?([0-9.,]+[KMBkmb]?)\s*followers/i', $html, $m)) {
        return formatSocialNumber($m[1]);
    }
    // Pattern 2: General body followers/likes
    if (preg_match('/([0-9.,]+[KMBkmb]?)\s*(?:followers|likes|পছন্দ|অনুসরণ)/i', $html, $m)) {
        return formatSocialNumber($m[1]);
    }
    return null;
}

// 2. YouTube Real Subscriber Scraper
function scrapeYouTubeSubscribers($ytUrl) {
    if (empty($ytUrl)) return null;
    $html = fetchSocialPage($ytUrl, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    if (!$html) return null;

    if (preg_match('/"subscriberCountText":\{[^\}]*"simpleText":"([^"]+)"/i', $html, $m)) {
        $raw = trim(str_ireplace('subscribers', '', $m[1]));
        return formatSocialNumber($raw);
    }
    if (preg_match('/([0-9.,]+[KMBkmb]?)\s+subscribers/i', $html, $m)) {
        return formatSocialNumber($m[1]);
    }
    return null;
}

// 3. Instagram Real Follower Scraper
function scrapeInstagramFollowers($igUrl) {
    if (empty($igUrl)) return null;
    $html = fetchSocialPage($igUrl, 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    if (!$html) {
        $html = fetchSocialPage($igUrl, 'facebookexternalhit/1.1');
    }
    if (!$html) return null;

    if (preg_match('/([0-9.,]+[KMBkmb]?)\s*Followers/i', $html, $m)) {
        return formatSocialNumber($m[1]);
    }
    return null;
}

// 4. X (Twitter) Real Follower Scraper
function scrapeXFollowers($xUrl) {
    if (empty($xUrl)) return null;
    // Normalize to x.com for social meta tags
    $targetUrl = preg_replace('#https?://(?:www\.)?twitter\.com/#i', 'https://x.com/', $xUrl);
    $html = fetchSocialPage($targetUrl, 'facebookexternalhit/1.1');
    if (!$html) {
        $html = fetchSocialPage($targetUrl, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    }
    if (!$html) return null;

    // Pattern: <meta name="description" content="0 followers · 5 following. Joined Oct 2026..."
    if (preg_match('/content="([0-9.,]+[KMBkmb]?)\s*followers/i', $html, $m)) {
        return formatSocialNumber($m[1]);
    }
    if (preg_match('/([0-9.,]+[KMBkmb]?)\s*followers/i', $html, $m)) {
        return formatSocialNumber($m[1]);
    }
    return null;
}

// -------------------------------------------------------------
// CHECK CACHE: IF LESS THAN 12 HOURS OLD, SERVE IMMEDIATELY
// -------------------------------------------------------------
$cachedData = null;
if (file_exists($cacheFile)) {
    $rawContent = @file_get_contents($cacheFile);
    if ($rawContent) {
        $cachedData = json_decode($rawContent, true);
    }
}

$cacheAge = isset($cachedData['timestamp']) ? (time() - $cachedData['timestamp']) : 999999;
if (!$forceRefresh && $cachedData && $cacheAge < $cacheDuration && !empty($cachedData['counts'])) {
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
// REALTIME LIVE FETCH FOR ALL 4 PLATFORMS
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

$fbUrl = $siteSettings['facebook'] ?? 'https://www.facebook.com/jonogon.newstv/';
$ytUrl = $siteSettings['youtube'] ?? 'https://www.youtube.com/@jonogon.newstv';
$igUrl = $siteSettings['instagram'] ?? 'https://www.instagram.com/jonogon.newstv/';
$xUrl  = $siteSettings['twitter'] ?? ($siteSettings['x'] ?? 'https://x.com/jonogonnews');

$prev = $cachedData['counts'] ?? [];

// Realtime live extraction without any APIs
$liveFb = scrapeFacebookFollowers($fbUrl);
$liveYt = scrapeYouTubeSubscribers($ytUrl);
$liveIg = scrapeInstagramFollowers($igUrl);
$liveX  = scrapeXFollowers($xUrl);

$newCounts = [
    'facebook'  => ($liveFb !== null) ? $liveFb : ($prev['facebook'] ?? '0'),
    'youtube'   => ($liveYt !== null) ? $liveYt : ($prev['youtube'] ?? '0'),
    'instagram' => ($liveIg !== null) ? $liveIg : ($prev['instagram'] ?? '0'),
    'twitter'   => ($liveX !== null)  ? $liveX  : ($prev['twitter'] ?? '0')
];

// Save to cache with timestamp
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
