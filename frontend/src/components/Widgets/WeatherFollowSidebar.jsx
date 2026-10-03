import React, { useState } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { FacebookIcon, XIcon, PinterestIcon, InstagramIcon, YoutubeIcon } from '../Icons/SocialIcons';

export default function WeatherFollowSidebar() {
  const { language, settings } = useNews();
  const isBn = language === 'bn';

  // Weather data
  const weatherData = {
    cityBn: 'ঢাকা',
    cityEn: 'Dhaka',
    tempBn: '২৮°',
    tempEn: '28°',
    conditionBn: 'পরিষ্কার আকাশ',
    conditionEn: 'Clear Sky',
    highBn: '৩২°',
    highEn: '32°',
    lowBn: '২২°',
    lowEn: '22°',
    humidityBn: '৭৮%',
    humidityEn: '78%',
    windBn: '৪ কিমি/ঘণ্টা',
    windEn: '4 km/h',
    forecast: [
      { dayBn: 'শুক্র', dayEn: 'Fri', icon: 'cloud', tempBn: '২৭°', tempEn: '27°' },
      { dayBn: 'শনি', dayEn: 'Sat', icon: 'cloud-sun', tempBn: '২৯°', tempEn: '29°' },
      { dayBn: 'রবি', dayEn: 'Sun', icon: 'sun', tempBn: '৩১°', tempEn: '31°' },
      { dayBn: 'সোম', dayEn: 'Mon', icon: 'rain', tempBn: '২৬°', tempEn: '26°' },
      { dayBn: 'মঙ্গল', dayEn: 'Tue', icon: 'sun', tempBn: '৩০°', tempEn: '30°' }
    ]
  };

  const renderForecastIcon = (type) => {
    switch (type) {
      case 'sun':
        return <Sun size={18} color="#FFB800" />;
      case 'cloud-sun':
        return <CloudSun size={18} color="#FF9900" />;
      case 'rain':
        return <CloudRain size={18} color="#4A90E2" />;
      default:
        return <Cloud size={18} color="#9E9E9E" />;
    }
  };

  return (
    <div className="weather-follow-sidebar-wrapper">
      {/* ========================================================
          1. Weather Widget Card (Foxiz Tech Style)
          ======================================================== */}
      <div className="foxiz-weather-card">
        {/* Weather Tag Header */}
        <div className="weather-card-top-pill">
          <span className="weather-pill-badge">
            {isBn ? 'আবহাওয়া' : 'Weather'}
          </span>
        </div>

        {/* Current Weather Display */}
        <div className="weather-current-main">
          <div className="weather-icon-temp-row">
            <div className="weather-main-icon-wrap">
              <Moon size={42} className="weather-moon-icon" />
            </div>
            <div className="weather-main-temp">
              <span className="weather-temp-num">{isBn ? weatherData.tempBn : weatherData.tempEn}</span>
              <span className="weather-temp-unit">C</span>
            </div>
          </div>

          <div className="weather-location-info">
            <h3 className="weather-city-name">
              {isBn ? weatherData.cityBn : weatherData.cityEn}
            </h3>
            <p className="weather-condition-sub">
              {isBn ? weatherData.conditionBn : weatherData.conditionEn}
            </p>
          </div>

          {/* High, Low, Humidity, Wind Details */}
          <div className="weather-details-grid">
            <div className="weather-detail-item">
              <span className="weather-detail-symbol">↑</span>
              <span className="weather-detail-val">{isBn ? weatherData.highBn : weatherData.highEn}</span>
              <span className="weather-detail-sep">_</span>
              <span className="weather-detail-symbol">↓</span>
              <span className="weather-detail-val">{isBn ? weatherData.lowBn : weatherData.lowEn}</span>
            </div>

            <div className="weather-detail-item">
              <Droplets size={13} color="#4A90E2" />
              <span className="weather-detail-val">{isBn ? weatherData.humidityBn : weatherData.humidityEn}</span>
            </div>

            <div className="weather-detail-item">
              <Wind size={13} color="#9E9E9E" />
              <span className="weather-detail-val">{isBn ? weatherData.windBn : weatherData.windEn}</span>
            </div>
          </div>
        </div>

        {/* 5-Day Mini Forecast Strip */}
        <div className="weather-5day-forecast-row">
          {weatherData.forecast.map((fc, idx) => (
            <div key={idx} className="weather-forecast-col">
              <span className="forecast-day-name">
                {isBn ? fc.dayBn : fc.dayEn}
              </span>
              <div className="forecast-icon-wrap">
                {renderForecastIcon(fc.icon)}
              </div>
              <span className="forecast-temp-val">
                {isBn ? fc.tempBn : fc.tempEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          2. / Follow Us / Social Counter Widget
          ======================================================== */}
      <div className="foxiz-follow-widget">
        <div className="follow-widget-header">
          <span className="follow-header-title">
            / {isBn ? 'আমাদের সাথে থাকুন' : 'Follow Us'} /
          </span>
        </div>

        <div className="follow-buttons-grid">
          {/* Facebook */}
          <a
            href={settings?.facebook || 'https://facebook.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="follow-circle-card facebook-card"
            title="Facebook Page"
          >
            <div className="follow-circle-icon fb-bg">
              <FacebookIcon size={18} color="#FFFFFF" />
            </div>
            <span className="follow-count-num">248.1K</span>
            <span className="follow-action-label">{isBn ? 'পছন্দ' : 'Like'}</span>
          </a>

          {/* X (Twitter) */}
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="follow-circle-card x-card"
            title="X (Twitter)"
          >
            <div className="follow-circle-icon x-bg">
              <XIcon size={16} color="#FFFFFF" />
            </div>
            <span className="follow-count-num">69.1K</span>
            <span className="follow-action-label">{isBn ? 'অনুসরণ' : 'Follow'}</span>
          </a>

          {/* Pinterest / YouTube */}
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="follow-circle-card pinterest-card"
            title="Pinterest"
          >
            <div className="follow-circle-icon pin-bg">
              <PinterestIcon size={17} color="#FFFFFF" />
            </div>
            <span className="follow-count-num">134K</span>
            <span className="follow-action-label">{isBn ? 'পিন' : 'Pin'}</span>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="follow-circle-card instagram-card"
            title="Instagram"
          >
            <div className="follow-circle-icon insta-bg">
              <InstagramIcon size={17} color="#FFFFFF" />
            </div>
            <span className="follow-count-num">54.3K</span>
            <span className="follow-action-label">{isBn ? 'অনুসরণ' : 'Follow'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
