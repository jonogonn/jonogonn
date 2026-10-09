/**
 * Safe LocalStorage Utilities for Janogon News
 * Prevents QuotaExceededError crashes, strips bulky base64 data, and auto-cleans cached keys.
 */

// Helper to sanitize articles so they don't blow up localStorage quota (5MB limit)
export function sanitizeArticlesForCache(articlesList) {
  if (!Array.isArray(articlesList)) return [];

  // Limit to most recent 35 articles for localStorage cache (full list is loaded live from MariaDB/API)
  return articlesList.slice(0, 35).map((article) => {
    if (!article) return article;
    const clean = { ...article };

    // Strip huge base64 data URIs from cached image URLs if they exist
    if (typeof clean.imageUrl === 'string' && clean.imageUrl.startsWith('data:image/') && clean.imageUrl.length > 1000) {
      clean.imageUrl = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';
    }

    // Strip bulky block base64s from cached copy
    if (Array.isArray(clean.blocks)) {
      clean.blocks = clean.blocks.map((block) => {
        if (block?.type === 'image' && typeof block.imageUrl === 'string' && block.imageUrl.startsWith('data:image/') && block.imageUrl.length > 1000) {
          return { ...block, imageUrl: '' };
        }
        return block;
      });
    }

    return clean;
  });
}

// Safely set item in LocalStorage with automatic quota recovery
export function safeSetLocalStorage(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    let serialized;
    if (key === 'jonogon_articles' && Array.isArray(value)) {
      const sanitized = sanitizeArticlesForCache(value);
      serialized = JSON.stringify(sanitized);
    } else {
      serialized = typeof value === 'string' ? value : JSON.stringify(value);
    }

    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] QuotaExceededError or write failure for "${key}". Attempting auto-cleanup...`, err);

    // Evict non-essential caches
    try {
      localStorage.removeItem('jonogon_editor_drafts');
      localStorage.removeItem('jonogon_complaints');
      localStorage.removeItem('jonogon_admin_read_notifications');
      localStorage.removeItem('jonogon_load_popup_day_seen');

      // If key is jonogon_articles, try storing even smaller subset (15 items)
      if (key === 'jonogon_articles' && Array.isArray(value)) {
        const miniList = sanitizeArticlesForCache(value.slice(0, 15));
        localStorage.setItem(key, JSON.stringify(miniList));
        return true;
      }

      // Try re-saving the desired key
      const retrySerialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, retrySerialized);
      return true;
    } catch (cleanupErr) {
      console.warn(`[SafeStorage] Auto-cleanup retry failed for "${key}". Skipping localStorage cache.`, cleanupErr);
      return false;
    }
  }
}

// Safely get item from LocalStorage
export function safeGetLocalStorage(key, fallback = null) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;

    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch (err) {
    console.warn(`[SafeStorage] Failed to read "${key}" from localStorage:`, err);
    return fallback;
  }
}

// Safely remove item from LocalStorage
export function safeRemoveLocalStorage(key) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Failed to remove "${key}":`, err);
  }
}
