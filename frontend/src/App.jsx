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
import { defaultHomepageSections } from './data/initialData';
import { updateSEO } from './services/seoService';

export default function App() {
  const {
    isAdminOpen,
    activePage,
    currentArticle,
    activeCategory,
    language,
    settings,
    homepageSections
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

  // If Admin Dashboard View is toggled or URL route is /admin or Supabase email confirmation callback
  const isDirectAdminUrl =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/admin' ||
      window.location.pathname === '/admin/' ||
      window.location.pathname.includes('/admin') ||
      window.location.hash === '#admin' ||
      window.location.hash.startsWith('#admin') ||
      window.location.hash.includes('type=signup') ||
      window.location.hash.includes('type=recovery') ||
      window.location.hash.includes('access_token=') ||
      window.location.search.includes('type=signup') ||
      window.location.search.includes('code='));

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

    // Dynamic Modular Editorial Homepage driven by homepageSections order
    const effectiveSections = (
      homepageSections && homepageSections.length > 0
        ? homepageSections
        : defaultHomepageSections
    ).filter((sec) => sec.isVisible !== false);

    const groupedElements = [];
    let currentSubgroupBatch = [];

    const flushSubgroupBatch = () => {
      if (currentSubgroupBatch.length > 0) {
        const ids = [...currentSubgroupBatch];
        groupedElements.push({
          type: 'subgroups',
          id: `batch-${ids[0]}`,
          render: (key) => <SubGroupSections key={key} subGroupIds={ids} />
        });
        currentSubgroupBatch = [];
      }
    };

    effectiveSections.forEach((sec) => {
      if (sec.type === 'subgroup' || sec.id.startsWith('subgroup-')) {
        currentSubgroupBatch.push(sec.id);
      } else {
        flushSubgroupBatch();
        groupedElements.push({
          type: 'main',
          id: sec.id,
          render: (key) => {
            switch (sec.id) {
              case 'heroLeadGrid':
                return <HeroLeadGrid key={key} />;
              case 'latestNewsGrid':
                return <LatestNewsGrid key={key} />;
              case 'bangladeshSection':
                return <BangladeshSection key={key} />;
              case 'remittanceFighter':
                return <RemittanceFighter key={key} />;
              case 'districtNewsSection':
                return <DistrictNewsSection key={key} />;
              case 'videoNewsSection':
                return <VideoNewsSection key={key} />;
              case 'podcastSection':
                return <PodcastSection key={key} />;
              default:
                return null;
            }
          }
        });
      }
    });
    flushSubgroupBatch();

    const adSlots = ['afterLatestBanner', 'afterVideoBanner', 'afterDistrictBanner', 'midContentBanner'];
    let adIndex = 0;

    return (
      <div className="container">
        {/* Ad Banner directly below Breaking Tickers (970 × 90) */}
        <div className="ticker-bottom-ad-wrap" style={{ marginBottom: 20 }}>
          <AdSenseSlot slotId="tickerBottomBanner" customClass="ad-slot-970x90" />
        </div>

        {groupedElements.map((item, idx) => {
          const comp = item.render(item.id);
          const showIntervalAd = idx > 0 && idx % 2 === 0 && adIndex < adSlots.length;
          const adSlotId = showIntervalAd ? adSlots[adIndex++] : null;

          return (
            <React.Fragment key={item.id}>
              {showIntervalAd && (
                <div className="section-interval-ad-wrap" style={{ margin: '22px 0' }}>
                  <AdSenseSlot slotId={adSlotId} customClass="ad-slot-970x90" />
                </div>
              )}
              {comp}
            </React.Fragment>
          );
        })}

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
