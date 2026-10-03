import React from 'react';
import { useNews } from '../../context/NewsContext';
import { Clock, ArrowRight } from 'lucide-react';

export default function LatestNewsGrid() {
  const { language, articles, openArticle, setActiveCategory } = useNews();
  const isBn = language === 'bn';

  // Get 4 latest news cards
  const latestCards = articles.slice(0, 4);

  const handleArticleClick = (art) => {
    openArticle(art);
  };

  return (
    <section style={{ marginBottom: 28 }}>
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">
          {isBn ? 'সর্বশেষ সংবাদ' : 'Latest News'}
        </h2>
        <button
          onClick={() => setActiveCategory('latest')}
          className="section-link"
        >
          <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="news-grid-4">
        {latestCards.map((item) => (
          <article
            key={item.id}
            className="news-card-standard"
            onClick={() => handleArticleClick(item)}
            title={isBn ? item.titleBn : item.titleEn}
          >
            <div className="news-card-img-wrap">
              <img
                src={item.imageUrl}
                alt={isBn ? item.titleBn : item.titleEn}
                className="news-card-img"
                loading="lazy"
              />
            </div>
            <div className="news-card-body">
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
    </section>
  );
}
