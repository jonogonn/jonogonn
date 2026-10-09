import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { uploadImageToStorage } from '../utils/imageUploader';
import {
  DollarSign,
  Upload,
  Image as ImageIcon,
  Save,
  CheckCircle,
  Trash2,
  ExternalLink,
  Code,
  Eye,
  Check,
  Sliders,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const MASTER_AD_SLOTS = [
  {
    id: 'tickerBottomBanner',
    nameBn: 'ব্রেকিং হেডলাইনের নিচে ব্যানার',
    nameEn: 'Below Breaking Ticker Banner',
    dimension: '970 × 90 px',
    ratio: '970/90',
    location: 'হোমপেজ — ব্রেকিং নিউজের নিচে ফুল-উইডথ ব্যানার'
  },
  {
    id: 'afterLatestBanner',
    nameBn: 'তাজা সংবাদের পরে ব্যানার',
    nameEn: 'After Latest News Banner',
    dimension: '970 × 90 px',
    ratio: '970/90',
    location: 'হোমপেজ — তাজা সংবাদের স্ক্রলার সেকশনের পরে'
  },
  {
    id: 'midContentBanner',
    nameBn: 'মিড-কন্টেন্ট ব্যানার',
    nameEn: 'Mid-Content In-Stream Banner',
    dimension: '970 × 90 px',
    ratio: '970/90',
    location: 'হোমপেজ সাব-গ্রুপ ও নিউজ বিস্তারিত পেজ বডি'
  },
  {
    id: 'leadSidebarAd',
    nameBn: 'সাইডবার স্কয়ার ব্যানার',
    nameEn: 'Sidebar Medium Rectangle',
    dimension: '300 × 250 px',
    ratio: '300/250',
    location: 'হোমপেজ লিড সাইডবার ও সংবাদ পেজ সাইডবার'
  },
  {
    id: 'videoSidebarAd',
    nameBn: 'স্টিকি হাফ-পেজ সাইডবার ব্যানার',
    nameEn: 'Sticky Half-Page Sidebar Banner',
    dimension: '300 × 600 px',
    ratio: '300/600',
    location: 'সংবাদ বিস্তারিত পেজ লম্বা স্টিকি সাইডবার'
  },
  {
    id: 'afterVideoBanner',
    nameBn: 'ভিডিও ও রেমিট্যান্স সেকশনের পরে',
    nameEn: 'After Video & Remittance Section',
    dimension: '970 × 90 px',
    ratio: '970/90',
    location: 'হোমপেজ — প্রবাসী যোদ্ধা ও ভিডিও সেকশনের পরে'
  },
  {
    id: 'afterDistrictBanner',
    nameBn: 'জেলা সংবাদ ও পডকাস্টের পরে',
    nameEn: 'After District & Podcast Section',
    dimension: '970 × 90 px',
    ratio: '970/90',
    location: 'হোমপেজ — আমার জেলা ও পডকাস্ট সেকশনের পরে'
  },
  {
    id: 'topHeaderBanner',
    nameBn: 'ক্যাটাগরি পেজ হেডার ব্যানার',
    nameEn: 'Category Page Top Leaderboard',
    dimension: '728 × 90 px',
    ratio: '728/90',
    location: 'ক্যাটাগরি পেজের শীর্ষে লিডারবোর্ড ব্যানার'
  },
  {
    id: 'bottomBanner',
    nameBn: 'ফুটার বটম ব্যানার',
    nameEn: 'Footer Bottom Banner',
    dimension: '970 × 90 px',
    ratio: '970/90',
    location: 'হোমপেজ ও প্রতিটি পেজের ফুটারের ঠিক উপরে'
  }
];

export default function AdsManager({ triggerSaveToast }) {
  const { settings, updateSiteSettings, adminLanguage, language, showSuccess, showError } = useNews();
  const isBn = (adminLanguage || language) === 'bn';

  // State: Ad Slots Configuration
  const [adSlots, setAdSlots] = useState(() => {
    const initial = {};
    MASTER_AD_SLOTS.forEach((slot) => {
      const existing = settings.adSlots?.[slot.id] || {};
      initial[slot.id] = {
        enabled: existing.enabled !== false,
        mode: existing.mode || (existing.code ? 'code' : 'image'),
        imageUrl: existing.imageUrl || '',
        targetUrl: existing.targetUrl || '',
        altText: existing.altText || slot.nameBn,
        code: existing.code || '',
        fallbackText: existing.fallbackText || slot.nameBn
      };
    });
    return initial;
  });

  // State: AdSense Client ID
  const [adsenseClientId, setAdsenseClientId] = useState(settings.adsenseClientId || '');
  const [adSenseEnabled, setAdSenseEnabled] = useState(settings.adSenseEnabled !== false);

  // Uploading state per slot
  const [uploadingSlot, setUploadingSlot] = useState(null);

  // Active slot tab filter
  const [activeSlotId, setActiveSlotId] = useState(MASTER_AD_SLOTS[0].id);

  // Handle direct file upload for a slot
  const handleFileUpload = async (slotId, file) => {
    if (!file) return;
    try {
      setUploadingSlot(slotId);
      const cdnUrl = await uploadImageToStorage(file, 'advertisements');
      setAdSlots((prev) => ({
        ...prev,
        [slotId]: {
          ...prev[slotId],
          imageUrl: cdnUrl,
          mode: 'image',
          enabled: true
        }
      }));
      if (triggerSaveToast) {
        triggerSaveToast(isBn ? 'ব্যানার ছবি সফলভাবে আপলোড হয়েছে!' : 'Banner image uploaded successfully!');
      }
    } catch (err) {
      console.error('Ad image upload error:', err);
      if (showError) showError(isBn ? 'ছবি আপলোড ব্যর্থ হয়েছে।' : 'Failed to upload image.');
    } finally {
      setUploadingSlot(null);
    }
  };

  // Save all advertisement settings
  const handleSaveAll = () => {
    updateSiteSettings({
      adSenseEnabled,
      adsenseClientId,
      adSlots
    });

    if (triggerSaveToast) {
      triggerSaveToast(isBn ? 'সকল বিজ্ঞাপন ও ব্যানার সেটিংস সংরক্ষিত হয়েছে!' : 'All ad settings saved successfully!');
    }

    if (showSuccess) {
      showSuccess(
        isBn
          ? 'ওয়েবসাইটের ব্যানার ও বিজ্ঞাপন কনফিগারেশন সফলভাবে আপডেট করা হয়েছে।'
          : 'Website advertisement and banner configuration updated successfully.',
        isBn ? 'বিজ্ঞাপন সেটিংস সংরক্ষণ সম্পন্ন' : 'Settings Saved'
      );
    }
  };

  // Calculate stats
  const activeCount = Object.values(adSlots).filter((s) => s.enabled && (s.imageUrl || s.code)).length;
  const imageCount = Object.values(adSlots).filter((s) => s.enabled && s.imageUrl && s.mode === 'image').length;

  const currentSlot = MASTER_AD_SLOTS.find((s) => s.id === activeSlotId) || MASTER_AD_SLOTS[0];
  const currentConfig = adSlots[currentSlot.id] || {};

  return (
    <div className="admin-card ads-manager-root">
      {/* Top Banner Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(230, 0, 18, 0.12)', color: 'var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {isBn ? 'ব্যানার ও বিজ্ঞাপন ব্যবস্থাপনা' : 'Ads & Banner Management'}
              </h1>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                {isBn
                  ? 'গুগল এডসেন্স আসার পূর্ব পর্যন্ত নিজের ব্যানার ছবি আপলোড করুন ও লিংক সেট করুন।'
                  : 'Upload your own banner images with custom links until Google AdSense arrives.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <button
          type="button"
          onClick={handleSaveAll}
          className="admin-btn-primary"
          style={{ padding: '10px 22px', fontSize: '0.92rem', fontWeight: 800 }}
        >
          <Save size={18} />
          <span>{isBn ? 'বিজ্ঞাপন সেটিংস সংরক্ষণ করুন' : 'Save All Ad Settings'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div style={{ padding: 14, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {isBn ? 'মোট বিজ্ঞাপন স্লট' : 'Total Ad Slots'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>
            {MASTER_AD_SLOTS.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{isBn ? 'টি' : 'spots'}</span>
          </div>
        </div>

        <div style={{ padding: 14, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ color: '#10B981', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {isBn ? 'লাইভ সক্রিয় বিজ্ঞাপন' : 'Active Live Ads'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10B981', marginTop: 4 }}>
            {activeCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{isBn ? 'টি সক্রিয়' : 'active'}</span>
          </div>
        </div>

        <div style={{ padding: 14, borderRadius: 10, backgroundColor: 'rgba(230, 0, 18, 0.08)', border: '1px solid rgba(230, 0, 18, 0.25)' }}>
          <div style={{ color: 'var(--primary-red)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {isBn ? 'নিজস্ব ইমেজ ব্যানার' : 'Custom Image Banners'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-red)', marginTop: 4 }}>
            {imageCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{isBn ? 'টি সেট করা' : 'configured'}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Slot Selector (Left) & Active Slot Editor (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 20 }}>
        {/* Left Column: All Slots List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 620, overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>
            {isBn ? 'বিজ্ঞাপন স্লটসমূহ নির্বাচন করুন' : 'Select Ad Placement'}
          </div>

          {MASTER_AD_SLOTS.map((slot) => {
            const cfg = adSlots[slot.id] || {};
            const isSelected = activeSlotId === slot.id;
            const hasActiveAd = cfg.enabled && (cfg.imageUrl || cfg.code);

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setActiveSlotId(slot.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 8,
                  textAlign: 'left',
                  border: isSelected ? '1px solid var(--primary-red)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'rgba(230, 0, 18, 0.1)' : 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ minWidth: 0, paddingRight: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? 'var(--primary-red)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isBn ? slot.nameBn : slot.nameEn}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {slot.dimension}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {hasActiveAd ? (
                    <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontWeight: 800 }}>
                      {isBn ? 'সক্রিয়' : 'LIVE'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: 12, backgroundColor: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {isBn ? 'খালি' : 'EMPTY'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Slot Detail Editor */}
        <div style={{ padding: 22, borderRadius: 12, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          {/* Slot Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {isBn ? currentSlot.nameBn : currentSlot.nameEn}
                </h3>
                <span style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: 4, backgroundColor: 'rgba(230, 0, 18, 0.12)', color: 'var(--primary-red)', fontWeight: 800 }}>
                  {currentSlot.dimension}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {currentSlot.location}
              </p>
            </div>

            {/* Slot Toggle Switch */}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.86rem', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={currentConfig.enabled !== false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAdSlots((prev) => ({
                    ...prev,
                    [currentSlot.id]: {
                      ...prev[currentSlot.id],
                      enabled: checked
                    }
                  }));
                }}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-red)', cursor: 'pointer' }}
              />
              <span style={{ color: currentConfig.enabled !== false ? '#10B981' : 'var(--text-muted)' }}>
                {currentConfig.enabled !== false ? (isBn ? 'স্লট চালু' : 'Enabled') : (isBn ? 'স্লট বন্ধ' : 'Disabled')}
              </span>
            </label>
          </div>

          {/* Ad Format Selector: Custom Image vs AdSense Code */}
          <div style={{ marginBottom: 20 }}>
            <label className="admin-label" style={{ marginBottom: 8, display: 'block' }}>
              {isBn ? 'বিজ্ঞাপনের ফরম্যাট নির্বাচন করুন:' : 'Select Ad Format:'}
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setAdSlots((prev) => ({
                    ...prev,
                    [currentSlot.id]: { ...prev[currentSlot.id], mode: 'image' }
                  }));
                }}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: currentConfig.mode === 'image' ? '2px solid var(--primary-red)' : '1px solid var(--border-color)',
                  backgroundColor: currentConfig.mode === 'image' ? 'rgba(230, 0, 18, 0.12)' : 'var(--bg-subtle)',
                  color: currentConfig.mode === 'image' ? 'var(--primary-red)' : 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <ImageIcon size={18} />
                <span>{isBn ? '🖼️ কাস্টম ব্যানার ছবি (আপলোড করুন)' : '🖼️ Custom Image Banner'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdSlots((prev) => ({
                    ...prev,
                    [currentSlot.id]: { ...prev[currentSlot.id], mode: 'code' }
                  }));
                }}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: currentConfig.mode === 'code' ? '2px solid var(--primary-red)' : '1px solid var(--border-color)',
                  backgroundColor: currentConfig.mode === 'code' ? 'rgba(230, 0, 18, 0.12)' : 'var(--bg-subtle)',
                  color: currentConfig.mode === 'code' ? 'var(--primary-red)' : 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Code size={18} />
                <span>{isBn ? '⚡ Google AdSense / স্ক্রিপ্ট কোড' : '⚡ AdSense / Script Code'}</span>
              </button>
            </div>
          </div>

          {/* Form Content 1: Custom Image Banner Mode */}
          {currentConfig.mode === 'image' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Banner Image Preview / Upload Box */}
              <div>
                <label className="admin-label">
                  {isBn ? `ব্যানার ছবি (${currentSlot.dimension}):` : `Banner Image (${currentSlot.dimension}):`}
                </label>

                {currentConfig.imageUrl ? (
                  <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', padding: 10, textAlign: 'center' }}>
                    <img
                      src={currentConfig.imageUrl}
                      alt="Banner Preview"
                      style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 6, objectFit: 'contain', display: 'inline-block' }}
                    />
                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 10 }}>
                      <label style={{ cursor: 'pointer', padding: '6px 14px', borderRadius: 6, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Upload size={14} />
                        <span>{isBn ? 'ছবি পরিবর্তন করুন' : 'Change Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(currentSlot.id, e.target.files?.[0])}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setAdSlots((prev) => ({
                            ...prev,
                            [currentSlot.id]: { ...prev[currentSlot.id], imageUrl: '' }
                          }));
                        }}
                        style={{ padding: '6px 14px', borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.82rem', fontWeight: 700, color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                        <span>{isBn ? 'ছবি মুছুন' : 'Remove Image'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '36px 20px',
                      borderRadius: 10,
                      border: '2px dashed var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(230, 0, 18, 0.12)', color: 'var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      <Upload size={22} />
                    </div>
                    <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {uploadingSlot === currentSlot.id
                        ? (isBn ? 'ক্লাউড স্টোরেজে আপলোড হচ্ছে...' : 'Uploading to cloud storage...')
                        : (isBn ? 'ব্যানার ছবি আপলোড করতে ক্লিক করুন' : 'Click to Upload Banner Image')}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {isBn ? `সুপারিশকৃত সাইজ: ${currentSlot.dimension} (WebP, JPG, PNG বা GIF)` : `Recommended size: ${currentSlot.dimension} (WebP, JPG, PNG or GIF)`}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(currentSlot.id, e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>

              {/* Image Direct URL Input */}
              <div className="admin-form-group">
                <label className="admin-label">{isBn ? 'অথবা সরাসরি ছবির লিঙ্ক (Image URL):' : 'Or Direct Image URL:'}</label>
                <input
                  type="url"
                  className="admin-input"
                  placeholder="https://..."
                  value={currentConfig.imageUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAdSlots((prev) => ({
                      ...prev,
                      [currentSlot.id]: { ...prev[currentSlot.id], imageUrl: val }
                    }));
                  }}
                />
              </div>

              {/* Target Click Link URL */}
              <div className="admin-form-group">
                <label className="admin-label">
                  {isBn ? 'বিজ্ঞাপনে ক্লিক করলে যে ওয়েবসাইটে যাবে (Target Link):' : 'Click Target URL (Opens in new tab):'}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://advertiser-website.com"
                    value={currentConfig.targetUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAdSlots((prev) => ({
                        ...prev,
                        [currentSlot.id]: { ...prev[currentSlot.id], targetUrl: val }
                      }));
                    }}
                  />
                  {currentConfig.targetUrl && (
                    <a
                      href={currentConfig.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn-secondary"
                      style={{ padding: '0 14px', display: 'flex', alignItems: 'center' }}
                      title="লিঙ্ক টেস্ট করুন"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Banner Alt / Title */}
              <div className="admin-form-group">
                <label className="admin-label">{isBn ? 'ব্যানার শিরোনাম / অল্টার টেক্সট:' : 'Banner Alt Title:'}</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="স্পন্সরড বিজ্ঞাপন"
                  value={currentConfig.altText || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAdSlots((prev) => ({
                      ...prev,
                      [currentSlot.id]: { ...prev[currentSlot.id], altText: val }
                    }));
                  }}
                />
              </div>
            </div>
          )}

          {/* Form Content 2: Google AdSense / Script Code Mode */}
          {currentConfig.mode === 'code' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-form-group">
                <label className="admin-label">{isBn ? 'AdSense বা কাস্টম HTML স্ক্রিপ্ট কোড:' : 'AdSense HTML / Script Snippet:'}</label>
                <textarea
                  className="admin-textarea"
                  rows={6}
                  placeholder={`<ins class="adsbygoogle"\n  style="display:block"\n  data-ad-client="${adsenseClientId || 'ca-pub-XXXXXXXXXXXXXXXX'}"\n  data-ad-slot="1234567890"\n  data-ad-format="auto"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`}
                  value={currentConfig.code || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAdSlots((prev) => ({
                      ...prev,
                      [currentSlot.id]: { ...prev[currentSlot.id], code: val }
                    }));
                  }}
                  style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}
                />
              </div>
            </div>
          )}

          {/* Save Action for Current Slot */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={handleSaveAll}
              className="admin-btn-primary"
              style={{ padding: '9px 24px', fontSize: '0.9rem', fontWeight: 800 }}
            >
              <Save size={16} />
              <span>{isBn ? 'এই স্লট ও সকল পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
