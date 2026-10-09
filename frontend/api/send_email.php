<?php
/**
 * Janogon News (জনগণ.নিউজ) - Resend Transactional Email API Engine
 * Handles sending emails via Resend REST API (https://resend.com)
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $isConfigured = !empty(RESEND_API_KEY);
    echo json_encode([
        'success' => true,
        'service' => 'Janogon Resend Email Service',
        'is_configured' => $isConfigured,
        'from_email' => RESEND_FROM_EMAIL,
        'instructions' => 'Send POST request with JSON payload: { to: "email@example.com", subject: "Subject", html: "<p>Message</p>" }'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

if ($method === 'POST') {
    try {
        $apiKey = defined('RESEND_API_KEY') ? RESEND_API_KEY : '';
        if (empty($apiKey)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Resend API Key কনফিগার করা হয়নি। অনুগ্রহ করে api/config.php ফাইলে RESEND_API_KEY দিন।'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true) ?: $_POST;

        $to = $data['to'] ?? ($data['recipient'] ?? '');
        $subject = trim($data['subject'] ?? 'Jonogon News Notification');
        $html = $data['html'] ?? ($data['body'] ?? ($data['message'] ?? ''));
        $from = $data['from'] ?? RESEND_FROM_EMAIL;

        if (empty($to) || empty($html)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ইমেইল প্রাপক (to) এবং বার্তা (html) প্রয়োজন।'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $recipients = is_array($to) ? $to : [trim($to)];

        $payload = [
            'from' => $from,
            'to' => $recipients,
            'subject' => $subject,
            'html' => $html
        ];

        // Call Resend API via cURL
        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            throw new Exception('cURL Error: ' . $curlError);
        }

        $resData = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300) {
            echo json_encode([
                'success' => true,
                'message' => 'ইমেইল সফলভাবে পাঠানো হয়েছে!',
                'id' => $resData['id'] ?? null,
                'data' => $resData
            ], JSON_UNESCAPED_UNICODE);
            exit;
        } else {
            http_response_code($httpCode ?: 500);
            echo json_encode([
                'success' => false,
                'message' => 'Resend API ত্রুটি: ' . ($resData['message'] ?? $response),
                'error' => $resData
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'ইমেইল পাঠানো ব্যর্থ হয়েছে: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
