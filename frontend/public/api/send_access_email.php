<?php
/**
 * Jonogon News (জনগণ.নিউজ) - Team Member Credential Email Dispatcher
 * Sends automated welcome & access credentials email to newly created admin/staff members
 * Powered by Resend Transactional Email API (https://resend.com)
 */

require_once __DIR__ . '/config.php';

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
$designation = !empty($data['designation']) ? htmlspecialchars(trim($data['designation'])) : 'টিম সদস্য';
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
    'database' => 'ডাটাবেজ ও ক্লাউড ব্যাকআপ',
    'news-card-maker' => 'নিউজ কার্ড মেকার'
];

// Ensure login URL points directly to admin portal
if (empty($loginUrl) || $loginUrl === $protocol . $serverHost || $loginUrl === $protocol . $serverHost . '/') {
    $loginUrl = $protocol . $serverHost . '/admin';
}

$tabBadgesHtml = '';
foreach ($allowedTabs as $tabId) {
    $title = isset($tabNamesBn[$tabId]) ? $tabNamesBn[$tabId] : $tabId;
    $tabBadgesHtml .= '<span style="display:inline-block; background:rgba(230,0,18,0.06); color:#B91C1C; font-size:11px; font-weight:700; padding:5px 12px; border-radius:20px; margin:3px 4px 3px 0; border:1px solid rgba(230,0,18,0.2);">✓ ' . htmlspecialchars($title) . '</span>';
}

if (empty($tabBadgesHtml)) {
    $tabBadgesHtml = '<span style="color:#64748B; font-size:12px;">সাধারণ সম্পাদকীয় ভিউ এক্সেস</span>';
}

$subject = "জনগণ.নিউজ - আপনার অ্যাডমিন প্যানেল এক্সেস ক্রেডেনশিয়াল (User Credentials)";
$encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";

// Ultra-Premium HTML Email Body
$htmlMessage = <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{$subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#080A10; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color:#334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#080A10; padding:40px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" style="max-width:620px; background-color:#FFFFFF; border-radius:18px; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(230,0,18,0.15); border:1px solid rgba(255,255,255,0.1);" cellspacing="0" cellpadding="0">
          
          <!-- Top Accent Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #E60012 0%, #99000C 100%); padding:32px 30px; text-align:center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block; background-color:rgba(255,255,255,0.15); padding:6px 16px; border-radius:20px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.25);">
                      <span style="color:#FFFFFF; font-size:11px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase;">JONOGON NEWS • ADMINISTRATIVE GATEWAY</span>
                    </div>
                    <h1 style="color:#FFFFFF; margin:0 0 6px 0; font-size:30px; font-weight:900; letter-spacing:-0.5px;">জনগণ.নিউজ</h1>
                    <p style="color:#FEE2E2; margin:0; font-size:13px; font-weight:500;">জনতার কণ্ঠস্বর • সত্য ও বস্তুনিষ্ঠ সাংবাদিকতা</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding:34px 32px 24px 32px;">
              <h2 style="color:#0F172A; font-size:22px; font-weight:800; margin:0 0 8px 0;">স্বাগতম, {$name}!</h2>
              <p style="color:#475569; font-size:14px; line-height:1.65; margin:0 0 22px 0;">
                আপনাকে <strong>জনগণ.নিউজ</strong> সম্পাদকীয় ও ম্যানেজমেন্ট টিমে <strong>{$designation} ({$role})</strong> হিসেবে স্বাগত জানানো হচ্ছে। আপনার অ্যাডমিন পোর্টাল এক্সেস ক্রেডেনশিয়াল নিচে সংযুক্ত করা হলো।
              </p>

              <!-- CRITICAL 2-STEP ACTIVATION NOTICE -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border-left:5px solid #F59E0B; border-radius:10px; margin:0 0 26px 0; box-shadow:0 4px 12px rgba(245,158,11,0.08);">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#92400E; font-size:13px; font-weight:800; margin:0 0 8px 0;">
                      ⚡ আইডি সক্রিয় (Activate) করার ২টি আবশ্যক ধাপ:
                    </p>
                    <ol style="margin:0; padding-left:18px; color:#78350F; font-size:13px; line-height:1.6;">
                      <li style="margin-bottom:6px;">
                        <strong>কনফার্মেশন ইমেইল চেক করুন:</strong> আপনার ইনবক্সে Supabase Auth থেকে <em>"Confirm your email address"</em> শিরোনামে একটি ইমেইল পাঠানো হয়েছে। সেখানে থাকা <strong>"Confirm email address"</strong> লিংকে ক্লিক করে অ্যাকাউন্ট ভেরিফাই করুন।
                      </li>
                      <li>
                        <strong>লগইন করুন:</strong> ইমেইল কনফার্ম হওয়ার সাথে সাথে আপনার আইডি স্বয়ংক্রিয়ভাবে সক্রিয় হবে এবং নিচের ইউজারনেম/আইডি ও পাসওয়ার্ড দিয়ে সরাসরি লগইন করতে পারবেন।
                      </li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- CREDENTIALS BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; margin:0 0 24px 0; overflow:hidden;">
                <tr>
                  <td style="background-color:#0F172A; padding:12px 20px;">
                    <span style="color:#F8FAFC; font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">🔒 আপনার লগইন তথ্য (Confidential)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="7">
                      <tr>
                        <td width="36%" style="color:#64748B; font-size:13px; font-weight:600;">সদস্য আইডি (User ID):</td>
                        <td width="64%" style="color:#0F172A; font-size:14px; font-weight:800; font-family:'Courier New', monospace; background-color:#FFFFFF; padding:6px 10px; border-radius:6px; border:1px solid #CBD5E1;">{$userCode}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B; font-size:13px; font-weight:600;">ইউজারনেম (Username):</td>
                        <td style="color:#E60012; font-size:14px; font-weight:800; font-family:'Courier New', monospace; background-color:#FFFFFF; padding:6px 10px; border-radius:6px; border:1px solid #CBD5E1;">{$username}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B; font-size:13px; font-weight:600;">পাসওয়ার্ড (Password):</td>
                        <td style="color:#0F172A; font-size:15px; font-weight:800; font-family:'Courier New', monospace; background-color:#FFFFFF; padding:6px 10px; border-radius:6px; border:1px solid #CBD5E1; letter-spacing:1px;">{$password}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B; font-size:13px; font-weight:600;">রেজিস্টার্ড ইমেইল:</td>
                        <td style="color:#475569; font-size:13px; font-weight:700;">{$email}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B; font-size:13px; font-weight:600;">পদবী ও দায়িত্ব:</td>
                        <td style="color:#0F172A; font-size:13px; font-weight:700;">{$designation} ({$role})</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PERMISSIONS BADGES -->
              <div style="margin-bottom:26px;">
                <p style="color:#0F172A; font-size:13px; font-weight:800; margin:0 0 10px 0;">🛡️ আপনার অনুমোদিত ড্যাশবোর্ড সেকশনসমূহ:</p>
                <div>{$tabBadgesHtml}</div>
              </div>

              <!-- LOGIN CTA BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{$loginUrl}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #E60012 0%, #B3000E 100%); color:#FFFFFF; text-decoration:none; font-size:15px; font-weight:800; padding:14px 34px; border-radius:30px; box-shadow:0 8px 20px rgba(230,0,18,0.35); letter-spacing:0.3px;">
                      অ্যাডমিন পোর্টালে লগইন করুন →
                    </a>
                    <div style="margin-top:8px;">
                      <a href="{$loginUrl}" target="_blank" style="color:#94A3B8; font-size:11px; text-decoration:underline;">{$loginUrl}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- SECURITY ALERT -->
              <div style="background-color:#FEF2F2; border-left:4px solid #EF4444; padding:12px 16px; border-radius:6px; margin-bottom:20px;">
                <p style="color:#991B1B; font-size:12px; margin:0; line-height:1.5;">
                  <strong>⚠️ নিরাপত্তা সতর্কতা:</strong> এই ক্রেডেনশিয়াল কঠোরভাবে গোপন রাখুন এবং কারো সাথে শেয়ার করবেন না। প্রথমবার লগইন সফল হলে আপনার প্রোফাইল থেকে ব্যক্তিগত পাসওয়ার্ড সেট করে নেওয়ার পরামর্শ দেওয়া হচ্ছে।
                </p>
              </div>
            </td>
          </tr>

          <!-- Professional Footer -->
          <tr>
            <td style="background-color:#F8FAFC; border-top:1px solid #E2E8F0; padding:22px 30px; text-align:center;">
              <p style="color:#475569; font-size:13px; font-weight:700; margin:0 0 6px 0;">
                জনগণ মিডিয়া (Jonogon News) • জনতার কণ্ঠস্বর
              </p>
              <p style="color:#94A3B8; font-size:11px; margin:0 0 6px 0; line-height:1.5;">
                হেড অফিস: বাড়ি ১০২, মদিনা মাদ্রাসা রোড, মধ্যপাড়া, মানিকগঞ্জ, মানিকগঞ্জ ঢাকা-১৮০০<br/>
                জরুরি হেল্পলাইন: +৮৮০১৮৭৯২২৮২৩৪ | সাপোর্ট: support@jonogon.news
              </p>
              <p style="color:#CBD5E1; font-size:10px; margin:0;">
                © 2026 Jonogon News. সর্বস্বত্ব সংরক্ষিত।
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

// Send via Resend REST API
$mailSent = false;
$resendResponse = null;
$deliveryMethod = 'none';

if (defined('RESEND_API_KEY') && !empty(RESEND_API_KEY)) {
    try {
        $fromEmail = defined('RESEND_FROM_EMAIL') && !empty(RESEND_FROM_EMAIL)
            ? RESEND_FROM_EMAIL
            : 'Jonogon News <noreply@jonogon.news>';

        $resendPayload = [
            'from' => $fromEmail,
            'to' => [$email],
            'subject' => $subject,
            'html' => $htmlMessage
        ];

        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($resendPayload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . RESEND_API_KEY,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $resendData = json_decode($response, true);
        if ($httpCode >= 200 && $httpCode < 300) {
            $mailSent = true;
            $deliveryMethod = 'resend_api';
            $resendResponse = $resendData;
        } else {
            $resendResponse = $resendData;
        }
    } catch (Exception $e) {
        $resendResponse = ['error' => $e->getMessage()];
    }
}

// Fallback to PHP mail() if Resend was not used
if (!$mailSent) {
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: Jonogon News Admin <noreply@jonogon.news>',
        'Reply-To: brandbiplob1234@gmail.com',
        'X-Mailer: PHP/' . phpversion()
    ];
    $mailSent = @mail($email, $encodedSubject, $htmlMessage, implode("\r\n", $headers));
    if ($mailSent) {
        $deliveryMethod = 'php_mail';
    }
}

// Log to sent_emails.log for testing/verification
$logEntry = sprintf(
    "[%s] To: %s <%s> | Method: %s | Sent: %s\n",
    date('Y-m-d H:i:s'),
    $name,
    $email,
    $deliveryMethod,
    $mailSent ? 'SUCCESS' : 'FAILED'
);
@file_put_contents(__DIR__ . '/sent_emails.log', $logEntry, FILE_APPEND);

echo json_encode([
    'success' => true,
    'message' => $mailSent ? "ইমেইল সফলভাবে পাঠানো হয়েছে ({$email})" : "ইমেইল পাঠানো প্রক্রিয়া সম্পন্ন হয়েছে।",
    'mail_sent' => (bool)$mailSent,
    'delivery_method' => $deliveryMethod,
    'resend_response' => $resendResponse,
    'recipient' => $email,
    'userCode' => $userCode,
    'username' => $username,
    'password' => $password,
    'html_preview' => $htmlMessage
], JSON_UNESCAPED_UNICODE);
