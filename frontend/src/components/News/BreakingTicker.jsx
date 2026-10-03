import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

export default function BreakingTicker() {
  const { language, breakingNews, openArticle, articles } = useNews();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isBn = language === 'bn';

  const items = breakingNews && breakingNews.length > 0 ? breakingNews : [
    { textBn: 'স্বাগতম জনগণ.নিউজ - সত্যের সাথে, জনতার পাশে', textEn: 'Welcome to Jonogon News - Standing for the Truth' }
  ];

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const currentItem = items[currentIndex] || items[0];

  const handleItemClick = () => {
    // If matching article exists, open it
    const matched = articles.find(
      (a) => a.titleBn === currentItem.textBn || a.titleEn === currentItem.textEn
    );
    if (matched) {
      openArticle(matched);
    } else {
      openArticle(articles[0]);
    }
  };

  return (
    <div className="breaking-ticker">
      <div className="container ticker-wrapper">
        {/* Badge */}
        <div className="ticker-badge">
          <Zap size={15} />
          <span>{isBn ? 'সর্বশেষ' : 'Breaking'}</span>
        </div>

        {/* Ticker Headline */}
        <div
          className="ticker-content"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={handleItemClick}
          title={isBn ? currentItem.textBn : currentItem.textEn}
        >
          {isBn ? currentItem.textBn : currentItem.textEn}
        </div>

        {/* Prev / Next Controls */}
        <div className="ticker-controls">
          <button
            className="ticker-ctrl-btn"
            onClick={handlePrev}
            aria-label="Previous breaking headline"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="ticker-ctrl-btn"
            onClick={handleNext}
            aria-label="Next breaking headline"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
