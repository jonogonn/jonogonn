import React from 'react';

/**
 * Modern High-Aesthetic Shimmer Skeleton Loaders
 * Displayed seamlessly during initial load before real articles arrive.
 */

export function HeroLeadSkeleton() {
  return (
    <section className="hero-lead-grid hero-skeleton-grid" aria-busy="true" aria-label="সংবাদ লোড হচ্ছে...">
      {/* 1. Main Lead Slider Skeleton (Left/Large Column) */}
      <div className="hero-slider-container">
        <div className="skeleton-card hero-main-card" style={{ height: 440, position: 'relative' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%', borderRadius: 12 }} />
          <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, zIndex: 2 }}>
            <div className="skeleton-shimmer" style={{ width: 90, height: 22, borderRadius: 12, marginBottom: 12 }} />
            <div className="skeleton-shimmer" style={{ width: '90%', height: 28, borderRadius: 6, marginBottom: 8 }} />
            <div className="skeleton-shimmer" style={{ width: '65%', height: 24, borderRadius: 6, marginBottom: 14 }} />
            <div className="skeleton-shimmer" style={{ width: 140, height: 16, borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* 2. Sub-lead / Newly Posted News Skeleton (Middle Column) */}
      <div className="hero-middle-col">
        <div className="sub-lead-box">
          <div className="sub-lead-header" style={{ marginBottom: 12 }}>
            <div className="skeleton-shimmer" style={{ width: 130, height: 22, borderRadius: 4 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="skeleton-shimmer" style={{ width: 96, height: 72, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="skeleton-shimmer" style={{ width: 60, height: 14, borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton-shimmer" style={{ width: '100%', height: 16, borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton-shimmer" style={{ width: '70%', height: 14, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Most Read / Sidebar Skeleton (Right Column) */}
      <aside className="hero-right-col">
        <div className="skeleton-shimmer" style={{ width: '100%', height: 120, borderRadius: 8, marginBottom: 16 }} />
        <div className="most-read-box">
          <div className="most-read-header" style={{ marginBottom: 12 }}>
            <div className="skeleton-shimmer" style={{ width: 120, height: 22, borderRadius: 4 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="skeleton-shimmer" style={{ width: 60, height: 50, borderRadius: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-shimmer" style={{ width: '95%', height: 16, borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton-shimmer" style={{ width: '50%', height: 12, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

export function LatestNewsSkeleton() {
  return (
    <section className="latest-news-section" style={{ marginBottom: 28 }} aria-busy="true">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="skeleton-shimmer" style={{ width: 160, height: 24, borderRadius: 6 }} />
        <div className="skeleton-shimmer" style={{ width: 80, height: 24, borderRadius: 6 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ borderRadius: 10, padding: 10, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="skeleton-shimmer" style={{ width: '100%', height: 140, borderRadius: 8, marginBottom: 10 }} />
            <div className="skeleton-shimmer" style={{ width: 70, height: 14, borderRadius: 4, marginBottom: 8 }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: 18, borderRadius: 4, marginBottom: 6 }} />
            <div className="skeleton-shimmer" style={{ width: '60%', height: 14, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
