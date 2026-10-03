import React from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { FacebookIcon, XIcon, PinterestIcon, InstagramIcon, YoutubeIcon } from '../Icons/SocialIcons';

export default function WeatherFollowSidebar() {
  const { language, settings, liveWeather, isWeatherLoading, refreshWeather, userDistrict } = useNews();
  const isBn = language === 'bn';

  const weather = liveWeather || {
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
    iconType: 'moon',
    forecast: [
      { dayBn: 'শুক্র', dayEn: 'Fri', icon: 'cloud', tempBn: '২৭°', tempEn: '27°' },
      { dayBn: 'শনি', dayEn: 'Sat', icon: 'cloud-sun', tempBn: '২৯°', tempEn: '29°' },
      { dayBn: 'রবি', dayEn: 'Sun', icon: 'sun', tempBn: '৩১°', tempEn: '31°' },
      { dayBn: 'সোম', dayEn: 'Mon', icon: 'rain', tempBn: '২৬°', tempEn: '26°' },
      { dayBn: 'মঙ্গল', dayEn: 'Tue', icon: 'sun', tempBn: '৩০°', tempEn: '30°' }
    ]
  };

  const renderWeatherIcon = (iconKey) => {
    switch (iconKey) {
      case 'sun':
        return <Sun size={42} color="#FFB800" className="weather-sun-icon" />;
      case 'cloud-sun':
        return <CloudSun size={42} color="#FF9900" className="weather-cloud-sun-icon" />;
      case 'rain':
        return <CloudRain size={42} color="#4A90E2" className="weather-rain-icon" />;
      case 'thunder':
        return <CloudLightning size={42} color="var(--primary-red)" className="weather-thunder-icon" />;
      case 'cloud':
        return <Cloud size={42} color="#9E9E9E" className="weather-cloud-icon" />;
      default:
        return <Moon size={42} className="weather-moon-icon" />;
    }
  };

  const renderForecastIcon = (type) => {
    switch (type) {
      case 'sun':
        return <Sun size={18} color="#FFB800" />;
      case 'cloud-sun':
        return <CloudSun size={18} color="#FF9900" />;
      case 'rain':
        return <CloudRain size={18} color="#4A90E2" />;
      case 'thunder':
        return <CloudLightning size={18} color="var(--primary-red)" />;
      default:
        return <Cloud size={18} color="#9E9E9E" />;
    }
  };

  return (
    <div className="weather-follow-sidebar-wrapper">
      {/* ========================================================
          1. Weather Widget Card (Google Weather / Foxiz Style)
          ======================================================== */}
      <div className="foxiz-weather-card">
        {/* Weather Tag Header */}
        <div className="weather-card-top-pill">
          <span className="weather-pill-badge">
            {isBn ? 'আবহাওয়া' : 'Weather'}
          </span>
          <button
            onClick={() => refreshWeather(userDistrict)}
            className={`weather-refresh-btn ${isWeatherLoading ? 'spinning' : ''}`}
            title={isBn ? 'আবহাওয়া আপডেট করুন' : 'Refresh Weather'}
            aria-label="Refresh Weather"
          >
            <RefreshCw size={12} />
          </button>
        </div>

        {/* Current Weather Display */}
        <div className="weather-current-main">
          <div className="weather-icon-temp-row">
            <div className="weather-main-icon-wrap">
              {renderWeatherIcon(weather.iconType)}
            </div>
            <div className="weather-main-temp">
              <span className="weather-temp-num">{isBn ? weather.tempBn : weather.tempEn}</span>
              <span className="weather-temp-unit">C</span>
            </div>
          </div>

          <div className="weather-location-info">
            <h3 className="weather-city-name">
              <MapPin size={16} color="var(--primary-red)" style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline' }} />
              {isBn ? weather.cityBn : weather.cityEn}
            </h3>
            <p className="weather-condition-sub">
              {isBn ? weather.conditionBn : weather.conditionEn}
            </p>
          </div>

          {/* High, Low, Humidity, Wind Details */}
          <div className="weather-details-grid">
            <div className="weather-detail-item" title={isBn ? 'সর্বোচ্চ ও সর্বনিম্ন তাপমাত্রা' : 'Max & Min Temp'}>
              <span className="weather-detail-symbol">↑</span>
              <span className="weather-detail-val">{isBn ? weather.highBn : weather.highEn}</span>
              <span className="weather-detail-sep">_</span>
              <span className="weather-detail-symbol">↓</span>
              <span className="weather-detail-val">{isBn ? weather.lowBn : weather.lowEn}</span>
            </div>

            <div className="weather-detail-item" title={isBn ? 'আর্দ্রতা' : 'Humidity'}>
              <Droplets size={13} color="#4A90E2" />
              <span className="weather-detail-val">{isBn ? weather.humidityBn : weather.humidityEn}</span>
            </div>

            <div className="weather-detail-item" title={isBn ? 'বাতাসের গতিবেগ' : 'Wind Speed'}>
              <Wind size={13} color="#9E9E9E" />
              <span className="weather-detail-val">{isBn ? weather.windBn : weather.windEn}</span>
            </div>
          </div>
        </div>

        {/* 5-Day Mini Forecast Strip */}
        <div className="weather-5day-forecast-row">
          {(weather.forecast || []).map((fc, idx) => (
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
