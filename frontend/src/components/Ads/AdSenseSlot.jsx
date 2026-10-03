import React from 'react';
import { useNews } from '../../context/NewsContext';

export default function AdSenseSlot({ slotId = 'leadSidebarAd', customClass = 'ad-slot-300x250' }) {
  const { settings } = useNews();

  if (!settings.adSenseEnabled) return null;

  const slotConfig = settings.adSlots?.[slotId];
  if (slotConfig && !slotConfig.enabled) return null;

  // If custom AdSense code or HTML snippet is provided
  if (slotConfig && slotConfig.code && slotConfig.code.trim().length > 0) {
    return (
      <div className={`ad-slot-container ${customClass}`}>
        <div className="ad-label">Advertisement</div>
        <div
          dangerouslySetInnerHTML={{ __html: slotConfig.code }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        />
      </div>
    );
  }

  // Fallback Reference Ad Box (Matching UI Image)
  return (
    <div className={`ad-slot-container ${customClass}`}>
      <div className="ad-label">Advertisement</div>
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-subheadline)', fontSize: '0.92rem', fontWeight: 600 }}>
        Google AdSense
      </div>
      <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: 4 }}>
        {slotConfig?.fallbackText || 'Ad Slot'}
      </div>
    </div>
  );
}
