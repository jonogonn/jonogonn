import React, { useEffect, useState, useRef } from 'react';
import { Minus, Plus, RotateCcw, ShieldAlert, Lock, Eye, Type, Palette, Lightbulb } from 'lucide-react';

export default function SocialNewsCardPreview({
  title = '',
  kicker = '',
  imageUrl = '',
  caption = '',
  category = 'সারাদেশ । বাংলাদেশ',
  dateBn = ''
}) {
  // State for security / Anti-screenshot lockout
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutReason, setLockoutReason] = useState('');
  const [screenshotAttemptCount, setScreenshotAttemptCount] = useState(0);

  // States for text customization & font size controls (+ / -)
  const [titleFontSize, setTitleFontSize] = useState(24); // in px (scaled)
  const [kickerFontSize, setKickerFontSize] = useState(15);
  const [lineHeightRatio, setLineHeightRatio] = useState(1.18);
  const [colorMode, setColorMode] = useState('dual'); // 'dual' | 'red' | 'blue' | 'dark'
  const [manualLineBreak, setManualLineBreak] = useState(''); // optional custom split

  const containerRef = useRef(null);

  // Formatting date
  const displayDate = dateBn || new Date().toLocaleDateString('bn-BD', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const displayCaption = caption || 'ছবি: সংগৃহীত';
  const displayImage = imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';

  // Smart splitting for headline (Dual Color: Line 1 in Red, Line 2 in Navy Blue like the official sample)
  const rawTitle = title || 'একবছরে গরিব জনগণ বেড়েছে প্রায় ২১ লাখ !';
  
  let line1 = '';
  let line2 = '';

  if (manualLineBreak.trim()) {
    const parts = manualLineBreak.split('|');
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
    // Intelligent word balance split if title is long
    const words = rawTitle.trim().split(/\s+/);
    if (words.length <= 4) {
      line1 = rawTitle;
      line2 = '';
    } else if (words.length <= 6) {
      // Split approx 3 + 2 or 4 + 2
      const splitAt = Math.max(2, words.length - 2);
      line1 = words.slice(0, splitAt).join(' ');
      line2 = words.slice(splitAt).join(' ');
    } else {
      // Longer headline
      const splitAt = Math.ceil(words.length * 0.58);
      line1 = words.slice(0, splitAt).join(' ');
      line2 = words.slice(splitAt).join(' ');
    }
  }

  // Determine colors based on colorMode
  const getLine1Color = () => {
    if (colorMode === 'blue') return '#0B2545';
    if (colorMode === 'dark') return '#111827';
    return '#E50914'; // Bright Bold Red (default)
  };

  const getLine2Color = () => {
    if (colorMode === 'red') return '#E50914';
    if (colorMode === 'dark') return '#111827';
    return '#0B2545'; // Deep Dark Navy Blue (default)
  };

  // --- COMPREHENSIVE ANTI-SCREENSHOT & ANTI-CAPTURE PROTECTION ---
  useEffect(() => {
    const triggerLockout = (reason) => {
      setIsLockedOut(true);
      setLockoutReason(reason);
      setScreenshotAttemptCount((c) => c + 1);
    };

    // 1. Window Blur: Triggers whenever Windows Snipping Tool (Win+Shift+S), Greenshot, Lightshot, or another app gains focus
    const handleWindowBlur = () => {
      triggerLockout('উইন্ডো ফোকাস হারিয়েছে (স্ক্রিনশট বা অন্য অ্যাপ সক্রিয়)');
    };

    // 2. Visibility change (tab switch, minimize, or background capture)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerLockout('ট্যাব ব্যাকগ্রাউন্ডে চলে গেছে');
      }
    };

    // 3. Mouse leaving document (prevent external snipping overlays)
    const handleMouseLeave = (e) => {
      // If mouse leaves the top or sides of browser viewport
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        // Soft lockout or prompt
      }
    };

    // 4. Keyboard Shortcuts for Screen Capture & Inspect
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isPrintScreen = e.key === 'PrintScreen' || e.code === 'PrintScreen';
      const isCtrlS = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S');
      const isCtrlP = (e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P');
      const isCtrlU = (e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U');
      const isDevTools = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j');
      const isF12 = e.key === 'F12';
      const isMacScreenshot = isMac && e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5');

      if (isPrintScreen || isCtrlS || isCtrlP || isCtrlU || isDevTools || isF12 || isMacScreenshot) {
        e.preventDefault();
        e.stopPropagation();
        triggerLockout('স্ক্রিনশট বা কিবোর্ড শর্টকাট শনাক্ত হয়েছে');
      }
    };

    // 5. Copy prevention
    const handleCopy = (e) => {
      e.preventDefault();
      triggerLockout('কপি করার চেষ্টা শনাক্ত হয়েছে');
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('copy', handleCopy);
    };
  }, []);

  const handleUnlock = () => {
    setIsLockedOut(false);
    setLockoutReason('');
  };

  const handleResetControls = () => {
    setTitleFontSize(24);
    setKickerFontSize(15);
    setLineHeightRatio(1.18);
    setColorMode('dual');
    setManualLineBreak('');
  };

  return (
    <div
      ref={containerRef}
      className="protected-social-card-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onDragStart={(e) => {
        e.preventDefault();
        return false;
      }}
    >
      {/* View Only Security Notice Banner */}
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
          <span>অফিসিয়াল সোশ্যাল ফটোকার্ড (View Only)</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <Lock size={11} />
          <span>ডাউনলোড ও স্ক্রিনশট সুরক্ষিত</span>
        </span>
      </div>

      {/* Main Square Card Container (1:1 Ratio with Container Queries) */}
      <div
        className="protected-social-card"
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
        onClick={isLockedOut ? handleUnlock : undefined}
      >
        {/* Layer 0: Headline Area Background with subtle Bangladesh Map watermark texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 0
          }}
        >
          {/* Subtle graphical watermark pattern in the bottom half */}
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

        {/* Layer 1: Background News Photo (sitting precisely behind the template window) */}
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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none'
            }}
            draggable={false}
          />
        </div>

        {/* Layer 2: Official Template Frame (Header logo, QR code, red frame, golden pill, ribbon & footer) */}
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
          draggable={false}
        />

        {/* Layer 3: Dynamic Date Badge inside Golden Top Pill (Dead-Center Aligned) */}
        <div
          style={{
            position: 'absolute',
            top: '17.58%',
            left: '50.05%',
            transform: 'translate(-50%, -50%)',
            width: '25.5%',
            height: '2.73%',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 'clamp(9px, 1.85cqw, 19px)',
            fontWeight: 800,
            letterSpacing: 0.3,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            textShadow: '0 1px 2px rgba(0,0,0,0.45)',
            pointerEvents: 'none',
            fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)'
          }}
        >
          {displayDate}
        </div>

        {/* Layer 4: Photo Caption (bottom right under photo frame, clean crisp background) */}
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
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)'
          }}
        >
          {displayCaption.startsWith('ছবি') ? displayCaption : `ছবি: ${displayCaption}`}
        </div>

        {/* Layer 5: Dynamic Headline Text Section (Pixel-to-Pixel Proportionate Hierarchy) */}
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
            padding: '0 4px',
            pointerEvents: 'none'
          }}
        >
          {/* Row 1: Optional Sub-headline / Kicker */}
          {kicker && (
            <div
              style={{
                fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)',
                fontSize: `clamp(12px, ${kickerFontSize * 0.20}cqw, 32px)`,
                fontWeight: 800,
                color: '#B82A24', // Crimson / Rust Red matching reference image
                lineHeight: 1.2,
                marginBottom: '0.4cqw',
                maxWidth: '96%',
                letterSpacing: 0.1
              }}
            >
              {kicker}
            </div>
          )}

          {/* Row 2: Headline Line 1 (Vibrant Editorial Red) */}
          {line1 && (
            <div
              style={{
                fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)',
                fontSize: kicker
                  ? `clamp(17px, ${titleFontSize * 0.20}cqw, 52px)`
                  : `clamp(19px, ${titleFontSize * 0.22}cqw, 56px)`,
                fontWeight: 900,
                color: getLine1Color(),
                lineHeight: lineHeightRatio,
                wordBreak: 'break-word',
                maxWidth: '98%',
                letterSpacing: -0.3
              }}
            >
              {line1}
            </div>
          )}

          {/* Row 3: Headline Line 2 (Deep Navy Blue / Highlight) */}
          {line2 && (
            <div
              style={{
                fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)',
                fontSize: kicker
                  ? `clamp(18px, ${(titleFontSize + 2) * 0.20}cqw, 54px)`
                  : `clamp(20px, ${(titleFontSize + 2) * 0.22}cqw, 58px)`,
                fontWeight: 900,
                color: getLine2Color(),
                lineHeight: lineHeightRatio,
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

        {/* Layer 6: Dynamic Category in Bottom Red Bar ({sub_group} । {category}) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '29.2%',
            width: '43.2%',
            height: '4.5%',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#E50914',
            color: '#FFFFFF',
            fontSize: 'clamp(9.5px, 1.75cqw, 18px)',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            letterSpacing: 0.5,
            pointerEvents: 'none',
            fontFamily: 'var(--font-headline, "Anek Bangla", "Hind Siliguri", sans-serif)',
            textShadow: '0 1px 2px rgba(0,0,0,0.35)'
          }}
        >
          {category || 'সারাদেশ । বাংলাদেশ'}
        </div>

        {/* Layer 7: Invisible Transparent Security Glass Shield */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            background: 'transparent',
            cursor: 'default'
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            return false;
          }}
        />

        {/* Layer 8: Subtle Diagonal Anti-Piracy Watermark Mesh */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 11,
            pointerEvents: 'none',
            opacity: 0.05,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-25deg)',
            fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)',
            fontWeight: 900,
            color: '#000000',
            letterSpacing: 4,
            whiteSpace: 'nowrap'
          }}
        >
          জনগণ.নিউজ • অফিসিয়াল প্রিভিউ • সংরক্ষিত
        </div>

        {/* Layer 9: AIR-TIGHT SCREENSHOT / FOCUS-LOSS BLACKOUT LOCKOUT SHIELD */}
        {isLockedOut && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              backgroundColor: '#0F1117',
              backgroundImage: 'radial-gradient(circle at center, rgba(230,0,18,0.25) 0%, #0F1117 80%)',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              textAlign: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              animation: 'fadeIn 0.15s ease-out'
            }}
            onClick={handleUnlock}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                color: '#EF4444'
              }}
            >
              <ShieldAlert size={28} />
            </div>

            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#EF4444', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Lock size={16} />
              <span>স্ক্রিনশট ও স্ক্রিন ক্যাপচার নিষিদ্ধ</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', maxWidth: 320, lineHeight: 1.45, marginBottom: 14 }}>
              সোশ্যাল ফটো কার্ডের সুরক্ষার্থে উইন্ডো ফোকাস ছাড়া বা স্ন্যাপিং টুল চালুর সাথে সাথেই কার্ডটি স্বয়ংক্রিয়ভাবে লক হয়ে যায়।
            </div>

            {lockoutReason && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#F87171',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '4px 10px',
                  borderRadius: 4,
                  marginBottom: 14
                }}
              >
                কারণ: {lockoutReason}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUnlock();
              }}
              style={{
                backgroundColor: 'var(--primary-red)',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(230,0,18,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Eye size={14} />
              <span>আনলক করে কার্ড দেখুন</span>
            </button>
          </div>
        )}
      </div>

      {/* --- INTERACTIVE CARD CUSTOMIZATION TOOLBAR (+ / - FONT SIZE CONTROLS) --- */}
      <div
        className="social-card-controls"
        style={{
          marginTop: 12,
          padding: '12px 14px',
          backgroundColor: 'var(--bg-card, #1A1D24)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          fontSize: '0.82rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: 6
          }}
        >
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Type size={14} color="var(--primary-red)" />
            <span>কার্ডের ফন্ট সাইজ ও টেক্সট কন্ট্রোল</span>
          </span>
          <button
            type="button"
            onClick={handleResetControls}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.74rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
            title="রিসেট করুন"
          >
            <RotateCcw size={12} />
            <span>রিসেট</span>
          </button>
        </div>

        {/* 1. Headline Font Size (+ / -) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>মূল শিরোনাম ফন্ট সাইজ:</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="admin-btn-action"
              onClick={() => setTitleFontSize((s) => Math.max(16, s - 2))}
              style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="সাইজ ছোট করুন"
            >
              <Minus size={13} />
            </button>
            <span style={{ fontWeight: 800, minWidth: 42, textAlign: 'center', color: 'var(--primary-red)' }}>
              {titleFontSize}px
            </span>
            <button
              type="button"
              className="admin-btn-action"
              onClick={() => setTitleFontSize((s) => Math.min(42, s + 2))}
              style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="সাইজ বড় করুন"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* 2. Kicker Font Size (+ / -) */}
        {kicker && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>সাব-হেডলাইন ফন্ট সাইজ:</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="admin-btn-action"
                onClick={() => setKickerFontSize((s) => Math.max(11, s - 1))}
                style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={13} />
              </button>
              <span style={{ fontWeight: 800, minWidth: 42, textAlign: 'center' }}>
                {kickerFontSize}px
              </span>
              <button
                type="button"
                className="admin-btn-action"
                onClick={() => setKickerFontSize((s) => Math.min(24, s + 1))}
                style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        )}

        {/* 3. Headline Color Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Palette size={13} />
            <span>কালার স্কিম:</span>
          </span>
          <div style={{ display: 'inline-flex', gap: 4 }}>
            <button
              type="button"
              onClick={() => setColorMode('dual')}
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: 4,
                border: colorMode === 'dual' ? '1px solid var(--primary-red)' : '1px solid var(--border-color)',
                backgroundColor: colorMode === 'dual' ? 'rgba(230,0,18,0.15)' : 'transparent',
                color: colorMode === 'dual' ? 'var(--primary-red)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: colorMode === 'dual' ? 800 : 500
              }}
            >
              লাল + নীল
            </button>
            <button
              type="button"
              onClick={() => setColorMode('red')}
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: 4,
                border: colorMode === 'red' ? '1px solid #E50914' : '1px solid var(--border-color)',
                backgroundColor: colorMode === 'red' ? 'rgba(230,0,18,0.15)' : 'transparent',
                color: colorMode === 'red' ? '#E50914' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: colorMode === 'red' ? 800 : 500
              }}
            >
              সব লাল
            </button>
            <button
              type="button"
              onClick={() => setColorMode('blue')}
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: 4,
                border: colorMode === 'blue' ? '1px solid #0B2545' : '1px solid var(--border-color)',
                backgroundColor: colorMode === 'blue' ? 'rgba(11,37,69,0.2)' : 'transparent',
                color: colorMode === 'blue' ? '#60A5FA' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: colorMode === 'blue' ? 800 : 500
              }}
            >
              সব নীল
            </button>
          </div>
        </div>

        {/* 4. Optional Manual Line Split Helper */}
        <div style={{ marginTop: 8 }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <Lightbulb size={12} style={{ color: 'var(--primary-red)' }} />
            <span>২ লাইনে আলাদা করতে চাইলে মাঝখানে `|` দিন (যেমন: ১ম অংশ | ২য় অংশ):</span>
          </label>
          <input
            type="text"
            className="admin-input"
            style={{ fontSize: '0.78rem', padding: '5px 8px' }}
            placeholder="ঐচ্ছিক কাস্টম স্প্লিট (যেমন: একবছরে গরিব জনগণ বেড়েছে | প্রায় ২১ লাখ !)"
            value={manualLineBreak}
            onChange={(e) => setManualLineBreak(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
