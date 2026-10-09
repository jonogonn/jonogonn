<?php
/**
 * Jonogon News - Admin Panel Activity Logger Endpoint
 * Records each and every action/step done by users in MariaDB `admin_activity_logs` table.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Return recent activity logs
    try {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $stmt = $db->prepare("SELECT * FROM `admin_activity_logs` ORDER BY `created_at` DESC LIMIT ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'logs' => $logs]);
    } catch (Exception $e) {
        echo json_encode(['success' => true, 'logs' => []]);
    }
    exit;
}

// Handle POST - Record a new action
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$userId = !empty($data['userId']) ? trim($data['userId']) : 'user-1';
$userName = !empty($data['userName']) ? trim($data['userName']) : 'মোঃ বিপ্লব হোসেন';
$actionType = !empty($data['actionType']) ? trim($data['actionType']) : 'general_action';
$tabName = !empty($data['tabName']) ? trim($data['tabName']) : 'overview';
$targetId = !empty($data['targetId']) ? trim($data['targetId']) : null;
$description = !empty($data['description']) ? trim($data['description']) : 'Admin panel action performed';
$details = !empty($data['details']) ? json_encode($data['details'], JSON_UNESCAPED_UNICODE) : null;
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

try {
    $stmt = $db->prepare("INSERT INTO `admin_activity_logs` 
        (`user_id`, `user_name`, `action_type`, `tab_name`, `target_id`, `description`, `details`, `ip_address`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $userName, $actionType, $tabName, $targetId, $description, $details, $ipAddress]);

    echo json_encode(['success' => true, 'log_id' => $db->lastInsertId()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
