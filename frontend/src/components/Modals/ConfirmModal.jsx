import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, HelpCircle, X, RotateCcw } from 'lucide-react';

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
  isBn = true
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const defaultTitle = isBn
    ? type === 'warning' ? 'সতর্কতা ও নিশ্চিতকরণ' : 'মুছে ফেলার নিশ্চিতকরণ'
    : type === 'warning' ? 'Warning & Confirmation' : 'Confirm Deletion';

  const defaultConfirmText = isBn
    ? type === 'warning' ? 'হ্যাঁ, নিশ্চিত করুন' : 'হ্যাঁ, মুছে ফেলুন'
    : type === 'warning' ? 'Confirm' : 'Yes, Delete';

  const defaultCancelText = isBn ? 'বাতিল' : 'Cancel';
  const defaultSubMessage = isBn ? 'এই কাজটি সম্পন্ন করার পর এটি আর পূর্বাবস্থায় ফেরানো যাবে না।' : 'This action cannot be undone.';

  const isWarning = type === 'warning';
  const iconColor = isWarning ? '#EAB308' : 'var(--primary-red)';
  const iconBg = isWarning ? 'rgba(234, 179, 8, 0.14)' : 'rgba(230, 0, 18, 0.12)';
  const btnBg = isWarning ? '#D97706' : 'var(--primary-red)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 12,
          width: 460,
          maxWidth: '95vw',
          padding: '24px 24px 20px 24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button top right */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex'
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Content Area */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingTop: 4 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isWarning ? <AlertTriangle size={26} /> : <Trash2 size={24} />}
          </div>

          <div style={{ flex: 1, paddingRight: 10 }}>
            <h3
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.18rem',
                fontWeight: 800,
                margin: '0 0 6px 0',
                color: 'var(--text-main)'
              }}
            >
              {title || defaultTitle}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.92rem',
                color: 'var(--text-main)',
                lineHeight: 1.55,
                fontWeight: 500
              }}
            >
              {message}
            </p>
            <p
              style={{
                margin: '8px 0 0 0',
                fontSize: '0.78rem',
                color: 'var(--text-light)',
                lineHeight: 1.4
              }}
            >
              {subMessage !== undefined ? subMessage : defaultSubMessage}
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 4,
            borderTop: '1px solid var(--border-color)',
            paddingTop: 14
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 18px',
              fontSize: '0.88rem',
              fontWeight: 600,
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            {cancelText || defaultCancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '8px 20px',
              fontSize: '0.88rem',
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              backgroundColor: btnBg,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {isWarning ? <RotateCcw size={15} /> : <Trash2 size={15} />}
            <span>{confirmText || defaultConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
