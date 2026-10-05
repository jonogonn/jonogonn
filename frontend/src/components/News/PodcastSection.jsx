import React, { useState, useRef } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Play,
  Mic,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Headphones,
  Landmark,
  TrendingUp,
  Cpu,
  Radio,
  Rocket,
  HeartHandshake,
  Layers
} from 'lucide-react';

const FALLBACK_POD_THUMB = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80';

// Helper to render crisp Lucide SVG Icon for each subject
export const renderSubjectIcon = (iconType, size = 14) => {
  switch (iconType) {
    case 'politics':
      return <Landmark size={size} />;
    case 'economy':
      return <TrendingUp size={size} />;
    case 'tech':
      return <Cpu size={size} />;
    case 'media':
      return <Radio size={size} />;
    case 'youth':
      return <Rocket size={size} />;
    case 'society':
      return <HeartHandshake size={size} />;
    case 'all':
    default:
      return <Headphones size={size} />;
  }
};

export default function PodcastSection() {
  const {
    language,
    podcasts,
    podcastSubjects,
    selectedPodcastSubject,
    setSelectedPodcastSubject
  } = useNews();

  const isBn = language === 'bn';
  const scrollContainerRef = useRef(null);

  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Filter podcasts based on selected subject/topic
  const filteredPodcasts = (!selectedPodcastSubject || selectedPodcastSubject === 'all')
    ? (podcasts || [])
    : (podcasts || []).filter((p) => p.subjectId === selectedPodcastSubject);

  // Helper to calculate count per subject
  const getSubjectCount = (subId) => {
    if (subId === 'all') return (podcasts || []).length;
    return (podcasts || []).filter((p) => p.subjectId === subId).length;
  };

  // Ensure the track has enough items so track length and speed match Latest News seamlessly
  let displayPodcasts = [];
  if (filteredPodcasts.length > 0) {
    if (filteredPodcasts.length < 12) {
      while (displayPodcasts.length < 12) {
        displayPodcasts = [...displayPodcasts, ...filteredPodcasts];
      }
    } else {
      displayPodcasts = [...filteredPodcasts];
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
    <section id="podcast-section" className="podcast-section" style={{ marginBottom: 32 }}>
      {/* 1. SECTION HEADER (Fully Mobile Responsive) */}
      <div className="section-header podcast-section-header">
        <div className="podcast-header-left">
          <div className="podcast-title-group">
            <span className="podcast-live-indicator"></span>
            <Mic size={18} color="var(--primary-red)" className="podcast-header-mic-icon" />
            <h2 className="podcast-main-title">
              {isBn ? 'আমাদের পডকাস্ট' : 'Our Podcast'}
            </h2>
          </div>
          <span className="podcast-total-badge">
            {isBn ? `${(podcasts || []).length}টি পর্ব` : `${(podcasts || []).length} Episodes`}
          </span>
        </div>

        <div className="podcast-header-right">
          {/* Scroll Arrows */}
          <div className="section-scroll-arrows podcast-nav-arrows">
            <button
              className="section-arrow-btn"
              onClick={() => handleManualScroll('left')}
              aria-label="Scroll left"
              title={isBn ? 'বামে স্ক্রোল করুন' : 'Scroll Left'}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              className="section-arrow-btn"
              onClick={() => handleManualScroll('right')}
              aria-label="Scroll right"
              title={isBn ? 'ডানে স্ক্রোল করুন' : 'Scroll Right'}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* YouTube Channel Button */}
          <a
            href="https://www.youtube.com/@jonogon.newstv"
            target="_blank"
            rel="noopener noreferrer"
            className="podcast-yt-btn"
            title={isBn ? 'আমাদের অফিশিয়াল ইউটিউব চ্যানেল দেখুন' : 'Visit Official YouTube Channel'}
          >
            <span>{isBn ? 'ইউটিউব' : 'YouTube'}</span>
            <span className="podcast-yt-extra-word">{isBn ? ' চ্যানেল' : ' Channel'}</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* 2. UNIQUE & MODERN SUBJECT FILTER TAB BAR (Sleek Segmented Tabs with SVG Icons) */}
      <div className="podcast-subjects-container">
        <div className="podcast-subjects-scroll-track">
          {podcastSubjects.map((sub) => {
            const count = getSubjectCount(sub.id);
            const isActive = (selectedPodcastSubject || 'all') === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                className={`podcast-subject-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedPodcastSubject(sub.id)}
                title={isBn ? `${sub.nameBn} বিষয়ের পডকাস্ট দেখুন` : `View ${sub.nameEn} podcasts`}
              >
                <span className="podcast-pill-icon-circle">
                  {renderSubjectIcon(sub.iconType, 14)}
                </span>
                <span className="podcast-pill-name">{isBn ? sub.nameBn : sub.nameEn}</span>
                <span className="podcast-pill-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. NO PODCASTS EMPTY STATE */}
      {filteredPodcasts.length === 0 ? (
        <div className="podcast-empty-state">
          <Headphones size={36} color="var(--primary-red)" style={{ opacity: 0.6, marginBottom: 8 }} />
          <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginBottom: 4 }}>
            {isBn ? 'এই বিষয়ের কোনো পডকাস্ট পাওয়া যায়নি' : 'No podcasts found for this subject'}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            {isBn ? 'খুব শীঘ্রই এই ক্যাটাগরিতে নতুন পর্ব যুক্ত হবে।' : 'New episodes will be published soon.'}
          </p>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => setSelectedPodcastSubject('all')}
            style={{ fontSize: '0.85rem', padding: '6px 16px' }}
          >
            {isBn ? 'সকল পডকাস্ট পর্ব দেখুন' : 'View All Episodes'}
          </button>
        </div>
      ) : (
        /* 4. CONTINUOUS HORIZONTAL TICKER CAROUSEL */
        <div
          className="horizontal-scroll-container podcast-scroll-container"
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

                  {/* Subject Tag on Thumbnail with SVG Icon */}
                  {pod.subjectBn && (
                    <span className="podcast-subject-badge">
                      <span className="pod-badge-icon">
                        {renderSubjectIcon(pod.subjectId, 11)}
                      </span>
                      <span>{isBn ? pod.subjectBn : (pod.subjectEn || pod.subjectBn)}</span>
                    </span>
                  )}

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

                  {/* Subject Tag on Thumbnail with SVG Icon */}
                  {pod.subjectBn && (
                    <span className="podcast-subject-badge">
                      <span className="pod-badge-icon">
                        {renderSubjectIcon(pod.subjectId, 11)}
                      </span>
                      <span>{isBn ? pod.subjectBn : (pod.subjectEn || pod.subjectBn)}</span>
                    </span>
                  )}

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
      )}

      {/* 5. VIDEO PLAYER MODAL */}
      {activeVideoModal && (
        <div className="modal-backdrop" onClick={() => setActiveVideoModal(null)}>
          <div
            className="podcast-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="podcast-modal-header">
              <div>
                {activeVideoModal.subjectBn && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--primary-red)',
                      backgroundColor: 'rgba(230, 0, 18, 0.08)',
                      padding: '2px 8px',
                      borderRadius: 3,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 4
                    }}
                  >
                    {renderSubjectIcon(activeVideoModal.subjectId, 12)}
                    <span>{isBn ? activeVideoModal.subjectBn : activeVideoModal.subjectEn}</span>
                  </span>
                )}
                <h3 className="podcast-modal-title">
                  {isBn ? activeVideoModal.titleBn : activeVideoModal.titleEn}
                </h3>
              </div>
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
