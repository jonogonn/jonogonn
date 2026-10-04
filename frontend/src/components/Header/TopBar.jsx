import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { CloudSun, Sun, Moon, Cloud, CloudRain, CloudLightning, ShieldAlert, Sparkles } from 'lucide-react';
import { FacebookIcon, YoutubeIcon } from '../Icons/SocialIcons';

export default function TopBar() {
  const {
    language,
    settings,
    setActivePolicyModal,
    navigateTo,
    liveWeather
  } = useNews();

  const isBn = language === 'bn';

  const renderTopWeatherIcon = (icon) => {
    switch (icon) {
      case 'sun':
        return <Sun size={14} color="#FFB800" />;
      case 'moon':
        return <Moon size={14} color="#D9D9D9" />;
      case 'rain':
        return <CloudRain size={14} color="#4A90E2" />;
      case 'thunder':
        return <CloudLightning size={14} color="var(--primary-red)" />;
      case 'cloud':
        return <Cloud size={14} color="#9E9E9E" />;
      default:
        return <CloudSun size={14} color="var(--primary-red)" />;
    }
  };

  // Live Current Date
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    if (isBn) {
      const bnDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
      const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      const dayName = bnDays[now.getDay()];
      const dayNum = now.toLocaleDateString('bn-BD', { day: 'numeric' });
      const monthName = bnMonths[now.getMonth()];
      const yearNum = now.toLocaleDateString('bn-BD', { year: 'numeric' });
      setCurrentDate(`${dayName}, ${dayNum} ${monthName} ${yearNum}`);
    } else {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    }
  }, [isBn]);

  return (
    <header className="topbar">
      <div className="container topbar-content">
        {/* Left Side: Live Date & Weather */}
        <div className="topbar-left">
          <div className="topbar-date">
            <span>{currentDate}</span>
          </div>
          <div
            className="topbar-weather"
            title={
              liveWeather
                ? `${isBn ? liveWeather.cityBn : liveWeather.cityEn} - ${isBn ? liveWeather.conditionBn : liveWeather.conditionEn}`
                : 'Weather'
            }
          >
            {renderTopWeatherIcon(liveWeather?.iconType)}
            <span>
              {liveWeather
                ? isBn
                  ? `${liveWeather.cityBn} ${liveWeather.tempBn}C`
                  : `${liveWeather.cityEn} ${liveWeather.tempEn}C`
                : isBn
                ? 'ঢাকা ২৮°C'
                : 'Dhaka 28°C'}
            </span>
          </div>
        </div>

        {/* Right Side: Policy Links & Social Icons */}
        <div className="topbar-right">
          <nav className="topbar-links" aria-label="Quick Links">
            <a
              href="/about"
              className="topbar-policy-link"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/about');
              }}
            >
              {isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
            </a>
            <span className="topbar-divider">|</span>
            <a
              href="/advertisement"
              className="topbar-policy-link"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/advertisement');
              }}
            >
              {isBn ? 'বিজ্ঞাপন' : 'Advertisement'}
            </a>
            <span className="topbar-divider">|</span>
            <a
              href="/contact"
              className="topbar-policy-link"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/contact');
              }}
            >
              {isBn ? 'যোগাযোগ' : 'Contact'}
            </a>
            <span className="topbar-divider">|</span>
            <button
              type="button"
              onClick={() => setActivePolicyModal('emergency')}
              className="topbar-emergency-link"
              title={isBn ? 'জাতীয় জরুরি সেবা ও হটলাইন নম্বরসমূহ' : 'National Emergency & Govt Services'}
            >
              <span className="emergency-dot"></span>
              <span className="emergency-text">{isBn ? 'জরুরি সেবা' : 'Emergency'}</span>
            </button>
          </nav>

          {/* Social Icons */}
          <div className="topbar-social">
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                aria-label="Facebook Page"
                className="topbar-social-icon"
              >
                <FacebookIcon size={14} />
              </a>
            )}
            {settings.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                aria-label="YouTube Channel"
                className="topbar-social-icon"
              >
                <YoutubeIcon size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
