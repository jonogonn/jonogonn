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
import VideoNewsSection from './components/News/VideoNewsSection';
import CategoryGrids from './components/News/CategoryGrids';
import ArticleDetailPage from './components/News/ArticleDetailPage';
import AdSenseSlot from './components/Ads/AdSenseSlot';
import SlidingAdBanners from './components/Ads/SlidingAdBanners';
import NewsletterRibbon from './components/Newsletter/NewsletterRibbon';
import ComplaintBoxSection from './components/News/ComplaintBoxSection';
import Footer from './components/Footer/Footer';
import PolicyModal from './components/Modals/PolicyModal';
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
        title: isBn ? `${settings.siteNameBn || 'জনগণ.নিউজ'} — সত্যের সাথে, জনতার পাশে` : 'Jonogon News — With Truth, For The People',
        description: isBn
          ? 'জনগণের পক্ষে সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত ঠিকানা। দেশ-বিদেশের ব্রেকিং নিউজ, রাজনীতি, বাণিজ্য, খেলা ও বিনোদনের তাজা খবর।'
          : 'Your trusted digital source for verified, objective, and timely journalism standing for the people of Bangladesh.',
        url: window.location.origin,
        type: 'website'
      });
    }
  }, [activePage, isBn, settings]);

  // If Admin Dashboard View is toggled
  if (isAdminOpen) {
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

    // Default: Master Editorial Homepage
    return (
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

      {/* Solid Red Navigation Bar with 9 items (Home + 7 Major Groups + আরও দেখুন) */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="main-content-layout">
        {/* Breaking News Ticker */}
        <BreakingTicker />

        {/* Dynamic Page Router */}
        {renderMainContent()}

        {/* Newsletter Subscription Ribbon */}
        <NewsletterRibbon />

        {/* Section: অভিযোগ বক্স (Complaint Box Section) */}
        <ComplaintBoxSection />
      </main>

      {/* Master Footer with Founder, Office address, Terms & Socials */}
      <Footer />

      {/* Policy & Terms Modal (fallback/quick modal) */}
      <PolicyModal />

      {/* Floating Bottom to Top Button */}
      <ScrollToTop />

      {/* Floating Right Side Analog Clock & Prayer/Holiday Widget */}
      <SideWatchWidget />
    </>
  );
}
