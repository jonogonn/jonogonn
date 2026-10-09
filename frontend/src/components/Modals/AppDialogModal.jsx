import React, { useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  X
} from 'lucide-react';

export default function AppDialogModal() {
  const {
    dialogConfig,
    closeDialog,
    language,
    adminLanguage,
    adminTheme,
    theme,
    isAdminOpen
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';

  const {
    isOpen = false,
    type = 'info', // 'info' | 'warning' | 'error' | 'danger' | 'success' | 'confirm'
    title = '',
    message = '',
    subMessage = '',
    confirmText = '',
    cancelText = '',
    onConfirm = null,
    onCancel = null,
    isConfirm = false
  } = dialogConfig || {};

  // Theme Detection: dark newsroom palette if in admin dashboard or if dark mode active
  const isCurrentlyAdmin =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') ||
      Boolean(isAdminOpen) ||
      Boolean(document.querySelector('.admin-dashboard-wrap')));

  const isDark = (adminTheme || theme) === 'dark' || isCurrentlyAdmin;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (typeof onCancel === 'function') onCancel();
        closeDialog();
      } else if (e.key === 'Enter') {
        if (typeof onConfirm === 'function') onConfirm();
        closeDialog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm, closeDialog]);

  if (!isOpen) return null;

  // Type configuration with site branding & Jonogon Red accents
  const getTypeConfig = () => {
    switch (type) {
      case 'error':
      case 'danger':
        return {
          icon: <AlertCircle size={22} strokeWidth={2.4} />,
          badgeColor: '#FF384D',
          badgeBg: isDark ? 'rgba(230, 0, 18, 0.18)' : 'rgba(230, 0, 18, 0.12)',
          badgeBorder: isDark ? 'rgba(230, 0, 18, 0.35)' : 'rgba(230, 0, 18, 0.25)',
          stripeGradient: 'linear-gradient(90deg, #E60012 0%, #FF384D 50%, #99000C 100%)',
          btnBg: 'linear-gradient(135deg, #E60012 0%, #B8000E 100%)',
          btnShadow: '0 4px 16px rgba(230, 0, 18, 0.45)',
          defaultTitle: isBn ? 'সতর্কতা / ত্রুটি' : 'Action Alert',
          defaultConfirmText: isBn ? 'ঠিক আছে' : 'OK'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={22} strokeWidth={2.4} />,
          badgeColor: '#F59E0B',
          badgeBg: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.12)',
          badgeBorder: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.25)',
          stripeGradient: 'linear-gradient(90deg, #F59E0B 0%, #E60012 50%, #F59E0B 100%)',
          btnBg: 'linear-gradient(135deg, #E60012 0%, #C4000F 100%)',
          btnShadow: '0 4px 16px rgba(230, 0, 18, 0.38)',
          defaultTitle: isBn ? 'নিশ্চিতকরণ' : 'Please Confirm',
          defaultConfirmText: isBn ? 'হ্যাঁ, নিশ্চিত' : 'Confirm'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={22} strokeWidth={2.4} />,
          badgeColor: '#10B981',
          badgeBg: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.12)',
          badgeBorder: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)',
          stripeGradient: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #059669 100%)',
          btnBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          btnShadow: '0 4px 16px rgba(16, 185, 129, 0.38)',
          defaultTitle: isBn ? 'সফল হয়েছে' : 'Success',
          defaultConfirmText: isBn ? 'ঠিক আছে' : 'OK, Done'
        };
      case 'confirm':
        return {
          icon: <HelpCircle size={22} strokeWidth={2.4} />,
          badgeColor: '#E60012',
          badgeBg: isDark ? 'rgba(230, 0, 18, 0.18)' : 'rgba(230, 0, 18, 0.12)',
          badgeBorder: isDark ? 'rgba(230, 0, 18, 0.35)' : 'rgba(230, 0, 18, 0.25)',
          stripeGradient: 'linear-gradient(90deg, #E60012 0%, #FF2E43 50%, #B8000E 100%)',
          btnBg: 'linear-gradient(135deg, #E60012 0%, #C4000F 100%)',
          btnShadow: '0 4px 16px rgba(230, 0, 18, 0.38)',
          defaultTitle: isBn ? 'নিশ্চিতকরণ' : 'Please Confirm',
          defaultConfirmText: isBn ? 'হ্যাঁ, এগিয়ে যান' : 'Yes, Proceed'
        };
      case 'notice':
      case 'info':
      default:
        return {
          icon: <Info size={22} strokeWidth={2.4} />,
          badgeColor: '#E60012',
          badgeBg: isDark ? 'rgba(230, 0, 18, 0.18)' : 'rgba(230, 0, 18, 0.12)',
          badgeBorder: isDark ? 'rgba(230, 0, 18, 0.35)' : 'rgba(230, 0, 18, 0.25)',
          stripeGradient: 'linear-gradient(90deg, #E60012 0%, #FF2E43 50%, #99000C 100%)',
          btnBg: 'linear-gradient(135deg, #E60012 0%, #C4000F 100%)',
          btnShadow: '0 4px 16px rgba(230, 0, 18, 0.38)',
          defaultTitle: isBn ? 'বিজ্ঞপ্তি / তথ্য' : 'Information',
          defaultConfirmText: isBn ? 'ঠিক আছে' : 'OK, Got It'
        };
    }
  };

  const config = getTypeConfig();

  // Dialog is a confirmation if isConfirm is true, type is confirm/warning, cancelText was given, or onCancel callback exists
  const isConfirmDialog =
    Boolean(isConfirm) ||
    type === 'confirm' ||
    Boolean(cancelText) ||
    (typeof onCancel === 'function' && type !== 'info' && type !== 'success' && type !== 'error');

  const handleConfirmClick = () => {
    if (typeof onConfirm === 'function') onConfirm();
    closeDialog();
  };

  const handleCancelClick = () => {
    if (typeof onCancel === 'function') onCancel();
    closeDialog();
  };

  // Modern branded theme surface tokens
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
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleCancelClick}
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
            background: config.stripeGradient
          }}
        />

        {/* Top Header Bar */}
        <div
          style={{
            padding: '16px 20px 14px 20px',
            borderBottom: colors.headerBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            backgroundColor: colors.headerBg
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: config.badgeBg,
                border: `1px solid ${config.badgeBorder}`,
                color: config.badgeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {config.icon}
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
              {title || config.defaultTitle}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleCancelClick}
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
            aria-label="Close Dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Message */}
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

          {subMessage && (
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
                {subMessage}
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
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
          {isConfirmDialog && (
            <button
              type="button"
              onClick={handleCancelClick}
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
              {cancelText || (isBn ? 'বাতিল' : 'Cancel')}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmClick}
            style={{
              padding: '9px 22px',
              borderRadius: 7,
              background: config.btnBg,
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: config.btnShadow,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            <span>{confirmText || config.defaultConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
