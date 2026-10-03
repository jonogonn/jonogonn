import React, { useState, useEffect, useRef } from 'react';
import { useNews } from '../../context/NewsContext';
import { Clock, BookOpen, ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react';
import AdSenseSlot from '../Ads/AdSenseSlot';

export default function HeroLeadGrid() {
  const { language, articles, openArticle } = useNews();
  const isBn = language === 'bn';

  const [slideIndex, setSlideIndex] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  if (!articles || articles.length === 0) return null;

  // 1. Highlighted News Pool (Admin marked or fallback to lead/recent)
  const highlightedNews = articles.filter((a) => a.isHighlighted);
  const sliderItems = highlightedNews.length > 0 ? highlightedNews : articles.slice(0, 5);

  // Auto slide highlight carousel
  useEffect(() => {
    if (isSliderPaused || sliderItems.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % sliderItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isSliderPaused, sliderItems.length]);

  const currentSlide = sliderItems[slideIndex] || sliderItems[0];

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % sliderItems.length);
  };

  // 2. Newly Posted Sub-lead News (Uncapped, sorted recent)
  const newlyPostedNews = articles;

  // 3. Most Read (সর্বাধিক পঠিত) - Sorted by views descending
  const mostReadList = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));

  const formatBanglaNumber = (num) => {
    const padded = String(num).padStart(2, '0');
    return isBn ? padded.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]) : padded;
  };

  return (
    <section className="hero-lead-grid">
      {/* ========================================================
          1. Left Column: Big Highlighted Lead News Slider (Carousel)
          ======================================================== */}
      <div
        className="hero-slider-container"
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
      >
        <article
          className="hero-main-card hero-slide-active"
          onClick={() => openArticle(currentSlide)}
          title={isBn ? currentSlide.titleBn : currentSlide.titleEn}
        >
          <div className="hero-main-image-wrap">
            <img
              key={currentSlide.id}
              src={currentSlide.imageUrl}
              alt={isBn ? currentSlide.titleBn : currentSlide.titleEn}
              className="hero-main-image slide-fade-in"
              loading="eager"
            />
            
            {/* Top Badges Overlay: Highlights Ribbon & Category */}
            <div className="hero-main-badge-overlay">
              <span className="badge-highlight">
                <Sparkles size={13} style={{ marginRight: 4 }} />
                {isBn ? 'হাইলাইটস' : 'Highlights'}
              </span>
              <span className="badge-category" style={{ marginLeft: 6 }}>
                {isBn ? currentSlide.categoryBn || 'বাংলাদেশ' : currentSlide.category || 'Bangladesh'}
              </span>
            </div>

            {/* Slider Navigation Arrows */}
            {sliderItems.length > 1 && (
              <div className="hero-slider-arrows">
                <button
                  className="hero-slider-nav-btn"
                  onClick={handlePrevSlide}
                  aria-label="Previous highlighted story"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="hero-slider-nav-btn"
                  onClick={handleNextSlide}
                  aria-label="Next highlighted story"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="hero-main-info">
            <h1 className="hero-main-title">
              {isBn ? currentSlide.titleBn : currentSlide.titleEn}
            </h1>

            {currentSlide.excerptBn && (
              <p className="hero-main-excerpt">
                {isBn ? currentSlide.excerptBn : currentSlide.excerptEn}
              </p>
            )}

            <div className="hero-main-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} color="var(--primary-red)" />
                {isBn ? currentSlide.dateBn : currentSlide.dateEn}
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
                    onClick={() => setSlideIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </article>
      </div>

      {/* ========================================================
          2. Middle Column: Newly Posted News (Bottom to Top Scroll)
          ======================================================== */}
      <div className="hero-sub-list-container">
        <div className="sub-list-header">
          <span className="sub-list-header-title">
            {isBn ? 'নতুন প্রকাশিত সংবাদ' : 'Newly Posted News'}
          </span>
        </div>

        <div className="sub-list-vertical-scroll" title={isBn ? 'স্ক্রোল বা মাউস রাখুন' : 'Scroll or hover'}>
          <div className="sub-list-vertical-track">
            {/* First Set of Items */}
            {newlyPostedNews.map((item) => (
              <article
                key={`sub1-${item.id}`}
                className="sub-lead-card"
                onClick={() => openArticle(item)}
                title={isBn ? item.titleBn : item.titleEn}
              >
                <div className="sub-lead-img-wrap">
                  <img
                    src={item.imageUrl}
                    alt={isBn ? item.titleBn : item.titleEn}
                    className="sub-lead-img"
                    loading="lazy"
                  />
                </div>
                <div className="sub-lead-content">
                  <span className="sub-lead-badge">
                    {isBn ? item.categoryBn || 'জাতীয়' : item.category || 'National'}
                  </span>
                  <h2 className="sub-lead-title">
                    {isBn ? item.titleBn : item.titleEn}
                  </h2>
                  <span className="sub-lead-date">
                    {isBn ? item.dateBn : item.dateEn}
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
                title={isBn ? item.titleBn : item.titleEn}
              >
                <div className="sub-lead-img-wrap">
                  <img
                    src={item.imageUrl}
                    alt={isBn ? item.titleBn : item.titleEn}
                    className="sub-lead-img"
                    loading="lazy"
                  />
                </div>
                <div className="sub-lead-content">
                  <span className="sub-lead-badge">
                    {isBn ? item.categoryBn || 'জাতীয়' : item.category || 'National'}
                  </span>
                  <h2 className="sub-lead-title">
                    {isBn ? item.titleBn : item.titleEn}
                  </h2>
                  <span className="sub-lead-date">
                    {isBn ? item.dateBn : item.dateEn}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. Right Column: AdSense (300x250) + Most Read (সর্বাধিক পঠিত)
          ======================================================== */}
      <aside className="hero-right-col">
        {/* Top 300x250 AdSlot */}
        <AdSenseSlot slotId="leadSidebarAd" customClass="ad-slot-300x250" />

        {/* Most Read (সর্বাধিক পঠিত) Vertical Scrollable Box */}
        <div className="most-read-box">
          <div className="most-read-header">
            <Flame size={18} className="most-read-icon" />
            <span>{isBn ? 'সর্বাধিক পঠিত' : 'Most Read'}</span>
          </div>

          <div className="most-read-vertical-scroll" title={isBn ? 'স্ক্রোল বা মাউস রাখুন' : 'Scroll or hover'}>
            <div className="most-read-vertical-track">
              {/* First Set of Most Read */}
              {mostReadList.map((art, idx) => (
                <div
                  key={`mr1-${art.id}`}
                  className="ranking-item"
                  onClick={() => openArticle(art)}
                  title={isBn ? art.titleBn : art.titleEn}
                >
                  <span className="ranking-num">{formatBanglaNumber(idx + 1)}</span>
                  <div className="ranking-info">
                    <p className="ranking-title">
                      {isBn ? art.titleBn : art.titleEn}
                    </p>
                    <span className="ranking-date">{isBn ? art.dateBn : art.dateEn}</span>
                  </div>
                </div>
              ))}

              {/* Duplicate Set for Seamless Infinite Vertical Loop */}
              {mostReadList.map((art, idx) => (
                <div
                  key={`mr2-${art.id}`}
                  className="ranking-item"
                  onClick={() => openArticle(art)}
                  title={isBn ? art.titleBn : art.titleEn}
                >
                  <span className="ranking-num">{formatBanglaNumber(idx + 1)}</span>
                  <div className="ranking-info">
                    <p className="ranking-title">
                      {isBn ? art.titleBn : art.titleEn}
                    </p>
                    <span className="ranking-date">{isBn ? art.dateBn : art.dateEn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
