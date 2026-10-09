<?php
/**
 * Jonogon News - Backblaze B2 & Cloud Images Export Manifest / Archive Downloader
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$db = getDB();
$mediaList = [];

try {
    $stmt = $db->query("SELECT * FROM `media_gallery` ORDER BY `created_at` DESC");
    $mediaList = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    // If table not initialized yet, fetch from uploads directory
    $uploadFiles = glob(__DIR__ . '/../uploads/*.*');
    foreach ($uploadFiles as $file) {
        $mediaList[] = [
            'file_name' => basename($file),
            'file_url' => '/uploads/' . basename($file),
            'file_size' => filesize($file),
            'storage_provider' => 'local',
            'created_at' => date('Y-m-d H:i:s', filemtime($file))
        ];
    }
}

$exportData = [
    'portal' => 'Jonogon News (জনগণ.নিউজ)',
    'b2_bucket' => B2_BUCKET_NAME,
    'b2_endpoint' => B2_ENDPOINT,
    'cdn_url' => CDN_BASE_URL,
    'total_assets' => count($mediaList),
    'exported_at' => date('Y-m-d H:i:s'),
    'media_assets' => $mediaList
];

$dateStr = date('Y-m-d_H-i-s');
$filename = "jonogon_b2_media_manifest_{$dateStr}.json";

header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit;
