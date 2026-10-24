<?php
/**
 * Janogon News - Cloudflare Load Balancer & Node Health Check Endpoint
 * Path: /api/health.php
 * 
 * Response:
 * - HTTP 200: Healthy (Database & Cloud Storage Operational)
 * - HTTP 503: Unhealthy (Database down -> Cloudflare auto-fails over to Hosting 2)
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/b2_storage.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

$dbConnected = ($pdo !== null);
$dbNode = function_exists('getActiveDbNode') ? getActiveDbNode() : ($dbConnected ? 'connected' : 'failed');

// Quick B2 Auth check
$b2Auth = function_exists('b2AuthorizeAccountHelper') ? b2AuthorizeAccountHelper() : null;
$b2Status = ($b2Auth && !empty($b2Auth['authorizationToken'])) ? 'connected' : 'unreachable';

$serverHost = $_SERVER['HTTP_HOST'] ?? 'unknown';
$serverIp = $_SERVER['SERVER_ADDR'] ?? ($_SERVER['LOCAL_ADDR'] ?? '127.0.0.1');

if ($dbConnected) {
    http_response_code(200);
    echo json_encode([
        'status' => 'healthy',
        'http_code' => 200,
        'portal' => 'Janogon News (জনগণ.নিউজ)',
        'active_node' => $dbNode, // 'primary' (Hosting 1) or 'secondary' (Hosting 2)
        'database' => [
            'status' => 'connected',
            'node' => $dbNode,
            'host' => $activeConnection['host'] ?? 'localhost',
            'db_name' => $activeConnection['dbname'] ?? 'jonogonn_news_db'
        ],
        'storage' => [
            'status' => $b2Status,
            'media_bucket' => defined('B2_BUCKET_NAME') ? B2_BUCKET_NAME : 'jonogon.news',
            'backup_bucket' => defined('B2_BACKUP_BUCKET_NAME') ? B2_BACKUP_BUCKET_NAME : 'Jonogon.News.PrimaryBackup',
            'cdn_url' => defined('CDN_BASE_URL') ? CDN_BASE_URL : 'https://cdn.jonogon.news'
        ],
        'server' => [
            'host' => $serverHost,
            'ip' => $serverIp,
            'timestamp' => time(),
            'datetime' => date('Y-m-d H:i:s')
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
} else {
    // Return HTTP 503 Service Unavailable so Cloudflare redirects to Backup Origin
    http_response_code(503);
    echo json_encode([
        'status' => 'unhealthy',
        'http_code' => 503,
        'active_node' => 'failed',
        'error' => $dbError ?: 'Database connection pool exhausted across all nodes',
        'server' => [
            'host' => $serverHost,
            'ip' => $serverIp,
            'timestamp' => time()
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
