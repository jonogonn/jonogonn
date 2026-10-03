import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { Clock, BookOpen, ChevronLeft, ChevronRight, ArrowRight, Star } from 'lucide-react';
import WeatherFollowSidebar from '../Widgets/WeatherFollowSidebar';

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';

export default function BangladeshSection() {
  const { language, articles, openArticle, setActiveCategory } = useNews();
  const isBn = language === 'bn';

  // Bangladesh Section Articles Pool
  const bdArticles = articles.filter(
    (a) => a.category === 'bangladesh' || a.category === 'politics' || a.id.startsWith('bd')
  );
  const bdPool = bdArticles.length >= 5 ? bdArticles : articles;

  const [bdSlideIndex, setBdSlideIndex] = useState(0);
  const [bdPaused, setBdPaused] = useState(false);

  // Auto-slide for Featured Lead Card (6 seconds)
  useEffect(() => {
    if (bdPaused || bdPool.length <= 1) return;
    const timer = setInterval(() => {
      setBdSlideIndex((prev) => (prev + 1) % Math.min(bdPool.length, 5));
    }, 6000);
    return () => clearInterval(timer);
  }, [bdPaused, bdPool.length]);

  const currentBdSlide = bdPool[bdSlideIndex] || bdPool[0];
  const bdSubArticles = bdPool.filter((_, idx) => idx !== bdSlideIndex).slice(0, 4);

  return (
    <section className="bangladesh-foxiz-section" style={{ marginBottom: 32 }}>
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">
          {isBn ? 'বাংলাদেশ' : 'Bangladesh'}
        </h2>
        <button
          onClick={() => setActiveCategory('bangladesh')}
          className="section-link"
        >
          <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* 3-Column Editorial Grid: [Featured Lead (Left) | 4 Sub-Leads (Middle) | Weather & Follow Us (Right)] */}
      <div className="foxiz-editorial-layout">
        {/* ========================================================
            Column 1: Big Featured Lead Card
            ======================================================== */}
        <div
          className="foxiz-featured-col"
          onMouseEnter={() => setBdPaused(true)}
          onMouseLeave={() => setBdPaused(false)}
        >
          <article
            key={currentBdSlide.id}
            className="foxiz-featured-card"
            onClick={() => openArticle(currentBdSlide)}
            title={isBn ? currentBdSlide.titleBn : currentBdSlide.titleEn}
          >
            <div className="foxiz-featured-img-wrap">
              <img
                src={currentBdSlide.imageUrl || FALLBACK_NEWS_IMG}
                alt={isBn ? currentBdSlide.titleBn : currentBdSlide.titleEn}
                className="foxiz-featured-img hero-unique-slide-anim"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_NEWS_IMG;
                }}
              />
              <div className="hero-image-scrim" />

              {/* Category Badge Overlay */}
              <div className="bd-hero-badge-overlay">
                <span className="badge-category">
                  {isBn ? currentBdSlide.categoryBn || 'বাংলাদেশ' : currentBdSlide.category || 'Bangladesh'}
                </span>
              </div>

              {/* Slider Navigation Arrows */}
              <div className="bd-hero-arrows">
                <button
                  className="bd-arrow-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBdSlideIndex((prev) => (prev - 1 + Math.min(bdPool.length, 5)) % Math.min(bdPool.length, 5));
                  }}
                  aria-label="Previous story"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="bd-arrow-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBdSlideIndex((prev) => (prev + 1) % Math.min(bdPool.length, 5));
                  }}
                  aria-label="Next story"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="foxiz-featured-body hero-content-slide-up">
              <span className="foxiz-featured-tag">
                {isBn ? currentBdSlide.categoryBn || 'জাতীয়' : currentBdSlide.category || 'National'}
              </span>
              <h3 className="foxiz-featured-title">
                {isBn ? currentBdSlide.titleBn : currentBdSlide.titleEn}
              </h3>
              {currentBdSlide.excerptBn && (
                <p className="foxiz-featured-excerpt">
                  {isBn ? currentBdSlide.excerptBn : currentBdSlide.excerptEn}
                </p>
              )}
              <div className="foxiz-featured-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} color="var(--primary-red)" />
                  {isBn ? currentBdSlide.dateBn : currentBdSlide.dateEn}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={13} color="var(--primary-red)" />
                  {isBn ? currentBdSlide.readTimeBn || '৪ মিনিট' : currentBdSlide.readTimeEn || '4 min read'}
                </span>
              </div>
            </div>

            {/* Slider Dots Indicator */}
            <div className="bd-slider-dots" onClick={(e) => e.stopPropagation()}>
              {bdPool.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  className={`slider-dot ${idx === bdSlideIndex ? 'active' : ''}`}
                  onClick={() => setBdSlideIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </article>
        </div>

        {/* ========================================================
            Column 2: 4 Sub-Articles (Middle Column)
            ======================================================== */}
        <div className="foxiz-subleads-col">
          <div className="foxiz-subleads-list">
            {bdSubArticles.map((subItem) => (
              <article
                key={`sublead-${subItem.id}`}
                className="foxiz-sublead-card"
                onClick={() => openArticle(subItem)}
                title={isBn ? subItem.titleBn : subItem.titleEn}
              >
                <div className="foxiz-sublead-content">
                  <span className="foxiz-sublead-cat">
                    {isBn ? subItem.categoryBn || 'বাংলাদেশ' : subItem.category || 'National'}
                  </span>
                  <h4 className="foxiz-sublead-title">
                    {isBn ? subItem.titleBn : subItem.titleEn}
                  </h4>
                  <div className="foxiz-sublead-meta">
                    <Clock size={12} color="var(--primary-red)" />
                    <span>{isBn ? subItem.dateBn : subItem.dateEn}</span>
                  </div>
                </div>

                <div className="foxiz-sublead-thumb-wrap">
                  <img
                    src={subItem.imageUrl || FALLBACK_NEWS_IMG}
                    alt={isBn ? subItem.titleBn : subItem.titleEn}
                    className="foxiz-sublead-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_NEWS_IMG;
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ========================================================
            Column 3: Weather & Follow Us Widgets (Right Column)
            ======================================================== */}
        <div className="foxiz-sidebar-col">
          <WeatherFollowSidebar />
        </div>
      </div>
    </section>
  );
}
