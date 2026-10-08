import React, { useEffect } from 'react';
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
import RemittanceFighter from './components/News/RemittanceFighter';
import VideoNewsSection from './components/News/VideoNewsSection';
import CategoryGrids from './components/News/CategoryGrids';
import SubGroupSections from './components/News/SubGroupSections';
import ArticleDetailPage from './components/News/ArticleDetailPage';
import AdSenseSlot from './components/Ads/AdSenseSlot';
import SlidingAdBanners from './components/Ads/SlidingAdBanners';
import NewsletterRibbon from './components/Newsletter/NewsletterRibbon';
import ComplaintBoxSection from './components/News/ComplaintBoxSection';
import Footer from './components/Footer/Footer';
import PolicyModal from './components/Modals/PolicyModal';
import WebsiteLoadPopup from './components/Modals/WebsiteLoadPopup';
import ScrollToTop from './components/UI/ScrollToTop';
import SideWatchWidget from './components/Widgets/SideWatchWidget';
import AdminDashboard from './admin/AdminDashboard';
import AboutPage from './pages/AboutPage';
import AdvertisementPage from './pages/AdvertisementPage';
import ContactPage from './pages/ContactPage';
import EditorialPolicyPage from './pages/EditorialPolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CategoryPage from './pages/CategoryPage';
import FounderPage from './pages/FounderPage';
import { updateSEO } from './services/seoService';

export default function App() {
  const {
    isAdminOpen,
    activePage,
    currentArticle,
    activeCategory,
    language,
    settings
  } = useNews();

  const isBn = language === 'bn';

  // Default SEO on Homepage
  useEffect(() => {
    if (activePage === 'home') {
      updateSEO({
        title: isBn
          ? `${settings.siteNameBn || 'জনগণ.নিউজ'} — ${settings.sloganBn || 'জনতার কণ্ঠস্বর'}`
          : `Jonogon News — ${settings.sloganEn || 'Voice of the People'}`,
        description: isBn
          ? 'জনগণের পক্ষে সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত ঠিকানা। দেশ-বিদেশের ব্রেকিং নিউজ, রাজনীতি, বাণিজ্য, খেলা ও বিনোদনের তাজা খবর।'
          : 'Your trusted digital source for verified, objective, and timely journalism standing for the people of Bangladesh.',
        url: window.location.origin,
        type: 'website'
      });
    }
  }, [activePage, isBn, settings]);

  // If Admin Dashboard View is toggled or URL route is /admin
  const isDirectAdminUrl =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/admin' ||
      window.location.pathname === '/admin/' ||
      window.location.pathname.startsWith('/admin'));

  if (isAdminOpen || activePage === 'admin' || isDirectAdminUrl) {
    return <AdminDashboard />;
  }

  // Determine which view to render based on active route
  const renderMainContent = () => {
    if (activePage === 'about') {
      return <AboutPage />;
    }
    if (activePage === 'advertisement') {
      return <AdvertisementPage />;
    }
    if (activePage === 'contact') {
      return <ContactPage />;
    }
    if (activePage === 'editorial') {
      return <EditorialPolicyPage />;
    }
    if (activePage === 'privacy') {
      return <PrivacyPolicyPage />;
    }
    if (activePage === 'terms') {
      return <TermsPage />;
    }
    if (activePage === 'founder' || activePage === 'editor') {
      return <FounderPage />;
    }
    if (activePage === 'article' || currentArticle) {
      return <ArticleDetailPage />;
    }
    if (activePage === 'category' || (activeCategory !== 'latest' && activeCategory !== 'all')) {
      return <CategoryPage />;
    }

    // Default: Master Editorial Homepage (Exact Layout from GitHub Push f31f69e)
    return (
      <div className="container">
        {/* Ad Banner directly below Breaking Tickers (970 × 90) */}
        <div className="ticker-bottom-ad-wrap" style={{ marginBottom: 20 }}>
          <AdSenseSlot slotId="tickerBottomBanner" customClass="ad-slot-970x90" />
        </div>

        {/* Section 1: Hero Lead 3-Column Grid */}
        <HeroLeadGrid />

        {/* Section 2: Latest News (Horizontal Left-to-Right Scrolling Track) */}
        <LatestNewsGrid />

        {/* Ad Banner after 2 sections (HeroLeadGrid + LatestNewsGrid) (970 × 90) */}
        <div className="section-interval-ad-wrap" style={{ margin: '22px 0' }}>
          <AdSenseSlot slotId="afterLatestBanner" customClass="ad-slot-970x90" />
        </div>

        {/* Section 3: Bangladesh Section (Featured Lead + Sub-leads + Weather & Follow Us Widgets) */}
        <BangladeshSection />

        {/* Section: Expatriates & Remittance Fighters */}
        <RemittanceFighter />

        {/* Ad Banner after 2 sections (BangladeshSection + RemittanceFighter) (970 × 90) */}
        <div className="section-interval-ad-wrap" style={{ margin: '22px 0' }}>
          <AdSenseSlot slotId="afterVideoBanner" customClass="ad-slot-970x90" />
        </div>

        {/* Section 4: My District News (Dynamic District News Selector) */}
        <DistrictNewsSection />

        {/* Section 5: Video News (Video News Player & Playlist) */}
        <VideoNewsSection />

        {/* Section 6: Our Podcasts (Horizontal Right-to-Left Scrolling Track) */}
        <PodcastSection />

        {/* Ad Banner after 2 sections (PodcastSection + DistrictNewsSection) (970 × 90) */}
        <div className="section-interval-ad-wrap" style={{ margin: '22px 0' }}>
          <AdSenseSlot slotId="afterDistrictBanner" customClass="ad-slot-970x90" />
        </div>

        {/* Section 7: 24 Dedicated Category Sub-Group News Sections (Each 2 subgroups have inline ads) */}
        <SubGroupSections />

        {/* Bottom AdSense Banner (970 × 90) */}
        <div className="section-interval-ad-wrap" style={{ marginTop: 24, marginBottom: 12 }}>
          <AdSenseSlot slotId="bottomBanner" customClass="ad-slot-970x90" />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Top Sliding Ad Banner (Slides down when site opens) */}
      <SlidingAdBanners />

      {/* Top Bar with Date, Weather, Links, Socials */}
      <TopBar />

      {/* Main Brand Header with SVG Logo and Search */}
      <MainHeader />

      {/* Solid Red Navigation Bar with 9 items (Home + 7 Major Groups + More Categories) */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="main-content-layout">
        {/* Breaking News Ticker */}
        <BreakingTicker />

        {/* Dynamic Page Router */}
        {renderMainContent()}

        {/* Newsletter Subscription Ribbon */}
        <NewsletterRibbon />

        {/* Section: Public Complaint Box */}
        <ComplaintBoxSection />
      </main>

      {/* Master Footer with Founder, Office address, Terms & Socials */}
      <Footer />

      {/* Policy & Terms Modal (fallback/quick modal) */}
      <PolicyModal />

      {/* Website On-Load Dynamic Popup Modal */}
      <WebsiteLoadPopup />

      {/* Floating Bottom to Top Button */}
      <ScrollToTop />

      {/* Floating Right Side Analog Clock & Prayer/Holiday Widget */}
      <SideWatchWidget />
    </>
  );
}
