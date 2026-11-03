<?php
/**
 * Janogon News (জনগণ.নিউজ) - Universal Real-Time Database Replication Helper
 * Path: /api/sync_relay.php
 * 
 * Works for ALL 19 MariaDB Tables:
 * - admin_activity_logs, ads_config, article_comments, backup_logs, breaking_news
 * - categories, category_master_groups, emergency_services, homepage_sections
 * - jonogon_complaints, media_gallery, media_uploads, news, news_posts
 * - podcasts, site_settings, top-news, top_news, video_news
 */

require_once __DIR__ . '/config.php';

/**
 * Universal Sync Dispatcher for any table mutation
 *
 * @param string $action 'sync_table_rows' | 'delete_table_row' | 'execute_raw' | legacy actions
 * @param array $payload
 * @return bool
 */
function sendSyncWebhookToReplica($action, array $payload = []) {
    // Prevent infinite sync feedback loops
    if (!empty($_SERVER['HTTP_X_SYNC_SIGNATURE']) || !empty($_POST['_is_sync_request'])) {
        return false;
    }

    $secret = defined('REPLICA_SYNC_SECRET') ? trim(REPLICA_SYNC_SECRET) : '';
    if (empty($secret)) {
        return false;
    }

    $serverIp = $_SERVER['SERVER_ADDR'] ?? ($_SERVER['LOCAL_ADDR'] ?? '');
    $targetIps = [];

    // Determine target peer based on current server IP
    if ($serverIp === '188.40.132.89' || (function_exists('getActiveDbNode') && getActiveDbNode() === 'primary')) {
        $targetIps[] = '198.23.142.82'; // Send to Server 2
    } elseif ($serverIp === '198.23.142.82' || (function_exists('getActiveDbNode') && getActiveDbNode() === 'secondary')) {
        $targetIps[] = '188.40.132.89'; // Send to Server 1
    } else {
        $targetIps = ['198.23.142.82', '188.40.132.89'];
    }

    $timestamp = time();
    $body = json_encode([
        'action'    => $action,
        'payload'   => $payload,
        'timestamp' => $timestamp
    ], JSON_UNESCAPED_UNICODE);

    $signature = hash_hmac('sha256', $timestamp . '.' . $body, $secret);

    $success = false;
    foreach ($targetIps as $peerIp) {
        if ($peerIp === $serverIp) continue;

        $targetUrl = "https://{$peerIp}/api/webhook_sync.php";
        $ch = curl_init($targetUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Host: jonogon.news',
            'Content-Type: application/json; charset=utf-8',
            'X-Sync-Timestamp: ' . $timestamp,
            'X-Sync-Signature: ' . $signature
        ]);

        $resp = @curl_exec($ch);
        $httpCode = @curl_getinfo($ch, CURLINFO_HTTP_CODE);
        @curl_close($ch);

        if ($httpCode === 200) {
            $success = true;
        }
    }

    return $success;
}

/**
 * Convenience helper to sync any generic row insert or update across all 19 tables
 */
function syncTableRowToPeer($tableName, array $rowFields) {
    return sendSyncWebhookToReplica('sync_table_rows', [
        'table' => $tableName,
        'rows'  => [$rowFields]
    ]);
}

/**
 * Convenience helper to sync generic row deletion across any table
 */
function syncTableDeleteToPeer($tableName, $identifierColumn, $identifierValue) {
    return sendSyncWebhookToReplica('delete_table_row', [
        'table'  => $tableName,
        'column' => $identifierColumn,
        'value'  => $identifierValue
    ]);
}
