import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  X,
  Megaphone,
  Zap,
  Gift,
  Sparkles,
  ExternalLink,
  Bell,
  Clock,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function WebsiteLoadPopup({ isPreview = false, previewData = null, onClosePreview = null }) {
  const { settings, language } = useNews();
  const isBn = language === 'bn';

  const popupConfig = previewData || settings?.loadPopup || {};
  const {
    enabled = false,
    type = 'notice', // 'notice' | 'breaking' | 'ad' | 'welcome'
    titleBn = '',
    titleEn = '',
    messageBn = '',
    messageEn = '',
    imageUrl = '',
    actionTextBn = '',
    actionTextEn = '',
    actionUrl = '',
    frequency = 'once_per_session', // 'every_visit' | 'once_per_session' | 'once_per_day'
    autoCloseSeconds = 0
  } = popupConfig;

  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(autoCloseSeconds || 0);

  useEffect(() => {
    if (isPreview) {
      setIsOpen(true);
      return;
    }

    if (!enabled) {
      setIsOpen(false);
      return;
    }

    // Check frequency rules
    if (frequency === 'once_per_session') {
      const seenSession = sessionStorage.getItem('jonogon_load_popup_session_seen');
      if (seenSession) return;
    } else if (frequency === 'once_per_day') {
      const lastSeen = localStorage.getItem('jonogon_load_popup_day_seen');
      const today = new Date().toISOString().slice(0, 10);
      if (lastSeen === today) return;
    }

    // Small delay so public page finishes painting smoothly
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 750);

    return () => clearTimeout(timer);
  }, [enabled, frequency, isPreview]);

  // Handle auto-close timer if configured
  useEffect(() => {
    if (!isOpen || autoCloseSeconds <= 0 || isPreview) return;
    setCountdown(autoCloseSeconds);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoCloseSeconds, isPreview]);

  const handleClose = () => {
    setIsOpen(false);
    if (isPreview && typeof onClosePreview === 'function') {
      onClosePreview();
      return;
    }

    if (frequency === 'once_per_session') {
      sessionStorage.setItem('jonogon_load_popup_session_seen', 'true');
    } else if (frequency === 'once_per_day') {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('jonogon_load_popup_day_seen', today);
    }
  };

  if (!isOpen) return null;

  const title = isBn ? (titleBn || titleEn) : (titleEn || titleBn);
  const message = isBn ? (messageBn || messageEn) : (messageEn || messageBn);
  const actionText = isBn ? (actionTextBn || actionTextEn || 'বিস্তারিত জানুন') : (actionTextEn || actionTextBn || 'Learn More');

  // Type-specific icon and styling
  const getTypeBadge = () => {
    switch (type) {
      case 'breaking':
        return {
          icon: <Zap size={16} />,
          labelBn: 'ব্রেকিং আপডেট',
          labelEn: 'Breaking Alert',
          bg: '#E60012',
          color: '#FFFFFF'
        };
      case 'ad':
        return {
          icon: <Gift size={16} />,
          labelBn: 'বিশেষ অফার ও বিজ্ঞাপন',
          labelEn: 'Sponsored Announcement',
          bg: '#2563EB',
          color: '#FFFFFF'
        };
      case 'welcome':
        return {
          icon: <Sparkles size={16} />,
          labelBn: 'স্বাগতম বার্তা',
          labelEn: 'Welcome Notice',
          bg: '#16A34A',
          color: '#FFFFFF'
        };
      default:
        return {
          icon: <Megaphone size={16} />,
          labelBn: 'বিশেষ বিজ্ঞপ্তি',
          labelEn: 'Special Notice',
          bg: 'var(--primary-red)',
          color: '#FFFFFF'
        };
    }
  };

  const badge = getTypeBadge();

  return (
    <div
      className="website-load-popup-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={handleClose}
    >
      <div
        className="website-load-popup-card"
        style={{
          width: '100%',
          maxWidth: imageUrl ? 560 : 500,
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          color: 'var(--text-main, #111111)',
          borderRadius: 14,
          border: '1px solid var(--border-color, #E2E8F0)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with Badge & Close Button */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-color, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle, #F8FAFC)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                backgroundColor: badge.bg,
                color: badge.color,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              {badge.icon}
              <span>{isBn ? badge.labelBn : badge.labelEn}</span>
            </span>

            {isPreview && (
              <span
                style={{
                  fontSize: '0.72rem',
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  color: '#D97706',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 700,
                  border: '1px solid rgba(217, 119, 6, 0.3)'
                }}
              >
                {isBn ? 'প্রিভিউ মোড' : 'Preview Mode'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {autoCloseSeconds > 0 && countdown > 0 && !isPreview && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} />
                <span>{countdown}s</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #94A3B8)',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease'
              }}
              title={isBn ? 'বন্ধ করুন' : 'Close'}
              aria-label="Close Popup"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: imageUrl ? '0' : '20px 24px' }}>
          {/* Optional Banner Image */}
          {imageUrl && (
            <div style={{ width: '100%', maxHeight: 220, overflow: 'hidden', backgroundColor: 'var(--bg-subtle)' }}>
              <img
                src={imageUrl}
                alt={title || 'Announcement'}
                style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div style={{ padding: imageUrl ? '18px 24px 20px 24px' : '0' }}>
            {title && (
              <h2
                style={{
                  fontFamily: 'var(--font-headline, sans-serif)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  margin: '0 0 10px 0',
                  color: 'var(--text-main, #111111)',
                  lineHeight: 1.35
                }}
              >
                {title}
              </h2>
            )}

            {message && (
              <div
                style={{
                  fontSize: '0.94rem',
                  color: 'var(--text-muted, #64748B)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-line'
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-color, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            backgroundColor: 'var(--bg-subtle, #F8FAFC)'
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid var(--border-color, #CBD5E1)',
              backgroundColor: 'var(--bg-card, transparent)',
              color: 'var(--text-main, #4B5563)',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isBn ? 'বন্ধ করুন' : 'Dismiss'}
          </button>

          {actionUrl ? (
            <a
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                backgroundColor: 'var(--primary-red, #E60012)',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(230, 0, 18, 0.25)'
              }}
            >
              <span>{actionText}</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                backgroundColor: 'var(--primary-red, #E60012)',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isBn ? 'ঠিক আছে' : 'OK, Got It'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
