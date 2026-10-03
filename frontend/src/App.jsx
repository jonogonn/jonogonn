import React from 'react';
import { useNews } from './context/NewsContext';
import TopBar from './components/Header/TopBar';
import MainHeader from './components/Header/MainHeader';
import Navbar from './components/Header/Navbar';
import BreakingTicker from './components/News/BreakingTicker';
import HeroLeadGrid from './components/News/HeroLeadGrid';
import LatestNewsGrid from './components/News/LatestNewsGrid';
import BangladeshSection from './components/News/BangladeshSection';
import CategoryGrids from './components/News/CategoryGrids';
import ArticleDetailPage from './components/News/ArticleDetailPage';
import AdSenseSlot from './components/Ads/AdSenseSlot';
import NewsletterRibbon from './components/Newsletter/NewsletterRibbon';
import Footer from './components/Footer/Footer';
import PolicyModal from './components/Modals/PolicyModal';
import ScrollToTop from './components/UI/ScrollToTop';
import AdminDashboard from './admin/AdminDashboard';
import { Clock, ArrowLeft } from 'lucide-react';

export default function App() {
  const {
    isAdminOpen,
    currentArticle,
    openArticle,
    goToHome,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    articles,
    categories,
    language
  } = useNews();

  const isBn = language === 'bn';

  // If Admin Dashboard View is toggled
  if (isAdminOpen) {
    return <AdminDashboard />;
  }

  // Filter articles if search query or non-default category is active
  const isFiltered = (activeCategory !== 'latest' && activeCategory !== 'all') || searchQuery.trim().length > 0;

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      !searchQuery ||
      (art.titleBn && art.titleBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (art.titleEn && art.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (art.contentBn && art.contentBn.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === 'latest' ||
      activeCategory === 'all' ||
      art.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  return (
    <>
      {/* Top Bar with Date, Weather, Links, Socials */}
      <TopBar />

      {/* Main Brand Header with SVG Logo and Search */}
      <MainHeader />

      {/* Solid Red Navigation Bar with Categories, BN/EN toggle, and Dark/Light mode */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="main-content-layout">
        {/* Breaking News Ticker */}
        <BreakingTicker />

        {/* 1. DEDICATED FULL ARTICLE PAGE VIEW */}
        {currentArticle ? (
          <ArticleDetailPage />
        ) : isFiltered ? (
          /* 2. CUSTOM CATEGORY / SEARCH RESULTS VIEW */
          <div className="container" style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.6rem', fontWeight: 700 }}>
                {searchQuery
                  ? `${isBn ? 'অনুসন্ধানের ফলাফল:' : 'Search Results for:'} "${searchQuery}"`
                  : (isBn ? activeCategoryObj?.nameBn || activeCategory : activeCategoryObj?.nameEn || activeCategory)}
              </h1>
              <button
                onClick={goToHome}
                className="section-link"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ArrowLeft size={16} />
                <span>{isBn ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}</span>
              </button>
            </div>

            {filteredArticles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <h3>{isBn ? 'কোনো সংবাদ পাওয়া যায়নি।' : 'No news articles found.'}</h3>
              </div>
            ) : (
              <div className="news-grid-4">
                {filteredArticles.map((item) => (
                  <article
                    key={item.id}
                    className="news-card-standard"
                    onClick={() => openArticle(item)}
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
                      <h2 className="news-card-title">
                        {isBn ? item.titleBn : item.titleEn}
                      </h2>
                      <div className="news-card-date">
                        <Clock size={13} color="var(--primary-red)" />
                        <span>{isBn ? item.dateBn : item.dateEn}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 3. MASTER HOMEPAGE EDITORIAL LAYOUT */
          <div className="container">
            {/* Hero Lead 3-Column Grid */}
            <HeroLeadGrid />

            {/* In-Feed AdSense Banner (970 × 90) */}
            <AdSenseSlot slotId="midContentBanner" customClass="ad-slot-970x90" />

            {/* Section: সর্বশেষ সংবাদ (4-Card Horizontal Grid) */}
            <LatestNewsGrid />

            {/* Section: বাংলাদেশ & ভিডিও সংবাদ */}
            <BangladeshSection />

            {/* Section: 8 Category Visual Grids */}
            <CategoryGrids />

            {/* Bottom AdSense Banner (970 × 90) */}
            <AdSenseSlot slotId="bottomBanner" customClass="ad-slot-970x90" />
          </div>
        )}

        {/* Newsletter Subscription Ribbon */}
        <NewsletterRibbon />
      </main>

      {/* Master Footer with Founder, Office address, Terms & Socials */}
      <Footer />

      {/* Policy & Terms Modal */}
      <PolicyModal />

      {/* Floating Bottom to Top Button */}
      <ScrollToTop />
    </>
  );
}
