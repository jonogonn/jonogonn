import React from 'react';
import { useNews } from '../../context/NewsContext';
import { Search } from 'lucide-react';

export default function MainHeader() {
  const { language, settings, searchQuery, setSearchQuery, setActiveCategory } = useNews();
  const isBn = language === 'bn';

  return (
    <div className="main-header">
      <div className="container main-header-content">
        {/* Brand Logo & Slogan */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setActiveCategory('latest');
            setSearchQuery('');
          }}
          className="brand-logo-wrap"
          title={isBn ? settings.siteNameBn : settings.siteNameEn}
        >
          <img
            src={settings.logoUrl || '/logo.svg'}
            alt={isBn ? settings.siteNameBn : settings.siteNameEn}
            className="brand-logo-img"
          />
          <span className="brand-tagline">
            {isBn ? settings.sloganBn : settings.sloganEn}
          </span>
        </a>

        {/* Header Search Box */}
        <div className="header-search-box">
          <input
            type="text"
            className="header-search-input"
            placeholder={isBn ? 'খবর খুঁজুন...' : 'Search news...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search news"
          />
          <button className="header-search-btn" aria-label="Submit search">
            <Search size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
