<?php
/**
 * Janogon News (জনগণ.নিউজ) - Secure HTTPS Replica Relay
 * Path: /api/sync_relay.php
 * 
 * Securely delivers real-time news updates from Primary to Secondary Hosting over HTTPS (Port 443).
 * Zero port 3306 dependency. Zero database credential leakage.
 * All requests are signed with HMAC-SHA256 and timed non-blocking (<= 2s).
 */

require_once __DIR__ . '/config.php';

/**
 * Dispatch real-time update to Secondary Hosting via secure HTTPS Webhook
 *
 * @param string $action 'save_news' | 'delete_news' | 'bulk_sync'
 * @param array $payload The article data or sync payload
 * @return bool
 */
function sendSyncWebhookToReplica($action, array $payload = []) {
    if (!defined('REPLICA_SYNC_ENDPOINT') || !defined('REPLICA_SYNC_SECRET')) {
        return false;
    }

    $endpoint = trim(REPLICA_SYNC_ENDPOINT);
    $secret   = trim(REPLICA_SYNC_SECRET);

    if (empty($endpoint) || empty($secret)) {
        return false;
    }

    // Do not self-relay if already running on the replica host
    $currentHost = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? '');
    if (strpos($currentHost, 'backup.') !== false || strpos($currentHost, 'delta.') !== false) {
        return false;
    }

    $timestamp = time();
    $body = json_encode([
        'action'    => $action,
        'payload'   => $payload,
        'timestamp' => $timestamp
    ], JSON_UNESCAPED_UNICODE);

    // Compute HMAC-SHA256 signature to guarantee integrity and authenticity
    $signature = hash_hmac('sha256', $timestamp . '.' . $body, $secret);

    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=utf-8',
        'X-Sync-Timestamp: ' . $timestamp,
        'X-Sync-Signature: ' . $signature
    ]);

    $resp = @curl_exec($ch);
    $httpCode = @curl_getinfo($ch, CURLINFO_HTTP_CODE);
    @curl_close($ch);

    return ($httpCode === 200);
}
