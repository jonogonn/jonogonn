<?php
/**
 * MariaDB / MySQL Database Connection & High-Performance Connector
 * Optimized for Instant Response Times (<5ms)
 * Auto-provisioning only runs when requested (?setup=1 or ?migrate=1)
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = null;
$dbError = null;
$activeConnection = null;

function getDB() {
    global $pdo;
    return $pdo;
}

// -------------------------------------------------------------
// 1. FAST ENVIRONMENT-AWARE CONNECTION (NO SLOW 18-SET LOOPS)
// -------------------------------------------------------------
$primaryHost = defined('DB_HOST') ? DB_HOST : 'localhost';
$primaryPort = defined('DB_PORT') ? (int)DB_PORT : 3306;
$primaryDb   = defined('DB_NAME') ? DB_NAME : 'jonogonn_news_db';
$primaryUser = defined('DB_USER') ? DB_USER : 'jonogonn_admin';
$primaryPass = defined('DB_PASS') ? DB_PASS : 'Jg#Db!2026@X7pL9';

$isLocal = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1'])
    || in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1'])
    || php_sapi_name() === 'cli'
    || (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], '192.168.') === 0)
    || (isset($_SERVER['SERVER_ADDR']) && in_array($_SERVER['SERVER_ADDR'], ['127.0.0.1', '::1']));

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_TIMEOUT            => 2,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
];

// Candidates ordered for instant 1st-try success:
$candidateSets = [];
if ($isLocal) {
    // 1. Local XAMPP root with empty password (connects in <1ms)
    $candidateSets[] = ['host' => 'localhost', 'port' => 3306, 'user' => 'root', 'pass' => '', 'dbname' => $primaryDb];
    $candidateSets[] = ['host' => '127.0.0.1', 'port' => 3306, 'user' => 'root', 'pass' => '', 'dbname' => $primaryDb];
    // 2. Fallback to configured user
    $candidateSets[] = ['host' => $primaryHost, 'port' => $primaryPort, 'user' => $primaryUser, 'pass' => $primaryPass, 'dbname' => $primaryDb];
} else {
    // 1. Production cPanel credentials
    $candidateSets[] = ['host' => $primaryHost, 'port' => $primaryPort, 'user' => $primaryUser, 'pass' => $primaryPass, 'dbname' => $primaryDb];
    $candidateSets[] = ['host' => '127.0.0.1',  'port' => 3306,        'user' => $primaryUser, 'pass' => $primaryPass, 'dbname' => $primaryDb];
    $candidateSets[] = ['host' => 'localhost',  'port' => 3306,        'user' => 'root',        'pass' => '',          'dbname' => $primaryDb];
}

$attemptedLogs = [];
foreach ($candidateSets as $cand) {
    $h  = $cand['host'];
    $p  = (int)$cand['port'];
    $u  = $cand['user'];
    $pw = $cand['pass'];
    $db = $cand['dbname'];

    try {
        $dsn = "mysql:host={$h};port={$p};dbname={$db};charset=utf8mb4";
        $pdo = new PDO($dsn, $u, $pw, $options);
        $activeConnection = [
            'host'   => $h,
            'port'   => $p,
            'user'   => $u,
            'dbname' => $db
        ];
        $dbError = null;
        break; // Successfully connected! Exit loop immediately.
    } catch (PDOException $e) {
        $attemptedLogs[] = [
            'host'          => $h,
            'user'          => $u,
            'dbname'        => $db,
            'error_code'    => $e->getCode(),
            'error_message' => $e->getMessage()
        ];
        $dbError = $e->getMessage();
    }
}

// -------------------------------------------------------------
// 2. SCHEMA PROVISIONING (RUNS ONLY WHEN EXPLICITLY REQUESTED)
// -------------------------------------------------------------
function provisionDatabaseSchema($pdo) {
    if (!$pdo) return;
    try {
        // 1. Categories Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `categories` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `slug` VARCHAR(100) NOT NULL UNIQUE,
                `name` VARCHAR(150) NOT NULL,
                `name_bn` VARCHAR(150) NULL,
                `name_en` VARCHAR(150) NULL,
                `master_group_id` VARCHAR(100) DEFAULT 'general',
                `master_group_bn` VARCHAR(150) DEFAULT 'সাধারণ',
                `master_group_en` VARCHAR(150) DEFAULT 'General',
                `sub_group` VARCHAR(150) NULL,
                `order_index` INT DEFAULT 0,
                `icon` VARCHAR(100) NULL,
                `is_nav_visible` TINYINT(1) DEFAULT 1,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 2. Category Master Groups
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `category_master_groups` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `group_id` VARCHAR(100) NOT NULL UNIQUE,
                `group_key` VARCHAR(100) NULL,
                `title_bn` VARCHAR(200) NOT NULL,
                `name_bn` VARCHAR(200) NULL,
                `title_en` VARCHAR(200) NULL,
                `name_en` VARCHAR(200) NULL,
                `order_index` INT DEFAULT 0,
                `sub_groups_json` LONGTEXT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 3. Homepage Sections
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `homepage_sections` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `section_id` VARCHAR(100) NOT NULL UNIQUE,
                `title_bn` VARCHAR(200) NOT NULL,
                `title_en` VARCHAR(200) NULL,
                `is_visible` TINYINT(1) DEFAULT 1,
                `order_index` INT DEFAULT 0,
                `layout_type` VARCHAR(100) DEFAULT 'standard',
                `config_json` LONGTEXT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 4. Podcasts
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `podcasts` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `title_bn` VARCHAR(300) NOT NULL,
                `title_en` VARCHAR(300) NULL,
                `audio_url` TEXT NULL,
                `video_url` TEXT NULL,
                `host_name` VARCHAR(150) DEFAULT 'জনগণ পডকাস্ট টিম',
                `duration` VARCHAR(50) DEFAULT '৪৫ মিনিট',
                `status` VARCHAR(50) DEFAULT 'published',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 5. Emergency Services
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `emergency_services` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `service_id` VARCHAR(100) NOT NULL UNIQUE,
                `name_bn` VARCHAR(200) NOT NULL,
                `name_en` VARCHAR(200) NULL,
                `phone` VARCHAR(50) NOT NULL,
                `district` VARCHAR(100) DEFAULT 'সারাদেশ',
                `category` VARCHAR(100) DEFAULT 'জরুরি হেল্পলাইন',
                `order_index` INT DEFAULT 0,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 6. News Posts
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `news_posts` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `post_id` VARCHAR(100) NOT NULL UNIQUE,
                `slug` VARCHAR(255) NOT NULL UNIQUE,
                `title_bn` VARCHAR(500) NOT NULL,
                `title_en` VARCHAR(500) NULL,
                `title` VARCHAR(500) NULL,
                `kicker` VARCHAR(200) NULL,
                `subtitle` VARCHAR(300) NULL,
                `content_bn` LONGTEXT NULL,
                `content_en` LONGTEXT NULL,
                `content` LONGTEXT NULL,
                `excerpt_bn` TEXT NULL,
                `excerpt_en` TEXT NULL,
                `excerpt` TEXT NULL,
                `blocks` LONGTEXT NULL,
                `category_id` VARCHAR(100) NOT NULL DEFAULT 'bangladesh',
                `category_bn` VARCHAR(150) DEFAULT 'বাংলাদেশ',
                `category_en` VARCHAR(150) DEFAULT 'Bangladesh',
                `categories` LONGTEXT NULL,
                `card_category` VARCHAR(200) DEFAULT NULL,
                `card_image_position` VARCHAR(64) DEFAULT 'center center',
                `card_caption` VARCHAR(500) DEFAULT 'ছবি: সংগৃহীত',
                `image_caption` VARCHAR(500) DEFAULT 'ছবি: সংগৃহীত',
                `featured_image` TEXT DEFAULT NULL,
                `thumbnail_image` TEXT DEFAULT NULL,
                `gallery_images` LONGTEXT NULL,
                `author` VARCHAR(150) NOT NULL DEFAULT 'জনগণ নিউজ ডেস্ক',
                `author_id` VARCHAR(64) DEFAULT 'user-1',
                `author_avatar` TEXT DEFAULT NULL,
                `reporter_name` VARCHAR(150) DEFAULT NULL,
                `read_time` VARCHAR(50) DEFAULT '৪ মিনিট পড়তে',
                `status` VARCHAR(50) NOT NULL DEFAULT 'published',
                `status_note` TEXT DEFAULT NULL,
                `views` BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
                `shares_count` INT(11) UNSIGNED NOT NULL DEFAULT 0,
                `is_highlighted` TINYINT(1) DEFAULT 0,
                `is_featured` TINYINT(1) DEFAULT 0,
                `is_lead_hero` TINYINT(1) DEFAULT 0,
                `is_breaking` TINYINT(1) DEFAULT 0,
                `is_video` TINYINT(1) DEFAULT 0,
                `youtube_url` TEXT NULL,
                `video_duration` VARCHAR(50) DEFAULT NULL,
                `seo_title` VARCHAR(300) DEFAULT NULL,
                `seo_description` TEXT DEFAULT NULL,
                `seo_keywords` VARCHAR(500) DEFAULT NULL,
                `published_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (`status`),
                INDEX (`category_id`),
                INDEX (`created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {}
}

// Only run heavy schema DDL operations if explicitly requested (?setup=1 or ?migrate=1)
if (isset($_GET['setup']) || isset($_GET['init']) || isset($_GET['migrate'])) {
    if ($pdo) {
        provisionDatabaseSchema($pdo);
    }
}

// -------------------------------------------------------------
// 3. DIRECT ACCESS DIAGNOSTIC & HEALTHCHECK HANDLER
// -------------------------------------------------------------
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'db.php') {
    if ($pdo && $activeConnection) {
        $tablesList = [];
        try {
            $tStmt = $pdo->query("SHOW TABLES");
            $tablesList = $tStmt ? $tStmt->fetchAll(PDO::FETCH_COLUMN) : [];
        } catch (Exception $e) {}

        $postsCount = 0;
        try {
            if (in_array('news_posts', $tablesList)) {
                $postsCount = (int)$pdo->query("SELECT COUNT(*) FROM `news_posts`")->fetchColumn();
            } elseif (in_array('news', $tablesList)) {
                $postsCount = (int)$pdo->query("SELECT COUNT(*) FROM `news`")->fetchColumn();
            }
        } catch (Exception $e) {}

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'status' => 'connected',
            'message' => 'MariaDB ডাটাবেজ সফলভাবে সংযুক্ত এবং উচ্চ-গতিতে সক্রিয়!',
            'connection' => [
                'host' => $activeConnection['host'],
                'user' => $activeConnection['user'],
                'database' => $activeConnection['dbname'],
                'server_version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION)
            ],
            'tables_count' => count($tablesList),
            'tables' => $tablesList,
            'news_posts_count' => $postsCount,
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'status' => 'disconnected',
            'error_type' => 'DB_CONNECTION_FAILED',
            'message' => 'MariaDB ডাটাবেজে সংযোগ করা যায়নি: ' . ($dbError ?? 'Unknown error'),
            'last_error' => $dbError,
            'attempted_summary' => $attemptedLogs
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
