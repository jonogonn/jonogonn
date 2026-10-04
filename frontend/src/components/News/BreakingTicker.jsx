import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { Zap, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

export default function BreakingTicker() {
  const { language, articles, breakingNews, openArticle } = useNews();
  const isBn = language === 'bn';

  // 1. Breaking News Ticker Items (All Articles / Latest)
  const tickerItems = articles && articles.length > 0
    ? articles
    : breakingNews.map((b) => ({
        id: b.id,
        titleBn: b.textBn,
        titleEn: b.textEn,
        categoryBn: 'সর্বশেষ',
        category: 'Latest'
      }));

  // 2. Highlighted News Ticker Items
  const highlightedArticles = articles.filter((a) => a.isHighlighted);
  const highlightItems = highlightedArticles.length > 0 ? highlightedArticles : articles.slice(0, 8);

  const [currentHighlightIdx, setCurrentHighlightIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState('up'); // 'up' or 'down'
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle highlight headlines vertically every 4 seconds
  useEffect(() => {
    if (highlightItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setSlideDirection('up');
      setCurrentHighlightIdx((prev) => (prev + 1) % highlightItems.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [highlightItems.length, isPaused]);

  const handlePrevHighlight = (e) => {
    e.stopPropagation();
    setSlideDirection('down');
    setCurrentHighlightIdx((prev) => (prev - 1 + highlightItems.length) % highlightItems.length);
  };

  const handleNextHighlight = (e) => {
    e.stopPropagation();
    setSlideDirection('up');
    setCurrentHighlightIdx((prev) => (prev + 1) % highlightItems.length);
  };

  const activeHighlight = highlightItems[currentHighlightIdx] || highlightItems[0];

  return (
    <div className="dual-ticker-section">
      {/* 1. Main Breaking News Ticker (Horizontal Marquee) */}
      <div className="breaking-ticker">
        <div className="container ticker-wrapper">
          {/* Fixed Red Badge on Left */}
          <div className="ticker-badge">
            <Zap size={15} className="ticker-badge-icon" />
            <span>{isBn ? 'সর্বশেষ সংবাদ' : 'Breaking News'}</span>
          </div>

          {/* Continuous Slow Right-to-Left Scrolling Marquee */}
          <div className="ticker-marquee-container" title={isBn ? 'সংবাদে ক্লিক করুন' : 'Click to read'}>
            <div className="ticker-marquee-track ticker-speed-slow">
              {/* First Set */}
              {tickerItems.map((art, idx) => (
                <span
                  key={`t1-${art.id || idx}`}
                  className="ticker-item"
                  onClick={() => openArticle(art)}
                >
                  <span className="ticker-cat-tag">
                    [{isBn ? (art.categoryBn || art.category || 'বাংলাদেশ') : (art.category || 'National')}]
                  </span>
                  <span className="ticker-title">
                    {isBn ? art.titleBn : art.titleEn}
                  </span>
                  <span className="ticker-separator">✦</span>
                </span>
              ))}

              {/* Duplicate Set for Seamless Loop */}
              {tickerItems.map((art, idx) => (
                <span
                  key={`t2-${art.id || idx}`}
                  className="ticker-item"
                  onClick={() => openArticle(art)}
                >
                  <span className="ticker-cat-tag">
                    [{isBn ? (art.categoryBn || art.category || 'বাংলাদেশ') : (art.category || 'National')}]
                  </span>
                  <span className="ticker-title">
                    {isBn ? art.titleBn : art.titleEn}
                  </span>
                  <span className="ticker-separator">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Highlighted News Ticker (Vertical Slide-Up / Down Animation) */}
      <div className="highlights-ticker">
        <div className="container ticker-wrapper">
          {/* Fixed Dark/Gold Highlights Badge on Left */}
          <div className="highlights-ticker-badge">
            <span>{isBn ? 'হাইলাইটস' : 'Highlights'}</span>
          </div>

          {/* Vertical Slide Ticker Container */}
          <div
            className="highlight-vertical-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {activeHighlight && (
              <div
                key={`${activeHighlight.id || currentHighlightIdx}-${slideDirection}-${currentHighlightIdx}`}
                className={`highlight-vertical-item ${slideDirection === 'up' ? 'slide-anim-up' : 'slide-anim-down'}`}
                onClick={() => openArticle(activeHighlight)}
                title={isBn ? 'সংবাদটি পড়তে ক্লিক করুন' : 'Click to read'}
              >
                <span className="highlight-cat-tag">
                  [{isBn ? (activeHighlight.categoryBn || activeHighlight.category || 'হাইলাইটস') : (activeHighlight.category || 'Highlight')}]
                </span>
                <span className="highlight-vertical-title">
                  {isBn ? activeHighlight.titleBn : activeHighlight.titleEn}
                </span>
              </div>
            )}

            {/* Navigation Up/Down Arrows and Counter */}
            {highlightItems.length > 1 && (
              <div className="highlight-nav-controls">
                <span className="highlight-count-indicator">
                  {isBn
                    ? `${(currentHighlightIdx + 1).toLocaleString('bn-BD')}/${highlightItems.length.toLocaleString('bn-BD')}`
                    : `${currentHighlightIdx + 1}/${highlightItems.length}`}
                </span>
                <button
                  type="button"
                  onClick={handlePrevHighlight}
                  className="highlight-nav-btn"
                  title={isBn ? 'পূর্ববর্তী সংবাদ' : 'Previous'}
                  aria-label="Previous Highlight"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleNextHighlight}
                  className="highlight-nav-btn"
                  title={isBn ? 'পরবর্তী সংবাদ' : 'Next'}
                  aria-label="Next Highlight"
                >
                  <ChevronDown size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

