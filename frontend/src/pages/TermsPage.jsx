import React, { useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { updateSEO } from '../services/seoService';
import {
  FileText,
  AlertCircle,
  Copyright,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Scale,
  Ban,
  AlertOctagon,
  ShieldAlert
} from 'lucide-react';

export default function TermsPage() {
  const { language, settings, goToHome } = useNews();
  const isBn = language === 'bn';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateSEO({
      title: isBn ? 'ব্যবহারের শর্তাবলী ও আইনি নীতিমালা — কপিরাইট ও দায়মুক্তি' : 'Terms & Conditions — Copyright & Legal Disclaimers',
      description: isBn
        ? 'জনগণ.নিউজ (Jonogon News) ব্যবহারের নিয়মাবলী, বাংলাদেশ কপিরাইট আইন, স্ক্র্যাপিং নিষেধাজ্ঞা, কমেন্ট নীতিমালা ও আইনি নির্দেশিকা।'
        : 'Terms of service and legal conditions governing the access, copyright compliance, and usage of Jonogon News portal.',
      url: `${window.location.origin}/terms`,
      type: 'website'
    });
  }, [isBn]);

  return (
    <div className="standalone-page-container" style={{ padding: '24px 0 60px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <button onClick={goToHome} className="breadcrumb-link">
            {isBn ? 'প্রচ্ছদ' : 'Home'}
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms & Conditions'}</span>
        </nav>

        {/* Hero Header */}
        <header className="page-hero-header">
          <div className="page-hero-badge">
            <Copyright size={16} />
            <span>{isBn ? 'আইনি চুক্তি ও ব্যবহারের নিয়মাবলী' : 'Legal Agreement & User Terms'}</span>
          </div>
          <h1 className="page-main-title">
            {isBn ? 'ব্যবহারের শর্তাবলী ও কপিরাইট নীতিমালা' : 'Terms of Service & Copyright Agreement'}
          </h1>
          <p className="page-subtitle">
            {isBn
              ? 'প্রথম আলো, বিডিনিউজ২৪, কালবেলা ও টাইমস্টুডে বিডি-র মতো শীর্ষ জাতীয় গণমাধ্যমের আইনি স্ট্যান্ডার্ড ও বাংলাদেশ প্রেস কাউন্সিলের বিধিমালার আলোকে প্রণীত।'
              : 'Our user agreement established under the Copyright Act of Bangladesh, Press Council code, and global digital media regulations.'}
          </p>
        </header>

        {/* Terms Content */}
        <div className="page-content-layout">
          <div className="page-main-body">
            {/* Admin Live Policy Statement (if edited from Admin Panel) */}
            {settings.termsAndConditions && (
              <div
                style={{
                  backgroundColor: 'rgba(230, 0, 18, 0.05)',
                  border: '1px solid rgba(230, 0, 18, 0.2)',
                  borderLeft: '5px solid var(--primary-red)',
                  padding: '18px 22px',
                  borderRadius: 6,
                  marginBottom: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--primary-red)', fontWeight: 700 }}>
                  <Sparkles size={18} />
                  <span>{isBn ? 'আইনি পর্ষদের বিশেষ ঘোষণা (Admin Live Terms & Conditions)' : 'Official Terms & Conditions Notice'}</span>
                </div>
                <p style={{ whiteSpace: 'pre-line', fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
                  {settings.termsAndConditions}
                </p>
              </div>
            )}

            {/* Section 1: Intellectual Property & Copyright */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '১. বাংলাদেশ কপিরাইট আইন ও মেধাস্বত্ব সংরক্ষণ' : '1. Bangladesh Copyright Act & Intellectual Property'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'জনগণ.নিউজ (Jonogon News)-এ প্রকাশিত সকল সংবাদ, বিশেষ প্রতিবেদন, আলোকচিত্র, গ্রাফিক্স, ভিডিও, অডিও ও ইনফোগ্রাফিক্স গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের কপিরাইট আইন অনুযায়ী সংরক্ষিত। কর্তৃপক্ষের লিখিত অনুমতি ছাড়া বাণিজ্যিক উদ্দেশ্যে কোনো কনটেন্ট হুবহু কপি, রূপান্তর বা পুনঃপ্রচার সম্পূর্ণ বেআইনি ও দণ্ডনীয় অপরাধ।'
                  : 'All published articles, photographs, video broadcasts, charts, audio podcasts, and graphic layouts on Jonogon News are protected under the Copyright Act of Bangladesh and international copyright treaties.'}
              </p>
            </section>

            {/* Section 2: Scraping & Unauthorized Commercial Use */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '২. স্বয়ংক্রিয় স্ক্র্যাপিং, বট ও অননুমোদিত বাণিজ্যিক ব্যবহার নিষিদ্ধ' : '2. Prohibition of Scraping, Crawling & Commercial Theft'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'কোনো তৃতীয় পক্ষের ওয়েবসাইট বা অ্যাপ দ্বারা আমাদের কনটেন্ট অনুমতিবিহীন স্ক্র্যাপিং (Scraping), আরএসএস ফিড কপি বা সিন্ডিকেশন সম্পূর্ণ নিষিদ্ধ। অবাণিজ্যিক উদ্দেশ্যে ছোট উদ্ধৃতি ব্যবহারের ক্ষেত্রে অবশ্যই ‘জনগণ.নিউজ’ এবং মূল সংবাদের সক্রিয় হাইপারলিংক (Dofollow Link) ক্রেডিট হিসেবে দিতে হবে।'
                  : 'Automated data harvesting, algorithmic content scraping, and unauthorized RSS syndication are strictly barred. Non-commercial quoting requires explicit visible attribution and a direct hyperlink to the original article.'}
              </p>
            </section>

            {/* Section 3: Reader Conduct & Moderation */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৩. পাঠক মন্তব্য, সোশ্যাল প্ল্যাটফর্ম ও ব্যবহারকারীর আচরণবিধি' : '3. Reader Conduct & Moderation Protocol'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'ওয়েবসাইটের মন্তব্য বক্স বা সোশ্যাল প্ল্যাটফর্মে কোনো ব্যক্তি, গোষ্ঠী বা ধর্মের প্রতি বিদ্বেষমূলক, আপত্তিকর, সাম্প্রদায়িক, পর্নোগ্রাফিক বা রাষ্ট্রবিরোধী মন্তব্য করা সম্পূর্ণ নিষিদ্ধ। আমাদের মডারেশন টিম নীতি লঙ্ঘনকারী মন্তব্য মুছে ফেলা এবং সংশ্লিষ্ট ব্যবহারকারীকে স্থায়ীভাবে ব্লক করার পূর্ণ অধিকার সংরক্ষণ করে।'
                  : 'Users are strictly prohibited from posting defamatory, obscene, religiously inflammatory, or unlawful comments. Our editorial moderation team reserves the right to delete violating remarks and permanently suspend accounts.'}
              </p>
            </section>

            {/* Section 4: Advertising Disclaimer */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৪. বিজ্ঞাপনের দায়মুক্তি ও বহিরাগত লিংক সংক্রান্ত সতর্কতা' : '4. Third-Party Advertisements & Links Disclaimer'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'ওয়েবসাইটে প্রদর্শিত বিজ্ঞাপন, স্পন্সরড প্রোডাক্ট ও বহিরাগত লিংকের সত্যতা ও মানের দায় সংশ্লিষ্ট বিজ্ঞাপনদাতার। কোনো বিজ্ঞাপনী পণ্য বা সেবা ক্রয়ের পূর্বে পাঠকদের নিজস্ব বিচার-বিবেচনা প্রয়োগের পরামর্শ দেওয়া হচ্ছে।'
                  : 'Advertisers are solely responsible for the claims and performance of their products and services featured on this portal. Jonogon News accepts no liability for third-party transactions or external links.'}
              </p>
            </section>

            {/* Section 5: Cyber Security Compliance */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৫. সাইবার নিরাপত্তা ও ডিজিটাল আইন অনুশাসন' : '5. Cyber Security Law Compliance'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'সার্ভারে ক্ষতিকারক কোড বা স্প্যামিংয়ের চেষ্টা আইনত অপরাধ হিসেবে বিবেচিত হবে এবং বাংলাদেশ সাইবার নিরাপত্তা আইন অনুযায়ী আইনি ব্যবস্থা গ্রহণ করা হবে।'
                  : 'Any attempt to breach our portal infrastructure, inject malicious code, or disrupt service integrity will be prosecuted under the Cyber Security Laws of Bangladesh.'}
              </p>
            </section>

            {/* Section 6: Legal Jurisdiction */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৬. আইনি বিরোধ ও বিচারিক এখতিয়ার' : '6. Legal Jurisdiction in Dhaka, Bangladesh'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'জনগণ.নিউজ সংক্রান্ত যেকোনো আইনি বিরোধ বা সালিশি কার্যক্রম গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের প্রচলিত আইনের অধীনে এবং ঢাকা আদালতের বিচারিক এখতিয়ারে নিষ্পন্ন হবে।'
                  : 'All legal disputes arising out of the use of this portal shall be governed exclusively by the laws of Bangladesh and subject to the jurisdiction of courts in Dhaka.'}
              </p>
            </section>
          </div>

          <aside className="page-sidebar-col">
            <div className="page-info-card">
              <h3>{isBn ? 'আইনি ও কপিরাইট ডেস্ক' : 'Legal & Licensing Desk'}</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {isBn
                  ? 'কপিরাইট অনুমোদন, কনটেন্ট সিন্ডিকেশন বা প্রাতিষ্ঠানিক ব্যবহারের তথ্যের জন্য সরাসরি যোগাযোগ করুন:'
                  : 'For content syndication agreements, commercial reprints, or copyright licensing:'}
              </p>
              <div style={{ marginTop: 14 }}>
                <a href={`mailto:${settings.email || 'brandbiplob1234@gmail.com'}`} className="contact-link-val">
                  {settings.email || 'brandbiplob1234@gmail.com'}
                </a>
              </div>
              <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isBn ? 'কার্যালয়:' : 'Office:'} <strong>{settings.address || 'ঢাকা, বাংলাদেশ'}</strong>
              </div>
            </div>

            <div className="page-info-card">
              <h3>{isBn ? 'আইনি সতর্কতা' : 'Legal Reminders'}</h3>
              <ul className="info-bullet-list">
                <li><AlertOctagon size={15} color="#DC2626" /> <span>{isBn ? 'অননুমোদিত কপি সম্পূর্ণ নিষিদ্ধ' : 'Unauthorized Copying Prohibited'}</span></li>
                <li><AlertOctagon size={15} color="#DC2626" /> <span>{isBn ? 'উদ্ধৃতিতে ডু-ফলো লিংক বাধ্যতামূলক' : 'Credit & Dofollow Link Required'}</span></li>
                <li><AlertOctagon size={15} color="#DC2626" /> <span>{isBn ? 'মার্জিত পাঠক মন্তব্য কাম্য' : 'Civil Discourse Expected'}</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
