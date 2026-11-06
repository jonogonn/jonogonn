import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { updateSEO, buildNewsArticleSchema } from '../../services/seoService';
import SEOHead from '../SEO/SEOHead';
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
  MapPin,
  Tag,
  MessageSquare,
  Send,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { FacebookIcon } from '../Icons/SocialIcons';
import AdSenseSlot from '../Ads/AdSenseSlot';
import { fetchCommentsFromMariaDb, saveCommentToMariaDb } from '../../utils/mariaDbSync';
import { ArticleDetailSkeleton } from '../UI/NewsSkeletonLoader';
import { formatViewsBn } from '../../utils/viewHelper';

export default function ArticleDetailPage() {
  const {
    currentArticle,
    openArticle,
    goToHome,
    language,
    articles,
    categories,
    setActiveCategory,
    isSingleArticleLoading,
    articleNotFound
  } = useNews();

  const [fontSize, setFontSize] = useState(1.15); // rem
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState('');

  const isBn = language === 'bn';

  const handleFontToggle = () => {
    setFontSize((prev) => {
      if (prev >= 1.45) return 1.05;
      return +(prev + 0.15).toFixed(2);
    });
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked((prev) => !prev);
  };

  const getRelativeTimeBn = (dateStr) => {
    if (!dateStr) return isBn ? 'কিছুক্ষণ আগে' : 'Just now';
    if (typeof dateStr === 'string' && (dateStr.includes('আগে') || dateStr.includes('ঘণ্টা') || dateStr.includes('মিনিট'))) {
      return dateStr;
    }
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const diffMs = Date.now() - d.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 1) {
          const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
          return isBn
            ? `${String(diffMins).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])} মিনিট আগে`
            : `${diffMins} min ago`;
        } else if (diffHours < 24) {
          return isBn
            ? `${String(diffHours).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])} ঘণ্টা আগে`
            : `${diffHours} hr ago`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          if (diffDays <= 7) {
            return isBn
              ? `${String(diffDays).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])} দিন আগে`
              : `${diffDays} days ago`;
          }
        }
      }
    } catch (e) {}
    return dateStr;
  };

  // Helper to generate short, clean, beautiful canonical URL (e.g. https://jonogon.news/news/28)
  const getShortShareUrl = (art) => {
    if (!art) return typeof window !== 'undefined' ? window.location.href : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jonogon.news';
    const id = art.db_id || art.id || art.slug;
    return `${origin}/news/${id}`;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentArticle) {
      const url = getShortShareUrl(currentArticle);
      const schema = buildNewsArticleSchema(currentArticle, { language, url });
      const title = isBn ? currentArticle.titleBn : currentArticle.titleEn;

      updateSEO({
        title,
        description: schema?.description,
        url,
        imageUrl: schema?.image?.url,
        imageWidth: schema?.image?.width || 1200,
        imageHeight: schema?.image?.height || 675,
        type: 'article',
        publishedTime: schema?.datePublished,
        modifiedTime: schema?.dateModified,
        author: schema?.author?.[0]?.name || 'জনগণ নিউজ ডেস্ক',
        section: schema?.articleSection,
        jsonLd: schema
      });
    }
  }, [currentArticle?.id, isBn]);

  useEffect(() => {
    let isSubscribed = true;
    if (currentArticle) {
      const targetId = currentArticle.post_id || currentArticle.id || currentArticle.slug;
      if (targetId) {
        setCommentLoading(true);
        fetchCommentsFromMariaDb(targetId)
          .then((data) => {
            if (isSubscribed) {
              setCommentsList(Array.isArray(data) ? data : []);
            }
          })
          .catch((err) => {
            console.warn('Failed to load comments from MariaDB:', err);
          })
          .finally(() => {
            if (isSubscribed) setCommentLoading(false);
          });
      }
    }
    return () => {
      isSubscribed = false;
    };
  }, [currentArticle?.id, currentArticle?.post_id]);

  const handleCopyLink = () => {
    const shortUrl = getShortShareUrl(currentArticle);
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFacebookShare = () => {
    const shortUrl = getShortShareUrl(currentArticle);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`, '_blank', 'width=600,height=450');
  };

  const handleTwitterShare = () => {
    const title = isBn ? currentArticle.titleBn : currentArticle.titleEn;
    const shortUrl = getShortShareUrl(currentArticle);
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(title)}`, '_blank', 'width=600,height=450');
  };

  const handleWhatsAppShare = () => {
    const title = isBn ? currentArticle.titleBn : currentArticle.titleEn;
    const shortUrl = getShortShareUrl(currentArticle);
    const text = encodeURIComponent(`${title}\n${shortUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleMessengerShare = () => {
    const title = isBn ? currentArticle.titleBn : currentArticle.titleEn;
    const shortUrl = getShortShareUrl(currentArticle);
    if (navigator.share) {
      navigator.share({ title, text: title, url: shortUrl }).catch(() => {});
      return;
    }
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`, '_blank', 'width=600,height=450');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || commentSubmitting) return;

    const targetId = currentArticle?.post_id || currentArticle?.id || currentArticle?.slug;
    if (!targetId) return;

    setCommentSubmitting(true);
    setCommentError('');

    try {
      const res = await saveCommentToMariaDb({
        post_id: targetId,
        name: commentName.trim(),
        text: commentText.trim()
      });

      if (res.success && res.comment) {
        setCommentsList((prev) => [res.comment, ...prev]);
        setCommentName('');
        setCommentText('');
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 4500);
      } else {
        setCommentError(res.error || (isBn ? 'মন্তব্য প্রকাশ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to publish comment. Please try again.'));
        setTimeout(() => setCommentError(''), 4500);
      }
    } catch (err) {
      setCommentError(err?.message || (isBn ? 'মন্তব্য প্রকাশ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to post comment. Please try again.'));
      setTimeout(() => setCommentError(''), 4500);
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (isSingleArticleLoading) {
    return <ArticleDetailSkeleton />;
  }

  if (!currentArticle) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>
          {isBn ? 'সংবাদটি পাওয়া যায়নি বা মুছে ফেলা হয়েছে' : 'Article Not Found'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
          {isBn ? 'অন্যান্য তাজা সংবাদ পড়তে প্রচ্ছদে ফিরে যান।' : 'Please return to homepage to explore other news.'}
        </p>
        <button
          onClick={goToHome}
          style={{
            padding: '10px 24px',
            backgroundColor: 'var(--primary-red)',
            color: '#FFF',
            border: 'none',
            borderRadius: 6,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isBn ? 'প্রচ্ছদে ফিরে যান' : 'Back to Home'}
        </button>
      </div>
    );
  }

  // Category matching
  const catObj = categories.find((c) => c.id === currentArticle?.category);
  const categoryLabel = isBn
    ? currentArticle.categoryBn || catObj?.nameBn || 'বাংলাদেশ'
    : currentArticle.category || catObj?.nameEn || 'National';

  // Prothom Alo-style tags list
  const articleTags = (() => {
    if (currentArticle.tags && Array.isArray(currentArticle.tags) && currentArticle.tags.length > 0) {
      return currentArticle.tags;
    }
    if (typeof currentArticle.tags === 'string' && currentArticle.tags.trim()) {
      return currentArticle.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    const fallback = [categoryLabel];
    if (currentArticle.district) fallback.push(currentArticle.district);
    fallback.push(isBn ? 'জাতীয়' : 'National');
    fallback.push(isBn ? 'সর্বশেষ সংবাদ' : 'Latest News');
    return fallback;
  })();

  // Most Read and Related (strictly published/approved articles)
  const mostReadList = [...articles]
    .filter((a) => a.id !== currentArticle.id && (a.status === 'approved' || a.status === 'published' || !a.status))
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const relatedArticles = articles
    .filter((a) => a.id !== currentArticle.id && (a.status === 'approved' || a.status === 'published' || !a.status) && (a.category === currentArticle.category || !currentArticle.category))
    .slice(0, 4);

  const alsoReadArticle = relatedArticles.length > 0 ? relatedArticles[0] : null;
  const bottomRelatedArticles = relatedArticles.length > 1 ? relatedArticles.slice(1, 4) : articles.filter((a) => a.id !== currentArticle.id).slice(0, 3);

  // Category news for sidebar (Prothom Alo "এই বিভাগের আরও খবর")
  const categoryMoreList = articles
    .filter((a) => a.id !== currentArticle.id && a.category === currentArticle.category)
    .slice(0, 3);

  const articleTitle = isBn ? currentArticle.titleBn : currentArticle.titleEn;
  const articleUrl = getShortShareUrl(currentArticle);
  const newsArticleSchema = buildNewsArticleSchema(currentArticle, {
    language,
    url: articleUrl
  });

  return (
    <div className="article-page-container">
      {newsArticleSchema && (
        <SEOHead
          title={articleTitle}
          description={newsArticleSchema.description}
          url={articleUrl}
          imageUrl={newsArticleSchema.image.url}
          imageWidth={newsArticleSchema.image.width}
          imageHeight={newsArticleSchema.image.height}
          type="article"
          publishedTime={newsArticleSchema.datePublished}
          modifiedTime={newsArticleSchema.dateModified}
          author={newsArticleSchema.author?.[0]?.name || 'জনগণ নিউজ ডেস্ক'}
          section={newsArticleSchema.articleSection}
          jsonLd={newsArticleSchema}
        />
      )}
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
            {/* Prothom Alo Section Link */}
            <div className="article-section-top">
              <button
                onClick={() => {
                  setActiveCategory(currentArticle.category || 'latest');
                  goToHome();
                }}
                className="article-section-link"
              >
                {categoryLabel}
              </button>
            </div>

            {/* Main Headline */}
            <h1 className="article-main-headline">
              {isBn ? currentArticle.titleBn : currentArticle.titleEn}
            </h1>

            {/* Prothom Alo Unified Metadata Bar (Author, Location, Update Time & Circle Icons) */}
            <div className="pa-story-metadata-wrapper">
              <div className="pa-author-time-col">
                <div className="pa-author-location-row">
                  <span className="pa-author-name">{currentArticle.author || 'বিশেষ প্রতিবেদক'}</span>
                  <span className="pa-author-location">{currentArticle.district || currentArticle.location || (isBn ? 'ঢাকা' : 'Dhaka')}</span>
                </div>
                <div className="pa-time-row">
                  <time>
                    {isBn ? 'আপডেট: ' : 'Updated: '}
                    {isBn ? (currentArticle.dateBn || '০৩ নভেম্বর ২০২৬, ০১: ২৬') : (currentArticle.dateEn || '03 Nov 2026, 01:26')}
                  </time>
                </div>
              </div>

              <div className="pa-meta-icons-col">
                {/* Facebook Share Button */}
                <button
                  onClick={handleFacebookShare}
                  className="pa-circle-btn pa-btn-fb"
                  title={isBn ? 'ফেসবুকে শেয়ার করুন' : 'Share on Facebook'}
                  aria-label="Facebook"
                >
                  <FacebookIcon size={14} color="#ffffff" />
                </button>

                {/* X (Twitter) Share Button */}
                <button
                  onClick={handleTwitterShare}
                  className="pa-circle-btn pa-btn-x"
                  title={isBn ? 'এক্স-এ শেয়ার করুন' : 'Share on X'}
                  aria-label="X (Twitter)"
                >
                  <i className="fa-brands fa-x-twitter" style={{ fontSize: 13, color: '#ffffff' }}></i>
                </button>

                {/* Share / WhatsApp Button */}
                <button
                  onClick={handleWhatsAppShare}
                  className="pa-circle-btn pa-btn-share"
                  title={isBn ? 'হোয়াটসঅ্যাপে শেয়ার করুন' : 'Share on WhatsApp'}
                  aria-label="Share"
                >
                  <Share2 size={13} color="#ffffff" />
                </button>

                {/* Font Size Toggle Button */}
                <button
                  onClick={handleFontToggle}
                  className="pa-circle-btn pa-btn-font"
                  title={isBn ? 'হরফের আকার পরিবর্তন করুন' : 'Change Font Size'}
                  aria-label="Font Size"
                >
                  <span>{isBn ? 'অ+' : 'A+'}</span>
                </button>

                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="pa-circle-btn pa-btn-util"
                  title={isBn ? 'প্রিন্ট করুন' : 'Print Article'}
                  aria-label="Print"
                >
                  <Printer size={14} />
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={handleBookmarkToggle}
                  className={`pa-circle-btn pa-btn-util ${isBookmarked ? 'pa-bookmarked' : ''}`}
                  title={isBookmarked ? (isBn ? 'সংরক্ষিত' : 'Saved') : (isBn ? 'সংরক্ষণ করুন' : 'Bookmark')}
                  aria-label="Bookmark"
                >
                  {isBookmarked ? (
                    <BookmarkCheck size={14} color="var(--primary-red)" />
                  ) : (
                    <Bookmark size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Large Featured High-Res Hero Image (Prothom Alo Format) */}
            {currentArticle.imageUrl && (
              <div className="article-featured-image-wrap">
                <img
                  src={currentArticle.imageUrl}
                  alt={isBn ? currentArticle.titleBn : currentArticle.titleEn}
                  className="article-featured-image"
                  onError={(e) => {
                    const currentSrc = e.currentTarget.src || '';
                    if (currentSrc.includes('/uploads/') && !currentSrc.includes('uploads_proxy.php')) {
                      const match = currentSrc.match(/uploads\/(.+)$/);
                      if (match) {
                        e.currentTarget.src = `/api/uploads_proxy.php?file=${encodeURIComponent(match[1])}`;
                      }
                    }
                  }}
                />
                <figcaption className="article-image-caption-bar">
                  <span className="article-image-caption-text">
                    {isBn ? currentArticle.titleBn : currentArticle.titleEn}
                  </span>
                  <span className="article-image-credit">
                    {isBn ? 'ছবি: সংগ্রহ / জনগণ নিউজ' : 'Photo: Jonogon News'}
                  </span>
                </figcaption>
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
                __html: (() => {
                  let raw = isBn
                    ? currentArticle.contentBn || currentArticle.excerptBn || ''
                    : currentArticle.contentEn || currentArticle.excerptEn || '';
                  raw = raw
                    .replace(/https?:\/\/[^"'\s>]*backblazeb2\.com\/[^"'\s>]*\/uploads\/(\d{4}\/\d{2}\/[^"'\s?&>]+)(?:\?[^"'\s>]*)?/gi, '/uploads/$1')
                    .replace(/https?:\/\/(?:www\.)?jonogon\.news\/uploads\//gi, '/uploads/');
                  return raw.replace(/<img\s+([^>]*?)src=(["'])\/uploads\/([^"'\s]+)\2([^>]*)>/gi, (m, pre, q, file, post) => {
                    return `<img ${pre}src=${q}/uploads/${file}${q} onerror="if(!this.dataset.p){this.dataset.p='1';this.src='/api/uploads_proxy.php?file=' + encodeURIComponent('${file}');}"${post}>`;
                  });
                })()
              }}
            />

            {/* Prothom Alo Signature "আরও পড়ুন" (Also Read) Editorial Box */}
            {alsoReadArticle && (
              <div
                className="article-also-read-box"
                onClick={() => openArticle(alsoReadArticle)}
                title={isBn ? alsoReadArticle.titleBn : alsoReadArticle.titleEn}
              >
                <div className="article-also-read-badge">
                  {isBn ? 'আরও পড়ুন' : 'Also Read'}
                </div>
                <div className="article-also-read-content">
                  <h4 className="article-also-read-title">
                    {isBn ? alsoReadArticle.titleBn : alsoReadArticle.titleEn}
                  </h4>
                  <div className="article-also-read-date" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} color="var(--primary-red)" />
                      <span>{isBn ? alsoReadArticle.dateBn : alsoReadArticle.dateEn}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={12} color="var(--primary-red)" />
                      <span>{formatViewsBn(alsoReadArticle.views, isBn)}</span>
                    </div>
                  </div>
                </div>
                {alsoReadArticle.imageUrl && (
                  <div className="article-also-read-thumb-wrap">
                    <img
                      src={alsoReadArticle.imageUrl}
                      alt=""
                      className="article-also-read-thumb"
                    />
                  </div>
                )}
              </div>
            )}

            {/* In-Article Mid Banner Ad */}
            <AdSenseSlot slotId="midContentBanner" customClass="ad-slot-970x90" />

            {/* Prothom Alo Topic Tags Section */}
            <div className="article-tags-wrapper">
              <div className="article-tags-header">
                <Tag size={15} color="var(--primary-red)" />
                <span>
                  <strong>{categoryLabel}</strong> {isBn ? 'থেকে আরও পড়ুন:' : 'More Topics:'}
                </span>
              </div>
              <div className="article-tags-list">
                {articleTags.map((tag, idx) => (
                  <button
                    key={idx}
                    className="article-tag-pill"
                    onClick={() => {
                      setActiveCategory(currentArticle.category || 'latest');
                      goToHome();
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Reader Comments Section */}
            <div className="article-comments-section">
              <div className="article-comments-header">
                <MessageSquare size={22} color="var(--primary-red)" />
                <h3>
                  {isBn ? 'পাঠকের মন্তব্য' : 'Reader Comments'} (
                  {isBn
                    ? String(commentsList.length).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])
                    : commentsList.length}
                  )
                </h3>
              </div>

              {commentSuccess && (
                <div className="article-comment-alert-success">
                  {isBn ? 'আপনার মন্তব্য সফলভাবে প্রকাশিত হয়েছে!' : 'Your comment has been posted successfully!'}
                </div>
              )}

              {commentError && (
                <div className="article-comment-alert-error">
                  {commentError}
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
                    disabled={commentSubmitting}
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
                    disabled={commentSubmitting}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={commentSubmitting}
                  style={{ opacity: commentSubmitting ? 0.7 : 1, cursor: commentSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  <Send size={15} />
                  <span>
                    {commentSubmitting
                      ? (isBn ? 'মন্তব্য পাঠানো হচ্ছে...' : 'Posting...')
                      : (isBn ? 'মন্তব্য প্রকাশ করুন' : 'Post Comment')}
                  </span>
                </button>
              </form>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {commentLoading ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    {isBn ? 'মন্তব্য লোড হচ্ছে...' : 'Loading comments...'}
                  </div>
                ) : commentsList.length === 0 ? (
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 4, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    {isBn ? 'এই সংবাদে এখনও কোনো মন্তব্য করা হয়নি। আপনার মূল্যবান মতামত প্রথম জানান!' : 'No comments on this article yet. Be the first to share your thoughts!'}
                  </div>
                ) : (
                  commentsList.map((c) => (
                    <div key={c.id} className="article-comment-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{c.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{c.date}</span>
                      </div>
                      <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{c.text}</p>
                    </div>
                  ))
                )}
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
                {bottomRelatedArticles.map((rel) => (
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
                      <div className="news-card-date" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} color="var(--primary-red)" />
                          <span>{isBn ? rel.dateBn : rel.dateEn}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={12} color="var(--primary-red)" />
                          <span>{formatViewsBn(rel.views, isBn)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </article>

          {/* Right Column Sidebar (Prothom Alo Anatomy) */}
          <aside className="article-sidebar">
            {/* Top 300x250 Ad */}
            <div className="article-sidebar-ad-box">
              <span className="sidebar-ad-label">{isBn ? 'বিজ্ঞাপন' : 'ADVERTISEMENT'}</span>
              <AdSenseSlot slotId="leadSidebarAd" customClass="ad-slot-300x250" />
            </div>

            {/* Prothom Alo: "{categoryLabel} নিয়ে আরও পড়ুন" with Title, Time & Right Thumbnail */}
            {categoryMoreList.length > 0 && (
              <div className="article-sidebar-cat-news">
                <div className="article-sidebar-cat-header">
                  <h4>{categoryLabel} {isBn ? 'নিয়ে আরও পড়ুন' : 'More News'}</h4>
                </div>
                <div className="article-sidebar-cat-list">
                  {categoryMoreList.map((art) => (
                    <div
                      key={art.id}
                      className="article-sidebar-pa-card"
                      onClick={() => openArticle(art)}
                    >
                      <div className="article-sidebar-pa-body">
                        <h5 className="article-sidebar-pa-title">
                          {isBn ? art.titleBn : art.titleEn}
                        </h5>
                        <div className="article-card-meta-line" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="article-sidebar-pa-time">
                            {getRelativeTimeBn(art.dateBn || art.dateEn)}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', color: 'var(--text-light)' }}>
                            <Eye size={12} color="var(--primary-red)" />
                            <span>{formatViewsBn(art.views, isBn)}</span>
                          </span>
                        </div>
                      </div>
                      {art.imageUrl && (
                        <div className="article-sidebar-pa-thumb-wrap">
                          <img
                            src={art.imageUrl}
                            alt=""
                            className="article-sidebar-pa-thumb"
                            onError={(e) => {
                              const s = e.currentTarget.src || '';
                              if (s.includes('/uploads/') && !s.includes('uploads_proxy.php')) {
                                const m = s.match(/uploads\/(.+)$/);
                                if (m) e.currentTarget.src = `/api/uploads_proxy.php?file=${encodeURIComponent(m[1])}`;
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most Read 01-05 Ranking Box with side images just like "বাংলাদেশ নিয়ে আরও পড়ুন" */}
            <div className="tabbed-ranking-box" style={{ marginTop: 24, marginBottom: 24 }}>
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--primary-red)', color: 'var(--white)', fontWeight: 700, fontFamily: 'var(--font-headline)', fontSize: '1.05rem' }}>
                {isBn ? 'সর্বাধিক পঠিত সংবাদ' : 'Most Read Stories'}
              </div>

              <div className="ranking-list-thumbs">
                {mostReadList.map((art, idx) => {
                  const numStr = isBn
                    ? String(idx + 1).padStart(2, '0').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])
                    : String(idx + 1).padStart(2, '0');

                  return (
                    <div
                      key={art.id}
                      className="article-sidebar-pa-card ranking-pa-item"
                      onClick={() => openArticle(art)}
                      title={isBn ? art.titleBn : art.titleEn}
                    >
                      <span className="ranking-pa-num">{numStr}</span>
                      <div className="article-sidebar-pa-body">
                        <h5 className="article-sidebar-pa-title">
                          {isBn ? art.titleBn : art.titleEn}
                        </h5>
                        <div className="article-card-meta-line" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="article-sidebar-pa-time">
                            {getRelativeTimeBn(art.dateBn || art.dateEn)}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', color: 'var(--text-light)' }}>
                            <Eye size={12} color="var(--primary-red)" />
                            <span>{formatViewsBn(art.views, isBn)}</span>
                          </span>
                        </div>
                      </div>
                      {art.imageUrl && (
                        <div className="article-sidebar-pa-thumb-wrap">
                          <img
                            src={art.imageUrl}
                            alt=""
                            className="article-sidebar-pa-thumb"
                            onError={(e) => {
                              const s = e.currentTarget.src || '';
                              if (s.includes('/uploads/') && !s.includes('uploads_proxy.php')) {
                                const m = s.match(/uploads\/(.+)$/);
                                if (m) e.currentTarget.src = `/api/uploads_proxy.php?file=${encodeURIComponent(m[1])}`;
                              }
                            }}
                          />
                        </div>
                      )}
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
