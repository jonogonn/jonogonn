import React from 'react';
import { useNews } from '../../context/NewsContext';
import { Play, Clock, ArrowRight } from 'lucide-react';

export default function BangladeshSection() {
  const { language, articles, openArticle, setActiveCategory } = useNews();
  const isBn = language === 'bn';

  const bdArticles = articles.filter(
    (a) => a.category === 'bangladesh' || a.category === 'politics' || a.id === 'bd-main'
  );

  const bdMain = bdArticles.find((a) => a.id === 'bd-main') || bdArticles[0] || articles[0];
  const bdSubList = articles.slice(1, 5);

  // Video Section items
  const videoMain = articles.find((a) => a.id === 'video-main') || {
    id: 'video-main',
    titleBn: 'পদ্মা সেতুতে নতুন রেললাইন: যা জানালেন কর্তৃপক্ষ',
    titleEn: 'New rail link on Padma Bridge: Key official insights',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80',
    dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:০৫',
    dateEn: '28 Sep 2026',
    videoDuration: '০:৩২'
  };

  const videoSubList = articles.filter((a) => a.isVideo && a.id !== 'video-main').slice(0, 3);

  const handleArticleClick = (art) => {
    openArticle(art);
  };

  return (
    <section className="split-section-grid">
      {/* 1. Left Column: বাংলাদেশ */}
      <div className="split-col">
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

        <div className="bangladesh-news-layout">
          {/* Main Featured Big Card */}
          <article
            className="news-card-standard"
            onClick={() => handleArticleClick(bdMain)}
            title={isBn ? bdMain.titleBn : bdMain.titleEn}
          >
            <div className="news-card-img-wrap">
              <img
                src={bdMain.imageUrl}
                alt={isBn ? bdMain.titleBn : bdMain.titleEn}
                className="news-card-img"
                loading="lazy"
              />
            </div>
            <div className="news-card-body">
              <h3 className="news-card-title" style={{ fontSize: '1.25rem' }}>
                {isBn ? bdMain.titleBn : bdMain.titleEn}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                {isBn ? bdMain.excerptBn : bdMain.excerptEn}
              </p>
              <div className="news-card-date">
                <Clock size={13} color="var(--primary-red)" />
                <span>{isBn ? bdMain.dateBn : bdMain.dateEn}</span>
              </div>
            </div>
          </article>

          {/* Sub List (4 items) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bdSubList.map((item) => (
              <article
                key={item.id}
                className="sub-lead-card"
                onClick={() => handleArticleClick(item)}
                title={isBn ? item.titleBn : item.titleEn}
              >
                <div className="sub-lead-img-wrap" style={{ width: 84, height: 60 }}>
                  <img
                    src={item.imageUrl}
                    alt={isBn ? item.titleBn : item.titleEn}
                    className="sub-lead-img"
                    loading="lazy"
                  />
                </div>
                <div className="sub-lead-content">
                  <h4 className="sub-lead-title" style={{ fontSize: '0.9rem' }}>
                    {isBn ? item.titleBn : item.titleEn}
                  </h4>
                  <span className="sub-lead-date">
                    {isBn ? item.dateBn : item.dateEn}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Right Column: ভিডিও সংবাদ (Video News) */}
      <div className="split-col">
        <div className="section-header">
          <h2 className="section-title">
            {isBn ? 'ভিডিও সংবাদ' : 'Video News'}
          </h2>
          <button
            onClick={() => setActiveCategory('video')}
            className="section-link"
          >
            <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Big Video Card */}
        <article
          className="video-player-card"
          onClick={() => handleArticleClick(videoMain)}
          title={isBn ? videoMain.titleBn : videoMain.titleEn}
        >
          <div className="video-thumb-wrap">
            <img
              src={videoMain.imageUrl}
              alt={isBn ? videoMain.titleBn : videoMain.titleEn}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
            <div className="play-icon-overlay">
              <Play size={24} fill="currentColor" />
            </div>
            <span className="video-duration-badge">
              {videoMain.videoDuration || '০:৩২'}
            </span>
          </div>
          <div style={{ padding: 12 }}>
            <h3 className="news-card-title">
              {isBn ? videoMain.titleBn : videoMain.titleEn}
            </h3>
            <span className="news-card-date">
              <Clock size={13} color="var(--primary-red)" />
              {isBn ? videoMain.dateBn : videoMain.dateEn}
            </span>
          </div>
        </article>

        {/* Sub Video Items */}
        <div className="video-sub-list">
          {videoSubList.map((vItem) => (
            <div
              key={vItem.id}
              className="video-sub-item"
              onClick={() => handleArticleClick(vItem)}
              title={isBn ? vItem.titleBn : vItem.titleEn}
            >
              <div className="video-sub-thumb">
                <img
                  src={vItem.imageUrl}
                  alt={isBn ? vItem.titleBn : vItem.titleEn}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div className="small-play-btn">
                  <Play size={12} fill="currentColor" />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-main)' }}>
                  {isBn ? vItem.titleBn : vItem.titleEn}
                </h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  ⏱ {vItem.videoDuration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
