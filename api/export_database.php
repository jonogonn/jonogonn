<?php
/**
 * Jonogon News - cPanel MariaDB Live Database SQL Dump & Exporter
 * Generates ready-to-import SQL backup of all database tables with 1 click.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$format = isset($_GET['format']) ? $_GET['format'] : 'sql'; // 'sql' or 'json'
$db = getDB();

if (!$db) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'MariaDB ডাটাবেজ সংযোগ সক্রিয় নেই: ' . ($dbError ?? 'Unknown error')], JSON_UNESCAPED_UNICODE);
    exit;
}

$tables = [
    'news_posts',
    'categories',
    'category_master_groups',
    'homepage_sections',
    'podcasts',
    'emergency_services',
    'ads_config',
    'site_settings',
    'media_gallery',
    'breaking_news',
    'admin_activity_logs'
];

$dateStr = date('Y-m-d_H-i-s');
$filename = "jonogon_mariadb_backup_{$dateStr}.sql";

// Start generating SQL dump
$sqlDump = "-- ====================================================================\n";
$sqlDump .= "-- JONOGON NEWS (জনগণ.নিউজ) - CPANEL MARIADB DATABASE BACKUP DUMP\n";
$sqlDump .= "-- Generated At: " . date('Y-m-d H:i:s') . "\n";
$sqlDump .= "-- Database: " . DB_NAME . " | Host: " . DB_HOST . "\n";
$sqlDump .= "-- ====================================================================\n\n";
$sqlDump .= "SET FOREIGN_KEY_CHECKS = 0;\n";
$sqlDump .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
$sqlDump .= "SET time_zone = \"+06:00\";\n\n";

foreach ($tables as $table) {
    try {
        $stmt = $db->query("SHOW CREATE TABLE `{$table}`");
        $row = $stmt->fetch(PDO::FETCH_NUM);
        if ($row && isset($row[1])) {
            $sqlDump .= "\n-- --------------------------------------------------------\n";
            $sqlDump .= "-- Table structure for `{$table}`\n";
            $sqlDump .= "-- --------------------------------------------------------\n";
            $sqlDump .= "DROP TABLE IF EXISTS `{$table}`;\n";
            $sqlDump .= $row[1] . ";\n\n";

            // Dump table rows
            $dataStmt = $db->query("SELECT * FROM `{$table}`");
            $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($rows)) {
                $sqlDump .= "-- Dumping data for `{$table}`\n";
                foreach ($rows as $r) {
                    $keys = array_map(function($k) { return "`{$k}`"; }, array_keys($r));
                    $values = array_map(function($v) use ($db) {
                        return $v === null ? 'NULL' : $db->quote($v);
                    }, array_values($r));

                    $sqlDump .= "INSERT INTO `{$table}` (" . implode(', ', $keys) . ") VALUES (" . implode(', ', $values) . ");\n";
                }
                $sqlDump .= "\n";
            }
        }
    } catch (Exception $e) {
        // Table might not exist yet
        continue;
    }
}
$sqlDump .= "SET FOREIGN_KEY_CHECKS = 1;\n";
$sqlDump .= "COMMIT;\n";

// Log this backup export action
try {
    $logStmt = $db->prepare("INSERT INTO `admin_activity_logs` (`user_id`, `user_name`, `action_type`, `tab_name`, `description`) VALUES (?, ?, ?, ?, ?)");
    $logStmt->execute(['user-1', 'মোঃ বিপ্লব হোসেন', 'backup_export', 'database', "cPanel MariaDB SQL backup downloaded ({$filename})"]);
} catch (Exception $e) {}

// Serve downloadable SQL file
header('Content-Type: application/sql; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . strlen($sqlDump));
header('Pragma: no-cache');
header('Expires: 0');

echo $sqlDump;
exit;
