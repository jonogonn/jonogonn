import React from 'react';
import { useNews } from '../../context/NewsContext';
import { ArrowRight, Clock } from 'lucide-react';

export default function CategoryGrids() {
  const { language, articles, openArticle, setActiveCategory } = useNews();
  const isBn = language === 'bn';

  const categoryConfigs = [
    { id: 'politics', nameBn: 'রাজনীতি', nameEn: 'Politics' },
    { id: 'world', nameBn: 'বিশ্ব', nameEn: 'World' },
    { id: 'economy', nameBn: 'অর্থনীতি', nameEn: 'Economy' },
    { id: 'sports', nameBn: 'খেলা', nameEn: 'Sports' },
    { id: 'entertainment', nameBn: 'বিনোদন', nameEn: 'Entertainment' },
    { id: 'tech', nameBn: 'প্রযুক্তি', nameEn: 'Tech' },
    { id: 'lifestyle', nameBn: 'জীবনযাপন', nameEn: 'Lifestyle' },
    { id: 'opinion', nameBn: 'মতামত', nameEn: 'Opinion' }
  ];

  const handleArticleClick = (art) => {
    openArticle(art);
  };

  return (
    <section className="category-blocks-grid">
      {categoryConfigs.map((cat) => {
        // Find matching article for this category
        const article =
          articles.find((a) => a.category === cat.id) ||
          articles.find((a) => a.id.includes(cat.id)) ||
          articles[0];

        const isOpinion = cat.id === 'opinion';

        return (
          <div key={cat.id} className="cat-block-card">
            {/* Category Header */}
            <div className="cat-block-header">
              <h3 className="cat-block-name">
                {isBn ? cat.nameBn : cat.nameEn}
              </h3>
              <button
                onClick={() => setActiveCategory(cat.id)}
                className="section-link"
                style={{ fontSize: '0.78rem' }}
              >
                <span>{isBn ? 'সব দেখুন' : 'All'}</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Opinion Special Layout vs Standard Image Card */}
            {isOpinion ? (
              <div
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
                onClick={() => handleArticleClick(article)}
              >
                <div className="opinion-author-wrap">
                  <img
                    src={article.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'}
                    alt={article.authorNameBn || 'লেখক'}
                    className="opinion-avatar"
                  />
                  <div className="opinion-author-info">
                    <span className="opinion-author-name">
                      {isBn ? article.authorNameBn || 'ড. আতিকুর রহমান' : article.authorNameEn || 'Dr. Atiqur Rahman'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {isBn ? article.authorTitleBn || 'কলামিস্ট ও গবেষক' : 'Columnist & Researcher'}
                    </span>
                  </div>
                </div>
                <h4 className="cat-block-title" style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: '1.05rem' }}>
                  "{isBn ? article.titleBn : article.titleEn}"
                </h4>
                <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color="var(--primary-red)" />
                  <span>{isBn ? article.dateBn : article.dateEn}</span>
                </div>
              </div>
            ) : (
              <div
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
                onClick={() => handleArticleClick(article)}
              >
                <div className="cat-block-image-wrap">
                  <img
                    src={article.imageUrl}
                    alt={isBn ? article.titleBn : article.titleEn}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                <h4 className="cat-block-title">
                  {isBn ? article.titleBn : article.titleEn}
                </h4>
                <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color="var(--primary-red)" />
                  <span>{isBn ? article.dateBn : article.dateEn}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
