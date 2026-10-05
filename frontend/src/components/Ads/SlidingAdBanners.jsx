import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { X, Megaphone, PhoneCall, ExternalLink, RefreshCw, Volume2 } from 'lucide-react';

export default function SlidingAdBanners() {
  const { language, settings, navigateTo } = useNews();
  const isBn = language === 'bn';

  // State for top and bottom banner visibility
  const [showTopAd, setShowTopAd] = useState(true);
  const [showBottomAd, setShowBottomAd] = useState(true);
  
  // 3D Flip state for 970x90 bottom banner
  const [flipped3D, setFlipped3D] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Auto 3D flip every 4.5 seconds unless user hovers
  useEffect(() => {
    if (!showBottomAd || isPaused) return;

    const interval = setInterval(() => {
      setFlipped3D((prev) => !prev);
    }, 4500);

    return () => clearInterval(interval);
  }, [showBottomAd, isPaused]);

  return (
    <>
      {/* =========================================================
          1. TOP SLIDING BANNER (Slides down when site opens)
         ========================================================= */}
      {showTopAd && (
        <aside className="sliding-top-ad-banner" aria-label="Top Announcement & Ad Banner">
          <div className="container sliding-ad-inner">
            <div className="sliding-ad-badge">
              <Megaphone size={14} className="sliding-ad-icon" />
              <span>{isBn ? 'বিজ্ঞাপন ও স্পন্সর' : 'Sponsored Banner'}</span>
            </div>

            <div className="sliding-ad-content-text">
              <span className="sliding-ad-highlight">
                {isBn ? '📢 দেশব্যাপী ডিজিটাল প্রচারণা:' : '📢 Nationwide Digital Promotion:'}
              </span>
              <span className="sliding-ad-message">
                {isBn
                  ? ' জনগণ.নিউজ-এ আপনার ব্র্যান্ড ও পণ্যের বিজ্ঞাপন দিতে আজই বুকিং করুন'
                  : ' Book your brand & business advertisements on Jonogon News today'}
              </span>
              <a href="tel:01936618534" className="sliding-ad-phone-pill">
                <PhoneCall size={12} />
                <span>০১৯৩৬-৬১৮৫৩৪</span>
              </a>
            </div>

            <div className="sliding-ad-actions">
              <button
                type="button"
                onClick={() => navigateTo('advertisement')}
                className="sliding-ad-cta-btn"
                title={isBn ? 'বিজ্ঞাপন রেট ও বিস্তারিত' : 'Ad Rates & Details'}
              >
                <span>{isBn ? 'বিজ্ঞাপন রেট' : 'Ad Rates'}</span>
                <ExternalLink size={12} />
              </button>

              <button
                type="button"
                onClick={() => setShowTopAd(false)}
                className="sliding-ad-close-btn"
                title={isBn ? 'ব্যানার বন্ধ করুন' : 'Close Banner'}
                aria-label="Close Top Ad"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* =========================================================
          2. BOTTOM SLIDING BANNER (3D Animated 970 × 90 Ad)
         ========================================================= */}
      {showBottomAd && (
        <aside
          className="sliding-bottom-ad-banner"
          aria-label="Bottom 3D Animated Advertisement Banner (970x90)"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="sliding-bottom-container">
            {/* Top Micro-Bar with Sponsor Label & Controls */}
            <div className="sliding-bottom-microbar">

              <div className="microbar-right">

                <button
                  type="button"
                  onClick={() => setShowBottomAd(false)}
                  className="sliding-bottom-close-btn"
                  title={isBn ? 'বিজ্ঞাপন বন্ধ করুন' : 'Dismiss Ad'}
                  aria-label="Close Bottom 3D Ad Banner"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* 3D Perspective Card Container (970 x 90) */}
            <div className="ad-3d-perspective-stage">
              <div className={`ad-3d-card-flipper ${flipped3D ? 'is-flipped' : ''}`}>
                
                {/* -------------------------------------------------------------
                    3D FACE 1 (Front Side - Jonogon News Nationwide Promotion)
                   ------------------------------------------------------------- */}
                <div className="ad-3d-face ad-3d-face-front" onClick={() => navigateTo('advertisement')}>
                  <div className="ad-970-graphic-face ad-graphic-red">
                    {/* Visual Decor Elements */}
                    <div className="ad-graphic-accent-ribbon">
                      <span>SPECIAL OFFER</span>
                    </div>

                    <div className="ad-graphic-brand-col">
                      <div className="ad-brand-logo-badge">
                        <span className="ad-brand-logo-text">জনগণ.নিউজ</span>
                      </div>
                      <span className="ad-brand-tagline">DIGITAL MEDIA NETWORK</span>
                    </div>

                    <div className="ad-graphic-main-col">
                      <h4 className="ad-graphic-title">
                        {isBn
                          ? 'দেশব্যাপী লক্ষাধিক পাঠকের কাছে আপনার ব্র্যান্ডের সর্বোচ্চ প্রচার!'
                          : 'Promote Your Brand Across Millions of Dedicated Digital Readers!'}
                      </h4>
                      <p className="ad-graphic-desc">
                        {isBn
                          ? 'ব্যানার বিজ্ঞাপন • স্পন্সরড প্রতিবেদন • ভিডিও কমার্শিয়াল • সোশ্যাল মিডিয়া ক্যাম্পেইন'
                          : 'Banner Ads • Sponsored Articles • Video Commercials • Social Media Reach'}
                      </p>
                    </div>

                    <div className="ad-graphic-cta-col">
                      <div className="ad-contact-box">
                        <span className="ad-phone-label">{isBn ? 'হটলাইন' : 'Hotline'}</span>
                        <span className="ad-phone-number">01936-618534</span>
                      </div>
                      <div className="ad-live-btn">
                        <span>{isBn ? 'বিজ্ঞাপন দিন' : 'Book Ad'}</span>
                        <ExternalLink size={13} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    3D FACE 2 (Back Side - Brand By Biplob Premium Architecture)
                   ------------------------------------------------------------- */}
                <div
                  className="ad-3d-face ad-3d-face-back"
                  onClick={() => window.open('https://www.brandbybiplob.com/', '_blank', 'noopener,noreferrer')}
                >
                  <div className="ad-970-graphic-face ad-graphic-dark-gold">
                    <div className="ad-graphic-accent-ribbon gold-ribbon">
                      <span>VERIFIED PARTNER</span>
                    </div>

                    <div className="ad-graphic-brand-col">
                      <div className="ad-brand-logo-badge gold-badge">
                        <span className="ad-brand-logo-text">BRAND BY BIPLOB</span>
                      </div>
                      <span className="ad-brand-tagline">ARCHITECTURAL DESIGN & IT</span>
                    </div>

                    <div className="ad-graphic-main-col">
                      <h4 className="ad-graphic-title gold-text">
                        {isBn
                          ? 'আধুনিক ব্র্যান্ড আর্কিটেকচার, ওয়েব সলিউশন ও প্রিমিয়াম গ্রাফিক ডিজাইন'
                          : 'Modern Brand Architecture, Web Solutions & Premium Creative Graphics'}
                      </h4>
                      <p className="ad-graphic-desc">
                        {isBn
                          ? 'মোঃ বিপ্লব হোসেন — ক্রিয়েটিভ ডিরেক্টর | ফুল-স্ট্যাক ডিজিটাল সিস্টেম ডেভেলপমেন্ট'
                          : 'Md. Biplob Hossain — Creative Director | Full-Stack Digital Systems'}
                      </p>
                    </div>

                    <div className="ad-graphic-cta-col">
                      <div className="ad-contact-box gold-border">
                        <span className="ad-phone-label">{isBn ? 'অফিসিয়াল ওয়েবসাইট' : 'Official Portal'}</span>
                        <span className="ad-phone-number">brandbybiplob.com</span>
                      </div>
                      <div className="ad-live-btn gold-btn">
                        <span>{isBn ? 'ভিজিট করুন' : 'Explore'}</span>
                        <ExternalLink size={13} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
