import React from 'react';
import { useNews } from '../../context/NewsContext';
import { Zap, Sparkles } from 'lucide-react';

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
  const highlightItems = highlightedArticles.length > 0 ? highlightedArticles : articles.slice(0, 6);

  return (
    <div className="dual-ticker-section">
      {/* 1. Main Breaking News Ticker */}
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

      {/* 2. Highlighted News Ticker (Right Below Breaking News) */}
      <div className="highlights-ticker">
        <div className="container ticker-wrapper">
          {/* Fixed Dark/Gold Highlights Badge on Left */}
          <div className="highlights-ticker-badge">
            <Sparkles size={15} className="highlights-badge-icon" />
            <span>{isBn ? 'হাইলাইটস' : 'Highlights'}</span>
          </div>

          {/* Continuous Right-to-Left Scrolling Marquee for Highlights */}
          <div className="ticker-marquee-container" title={isBn ? 'হাইলাইটস সংবাদে ক্লিক করুন' : 'Click to read'}>
            <div className="ticker-marquee-track ticker-speed-highlights">
              {/* First Set */}
              {highlightItems.map((art, idx) => (
                <span
                  key={`h1-${art.id || idx}`}
                  className="ticker-item highlight-ticker-item"
                  onClick={() => openArticle(art)}
                >
                  <span className="highlight-cat-tag">
                    [{isBn ? (art.categoryBn || art.category || 'হাইলাইটস') : (art.category || 'Highlight')}]
                  </span>
                  <span className="ticker-title">
                    {isBn ? art.titleBn : art.titleEn}
                  </span>
                  <span className="ticker-separator">★</span>
                </span>
              ))}

              {/* Duplicate Set for Seamless Loop */}
              {highlightItems.map((art, idx) => (
                <span
                  key={`h2-${art.id || idx}`}
                  className="ticker-item highlight-ticker-item"
                  onClick={() => openArticle(art)}
                >
                  <span className="highlight-cat-tag">
                    [{isBn ? (art.categoryBn || art.category || 'হাইলাইটস') : (art.category || 'Highlight')}]
                  </span>
                  <span className="ticker-title">
                    {isBn ? art.titleBn : art.titleEn}
                  </span>
                  <span className="ticker-separator">★</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
