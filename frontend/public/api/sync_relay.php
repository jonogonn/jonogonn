<?php
/**
 * Janogon News (জনগণ.নিউজ) - Bi-Directional Secure HTTPS Sync Relay
 * Path: /api/sync_relay.php
 * 
 * Works from BOTH servers:
 * - If invoked on Server 1 (188.40.132.89) -> Relays to Server 2 (198.23.142.82)
 * - If invoked on Server 2 (198.23.142.82) -> Relays to Server 1 (188.40.132.89)
 * 
 * Direct Origin IP dispatch with Host header: jonogon.news
 * Zero Port 3306 dependency. Zero credential leakage.
 */

require_once __DIR__ . '/config.php';

/**
 * Dispatch real-time update to the peer hosting server via secure HTTPS Webhook
 *
 * @param string $action 'save_news' | 'delete_news' | 'save_setting' | 'save_settings_batch' | 'save_section' | 'save_categories' | 'bulk_sync'
 * @param array $payload The article data or sync payload
 * @return bool
 */
function sendSyncWebhookToReplica($action, array $payload = []) {
    // Avoid infinite sync loops
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
        // Fallback: try both if local or unknown
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
