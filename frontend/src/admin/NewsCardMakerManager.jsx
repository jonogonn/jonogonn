import React, { useState, useRef } from 'react';
import { useNews } from '../context/NewsContext';
import { uploadImageToStorage } from '../utils/imageUploader';
import { generateSocialCardJpg } from '../utils/generateSocialCardJpg';
import html2canvas from 'html2canvas';
import {
  Download,
  Upload,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Type,
  Camera,
  Minus,
  Plus,
  Bookmark,
  Loader2,
  Trash2,
  Lock,
  Eye
} from 'lucide-react';

export default function NewsCardMakerManager({ triggerSaveToast }) {
  const { articles, categories, settings, adminLanguage, language, showSuccess, showError } = useNews();
  const isBn = (adminLanguage || language) === 'bn';

  // Card Content State
  const [headline, setHeadline] = useState('একবছরে গরিব জনগণ বেড়েছে প্রায় ২১ লাখ !');
  const [manualSplit, setManualSplit] = useState('');
  const [kicker, setKicker] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('জাতীয় ও নগর । বাংলাদেশ');
  const [caption, setCaption] = useState('ছবি: সংগৃহীত');
  const [dateBn, setDateBn] = useState(() => {
    return new Date().toLocaleDateString('bn-BD', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  });

  // Typography & Color Controls (Matching Screenshot Stepper)
  const [titleFontSize, setTitleFontSize] = useState(24);
  const [colorMode, setColorMode] = useState('dual'); // 'dual' | 'red' | 'blue'
  const [displayImage, setDisplayImage] = useState('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80');

  // Export & Upload State
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadingToB2, setIsUploadingToB2] = useState(false);
  const [uploadedCdnUrl, setUploadedCdnUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const cardRef = useRef(null);

  // Smart splitting for headline (Dual Color: Line 1 in Red, Line 2 in Navy Blue)
  const rawTitle = headline || 'একবছরে গরিব জনগণ বেড়েছে প্রায় ২১ লাখ !';
  let line1 = '';
  let line2 = '';

  if (manualSplit.trim()) {
    const parts = manualSplit.split('|');
    line1 = parts[0]?.trim() || '';
    line2 = parts.slice(1).join(' ').trim();
  } else if (rawTitle.includes('\n')) {
    const parts = rawTitle.split('\n');
    line1 = parts[0]?.trim() || '';
    line2 = parts.slice(1).join(' ').trim();
  } else if (rawTitle.includes('|')) {
    const parts = rawTitle.split('|');
    line1 = parts[0]?.trim() || '';
    line2 = parts.slice(1).join(' ').trim();
  } else {
    const words = rawTitle.trim().split(/\s+/);
    if (words.length <= 4) {
      line1 = rawTitle;
      line2 = '';
    } else if (words.length <= 6) {
      const splitAt = Math.max(2, words.length - 2);
      line1 = words.slice(0, splitAt).join(' ');
      line2 = words.slice(splitAt).join(' ');
    } else {
      const splitAt = Math.ceil(words.length * 0.58);
      line1 = words.slice(0, splitAt).join(' ');
      line2 = words.slice(splitAt).join(' ');
    }
  }

  // Determine line colors based on colorMode
  const getLine1Color = () => {
    if (colorMode === 'blue') return '#0B2545';
    return '#E50914'; // Bright Bold Red (default)
  };

  const getLine2Color = () => {
    if (colorMode === 'red') return '#E50914';
    return '#0B2545'; // Deep Dark Navy Blue (default)
  };

  // Reset controls to default
  const handleReset = () => {
    setTitleFontSize(24);
    setColorMode('dual');
    setManualSplit('');
  };

  // Quick Load from Existing News
  const handleSelectArticle = (articleId) => {
    setSelectedArticleId(articleId);
    const post = (articles || []).find((a) => a.id === articleId || a.postId === articleId);
    if (post) {
      setHeadline(post.titleBn || post.title || '');
      setCategoryLabel(post.cardCategory || post.categoryBn || 'জাতীয় ও নগর । বাংলাদেশ');
      if (post.imageUrl || post.featuredImage) {
        setDisplayImage(post.imageUrl || post.featuredImage);
      }
      if (post.kicker) setKicker(post.kicker);
      if (post.cardCaption) setCaption(post.cardCaption);
      if (post.dateBn) setDateBn(post.dateBn);
      setManualSplit('');
      showSuccess(isBn ? 'সংবাদের তথ্য কার্ডে লোড হয়েছে!' : 'Loaded article into card!');
    }
  };

  // Handle Image File Upload
  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showError(isBn ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন।' : 'Please select an image file.');
      return;
    }

    try {
      const tempUrl = URL.createObjectURL(file);
      setDisplayImage(tempUrl);

      const uploadedUrl = await uploadImageToStorage(file, {
        slug: `card-img-${Date.now()}`,
        caption: 'News Card Subject',
        silent: true
      });
      if (uploadedUrl) {
        setDisplayImage(uploadedUrl);
      }
    } catch (e) {
      console.warn('Image upload note:', e);
    }
  };

  // Download Card Image (Using Official 1024x1024 Canvas Generator from generateSocialCardJpg.js)
  const handleDownloadImage = async () => {
    setIsExporting(true);

    try {
      const cleanSlug = (headline || 'jonogon-news-card')
        .replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40);
      const filename = `jonogon-card-${cleanSlug}-${Date.now()}.jpg`;

      await generateSocialCardJpg({
        title: headline,
        kicker: kicker,
        imageUrl: displayImage,
        caption: caption.startsWith('ছবি') ? caption : `ছবি: ${caption}`,
        category: categoryLabel,
        dateBn: dateBn,
        titleFontSize: titleFontSize >= 35 ? titleFontSize : titleFontSize * 2,
        kickerFontSize: 26,
        lineHeight: 1.18,
        colorMode: colorMode,
        manualLineBreak: manualSplit,
        fileName: filename,
        returnBlob: false
      });

      showSuccess(isBn ? 'সোশ্যাল কার্ড ছবি ডাউনলোড সফল হয়েছে!' : 'Card image downloaded!');
      if (triggerSaveToast) triggerSaveToast(isBn ? 'কার্ড ডাউনলোড সম্পন্ন' : 'Card downloaded');
    } catch (err) {
      showError(isBn ? 'ডাউনলোডে ত্রুটি ঘটেছে: ' + err.message : 'Error generating card.');
    } finally {
      setIsExporting(false);
    }
  };

  // Upload Card to Backblaze B2 & Generate CDN Link (Using Official Canvas Generator)
  const handleUploadToB2 = async () => {
    setIsUploadingToB2(true);

    try {
      const cleanSlug = (headline || 'news-card')
        .replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40);

      const cardBlob = await generateSocialCardJpg({
        title: headline,
        kicker: kicker,
        imageUrl: displayImage,
        caption: caption.startsWith('ছবি') ? caption : `ছবি: ${caption}`,
        category: categoryLabel,
        dateBn: dateBn,
        titleFontSize: titleFontSize >= 35 ? titleFontSize : titleFontSize * 2,
        kickerFontSize: 26,
        lineHeight: 1.18,
        colorMode: colorMode,
        manualLineBreak: manualSplit,
        fileName: `social-card-${cleanSlug}-${Date.now()}.jpg`,
        returnBlob: true
      });

      if (!cardBlob) {
        showError(isBn ? 'ক্যানভাস ব্লব তৈরি হয়নি।' : 'Failed to generate blob.');
        setIsUploadingToB2(false);
        return;
      }

      const cardFile = new File([cardBlob], `social-card-${cleanSlug}-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const cdnUrl = await uploadImageToStorage(cardFile, {
        slug: `social-card-${Date.now()}`,
        caption: `Social Card: ${headline}`,
        title: headline
      });

      if (cdnUrl) {
        setUploadedCdnUrl(cdnUrl);
        showSuccess(isBn ? 'কার্ড সফলভাবে Backblaze B2 ক্লাউডে আপলোড হয়েছে!' : 'Card uploaded to Backblaze B2!');
        if (triggerSaveToast) triggerSaveToast(isBn ? 'B2 ক্লাউড আপলোড সম্পন্ন' : 'Uploaded to B2 Cloud');
      } else {
        showError(isBn ? 'ক্লাউড আপলোড ব্যর্থ হয়েছে।' : 'Cloud upload failed.');
      }
    } catch (err) {
      showError(isBn ? 'আপলোডে ত্রুটি ঘটেছে: ' + err.message : 'Error uploading to B2.');
    } finally {
      setIsUploadingToB2(false);
    }
  };

  const handleCopyLink = () => {
    if (uploadedCdnUrl) {
      navigator.clipboard.writeText(uploadedCdnUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      showSuccess(isBn ? 'লিঙ্ক কপি করা হয়েছে!' : 'Link copied!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600, margin: '0 auto' }}>
      {/* Top Controls Bar: Load Article + Download & Upload Buttons */}
      <div
        className="admin-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        {/* Quick Load Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bookmark size={16} color="var(--primary-red)" />
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {isBn ? 'নিউজ থেকে লোড:' : 'Load Article:'}
          </span>
          <select
            className="admin-input"
            value={selectedArticleId}
            onChange={(e) => handleSelectArticle(e.target.value)}
            style={{ fontSize: '0.84rem', flex: 1, cursor: 'pointer' }}
          >
            <option value="">{isBn ? '-- সাম্প্রতিক সংবাদ সিলেক্ট করুন --' : '-- Choose Recent Article --'}</option>
            {(articles || []).slice(0, 30).map((art) => (
              <option key={art.id || art.postId} value={art.id || art.postId}>
                {art.titleBn || art.title} ({art.categoryBn || art.category})
              </option>
            ))}
          </select>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>{isExporting ? (isBn ? 'তৈরি হচ্ছে...' : 'Exporting...') : (isBn ? 'ইমেজ ডাউনলোড করুন' : 'Download Image')}</span>
          </button>

          <button
            type="button"
            onClick={handleUploadToB2}
            disabled={isUploadingToB2}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              backgroundColor: 'var(--primary-red)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: isUploadingToB2 ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(229, 9, 20, 0.35)'
            }}
          >
            {isUploadingToB2 ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{isUploadingToB2 ? (isBn ? 'B2 তে আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'B2 ক্লাউডে আপলোড' : 'Upload to B2')}</span>
          </button>
        </div>

        {/* B2 Upload Success Link Banner */}
        {uploadedCdnUrl && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10B981',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {uploadedCdnUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 4,
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              <span>{isCopied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
            </button>
          </div>
        )}
      </div>

      {/* MAIN CARD WORKSPACE (Matching Screenshot) */}
      <div
        className="admin-card"
        style={{
          padding: '16px 18px',
          border: '2px solid var(--border-color)',
          borderRadius: 12,
          margin: 0
        }}
      >
        {/* Header (Matching Screenshot) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--primary-red)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Camera size={18} />
            <span>{isBn ? 'অটো-জেনারেটেড সোশ্যাল ফটোকার্ড' : 'Auto-Generated News Card'}</span>
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Eye size={13} />
            <span>{isBn ? 'লাইভ ডিজাইন মোড' : 'Live Design Mode'}</span>
          </span>
        </div>

        {/* View Only Banner (Matching Screenshot Top Label) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(230, 0, 18, 0.08)',
            border: '1px solid rgba(230, 0, 18, 0.22)',
            padding: '7px 12px',
            borderRadius: '10px 10px 0 0',
            fontSize: '0.78rem',
            color: 'var(--primary-red)',
            fontWeight: 700
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Lock size={13} />
            <span>অফিসিয়াল সোশ্যাল ফটোকার্ড (Studio View)</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <Camera size={12} />
            <span>হাই-রেজুলেশন রেন্ডারার</span>
          </span>
        </div>

        {/* THE 1:1 SQUARE CARD CANVAS (Matching Screenshot Pixel-to-Pixel) */}
        <div
          ref={cardRef}
          id="jonogon-official-news-card"
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '100%', // 1:1 Aspect Ratio
            backgroundColor: '#FFFFFF',
            borderRadius: '0 0 10px 10px',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color)',
            containerType: 'inline-size'
          }}
        >
          {/* Layer 0: Headline Area Background with subtle Bangladesh Map watermark */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#FFFFFF',
              zIndex: 0
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '5.2%',
                left: '5%',
                right: '5%',
                height: '24%',
                opacity: 0.06,
                backgroundImage: 'radial-gradient(circle at center, #E50914 10%, transparent 70%), linear-gradient(135deg, rgba(230,0,18,0.3) 0%, transparent 60%)',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Layer 1: Background News Photo sitting behind template window */}
          <div
            style={{
              position: 'absolute',
              top: '15.6%',
              left: '6.35%',
              width: '87.3%',
              height: '50.0%',
              borderTopLeftRadius: '26cqw',
              overflow: 'hidden',
              backgroundColor: '#1E1E1E',
              zIndex: 1
            }}
          >
            <img
              src={displayImage}
              alt="News Subject"
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>

          {/* Layer 2: Official Template Frame (Header logo, QR code, red frame, ribbon & footer) */}
          <img
            src="/news-card-template.png"
            alt="Card Template Frame"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 2,
              pointerEvents: 'none'
            }}
          />

          {/* Layer 3: Dynamic Date Badge inside Golden Top Pill */}
          <div
            style={{
              position: 'absolute',
              top: '17.58%',
              left: '50.05%',
              transform: 'translate(-50%, -50%)',
              width: '25.5%',
              height: '2.73%',
              zIndex: 3,
              color: '#FFFFFF',
              fontSize: 'clamp(9px, 1.8cqw, 18px)',
              fontWeight: 800,
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              textAlign: 'center',
              fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)'
            }}
          >
            {dateBn}
          </div>

          {/* Layer 4: Photo Caption */}
          <div
            style={{
              position: 'absolute',
              top: '67.97%',
              right: '6.45%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              backgroundColor: '#FFFFFF',
              padding: '1px 6px',
              borderRadius: '3px',
              fontSize: 'clamp(8.5px, 1.45cqw, 15px)',
              color: '#222222',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)'
            }}
          >
            {caption.startsWith('ছবি') ? caption : `ছবি: ${caption}`}
          </div>

          {/* Layer 5: Dynamic Headline Text Section */}
          <div
            style={{
              position: 'absolute',
              top: '70.8%',
              bottom: '4.8%',
              left: '3.5%',
              width: '93%',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 4px'
            }}
          >
            {/* Optional Sub-headline / Kicker */}
            {kicker && (
              <div
                style={{
                  fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)',
                  fontSize: 'clamp(11px, 2.6cqw, 24px)',
                  fontWeight: 800,
                  color: '#B82A24',
                  lineHeight: 1.2,
                  marginBottom: '0.4cqw',
                  maxWidth: '96%',
                  letterSpacing: 0.1
                }}
              >
                {kicker}
              </div>
            )}

            {/* Headline Line 1 (Red) */}
            {line1 && (
              <div
                style={{
                  fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)',
                  fontSize: kicker
                    ? `clamp(16px, ${titleFontSize * 0.20}cqw, 50px)`
                    : `clamp(18px, ${titleFontSize * 0.22}cqw, 54px)`,
                  fontWeight: 900,
                  color: getLine1Color(),
                  lineHeight: 1.18,
                  wordBreak: 'break-word',
                  maxWidth: '98%',
                  letterSpacing: -0.3
                }}
              >
                {line1}
              </div>
            )}

            {/* Headline Line 2 (Navy Blue) */}
            {line2 && (
              <div
                style={{
                  fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)',
                  fontSize: kicker
                    ? `clamp(17px, ${(titleFontSize + 2) * 0.20}cqw, 52px)`
                    : `clamp(19px, ${(titleFontSize + 2) * 0.22}cqw, 56px)`,
                  fontWeight: 900,
                  color: getLine2Color(),
                  lineHeight: 1.18,
                  wordBreak: 'break-word',
                  maxWidth: '98%',
                  marginTop: '0.3cqw',
                  letterSpacing: -0.3
                }}
              >
                {line2}
              </div>
            )}
          </div>

          {/* Layer 6: Dynamic Category in Bottom Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '54.2%',
              width: '43.2%',
              height: '4.5%',
              transform: 'translateX(-50%)',
              zIndex: 3,
              color: '#FFFFFF',
              fontSize: 'clamp(9px, 1.7cqw, 17px)',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              letterSpacing: 0.4,
              fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)',
              textShadow: '0 1px 2px rgba(0,0,0,0.35)',
              textAlign: 'center',
              alignContent: 'space-around'
            }}
          >
            {categoryLabel}
          </div>
        </div>

        {/* -------------------------------------------------------------
            CONTROLS SECTION (EXACT MATCHING SCREENSHOT)
            ------------------------------------------------------------- */}
        <div style={{ marginTop: 16 }}>
          {/* Card Font Size & Text Controls Box (Matching Screenshot) */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '14px 16px',
              marginBottom: 16
            }}
          >
            {/* Box Header with Reset button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                <Type size={16} color="var(--primary-red)" />
                <span>{isBn ? 'কার্ডের ফন্ট সাইজ ও টেক্সট কন্ট্রোল' : 'Card Typography Controls'}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={12} />
                <span>{isBn ? 'রিসেট' : 'Reset'}</span>
              </button>
            </div>

            {/* Stepper for Font Size: [ - ] 24px [ + ] */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {isBn ? 'মূল শিরোনাম ফন্ট সাইজ:' : 'Headline Font Size:'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setTitleFontSize((s) => Math.max(16, s - 1))}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: '1px solid #3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--primary-red)', minWidth: 44, textAlign: 'center' }}>
                  {titleFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setTitleFontSize((s) => Math.min(38, s + 1))}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: '1px solid #3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Color Scheme: [ লাল + নীল ] [ সব লাল ] [ সব নীল ] */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>🎨 কালার স্কিম:</span>
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'dual', label: 'লাল + নীল' },
                  { id: 'red', label: 'সব লাল' },
                  { id: 'blue', label: 'সব নীল' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorMode(c.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      border: colorMode === c.id ? '2px solid var(--primary-red)' : '1px solid var(--border-color)',
                      backgroundColor: colorMode === c.id ? 'rgba(229, 9, 20, 0.08)' : 'var(--bg-card)',
                      color: colorMode === c.id ? 'var(--primary-red)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Split Note & Input */}
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                {isBn ? "২ লাইনে আলাদা করতে চাইলে মাঝখানে '|' দিন (যেমন: ১ম অংশ | ২য় অংশ):" : "Split 2 lines with '|':"}
              </div>
              <input
                type="text"
                className="admin-input"
                style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                placeholder="ঐচ্ছিক কাস্টম স্প্লিট (যেমন: একবছরে গরিব জনগণ বেড়েছে প্রায় | ২১ লাখ !)"
                value={manualSplit}
                onChange={(e) => setManualSplit(e.target.value)}
              />
            </div>
          </div>

          {/* Input 1: Card Kicker / Subtitle (Optional) */}
          <div className="admin-form-group" style={{ marginBottom: 12 }}>
            <label className="admin-label">{isBn ? 'Card Kicker / Subtitle (Optional)' : 'Card Kicker / Subtitle (Optional)'}</label>
            <input
              type="text"
              className="admin-input"
              placeholder="e.g. FY 2024-25 to 25-26"
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
            />
          </div>

          {/* Input 2: Card Footer Category */}
          <div className="admin-form-group" style={{ marginBottom: 12 }}>
            <label className="admin-label">{isBn ? 'Card Footer Category ({Sub-Group} | {Category})' : 'Card Footer Category'}</label>
            <input
              type="text"
              className="admin-input"
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              placeholder="জাতীয় ও নগর । বাংলাদেশ"
            />
          </div>

          {/* Input 3: Photo Credit / Caption */}
          <div className="admin-form-group" style={{ marginBottom: 12 }}>
            <label className="admin-label">{isBn ? 'Photo Credit / Caption' : 'Photo Credit / Caption'}</label>
            <input
              type="text"
              className="admin-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="ছবি: সংগৃহীত"
            />
          </div>

          {/* Input 4: Main Headline Text Input */}
          <div className="admin-form-group" style={{ marginBottom: 12 }}>
            <label className="admin-label">{isBn ? 'মূল সংবাদ শিরোনাম (Headline)' : 'Main Headline'}</label>
            <textarea
              rows={2}
              className="admin-input"
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value);
                setManualSplit('');
              }}
              placeholder="সংবাদের শিরোনাম..."
            />
          </div>

          {/* Input 5: Image File Upload & Dropzone */}
          <div className="admin-form-group" style={{ marginBottom: 12 }}>
            <label className="admin-label">{isBn ? 'ছবি নির্বাচন বা আপলোড (Change Card Photo)' : 'Change Card Photo'}</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleImageFile(e.dataTransfer.files[0]);
                }
              }}
              style={{
                border: `2px dashed ${isDragging ? 'var(--primary-red)' : 'var(--border-color)'}`,
                borderRadius: 8,
                padding: '10px 14px',
                backgroundColor: isDragging ? 'rgba(229, 9, 20, 0.05)' : 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={displayImage}
                  alt=""
                  style={{ width: 42, height: 42, borderRadius: 6, objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isBn ? 'ছবি ড্র্যাগ করুন অথবা ব্রাউজ করুন' : 'Drag or browse image'}
                </span>
              </div>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  backgroundColor: 'var(--primary-red)',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Camera size={14} />
                <span>{isBn ? 'ছবি ব্রাউজ' : 'Browse'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
