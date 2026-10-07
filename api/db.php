<?php
/**
 * MariaDB Database Connection & Auto-Table Initialization for Janogon News
 * Designed for standard XAMPP MariaDB/MySQL environment.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = '127.0.0.1';
$port = 3306;
$user = 'root';
$pass = '';
$dbname = 'janogon_db';

try {
    // 1. Connect to MySQL server
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ]);

    // 2. Ensure Database exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbname`");

    // 3. Ensure Categories Table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `categories` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `slug` VARCHAR(100) NOT NULL UNIQUE,
            `name_bn` VARCHAR(150) NOT NULL,
            `name_en` VARCHAR(150) NULL,
            `sub_group` VARCHAR(150) NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // 4. Ensure News Table exists with full Bangla and Social Card fields
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
            `status` ENUM('draft', 'review', 'pending_approval', 'revision', 'published', 'archived') DEFAULT 'published',
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

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'MariaDB Connection Error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
