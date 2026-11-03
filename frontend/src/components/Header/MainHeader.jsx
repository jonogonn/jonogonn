import React from 'react';
import { useNews } from '../../context/NewsContext';
import { Search } from 'lucide-react';

export default function MainHeader() {
  const { language, settings, searchQuery, setSearchQuery, setActiveCategory, goToSearch } = useNews();
  const isBn = language === 'bn';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    goToSearch(searchQuery.trim());
  };

  return (
    <div className="main-header">
      <div className="container main-header-content">
        {/* Brand Logo & Website Name */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setActiveCategory('latest');
            setSearchQuery('');
          }}
          className="brand-logo-wrap"
          title={isBn ? 'জনগণ.নিউজ' : 'Jonogon.News'}
        >
          <img
            src={settings.logoUrl || '/logo.svg'}
            alt={isBn ? 'জনগণ.নিউজ' : 'Jonogon.News'}
            className="brand-logo-img"
          />
          <div className="brand-name-wrap">
            <span className="brand-site-title">
              {isBn ? 'জনগণ.নিউজ' : 'Jonogon.News'}
            </span>
          </div>
        </a>

        {/* Header Search Box */}
        <form onSubmit={handleSearchSubmit} className="header-search-box" role="search">
          <input
            type="text"
            className="header-search-input"
            placeholder={isBn ? 'খবর খুঁজুন...' : 'Search news...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search news"
          />
          <button type="submit" className="header-search-btn" aria-label="Submit search">
            <Search size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
