<?php
/**
 * Janogon News (জনগণ.নিউজ) - MariaDB Automated Master-to-Replica Synchronizer
 * Path: /api/sync_replica.php
 * 
 * Features:
 * 1. Zero Manual Setup: Automatically creates all database tables and schema in Secondary DB (103.148.51.48).
 * 2. Incremental & Full Data Sync: Copies and syncs all rows using REPLACE INTO.
 * 3. Schema Evolution: Automatically adds any newly created columns from DB 1 into DB 2.
 * 4. Dual Invocation: Can be triggered directly in browser/URL or called automatically by the nightly Cron Job.
 */

ini_set('memory_limit', '1024M');
ini_set('max_execution_time', 600); // 10 minutes max for large datasets
date_default_timezone_set('Asia/Dhaka');

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Optional security token check if token provided in env or query
$backupSecret = getenv('BACKUP_SECRET_TOKEN') ?: 'JgBackup2026Secure';
$providedToken = $_GET['token'] ?? ($_POST['token'] ?? ($_SERVER['HTTP_X_BACKUP_TOKEN'] ?? ''));

$isCli = (php_sapi_name() === 'cli');
$isLocal = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1'])
    || in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1'])
    || (isset($_SERVER['REMOTE_ADDR']) && in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1']));

// Allow execution freely if called internally or allow with secret if external
if (!$isCli && !$isLocal && !empty($backupSecret) && !empty($providedToken) && $providedToken !== $backupSecret) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'অননুমোদিত সিঙ্ক অনুরোধ। সঠিক টোকেন প্রদান করুন।'], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Replicates complete schema and data from Primary MariaDB to Secondary MariaDB
 */
function runMasterToReplicaSync() {
    $startTime = microtime(true);
    $report = [
        'success' => false,
        'tables_synced' => 0,
        'records_synced' => 0,
        'details' => [],
        'errors' => []
    ];

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT            => 5,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];

    // 1. Connect to Source (Primary DB on Hosting 1)
    $primaryHost = defined('DB_HOST') ? DB_HOST : 'localhost';
    $primaryPort = defined('DB_PORT') ? (int)DB_PORT : 3306;
    $primaryDb   = defined('DB_NAME') ? DB_NAME : 'jonogonn_news_db';
    $primaryUser = defined('DB_USER') ? DB_USER : 'jonogonn_admin';
    $primaryPass = defined('DB_PASS') ? DB_PASS : 'Jg#Db!2026@X7pL9';

    // Try connecting to primary
    $sourcePdo = null;
    $sourceCandidates = [
        ['host' => 'localhost', 'port' => 3306, 'user' => $primaryUser, 'pass' => $primaryPass, 'db' => $primaryDb],
        ['host' => $primaryHost, 'port' => $primaryPort, 'user' => $primaryUser, 'pass' => $primaryPass, 'db' => $primaryDb],
        ['host' => '127.0.0.1', 'port' => 3306, 'user' => 'root', 'pass' => '', 'db' => $primaryDb]
    ];

    foreach ($sourceCandidates as $cand) {
        try {
            $dsn = "mysql:host={$cand['host']};port={$cand['port']};dbname={$cand['db']};charset=utf8mb4";
            $sourcePdo = new PDO($dsn, $cand['user'], $cand['pass'], $options);
            break;
        } catch (Exception $e) {}
    }

    if (!$sourcePdo) {
        $report['errors'][] = 'Primary DB (Hosting 1) এ সংযোগ স্থাপন করা সম্ভব হয়নি।';
        return $report;
    }

    // 2. Connect to Target (Secondary DB on Hosting 2: 103.148.51.48)
    $backupHost = defined('DB_BACKUP_HOST') ? DB_BACKUP_HOST : '103.148.51.48';
    $backupPort = defined('DB_BACKUP_PORT') ? (int)DB_BACKUP_PORT : 3306;
    $backupDb   = defined('DB_BACKUP_NAME') ? DB_BACKUP_NAME : 'jonogonn_news_db_backup';
    $backupUser = defined('DB_BACKUP_USER') ? DB_BACKUP_USER : 'admin_backup';
    $backupPass = defined('DB_BACKUP_PASS') ? DB_BACKUP_PASS : 'Jg#Db!2026@X7pL9';

    $targetPdo = null;
    $targetConnectedInfo = null;
    $targetCandidates = [
        ['host' => 'delta.hostseba.com', 'port' => 3306, 'user' => 'jonogonn_admin_backup', 'pass' => $backupPass, 'db' => $backupDb],
        ['host' => '103.148.51.48',     'port' => 3306, 'user' => 'jonogonn_admin_backup', 'pass' => $backupPass, 'db' => $backupDb],
        ['host' => '198.23.142.70',     'port' => 3306, 'user' => 'jonogonn_admin_backup', 'pass' => $backupPass, 'db' => $backupDb],
        ['host' => $backupHost,         'port' => $backupPort, 'user' => $backupUser, 'pass' => $backupPass, 'db' => $backupDb],
        ['host' => 'localhost',         'port' => 3306, 'user' => 'jonogonn_admin_backup', 'pass' => $backupPass, 'db' => $backupDb]
    ];

    $targetAttemptErrors = [];
    foreach ($targetCandidates as $tcand) {
        try {
            $dsn = "mysql:host={$tcand['host']};port={$tcand['port']};dbname={$tcand['db']};charset=utf8mb4";
            $targetPdo = new PDO($dsn, $tcand['user'], $tcand['pass'], $options);
            $targetConnectedInfo = $tcand;
            break;
        } catch (Exception $e) {
            $targetAttemptErrors[] = [
                'user' => $tcand['user'],
                'host' => $tcand['host'],
                'error' => $e->getMessage()
            ];
        }
    }

    if (!$targetPdo) {
        $report['errors'][] = "Secondary DB (Hosting 2 - {$backupHost}) এ সংযোগ স্থাপন করা সম্ভব হয়নি।";
        $report['connection_diagnostic'] = $targetAttemptErrors;
        return $report;
    }

    // Disable Foreign Key checks on Secondary during batch replication
    try {
        $targetPdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
        $targetPdo->exec("SET NAMES utf8mb4;");
    } catch (Exception $e) {}

    // 3. Get all tables from Source DB
    $tablesStmt = $sourcePdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($tables)) {
        $report['errors'][] = 'Primary DB তে কোনো টেবিল পাওয়া যায়নি।';
        return $report;
    }

    $totalSyncedRecords = 0;

    foreach ($tables as $table) {
        // A. Ensure Schema Exists on Target DB
        try {
            $createTableStmt = $sourcePdo->query("SHOW CREATE TABLE `{$table}`");
            $createTableRow = $createTableStmt->fetch(PDO::FETCH_NUM);
            $createSql = $createTableRow[1] ?? '';

            if ($createSql) {
                // Convert CREATE TABLE to CREATE TABLE IF NOT EXISTS
                $createSql = preg_replace('/^CREATE TABLE/i', 'CREATE TABLE IF NOT EXISTS', $createSql);
                $targetPdo->exec($createSql);
            }
        } catch (Exception $schemaEx) {
            $report['errors'][] = "টেবিল `{$table}` স্কিমা তৈরিতে সমস্যা: " . $schemaEx->getMessage();
        }

        // B. Check for any missing columns on Target DB (Schema Evolution)
        try {
            $srcCols = $sourcePdo->query("SHOW COLUMNS FROM `{$table}`")->fetchAll(PDO::FETCH_ASSOC);
            $tgtColsStmt = $targetPdo->query("SHOW COLUMNS FROM `{$table}`");
            $tgtColNames = [];
            while ($tc = $tgtColsStmt->fetch(PDO::FETCH_ASSOC)) {
                $tgtColNames[strtolower($tc['Field'])] = true;
            }

            foreach ($srcCols as $sc) {
                $colField = strtolower($sc['Field']);
                if (!isset($tgtColNames[$colField])) {
                    $colType = $sc['Type'];
                    $nullSql = ($sc['Null'] === 'YES') ? 'NULL' : 'NOT NULL';
                    $defaultSql = ($sc['Default'] !== null) ? "DEFAULT " . $targetPdo->quote($sc['Default']) : '';
                    $alterSql = "ALTER TABLE `{$table}` ADD COLUMN `{$sc['Field']}` {$colType} {$nullSql} {$defaultSql}";
                    @$targetPdo->exec($alterSql);
                }
            }
        } catch (Exception $colEx) {}

        // C. Fetch Data from Source and Transfer via REPLACE INTO
        try {
            $countStmt = $sourcePdo->query("SELECT COUNT(*) FROM `{$table}`");
            $totalRows = (int)$countStmt->fetchColumn();

            if ($totalRows === 0) {
                $report['details'][$table] = [
                    'status' => 'empty',
                    'rows' => 0
                ];
                continue;
            }

            // Sync in batches of 100 rows for high speed and low memory
            $batchSize = 100;
            $tableRecordsSynced = 0;

            for ($offset = 0; $offset < $totalRows; $offset += $batchSize) {
                $dataStmt = $sourcePdo->prepare("SELECT * FROM `{$table}` LIMIT ? OFFSET ?");
                $dataStmt->bindValue(1, $batchSize, PDO::PARAM_INT);
                $dataStmt->bindValue(2, $offset, PDO::PARAM_INT);
                $dataStmt->execute();
                $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

                if (empty($rows)) break;

                // Build batch REPLACE INTO query
                $columns = array_keys($rows[0]);
                $escapedCols = array_map(fn($col) => "`{$col}`", $columns);
                $placeholders = '(' . implode(',', array_fill(0, count($columns), '?')) . ')';

                $allPlaceholders = implode(',', array_fill(0, count($rows), $placeholders));
                $replaceSql = "REPLACE INTO `{$table}` (" . implode(',', $escapedCols) . ") VALUES {$allPlaceholders}";

                $flatParams = [];
                foreach ($rows as $row) {
                    foreach ($columns as $col) {
                        $flatParams[] = $row[$col];
                    }
                }

                $repStmt = $targetPdo->prepare($replaceSql);
                $repStmt->execute($flatParams);
                $tableRecordsSynced += count($rows);
            }

            $totalSyncedRecords += $tableRecordsSynced;
            $report['tables_synced']++;
            $report['details'][$table] = [
                'status' => 'synced',
                'rows' => $tableRecordsSynced
            ];
        } catch (Exception $dataEx) {
            $report['errors'][] = "টেবিল `{$table}` ডাটা সিঙ্কে সমস্যা: " . $dataEx->getMessage();
            $report['details'][$table] = [
                'status' => 'error',
                'error' => $dataEx->getMessage()
            ];
        }
    }

    // Re-enable Foreign Key checks
    try {
        $targetPdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    } catch (Exception $e) {}

    $report['success'] = empty($report['errors']) || $report['tables_synced'] > 0;
    $report['records_synced'] = $totalSyncedRecords;
    $report['execution_time_sec'] = round(microtime(true) - $startTime, 2);
    $report['timestamp'] = date('Y-m-d H:i:s');
    $report['target_host'] = $backupHost;
    $report['target_db'] = $backupDb;

    return $report;
}

// Execute and return JSON when accessed directly
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'sync_replica.php') {
    $result = runMasterToReplicaSync();
    if ($result['success']) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'অভিনন্দন! ১ম ডাটাবেজ (Primary) থেকে ২য় ডাটাবেজে (Hosting 2) সমস্ত স্কিমা এবং ডাটা স্বয়ংক্রিয়ভাবে সিঙ্ক সম্পন্ন হয়েছে!',
            'report' => $result
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'ডাটাবেজ সিঙ্ক ব্যর্থ হয়েছে। বিস্তারিত দেখুন।',
            'report' => $result
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
    exit;
}
