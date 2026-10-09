-- ====================================================================
-- JONOGON NEWS (জনগণ.নিউজ) - CLEAN RESET: DROP ALL EXISTING TABLES
-- Run this first in phpMyAdmin SQL tab to completely clear database.
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+06:00";

-- Drop All Tables unconditionally
DROP TABLE IF EXISTS `news_posts`;
DROP TABLE IF EXISTS `news_articles`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `subcategories`;
DROP TABLE IF EXISTS `category_master_groups`;
DROP TABLE IF EXISTS `homepage_sections`;
DROP TABLE IF EXISTS `podcasts`;
DROP TABLE IF EXISTS `emergency_services`;
DROP TABLE IF EXISTS `ads_config`;
DROP TABLE IF EXISTS `site_settings`;
DROP TABLE IF EXISTS `media_gallery`;
DROP TABLE IF EXISTS `media_uploads`;
DROP TABLE IF EXISTS `breaking_news`;
DROP TABLE IF EXISTS `admin_members`;
DROP TABLE IF EXISTS `admin_users`;
DROP TABLE IF EXISTS `admin_activity_logs`;
DROP TABLE IF EXISTS `subscribers`;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
