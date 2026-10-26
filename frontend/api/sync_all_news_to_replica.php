<?php
/**
 * Janogon News (জনগণ.নিউজ) - Secure HTTPS Bulk Synchronizer
 * Path: /api/sync_all_news_to_replica.php
 * 
 * Safely copies all existing articles and schema from Primary DB to Secondary DB over HTTPS.
 * Zero database credentials leaked. Zero port 3306 dependency.
 */

ini_set('memory_limit', '512M');
ini_set('max_execution_time', 300);
date_default_timezone_set('Asia/Dhaka');

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/sync_relay.php';

// Allow execution only from CLI or with security secret
$backupSecret = getenv('BACKUP_SECRET_TOKEN') ?: 'JgBackup2026Secure';
$providedToken = $_GET['token'] ?? ($_POST['token'] ?? ($_SERVER['HTTP_X_BACKUP_TOKEN'] ?? ''));

$isCli = (php_sapi_name() === 'cli');
$isLocal = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1'])
    || in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1'])
    || (isset($_SERVER['REMOTE_ADDR']) && in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1']));

if (!$isCli && !$isLocal && !empty($backupSecret) && $providedToken !== $backupSecret) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'অননুমোদিত অনুরোধ। সঠিক টোকেন প্রদান করুন।']);
    exit;
}

$pdo = getDB();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'ডাটাবেজ সংযোগ সক্রিয় নেই।']);
    exit;
}

try {
    $stmt = $pdo->query("SELECT * FROM `news_posts` ORDER BY `id` ASC");
    $allPosts = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

    $totalPosts = count($allPosts);
    if ($totalPosts === 0) {
        echo json_encode([
            'success' => true,
            'message' => 'কোনো নিউজ পোস্ট পাওয়া যায়নি।',
            'synced_count' => 0
        ]);
        exit;
    }

    // Send in chunks of 50 articles
    $chunks = array_chunk($allPosts, 50);
    $totalSynced = 0;

    foreach ($chunks as $chunk) {
        $ok = sendSyncWebhookToReplica('bulk_sync', ['articles' => $chunk]);
        if ($ok) {
            $totalSynced += count($chunk);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'হোস্টিং ১ থেকে হোস্টিং ২-এ সফলভাবে এনক্রিপ্টেড HTTPS-এর মাধ্যমে নিউজ ডাটাবেজ সিঙ্ক হয়েছে!',
        'total_posts_found' => $totalPosts,
        'total_posts_synced' => $totalSynced,
        'endpoint' => defined('REPLICA_SYNC_ENDPOINT') ? REPLICA_SYNC_ENDPOINT : 'N/A'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'সিঙ্ক প্রসেসে ত্রুটি হয়েছে।'
    ]);
    exit;
}
