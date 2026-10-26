import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { Zap, Tv, ChevronUp, ChevronDown, Clock, Radio } from 'lucide-react';

export default function BreakingTicker() {
  const { language, articles, breakingNews, openArticle } = useNews();
  const isBn = language === 'bn';

  // Helper to parse article timestamp
  const getArticleTimestamp = (art) => {
    if (!art) return 0;
    const dateStr = art.publishedAt || art.createdAt || art.dateEn || art.dateBn;
    if (!dateStr) return 0;
    let parsed = Date.parse(dateStr);
    if (isNaN(parsed) && typeof dateStr === 'string') {
      parsed = Date.parse(dateStr.replace(/-/g, '/'));
    }
    return !isNaN(parsed) ? parsed : 0;
  };

  // Valid published articles pool
  const validArticles = (articles || []).filter((a) => a && (a.status === 'approved' || a.status === 'published' || !a.status));

  // 1. Highlighted Headlines: strictly posts marked as isHighlighted by Admin
  const highlightedArticles = validArticles.filter(
    (a) => a.isHighlighted === true || a.is_highlighted === true || a.isHighlighted === 1 || a.is_highlighted === 1
  );

  const defaultHighlightFallback = [
    {
      id: 'default-highlight-1',
      titleBn: 'জনগণ.নিউজ — জনগণের পক্ষে সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত ডিজিটাল মাধ্যম',
      titleEn: 'Jonogon News — Voice of the People, Authentic and Verified News',
      categoryBn: 'হাইলাইটস',
      category: 'Highlights'
    }
  ];

  // Strictly show admin-marked highlights
  const highlightItems = highlightedArticles.length > 0 ? highlightedArticles : defaultHighlightFallback;

  // 2. Breaking News Ticker (সর্বশেষ সংবাদ): strictly news published within the last 24 hours
  const now = Date.now();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  const last24HrArticles = validArticles
    .filter((art) => {
      const ts = getArticleTimestamp(art);
      if (!ts) return false;
      const diff = now - ts;
      // Within last 24 hours (with 1 hr tolerance for clock variations)
      return diff <= TWENTY_FOUR_HOURS_MS && diff >= -3600000;
    })
    .sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));

  // If news exists within last 24 hours, display all 24hr headlines; otherwise fallback to newest published
  const tickerItems = last24HrArticles.length > 0
    ? last24HrArticles
    : (validArticles.length > 0
        ? [...validArticles].sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a)).slice(0, 15)
        : breakingNews.map((b) => ({
            id: b.id,
            titleBn: b.textBn,
            titleEn: b.textEn,
            categoryBn: 'সর্বশেষ',
            category: 'Latest'
          })));

  const [currentHighlightIdx, setCurrentHighlightIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState('up');
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Live Digital Clock updating every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      if (isBn) {
        // Bengali formatted time & date
        setCurrentTime(now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        setCurrentDate(now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }));
      } else {
        setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        setCurrentDate(now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
      }
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, [isBn]);

  // Auto-cycle top highlight headlines vertically every 4.5 seconds with push-up transition
  useEffect(() => {
    if (highlightItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setSlideDirection('up');
      setCurrentHighlightIdx((prev) => (prev + 1) % highlightItems.length);
    }, 4500);

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
  const activeTopic = isBn
    ? (activeHighlight?.categoryBn || activeHighlight?.category || 'শিরোনাম')
    : (activeHighlight?.category || 'Headline');

  return (
    <div className="star-news-broadcast-deck" role="region" aria-label={isBn ? 'সংবাদ শিরোনাম ও সর্বশেষ আপডেট' : 'News Headlines & Updates'}>
      <div className="container broadcast-container">

        {/* ========================================================
            DECK 1 (TOP): STAR NEWS PRIMARY HEADLINE BAR (TOP NEWS / HIGHLIGHTS)
            ======================================================== */}
        <div 
          className="star-headline-plate"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 1. Left Label: HIGHLIGHTS / Top News Tag */}
          <div className="star-headline-brand">
            <span className="star-brand-label">{isBn ? 'হাইলাইটস' : 'HIGHLIGHTS'}</span>
          </div>

          {/* 2. Topic/Category Badge (Solid Royal Blue Bar with 3D Flip Rotation) */}
          <div className="star-topic-tag-wrap">
            <div
              key={`topic-${activeTopic}-${currentHighlightIdx}`}
              className="star-topic-tag anim-topic-3d-flip"
              title={activeTopic}
            >
              <span className="star-topic-text">{activeTopic}</span>
              <span className="star-topic-arrow"></span>
            </div>
          </div>

          {/* 3. Main Headline Plate with Smooth Slide-Up Transition & Shimmer Sheen */}
          <div 
            className="star-headline-viewport"
            onClick={() => activeHighlight && openArticle(activeHighlight)}
            title={isBn ? 'সম্পূর্ণ সংবাদ পড়তে ক্লিক করুন' : 'Click to read full article'}
          >
            {activeHighlight && (
              <div
                key={`headline-${activeHighlight.id || currentHighlightIdx}-${slideDirection}-${currentHighlightIdx}`}
                className={`star-headline-item ${slideDirection === 'up' ? 'anim-push-up' : 'anim-push-down'}`}
              >
                <div className="star-headline-shine"></div>
                <h3 className="star-headline-title">
                  {isBn ? activeHighlight.titleBn : activeHighlight.titleEn}
                </h3>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            DECK 2 (BOTTOM): STAR NEWS LIVE CRAWL TICKER (সর্বশেষ সংবাদ)
            ======================================================== */}
        <div className="star-ticker-plate">

          {/* 2. Breaking Tag (Solid Red Badge) */}
          <div className="star-breaking-badge">
            <span className="star-breaking-label">{isBn ? 'সর্বশেষ সংবাদ' : 'BREAKING'}</span>
          </div>

          {/* 3. Continuous Seamless Horizontal Marquee Crawl */}
          <div className="star-crawl-viewport" title={isBn ? 'সংবাদে ক্লিক করুন' : 'Click to read'}>
            <div className="star-crawl-track">
              {/* Primary Loop */}
              {tickerItems.map((art, idx) => (
                <div
                  key={`crawl-1-${art.id || idx}`}
                  className="star-crawl-item"
                  onClick={() => openArticle(art)}
                >
                  <span className="star-crawl-cat">
                    [{isBn ? (art.categoryBn || art.category || 'বাংলাদেশ') : (art.category || 'National')}]
                  </span>
                  <span className="star-crawl-text">
                    {isBn ? art.titleBn : art.titleEn}
                  </span>
                  <span className="star-crawl-divider">✦</span>
                </div>
              ))}

              {/* Duplicate Loop for Seamless Infinite Scroll */}
              {tickerItems.map((art, idx) => (
                <div
                  key={`crawl-2-${art.id || idx}`}
                  className="star-crawl-item"
                  onClick={() => openArticle(art)}
                >
                  <span className="star-crawl-cat">
                    [{isBn ? (art.categoryBn || art.category || 'বাংলাদেশ') : (art.category || 'National')}]
                  </span>
                  <span className="star-crawl-text">
                    {isBn ? art.titleBn : art.titleEn}
                  </span>
                  <span className="star-crawl-divider">✦</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

