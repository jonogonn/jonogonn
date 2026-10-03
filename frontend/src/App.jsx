import React from 'react';
import { useNews } from './context/NewsContext';
import TopBar from './components/Header/TopBar';
import MainHeader from './components/Header/MainHeader';
import Navbar from './components/Header/Navbar';
import BreakingTicker from './components/News/BreakingTicker';
import HeroLeadGrid from './components/News/HeroLeadGrid';
import LatestNewsGrid from './components/News/LatestNewsGrid';
import PodcastSection from './components/News/PodcastSection';
import DistrictNewsSection from './components/News/DistrictNewsSection';
import BangladeshSection from './components/News/BangladeshSection';
import VideoNewsSection from './components/News/VideoNewsSection';
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
          <div className="container category-page-container">
            <div className="category-page-header">
              <div>
                <span className="category-page-badge">
                  {searchQuery ? (isBn ? 'অনুসন্ধান' : 'Search') : (isBn ? 'বিভাগ' : 'Category')}
                </span>
                <h1 className="category-page-title">
                  {searchQuery
                    ? `${isBn ? 'অনুসন্ধানের ফলাফল:' : 'Search Results for:'} "${searchQuery}"`
                    : (isBn ? activeCategoryObj?.nameBn || activeCategory : activeCategoryObj?.nameEn || activeCategory)}
                </h1>
                <p className="category-page-count">
                  {isBn ? `মোট ${filteredArticles.length} টি সংবাদ` : `${filteredArticles.length} articles found`}
                </p>
              </div>
              <button
                onClick={goToHome}
                className="section-link back-to-home-btn"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ArrowLeft size={16} />
                <span>{isBn ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}</span>
              </button>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="no-news-box" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <h3>{isBn ? 'কোনো সংবাদ পাওয়া যায়নি।' : 'No news articles found.'}</h3>
                <button onClick={goToHome} className="btn-primary" style={{ marginTop: 14 }}>
                  {isBn ? 'মূল পাতায় ফিরে যান' : 'Back to Homepage'}
                </button>
              </div>
            ) : (
              <div className="category-news-grid">
                {filteredArticles.map((item) => (
                  <article
                    key={item.id}
                    className="category-news-card"
                    onClick={() => openArticle(item)}
                    title={isBn ? item.titleBn : item.titleEn}
                  >
                    <div className="category-card-img-wrap">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80'}
                        alt={isBn ? item.titleBn : item.titleEn}
                        className="category-card-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';
                        }}
                      />
                      <span className="category-card-badge">
                        {isBn ? item.categoryBn || item.category : item.category}
                      </span>
                    </div>
                    <div className="category-card-body">
                      <h2 className="category-card-title">
                        {isBn ? item.titleBn : item.titleEn}
                      </h2>
                      {item.excerptBn && (
                        <p className="category-card-excerpt">
                          {isBn ? item.excerptBn : item.excerptEn}
                        </p>
                      )}
                      <div className="category-card-footer">
                        <div className="category-card-date">
                          <Clock size={12} color="var(--primary-red)" />
                          <span>{isBn ? item.dateBn : item.dateEn}</span>
                        </div>
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

            {/* Section: সর্বশেষ সংবাদ (Horizontal Left-to-Right Scrolling Track) */}
            <LatestNewsGrid />

            {/* Section: বাংলাদেশ (Featured Lead + Sub-leads + Weather & Follow Us Widgets) */}
            <BangladeshSection />

            {/* Section: ভিডিও সংবাদ (Video News Player & Playlist) */}
            <VideoNewsSection />

            {/* Section: আমাদের পডকাস্ট (Horizontal Right-to-Left Scrolling Track) */}
            <PodcastSection />

            {/* Section: আমার {{District}} (Dynamic District News Selector) */}
            <DistrictNewsSection />

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
