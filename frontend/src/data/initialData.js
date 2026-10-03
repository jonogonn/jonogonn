/**
 * Master Initial Data for Jonogon News (জনগণ.নিউজ)
 * Loaded into local state & Supabase database
 */

export const initialSiteSettings = {
  siteNameBn: 'জনগণ.নিউজ',
  siteNameEn: 'Jonogon News',
  sloganBn: 'সত্যের সাথে, জনতার পাশে',
  sloganEn: 'With Truth, Standing for the People',
  domain: 'jonogon.news',
  websiteUrl: 'https://jonogon.news',
  logoUrl: '/logo.svg',
  
  // Brand Colors (Strictly No Gradients)
  primaryRed: '#E60012',
  darkRed: '#A8000D',
  white: '#FFFFFF',
  black: '#111111',
  silver: '#D9D9D9',

  // Typography Options
  fontHeadline: "'Anek Bangla', 'Inter', sans-serif",
  fontSubheadline: "'Hind Siliguri', 'Inter', sans-serif",
  fontBody: "'Noto Sans Bengali', 'Inter', sans-serif",
  fontEditorial: "'Noto Serif Bengali', serif",

  // Founder & Editorial Info
  founderBn: 'মোঃ বিপ্লব হোসেন',
  founderEn: 'Md. Biplob Hossain',
  designationBn: 'স্বত্বাধিকারী ও সম্পাদক',
  designationEn: 'Owner & Editor',
  organization: 'Jonogon News',

  // Office & Contact Info
  address: 'House 101, Alia Madrasa Road, Faydabad, Dakshinkhan, Dhaka-1230',
  phone: '01936618534',
  email: 'brandbiplob1234@gmail.com',
  facebook: 'https://www.facebook.com/jonogon.newstv/',
  youtube: 'https://www.youtube.com/@jonogon.newstv',
  country: 'Bangladesh',

  // Google AdSense & Ads Configuration
  adSenseEnabled: true,
  adSenseClientId: 'ca-pub-9876543210987654',
  adSlots: {
    topHeaderBanner: { enabled: true, code: '', fallbackText: 'Advertisement (Google AdSense) — 728 × 90' },
    leadSidebarAd: { enabled: true, code: '', fallbackText: 'Advertisement\nGoogle AdSense\n300 × 250' },
    midContentBanner: { enabled: true, code: '', fallbackText: 'Advertisement (Google AdSense) — 970 × 90' },
    videoSidebarAd: { enabled: true, code: '', fallbackText: 'Advertisement\nGoogle AdSense\n300 × 600' },
    bottomBanner: { enabled: true, code: '', fallbackText: 'Advertisement (Google AdSense) — 970 × 90' }
  },

  // Terms & Conditions and Policies (Editable from Admin)
  termsAndConditions: `১. ভূমিকা: জনগণ.নিউজ (Jonogon News)-এ আপনাকে স্বাগতম। এই ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি আমাদের সকল নীতিমালা ও শর্তাবলী মেনে নিচ্ছেন।
২. তথ্যের সত্যতা ও কপিরাইট: জনগণ.নিউজ-এ প্রকাশিত সকল সংবাদ, ছবি, অডিও ও ভিডিও কনটেন্ট কপিরাইট আইনের আওতাভুক্ত। অনুমতি ছাড়া বাণিজ্যিক উদ্দেশ্যে এগুলো পুনরুৎপাদন বা প্রচার সম্পূর্ণ নিষিদ্ধ।
৩. ব্যবহারকারীর আচরণ: কোনো ব্যবহারকারী কমেন্ট সেকশন বা সোশ্যাল চ্যানেলে আপত্তিকর, অশালীন বা রাষ্ট্রবিরোধী কোনো মন্তব্য করতে পারবেন না।
৪. বিজ্ঞাপনের দায়বদ্ধতা: ওয়েবসাইটে প্রদর্শিত যেকোনো বিজ্ঞাপনের সত্যতা যাচাইয়ের দায়িত্ব সংশ্লিষ্ট বিজ্ঞাপনদাতার।`,

  privacyPolicy: `জনগণ.নিউজ (Jonogon News) তার পাঠকদের ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষায় সর্বোচ্চ শ্রদ্ধাশীল।
১. তথ্য সংগ্রহ: ওয়েবসাইট ভিজিটের সময় কুকিজ বা ব্রাউজিং পরিসংখ্যান অ্যানালিটিক্স ও বিজ্ঞাপনের উন্নয়নের স্বার্থে ব্যবহার হতে পারে।
২. ডেটা নিরাপত্তা: আমরা ব্যবহারকারীদের কোনো ব্যক্তিগত তথ্য (যেমন ইমেইল বা ফোন নম্বর) তৃতীয় কোনো পক্ষের কাছে বিক্রি বা অপব্যবহার করি না।
৩. যোগাযোগ: গোপনীয়তা বিষয়ে যেকোনো প্রশ্নে যোগাযোগ করুন: brandbiplob1234@gmail.com`,

  editorialPolicy: `জনগণ.নিউজ সবসময় নিরপেক্ষ, বস্তুনিষ্ঠ ও জনকল্যাণমুখী সাংবাদিকতায় বিশ্বাসী।
১. সততা ও জবাবদিহিতা: প্রতিটি সংবাদ পরিবেশনে যথাযথ তথ্য যাচাই এবং সকল পক্ষের মতামত উপস্থাপনের চেষ্টা করা হয়।
২. বিভ্রান্তিমুক্ত পরিবেশনা: গুজব, ভুল তথ্য এবং অপপ্রচারের বিরুদ্ধে আমাদের টিম সতর্ক অবস্থান বজায় রাখে।`
};

export const initialCategories = [
  { id: 'latest', nameBn: 'সর্বশেষ', nameEn: 'Latest', slug: 'latest' },
  { id: 'bangladesh', nameBn: 'বাংলাদেশ', nameEn: 'Bangladesh', slug: 'bangladesh' },
  { id: 'politics', nameBn: 'রাজনীতি', nameEn: 'Politics', slug: 'politics' },
  { id: 'world', nameBn: 'আন্তর্জাতিক', nameEn: 'World', slug: 'world' },
  { id: 'saradesh', nameBn: 'সারাদেশ', nameEn: 'Countrywide', slug: 'countrywide' },
  { id: 'district', nameBn: 'জেলা', nameEn: 'Districts', slug: 'districts' },
  { id: 'economy', nameBn: 'অর্থনীতি', nameEn: 'Economy', slug: 'economy' },
  { id: 'education', nameBn: 'শিক্ষা', nameEn: 'Education', slug: 'education' },
  { id: 'sports', nameBn: 'খেলাধুলা', nameEn: 'Sports', slug: 'sports' },
  { id: 'entertainment', nameBn: 'বিনোদন', nameEn: 'Entertainment', slug: 'entertainment' },
  { id: 'tech', nameBn: 'প্রযুক্তি', nameEn: 'Tech', slug: 'tech' },
  { id: 'lifestyle', nameBn: 'জীবনযাপন', nameEn: 'Lifestyle', slug: 'lifestyle' },
  { id: 'opinion', nameBn: 'মতামত', nameEn: 'Opinion', slug: 'opinion' },
  { id: 'special', nameBn: 'বিশেষ প্রতিবেদন', nameEn: 'Special Report', slug: 'special' },
  { id: 'video', nameBn: 'ভিডিও', nameEn: 'Video', slug: 'video' }
];

export const initialBreakingNews = [
  { id: '1', textBn: 'নতুন নির্বাচন কমিশন গঠনের পথে সরকার, নাম আসছে আলোচনায়', textEn: 'Government in process of forming new Election Commission, names under discussion' },
  { id: '2', textBn: 'জ্বালানি তেলের দাম কমতে পারে আগামী সপ্তাহে', textEn: 'Fuel prices may decrease in the coming week' },
  { id: '3', textBn: 'উপকূল নিম্নাঞ্চল, ৪ জেলায় সতর্কসংকেত জারি', textEn: 'Low-lying coastal areas flooded, warning signals issued in 4 districts' }
];

export const initialNewsArticles = [
  // 1. Big Hero Lead Story (matching reference UI)
  {
    id: 'hero-1',
    titleBn: 'নতুন নির্বাচন কমিশন গঠনের পথে সরকার, নাম আসছে আলোচনায়',
    titleEn: 'Government moving toward forming new Election Commission, names under discussion',
    category: 'bangladesh',
    categoryBn: 'বাংলাদেশ',
    excerptBn: 'প্রধান উপদেষ্টা ও সংশ্লিষ্ট স্টেকহোল্ডারদের সাথে বৈঠকের পর নতুন নির্বাচন কমিশন গঠনের খসড়া রূপরেখা প্রস্তুত করা হয়েছে। যোগ্য ও নিরপেক্ষ ব্যক্তিত্বদের নাম যাচাই-বাছাই চলছে।',
    excerptEn: 'Following high-level consultations with the Chief Adviser and key stakeholders, the draft framework for forming the new Election Commission has been finalized.',
    contentBn: `প্রধান উপদেষ্টা ও অন্তর্বর্তীকালীন সরকারের নীতি নির্ধারকদের মধ্যে ধারাবাহিক আলোচনার পর নতুন নির্বাচন কমিশন (ইসি) গঠনের আনুষ্ঠানিক প্রক্রিয়া শুরু হতে যাচ্ছে। সংশ্লিষ্ট সূত্র জানিয়েছে, একটি সার্চ কমিটি গঠনের মাধ্যমে আগামী কয়েক সপ্তাহের মধ্যে যোগ্য ও গ্রহণযোগ্য ব্যক্তিদের নাম চূড়ান্ত করা হবে।\n\nবিভিন্ন রাজনৈতিক দল ও নাগরিক সমাজের পক্ষ থেকে প্রস্তাবিত নামগুলো গুরুত্বের সাথে বিবেচনা করা হচ্ছে। নির্বাচন ব্যবস্থাকে সম্পূর্ণ স্বচ্ছ, আধুনিক ও গ্রহণযোগ্য করাই সরকারের মূল লক্ষ্য বলে জানিয়েছেন সংশ্লিষ্ট উপদেষ্টা।`,
    contentEn: `The government has initiated formal steps to constitute a new and universally acceptable Election Commission. Key names from civil society and seasoned jurists are currently under review by a specialized search committee.`,
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১২:৪৫',
    dateEn: '28 Sep 2026, 12:45 PM',
    readTimeBn: '৫ মিনিট পড়তে',
    readTimeEn: '5 min read',
    author: 'জনগণ নিউজ ডেস্ক',
    views: 14200,
    isLeadHero: true,
    isBreaking: true
  },

  // 2. Lead Side Column Stories (4 Items)
  {
    id: 'lead-side-1',
    titleBn: 'সংস্কার কমিশনের কয়েকটি সুপারিশ গ্রহণের ইঙ্গিত সরকারের',
    titleEn: 'Government hints at accepting several key reform commission recommendations',
    category: 'politics',
    categoryBn: 'রাজনীতি',
    excerptBn: 'রাষ্ট্র সংস্কারে গঠিত কমিশনগুলোর উল্লেখযোগ্য কিছু সুপারিশ দ্রুত বাস্তবায়নের পথে হাঁটছে সরকার।',
    excerptEn: 'The administration is set to implement crucial administrative reform proposals shortly.',
    contentBn: 'রাষ্ট্র সংস্কারে গঠিত কমিশনগুলোর কাজের অগ্রগতির ভিত্তিতে গুরুত্বপূর্ণ কিছু প্রশাসনিক ও আইনি সুপারিশ বাস্তবায়নে সরকার প্রস্তুতি নিচ্ছে।',
    contentEn: 'Preparations are underway to adopt critical judicial and electoral reform measures.',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪',
    dateEn: '28 Sep 2026',
    author: 'রাজনৈতিক প্রতিবেদক',
    views: 8900
  },
  {
    id: 'lead-side-2',
    titleBn: 'গাজায় নতুন করে হামলা, নিহত আরও ৪৮ জন',
    titleEn: 'Renewed strikes in Gaza, death toll rises by 48',
    category: 'world',
    categoryBn: 'বিশ্ব',
    excerptBn: 'মধ্য গাজার শরণার্থী শিবিরে বিমান হামলায় ব্যাপক হতাহতের খবর পাওয়া গেছে।',
    excerptEn: 'Heavy casualties reported following overnight airstrikes on refugee shelters.',
    contentBn: 'আন্তর্জাতিক মানবিক সহায়তা সংস্থার আহ্বান সত্ত্বেও অবরুদ্ধ গাজা উপত্যকায় হামলা অব্যাহত রয়েছে।',
    contentEn: 'Humanitarian agencies reiterate urgent appeals for an immediate ceasefire.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪',
    dateEn: '28 Sep 2026',
    author: 'আন্তর্জাতিক ডেস্ক',
    views: 11400
  },
  {
    id: 'lead-side-3',
    titleBn: 'ডলারের দাম কমলেও নিত্যপণ্যের বাজারে স্বস্তি নেই',
    titleEn: 'Despite stabilizing dollar rates, commodity market relief remains elusive',
    category: 'economy',
    categoryBn: 'অর্থনীতি',
    excerptBn: 'আমদানি ব্যয় কমলেও পাইকারি ও খুচরা বাজারে পণ্যের বাড়তি দামের কারণে দুর্ভোগে সাধারণ মানুষ।',
    excerptEn: 'Retail markets continue to see high price tags despite softening import costs.',
    contentBn: 'রাজধানীর কাঁচাবাজার ও পাইকারি বাজারে এখনো উচ্চমূল্যে বিক্রি হচ্ছে চাল, ডাল, তেলসহ নিত্যপ্রয়োজনীয় পণ্য। ভোক্তা অধিকার সংরক্ষণ অধিদফতর নিয়মিত মনিটরিং চালালেও সিন্ডিকেটের কারসাজিতে দাম কমছে না।',
    contentEn: 'Essential food staples remain expensive across metropolitan retail hubs.',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪',
    dateEn: '28 Sep 2026',
    author: 'অর্থনীতি ব্যুরো',
    views: 7800
  },
  {
    id: 'lead-side-4',
    titleBn: 'এশিয়া কাপের আগে দলে বড় পরিবর্তনের আভাস',
    titleEn: 'Major team changes expected ahead of upcoming Asia Cup',
    category: 'sports',
    categoryBn: 'খেলাধুলা',
    excerptBn: 'তারুণ্য ও অভিজ্ঞতার সমন্বয়ে নতুন দল ঘোষণার প্রস্তুতি নিচ্ছে ক্রিকেট বোর্ড।',
    excerptEn: 'Cricket board preparing a balanced squad featuring promising youth talents.',
    contentBn: 'জাতীয় ক্রিকেট নির্বাচক প্যানেল আসন্ন আন্তর্জাতিক টুর্নামেন্টের জন্য ফিটনেস ও পারফরম্যান্সকে সর্বোচ্চ অগ্রাধিকার দিয়ে চূড়ান্ত স্কোয়াড সাজাচ্ছে।',
    contentEn: 'Selectors prioritize fitness and current form for the final continental lineup.',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪',
    dateEn: '28 Sep 2026',
    author: 'ক্রীড়া প্রতিবেদক',
    views: 9600
  },

  // 3. Section: সর্বশেষ সংবাদ (4 Horizontal Cards)
  {
    id: 'latest-1',
    titleBn: 'উত্তরাঞ্চলে নদ-নদীর পানি বেড়েছে, কয়েক জেলায় বন্যার শঙ্কা',
    titleEn: 'Rising river levels in northern region raise flood concerns in several districts',
    category: 'saradesh',
    categoryBn: 'সারাদেশ',
    excerptBn: 'উজানের ঢল ও ভারী বৃষ্টিপাতে তিস্তা ও যমুনা নদীর পানি বিপদসীমার কাছাকাছি প্রবাহিত হচ্ছে।',
    excerptEn: 'Teesta and Jamuna rivers flow near danger mark following upstream runoff.',
    contentBn: 'উত্তরাঞ্চলের বিস্তীর্ণ নিম্নাঞ্চল প্লাবিত হওয়ার উপক্রম হয়েছে। স্থানীয় প্রশাসন কন্ট্রোল রুম খুলে সার্বক্ষণিক নজরদারি চালাচ্ছে।',
    contentEn: 'Local authorities set up 24/7 monitoring hubs to aid vulnerable riverside communities.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১১:২০',
    dateEn: '28 Sep 2026, 11:20 AM',
    views: 6500
  },
  {
    id: 'latest-2',
    titleBn: 'ঢাকা-চট্টগ্রাম মহাসড়কে যান চলাচল স্বাভাবিক',
    titleEn: 'Traffic flow returns to normal on Dhaka-Chittagong Highway',
    category: 'saradesh',
    categoryBn: 'সারাদেশ',
    excerptBn: 'ফুটওভার ব্রিজ মেরামত ও শৃঙ্খলা জোরদারের পর দীর্ঘ যানজট নিরসন হয়েছে।',
    excerptEn: 'Extensive congestions cleared after scheduled highway infrastructure maintenance.',
    contentBn: 'হাইওয়ে পুলিশের সার্বক্ষণিক তৎপরতায় ঢাকা-চট্টগ্রাম মহাসড়কের গুরুত্বপূর্ণ পয়েন্টগুলোতে নির্বিঘ্নে যানবাহন চলাচল করছে।',
    contentEn: 'Highway police patrols ensure smooth transit along major economic transport corridors.',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:৪৫',
    dateEn: '28 Sep 2026, 10:45 AM',
    views: 5400
  },
  {
    id: 'latest-3',
    titleBn: 'এইচএসসি ফল প্রকাশ হতে পারে আগামী সপ্তাহে',
    titleEn: 'HSC Examination results likely to be published next week',
    category: 'education',
    categoryBn: 'শিক্ষা',
    excerptBn: 'সব শিক্ষা বোর্ডের ফলাফল তৈরির কাজ শেষ পর্যায়ে রয়েছে বলে জানিয়েছেন শিক্ষা কর্মকর্তারা।',
    excerptEn: 'Board officials confirm final tabulation phases are nearing completion.',
    contentBn: 'আন্তঃশিক্ষা বোর্ড সমন্বয় কমিটির সভাপতি জানান, ফলাফল প্রকাশের যাবতীয় প্রস্তুতি সম্পন্ন। মন্ত্রণালয় থেকে তারিখ চূড়ান্ত করলেই আনুষ্ঠানিকভাবে প্রকাশ করা হবে।',
    contentEn: 'Official announcements await ministerial schedule confirmation.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:৩০',
    dateEn: '28 Sep 2026, 10:30 AM',
    views: 12800
  },
  {
    id: 'latest-4',
    titleBn: 'জ্বালানি তেলের দাম কমতে পারে আগামী সপ্তাহে',
    titleEn: 'Fuel oil prices likely to decrease starting next week',
    category: 'economy',
    categoryBn: 'অর্থনীতি',
    excerptBn: 'আন্তর্জাতিক বাজারের সাথে স্বয়ংক্রিয় ফর্মুলা সমন্বয়ের অংশ হিসেবে নতুন মূল্য ঘোষণা করা হবে।',
    excerptEn: 'Dynamic fuel pricing formula set to reflect lower global crude benchmark values.',
    contentBn: 'জ্বালানি ও খনিজ সম্পদ বিভাগ আন্তর্জাতিক বাজারে ক্রুড অয়েলের দাম কমার সুফল সরাসরি ভোক্তাদের কাছে পৌঁছে দেওয়ার উদ্যোগ নিয়েছে।',
    contentEn: 'Energy ministry aims to pass on global market price reductions to end consumers.',
    imageUrl: 'https://images.unsplash.com/photo-1527018607619-a508a2be00be?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:০৫',
    dateEn: '28 Sep 2026, 10:05 AM',
    views: 9100
  },

  // 4. Section: বাংলাদেশ (Split Left)
  {
    id: 'bd-main',
    titleBn: 'দেশের উন্নয়নে সব রাজনৈতিক দলের সহযোগিতা চান প্রধান উপদেষ্টা',
    titleEn: 'Chief Adviser seeks cooperation from all political parties for national progress',
    category: 'bangladesh',
    categoryBn: 'বাংলাদেশ',
    excerptBn: 'প্রধান উপদেষ্টা বলেন, দেশের উন্নয়ন ও স্থিতিশীলতার স্বার্থে রাজনৈতিক দলগুলোর সৌহার্দ্যপূর্ণ সহযোগিতা অপরিহার্য।',
    excerptEn: 'Constructive dialogue and collective unity remain paramount for enduring stability.',
    contentBn: 'সুপ্রিম কোর্ট প্রাঙ্গণে অনুষ্ঠিত মতবিনিময় সভায় প্রধান উপদেষ্টা উল্লেখ করেন, জাতীয় স্বার্থে সব পক্ষকে কাঁধে কাঁধ মিলিয়ে কাজ করতে হবে।',
    contentEn: 'Addressing legal and civic leaders, the Chief Adviser emphasized unified collaborative governance.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১২:২০',
    dateEn: '28 Sep 2026, 12:20 PM',
    views: 13500
  },

  // 5. Section: ভিডিও সংবাদ (Split Right)
  {
    id: 'video-main',
    titleBn: 'পদ্মা সেতুতে নতুন রেললাইন: যা জানালেন কর্তৃপক্ষ',
    titleEn: 'New rail link on Padma Bridge: Key official insights',
    category: 'video',
    categoryBn: 'ভিডিও সংবাদ',
    excerptBn: 'রেল চলাচলের আধুনিক সংকেত ব্যবস্থা এবং দক্ষিণাঞ্চলের যোগাযোগ বিপ্লবের বিশেষ ভিডিও রিপোর্ট।',
    excerptEn: 'Exclusive video breakdown of modern signalling networks accelerating southern connectivity.',
    contentBn: 'পদ্মা সেতু দিয়ে নিয়মিত ট্রেন চলাচলের ফলে ঢাকা থেকে দক্ষিণাঞ্চলের জেলাগুলোতে পৌঁছাতে সময় অর্ধেকে নেমে এসেছে।',
    contentEn: 'High-speed transit reshapes passenger logistics and trade corridors across southern districts.',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:০৫',
    dateEn: '28 Sep 2026, 10:05 AM',
    videoDuration: '০:৩২',
    isVideo: true,
    views: 16800
  },
  {
    id: 'video-sub-1',
    titleBn: 'চাকরির বৃত্তি পরীক্ষার প্রস্তুতির প্রতিবেদন',
    titleEn: 'Special report on competitive scholarship exam strategies',
    category: 'video',
    categoryBn: 'ভিডিও',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
    videoDuration: '২:২৩',
    isVideo: true
  },
  {
    id: 'video-sub-2',
    titleBn: 'বাজারে নিত্যপণ্যের দাম নিয়ে বিশেষ প্রতিবেদন',
    titleEn: 'In-depth market overview on essential consumer pricing',
    category: 'video',
    categoryBn: 'ভিডিও',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    videoDuration: '১:৪৫',
    isVideo: true
  },
  {
    id: 'video-sub-3',
    titleBn: 'দক্ষিণাঞ্চলে বন্যা পরিস্থিতি ও ত্রাণ বিতরণ',
    titleEn: 'Southern flood conditions and emergency relief logistics',
    category: 'video',
    categoryBn: 'ভিডিও',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&q=80',
    videoDuration: '৩:৪৫',
    isVideo: true
  },

  // 6. Section: 8-Category Grid
  {
    id: 'grid-pol',
    titleBn: 'জাতীয় ঐক্যমতে পৌঁছাতে হবে: রাজনৈতিক দলের প্রতি আহবান',
    titleEn: 'Consensus required: National call to political entities',
    category: 'politics',
    categoryBn: 'রাজনীতি',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১১:১০',
    dateEn: '28 Sep 2026',
    views: 7400
  },
  {
    id: 'grid-world',
    titleBn: 'গাজায় নতুন করে হামলা, নিহত আরও ৪৮',
    titleEn: 'Renewed strikes in Gaza, death toll increases',
    category: 'world',
    categoryBn: 'বিশ্ব',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ০৯:৪০',
    dateEn: '28 Sep 2026',
    views: 8100
  },
  {
    id: 'grid-eco',
    titleBn: 'ডলারের দাম কমলেও নিত্যপণ্যের বাজারে স্বস্তি নেই',
    titleEn: 'Market relief sluggish despite dollar stabilizing',
    category: 'economy',
    categoryBn: 'অর্থনীতি',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:৫০',
    dateEn: '28 Sep 2026',
    views: 6200
  },
  {
    id: 'grid-sports',
    titleBn: 'এশিয়া কাপের আগে দলে বড় পরিবর্তনের আভাস',
    titleEn: 'Major squad overhauls ahead of Asia Cup campaign',
    category: 'sports',
    categoryBn: 'খেলা',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১১:১০',
    dateEn: '28 Sep 2026',
    views: 9300
  },
  {
    id: 'grid-ent',
    titleBn: 'নতুন সিনেমার শুটিং শুরু করলেন তনয়া',
    titleEn: 'Actress Tanaya kicks off filming for new feature film',
    category: 'entertainment',
    categoryBn: 'বিনোদন',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:২০',
    dateEn: '28 Sep 2026',
    views: 10500
  },
  {
    id: 'grid-tech',
    titleBn: 'নতুন ফিচার নিয়ে আসছে জনপ্রিয় মেসেজিং অ্যাপ',
    titleEn: 'Popular messaging app unveils AI-powered privacy tools',
    category: 'tech',
    categoryBn: 'প্রযুক্তি',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ০৯:০০',
    dateEn: '28 Sep 2026',
    views: 11900
  },
  {
    id: 'grid-life',
    titleBn: 'স্বাস্থ্য ভালো রাখতে যেসব খাবার রাখবেন প্রতিদিন',
    titleEn: 'Essential daily superfoods for sustained physical vitality',
    category: 'lifestyle',
    categoryBn: 'জীবনযাপন',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:১৪',
    dateEn: '28 Sep 2026',
    views: 8700
  },
  {
    id: 'grid-op',
    titleBn: 'নতুন বাংলাদেশ গঠনে আমাদের করণীয়',
    titleEn: 'Our collective responsibilities in rebuilding Bangladesh',
    category: 'opinion',
    categoryBn: 'মতামত',
    authorNameBn: 'ড. আতিকুর রহমান',
    authorNameEn: 'Dr. Atiqur Rahman',
    authorTitleBn: 'বিশিষ্ট কলামিস্ট ও শিক্ষাবিদ',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ০৯:৩০',
    dateEn: '28 Sep 2026',
    views: 14700,
    isOpinion: true
  }
];
