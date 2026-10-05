import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  PhoneCall,
  Building2,
  Globe2,
  Coins
} from 'lucide-react';

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80';

export default function RemittanceFighter() {
  const { language, articles, openArticle, setActiveCategory } = useNews();
  const isBn = language === 'bn';

  // Expatriates & Remittance Articles Pool
  const probashiArticles = articles.filter(
    (a) => a.category === 'probashi' || a.id.startsWith('probashi')
  );
  const pool = probashiArticles.length >= 5 ? probashiArticles : articles;

  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide for Featured Lead Card (6 seconds)
  useEffect(() => {
    if (isPaused || pool.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % Math.min(pool.length, 5));
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, pool.length]);

  const currentSlide = pool[slideIndex] || pool[0];
  const subArticles = pool.filter((_, idx) => idx !== slideIndex).slice(0, 4);

  // Live Remittance Exchange Rates (Indicative Bank Rates to BDT)
  const exchangeRates = [
    { code: 'USD', nameBn: 'মার্কিন ডলার', flag: '🇺🇸', rate: '১২২.৫০' },
    { code: 'SAR', nameBn: 'সৌদি রিয়াল', flag: '🇸🇦', rate: '৩২.৬৫' },
    { code: 'AED', nameBn: 'ইউএই দিরহাম', flag: '🇦🇪', rate: '৩৩.৩৫' },
    { code: 'EUR', nameBn: 'ইউরো', flag: '🇪🇺', rate: '১৩১.৮০' },
    { code: 'GBP', nameBn: 'ব্রিটিশ পাউন্ড', flag: '🇬🇧', rate: '১৫৬.২০' },
    { code: 'MYR', nameBn: 'মালয়েশিয়া রিঙ্গিত', flag: '🇲🇾', rate: '২৭.৮৫' },
    { code: 'KWD', nameBn: 'কুয়েতি দিনার', flag: '🇰🇼', rate: '৩৯৮.৪০' }
  ];

  return (
    <section className="bangladesh-foxiz-section remittance-foxiz-theme" style={{ marginBottom: 32 }}>
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">
          {isBn ? 'প্রবাসী ও রেমিট্যান্স যোদ্ধা' : 'Remittance Fighters & Expatriates'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="remittance-header-incentive-pill">
            {isBn ? '+ ২.৫% সরকারি নগদ প্রণোদনা' : '+2.5% Govt Incentive'}
          </span>
          <button
            onClick={() => setActiveCategory('probashi')}
            className="section-link"
          >
            <span>{isBn ? 'সব প্রবাসী সংবাদ' : 'All Expatriate News'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 3-Column Editorial Grid: [Featured Lead (Left) | 4 Sub-Leads (Middle) | Remittance Rates & Helpline (Right)] */}
      <div className="foxiz-editorial-layout">

        {/* ========================================================
            Column 1: Big Featured Lead Card
            ======================================================== */}
        <div
          className="foxiz-featured-col"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <article
            key={currentSlide.id}
            className="foxiz-featured-card"
            onClick={() => openArticle(currentSlide)}
            title={isBn ? currentSlide.titleBn : currentSlide.titleEn}
          >
            <div className="foxiz-featured-img-wrap">
              <img
                src={currentSlide.imageUrl || FALLBACK_NEWS_IMG}
                alt={isBn ? currentSlide.titleBn : currentSlide.titleEn}
                className="foxiz-featured-img hero-unique-slide-anim"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_NEWS_IMG;
                }}
              />
              <div className="hero-image-scrim" />

              {/* Category Badge Overlay */}
              <div className="bd-hero-badge-overlay">
                <span className="badge-category" style={{ backgroundColor: '#0D5C9E' }}>
                  {isBn ? currentSlide.categoryBn || 'প্রবাসী' : currentSlide.category || 'Expatriates'}
                </span>
              </div>

              {/* Slider Navigation Arrows */}
              <div className="bd-hero-arrows">
                <button
                  className="bd-arrow-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideIndex((prev) => (prev - 1 + Math.min(pool.length, 5)) % Math.min(pool.length, 5));
                  }}
                  aria-label="Previous story"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="bd-arrow-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideIndex((prev) => (prev + 1) % Math.min(pool.length, 5));
                  }}
                  aria-label="Next story"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="foxiz-featured-body hero-content-slide-up">
              <span className="foxiz-featured-tag" style={{ color: '#0D5C9E' }}>
                {isBn ? currentSlide.categoryBn || 'প্রবাসী' : currentSlide.category || 'Expatriates'}
              </span>
              <h3 className="foxiz-featured-title">
                {isBn ? currentSlide.titleBn : currentSlide.titleEn}
              </h3>
              {currentSlide.excerptBn && (
                <p className="foxiz-featured-excerpt">
                  {isBn ? currentSlide.excerptBn : currentSlide.excerptEn}
                </p>
              )}
              <div className="foxiz-featured-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} color="#0D5C9E" />
                  {isBn ? currentSlide.dateBn : currentSlide.dateEn}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={13} color="#0D5C9E" />
                  {isBn ? currentSlide.readTimeBn || '৪ মিনিট' : currentSlide.readTimeEn || '4 min read'}
                </span>
              </div>
            </div>

            {/* Slider Dots Indicator */}
            <div className="bd-slider-dots" onClick={(e) => e.stopPropagation()}>
              {pool.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  className={`slider-dot ${idx === slideIndex ? 'active' : ''}`}
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </article>
        </div>

        {/* ========================================================
            Column 2: 4 Sub-Articles (Middle Column)
            ======================================================== */}
        <div className="foxiz-subleads-col">
          <div className="foxiz-subleads-list">
            {subArticles.map((subItem) => (
              <article
                key={`probashi-sub-${subItem.id}`}
                className="foxiz-sublead-card"
                onClick={() => openArticle(subItem)}
                title={isBn ? subItem.titleBn : subItem.titleEn}
              >
                <div className="foxiz-sublead-content">
                  <span className="foxiz-sublead-cat" style={{ color: '#0D5C9E' }}>
                    {isBn ? subItem.categoryBn || 'প্রবাসী' : subItem.category || 'Expatriates'}
                  </span>
                  <h4 className="foxiz-sublead-title">
                    {isBn ? subItem.titleBn : subItem.titleEn}
                  </h4>
                  <div className="foxiz-sublead-meta">
                    <Clock size={12} color="#0D5C9E" />
                    <span>{isBn ? subItem.dateBn : subItem.dateEn}</span>
                  </div>
                </div>

                <div className="foxiz-sublead-thumb-wrap">
                  <img
                    src={subItem.imageUrl || FALLBACK_NEWS_IMG}
                    alt={isBn ? subItem.titleBn : subItem.titleEn}
                    className="foxiz-sublead-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_NEWS_IMG;
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ========================================================
            Column 3: Remittance Rates & Expatriate Helpline Sidebar
            ======================================================== */}
        <div className="foxiz-sidebar-col">
          <div className="weather-follow-card remittance-sidebar-card">

            {/* Header: আজকের রেমিট্যান্স রেট */}
            <div className="remittance-side-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={16} color="#E60012" />
                <h4 className="remittance-side-title">
                  {isBn ? 'আজকের রেমিট্যান্স রেট' : 'Today’s Remittance Rates'}
                </h4>
              </div>
            </div>

            {/* 2.5% Government Incentive Ribbon */}
            <div className="remittance-incentive-banner">
              <span className="incentive-badge">+ ২.৫%</span>
              <span className="incentive-text">
                {isBn ? 'সরকারি নগদ প্রণোদনা (বৈধ চ্যানেলে)' : 'Govt Cash Incentive (Banking Channel)'}
              </span>
            </div>

            {/* Currency Rates Compact List */}
            <div className="remittance-rates-table">
              {exchangeRates.map((c) => (
                <div key={c.code} className="remittance-rate-row">
                  <div className="rate-currency-info">
                    <span className="rate-flag">{c.flag}</span>
                    <span className="rate-name">{isBn ? c.nameBn : c.code}</span>
                  </div>
                  <span className="rate-val">{c.rate} ৳</span>
                </div>
              ))}
            </div>

            {/* Emergency Helpline Box */}
            <div className="probashi-hotline-footer">
              <div className="hotline-icon-wrap">
                <PhoneCall size={14} color="#FFFFFF" />
              </div>
              <div className="hotline-details">
                <span className="hotline-sub">{isBn ? 'প্রবাসী কল্যাণ জরুরি হেল্পলাইন' : 'Expatriate Helpline'}</span>
                <a href="tel:16135" className="hotline-num">১৬১৩৫ (টোল ফ্রি)</a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
