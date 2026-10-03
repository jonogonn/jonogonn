import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Sparkles,
  MapPin,
  Moon,
  Sun,
  CloudSun,
  X,
  Compass,
  PartyPopper
} from 'lucide-react';
import { calculatePrayerTimes, getNextGovtHoliday } from '../../services/prayerTimeService';
import { bangladeshDistricts } from '../../data/initialData';

export default function SideWatchWidget() {
  const { language, userDistrict } = useNews();
  const isBn = language === 'bn';

  // Clock State
  const [time, setTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Clock Hand Angles
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondAngle = (seconds / 60) * 360;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
  const hourAngle = (((hours % 12) + minutes / 60) / 12) * 360;

  // Prayer Times & Holiday Data
  const prayerData = calculatePrayerTimes(userDistrict);
  const nextHoliday = getNextGovtHoliday();

  // Active District Name
  const allDistricts = bangladeshDistricts.flatMap((d) => d.districts);
  const currentDistrictObj = allDistricts.find((d) => d.id === userDistrict) || { nameBn: 'ঢাকা', nameEn: 'Dhaka' };

  return (
    <>
      {/* ========================================================
          1. RIGHT SIDE FLOATING ANALOG WATCH WIDGET
          ======================================================== */}
      <aside
        className={`side-floating-watch-widget ${isExpanded ? 'active' : ''}`}
        aria-label="Clock and Prayer Widget"
      >
        {/* Toggle Arrow Tab */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="side-watch-toggle-tab"
          title={isBn ? 'নামাজের পূর্ণাঙ্গ সময়সূচি ও ছুটি দেখতে ক্লিক করুন' : 'Click to view full prayer times & holidays'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronRight size={20} color="#FFFFFF" />
          ) : (
            <ChevronLeft size={20} color="#FFFFFF" className="pulse-arrow" />
          )}
        </button>

        {/* Main Floating Card Container */}
        <div className="side-watch-card" onClick={() => !isExpanded && setIsExpanded(true)}>
          {/* Analog Watch Dial */}
          <div className="analog-clock-wrap" title={time.toLocaleTimeString()}>
            <svg viewBox="0 0 100 100" className="analog-clock-svg">
              {/* Bezel & Face */}
              <circle cx="50" cy="50" r="48" className="clock-dial-bezel" />
              <circle cx="50" cy="50" r="45" className="clock-dial-face" />

              {/* Hour Index Markers */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const isMain = i % 3 === 0;
                const r1 = 44;
                const r2 = isMain ? 41 : 38;
                const x1 = 50 + r1 * Math.sin(angle);
                const y1 = 50 - r1 * Math.cos(angle);
                const x2 = 50 + r2 * Math.sin(angle);
                const y2 = 50 - r2 * Math.cos(angle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className={`clock-tick ${i === 0 ? 'tick-12' : isMain ? 'tick-main' : ''}`}
                  />
                );
              })}

              {/* 12, 3, 6, 9 Numbers */}
              <text x="50" y="24" className="clock-num-text tick-12-text" textAnchor="middle" dominantBaseline="central">
                {isBn ? '১২' : '12'}
              </text>
              <text x="79" y="50" className="clock-num-text" textAnchor="middle" dominantBaseline="central">
                {isBn ? '৩' : '3'}
              </text>
              <text x="50" y="78" className="clock-num-text" textAnchor="middle" dominantBaseline="central">
                {isBn ? '৬' : '6'}
              </text>
              <text x="21" y="50" className="clock-num-text" textAnchor="middle" dominantBaseline="central">
                {isBn ? '৯' : '9'}
              </text>

              {/* Dial Brand Micro Text */}
              <text x="50" y="37" className="clock-brand-text" textAnchor="middle" dominantBaseline="central">
                জনগণ
              </text>

              {/* Hour Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="28"
                className="clock-hour-hand"
                style={{ transform: `rotate(${hourAngle}deg)`, transformOrigin: '50px 50px' }}
              />

              {/* Minute Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="17"
                className="clock-minute-hand"
                style={{ transform: `rotate(${minuteAngle}deg)`, transformOrigin: '50px 50px' }}
              />

              {/* Second Hand (Red Brand) */}
              <line
                x1="50"
                y1="60"
                x2="50"
                y2="12"
                className="clock-second-hand"
                style={{ transform: `rotate(${secondAngle}deg)`, transformOrigin: '50px 50px' }}
              />

              {/* Center Pivot Cap */}
              <circle cx="50" cy="50" r="4.2" className="clock-pivot" />
              <circle cx="50" cy="50" r="1.8" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Next Namaz Mini Pill Below Clock */}
          <div className="side-namaz-preview">
            <span className="namaz-preview-label">
              {isBn ? 'পরবর্তী ওয়াক্ত' : 'Next Prayer'}
            </span>
            <div className="namaz-preview-time-row">
              <span className="namaz-live-dot"></span>
              <strong className="namaz-preview-name">
                {isBn ? prayerData.nextWaqt.nameBn : prayerData.nextWaqt.nameEn}
              </strong>
              <span className="namaz-preview-time">
                {isBn ? prayerData.nextWaqt.timeBn : prayerData.nextWaqt.timeEn}
              </span>
            </div>
            <span className="namaz-preview-countdown">
              {isBn ? prayerData.remainingTextBn : prayerData.remainingTextEn}
            </span>
          </div>

          {/* Click to expand hint button */}
          <div className="side-watch-expand-hint">
            <span>{isBn ? 'পূর্ণাঙ্গ সময়সূচি' : 'Full Schedule'}</span>
            <ChevronLeft size={16} />
          </div>
        </div>
      </aside>

      {/* ========================================================
          2. EXPANDED FULL ISLAMIC PRAYER & HOLIDAY FLYOUT PANEL
          ======================================================== */}
      {isExpanded && (
        <div className="side-flyout-backdrop" onClick={() => setIsExpanded(false)}>
          <div
            className="side-flyout-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="side-flyout-header">
              <div className="side-flyout-title-wrap">
                <div className="side-flyout-icon-box">
                  <Compass size={18} color="var(--primary-red)" />
                </div>
                <div>
                  <h3 className="side-flyout-title">
                    {isBn ? 'নামাজের সময়সূচি ও সরকারি ছুটি' : 'Prayer Times & Govt Holidays'}
                  </h3>
                  <p className="side-flyout-location">
                    <MapPin size={12} color="var(--primary-red)" style={{ display: 'inline', marginRight: 3 }} />
                    {isBn ? `${currentDistrictObj.nameBn} জেলা অনুযায়ী` : `For ${currentDistrictObj.nameEn}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="side-flyout-close-btn"
                aria-label="Close Panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel Content Scrollable */}
            <div className="side-flyout-body">
              {/* Next Prayer Highlight Card */}
              <div className="next-prayer-banner">
                <div className="next-prayer-banner-info">
                  <span className="banner-tag">
                    {isBn ? 'পরবর্তী ওয়াক্ত' : 'Next Prayer'}
                  </span>
                  <h4 className="banner-waqt-name">
                    {isBn ? prayerData.nextWaqt.nameBn : prayerData.nextWaqt.nameEn}
                  </h4>
                  <span className="banner-waqt-time">
                    {isBn ? prayerData.nextWaqt.timeBn : prayerData.nextWaqt.timeEn}
                  </span>
                </div>
                <div className="banner-countdown-badge">
                  <Clock size={14} />
                  <span>{isBn ? prayerData.remainingTextBn : prayerData.remainingTextEn}</span>
                </div>
              </div>

              {/* 5 Waqt Prayer Times Grid */}
              <div className="prayer-times-section">
                <h4 className="flyout-section-heading">
                  {isBn ? 'আজকের ৫ ওয়াক্ত নামাজের সময়' : 'Today’s 5 Waqt Prayer Times'}
                </h4>
                <div className="prayer-times-grid">
                  {prayerData.prayers.map((p) => {
                    const isNext = p.id === prayerData.nextWaqt.id;
                    return (
                      <div
                        key={p.id}
                        className={`prayer-time-card ${isNext ? 'is-next' : ''}`}
                      >
                        <div className="prayer-card-header">
                          <span className="prayer-icon-wrap">
                            {p.icon === 'sun' ? (
                              <Sun size={15} color="#FFB800" />
                            ) : p.icon === 'cloud-sun' ? (
                              <CloudSun size={15} color="#FF9900" />
                            ) : (
                              <Moon size={15} color="#818CF8" />
                            )}
                          </span>
                          <span className="prayer-name">
                            {isBn ? p.nameBn : p.nameEn}
                          </span>
                          {isNext && (
                            <span className="prayer-next-pill">
                              {isBn ? 'পরবর্তী' : 'Next'}
                            </span>
                          )}
                        </div>
                        <div className="prayer-time-val">
                          {isBn ? p.timeBn : p.timeEn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sahri & Iftar Row */}
              <div className="sahri-iftar-row">
                <div className="sahri-iftar-card sahri-card">
                  <div className="si-icon-wrap">
                    <Moon size={16} color="#4F46E5" />
                  </div>
                  <div className="si-content">
                    <span className="si-label">
                      {isBn ? 'সেহরির শেষ সময়' : 'Sahri Ends'}
                    </span>
                    <strong className="si-time">
                      {isBn ? prayerData.sahri.timeBn : prayerData.sahri.timeEn}
                    </strong>
                  </div>
                </div>

                <div className="sahri-iftar-card iftar-card">
                  <div className="si-icon-wrap">
                    <Sun size={16} color="#E60012" />
                  </div>
                  <div className="si-content">
                    <span className="si-label">
                      {isBn ? 'ইফতারের সময়' : 'Iftar Time'}
                    </span>
                    <strong className="si-time">
                      {isBn ? prayerData.iftar.timeBn : prayerData.iftar.timeEn}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Next Government Holiday Section */}
              {nextHoliday && (
                <div className="next-holiday-section">
                  <div className="holiday-header-row">
                    <div className="holiday-title-group">
                      <PartyPopper size={16} color="var(--primary-red)" />
                      <h4 className="flyout-section-heading" style={{ margin: 0 }}>
                        {isBn ? 'পরবর্তী সরকারি ছুটি' : 'Next Govt Holiday'}
                      </h4>
                    </div>
                    <span className="holiday-type-badge">
                      {isBn ? nextHoliday.typeBn : nextHoliday.typeEn}
                    </span>
                  </div>

                  <div className="holiday-banner-card">
                    <div className="holiday-main-info">
                      <h5 className="holiday-name">
                        {isBn ? nextHoliday.nameBn : nextHoliday.nameEn}
                      </h5>
                      <div className="holiday-date-row">
                        <Calendar size={13} color="var(--primary-red)" />
                        <span>{isBn ? nextHoliday.fullDateBn : nextHoliday.fullDateEn}</span>
                      </div>
                    </div>

                    <div className="holiday-countdown-pill">
                      <span>
                        {isBn
                          ? `${nextHoliday.daysLeftBn} দিন বাকি`
                          : `${nextHoliday.daysLeft} days left`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
