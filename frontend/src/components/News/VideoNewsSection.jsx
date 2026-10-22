import React, { useState, useEffect, useRef } from 'react';
import { useNews } from '../../context/NewsContext';
import { Play, Volume2, VolumeX, Clock, ArrowRight, X } from 'lucide-react';

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';

export default function VideoNewsSection() {
  const { language, articles, openArticle, setActiveCategory, homepageSections, videoNews } = useNews();
  const isBn = language === 'bn';

  const fallbackVideos = [
    {
      id: 'video-main',
      titleBn: 'পদ্মা সেতুতে নতুন রেললাইন: যা জানালেন কর্তৃপক্ষ',
      titleEn: 'New rail link on Padma Bridge: Key official insights',
      imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:০৫',
      dateEn: '28 Sep 2026',
      videoDuration: '০:৩২'
    },
    {
      id: 'video-sub-1',
      titleBn: 'চাকরির বৃত্তি পরীক্ষার প্রস্তুতির প্রতিবেদন',
      titleEn: 'Special report on competitive scholarship exam strategies',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
      videoDuration: '২:২৩'
    },
    {
      id: 'video-sub-2',
      titleBn: 'বাজারে নিত্যপণ্যের দাম নিয়ে বিশেষ প্রতিবেদন',
      titleEn: 'In-depth market overview on essential consumer pricing',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
      videoDuration: '১:৪৫'
    },
    {
      id: 'video-sub-3',
      titleBn: 'দক্ষিণাঞ্চলে বন্যা পরিস্থিতি ও ত্রাণ বিতরণ',
      titleEn: 'Southern flood conditions and emergency relief logistics',
      imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      videoDuration: '৩:৪৫'
    }
  ];

  // Video Articles Pool (strictly published/approved articles marked as isVideo)
  const publishedArticles = (articles || []).filter((a) => a && (a.status === 'approved' || a.status === 'published' || !a.status) && a.isVideo);
  const activeVideoNews = (Array.isArray(videoNews) ? videoNews : []).filter(Boolean);

  // Combine custom video news first, then published articles with isVideo: true
  const combinedList = [...activeVideoNews, ...publishedArticles].filter(Boolean);
  const videoList = combinedList.length > 0 ? combinedList : fallbackVideos;

  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const playlistContainerRef = useRef(null);

  // 10-Second Timer Loop for Video Autoplay & Next Player Switch
  useEffect(() => {
    if (isVideoPaused || videoList.length <= 1) return;

    setVideoProgress(0);
    const stepTime = 100; // ms
    const totalTime = 10000; // 10 seconds

    const progressInterval = setInterval(() => {
      setVideoProgress((prev) => {
        const next = prev + (stepTime / totalTime) * 100;
        return next >= 100 ? 100 : next;
      });
    }, stepTime);

    const switchTimer = setInterval(() => {
      setActiveVideoIdx((prev) => (prev + 1) % videoList.length);
      setVideoProgress(0);
    }, totalTime);

    return () => {
      clearInterval(progressInterval);
      clearInterval(switchTimer);
    };
  }, [activeVideoIdx, isVideoPaused, videoList.length]);

  // Auto-scroll the playlist internally without scrolling page
  useEffect(() => {
    if (playlistContainerRef.current) {
      const activeEl = playlistContainerRef.current.querySelector('.video-playlist-item.active');
      if (activeEl) {
        const container = playlistContainerRef.current;
        const topOffset = activeEl.offsetTop - container.offsetTop;
        container.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
      }
    }
  }, [activeVideoIdx]);

  // Section visibility check from homepageSections
  const secConfig = (homepageSections || []).find((s) => s.id === 'videoNewsSection');
  if (secConfig && secConfig.isVisible === false) return null;

  const safeIdx = (activeVideoIdx >= 0 && activeVideoIdx < videoList.length) ? activeVideoIdx : 0;
  const currentVideo = videoList[safeIdx] || fallbackVideos[0];

  const getEmbedUrl = (item) => {
    if (!item) return '';
    let ytId = item.youtubeId || item.youtube_id;
    if (!ytId) {
      const url = item.youtubeUrl || item.youtube_url || item.videoUrl || item.video_url;
      if (url) {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (match) ytId = match[1];
      }
    }
    return ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0` : '';
  };

  const handlePlayVideo = (vid) => {
    if (!vid) return;
    const embed = getEmbedUrl(vid);
    if (embed) {
      setActiveVideoModal(vid);
    } else if (vid.content || vid.contentBn || vid.slug) {
      openArticle(vid);
    } else if (vid.videoUrl || vid.youtubeUrl) {
      window.open(vid.videoUrl || vid.youtubeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="video-news-section" style={{ marginBottom: 32 }}>
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Play size={18} color="var(--primary-red)" />
          <span>{isBn ? 'ভিডিও সংবাদ' : 'Video News'}</span>
        </h2>
        <button
          onClick={() => setActiveCategory('video')}
          className="section-link"
        >
          <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="video-section-layout">
        {/* Main Big Video Player */}
        <div
          className="video-main-player-card"
          onMouseEnter={() => setIsVideoPaused(true)}
          onMouseLeave={() => setIsVideoPaused(false)}
          onClick={() => handlePlayVideo(currentVideo)}
          style={{ cursor: 'pointer' }}
        >
          <div className="video-player-screen">
            <img
              key={currentVideo?.id || 'video-lead'}
              src={currentVideo?.imageUrl || FALLBACK_NEWS_IMG}
              alt={isBn ? (currentVideo?.titleBn || currentVideo?.title || '') : (currentVideo?.titleEn || currentVideo?.titleBn || '')}
              className="video-screen-img hero-unique-slide-anim"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_NEWS_IMG;
              }}
            />
            <div className="video-screen-scrim" />

            {/* Center Play Button */}
            <div className="video-play-center-btn">
              <Play size={26} fill="currentColor" />
            </div>

            {/* Top Right Sound Control */}
            <div className="video-player-top-controls" style={{ justifyContent: 'flex-end' }}>
              <button
                className="video-ctrl-icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                title={isMuted ? (isBn ? 'সাউন্ড আনমিউট করুন' : 'Unmute') : (isBn ? 'মিউট করুন' : 'Mute')}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>

            {/* Duration Tag */}
            <span className="video-duration-tag">
              ⏱ {currentVideo?.videoDuration || '০:৩২'}
            </span>

            {/* 10-Second Progress Line */}
            <div className="video-10s-progress-track">
              <div
                className="video-10s-progress-bar"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          </div>

          <div className="video-player-info">
            <h3 className="video-player-title">
              {isBn ? (currentVideo?.titleBn || currentVideo?.title || '') : (currentVideo?.titleEn || currentVideo?.titleBn || '')}
            </h3>
            <div className="video-player-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} color="var(--primary-red)" />
                {isBn ? (currentVideo?.dateBn || '') : (currentVideo?.dateEn || currentVideo?.dateBn || '')}
              </span>
            </div>
          </div>
        </div>

        {/* Video Playlist */}
        <div className="video-playlist-wrap" ref={playlistContainerRef}>
          <div className="video-playlist-scrollable">
            {videoList.map((vItem, idx) => {
              if (!vItem) return null;
              const isActive = idx === safeIdx;
              const vTitle = isBn ? (vItem.titleBn || vItem.title || '') : (vItem.titleEn || vItem.titleBn || '');
              return (
                <div
                  key={`vlist-${vItem.id || idx}`}
                  className={`video-playlist-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveVideoIdx(idx);
                    setVideoProgress(0);
                  }}
                  title={vTitle}
                >
                  <div className="video-playlist-thumb">
                    <img
                      src={vItem.imageUrl || FALLBACK_NEWS_IMG}
                      alt={vTitle}
                      className="playlist-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_NEWS_IMG;
                      }}
                    />
                    <div className="playlist-play-icon">
                      <Play size={10} fill="currentColor" />
                    </div>
                  </div>

                  <div className="video-playlist-content">
                    <h4 className="video-playlist-title">
                      {vTitle}
                    </h4>
                    <div className="video-playlist-footer">
                      <span className="playlist-duration">⏱ {vItem.videoDuration || '০:৩২'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setActiveVideoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 860,
              backgroundColor: '#0F172A',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0,0,0,0.4)'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FFF', fontWeight: 800 }}>
                {isBn ? (activeVideoModal?.titleBn || activeVideoModal?.title || '') : (activeVideoModal?.titleEn || activeVideoModal?.titleBn || '')}
              </h3>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={getEmbedUrl(activeVideoModal)}
                title={isBn ? (activeVideoModal?.titleBn || '') : (activeVideoModal?.titleEn || '')}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
