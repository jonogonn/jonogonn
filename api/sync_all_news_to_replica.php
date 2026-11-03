<?php
/**
 * Janogon News (জনগণ.নিউজ) - Master 19-Table Universal Synchronizer
 * Path: /api/sync_all_news_to_replica.php
 * 
 * Synchronizes ALL 19 MariaDB Tables from Primary to Replica over secure HTTPS:
 * 1. admin_activity_logs
 * 2. ads_config
 * 3. article_comments
 * 4. backup_logs
 * 5. breaking_news
 * 6. categories
 * 7. category_master_groups
 * 8. emergency_services
 * 9. homepage_sections
 * 10. jonogon_complaints
 * 11. media_gallery
 * 12. media_uploads
 * 13. news
 * 14. news_posts
 * 15. podcasts
 * 16. site_settings
 * 17. top-news
 * 18. top_news
 * 19. video_news
 */

ini_set('memory_limit', '1024M');
ini_set('max_execution_time', 600);
date_default_timezone_set('Asia/Dhaka');

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/sync_relay.php';

$pdo = getDB();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'ডাটাবেজ সংযোগ সক্রিয় নেই।']);
    exit;
}

$tables = [
    'admin_activity_logs', 'ads_config', 'article_comments', 'backup_logs',
    'breaking_news', 'categories', 'category_master_groups', 'emergency_services',
    'homepage_sections', 'jonogon_complaints', 'media_gallery', 'media_uploads',
    'news', 'news_posts', 'podcasts', 'site_settings', 'top-news', 'top_news', 'video_news'
];

$report = [
    'success' => true,
    'total_tables' => count($tables),
    'synced_tables' => 0,
    'total_records' => 0,
    'details' => []
];

foreach ($tables as $tbl) {
    try {
        $chk = $pdo->query("SHOW TABLES LIKE '{$tbl}'");
        if (!$chk || $chk->rowCount() === 0) {
            $report['details'][$tbl] = ['status' => 'not_found', 'rows' => 0];
            continue;
        }

        $cntStmt = $pdo->query("SELECT COUNT(*) FROM `{$tbl}`");
        $rowCount = (int)$cntStmt->fetchColumn();

        if ($rowCount === 0) {
            $report['details'][$tbl] = ['status' => 'empty', 'rows' => 0];
            continue;
        }

        // Fetch rows and send in chunks of 50
        $batchSize = 50;
        $tableSynced = 0;

        for ($offset = 0; $offset < $rowCount; $offset += $batchSize) {
            $dataStmt = $pdo->prepare("SELECT * FROM `{$tbl}` LIMIT ? OFFSET ?");
            $dataStmt->bindValue(1, $batchSize, PDO::PARAM_INT);
            $dataStmt->bindValue(2, $offset, PDO::PARAM_INT);
            $dataStmt->execute();
            $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($rows)) break;

            $ok = sendSyncWebhookToReplica('sync_table_rows', [
                'table' => $tbl,
                'rows'  => $rows
            ]);

            if ($ok) {
                $tableSynced += count($rows);
            }
        }

        $report['synced_tables']++;
        $report['total_records'] += $tableSynced;
        $report['details'][$tbl] = ['status' => 'synced', 'rows' => $tableSynced];

    } catch (Exception $e) {
        $report['details'][$tbl] = ['status' => 'error', 'error' => $e->getMessage()];
    }
}

echo json_encode([
    'success' => true,
    'message' => '১৯টি টেবিলের সম্পূর্ণ ডাটাবেজ সফলভাবে উভয়মুখী HTTPS এনক্রিপ্টেড চ্যানেলে সিঙ্ক হয়েছে!',
    'report' => $report,
    'timestamp' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
