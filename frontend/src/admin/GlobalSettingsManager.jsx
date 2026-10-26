import React, { useState, useEffect, useRef } from 'react';
import { useNews } from '../context/NewsContext';
import { syncModuleToMariaDb, fetchModuleFromMariaDb } from '../utils/mariaDbSync';
import { uploadImageToStorage } from '../utils/imageUploader';
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
  Zap,
  Gift,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  Share2,
  Lock,
  Palette,
  Loader2,
  Image as ImageIcon,
  Upload,
  Move
} from 'lucide-react';
import WebsiteLoadPopup from '../components/Modals/WebsiteLoadPopup';

export default function GlobalSettingsManager({ triggerSaveToast }) {
  const { settings, updateSiteSettings, adminLanguage, language, showError } = useNews();
  const isBn = (adminLanguage || language) === 'bn';

  // Active sub-tab inside Settings Manager
  const [activeSection, setActiveSection] = useState('popup');

  // Popup Preview Modal state
  const [showPopupPreview, setShowPopupPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
  const [isUploadingWatermark, setIsUploadingWatermark] = useState(false);
  const watermarkFileInputRef = useRef(null);

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
    sloganBn: settings?.sloganBn || 'জনতার কণ্ঠস্বর',
    sloganEn: settings?.sloganEn || 'Voice of the People',
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
    instagram: settings?.instagram || 'https://www.instagram.com/jonogon.newstv/',
    tiktok: settings?.tiktok || 'https://www.tiktok.com/@jonogon.newstv',
    telegram: settings?.telegram || 'https://t.me/jionogon.newstv',
    linkedin: settings?.linkedin || 'https://www.linkedin.com/',

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
    copyrightTextEn: settings?.copyrightTextEn || '© 2026 All Rights Reserved — Jonogon News',

    // 7. Top Announcement & Ad Banner Settings
    topAdEnabled: settings?.topAdBanner?.enabled ?? true,
    topAdBadgeBn: settings?.topAdBanner?.badgeBn || 'বিজ্ঞাপন ও স্পন্সর',
    topAdBadgeEn: settings?.topAdBanner?.badgeEn || 'Sponsored Banner',
    topAdHighlightBn: settings?.topAdBanner?.highlightBn || 'দেশব্যাপী ডিজিটাল প্রচারণা:',
    topAdHighlightEn: settings?.topAdBanner?.highlightEn || 'Nationwide Digital Promotion:',
    topAdMessageBn: settings?.topAdBanner?.messageBn || 'জনগণ.নিউজ-এ আপনার ব্র্যান্ড ও পণ্যের বিজ্ঞাপন দিতে আজই বুকিং করুন',
    topAdMessageEn: settings?.topAdBanner?.messageEn || 'Book your brand & business advertisements on Jonogon News today',
    topAdPhone: settings?.topAdBanner?.phone || '০১৯৩৬-৬১৮৫৩৪',
    topAdActionTextBn: settings?.topAdBanner?.actionTextBn || 'বিজ্ঞাপন রেট',
    topAdActionTextEn: settings?.topAdBanner?.actionTextEn || 'Ad Rates',
    topAdActionUrl: settings?.topAdBanner?.actionUrl || '',
    topAdAnimation: settings?.topAdBanner?.animation ?? true,

    // 8. Watermark Settings
    watermarkEnabled: settings?.watermark?.enabled ?? true,
    watermarkImageUrl: settings?.watermark?.imageUrl || '/news-card-jonogon-watermark.png',
    watermarkPosition: settings?.watermark?.position || 'bottom-full',
    watermarkScale: settings?.watermark?.scale ?? 100,
    watermarkOpacity: settings?.watermark?.opacity ?? 100,
    watermarkMargin: settings?.watermark?.margin ?? 0
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Hydrate formData from MariaDB site_settings table on mount
  useEffect(() => {
    let isMounted = true;
    const loadFromMariaDb = async () => {
      try {
        setIsLoadingFromDb(true);
        const data = await fetchModuleFromMariaDb('settings');
        if (data && data.siteSettings && isMounted) {
          const s = { ...settings, ...data.siteSettings };
          setFormData((prev) => ({
            ...prev,
            // 1. On-Load Popup Settings
            loadPopupEnabled: s?.loadPopup?.enabled ?? prev.loadPopupEnabled,
            loadPopupType: s?.loadPopup?.type || prev.loadPopupType,
            loadPopupTitleBn: s?.loadPopup?.titleBn || prev.loadPopupTitleBn,
            loadPopupTitleEn: s?.loadPopup?.titleEn || prev.loadPopupTitleEn,
            loadPopupMessageBn: s?.loadPopup?.messageBn || prev.loadPopupMessageBn,
            loadPopupMessageEn: s?.loadPopup?.messageEn || prev.loadPopupMessageEn,
            loadPopupImageUrl: s?.loadPopup?.imageUrl || prev.loadPopupImageUrl,
            loadPopupActionTextBn: s?.loadPopup?.actionTextBn || prev.loadPopupActionTextBn,
            loadPopupActionTextEn: s?.loadPopup?.actionTextEn || prev.loadPopupActionTextEn,
            loadPopupActionUrl: s?.loadPopup?.actionUrl || prev.loadPopupActionUrl,
            loadPopupFrequency: s?.loadPopup?.frequency || prev.loadPopupFrequency,
            loadPopupAutoCloseSeconds: s?.loadPopup?.autoCloseSeconds ?? prev.loadPopupAutoCloseSeconds,

            // 2. Site Identity & Branding
            siteNameBn: s?.siteNameBn || prev.siteNameBn,
            siteNameEn: s?.siteNameEn || prev.siteNameEn,
            sloganBn: s?.sloganBn || prev.sloganBn,
            sloganEn: s?.sloganEn || prev.sloganEn,
            domain: s?.domain || prev.domain,
            websiteUrl: s?.websiteUrl || prev.websiteUrl,
            logoUrl: s?.logoUrl || prev.logoUrl,
            primaryRed: s?.primaryRed || prev.primaryRed,
            darkRed: s?.darkRed || prev.darkRed,
            black: s?.black || prev.black,
            silver: s?.silver || prev.silver,

            // 3. Founder & Office Contact Info
            founderBn: s?.founderBn || prev.founderBn,
            founderEn: s?.founderEn || prev.founderEn,
            designationBn: s?.designationBn || prev.designationBn,
            designationEn: s?.designationEn || prev.designationEn,
            organization: s?.organization || prev.organization,
            phone: s?.phone || prev.phone,
            whatsapp: s?.whatsapp || prev.whatsapp,
            adPhone: s?.adPhone || prev.adPhone,
            email: s?.email || prev.email,
            adEmail: s?.adEmail || prev.adEmail,
            address: s?.address || prev.address,
            addressBn: s?.addressBn || prev.addressBn,
            addressEn: s?.addressEn || prev.addressEn,
            facebook: s?.facebook || prev.facebook,
            youtube: s?.youtube || prev.youtube,
            twitter: s?.twitter || prev.twitter,
            instagram: s?.instagram || prev.instagram,
            tiktok: s?.tiktok !== undefined ? s.tiktok : prev.tiktok,
            linkedin: s?.linkedin || prev.linkedin,
            telegram: s?.telegram || prev.telegram,

            // 4. About Us, Mission & Vision
            aboutUsBn: s?.aboutUsBn || prev.aboutUsBn,
            aboutUsEn: s?.aboutUsEn || prev.aboutUsEn,
            missionBn: s?.missionBn || prev.missionBn,
            missionEn: s?.missionEn || prev.missionEn,
            visionBn: s?.visionBn || prev.visionBn,
            visionEn: s?.visionEn || prev.visionEn,

            // 5. Advertisement Policy & Terms
            advertisementTermsBn: s?.advertisementTermsBn || prev.advertisementTermsBn,
            advertisementTermsEn: s?.advertisementTermsEn || prev.advertisementTermsEn,
            adRatesSummaryBn: s?.adRatesSummaryBn || prev.adRatesSummaryBn,
            adRatesSummaryEn: s?.adRatesSummaryEn || prev.adRatesSummaryEn,
            adPaymentInfoBn: s?.adPaymentInfoBn || prev.adPaymentInfoBn,
            adPaymentInfoEn: s?.adPaymentInfoEn || prev.adPaymentInfoEn,

            // 6. Legal Policies & Terms
            termsAndConditions: s?.termsAndConditions || prev.termsAndConditions,
            privacyPolicy: s?.privacyPolicy || prev.privacyPolicy,
            editorialPolicy: s?.editorialPolicy || prev.editorialPolicy,
            disclaimerPolicy: s?.disclaimerPolicy || prev.disclaimerPolicy,
            cookiePolicy: s?.cookiePolicy || prev.cookiePolicy,
            copyrightTextBn: s?.copyrightTextBn || prev.copyrightTextBn,
            copyrightTextEn: s?.copyrightTextEn || prev.copyrightTextEn,

            // 7. Top Announcement & Ad Banner
            topAdEnabled: s?.topAdBanner?.enabled !== undefined ? s.topAdBanner.enabled : prev.topAdEnabled,
            topAdBadgeBn: s?.topAdBanner?.badgeBn || prev.topAdBadgeBn,
            topAdBadgeEn: s?.topAdBanner?.badgeEn || prev.topAdBadgeEn,
            topAdHighlightBn: s?.topAdBanner?.highlightBn || prev.topAdHighlightBn,
            topAdHighlightEn: s?.topAdBanner?.highlightEn || prev.topAdHighlightEn,
            topAdMessageBn: s?.topAdBanner?.messageBn || prev.topAdMessageBn,
            topAdMessageEn: s?.topAdBanner?.messageEn || prev.topAdMessageEn,
            topAdPhone: s?.topAdBanner?.phone || prev.topAdPhone,
            topAdActionTextBn: s?.topAdBanner?.actionTextBn || prev.topAdActionTextBn,
            topAdActionTextEn: s?.topAdBanner?.actionTextEn || prev.topAdActionTextEn,
            topAdActionUrl: s?.topAdBanner?.actionUrl || prev.topAdActionUrl,
            topAdAnimation: s?.topAdBanner?.animation !== undefined ? s.topAdBanner.animation : prev.topAdAnimation,

            // 8. Watermark Settings
            watermarkEnabled: s?.watermark?.enabled !== undefined ? s.watermark.enabled : prev.watermarkEnabled,
            watermarkImageUrl: s?.watermark?.imageUrl || prev.watermarkImageUrl,
            watermarkPosition: s?.watermark?.position || prev.watermarkPosition,
            watermarkScale: s?.watermark?.scale !== undefined ? s.watermark.scale : prev.watermarkScale,
            watermarkOpacity: s?.watermark?.opacity !== undefined ? s.watermark.opacity : prev.watermarkOpacity,
            watermarkMargin: s?.watermark?.margin !== undefined ? s.watermark.margin : prev.watermarkMargin
          }));
        }
      } catch (e) {
        // ignore
      } finally {
        if (isMounted) setIsLoadingFromDb(false);
      }
    };
    loadFromMariaDb();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);

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
      tiktok: formData.tiktok,
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
      copyrightTextEn: formData.copyrightTextEn,

      // Top Announcement & Ad Banner
      topAdBanner: {
        enabled: Boolean(formData.topAdEnabled),
        badgeBn: formData.topAdBadgeBn,
        badgeEn: formData.topAdBadgeEn,
        highlightBn: formData.topAdHighlightBn,
        highlightEn: formData.topAdHighlightEn,
        messageBn: formData.topAdMessageBn,
        messageEn: formData.topAdMessageEn,
        phone: formData.topAdPhone,
        actionTextBn: formData.topAdActionTextBn,
        actionTextEn: formData.topAdActionTextEn,
        actionUrl: formData.topAdActionUrl,
        animation: Boolean(formData.topAdAnimation)
      },

      // 8. Watermark Configuration
      watermark: {
        enabled: Boolean(formData.watermarkEnabled),
        imageUrl: formData.watermarkImageUrl || '/news-card-jonogon-watermark.png',
        position: formData.watermarkPosition || 'bottom-full',
        scale: parseInt(formData.watermarkScale, 10) || 100,
        opacity: parseInt(formData.watermarkOpacity, 10) || 100,
        margin: parseInt(formData.watermarkMargin, 10) || 0
      }
    };

    try {
      // 1. Direct sync to MariaDB site_settings table
      const res = await syncModuleToMariaDb('settings', updatedSettings);

      // 2. Hydrate global NewsContext and localStorage
      updateSiteSettings(updatedSettings);

      if (res && res.success) {
        if (typeof triggerSaveToast === 'function') {
          triggerSaveToast(isBn ? 'সমস্ত গ্লোবাল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'All global settings saved successfully!');
        }
      } else {
        if (typeof triggerSaveToast === 'function') {
          triggerSaveToast(isBn ? 'গ্লোবাল সেটিংস আপডেট সম্পন্ন!' : 'Global settings updated successfully!');
        }
      }
    } catch (err) {
      console.error('Settings save error:', err);
      showError(isBn ? 'সেটিংস সংরক্ষণে সমস্যা হয়েছে।' : 'Error saving settings.');
    } finally {
      setIsSaving(false);
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

  const handleWatermarkFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingWatermark(true);
      const uploadedUrl = await uploadImageToStorage(file, {
        slug: 'news-watermark-logo',
        skipWatermark: true,
        silent: false
      });
      if (uploadedUrl) {
        handleChange('watermarkImageUrl', uploadedUrl);
        if (typeof triggerSaveToast === 'function') {
          triggerSaveToast(isBn ? 'নতুন ওয়াটারমার্ক ছবি সফলভাবে আপলোড হয়েছে!' : 'New watermark image uploaded successfully!');
        }
      }
    } catch (err) {
      console.error('Watermark upload error:', err);
      showError(isBn ? 'ওয়াটারমার্ক আপলোড করতে সমস্যা হয়েছে।' : 'Error uploading watermark image.');
    } finally {
      setIsUploadingWatermark(false);
      if (watermarkFileInputRef.current) watermarkFileInputRef.current.value = '';
    }
  };

  const handleResetWatermark = () => {
    handleChange('watermarkImageUrl', '/news-card-jonogon-watermark.png');
    handleChange('watermarkPosition', 'bottom-full');
    handleChange('watermarkScale', 100);
    handleChange('watermarkOpacity', 100);
    handleChange('watermarkMargin', 0);
    if (typeof triggerSaveToast === 'function') {
      triggerSaveToast(isBn ? 'ডিফল্ট ওয়াটারমার্ক সেটিংস পুনরুদ্ধার করা হয়েছে!' : 'Default watermark settings restored!');
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
      id: 'watermark',
      labelBn: 'ওয়াটারমার্ক নিয়ন্ত্রণ',
      labelEn: 'Watermark Settings',
      icon: ImageIcon,
      badge: formData.watermarkEnabled ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Disabled')
    },
    {
      id: 'topBanner',
      labelBn: 'শীর্ষ ব্যানার ও অ্যানিমেশন',
      labelEn: 'Top Ad Banner & Anim',
      icon: Megaphone,
      badge: formData.topAdEnabled ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Disabled')
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
          disabled={isSaving}
          className="admin-btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px',
            fontSize: '0.95rem',
            fontWeight: 800,
            borderRadius: 6,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.75 : 1
          }}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving to DB...') : (isBn ? 'সব সেটিংস সংরক্ষণ করুন' : 'Save All Settings')}</span>
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
            TAB: TOP ANNOUNCEMENT & AD BANNER (BOOM-BOOM / POP-UP)
            ======================================================== */}
        {activeSection === 'topBanner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Master Controls Card */}
            <div className="admin-card" style={{ border: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Megaphone size={20} color="var(--primary-red)" />
                    <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      {isBn ? 'শীর্ষ বিজ্ঞাপন ও ঘোষণা ব্যানার (Boom-Boom Pop-Up)' : 'Top Announcement & Ad Banner'}
                    </h2>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    {isBn
                      ? 'ওয়েবসাইটের একদম উপরে (হেডারের শীর্ষে) প্রদর্শিত বিজ্ঞাপন স্ট্রিপ, যোগাযোগ ও Boom-Boom স্মুথ অ্যানিমেশন নিয়ন্ত্রণ করুন।'
                      : 'Manage top announcement banner, advertising copy, contact hotline, and smooth Boom-Boom / Pop-up animations.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {/* Boom-Boom Animation Toggle */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      padding: '8px 14px',
                      borderRadius: 6,
                      backgroundColor: formData.topAdAnimation ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-subtle)',
                      border: `1px solid ${formData.topAdAnimation ? '#3B82F6' : 'var(--border-color)'}`,
                      color: formData.topAdAnimation ? '#3B82F6' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.topAdAnimation}
                      onChange={(e) => handleChange('topAdAnimation', e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <span>{formData.topAdAnimation ? (isBn ? 'Boom-Boom অ্যানিমেশন চালু' : 'Boom-Boom Anim Active') : (isBn ? 'অ্যানিমেশন বন্ধ' : 'Anim Disabled')}</span>
                  </label>

                  {/* Banner Master Enable/Disable Toggle */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      padding: '8px 14px',
                      borderRadius: 6,
                      backgroundColor: formData.topAdEnabled ? 'rgba(22, 163, 74, 0.12)' : 'var(--bg-subtle)',
                      border: `1px solid ${formData.topAdEnabled ? '#16A34A' : 'var(--border-color)'}`,
                      color: formData.topAdEnabled ? '#16A34A' : 'var(--text-muted)',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.topAdEnabled}
                      onChange={(e) => handleChange('topAdEnabled', e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <span>{formData.topAdEnabled ? (isBn ? 'ব্যানার সক্রিয়' : 'Banner Enabled') : (isBn ? 'ব্যানার বন্ধ' : 'Banner Disabled')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Live Interactive Mini-Preview */}
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 12 }}>
                {isBn ? 'লাইভ প্রিভিউ (ওয়েবসাইটে যেমন দেখাবে)' : 'Live Preview (As seen on site)'}
              </h3>
              <div
                style={{
                  backgroundColor: 'var(--primary-red)',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  flexWrap: 'wrap',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(230, 0, 18, 0.25)'
                }}
              >
                {formData.topAdAnimation && <div className="sliding-ad-shimmer-sweep" aria-hidden="true" />}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: '1 1 auto' }}>
                  <div
                    className={formData.topAdAnimation ? 'anim-boom-boom-pulse' : ''}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.25)',
                      padding: '3px 10px',
                      borderRadius: 4,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Megaphone size={13} />
                    <span>{formData.topAdBadgeBn || 'বিজ্ঞাপন ও স্পন্সর'}</span>
                  </div>

                  <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                    {formData.topAdHighlightBn || 'দেশব্যাপী ডিজিটাল প্রচারণা:'}
                  </span>

                  <span style={{ fontSize: '0.86rem', opacity: 0.95 }}>
                    {formData.topAdMessageBn || 'জনগণ.নিউজ-এ আপনার ব্র্যান্ড ও পণ্যের বিজ্ঞাপন দিতে আজই বুকিং করুন'}
                  </span>

                  {formData.topAdPhone && (
                    <div
                      className={formData.topAdAnimation ? 'anim-pop-float' : ''}
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: 'var(--primary-red)',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        padding: '3px 10px',
                        borderRadius: 20,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <Phone size={12} />
                      <span>{formData.topAdPhone}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    className={formData.topAdAnimation ? 'anim-cta-glow' : ''}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.28)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: 4,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>{formData.topAdActionTextBn || 'বিজ্ঞাপন রেট'}</span>
                    <ExternalLink size={11} />
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Copy & Text Fields */}
            <div className="admin-card">
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>
                {isBn ? 'ব্যানার টেক্সট ও তথ্য সম্পাদনা' : 'Banner Content & Info'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'লেফট ব্যাজ টেক্সট (বাংলা)' : 'Left Badge Text (Bangla)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.topAdBadgeBn}
                    onChange={(e) => handleChange('topAdBadgeBn', e.target.value)}
                    placeholder="বিজ্ঞাপন ও স্পন্সর"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Left Badge Text (English)' : 'Left Badge Text (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.topAdBadgeEn}
                    onChange={(e) => handleChange('topAdBadgeEn', e.target.value)}
                    placeholder="Sponsored Banner"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'হাইলাইট শিরোনাম / ট্যাগ (বাংলা)' : 'Highlight Lead Text (Bangla)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.topAdHighlightBn}
                    onChange={(e) => handleChange('topAdHighlightBn', e.target.value)}
                    placeholder="দেশব্যাপী ডিজিটাল প্রচারণা:"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Highlight Lead Text (English)' : 'Highlight Lead Text (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.topAdHighlightEn}
                    onChange={(e) => handleChange('topAdHighlightEn', e.target.value)}
                    placeholder="Nationwide Digital Promotion:"
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 14 }}>
                <label className="admin-label">{isBn ? 'প্রধান বিজ্ঞাপন / প্রচার বার্তা (বাংলা)' : 'Main Announcement Message (Bangla)'}</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.topAdMessageBn}
                  onChange={(e) => handleChange('topAdMessageBn', e.target.value)}
                  placeholder="জনগণ.নিউজ-এ আপনার ব্র্যান্ড ও পণ্যের বিজ্ঞাপন দিতে আজই বুকিং করুন"
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 14 }}>
                <label className="admin-label">{isBn ? 'Main Announcement Message (English)' : 'Main Announcement Message (English)'}</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.topAdMessageEn}
                  onChange={(e) => handleChange('topAdMessageEn', e.target.value)}
                  placeholder="Book your brand & business advertisements on Jonogon News today"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'বিজ্ঞাপন হটলাইন / মোবাইল নম্বর' : 'Hotline / Phone Number'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.topAdPhone}
                    onChange={(e) => handleChange('topAdPhone', e.target.value)}
                    placeholder="০১৯৩৬-৬১৮৫৩৪"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'বাটন লেবেল (বাংলা)' : 'Button Label (Bangla)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.topAdActionTextBn}
                    onChange={(e) => handleChange('topAdActionTextBn', e.target.value)}
                    placeholder="বিজ্ঞাপন রেট"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'বাটন গন্তব্য লিংক / URL' : 'Button Destination URL'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.topAdActionUrl}
                    onChange={(e) => handleChange('topAdActionUrl', e.target.value)}
                    placeholder="/advertisement বা https://..."
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

            {/* Social Media Links Management */}
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fa-solid fa-share-nodes" style={{ color: 'var(--primary-red)' }}></i>
                  <span>{isBn ? 'সোশ্যাল মিডিয়া পেজ ও চ্যানেল লিংক ব্যবস্থাপনা' : 'Social Media Links Management'}</span>
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 6 }}>
                  {isBn ? 'যে লিংকটি ফাঁকা রাখবেন, ভিজিটর প্যানেলে সেটি স্বয়ংক্রিয়ভাবে লুকানো থাকবে' : 'Leave empty to hide any platform from visitors'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {/* Facebook */}
                <div className="admin-form-group">
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-brands fa-facebook" style={{ color: '#1877F2' }}></i>
                    <span>Facebook Page URL</span>
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://facebook.com/..."
                    value={formData.facebook || ''}
                    onChange={(e) => handleChange('facebook', e.target.value)}
                  />
                </div>

                {/* YouTube */}
                <div className="admin-form-group">
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-brands fa-youtube" style={{ color: '#FF0000' }}></i>
                    <span>YouTube Channel URL</span>
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://youtube.com/@..."
                    value={formData.youtube || ''}
                    onChange={(e) => handleChange('youtube', e.target.value)}
                  />
                </div>

                {/* Instagram */}
                <div className="admin-form-group">
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-brands fa-instagram" style={{ color: '#E1306C' }}></i>
                    <span>Instagram Profile URL</span>
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://instagram.com/..."
                    value={formData.instagram || ''}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                  />
                </div>

                {/* TikTok */}
                <div className="admin-form-group">
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-brands fa-tiktok" style={{ color: '#FE2C55' }}></i>
                    <span>TikTok Profile URL</span>
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://www.tiktok.com/@..."
                    value={formData.tiktok || ''}
                    onChange={(e) => handleChange('tiktok', e.target.value)}
                  />
                </div>

                {/* Telegram */}
                <div className="admin-form-group">
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-brands fa-telegram" style={{ color: '#229ED9' }}></i>
                    <span>Telegram Channel / Group URL</span>
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://t.me/..."
                    value={formData.telegram || ''}
                    onChange={(e) => handleChange('telegram', e.target.value)}
                  />
                </div>

                {/* LinkedIn */}
                <div className="admin-form-group">
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-brands fa-linkedin" style={{ color: '#0A66C2' }}></i>
                    <span>LinkedIn Company / Profile URL</span>
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://linkedin.com/..."
                    value={formData.linkedin || ''}
                    onChange={(e) => handleChange('linkedin', e.target.value)}
                  />
                </div>

                {/* X / Twitter */}
                <div className="admin-form-group">
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-brands fa-x-twitter" style={{ color: 'var(--text-primary)' }}></i>
                    <span>X / Twitter URL</span>
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://x.com/..."
                    value={formData.twitter || ''}
                    onChange={(e) => handleChange('twitter', e.target.value)}
                  />
                </div>

                {/* WhatsApp */}
                <div className="admin-form-group">
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }}></i>
                    <span>WhatsApp Contact / Channel</span>
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="01936618534 বা https://wa.me/..."
                    value={formData.whatsapp || ''}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
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

        {/* ========================================================
            TAB: WATERMARK MANAGEMENT (CHANGE, SIZE, POSITION)
            ======================================================== */}
        {activeSection === 'watermark' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Master Toggle & Overview Card */}
            <div className="admin-card" style={{ border: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <ImageIcon size={20} color="var(--primary-red)" />
                    <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      {isBn ? 'ছবিতে অফিসিয়াল ওয়াটারমার্ক নিয়ন্ত্রণ (Watermark Settings)' : 'Official Image Watermark Settings'}
                    </h2>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    {isBn
                      ? 'ওয়েবসাইটে নতুন খবর বা কনটেন্টে ছবি আপলোড করার সময় স্বয়ংক্রিয়ভাবে অফিসিয়াল ওয়াটারমার্ক যুক্ত হবে। এখান থেকে ওয়াটারমার্ক ছবি পরিবর্তন, সাইজ স্কেল এবং পজিশন নিয়ন্ত্রণ করতে পারবেন।'
                      : 'Automatically embed official watermark onto images uploaded for news articles. Customize watermark image, scale size, alignment position, and opacity.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleResetWatermark}
                    className="admin-btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.85rem' }}
                    title={isBn ? 'ডিফল্ট ওয়াটারমার্কে ফিরে যান' : 'Reset to Default Watermark'}
                  >
                    <RotateCcw size={15} />
                    <span>{isBn ? 'ডিফল্ট রিস্টোর' : 'Reset Default'}</span>
                  </button>

                  {/* Enable/Disable Toggle */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: formData.watermarkEnabled ? 'rgba(230,0,18,0.1)' : 'var(--bg-secondary)',
                      border: formData.watermarkEnabled ? '1px solid var(--primary-red)' : '1px solid var(--border-color)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.watermarkEnabled}
                      onChange={(e) => handleChange('watermarkEnabled', e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary-red)' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: formData.watermarkEnabled ? 'var(--primary-red)' : 'var(--text-muted)' }}>
                      {formData.watermarkEnabled ? (isBn ? 'ওয়াটারমার্ক সক্রিয়' : 'Watermark Active') : (isBn ? 'ওয়াটারমার্ক বন্ধ' : 'Watermark Disabled')}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Two-Column Grid: Left Controls, Right Live Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
              
              {/* Left Column: Image, Position & Size Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                
                {/* 1. Watermark Image Selector & File Upload */}
                <div className="admin-card">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Upload size={18} color="var(--primary-red)" />
                    <span>{isBn ? '১. ওয়াটারমার্ক ছবি পরিবর্তন' : '1. Watermark Image Asset'}</span>
                  </h3>

                  {/* Hidden file input */}
                  <input
                    ref={watermarkFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleWatermarkFileUpload}
                    style={{ display: 'none' }}
                  />

                  {/* Current Image Display & Upload Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: 12,
                      borderRadius: 8,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      marginBottom: 14
                    }}
                  >
                    <div
                      style={{
                        width: 90,
                        height: 50,
                        background: '#1a1a1a',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: 4,
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {formData.watermarkImageUrl ? (
                        <img
                          src={formData.watermarkImageUrl}
                          alt="Watermark Thumbnail"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = '/news-card-jonogon-watermark.png';
                          }}
                        />
                      ) : (
                        <ImageIcon size={24} color="#888" />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                        {isBn ? 'বর্তমান ওয়াটারমার্ক ফাইল:' : 'Current Watermark Path:'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formData.watermarkImageUrl || '/news-card-jonogon-watermark.png'}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isUploadingWatermark}
                      onClick={() => watermarkFileInputRef.current && watermarkFileInputRef.current.click()}
                      className="admin-btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        cursor: isUploadingWatermark ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isUploadingWatermark ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                      <span>{isUploadingWatermark ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'নতুন ছবি আপলোড' : 'Upload New')}</span>
                    </button>
                  </div>

                  {/* Manual URL Input */}
                  <div className="admin-form-group">
                    <label className="admin-label">{isBn ? 'অথবা ওয়াটারমার্ক ইমেজ URL লিখুন' : 'Or Custom Watermark Image URL'}</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="/news-card-jonogon-watermark.png"
                      value={formData.watermarkImageUrl}
                      onChange={(e) => handleChange('watermarkImageUrl', e.target.value)}
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                      {isBn
                        ? 'পিএনজি (PNG) বা স্বচ্ছ ব্যাকগ্রাউন্ডের (Transparent PNG / WebP) ছবি ব্যবহার করলে সবচেয়ে সুন্দর ও প্রফেশনাল দেখায়।'
                        : 'Transparent PNG or WebP logo banners provide the best visual output.'}
                    </small>
                  </div>
                </div>

                {/* 2. Watermark Position Controls */}
                <div className="admin-card">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Move size={18} color="var(--primary-red)" />
                    <span>{isBn ? '২. ওয়াটারমার্ক পজিশন (Position)' : '2. Watermark Alignment Position'}</span>
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      {
                        id: 'bottom-full',
                        titleBn: 'নিচে পুরো ব্যানার (ডিফল্ট)',
                        titleEn: 'Bottom Full Width (Default)',
                        descBn: 'ছবির পুরো প্রস্থ জুড়ে নিচে ব্যানার ওয়াটারমার্ক'
                      },
                      {
                        id: 'bottom-center',
                        titleBn: 'নিচে মাঝে',
                        titleEn: 'Bottom Center',
                        descBn: 'ছবির নিচের অংশের মাঝখানে লোগো'
                      },
                      {
                        id: 'bottom-right',
                        titleBn: 'নিচে ডানে',
                        titleEn: 'Bottom Right',
                        descBn: 'ছবির নিচের ডান কোণে'
                      },
                      {
                        id: 'bottom-left',
                        titleBn: 'নিচে বামে',
                        titleEn: 'Bottom Left',
                        descBn: 'ছবির নিচের বাম কোণে'
                      },
                      {
                        id: 'top-right',
                        titleBn: 'উপরে ডানে',
                        titleEn: 'Top Right',
                        descBn: 'ছবির উপরের ডান কোণে'
                      },
                      {
                        id: 'top-left',
                        titleBn: 'উপরে বামে',
                        titleEn: 'Top Left',
                        descBn: 'ছবির উপরের বাম কোণে'
                      },
                      {
                        id: 'center',
                        titleBn: 'ছবির কেন্দ্রবিন্দু',
                        titleEn: 'Center (Middle)',
                        descBn: 'ছবির ঠিক মাঝখানে'
                      }
                    ].map((pos) => {
                      const isSelected = formData.watermarkPosition === pos.id;
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => handleChange('watermarkPosition', pos.id)}
                          style={{
                            textAlign: 'left',
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: isSelected ? 'rgba(230,0,18,0.08)' : 'var(--bg-secondary)',
                            border: isSelected ? '2px solid var(--primary-red)' : '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            transition: 'all 0.18s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? 'var(--primary-red)' : 'var(--text-primary)' }}>
                              {isBn ? pos.titleBn : pos.titleEn}
                            </span>
                            {isSelected && <CheckCircle size={15} color="var(--primary-red)" />}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {pos.descBn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Watermark Size / Scale & Opacity Controls */}
                <div className="admin-card">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sliders size={18} color="var(--primary-red)" />
                    <span>{isBn ? '৩. সাইজ স্কেল ও ভিজিবিলিটি' : '3. Size Scale & Visibility'}</span>
                  </h3>

                  {/* Size Scale Slider */}
                  <div className="admin-form-group" style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="admin-label" style={{ margin: 0 }}>
                        {isBn ? 'ওয়াটারমার্ক সাইজ (Scale):' : 'Watermark Scale:'}
                      </label>
                      <span style={{ fontWeight: 800, color: 'var(--primary-red)', fontSize: '1rem' }}>
                        {formData.watermarkScale}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      step="5"
                      value={formData.watermarkScale}
                      onChange={(e) => handleChange('watermarkScale', parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: 'var(--primary-red)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {[50, 75, 100, 125].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleChange('watermarkScale', preset)}
                          className="admin-btn-secondary"
                          style={{
                            padding: '3px 10px',
                            fontSize: '0.75rem',
                            fontWeight: formData.watermarkScale === preset ? 800 : 500,
                            borderColor: formData.watermarkScale === preset ? 'var(--primary-red)' : undefined,
                            color: formData.watermarkScale === preset ? 'var(--primary-red)' : undefined
                          }}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  <div className="admin-form-group" style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="admin-label" style={{ margin: 0 }}>
                        {isBn ? 'ওয়াটারমার্ক স্বচ্ছতা (Opacity):' : 'Opacity:'}
                      </label>
                      <span style={{ fontWeight: 800, color: 'var(--primary-red)', fontSize: '1rem' }}>
                        {formData.watermarkOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={formData.watermarkOpacity}
                      onChange={(e) => handleChange('watermarkOpacity', parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: 'var(--primary-red)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {[30, 50, 75, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleChange('watermarkOpacity', preset)}
                          className="admin-btn-secondary"
                          style={{
                            padding: '3px 10px',
                            fontSize: '0.75rem',
                            fontWeight: formData.watermarkOpacity === preset ? 800 : 500,
                            borderColor: formData.watermarkOpacity === preset ? 'var(--primary-red)' : undefined,
                            color: formData.watermarkOpacity === preset ? 'var(--primary-red)' : undefined
                          }}
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Margin Slider */}
                  <div className="admin-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="admin-label" style={{ margin: 0 }}>
                        {isBn ? 'প্রান্তিক দূরত্ব / মার্জিন (Margin):' : 'Edge Margin / Padding:'}
                      </label>
                      <span style={{ fontWeight: 800, color: 'var(--primary-red)', fontSize: '1rem' }}>
                        {formData.watermarkMargin}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={formData.watermarkMargin}
                      onChange={(e) => handleChange('watermarkMargin', parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: 'var(--primary-red)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {[0, 10, 20, 30].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleChange('watermarkMargin', preset)}
                          className="admin-btn-secondary"
                          style={{
                            padding: '3px 10px',
                            fontSize: '0.75rem',
                            fontWeight: formData.watermarkMargin === preset ? 800 : 500,
                            borderColor: formData.watermarkMargin === preset ? 'var(--primary-red)' : undefined,
                            color: formData.watermarkMargin === preset ? 'var(--primary-red)' : undefined
                          }}
                        >
                          {preset}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Interactive Real-Time Live Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="admin-card" style={{ position: 'sticky', top: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Eye size={18} color="var(--primary-red)" />
                      <span>{isBn ? 'লাইভ প্রিভিউ (Live Preview)' : 'Real-Time Watermark Preview'}</span>
                    </h3>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: formData.watermarkEnabled ? '#10b981' : '#6b7280',
                        color: '#fff',
                        fontWeight: 700
                      }}
                    >
                      {formData.watermarkEnabled ? (isBn ? 'লাইভ সক্রিয়' : 'Enabled') : (isBn ? 'বন্ধ' : 'Disabled')}
                    </span>
                  </div>

                  {/* Simulated 16:9 News Image Container with Watermark */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '2px solid var(--border-color)',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
                      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Background Sample Photo Mock */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 50% 40%, rgba(59,130,246,0.2), transparent 70%), linear-gradient(to bottom, #1e293b, #0f172a)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.85rem',
                        userSelect: 'none',
                        pointerEvents: 'none'
                      }}
                    >
                      <ImageIcon size={44} style={{ opacity: 0.35, marginBottom: 8 }} />
                      <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                        {isBn ? 'সংবাদের নমুনা ছবি (Sample News Image)' : 'Sample 16:9 News Photo'}
                      </span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: 4 }}>
                        {isBn ? 'আসল ছবি আপলোডের সময় ওয়াটারমার্ক ঠিক এভাবে বসবে' : 'Watermark will be embedded exactly like this on upload'}
                      </span>
                    </div>

                    {/* Watermark Rendering in Preview */}
                    {formData.watermarkEnabled && formData.watermarkImageUrl && (
                      <div
                        style={{
                          position: 'absolute',
                          pointerEvents: 'none',
                          zIndex: 10,
                          transition: 'all 0.2s ease',
                          opacity: Math.max(0.1, formData.watermarkOpacity / 100),
                          ...(formData.watermarkPosition === 'bottom-full'
                            ? {
                                bottom: `${formData.watermarkMargin}px`,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: `${formData.watermarkScale}%`,
                                maxWidth: '100%',
                                display: 'flex',
                                justifyContent: 'center'
                              }
                            : formData.watermarkPosition === 'bottom-center'
                            ? {
                                bottom: `${formData.watermarkMargin}px`,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: `${Math.round(40 * (formData.watermarkScale / 100))}%`,
                                maxWidth: '90%',
                                display: 'flex',
                                justifyContent: 'center'
                              }
                            : formData.watermarkPosition === 'bottom-right'
                            ? {
                                bottom: `${formData.watermarkMargin}px`,
                                right: `${formData.watermarkMargin}px`,
                                width: `${Math.round(40 * (formData.watermarkScale / 100))}%`,
                                maxWidth: '90%'
                              }
                            : formData.watermarkPosition === 'bottom-left'
                            ? {
                                bottom: `${formData.watermarkMargin}px`,
                                left: `${formData.watermarkMargin}px`,
                                width: `${Math.round(40 * (formData.watermarkScale / 100))}%`,
                                maxWidth: '90%'
                              }
                            : formData.watermarkPosition === 'top-right'
                            ? {
                                top: `${formData.watermarkMargin}px`,
                                right: `${formData.watermarkMargin}px`,
                                width: `${Math.round(40 * (formData.watermarkScale / 100))}%`,
                                maxWidth: '90%'
                              }
                            : formData.watermarkPosition === 'top-left'
                            ? {
                                top: `${formData.watermarkMargin}px`,
                                left: `${formData.watermarkMargin}px`,
                                width: `${Math.round(40 * (formData.watermarkScale / 100))}%`,
                                maxWidth: '90%'
                              }
                            : formData.watermarkPosition === 'center'
                            ? {
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: `${Math.round(40 * (formData.watermarkScale / 100))}%`,
                                maxWidth: '90%'
                              }
                            : {
                                bottom: `${formData.watermarkMargin}px`,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: `${formData.watermarkScale}%`,
                                maxWidth: '100%'
                              })
                        }}
                      >
                        <img
                          src={formData.watermarkImageUrl}
                          alt="Watermark Overlay"
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.target.src = '/news-card-jonogon-watermark.png';
                          }}
                        />
                      </div>
                    )}

                    {!formData.watermarkEnabled && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          gap: 8
                        }}
                      >
                        <Lock size={18} />
                        <span>{isBn ? 'ওয়াটারমার্ক বর্তমানে নিষ্ক্রিয় রয়েছে' : 'Watermark is Currently Disabled'}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary Status Badges */}
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      background: 'var(--bg-secondary)',
                      borderRadius: 6,
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>{isBn ? 'পজিশন নির্বাচন:' : 'Position:'}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formData.watermarkPosition}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>{isBn ? 'স্কেল সাইজ:' : 'Scale Size:'}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formData.watermarkScale}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>{isBn ? 'স্বচ্ছতা (Opacity):' : 'Opacity:'}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formData.watermarkOpacity}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>{isBn ? 'মার্জিন:' : 'Margin:'}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formData.watermarkMargin}px</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="admin-btn-primary"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        borderRadius: 6,
                        cursor: isSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'ওয়াটারমার্ক সেটিংস সংরক্ষণ করুন' : 'Save Watermark Settings')}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Global Save Button at Bottom */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button
            type="submit"
            disabled={isSaving}
            className="admin-btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: 6,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.75 : 1
            }}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving to DB...') : (isBn ? 'সব গ্লোবাল সেটিংস সংরক্ষণ করুন' : 'Save All Global Settings')}</span>
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
