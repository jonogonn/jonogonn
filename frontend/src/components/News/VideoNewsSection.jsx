import React, { useState, useEffect, useRef } from 'react';
import { useNews } from '../../context/NewsContext';
import { Play, Volume2, VolumeX, Clock, ArrowRight } from 'lucide-react';

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';

export default function VideoNewsSection() {
  const { language, articles, openArticle, setActiveCategory, homepageSections } = useNews();
  const isBn = language === 'bn';

  // Section visibility check from homepageSections
  const secConfig = (homepageSections || []).find((s) => s.id === 'videoNewsSection');
  if (secConfig && secConfig.isVisible === false) return null;

  // Video Articles Pool
  const videoArticles = articles.filter((a) => a.isVideo);
  const videoList = videoArticles.length > 0 ? videoArticles : [
    {
      id: 'video-main',
      titleBn: 'পদ্মা সেতুতে নতুন রেললাইন: যা জানালেন কর্তৃপক্ষ',
      titleEn: 'New rail link on Padma Bridge: Key official insights',
      imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80',
      dateBn: '২৮ সেপ্টেম্বর ২০২৪, ১০:০৫',
      dateEn: '28 Sep 2026',
      videoDuration: '০:৩২'
    },
    {
      id: 'video-sub-1',
      titleBn: 'চাকরির বৃত্তি পরীক্ষার প্রস্তুতির প্রতিবেদন',
      titleEn: 'Special report on competitive scholarship exam strategies',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
      videoDuration: '২:২৩'
    },
    {
      id: 'video-sub-2',
      titleBn: 'বাজারে নিত্যপণ্যের দাম নিয়ে বিশেষ প্রতিবেদন',
      titleEn: 'In-depth market overview on essential consumer pricing',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
      videoDuration: '১:৪৫'
    },
    {
      id: 'video-sub-3',
      titleBn: 'দক্ষিণাঞ্চলে বন্যা পরিস্থিতি ও ত্রাণ বিতরণ',
      titleEn: 'Southern flood conditions and emergency relief logistics',
      imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&q=80',
      videoDuration: '৩:৪৫'
    }
  ];

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

  const currentVideo = videoList[activeVideoIdx] || videoList[0];

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
          onClick={() => openArticle(currentVideo)}
        >
          <div className="video-player-screen">
            <img
              key={currentVideo.id}
              src={currentVideo.imageUrl || FALLBACK_NEWS_IMG}
              alt={isBn ? currentVideo.titleBn : currentVideo.titleEn}
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
              ⏱ {currentVideo.videoDuration || '০:৩২'}
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
              {isBn ? currentVideo.titleBn : currentVideo.titleEn}
            </h3>
            <div className="video-player-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} color="var(--primary-red)" />
                {isBn ? currentVideo.dateBn : currentVideo.dateEn}
              </span>
            </div>
          </div>
        </div>

        {/* Video Playlist */}
        <div className="video-playlist-wrap" ref={playlistContainerRef}>
          <div className="video-playlist-scrollable">
            {videoList.map((vItem, idx) => {
              const isActive = idx === activeVideoIdx;
              return (
                <div
                  key={`vlist-${vItem.id || idx}`}
                  className={`video-playlist-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveVideoIdx(idx);
                    setVideoProgress(0);
                  }}
                  title={isBn ? vItem.titleBn : vItem.titleEn}
                >
                  <div className="video-playlist-thumb">
                    <img
                      src={vItem.imageUrl || FALLBACK_NEWS_IMG}
                      alt={isBn ? vItem.titleBn : vItem.titleEn}
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
                      {isBn ? vItem.titleBn : vItem.titleEn}
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
    </section>
  );
}
