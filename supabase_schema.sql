-- ====================================================================
-- JONOGON NEWS (জনগণ.নিউজ) - MASTER SUPABASE DATABASE SCHEMA
-- Features: Strong RLS, Security Policies, Storage Bucket, Seed Data
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 2. TABLE: site_settings (Global Branding, Colors, SEO, Contacts, Terms)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 3. TABLE: categories (News Sections)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_bn VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. TABLE: news_articles (All News Content)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title_bn VARCHAR(350) NOT NULL,
  title_en VARCHAR(350),
  category_slug VARCHAR(100) REFERENCES public.categories(slug) ON DELETE SET NULL,
  category_bn VARCHAR(150),
  excerpt_bn TEXT,
  excerpt_en TEXT,
  content_bn TEXT NOT NULL,
  content_en TEXT,
  image_url TEXT,
  author VARCHAR(150) DEFAULT 'জনগণ নিউজ ডেস্ক',
  author_avatar TEXT,
  read_time_bn VARCHAR(50) DEFAULT '৪ মিনিট পড়তে',
  read_time_en VARCHAR(50) DEFAULT '4 min read',
  is_lead_hero BOOLEAN DEFAULT false,
  is_breaking BOOLEAN DEFAULT false,
  is_video BOOLEAN DEFAULT false,
  video_duration VARCHAR(20),
  status VARCHAR(20) DEFAULT 'published', -- 'published', 'draft', 'archived'
  views_count BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 5. TABLE: breaking_news (Live Top Ticker)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.breaking_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_bn VARCHAR(350) NOT NULL,
  text_en VARCHAR(350),
  article_slug VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. TABLE: subscribers (Newsletter Emails)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 7. TABLE: media_uploads (Images metadata)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  file_size INT,
  format VARCHAR(20) DEFAULT 'webp',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - BULLETPROOF PROTECTION
-- ====================================================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;

-- 1. Site Settings Policies
CREATE POLICY "Allow public read access on site settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access on site settings"
  ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Categories Policies
CREATE POLICY "Allow public read access on categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access on categories"
  ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. News Articles Policies
CREATE POLICY "Allow public read access on published news articles"
  ON public.news_articles FOR SELECT USING (status = 'published');

CREATE POLICY "Allow authenticated full access on news articles"
  ON public.news_articles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Breaking News Policies
CREATE POLICY "Allow public read access on active breaking news"
  ON public.breaking_news FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated full access on breaking news"
  ON public.breaking_news FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Newsletter Subscribers Policies
CREATE POLICY "Allow anonymous insertion of subscribers"
  ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read of subscribers list"
  ON public.subscribers FOR SELECT TO authenticated USING (true);

-- 6. Media Uploads Policies
CREATE POLICY "Allow public read access on media uploads"
  ON public.media_uploads FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access on media uploads"
  ON public.media_uploads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================
-- RPC FUNCTIONS: Atomic View Counter
-- ====================================================================

CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.news_articles
  SET views_count = views_count + 1
  WHERE id = article_id;
END;
$$;

-- ====================================================================
-- SEED INITIAL DATA (JONOGON NEWS BRANDING & SECTIONS)
-- ====================================================================

-- Insert Initial Categories
INSERT INTO public.categories (slug, name_bn, name_en, order_index)
VALUES
  ('latest', 'সর্বশেষ', 'Latest', 1),
  ('bangladesh', 'বাংলাদেশ', 'Bangladesh', 2),
  ('politics', 'রাজনীতি', 'Politics', 3),
  ('world', 'আন্তর্জাতিক', 'World', 4),
  ('countrywide', 'সারাদেশ', 'Countrywide', 5),
  ('districts', 'জেলা', 'Districts', 6),
  ('economy', 'অর্থনীতি', 'Economy', 7),
  ('education', 'শিক্ষা', 'Education', 8),
  ('sports', 'খেলাধুলা', 'Sports', 9),
  ('entertainment', 'বিনোদন', 'Entertainment', 10),
  ('tech', 'প্রযুক্তি', 'Tech', 11),
  ('lifestyle', 'জীবনযাপন', 'Lifestyle', 12),
  ('opinion', 'মতামত', 'Opinion', 13),
  ('special', 'বিশেষ প্রতিবেদন', 'Special Report', 14),
  ('video', 'ভিডিও', 'Video', 15)
ON CONFLICT (slug) DO NOTHING;

-- Insert Initial Breaking News
INSERT INTO public.breaking_news (text_bn, text_en, is_active)
VALUES
  ('নতুন নির্বাচন কমিশন গঠনের পথে সরকার, নাম আসছে আলোচনায়', 'Government in process of forming new Election Commission, names under discussion', true),
  ('জ্বালানি তেলের দাম কমতে পারে আগামী সপ্তাহে', 'Fuel prices may decrease in the coming week', true),
  ('উপকূল নিম্নাঞ্চল, ৪ জেলায় সতর্কসংকেত জারি', 'Low-lying coastal areas flooded, warning signals issued in 4 districts', true);

-- Insert Global Site Settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES
  ('general_branding', '{
    "siteNameBn": "জনগণ.নিউজ",
    "siteNameEn": "Jonogon News",
    "sloganBn": "সত্যের সাথে, জনতার পাশে",
    "sloganEn": "With Truth, Standing for the People",
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
  }'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- ====================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION (news-images)
-- ====================================================================
-- Run the following to create the public news-images bucket if needed:
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read News Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-images');

CREATE POLICY "Authenticated Upload News Images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'news-images');
