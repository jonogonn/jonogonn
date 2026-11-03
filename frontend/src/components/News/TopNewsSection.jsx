import React, { useState, useRef, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Flame,
  Play,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  X,
  Volume2,
  VolumeX,
  ArrowRight
} from 'lucide-react';
import { formatViewsBn } from '../../utils/viewHelper';

const FALLBACK_PORTRAIT_IMG = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&h=1000&fit=crop&q=80';

export default function TopNewsSection() {
  const { language, topNews } = useNews();
  const isBn = language === 'bn';

  const list = Array.isArray(topNews) && topNews.length > 0 ? topNews : [];
  const sortedList = [...list].sort((a, b) => (a.orderIndex || a.rank || 0) - (b.orderIndex || b.rank || 0));

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Active Shorts Modal State
  const [activeShortIdx, setActiveShortIdx] = useState(null);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [sortedList.length]);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScroll, 350);
  };

  // Keyboard navigation for Shorts Modal
  useEffect(() => {
    if (activeShortIdx === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveShortIdx(null);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveShortIdx((prev) => (prev + 1 < sortedList.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveShortIdx((prev) => (prev - 1 >= 0 ? prev - 1 : sortedList.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeShortIdx, sortedList.length]);

  if (sortedList.length === 0) {
    return null;
  }

  const activeItem = activeShortIdx !== null ? sortedList[activeShortIdx] : null;

  return (
    <section className="top-news-section" style={{ margin: '36px 0 32px 0' }}>
      {/* Section Header */}
      <div className="top-news-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(230,0,18,0.25)',
              flexShrink: 0
            }}
          >
            <Play size={18} fill="#ffffff" style={{ marginLeft: 2 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--text-main)',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{isBn ? 'টপ ১০ নিউজ' : 'Top 10 News'}</span>
                <span
                  style={{
                    backgroundColor: 'var(--primary-red)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {isBn ? 'শর্টস' : 'Shorts'}
                </span>
              </h3>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
              {isBn ? 'আজকের শীর্ষ আলোচিত ১০টি খণ্ড সংবাদ ও ভিডিও হাইলাইটস' : "Today's Top 10 short-form video stories and highlights"}
            </p>
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous Top News"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollLeft ? 'pointer' : 'not-allowed',
              opacity: canScrollLeft ? 1 : 0.4,
              transition: 'background-color 0.2s, transform 0.15s'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Next Top News"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollRight ? 'pointer' : 'not-allowed',
              opacity: canScrollRight ? 1 : 0.4,
              transition: 'background-color 0.2s, transform 0.15s'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel (YouTube Shorts Style) */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="top-news-carousel"
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '12px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {sortedList.map((item, idx) => {
          const rankNumber = idx + 1;
          const rankStr = isBn
            ? String(rankNumber).padStart(2, '0').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])
            : String(rankNumber).padStart(2, '0');

          const thumb = item.imageUrl || item.thumbnail || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : FALLBACK_PORTRAIT_IMG);
          const title = isBn ? item.titleBn : (item.titleEn || item.titleBn);
          const categoryName = isBn ? (item.categoryBn || 'শীর্ষ সংবাদ') : (item.categoryEn || 'Top News');

          return (
            <div
              key={item.id || item.newsId || idx}
              onClick={() => setActiveShortIdx(idx)}
              className="top-news-card"
              style={{
                flex: '0 0 210px',
                height: '360px',
                borderRadius: '14px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                backgroundColor: '#111111',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                scrollSnapAlign: 'start',
                userSelect: 'none',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}
            >
              {/* Background Thumbnail Image */}
              <img
                src={thumb}
                alt={title}
                className="top-news-card-img"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.35s ease'
                }}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_PORTRAIT_IMG;
                }}
              />

              {/* Top Gradient Shadow for Badge readability */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '80px',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Rank Number Badge (#01, #02 ...) */}
              <div
                className="top-news-rank-badge"
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'var(--primary-red)',
                  color: '#ffffff',
                  padding: '3px 9px',
                  borderRadius: '20px',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span>#{rankStr}</span>
              </div>

              {/* Duration Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Clock size={11} />
                <span>{item.videoDuration || item.duration || '০০:৫৮'}</span>
              </div>

              {/* Center Play Button Overlay on Hover */}
              <div
                className="top-news-play-hover"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) scale(0.9)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(230,0,18,0.92)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  opacity: 0,
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                  pointerEvents: 'none'
                }}
              >
                <Play size={22} fill="#ffffff" style={{ marginLeft: 3 }} />
              </div>

              {/* Bottom Gradient Overlay for Text readability */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '40px 14px 14px 14px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 65%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  pointerEvents: 'none'
                }}
              >
                <span
                  style={{
                    color: 'var(--primary-red)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {categoryName}
                </span>

                <h4
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-headline)',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    lineHeight: 1.35,
                    color: '#ffffff',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                  }}
                  title={title}
                >
                  {title}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.85)',
                      fontWeight: 600
                    }}
                  >
                    <Eye size={12} color="var(--primary-red)" />
                    <span>{formatViewsBn(item.views, isBn)}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{isBn ? 'ভিউ' : 'views'}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shorts Player Modal */}
      {activeItem && (
        <div
          className="top-news-shorts-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.92)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setActiveShortIdx(null)}
        >
          {/* Modal Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '410px',
              height: '88vh',
              maxHeight: '740px',
              backgroundColor: '#000000',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Story Counter and Close button */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 20,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--primary-red)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontFamily: 'var(--font-headline)',
                    fontSize: '0.85rem',
                    fontWeight: 800
                  }}
                >
                  #{isBn ? String(activeShortIdx + 1).padStart(2, '0').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]) : String(activeShortIdx + 1).padStart(2, '0')}
                </span>
                <span style={{ color: '#ffffff', fontSize: '0.82rem', fontWeight: 600 }}>
                  {isBn ? `${(activeShortIdx + 1).toLocaleString('bn-BD')} / ${sortedList.length.toLocaleString('bn-BD')}` : `${activeShortIdx + 1} / ${sortedList.length}`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveShortIdx(null)}
                aria-label="Close Shorts"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player Area */}
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', backgroundColor: '#000000' }}>
              {activeItem.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeItem.youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
                  title={isBn ? activeItem.titleBn : (activeItem.titleEn || activeItem.titleBn)}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeItem.videoUrl ? (
                <video
                  src={activeItem.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img
                    src={activeItem.imageUrl || FALLBACK_PORTRAIT_IMG}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      padding: '24px',
                      textAlign: 'center'
                    }}
                  >
                    <Flame size={44} color="var(--primary-red)" style={{ marginBottom: 12 }} />
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                      {isBn ? 'এই সংবাদের ভিডিও প্রস্তুত হচ্ছে' : 'Video stream is currently preparing'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Meta & Flipping Navigation */}
            <div
              style={{
                padding: '16px 18px',
                backgroundColor: '#111111',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--primary-red)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isBn ? (activeItem.categoryBn || 'শীর্ষ সংবাদ') : (activeItem.categoryEn || 'Top News')}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={12} color="var(--primary-red)" />
                  <span>{formatViewsBn(activeItem.views, isBn)} {isBn ? 'ভিউ' : 'views'}</span>
                </span>
              </div>

              <h4
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  color: '#ffffff'
                }}
              >
                {isBn ? activeItem.titleBn : (activeItem.titleEn || activeItem.titleBn)}
              </h4>

              {/* Prev / Next Bottom Action Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => setActiveShortIdx((prev) => (prev - 1 >= 0 ? prev - 1 : sortedList.length - 1))}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>{isBn ? 'পূর্ববর্তী' : 'Previous'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveShortIdx((prev) => (prev + 1 < sortedList.length ? prev + 1 : 0))}
                  style={{
                    backgroundColor: 'var(--primary-red)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{isBn ? 'পরবর্তী' : 'Next'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

