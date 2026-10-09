import React from 'react';
import { useNews } from '../../context/NewsContext';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadProgressModal() {
  const { uploadProgress, language, adminLanguage } = useNews();
  const isBn = (adminLanguage || language) === 'bn';

  if (!uploadProgress || !uploadProgress.isOpen) return null;

  const isDone = uploadProgress.progress >= 100;
  const isError = uploadProgress.isError;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999999,
        minWidth: 320,
        maxWidth: 400,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRadius: 14,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(225, 29, 72, 0.2)',
        padding: '16px 18px',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: '#FFFFFF'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: isDone
              ? 'rgba(16, 185, 129, 0.2)'
              : isError
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(225, 29, 72, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {isDone ? (
            <CheckCircle2 size={20} color="#10B981" />
          ) : isError ? (
            <AlertCircle size={20} color="#EF4444" />
          ) : (
            <UploadCloud size={20} color="#E11D48" className="animate-bounce" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#F8FAFC',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {uploadProgress.fileName || (isBn ? 'মিডিয়া ফাইল আপলোড' : 'Media Upload')}
          </div>
          <div
            style={{
              fontSize: '0.76rem',
              color: '#94A3B8',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {uploadProgress.statusText || (isBn ? 'প্রক্রিয়াধীন...' : 'Processing...')}
          </div>
        </div>

        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: isDone ? '#10B981' : isError ? '#EF4444' : '#E11D48',
            fontFamily: 'monospace'
          }}
        >
          {uploadProgress.progress}%
        </div>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            width: `${uploadProgress.progress}%`,
            height: '100%',
            backgroundColor: isDone ? '#10B981' : isError ? '#EF4444' : '#E11D48',
            borderRadius: 4,
            transition: 'width 0.25s ease-out',
            boxShadow: isDone
              ? '0 0 10px rgba(16, 185, 129, 0.5)'
              : '0 0 10px rgba(225, 29, 72, 0.5)'
          }}
        />
      </div>
    </div>
  );
}
