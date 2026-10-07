/**
 * Master Initial Data for Jonogon News
 * Loaded into local state & Supabase database
 */

export const initialSiteSettings = {
  siteNameBn: 'জনগণ.নিউজ',
  siteNameEn: 'Jonogon News',
  sloganBn: 'জনতার কণ্ঠস্বর',
  sloganEn: 'Voice of the People',
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
  addressBn: 'বাড়ি ১০১, আলিয়া মাদ্রাসা রোড, ফায়দাবাদ, দক্ষিণখান, ঢাকা-১২৩০',
  addressEn: 'House 101, Alia Madrasa Road, Faydabad, Dakshinkhan, Dhaka-1230',
  phone: '01936618534',
  whatsapp: '01936618534',
  adPhone: '01936618534',
  email: 'brandbiplob1234@gmail.com',
  adEmail: 'brandbiplob1234@gmail.com',
  facebook: 'https://www.facebook.com/jonogon.newstv/',
  youtube: 'https://www.youtube.com/@jonogon.newstv',
  twitter: 'https://twitter.com/jonogonnews',
  instagram: 'https://instagram.com/jonogonnews',
  linkedin: 'https://linkedin.com/company/jonogonnews',
  telegram: 'https://t.me/jonogonnews',
  country: 'Bangladesh',

  // Website On-Load Popup Settings
  loadPopup: {
    enabled: false,
    type: 'notice', // 'notice' | 'breaking' | 'ad' | 'welcome'
    titleBn: 'জনগণ.নিউজ-এ আপনাকে স্বাগতম',
    titleEn: 'Welcome to Jonogon News',
    messageBn: 'সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত ডিজিটাল মাধ্যম। দেশ-বিদেশের ব্রেকিং নিউজ এবং গভীর বিশ্লেষণের সাথে থাকুন।',
    messageEn: 'Your trusted digital source for authentic journalism, ground reporting and real-time updates.',
    imageUrl: '',
    actionTextBn: 'বিস্তারিত জানুন',
    actionTextEn: 'Learn More',
    actionUrl: '',
    frequency: 'once_per_session', // 'every_visit' | 'once_per_session' | 'once_per_day'
    autoCloseSeconds: 0
  },

  // Google AdSense & Ads Configuration
  adSenseEnabled: true,
  adSenseClientId: 'ca-pub-9876543210987654',
  adSlots: {
    topHeaderBanner: { enabled: true, code: '', fallbackText: 'Advertisement (Google AdSense) — 728 × 90' },
    leadSidebarAd: { enabled: true, code: '', fallbackText: 'Advertisement\nGoogle AdSense\n300 × 250' },
    midContentBanner: { enabled: true, code: '', fallbackText: 'Advertisement (Google AdSense) — 970 × 90' },
    videoSidebarAd: { enabled: true, code: '', fallbackText: 'Advertisement (Google AdSense) — 300 × 600' },
    topSlidingAd: { enabled: true, code: '', fallbackText: '📢 বিশেষ বিজ্ঞাপন: আপনার ব্যবসার ডিজিটাল প্রচার ও বিজ্ঞাপনের জন্য যোগাযোগ করুন: ০১৯৩৬-৬১৮৫৩৪' },
    bottomSlidingAd: { enabled: true, code: '', fallbackText: '⚡ ব্রেকিং নোটিফিকেশন ও স্পন্সরড অফার — জনতার কণ্ঠস্বর জনগণ.নিউজ' }
  },

  // About Us Information
  aboutUsBn: `জনগণ.নিউজ (Jonogon.News) একটি স্বাধীন, নিরপেক্ষ ও জনকল্যাণমুখী ডিজিটাল সংবাদ মাধ্যম। আমরা ‘জনতার কণ্ঠস্বর’ মূলমন্ত্রে বিশ্বাসী। তৃণমূলের কণ্ঠস্বর থেকে শুরু করে জাতীয় ও বৈশ্বিক পলিসি—সব ক্ষেত্রেই বস্তুনিষ্ঠ তথ্য পৌঁছে দিতে আমাদের সংবাদকর্মীরা নিরলসভাবে কাজ করে যাচ্ছেন।`,
  aboutUsEn: `Jonogon News is an independent, non-partisan digital news organization dedicated to authentic journalism. Our core philosophy is "Voice of the People".`,
  missionBn: `নির্ভীক ও সৎ সাংবাদিকতার মাধ্যমে জনগণের তথ্যের অধিকার নিশ্চিত করা এবং সমাজের অন্যায় ও অসঙ্গতি তুলে ধরে একটি জবাবদিহিতামূলক সমাজ গঠনে সহায়তা করা।`,
  missionEn: `To empower the citizens with unbiased, verified information and foster transparent democratic dialogue.`,
  visionBn: `বাংলাদেশের অন্যতম নির্ভরযোগ্য ও প্রযুক্তিবান্ধব ডিজিটাল গণমাধ্যম হিসেবে বিশ্বমঞ্চে সত্যের পক্ষে প্রতিনিধিত্ব করা।`,
  visionEn: `To be the premier digital news portal recognized globally for journalistic integrity and public trust.`,

  // Advertisement Policy & Terms
  advertisementTermsBn: `১. বিজ্ঞাপনের গ্রহণযোগ্যতা: জনগণ.নিউজ-এ প্রচারিত সকল বিজ্ঞাপনের বিষয়বস্তু বাংলাদেশের জাতীয় আইন, ভোক্তা অধিকার ও শালীনতা বজায় রেখে হতে হবে।
২. দায়বদ্ধতা: বিজ্ঞাপনে উল্লেখিত পণ্য বা সেবার গুণগত মান ও প্রতিশ্রুতির একক দায় সংশ্লিষ্ট বিজ্ঞাপনদাতার।
৩. অগ্রিম পেমেন্ট: ডিজিটাল ব্যানার বা স্পন্সরড আর্টিকেলের ক্ষেত্রে নির্ধারিত পেমেন্ট সম্পন্ন হওয়ার পর বিজ্ঞাপন কার্যকর হবে।
৪. পরিবর্তন বা বাতিল: বুকিংয়ের ২৪ ঘণ্টার মধ্যে বিজ্ঞাপন পরিবর্তনের সুযোগ থাকে।`,
  advertisementTermsEn: `1. Ad Compliance: All digital ad creatives must comply with the laws and ethical advertising guidelines of Bangladesh.
2. Advertiser Responsibility: Quality and claims made in advertisements are the sole responsibility of the advertiser.
3. Pre-payment: All campaigns require confirmed upfront billing via Bank, bKash or approved gateways.`,
  adRatesSummaryBn: `টপ হেডার ব্যানার (৭২৮×৯০): ১৫,০০০ টাকা/মাস
ইন-কনটেন্ট ব্যানার (৯৭০×৯০): ১২,০০০ টাকা/মাস
সাইডবার ব্যানার (৩০০×২৫০): ৮,০০০ টাকা/মাস
স্টিকি ভিডিও ব্যানার (৩০০×৬০০): ১০,০০০ টাকা/মাস`,
  adRatesSummaryEn: `Top Header Banner (728x90): BDT 15,000 / month
In-Content Banner (970x90): BDT 12,000 / month
Sidebar Banner (300x250): BDT 8,000 / month
Sticky Half-Page Banner (300x600): BDT 10,000 / month`,
  adPaymentInfoBn: `বিকাশ / নগদ মার্চেন্ট: 01936618534
ব্যাংক ট্রান্সফার: ডাচ-বাংলা ব্যাংক লিমিটেড / সিটি ব্যাংক
অফিসিয়াল যোগাযোগ: brandbiplob1234@gmail.com`,
  adPaymentInfoEn: `bKash / Nagad Merchant: 01936618534
Bank Wire: Dutch-Bangla Bank Limited / The City Bank
Commercial Desk: brandbiplob1234@gmail.com`,

  // Terms & Conditions and Policies
  termsAndConditions: `১. শর্তাবলীর গ্রহণযোগ্যতা ও আওতা: জনগণ.নিউজ (Jonogon News) অনলাইন পোর্টাল, মোবাইল সংস্করণ বা সামাজিক যোগাযোগ মাধ্যমের যেকোনো কনটেন্ট পাঠ ও ব্যবহারের ক্ষেত্রে আপনি এই শর্তাবলীর প্রতি পূর্ণ সম্মতি জ্ঞাপন করছেন। যদি আপনি এই শর্তাবলীর কোনো অংশে অসম্মত হন, তবে ওয়েবসাইট ব্রাউজ না করার অনুরোধ করা হলো।

২. বুদ্ধিবৃত্তিক সম্পদ ও কপিরাইট আইন: জনগণ.নিউজ-এ প্রকাশিত সকল সংবাদ প্রতিবেদন, অনুসন্ধানী ফিচার, ছবি, ইনফোগ্রাফিক, অডিও ও ভিডিও কনটেন্ট কপিরাইট আইন (Copyright Act of Bangladesh) এবং আন্তর্জাতিক মেধাস্বত্ব আইনের আওতায় সম্পূর্ণ সংরক্ষিত। কর্তৃপক্ষের লিখিত অনুমতি ব্যতিরেকে বাণিজ্যিক উদ্দেশ্যে কোনো কনটেন্ট হুবহু বা আংশিক পুনর্মুদ্রণ, পুনঃপ্রচার, ডাউনলোড বা স্ক্র্যাপিং করা আইনত দণ্ডনীয় অপরাধ।

৩. পাঠকদের মন্তব্য ও আচরণবিধি: ওয়েবসাইটের কমেন্ট সেকশন বা সোশ্যাল চ্যানেলে পাঠকদের গঠনমূলক আলোচনার সুযোগ রয়েছে। তবে কোনো প্রকার সাম্প্রদায়িক বিদ্বেষমূলক, রাষ্ট্রদ্রোহী, মানহানিকর, অশ্লীল বা ব্যক্তিগত আক্রমণাত্মক মন্তব্য সম্পূর্ণ নিষিদ্ধ। সম্পাদকীয় বিভাগ যেকোনো অসঙ্গতিপূর্ণ মন্তব্য মুছে ফেলা বা সংশ্লিষ্ট ব্যবহারকারীকে নিষিদ্ধ করার পূর্ণ অধিকার সংরক্ষণ করে।

৪. বিজ্ঞাপন ও স্পন্সরড কনটেন্ট দায়মুক্তি: ওয়েবসাইটে প্রদর্শিত যেকোনো বাণিজ্যিক বা স্পন্সরড বিজ্ঞাপনের গুণমান ও দাবির দায় সংশ্লিষ্ট বিজ্ঞাপনদাতার। বিজ্ঞাপনে উল্লেখিত কোনো পণ্য বা সেবা ক্রয়ের পূর্বে পাঠকদের নিজস্ব বিবেচনা প্রয়োগের অনুরোধ করা হচ্ছে।

৫. বহিরাগত লিংক ও ওয়েবসাইটের নির্ভরযোগ্যতা: আমাদের সংবাদে সংবাদের প্রেক্ষাপট হিসেবে বহিরাগত ওয়েবসাইটের লিংক থাকতে পারে। তৃতীয় পক্ষের ওয়েবসাইটের গোপনীয়তা বা কনটেন্টের জন্য জনগণ.নিউজ দায়বদ্ধ নয়।

৬. আইনি এখতিয়ার: এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত আইন দ্বারা পরিচালিত হবে এবং যেকোনো বিরোধের ক্ষেত্রে বাংলাদেশের উপযুক্ত আদালত একমাত্র বিচারিক এখতিয়ারভুক্ত হিসেবে গণ্য হবে।`,

  privacyPolicy: `জনগণ.নিউজ (Jonogon News) তার পাঠকদের ব্যক্তিগত তথ্যের সর্বোচ্চ গোপনীয়তা ও নিরাপত্তা নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ।

১. সংগৃহীত তথ্যের পরিধি: আপনি যখন ওয়েবসাইট ভিজিট করেন, তখন আপনার ব্রাউজারের ধরন, আইপি অ্যাড্রেস, অপারেটিং সিস্টেম এবং পেজ ভিজিটের সময়কাল অ্যানালিটিক্স ও সিস্টেম উন্নয়নের স্বার্থে স্বয়ংক্রিয়ভাবে সংরক্ষিত হতে পারে। কোনো পাঠক মন্তব্য প্রদান, নিউজলেটার সাবস্ক্রিপশন বা যোগাযোগ ফরম পূরণ না করলে কোনো ব্যক্তিগত স্পর্শকাতর তথ্য আমরা সংগ্রহ করি না।

২. কুকিজ (Cookies) ও অ্যাড নেটওয়ার্ক: ওয়েবসাইটে ব্যবহারকারীর অভিজ্ঞতা উন্নত ও মসৃণ করতে আমরা কুকিজ ব্যবহার করি। Google AdSense ও অনুমোদিত থার্ড-পার্টি বিজ্ঞাপন নেটওয়ার্ক ব্যবহারকারীর আগ্রহ অনুযায়ী প্রাসঙ্গিক বিজ্ঞাপন পরিবেশনের উদ্দেশ্যে স্ট্যান্ডার্ড কুকিজ ব্যবহার করতে পারে। পাঠক তার নিজস্ব ব্রাউজার সেটিং থেকে যেকোনো সময় কুকিজ নিষ্ক্রিয় করতে পারেন।

৩. তথ্য সুরক্ষা ও বিক্রি না করার অঙ্গীকার: আমরা অত্যন্ত দৃঢ়ভাবে অঙ্গীকার করছি যে, পাঠকদের কোনো ব্যক্তিগত তথ্য (যেমন নাম, ফোন নম্বর, ইমেইল) বাণিজ্যিক উদ্দেশ্যে কোনো তৃতীয় পক্ষের কাছে বিক্রয়, লিজ বা হস্তান্তর করা হয় না। আমাদের ডাটাবেজ আধুনিক এনক্রিপশন প্রটোকল দ্বারা সুরক্ষিত।

৪. ব্যবহারকারীর অধিকার ও ডেটা মুছে ফেলা: পাঠক যেকোনো সময় তার সংরক্ষিত ডেটা দেখার, সংশোধনের বা সম্পূর্ণ মুছে ফেলার অনুরোধ পাঠাতে পারেন। আপনার অনুরোধ পাওয়ামাত্র আমাদের কারিগরি টিম ব্যবস্থা গ্রহণ করবে।

৫. যোগাযোগের ঠিকানা: গোপনীয়তা নীতি সংক্রান্ত যেকোনো জিজ্ঞাসা বা অনুরোধের জন্য যোগাযোগ করুন: brandbiplob1234@gmail.com বা ফোন: 01936618534।`,

  editorialPolicy: `জনগণ.নিউজ (Jonogon News) একটি স্বাধীন, নিরপেক্ষ ও জনকল্যাণমুখী গণমাধ্যম। আমরা ‘জনতার কণ্ঠস্বর’ মূলমন্ত্রে বিশ্বাসী।�রতি পূর্ণ সম্মতি জ্ঞাপন করছেন। যদি আপনি এই শর্তাবলীর কোনো অংশে অসম্মত হন, তবে ওয়েবসাইট ব্রাউজ না করার অনুরোধ করা হলো।

২. বুদ্ধিবৃত্তিক সম্পদ ও কপিরাইট আইন: জনগণ.নিউজ-এ প্রকাশিত সকল সংবাদ প্রতিবেদন, অনুসন্ধানী ফিচার, ছবি, ইনফোগ্রাফিক, অডিও ও ভিডিও কনটেন্ট কপিরাইট আইন (Copyright Act of Bangladesh) এবং আন্তর্জাতিক মেধাস্বত্ব আইনের আওতায় সম্পূর্ণ সংরক্ষিত। কর্তৃপক্ষের লিখিত অনুমতি ব্যতিরেকে বাণিজ্যিক উদ্দেশ্যে কোনো কনটেন্ট হুবহু বা আংশিক পুনর্মুদ্রণ, পুনঃপ্রচার, ডাউনলোড বা স্ক্র্যাপিং করা আইনত দণ্ডনীয় অপরাধ।

৩. পাঠকদের মন্তব্য ও আচরণবিধি: ওয়েবসাইটের কমেন্ট সেকশন বা সোশ্যাল চ্যানেলে পাঠকদের গঠনমূলক আলোচনার সুযোগ রয়েছে। তবে কোনো প্রকার সাম্প্রদায়িক বিদ্বেষমূলক, রাষ্ট্রদ্রোহী, মানহানিকর, অশ্লীল বা ব্যক্তিগত আক্রমণাত্মক মন্তব্য সম্পূর্ণ নিষিদ্ধ। সম্পাদকীয় বিভাগ যেকোনো অসঙ্গতিপূর্ণ মন্তব্য মুছে ফেলা বা সংশ্লিষ্ট ব্যবহারকারীকে নিষিদ্ধ করার পূর্ণ অধিকার সংরক্ষণ করে।

৪. বিজ্ঞাপন ও স্পন্সরড কনটেন্ট দায়মুক্তি: ওয়েবসাইটে প্রদর্শিত যেকোনো বাণিজ্যিক বা স্পন্সরড বিজ্ঞাপনের গুণমান ও দাবির দায় সংশ্লিষ্ট বিজ্ঞাপনদাতার। বিজ্ঞাপনে উল্লেখিত কোনো পণ্য বা সেবা ক্রয়ের পূর্বে পাঠকদের নিজস্ব বিবেচনা প্রয়োগের অনুরোধ করা হচ্ছে।

৫. বহিরাগত লিংক ও ওয়েবসাইটের নির্ভরযোগ্যতা: আমাদের সংবাদে সংবাদের প্রেক্ষাপট হিসেবে বহিরাগত ওয়েবসাইটের লিংক থাকতে পারে। তৃতীয় পক্ষের ওয়েবসাইটের গোপনীয়তা বা কনটেন্টের জন্য জনগণ.নিউজ দায়বদ্ধ নয়।

৬. আইনি এখতিয়ার: এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত আইন দ্বারা পরিচালিত হবে এবং যেকোনো বিরোধের ক্ষেত্রে বাংলাদেশের উপযুক্ত আদালত একমাত্র বিচারিক এখতিয়ারভুক্ত হিসেবে গণ্য হবে।`,

  privacyPolicy: `জনগণ.নিউজ (Jonogon News) তার পাঠকদের ব্যক্তিগত তথ্যের সর্বোচ্চ গোপনীয়তা ও নিরাপত্তা নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ।

১. সংগৃহীত তথ্যের পরিধি: আপনি যখন ওয়েবসাইট ভিজিট করেন, তখন আপনার ব্রাউজারের ধরন, আইপি অ্যাড্রেস, অপারেটিং সিস্টেম এবং পেজ ভিজিটের সময়কাল অ্যানালিটিক্স ও সিস্টেম উন্নয়নের স্বার্থে স্বয়ংক্রিয়ভাবে সংরক্ষিত হতে পারে। কোনো পাঠক মন্তব্য প্রদান, নিউজলেটার সাবস্ক্রিপশন বা যোগাযোগ ফরম পূরণ না করলে কোনো ব্যক্তিগত স্পর্শকাতর তথ্য আমরা সংগ্রহ করি না।

২. কুকিজ (Cookies) ও অ্যাড নেটওয়ার্ক: ওয়েবসাইটে ব্যবহারকারীর অভিজ্ঞতা উন্নত ও মসৃণ করতে আমরা কুকিজ ব্যবহার করি। Google AdSense ও অনুমোদিত থার্ড-পার্টি বিজ্ঞাপন নেটওয়ার্ক ব্যবহারকারীর আগ্রহ অনুযায়ী প্রাসঙ্গিক বিজ্ঞাপন পরিবেশনের উদ্দেশ্যে স্ট্যান্ডার্ড কুকিজ ব্যবহার করতে পারে। পাঠক তার নিজস্ব ব্রাউজার সেটিং থেকে যেকোনো সময় কুকিজ নিষ্ক্রিয় করতে পারেন।

৩. তথ্য সুরক্ষা ও বিক্রি না করার অঙ্গীকার: আমরা অত্যন্ত দৃঢ়ভাবে অঙ্গীকার করছি যে, পাঠকদের কোনো ব্যক্তিগত তথ্য (যেমন নাম, ফোন নম্বর, ইমেইল) বাণিজ্যিক উদ্দেশ্যে কোনো তৃতীয় পক্ষের কাছে বিক্রয়, লিজ বা হস্তান্তর করা হয় না। আমাদের ডাটাবেজ আধুনিক এনক্রিপশন প্রটোকল দ্বারা সুরক্ষিত।

৪. ব্যবহারকারীর অধিকার ও ডেটা মুছে ফেলা: পাঠক যেকোনো সময় তার সংরক্ষিত ডেটা দেখার, সংশোধনের বা সম্পূর্ণ মুছে ফেলার অনুরোধ পাঠাতে পারেন। আপনার অনুরোধ পাওয়ামাত্র আমাদের কারিগরি টিম ব্যবস্থা গ্রহণ করবে।

৫. যোগাযোগের ঠিকানা: গোপনীয়তা নীতি সংক্রান্ত যেকোনো জিজ্ঞাসা বা অনুরোধের জন্য যোগাযোগ করুন: brandbiplob1234@gmail.com বা ফোন: 01936618534।`,

  editorialPolicy: `জনগণ.নিউজ (Jonogon News) একটি স্বাধীন, নিরপেক্ষ ও জনকল্যাণমুখী গণমাধ্যম। আমরা ‘সত্যের সাথে, জনতার পাশে’ মূলমন্ত্রে বিশ্বাসী।

১. সত্যতা ও কঠোর ফ্যাক্ট-চেকিং (Fact-Checking): প্রকাশিত প্রতিটি সংবাদের তথ্যের সত্যতা নিশ্চিত করতে ন্যূনতম দুটি স্বাধীন ও নির্ভরযোগ্য সূত্র থেকে তথ্য যাচাই করা হয়। কোনো সামাজিক যোগাযোগ মাধ্যমের গুজব বা অপ্রমাণিত বক্তব্যের ওপর ভিত্তি করে সংবাদ পরিবেশন করা হয় না।

২. নিরপেক্ষতা ও উভয় পক্ষের বক্তব্য (Fair Balance & Right of Reply): যেকোনো বিতর্কিত বা সংবেদনশীল ঘটনায় সংশ্লিষ্ট সকল পক্ষের বক্তব্য ও অবস্থান সমান গুরুত্বের সাথে তুলে ধরা আমাদের নীতিগত দায়িত্ব। কোনো রাজনৈতিক দল, করপোরেট প্রতিষ্ঠান বা প্রভাবশালী গোষ্ঠীর স্বার্থে পক্ষপাতমূলক সংবাদ প্রচার সম্পূর্ণ নিষিদ্ধ।

৩. সূত্রের গোপনীয়তা ও সুরক্ষা (Source Protection): জনস্বার্থে প্রকাশিত অনুসন্ধানী প্রতিবেদনের ক্ষেত্রে তথ্যদাতা বা হুইসেলব্লোয়ারের (Whistleblower) নিরাপত্তা ও গোপনীয়তা আন্তর্জাতিক সাংবাদিকতার নীতিমালা অনুযায়ী সুরক্ষিত রাখা হয়।

৪. দ্রুত সংশোধন ও স্পষ্টীকরণ নীতি (Corrections Policy): অনিচ্ছাকৃত কোনো ভুল তথ্য প্রকাশিত হলে তা দ্রুততার সাথে সংশোধন করা হয় এবং সংবাদের নিচে বা শীর্ষে স্পষ্টভাবে সংশোধনী নোট প্রকাশ করা হয়।

৫. অসাম্প্রদায়িকতা ও মানবাধিকার: আমরা ধর্মনিরপেক্ষতা, মুক্তিযুদ্ধের চেতনা, সাম্প্রদায়িক সম্প্রীতি এবং সার্বজনীন মানবাধিকার সুরক্ষায় অবিচল অবস্থান বজায় রাখি।

৬. স্বার্থের সংঘাত ও উপহার গ্রহণ নীতিমালা: আমাদের সাংবাদিকদের কোনো উৎস থেকে উপহার, আর্থিক সুবিধা বা অনৈতিক সুযোগ গ্রহণ কঠোরভাবে নিষিদ্ধ, যাতে সাংবাদিকতার স্বাধীনতা অক্ষুণ্ণ থাকে।`,

  disclaimerPolicy: `জনগণ.নিউজ-এ প্রকাশিত তথ্য ও বিশ্লেষণ পাঠকদের সাধারণ অবগতির জন্য পরিবেশিত হয়। আর্থিক বিনিয়োগ, স্বাস্থ্য বা আইনি সিদ্ধান্তের ক্ষেত্রে পাঠকদের সংশ্লিষ্ট বিশেষজ্ঞদের পরামর্শ নেওয়ার অনুরোধ করা হচ্ছে।`,

  cookiePolicy: `ব্যবহারকারীর ব্রাউজিং অভিজ্ঞতা উন্নত করতে এবং গুগল অ্যাডসেন্স ও প্রাসঙ্গিক কনটেন্ট পরিবেশনের স্বার্থে আমরা স্ট্যান্ডার্ড ব্রাউজার কুকিজ ব্যবহার করি। পাঠক যেকোনো সময় ব্রাউজার সেটিং থেকে এটি নিয়ন্ত্রণ করতে পারেন।`,

  copyrightTextBn: '© ২০২৬ সর্বস্বত্ব সংরক্ষিত — জনগণ.নিউজ | Jonogon News',
  copyrightTextEn: '© 2026 All Rights Reserved — Jonogon News'
};

export const initialCategories = [
  { id: 'latest', nameBn: 'সর্বশেষ', nameEn: 'Latest', slug: 'latest' },
  { id: 'national', nameBn: 'জাতীয়', nameEn: 'National', slug: 'national' },
  { id: 'bangladesh', nameBn: 'বাংলাদেশ', nameEn: 'Bangladesh', slug: 'bangladesh' },
  { id: 'probashi', nameBn: 'প্রবাসী', nameEn: 'Expatriates', slug: 'probashi' },
  { id: 'capital', nameBn: 'রাজধানী', nameEn: 'Capital', slug: 'capital' },
  { id: 'saradesh', nameBn: 'সারাদেশ', nameEn: 'Countrywide', slug: 'saradesh' },
  { id: 'district-news', nameBn: 'জেলা সংবাদ', nameEn: 'District News', slug: 'district-news' },
  { id: 'politics', nameBn: 'রাজনীতি', nameEn: 'Politics', slug: 'politics' },
  { id: 'election', nameBn: 'নির্বাচন', nameEn: 'Election', slug: 'election' },
  { id: 'law-court', nameBn: 'আইন-আদালত', nameEn: 'Law & Court', slug: 'law-court' },
  { id: 'crime', nameBn: 'অপরাধ', nameEn: 'Crime', slug: 'crime' },
  { id: 'administration', nameBn: 'প্রশাসন', nameEn: 'Administration', slug: 'administration' },
  { id: 'government', nameBn: 'সরকার', nameEn: 'Government', slug: 'government' },
  { id: 'parliament', nameBn: 'সংসদ', nameEn: 'Parliament', slug: 'parliament' },
  { id: 'diplomacy', nameBn: 'কূটনীতি', nameEn: 'Diplomacy', slug: 'diplomacy' },
  { id: 'international', nameBn: 'আন্তর্জাতিক', nameEn: 'International', slug: 'international' },
  { id: 'world', nameBn: 'বিশ্ব', nameEn: 'World', slug: 'world' },
  { id: 'india', nameBn: 'ভারত', nameEn: 'India', slug: 'india' },
  { id: 'pakistan', nameBn: 'পাকিস্তান', nameEn: 'Pakistan', slug: 'pakistan' },
  { id: 'china', nameBn: 'চীন', nameEn: 'China', slug: 'china' },
  { id: 'middle-east', nameBn: 'মধ্যপ্রাচ্য', nameEn: 'Middle East', slug: 'middle-east' },
  { id: 'asia', nameBn: 'এশিয়া', nameEn: 'Asia', slug: 'asia' },
  { id: 'europe', nameBn: 'ইউরোপ', nameEn: 'Europe', slug: 'europe' },
  { id: 'america', nameBn: 'আমেরিকা', nameEn: 'America', slug: 'america' },
  { id: 'africa', nameBn: 'আফ্রিকা', nameEn: 'Africa', slug: 'africa' },
  { id: 'latin-america', nameBn: 'লাতিন আমেরিকা', nameEn: 'Latin America', slug: 'latin-america' },
  { id: 'neighbor-countries', nameBn: 'প্রতিবেশী দেশ', nameEn: 'Neighboring Countries', slug: 'neighbor-countries' },
  { id: 'trade', nameBn: 'বাণিজ্য', nameEn: 'Trade', slug: 'trade' },
  { id: 'business', nameBn: 'ব্যবসা', nameEn: 'Business', slug: 'business' },
  { id: 'economy', nameBn: 'অর্থনীতি', nameEn: 'Economy', slug: 'economy' },
  { id: 'stock-market', nameBn: 'শেয়ারবাজার', nameEn: 'Stock Market', slug: 'stock-market' },
  { id: 'bank', nameBn: 'ব্যাংক', nameEn: 'Banking', slug: 'bank' },
  { id: 'industry', nameBn: 'শিল্প', nameEn: 'Industry', slug: 'industry' },
  { id: 'corporate', nameBn: 'করপোরেট', nameEn: 'Corporate', slug: 'corporate' },
  { id: 'world-trade', nameBn: 'বিশ্ববাণিজ্য', nameEn: 'Global Trade', slug: 'world-trade' },
  { id: 'your-money', nameBn: 'আপনার টাকা', nameEn: 'Your Money', slug: 'your-money' },
  { id: 'entrepreneur', nameBn: 'উদ্যোক্তা', nameEn: 'Entrepreneur', slug: 'entrepreneur' },
  { id: 'jobs', nameBn: 'চাকরি', nameEn: 'Jobs', slug: 'jobs' },
  { id: 'recruitment', nameBn: 'নিয়োগ', nameEn: 'Recruitment', slug: 'recruitment' },
  { id: 'career', nameBn: 'ক্যারিয়ার', nameEn: 'Career', slug: 'career' },
  { id: 'education', nameBn: 'শিক্ষা', nameEn: 'Education', slug: 'education' },
  { id: 'admission', nameBn: 'ভর্তি', nameEn: 'Admission', slug: 'admission' },
  { id: 'exam', nameBn: 'পরীক্ষা', nameEn: 'Exam', slug: 'exam' },
  { id: 'scholarship', nameBn: 'বৃত্তি', nameEn: 'Scholarship', slug: 'scholarship' },
  { id: 'higher-education', nameBn: 'উচ্চশিক্ষা', nameEn: 'Higher Education', slug: 'higher-education' },
  { id: 'campus', nameBn: 'ক্যাম্পাস', nameEn: 'Campus', slug: 'campus' },
  { id: 'science', nameBn: 'বিজ্ঞান', nameEn: 'Science', slug: 'science' },
  { id: 'tech', nameBn: 'প্রযুক্তি', nameEn: 'Technology', slug: 'tech' },
  { id: 'gadgets', nameBn: 'গ্যাজেট', nameEn: 'Gadgets', slug: 'gadgets' },
  { id: 'tips', nameBn: 'টিপস', nameEn: 'Tips', slug: 'tips' },
  { id: 'automobile', nameBn: 'অটোমোবাইল', nameEn: 'Automobile', slug: 'automobile' },
  { id: 'cyber-world', nameBn: 'সাইবার জগৎ', nameEn: 'Cyber World', slug: 'cyber-world' },
  { id: 'freelancing', nameBn: 'ফ্রিল্যান্সিং', nameEn: 'Freelancing', slug: 'freelancing' },
  { id: 'ai', nameBn: 'কৃত্রিম বুদ্ধিমত্তা', nameEn: 'AI & Machine Learning', slug: 'ai' },
  { id: 'aviation', nameBn: 'এভিয়েশন', nameEn: 'Aviation', slug: 'aviation' },
  { id: 'health', nameBn: 'স্বাস্থ্য', nameEn: 'Health', slug: 'health' },
  { id: 'environment', nameBn: 'পরিবেশ', nameEn: 'Environment', slug: 'environment' },
  { id: 'climate', nameBn: 'জলবায়ু', nameEn: 'Climate', slug: 'climate' },
  { id: 'agriculture', nameBn: 'কৃষি', nameEn: 'Agriculture', slug: 'agriculture' },
  { id: 'religion', nameBn: 'ধর্ম', nameEn: 'Religion', slug: 'religion' },
  { id: 'islam', nameBn: 'ইসলাম', nameEn: 'Islam', slug: 'islam' },
  { id: 'sanatan', nameBn: 'সনাতন', nameEn: 'Sanatan', slug: 'sanatan' },
  { id: 'buddhist', nameBn: 'বৌদ্ধ', nameEn: 'Buddhism', slug: 'buddhist' },
  { id: 'christian', nameBn: 'খ্রিষ্টান', nameEn: 'Christianity', slug: 'christian' },
  { id: 'sports', nameBn: 'খেলা', nameEn: 'Sports', slug: 'sports' },
  { id: 'cricket', nameBn: 'ক্রিকেট', nameEn: 'Cricket', slug: 'cricket' },
  { id: 'football', nameBn: 'ফুটবল', nameEn: 'Football', slug: 'football' },
  { id: 'tennis', nameBn: 'টেনিস', nameEn: 'Tennis', slug: 'tennis' },
  { id: 'other-sports', nameBn: 'অন্যান্য খেলা', nameEn: 'Other Sports', slug: 'other-sports' },
  { id: 'entertainment', nameBn: 'বিনোদন', nameEn: 'Entertainment', slug: 'entertainment' },
  { id: 'television', nameBn: 'টেলিভিশন', nameEn: 'Television', slug: 'television' },
  { id: 'ott', nameBn: 'ওটিটি', nameEn: 'OTT', slug: 'ott' },
  { id: 'cinema', nameBn: 'সিনেমা', nameEn: 'Cinema', slug: 'cinema' },
  { id: 'hollywood', nameBn: 'হলিউড', nameEn: 'Hollywood', slug: 'hollywood' },
  { id: 'bollywood', nameBn: 'বলিউড', nameEn: 'Bollywood', slug: 'bollywood' },
  { id: 'tollywood', nameBn: 'টলিউড', nameEn: 'Tollywood', slug: 'tollywood' },
  { id: 'music', nameBn: 'গান', nameEn: 'Music', slug: 'music' },
  { id: 'drama', nameBn: 'নাটক', nameEn: 'Drama', slug: 'drama' },
  { id: 'lifestyle', nameBn: 'জীবনযাপন', nameEn: 'Lifestyle', slug: 'lifestyle' },
  { id: 'travel', nameBn: 'ভ্রমণ', nameEn: 'Travel', slug: 'travel' },
  { id: 'tourism', nameBn: 'পর্যটন', nameEn: 'Tourism', slug: 'tourism' },
  { id: 'relationship', nameBn: 'সম্পর্ক', nameEn: 'Relationship', slug: 'relationship' },
  { id: 'wellness', nameBn: 'সুস্থতা', nameEn: 'Wellness', slug: 'wellness' },
  { id: 'horoscope', nameBn: 'রাশিফল', nameEn: 'Horoscope', slug: 'horoscope' },
  { id: 'fashion', nameBn: 'ফ্যাশন', nameEn: 'Fashion', slug: 'fashion' },
  { id: 'style', nameBn: 'স্টাইল', nameEn: 'Style', slug: 'style' },
  { id: 'beauty', nameBn: 'রূপচর্চা', nameEn: 'Beauty Care', slug: 'beauty' },
  { id: 'home-decor', nameBn: 'গৃহসজ্জা', nameEn: 'Home Decor', slug: 'home-decor' },
  { id: 'shopping', nameBn: 'কেনাকাটা', nameEn: 'Shopping', slug: 'shopping' },
  { id: 'women-child', nameBn: 'নারী ও শিশু', nameEn: 'Women & Child', slug: 'women-child' },
  { id: 'probash', nameBn: 'প্রবাস', nameEn: 'Expatriate', slug: 'probash' },
  { id: 'art-literature', nameBn: 'শিল্প-সাহিত্য', nameEn: 'Art & Literature', slug: 'art-literature' },
  { id: 'literature', nameBn: 'সাহিত্য', nameEn: 'Literature', slug: 'literature' },
  { id: 'poetry', nameBn: 'কবিতা', nameEn: 'Poetry', slug: 'poetry' },
  { id: 'story', nameBn: 'গল্প', nameEn: 'Story', slug: 'story' },
  { id: 'books', nameBn: 'বই', nameEn: 'Books', slug: 'books' },
  { id: 'culture', nameBn: 'সংস্কৃতি', nameEn: 'Culture', slug: 'culture' },
  { id: 'opinion', nameBn: 'মতামত', nameEn: 'Opinion', slug: 'opinion' },
  { id: 'editorial', nameBn: 'সম্পাদকীয়', nameEn: 'Editorial', slug: 'editorial' },
  { id: 'column', nameBn: 'কলাম', nameEn: 'Column', slug: 'column' },
  { id: 'interview', nameBn: 'সাক্ষাৎকার', nameEn: 'Interview', slug: 'interview' },
  { id: 'analysis', nameBn: 'বিশ্লেষণ', nameEn: 'Analysis', slug: 'analysis' },
  { id: 'feature', nameBn: 'ফিচার', nameEn: 'Feature', slug: 'feature' },
  { id: 'special-report', nameBn: 'বিশেষ প্রতিবেদন', nameEn: 'Special Report', slug: 'special-report' },
  { id: 'long-read', nameBn: 'দীর্ঘপাঠ', nameEn: 'Long Read', slug: 'long-read' },
  { id: 'human-story', nameBn: 'মানবিক গল্প', nameEn: 'Human Story', slug: 'human-story' },
  { id: 'history', nameBn: 'ইতিহাস', nameEn: 'History', slug: 'history' },
  { id: '1971', nameBn: '১৯৭১', nameEn: '1971', slug: '1971' },
  { id: 'achievement', nameBn: 'অর্জন', nameEn: 'Achievement', slug: 'achievement' },
  { id: 'society', nameBn: 'সমাজ', nameEn: 'Society', slug: 'society' },
  { id: 'people', nameBn: 'মানুষ', nameEn: 'People', slug: 'people' },
  { id: 'media', nameBn: 'মিডিয়া', nameEn: 'Media', slug: 'media' },
  { id: 'social-media', nameBn: 'সোশ্যাল মিডিয়া', nameEn: 'Social Media', slug: 'social-media' },
  { id: 'curiosities', nameBn: 'বিচিত্র', nameEn: 'Curiosities', slug: 'curiosities' },
  { id: 'biography', nameBn: 'জীবনকাহিনি', nameEn: 'Life Stories', slug: 'biography' },
  { id: 'photos', nameBn: 'ছবি', nameEn: 'Photos', slug: 'photos' },
  { id: 'photo-story', nameBn: 'ফটো স্টোরি', nameEn: 'Photo Story', slug: 'photo-story' },
  { id: 'photo-gallery', nameBn: 'ফটোগ্যালারি', nameEn: 'Photo Gallery', slug: 'photo-gallery' },
  { id: 'video', nameBn: 'ভিডিও', nameEn: 'Video', slug: 'video' },
  { id: 'video-story', nameBn: 'ভিডিও স্টোরি', nameEn: 'Video Story', slug: 'video-story' },
  { id: 'video-gallery', nameBn: 'ভিডিও গ্যালারি', nameEn: 'Video Gallery', slug: 'video-gallery' },
  { id: 'audio', nameBn: 'অডিও', nameEn: 'Audio', slug: 'audio' },
  { id: 'podcast', nameBn: 'পডকাস্ট', nameEn: 'Podcast', slug: 'podcast' },
  { id: 'live', nameBn: 'লাইভ', nameEn: 'Live', slug: 'live' },
  { id: 'news-analysis', nameBn: 'সংবাদ বিশ্লেষণ', nameEn: 'News Analysis', slug: 'news-analysis' },
  { id: 'investigative', nameBn: 'অনুসন্ধানী প্রতিবেদন', nameEn: 'Investigative Report', slug: 'investigative' },
  { id: 'special-edition', nameBn: 'বিশেষ সংখ্যা', nameEn: 'Special Edition', slug: 'special-edition' },
  { id: 'magazine', nameBn: 'ম্যাগাজিন', nameEn: 'Magazine', slug: 'magazine' },
  { id: 'e-paper', nameBn: 'ই-পেপার', nameEn: 'E-Paper', slug: 'e-paper' },
  { id: 'advertisement', nameBn: 'বিজ্ঞাপন', nameEn: 'Advertisement', slug: 'advertisement' },
  { id: 'advertorial', nameBn: 'অ্যাডভার্টোরিয়াল', nameEn: 'Advertorial', slug: 'advertorial' }
];

export const categoryGroups = [
  {
    groupNameBn: 'বাংলাদেশ ও প্রশাসন',
    groupNameEn: 'Bangladesh & Governance',
    categoryIds: ['latest', 'national', 'bangladesh', 'capital', 'saradesh', 'district-news', 'politics', 'election', 'law-court', 'crime', 'administration', 'government', 'parliament', 'diplomacy']
  },
  {
    groupNameBn: 'আন্তর্জাতিক ও বিশ্ব',
    groupNameEn: 'World & International',
    categoryIds: ['international', 'world', 'india', 'pakistan', 'china', 'middle-east', 'asia', 'europe', 'america', 'africa', 'latin-america', 'neighbor-countries']
  },
  {
    groupNameBn: 'বাণিজ্য ও অর্থনীতি',
    groupNameEn: 'Business & Economy',
    categoryIds: ['trade', 'business', 'economy', 'stock-market', 'bank', 'industry', 'corporate', 'world-trade', 'your-money', 'entrepreneur']
  },
  {
    groupNameBn: 'চাকরি, শিক্ষা ও ক্যারিয়ার',
    groupNameEn: 'Jobs, Education & Career',
    categoryIds: ['jobs', 'recruitment', 'career', 'education', 'admission', 'exam', 'scholarship', 'higher-education', 'campus']
  },
  {
    groupNameBn: 'বিজ্ঞান ও প্রযুক্তি',
    groupNameEn: 'Science & Technology',
    categoryIds: ['science', 'tech', 'gadgets', 'tips', 'automobile', 'cyber-world', 'freelancing', 'ai', 'aviation']
  },
  {
    groupNameBn: 'স্বাস্থ্য, পরিবেশ ও কৃষি',
    groupNameEn: 'Health, Environment & Agri',
    categoryIds: ['health', 'environment', 'climate', 'agriculture']
  },
  {
    groupNameBn: 'ধর্ম ও সমাজ',
    groupNameEn: 'Religion & Society',
    categoryIds: ['religion', 'islam', 'sanatan', 'buddhist', 'christian', 'society', 'people', 'women-child', 'probash']
  },
  {
    groupNameBn: 'খেলাধুলা',
    groupNameEn: 'Sports',
    categoryIds: ['sports', 'cricket', 'football', 'tennis', 'other-sports']
  },
  {
    groupNameBn: 'বিনোদন',
    groupNameEn: 'Entertainment',
    categoryIds: ['entertainment', 'television', 'ott', 'cinema', 'hollywood', 'bollywood', 'tollywood', 'music', 'drama']
  },
  {
    groupNameBn: 'জীবনযাপন ও রূপচর্চা',
    groupNameEn: 'Lifestyle & Care',
    categoryIds: ['lifestyle', 'travel', 'tourism', 'relationship', 'wellness', 'horoscope', 'fashion', 'style', 'beauty', 'home-decor', 'shopping']
  },
  {
    groupNameBn: 'শিল্প-সাহিত্য ও সংস্কৃতি',
    groupNameEn: 'Art, Literature & Culture',
    categoryIds: ['art-literature', 'literature', 'poetry', 'story', 'books', 'culture', 'history', '1971', 'achievement']
  },
  {
    groupNameBn: 'মতামত ও বিশ্লেষণ',
    groupNameEn: 'Opinion & Analysis',
    categoryIds: ['opinion', 'editorial', 'column', 'interview', 'analysis', 'feature', 'news-analysis']
  },
  {
    groupNameBn: 'বিশেষ প্রতিবেদন ও ম্যাগাজিন',
    groupNameEn: 'Special & Magazine',
    categoryIds: ['special-report', 'long-read', 'human-story', 'investigative', 'special-edition', 'magazine', 'e-paper', 'advertisement', 'advertorial', 'curiosities', 'biography']
  },
  {
    groupNameBn: 'মাল্টিমিডিয়া ও গ্যালারি',
    groupNameEn: 'Multimedia & Gallery',
    categoryIds: ['media', 'social-media', 'photos', 'photo-story', 'photo-gallery', 'video', 'video-story', 'video-gallery', 'audio', 'podcast', 'live']
  }
];

/**
 * 10 Master Editorial Mega Groups with Sub-Groups and Highlight Badges
 * Structured in the style of Aleric Demo Mega Menu
 */
export const categoryMasterGroups = [
  {
    id: 'bangladesh-governance',
    nameBn: 'বাংলাদেশ ও জাতীয়',
    nameEn: 'Bangladesh & Governance',
    subGroups: [
      {
        titleBn: 'জাতীয় ও নগর',
        titleEn: 'National & Urban',
        items: [
          { id: 'national', nameBn: 'জাতীয়', nameEn: 'National' },
          { id: 'bangladesh', nameBn: 'বাংলাদেশ', nameEn: 'Bangladesh' },
          { id: 'probashi', nameBn: 'প্রবাসী', nameEn: 'Expatriates' },
          { id: 'capital', nameBn: 'রাজধানী', nameEn: 'Capital' },
          { id: 'saradesh', nameBn: 'সারাদেশ', nameEn: 'Countrywide' },
          { id: 'district-news', nameBn: 'জেলা সংবাদ', nameEn: 'District News' }
        ]
      },
      {
        titleBn: 'রাজনীতি ও নির্বাচন',
        titleEn: 'Politics & Elections',
        items: [
          { id: 'politics', nameBn: 'রাজনীতি', nameEn: 'Politics' },
          { id: 'election', nameBn: 'নির্বাচন', nameEn: 'Election' },
          { id: 'parliament', nameBn: 'সংসদ', nameEn: 'Parliament' },
          { id: 'diplomacy', nameBn: 'কূটনীতি', nameEn: 'Diplomacy' }
        ]
      },
      {
        titleBn: 'প্রশাসন ও বিচার ব্যবস্থা',
        titleEn: 'Admin & Judiciary',
        items: [
          { id: 'administration', nameBn: 'প্রশাসন', nameEn: 'Administration' },
          { id: 'government', nameBn: 'সরকার', nameEn: 'Government' },
          { id: 'law-court', nameBn: 'আইন-আদালত', nameEn: 'Law & Court' },
          { id: 'crime', nameBn: 'অপরাধ', nameEn: 'Crime' }
        ]
      }
    ]
  },
  {
    id: 'international-world',
    nameBn: 'আন্তর্জাতিক ও বিশ্ব',
    nameEn: 'World & International',
    subGroups: [
      {
        titleBn: 'বৈশ্বিক রাজনীতি',
        titleEn: 'Global Affairs',
        items: [
          { id: 'international', nameBn: 'আন্তর্জাতিক', nameEn: 'International' },
          { id: 'world', nameBn: 'বিশ্ব', nameEn: 'World' },
          { id: 'neighbor-countries', nameBn: 'প্রতিবেশী দেশ', nameEn: 'Neighboring Countries' }
        ]
      },
      {
        titleBn: 'এশিয়া ও মধ্যপ্রাচ্য',
        titleEn: 'Asia & Middle East',
        items: [
          { id: 'middle-east', nameBn: 'মধ্যপ্রাচ্য', nameEn: 'Middle East' },
          { id: 'india', nameBn: 'ভারত', nameEn: 'India' },
          { id: 'pakistan', nameBn: 'পাকিস্তান', nameEn: 'Pakistan' },
          { id: 'china', nameBn: 'চীন', nameEn: 'China' },
          { id: 'asia', nameBn: 'এশিয়া', nameEn: 'Asia' }
        ]
      },
      {
        titleBn: 'পাশ্চাত্য ও অন্যান্য অঞ্চল',
        titleEn: 'West & Other Continents',
        items: [
          { id: 'america', nameBn: 'আমেরিকা', nameEn: 'America' },
          { id: 'europe', nameBn: 'ইউরোপ', nameEn: 'Europe' },
          { id: 'africa', nameBn: 'আফ্রিকা', nameEn: 'Africa' },
          { id: 'latin-america', nameBn: 'লাতিন আমেরিকা', nameEn: 'Latin America' }
        ]
      }
    ]
  },
  {
    id: 'business-economy',
    nameBn: 'বাণিজ্য ও অর্থনীতি',
    nameEn: 'Business & Economy',
    subGroups: [
      {
        titleBn: 'বাণিজ্য ও করপোরেট',
        titleEn: 'Trade & Corporate',
        items: [
          { id: 'trade', nameBn: 'বাণিজ্য', nameEn: 'Trade' },
          { id: 'business', nameBn: 'ব্যবসা', nameEn: 'Business' },
          { id: 'economy', nameBn: 'অর্থনীতি', nameEn: 'Economy' },
          { id: 'industry', nameBn: 'শিল্প', nameEn: 'Industry' },
          { id: 'corporate', nameBn: 'করপোরেট', nameEn: 'Corporate' }
        ]
      },
      {
        titleBn: 'বাজার, ব্যাংকিং ও বিনিয়োগ',
        titleEn: 'Markets & Banking',
        items: [
          { id: 'stock-market', nameBn: 'শেয়ারবাজার', nameEn: 'Stock Market' },
          { id: 'bank', nameBn: 'ব্যাংক', nameEn: 'Bank' },
          { id: 'world-trade', nameBn: 'বিশ্ববাণিজ্য', nameEn: 'Global Trade' },
          { id: 'your-money', nameBn: 'আপনার টাকা', nameEn: 'Your Money' },
          { id: 'entrepreneur', nameBn: 'উদ্যোক্তা', nameEn: 'Entrepreneur' }
        ]
      }
    ]
  },
  {
    id: 'jobs-education',
    nameBn: 'চাকরি ও শিক্ষা',
    nameEn: 'Jobs, Education & Career',
    subGroups: [
      {
        titleBn: 'চাকরি ও নিয়োগ বিজ্ঞপ্তি',
        titleEn: 'Jobs & Recruitment',
        items: [
          { id: 'jobs', nameBn: 'চাকরি', nameEn: 'Jobs' },
          { id: 'recruitment', nameBn: 'নিয়োগ', nameEn: 'Recruitment' },
          { id: 'career', nameBn: 'ক্যারিয়ার', nameEn: 'Career' }
        ]
      },
      {
        titleBn: 'শিক্ষা ও শিক্ষাঙ্গন',
        titleEn: 'Education & Campus',
        items: [
          { id: 'education', nameBn: 'শিক্ষা', nameEn: 'Education' },
          { id: 'admission', nameBn: 'ভর্তি', nameEn: 'Admission' },
          { id: 'exam', nameBn: 'পরীক্ষা', nameEn: 'Exam' },
          { id: 'scholarship', nameBn: 'বৃত্তি', nameEn: 'Scholarship' },
          { id: 'higher-education', nameBn: 'উচ্চশিক্ষা', nameEn: 'Higher Education' },
          { id: 'campus', nameBn: 'ক্যাম্পাস', nameEn: 'Campus' }
        ]
      }
    ]
  },
  {
    id: 'science-tech',
    nameBn: 'বিজ্ঞান ও প্রযুক্তি',
    nameEn: 'Science & Technology',
    subGroups: [
      {
        titleBn: 'ডিজিটাল ও আইটি প্রযুক্তি',
        titleEn: 'Digital & IT Tech',
        items: [
          { id: 'tech', nameBn: 'প্রযুক্তি', nameEn: 'Technology' },
          { id: 'ai', nameBn: 'কৃত্রিম বুদ্ধিমত্তা', nameEn: 'AI & Machine Learning' },
          { id: 'freelancing', nameBn: 'ফ্রিল্যান্সিং', nameEn: 'Freelancing' },
          { id: 'cyber-world', nameBn: 'সাইবার জগৎ', nameEn: 'Cyber World' },
          { id: 'science', nameBn: 'বিজ্ঞান', nameEn: 'Science' }
        ]
      },
      {
        titleBn: 'গ্যাজেট ও অটোমোবাইল',
        titleEn: 'Gadgets & Auto',
        items: [
          { id: 'gadgets', nameBn: 'গ্যাজেট', nameEn: 'Gadgets' },
          { id: 'tips', nameBn: 'টিপস', nameEn: 'Tech Tips' },
          { id: 'automobile', nameBn: 'অটোমোবাইল', nameEn: 'Automobile' },
          { id: 'aviation', nameBn: 'এভিয়েশন', nameEn: 'Aviation' }
        ]
      }
    ]
  },
  {
    id: 'religion-society',
    nameBn: 'ধর্ম ও সমাজ',
    nameEn: 'Religion & Society',
    subGroups: [
      {
        titleBn: 'সমাজ ও মানুষ',
        titleEn: 'Society & People',
        items: [
          { id: 'society', nameBn: 'সমাজ', nameEn: 'Society' },
          { id: 'people', nameBn: 'মানুষ', nameEn: 'People' },
          { id: 'women-child', nameBn: 'নারী ও শিশু', nameEn: 'Women & Child' },
          { id: 'probash', nameBn: 'প্রবাস', nameEn: 'Expatriate' }
        ]
      },
      {
        titleBn: 'ধর্ম ও বিশ্বাস',
        titleEn: 'Religion & Faith',
        items: [
          { id: 'religion', nameBn: 'ধর্ম', nameEn: 'Religion' },
          { id: 'islam', nameBn: 'ইসলাম', nameEn: 'Islam' },
          { id: 'sanatan', nameBn: 'সনাতন', nameEn: 'Sanatan' },
          { id: 'buddhist', nameBn: 'বৌদ্ধ', nameEn: 'Buddhism' },
          { id: 'christian', nameBn: 'খ্রিষ্টান', nameEn: 'Christianity' }
        ]
      }
    ]
  },
  {
    id: 'sports-health',
    nameBn: 'খেলাধুলা ও স্বাস্থ্য',
    nameEn: 'Sports & Health',
    subGroups: [
      {
        titleBn: 'জনপ্রিয় খেলাধুলা',
        titleEn: 'Popular Sports',
        items: [
          { id: 'sports', nameBn: 'খেলা', nameEn: 'Sports' },
          { id: 'cricket', nameBn: 'ক্রিকেট', nameEn: 'Cricket' },
          { id: 'football', nameBn: 'ফুটবল', nameEn: 'Football' },
          { id: 'tennis', nameBn: 'টেনিস', nameEn: 'Tennis' },
          { id: 'other-sports', nameBn: 'অন্যান্য খেলা', nameEn: 'Other Sports' }
        ]
      },
      {
        titleBn: 'স্বাস্থ্য, পরিবেশ ও কৃষি',
        titleEn: 'Health, Climate & Agri',
        items: [
          { id: 'health', nameBn: 'স্বাস্থ্য', nameEn: 'Health' },
          { id: 'environment', nameBn: 'পরিবেশ', nameEn: 'Environment' },
          { id: 'climate', nameBn: 'জলবায়ু', nameEn: 'Climate' },
          { id: 'agriculture', nameBn: 'কৃষি', nameEn: 'Agriculture' }
        ]
      }
    ]
  },
  {
    id: 'entertainment',
    nameBn: 'বিনোদন ও শোবিজ',
    nameEn: 'Entertainment & Showbiz',
    subGroups: [
      {
        titleBn: 'সিনেমা, ওটিটি ও টেলিভিশন',
        titleEn: 'Cinema & OTT',
        items: [
          { id: 'entertainment', nameBn: 'বিনোদন', nameEn: 'Entertainment' },
          { id: 'cinema', nameBn: 'সিনেমা', nameEn: 'Cinema' },
          { id: 'ott', nameBn: 'ওটিটি', nameEn: 'OTT' },
          { id: 'television', nameBn: 'টেলিভিশন', nameEn: 'Television' },
          { id: 'drama', nameBn: 'নাটক', nameEn: 'Drama' },
          { id: 'music', nameBn: 'গান', nameEn: 'Music' }
        ]
      },
      {
        titleBn: 'বিশ্ব শোবিজ অঙ্গন',
        titleEn: 'Global Showbiz',
        items: [
          { id: 'hollywood', nameBn: 'হলিউড', nameEn: 'Hollywood' },
          { id: 'bollywood', nameBn: 'বলিউড', nameEn: 'Bollywood' },
          { id: 'tollywood', nameBn: 'টলিউড', nameEn: 'Tollywood' }
        ]
      }
    ]
  },
  {
    id: 'lifestyle-culture',
    nameBn: 'জীবনযাপন ও সংস্কৃতি',
    nameEn: 'Lifestyle & Culture',
    subGroups: [
      {
        titleBn: 'জীবনযাপন, ফ্যাশন ও রূপচর্চা',
        titleEn: 'Lifestyle & Fashion',
        items: [
          { id: 'lifestyle', nameBn: 'জীবনযাপন', nameEn: 'Lifestyle' },
          { id: 'fashion', nameBn: 'ফ্যাশন', nameEn: 'Fashion' },
          { id: 'style', nameBn: 'স্টাইল', nameEn: 'Style' },
          { id: 'beauty', nameBn: 'রূপচর্চা', nameEn: 'Beauty Care' },
          { id: 'wellness', nameBn: 'সুস্থতা', nameEn: 'Wellness' },
          { id: 'relationship', nameBn: 'সম্পর্ক', nameEn: 'Relationship' },
          { id: 'horoscope', nameBn: 'রাশিফল', nameEn: 'Horoscope' },
          { id: 'home-decor', nameBn: 'গৃহসজ্জা', nameEn: 'Home Decor' },
          { id: 'shopping', nameBn: 'কেনাকাটা', nameEn: 'Shopping' }
        ]
      },
      {
        titleBn: 'ভ্রমণ ও পর্যটন',
        titleEn: 'Travel & Tourism',
        items: [
          { id: 'travel', nameBn: 'ভ্রমণ', nameEn: 'Travel' },
          { id: 'tourism', nameBn: 'পর্যটন', nameEn: 'Tourism' }
        ]
      },
      {
        titleBn: 'শিল্প-সাহিত্য ও ইতিহাস',
        titleEn: 'Literature & History',
        items: [
          { id: 'art-literature', nameBn: 'শিল্প-সাহিত্য', nameEn: 'Art & Literature' },
          { id: 'literature', nameBn: 'সাহিত্য', nameEn: 'Literature' },
          { id: 'poetry', nameBn: 'কবিতা', nameEn: 'Poetry' },
          { id: 'story', nameBn: 'গল্প', nameEn: 'Story' },
          { id: 'books', nameBn: 'বই', nameEn: 'Books' },
          { id: 'culture', nameBn: 'সংস্কৃতি', nameEn: 'Culture' },
          { id: 'history', nameBn: 'ইতিহাস', nameEn: 'History' },
          { id: '1971', nameBn: '১৯৭১', nameEn: '1971' },
          { id: 'achievement', nameBn: 'অর্জন', nameEn: 'Achievement' }
        ]
      }
    ]
  },
  {
    id: 'opinion-specials',
    nameBn: 'মতামত, মিডিয়া ও বিশেষ',
    nameEn: 'Opinion, Media & Specials',
    subGroups: [
      {
        titleBn: 'মতামত ও সম্পাদকীয়',
        titleEn: 'Opinion & Editorials',
        items: [
          { id: 'opinion', nameBn: 'মতামত', nameEn: 'Opinion' },
          { id: 'editorial', nameBn: 'সম্পাদকীয়', nameEn: 'Editorial' },
          { id: 'column', nameBn: 'কলাম', nameEn: 'Column' },
          { id: 'interview', nameBn: 'সাক্ষাৎকার', nameEn: 'Interview' },
          { id: 'analysis', nameBn: 'বিশ্লেষণ', nameEn: 'Analysis' },
          { id: 'news-analysis', nameBn: 'সংবাদ বিশ্লেষণ', nameEn: 'News Analysis' },
          { id: 'investigative', nameBn: 'অনুসন্ধানী প্রতিবেদন', nameEn: 'Investigative' }
        ]
      },
      {
        titleBn: 'মাল্টিমিডিয়া ও গ্যালারি',
        titleEn: 'Multimedia & Gallery',
        items: [
          { id: 'photos', nameBn: 'ছবি', nameEn: 'Photos' },
          { id: 'photo-story', nameBn: 'ফটো স্টোরি', nameEn: 'Photo Story' },
          { id: 'photo-gallery', nameBn: 'ফটোগ্যালারি', nameEn: 'Photo Gallery' },
          { id: 'video', nameBn: 'ভিডিও', nameEn: 'Video' },
          { id: 'video-story', nameBn: 'ভিডিও স্টোরি', nameEn: 'Video Story' },
          { id: 'video-gallery', nameBn: 'ভিডিও গ্যালারি', nameEn: 'Video Gallery' },
          { id: 'audio', nameBn: 'অডিও', nameEn: 'Audio' },
          { id: 'podcast', nameBn: 'পডকাস্ট', nameEn: 'Podcast' },
          { id: 'live', nameBn: 'লাইভ', nameEn: 'Live' }
        ]
      },
      {
        titleBn: 'ফিচার, ম্যাগাজিন ও প্রকাশনা',
        titleEn: 'Features & Publications',
        items: [
          { id: 'feature', nameBn: 'ফিচার', nameEn: 'Feature' },
          { id: 'special-report', nameBn: 'বিশেষ প্রতিবেদন', nameEn: 'Special Report' },
          { id: 'long-read', nameBn: 'দীর্ঘপাঠ', nameEn: 'Long Read' },
          { id: 'human-story', nameBn: 'মানবিক গল্প', nameEn: 'Human Story' },
          { id: 'media', nameBn: 'মিডিয়া', nameEn: 'Media' },
          { id: 'social-media', nameBn: 'সোশ্যাল মিডিয়া', nameEn: 'Social Media' },
          { id: 'curiosities', nameBn: 'বিচিত্র', nameEn: 'Curiosities' },
          { id: 'biography', nameBn: 'জীবনকাহিনি', nameEn: 'Life Stories' },
          { id: 'special-edition', nameBn: 'বিশেষ সংখ্যা', nameEn: 'Special Edition' },
          { id: 'magazine', nameBn: 'ম্যাগাজিন', nameEn: 'Magazine' },
          { id: 'e-paper', nameBn: 'ই-পেপার', nameEn: 'E-Paper' },
          { id: 'advertisement', nameBn: 'বিজ্ঞাপন', nameEn: 'Advertisement' },
          { id: 'advertorial', nameBn: 'অ্যাডভার্টোরিয়াল', nameEn: 'Advertorial' }
        ]
      }
    ]
  }
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
    isHighlighted: true,
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
    views: 8900,
    isHighlighted: true
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
    views: 11400,
    isHighlighted: true
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

  // 3. Section: Latest News (4 Horizontal Cards)
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
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:০৫',
    dateEn: '28 Sep 2026, 10:05 AM',
    views: 9100
  },

  // 3.5. Section: Expatriates & Remittance Fighters (Probashi & Remittance Fighters)
  {
    id: 'probashi-1',
    titleBn: 'রেকর্ড রেমিট্যান্স পাঠালেন প্রবাসীরা: বৈধ পথে এক মাসে এলো ২.৪ বিলিয়ন ডলার',
    titleEn: 'Expatriates send record remittance: $2.4 Billion received via banking channels in single month',
    category: 'probashi',
    categoryBn: 'প্রবাসী',
    excerptBn: 'বাংলাদেশ ব্যাংকের সর্বশেষ পরিসংখ্যান অনুযায়ী ব্যাংকিং চ্যানেলে রেমিট্যান্স প্রবাহে নতুন রেকর্ড সৃষ্টি হয়েছে। বৈধ পথে অর্থ পাঠাতে প্রবাসীদের মাঝে ব্যাপক সাড়া।',
    excerptEn: 'Inflow of foreign exchange surges as expatriates increasingly utilize authorized banking channels with 2.5% government incentives.',
    contentBn: `প্রবাসী বাংলাদেশিদের অক্লান্ত পরিশ্রম ও দেশপ্রেমের অনন্য নিদর্শন হিসেবে এক মাসে রেকর্ড ২.৪ বিলিয়ন মার্কিন ডলারের বেশি রেমিট্যান্স এসেছে দেশে। বাংলাদেশ ব্যাংকের সর্বশেষ প্রতিবেদনে দেখা যায়, মধ্যপ্রাচ্য, ইউরোপ এবং উত্তর আমেরিকার দেশগুলো থেকে সর্বোচ্চ পরিমাণ বৈদেশিক মুদ্রা পাঠিয়েছেন রেমিট্যান্স যোদ্ধারা।\n\nবৈধ চ্যানেলে প্রণোদনা বৃদ্ধি এবং হুন্ডি বিরোধী প্রচারণার ফলেই এই অভাবনীয় সাফল্য এসেছে বলে জানিয়েছেন কেন্দ্রীয় ব্যাংকের গভর্নর। তিনি প্রবাসীদের সুযোগ-সুবিধা ও নিরাপত্তা আরও বৃদ্ধির আশ্বাস দেন।`,
    contentEn: `Remittance inflows to Bangladesh reached a stellar $2.4 billion in the latest monthly report, propelled by proactive banking incentives and strong diaspora engagement across Saudi Arabia, UAE, UK, and the USA.`,
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
    dateBn: 'আজ, দুপুর ০১:১৫',
    dateEn: 'Today, 01:15 PM',
    readTimeBn: '৪ মিনিট',
    readTimeEn: '4 min read',
    author: 'প্রবাসী ও অর্থনীতি প্রতিবেদক',
    views: 18900,
    isLeadHero: false,
    isHighlighted: true,
    region: 'middle-east'
  },
  {
    id: 'probashi-2',
    titleBn: 'মালয়েশিয়ায় নতুন কর্মসংস্থান ও ভিসা নবায়নে প্রবাসীদের জন্য বিশেষ ছাড়',
    titleEn: 'Special concessions announced for Bangladeshi workers in Malaysia for visa renewal and job transition',
    category: 'probashi',
    categoryBn: 'প্রবাসী',
    excerptBn: 'কুয়ালালামপুরে বাংলাদেশ হাইকমিশনের সফল আলোচনার পর কর্মীদের বৈধকরণ প্রক্রিয়া আরও সহজ করেছে মালয়েশিয়া সরকার।',
    excerptEn: 'Following bilateral diplomatic discussions, Malaysian authorities have streamlined workforce regularization procedures.',
    contentBn: `মালয়েশিয়ার মানবসম্পদ মন্ত্রণালয় সে দেশে অবস্থানরত বাংলাদেশি দক্ষ ও আধাদক্ষ কর্মীদের জন্য ভিসা নবায়ন ও কোম্পানি পরিবর্তনের নিয়মে গুরুত্বপূর্ণ ছাড় ঘোষণা করেছে। প্রবাসী কর্মীরা যাতে কোনো প্রকার মধ্যস্বত্বভোগী ছাড়াই সহজে সেবা পান, সেজন্য কুয়ালালামপুরস্থ বাংলাদেশ হাইকমিশন ডিজিটাল অ্যাপ চালু করেছে।`,
    contentEn: `Malaysian labor authorities and the Bangladesh High Commission have finalized landmark guidelines easing job legalization and welfare coverage for expatriate workers.`,
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80',
    dateBn: 'আজ, সকাল ১১:৩০',
    dateEn: 'Today, 11:30 AM',
    author: 'কুয়ালালামপুর প্রতিনিধি',
    views: 12400,
    region: 'asia'
  },
  {
    id: 'probashi-3',
    titleBn: 'সৌদি আরবে প্রবাসী কর্মীদের স্বাস্থ্যবিমা ও আইনি সুরক্ষায় নতুন সেল গঠন',
    titleEn: 'New dedicated legal & healthcare protection cell launched for expatriate workers in Saudi Arabia',
    category: 'probashi',
    categoryBn: 'প্রবাসী',
    excerptBn: 'রিয়াদ ও জেদ্দায় কর্মরত লাখ লাখ বাংলাদেশির অধিকার সুরক্ষায় ২৪ ঘণ্টা জরুরি হটলাইন ও আইনি কাউন্সেলিং সেবা চালু।',
    excerptEn: 'A 24/7 dedicated helpline and legal assistance initiative has been deployed across Riyadh and Jeddah for Bangladeshi nationals.',
    contentBn: `সৌদি আরবে বসবাসরত বাংলাদেশি শ্রমিকদের বিভিন্ন কোম্পানি সংক্রান্ত বিরোধ নিষ্পত্তি, বকেয়া বেতন আদায় এবং দুর্ঘটনাজনিত স্বাস্থ্যবিমা দাবি নিষ্পত্তির জন্য বাংলাদেশ দূতাবাস ও কনস্যুলেট যৌথভাবে একটি আইনি সহায়তা সেল গঠন করেছে।`,
    contentEn: `Diplomatic missions in Saudi Arabia have introduced emergency helplines and legal dispute resolution mechanisms for Bangladeshi migrant workers.`,
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80',
    dateBn: 'আজ, সকাল ০৯:৪৫',
    dateEn: 'Today, 09:45 AM',
    author: 'মধ্যপ্রাচ্য ব্যুরো',
    views: 10500,
    region: 'middle-east'
  },
  {
    id: 'probashi-4',
    titleBn: 'বিমানবন্দরে প্রবাসীদের ভিআইপি সম্মান ও বিশেষ লাউঞ্জ সেবা পুরোদমে চালু',
    titleEn: 'Dedicated airport lounge and express protocol services fully operational for expatriates at HSIA',
    category: 'probashi',
    categoryBn: 'প্রবাসী',
    excerptBn: 'হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দরে রেমিট্যান্স যোদ্ধাদের জন্য বিনামূল্যে খাবার, বিশ্রাম ও লাগেজ সহায়তা প্রদান।',
    excerptEn: 'Special lounge amenities including complimentary refreshments and baggage assistance are now fully operational at Dhaka Airport.',
    contentBn: `দেশের অর্থনীতিতে অসামান্য অবদান রাখা প্রবাসী রেমিট্যান্স যোদ্ধাদের সম্মানে হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দরে চালু হওয়া স্পেশাল প্রবাসী লাউঞ্জ ব্যাপক প্রশংসিত হচ্ছে। প্রবাসীদের ইমিগ্রেশন ও লাগেজ হ্যান্ডলিংয়ে দ্রুত সহায়তা দিচ্ছেন বিশেষ স্বেচ্ছাসেবক দল।`,
    contentEn: 'The specialized Expatriate Lounge at Hazrat Shahjalal International Airport offers express immigration support and transit facilities.',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
    dateBn: 'গতকাল',
    dateEn: 'Yesterday',
    author: 'বিমানবন্দর প্রতিনিধি',
    views: 9800,
    region: 'bangladesh'
  },
  {
    id: 'probashi-5',
    titleBn: 'ইউরোপ ও যুক্তরাজ্যে প্রবাসী তরুণ উদ্যোক্তাদের সাফল্য: দেশে বিনিয়োগ বাড়ছে',
    titleEn: 'Bangladeshi young entrepreneurs making strides in UK & Europe, channeling FDI into tech & hospitality',
    category: 'probashi',
    categoryBn: 'প্রবাসী',
    excerptBn: 'লন্ডন ও ফ্রাঙ্কফুর্টের বাংলাদেশি স্টার্টআপ ফাউন্ডাররা দেশে হাই-টেক ও পর্যটন খাতে বিপুল বিনিয়োগ নিয়ে আসছেন।',
    excerptEn: 'UK and European Bangladeshi diaspora entrepreneurs are accelerating capital deployment into local IT and sustainable tourism.',
    contentBn: `যুক্তরাজ্য ও ইউরোপের বিভিন্ন দেশে সফল বাংলাদেশি তরুণ ব্যবসায়ীরা দেশের তথ্যপ্রযুক্তি, এগ্রো-প্রসেসিং ও নবায়নযোগ্য জ্বালানি খাতে সরাসরি বৈদেশিক বিনিয়োগ (FDI) বৃদ্ধি করছেন। প্রবাসী ইনভেস্টমেন্ট ফোরাম আয়োজিত এক সম্মেলনে বক্তারা এই আশাবাদ ব্যক্ত করেন।`,
    contentEn: 'Diaspora venture capitalists in the UK and Germany are expanding investments into Bangladesh technology and manufacturing ecosystems.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪',
    dateEn: '28 Sep 2026',
    author: 'লন্ডন প্রতিনিধি',
    views: 8400,
    region: 'europe'
  },

  // 4. Section: Bangladesh News (Split Left)
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

  // 5. Section: Video News (Split Right)
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

export const podcastSubjects = [
  { id: 'all', nameBn: 'সব পর্ব', nameEn: 'All Episodes', iconType: 'all' },
  { id: 'politics', nameBn: 'রাজনীতি ও রাষ্ট্র', nameEn: 'Politics & Governance', iconType: 'politics' },
  { id: 'economy', nameBn: 'অর্থনীতি ও ব্যবসা', nameEn: 'Economy & Business', iconType: 'economy' },
  { id: 'tech', nameBn: 'প্রযুক্তি ও উদ্ভাবন', nameEn: 'Tech & Innovation', iconType: 'tech' },
  { id: 'media', nameBn: 'মিডিয়া ও সাংবাদিকতা', nameEn: 'Media & Journalism', iconType: 'media' },
  { id: 'youth', nameBn: 'তারুণ্য ও ক্যারিয়ার', nameEn: 'Youth & Career', iconType: 'youth' },
  { id: 'society', nameBn: 'সমাজ ও জীবনধারা', nameEn: 'Society & Lifestyle', iconType: 'society' }
];

export const initialPodcasts = [
  {
    id: 'pod-1',
    titleBn: 'নতুন বাংলাদেশ বিনির্মাণে তারুণ্যের ভাবনা ও ভবিষ্যৎ রাজনীতি',
    titleEn: 'Youth Vision and the Future Politics in Rebuilding Bangladesh',
    subjectId: 'politics',
    subjectBn: 'রাজনীতি ও রাষ্ট্র',
    subjectEn: 'Politics & Governance',
    youtubeId: 'dQw4w9WgXcQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    hostBn: 'মোঃ বিপ্লব হোসেন',
    hostEn: 'Md. Biplob Hossain',
    guestBn: 'ফারহান আহমেদ (রাজনৈতিক বিশ্লেষক)',
    guestEn: 'Farhan Ahmed (Political Analyst)',
    duration: '২৫:৪০',
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪',
    dateEn: '28 Sep 2026'
  },
  {
    id: 'pod-2',
    titleBn: 'অর্থনীতির সংকট থেকে উত্তরণের সম্ভাব্য পথ ও সম্ভাবনা',
    titleEn: 'Potential Pathways to Overcoming the Economic Crisis',
    subjectId: 'economy',
    subjectBn: 'অর্থনীতি ও ব্যবসা',
    subjectEn: 'Economy & Business',
    youtubeId: '3JZ_D3ELwOQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    hostBn: 'জনগণ পডকাস্ট টিম',
    hostEn: 'Jonogon Podcast Team',
    guestBn: 'ড. জামিল হাসান (অর্থনীতিবিদ)',
    guestEn: 'Dr. Jamil Hasan (Economist)',
    duration: '৩২:১৫',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=80',
    dateBn: '২৭ সেপ্টেম্বর ২০২৪',
    dateEn: '27 Sep 2026'
  },
  {
    id: 'pod-3',
    titleBn: 'মিডিয়া ও স্বাধীন সাংবাদিকতার নতুন দিগন্ত',
    titleEn: 'New Horizons for Free Media and Journalism',
    subjectId: 'media',
    subjectBn: 'মিডিয়া ও সাংবাদিকতা',
    subjectEn: 'Media & Journalism',
    youtubeId: 'L_LUpnjgPso',
    youtubeUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    hostBn: 'মোঃ বিপ্লব হোসেন',
    hostEn: 'Md. Biplob Hossain',
    guestBn: 'রাশেদ খান (সিনিয়র সাংবাদিক)',
    guestEn: 'Rashed Khan (Senior Journalist)',
    duration: '১৮:২০',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
    dateBn: '২৬ সেপ্টেম্বর ২০২৪',
    dateEn: '26 Sep 2026'
  },
  {
    id: 'pod-4',
    titleBn: 'প্রযুক্তি ও এআই: বাংলাদেশের তরুণদের কাজের সুযোগ',
    titleEn: 'Tech & AI: Future Opportunities for Bangladeshi Youth',
    subjectId: 'tech',
    subjectBn: 'প্রযুক্তি ও উদ্ভাবন',
    subjectEn: 'Tech & Innovation',
    youtubeId: 'kJQP7kiw5Fk',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    hostBn: 'জনগণ পডকাস্ট ডেস্ক',
    hostEn: 'Jonogon Podcast Desk',
    guestBn: 'তানভীর আহমেদ (এআই গবেষক)',
    guestEn: 'Tanvir Ahmed (AI Researcher)',
    duration: '২১:১০',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    dateBn: '২৫ সেপ্টেম্বর ২০২৪',
    dateEn: '25 Sep 2026'
  },
  {
    id: 'pod-5',
    titleBn: 'উচ্চশিক্ষা ও বিশ্বমঞ্চে ক্যারিয়ার গঠনের বাস্তব গাইডলাইন',
    titleEn: 'Higher Education and Global Career Strategy Guide',
    subjectId: 'youth',
    subjectBn: 'তারুণ্য ও ক্যারিয়ার',
    subjectEn: 'Youth & Career',
    youtubeId: 'kJQP7kiw5Fk',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    hostBn: 'মোঃ বিপ্লব হোসেন',
    hostEn: 'Md. Biplob Hossain',
    guestBn: 'আবরার সালেহ (ক্যারিয়ার মেন্টর)',
    guestEn: 'Abrar Saleh (Career Mentor)',
    duration: '২৭:৩০',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    dateBn: '২৪ সেপ্টেম্বর ২০২৪',
    dateEn: '24 Sep 2026'
  },
  {
    id: 'pod-6',
    titleBn: 'মানসিক স্বাস্থ্য ও সামাজিক চাপ মোকাবেলার সহজ উপায়',
    titleEn: 'Mental Health and Managing Social Pressure',
    subjectId: 'society',
    subjectBn: 'সমাজ ও জীবনধারা',
    subjectEn: 'Society & Lifestyle',
    youtubeId: '3JZ_D3ELwOQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    hostBn: 'জনগণ পডকাস্ট টিম',
    hostEn: 'Jonogon Podcast Team',
    guestBn: 'ডা. নাজনীন হক (মনোবিদ)',
    guestEn: 'Dr. Nazneen Huq (Psychologist)',
    duration: '২৯:১৫',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    dateBn: '২৩ সেপ্টেম্বর ২০২৪',
    dateEn: '23 Sep 2026'
  }
];

// All 64 Districts of Bangladesh organized by 8 Divisions with Geo Coordinates
export const bangladeshDistricts = [
  {
    divisionBn: 'ঢাকা বিভাগ',
    divisionEn: 'Dhaka Division',
    districts: [
      { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka', lat: 23.8103, lng: 90.4125 },
      { id: 'gazipur', nameBn: 'গাজীপুর', nameEn: 'Gazipur', lat: 23.9981, lng: 90.4203 },
      { id: 'narayanganj', nameBn: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj', lat: 23.6238, lng: 90.5000 },
      { id: 'tangail', nameBn: 'টাঙ্গাইল', nameEn: 'Tangail', lat: 24.2513, lng: 89.9167 },
      { id: 'faridpur', nameBn: 'ফরিদপুর', nameEn: 'Faridpur', lat: 23.6071, lng: 89.8429 },
      { id: 'narsingdi', nameBn: 'নরসিংদী', nameEn: 'Narsingdi', lat: 23.9322, lng: 90.7154 },
      { id: 'manikganj', nameBn: 'মানিকগঞ্জ', nameEn: 'Manikganj', lat: 23.8617, lng: 90.0003 },
      { id: 'munshiganj', nameBn: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj', lat: 23.5422, lng: 90.5305 },
      { id: 'kishoreganj', nameBn: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj', lat: 24.4449, lng: 90.7766 },
      { id: 'gopalganj', nameBn: 'গোপালগঞ্জ', nameEn: 'Gopalganj', lat: 23.0051, lng: 89.8266 },
      { id: 'madaripur', nameBn: 'মাদারীপুর', nameEn: 'Madaripur', lat: 23.1641, lng: 90.1897 },
      { id: 'rajbari', nameBn: 'রাজবাড়ী', nameEn: 'Rajbari', lat: 23.7574, lng: 89.6445 },
      { id: 'shariatpur', nameBn: 'শরীয়তপুর', nameEn: 'Shariatpur', lat: 23.2423, lng: 90.4348 }
    ]
  },
  {
    divisionBn: 'চট্টগ্রাম বিভাগ',
    divisionEn: 'Chittagong Division',
    districts: [
      { id: 'chittagong', nameBn: 'চট্টগ্রাম', nameEn: 'Chittagong', lat: 22.3569, lng: 91.7832 },
      { id: 'coxsbazar', nameBn: 'কক্সবাজার', nameEn: "Cox's Bazar", lat: 21.4272, lng: 92.0058 },
      { id: 'cumilla', nameBn: 'কুমিল্লা', nameEn: 'Cumilla', lat: 23.4607, lng: 91.1809 },
      { id: 'noakhali', nameBn: 'নোয়াখালী', nameEn: 'Noakhali', lat: 22.8696, lng: 91.0993 },
      { id: 'feni', nameBn: 'ফেনী', nameEn: 'Feni', lat: 23.0159, lng: 91.3976 },
      { id: 'chandpur', nameBn: 'চাঁদপুর', nameEn: 'Chandpur', lat: 23.2333, lng: 90.6667 },
      { id: 'brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria', lat: 23.9571, lng: 91.1119 },
      { id: 'lakshmipur', nameBn: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur', lat: 22.9425, lng: 90.8412 },
      { id: 'rangamati', nameBn: 'রাঙ্গামাটি', nameEn: 'Rangamati', lat: 22.6533, lng: 92.1753 },
      { id: 'khagrachhari', nameBn: 'খাগড়াছড়ি', nameEn: 'Khagrachhari', lat: 23.1193, lng: 91.9847 },
      { id: 'bandarban', nameBn: 'বান্দরবান', nameEn: 'Bandarban', lat: 22.1953, lng: 92.2184 }
    ]
  },
  {
    divisionBn: 'রাজশাহী বিভাগ',
    divisionEn: 'Rajshahi Division',
    districts: [
      { id: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi', lat: 24.3745, lng: 88.6042 },
      { id: 'bogura', nameBn: 'বগুড়া', nameEn: 'Bogura', lat: 24.8465, lng: 89.3777 },
      { id: 'pabna', nameBn: 'পাবনা', nameEn: 'Pabna', lat: 24.0064, lng: 89.2483 },
      { id: 'sirajganj', nameBn: 'সিরাজগঞ্জ', nameEn: 'Sirajganj', lat: 24.4534, lng: 89.7008 },
      { id: 'naogaon', nameBn: 'নওগাঁ', nameEn: 'Naogaon', lat: 24.7936, lng: 88.9318 },
      { id: 'natore', nameBn: 'নাটোর', nameEn: 'Natore', lat: 24.4206, lng: 89.0003 },
      { id: 'chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapainawabganj', lat: 24.5965, lng: 88.2775 },
      { id: 'joypurhat', nameBn: 'জয়পুরহাট', nameEn: 'Joypurhat', lat: 25.1015, lng: 89.0277 }
    ]
  },
  {
    divisionBn: 'খুলনা বিভাগ',
    divisionEn: 'Khulna Division',
    districts: [
      { id: 'khulna', nameBn: 'খুলনা', nameEn: 'Khulna', lat: 22.8456, lng: 89.5403 },
      { id: 'jashore', nameBn: 'যশোর', nameEn: 'Jashore', lat: 23.1664, lng: 89.2081 },
      { id: 'kushtia', nameBn: 'কুষ্টিয়া', nameEn: 'Kushtia', lat: 23.9013, lng: 89.1205 },
      { id: 'satkhira', nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira', lat: 22.7185, lng: 89.0705 },
      { id: 'bagerhat', nameBn: 'বাগেরহাট', nameEn: 'Bagerhat', lat: 22.6516, lng: 89.7859 },
      { id: 'jhenaidah', nameBn: 'ঝিনাইদহ', nameEn: 'Jhenaidah', lat: 23.5450, lng: 89.1726 },
      { id: 'chuadanga', nameBn: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga', lat: 23.6402, lng: 88.8418 },
      { id: 'magura', nameBn: 'মাগুরা', nameEn: 'Magura', lat: 23.4873, lng: 89.4199 },
      { id: 'meherpur', nameBn: 'মেহেরপুর', nameEn: 'Meherpur', lat: 23.7622, lng: 88.6318 },
      { id: 'narail', nameBn: 'নড়াইল', nameEn: 'Narail', lat: 23.1725, lng: 89.5127 }
    ]
  },
  {
    divisionBn: 'বরিশাল বিভাগ',
    divisionEn: 'Barisal Division',
    districts: [
      { id: 'barisal', nameBn: 'বরিশাল', nameEn: 'Barisal', lat: 22.7010, lng: 90.3535 },
      { id: 'patuakhali', nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali', lat: 22.3596, lng: 90.3299 },
      { id: 'bhola', nameBn: 'ভোলা', nameEn: 'Bhola', lat: 22.6859, lng: 90.6482 },
      { id: 'pirojpur', nameBn: 'পিরোজপুর', nameEn: 'Pirojpur', lat: 22.5841, lng: 89.9720 },
      { id: 'barguna', nameBn: 'বরগুনা', nameEn: 'Barguna', lat: 22.0953, lng: 90.1121 },
      { id: 'jhalakathi', nameBn: 'ঝালকাঠি', nameEn: 'Jhalakathi', lat: 22.6406, lng: 90.1987 }
    ]
  },
  {
    divisionBn: 'সিলেট বিভাগ',
    divisionEn: 'Sylhet Division',
    districts: [
      { id: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet', lat: 24.8949, lng: 91.8687 },
      { id: 'moulvibazar', nameBn: 'মৌলভীবাজার', nameEn: 'Moulvibazar', lat: 24.4829, lng: 91.7774 },
      { id: 'sunamganj', nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj', lat: 25.0658, lng: 91.3950 },
      { id: 'habiganj', nameBn: 'হবিগঞ্জ', nameEn: 'Habiganj', lat: 24.3749, lng: 91.4155 }
    ]
  },
  {
    divisionBn: 'রংপুর বিভাগ',
    divisionEn: 'Rangpur Division',
    districts: [
      { id: 'rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur', lat: 25.7439, lng: 89.2752 },
      { id: 'dinajpur', nameBn: 'দিনাজপুর', nameEn: 'Dinajpur', lat: 25.6217, lng: 88.6355 },
      { id: 'kurigram', nameBn: 'কুড়িগ্রাম', nameEn: 'Kurigram', lat: 25.8054, lng: 89.6362 },
      { id: 'gaibandha', nameBn: 'গাইবান্ধা', nameEn: 'Gaibandha', lat: 25.3288, lng: 89.5407 },
      { id: 'nilphamari', nameBn: 'নীলফামারী', nameEn: 'Nilphamari', lat: 25.9318, lng: 88.8560 },
      { id: 'lalmonirhat', nameBn: 'লালমনিরহাট', nameEn: 'Lalmonirhat', lat: 25.9923, lng: 89.2847 },
      { id: 'panchagarh', nameBn: 'পঞ্চগড়', nameEn: 'Panchagarh', lat: 26.3411, lng: 88.5541 },
      { id: 'thakurgaon', nameBn: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon', lat: 26.0337, lng: 88.4617 }
    ]
  },
  {
    divisionBn: 'ময়মনসিংহ বিভাগ',
    divisionEn: 'Mymensingh Division',
    districts: [
      { id: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', lat: 24.7471, lng: 90.4203 },
      { id: 'jamalpur', nameBn: 'জামালপুর', nameEn: 'Jamalpur', lat: 24.9375, lng: 89.9378 },
      { id: 'netrokona', nameBn: 'নেত্রকোনা', nameEn: 'Netrokona', lat: 24.8709, lng: 90.7279 },
      { id: 'sherpur', nameBn: 'শেরপুর', nameEn: 'Sherpur', lat: 25.0205, lng: 90.0153 }
    ]
  }
];

// Helper: Calculate distance between two GPS coordinates using Haversine Formula
export function calculateGeoDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Helper: Find closest Bangladesh District from user coordinates
export function findClosestDistrict(userLat, userLng) {
  const allDistricts = bangladeshDistricts.flatMap((div) => div.districts);
  let closest = allDistricts[0];
  let minDistance = Infinity;

  for (const dist of allDistricts) {
    if (dist.lat && dist.lng) {
      const distance = calculateGeoDistance(userLat, userLng, dist.lat, dist.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closest = dist;
      }
    }
  }

  return closest;
}

// Master Bangladesh Emergency & Government Services
export const initialEmergencyServices = [
  {
    id: 'srv-1',
    nameBn: 'জাতীয় জরুরি সেবা (৯৯৯)',
    nameEn: 'National Emergency Service (999)',
    number: '999',
    categoryBn: 'জরুরি কল / পুলিশ / ফায়ার / অ্যাম্বুলেন্স',
    categoryEn: 'Police / Fire / Ambulance',
    descriptionBn: 'পুলিশি সহায়তা, অগ্নিনির্বাপণ (ফায়ার সার্ভিস) ও জরুরি অ্যাম্বুলেন্স সেবার জন্য সার্বক্ষণিক টোল-ফ্রি নম্বর।',
    descriptionEn: '24/7 toll-free emergency response for police, fire service, and ambulance support.',
    websiteUrl: 'https://nhd.gov.bd',
    icon: 'phone'
  },
  {
    id: 'srv-2',
    nameBn: 'জাতীয় তথ্য ও কল সেন্টার (৩৩৩)',
    nameEn: 'National Citizen Service Call Center (333)',
    number: '333',
    categoryBn: 'সরকারি সেবা ও সামাজিক তথ্য',
    categoryEn: 'Govt Services & Citizen Help',
    descriptionBn: 'সকল সরকারি কর্মকর্তা ও দপ্তরের তথ্য, সামাজিক সমস্যা সমাধান ও নাগরিক সেবার কেন্দ্রীয় হেল্পলাইন।',
    descriptionEn: 'Information regarding government offices, public officials, and social grievance helpline.',
    websiteUrl: 'https://333.gov.bd',
    icon: 'info'
  },
  {
    id: 'srv-3',
    nameBn: 'নারী ও শিশু নির্যাতন প্রতিরোধ সেল (১০৯)',
    nameEn: 'Women & Child Helpline (109)',
    number: '109',
    categoryBn: 'নারী ও শিশু সুরক্ষা',
    categoryEn: 'Women & Child Safety',
    descriptionBn: 'যেকোনো স্থানে নারী নির্যাতন, বাল্যবিয়ে রোধ ও শিশুদের জরুরি আইনি সহায়তায় টোল-ফ্রি হেল্পলাইন।',
    descriptionEn: 'National toll-free helpline to report domestic violence, prevent child marriage and abuse.',
    websiteUrl: 'https://mowca.gov.bd',
    icon: 'shield'
  },
  {
    id: 'srv-4',
    nameBn: 'দুদক অভিযোগ হটলাইন (১০৬)',
    nameEn: 'Anti-Corruption Commission Helpline (106)',
    number: '106',
    categoryBn: 'দুর্নীতি দমন ও অভিযোগ',
    categoryEn: 'Anti-Corruption',
    descriptionBn: 'সরকারি-বেসরকারি ক্ষেত্রে দুর্নীতি, ঘুষ লেনদেন ও অনিয়মের তথ্য সরাসরি দুদকে জানাতে কল করুন।',
    descriptionEn: 'Direct hotline to report bribery, misconduct, and corruption to ACC.',
    websiteUrl: 'https://acc.org.bd',
    icon: 'alert'
  },
  {
    id: 'srv-5',
    nameBn: 'জাতীয় পরিচয়পত্র (NID) সেবা (১০৫)',
    nameEn: 'National ID (NID) Helpline (105)',
    number: '105',
    categoryBn: 'এনআইডি ও ভোটার তথ্য',
    categoryEn: 'NID & Voter Services',
    descriptionBn: 'স্মার্ট এনআইডি কার্ড সংশোধন, নতুন ভোটার নিবন্ধন ও স্থানান্তর সংক্রান্ত সার্বিক সহায়তা।',
    descriptionEn: 'Support regarding Smart NID cards, corrections, and voter registrations.',
    websiteUrl: 'https://services.nidw.gov.bd',
    icon: 'id'
  },
  {
    id: 'srv-6',
    nameBn: 'স্মার্ট ভূমি সেবা হটলাইন (১৬১২২)',
    nameEn: 'Smart Land Service (16122)',
    number: '16122',
    categoryBn: 'ই-নামজারি ও খতিয়ান',
    categoryEn: 'Land Records & E-Mutation',
    descriptionBn: 'অনলাইনে খতিয়ান যাচাই, ই-নামজারি, ভূমি উন্নয়ন কর পরিশোধ ও জমির দলিল সংক্রান্ত নাগরিক সেবা।',
    descriptionEn: 'Helpline for land registration, mutation, e-porcha, and land tax payments.',
    websiteUrl: 'https://land.gov.bd',
    icon: 'globe'
  },
  {
    id: 'srv-7',
    nameBn: 'দুর্যোগের আগাম বার্তা (১০৯০)',
    nameEn: 'Disaster Warning & Alert (1090)',
    number: '1090',
    categoryBn: 'আবহাওয়া ও সতর্কবার্তা',
    categoryEn: 'Weather & Disaster Alert',
    descriptionBn: 'বন্যা, ঘূর্ণিঝড়, জলোচ্ছ্বাস ও সমুদ্রের আবহাওয়া সতর্কবার্তা জানার ইন্টারেক্টিভ ভয়েস সার্ভিস।',
    descriptionEn: 'Interactive voice response for cyclones, floods, and maritime weather alerts.',
    websiteUrl: 'https://ddm.gov.bd',
    icon: 'cloud'
  },
  {
    id: 'srv-8',
    nameBn: 'বাংলাদেশ ই-পাসপোর্ট পোর্টাল',
    nameEn: 'Bangladesh e-Passport Portal',
    number: '',
    categoryBn: 'পাসপোর্ট ও ইমিগ্রেশন',
    categoryEn: 'Passport & Immigration',
    descriptionBn: 'অনলাইনে নতুন ই-পাসপোর্ট আবেদন, রিনিউ ও অ্যাপ্লিকেশন স্ট্যাটাস ট্র্যাকিং সংক্রান্ত অফিশিয়াল পোর্টাল।',
    descriptionEn: 'Official government portal for online e-Passport application and status tracking.',
    websiteUrl: 'https://epassport.gov.bd',
    icon: 'link'
  }
];



export const defaultHomepageSections = [
  {
    "id": "heroLeadGrid",
    "nameBn": "১. হিরো লিড ৩-কলাম গ্রিড",
    "nameEn": "Hero Lead 3-Column Grid",
    "descriptionBn": "প্রধান সংবাদ, মতামত, স্পেশাল লিড ও সাইডবার ট্রেন্ডিং",
    "descriptionEn": "Top story banner, newly published news stream and trending sidebar",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "LayoutGrid",
    "type": "main"
  },
  {
    "id": "latestNewsGrid",
    "nameBn": "২. সর্বশেষ সংবাদ ট্র্যাক",
    "nameEn": "Latest News Track",
    "descriptionBn": "সর্বশেষ সংবাদের অনুদৈর্ঘ্য কার্ড স্ক্রলিং ট্র্যাক",
    "descriptionEn": "Horizontal latest news feed with timestamps and quick category filter",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "Clock",
    "type": "main"
  },
  {
    "id": "bangladeshSection",
    "nameBn": "৩. বাংলাদেশ ও জাতীয় সংবাদ",
    "nameEn": "Bangladesh & National Section",
    "descriptionBn": "জাতীয় সংবাদ, লাইভ আবহাওয়া ও সোশ্যাল ফলো উইজেট",
    "descriptionEn": "National reports, district live weather and social followers widget",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "Flag",
    "type": "main"
  },
  {
    "id": "remittanceFighter",
    "nameBn": "৪. প্রবাসী ও রেমিট্যান্স যোদ্ধা",
    "nameEn": "Expatriates & Remittance Fighters",
    "descriptionBn": "প্রবাসী ভাই-বোনদের খবর ও রেমিট্যান্স তথ্য",
    "descriptionEn": "Global diaspora news, currency exchange rates and 24/7 hotline",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "Plane",
    "type": "main"
  },
  {
    "id": "districtNewsSection",
    "nameBn": "৫. আমার জেলা সংবাদ",
    "nameEn": "My District News",
    "descriptionBn": "৬৪ জেলার বিভাগভিত্তিক আঞ্চলিক সংবাদ ফিল্টার ও মানচিত্র",
    "descriptionEn": "Interactive district-level regional news filter for 64 districts",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "MapPin",
    "type": "main"
  },
  {
    "id": "videoNewsSection",
    "nameBn": "৬. ভিডিও সংবাদ ও প্লেয়ার",
    "nameEn": "Video News & Player",
    "descriptionBn": "ইউটিউব ও ভিডিও বুলেটিন সংবাদ প্লেয়ার এবং প্লেলিস্ট",
    "descriptionEn": "Featured YouTube video player, playlist and bulletin news stream",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "PlaySquare",
    "type": "main"
  },
  {
    "id": "podcastSection",
    "nameBn": "৭. পডকাস্ট পর্বসমূহ",
    "nameEn": "Our Podcasts",
    "descriptionBn": "অডিও ও ভিডিও পডকাস্ট আলোচনার পর্বসমূহ",
    "descriptionEn": "Deep-dive audio & video podcast discussion episodes",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "Mic",
    "type": "main"
  },
  {
    "id": "subgroup-bangladesh-governance-0",
    "masterGroupId": "bangladesh-governance",
    "subGroupIndex": 0,
    "subGroupTitleBn": "জাতীয় ও নগর",
    "subGroupTitleEn": "National & Urban",
    "masterGroupNameBn": "বাংলাদেশ ও জাতীয়",
    "masterGroupNameEn": "Bangladesh & National",
    "nameBn": "বাংলাদেশ ও জাতীয়: জাতীয় ও নগর",
    "nameEn": "Bangladesh & National: National & Urban",
    "descriptionBn": "জাতীয় ও নগর সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for National & Urban",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-bangladesh-governance-1",
    "masterGroupId": "bangladesh-governance",
    "subGroupIndex": 1,
    "subGroupTitleBn": "রাজনীতি ও নির্বাচন",
    "subGroupTitleEn": "Politics & Elections",
    "masterGroupNameBn": "বাংলাদেশ ও জাতীয়",
    "masterGroupNameEn": "Bangladesh & National",
    "nameBn": "বাংলাদেশ ও জাতীয়: রাজনীতি ও নির্বাচন",
    "nameEn": "Bangladesh & National: Politics & Elections",
    "descriptionBn": "রাজনীতি ও নির্বাচন সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Politics & Elections",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-bangladesh-governance-2",
    "masterGroupId": "bangladesh-governance",
    "subGroupIndex": 2,
    "subGroupTitleBn": "প্রশাসন ও বিচার ব্যবস্থা",
    "subGroupTitleEn": "Admin & Judiciary",
    "masterGroupNameBn": "বাংলাদেশ ও জাতীয়",
    "masterGroupNameEn": "Bangladesh & National",
    "nameBn": "বাংলাদেশ ও জাতীয়: প্রশাসন ও বিচার ব্যবস্থা",
    "nameEn": "Bangladesh & National: Admin & Judiciary",
    "descriptionBn": "প্রশাসন ও বিচার ব্যবস্থা সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Admin & Judiciary",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-international-world-0",
    "masterGroupId": "international-world",
    "subGroupIndex": 0,
    "subGroupTitleBn": "বৈশ্বিক রাজনীতি",
    "subGroupTitleEn": "Global Affairs",
    "masterGroupNameBn": "আন্তর্জাতিক ও বিশ্ব",
    "masterGroupNameEn": "International & World",
    "nameBn": "আন্তর্জাতিক ও বিশ্ব: বৈশ্বিক রাজনীতি",
    "nameEn": "International & World: Global Affairs",
    "descriptionBn": "বৈশ্বিক রাজনীতি সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Global Affairs",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-international-world-1",
    "masterGroupId": "international-world",
    "subGroupIndex": 1,
    "subGroupTitleBn": "এশিয়া ও মধ্যপ্রাচ্য",
    "subGroupTitleEn": "Asia & Middle East",
    "masterGroupNameBn": "আন্তর্জাতিক ও বিশ্ব",
    "masterGroupNameEn": "International & World",
    "nameBn": "আন্তর্জাতিক ও বিশ্ব: এশিয়া ও মধ্যপ্রাচ্য",
    "nameEn": "International & World: Asia & Middle East",
    "descriptionBn": "এশিয়া ও মধ্যপ্রাচ্য সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Asia & Middle East",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-international-world-2",
    "masterGroupId": "international-world",
    "subGroupIndex": 2,
    "subGroupTitleBn": "পাশ্চাত্য ও অন্যান্য অঞ্চল",
    "subGroupTitleEn": "West & Other Continents",
    "masterGroupNameBn": "আন্তর্জাতিক ও বিশ্ব",
    "masterGroupNameEn": "International & World",
    "nameBn": "আন্তর্জাতিক ও বিশ্ব: পাশ্চাত্য ও অন্যান্য অঞ্চল",
    "nameEn": "International & World: West & Other Continents",
    "descriptionBn": "পাশ্চাত্য ও অন্যান্য অঞ্চল সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for West & Other Continents",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-business-economy-0",
    "masterGroupId": "business-economy",
    "subGroupIndex": 0,
    "subGroupTitleBn": "বাণিজ্য ও করপোরেট",
    "subGroupTitleEn": "Trade & Corporate",
    "masterGroupNameBn": "বাণিজ্য ও অর্থনীতি",
    "masterGroupNameEn": "Business & Economy",
    "nameBn": "বাণিজ্য ও অর্থনীতি: বাণিজ্য ও করপোরেট",
    "nameEn": "Business & Economy: Trade & Corporate",
    "descriptionBn": "বাণিজ্য ও করপোরেট সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Trade & Corporate",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-business-economy-1",
    "masterGroupId": "business-economy",
    "subGroupIndex": 1,
    "subGroupTitleBn": "বাজার, ব্যাংকিং ও বিনিয়োগ",
    "subGroupTitleEn": "Markets & Banking",
    "masterGroupNameBn": "বাণিজ্য ও অর্থনীতি",
    "masterGroupNameEn": "Business & Economy",
    "nameBn": "বাণিজ্য ও অর্থনীতি: বাজার, ব্যাংকিং ও বিনিয়োগ",
    "nameEn": "Business & Economy: Markets & Banking",
    "descriptionBn": "বাজার, ব্যাংকিং ও বিনিয়োগ সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Markets & Banking",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-jobs-education-0",
    "masterGroupId": "jobs-education",
    "subGroupIndex": 0,
    "subGroupTitleBn": "চাকরি ও নিয়োগ বিজ্ঞপ্তি",
    "subGroupTitleEn": "Jobs & Recruitment",
    "masterGroupNameBn": "চাকরি ও শিক্ষা",
    "masterGroupNameEn": "Jobs & Education",
    "nameBn": "চাকরি ও শিক্ষা: চাকরি ও নিয়োগ বিজ্ঞপ্তি",
    "nameEn": "Jobs & Education: Jobs & Recruitment",
    "descriptionBn": "চাকরি ও নিয়োগ বিজ্ঞপ্তি সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Jobs & Recruitment",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-jobs-education-1",
    "masterGroupId": "jobs-education",
    "subGroupIndex": 1,
    "subGroupTitleBn": "শিক্ষা ও শিক্ষাঙ্গন",
    "subGroupTitleEn": "Education & Campus",
    "masterGroupNameBn": "চাকরি ও শিক্ষা",
    "masterGroupNameEn": "Jobs & Education",
    "nameBn": "চাকরি ও শিক্ষা: শিক্ষা ও শিক্ষাঙ্গন",
    "nameEn": "Jobs & Education: Education & Campus",
    "descriptionBn": "শিক্ষা ও শিক্ষাঙ্গন সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Education & Campus",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-science-tech-0",
    "masterGroupId": "science-tech",
    "subGroupIndex": 0,
    "subGroupTitleBn": "ডিজিটাল ও আইটি প্রযুক্তি",
    "subGroupTitleEn": "Digital & IT Tech",
    "masterGroupNameBn": "বিজ্ঞান ও প্রযুক্তি",
    "masterGroupNameEn": "Science & Technology",
    "nameBn": "বিজ্ঞান ও প্রযুক্তি: ডিজিটাল ও আইটি প্রযুক্তি",
    "nameEn": "Science & Technology: Digital & IT Tech",
    "descriptionBn": "ডিজিটাল ও আইটি প্রযুক্তি সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Digital & IT Tech",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-science-tech-1",
    "masterGroupId": "science-tech",
    "subGroupIndex": 1,
    "subGroupTitleBn": "গ্যাজেট ও অটোমোবাইল",
    "subGroupTitleEn": "Gadgets & Auto",
    "masterGroupNameBn": "বিজ্ঞান ও প্রযুক্তি",
    "masterGroupNameEn": "Science & Technology",
    "nameBn": "বিজ্ঞান ও প্রযুক্তি: গ্যাজেট ও অটোমোবাইল",
    "nameEn": "Science & Technology: Gadgets & Auto",
    "descriptionBn": "গ্যাজেট ও অটোমোবাইল সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Gadgets & Auto",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-religion-society-0",
    "masterGroupId": "religion-society",
    "subGroupIndex": 0,
    "subGroupTitleBn": "সমাজ ও মানুষ",
    "subGroupTitleEn": "Society & People",
    "masterGroupNameBn": "ধর্ম ও সমাজ",
    "masterGroupNameEn": "Religion & Society",
    "nameBn": "ধর্ম ও সমাজ: সমাজ ও মানুষ",
    "nameEn": "Religion & Society: Society & People",
    "descriptionBn": "সমাজ ও মানুষ সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Society & People",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-religion-society-1",
    "masterGroupId": "religion-society",
    "subGroupIndex": 1,
    "subGroupTitleBn": "ধর্ম ও বিশ্বাস",
    "subGroupTitleEn": "Religion & Faith",
    "masterGroupNameBn": "ধর্ম ও সমাজ",
    "masterGroupNameEn": "Religion & Society",
    "nameBn": "ধর্ম ও সমাজ: ধর্ম ও বিশ্বাস",
    "nameEn": "Religion & Society: Religion & Faith",
    "descriptionBn": "ধর্ম ও বিশ্বাস সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Religion & Faith",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-sports-health-0",
    "masterGroupId": "sports-health",
    "subGroupIndex": 0,
    "subGroupTitleBn": "জনপ্রিয় খেলাধুলা",
    "subGroupTitleEn": "Popular Sports",
    "masterGroupNameBn": "খেলাধুলা ও স্বাস্থ্য",
    "masterGroupNameEn": "Sports & Health",
    "nameBn": "খেলাধুলা ও স্বাস্থ্য: জনপ্রিয় খেলাধুলা",
    "nameEn": "Sports & Health: Popular Sports",
    "descriptionBn": "জনপ্রিয় খেলাধুলা সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Popular Sports",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-sports-health-1",
    "masterGroupId": "sports-health",
    "subGroupIndex": 1,
    "subGroupTitleBn": "স্বাস্থ্য, পরিবেশ ও কৃষি",
    "subGroupTitleEn": "Health, Climate & Agri",
    "masterGroupNameBn": "খেলাধুলা ও স্বাস্থ্য",
    "masterGroupNameEn": "Sports & Health",
    "nameBn": "খেলাধুলা ও স্বাস্থ্য: স্বাস্থ্য, পরিবেশ ও কৃষি",
    "nameEn": "Sports & Health: Health, Climate & Agri",
    "descriptionBn": "স্বাস্থ্য, পরিবেশ ও কৃষি সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Health, Climate & Agri",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-entertainment-0",
    "masterGroupId": "entertainment",
    "subGroupIndex": 0,
    "subGroupTitleBn": "সিনেমা, ওটিটি ও টেলিভিশন",
    "subGroupTitleEn": "Cinema & OTT",
    "masterGroupNameBn": "বিনোদন ও শোবিজ",
    "masterGroupNameEn": "Entertainment & Showbiz",
    "nameBn": "বিনোদন ও শোবিজ: সিনেমা, ওটিটি ও টেলিভিশন",
    "nameEn": "Entertainment & Showbiz: Cinema & OTT",
    "descriptionBn": "সিনেমা, ওটিটি ও টেলিভিশন সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Cinema & OTT",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-entertainment-1",
    "masterGroupId": "entertainment",
    "subGroupIndex": 1,
    "subGroupTitleBn": "বিশ্ব শোবিজ অঙ্গন",
    "subGroupTitleEn": "Global Showbiz",
    "masterGroupNameBn": "বিনোদন ও শোবিজ",
    "masterGroupNameEn": "Entertainment & Showbiz",
    "nameBn": "বিনোদন ও শোবিজ: বিশ্ব শোবিজ অঙ্গন",
    "nameEn": "Entertainment & Showbiz: Global Showbiz",
    "descriptionBn": "বিশ্ব শোবিজ অঙ্গন সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Global Showbiz",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-lifestyle-culture-0",
    "masterGroupId": "lifestyle-culture",
    "subGroupIndex": 0,
    "subGroupTitleBn": "জীবনযাপন, ফ্যাশন ও রূপচর্চা",
    "subGroupTitleEn": "Lifestyle & Fashion",
    "masterGroupNameBn": "জীবনযাপন ও সংস্কৃতি",
    "masterGroupNameEn": "Lifestyle & Culture",
    "nameBn": "জীবনযাপন ও সংস্কৃতি: জীবনযাপন, ফ্যাশন ও রূপচর্চা",
    "nameEn": "Lifestyle & Culture: Lifestyle & Fashion",
    "descriptionBn": "জীবনযাপন, ফ্যাশন ও রূপচর্চা সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Lifestyle & Fashion",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-lifestyle-culture-1",
    "masterGroupId": "lifestyle-culture",
    "subGroupIndex": 1,
    "subGroupTitleBn": "ভ্রমণ ও পর্যটন",
    "subGroupTitleEn": "Travel & Tourism",
    "masterGroupNameBn": "জীবনযাপন ও সংস্কৃতি",
    "masterGroupNameEn": "Lifestyle & Culture",
    "nameBn": "জীবনযাপন ও সংস্কৃতি: ভ্রমণ ও পর্যটন",
    "nameEn": "Lifestyle & Culture: Travel & Tourism",
    "descriptionBn": "ভ্রমণ ও পর্যটন সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Travel & Tourism",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-lifestyle-culture-2",
    "masterGroupId": "lifestyle-culture",
    "subGroupIndex": 2,
    "subGroupTitleBn": "শিল্প-সাহিত্য ও ইতিহাস",
    "subGroupTitleEn": "Literature & History",
    "masterGroupNameBn": "জীবনযাপন ও সংস্কৃতি",
    "masterGroupNameEn": "Lifestyle & Culture",
    "nameBn": "জীবনযাপন ও সংস্কৃতি: শিল্প-সাহিত্য ও ইতিহাস",
    "nameEn": "Lifestyle & Culture: Literature & History",
    "descriptionBn": "শিল্প-সাহিত্য ও ইতিহাস সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Literature & History",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-opinion-specials-0",
    "masterGroupId": "opinion-specials",
    "subGroupIndex": 0,
    "subGroupTitleBn": "মতামত ও সম্পাদকীয়",
    "subGroupTitleEn": "Opinion & Editorials",
    "masterGroupNameBn": "মতামত, মিডিয়া ও বিশেষ",
    "masterGroupNameEn": "Opinion & Specials",
    "nameBn": "মতামত, মিডিয়া ও বিশেষ: মতামত ও সম্পাদকীয়",
    "nameEn": "Opinion & Specials: Opinion & Editorials",
    "descriptionBn": "মতামত ও সম্পাদকীয় সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Opinion & Editorials",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-opinion-specials-1",
    "masterGroupId": "opinion-specials",
    "subGroupIndex": 1,
    "subGroupTitleBn": "মাল্টিমিডিয়া ও গ্যালারি",
    "subGroupTitleEn": "Multimedia & Gallery",
    "masterGroupNameBn": "মতামত, মিডিয়া ও বিশেষ",
    "masterGroupNameEn": "Opinion & Specials",
    "nameBn": "মতামত, মিডিয়া ও বিশেষ: মাল্টিমিডিয়া ও গ্যালারি",
    "nameEn": "Opinion & Specials: Multimedia & Gallery",
    "descriptionBn": "মাল্টিমিডিয়া ও গ্যালারি সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Multimedia & Gallery",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  },
  {
    "id": "subgroup-opinion-specials-2",
    "masterGroupId": "opinion-specials",
    "subGroupIndex": 2,
    "subGroupTitleBn": "ফিচার, ম্যাগাজিন ও প্রকাশনা",
    "subGroupTitleEn": "Features & Publications",
    "masterGroupNameBn": "মতামত, মিডিয়া ও বিশেষ",
    "masterGroupNameEn": "Opinion & Specials",
    "nameBn": "মতামত, মিডিয়া ও বিশেষ: ফিচার, ম্যাগাজিন ও প্রকাশনা",
    "nameEn": "Opinion & Specials: Features & Publications",
    "descriptionBn": "ফিচার, ম্যাগাজিন ও প্রকাশনা সম্পর্কিত ৩-কলাম সাব-গ্রুপ নিউজ সেকশন",
    "descriptionEn": "3-Column subgroup news section for Features & Publications",
    "isVisible": true,
    "isFullWidth": false,
    "icon": "FolderTree",
    "type": "subgroup"
  }
];
