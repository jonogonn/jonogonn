import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import {
  Sliders,
  Bell,
  Globe,
  Phone,
  Users,
  Megaphone,
  FileText,
  Save,
  Eye,
  RotateCcw,
  Sparkles,
  Zap,
  Gift,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  Share2,
  Lock,
  Palette
} from 'lucide-react';
import WebsiteLoadPopup from '../components/Modals/WebsiteLoadPopup';

export default function GlobalSettingsManager({ triggerSaveToast }) {
  const { settings, updateSiteSettings, adminLanguage, language, showError } = useNews();
  const isBn = (adminLanguage || language) === 'bn';

  // Active sub-tab inside Settings Manager
  const [activeSection, setActiveSection] = useState('popup');

  // Popup Preview Modal state
  const [showPopupPreview, setShowPopupPreview] = useState(false);

  // Form local state initialized with current settings and safe fallbacks
  const [formData, setFormData] = useState({
    // 1. On-Load Popup Settings
    loadPopupEnabled: settings?.loadPopup?.enabled ?? false,
    loadPopupType: settings?.loadPopup?.type || 'notice',
    loadPopupTitleBn: settings?.loadPopup?.titleBn || 'জনগণ.নিউজ-এ আপনাকে স্বাগতম',
    loadPopupTitleEn: settings?.loadPopup?.titleEn || 'Welcome to Jonogon News',
    loadPopupMessageBn: settings?.loadPopup?.messageBn || 'সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত ডিজিটাল মাধ্যম। দেশ-বিদেশের ব্রেকিং নিউজ এবং গভীর বিশ্লেষণের সাথে থাকুন।',
    loadPopupMessageEn: settings?.loadPopup?.messageEn || 'Your trusted digital source for authentic journalism, ground reporting and real-time updates.',
    loadPopupImageUrl: settings?.loadPopup?.imageUrl || '',
    loadPopupActionTextBn: settings?.loadPopup?.actionTextBn || 'বিস্তারিত জানুন',
    loadPopupActionTextEn: settings?.loadPopup?.actionTextEn || 'Learn More',
    loadPopupActionUrl: settings?.loadPopup?.actionUrl || '',
    loadPopupFrequency: settings?.loadPopup?.frequency || 'once_per_session',
    loadPopupAutoCloseSeconds: settings?.loadPopup?.autoCloseSeconds ?? 0,

    // 2. Site Identity & Branding
    siteNameBn: settings?.siteNameBn || 'জনগণ.নিউজ',
    siteNameEn: settings?.siteNameEn || 'Jonogon News',
    sloganBn: settings?.sloganBn || 'সত্যের সাথে, জনতার পাশে',
    sloganEn: settings?.sloganEn || 'With Truth, Standing for the People',
    domain: settings?.domain || 'jonogon.news',
    websiteUrl: settings?.websiteUrl || 'https://jonogon.news',
    logoUrl: settings?.logoUrl || '/logo.svg',
    primaryRed: settings?.primaryRed || '#E60012',
    darkRed: settings?.darkRed || '#A8000D',
    black: settings?.black || '#111111',
    silver: settings?.silver || '#D9D9D9',

    // 3. Founder & Office Contact Info
    founderBn: settings?.founderBn || 'মোঃ বিপ্লব হোসেন',
    founderEn: settings?.founderEn || 'Md. Biplob Hossain',
    designationBn: settings?.designationBn || 'স্বত্বাধিকারী ও সম্পাদক',
    designationEn: settings?.designationEn || 'Owner & Editor',
    organization: settings?.organization || 'Jonogon News',
    phone: settings?.phone || '01936618534',
    whatsapp: settings?.whatsapp || '01936618534',
    adPhone: settings?.adPhone || '01936618534',
    email: settings?.email || 'brandbiplob1234@gmail.com',
    adEmail: settings?.adEmail || 'brandbiplob1234@gmail.com',
    address: settings?.address || 'House 101, Alia Madrasa Road, Faydabad, Dakshinkhan, Dhaka-1230',
    addressBn: settings?.addressBn || 'বাড়ি ১০১, আলিয়া মাদ্রাসা রোড, ফায়দাবাদ, দক্ষিণখান, ঢাকা-১২৩০',
    addressEn: settings?.addressEn || 'House 101, Alia Madrasa Road, Faydabad, Dakshinkhan, Dhaka-1230',
    facebook: settings?.facebook || 'https://www.facebook.com/jonogon.newstv/',
    youtube: settings?.youtube || 'https://www.youtube.com/@jonogon.newstv',
    twitter: settings?.twitter || 'https://twitter.com/jonogonnews',
    instagram: settings?.instagram || 'https://instagram.com/jonogonnews',
    linkedin: settings?.linkedin || 'https://linkedin.com/company/jonogonnews',
    telegram: settings?.telegram || 'https://t.me/jonogonnews',

    // 4. About Us, Mission & Vision
    aboutUsBn: settings?.aboutUsBn || '',
    aboutUsEn: settings?.aboutUsEn || '',
    missionBn: settings?.missionBn || '',
    missionEn: settings?.missionEn || '',
    visionBn: settings?.visionBn || '',
    visionEn: settings?.visionEn || '',

    // 5. Advertisement Policy & Terms
    advertisementTermsBn: settings?.advertisementTermsBn || '',
    advertisementTermsEn: settings?.advertisementTermsEn || '',
    adRatesSummaryBn: settings?.adRatesSummaryBn || '',
    adRatesSummaryEn: settings?.adRatesSummaryEn || '',
    adPaymentInfoBn: settings?.adPaymentInfoBn || '',
    adPaymentInfoEn: settings?.adPaymentInfoEn || '',

    // 6. Legal Policies & Terms
    termsAndConditions: settings?.termsAndConditions || '',
    privacyPolicy: settings?.privacyPolicy || '',
    editorialPolicy: settings?.editorialPolicy || '',
    disclaimerPolicy: settings?.disclaimerPolicy || '',
    cookiePolicy: settings?.cookiePolicy || '',
    copyrightTextBn: settings?.copyrightTextBn || '© ২০২৬ সর্বস্বত্ব সংরক্ষিত — জনগণ.নিউজ | Jonogon News',
    copyrightTextEn: settings?.copyrightTextEn || '© 2026 All Rights Reserved — Jonogon News'
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = (e) => {
    if (e) e.preventDefault();

    const updatedSettings = {
      ...settings,
      siteNameBn: formData.siteNameBn,
      siteNameEn: formData.siteNameEn,
      sloganBn: formData.sloganBn,
      sloganEn: formData.sloganEn,
      domain: formData.domain,
      websiteUrl: formData.websiteUrl,
      logoUrl: formData.logoUrl,
      primaryRed: formData.primaryRed,
      darkRed: formData.darkRed,
      black: formData.black,
      silver: formData.silver,

      founderBn: formData.founderBn,
      founderEn: formData.founderEn,
      designationBn: formData.designationBn,
      designationEn: formData.designationEn,
      organization: formData.organization,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      adPhone: formData.adPhone,
      email: formData.email,
      adEmail: formData.adEmail,
      address: formData.address,
      addressBn: formData.addressBn,
      addressEn: formData.addressEn,
      facebook: formData.facebook,
      youtube: formData.youtube,
      twitter: formData.twitter,
      instagram: formData.instagram,
      linkedin: formData.linkedin,
      telegram: formData.telegram,

      // On-Load Popup Settings
      loadPopup: {
        enabled: Boolean(formData.loadPopupEnabled),
        type: formData.loadPopupType,
        titleBn: formData.loadPopupTitleBn,
        titleEn: formData.loadPopupTitleEn,
        messageBn: formData.loadPopupMessageBn,
        messageEn: formData.loadPopupMessageEn,
        imageUrl: formData.loadPopupImageUrl,
        actionTextBn: formData.loadPopupActionTextBn,
        actionTextEn: formData.loadPopupActionTextEn,
        actionUrl: formData.loadPopupActionUrl,
        frequency: formData.loadPopupFrequency,
        autoCloseSeconds: parseInt(formData.loadPopupAutoCloseSeconds, 10) || 0
      },

      aboutUsBn: formData.aboutUsBn,
      aboutUsEn: formData.aboutUsEn,
      missionBn: formData.missionBn,
      missionEn: formData.missionEn,
      visionBn: formData.visionBn,
      visionEn: formData.visionEn,

      advertisementTermsBn: formData.advertisementTermsBn,
      advertisementTermsEn: formData.advertisementTermsEn,
      adRatesSummaryBn: formData.adRatesSummaryBn,
      adRatesSummaryEn: formData.adRatesSummaryEn,
      adPaymentInfoBn: formData.adPaymentInfoBn,
      adPaymentInfoEn: formData.adPaymentInfoEn,

      termsAndConditions: formData.termsAndConditions,
      privacyPolicy: formData.privacyPolicy,
      editorialPolicy: formData.editorialPolicy,
      disclaimerPolicy: formData.disclaimerPolicy,
      cookiePolicy: formData.cookiePolicy,
      copyrightTextBn: formData.copyrightTextBn,
      copyrightTextEn: formData.copyrightTextEn
    };

    updateSiteSettings(updatedSettings);
    if (typeof triggerSaveToast === 'function') {
      triggerSaveToast(isBn ? 'সমস্ত গ্লোবাল সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!' : 'All global settings saved successfully!');
    }
  };

  const previewPopupData = {
    enabled: true,
    type: formData.loadPopupType,
    titleBn: formData.loadPopupTitleBn,
    titleEn: formData.loadPopupTitleEn,
    messageBn: formData.loadPopupMessageBn,
    messageEn: formData.loadPopupMessageEn,
    imageUrl: formData.loadPopupImageUrl,
    actionTextBn: formData.loadPopupActionTextBn,
    actionTextEn: formData.loadPopupActionTextEn,
    actionUrl: formData.loadPopupActionUrl,
    frequency: formData.loadPopupFrequency,
    autoCloseSeconds: formData.loadPopupAutoCloseSeconds
  };

  const resetPopupSeenSession = () => {
    sessionStorage.removeItem('jonogon_load_popup_session_seen');
    localStorage.removeItem('jonogon_load_popup_day_seen');
    if (typeof triggerSaveToast === 'function') {
      triggerSaveToast(isBn ? 'পপআপ টেস্ট হিস্ট্রি রিসেট হয়েছে! ওয়েবসাইট রিফ্রেশ দিলে দেখতে পাবেন।' : 'Popup view history reset! Refresh website to see.');
    }
  };

  const navTabs = [
    {
      id: 'popup',
      labelBn: 'লোড পপআপ',
      labelEn: 'On-Load Popup',
      icon: Bell,
      badge: formData.loadPopupEnabled ? (isBn ? 'সক্রিয়' : 'Active') : null
    },
    {
      id: 'general',
      labelBn: 'ব্র্যান্ডিং ও পরিচিতি',
      labelEn: 'Branding & Identity',
      icon: Globe
    },
    {
      id: 'contact',
      labelBn: 'যোগাযোগ ও সম্পাদক',
      labelEn: 'Contact & Editor',
      icon: Phone
    },
    {
      id: 'about',
      labelBn: 'আমাদের সম্পর্কে',
      labelEn: 'About Us & Mission',
      icon: Users
    },
    {
      id: 'advertisement',
      labelBn: 'বিজ্ঞাপন ও বাণিজ্যিক শর্ত',
      labelEn: 'Advertisement Terms',
      icon: Megaphone
    },
    {
      id: 'policies',
      labelBn: 'আইনি নীতিমালা ও শর্ত',
      labelEn: 'Policies & Legal',
      icon: FileText
    }
  ];

  return (
    <div className="global-settings-manager-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Title Card */}
      <div
        className="admin-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          padding: '20px 24px',
          borderLeft: '4px solid var(--primary-red)'
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.7rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--text-main)',
              margin: 0
            }}
          >
            <Sliders size={26} color="var(--primary-red)" />
            <span>{isBn ? 'গ্লোবাল ওয়েবসাইট সেটিংস ও কন্ট্রোল সেন্টার' : 'Global Website Settings & Master Control'}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '6px 0 0 0', maxWidth: 840 }}>
            {isBn
              ? 'ওয়েবসাইট লোড পপআপ, ব্র্যান্ডিং, আমাদের সম্পর্কে, বিজ্ঞাপন নীতিমালা, যোগাযোগের ঠিকানা ও সমস্ত আইনি পেজের বিবরণ এখান থেকে পরিচালনা করুন।'
              : 'Configure website load popups, brand identity, about us, advertising policies, contact info and all legal terms from one unified dashboard.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="admin-btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px',
            fontSize: '0.95rem',
            fontWeight: 800,
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          <Save size={18} />
          <span>{isBn ? 'সব সেটিংস সংরক্ষণ করুন' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Sub-Tabs Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                borderBottom: isActive ? '2px solid var(--primary-red)' : '1px solid transparent',
                backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--primary-red)' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{isBn ? tab.labelBn : tab.labelEn}</span>
              {tab.badge && (
                <span
                  style={{
                    backgroundColor: '#16A34A',
                    color: '#fff',
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: 10,
                    fontWeight: 800
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSaveAll}>
        {/* ========================================================
            TAB 1: WEBSITE ON-LOAD POPUP SETTINGS
            ======================================================== */}
        {activeSection === 'popup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Master Toggle & Preview Trigger Card */}
            <div className="admin-card" style={{ border: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Bell size={20} color="var(--primary-red)" />
                    <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      {isBn ? 'ওয়েবসাইট ভিজিট পপআপ নোটিশ (Website Load Popup)' : 'Website On-Load Popup Modal'}
                    </h2>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    {isBn
                      ? 'পাঠক ওয়েবসাইট ভিজিট করলে স্ক্রিনে বিশেষ ঘোষণা, জরুরি ব্রেকিং, বিজ্ঞাপন বা ওয়েলকাম বার্তা প্রদর্শন করুন।'
                      : 'Display automatic announcement, breaking flash, special ad offer, or welcome dialog when visitors enter the website.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowPopupPreview(true)}
                    className="admin-btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.85rem' }}
                    title={isBn ? 'পপআপটি দেখতে কেমন লাগবে প্রিভিউ করুন' : 'Preview Modal'}
                  >
                    <Eye size={16} />
                    <span>{isBn ? 'লাইভ প্রিভিউ দেখুন' : 'Live Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetPopupSeenSession}
                    className="admin-btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.85rem' }}
                    title={isBn ? 'ব্রাউজার হিস্ট্রি রিসেট করুন' : 'Reset Seen Status'}
                  >
                    <RotateCcw size={15} />
                    <span>{isBn ? 'টেস্ট হিস্ট্রি রিসেট' : 'Reset Test Seen'}</span>
                  </button>

                  {/* Enable/Disable Toggle */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      padding: '8px 14px',
                      borderRadius: 6,
                      backgroundColor: formData.loadPopupEnabled ? 'rgba(22, 163, 74, 0.12)' : 'var(--bg-subtle)',
                      border: `1px solid ${formData.loadPopupEnabled ? '#16A34A' : 'var(--border-color)'}`,
                      color: formData.loadPopupEnabled ? '#16A34A' : 'var(--text-muted)',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.loadPopupEnabled}
                      onChange={(e) => handleChange('loadPopupEnabled', e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <span>{formData.loadPopupEnabled ? (isBn ? 'পপআপ চালু আছে' : 'Popup Enabled') : (isBn ? 'পপআপ বন্ধ' : 'Popup Disabled')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Popup Configuration Form */}
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-sliders" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'পপআপ কনফিগারেশন ও বিষয়বস্তু' : 'Popup Content & Triggers'}</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
                {/* Popup Type */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'পপআপ ধরন / ক্যাটাগরি *' : 'Popup Type / Category *'}</label>
                  <select
                    className="admin-select"
                    value={formData.loadPopupType}
                    onChange={(e) => handleChange('loadPopupType', e.target.value)}
                  >
                    <option value="notice">{isBn ? 'বিশেষ বিজ্ঞপ্তি / নোটিশ' : 'Special Notice / Announcement'}</option>
                    <option value="breaking">{isBn ? 'জরুরি ব্রেকিং এলার্ট' : 'Breaking News Alert'}</option>
                    <option value="ad">{isBn ? 'স্পন্সরড বিজ্ঞাপন / বিশেষ অফার' : 'Sponsored Ad / Promotional Offer'}</option>
                    <option value="welcome">{isBn ? 'ওয়েলকাম ও পরিচিতি বার্তা' : 'Welcome Greeting'}</option>
                  </select>
                </div>

                {/* Frequency */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'প্রদর্শনের পৌনঃপুনিকতা (Frequency) *' : 'Display Frequency *'}</label>
                  <select
                    className="admin-select"
                    value={formData.loadPopupFrequency}
                    onChange={(e) => handleChange('loadPopupFrequency', e.target.value)}
                  >
                    <option value="once_per_session">{isBn ? 'একবার প্রতি ব্রাউজার সেশনে (Once per Session)' : 'Once per browser session (Recommended)'}</option>
                    <option value="once_per_day">{isBn ? 'প্রতিদিন একবার (Once per 24h Day)' : 'Once per 24 hours'}</option>
                    <option value="every_visit">{isBn ? 'প্রতিবার পেজ লোডে (Every Page Visit)' : 'Every page load'}</option>
                  </select>
                </div>

                {/* Auto Close Timer */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'স্বয়ংক্রিয় বন্ধের টাইমার (সেকেন্ড)' : 'Auto-Close Timer (Seconds)'}</label>
                  <select
                    className="admin-select"
                    value={formData.loadPopupAutoCloseSeconds}
                    onChange={(e) => handleChange('loadPopupAutoCloseSeconds', parseInt(e.target.value, 10))}
                  >
                    <option value={0}>{isBn ? 'বন্ধ হবে না (ইউজার ম্যানুয়ালি ক্লোজ করবেন)' : 'No Auto-Close (Manual Dismiss Only)'}</option>
                    <option value={5}>৫ সেকেন্ড পর বন্ধ হবে (5 seconds)</option>
                    <option value={10}>১০ সেকেন্ড পর বন্ধ হবে (10 seconds)</option>
                    <option value={15}>১৫ সেকেন্ড পর বন্ধ হবে (15 seconds)</option>
                  </select>
                </div>
              </div>

              {/* Titles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'পপআপ শিরোনাম (বাংলা) *' : 'Popup Title (Bangla) *'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="পপআপের মূল শিরোনাম লিখুন..."
                    value={formData.loadPopupTitleBn}
                    onChange={(e) => handleChange('loadPopupTitleBn', e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Popup Title (English)' : 'Popup Title (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Popup headline in English..."
                    value={formData.loadPopupTitleEn}
                    onChange={(e) => handleChange('loadPopupTitleEn', e.target.value)}
                  />
                </div>
              </div>

              {/* Image Banner Upload & URL */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="admin-label" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-solid fa-image" style={{ color: 'var(--primary-red)' }}></i>
                    <span>{isBn ? 'ব্যানার ছবি / পোস্টার আপলোড (ঐচ্ছিক)' : 'Banner Image / Poster Upload (Optional)'}</span>
                  </label>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {isBn ? 'সুপারিশকৃত সাইজ: ৮০০×৪৫০ পিক্সেল (১৬:৯ অনুপাত)' : 'Recommended: 800x450px (16:9)'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Upload from device */}
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 6,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--primary-red)' }}></i>
                    <span>{isBn ? 'ছবি আপলোড করুন' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            showError(
                              isBn ? 'ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে। অনুগ্রহ করে ছোট সাইজের ছবি নির্বাচন করুন।' : 'Image size must be less than 5MB. Please choose a smaller file.',
                              isBn ? 'ছবির সাইজ সীমা অতিক্রম করেছে' : 'File Size Limit Exceeded'
                            );
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              handleChange('loadPopupImageUrl', ev.target.result);
                              if (triggerSaveToast) triggerSaveToast(isBn ? 'ছবি সফলভাবে লোড হয়েছে!' : 'Image loaded successfully!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{isBn ? 'অথবা URL:' : 'or URL:'}</span>

                  {/* Direct Image URL input */}
                  <input
                    type="text"
                    className="admin-input"
                    style={{ flex: 1, minWidth: 200 }}
                    placeholder={isBn ? 'https://images.unsplash.com/... বা ছবির সরাসরি লিংক' : 'https://... or direct image URL'}
                    value={formData.loadPopupImageUrl}
                    onChange={(e) => handleChange('loadPopupImageUrl', e.target.value)}
                  />

                  {/* Remove Image Button */}
                  {formData.loadPopupImageUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('loadPopupImageUrl', '')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        backgroundColor: 'rgba(230, 0, 18, 0.08)',
                        border: '1px solid rgba(230, 0, 18, 0.2)',
                        color: 'var(--primary-red)',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      title={isBn ? 'ছবি মুছে ফেলুন' : 'Remove Image'}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      <span>{isBn ? 'ছবি মুছুন' : 'Remove'}</span>
                    </button>
                  )}
                </div>

                {/* Image Live Preview */}
                {formData.loadPopupImageUrl && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      display: 'inline-flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {isBn ? 'পপআপ ব্যানার প্রিভিউ:' : 'Popup Banner Live Preview:'}
                    </div>
                    <img
                      src={formData.loadPopupImageUrl}
                      alt="Banner Preview"
                      style={{
                        maxHeight: 140,
                        maxWidth: 320,
                        borderRadius: 6,
                        border: '1px solid var(--border-color)',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Messages */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'বিস্তারিত বার্তা / বিবরণ (বাংলা)' : 'Message Content (Bangla)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    placeholder="পাঠকদের জন্য বিস্তারিত নোটিশ বা মেসেজ লিখুন..."
                    value={formData.loadPopupMessageBn}
                    onChange={(e) => handleChange('loadPopupMessageBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Message Content (English)' : 'Message Content (English)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    placeholder="Detailed message or notice for visitors..."
                    value={formData.loadPopupMessageEn}
                    onChange={(e) => handleChange('loadPopupMessageEn', e.target.value)}
                  />
                </div>
              </div>

              {/* Action Button & Link */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'অ্যাকশন বাটন টেক্সট (বাংলা)' : 'Action Button Text (Bangla)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="যেমন: বিস্তারিত জানুন"
                    value={formData.loadPopupActionTextBn}
                    onChange={(e) => handleChange('loadPopupActionTextBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Action Button Text (English)' : 'Action Button Text (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Learn More"
                    value={formData.loadPopupActionTextEn}
                    onChange={(e) => handleChange('loadPopupActionTextEn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'অ্যাকশন বাটন গন্তব্য লিংক (URL)' : 'Action Destination URL'}</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://jonogon.news/advertisement বা যেকোনো বহিঃস্থ লিংক"
                    value={formData.loadPopupActionUrl}
                    onChange={(e) => handleChange('loadPopupActionUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: BRANDING & IDENTITY
            ======================================================== */}
        {activeSection === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Colors */}
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-palette" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'সাইটের ব্র্যান্ড কালার (Zero Gradient)' : 'Site Brand Colors (Zero Gradient)'}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <label className="admin-label">Primary Red</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={formData.primaryRed}
                      onChange={(e) => handleChange('primaryRed', e.target.value)}
                      style={{ width: 44, height: 40, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.primaryRed}
                      onChange={(e) => handleChange('primaryRed', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">Dark Red</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={formData.darkRed}
                      onChange={(e) => handleChange('darkRed', e.target.value)}
                      style={{ width: 44, height: 40, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.darkRed}
                      onChange={(e) => handleChange('darkRed', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">Black Accent</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={formData.black}
                      onChange={(e) => handleChange('black', e.target.value)}
                      style={{ width: 44, height: 40, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.black}
                      onChange={(e) => handleChange('black', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">Silver/Gray Border</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={formData.silver}
                      onChange={(e) => handleChange('silver', e.target.value)}
                      style={{ width: 44, height: 40, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.silver}
                      onChange={(e) => handleChange('silver', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Portal Identity */}
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-newspaper" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'পোর্টাল নাম ও ডোমেইন তথ্য' : 'Portal Identity & URLs'}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'ওয়েবসাইট নাম (বাংলা) *' : 'Website Name (Bangla) *'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.siteNameBn}
                    onChange={(e) => handleChange('siteNameBn', e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Website Name (English)' : 'Website Name (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.siteNameEn}
                    onChange={(e) => handleChange('siteNameEn', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'স্লোগান / ট্যাগলাইন (বাংলা)' : 'Slogan / Tagline (Bangla)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.sloganBn}
                    onChange={(e) => handleChange('sloganBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Slogan / Tagline (English)' : 'Slogan / Tagline (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.sloganEn}
                    onChange={(e) => handleChange('sloganEn', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">Domain Name</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="jonogon.news"
                    value={formData.domain}
                    onChange={(e) => handleChange('domain', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Website Full URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://jonogon.news"
                    value={formData.websiteUrl}
                    onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Logo Path / URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: CONTACT & EDITOR DETAILS
            ======================================================== */}
        {activeSection === 'contact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Founder & Editor */}
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-building" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'প্রতিষ্ঠাতা ও সম্পাদকীয় কার্যালয়' : 'Founder & Editorial Leadership'}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'প্রতিষ্ঠাতা / সম্পাদক নাম (বাংলা) *' : 'Founder / Editor (Bangla) *'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.founderBn}
                    onChange={(e) => handleChange('founderBn', e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Founder / Editor (English)' : 'Founder / Editor (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.founderEn}
                    onChange={(e) => handleChange('founderEn', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'পদবি (বাংলা)' : 'Designation (Bangla)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.designationBn}
                    onChange={(e) => handleChange('designationBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Designation (English)' : 'Designation (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.designationEn}
                    onChange={(e) => handleChange('designationEn', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Phones, Emails & Addresses */}
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-phone" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'ফোন নম্বর, ইমেইল ও কার্যালয়ের ঠিকানা' : 'Phone Numbers, Emails & Addresses'}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'প্রধান মোবাইল / ফোন নম্বর' : 'Main Phone Number'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'হোয়াটসঅ্যাপ নম্বর' : 'WhatsApp Number'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'বিজ্ঞাপন ডেস্ক ফোন' : 'Ad Desk Phone'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.adPhone}
                    onChange={(e) => handleChange('adPhone', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'অফিসিয়াল সম্পাদকীয় ইমেইল' : 'Official Editorial Email'}</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'বিজ্ঞাপন ও বাণিজ্যিক ইমেইল' : 'Commercial / Ad Email'}</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={formData.adEmail}
                    onChange={(e) => handleChange('adEmail', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'কার্যালয়ের ঠিকানা (বাংলা)' : 'Office Address (Bangla)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.addressBn}
                    onChange={(e) => handleChange('addressBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Office Address (English)' : 'Office Address (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.addressEn}
                    onChange={(e) => handleChange('addressEn', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-share-nodes" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'সোশ্যাল মিডিয়া পেজ ও চ্যানেল লিংক' : 'Official Social Media Links'}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">Facebook Page URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.facebook}
                    onChange={(e) => handleChange('facebook', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">YouTube Channel URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.youtube}
                    onChange={(e) => handleChange('youtube', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">X / Twitter URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.twitter}
                    onChange={(e) => handleChange('twitter', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Instagram URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.instagram}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ABOUT US & MISSION
            ======================================================== */}
        {activeSection === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-users" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'আমাদের সম্পর্কে (About Us Story)' : 'About Us Story & Organization'}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'প্রতিষ্ঠান পরিচিতি ও ইতিহাস (বাংলা)' : 'About Us Story (Bangla)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={6}
                    value={formData.aboutUsBn}
                    onChange={(e) => handleChange('aboutUsBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'About Us Story (English)' : 'About Us Story (English)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={6}
                    value={formData.aboutUsEn}
                    onChange={(e) => handleChange('aboutUsEn', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-bullseye" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'আমাদের লক্ষ্য ও উদ্দেশ্য (Mission & Vision)' : 'Mission & Vision Statements'}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'আমাদের লক্ষ্য / মিশন (বাংলা)' : 'Our Mission (Bangla)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={formData.missionBn}
                    onChange={(e) => handleChange('missionBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Our Mission (English)' : 'Our Mission (English)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={formData.missionEn}
                    onChange={(e) => handleChange('missionEn', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'আমাদের ভিশন / ভবিষ্যৎ দর্শন (বাংলা)' : 'Our Vision (Bangla)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={formData.visionBn}
                    onChange={(e) => handleChange('visionBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Our Vision (English)' : 'Our Vision (English)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={formData.visionEn}
                    onChange={(e) => handleChange('visionEn', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: ADVERTISEMENT TERMS & RATES
            ======================================================== */}
        {activeSection === 'advertisement' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-rectangle-ad" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'বিজ্ঞাপন প্রচারের সাধারণ নীতিমালা ও শর্তাবলী' : 'Advertisement Policy & Terms'}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'বিজ্ঞাপন নীতিমালা (বাংলা)' : 'Advertisement Terms (Bangla)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={6}
                    value={formData.advertisementTermsBn}
                    onChange={(e) => handleChange('advertisementTermsBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Advertisement Terms (English)' : 'Advertisement Terms (English)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={6}
                    value={formData.advertisementTermsEn}
                    onChange={(e) => handleChange('advertisementTermsEn', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-credit-card" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'বিজ্ঞাপনের মূল্যতালিকা ও পেমেন্ট বিবরণ' : 'Ad Rates Summary & Payment Info'}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'বিজ্ঞাপন মূল্যতালিকা ও রেটকার্ড বিবরণ (বাংলা)' : 'Ad Rates Summary (Bangla)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={formData.adRatesSummaryBn}
                    onChange={(e) => handleChange('adRatesSummaryBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Ad Rates Summary (English)' : 'Ad Rates Summary (English)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={formData.adRatesSummaryEn}
                    onChange={(e) => handleChange('adRatesSummaryEn', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'পেমেন্ট ও ব্যাংকিং নির্দেশাবলী (বাংলা)' : 'Payment & Banking Instructions (Bangla)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={formData.adPaymentInfoBn}
                    onChange={(e) => handleChange('adPaymentInfoBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Payment Instructions (English)' : 'Payment Instructions (English)'}</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={formData.adPaymentInfoEn}
                    onChange={(e) => handleChange('adPaymentInfoEn', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: LEGAL POLICIES & TERMS OF SERVICE
            ======================================================== */}
        {activeSection === 'policies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-scale-balanced" style={{ color: 'var(--primary-red)' }}></i>
                <span>{isBn ? 'আইনি নীতিমালা ও ব্যবহারের শর্তাবলী' : 'Legal Policies & Terms'}</span>
              </h3>

              {/* Terms of Service */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-label">{isBn ? 'ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}</label>
                <textarea
                  className="admin-textarea"
                  rows={5}
                  value={formData.termsAndConditions}
                  onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                />
              </div>

              {/* Privacy Policy */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-label">{isBn ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy'}</label>
                <textarea
                  className="admin-textarea"
                  rows={5}
                  value={formData.privacyPolicy}
                  onChange={(e) => handleChange('privacyPolicy', e.target.value)}
                />
              </div>

              {/* Editorial Policy */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-label">{isBn ? 'সম্পাদকীয় নীতি ও ফ্যাক্ট-চেকিং (Editorial Policy)' : 'Editorial Policy'}</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  value={formData.editorialPolicy}
                  onChange={(e) => handleChange('editorialPolicy', e.target.value)}
                />
              </div>

              {/* Disclaimer */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-label">{isBn ? 'দায়মুক্তি ও দাবিত্যাগ (Disclaimer Policy)' : 'Disclaimer Policy'}</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  value={formData.disclaimerPolicy}
                  onChange={(e) => handleChange('disclaimerPolicy', e.target.value)}
                />
              </div>

              {/* Cookie Policy */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-label">{isBn ? 'কুকি ও ট্র্যাকিং নীতি (Cookie Policy)' : 'Cookie Policy'}</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  value={formData.cookiePolicy}
                  onChange={(e) => handleChange('cookiePolicy', e.target.value)}
                />
              </div>

              {/* Copyright Text */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'কপিরাইট বার্তা (বাংলা)' : 'Copyright Text (Bangla)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.copyrightTextBn}
                    onChange={(e) => handleChange('copyrightTextBn', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Copyright Text (English)' : 'Copyright Text (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.copyrightTextEn}
                    onChange={(e) => handleChange('copyrightTextEn', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button at Bottom */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button
            type="submit"
            className="admin-btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: 6
            }}
          >
            <Save size={18} />
            <span>{isBn ? 'সব গ্লোবাল সেটিংস সংরক্ষণ করুন' : 'Save All Global Settings'}</span>
          </button>
        </div>
      </form>

      {/* Interactive Popup Preview Modal */}
      {showPopupPreview && (
        <WebsiteLoadPopup
          isPreview={true}
          previewData={previewPopupData}
          onClosePreview={() => setShowPopupPreview(false)}
        />
      )}
    </div>
  );
}
