<?php
/**
 * MariaDB / MySQL Database Connection & Table Schema
 * Compatible with cPanel Hosting, Local XAMPP, and Cloud Production Servers.
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

$host   = DB_HOST;
$port   = DB_PORT;
$dbname = DB_NAME;
$user   = DB_USER;
$pass   = DB_PASS;

$pdo = null;
$dbError = null;

function getDB() {
    global $pdo;
    return $pdo;
}


// List of credential sets to try (configured cPanel credentials first, then local XAMPP defaults)
$credSets = [
    ['user' => $user, 'pass' => $pass, 'dbname' => $dbname],
    ['user' => 'root', 'pass' => '', 'dbname' => $dbname],
    ['user' => 'root', 'pass' => '', 'dbname' => 'jonogon_db'],
    ['user' => 'root', 'pass' => '', 'dbname' => 'jonogonn_news_db'],
];

foreach ($credSets as $c) {
    try {
        $dsn = "mysql:host=$host;port=$port;dbname={$c['dbname']};charset=utf8mb4";
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ]);
        $dbError = null;
        break;
    } catch (PDOException $e) {
        $dbError = $e->getMessage();
        // If database doesn't exist, attempt creation
        if (strpos($e->getMessage(), 'Unknown database') !== false || $e->getCode() == 1049) {
            try {
                $fallbackPdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $c['user'], $c['pass']);
                $fallbackPdo->exec("CREATE DATABASE IF NOT EXISTS `{$c['dbname']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                $pdo = new PDO("mysql:host=$host;port=$port;dbname={$c['dbname']};charset=utf8mb4", $c['user'], $c['pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]);
                $dbError = null;
                break;
            } catch (Exception $ex) {
                $dbError = $ex->getMessage();
            }
        }
    }
}

if (!$pdo && basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'db.php') {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error_type' => 'DB_CONNECTION_FAILED',
        'message' => 'MariaDB ডাটাবেজে সংযোগ করা যায়নি: ' . $dbError,
        'hint' => 'cPanel-এর api/config.php ফাইলে সঠিক DB_NAME, DB_USER এবং DB_PASS দিন।'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// -------------------------------------------------------------
// AUTO-INITIALIZE TABLES & RUN SCHEMA MIGRATIONS IF NEEDED
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
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 2. Media Uploads Table (for Backblaze B2 and WebP Tracking)
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

        // 3. News Posts Table (Master Multi-language Schema)
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

        // 4. Legacy `news` Table for Backward Compatibility
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

        // 5. Schema Auto-Migrations: Safely add missing columns to existing tables
        $tablesToCheck = ['news_posts', 'news'];
        foreach ($tablesToCheck as $tbl) {
            try {
                $checkTbl = $pdo->query("SHOW TABLES LIKE '{$tbl}'");
                if ($checkTbl && $checkTbl->rowCount() > 0) {
                    $colsResult = $pdo->query("SHOW COLUMNS FROM `{$tbl}`")->fetchAll(PDO::FETCH_COLUMN);
                    if (!in_array('blocks', $colsResult)) {
                        $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `blocks` LONGTEXT NULL");
                    }
                    if (!in_array('kicker', $colsResult)) {
                        $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `kicker` VARCHAR(255) NULL");
                    }
                    if (!in_array('card_category', $colsResult)) {
                        $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `card_category` VARCHAR(200) NULL");
                    }
                    if (!in_array('categories', $colsResult) && $tbl === 'news_posts') {
                        $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `categories` LONGTEXT NULL");
                    }
                }
            } catch (Exception $colEx) {
                // ignore
            }
        }

        // 6. Admin Members Table (For Access Control & Team Credentials)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `admin_members` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_code` VARCHAR(50) NOT NULL UNIQUE,
                `username` VARCHAR(100) NOT NULL UNIQUE,
                `password_hash` VARCHAR(255) NULL,
                `temp_password` VARCHAR(255) NULL,
                `name` VARCHAR(200) NOT NULL,
                `designation` VARCHAR(200) NOT NULL,
                `role` VARCHAR(100) NOT NULL DEFAULT 'Reporter',
                `phone` VARCHAR(50) NOT NULL,
                `email` VARCHAR(255) NOT NULL UNIQUE,
                `avatar` TEXT NULL,
                `status` VARCHAR(20) NOT NULL DEFAULT 'active',
                `allowed_tabs` LONGTEXT NOT NULL,
                `last_login` DATETIME NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 7. Backup Logs Table
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

    } catch (Exception $tblErr) {
        // If tables already exist or minor schema permission warning, continue
    }
}
