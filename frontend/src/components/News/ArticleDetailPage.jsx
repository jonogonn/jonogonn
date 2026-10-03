import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Clock,
  Eye,
  BookOpen,
  Share2,
  Copy,
  Check,
  Printer,
  ChevronRight,
  ArrowLeft,
  User,
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';
import { FacebookIcon } from '../Icons/SocialIcons';
import AdSenseSlot from '../Ads/AdSenseSlot';

export default function ArticleDetailPage() {
  const {
    currentArticle,
    openArticle,
    goToHome,
    language,
    articles,
    categories,
    setActiveCategory
  } = useNews();

  const [fontSize, setFontSize] = useState(1.15); // rem
  const [copied, setCopied] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([
    {
      id: 'c1',
      name: 'আহমেদ তানভীর',
      text: 'খুবই সময়োপযোগী এবং বিস্তারিত প্রতিবেদন। ধন্যবাদ জনগণ নিউজ টিমকে।',
      date: 'আজ, সকাল ১১:৩০'
    }
  ]);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const isBn = language === 'bn';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentArticle?.id]);

  if (!currentArticle) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=450');
  };

  const handleWhatsAppShare = () => {
    const title = encodeURIComponent(isBn ? currentArticle.titleBn : currentArticle.titleEn);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://api.whatsapp.com/send?text=${title}%20${url}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentName || !commentText) return;
    setCommentsList([
      {
        id: `c-${Date.now()}`,
        name: commentName,
        text: commentText,
        date: isBn ? 'এইমাত্র' : 'Just now'
      },
      ...commentsList
    ]);
    setCommentName('');
    setCommentText('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 4000);
  };

  // Category matching
  const catObj = categories.find((c) => c.id === currentArticle.category);

  // Most Read and Related
  const mostReadList = [...articles]
    .filter((a) => a.id !== currentArticle.id)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const relatedArticles = articles
    .filter((a) => a.id !== currentArticle.id && (a.category === currentArticle.category || !currentArticle.category))
    .slice(0, 3);

  return (
    <div className="article-page-container" style={{ padding: '16px 0 40px 0' }}>
      <div className="container">
        {/* 1. Breadcrumb & Back Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: 16,
            paddingBottom: 10,
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={goToHome}
              style={{ color: 'var(--primary-red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <ArrowLeft size={14} />
              <span>{isBn ? 'প্রচ্ছদ' : 'Home'}</span>
            </button>
            <ChevronRight size={14} />
            <button
              onClick={() => {
                setActiveCategory(currentArticle.category || 'latest');
                goToHome();
              }}
              style={{ color: 'var(--text-main)', fontWeight: 600 }}
            >
              {isBn ? currentArticle.categoryBn || catObj?.nameBn || 'বাংলাদেশ' : currentArticle.category || catObj?.nameEn || 'National'}
            </button>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-light)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isBn ? currentArticle.titleBn : currentArticle.titleEn}
            </span>
          </div>

          <button
            onClick={goToHome}
            className="admin-btn-secondary"
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            ← {isBn ? 'সব সংবাদ দেখুন' : 'Back to News'}
          </button>
        </div>

        {/* 2. Main Two-Column Layout (Article Content 8 cols + Sidebar 4 cols) */}
        <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 32 }} className="article-page-grid">
          {/* Main Article Body */}
          <article className="article-main-column">
            {/* Category Badge */}
            <span className="badge-category" style={{ marginBottom: 12 }}>
              {isBn ? currentArticle.categoryBn || catObj?.nameBn || 'জাতীয়' : currentArticle.category || catObj?.nameEn || 'National'}
            </span>

            {/* Main Headline (Anek Bangla 700) */}
            <h1
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '2.1rem',
                fontWeight: 800,
                lineHeight: 1.3,
                color: 'var(--text-main)',
                margin: '12px 0 16px 0'
              }}
            >
              {isBn ? currentArticle.titleBn : currentArticle.titleEn}
            </h1>

            {/* Metadata Line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: 20,
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              {/* Author & Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-main)' }}>
                  <User size={16} color="var(--primary-red)" />
                  <span>{currentArticle.author || 'জনগণ নিউজ ডেস্ক'}</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={15} color="var(--primary-red)" />
                  <span>{isBn ? currentArticle.dateBn : currentArticle.dateEn}</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={15} color="var(--primary-red)" />
                  <span>{isBn ? currentArticle.readTimeBn || '৪ মিনিট পড়তে' : currentArticle.readTimeEn || '4 min read'}</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={15} color="var(--primary-red)" />
                  <span>{currentArticle.views || 1} {isBn ? 'ভিউ' : 'views'}</span>
                </div>
              </div>

              {/* Font Size Adjuster */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-subtle)', padding: '3px 8px', borderRadius: 4 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 4 }}>{isBn ? 'হরফ:' : 'Font:'}</span>
                <button onClick={() => setFontSize((f) => Math.max(0.95, f - 0.1))} style={{ padding: '2px 6px', fontWeight: 700 }} title="ছোট করুন">A-</button>
                <button onClick={() => setFontSize(1.15)} style={{ padding: '2px 6px', fontSize: '0.85rem' }} title="সাধারণ সাইজ">A</button>
                <button onClick={() => setFontSize((f) => Math.min(1.6, f + 0.1))} style={{ padding: '2px 6px', fontWeight: 700 }} title="বড় করুন">A+</button>
              </div>
            </div>

            {/* Social Share Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginRight: 4 }}>
                {isBn ? 'শেয়ার করুন:' : 'Share:'}
              </span>
              <button
                onClick={handleFacebookShare}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1877F2', color: '#fff', padding: '6px 12px', borderRadius: 3, fontSize: '0.82rem', fontWeight: 600 }}
              >
                <FacebookIcon size={15} color="#fff" />
                <span>Facebook</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', padding: '6px 12px', borderRadius: 3, fontSize: '0.82rem', fontWeight: 600 }}
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCopyLink}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 3, fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}
              >
                {copied ? <Check size={15} color="#16A34A" /> : <Copy size={15} />}
                <span>{copied ? (isBn ? 'কপি হয়েছে!' : 'Link Copied!') : (isBn ? 'লিঙ্ক কপি' : 'Copy Link')}</span>
              </button>
              <button
                onClick={handlePrint}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 3, fontSize: '0.82rem', color: 'var(--text-main)' }}
                title="Print Article"
              >
                <Printer size={15} />
                <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
              </button>
            </div>

            {/* Large Featured High-Res Image */}
            {currentArticle.imageUrl && (
              <div style={{ marginBottom: 24 }}>
                <img
                  src={currentArticle.imageUrl}
                  alt={isBn ? currentArticle.titleBn : currentArticle.titleEn}
                  style={{ width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: 4 }}
                />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 6, fontStyle: 'italic' }}>
                  {isBn ? currentArticle.titleBn : currentArticle.titleEn} | ছবি: জনগণ নিউজ
                </div>
              </div>
            )}

            {/* Lead Highlight Excerpt Box */}
            {(currentArticle.excerptBn || currentArticle.excerptEn) && (
              <div
                style={{
                  fontFamily: 'var(--font-subheadline)',
                  fontSize: `${fontSize * 1.05}rem`,
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-subtle)',
                  borderLeft: '4px solid var(--primary-red)',
                  padding: '16px 20px',
                  borderRadius: '0 4px 4px 0',
                  marginBottom: 24,
                  lineHeight: 1.6
                }}
              >
                {isBn ? currentArticle.excerptBn : currentArticle.excerptEn}
              </div>
            )}

            {/* Main Article Paragraphs */}
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: `${fontSize}rem`,
                lineHeight: 1.85,
                color: 'var(--text-main)',
                whiteSpace: 'pre-line',
                marginBottom: 32
              }}
            >
              {isBn ? currentArticle.contentBn || currentArticle.excerptBn : currentArticle.contentEn || currentArticle.excerptEn}
            </div>

            {/* In-Article Mid Banner Ad */}
            <AdSenseSlot slotId="midContentBanner" customClass="ad-slot-970x90" />

            {/* Interactive Reader Comments Section */}
            <div style={{ marginTop: 36, paddingTop: 24, borderTop: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <MessageSquare size={22} color="var(--primary-red)" />
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', fontWeight: 700 }}>
                  {isBn ? 'পাঠকের মন্তব্য' : 'Reader Comments'} ({commentsList.length})
                </h3>
              </div>

              {commentSuccess && (
                <div style={{ padding: '10px 14px', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: 4, marginBottom: 16, fontSize: '0.9rem', fontWeight: 600 }}>
                  {isBn ? 'আপনার মন্তব্য সফলভাবে জমা হয়েছে!' : 'Your comment has been submitted successfully!'}
                </div>
              )}

              {/* Comment Submission Form */}
              <form onSubmit={handleAddComment} style={{ backgroundColor: 'var(--bg-subtle)', padding: 18, borderRadius: 6, border: '1px solid var(--border-color)', marginBottom: 24 }}>
                <div style={{ marginBottom: 12 }}>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder={isBn ? 'আপনার নাম লিখুন *' : 'Your name *'}
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    placeholder={isBn ? 'এই সংবাদের বিষয়ে আপনার মতামত লিখুন...' : 'Write your comment here...'}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="admin-btn-primary">
                  <Send size={15} />
                  <span>{isBn ? 'মন্তব্য পাঠান' : 'Post Comment'}</span>
                </button>
              </form>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {commentsList.map((c) => (
                  <div key={c.id} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{c.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{c.date}</span>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Stories Grid */}
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: '2px solid var(--border-color)' }}>
              <div className="section-header">
                <h3 className="section-title">
                  {isBn ? 'সম্পর্কিত আরও সংবাদ' : 'Related Stories'}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {relatedArticles.map((rel) => (
                  <article
                    key={rel.id}
                    className="news-card-standard"
                    onClick={() => openArticle(rel)}
                    title={isBn ? rel.titleBn : rel.titleEn}
                  >
                    <div className="news-card-img-wrap">
                      <img src={rel.imageUrl} alt="" className="news-card-img" />
                    </div>
                    <div className="news-card-body">
                      <h4 className="news-card-title" style={{ fontSize: '0.98rem' }}>
                        {isBn ? rel.titleBn : rel.titleEn}
                      </h4>
                      <div className="news-card-date">
                        <Clock size={12} color="var(--primary-red)" />
                        <span>{isBn ? rel.dateBn : rel.dateEn}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </article>

          {/* Right Column Sidebar */}
          <aside className="article-sidebar">
            {/* Top 300x250 Ad */}
            <AdSenseSlot slotId="leadSidebarAd" customClass="ad-slot-300x250" />

            {/* Most Read 01-05 Ranking Box */}
            <div className="tabbed-ranking-box" style={{ marginBottom: 24 }}>
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--primary-red)', color: 'var(--white)', fontWeight: 700, fontFamily: 'var(--font-headline)', fontSize: '1.05rem' }}>
                {isBn ? 'সর্বাধিক পঠিত সংবাদ' : 'Most Read Stories'}
              </div>

              <div className="ranking-list">
                {mostReadList.map((art, idx) => {
                  const numStr = isBn
                    ? String(idx + 1).padStart(2, '0').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])
                    : String(idx + 1).padStart(2, '0');

                  return (
                    <div
                      key={art.id}
                      className="ranking-item"
                      onClick={() => openArticle(art)}
                      title={isBn ? art.titleBn : art.titleEn}
                    >
                      <span className="ranking-num">{numStr}</span>
                      <p className="ranking-title">{isBn ? art.titleBn : art.titleEn}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tall Sidebar Ad (300x600) */}
            <AdSenseSlot slotId="videoSidebarAd" customClass="ad-slot-300x600" />
          </aside>
        </div>
      </div>
    </div>
  );
}
