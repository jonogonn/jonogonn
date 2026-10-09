-- ====================================================================
-- JONOGON NEWS (জনগণ.নিউজ) - MASTER MARIADB / CPANEL DATABASE SCHEMA
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Compatible with: MariaDB 10.4+, MySQL 8.0+, phpMyAdmin (cPanel)
-- ====================================================================

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00";

-- ====================================================================
-- 0. CLEAN RESET: DROP ALL TABLES ATOMICALLY
-- ====================================================================
DROP TABLE IF EXISTS 
  `news`, 
  `news_posts`, 
  `news_articles`, 
  `categories`, 
  `subcategories`, 
  `category_master_groups`, 
  `homepage_sections`, 
  `podcasts`, 
  `emergency_services`, 
  `ads_config`, 
  `site_settings`, 
  `media_gallery`, 
  `media_uploads`, 
  `breaking_news`, 
  `admin_members`, 
  `admin_activity_logs`, 
  `backup_logs`, 
  `subscribers`;

-- ====================================================================
-- 1. TABLE: news_posts (For Create, Edit, Approve, and Publish Post Tabs)
-- ====================================================================
CREATE TABLE `news_posts` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` VARCHAR(64) NOT NULL UNIQUE,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `title_bn` VARCHAR(500) NOT NULL,
  `title_en` VARCHAR(500) DEFAULT NULL,
  `kicker` VARCHAR(255) DEFAULT NULL,
  `subtitle` VARCHAR(500) DEFAULT NULL,
  `excerpt_bn` TEXT DEFAULT NULL,
  `excerpt_en` TEXT DEFAULT NULL,
  `content_bn` LONGTEXT NOT NULL,
  `content_en` LONGTEXT DEFAULT NULL,
  `category_id` VARCHAR(100) NOT NULL DEFAULT 'bangladesh',
  `category_bn` VARCHAR(150) NOT NULL DEFAULT 'বাংলাদেশ',
  `category_en` VARCHAR(150) NOT NULL DEFAULT 'Bangladesh',
  `categories` LONGTEXT DEFAULT NULL COMMENT 'JSON array of subcategories',
  `featured_image` TEXT DEFAULT NULL,
  `image_caption` VARCHAR(500) DEFAULT NULL,
  `gallery_images` LONGTEXT DEFAULT NULL COMMENT 'JSON array of gallery image URLs',
  `author` VARCHAR(150) NOT NULL DEFAULT 'মোঃ বিপ্লব হোসেন',
  `author_id` VARCHAR(64) DEFAULT 'user-1',
  `author_avatar` TEXT DEFAULT NULL,
  `reporter_name` VARCHAR(150) DEFAULT NULL,
  `read_time` VARCHAR(50) DEFAULT '৪ মিনিট পড়তে',
  `is_lead_hero` TINYINT(1) DEFAULT 0,
  `is_breaking` TINYINT(1) DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_video` TINYINT(1) DEFAULT 0,
  `youtube_url` TEXT DEFAULT NULL,
  `video_duration` VARCHAR(30) DEFAULT NULL,
  `status` ENUM('draft', 'pending_approval', 'revision_needed', 'published', 'archived') NOT NULL DEFAULT 'published',
  `status_note` TEXT DEFAULT NULL COMMENT 'Notes on revision or rejection reason',
  `views` BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
  `shares_count` INT(11) UNSIGNED NOT NULL DEFAULT 0,
  `seo_title` VARCHAR(300) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `seo_keywords` VARCHAR(500) DEFAULT NULL,
  `card_category` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category_id`),
  INDEX `idx_created` (`created_at`),
  INDEX `idx_views` (`views`),
  INDEX `idx_lead` (`is_lead_hero`),
  INDEX `idx_breaking` (`is_breaking`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 2. TABLE: category_master_groups (For 10 Master Categories in Main Menu)
-- ====================================================================
CREATE TABLE `category_master_groups` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_key` VARCHAR(100) NOT NULL UNIQUE,
  `name_bn` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `order_index` INT(11) NOT NULL DEFAULT 0,
  `icon` VARCHAR(50) DEFAULT 'folder',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 3. TABLE: categories (For Main Menu & Categories Sub-items)
-- ====================================================================
CREATE TABLE `categories` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `name_bn` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `master_group_id` VARCHAR(100) DEFAULT 'general',
  `master_group_bn` VARCHAR(150) DEFAULT 'সাধারণ',
  `master_group_en` VARCHAR(150) DEFAULT 'General',
  `parent_id` INT(11) UNSIGNED DEFAULT NULL,
  `order_index` INT(11) NOT NULL DEFAULT 0,
  `is_nav_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `icon` VARCHAR(50) DEFAULT 'tag',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cat_slug` (`slug`),
  INDEX `idx_cat_group` (`master_group_id`),
  INDEX `idx_cat_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 4. TABLE: homepage_sections (For 31 Modular Homepage Layout Blocks)
-- ====================================================================
CREATE TABLE `homepage_sections` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_id` VARCHAR(100) NOT NULL UNIQUE,
  `title_bn` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `category_slug` VARCHAR(100) DEFAULT NULL,
  `layout_type` VARCHAR(50) NOT NULL DEFAULT 'grid_3',
  `item_count` INT(11) NOT NULL DEFAULT 6,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `order_index` INT(11) NOT NULL DEFAULT 0,
  `custom_badge_bn` VARCHAR(100) DEFAULT NULL,
  `custom_badge_en` VARCHAR(100) DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sec_order` (`order_index`),
  INDEX `idx_sec_visible` (`is_visible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 5. TABLE: podcasts (For Podcasts Tab)
-- ====================================================================
CREATE TABLE `podcasts` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `podcast_id` VARCHAR(64) NOT NULL UNIQUE,
  `title_bn` VARCHAR(500) NOT NULL,
  `title_en` VARCHAR(500) DEFAULT NULL,
  `subject_id` VARCHAR(100) NOT NULL DEFAULT 'politics',
  `subject_bn` VARCHAR(150) NOT NULL DEFAULT 'রাজনীতি ও রাষ্ট্র',
  `subject_en` VARCHAR(150) NOT NULL DEFAULT 'Politics & Governance',
  `youtube_url` TEXT NOT NULL,
  `youtube_id` VARCHAR(50) DEFAULT NULL,
  `host_bn` VARCHAR(150) NOT NULL DEFAULT 'মোঃ বিপ্লব হোসেন',
  `host_en` VARCHAR(150) NOT NULL DEFAULT 'Md. Biplob Hossain',
  `guest_bn` VARCHAR(150) DEFAULT NULL,
  `guest_en` VARCHAR(150) DEFAULT NULL,
  `duration` VARCHAR(30) NOT NULL DEFAULT '২৫:০০',
  `thumbnail` TEXT DEFAULT NULL,
  `views` BIGINT(20) UNSIGNED NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pod_subject` (`subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 6. TABLE: emergency_services (For Emergency Helplines Tab)
-- ====================================================================
CREATE TABLE `emergency_services` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` VARCHAR(64) NOT NULL UNIQUE,
  `name_bn` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) DEFAULT NULL,
  `number` VARCHAR(50) NOT NULL,
  `category_bn` VARCHAR(150) NOT NULL DEFAULT 'জরুরি সেবা',
  `category_en` VARCHAR(150) NOT NULL DEFAULT 'Emergency',
  `description_bn` TEXT DEFAULT NULL,
  `description_en` TEXT DEFAULT NULL,
  `website_url` TEXT DEFAULT NULL,
  `icon` VARCHAR(50) NOT NULL DEFAULT 'phone',
  `order_index` INT(11) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_srv_cat` (`category_bn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 7. TABLE: ads_config (For Google AdSense & Banner Ads Tab)
-- ====================================================================
CREATE TABLE `ads_config` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `slot_id` VARCHAR(100) NOT NULL UNIQUE,
  `slot_name_bn` VARCHAR(200) NOT NULL,
  `slot_name_en` VARCHAR(200) NOT NULL,
  `ad_type` ENUM('adsense', 'custom_banner', 'html_script') NOT NULL DEFAULT 'adsense',
  `client_id` VARCHAR(100) DEFAULT 'ca-pub-9876543210987654',
  `slot_code` VARCHAR(100) DEFAULT NULL,
  `banner_image_url` TEXT DEFAULT NULL,
  `target_url` TEXT DEFAULT NULL,
  `custom_html` LONGTEXT DEFAULT NULL,
  `display_location` VARCHAR(100) NOT NULL DEFAULT 'header_top',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 8. TABLE: site_settings (For Site Settings & Branding Tab)
-- ====================================================================
CREATE TABLE `site_settings` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` LONGTEXT NOT NULL COMMENT 'JSON formatted configuration object',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 9. TABLE: media_gallery (For Media Gallery & B2 Cloud Storage Tab)
-- ====================================================================
CREATE TABLE `media_gallery` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) DEFAULT NULL,
  `storage_provider` VARCHAR(50) NOT NULL DEFAULT 'b2',
  `file_url` TEXT NOT NULL,
  `file_size` INT(11) UNSIGNED DEFAULT 0,
  `file_type` VARCHAR(50) NOT NULL DEFAULT 'image/webp',
  `dimensions` VARCHAR(50) DEFAULT NULL,
  `uploaded_by` VARCHAR(150) DEFAULT 'মোঃ বিপ্লব হোসেন',
  `caption` VARCHAR(500) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'general',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_media_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 10. TABLE: breaking_news (For Live Top Breaking News Ticker)
-- ====================================================================
CREATE TABLE `breaking_news` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `text_bn` VARCHAR(500) NOT NULL,
  `text_en` VARCHAR(500) DEFAULT NULL,
  `article_id` VARCHAR(64) DEFAULT NULL,
  `article_slug` VARCHAR(255) DEFAULT NULL,
  `link_url` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `order_index` INT(11) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_brk_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 11. TABLE: admin_activity_logs (Stores EACH and EVERY step done in panel)
-- ====================================================================
CREATE TABLE `admin_activity_logs` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(64) DEFAULT 'user-1',
  `user_name` VARCHAR(200) NOT NULL DEFAULT 'মোঃ বিপ্লব হোসেন',
  `action_type` VARCHAR(100) NOT NULL COMMENT 'e.g. create_post, update_post, delete_post, update_settings, backup_export',
  `tab_name` VARCHAR(100) NOT NULL,
  `target_id` VARCHAR(255) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `details` LONGTEXT DEFAULT NULL COMMENT 'JSON diff or extra metadata',
  `ip_address` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_log_user` (`user_id`),
  INDEX `idx_log_action` (`action_type`),
  INDEX `idx_log_tab` (`tab_name`),
  INDEX `idx_log_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED INITIAL MASTER GROUPS (10 Categories)
-- ====================================================================
INSERT INTO `category_master_groups` (`group_key`, `name_bn`, `name_en`, `order_index`, `icon`) VALUES
('general', 'সাধারণ', 'General', 1, 'folder'),
('national', 'বাংলাদেশ ও রাজনীতি', 'National & Politics', 2, 'flag'),
('districts', 'সারাদেশ ও জেলা', 'Countrywide & Districts', 3, 'map-pin'),
('world', 'আন্তর্জাতিক', 'International', 4, 'globe'),
('economy', 'অর্থনীতি ও বাণিজ্য', 'Economy & Business', 5, 'trending-up'),
('education', 'শিক্ষা ও ক্যাম্পাস', 'Education & Campus', 6, 'book-open'),
('sports', 'খেলাধুলা', 'Sports', 7, 'award'),
('entertainment', 'বিনোদন ও শোবিজ', 'Entertainment & Lifestyle', 8, 'film'),
('tech', 'বিজ্ঞান ও প্রযুক্তি', 'Science & Tech', 9, 'cpu'),
('multimedia', 'মাল্টিমিডিয়া ও পডকাস্ট', 'Multimedia & Shows', 10, 'video');

-- ====================================================================
-- SEED INITIAL CATEGORIES
-- ====================================================================
INSERT INTO `categories` (`slug`, `name`, `name_bn`, `name_en`, `master_group_id`, `master_group_bn`, `order_index`) VALUES
('latest', 'সর্বশেষ', 'সর্বশেষ', 'Latest', 'general', 'সাধারণ', 1),
('bangladesh', 'বাংলাদেশ', 'বাংলাদেশ', 'Bangladesh', 'national', 'বাংলাদেশ ও রাজনীতি', 2),
('politics', 'রাজনীতি', 'রাজনীতি', 'Politics', 'national', 'বাংলাদেশ ও রাজনীতি', 3),
('world', 'আন্তর্জাতিক', 'আন্তর্জাতিক', 'World', 'world', 'আন্তর্জাতিক', 4),
('countrywide', 'সারাদেশ', 'সারাদেশ', 'Countrywide', 'districts', 'সারাদেশ ও জেলা', 5),
('districts', 'জেলা সংবাদ', 'জেলা সংবাদ', 'Districts', 'districts', 'সারাদেশ ও জেলা', 6),
('economy', 'অর্থনীতি', 'অর্থনীতি', 'Economy', 'economy', 'অর্থনীতি ও বাণিজ্য', 7),
('education', 'শিক্ষা', 'শিক্ষা', 'Education', 'education', 'শিক্ষা ও ক্যাম্পাস', 8),
('sports', 'খেলাধুলা', 'খেলাধুলা', 'Sports', 'sports', 'খেলাধুলা', 9),
('entertainment', 'বিনোদন', 'বিনোদন', 'Entertainment', 'entertainment', 'বিনোদন ও শোবিজ', 10),
('tech', 'প্রযুক্তি', 'প্রযুক্তি', 'Tech', 'tech', 'বিজ্ঞান ও প্রযুক্তি', 11),
('lifestyle', 'জীবনযাপন', 'জীবনযাপন', 'Lifestyle', 'entertainment', 'বিনোদন ও শোবিজ', 12),
('opinion', 'মতামত', 'মতামত', 'Opinion', 'general', 'সাধারণ', 13),
('special', 'বিশেষ প্রতিবেদন', 'বিশেষ প্রতিবেদন', 'Special Report', 'general', 'সাধারণ', 14),
('video', 'ভিডিও', 'ভিডিও', 'Video', 'multimedia', 'মাল্টিমিডিয়া ও পডকাস্ট', 15);

-- ====================================================================
-- SEED INITIAL SITE SETTINGS
-- ====================================================================
INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('general_branding', '{
  "siteNameBn": "জনগণ.নিউজ",
  "siteNameEn": "Jonogon News",
  "sloganBn": "জনতার কণ্ঠস্বর",
  "sloganEn": "Voice of the People",
  "domain": "jonogon.news",
  "websiteUrl": "https://jonogon.news",
  "logoUrl": "/logo.svg",
  "primaryRed": "#E60012",
  "darkRed": "#A8000D",
  "white": "#FFFFFF",
  "black": "#111111",
  "silver": "#D9D9D9",
  "founderBn": "মোঃ বিপ্লব হোসেন",
  "founderEn": "Md. Biplob Hossain",
  "designationBn": "স্বত্বাধিকারী ও সম্পাদক",
  "designationEn": "Owner & Editor",
  "organization": "Jonogon News",
  "address": "House 101, Alia Madrasa Road, Faydabad, Dakshinkhan, Dhaka-1230",
  "phone": "01936618534",
  "email": "brandbiplob1234@gmail.com",
  "facebook": "https://www.facebook.com/jonogon.newstv/",
  "youtube": "https://www.youtube.com/@jonogon.newstv",
  "adSenseEnabled": true,
  "adSenseClientId": "ca-pub-9876543210987654"
}');

-- ====================================================================
-- SEED INITIAL BREAKING NEWS
-- ====================================================================
INSERT INTO `breaking_news` (`text_bn`, `text_en`, `is_active`, `order_index`) VALUES
('নতুন নির্বাচন কমিশন গঠনের পথে সরকার, নাম আসছে আলোচনায়', 'Government in process of forming new Election Commission, names under discussion', 1, 1),
('জ্বালানি তেলের দাম কমতে পারে আগামী সপ্তাহে', 'Fuel prices may decrease in the coming week', 1, 2),
('উপকূল নিম্নাঞ্চল, ৪ জেলায় সতর্কসংকেত জারি', 'Low-lying coastal areas flooded, warning signals issued in 4 districts', 1, 3);

-- ====================================================================
-- SEED INITIAL LOG
-- ====================================================================
INSERT INTO `admin_activity_logs` (`user_id`, `user_name`, `action_type`, `tab_name`, `description`)
VALUES ('user-1', 'মোঃ বিপ্লব হোসেন', 'schema_init', 'database', 'MariaDB master schema successfully initialized with all portal content tables.');

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
COMMIT;
