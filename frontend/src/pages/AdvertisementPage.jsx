import React, { useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { updateSEO } from '../services/seoService';
import {
  Megaphone,
  DollarSign,
  TrendingUp,
  Layout,
  FileCheck2,
  Mail,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function AdvertisementPage() {
  const { language, settings, goToHome, navigateTo } = useNews();
  const isBn = language === 'bn';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateSEO({
      title: isBn ? 'বিজ্ঞাপন ও দরপত্র — রেট কার্ড ও স্লট পরিচিতি' : 'Advertisement & Tenders — Ad Rates & Media Kit',
      description: isBn
        ? 'জনগণ.নিউজ (Jonogon News)-এ বিজ্ঞাপন প্রচার ও দরপত্র প্রকাশের নিয়মাবলী, স্লট সাইজ, মূল্যতালিকা ও বাণিজ্যিক যোগাযোগ।'
        : 'Advertise on Jonogon News — banner placements, sponsored articles, tenders, and competitive digital ad rates.',
      url: `${window.location.origin}/advertisement`,
      type: 'website'
    });
  }, [isBn]);

  const adSlotsList = [
    {
      slotNameBn: 'টপ হেডার ব্যানার',
      slotNameEn: 'Top Header Leaderboard',
      size: '728 × 90 px',
      positionBn: 'হেডারের ঠিক উপরে বা পাশে সকল পেজে প্রদর্শিত',
      positionEn: 'Visible on top of all pages across devices'
    },
    {
      slotNameBn: 'ইন-কনটেন্ট ব্যানার (হোম ও বিস্তারিত পেজ)',
      slotNameEn: 'In-Article / Mid-Content Banner',
      size: '970 × 90 px / 728 × 90 px',
      positionBn: 'হোমপেজের ফিড ও প্রতিটি সংবাদের ভেতরে',
      positionEn: 'Positioned prominently inside news articles'
    },
    {
      slotNameBn: 'সাইডবার রেক্ট্যাঙ্গেল অ্যাড',
      slotNameEn: 'Sidebar Medium Rectangle',
      size: '300 × 250 px',
      positionBn: 'প্রতিটি সংবাদের সাইডবারে ও হোমপেজ সাইড কলামে',
      positionEn: 'Visible beside lead news & article content'
    },
    {
      slotNameBn: 'হাফ পেজ স্টিকি ব্যানার',
      slotNameEn: 'Half Page Vertical Banner',
      size: '300 × 600 px',
      positionBn: 'ভিডিও ও নিউজ ফিডের ডানপাশের স্টিকি স্লটে',
      positionEn: 'Sticky sidebar position with high viewability'
    },
    {
      slotNameBn: 'বটম ফুটার ব্যানার',
      slotNameEn: 'Bottom Leaderboard Banner',
      size: '970 × 90 px',
      positionBn: 'ফুটারের ঠিক উপরে সকল পেজে',
      positionEn: 'Fixed placement directly above footer'
    }
  ];

  return (
    <div className="standalone-page-container" style={{ padding: '24px 0 60px 0' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <button onClick={goToHome} className="breadcrumb-link">
            {isBn ? 'প্রচ্ছদ' : 'Home'}
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{isBn ? 'বিজ্ঞাপন ও দরপত্র' : 'Advertisement'}</span>
        </nav>

        {/* Hero Header */}
        <header className="page-hero-header">
          <div className="page-hero-badge">
            <Megaphone size={16} />
            <span>{isBn ? 'বাণিজ্যিক ও বিজ্ঞাপন' : 'Media Kit & Rates'}</span>
          </div>
          <h1 className="page-main-title">
            {isBn ? 'বিজ্ঞাপন ও দরপত্র বিজ্ঞপ্তি প্রকাশনা' : 'Advertise with Jonogon News'}
          </h1>
          <p className="page-subtitle">
            {isBn
              ? 'লাখো পাঠকের কাছে আপনার ব্র্যান্ড, পণ্য, দরপত্র বা নিয়োগ বিজ্ঞপ্তি পৌঁছে দিতে জনগণ.নিউজ সেরা মাধ্যম।'
              : 'Amplify your brand, tender notices, and corporate campaigns across our engaged readers.'}
          </p>
        </header>

        {/* Ad Placement Slots Table & Cards */}
        <section className="page-section-block">
          <h2 className="section-subheading">
            <span className="bullet-accent"></span>
            {isBn ? 'বিজ্ঞাপন স্লট ও প্লেসমেন্ট সাইজ' : 'Banner Ad Dimensions & Placements'}
          </h2>

          <div className="ad-slots-table-card">
            <table className="ad-rates-table">
              <thead>
                <tr>
                  <th>{isBn ? 'স্লটের নাম' : 'Ad Slot'}</th>
                  <th>{isBn ? 'সাইজ (রেজোলিউশন)' : 'Dimensions'}</th>
                  <th>{isBn ? 'অবস্থান ও দৃশ্যমানতা' : 'Placement Position'}</th>
                </tr>
              </thead>
              <tbody>
                {adSlotsList.map((slot, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{isBn ? slot.slotNameBn : slot.slotNameEn}</strong>
                    </td>
                    <td>
                      <span className="badge-outline" style={{ fontWeight: 700 }}>
                        {slot.size}
                      </span>
                    </td>
                    <td>{isBn ? slot.positionBn : slot.positionEn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tender Notices & Sponsored Content */}
        <div className="page-content-layout" style={{ marginTop: 30 }}>
          <div className="page-main-body">
            {/* Tender Section */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? 'দরপত্র, নিলাম ও নিয়োগ বিজ্ঞপ্তি' : 'Tender Notices, Auctions & Recruitment'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'সরকারি, আধাসরকারি, স্বায়ত্তশাসিত প্রতিষ্ঠান, ব্যাংক এবং বেসরকারি কর্পোরেট প্রতিষ্ঠানের যেকোনো ধরনের দরপত্র (Tender), ই-জিপি বিজ্ঞপ্তি, নিলাম বিজ্ঞপ্তি ও নিয়োগ বিজ্ঞপ্তি বিশেষ গুরুত্বের সাথে ডিজিটাল ও ই-পেপার সংস্করণে প্রকাশ করা হয়।'
                  : 'Official government, bank, corporate tender notices, e-GP tender announcements, and recruitment publications are featured prominently.'}
              </p>
              <ul className="custom-check-list">
                <li>{isBn ? 'তাৎক্ষণিক অনলাইন প্রকাশনা ও দীর্ঘস্থায়ী আর্কাইভ।' : 'Instant online publication and verifiable digital archive.'}</li>
                <li>{isBn ? 'সহজ অনুসন্ধান ও ক্যাটাগরি ফিল্টারিং সুবিধা।' : 'Indexed under verified tender categories.'}</li>
                <li>{isBn ? 'PDF দরপত্র ডকুমেন্ট ডাউনলোডের সংযুক্তি ব্যবস্থা।' : 'Full PDF attachment and downloadable tender document hosting.'}</li>
              </ul>
            </section>

            {/* Sponsored Content */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? 'স্পন্সরড আর্টিকেল ও নেটিভ অ্যাডভার্টোরিয়াল' : 'Sponsored Articles & Native Content'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'আপনার উদ্ভাবনী পণ্য বা কর্পোরেট সামাজিক দায়বদ্ধতা (CSR) কার্যক্রম নিয়ে আকর্ষণীয় ব্র্যান্ড স্টোরি বা স্পন্সরড প্রতিবেদন প্রকাশের সুযোগ রয়েছে।'
                  : 'Tell your story through beautifully crafted editorial articles, video interviews, and high-impact native feature stories.'}
              </p>
            </section>
          </div>

          {/* Contact Ad Desk */}
          <aside className="page-sidebar-col">
            <div className="page-info-card" style={{ borderTop: '3px solid var(--primary-red)' }}>
              <h3>{isBn ? 'বিজ্ঞাপন বিভাগের সাথে সরাসরি যোগাযোগ' : 'Commercial & Ad Desk'}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                {isBn
                  ? 'রেট কার্ড, বিশেষ প্যাকেজ এবং স্লট বুকিং সংক্রান্ত আলোচনার জন্য যোগাযোগ করুন:'
                  : 'For custom packages, rate negotiation, and urgent tender bookings:'}
              </p>

              <div className="info-list">
                <div className="info-row">
                  <Phone size={16} color="var(--primary-red)" />
                  <div>
                    <strong>{isBn ? 'বিজ্ঞাপন হটলাইন:' : 'Direct Hotline:'}</strong>
                    <p style={{ margin: 0 }}><a href={`tel:${settings.phone || '01936618534'}`}>{settings.phone || '01936618534'}</a></p>
                  </div>
                </div>
                <div className="info-row">
                  <Mail size={16} color="var(--primary-red)" />
                  <div>
                    <strong>{isBn ? 'বিজ্ঞাপন ইমেইল:' : 'Commercial Email:'}</strong>
                    <p style={{ margin: 0 }}><a href={`mailto:${settings.email || 'brandbiplob1234@gmail.com'}`}>{settings.email || 'brandbiplob1234@gmail.com'}</a></p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => navigateTo('/contact')}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isBn ? 'বিজ্ঞাপন ফরম পূরণ করুন' : 'Submit Inquiries'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
