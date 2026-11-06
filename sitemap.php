<?php
/**
 * Jonogon News (jonogon.news) - High-Performance XML Sitemap Engine
 * Generates dynamic, cached XML sitemaps for Google News and regular search engines:
 * 1. sitemap-news.xml: Dedicated Google News feed (articles published within the last 48 hours).
 * 2. sitemap.xml: Complete archive sitemap covering all published news, categories, and core pages.
 */

// Memory and execution limits for large archive generation
ini_set('memory_limit', '256M');
date_default_timezone_set('Asia/Dhaka');

// Enable Gzip output compression if supported by client
if (!ob_start('ob_gzhandler')) {
    ob_start();
}

// Set base headers
header('Content-Type: application/xml; charset=utf-8');
header('X-Robots-Tag: noindex, follow');

// Determine request type ('news' or 'main')
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$typeParam  = strtolower($_GET['type'] ?? '');
$forceParam = !empty($_GET['force']) || !empty($_GET['refresh']);

$isNewsSitemap = false;
if ($typeParam === 'news' || strpos($requestUri, 'sitemap-news.xml') !== false) {
    $isNewsSitemap = true;
}

// Cache file paths and TTL configurations
$cacheFileName = $isNewsSitemap ? 'sitemap-news.xml' : 'sitemap.xml';
$cacheFilePath = __DIR__ . '/' . $cacheFileName;
$cacheTtlSeconds = $isNewsSitemap ? 900 : 3600; // 15 minutes for News, 60 minutes for Main

// Detect canonical origin
$isHttps = (
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
    ($_SERVER['SERVER_PORT'] ?? 80) == 443 ||
    (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
);
$protocol = $isHttps ? 'https://' : 'http://';
$httpHost = $_SERVER['HTTP_HOST'] ?? 'jonogon.news';
$baseUrl  = 'https://jonogon.news';

if (strpos($httpHost, 'localhost') !== false || strpos($httpHost, '127.0.0.1') !== false) {
    $baseUrl = $protocol . $httpHost;
    if (strpos($requestUri, '/janogon.news') !== false) {
        $baseUrl .= '/janogon.news';
    }
}

// ---------------------------------------------------------------------------
// 1. FAST CACHE SERVING WITH 304 NOT MODIFIED SUPPORT
// ---------------------------------------------------------------------------
if (!$forceParam && file_exists($cacheFilePath) && filesize($cacheFilePath) > 100) {
    $fileModTime = filemtime($cacheFilePath);
    $cacheAge = time() - $fileModTime;

    if ($cacheAge < $cacheTtlSeconds) {
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $fileModTime) . ' GMT');
        header('Cache-Control: public, max-age=' . ($cacheTtlSeconds - $cacheAge));
        header('X-Sitemap-Cache: HIT');

        if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
            $ifModSince = strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']);
            if ($ifModSince && $ifModSince >= $fileModTime) {
                http_response_code(304);
                exit;
            }
        }

        readfile($cacheFilePath);
        exit;
    }
}

// ---------------------------------------------------------------------------
// 2. HELPER FUNCTIONS
// ---------------------------------------------------------------------------
function sanitizeSitemapText($text) {
    if (!$text) return '';
    $clean = preg_replace('/[^\x{0009}\x{000a}\x{000d}\x{0020}-\x{D7FF}\x{E000}-\x{FFFD}]+/u', ' ', $text);
    return htmlspecialchars(trim($clean), ENT_XML1, 'UTF-8');
}

function resolveSitemapImageUrl($rawUrl, $baseUrl) {
    if (empty($rawUrl) || !is_string($rawUrl)) return '';
    $rawUrl = trim($rawUrl);
    if (strpos($rawUrl, 'data:image') === 0) return ''; // Exclude inline base64
    if (strpos($rawUrl, 'backblazeb2.com') !== false) {
        if (preg_match('#uploads/\d{4}/\d{2}/[^?&"\'\s]+#', $rawUrl, $m)) {
            return $baseUrl . '/' . $m[0];
        }
    }
    if (strpos($rawUrl, 'http://') === 0 || strpos($rawUrl, 'https://') === 0) {
        return $rawUrl;
    }
    return $baseUrl . '/' . ltrim($rawUrl, '/');
}

// ---------------------------------------------------------------------------
// 3. DATABASE CONNECTION INITIALIZATION
// ---------------------------------------------------------------------------
$pdo = null;
try {
    if (file_exists(__DIR__ . '/api/db.php')) {
        require_once __DIR__ . '/api/db.php';
        header('Content-Type: application/xml; charset=utf-8');
        global $pdo;
    }
} catch (Throwable $dbEx) {
    error_log('Sitemap Engine DB Notice: ' . $dbEx->getMessage());
}

// Fallback to cached copy if DB fails and old cache exists
if (!$pdo && file_exists($cacheFilePath) && filesize($cacheFilePath) > 100) {
    header('X-Sitemap-Cache: STALE-FALLBACK');
    readfile($cacheFilePath);
    exit;
}

// ---------------------------------------------------------------------------
// 4. GENERATION FOR GOOGLE NEWS SITEMAP (LAST 48 HOURS)
// ---------------------------------------------------------------------------
if ($isNewsSitemap) {
    $newsArticles = [];

    if ($pdo) {
        try {
            // Fetch articles published within the last 48 hours
            $stmt = $pdo->prepare("
                SELECT `id`, `post_id`, `slug`, `title_bn`, `title_en`, `featured_image`, `published_at`, `created_at`
                FROM `news_posts`
                WHERE (`status` IN ('approved', 'published') OR `status` IS NULL OR `status` = '')
                  AND COALESCE(`published_at`, `created_at`) >= (NOW() - INTERVAL 48 HOUR)
                ORDER BY COALESCE(`published_at`, `created_at`) DESC
                LIMIT 500
            ");
            $stmt->execute();
            $newsArticles = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // If no news published in last 48 hours, fall back to recent 25 articles to avoid empty feed
            if (empty($newsArticles)) {
                $recentStmt = $pdo->query("
                    SELECT `id`, `post_id`, `slug`, `title_bn`, `title_en`, `featured_image`, `published_at`, `created_at`
                    FROM `news_posts`
                    WHERE (`status` IN ('approved', 'published') OR `status` IS NULL OR `status` = '')
                    ORDER BY COALESCE(`published_at`, `created_at`) DESC
                    LIMIT 25
                ");
                if ($recentStmt) {
                    $newsArticles = $recentStmt->fetchAll(PDO::FETCH_ASSOC);
                }
            }
        } catch (Throwable $e) {
            error_log('Google News query error: ' . $e->getMessage());
        }
    }

    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
    $xml .= '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"' . "\n";
    $xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

    foreach ($newsArticles as $row) {
        $slug = trim($row['slug'] ?? ($row['id'] ?? ($row['post_id'] ?? '')));
        if (!$slug) continue;

        $dateVal = $row['published_at'] ?: ($row['created_at'] ?: 'now');
        $pubTimestamp = strtotime($dateVal) ?: time();
        $isoDate = date('c', $pubTimestamp);

        $title = $row['title_bn'] ?: ($row['title_en'] ?: 'সংবাদ');
        $imgUrl = resolveSitemapImageUrl($row['featured_image'] ?: ($row['thumbnail_image'] ?: ''), $baseUrl);

        $xml .= "  <url>\n";
        $xml .= "    <loc>" . htmlspecialchars($baseUrl . '/news/' . urlencode($slug), ENT_XML1, 'UTF-8') . "</loc>\n";
        $xml .= "    <news:news>\n";
        $xml .= "      <news:publication>\n";
        $xml .= "        <news:name>জনগণ.নিউজ</news:name>\n";
        $xml .= "        <news:language>bn</news:language>\n";
        $xml .= "      </news:publication>\n";
        $xml .= "      <news:publication_date>" . $isoDate . "</news:publication_date>\n";
        $xml .= "      <news:title>" . sanitizeSitemapText($title) . "</news:title>\n";
        $xml .= "    </news:news>\n";

        if ($imgUrl) {
            $xml .= "    <image:image>\n";
            $xml .= "      <image:loc>" . htmlspecialchars($imgUrl, ENT_XML1, 'UTF-8') . "</image:loc>\n";
            $xml .= "      <image:title>" . sanitizeSitemapText($title) . "</image:title>\n";
            $xml .= "    </image:image>\n";
        }

        $xml .= "  </url>\n";
    }

    $xml .= '</urlset>';

    // Atomically persist to disk cache
    @file_put_contents($cacheFilePath, $xml);
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
    header('Cache-Control: public, max-age=' . $cacheTtlSeconds);
    header('X-Sitemap-Cache: MISS-REBUILT');
    echo $xml;
    exit;
}

// ---------------------------------------------------------------------------
// 5. GENERATION FOR COMPLETE ARCHIVE SITEMAP (sitemap.xml)
// ---------------------------------------------------------------------------
$nowIso = date('c');

$staticPages = [
    ['loc' => '/', 'changefreq' => 'hourly', 'priority' => '1.0'],
    ['loc' => '/about', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/contact', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/editorial-policy', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/privacy-policy', 'changefreq' => 'monthly', 'priority' => '0.5'],
    ['loc' => '/terms', 'changefreq' => 'monthly', 'priority' => '0.5'],
    ['loc' => '/advertisement', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/founder', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/team', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => '/search', 'changefreq' => 'daily', 'priority' => '0.5']
];

$categories = [];
$allArticles = [];

if ($pdo) {
    try {
        // Fetch categories
        $catStmt = $pdo->query("SELECT `slug` FROM `categories` ORDER BY `order_index` ASC");
        if ($catStmt) {
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        // Fetch up to 20,000 published articles for complete archive index
        $artStmt = $pdo->query("
            SELECT `id`, `post_id`, `slug`, `title_bn`, `featured_image`, `published_at`, `created_at`
            FROM `news_posts`
            WHERE `status` IN ('approved', 'published') OR `status` IS NULL OR `status` = ''
            ORDER BY COALESCE(`published_at`, `created_at`) DESC
            LIMIT 20000
        ");
        if ($artStmt) {
            $allArticles = $artStmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } catch (Throwable $e) {
        error_log('Archive sitemap query error: ' . $e->getMessage());
    }
}

// Fallback categories if empty
if (empty($categories)) {
    $fallbackSlugs = [
        'bangladesh', 'international', 'economy', 'politics',
        'sports', 'technology', 'lifestyle', 'entertainment',
        'opinion', 'education', 'remittance-warriors', 'district-news'
    ];
    foreach ($fallbackSlugs as $fSlug) {
        $categories[] = ['slug' => $fSlug];
    }
}

$xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
$xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

// A. Static core pages
foreach ($staticPages as $p) {
    $xml .= "  <url>\n";
    $xml .= "    <loc>" . htmlspecialchars($baseUrl . $p['loc'], ENT_XML1, 'UTF-8') . "</loc>\n";
    $xml .= "    <lastmod>" . $nowIso . "</lastmod>\n";
    $xml .= "    <changefreq>" . $p['changefreq'] . "</changefreq>\n";
    $xml .= "    <priority>" . $p['priority'] . "</priority>\n";
    $xml .= "  </url>\n";
}

// B. Category pages
foreach ($categories as $c) {
    $slug = trim($c['slug'] ?? '');
    if (!$slug) continue;
    $xml .= "  <url>\n";
    $xml .= "    <loc>" . htmlspecialchars($baseUrl . '/category/' . urlencode($slug), ENT_XML1, 'UTF-8') . "</loc>\n";
    $xml .= "    <lastmod>" . $nowIso . "</lastmod>\n";
    $xml .= "    <changefreq>hourly</changefreq>\n";
    $xml .= "    <priority>0.8</priority>\n";
    $xml .= "  </url>\n";
}

// C. All published articles in archive
foreach ($allArticles as $art) {
    $slug = trim($art['slug'] ?? ($art['id'] ?? ($art['post_id'] ?? '')));
    if (!$slug) continue;

    $dateVal = $art['published_at'] ?: ($art['created_at'] ?: $nowIso);
    $ts = strtotime($dateVal) ?: time();
    $isoDate = date('c', $ts);

    $title = $art['title_bn'] ?? '';
    $imgUrl = resolveSitemapImageUrl($art['featured_image'] ?: ($art['thumbnail_image'] ?: ''), $baseUrl);

    $xml .= "  <url>\n";
    $xml .= "    <loc>" . htmlspecialchars($baseUrl . '/news/' . urlencode($slug), ENT_XML1, 'UTF-8') . "</loc>\n";
    $xml .= "    <lastmod>" . $isoDate . "</lastmod>\n";
    $xml .= "    <changefreq>daily</changefreq>\n";
    $xml .= "    <priority>0.9</priority>\n";

    if ($imgUrl) {
        $xml .= "    <image:image>\n";
        $xml .= "      <image:loc>" . htmlspecialchars($imgUrl, ENT_XML1, 'UTF-8') . "</image:loc>\n";
        if ($title) {
            $xml .= "      <image:title>" . sanitizeSitemapText($title) . "</image:title>\n";
        }
        $xml .= "    </image:image>\n";
    }

    $xml .= "  </url>\n";
}

$xml .= '</urlset>';

// Atomically save to disk cache
@file_put_contents($cacheFilePath, $xml);
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: public, max-age=' . $cacheTtlSeconds);
header('X-Sitemap-Cache: MISS-REBUILT');
echo $xml;
exit;
