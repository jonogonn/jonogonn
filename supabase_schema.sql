-- ====================================================================
-- JONOGON NEWS (জনগণ.নিউজ) - SUPABASE MASTER DATABASE SCHEMA
-- Project ID: mxzsmulbandttegciiiy
-- Scope: ONLY ADMIN / USER ID ACCESS MANAGEMENT & RLS SECURITY
-- ====================================================================

-- 1. Enable Required Security & Crypto Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. TABLE: admin_users (Team Members, Staff & Tab Permissions)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT,
  temp_password TEXT,
  name VARCHAR(200) NOT NULL,
  designation VARCHAR(200) NOT NULL,
  role VARCHAR(100) NOT NULL DEFAULT 'Super Admin',
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  allowed_tabs JSONB NOT NULL DEFAULT '["overview", "create-post", "edit-post", "approve-post", "publish-post", "gallery", "podcasts", "main-menu", "homepage-sections", "emergency", "setup-access", "ads", "settings", "database"]'::jsonb,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 3. MAXIMUM ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Select / Read Admin Users
CREATE POLICY "Allow read admin users"
  ON public.admin_users FOR SELECT
  USING (true);

-- Policy: Insert / Create Admin Users
CREATE POLICY "Allow insert admin users"
  ON public.admin_users FOR INSERT
  WITH CHECK (true);

-- Policy: Update / Modify Permissions & Passwords
CREATE POLICY "Allow update admin users"
  ON public.admin_users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Delete Admin Users
CREATE POLICY "Allow delete admin users"
  ON public.admin_users FOR DELETE
  USING (true);

-- ====================================================================
-- 4. SEED INITIAL SUPER ADMIN: "মোঃ বিপ্লব হোসেন"
-- (সকল প্রাথমিক পারমিশন সহ একমাত্র মূল অ্যাডমিন)
-- ====================================================================
INSERT INTO public.admin_users (
  user_code,
  username,
  password_hash,
  temp_password,
  name,
  designation,
  role,
  phone,
  email,
  avatar,
  status,
  allowed_tabs
) VALUES (
  'JNG-1001',
  'biplob.admin',
  crypt('Biplob@Jonogon2026', gen_salt('bf', 12)),
  'Biplob@Jonogon2026',
  'মোঃ বিপ্লব হোসেন',
  'প্রধান সম্পাদক ও প্রকাশক',
  'Super Admin',
  '01936618534',
  'brandbiplob1234@gmail.com',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80',
  'active',
  '["overview", "create-post", "edit-post", "approve-post", "publish-post", "gallery", "podcasts", "main-menu", "homepage-sections", "emergency", "setup-access", "ads", "settings", "database"]'::jsonb
)
ON CONFLICT (username) DO UPDATE SET
  name = EXCLUDED.name,
  designation = EXCLUDED.designation,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  allowed_tabs = EXCLUDED.allowed_tabs;
