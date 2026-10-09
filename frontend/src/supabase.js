import { createClient } from '@supabase/supabase-js';

// Default Supabase project configuration (configured for project mxzsmulbandttegciiiy)
const defaultSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  localStorage.getItem('jonogon_supabase_url') ||
  'https://mxzsmulbandttegciiiy.supabase.co';

const defaultSupabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  localStorage.getItem('jonogon_supabase_key') ||
  'sb_publishable_Jc-AC8KtLHXR6Pg3mj45Mw_EIW9V_T2';

// Initialize Supabase Client
export let supabase = createClient(defaultSupabaseUrl, defaultSupabaseAnonKey);

/**
 * Re-initialize Supabase client dynamically when user saves custom credentials in Admin Panel
 */
export function configureSupabase(url, anonKey) {
  if (url && anonKey) {
    supabase = createClient(url, anonKey);
    localStorage.setItem('jonogon_supabase_url', url);
    localStorage.setItem('jonogon_supabase_key', anonKey);
    return true;
  }
  return false;
}

/**
 * Upload an image file to Supabase Storage with WebP extension and return the public CDN URL
 */
export async function uploadImageToStorage(file, bucketName = 'news-images') {
  try {
    // Generate clean unique filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${cleanName}`;

    // Upload to Supabase Bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`uploads/${fileName}`, file, {
        cacheControl: '360000',
        upsert: false,
        contentType: file.type || 'image/webp'
      });

    if (error) {
      console.warn('Supabase storage upload fallback:', error.message);
      // Fallback: create base64 / blob URL for immediate local demonstration
      return URL.createObjectURL(file);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`uploads/${fileName}`);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Upload failed, using local object URL:', err);
    return URL.createObjectURL(file);
  }
}
