<?php
/**
 * Jonogon News (জনগণ.নিউজ) - Dynamic Open Graph & Social Share Handler
 * Generates SEO-friendly Open Graph meta tags for Facebook, WhatsApp, Messenger, Twitter, etc.
 * Supports direct article loading with 0ms delay via preloaded state.
 */

// 1. Detect Host & Protocol
$isHttps = (
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
    ($_SERVER['SERVER_PORT'] ?? 80) == 443 ||
    (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
);
$protocol = $isHttps ? 'https://' : 'http://';
$httpHost = $_SERVER['HTTP_HOST'] ?? 'jonogon.news';
$origin = $protocol . $httpHost;

// 2. Extract Identifier (ID, PostId, or Slug)
$identifier = trim($_GET['slug'] ?? ($_GET['id'] ?? ($_GET['news'] ?? ($_GET['article'] ?? ''))));

if (empty($identifier)) {
    $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '';
    if (preg_match('#/(?:news|article|p)/([^/?#]+)#i', $uriPath, $matches)) {
        $identifier = urldecode(trim($matches[1]));
    }
}

// 3. Connect to Database and Query Article
$article = null;
if (!empty($identifier)) {
    try {
        require_once __DIR__ . '/api/db.php';
        header('Content-Type: text/html; charset=utf-8');

        if (!empty($pdo)) {
            $stmt = $pdo->prepare("SELECT `id`, `post_id`, `slug`, `title_bn`, `title_en`, `kicker`, `subtitle`, `excerpt_bn`, `excerpt_en`, `category_id`, `category_bn`, `featured_image`, `author`, `published_at`, `created_at`, `views`, `status` FROM `news_posts` WHERE (`id` = ? OR `post_id` = ? OR `slug` = ?) LIMIT 1");
            $stmt->execute([$identifier, $identifier, $identifier]);
            $found = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($found && ($found['status'] === 'approved' || $found['status'] === 'published' || empty($found['status']))) {
                $article = $found;
            }
        }
    } catch (Exception $e) {
        error_log("Share.php query error: " . $e->getMessage());
    }
}

// 4. Locate Base HTML Template (index.html)
$htmlTemplate = '';
$possibleIndexFiles = [
    __DIR__ . '/index.html',
    __DIR__ . '/frontend/dist/index.html'
];
foreach ($possibleIndexFiles as $filePath) {
    if (file_exists($filePath)) {
        $htmlTemplate = file_get_contents($filePath);
        break;
    }
}

if (empty($htmlTemplate)) {
    // Minimal fallback if index.html cannot be read
    $htmlTemplate = '<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>জনগণ.নিউজ</title></head><body><div id="root"></div></body></html>';
}

// If no article found, output clean template
if (!$article) {
    header('Content-Type: text/html; charset=utf-8');
    echo $htmlTemplate;
    exit;
}

// 5. Prepare Dynamic Social Metadata
$cleanTitle = trim($article['title_bn'] ?: ($article['title_en'] ?: 'জনগণ.নিউজ'));
$cleanTitleAttr = htmlspecialchars($cleanTitle, ENT_QUOTES, 'UTF-8');

$cleanDesc = trim($article['excerpt_bn'] ?: ($article['subtitle'] ?: ($cleanTitle . ' - বিস্তারিত প্রতিবেদন পড়ুন জনগণ.নিউজ-এ।')));
// Limit description to 200 characters for optimal WhatsApp/Facebook display
if (mb_strlen($cleanDesc) > 200) {
    $cleanDesc = mb_substr($cleanDesc, 0, 197) . '...';
}
$cleanDescAttr = htmlspecialchars($cleanDesc, ENT_QUOTES, 'UTF-8');

// Normalize Image URL for Open Graph (Must be full absolute URL)
$rawImg = trim($article['featured_image'] ?: ($article['thumbnail_image'] ?: ''));
$imageUrl = '';
if (!empty($rawImg)) {
    if (strpos($rawImg, 'backblazeb2.com') !== false && preg_match('#uploads/\d{4}/\d{2}/[^?&"\s]+#', $rawImg, $imgMatch)) {
        $imageUrl = 'https://jonogon.news/' . $imgMatch[0];
    } elseif (strpos($rawImg, 'http://') === 0 || strpos($rawImg, 'https://') === 0) {
        $imageUrl = $rawImg;
    } else {
        $imageUrl = rtrim($origin, '/') . '/' . ltrim($rawImg, '/');
    }
} else {
    $imageUrl = rtrim($origin, '/') . '/logo.png';
}
$imageUrlAttr = htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8');

// Short Canonical URL (e.g. https://jonogon.news/news/28)
$canonicalId = $article['id'] ?: ($article['post_id'] ?: $identifier);
$canonicalUrl = rtrim($origin, '/') . '/news/' . $canonicalId;
$canonicalUrlAttr = htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8');

$siteName = 'জনগণ.নিউজ | Jonogon News';
$publishedTime = !empty($article['published_at']) ? date('c', strtotime($article['published_at'])) : date('c');

// 6. Build High-Priority Open Graph & Twitter Meta Block
$metaTags = "
    <!-- Dynamic Open Graph Meta Tags (Facebook, Messenger, WhatsApp) -->
    <title>{$cleanTitleAttr} | {$siteName}</title>
    <meta name=\"title\" content=\"{$cleanTitleAttr}\" />
    <meta name=\"description\" content=\"{$cleanDescAttr}\" />
    <link rel=\"canonical\" href=\"{$canonicalUrlAttr}\" />

    <meta property=\"og:type\" content=\"article\" />
    <meta property=\"og:url\" content=\"{$canonicalUrlAttr}\" />
    <meta property=\"og:title\" content=\"{$cleanTitleAttr}\" />
    <meta property=\"og:description\" content=\"{$cleanDescAttr}\" />
    <meta property=\"og:image\" content=\"{$imageUrlAttr}\" />
    <meta property=\"og:image:secure_url\" content=\"{$imageUrlAttr}\" />
    <meta property=\"og:image:width\" content=\"1200\" />
    <meta property=\"og:image:height\" content=\"630\" />
    <meta property=\"og:image:alt\" content=\"{$cleanTitleAttr}\" />
    <meta property=\"og:site_name\" content=\"{$siteName}\" />
    <meta property=\"og:locale\" content=\"bn_BD\" />
    <meta property=\"article:published_time\" content=\"{$publishedTime}\" />

    <!-- Twitter Card Meta Tags -->
    <meta name=\"twitter:card\" content=\"summary_large_image\" />
    <meta name=\"twitter:url\" content=\"{$canonicalUrlAttr}\" />
    <meta name=\"twitter:title\" content=\"{$cleanTitleAttr}\" />
    <meta name=\"twitter:description\" content=\"{$cleanDescAttr}\" />
    <meta name=\"twitter:image\" content=\"{$imageUrlAttr}\" />

    <!-- Preloaded Initial Article for 0ms Instant Client Render -->
    <script>
      window.__INITIAL_ARTICLE__ = " . json_encode([
        'id' => $article['post_id'] ?: ('news-' . $article['id']),
        'db_id' => (int)$article['id'],
        'postId' => $article['post_id'] ?: '',
        'slug' => $article['slug'] ?: '',
        'title' => $article['title_bn'] ?: '',
        'titleBn' => $article['title_bn'] ?: '',
        'titleEn' => $article['title_en'] ?: '',
        'kicker' => $article['kicker'] ?: '',
        'subtitle' => $article['subtitle'] ?: '',
        'excerpt' => $article['excerpt_bn'] ?: '',
        'excerptBn' => $article['excerpt_bn'] ?: '',
        'category' => $article['category_id'] ?: 'bangladesh',
        'categoryId' => $article['category_id'] ?: 'bangladesh',
        'categoryBn' => $article['category_bn'] ?: 'বাংলাদেশ',
        'imageUrl' => $imageUrl,
        'featuredImage' => $imageUrl,
        'author' => $article['author'] ?: 'জনগণ নিউজ ডেস্ক',
        'publishedAt' => $article['published_at'] ?: $article['created_at'],
        'createdAt' => $article['created_at'],
        'views' => (int)($article['views'] ?? 0),
        'status' => $article['status'] ?: 'published'
      ], JSON_UNESCAPED_UNICODE) . ";
    </script>
";

// 7. Replace Existing Static Meta Tags in Template
// Remove old title and old og meta tags
$htmlTemplate = preg_replace('#<title>.*?</title>#si', '', $htmlTemplate);
$htmlTemplate = preg_replace('#<meta\s+name=["\'](?:title|description)["\'][^>]*>#si', '', $htmlTemplate);
$htmlTemplate = preg_replace('#<meta\s+property=["\']og:[^"\']+["\'][^>]*>#si', '', $htmlTemplate);
$htmlTemplate = preg_replace('#<meta\s+name=["\']twitter:[^"\']+["\'][^>]*>#si', '', $htmlTemplate);
$htmlTemplate = preg_replace('#<link\s+rel=["\']canonical["\'][^>]*>#si', '', $htmlTemplate);

// Inject new meta tags right after <head>
$injectedHtml = preg_replace('#<head([^>]*)>#i', "<head$1>\n" . $metaTags, $htmlTemplate, 1);

header('Content-Type: text/html; charset=utf-8');
echo $injectedHtml;
exit;
