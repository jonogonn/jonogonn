import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, HelpCircle, X, RotateCcw } from 'lucide-react';
import { useNews } from '../../context/NewsContext';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  subMessage,
  confirmText,
  cancelText,
  type = 'danger',
  onConfirm,
  onCancel,
  onClose,
  isBn: propIsBn
}) {
  const { adminLanguage, language, adminTheme, theme, isAdminOpen } = useNews() || {};
  const isBn = propIsBn !== undefined ? propIsBn : ((adminLanguage || language) === 'bn');

  // Handle close callback for either onCancel or onClose
  const handleClose = () => {
    if (typeof onCancel === 'function') onCancel();
    if (typeof onClose === 'function') onClose();
  };

  const isCurrentlyAdmin =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') ||
      Boolean(isAdminOpen) ||
      Boolean(document.querySelector('.admin-dashboard-wrap')));

  const isDark = (adminTheme || theme) === 'dark' || isCurrentlyAdmin;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultTitle = isBn
    ? type === 'warning' ? 'সতর্কতা ও নিশ্চিতকরণ' : 'মুছে ফেলার নিশ্চিতকরণ'
    : type === 'warning' ? 'Warning & Confirmation' : 'Confirm Deletion';

  const defaultConfirmText = isBn
    ? type === 'warning' ? 'হ্যাঁ, নিশ্চিত করুন' : 'হ্যাঁ, মুছে ফেলুন'
    : type === 'warning' ? 'Confirm' : 'Yes, Delete';

  const defaultCancelText = isBn ? 'বাতিল' : 'Cancel';
  const defaultSubMessage = isBn
    ? 'এই কাজটি সম্পন্ন করার পর এটি আর পূর্বাবস্থায় ফেরানো যাবে না।'
    : 'This action cannot be undone.';

  const isWarning = type === 'warning';

  const badgeColor = isWarning ? '#F59E0B' : '#FF384D';
  const badgeBg = isDark
    ? (isWarning ? 'rgba(245, 158, 11, 0.18)' : 'rgba(230, 0, 18, 0.18)')
    : (isWarning ? 'rgba(245, 158, 11, 0.12)' : 'rgba(230, 0, 18, 0.12)');
  const badgeBorder = isDark
    ? (isWarning ? 'rgba(245, 158, 11, 0.35)' : 'rgba(230, 0, 18, 0.35)')
    : (isWarning ? 'rgba(245, 158, 11, 0.25)' : 'rgba(230, 0, 18, 0.25)');

  const stripeGradient = isWarning
    ? 'linear-gradient(90deg, #F59E0B 0%, #E60012 50%, #F59E0B 100%)'
    : 'linear-gradient(90deg, #E60012 0%, #FF384D 50%, #99000C 100%)';

  const btnBg = isWarning
    ? 'linear-gradient(135deg, #E60012 0%, #C4000F 100%)'
    : 'linear-gradient(135deg, #E60012 0%, #B8000E 100%)';

  const colors = isDark
    ? {
        cardBg: '#131622',
        cardBorder: '1px solid rgba(255, 255, 255, 0.14)',
        cardShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(230, 0, 18, 0.2)',
        headerBg: '#181C28',
        headerBorder: '1px solid rgba(255, 255, 255, 0.08)',
        title: '#FFFFFF',
        closeText: '#94A3B8',
        closeHoverText: '#FFFFFF',
        closeHoverBg: 'rgba(255, 255, 255, 0.08)',
        message: '#F1F5F9',
        subMsgBg: 'rgba(255, 255, 255, 0.03)',
        subMsgBorder: '1px solid rgba(255, 255, 255, 0.08)',
        subMsgLeft: '3px solid #E60012',
        subMsgText: '#94A3B8',
        footerBg: '#10131E',
        footerBorder: '1px solid rgba(255, 255, 255, 0.08)',
        cancelBg: '#1E2332',
        cancelBorder: '1px solid rgba(255, 255, 255, 0.16)',
        cancelText: '#CBD5E1',
        cancelHoverBg: '#272D3E'
      }
    : {
        cardBg: '#FFFFFF',
        cardBorder: '1px solid #E2E8F0',
        cardShadow: '0 25px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(230, 0, 18, 0.1)',
        headerBg: '#F8FAFC',
        headerBorder: '1px solid #E2E8F0',
        title: '#0F172A',
        closeText: '#64748B',
        closeHoverText: '#0F172A',
        closeHoverBg: '#EDF2F7',
        message: '#1E293B',
        subMsgBg: '#F8FAFC',
        subMsgBorder: '1px solid #E2E8F0',
        subMsgLeft: '3px solid #E60012',
        subMsgText: '#64748B',
        footerBg: '#F8FAFC',
        footerBorder: '1px solid #E2E8F0',
        cancelBg: '#FFFFFF',
        cancelBorder: '1px solid #CBD5E1',
        cancelText: '#475569',
        cancelHoverBg: '#F1F5F9'
      };

  return (
    <div
      className="app-popup-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: isDark ? 'rgba(3, 6, 12, 0.78)' : 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleClose}
    >
      <div
        className="app-popup-card"
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: colors.cardBg,
          color: colors.message,
          borderRadius: 16,
          border: colors.cardBorder,
          boxShadow: colors.cardShadow,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Brand Accent Stripe */}
        <div
          style={{
            height: 3.5,
            width: '100%',
            background: stripeGradient
          }}
        />

        {/* Top Header */}
        <div
          style={{
            padding: '16px 20px 14px 20px',
            backgroundColor: colors.headerBg,
            borderBottom: colors.headerBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: badgeBg,
                border: `1px solid ${badgeBorder}`,
                color: badgeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isWarning ? <AlertTriangle size={22} strokeWidth={2.4} /> : <Trash2 size={22} strokeWidth={2.4} />}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-headline, sans-serif)',
                fontSize: '1.14rem',
                fontWeight: 800,
                margin: 0,
                color: colors.title,
                letterSpacing: '-0.01em',
                lineHeight: 1.3
              }}
            >
              {title || defaultTitle}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.closeText,
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.closeHoverBg;
              e.currentTarget.style.color = colors.closeHoverText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.closeText;
            }}
            title={isBn ? 'বন্ধ করুন' : 'Close'}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '20px 22px 22px 22px' }}>
          {message && (
            <p
              style={{
                fontSize: '0.96rem',
                color: colors.message,
                lineHeight: 1.65,
                margin: 0,
                whiteSpace: 'pre-line',
                fontWeight: 500,
                fontFamily: 'var(--font-body, sans-serif)'
              }}
            >
              {message}
            </p>
          )}

          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              backgroundColor: colors.subMsgBg,
              borderRadius: 8,
              border: colors.subMsgBorder,
              borderLeft: colors.subMsgLeft
            }}
          >
            <p
              style={{
                fontSize: '0.84rem',
                color: colors.subMsgText,
                lineHeight: 1.5,
                margin: 0,
                fontFamily: 'var(--font-subheadline, sans-serif)'
              }}
            >
              {subMessage !== undefined ? subMessage : defaultSubMessage}
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: colors.footerBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            backgroundColor: colors.footerBg
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '9px 18px',
              borderRadius: 7,
              border: colors.cancelBorder,
              backgroundColor: colors.cancelBg,
              color: colors.cancelText,
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.cancelHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.cancelBg;
            }}
          >
            {cancelText || defaultCancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '9px 22px',
              borderRadius: 7,
              background: btnBg,
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 16px rgba(230, 0, 18, 0.4)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            {isWarning ? <RotateCcw size={16} /> : <Trash2 size={16} />}
            <span>{confirmText || defaultConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
