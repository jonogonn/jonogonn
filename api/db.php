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
// AUTO-INITIALIZE TABLES IF NOT ALREADY CREATED IN CPANEL
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

        // 3. News Table (Matching cPanel Schema + Rich Social Card Fields)
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

        // 4. Backup Logs Table
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
