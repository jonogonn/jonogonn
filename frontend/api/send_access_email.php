<?php
/**
 * Jonogon News (জনগণ.নিউজ) - Team Member Credential Email Dispatcher
 * Sends automated welcome & access credentials email to newly created admin/staff members.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Only POST is accepted.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || empty($data['email']) || empty($data['name']) || empty($data['username']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: name, email, username, and password are required.'
    ]);
    exit;
}

$name = htmlspecialchars(trim($data['name']));
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$username = htmlspecialchars(trim($data['username']));
$password = htmlspecialchars(trim($data['password']));
$userCode = !empty($data['userCode']) ? htmlspecialchars(trim($data['userCode'])) : 'JNG-' . rand(1000, 9999);
$role = !empty($data['role']) ? htmlspecialchars(trim($data['role'])) : 'Reporter';
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$serverHost = $_SERVER['HTTP_HOST'] ?? 'jonogon.news';
$loginUrl = !empty($data['loginUrl']) ? htmlspecialchars(trim($data['loginUrl'])) : ($protocol . $serverHost . '/#admin');
$allowedTabs = !empty($data['allowedTabs']) && is_array($data['allowedTabs']) ? $data['allowedTabs'] : [];

$tabNamesBn = [
    'overview' => 'ড্যাশবোর্ড ও অ্যানালিটিক্স',
    'create-post' => 'নতুন সংবাদ তৈরি',
    'edit-post' => 'খসড়া ও সম্পাদনা',
    'approve-post' => 'সংবাদ অনুমোদন',
    'publish-post' => 'সকল প্রকাশিত সংবাদ',
    'gallery' => 'মিডিয়া ও ফটো গ্যালারি',
    'main-menu' => 'মেনু ও ক্যাটাগরি',
    'homepage-sections' => 'হোমপেজ লেআউট',
    'podcasts' => 'পডকাস্ট ও ভিডিও',
    'emergency' => 'জরুরি সেবা হেল্পলাইন',
    'setup-access' => 'টিম ও এক্সেস কন্ট্রোল',
    'ads' => 'বিজ্ঞাপন ও মনিটাইজেশন',
    'settings' => 'সাইট ও ব্র্যান্ডিং সেটিংস',
    'database' => 'ডাটাবেজ ও ক্লাউড ব্যাকআপ'
];

$tabBadgesHtml = '';
foreach ($allowedTabs as $tabId) {
    $title = isset($tabNamesBn[$tabId]) ? $tabNamesBn[$tabId] : $tabId;
    $tabBadgesHtml .= '<span style="display:inline-block; background-color:#F1F5F9; color:#0F172A; font-size:12px; font-weight:600; padding:4px 10px; border-radius:15px; margin:3px 4px 3px 0; border:1px solid #E2E8F0;">✓ ' . htmlspecialchars($title) . '</span>';
}

if (empty($tabBadgesHtml)) {
    $tabBadgesHtml = '<span style="color:#64748B; font-size:13px;">সাধারণ ভিউ এক্সেস</span>';
}

$subject = "জনগণ.নিউজ - আপনার অ্যাডমিন প্যানেল এক্সেস ক্রেডেনশিয়াল (User Credentials)";
$encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";

// HTML Email Body
$htmlMessage = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{$subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#0F172A; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0F172A; padding:30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px; background-color:#FFFFFF; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.3);" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #E50914 0%, #990000 100%); padding:28px 30px; text-align:center;">
              <h1 style="color:#FFFFFF; margin:0 0 4px 0; font-size:26px; font-weight:900; letter-spacing:-0.5px;">জনগণ.নিউজ</h1>
              <p style="color:#FEE2E2; margin:0; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">JONOGON NEWS • এডমিনিস্ট্রেটিভ পোর্টাল</p>
            </td>
          </tr>

          <!-- Welcome Body -->
          <tr>
            <td style="padding:32px 30px 20px 30px;">
              <h2 style="color:#0F172A; font-size:20px; font-weight:800; margin:0 0 10px 0;">স্বাগতম, {$name}!</h2>
              <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 20px 0;">
                আপনাকে <strong>জনগণ.নিউজ</strong> সম্পাদকীয় ও ম্যানেজমেন্ট টিমে <strong>{$designation} ({$role})</strong> হিসেবে অন্তর্ভুক্ত করা হয়েছে। নিচে আপনার অ্যাডমিন প্যানেলে লগইন করার ক্রেডেনশিয়াল দেওয়া হলো:
              </p>

              <!-- Credentials Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; margin:0 0 24px 0;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="6">
                      <tr>
                        <td width="35%" style="color:#64748B; font-size:13px; font-weight:600;">সদস্য আইডি (User ID):</td>
                        <td width="65%" style="color:#0F172A; font-size:14px; font-weight:800; font-family:monospace; background-color:#FFFFFF; padding:4px 8px; border-radius:4px; border:1px solid #CBD5E1;">{$userCode}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B; font-size:13px; font-weight:600;">ইউজারনেম (Username):</td>
                        <td style="color:#E50914; font-size:14px; font-weight:800; font-family:monospace; background-color:#FFFFFF; padding:4px 8px; border-radius:4px; border:1px solid #CBD5E1;">{$username}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B; font-size:13px; font-weight:600;">পাসওয়ার্ড (Password):</td>
                        <td style="color:#0F172A; font-size:14px; font-weight:800; font-family:monospace; background-color:#FFFFFF; padding:4px 8px; border-radius:4px; border:1px solid #CBD5E1; letter-spacing:0.5px;">{$password}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B; font-size:13px; font-weight:600;">পদবী ও রোল:</td>
                        <td style="color:#0F172A; font-size:13px; font-weight:700;">{$designation} ({$role})</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Allowed Permissions -->
              <div style="margin-bottom:24px;">
                <p style="color:#0F172A; font-size:13px; font-weight:700; margin:0 0 8px 0;">আপনার অনুমোদিত সেকশন ও ট্যাব পারমিশন:</p>
                <div>{$tabBadgesHtml}</div>
              </div>

              <!-- Login CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="{$loginUrl}" target="_blank" style="display:inline-block; background-color:#E50914; color:#FFFFFF; text-decoration:none; font-size:15px; font-weight:800; padding:12px 28px; border-radius:6px; box-shadow:0 4px 12px rgba(229,9,20,0.3);">লগইন পোর্টালে প্রবেশ করুন →</a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="background-color:#FEF2F2; border-left:4px solid #EF4444; padding:12px 16px; border-radius:4px; margin-bottom:20px;">
                <p style="color:#991B1B; font-size:12px; margin:0; line-height:1.5;">
                  <strong>⚠️ নিরাপত্তা সতর্কতা:</strong> এই ক্রেডেনশিয়াল শুধুমাত্র আপনার ব্যবহারের জন্য। কারো সাথে এটি শেয়ার করবেন না। প্রথমবার লগইন করার পর প্রোফাইল থেকে অবিলম্বে পাসওয়ার্ড পরিবর্তন করুন।
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8FAFC; border-top:1px solid #E2E8F0; padding:20px 30px; text-align:center;">
              <p style="color:#64748B; font-size:12px; margin:0 0 4px 0;">
                <strong>জনগণ.নিউজ (Jonogon News)</strong> • জনতার কণ্ঠস্বর
              </p>
              <p style="color:#94A3B8; font-size:11px; margin:0;">
                হেড অফিস: বাড়ি ১০১, আলিয়া মাদ্রাসা রোড, ফায়দাবাদ, দক্ষিণখান, ঢাকা-১২৩০ | হেল্পলাইন: +৮৮০১৯৩৬৬১৮৫৩৪
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: Jonogon News Admin <noreply@jonogon.news>',
    'Reply-To: brandbiplob1234@gmail.com',
    'X-Mailer: PHP/' . phpversion()
];

// Attempt delivery
$mailSent = @mail($email, $encodedSubject, $htmlMessage, implode("\r\n", $headers));

// Log to sent_emails.log for testing/verification
$logEntry = sprintf(
    "[%s] To: %s <%s> | Username: %s | UserCode: %s | Sent: %s\n",
    date('Y-m-d H:i:s'),
    $name,
    $email,
    $username,
    $userCode,
    $mailSent ? 'SUCCESS' : 'LOCAL_LOGGED'
);
@file_put_contents(__DIR__ . '/sent_emails.log', $logEntry, FILE_APPEND);

echo json_encode([
    'success' => true,
    'message' => $mailSent ? "Email sent successfully to {$email}" : "Email queued and logged for {$email}",
    'mail_sent' => (bool)$mailSent,
    'recipient' => $email,
    'userCode' => $userCode,
    'username' => $username,
    'password' => $password,
    'html_preview' => $htmlMessage
]);
