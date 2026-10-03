import React, { useState, useRef } from 'react';
import { useNews } from '../../context/NewsContext';
import { Play, Mic, Clock, User, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';

const FALLBACK_POD_THUMB = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80';

export default function PodcastSection() {
  const { language, podcasts } = useNews();
  const isBn = language === 'bn';
  const scrollContainerRef = useRef(null);

  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Ensure the track has enough items (at least 12 per half) so track length and speed match Latest News
  const baseList = podcasts && podcasts.length > 0 ? podcasts : [];
  let displayPodcasts = [];
  if (baseList.length > 0) {
    while (displayPodcasts.length < 12) {
      displayPodcasts = [...displayPodcasts, ...baseList];
    }
  }

  const handleManualScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Helper to extract clean YouTube Embed URL
  const getEmbedUrl = (pod) => {
    if (!pod) return '';
    if (pod.youtubeId) {
      return `https://www.youtube.com/embed/${pod.youtubeId}?autoplay=1&rel=0`;
    }
    if (pod.youtubeUrl) {
      const match = pod.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      const id = match ? match[1] : 'dQw4w9WgXcQ';
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    return `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0`;
  };

  return (
    <section className="podcast-section" style={{ marginBottom: 32 }}>
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mic size={20} color="var(--primary-red)" />
          <span>{isBn ? 'আমাদের পডকাস্ট' : 'Our Podcast'}</span>
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Manual Scroll Arrows */}
          <div className="section-scroll-arrows">
            <button
              className="section-arrow-btn"
              onClick={() => handleManualScroll('left')}
              aria-label="Scroll left"
              title={isBn ? 'বামে স্ক্রোল করুন' : 'Scroll Left'}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="section-arrow-btn"
              onClick={() => handleManualScroll('right')}
              aria-label="Scroll right"
              title={isBn ? 'ডানে স্ক্রোল করুন' : 'Scroll Right'}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <a
            href="https://www.youtube.com/@jonogon.newstv"
            target="_blank"
            rel="noopener noreferrer"
            className="section-link"
          >
            <span>{isBn ? 'ইউটিউব চ্যানেল' : 'YouTube Channel'}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Continuous Right-to-Left Scrolling Track for Podcast Cards */}
      <div
        className="horizontal-scroll-container"
        ref={scrollContainerRef}
        title={isBn ? 'পডকাস্ট দেখতে ক্লিক করুন' : 'Click to watch podcast'}
      >
        <div className="horizontal-scroll-track scroll-right-to-left">
          {/* First Set */}
          {displayPodcasts.map((pod, idx) => (
            <div
              key={`pod1-${pod.id}-${idx}`}
              className="podcast-card-item"
              onClick={() => setActiveVideoModal(pod)}
            >
              <div className="podcast-thumb-wrap">
                <img
                  src={pod.thumbnail || FALLBACK_POD_THUMB}
                  alt={isBn ? pod.titleBn : pod.titleEn}
                  className="podcast-thumb-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_POD_THUMB;
                  }}
                />
                <div className="podcast-play-overlay">
                  <div className="podcast-play-btn">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
                <span className="podcast-duration-badge">
                  <Clock size={11} style={{ marginRight: 3 }} />
                  {pod.duration || '২০:০০'}
                </span>
              </div>

              <div className="podcast-body">
                <div className="podcast-host-tag">
                  <User size={12} style={{ marginRight: 4 }} />
                  <span>{isBn ? pod.hostBn || 'জনগণ পডকাস্ট' : pod.hostEn || 'Jonogon Podcast'}</span>
                </div>
                <h3 className="podcast-title">
                  {isBn ? pod.titleBn : pod.titleEn}
                </h3>
                {pod.guestBn && (
                  <p className="podcast-guest">
                    {isBn ? `অতিথি: ${pod.guestBn}` : `Guest: ${pod.guestEn}`}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Duplicate Set for Seamless Infinite Loop */}
          {displayPodcasts.map((pod, idx) => (
            <div
              key={`pod2-${pod.id}-${idx}`}
              className="podcast-card-item"
              onClick={() => setActiveVideoModal(pod)}
            >
              <div className="podcast-thumb-wrap">
                <img
                  src={pod.thumbnail || FALLBACK_POD_THUMB}
                  alt={isBn ? pod.titleBn : pod.titleEn}
                  className="podcast-thumb-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_POD_THUMB;
                  }}
                />
                <div className="podcast-play-overlay">
                  <div className="podcast-play-btn">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
                <span className="podcast-duration-badge">
                  <Clock size={11} style={{ marginRight: 3 }} />
                  {pod.duration || '২০:০০'}
                </span>
              </div>

              <div className="podcast-body">
                <div className="podcast-host-tag">
                  <User size={12} style={{ marginRight: 4 }} />
                  <span>{isBn ? pod.hostBn || 'জনগণ পডকাস্ট' : pod.hostEn || 'Jonogon Podcast'}</span>
                </div>
                <h3 className="podcast-title">
                  {isBn ? pod.titleBn : pod.titleEn}
                </h3>
                {pod.guestBn && (
                  <p className="podcast-guest">
                    {isBn ? `অতিথি: ${pod.guestBn}` : `Guest: ${pod.guestEn}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      {activeVideoModal && (
        <div className="modal-backdrop" onClick={() => setActiveVideoModal(null)}>
          <div
            className="podcast-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="podcast-modal-header">
              <h3 className="podcast-modal-title">
                {isBn ? activeVideoModal.titleBn : activeVideoModal.titleEn}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setActiveVideoModal(null)}
                aria-label="Close video player"
              >
                <X size={20} />
              </button>
            </div>

            <div className="podcast-iframe-wrap">
              <iframe
                src={getEmbedUrl(activeVideoModal)}
                title={isBn ? activeVideoModal.titleBn : activeVideoModal.titleEn}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="podcast-iframe"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
