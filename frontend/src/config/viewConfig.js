/**
 * ============================================================================
 * 🚀 ভিউ গণনা সেটিংস (VIEW COUNT SYSTEM CONFIGURATION)
 * ============================================================================
 * আপনি যেকোনো সময় নিচের মানগুলো পরিবর্তন করে সিস্টেমের নিয়ম পরিবর্তন করতে পারবেন:
 *
 * ১. INITIAL_RAMP_MINUTES : পোস্ট পাবলিশের পর কত মিনিটের মধ্যে অটো ভিউ পূর্ণ হবে (মিনিট)
 * ২. INITIAL_AUTO_VIEWS   : প্রথম ১০ মিনিটে মোট কত ভিউ অটোমেটিক হবে
 * ৩. MULTIPLIER_LIMIT     : কত ভিউ পর্যন্ত গুণিতক (Multiplier) চালু থাকবে (যেমন ২০০০)
 * ৪. MULTIPLIER_RATE      : ২০০০ এর নিচে থাকলে প্রতি ক্লিকে কত ভিউ যোগ হবে (১ ভিউ = ৫ ভিউ)
 * ৫. NORMAL_RATE          : ২০০০ পার হওয়ার পর প্রতি ক্লিকে কত ভিউ যোগ হবে (১ ভিউ = ১ ভিউ)
 * ============================================================================
 */
export const VIEW_CONFIG = {
  INITIAL_RAMP_MINUTES: 10,  // প্রথম ১০ মিনিট
  INITIAL_AUTO_VIEWS: 200,   // প্রথম ১০ মিনিটে মোট ২০০ ভিউ হবে (অটোমেটিক)
  MULTIPLIER_LIMIT: 2000,    // ২০০০ ভিউ পর্যন্ত ৫ গুণ হারে চলবে
  MULTIPLIER_RATE: 5,        // ২০০০ এর নিচে থাকলে ১ ভিউ = ৫ ভিউ
  NORMAL_RATE: 1             // ২০০০ পার হওয়ার পর ১ ভিউ = ১ ভিউ
};

/**
 * পোস্টের পাবলিশ সময় অনুযায়ী প্রদেয় ভিউ হিসাব করার হেল্পার ফাংশন
 * @param {object} article - নিউজ পোস্ট অবজেক্ট
 * @returns {number} কার্যকর ভিউ সংখ্যা
 */
export function getEffectiveViews(article) {
  if (!article) return 0;
  const rawViews = parseInt(article.views || 0, 10) || 0;

  // শুধুমাত্র পাবলিশ বা অনুমোদিত পোস্টেই অটো ভিউ কাজ করবে (ড্রাফট বা পেন্ডিং এ নয়)
  const isPublished = article.status === 'published' || article.status === 'approved';
  if (!isPublished) return rawViews;

  const timeStr = article.publishedAt || article.published_at || article.createdAt || article.created_at;
  if (!timeStr) return Math.max(rawViews, VIEW_CONFIG.INITIAL_AUTO_VIEWS);

  // পাবলিশ টাইম পার্সিং
  const pubDate = new Date(timeStr);
  const publishTimestamp = pubDate.getTime();
  if (isNaN(publishTimestamp)) {
    return Math.max(rawViews, VIEW_CONFIG.INITIAL_AUTO_VIEWS);
  }

  const elapsedMs = Date.now() - publishTimestamp;
  if (elapsedMs <= 0) return rawViews;

  const elapsedMinutes = elapsedMs / (1000 * 60);

  // ১০ মিনিট পার হয়ে গেলে কমপক্ষে ২০০ ভিউ নিশ্চিত
  let autoViews = VIEW_CONFIG.INITIAL_AUTO_VIEWS;
  if (elapsedMinutes < VIEW_CONFIG.INITIAL_RAMP_MINUTES) {
    // ১ম ১০ মিনিটে সময়ের অনুপাতে ০ থেকে ২০০ পর্যন্ত গ্রো করবে
    autoViews = Math.floor((elapsedMinutes / VIEW_CONFIG.INITIAL_RAMP_MINUTES) * VIEW_CONFIG.INITIAL_AUTO_VIEWS);
  }

  // ডাটাবেজের ভিউ এবং অটো ভিউয়ের মধ্যে যেটি বড়, সেটিই কার্যকর ভিউ
  return Math.max(rawViews, autoViews);
}

/**
 * পাঠক সংবাদ পড়ার পর পরবর্তী ভিউ কত হবে তা হিসাব করার ফাংশন
 * @param {number} currentViews - বর্তমান ভিউ
 * @returns {number} পরবর্তী ভিউ
 */
export function calculateNextViews(currentViews) {
  const current = parseInt(currentViews || 0, 10) || 0;
  if (current < VIEW_CONFIG.MULTIPLIER_LIMIT) {
    // ২০০০ ভিউ না হওয়া পর্যন্ত প্রতি ক্লিকে ৫ ভিউ (১ ভিউ = ৫ ভিউ)
    return current + VIEW_CONFIG.MULTIPLIER_RATE;
  }
  // ২০০০ পার হলে সাধারণ ১ ভিউ (১ ভিউ = ১ ভিউ)
  return current + VIEW_CONFIG.NORMAL_RATE;
}
