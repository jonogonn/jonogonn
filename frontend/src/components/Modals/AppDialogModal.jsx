import React, { useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  X,
  Megaphone
} from 'lucide-react';

export default function AppDialogModal() {
  const { dialogConfig, closeDialog, language, adminLanguage } = useNews();
  const isBn = (adminLanguage || language) === 'bn';

  const {
    isOpen = false,
    type = 'info', // 'info' | 'warning' | 'error' | 'success' | 'confirm'
    title = '',
    message = '',
    subMessage = '',
    confirmText = '',
    cancelText = '',
    onConfirm = null,
    onCancel = null
  } = dialogConfig || {};

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

  // Type configuration
  const getTypeConfig = () => {
    switch (type) {
      case 'error':
      case 'danger':
        return {
          icon: <AlertCircle size={24} />,
          badgeColor: 'var(--primary-red)',
          badgeBg: 'rgba(230, 0, 18, 0.12)',
          btnBg: 'var(--primary-red)',
          defaultTitle: isBn ? 'ত্রুটি বা সতর্কতা' : 'Error Alert',
          defaultConfirmText: isBn ? 'ঠিক আছে' : 'OK'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} />,
          badgeColor: '#D97706',
          badgeBg: 'rgba(217, 119, 6, 0.14)',
          btnBg: '#D97706',
          defaultTitle: isBn ? 'সতর্কতা' : 'Warning',
          defaultConfirmText: isBn ? 'হ্যাঁ, নিশ্চিত' : 'Confirm'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={24} />,
          badgeColor: '#16A34A',
          badgeBg: 'rgba(22, 163, 74, 0.14)',
          btnBg: '#16A34A',
          defaultTitle: isBn ? 'সফল হয়েছে' : 'Success',
          defaultConfirmText: isBn ? 'ঠিক আছে' : 'Great, Done'
        };
      case 'confirm':
        return {
          icon: <HelpCircle size={24} />,
          badgeColor: 'var(--primary-red)',
          badgeBg: 'rgba(230, 0, 18, 0.12)',
          btnBg: 'var(--primary-red)',
          defaultTitle: isBn ? 'নিশ্চিতকরণ' : 'Please Confirm',
          defaultConfirmText: isBn ? 'হ্যাঁ, এগিয়ে যান' : 'Yes, Proceed'
        };
      case 'notice':
      case 'info':
      default:
        return {
          icon: <Info size={24} />,
          badgeColor: 'var(--primary-red)',
          badgeBg: 'rgba(230, 0, 18, 0.12)',
          btnBg: 'var(--primary-red)',
          defaultTitle: isBn ? 'বিজ্ঞপ্তি / তথ্য' : 'Information',
          defaultConfirmText: isBn ? 'ঠিক আছে' : 'OK, Got It'
        };
    }
  };

  const config = getTypeConfig();
  const isConfirmDialog = type === 'confirm' || (typeof onCancel === 'function' && cancelText);

  const handleConfirmClick = () => {
    if (typeof onConfirm === 'function') onConfirm();
    closeDialog();
  };

  const handleCancelClick = () => {
    if (typeof onCancel === 'function') onCancel();
    closeDialog();
  };

  return (
    <div
      className="app-popup-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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
          maxWidth: 460,
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          color: 'var(--text-main, #111111)',
          borderRadius: 14,
          border: '1px solid var(--border-color, #E2E8F0)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '16px 20px 14px 20px',
            borderBottom: '1px solid var(--border-color, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle, #F8FAFC)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: config.badgeBg,
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
                fontSize: '1.12rem',
                fontWeight: 800,
                margin: 0,
                color: 'var(--text-main, #111111)'
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
            aria-label="Close Dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Message */}
        <div style={{ padding: '20px 22px' }}>
          {message && (
            <p
              style={{
                fontSize: '0.94rem',
                color: 'var(--text-main, #111111)',
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: 'pre-line',
                fontWeight: 500
              }}
            >
              {message}
            </p>
          )}

          {subMessage && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted, #64748B)',
                lineHeight: 1.5,
                margin: '10px 0 0 0'
              }}
            >
              {subMessage}
            </p>
          )}
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            backgroundColor: 'var(--bg-subtle, #F8FAFC)'
          }}
        >
          {isConfirmDialog && (
            <button
              type="button"
              onClick={handleCancelClick}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid var(--border-color, #CBD5E1)',
                backgroundColor: 'var(--bg-card, transparent)',
                color: 'var(--text-main, #4B5563)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cancelText || (isBn ? 'বাতিল' : 'Cancel')}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmClick}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              backgroundColor: config.btnBg,
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              transition: 'opacity 0.15s ease'
            }}
          >
            <span>{confirmText || config.defaultConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
