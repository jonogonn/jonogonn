import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { X, Clock, Eye, Share2, Copy, Check, BookOpen } from 'lucide-react';
import { FacebookIcon } from '../Icons/SocialIcons';

export default function ArticleModal() {
  const { selectedArticle, setSelectedArticle, language, articles, incrementViews } = useNews();
  const [fontSize, setFontSize] = useState(1.1); // in rem
  const [copied, setCopied] = useState(false);
  const isBn = language === 'bn';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedArticle(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedArticle]);

  if (!selectedArticle) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const relatedArticles = articles
    .filter((a) => a.id !== selectedArticle.id)
    .slice(0, 3);

  return (
    <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <span className="badge-category">
            {isBn ? selectedArticle.categoryBn || 'সংবাদ' : selectedArticle.category || 'News'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Font Size Adjuster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 4 }}>
              <button onClick={() => setFontSize((f) => Math.max(0.9, f - 0.1))} style={{ padding: '2px 6px', fontWeight: 700 }} title="Font Size Smaller">A-</button>
              <button onClick={() => setFontSize(1.1)} style={{ padding: '2px 6px', fontSize: '0.85rem' }} title="Reset Font Size">A</button>
              <button onClick={() => setFontSize((f) => Math.min(1.6, f + 0.1))} style={{ padding: '2px 6px', fontWeight: 700 }} title="Font Size Bigger">A+</button>
            </div>

            {/* Close Button */}
            <button className="modal-close-btn" onClick={() => setSelectedArticle(null)} aria-label="Close article">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="modal-body">
          <h1 className="article-full-title">
            {isBn ? selectedArticle.titleBn : selectedArticle.titleEn}
          </h1>

          <div className="article-full-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={15} color="var(--primary-red)" />
                {isBn ? selectedArticle.dateBn : selectedArticle.dateEn}
              </span>
              <span>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Eye size={15} color="var(--primary-red)" />
                {selectedArticle.views || 1} {isBn ? 'বার পড়া হয়েছে' : 'views'}
              </span>
              {selectedArticle.author && (
                <>
                  <span>|</span>
                  <span>✍️ {selectedArticle.author}</span>
                </>
              )}
            </div>

            {/* Share Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={handleFacebookShare}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1877F2', color: '#fff', padding: '4px 8px', borderRadius: 3, fontSize: '0.78rem', fontWeight: 600 }}
              >
                <FacebookIcon size={14} color="#fff" />
                <span>Share</span>
              </button>
              <button
                onClick={handleCopyLink}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: 3, fontSize: '0.78rem' }}
              >
                {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied!') : (isBn ? 'লিঙ্ক কপি' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Featured Image */}
          {selectedArticle.imageUrl && (
            <img
              src={selectedArticle.imageUrl}
              alt={isBn ? selectedArticle.titleBn : selectedArticle.titleEn}
              className="article-main-image"
            />
          )}

          {/* Lead Summary */}
          {(selectedArticle.excerptBn || selectedArticle.excerptEn) && (
            <div
              style={{
                fontFamily: 'var(--font-subheadline)',
                fontSize: `${fontSize * 1.08}rem`,
                fontWeight: 600,
                color: 'var(--primary-red)',
                borderLeft: '3px solid var(--primary-red)',
                paddingLeft: 14,
                marginBottom: 20
              }}
            >
              {isBn ? selectedArticle.excerptBn : selectedArticle.excerptEn}
            </div>
          )}

          {/* Article Main Text */}
          <div
            className="article-content-text"
            style={{ fontSize: `${fontSize}rem` }}
            dangerouslySetInnerHTML={{
              __html: isBn
                ? selectedArticle.contentBn || selectedArticle.excerptBn || ''
                : selectedArticle.contentEn || selectedArticle.excerptEn || ''
            }}
          />

          {/* Related Articles Section */}
          <div style={{ marginTop: 36, paddingTop: 20, borderTop: '2px solid var(--border-color)' }}>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
              {isBn ? 'আরও পড়ুন' : 'Related Stories'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    incrementViews(rel.id);
                    setSelectedArticle(rel);
                  }}
                  style={{ cursor: 'pointer', background: 'var(--bg-subtle)', padding: 10, borderRadius: 4, border: '1px solid var(--border-color)' }}
                >
                  <img
                    src={rel.imageUrl}
                    alt={isBn ? rel.titleBn : rel.titleEn}
                    style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 3, marginBottom: 8 }}
                  />
                  <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.3 }}>
                    {isBn ? rel.titleBn : rel.titleEn}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
