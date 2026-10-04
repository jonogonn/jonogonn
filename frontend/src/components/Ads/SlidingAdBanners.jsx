import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { X, ExternalLink, Sparkles, Megaphone } from 'lucide-react';

export default function SlidingAdBanners() {
  const { language, settings, navigateTo } = useNews();
  const [topBannerOpen, setTopBannerOpen] = useState(false);
  const [bottomBannerOpen, setBottomBannerOpen] = useState(false);

  const isBn = language === 'bn';

  useEffect(() => {
    // Smooth trigger slide animations on page open after 600ms
    const topTimer = setTimeout(() => {
      setTopBannerOpen(true);
    }, 400);

    const bottomTimer = setTimeout(() => {
      setBottomBannerOpen(true);
    }, 900);

    return () => {
      clearTimeout(topTimer);
      clearTimeout(bottomTimer);
    };
  }, []);

  return (
    <>
      {/* 1. TOP SLIDING AD BANNER (Slides down from top on site open) */}
      {topBannerOpen && (
        <aside
          className="sliding-top-ad-banner"
          aria-label={isBn ? 'বিজ্ঞাপন' : 'Advertisement'}
        >
          <div className="container sliding-ad-inner">
            <div className="sliding-ad-label">
              <Megaphone size={13} />
              <span>{isBn ? 'বিজ্ঞাপন' : 'ADVERTISEMENT'}</span>
            </div>

            {/* Top Ad Creative / AdSense Slot */}
            <div className="sliding-ad-content-box">
              <a
                href="https://www.brandbybiplob.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="sliding-ad-creative-link"
                title={isBn ? 'ব্র্যান্ড বাই বিপ্লব — ডিজিটাল ক্রিয়েটিভ এজেন্সি' : 'Brand By Biplob Digital Agency'}
              >
                <div className="sliding-ad-pill-badge">
                  <Sparkles size={12} />
                  <span>{isBn ? 'বিশেষ ছাড়' : 'Exclusive'}</span>
                </div>
                <div className="sliding-ad-headline">
                  <strong>{isBn ? 'Brand By Biplob' : 'Brand By Biplob Agency'}</strong> —{' '}
                  <span>
                    {isBn
                      ? 'ডিজিটাল ব্র্যান্ডিং, ওয়েব ডেভেলপমেন্ট ও সোশ্যাল মিডিয়া ক্যাম্পেইন সলিউশন'
                      : 'Digital Branding, Web Development & High-Impact Marketing Campaigns'}
                  </span>
                </div>
                <div className="sliding-ad-cta-btn">
                  <span>{isBn ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                  <ExternalLink size={12} />
                </div>
              </a>
            </div>

            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setTopBannerOpen(false)}
              className="sliding-ad-close-btn"
              title={isBn ? 'বিজ্ঞাপন বন্ধ করুন' : 'Close Ad'}
              aria-label="Close top banner ad"
            >
              <X size={15} />
            </button>
          </div>
        </aside>
      )}

      {/* 2. BOTTOM SLIDING STICKY AD BANNER (Slides up from bottom on site open) */}
      {bottomBannerOpen && (
        <aside
          className="sliding-bottom-ad-banner"
          aria-label={isBn ? 'স্পন্সরড বিজ্ঞাপন' : 'Sponsored Advertisement'}
        >
          <div className="sliding-bottom-ad-inner">
            <div className="sliding-bottom-header">
              <span className="sliding-ad-label-sm">{isBn ? 'স্পন্সরড বিজ্ঞাপন' : 'SPONSORED'}</span>
              <button
                type="button"
                onClick={() => setBottomBannerOpen(false)}
                className="sliding-bottom-close-btn"
                title={isBn ? 'বিজ্ঞাপন বন্ধ করুন' : 'Close Ad'}
                aria-label="Close bottom ad"
              >
                <X size={14} />
              </button>
            </div>

            <div className="sliding-bottom-body">
              <a
                href="https://www.brandbybiplob.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="sliding-bottom-creative"
              >
                <div className="sliding-bottom-brand-logo">
                  <span>BB</span>
                </div>
                <div className="sliding-bottom-text">
                  <h5>{isBn ? 'আপনার ব্যবসার পূর্ণাঙ্গ ডিজিটাল ব্র্যান্ডিং ও প্রমোশন' : 'Grow Your Business With Modern Digital Branding'}</h5>
                  <p>{isBn ? 'লোগো, ওয়েবসাইট, গুগল মার্চেন্ট ও সোশ্যাল মিডিয়া বিজ্ঞাপন' : 'Logo, Websites, GA4 Analytics & PPC Media Solutions'}</p>
                </div>
                <div className="sliding-bottom-cta">
                  <span>{isBn ? 'যোগাযোগ করুন' : 'Contact Now'}</span>
                  <ExternalLink size={12} />
                </div>
              </a>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
