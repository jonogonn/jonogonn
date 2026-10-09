<?php
/**
 * Jonogon News - Admin User Profile & Password Update Endpoint
 * User credentials are kept private (Managed via Supabase Auth & Local Storage, not MariaDB)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $username = isset($_GET['username']) ? trim($_GET['username']) : 'biplob.admin';
    echo json_encode([
        'success' => true,
        'message' => 'Profile managed via Supabase / Browser Storage.',
        'user' => [
            'username' => $username,
            'name' => 'মোঃ বিপ্লব হোসেন',
            'designation' => 'প্রধান সম্পাদক ও প্রকাশক',
            'role' => 'Super Admin',
            'email' => 'brandbiplob1234@gmail.com',
            'phone' => '01936618534',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80'
        ]
    ], JSON_UNESCAPED_UNICODE);
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

$newName = !empty($data['name']) ? trim($data['name']) : 'মোঃ বিপ্লব হোসেন';
$newUsername = !empty($data['username']) ? trim($data['username']) : 'biplob.admin';
$newEmail = !empty($data['email']) ? trim($data['email']) : 'brandbiplob1234@gmail.com';
$newPhone = !empty($data['phone']) ? trim($data['phone']) : '01936618534';
$newAvatar = !empty($data['avatar']) ? trim($data['avatar']) : '';

echo json_encode([
    'success' => true,
    'message' => 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!',
    'user' => [
        'name' => $newName,
        'username' => $newUsername,
        'email' => $newEmail,
        'phone' => $newPhone,
        'avatar' => $newAvatar
    ]
], JSON_UNESCAPED_UNICODE);
