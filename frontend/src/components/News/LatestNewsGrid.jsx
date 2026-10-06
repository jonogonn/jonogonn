import React, { useRef } from 'react';
import { useNews } from '../../context/NewsContext';
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';

export default function LatestNewsGrid() {
  const { language, articles, openArticle, setActiveCategory, homepageSections } = useNews();
  const isBn = language === 'bn';

  // Section visibility check from homepageSections
  const secConfig = (homepageSections || []).find((s) => s.id === 'latestNewsGrid');
  if (secConfig && secConfig.isVisible === false) return null;

  const scrollContainerRef = useRef(null);

  // Ensure at least 12 cards per half for consistent track width and velocity
  const baseCards = articles && articles.length > 0 ? articles : [];
  let displayCards = [];
  if (baseCards.length > 0) {
    while (displayCards.length < 12) {
      displayCards = [...displayCards, ...baseCards];
    }
  }

  const handleArticleClick = (art) => {
    openArticle(art);
  };

  const handleManualScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="latest-news-section" style={{ marginBottom: 28 }}>
      {/* Section Header with Left-to-Right Controls */}
      <div className="section-header">
        <h2 className="section-title">
          {isBn ? 'সর্বশেষ সংবাদ' : 'Latest News'}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Manual Scroll Arrows */}
          <div className="section-scroll-arrows">
            <button
              className="section-arrow-btn"
              onClick={() => handleManualScroll('left')}
              aria-label="Scroll left"
              title={isBn ? 'বামে স্ক্রোল করুন' : 'Scroll Left'}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="section-arrow-btn"
              onClick={() => handleManualScroll('right')}
              aria-label="Scroll right"
              title={isBn ? 'ডানে স্ক্রোল করুন' : 'Scroll Right'}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => setActiveCategory('latest')}
            className="section-link"
          >
            <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Continuous Left-to-Right Horizontal Scrolling Track */}
      <div
        className="horizontal-scroll-container"
        ref={scrollContainerRef}
        title={isBn ? 'স্ক্রোল বা মাউস রাখুন' : 'Scroll or hover to pause'}
      >
        <div className="horizontal-scroll-track scroll-left-to-right">
          {/* First Set of Cards */}
          {displayCards.map((item, idx) => (
            <article
              key={`latest1-${item.id}-${idx}`}
              className="news-card-horizontal-item"
              onClick={() => handleArticleClick(item)}
              title={isBn ? item.titleBn : item.titleEn}
            >
              <div className="news-card-img-wrap">
                <img
                  src={item.imageUrl || FALLBACK_NEWS_IMG}
                  alt={isBn ? item.titleBn : item.titleEn}
                  className="news-card-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_NEWS_IMG;
                  }}
                />
              </div>
              <div className="news-card-body">
                <span className="news-card-cat-badge">
                  {isBn ? item.categoryBn || 'সংবাদ' : item.category || 'News'}
                </span>
                <h3 className="news-card-title">
                  {isBn ? item.titleBn : item.titleEn}
                </h3>
                <div className="news-card-date">
                  <Clock size={13} color="var(--primary-red)" />
                  <span>{isBn ? item.dateBn : item.dateEn}</span>
                </div>
              </div>
            </article>
          ))}

          {/* Duplicate Set for Seamless Infinite Left-to-Right Loop */}
          {displayCards.map((item, idx) => (
            <article
              key={`latest2-${item.id}-${idx}`}
              className="news-card-horizontal-item"
              onClick={() => handleArticleClick(item)}
              title={isBn ? item.titleBn : item.titleEn}
            >
              <div className="news-card-img-wrap">
                <img
                  src={item.imageUrl || FALLBACK_NEWS_IMG}
                  alt={isBn ? item.titleBn : item.titleEn}
                  className="news-card-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_NEWS_IMG;
                  }}
                />
              </div>
              <div className="news-card-body">
                <span className="news-card-cat-badge">
                  {isBn ? item.categoryBn || 'সংবাদ' : item.category || 'News'}
                </span>
                <h3 className="news-card-title">
                  {isBn ? item.titleBn : item.titleEn}
                </h3>
                <div className="news-card-date">
                  <Clock size={13} color="var(--primary-red)" />
                  <span>{isBn ? item.dateBn : item.dateEn}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
