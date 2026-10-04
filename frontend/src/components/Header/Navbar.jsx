import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Menu,
  Home,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  X,
  Sun,
  Moon,
  MapPin,
  Search,
  Mic,
  Headphones,
  Landmark,
  TrendingUp,
  Cpu,
  Radio,
  Rocket,
  HeartHandshake,
  Grid,
  Layers,
  Sparkles,
  Check,
  Globe,
  Briefcase,
  HeartPulse,
  Trophy,
  Film,
  Phone,
  Mail,
  MapPin as LocationPin,
  Info
} from 'lucide-react';
import { bangladeshDistricts } from '../../data/initialData';
import { FacebookIcon, YoutubeIcon } from '../Icons/SocialIcons';

// Helper to render crisp Lucide SVG Icon for each podcast subject
const renderSubjectIcon = (iconType, size = 14) => {
  switch (iconType) {
    case 'politics':
      return <Landmark size={size} />;
    case 'economy':
      return <TrendingUp size={size} />;
    case 'tech':
      return <Cpu size={size} />;
    case 'media':
      return <Radio size={size} />;
    case 'youth':
      return <Rocket size={size} />;
    case 'society':
      return <HeartHandshake size={size} />;
    case 'all':
    default:
      return <Headphones size={size} />;
  }
};

// Helper to render icon for the 10 Master Category Groups
const renderGroupIcon = (groupId, size = 14) => {
  switch (groupId) {
    case 'bangladesh-governance':
      return <Landmark size={size} />;
    case 'international-world':
      return <Globe size={size} />;
    case 'business-economy':
      return <TrendingUp size={size} />;
    case 'jobs-education':
      return <Briefcase size={size} />;
    case 'science-tech':
      return <Cpu size={size} />;
    case 'religion-society':
      return <HeartHandshake size={size} />;
    case 'sports-health':
      return <Trophy size={size} />;
    case 'entertainment':
      return <Film size={size} />;
    case 'lifestyle-culture':
      return <Sparkles size={size} />;
    case 'opinion-specials':
    default:
      return <Radio size={size} />;
  }
};

export default function Navbar() {
  const {
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    settings,
    categories,
    categoryMasterGroups,
    activeCategory,
    setActiveCategory,
    navigateTo,
    userDistrict,
    setUserDistrict,
    searchQuery,
    setSearchQuery,
    setCurrentArticle,
    setActivePolicyModal,
    podcastSubjects,
    selectedPodcastSubject,
    setSelectedPodcastSubject
  } = useNews();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaGroupId, setActiveMegaGroupId] = useState(null); // Which of the 10 groups is open
  const [allCategoriesModalOpen, setAllCategoriesModalOpen] = useState(false);
  const [megaSearch, setMegaSearch] = useState('');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [podcastDropdownOpen, setPodcastDropdownOpen] = useState(false);
  const [expandedDrawerGroups, setExpandedDrawerGroups] = useState({}); // Accordion open states

  const navRef = useRef(null);
  const isBn = language === 'bn';

  // Filter categories for live search
  const filteredSearchCategories = useMemo(() => {
    const q = (megaSearch || drawerSearch).toLowerCase().trim();
    if (!q) return null;
    return (categories || []).filter(
      (c) =>
        c.id !== 'latest' &&
        ((c.nameBn && c.nameBn.toLowerCase().includes(q)) ||
          (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
          (c.slug && c.slug.toLowerCase().includes(q)))
    );
  }, [categories, megaSearch, drawerSearch]);

  // Handle clicking outside mega menu to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveMegaGroupId(null);
        setPodcastDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMegaGroupId(null);
        setAllCategoriesModalOpen(false);
        setMobileMenuOpen(false);
        setPodcastDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    if (setCurrentArticle) setCurrentArticle(null);
    setSearchQuery('');
    setMobileMenuOpen(false);
    setActiveMegaGroupId(null);
    setAllCategoriesModalOpen(false);
    setPodcastDropdownOpen(false);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSelectPodcastSubject = (subjectId = 'all') => {
    setSelectedPodcastSubject(subjectId);
    setActiveCategory('latest');
    if (setCurrentArticle) setCurrentArticle(null);
    setSearchQuery('');
    setMobileMenuOpen(false);
    setPodcastDropdownOpen(false);
    setActiveMegaGroupId(null);
    setAllCategoriesModalOpen(false);
    setTimeout(() => {
      const podEl = document.getElementById('podcast-section');
      if (podEl) {
        podEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const toggleDrawerGroup = (groupId) => {
    setExpandedDrawerGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Concise bar title labels to fit comfortably on desktop without collision
  const getGroupBarLabel = (group) => {
    if (!isBn) {
      switch (group.id) {
        case 'bangladesh-governance':
          return 'Bangladesh';
        case 'international-world':
          return 'World';
        case 'business-economy':
          return 'Business';
        case 'jobs-education':
          return 'Education';
        case 'science-tech':
          return 'Technology';
        case 'religion-society':
          return 'Religion & Society';
        case 'sports-health':
          return 'Sports & Health';
        case 'entertainment':
          return 'Entertainment';
        case 'lifestyle-culture':
          return 'Lifestyle';
        case 'opinion-specials':
          return 'Opinion';
        default:
          return group.nameEn || group.nameBn;
      }
    }
    switch (group.id) {
      case 'bangladesh-governance':
        return 'বাংলাদেশ';
      case 'international-world':
        return 'আন্তর্জাতিক';
      case 'business-economy':
        return 'বাণিজ্য';
      case 'jobs-education':
        return 'শিক্ষা ও চাকরি';
      case 'science-tech':
        return 'প্রযুক্তি';
      case 'religion-society':
        return 'ধর্ম ও সমাজ';
      case 'sports-health':
        return 'খেলা ও স্বাস্থ্য';
      case 'entertainment':
        return 'বিনোদন';
      case 'lifestyle-culture':
        return 'জীবনযাপন';
      case 'opinion-specials':
        return 'মতামত';
      default:
        return group.nameBn;
    }
  };

  // Group priority classes to hide extra items gracefully on smaller screens without any scroll
  const getGroupPriorityClass = (idx) => {
    if (idx >= 8) return 'hide-on-laptop'; // hidden on screens < 1200px
    if (idx >= 6) return 'hide-on-tablet-landscape'; // hidden on screens < 1080px
    if (idx >= 4) return 'hide-on-tablet'; // hidden on screens < 992px
    return '';
  };

  return (
    <div className="navbar-wrapper" ref={navRef}>
      <div className="container">
        <nav className="navbar" aria-label="Main Navigation">
          <div className="navbar-content">
            {/* 1. LEFT SIDE: Menu Hamburger Button (MOBILE ONLY) */}
            <button
              type="button"
              className="nav-menu-toggle-btn mobile-only-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title={isBn ? 'সব ক্যাটাগরি ও মেনু খুলুন' : 'Open full menu'}
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
              <span className="nav-menu-btn-label">{isBn ? 'মেনু' : 'Menu'}</span>
            </button>

            {/* 2. CENTER: Main Horizontal Navigation with Strictly 9 Items on Large Display */}
            <div className="nav-menu">
              {/* Item 1: Home / Latest */}
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectCategory('latest');
                }}
                className={`nav-item nav-home-item ${activeCategory === 'latest' ? 'active' : ''}`}
                title={isBn ? 'সর্বশেষ সংবাদ ও প্রচ্ছদ' : 'Home / Latest'}
              >
                <Home size={15} className="nav-item-icon" />
                <span>{isBn ? 'সর্বশেষ' : 'Latest'}</span>
              </a>

              {/* Items 2 to 8: Exactly 7 Major Master Groups (Aleric Style Multi-Column Mega Menus) */}
              {(categoryMasterGroups || []).slice(0, 7).map((group, gIdx) => {
                const isOpen = activeMegaGroupId === group.id;
                const isGroupActive = group.subGroups?.some((sg) =>
                  sg.items?.some((it) => it.id === activeCategory || it.slug === activeCategory)
                );
                const priorityClass = getGroupPriorityClass(gIdx);
                const barLabel = getGroupBarLabel(group);

                return (
                  <div
                    key={group.id}
                    className={`nav-dropdown-wrap nav-mega-item-wrap ${priorityClass}`}
                    onMouseEnter={() => {
                      setActiveMegaGroupId(group.id);
                    }}
                    onMouseLeave={() => setActiveMegaGroupId(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveMegaGroupId(isOpen ? null : group.id)}
                      className={`nav-item nav-mega-link ${isGroupActive ? 'active' : ''} ${isOpen ? 'menu-open' : ''}`}
                    >
                      <span className="nav-group-icon-span">{renderGroupIcon(group.id, 14)}</span>
                      <span>{barLabel}</span>
                      <ChevronDown
                        size={12}
                        className={`nav-chevron-icon ${isOpen ? 'chevron-up' : ''}`}
                      />
                    </button>

                    {/* ALERIC STYLE MULTI-COLUMN MEGA DROPDOWN PANEL */}
                    {isOpen && (
                      <div className="aleric-mega-menu-panel" role="menu">
                        {/* Mega Menu Top Header */}
                        <div className="aleric-mega-header">
                          <div className="aleric-mega-header-title">
                            <span className="aleric-header-icon">{renderGroupIcon(group.id, 18)}</span>
                            <div>
                              <h4>{isBn ? group.nameBn : group.nameEn}</h4>
                              <p>
                                {isBn
                                  ? `সম্পর্কিত সকল উপ-বিভাগ ও সংবাদ কভারেজ`
                                  : `All sections & curated topics`}
                              </p>
                            </div>
                          </div>
                          <span className="aleric-total-topics-badge">
                            {group.subGroups?.reduce((acc, curr) => acc + (curr.items?.length || 0), 0)}{' '}
                            {isBn ? 'টি বিষয়' : 'topics'}
                          </span>
                        </div>

                        {/* Mega Columns Grid (Sub-Groups) */}
                        <div
                          className="aleric-mega-columns-grid"
                          style={{
                            gridTemplateColumns: `repeat(${Math.min(group.subGroups?.length || 1, 4)}, 1fr)`
                          }}
                        >
                          {group.subGroups?.map((subGrp, sIdx) => (
                            <div key={sIdx} className="aleric-mega-col">
                              <div className="aleric-subgroup-heading">
                                <span className="aleric-subgroup-bullet"></span>
                                <h6>{isBn ? subGrp.titleBn : subGrp.titleEn}</h6>
                              </div>
                              <ul className="aleric-subgroup-list">
                                {subGrp.items?.map((item) => {
                                  const isActive = activeCategory === item.id || activeCategory === item.slug;
                                  return (
                                    <li key={item.id}>
                                      <a
                                        href={`/category/${encodeURIComponent(item.slug || item.id)}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleSelectCategory(item.id);
                                        }}
                                        className={`aleric-mega-link-item ${isActive ? 'active' : ''}`}
                                      >
                                        <span className="aleric-item-arrow">›</span>
                                        <span className="aleric-item-title">
                                          {isBn ? item.nameBn : item.nameEn}
                                        </span>
                                      </a>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Mega Menu Bottom Bar */}
                        <div className="aleric-mega-bottom-bar">
                          <div className="aleric-bottom-shortcuts">
                            <span className="aleric-bottom-hint">
                              {isBn ? 'জনগণ.নিউজ — সত্যের সাথে, জনতার পাশে' : 'Jonogon News — With Truth, For The People'}
                            </span>
                          </div>
                          <div className="aleric-bottom-right">
                            <button
                              type="button"
                              onClick={() => {
                                setActivePolicyModal('emergency');
                                setActiveMegaGroupId(null);
                              }}
                              className="aleric-bottom-link"
                              style={{ color: 'var(--primary-red)', fontWeight: 700 }}
                            >
                              🚨 {isBn ? 'জাতীয় জরুরি সেবা' : 'Emergency Services'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Item 9: Master 'আরও দেখুন' Explorer Button (130+ Categories) */}
              <div className="nav-dropdown-wrap nav-all-topics-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setAllCategoriesModalOpen(!allCategoriesModalOpen);
                    setMegaSearch('');
                  }}
                  className={`nav-item nav-all-topics-btn ${allCategoriesModalOpen ? 'active' : ''}`}
                  title={isBn ? 'সকল ১৩০+ বিভাগ এক্সপ্লোরার খুলুন' : 'Open 130+ Topics Explorer'}
                >
                  <Grid size={15} className="nav-item-icon" />
                  <span>{isBn ? 'আরও দেখুন' : 'See More'}</span>
                </button>
              </div>
            </div>

            {/* 3. RIGHT SIDE: Fixed BN/EN Toggle and Sun/Moon Theme Switcher */}
            <div className="nav-right-actions">
              {/* BN / EN Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="nav-lang-btn"
                title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
                aria-label="Toggle Language"
              >
                {isBn ? 'BN' : 'EN'}
              </button>

              {/* Dark / Light Mode Theme Switcher */}
              <button
                type="button"
                onClick={toggleTheme}
                className="nav-theme-btn"
                title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* ========================================================
          FULL-SCREEN / EXPANDED 130+ CATEGORY EXPLORER MODAL
          ======================================================== */}
      {allCategoriesModalOpen && (
        <div className="mega-explorer-overlay" onClick={() => setAllCategoriesModalOpen(false)}>
          <div className="mega-explorer-modal" onClick={(e) => e.stopPropagation()}>
            {/* Explorer Top Bar */}
            <div className="mega-explorer-topbar">
              <div className="mega-explorer-title-box">
                <Layers size={20} color="var(--primary-red)" />
                <div>
                  <h3>{isBn ? 'জনগণ.নিউজ সম্পূর্ণ বিভাগমালা (১৩০+ ক্যাটাগরি)' : 'Jonogon Complete Category Index'}</h3>
                  <p>{isBn ? '১০টি প্রধান গুচ্ছে বিভক্ত সকল বিষয় ও উপ-বিভাগ' : 'Organized into 10 Master Clusters & Sub-Groups'}</p>
                </div>
              </div>

              {/* Live Search */}
              <div className="mega-explorer-search">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  value={megaSearch}
                  onChange={(e) => setMegaSearch(e.target.value)}
                  placeholder={isBn ? 'যেকোনো বিভাগ খুঁজুন (যেমন: ক্রিকেট, কৃষি, শেয়ারবাজার)...' : 'Search any topic...'}
                  autoFocus
                />
                {megaSearch && (
                  <button type="button" onClick={() => setMegaSearch('')} className="search-clear-btn">
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setAllCategoriesModalOpen(false)}
                className="mega-explorer-close-btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Explorer Body */}
            <div className="mega-explorer-body">
              {filteredSearchCategories ? (
                /* Search Filter Results */
                <div className="mega-search-results-box">
                  <h4>
                    {isBn
                      ? `"${megaSearch}" দিয়ে ${filteredSearchCategories.length} টি বিভাগ পাওয়া গেছে`
                      : `Found ${filteredSearchCategories.length} categories matching "${megaSearch}"`}
                  </h4>
                  {filteredSearchCategories.length === 0 ? (
                    <div className="mega-search-empty">
                      <p>{isBn ? 'কোনো বিভাগ পাওয়া যায়নি।' : 'No category matched your search.'}</p>
                    </div>
                  ) : (
                    <div className="mega-search-grid">
                      {filteredSearchCategories.map((cat) => (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`mega-search-chip-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        >
                          <span>{isBn ? cat.nameBn : cat.nameEn}</span>
                          {activeCategory === cat.id && <Check size={14} style={{ marginLeft: 4 }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* 10 Master Groups Grid with Sub-Groups */
                <div className="mega-10-groups-grid">
                  {(categoryMasterGroups || []).map((grp, gIdx) => (
                    <div key={grp.id} className="mega-master-group-card">
                      <div className="mega-card-header">
                        <div className="mega-card-title-wrap">
                          <span className="mega-card-icon">{renderGroupIcon(grp.id, 16)}</span>
                          <h5>{isBn ? `${gIdx + 1}. ${grp.nameBn}` : `${gIdx + 1}. ${grp.nameEn}`}</h5>
                        </div>
                        <span className="aleric-total-topics-badge">
                          {grp.subGroups.reduce((acc, curr) => acc + curr.items.length, 0)} {isBn ? 'টি বিষয়' : 'topics'}
                        </span>
                      </div>

                      <div className="mega-card-subgroups">
                        {grp.subGroups.map((sub, sIdx) => (
                          <div key={sIdx} className="mega-card-subgroup-block">
                            <span className="mega-subgroup-label">{isBn ? sub.titleBn : sub.titleEn}</span>
                            <div className="mega-subgroup-chips">
                              {sub.items.map((it) => (
                                <button
                                  type="button"
                                  key={it.id}
                                  onClick={() => handleSelectCategory(it.id)}
                                  className={`mega-chip-item ${activeCategory === it.id ? 'active' : ''}`}
                                >
                                  <span>{isBn ? it.nameBn : it.nameEn}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ALERIC STYLE MOBILE OFFCANVAS SIDEBAR MENU
          ======================================================== */}
      {mobileMenuOpen && (
        <div className="aleric-offcanvas-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="aleric-offcanvas-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Aleric Drawer Header */}
            <div className="aleric-drawer-header">
              <div className="aleric-drawer-brand-wrap">
                <span className="aleric-drawer-logo-title">{settings.siteNameBn || 'জনগণ.নিউজ'}</span>
                <span className="aleric-drawer-slogan">{settings.sloganBn || 'সত্যের সাথে, জনতার পাশে'}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="aleric-drawer-close-btn"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Aleric Drawer Body */}
            <div className="aleric-drawer-body">
              {/* Instant Search Bar */}
              <div className="aleric-drawer-search-wrap">
                <Search size={15} className="drawer-search-icon" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder={isBn ? 'বিভাগ খুঁজুন (১৩০+ বিষয়)...' : 'Search 130+ topics...'}
                  className="aleric-drawer-search-input"
                />
                {drawerSearch && (
                  <button
                    type="button"
                    onClick={() => setDrawerSearch('')}
                    className="drawer-search-clear-btn"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Search Results in Drawer */}
              {filteredSearchCategories ? (
                <div className="aleric-drawer-search-results">
                  <div className="drawer-results-title">
                    <span>
                      {isBn
                        ? `ফলাফল (${filteredSearchCategories.length} টি বিভাগ)`
                        : `Results (${filteredSearchCategories.length} categories)`}
                    </span>
                  </div>
                  {filteredSearchCategories.length === 0 ? (
                    <div className="aleric-no-results">
                      <p>{isBn ? 'কোনো বিভাগ পাওয়া যায়নি।' : 'No category matched.'}</p>
                    </div>
                  ) : (
                    <div className="aleric-results-list">
                      {filteredSearchCategories.map((cat) => (
                        <button
                          type="button"
                          key={`drw-res-${cat.id}`}
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`aleric-result-item ${activeCategory === cat.id ? 'active' : ''}`}
                        >
                          <span>{isBn ? cat.nameBn : cat.nameEn}</span>
                          <ChevronRight size={14} opacity={0.6} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Primary Aleric Navigation Menu Tree */
                <nav className="aleric-mobile-nav-tree">
                  {/* Home Link */}
                  <div className="aleric-nav-tree-item">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('latest')}
                      className={`aleric-tree-link ${activeCategory === 'latest' ? 'active' : ''}`}
                    >
                      <span className="tree-icon"><Home size={16} /></span>
                      <span className="tree-text">{isBn ? 'প্রচ্ছদ ও সর্বশেষ' : 'Home / Latest'}</span>
                    </button>
                  </div>

                  {/* 10 Master Category Groups with Smooth +/- Submenu Toggles */}
                  {(categoryMasterGroups || []).map((grp) => {
                    const isExpanded = expandedDrawerGroups[grp.id] ?? false;
                    const isGroupActive = grp.subGroups.some((sg) =>
                      sg.items.some((it) => it.id === activeCategory)
                    );

                    return (
                      <div key={grp.id} className={`aleric-nav-tree-item ${isExpanded ? 'expanded' : ''}`}>
                        <div className="aleric-tree-header-row">
                          <button
                            type="button"
                            onClick={() => toggleDrawerGroup(grp.id)}
                            className={`aleric-tree-link ${isGroupActive ? 'active' : ''}`}
                          >
                            <span className="tree-icon">{renderGroupIcon(grp.id, 16)}</span>
                            <span className="tree-text">{isBn ? grp.nameBn : grp.nameEn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleDrawerGroup(grp.id)}
                            className="aleric-tree-toggle-btn"
                            aria-label="Toggle subcategories"
                          >
                            {isExpanded ? <Minus size={15} /> : <Plus size={15} />}
                          </button>
                        </div>

                        {/* Expandable Sub-Groups & Categories */}
                        {isExpanded && (
                          <div className="aleric-tree-subgroup-box">
                            {grp.subGroups.map((sub, sIdx) => (
                              <div key={sIdx} className="aleric-tree-subgroup-section">
                                <div className="aleric-tree-subgroup-title">
                                  <span>{isBn ? sub.titleBn : sub.titleEn}</span>
                                </div>
                                <div className="aleric-tree-category-grid">
                                  {sub.items.map((it) => (
                                    <button
                                      type="button"
                                      key={it.id}
                                      onClick={() => handleSelectCategory(it.id)}
                                      className={`aleric-tree-sub-link ${activeCategory === it.id ? 'active' : ''}`}
                                    >
                                      <span className="sub-bullet">›</span>
                                      <span>{isBn ? it.nameBn : it.nameEn}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Podcasts Submenu */}
                  <div className={`aleric-nav-tree-item ${expandedDrawerGroups['podcasts'] ? 'expanded' : ''}`}>
                    <div className="aleric-tree-header-row">
                      <button
                        type="button"
                        onClick={() => toggleDrawerGroup('podcasts')}
                        className={`aleric-tree-link ${selectedPodcastSubject !== 'all' ? 'active' : ''}`}
                      >
                        <span className="tree-icon"><Mic size={16} color="var(--primary-red)" /></span>
                        <span className="tree-text">{isBn ? 'আমাদের পডকাস্ট' : 'Jonogon Podcasts'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDrawerGroup('podcasts')}
                        className="aleric-tree-toggle-btn"
                      >
                        {expandedDrawerGroups['podcasts'] ? <Minus size={15} /> : <Plus size={15} />}
                      </button>
                    </div>

                    {expandedDrawerGroups['podcasts'] && (
                      <div className="aleric-tree-subgroup-box">
                        <div className="aleric-tree-category-grid">
                          <button
                            type="button"
                            onClick={() => handleSelectPodcastSubject('all')}
                            className={`aleric-tree-sub-link ${selectedPodcastSubject === 'all' ? 'active' : ''}`}
                          >
                            <span className="sub-bullet">›</span>
                            <span>{isBn ? 'সব পর্ব শুনুন' : 'All Episodes'}</span>
                          </button>
                          {podcastSubjects.map((sub) => (
                            <button
                              type="button"
                              key={`drw-pod-${sub.id}`}
                              onClick={() => handleSelectPodcastSubject(sub.id)}
                              className={`aleric-tree-sub-link ${selectedPodcastSubject === sub.id ? 'active' : ''}`}
                            >
                              <span className="sub-bullet">›</span>
                              <span>{isBn ? sub.nameBn : sub.nameEn}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Emergency Service Direct Item */}
                  <div className="aleric-nav-tree-item">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePolicyModal('emergency');
                        setMobileMenuOpen(false);
                      }}
                      className="aleric-tree-link aleric-emergency-tree-link"
                    >
                      <span className="tree-icon">🚨</span>
                      <span className="tree-text">{isBn ? 'জাতীয় জরুরি সেবা ও হটলাইন' : 'National Emergency Services'}</span>
                    </button>
                  </div>
                </nav>
              )}

              {/* District Selector Card */}
              <div className="aleric-drawer-district-box">
                <label className="aleric-drawer-label">
                  <LocationPin size={14} color="var(--primary-red)" />
                  <span>{isBn ? 'আপনার জেলা নির্বাচন করুন' : 'Select District'}</span>
                </label>
                <select
                  value={userDistrict}
                  onChange={(e) => setUserDistrict(e.target.value)}
                  className="aleric-drawer-select"
                >
                  {bangladeshDistricts.map((div) => (
                    <optgroup key={div.divisionEn} label={isBn ? div.divisionBn : div.divisionEn}>
                      {div.districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {isBn ? d.nameBn : d.nameEn}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Aleric Contact & Info Section (Bottom of Drawer) */}
              <div className="aleric-drawer-info-card">
                <div className="aleric-info-heading">
                  <Info size={14} color="var(--primary-red)" />
                  <span>{isBn ? 'যোগাযোগ ও সম্পাদকীয় তথ্য' : 'Contact & Info'}</span>
                </div>

                <div className="aleric-info-details">
                  <div className="aleric-info-item">
                    <LocationPin size={13} className="info-icon" />
                    <span>{settings.address || 'House 101, Alia Madrasa Road, Faydabad, Dakshinkhan, Dhaka-1230'}</span>
                  </div>
                  <div className="aleric-info-item">
                    <Phone size={13} className="info-icon" />
                    <span>{settings.phone || '01936618534'}</span>
                  </div>
                  <div className="aleric-info-item">
                    <Mail size={13} className="info-icon" />
                    <span>{settings.email || 'brandbiplob1234@gmail.com'}</span>
                  </div>
                </div>

                {/* Quick Policy Links */}
                <div className="aleric-drawer-quick-links">
                  <a
                    href="/about"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/about');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
                  </a>
                  <span className="dot">•</span>
                  <a
                    href="/advertisement"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/advertisement');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {isBn ? 'বিজ্ঞাপন' : 'Advertise'}
                  </a>
                  <span className="dot">•</span>
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/contact');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {isBn ? 'যোগাযোগ' : 'Contact'}
                  </a>
                </div>

                {/* Social Channels */}
                <div className="aleric-drawer-socials">
                  {settings.facebook && (
                    <a
                      href={settings.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aleric-social-btn"
                      title="Facebook"
                    >
                      <FacebookIcon size={14} />
                    </a>
                  )}
                  {settings.youtube && (
                    <a
                      href={settings.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aleric-social-btn"
                      title="YouTube"
                    >
                      <YoutubeIcon size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
