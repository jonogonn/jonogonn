/**
 * ============================================================================
 * 🚀 ভিউ গণনা সেটিংস ও অর্গানিক রেন্ডম ভিউ সিস্টেম
 * ============================================================================
 * প্রতিটি পোস্টের জন্য একটি সুনির্দিষ্ট বাস্তবসম্মত ও বিশ্বাসযোগ্য ভিউ সংখ্যা 
 * নির্ধারণ করা হয়, যাতে মনে না হয় এগুলো ফেক বা স্থির কোনো সংখ্যা:
 *
 * ১. হাইলাইটেড / লিড / ভাইরাল পোস্ট (প্রায় ২৫% পোস্ট): ২,০০০+ থেকে ৪,৮০০+ ভিউ
 * ২. জনপ্রিয় ট্রেন্ডিং পোস্ট (প্রায় ৩৫% পোস্ট): ১,২০০ থেকে ১,৯০০+ ভিউ
 * ৩. সাধারণ সংবাদ (প্রায় ৪০% পোস্ট): ৫২০ থেকে ১,১৫০ ভিউ
 * ৪. প্রতিটি সংখ্যা প্রাকৃতিক ও অনন্য (যেমন: ৭৪২, ১,৩৮৫, ২,৩৪০, ৩,১৮০)
 * ৫. আসল ক্লিকের সাথে সাথে ভিউ প্রতিনিয়ত আরও বৃদ্ধি পায়
 * ============================================================================
 */
export const VIEW_CONFIG = {
  INITIAL_RAMP_MINUTES: 15,  // পোস্ট পাবলিশের ১ম ১৫ মিনিটে ধীরে ধীরে ভিউ বৃদ্ধি
  MULTIPLIER_LIMIT: 5000,    // ৫০০০ ভিউ পর্যন্ত ৫ গুণ হারে বৃদ্ধি
  MULTIPLIER_RATE: 5,        // ক্লিকে ৫ ভিউ যোগ হবে
  NORMAL_RATE: 1             // ৫০০০ পার হলে ১ ভিউ যোগ হবে
};

/**
 * পোস্টের ইউনিক আইডি থেকে একটি অপরিবর্তনশীল (Deterministic) হ্যাশ তৈরি
 * যাতে একই পোস্টের ভিউ প্রতিটি পেজ লোডে রেন্ডমলি না বদলায়
 */
function getArticleHash(article) {
  if (!article) return 12345;
  const idStr = String(
    article.id ||
    article.postId ||
    article.post_id ||
    article.db_id ||
    article.slug ||
    article.titleBn ||
    article.titleEn ||
    '1'
  );
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * পোস্টের ক্যাটাগরি, হাইলাইট ও হ্যাশের উপর ভিত্তি করে অর্গানিক টার্গেট ভিউ তৈরি
 * (কিছু পোস্ট ২কে+, কিছু পোস্ট ১.২-১.৯কে, কিছু পোস্ট ৫০০-১.১কে)
 */
export function getOrganicTargetViews(article) {
  if (!article) return 520;
  const hash = getArticleHash(article);
  const mod = hash % 100;

  let baseViews = 520;
  if (article.isHighlighted || article.isLeadHero || article.isBreaking || mod < 25) {
    // ২K+ ভিউ (২,১৫০ থেকে ৪,৮৫০ এর মধ্যে বৈচিত্র্যপূর্ণ ভিউ)
    baseViews = 2150 + (hash % 2700);
  } else if (mod < 60) {
    // ১.২K থেকে ১.৯K ভিউ
    baseViews = 1200 + (hash % 750);
  } else {
    // ৫০০ থেকে ১.১৫K ভিউ
    baseViews = 520 + (hash % 630);
  }

  // বিজোড় বা অপ্রাকৃতিক রাউন্ড নাম্বার (যেমন ৫০০, ১০০০) এড়াতে ন্যাচারাল জিটার যোগ
  const naturalJitter = (hash % 89) + 7;
  return baseViews + naturalJitter;
}

/**
 * পোস্টের পাবলিশ সময় অনুযায়ী প্রদেয় ভিউ হিসাব করার হেল্পার ফাংশন
 * @param {object} article - নিউজ পোস্ট অবজেক্ট
 * @returns {number} কার্যকর ভিউ সংখ্যা
 */
export function getEffectiveViews(article) {
  if (!article) return 0;
  const rawViews = parseInt(article.views || 0, 10) || 0;

  // শুধুমাত্র পাবলিশ বা অনুমোদিত পোস্টেই অর্গানিক ভিউ সক্রিয়
  const isPublished = !article.status || article.status === 'published' || article.status === 'approved';
  if (!isPublished) return rawViews;

  const targetViews = getOrganicTargetViews(article);

  // যদি ডাটাবেজে ইতোমধ্যে এর চেয়ে বেশি ভিউ থাকে (আসল ক্লিক), তবে সেটিই অগ্রাধিকার পাবে
  if (rawViews > targetViews) {
    return rawViews;
  }

  const timeStr = article.publishedAt || article.published_at || article.createdAt || article.created_at || article.dateEn;
  if (!timeStr) {
    return targetViews;
  }

  const pubDate = new Date(timeStr);
  const publishTimestamp = pubDate.getTime();
  if (isNaN(publishTimestamp)) {
    return targetViews;
  }

  const elapsedMs = Date.now() - publishTimestamp;
  if (elapsedMs <= 0) {
    return Math.max(rawViews, Math.floor(targetViews * 0.2));
  }

  const elapsedMinutes = elapsedMs / (1000 * 60);

  // ১ম ১৫ মিনিটে সময়ের অনুপাতে ০.২ থেকে ১.০ পর্যন্ত গ্রো করবে
  let currentViews = targetViews;
  if (elapsedMinutes < VIEW_CONFIG.INITIAL_RAMP_MINUTES) {
    const fraction = Math.max(0.2, elapsedMinutes / VIEW_CONFIG.INITIAL_RAMP_MINUTES);
    currentViews = Math.floor(fraction * targetViews);
  }

  return Math.max(rawViews, currentViews);
}

/**
 * পাঠক সংবাদ পড়ার পর পরবর্তী ভিউ কত হবে তা হিসাব করার ফাংশন
 * @param {number} currentViews - বর্তমান ভিউ
 * @returns {number} পরবর্তী ভিউ
 */
export function calculateNextViews(currentViews) {
  const current = parseInt(currentViews || 0, 10) || 0;
  if (current < VIEW_CONFIG.MULTIPLIER_LIMIT) {
    return current + VIEW_CONFIG.MULTIPLIER_RATE;
  }
  return current + VIEW_CONFIG.NORMAL_RATE;
}
