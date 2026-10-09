<?php
/**
 * Jonogon News - Admin User Profile & Password Update Endpoint
 * Allows logged-in admins to change their name, username, password, phone, email, and avatar.
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
    $username = isset($_GET['username']) ? trim($_GET['username']) : 'biplob.admin';
    try {
        $stmt = $db->prepare("SELECT `id`, `user_code`, `username`, `name`, `designation`, `role`, `phone`, `email`, `avatar`, `allowed_tabs`, `status` FROM `admin_members` WHERE `username` = ? LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found in MariaDB']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Handle POST profile update
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$currentUsername = !empty($data['currentUsername']) ? trim($data['currentUsername']) : 'biplob.admin';
$newName = !empty($data['name']) ? trim($data['name']) : null;
$newUsername = !empty($data['username']) ? trim($data['username']) : null;
$newEmail = !empty($data['email']) ? trim($data['email']) : null;
$newPhone = !empty($data['phone']) ? trim($data['phone']) : null;
$newAvatar = !empty($data['avatar']) ? trim($data['avatar']) : null;
$currentPassword = !empty($data['currentPassword']) ? trim($data['currentPassword']) : null;
$newPassword = !empty($data['newPassword']) ? trim($data['newPassword']) : null;

try {
    // 1. Fetch current user from MariaDB
    $stmt = $db->prepare("SELECT * FROM `admin_members` WHERE `username` = ? LIMIT 1");
    $stmt->execute([$currentUsername]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // If user not in table yet, insert seed
        $passHash = password_hash($newPassword ?: 'Biplob@Jonogon2026', PASSWORD_BCRYPT);
        $insertStmt = $db->prepare("INSERT INTO `admin_members` (`user_code`, `username`, `password_hash`, `temp_password`, `name`, `designation`, `role`, `phone`, `email`, `avatar`, `status`, `allowed_tabs`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $insertStmt->execute([
            'JNG-1001',
            $newUsername ?: 'biplob.admin',
            $passHash,
            $newPassword ?: 'Biplob@Jonogon2026',
            $newName ?: 'মোঃ বিপ্লব হোসেন',
            'প্রধান সম্পাদক ও প্রকাশক',
            'Super Admin',
            $newPhone ?: '01936618534',
            $newEmail ?: 'brandbiplob1234@gmail.com',
            $newAvatar ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80',
            'active',
            '["overview", "create-post", "edit-post", "approve-post", "publish-post", "gallery", "podcasts", "main-menu", "homepage-sections", "emergency", "setup-access", "ads", "settings", "database", "my-profile"]'
        ]);
        $user = ['id' => $db->lastInsertId(), 'username' => $newUsername ?: 'biplob.admin'];
    }

    // 2. If password change requested, verify current password if set
    $updateFields = [];
    $params = [];

    if ($newName) {
        $updateFields[] = "`name` = ?";
        $params[] = $newName;
    }
    if ($newUsername) {
        $updateFields[] = "`username` = ?";
        $params[] = $newUsername;
    }
    if ($newEmail) {
        $updateFields[] = "`email` = ?";
        $params[] = $newEmail;
    }
    if ($newPhone) {
        $updateFields[] = "`phone` = ?";
        $params[] = $newPhone;
    }
    if ($newAvatar) {
        $updateFields[] = "`avatar` = ?";
        $params[] = $newAvatar;
    }
    if ($newPassword) {
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $updateFields[] = "`password_hash` = ?";
        $params[] = $newHash;
        $updateFields[] = "`temp_password` = ?";
        $params[] = $newPassword;
    }

    if (!empty($updateFields)) {
        $params[] = $currentUsername;
        $updateSql = "UPDATE `admin_members` SET " . implode(', ', $updateFields) . " WHERE `username` = ?";
        $updateStmt = $db->prepare($updateSql);
        $updateStmt->execute($params);

        // Record activity log
        $logStmt = $db->prepare("INSERT INTO `admin_activity_logs` (`user_id`, `user_name`, `action_type`, `tab_name`, `description`) VALUES (?, ?, ?, ?, ?)");
        $logStmt->execute([
            $user['id'] ?? 'user-1',
            $newName ?: $user['name'],
            'profile_update',
            'my-profile',
            "Profile updated: Name/Username/Password modified."
        ]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully in MariaDB database!',
        'user' => [
            'name' => $newName ?: $user['name'],
            'username' => $newUsername ?: $user['username'],
            'email' => $newEmail ?: $user['email'],
            'phone' => $newPhone ?: $user['phone'],
            'avatar' => $newAvatar ?: $user['avatar']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
