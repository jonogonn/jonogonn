import React from 'react';
import { useNews } from '../../context/NewsContext';
import { Zap } from 'lucide-react';

export default function BreakingTicker() {
  const { language, articles, breakingNews, openArticle } = useNews();
  const isBn = language === 'bn';

  // Build the list of ticker items: prioritize all articles, fallback to breakingNews
  const tickerItems = articles && articles.length > 0
    ? articles
    : breakingNews.map((b) => ({
        id: b.id,
        titleBn: b.textBn,
        titleEn: b.textEn,
        categoryBn: 'সর্বশেষ',
        category: 'Latest'
      }));

  return (
    <div className="breaking-ticker">
      <div className="container ticker-wrapper">
        {/* Fixed Red Badge on Left */}
        <div className="ticker-badge">
          <Zap size={15} className="ticker-badge-icon" />
          <span>{isBn ? 'সর্বশেষ সংবাদ' : 'Breaking News'}</span>
        </div>

        {/* Continuous Right-to-Left Scrolling Marquee Track */}
        <div className="ticker-marquee-container" title={isBn ? 'সংবাদে ক্লিক করুন' : 'Click to read'}>
          <div className="ticker-marquee-track">
            {/* First Set of Items */}
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

            {/* Duplicate Set for Seamless Infinite Loop */}
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
  );
}
