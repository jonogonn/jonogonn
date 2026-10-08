<?php
/**
 * Janogon News - Global Production Configuration
 * Configured with live cPanel MariaDB and Backblaze B2 credentials.
 */

// -------------------------------------------------------------
// 1. CPANEL MARIADB / MYSQL DATABASE CONFIGURATION
// -------------------------------------------------------------
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', (int)(getenv('DB_PORT') ?: 3306));
define('DB_NAME', getenv('DB_NAME') ?: 'jonogonn_news_db');
define('DB_USER', getenv('DB_USER') ?: 'jonogonn_admin');
define('DB_PASS', getenv('DB_PASSWORD') ?: (getenv('DB_PASS') ?: 'Jg#Dbl2026@X7pL9'));

// -------------------------------------------------------------
// 2. BACKBLAZE B2 CLOUD STORAGE CONFIGURATION
// -------------------------------------------------------------
define('B2_BUCKET_NAME', getenv('STORAGE_BUCKET_NAME') ?: (getenv('B2_BUCKET_NAME') ?: 'jonogon.news'));
define('B2_BUCKET_ID', getenv('B2_BUCKET_ID') ?: '785d6e1534fef8dfab0b0f18');
define('B2_KEY_ID', getenv('STORAGE_ACCESS_KEY_ID') ?: (getenv('B2_KEY_ID') ?: '8de54e8fbbf8'));
define('B2_APPLICATION_KEY', getenv('STORAGE_SECRET_ACCESS_KEY') ?: (getenv('B2_APPLICATION_KEY') ?: '00536cd00fc9f8135855e357dbad747e7801e4757a'));
define('B2_REGION', getenv('STORAGE_REGION') ?: (getenv('B2_REGION') ?: 'us-east-005'));
define('B2_ENDPOINT', getenv('STORAGE_ENDPOINT') ?: 'https://s3.us-east-005.backblazeb2.com');

// -------------------------------------------------------------
// 3. CDN & IMAGE BASE URL
// -------------------------------------------------------------
// CDN for ultra-fast WebP image delivery
define('CDN_BASE_URL', getenv('CDN_BASE_URL') ?: 'https://cdn.jonogon.news');

// Local fallback uploads directory
define('LOCAL_UPLOADS_DIR', __DIR__ . '/../uploads/');
define('LOCAL_UPLOADS_URL', '/uploads/');
