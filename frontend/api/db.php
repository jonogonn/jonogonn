<?php
/**
 * MariaDB / MySQL Database Connection & Table Schema Auto-Provisioner
 * Compatible with cPanel Hosting, LiteSpeed, Local XAMPP, and Cloud Production Servers.
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
// 1. SMART MULTI-CREDENTIAL CONNECTION FALLBACK
// -------------------------------------------------------------
$primaryHost = defined('DB_HOST') ? DB_HOST : 'localhost';
$primaryPort = defined('DB_PORT') ? DB_PORT : 3306;
$primaryDb   = defined('DB_NAME') ? DB_NAME : 'jonogonn_news_db';
$primaryUser = defined('DB_USER') ? DB_USER : 'jonogonn_admin';
$primaryPass = defined('DB_PASS') ? DB_PASS : 'Jg#Db!2026@X7pL9';

$candidateSets = [
    // 1. Primary configured credentials (cPanel localhost & 127.0.0.1)
    ['host' => $primaryHost, 'port' => $primaryPort, 'user' => $primaryUser, 'pass' => $primaryPass, 'dbname' => $primaryDb],
    ['host' => '127.0.0.1',  'port' => 3306,        'user' => $primaryUser, 'pass' => $primaryPass, 'dbname' => $primaryDb],
    ['host' => 'localhost',  'port' => 3306,        'user' => $primaryUser, 'pass' => $primaryPass, 'dbname' => $primaryDb],

    // 2. Variants of username on cPanel (with ! and l)
    ['host' => 'localhost',  'port' => 3306,        'user' => 'jonogonn_admin', 'pass' => 'Jg#Db!2026@X7pL9',  'dbname' => 'jonogonn_news_db'],
    ['host' => '127.0.0.1',  'port' => 3306,        'user' => 'jonogonn_admin', 'pass' => 'Jg#Db!2026@X7pL9',  'dbname' => 'jonogonn_news_db'],
    ['host' => 'localhost',  'port' => 3306,        'user' => 'jonogonn_admin', 'pass' => 'Jg#Dbl2026@X7pL9', 'dbname' => 'jonogonn_news_db'],
    ['host' => '127.0.0.1',  'port' => 3306,        'user' => 'jonogonn_admin', 'pass' => 'Jg#Dbl2026@X7pL9', 'dbname' => 'jonogonn_news_db'],

    // 3. User 'admin' without prefix
    ['host' => 'localhost',  'port' => 3306,        'user' => 'admin',          'pass' => 'Jg#Db!2026@X7pL9',  'dbname' => 'jonogonn_news_db'],
    ['host' => '127.0.0.1',  'port' => 3306,        'user' => 'admin',          'pass' => 'Jg#Db!2026@X7pL9',  'dbname' => 'jonogonn_news_db'],
    ['host' => 'localhost',  'port' => 3306,        'user' => 'admin',          'pass' => 'Jg#Dbl2026@X7pL9', 'dbname' => 'jonogonn_news_db'],
    ['host' => '127.0.0.1',  'port' => 3306,        'user' => 'admin',          'pass' => 'Jg#Dbl2026@X7pL9', 'dbname' => 'jonogonn_news_db'],

    // 4. cPanel primary user 'jonogonn'
    ['host' => 'localhost',  'port' => 3306,        'user' => 'jonogonn',       'pass' => '8W31aIiN!l1U-f',   'dbname' => 'jonogonn_news_db'],
    ['host' => '127.0.0.1',  'port' => 3306,        'user' => 'jonogonn',       'pass' => '8W31aIiN!l1U-f',   'dbname' => 'jonogonn_news_db'],
    ['host' => 'localhost',  'port' => 3306,        'user' => 'jonogonn',       'pass' => 'Jg#Db!2026@X7pL9',  'dbname' => 'jonogonn_news_db'],
    ['host' => '127.0.0.1',  'port' => 3306,        'user' => 'jonogonn',       'pass' => 'Jg#Db!2026@X7pL9',  'dbname' => 'jonogonn_news_db'],

    // 5. Local XAMPP environments
    ['host' => 'localhost',  'port' => 3306,        'user' => 'root',           'pass' => '',                 'dbname' => 'jonogonn_news_db'],
    ['host' => '127.0.0.1',  'port' => 3306,        'user' => 'root',           'pass' => '',                 'dbname' => 'jonogonn_news_db'],
    ['host' => 'localhost',  'port' => 3306,        'user' => 'root',           'pass' => '',                 'dbname' => 'jonogon_db'],
    ['host' => '127.0.0.1',  'port' => 3306,        'user' => 'root',           'pass' => '',                 'dbname' => 'jonogon_db'],
];

// Deduplicate candidate sets
$uniqueCandidates = [];
$seenKeys = [];
foreach ($candidateSets as $cand) {
    $sig = "{$cand['host']}:{$cand['port']}:{$cand['user']}:{$cand['pass']}:{$cand['dbname']}";
    if (!isset($seenKeys[$sig])) {
        $seenKeys[$sig] = true;
        $uniqueCandidates[] = $cand;
    }
}

$attemptedLogs = [];
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_TIMEOUT            => 3,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
];

foreach ($uniqueCandidates as $cand) {
    $h = $cand['host'];
    $p = (int)$cand['port'];
    $u = $cand['user'];
    $pw = $cand['pass'];
    $db = $cand['dbname'];

    try {
        $dsn = "mysql:host={$h};port={$p};dbname={$db};charset=utf8mb4";
        $testPdo = new PDO($dsn, $u, $pw, $options);
        $pdo = $testPdo;
        $activeConnection = [
            'host' => $h,
            'port' => $p,
            'user' => $u,
            'dbname' => $db
        ];
        $dbError = null;
        break;
    } catch (PDOException $e) {
        $attemptedLogs[] = [
            'host' => $h,
            'user' => $u,
            'dbname' => $db,
            'error_code' => $e->getCode(),
            'error_message' => $e->getMessage()
        ];
        $dbError = $e->getMessage();

        // If database doesn't exist, try creating it
        if (strpos($e->getMessage(), 'Unknown database') !== false || $e->getCode() == 1049) {
            try {
                $fallbackPdo = new PDO("mysql:host={$h};port={$p};charset=utf8mb4", $u, $pw, $options);
                $fallbackPdo->exec("CREATE DATABASE IF NOT EXISTS `{$db}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                $pdo = new PDO("mysql:host={$h};port={$p};dbname={$db};charset=utf8mb4", $u, $pw, $options);
                $activeConnection = [
                    'host' => $h,
                    'port' => $p,
                    'user' => $u,
                    'dbname' => $db
                ];
                $dbError = null;
                break;
            } catch (Exception $ex) {
                // continue
            }
        }
    }
}

// -------------------------------------------------------------
// 2. AUTO-PROVISION COMPLETE DATABASE SCHEMA IF CONNECTED
// -------------------------------------------------------------
if ($pdo) {
    try {
        // 1. Categories Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `categories` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `slug` VARCHAR(100) NOT NULL UNIQUE,
                `name` VARCHAR(150) NOT NULL,
                `name_bn` VARCHAR(150) NULL,
                `name_en` VARCHAR(150) NULL,
                `sub_group` VARCHAR(150) NULL,
                `order_index` INT DEFAULT 0,
                `icon` VARCHAR(100) NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 2. Category Master Groups
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `category_master_groups` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `group_id` VARCHAR(100) NOT NULL UNIQUE,
                `title_bn` VARCHAR(200) NOT NULL,
                `title_en` VARCHAR(200) NULL,
                `order_index` INT DEFAULT 0,
                `sub_groups_json` LONGTEXT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 3. Homepage Sections Table
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

        // 4. Podcasts Table
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

        // 5. Emergency Services Table
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

        // 6. Ads Config Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `ads_config` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `ad_slot` VARCHAR(100) NOT NULL UNIQUE,
                `ad_code` LONGTEXT NULL,
                `image_url` TEXT NULL,
                `target_url` TEXT NULL,
                `is_active` TINYINT(1) DEFAULT 1,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 7. Site Settings Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `site_settings` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `setting_key` VARCHAR(100) NOT NULL UNIQUE,
                `setting_value` LONGTEXT NULL,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 8. Breaking News Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `breaking_news` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `title_bn` VARCHAR(500) NOT NULL,
                `title_en` VARCHAR(500) NULL,
                `link_url` TEXT NULL,
                `is_active` TINYINT(1) DEFAULT 1,
                `order_index` INT DEFAULT 0,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 9. Media Gallery Table (Backblaze B2 & local uploads)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `media_gallery` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `file_name` VARCHAR(255) NOT NULL,
                `original_name` VARCHAR(255) NULL,
                `storage_key` VARCHAR(500) NULL,
                `public_url` TEXT NULL,
                `file_url` TEXT NULL,
                `file_type` VARCHAR(50) DEFAULT 'image/webp',
                `file_size` BIGINT DEFAULT 0,
                `dimensions` VARCHAR(50) NULL,
                `storage_provider` VARCHAR(50) DEFAULT 'b2',
                `caption` VARCHAR(500) NULL,
                `category` VARCHAR(100) DEFAULT 'general',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 10. Media Uploads Tracking Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `media_uploads` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `original_name` VARCHAR(255) NULL,
                `storage_key` VARCHAR(500) NOT NULL,
                `public_url` TEXT NULL,
                `file_format` VARCHAR(50) DEFAULT 'webp',
                `width` INT NULL,
                `height` INT NULL,
                `size_bytes` BIGINT NULL,
                `provider` VARCHAR(50) DEFAULT 'backblaze',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 11. News Posts Table (Master Multi-language Schema)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `news_posts` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `post_id` VARCHAR(100) NOT NULL UNIQUE,
                `slug` VARCHAR(255) NOT NULL UNIQUE,
                `title_bn` VARCHAR(500) NOT NULL,
                `title_en` VARCHAR(500) NULL,
                `kicker` VARCHAR(255) NULL,
                `subtitle` VARCHAR(500) NULL,
                `excerpt_bn` TEXT NULL,
                `excerpt_en` TEXT NULL,
                `content_bn` LONGTEXT NOT NULL,
                `content_en` LONGTEXT NULL,
                `blocks` LONGTEXT NULL COMMENT 'JSON array of editor blocks',
                `category_id` VARCHAR(100) NOT NULL DEFAULT 'bangladesh',
                `category_bn` VARCHAR(150) NOT NULL DEFAULT 'বাংলাদেশ',
                `category_en` VARCHAR(150) NOT NULL DEFAULT 'Bangladesh',
                `categories` LONGTEXT NULL COMMENT 'JSON array of categories',
                `card_category` VARCHAR(200) NULL,
                `image_caption` VARCHAR(500) DEFAULT 'ছবি: সংগৃহীত',
                `featured_image` TEXT NULL,
                `gallery_images` LONGTEXT NULL,
                `author` VARCHAR(150) NOT NULL DEFAULT 'জনগণ নিউজ ডেস্ক',
                `author_id` VARCHAR(100) DEFAULT 'user-1',
                `author_avatar` TEXT NULL,
                `reporter_name` VARCHAR(150) NULL,
                `read_time` VARCHAR(50) DEFAULT '৪ মিনিট পড়তে',
                `is_lead_hero` TINYINT(1) DEFAULT 0,
                `is_breaking` TINYINT(1) DEFAULT 0,
                `is_featured` TINYINT(1) DEFAULT 0,
                `is_video` TINYINT(1) DEFAULT 0,
                `youtube_url` TEXT NULL,
                `video_duration` VARCHAR(50) NULL,
                `status` VARCHAR(50) NOT NULL DEFAULT 'published',
                `status_note` TEXT NULL,
                `views` BIGINT UNSIGNED DEFAULT 0,
                `shares_count` INT UNSIGNED DEFAULT 0,
                `seo_title` VARCHAR(300) NULL,
                `seo_description` TEXT NULL,
                `seo_keywords` VARCHAR(500) NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 12. Legacy news Table for Backward Compatibility
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `news` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `post_id` VARCHAR(100) NULL UNIQUE,
                `title` VARCHAR(500) NOT NULL,
                `title_en` VARCHAR(500) NULL,
                `kicker` VARCHAR(255) NULL,
                `slug` VARCHAR(255) NOT NULL UNIQUE,
                `category_id` VARCHAR(100) NULL,
                `category_bn` VARCHAR(150) NULL,
                `category_en` VARCHAR(150) NULL,
                `card_category` VARCHAR(200) NULL,
                `card_caption` VARCHAR(255) DEFAULT 'ছবি: সংগৃহীত',
                `excerpt` TEXT NULL,
                `content` LONGTEXT NOT NULL,
                `blocks` LONGTEXT NULL,
                `featured_image` TEXT NULL,
                `thumbnail_image` TEXT NULL,
                `author` VARCHAR(150) DEFAULT 'জনগণ নিউজ ডেস্ক',
                `status` VARCHAR(50) DEFAULT 'published',
                `revision_note` TEXT NULL,
                `views` INT DEFAULT 0,
                `is_lead_hero` TINYINT(1) DEFAULT 0,
                `is_highlighted` TINYINT(1) DEFAULT 0,
                `is_breaking` TINYINT(1) DEFAULT 0,
                `is_video` TINYINT(1) DEFAULT 0,
                `video_duration` VARCHAR(50) NULL,
                `tags` TEXT NULL,
                `meta_title` VARCHAR(255) NULL,
                `meta_desc` TEXT NULL,
                `focus_keyword` VARCHAR(150) NULL,
                `date_bn` VARCHAR(100) NULL,
                `date_en` VARCHAR(100) NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 13. Admin Members Table: Removed (User ID details not stored in MariaDB)
        $pdo->exec("DROP TABLE IF EXISTS `admin_members`;");

        // 14. Activity Logs & Backup Logs
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `admin_activity_logs` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` VARCHAR(100) NULL,
                `username` VARCHAR(100) NULL,
                `action_type` VARCHAR(100) NOT NULL,
                `description` TEXT NULL,
                `ip_address` VARCHAR(100) NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `backup_logs` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `backup_type` VARCHAR(100) NOT NULL,
                `destination` VARCHAR(100) DEFAULT 'Backblaze B2',
                `storage_key` VARCHAR(500) NULL,
                `status` VARCHAR(50) DEFAULT 'success',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 15. Schema Auto-Migrations: Safely add missing columns to existing tables
        $tablesToCheck = ['news_posts', 'news'];
        foreach ($tablesToCheck as $tbl) {
            try {
                $checkTbl = $pdo->query("SHOW TABLES LIKE '{$tbl}'");
                if ($checkTbl && $checkTbl->rowCount() > 0) {
                    $colsResult = $pdo->query("SHOW COLUMNS FROM `{$tbl}`")->fetchAll(PDO::FETCH_COLUMN);
                    $colsLower = array_map('strtolower', $colsResult);

                    if (!in_array('blocks', $colsLower)) {
                        $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `blocks` LONGTEXT NULL");
                    }
                    if (!in_array('kicker', $colsLower)) {
                        $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `kicker` VARCHAR(255) NULL");
                    }
                    if (!in_array('card_category', $colsLower)) {
                        $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `card_category` VARCHAR(200) NULL");
                    }
                    if (!in_array('categories', $colsLower) && $tbl === 'news_posts') {
                        $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `categories` LONGTEXT NULL");
                    }
                    if (!in_array('gallery_images', $colsLower) && $tbl === 'news_posts') {
                        $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `gallery_images` LONGTEXT NULL");
                    }
                }
            } catch (Exception $colEx) {
                // ignore
            }
        }

        // Auto-migrate media_gallery table columns
        try {
            $checkMg = $pdo->query("SHOW TABLES LIKE 'media_gallery'");
            if ($checkMg && $checkMg->rowCount() > 0) {
                $mgCols = array_map('strtolower', $pdo->query("SHOW COLUMNS FROM `media_gallery`")->fetchAll(PDO::FETCH_COLUMN));
                if (!in_array('storage_key', $mgCols)) {
                    $pdo->exec("ALTER TABLE `media_gallery` ADD COLUMN `storage_key` VARCHAR(500) NULL");
                }
                if (!in_array('public_url', $mgCols)) {
                    $pdo->exec("ALTER TABLE `media_gallery` ADD COLUMN `public_url` TEXT NULL");
                }
                if (!in_array('file_url', $mgCols)) {
                    $pdo->exec("ALTER TABLE `media_gallery` ADD COLUMN `file_url` TEXT NULL");
                }
                if (!in_array('original_name', $mgCols)) {
                    $pdo->exec("ALTER TABLE `media_gallery` ADD COLUMN `original_name` VARCHAR(255) NULL");
                }
                if (!in_array('storage_provider', $mgCols)) {
                    $pdo->exec("ALTER TABLE `media_gallery` ADD COLUMN `storage_provider` VARCHAR(50) DEFAULT 'b2'");
                }
            }
        } catch (Exception $mgEx) {
            // ignore
        }

    } catch (Exception $schemaErr) {
        // Continue if schema tables exist
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
            'message' => 'MariaDB ডাটাবেজ সফলভাবে সংযুক্ত এবং সম্পূর্ণ সক্রিয়!',
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
            'attempted_summary' => $attemptedLogs,
            'cpanel_checklist' => [
                'step_1' => 'cPanel-এ লগইন করুন (nexus.webfastdns.com:2083)',
                'step_2' => '"MySQL Databases"-এ প্রবেশ করুন',
                'step_3' => 'নিশ্চিত করুন "jonogonn_news_db" ডাটাবেজটি তৈরি আছে',
                'step_4' => '"Add User to Database" সেকশনে user "jonogonn_admin" এবং database "jonogonn_news_db" সিলেক্ট করে "Add" বাটনে ক্লিক করুন',
                'step_5' => '"ALL PRIVILEGES" চেকবক্সে টিক দিয়ে "Make Changes" বাটন চাপুন',
                'step_6' => 'MySQL Users তালিকা থেকে "jonogonn_admin" এর পাসওয়ার্ড পরিবর্তন করে দিন: Jg#Db!2026@X7pL9'
            ]
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
