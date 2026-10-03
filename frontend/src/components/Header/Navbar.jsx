import React, { useState } from 'react';
import { useNews } from '../../context/NewsContext';
import { Menu, Home, ChevronDown, X, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const {
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    categories,
    activeCategory,
    setActiveCategory,
    setSearchQuery
  } = useNews();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isBn = language === 'bn';

  // Filter out 'latest' from the looped category list to avoid duplicate "সর্বশেষ"
  const navCategories = categories.filter((c) => c.id !== 'latest');
  const primaryCategories = navCategories.slice(0, 9);
  const moreCategories = navCategories.slice(9);

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    setSearchQuery('');
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        {/* Mobile Hamburger Button */}
        <button
          className="nav-item mobile-only-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{ display: 'none' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Category Menu List */}
        <div className="nav-menu">
          {/* Home / Lead Button */}
          <button
            onClick={() => handleSelectCategory('latest')}
            className={`nav-item ${activeCategory === 'latest' ? 'active' : ''}`}
            title={isBn ? 'সর্বশেষ সংবাদ ও প্রচ্ছদ' : 'Home / Latest'}
          >
            <Home size={16} className="nav-item-icon" />
            <span>{isBn ? 'সর্বশেষ' : 'Latest'}</span>
          </button>

          {/* Primary News Categories (Without duplicate Latest) */}
          {primaryCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`nav-item ${activeCategory === cat.id ? 'active' : ''}`}
            >
              {isBn ? cat.nameBn : cat.nameEn}
            </button>
          ))}

          {/* 'আরও' (More) Dropdown */}
          {moreCategories.length > 0 && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="nav-item"
                style={{ cursor: 'pointer' }}
              >
                <span>{isBn ? 'আরও' : 'More'}</span>
                <ChevronDown size={14} style={{ marginLeft: 4 }} />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    borderRadius: 4,
                    minWidth: 160,
                    zIndex: 1000,
                    padding: '6px 0'
                  }}
                >
                  {moreCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontFamily: 'var(--font-subheadline)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        backgroundColor: activeCategory === cat.id ? 'var(--primary-red)' : 'transparent',
                        color: activeCategory === cat.id ? 'var(--white)' : 'var(--text-main)'
                      }}
                    >
                      {isBn ? cat.nameBn : cat.nameEn}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Language Toggle (BN/EN) and Dark/Light Mode Switch on Red Navbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12 }}>
          {/* BN / EN Switcher Badge */}
          <button
            onClick={toggleLanguage}
            title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
            aria-label="Toggle Language"
            style={{
              backgroundColor: 'var(--white)',
              color: 'var(--primary-red)',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '4px 10px',
              borderRadius: 3,
              letterSpacing: '0.5px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s ease'
            }}
          >
            {isBn ? 'BN' : 'EN'}
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            aria-label="Toggle Theme"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              color: 'var(--white)',
              padding: '5px 8px',
              borderRadius: 4,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease'
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
