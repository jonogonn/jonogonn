import React, { useState } from 'react';
import { useNews } from '../../context/NewsContext';
import { Clock, Eye, BookOpen } from 'lucide-react';
import AdSenseSlot from '../Ads/AdSenseSlot';

export default function HeroLeadGrid() {
  const { language, articles, openArticle } = useNews();
  const [rankingTab, setRankingTab] = useState('mostRead'); // 'mostRead' | 'latest'
  const isBn = language === 'bn';

  if (!articles || articles.length === 0) return null;

  // 1. Big Hero Main Story
  const heroMain = articles.find((a) => a.isLeadHero) || articles[0];

  // 2. Middle Column 4 Sub-Leads
  const subLeads = articles
    .filter((a) => a.id !== heroMain.id)
    .slice(0, 4);

  // 3. Right Column Ranking Items (Sorted by views for Most Read, or date/id for Latest)
  const mostReadList = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const latestList = [...articles].slice(0, 5);

  const activeRankingList = rankingTab === 'mostRead' ? mostReadList : latestList;

  const handleArticleClick = (art) => {
    openArticle(art);
  };

  return (
    <section className="hero-lead-grid">
      {/* 1. Left Column: Big Hero Story */}
      <article
        className="hero-main-card"
        onClick={() => handleArticleClick(heroMain)}
        title={isBn ? heroMain.titleBn : heroMain.titleEn}
      >
        <div className="hero-main-image-wrap">
          <img
            src={heroMain.imageUrl}
            alt={isBn ? heroMain.titleBn : heroMain.titleEn}
            className="hero-main-image"
            loading="eager"
          />
          <div className="hero-main-badge-overlay">
            <span className="badge-category">
              {isBn ? heroMain.categoryBn || 'বাংলাদেশ' : heroMain.category || 'Bangladesh'}
            </span>
          </div>
        </div>

        <div className="hero-main-info">
          <h1 className="hero-main-title">
            {isBn ? heroMain.titleBn : heroMain.titleEn}
          </h1>

          <div className="hero-main-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} color="var(--primary-red)" />
              {isBn ? heroMain.dateBn : heroMain.dateEn}
            </span>
            <span>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <BookOpen size={14} color="var(--primary-red)" />
              {isBn ? heroMain.readTimeBn || '৪ মিনিট পড়তে' : heroMain.readTimeEn || '4 min read'}
            </span>
          </div>
        </div>
      </article>

      {/* 2. Middle Column: 4 Sub-Lead Cards */}
      <div className="hero-sub-list">
        {subLeads.map((item) => (
          <article
            key={item.id}
            className="sub-lead-card"
            onClick={() => handleArticleClick(item)}
            title={isBn ? item.titleBn : item.titleEn}
          >
            <div className="sub-lead-img-wrap">
              <img
                src={item.imageUrl}
                alt={isBn ? item.titleBn : item.titleEn}
                className="sub-lead-img"
                loading="lazy"
              />
            </div>
            <div className="sub-lead-content">
              <span className="sub-lead-badge">
                {isBn ? item.categoryBn || 'জাতীয়' : item.category || 'National'}
              </span>
              <h2 className="sub-lead-title">
                {isBn ? item.titleBn : item.titleEn}
              </h2>
              <span className="sub-lead-date">
                {isBn ? item.dateBn : item.dateEn}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* 3. Right Column: AdSense (300x250) + Top Read / Latest Tabbed Ranking List */}
      <aside className="hero-right-col">
        {/* Top 300x250 AdSlot */}
        <AdSenseSlot slotId="leadSidebarAd" customClass="ad-slot-300x250" />

        {/* Tabbed 01-05 Ranking Box */}
        <div className="tabbed-ranking-box">
          <div className="tab-header-nav">
            <button
              className={`tab-btn ${rankingTab === 'mostRead' ? 'active' : ''}`}
              onClick={() => setRankingTab('mostRead')}
            >
              {isBn ? 'সর্বাধিক পঠিত' : 'Most Read'}
            </button>
            <button
              className={`tab-btn ${rankingTab === 'latest' ? 'active' : ''}`}
              onClick={() => setRankingTab('latest')}
            >
              {isBn ? 'সর্বশেষ' : 'Latest'}
            </button>
          </div>

          <div className="ranking-list">
            {activeRankingList.map((art, idx) => {
              const numStr = isBn
                ? String(idx + 1).padStart(2, '0').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])
                : String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={art.id}
                  className="ranking-item"
                  onClick={() => handleArticleClick(art)}
                  title={isBn ? art.titleBn : art.titleEn}
                >
                  <span className="ranking-num">{numStr}</span>
                  <p className="ranking-title">
                    {isBn ? art.titleBn : art.titleEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </section>
  );
}
