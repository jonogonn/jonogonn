<?php
/**
 * Janogon News - Global Production Configuration
 * Configured with live cPanel MariaDB and Backblaze B2 credentials.
 */

// -------------------------------------------------------------
// 1. PRIMARY MARIADB (Hosting 1 - Main)
// -------------------------------------------------------------
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', (int)(getenv('DB_PORT') ?: 3306));
define('DB_NAME', getenv('DB_NAME') ?: 'jonogonn_news_db');
define('DB_USER', getenv('DB_USER') ?: 'jonogonn_admin');
define('DB_PASS', getenv('DB_PASSWORD') ?: (getenv('DB_PASS') ?: 'Jg#Db!2026@X7pL9'));

// -------------------------------------------------------------
// 2. SECONDARY / FALLBACK MARIADB (Hosting 2 - Replica & Failover)
// -------------------------------------------------------------
define('DB_BACKUP_HOST', getenv('DB_BACKUP_HOST') ?: 'delta.hostseba.com');
define('DB_BACKUP_PORT', (int)(getenv('DB_BACKUP_PORT') ?: 3306));
define('DB_BACKUP_NAME', getenv('DB_BACKUP_NAME') ?: 'jonogonn_news_db_backup');
define('DB_BACKUP_USER', getenv('DB_BACKUP_USER') ?: 'jonogonn_admin_backup');
define('DB_BACKUP_PASS', getenv('DB_BACKUP_PASSWORD') ?: (getenv('DB_BACKUP_PASS') ?: 'Jg#Db!2026@X7pL9'));

// -------------------------------------------------------------
// 3. BACKBLAZE B2 CLOUD STORAGE (Media Assets: jonogon.news)
// -------------------------------------------------------------
define('B2_BUCKET_NAME', getenv('STORAGE_BUCKET_NAME') ?: (getenv('B2_BUCKET_NAME') ?: 'jonogon.news'));
define('B2_BUCKET_ID', getenv('B2_BUCKET_ID') ?: '785d6e1534fef8dfab0b0f18');
define('B2_KEY_ID', getenv('STORAGE_ACCESS_KEY_ID') ?: (getenv('B2_KEY_ID') ?: '8de54e8fbbf8'));
define('B2_APPLICATION_KEY', getenv('STORAGE_SECRET_ACCESS_KEY') ?: (getenv('B2_APPLICATION_KEY') ?: '00536cd00fc9f8135855e357dbad747e7801e4757a'));
define('B2_REGION', getenv('STORAGE_REGION') ?: (getenv('B2_REGION') ?: 'us-east-005'));
define('B2_ENDPOINT', getenv('STORAGE_ENDPOINT') ?: 'https://s3.us-east-005.backblazeb2.com');

// -------------------------------------------------------------
// 4. ADMIN BACKBLAZE B2 (Database Dumps & System Backups)
// -------------------------------------------------------------
define('B2_BACKUP_BUCKET_NAME', getenv('STORAGE_BACKUP_BUCKET_NAME') ?: 'Jonogon.News.PrimaryBackup');
define('B2_BACKUP_BUCKET_ID', getenv('STORAGE_BACKUP_BUCKET_ID') ?: '0f41b26d06b4240da5140e15');
define('B2_BACKUP_BUCKET_FALLBACK', 'jonogon.news.backup');

// -------------------------------------------------------------
// 3. CDN & IMAGE BASE URL
// -------------------------------------------------------------
// CDN for ultra-fast WebP image delivery
define('CDN_BASE_URL', getenv('CDN_BASE_URL') ?: 'https://cdn.jonogon.news');

// All images stored directly in Backblaze B2 (Zero local uploads)

// -------------------------------------------------------------
// 4. RESEND TRANSACTIONAL EMAIL CONFIGURATION
// -------------------------------------------------------------
$resendLocalKeyFile = __DIR__ . '/.resend_key';
$resendLocalKey = file_exists($resendLocalKeyFile) ? trim((string)@file_get_contents($resendLocalKeyFile)) : '';
define('RESEND_API_KEY', getenv('RESEND_API_KEY') ?: $resendLocalKey);
define('RESEND_FROM_EMAIL', getenv('RESEND_FROM_EMAIL') ?: 'Jonogon News <noreply@jonogon.news>');

