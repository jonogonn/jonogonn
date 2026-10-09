import React from 'react';
import { useNews } from '../../context/NewsContext';

export default function AdSenseSlot({ slotId = 'leadSidebarAd', customClass = 'ad-slot-300x250' }) {
  const { settings, language } = useNews();
  const isBn = language === 'bn';

  const slotConfig = settings.adSlots?.[slotId];

  // If slot is explicitly disabled
  if (slotConfig && slotConfig.enabled === false) return null;

  // 1. Custom Image Banner Mode (User uploaded image banner with target link)
  const isImageMode = slotConfig?.mode === 'image' || (!slotConfig?.code && slotConfig?.imageUrl);
  if (isImageMode && slotConfig?.imageUrl) {
    return (
      <div className={`ad-slot-container custom-image-ad-wrap ${customClass}`}>
        <span className="custom-ad-badge">{isBn ? 'বিজ্ঞাপন' : 'AD'}</span>
        <a
          href={slotConfig.targetUrl || '#'}
          target={slotConfig.targetUrl ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="custom-ad-link"
          title={slotConfig.altText || (isBn ? 'বিজ্ঞাপন' : 'Advertisement')}
        >
          <img
            src={slotConfig.imageUrl}
            alt={slotConfig.altText || 'বিজ্ঞাপন'}
            className="custom-ad-img"
            loading="lazy"
          />
        </a>
      </div>
    );
  }

  // 2. Google AdSense / HTML Script Snippet Mode
  if (slotConfig && slotConfig.code && slotConfig.code.trim().length > 0) {
    return (
      <div className={`ad-slot-container ${customClass}`}>
        <div className="ad-label">{isBn ? 'বিজ্ঞাপন' : 'Advertisement'}</div>
        <div
          dangerouslySetInnerHTML={{ __html: slotConfig.code }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        />
      </div>
    );
  }

  // 3. Fallback: Cleanly return null if no image or code is configured
  return null;
}
