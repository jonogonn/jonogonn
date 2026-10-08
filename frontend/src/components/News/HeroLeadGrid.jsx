import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { Clock, BookOpen, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import AdSenseSlot from '../Ads/AdSenseSlot';

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';

export default function HeroLeadGrid() {
  const { language, articles, openArticle, homepageSections, sectionColumnsOrder } = useNews();
  const isBn = language === 'bn';

  // Section visibility check from homepageSections
  const secConfig = (homepageSections || []).find((s) => s.id === 'heroLeadGrid');
  if (secConfig && secConfig.isVisible === false) return null;

  const [slideIndex, setSlideIndex] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

  if (!articles || articles.length === 0) return null;

  // Filter only published articles for public homepage
  const publishedArticles = articles.filter((a) => a.status === 'published' || !a.status);
  const activeArticleList = publishedArticles.length > 0 ? publishedArticles : articles;

  // 1. Highlighted News Pool (Admin marked or fallback to lead/recent)
  const highlightedNews = activeArticleList.filter((a) => a.isHighlighted);
  const sliderItems = highlightedNews.length > 0 ? highlightedNews : activeArticleList.slice(0, 6);

  // Auto slide highlight carousel with animated progress bar
  useEffect(() => {
    if (isSliderPaused || sliderItems.length <= 1) return;

    setSlideProgress(0);
    const progressInterval = setInterval(() => {
      setSlideProgress((prev) => Math.min(prev + 2, 100));
    }, 100);

    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % sliderItems.length);
      setSlideProgress(0);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(progressInterval);
    };
  }, [slideIndex, isSliderPaused, sliderItems.length]);

  const currentSlide = sliderItems[slideIndex] || sliderItems[0];

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
    setSlideProgress(0);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % sliderItems.length);
    setSlideProgress(0);
  };

  // 2. Newly Posted Sub-lead News (Uncapped, sorted recent)
  const newlyPostedNews = activeArticleList;

  // 3. Most Read Stories - Sorted by views descending
  const mostReadList = [...activeArticleList].sort((a, b) => (b.views || 0) - (a.views || 0));

  // 3-Column dynamic ordering
  const defaultColOrder = ['leadSlider', 'newlyPosted', 'mostRead'];
  const colOrder = sectionColumnsOrder?.heroLeadGrid || defaultColOrder;

  const renderLeadSlider = () => (
    <div
      key="leadSlider"
      className="hero-slider-container"
      onMouseEnter={() => setIsSliderPaused(true)}
      onMouseLeave={() => setIsSliderPaused(false)}
    >
      <article
        key={currentSlide.id}
        className="hero-main-card hero-slide-card"
        onClick={() => openArticle(currentSlide)}
        title={isBn ? currentSlide.titleBn || currentSlide.titleEn : currentSlide.titleEn || currentSlide.titleBn}
      >
        <div className="hero-main-image-wrap">
          <img
            src={currentSlide.imageUrl && !currentSlide.imageUrl.startsWith('blob:') ? currentSlide.imageUrl : FALLBACK_NEWS_IMG}
            alt=""
            className="hero-main-image hero-unique-slide-anim"
            loading="eager"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_NEWS_IMG;
            }}
          />

          {/* Subtle Gradient & Texture Vignette for cinematic look */}
          <div className="hero-image-scrim" />

          {/* Top Badges Overlay: Highlights Ribbon & Category */}
          <div className="hero-main-badge-overlay">
            <span className="badge-highlight">
              {isBn ? 'হাইলাইটস' : 'Highlights'}
            </span>
            <span className="badge-category">
              {isBn ? currentSlide.categoryBn || 'বাংলাদেশ' : currentSlide.category || 'Bangladesh'}
            </span>
          </div>

          {/* Slider Navigation Arrows (Glassmorphic) */}
          {sliderItems.length > 1 && (
            <div className="hero-slider-arrows">
              <button
                className="hero-slider-nav-btn"
                onClick={handlePrevSlide}
                aria-label="Previous story"
                title={isBn ? 'আগের খবর' : 'Previous'}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="hero-slider-nav-btn"
                onClick={handleNextSlide}
                aria-label="Next story"
                title={isBn ? 'পরের খবর' : 'Next'}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="hero-main-info hero-content-slide-up">
          <div>
            <h1 className="hero-main-title">
              {isBn ? currentSlide.titleBn || currentSlide.titleEn : currentSlide.titleEn || currentSlide.titleBn}
            </h1>

            {(currentSlide.excerptBn || currentSlide.excerptEn) && (
              <p className="hero-main-excerpt">
                {isBn ? currentSlide.excerptBn || currentSlide.excerptEn : currentSlide.excerptEn || currentSlide.excerptBn}
              </p>
            )}
          </div>

          <div className="hero-main-bottom-row">
            <div className="hero-main-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} color="var(--primary-red)" />
                {isBn ? currentSlide.dateBn || currentSlide.dateEn : currentSlide.dateEn || currentSlide.dateBn}
              </span>
              <span>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BookOpen size={14} color="var(--primary-red)" />
                {isBn ? currentSlide.readTimeBn || '৪ মিনিট পড়তে' : currentSlide.readTimeEn || '4 min read'}
              </span>
            </div>

            {/* Slider Dots / Indicators */}
            {sliderItems.length > 1 && (
              <div className="hero-slider-dots" onClick={(e) => e.stopPropagation()}>
                {sliderItems.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    className={`slider-dot ${idx === slideIndex ? 'active' : ''}`}
                    onClick={() => {
                      setSlideIndex(idx);
                      setSlideProgress(0);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Slide Countdown Progress Line */}
        <div className="hero-slide-progress-track">
          <div
            className="hero-slide-progress-bar"
            style={{ width: `${slideProgress}%` }}
          />
        </div>
      </article>
    </div>
  );

  const renderNewlyPosted = () => (
    <div key="newlyPosted" className="hero-sub-list-container">
      <div className="sub-list-header">
        <span className="sub-list-header-title">
          {isBn ? 'নতুন প্রকাশিত সংবাদ' : 'Newly Posted News'}
        </span>
      </div>

      <div className="sub-list-vertical-scroll" title={isBn ? 'স্ক্রোল বা মাউস রাখুন' : 'Scroll or hover'}>
        <div className="sub-list-vertical-track">
          {newlyPostedNews.map((item) => (
            <article
              key={`sub1-${item.id}`}
              className="sub-lead-card"
              onClick={() => openArticle(item)}
              title={isBn ? item.titleBn || item.titleEn : item.titleEn || item.titleBn}
            >
              <div className="sub-lead-img-wrap">
                <img
                  src={item.imageUrl && !item.imageUrl.startsWith('blob:') ? item.imageUrl : FALLBACK_NEWS_IMG}
                  alt=""
                  className="sub-lead-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_NEWS_IMG;
                  }}
                />
              </div>
              <div className="sub-lead-content">
                <span className="sub-lead-badge">
                  {isBn ? item.categoryBn || item.category || 'জাতীয়' : item.categoryEn || item.category || 'National'}
                </span>
                <h2 className="sub-lead-title">
                  {isBn ? item.titleBn || item.titleEn : item.titleEn || item.titleBn}
                </h2>
                <span className="sub-lead-date">
                  {isBn ? item.dateBn || item.dateEn : item.dateEn || item.dateBn}
                </span>
              </div>
            </article>
          ))}

          {/* Duplicate Set for Seamless Vertical Loop */}
          {newlyPostedNews.map((item) => (
            <article
              key={`sub2-${item.id}`}
              className="sub-lead-card"
              onClick={() => openArticle(item)}
              title={isBn ? item.titleBn || item.titleEn : item.titleEn || item.titleBn}
            >
              <div className="sub-lead-img-wrap">
                <img
                  src={item.imageUrl && !item.imageUrl.startsWith('blob:') ? item.imageUrl : FALLBACK_NEWS_IMG}
                  alt=""
                  className="sub-lead-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_NEWS_IMG;
                  }}
                />
              </div>
              <div className="sub-lead-content">
                <span className="sub-lead-badge">
                  {isBn ? item.categoryBn || item.category || 'জাতীয়' : item.categoryEn || item.category || 'National'}
                </span>
                <h2 className="sub-lead-title">
                  {isBn ? item.titleBn || item.titleEn : item.titleEn || item.titleBn}
                </h2>
                <span className="sub-lead-date">
                  {isBn ? item.dateBn || item.dateEn : item.dateEn || item.dateBn}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMostRead = () => (
    <aside key="mostRead" className="hero-right-col">
      {/* Top 300x250 AdSlot */}
      <AdSenseSlot slotId="leadSidebarAd" customClass="ad-slot-300x250" />

      {/* Most Read stories with Thumbnails & Vertical Scroll */}
      <div className="most-read-box">
        <div className="most-read-header">
          <Flame size={18} className="most-read-icon" />
          <span>{isBn ? 'সর্বাধিক পঠিত' : 'Most Read'}</span>
        </div>

        <div className="most-read-vertical-scroll" title={isBn ? 'স্ক্রোল বা মাউস রাখুন' : 'Scroll or hover'}>
          <div className="most-read-vertical-track">
            {mostReadList.map((art) => (
              <div
                key={`mr1-${art.id}`}
                className="ranking-item ranking-thumb-layout"
                onClick={() => openArticle(art)}
                title={isBn ? art.titleBn || art.titleEn : art.titleEn || art.titleBn}
              >
                <div className="ranking-thumb-wrap">
                  <img
                    src={art.imageUrl && !art.imageUrl.startsWith('blob:') ? art.imageUrl : FALLBACK_NEWS_IMG}
                    alt=""
                    className="ranking-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_NEWS_IMG;
                    }}
                  />
                </div>
                <div className="ranking-info">
                  <p className="ranking-title">
                    {isBn ? art.titleBn || art.titleEn : art.titleEn || art.titleBn}
                  </p>
                  <div className="ranking-meta-row">
                    <span className="ranking-cat-tag">
                      {isBn ? art.categoryBn || art.category || 'সংবাদ' : art.categoryEn || art.category || 'News'}
                    </span>
                    <span className="ranking-date">{isBn ? art.dateBn || art.dateEn : art.dateEn || art.dateBn}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Duplicate Set for Seamless Infinite Vertical Loop */}
            {mostReadList.map((art) => (
              <div
                key={`mr2-${art.id}`}
                className="ranking-item ranking-thumb-layout"
                onClick={() => openArticle(art)}
                title={isBn ? art.titleBn || art.titleEn : art.titleEn || art.titleBn}
              >
                <div className="ranking-thumb-wrap">
                  <img
                    src={art.imageUrl && !art.imageUrl.startsWith('blob:') ? art.imageUrl : FALLBACK_NEWS_IMG}
                    alt=""
                    className="ranking-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_NEWS_IMG;
                    }}
                  />
                </div>
                <div className="ranking-info">
                  <p className="ranking-title">
                    {isBn ? art.titleBn || art.titleEn : art.titleEn || art.titleBn}
                  </p>
                  <div className="ranking-meta-row">
                    <span className="ranking-cat-tag">
                      {isBn ? art.categoryBn || art.category || 'সংবাদ' : art.categoryEn || art.category || 'News'}
                    </span>
                    <span className="ranking-date">{isBn ? art.dateBn || art.dateEn : art.dateEn || art.dateBn}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <section className="hero-lead-grid">
      {colOrder.map((colKey) => {
        if (colKey === 'leadSlider') return renderLeadSlider();
        if (colKey === 'newlyPosted') return renderNewlyPosted();
        if (colKey === 'mostRead') return renderMostRead();
        return null;
      })}
    </section>
  );
}
