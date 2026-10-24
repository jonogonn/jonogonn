<?php
/**
 * Janogon News - Automated MariaDB Export & Upload to Admin Backblaze B2 Bucket
 * Path: /api/backup_db_to_b2.php
 * 
 * Target Bucket: Jonogon.News.PrimaryBackup (or fallback jonogon.news.backup)
 * Storage Path: database-backups/YYYY/MM/jonogon_db_backup_TIMESTAMP.sql
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/b2_storage.php';
require_once __DIR__ . '/upload.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Optional security token check if token provided in env
$backupSecret = getenv('BACKUP_SECRET_TOKEN') ?: 'JgBackup2026Secure';
$providedToken = $_GET['token'] ?? ($_POST['token'] ?? ($_SERVER['HTTP_X_BACKUP_TOKEN'] ?? ''));

// Allow execution without token if accessed from localhost or CLI or admin session
$isCli = (php_sapi_name() === 'cli');
$isLocal = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1'])
    || in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1'])
    || (isset($_SERVER['REMOTE_ADDR']) && in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1']));

if (!$isCli && !$isLocal && !empty($backupSecret) && $providedToken !== $backupSecret) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized backup request. Provide valid token.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database not connected. Cannot perform backup.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $timestamp = date('Y-m-d_H-i-s');
    $year = date('Y');
    $month = date('m');
    $activeNode = function_exists('getActiveDbNode') ? getActiveDbNode() : 'primary';
    $activeDb = $activeConnection['dbname'] ?? 'jonogonn_news_db';

    // 1. Generate Complete SQL Dump
    $sqlDump = "-- ========================================================\n";
    $sqlDump .= "-- Jonogon News (জনগণ.নিউজ) Automated Database Backup\n";
    $sqlDump .= "-- Exported on: " . date('Y-m-d H:i:s') . "\n";
    $sqlDump .= "-- Active Node: " . $activeNode . " (" . $activeDb . ")\n";
    $sqlDump .= "-- Target Bucket: " . B2_BACKUP_BUCKET_NAME . "\n";
    $sqlDump .= "-- ========================================================\n\n";
    $sqlDump .= "SET NAMES utf8mb4;\n";
    $sqlDump .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tables as $tbl) {
        $createStmt = $pdo->query("SHOW CREATE TABLE `{$tbl}`");
        $createRow = $createStmt->fetch(PDO::FETCH_NUM);
        $sqlDump .= "-- Table structure for table `{$tbl}`\n";
        $sqlDump .= "DROP TABLE IF EXISTS `{$tbl}`;\n";
        $sqlDump .= $createRow[1] . ";\n\n";

        // Table Rows
        $rowsStmt = $pdo->query("SELECT * FROM `{$tbl}`");
        $rows = $rowsStmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($rows)) {
            $sqlDump .= "-- Dumping data for table `{$tbl}` (" . count($rows) . " rows)\n";
            $sqlDump .= "LOCK TABLES `{$tbl}` WRITE;\n";

            foreach ($rows as $row) {
                $cols = array_map(function($c) { return "`" . str_replace("`", "``", $c) . "`"; }, array_keys($row));
                $vals = array_map(function($v) use ($pdo) {
                    if ($v === null) return "NULL";
                    return $pdo->quote($v);
                }, array_values($row));

                $sqlDump .= "INSERT INTO `{$tbl}` (" . implode(", ", $cols) . ") VALUES (" . implode(", ", $vals) . ");\n";
            }
            $sqlDump .= "UNLOCK TABLES;\n\n";
        }
    }

    $sqlDump .= "SET FOREIGN_KEY_CHECKS = 1;\n";
    $sqlDump .= "-- Backup completed successfully.\n";

    // 2. Write to temporary file for streaming upload
    $tempSqlFile = sys_get_temp_dir() . "/jonogon_db_backup_{$timestamp}.sql";
    file_put_contents($tempSqlFile, $sqlDump);
    $fileSize = filesize($tempSqlFile);

    // 3. Upload to Admin Backblaze B2 Bucket
    $storageKey = "database-backups/{$year}/{$month}/jonogon_news_db_backup_{$timestamp}.sql";

    // Determine target bucket
    $targetBucket = defined('B2_BACKUP_BUCKET_NAME') ? B2_BACKUP_BUCKET_NAME : 'Jonogon.News.PrimaryBackup';
    
    // Check account auth & upload
    $auth = b2AuthorizeAccount(B2_KEY_ID, B2_APPLICATION_KEY);
    if (!$auth || empty($auth['apiUrl']) || empty($auth['authorizationToken'])) {
        throw new Exception("Backblaze B2 authorization failed");
    }

    $apiUrl = $auth['apiUrl'];
    $authToken = $auth['authorizationToken'];
    $accountId = $auth['accountId'];

    // Find bucket ID for target bucket
    $bucketId = defined('B2_BACKUP_BUCKET_ID') ? B2_BACKUP_BUCKET_ID : '';

    $ch = curl_init($apiUrl . '/b2api/v2/b2_list_buckets');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['accountId' => $accountId]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: $authToken",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $bRes = curl_exec($ch);
    curl_close($ch);
    $bData = json_decode($bRes, true);

    $matchedBucketId = null;
    $actualBucketName = $targetBucket;

    if (!empty($bData['buckets']) && is_array($bData['buckets'])) {
        foreach ($bData['buckets'] as $b) {
            if (strcasecmp($b['bucketName'], $targetBucket) === 0 || $b['bucketId'] === $bucketId) {
                $matchedBucketId = $b['bucketId'];
                $actualBucketName = $b['bucketName'];
                break;
            }
        }
        // Fallback to second bucket in account if primary not in this account
        if (!$matchedBucketId) {
            foreach ($bData['buckets'] as $b) {
                if (strpos($b['bucketName'], 'backup') !== false) {
                    $matchedBucketId = $b['bucketId'];
                    $actualBucketName = $b['bucketName'];
                    break;
                }
            }
        }
    }

    if (!$matchedBucketId) {
        $matchedBucketId = $bucketId ?: '88cdee15545ef8dfab0b0f18';
    }

    // Get Upload URL for Backup Bucket
    $getUrlEndpoint = "$apiUrl/b2api/v2/b2_get_upload_url";
    $ch = curl_init($getUrlEndpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['bucketId' => $matchedBucketId]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: $authToken",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $uploadUrlRes = curl_exec($ch);
    curl_close($ch);
    $uData = json_decode($uploadUrlRes, true);

    if (empty($uData['uploadUrl']) || empty($uData['authorizationToken'])) {
        throw new Exception("Could not obtain B2 upload URL for bucket $actualBucketName");
    }

    $uploadUrl = $uData['uploadUrl'];
    $uploadAuthToken = $uData['authorizationToken'];

    // Stream SQL file to B2
    $fileBytes = file_get_contents($tempSqlFile);
    $sha1 = sha1($fileBytes);
    $b2FileName = implode('/', array_map('rawurlencode', explode('/', $storageKey)));

    $ch = curl_init($uploadUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fileBytes);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: $uploadAuthToken",
        "X-Bz-File-Name: " . $b2FileName,
        "Content-Type: application/sql",
        "Content-Length: " . strlen($fileBytes),
        "X-Bz-Content-Sha1: $sha1"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $uploadResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Clean up temporary file from disk immediately
    if (file_exists($tempSqlFile)) {
        @unlink($tempSqlFile);
    }

    if ($httpCode === 200 && $uploadResponse) {
        $resObj = json_decode($uploadResponse, true);

        // 4. Automatic 10-Day Retention Policy: Purge database backups older than 10 days
        $retentionDays = 10;
        $retentionThresholdMs = (time() - ($retentionDays * 86400)) * 1000;
        $deletedOldBackups = [];

        try {
            $listCh = curl_init($apiUrl . '/b2api/v2/b2_list_file_names');
            curl_setopt($listCh, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($listCh, CURLOPT_POST, true);
            curl_setopt($listCh, CURLOPT_POSTFIELDS, json_encode([
                'bucketId' => $matchedBucketId,
                'prefix' => 'database-backups/',
                'maxFileCount' => 100
            ]));
            curl_setopt($listCh, CURLOPT_HTTPHEADER, [
                "Authorization: $authToken",
                "Content-Type: application/json"
            ]);
            curl_setopt($listCh, CURLOPT_SSL_VERIFYPEER, false);
            $listRes = curl_exec($listCh);
            curl_close($listCh);

            $listData = json_decode($listRes, true);
            if (!empty($listData['files']) && is_array($listData['files'])) {
                foreach ($listData['files'] as $oldFile) {
                    $fileTs = $oldFile['uploadTimestamp'] ?? 0;
                    // If file is older than 10 days, delete from B2
                    if ($fileTs > 0 && $fileTs < $retentionThresholdMs) {
                        $delCh = curl_init($apiUrl . '/b2api/v2/b2_delete_file_version');
                        curl_setopt($delCh, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($delCh, CURLOPT_POST, true);
                        curl_setopt($delCh, CURLOPT_POSTFIELDS, json_encode([
                            'fileName' => $oldFile['fileName'],
                            'fileId' => $oldFile['fileId']
                        ]));
                        curl_setopt($delCh, CURLOPT_HTTPHEADER, [
                            "Authorization: $authToken",
                            "Content-Type: application/json"
                        ]);
                        curl_setopt($delCh, CURLOPT_SSL_VERIFYPEER, false);
                        $delRes = curl_exec($delCh);
                        $delHttp = curl_getinfo($delCh, CURLINFO_HTTP_CODE);
                        curl_close($delCh);

                        if ($delHttp === 200) {
                            $deletedOldBackups[] = $oldFile['fileName'];
                        }
                    }
                }
            }
        } catch (Exception $delEx) {
            // Silently continue if listing fails
        }

        // Also perform automated Master-to-Replica synchronization to DB 2 (Hosting 2)
        $replicaSyncReport = null;
        try {
            require_once __DIR__ . '/sync_replica.php';
            if (function_exists('runMasterToReplicaSync')) {
                $replicaSyncReport = runMasterToReplicaSync();
            }
        } catch (Exception $repEx) {
            $replicaSyncReport = ['error' => $repEx->getMessage()];
        }

        echo json_encode([
            'success' => true,
            'message' => 'MariaDB ডাটাবেজ সফলভাবে এক্সপোর্ট হয়ে Admin Backblaze B2 বাকেটে সংরক্ষিত হয়েছে এবং ২য় হোস্টিংয়ে ডাটা সিঙ্ক সম্পন্ন হয়েছে!',
            'backup' => [
                'bucket_name' => $actualBucketName,
                'bucket_id' => $matchedBucketId,
                'file_name' => $storageKey,
                'file_id' => $resObj['fileId'] ?? null,
                'size_bytes' => $fileSize,
                'size_kb' => round($fileSize / 1024, 2),
                'tables_backed_up' => count($tables),
                'source_database' => $activeDb,
                'source_node' => $activeNode,
                'retention_policy' => '10 days (older backups automatically deleted)',
                'purged_old_backups' => count($deletedOldBackups),
                'created_at' => date('Y-m-d H:i:s')
            ],
            'replica_sync' => $replicaSyncReport
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    } else {
        throw new Exception("B2 Upload failed with HTTP $httpCode: $uploadResponse");
    }

} catch (Exception $e) {
    if (isset($tempSqlFile) && file_exists($tempSqlFile)) {
        @unlink($tempSqlFile);
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'ডাটাবেজ ব্যাকআপ ব্যর্থ হয়েছে: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}
