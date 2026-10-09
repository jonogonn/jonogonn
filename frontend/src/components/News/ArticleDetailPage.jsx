import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { updateSEO } from '../../services/seoService';
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
  Send
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
    if (currentArticle) {
      const title = isBn ? currentArticle.titleBn : currentArticle.titleEn;
      const desc = isBn
        ? currentArticle.excerptBn || currentArticle.contentBn?.slice(0, 160)
        : currentArticle.excerptEn || currentArticle.contentEn?.slice(0, 160);
      const slug = currentArticle.slug || currentArticle.id;
      const url = `${window.location.origin}/news/${encodeURIComponent(slug)}`;

      updateSEO({
        title,
        description: desc,
        url,
        imageUrl: currentArticle.imageUrl,
        type: 'article',
        publishedTime: currentArticle.dateEn || new Date().toISOString(),
        author: currentArticle.author || 'জনগণ নিউজ ডেস্ক',
        section: isBn ? currentArticle.categoryBn || 'জাতীয়' : currentArticle.category || 'National',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: title,
          image: [currentArticle.imageUrl],
          datePublished: currentArticle.dateEn || new Date().toISOString(),
          dateModified: new Date().toISOString(),
          author: [
            {
              '@type': 'Person',
              name: currentArticle.author || 'জনগণ নিউজ ডেস্ক'
            }
          ],
          publisher: {
            '@type': 'NewsMediaOrganization',
            name: 'জনগণ.নিউজ',
            logo: {
              '@type': 'ImageObject',
              url: `${window.location.origin}/logo.svg`
            }
          },
          description: desc,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url
          }
        }
      });
    }
  }, [currentArticle?.id, isBn]);

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
    <div className="article-page-container">
      <div className="container">
        {/* 1. Breadcrumb & Back Navigation */}
        <div className="article-breadcrumb-bar">
          <div className="article-breadcrumb-left">
            <button
              onClick={goToHome}
              className="article-breadcrumb-home-btn"
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
              className="article-breadcrumb-cat-btn"
            >
              {isBn ? currentArticle.categoryBn || catObj?.nameBn || 'বাংলাদেশ' : currentArticle.category || catObj?.nameEn || 'National'}
            </button>
            <ChevronRight size={14} />
            <span className="article-breadcrumb-title-trunc">
              {isBn ? currentArticle.titleBn : currentArticle.titleEn}
            </span>
          </div>

          <button
            onClick={goToHome}
            className="admin-btn-secondary article-back-news-btn"
          >
            ← {isBn ? 'সব সংবাদ দেখুন' : 'Back to News'}
          </button>
        </div>

        {/* 2. Main Two-Column Layout (Article Content 8 cols + Sidebar 4 cols) */}
        <div className="article-page-grid">
          {/* Main Article Body */}
          <article className="article-main-column">
            {/* Category Badge */}
            <span className="badge-category" style={{ marginBottom: 12 }}>
              {isBn ? currentArticle.categoryBn || catObj?.nameBn || 'জাতীয়' : currentArticle.category || catObj?.nameEn || 'National'}
            </span>

            {/* Main Headline */}
            <h1 className="article-main-headline">
              {isBn ? currentArticle.titleBn : currentArticle.titleEn}
            </h1>

            {/* Metadata Line */}
            <div className="article-meta-bar">
              {/* Author & Date */}
              <div className="article-meta-left">
                <div className="article-meta-author">
                  <User size={16} color="var(--primary-red)" />
                  <span>{currentArticle.author || 'জনগণ নিউজ ডেস্ক'}</span>
                </div>
                <span>•</span>
                <div className="article-meta-item">
                  <Clock size={15} color="var(--primary-red)" />
                  <span>{isBn ? currentArticle.dateBn : currentArticle.dateEn}</span>
                </div>
                <span>•</span>
                <div className="article-meta-item">
                  <BookOpen size={15} color="var(--primary-red)" />
                  <span>{isBn ? currentArticle.readTimeBn || '৪ মিনিট পড়তে' : currentArticle.readTimeEn || '4 min read'}</span>
                </div>
                <span>•</span>
                <div className="article-meta-item">
                  <Eye size={15} color="var(--primary-red)" />
                  <span>{currentArticle.views || 1} {isBn ? 'ভিউ' : 'views'}</span>
                </div>
              </div>

              {/* Font Size Adjuster */}
              <div className="article-font-adjuster">
                <span className="article-font-label">{isBn ? 'হরফ:' : 'Font:'}</span>
                <button onClick={() => setFontSize((f) => Math.max(0.95, f - 0.1))} title="ছোট করুন">A-</button>
                <button onClick={() => setFontSize(1.15)} title="সাধারণ সাইজ">A</button>
                <button onClick={() => setFontSize((f) => Math.min(1.6, f + 0.1))} title="বড় করুন">A+</button>
              </div>
            </div>

            {/* Social Share Toolbar */}
            <div className="article-social-share-bar">
              <span className="article-share-label">
                {isBn ? 'শেয়ার করুন:' : 'Share:'}
              </span>
              <button
                onClick={handleFacebookShare}
                className="article-share-btn share-fb"
              >
                <FacebookIcon size={15} color="#fff" />
                <span>Facebook</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="article-share-btn share-wa"
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="article-share-btn share-copy"
              >
                {copied ? <Check size={15} color="#16A34A" /> : <Copy size={15} />}
                <span>{copied ? (isBn ? 'কপি হয়েছে!' : 'Link Copied!') : (isBn ? 'লিঙ্ক কপি' : 'Copy Link')}</span>
              </button>
              <button
                onClick={handlePrint}
                className="article-share-btn share-print"
                title="Print Article"
              >
                <Printer size={15} />
                <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
              </button>
            </div>

            {/* Large Featured High-Res Image */}
            {currentArticle.imageUrl && (
              <div className="article-featured-image-wrap">
                <img
                  src={currentArticle.imageUrl}
                  alt={isBn ? currentArticle.titleBn : currentArticle.titleEn}
                  className="article-featured-image"
                />
                <div className="article-image-caption">
                  {isBn ? currentArticle.titleBn : currentArticle.titleEn} | ছবি: জনগণ নিউজ
                </div>
              </div>
            )}

            {/* Lead Highlight Excerpt Box */}
            {(currentArticle.excerptBn || currentArticle.excerptEn) && (
              <div
                className="article-excerpt-callout"
                style={{ fontSize: `${fontSize * 1.05}rem` }}
              >
                {isBn ? currentArticle.excerptBn : currentArticle.excerptEn}
              </div>
            )}

            {/* Main Article Paragraphs */}
            <div
              className="article-body-text"
              style={{ fontSize: `${fontSize}rem` }}
              dangerouslySetInnerHTML={{
                __html: isBn
                  ? currentArticle.contentBn || currentArticle.excerptBn || ''
                  : currentArticle.contentEn || currentArticle.excerptEn || ''
              }}
            />

            {/* In-Article Mid Banner Ad */}
            <AdSenseSlot slotId="midContentBanner" customClass="ad-slot-970x90" />

            {/* Interactive Reader Comments Section */}
            <div className="article-comments-section">
              <div className="article-comments-header">
                <MessageSquare size={22} color="var(--primary-red)" />
                <h3>
                  {isBn ? 'পাঠকের মন্তব্য' : 'Reader Comments'} ({commentsList.length})
                </h3>
              </div>

              {commentSuccess && (
                <div className="article-comment-alert-success">
                  {isBn ? 'আপনার মন্তব্য সফলভাবে জমা হয়েছে!' : 'Your comment has been submitted successfully!'}
                </div>
              )}

              {/* Comment Submission Form */}
              <form onSubmit={handleAddComment} className="article-comment-form">
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
                  <div key={c.id} className="article-comment-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{c.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{c.date}</span>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Stories Grid */}
            <div className="article-related-section">
              <div className="section-header">
                <h3 className="section-title">
                  {isBn ? 'সম্পর্কিত আরও সংবাদ' : 'Related Stories'}
                </h3>
              </div>

              <div className="article-related-grid">
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
