/**
 * Centralized Database Schema & Field Mapping File for Jonogon News.
 * Maps table names and column identifiers to avoid hardcoding strings across components.
 */

export const DB_TABLES = {
  NEWS_POSTS: 'news_posts',
  CATEGORIES: 'categories',
  CATEGORY_MASTER_GROUPS: 'category_master_groups',
  HOMEPAGE_SECTIONS: 'homepage_sections',
  PODCASTS: 'podcasts',
  EMERGENCY_SERVICES: 'emergency_services',
  COMMENTS: 'comments',
  COMPLAINTS: 'complaints',
  MEDIA_ITEMS: 'media_items',
  SITE_SETTINGS: 'site_settings',
  TEAM_MEMBERS: 'team_members',
  TOP_NEWS: 'top_news',
  TOP_NEWS_HYPHEN: 'top-news'
};

export const DB_FIELDS = {
  // News Posts
  POST: {
    ID: 'id',
    POST_ID: 'post_id',
    SLUG: 'slug',
    TITLE_BN: 'title_bn',
    TITLE_EN: 'title_en',
    TITLE: 'title',
    KICKER: 'kicker',
    SUBTITLE: 'subtitle',
    CONTENT_BN: 'content_bn',
    CONTENT_EN: 'content_en',
    CONTENT: 'content',
    EXCERPT_BN: 'excerpt_bn',
    EXCERPT_EN: 'excerpt_en',
    EXCERPT: 'excerpt',
    BLOCKS: 'blocks',
    CATEGORY_ID: 'category_id',
    CATEGORY_NAME: 'category_name',
    SUBCATEGORY_ID: 'subcategory_id',
    IMAGE_URL: 'image_url',
    FEATURED_IMAGE: 'featured_image',
    THUMBNAIL_IMAGE: 'thumbnail_image',
    IMAGE_CAPTION: 'image_caption',
    REPORTER: 'reporter',
    AUTHOR: 'author',
    DISTRICT: 'district',
    DIVISION: 'division',
    TAGS: 'tags',
    VIEWS: 'views',
    STATUS: 'status',
    IS_BREAKING: 'is_breaking',
    IS_FEATURED: 'is_featured',
    IS_LEAD: 'is_lead',
    VIDEO_URL: 'video_url',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    PUBLISHED_AT: 'published_at'
  },

  // Categories
  CATEGORY: {
    ID: 'id',
    SLUG: 'slug',
    NAME: 'name',
    NAME_BN: 'name_bn',
    NAME_EN: 'name_en',
    MASTER_GROUP_ID: 'master_group_id',
    MASTER_GROUP_BN: 'master_group_bn',
    MASTER_GROUP_EN: 'master_group_en',
    SUB_GROUP: 'sub_group',
    ORDER_INDEX: 'order_index',
    ICON: 'icon',
    IS_NAV_VISIBLE: 'is_nav_visible',
    CREATED_AT: 'created_at'
  },

  // Master Groups
  MASTER_GROUP: {
    ID: 'id',
    GROUP_ID: 'group_id',
    GROUP_KEY: 'group_key',
    TITLE_BN: 'title_bn',
    TITLE_EN: 'title_en',
    NAME_BN: 'name_bn',
    NAME_EN: 'name_en',
    ORDER_INDEX: 'order_index',
    SUB_GROUPS_JSON: 'sub_groups_json',
    CREATED_AT: 'created_at'
  },

  // Top 10 News (YouTube Shorts Style)
  TOP_NEWS_ITEM: {
    ID: 'id',
    NEWS_ID: 'news_id',
    RANK: 'rank',
    TITLE_BN: 'title_bn',
    TITLE_EN: 'title_en',
    CATEGORY: 'category',
    CATEGORY_BN: 'category_bn',
    CATEGORY_EN: 'category_en',
    YOUTUBE_URL: 'youtube_url',
    YOUTUBE_ID: 'youtube_id',
    VIDEO_URL: 'video_url',
    IMAGE_URL: 'image_url',
    THUMBNAIL: 'thumbnail',
    VIDEO_DURATION: 'video_duration',
    VIEWS: 'views',
    DATE_BN: 'date_bn',
    DATE_EN: 'date_en',
    ORDER_INDEX: 'order_index',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  }
};

export default {
  DB_TABLES,
  DB_FIELDS
};

