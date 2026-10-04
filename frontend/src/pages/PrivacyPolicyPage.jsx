import React, { useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { updateSEO } from '../services/seoService';
import {
  Shield,
  Lock,
  EyeOff,
  Cookie,
  FileCheck,
  ChevronRight,
  Sparkles,
  Server,
  UserCheck,
  Globe2,
  Database
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { language, settings, goToHome } = useNews();
  const isBn = language === 'bn';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateSEO({
      title: isBn ? 'গোপনীয়তা নীতি — পাঠক ডেটা ও তথ্য সুরক্ষা' : 'Privacy Policy — User Data & Digital Security',
      description: isBn
        ? 'জনগণ.নিউজ (Jonogon News)-এর গোপনীয়তা নীতি, কুকিজ ব্যবহার, Google AdSense পার্টনার পলিসি ও পাঠক তথ্যের শতভাগ নিরাপত্তা নির্দেশিকা।'
        : 'Privacy policy at Jonogon News — comprehensive data security, cookies, advertising disclosures, and reader rights.',
      url: `${window.location.origin}/privacy`,
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
          <span className="breadcrumb-current">{isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</span>
        </nav>

        {/* Hero Header */}
        <header className="page-hero-header">
          <div className="page-hero-badge">
            <Lock size={16} />
            <span>{isBn ? 'তথ্য সুরক্ষা ও গোপনীয়তার প্রতিশ্রুতি' : 'Data Privacy & Reader Security'}</span>
          </div>
          <h1 className="page-main-title">
            {isBn ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy & Data Protection'}
          </h1>
          <p className="page-subtitle">
            {isBn
              ? 'প্রথম আলো, বিডিনিউজ২৪, কালবেলা ও টাইমস্টুডে বিডি-র মতো জাতীয় সংবাদমাধ্যমের ডিজিটাল প্রাইভেসি গাইডলাইন এবং জিডিপিআর (GDPR) মানদণ্ডে সুরক্ষিত আমাদের পাঠকদের ব্যক্তিগত তথ্য।'
              : 'Our privacy charter adhering to Bangladesh digital communication laws, GDPR compliance, and global user data protection benchmarks.'}
          </p>
        </header>

        {/* Policy Content */}
        <div className="page-content-layout">
          <div className="page-main-body">
            {/* Admin Live Policy Statement (if edited from Admin Panel) */}
            {settings.privacyPolicy && (
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
                  <span>{isBn ? 'প্রাইভেসি ডেস্কের লাইভ নোটিশ (Admin Live Privacy Policy)' : 'Official Privacy Policy Statement'}</span>
                </div>
                <p style={{ whiteSpace: 'pre-line', fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
                  {settings.privacyPolicy}
                </p>
              </div>
            )}

            {/* Section 1: Types of Data Collected */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '১. সংগৃহীত তথ্যের স্বচ্ছ বিবরণ' : '1. Transparent Data Collection'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'জনগণ.নিউজ (Jonogon News) ব্রাউজ করার সময় আমরা ব্যবহারকারীর ইন্টারনেট প্রোটোকল (IP) অ্যাড্রেস, ব্রাউজার সংস্করণ, অপারেটিং সিস্টেম, ভিজিটের সময়কাল এবং পৃষ্ঠা ভিউয়ের মতো সাধারণ প্রযুক্তিগত তথ্য অ্যানালিটিক্স উন্নয়নের উদ্দেশ্যে সংগ্রহ করি। কোনো ব্যবহারকারী নিজে থেকে ফরম পূরণ বা কমেন্ট না করলে তার নাম বা ব্যক্তিগত সংবেদনশীল তথ্য সংগ্রহ করা হয় না।'
                  : 'We collect non-personally identifiable analytical telemetry (e.g. IP address, browser type, device metadata, time on site) to continuously optimize portal speed and accessibility.'}
              </p>
            </section>

            {/* Section 2: Cookies & Google AdSense */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '২. কুকিজ (Cookies) ও Google AdSense বিজ্ঞাপন' : '2. Cookies & Google AdSense Partners'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'পাঠকদের নিরবচ্ছিন্ন ব্রাউজিং অভিজ্ঞতা ও প্রাসঙ্গিক বিজ্ঞাপন প্রদর্শনের উদ্দেশ্যে আমরা স্ট্যান্ডার্ড কুকিজ (Cookies) ব্যবহার করি। Google AdSense ও আমাদের অনুমোদিত পার্টনাররা ব্যবহারকারীর আগ্রহ অনুযায়ী প্রাসঙ্গিক বিজ্ঞাপন পরিবেশনের জন্য কুকিজ ব্যবহার করতে পারে। পাঠকরা তাদের ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকিজ নিষ্ক্রিয় করতে পারেন।'
                  : 'Our portal utilizes standard cookies and web beacons. Third-party advertising partners including Google AdSense may deploy DART cookies to serve contextual advertisements tailored to reader preferences.'}
              </p>
            </section>

            {/* Section 3: Non-disclosure Commitment */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৩. শতভাগ নন-ডিসক্লোজার ও তথ্যের গোপনীয়তা প্রতিশ্রুতি' : '3. Absolute Non-Disclosure & Anti-Sale Guarantee'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'আমরা দৃঢ়ভাবে অঙ্গীকার করছি যে, আমাদের পাঠকদের কোনো ব্যক্তিগত তথ্য (যেমন ইমেইল অ্যাড্রেস, ফোন নম্বর) কোনো বাণিজ্যিক বা প্রচারণামূলক উদ্দেশ্যে কোনো তৃতীয় পক্ষের কাছে বিক্রি, ভাড়া বা হস্তান্তর করা হয় না।'
                  : 'We never sell, lease, rent, or trade readers’ personal contact details or submitted identity information to commercial third parties.'}
              </p>
            </section>

            {/* Section 4: Child & Minor Privacy */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৪. শিশু ও অপ্রাপ্তবয়স্কদের তথ্যের বিশেষ সুরক্ষা (COPPA Compliance)' : '4. Child & Minor Online Protection'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? '১৩ বছরের কম বয়সী শিশুদের কোনো ব্যক্তিগত তথ্য জ্ঞাতসারে আমাদের সার্ভারে সংরক্ষণ করা হয় না। অভিভাবক যদি লক্ষ্য করেন যে কোনো অপ্রাপ্তবয়স্ক তার ব্যক্তিগত তথ্য সরবরাহ করেছে, তবে যোগাযোগের মাধ্যমে তা অবিলম্বে ডাটাবেজ থেকে মুছে দেওয়া হবে।'
                  : 'We do not knowingly solicit or collect personal information from children under the age of 13 in strict accordance with child online privacy regulations.'}
              </p>
            </section>

            {/* Section 5: Encryption & Data Security */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৫. সার্ভার সিকিউরিটি, এসএসএল (SSL) ও সাইবার প্রটেকশন' : '5. SSL Encryption & Cyber Defense'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'জনগণ.নিউজ ওয়েবসাইটটি সম্পূর্ণ আধুনিক SSL/TLS ২৫৬-বিট এনক্রিপশন প্রটোকলে সুরক্ষিত। ডেটাবেজ ও ক্লাউড সার্ভার নিয়মিত নিরাপত্তা অডিট ও ফায়ারওয়াল মনিটরিংয়ের মাধ্যমে সাইবার আক্রমণ থেকে সুরক্ষিত রাখা হয়।'
                  : 'All data transmitted across Jonogon News is guarded by 256-bit SSL/TLS encryption, automated firewall defenses, and continuous database integrity audits.'}
              </p>
            </section>

            {/* Section 6: User Rights & Erasure Requests */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৬. ব্যবহারকারীর অধিকার: তথ্য সংশোধন ও মুছে ফেলার অনুরোধ' : '6. Reader Rights: Data Access & Erasure'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'যেকোনো পাঠক তার কমেন্ট হিস্ট্রি, নিউজলেটার সাবস্ক্রিপশন বা যোগাযোগের তথ্য আমাদের ডাটাবেজ থেকে মুছে ফেলা বা সংশোধনের অনুরোধ জানাতে পারেন। আমাদের প্রাইভেসি টিম ২৪-৪৮ ঘণ্টার মধ্যে এই অনুরোধ বাস্তবায়ন করে থাকে।'
                  : 'Readers have the absolute right to request rectification, export, or complete deletion of their stored comments, newsletter registrations, and email records.'}
              </p>
            </section>
          </div>

          <aside className="page-sidebar-col">
            <div className="page-info-card">
              <h3>{isBn ? 'ডেটা প্রাইভেসি সহায়তা' : 'Data Privacy Desk'}</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {isBn
                  ? 'আপনার কোনো ব্যক্তিগত তথ্য মুছে ফেলা, কুকিজ অপ্ট-আউট বা গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নে যোগাযোগ করুন:'
                  : 'For privacy inquiries, cookie preferences, or data deletion requests, contact our legal privacy desk:'}
              </p>
              <div style={{ marginTop: 14 }}>
                <a href={`mailto:${settings.email || 'brandbiplob1234@gmail.com'}`} className="contact-link-val">
                  {settings.email || 'brandbiplob1234@gmail.com'}
                </a>
              </div>
              <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isBn ? 'হেল্পলাইন:' : 'Helpline:'} <strong>{settings.phone || '01936618534'}</strong>
              </div>
            </div>

            <div className="page-info-card">
              <h3>{isBn ? 'আমাদের ৩টি নিরাপত্তা নীতি' : '3 Core Privacy Guarantees'}</h3>
              <ul className="info-bullet-list">
                <li><Shield size={15} color="#16A34A" /> <span>{isBn ? 'শূন্য ট্র্যাকিং অপব্যবহার' : 'Zero Tracking Exploitation'}</span></li>
                <li><Lock size={15} color="#16A34A" /> <span>{isBn ? '২৫৬-বিট SSL এনক্রিপশন' : '256-Bit SSL Encryption'}</span></li>
                <li><EyeOff size={15} color="#16A34A" /> <span>{isBn ? 'তৃতীয় পক্ষের কাছে তথ্য বিক্রি নয়' : 'Never Sold to 3rd Parties'}</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
