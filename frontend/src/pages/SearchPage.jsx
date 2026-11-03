import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNews } from '../context/NewsContext';
import { updateSEO } from '../services/seoService';
import { bangladeshDistricts } from '../data/initialData';
import AdSenseSlot from '../components/Ads/AdSenseSlot';

// Search Scope Definition with FontAwesome vector icons (strictly NO emojis)
const SCOPE_OPTIONS = [
  {
    id: 'all',
    labelBn: 'সব ফিল্ডে খুঁজুন',
    labelEn: 'Search All Fields',
    faIcon: 'fa-solid fa-magnifying-glass'
  },
  {
    id: 'title',
    labelBn: 'শুধুমাত্র শিরোনাম',
    labelEn: 'In Headlines Only',
    faIcon: 'fa-solid fa-newspaper'
  },
  {
    id: 'content',
    labelBn: 'প্রতিবেদনের বিস্তারিত',
    labelEn: 'In Article Content',
    faIcon: 'fa-solid fa-align-left'
  },
  {
    id: 'reporter',
    labelBn: 'লেখক / প্রতিবেদক',
    labelEn: 'By Reporter / Author',
    faIcon: 'fa-solid fa-user-pen'
  }
];

export default function SearchPage() {
  const {
    articles,
    categories,
    categoryMasterGroups,
    openArticle,
    goToHome,
    language,
    searchQuery,
    setSearchQuery,
    isArticlesLoading
  } = useNews();

  const isBn = language === 'bn';

  // Local filter states
  const [keyword, setKeyword] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('q') || p.get('query') || searchQuery || '';
    }
    return searchQuery || '';
  });

  const [searchScope, setSearchScope] = useState('all'); // 'all' | 'title' | 'content' | 'reporter'
  const [isScopeMenuOpen, setIsScopeMenuOpen] = useState(false);
  const scopeDropdownRef = useRef(null);

  const [selectedMasterGroup, setSelectedMasterGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [datePreset, setDatePreset] = useState('all'); // 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [contentType, setContentType] = useState('all'); // 'all' | 'with_image' | 'with_video' | 'breaking' | 'lead'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'popular' | 'relevance'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Close scope dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(e.target)) {
        setIsScopeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync keyword if global searchQuery changes externally
  useEffect(() => {
    if (searchQuery && searchQuery !== keyword) {
      setKeyword(searchQuery);
    }
  }, [searchQuery]);

  // Update SEO Meta Tags
  useEffect(() => {
    const pageTitle = keyword.trim()
      ? (isBn ? `"${keyword}" — সংবাদ অনুসন্ধান | জনগণ.নিউজ` : `Search: "${keyword}" — Jonogon News`)
      : (isBn ? 'সংবাদ অনুসন্ধান ও বিস্তারিত ফিল্টার | জনগণ.নিউজ' : 'Advanced News Search & Filter | Jonogon News');

    updateSEO({
      title: pageTitle,
      description: isBn
        ? 'জনগণ.নিউজ-এর সকল বিভাগের সংবাদ তাৎক্ষণিক অনুসন্ধান ও নির্দিষ্ট ফিল্টারিং করুন।'
        : 'Search and filter verified news across all categories on Jonogon News.',
      url: typeof window !== 'undefined' ? window.location.href : '',
      type: 'website'
    });
  }, [keyword, isBn]);

  // Sync active search params to URL for shareable links
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (selectedCategory !== 'all') params.set('cat', selectedCategory);
    if (selectedDistrict !== 'all') params.set('district', selectedDistrict);
    if (datePreset !== 'all') params.set('date', datePreset);
    if (sortBy !== 'newest') params.set('sort', sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `/search?${queryString}` : '/search';
    window.history.replaceState({ page: 'search' }, '', newUrl);
  }, [keyword, selectedCategory, selectedDistrict, datePreset, sortBy]);

  // Flatten Bangladesh districts list
  const allDistricts = useMemo(() => {
    return (bangladeshDistricts || []).flatMap((div) =>
      (div.districts || []).map((d) => ({
        ...d,
        divisionBn: div.divisionBn,
        divisionEn: div.divisionEn
      }))
    );
  }, []);

  // Filter available districts when a specific division is selected
  const availableDistricts = useMemo(() => {
    if (selectedDivision === 'all') return allDistricts;
    const targetDiv = (bangladeshDistricts || []).find((div) => {
      const dNameBn = div.divisionBn.toLowerCase();
      const dNameEn = div.divisionEn.toLowerCase();
      const sel = selectedDivision.toLowerCase();
      return dNameBn.includes(sel) || dNameEn.includes(sel);
    });
    return targetDiv?.districts || allDistricts;
  }, [selectedDivision, allDistricts]);

  // Filter available categories when a specific Master Group is selected
  const availableCategories = useMemo(() => {
    if (selectedMasterGroup === 'all') return categories || [];
    const group = (categoryMasterGroups || []).find((g) => g.id === selectedMasterGroup);
    if (!group) return categories || [];

    // Collect direct sub-group items
    const directItems = (group.subGroups || []).flatMap((sg) => sg.items || []);
    if (directItems.length > 0) {
      return directItems;
    }

    const groupCatIds = new Set();
    (group.subGroups || []).forEach((sg) => {
      (sg.items || []).forEach((it) => {
        if (it.id) groupCatIds.add(String(it.id).toLowerCase());
        if (it.slug) groupCatIds.add(String(it.slug).toLowerCase());
      });
    });

    return (categories || []).filter((c) =>
      groupCatIds.has(String(c.id).toLowerCase()) ||
      groupCatIds.has(String(c.slug).toLowerCase()) ||
      groupCatIds.has(String(c.nameBn || '').toLowerCase())
    );
  }, [selectedMasterGroup, categoryMasterGroups, categories]);

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (keyword.trim()) count++;
    if (searchScope !== 'all') count++;
    if (selectedMasterGroup !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (datePreset !== 'all') count++;
    if (selectedDivision !== 'all') count++;
    if (selectedDistrict !== 'all') count++;
    if (contentType !== 'all') count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [
    keyword,
    searchScope,
    selectedMasterGroup,
    selectedCategory,
    datePreset,
    selectedDivision,
    selectedDistrict,
    contentType,
    sortBy
  ]);

  // Reset all filters in 1 click
  const handleResetFilters = () => {
    setKeyword('');
    setSearchQuery('');
    setSearchScope('all');
    setSelectedMasterGroup('all');
    setSelectedCategory('all');
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSelectedDivision('all');
    setSelectedDistrict('all');
    setContentType('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Hard Multi-dimensional Filtering Logic
  const filteredArticles = useMemo(() => {
    const term = keyword.trim().toLowerCase();

    const results = (articles || []).filter((art) => {
      // 1. Strict status check: only published or approved news
      if (art.status && art.status !== 'published' && art.status !== 'approved') {
        return false;
      }

      // 2. Keyword & Scope Filter
      if (term) {
        const titleBn = String(art.titleBn || art.title || '').toLowerCase();
        const titleEn = String(art.titleEn || '').toLowerCase();
        const excerptBn = String(art.excerptBn || art.excerpt || '').toLowerCase();
        const excerptEn = String(art.excerptEn || '').toLowerCase();
        const contentBn = String(art.contentBn || art.content || '').toLowerCase();
        const contentEn = String(art.contentEn || '').toLowerCase();
        const reporter = String(art.reporter || art.author || art.reporter_name || '').toLowerCase();
        const tags = String(art.tags || '').toLowerCase();
        const kicker = String(art.kicker || '').toLowerCase();
        const subtitle = String(art.subtitle || '').toLowerCase();

        if (searchScope === 'title') {
          if (!titleBn.includes(term) && !titleEn.includes(term) && !kicker.includes(term) && !subtitle.includes(term)) {
            return false;
          }
        } else if (searchScope === 'content') {
          if (!contentBn.includes(term) && !contentEn.includes(term) && !excerptBn.includes(term) && !excerptEn.includes(term)) {
            return false;
          }
        } else if (searchScope === 'reporter') {
          if (!reporter.includes(term)) {
            return false;
          }
        } else {
          // 'all' scope: matches anywhere
          const matchesAny =
            titleBn.includes(term) ||
            titleEn.includes(term) ||
            excerptBn.includes(term) ||
            excerptEn.includes(term) ||
            contentBn.includes(term) ||
            contentEn.includes(term) ||
            reporter.includes(term) ||
            tags.includes(term) ||
            kicker.includes(term) ||
            subtitle.includes(term);

          if (!matchesAny) return false;
        }
      }

      // 3. Category & Master Group Filter
      if (selectedCategory !== 'all') {
        const artCat = String(art.category || art.categoryId || '').toLowerCase().trim();
        const artCatBn = String(art.categoryBn || '').toLowerCase().trim();
        const artCategories = Array.isArray(art.categories)
          ? art.categories.map((c) => String(c).toLowerCase().trim())
          : [];
        const targetCat = String(selectedCategory).toLowerCase().trim();

        const matchesCat =
          artCat === targetCat ||
          artCatBn === targetCat ||
          artCategories.includes(targetCat);

        if (!matchesCat) return false;
      } else if (selectedMasterGroup !== 'all') {
        const group = (categoryMasterGroups || []).find((g) => g.id === selectedMasterGroup);
        if (group && Array.isArray(group.subGroups)) {
          const groupCatKeys = new Set();
          group.subGroups.forEach((sg) => {
            (sg.items || []).forEach((it) => {
              if (it.id) groupCatKeys.add(String(it.id).toLowerCase());
              if (it.slug) groupCatKeys.add(String(it.slug).toLowerCase());
              if (it.nameBn) groupCatKeys.add(String(it.nameBn).toLowerCase());
            });
          });

          const artCat = String(art.category || art.categoryId || '').toLowerCase().trim();
          const artCatBn = String(art.categoryBn || '').toLowerCase().trim();
          const artCategories = Array.isArray(art.categories)
            ? art.categories.map((c) => String(c).toLowerCase().trim())
            : [];

          const matchesMaster =
            groupCatKeys.has(artCat) ||
            groupCatKeys.has(artCatBn) ||
            artCategories.some((c) => groupCatKeys.has(c));

          if (!matchesMaster) return false;
        }
      }

      // 4. Date Filter
      if (datePreset !== 'all') {
        const rawDate = art.publishedAt || art.published_at || art.createdAt || art.created_at;
        const artDate = new Date(rawDate || 0);
        const artTime = artDate.getTime();

        if (isNaN(artTime) || artTime === 0) {
          if (datePreset === 'custom') return false;
        } else {
          const now = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;

          if (datePreset === 'today') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            if (artTime < todayStart.getTime()) return false;
          } else if (datePreset === 'yesterday') {
            const yesterdayStart = new Date(now - oneDayMs);
            yesterdayStart.setHours(0, 0, 0, 0);
            const yesterdayEnd = new Date(yesterdayStart.getTime() + oneDayMs);
            if (artTime < yesterdayStart.getTime() || artTime >= yesterdayEnd.getTime()) return false;
          } else if (datePreset === '7days') {
            if (artTime < now - 7 * oneDayMs) return false;
          } else if (datePreset === '30days') {
            if (artTime < now - 30 * oneDayMs) return false;
          } else if (datePreset === 'month') {
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            if (artTime < monthStart.getTime()) return false;
          } else if (datePreset === 'custom') {
            if (customStartDate) {
              const startLimit = new Date(customStartDate).setHours(0, 0, 0, 0);
              if (artTime < startLimit) return false;
            }
            if (customEndDate) {
              const endLimit = new Date(customEndDate).setHours(23, 59, 59, 999);
              if (artTime > endLimit) return false;
            }
          }
        }
      }

      // 5. Geographic Filter (Division & District)
      if (selectedDistrict !== 'all') {
        const artDist = String(art.district || '').toLowerCase().trim();
        const targetDist = String(selectedDistrict).toLowerCase().trim();
        const distObj = allDistricts.find((d) => d.id === targetDist);
        const matchesDistrict =
          artDist === targetDist ||
          (distObj && (artDist === distObj.nameBn.toLowerCase() || artDist === distObj.nameEn.toLowerCase()));

        if (!matchesDistrict) return false;
      } else if (selectedDivision !== 'all') {
        const artDiv = String(art.division || '').toLowerCase().trim();
        const artDist = String(art.district || '').toLowerCase().trim();
        const targetDiv = (bangladeshDistricts || []).find((div) => {
          const dNameBn = div.divisionBn.toLowerCase();
          const dNameEn = div.divisionEn.toLowerCase();
          const sel = selectedDivision.toLowerCase();
          return dNameBn.includes(sel) || dNameEn.includes(sel);
        });

        if (targetDiv) {
          const divDistNames = (targetDiv.districts || []).flatMap((d) => [
            d.id.toLowerCase(),
            d.nameBn.toLowerCase(),
            d.nameEn.toLowerCase()
          ]);
          const matchesDivision =
            artDiv.includes(targetDiv.divisionBn.toLowerCase()) ||
            artDiv.includes(targetDiv.divisionEn.toLowerCase()) ||
            divDistNames.includes(artDist);

          if (!matchesDivision) return false;
        }
      }

      // 6. Content & Media Type Filter
      if (contentType === 'with_image') {
        const hasImg = !!(art.imageUrl || art.featuredImage || art.thumbnail_image || art.featured_image);
        if (!hasImg) return false;
      } else if (contentType === 'with_video') {
        const hasVid = !!(art.is_video || art.isVideo || art.videoUrl || art.youtube_url);
        if (!hasVid) return false;
      } else if (contentType === 'breaking') {
        const isBreaking = !!(art.is_breaking || art.isBreaking);
        if (!isBreaking) return false;
      } else if (contentType === 'lead') {
        const isLead = !!(art.is_lead || art.is_lead_hero || art.isLeadHero);
        if (!isLead) return false;
      }

      return true;
    });

    // 7. Sort Order
    results.sort((a, b) => {
      if (sortBy === 'oldest') {
        const dateA = new Date(a.publishedAt || a.published_at || a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.publishedAt || b.published_at || b.createdAt || b.created_at || 0).getTime();
        return dateA - dateB;
      }
      if (sortBy === 'popular') {
        const viewsA = parseInt(a.views || 0, 10) || 0;
        const viewsB = parseInt(b.views || 0, 10) || 0;
        return viewsB - viewsA;
      }
      if (sortBy === 'relevance' && term) {
        const score = (item) => {
          let s = 0;
          const t = term.toLowerCase();
          const title = String(item.titleBn || item.title || item.titleEn || '').toLowerCase();
          const excerpt = String(item.excerptBn || item.excerpt || item.excerptEn || '').toLowerCase();
          const tags = String(item.tags || '').toLowerCase();
          if (title.includes(t)) s += 10;
          if (tags.includes(t)) s += 5;
          if (excerpt.includes(t)) s += 2;
          return s;
        };
        return score(b) - score(a);
      }
      const dateA = new Date(a.publishedAt || a.published_at || a.createdAt || a.created_at || 0).getTime();
      const dateB = new Date(b.publishedAt || b.published_at || b.createdAt || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return results;
  }, [
    articles,
    keyword,
    searchScope,
    selectedCategory,
    selectedMasterGroup,
    datePreset,
    customStartDate,
    customEndDate,
    selectedDivision,
    selectedDistrict,
    contentType,
    sortBy,
    categoryMasterGroups,
    allDistricts
  ]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    keyword,
    searchScope,
    selectedCategory,
    selectedMasterGroup,
    datePreset,
    customStartDate,
    customEndDate,
    selectedDivision,
    selectedDistrict,
    contentType,
    sortBy,
    itemsPerPage
  ]);

  // Paginated articles
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const paginatedArticles = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredArticles.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredArticles, currentPage, itemsPerPage]);

  const activeScopeObj = SCOPE_OPTIONS.find((o) => o.id === searchScope) || SCOPE_OPTIONS[0];

  return (
    <div className="search-page-wrapper" style={{ padding: '24px 0 60px 0', minHeight: '80vh' }}>
      <div className="container">
        {/* 1. Breadcrumb Navigation */}
        <nav className="page-breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 16 }}>
          <button onClick={goToHome} className="breadcrumb-link" type="button">
            {isBn ? 'প্রচ্ছদ' : 'Home'}
          </button>
          <i className="fa-solid fa-chevron-right breadcrumb-separator" style={{ fontSize: 10, color: 'var(--text-muted)' }} />
          <span className="breadcrumb-current">{isBn ? 'সংবাদ অনুসন্ধান' : 'News Search'}</span>
        </nav>

        {/* 2. Page Header & Large Search Form */}
        <div
          className="search-hero-box"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: '24px 28px',
            marginBottom: 24,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 6,
                backgroundColor: 'var(--primary-red)',
                color: 'var(--white)'
              }}
            >
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '1.05rem' }} />
            </span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {isBn ? 'উন্নত সংবাদ অনুসন্ধান ও ফিল্টারিং' : 'Advanced News Search & Deep Filter'}
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isBn
                  ? 'শিরোনাম, বিষয়, তারিখ, বিভাগ, জেলা ও মিডিয়ার ধরন অনুযায়ী সুনির্দিষ্ট সংবাদ খুঁজুন'
                  : 'Pinpoint news precisely by keyword, topic, timeframe, division, district, and media type'}
              </p>
            </div>
          </div>

          {/* Primary Search Input & Custom Scope Dropdown (NO raw emojis, FontAwesome vector icons) */}
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'stretch',
              marginTop: 16
            }}
          >
            {/* Main Input */}
            <div
              style={{
                flex: '1 1 340px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: 14,
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                  fontSize: '0.95rem'
                }}
              />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={isBn ? 'সংবাদের যেকোনো কীওয়ার্ড লিখুন (যেমন: বাজেট, নির্বাচন, ক্রিকেট)...' : 'Type any search keywords...'}
                style={{
                  width: '100%',
                  padding: '12px 38px 12px 40px',
                  borderRadius: 6,
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontSize: '0.96rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary-red)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  title={isBn ? 'মুছে ফেলুন' : 'Clear search'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <i className="fa-solid fa-xmark" style={{ fontSize: '0.9rem' }} />
                </button>
              )}
            </div>

            {/* Custom Scope Dropdown: 100% visible text, FontAwesome icons, ZERO raw emojis */}
            <div ref={scopeDropdownRef} className="search-scope-dropdown-container">
              <button
                type="button"
                onClick={() => setIsScopeMenuOpen(!isScopeMenuOpen)}
                className="search-scope-trigger-btn"
                aria-expanded={isScopeMenuOpen}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 46,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                  <i className={activeScopeObj.faIcon} style={{ color: 'var(--primary-red)', width: 16, fontSize: '0.95rem' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {isBn ? activeScopeObj.labelBn : activeScopeObj.labelEn}
                  </span>
                </span>
                <i
                  className="fa-solid fa-chevron-down"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    transition: 'transform var(--transition-fast)',
                    transform: isScopeMenuOpen ? 'rotate(180deg)' : 'none'
                  }}
                />
              </button>

              {/* Scope Dropdown Menu */}
              {isScopeMenuOpen && (
                <div
                  className="search-scope-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    left: 0,
                    zIndex: 1000,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    boxShadow: 'var(--shadow-md)',
                    overflow: 'hidden',
                    padding: '4px 0'
                  }}
                >
                  {SCOPE_OPTIONS.map((opt) => {
                    const isSelected = opt.id === searchScope;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSearchScope(opt.id);
                          setIsScopeMenuOpen(false);
                        }}
                        className={`search-scope-item ${isSelected ? 'active' : ''}`}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          border: 'none',
                          backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                          color: isSelected ? 'var(--primary-red)' : 'var(--text-main)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.88rem',
                          fontWeight: isSelected ? 700 : 500,
                          transition: 'background-color var(--transition-fast), color var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          <i
                            className={opt.faIcon}
                            style={{
                              color: isSelected ? 'var(--primary-red)' : 'var(--text-muted)',
                              width: 16,
                              fontSize: '0.95rem'
                            }}
                          />
                          <span style={{ color: isSelected ? 'var(--primary-red)' : 'var(--text-main)' }}>
                            {isBn ? opt.labelBn : opt.labelEn}
                          </span>
                        </span>
                        {isSelected && (
                          <i className="fa-solid fa-check" style={{ color: 'var(--primary-red)', fontSize: '0.85rem' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              className="search-mobile-filter-btn"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 6,
                backgroundColor: activeFilterCount > 0 ? 'var(--primary-red)' : 'var(--bg-body)',
                color: activeFilterCount > 0 ? 'var(--white)' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <i className="fa-solid fa-sliders" />
              <span>{isBn ? 'ফিল্টারসমূহ' : 'Filters'}</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    backgroundColor: activeFilterCount > 0 ? 'rgba(255, 255, 255, 0.3)' : 'var(--primary-red)',
                    color: 'var(--white)',
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                    borderRadius: 10
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>
        </div>

        {/* 3. Main Search Grid Layout: Sticky Filter Sidebar (Left) + Results Feed (Right) */}
        <div
          className="search-main-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '290px 1fr',
            gap: 24,
            alignItems: 'start'
          }}
        >
          {/* ==================== LEFT FILTER SIDEBAR ==================== */}
          <aside
            className={`search-filter-sidebar ${isMobileFilterOpen ? 'mobile-open' : ''}`}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: 20,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Sidebar Top Title & Reset */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 14,
                borderBottom: '1px solid var(--border-color)',
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                <i className="fa-solid fa-sliders" style={{ color: 'var(--primary-red)' }} />
                <span>{isBn ? 'ফিল্টারসমূহ' : 'Refine Filters'}</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title={isBn ? 'সব ফিল্টার মুছুন' : 'Reset all filters'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-red)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <i className="fa-solid fa-rotate-left" style={{ fontSize: '0.8rem' }} />
                  <span>{isBn ? 'রিসেট' : 'Reset'}</span>
                </button>
              )}
            </div>

            {/* FILTER 1: Master Group & Category (100% visible options) */}
            <div className="filter-group-block" style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  color: 'var(--text-main)',
                  marginBottom: 8
                }}
              >
                <i className="fa-solid fa-layer-group" style={{ color: 'var(--primary-red)', fontSize: '0.85rem' }} />
                <span>{isBn ? 'মূল বিভাগ / গ্রুপ' : 'Master Group'}</span>
              </label>
              <select
                value={selectedMasterGroup}
                onChange={(e) => {
                  setSelectedMasterGroup(e.target.value);
                  setSelectedCategory('all');
                }}
                className="search-select"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  outline: 'none',
                  marginBottom: 8,
                  cursor: 'pointer'
                }}
              >
                <option value="all">{isBn ? 'সকল মূল গ্রুপ' : 'All Master Groups'}</option>
                {(categoryMasterGroups || []).map((grp) => {
                  const grpTitle = isBn ? (grp.nameBn || grp.titleBn || grp.name) : (grp.nameEn || grp.titleEn || grp.id);
                  return (
                    <option key={grp.id} value={grp.id}>
                      {grpTitle}
                    </option>
                  );
                })}
              </select>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  color: 'var(--text-main)',
                  marginBottom: 8,
                  marginTop: 10
                }}
              >
                <i className="fa-solid fa-tags" style={{ color: 'var(--primary-red)', fontSize: '0.85rem' }} />
                <span>{isBn ? 'নির্দিষ্ট ক্যাটাগরি' : 'Specific Category'}</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="search-select"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">{isBn ? 'সকল ক্যাটাগরি (১৩০+ বিষয়)' : 'All 130+ Topics'}</option>
                {availableCategories.map((cat) => {
                  const catTitle = isBn ? (cat.nameBn || cat.name) : (cat.nameEn || cat.slug || cat.id);
                  return (
                    <option key={cat.id || cat.slug} value={cat.id || cat.slug}>
                      {catTitle}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* FILTER 2: Timeline & Date */}
            <div
              className="filter-group-block"
              style={{
                marginBottom: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border-color)'
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  color: 'var(--text-main)',
                  marginBottom: 10
                }}
              >
                <i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary-red)', fontSize: '0.85rem' }} />
                <span>{isBn ? 'প্রকাশের সময়সীমা' : 'Published Date Range'}</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                {[
                  { id: 'all', bn: 'সব সময়', en: 'All Time' },
                  { id: 'today', bn: 'আজকের', en: 'Today' },
                  { id: 'yesterday', bn: 'গতকাল', en: 'Yesterday' },
                  { id: '7days', bn: 'গত ৭ দিন', en: 'Last 7 Days' },
                  { id: '30days', bn: 'গত ৩০ দিন', en: 'Last 30 Days' },
                  { id: 'custom', bn: 'কাস্টম রেঞ্জ', en: 'Custom' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setDatePreset(preset.id)}
                    style={{
                      padding: '6px 8px',
                      fontSize: '0.78rem',
                      borderRadius: 4,
                      border: datePreset === preset.id ? '1px solid var(--primary-red)' : '1px solid var(--border-color)',
                      backgroundColor: datePreset === preset.id ? 'var(--primary-red)' : 'var(--bg-body)',
                      color: datePreset === preset.id ? 'var(--white)' : 'var(--text-main)',
                      fontWeight: datePreset === preset.id ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {isBn ? preset.bn : preset.en}
                  </button>
                ))}
              </div>

              {datePreset === 'custom' && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: 10,
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    marginTop: 6
                  }}
                >
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isBn ? 'শুরুর তারিখ:' : 'From:'}</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '0.8rem',
                        borderRadius: 4,
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-body)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isBn ? 'শেষ তারিখ:' : 'To:'}</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '0.8rem',
                        borderRadius: 4,
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-body)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* FILTER 3: Geographic Location (Bangladesh Division & District) */}
            <div
              className="filter-group-block"
              style={{
                marginBottom: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border-color)'
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  color: 'var(--text-main)',
                  marginBottom: 8
                }}
              >
                <i className="fa-solid fa-map-location-dot" style={{ color: 'var(--primary-red)', fontSize: '0.85rem' }} />
                <span>{isBn ? 'বিভাগ নির্বাচন' : 'Division'}</span>
              </label>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedDistrict('all');
                }}
                className="search-select"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  outline: 'none',
                  marginBottom: 8,
                  cursor: 'pointer'
                }}
              >
                <option value="all">{isBn ? 'সারাদেশ (সকল বিভাগ)' : 'All Bangladesh'}</option>
                {(bangladeshDistricts || []).map((div) => (
                  <option key={div.divisionEn} value={div.divisionEn}>
                    {isBn ? div.divisionBn : div.divisionEn}
                  </option>
                ))}
              </select>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  color: 'var(--text-main)',
                  marginBottom: 8,
                  marginTop: 10
                }}
              >
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary-red)', fontSize: '0.85rem' }} />
                <span>{isBn ? 'জেলা নির্বাচন (৬৪ জেলা)' : 'District'}</span>
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="search-select"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">{isBn ? 'সকল জেলা' : 'All Districts'}</option>
                {availableDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {isBn ? dist.nameBn : dist.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* FILTER 4: Content & Media Type (FontAwesome Vector Icons) */}
            <div
              className="filter-group-block"
              style={{
                marginBottom: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border-color)'
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  color: 'var(--text-main)',
                  marginBottom: 10
                }}
              >
                <i className="fa-solid fa-photo-film" style={{ color: 'var(--primary-red)', fontSize: '0.85rem' }} />
                <span>{isBn ? 'মিডিয়া ও সংবাদ টাইপ' : 'Media & Content Type'}</span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { id: 'all', labelBn: 'সকল সংবাদ', labelEn: 'All Articles', faIcon: 'fa-solid fa-file-lines' },
                  { id: 'with_image', labelBn: 'ছবিযুক্ত সংবাদ', labelEn: 'With Photo', faIcon: 'fa-solid fa-image' },
                  { id: 'with_video', labelBn: 'ভিডিও সংবাদ', labelEn: 'Video News', faIcon: 'fa-solid fa-video' },
                  { id: 'breaking', labelBn: 'ব্রেকিং নিউজ', labelEn: 'Breaking News', faIcon: 'fa-solid fa-bolt' },
                  { id: 'lead', labelBn: 'প্রধান শিরোনাম', labelEn: 'Lead Story', faIcon: 'fa-solid fa-star' }
                ].map((type) => {
                  const isChecked = contentType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setContentType(type.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 6,
                        border: isChecked ? '1px solid var(--primary-red)' : '1px solid var(--border-color)',
                        backgroundColor: isChecked ? 'var(--bg-subtle)' : 'var(--bg-body)',
                        color: isChecked ? 'var(--primary-red)' : 'var(--text-main)',
                        fontWeight: isChecked ? 600 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <i className={type.faIcon} style={{ color: isChecked ? 'var(--primary-red)' : 'var(--text-muted)', width: 15 }} />
                      <span style={{ flex: 1 }}>{isBn ? type.labelBn : type.labelEn}</span>
                      {isChecked && <i className="fa-solid fa-check" style={{ color: 'var(--primary-red)', fontSize: '0.82rem' }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Drawer Close Button */}
            {isMobileFilterOpen && (
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  backgroundColor: 'var(--primary-red)',
                  color: 'var(--white)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: 10
                }}
              >
                {isBn ? 'ফলাফল দেখুন' : 'Apply & View Results'}
              </button>
            )}
          </aside>

          {/* ==================== RIGHT RESULTS FEED ==================== */}
          <main className="search-results-main" style={{ minWidth: 0 }}>
            {/* Control Bar: Result Count + Active Chips + Sort + View Mode */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '14px 18px',
                marginBottom: 20,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                {/* Result Count Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {isBn ? (
                      <>
                        মোট <strong style={{ color: 'var(--primary-red)', fontSize: '1.05rem' }}>{filteredArticles.length}</strong> টি সংবাদ পাওয়া গেছে
                      </>
                    ) : (
                      <>
                        Found <strong style={{ color: 'var(--primary-red)', fontSize: '1.05rem' }}>{filteredArticles.length}</strong> matching articles
                      </>
                    )}
                  </span>
                </div>

                {/* Right Controls: Sort Dropdown + Grid/List View Toggles */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Sort Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {isBn ? 'সাজান:' : 'Sort:'}
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="search-select"
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="newest">{isBn ? 'সর্বশেষ সংবাদ (নতুন)' : 'Newest First'}</option>
                      <option value="oldest">{isBn ? 'সবচেয়ে পুরনো সংবাদ' : 'Oldest First'}</option>
                      <option value="popular">{isBn ? 'সর্বাধিক পঠিত (ভিউ)' : 'Most Viewed'}</option>
                      {keyword.trim() && (
                        <option value="relevance">{isBn ? 'সবচেয়ে প্রাসঙ্গিক' : 'Most Relevant'}</option>
                      )}
                    </select>
                  </div>

                  {/* View Mode Toggle Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      title={isBn ? 'গ্রিড ভিউ' : 'Grid View'}
                      style={{
                        padding: '6px 10px',
                        border: 'none',
                        backgroundColor: viewMode === 'grid' ? 'var(--primary-red)' : 'var(--bg-body)',
                        color: viewMode === 'grid' ? 'var(--white)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <i className="fa-solid fa-table-cells" style={{ fontSize: '0.9rem' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      title={isBn ? 'লিস্ট ভিউ' : 'List View'}
                      style={{
                        padding: '6px 10px',
                        border: 'none',
                        backgroundColor: viewMode === 'list' ? 'var(--primary-red)' : 'var(--bg-body)',
                        color: viewMode === 'list' ? 'var(--white)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <i className="fa-solid fa-list-ul" style={{ fontSize: '0.9rem' }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips / Badges */}
              {activeFilterCount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px dashed var(--border-color)'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {isBn ? 'সক্রিয় ফিল্টার:' : 'Active Filters:'}
                  </span>

                  {keyword.trim() && (
                    <span
                      className="search-chip"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 8px',
                        borderRadius: 12,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span>{isBn ? 'কীওয়ার্ড' : 'Query'}: "{keyword}"</span>
                      <button
                        type="button"
                        onClick={() => setKeyword('')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary-red)' }}
                      >
                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.75rem' }} />
                      </button>
                    </span>
                  )}

                  {selectedMasterGroup !== 'all' && (
                    <span
                      className="search-chip"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 8px',
                        borderRadius: 12,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span>
                        {isBn
                          ? (categoryMasterGroups.find((g) => g.id === selectedMasterGroup)?.nameBn ||
                             categoryMasterGroups.find((g) => g.id === selectedMasterGroup)?.titleBn ||
                             selectedMasterGroup)
                          : selectedMasterGroup}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedMasterGroup('all')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary-red)' }}
                      >
                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.75rem' }} />
                      </button>
                    </span>
                  )}

                  {selectedCategory !== 'all' && (
                    <span
                      className="search-chip"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 8px',
                        borderRadius: 12,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span>
                        {isBn
                          ? (categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory)?.nameBn || selectedCategory)
                          : selectedCategory}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary-red)' }}
                      >
                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.75rem' }} />
                      </button>
                    </span>
                  )}

                  {datePreset !== 'all' && (
                    <span
                      className="search-chip"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 8px',
                        borderRadius: 12,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span>{isBn ? 'সময়' : 'Time'}: {datePreset}</span>
                      <button
                        type="button"
                        onClick={() => setDatePreset('all')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary-red)' }}
                      >
                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.75rem' }} />
                      </button>
                    </span>
                  )}

                  {selectedDistrict !== 'all' && (
                    <span
                      className="search-chip"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 8px',
                        borderRadius: 12,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span>
                        {isBn
                          ? (allDistricts.find((d) => d.id === selectedDistrict)?.nameBn || selectedDistrict)
                          : selectedDistrict}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedDistrict('all')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary-red)' }}
                      >
                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.75rem' }} />
                      </button>
                    </span>
                  )}

                  {contentType !== 'all' && (
                    <span
                      className="search-chip"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 8px',
                        borderRadius: 12,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span>{contentType}</span>
                      <button
                        type="button"
                        onClick={() => setContentType('all')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary-red)' }}
                      >
                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.75rem' }} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-red)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginLeft: 4
                    }}
                  >
                    <i className="fa-solid fa-rotate-left" style={{ fontSize: '0.72rem' }} />
                    <span>{isBn ? 'সব মুছুন' : 'Clear All'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* In-feed Ad Banner */}
            <AdSenseSlot slotId="searchTopBanner" customClass="ad-slot-728x90" />

            {/* Loading Shimmer State */}
            {isArticlesLoading && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                  gap: 16
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      height: 240,
                      animation: 'pulse 1.5s infinite ease-in-out'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Empty State: 0 articles found */}
            {!isArticlesLoading && filteredArticles.length === 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: '48px 24px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    margin: '0 auto 16px auto',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '1.8rem' }} />
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isBn ? 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো সংবাদ পাওয়া যায়নি' : 'No news articles found'}
                </h3>
                <p style={{ margin: '0 auto 20px auto', maxWidth: 480, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {isBn
                    ? 'অন্য কোনো প্রাসঙ্গিক কীওয়ার্ড ব্যবহার করুন অথবা বাম পাশের ফিল্টারগুলো শিথিল করে পুনরায় অনুসন্ধান করুন।'
                    : 'Try checking your spelling, using different keywords, or clearing some of the filters.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      backgroundColor: 'var(--primary-red)',
                      color: 'var(--white)',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <i className="fa-solid fa-rotate-left" style={{ fontSize: '0.85rem' }} />
                    <span>{isBn ? 'সকল ফিল্টার রিসেট করুন' : 'Reset All Filters'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={goToHome}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      backgroundColor: 'var(--bg-body)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isBn ? 'প্রচ্ছদে যান' : 'Go to Homepage'}
                  </button>
                </div>
              </div>
            )}

            {/* Articles Stream: Grid vs List Mode */}
            {!isArticlesLoading && filteredArticles.length > 0 && (
              <>
                <div
                  className={`search-results-grid ${viewMode === 'list' ? 'list-mode' : 'grid-mode'}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                    gap: 16
                  }}
                >
                  {paginatedArticles.map((art) => {
                    const articleImg = art.imageUrl || art.featuredImage || art.thumbnail_image || art.featured_image;
                    const hasVideo = !!(art.is_video || art.isVideo || art.videoUrl || art.youtube_url);
                    const articleDate = isBn
                      ? (art.dateBn || (art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : ''))
                      : (art.dateEn || (art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''));
                    const articleTitle = isBn ? (art.titleBn || art.title) : (art.titleEn || art.title || art.titleBn);
                    const articleExcerpt = isBn ? (art.excerptBn || art.excerpt) : (art.excerptEn || art.excerpt || art.excerptBn);
                    const categoryLabel = isBn ? (art.categoryBn || art.category) : (art.categoryEn || art.category);

                    return (
                      <article
                        key={art.id || art.postId || art.slug}
                        onClick={() => openArticle(art)}
                        title={articleTitle}
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 6,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: viewMode === 'list' ? 'row' : 'column',
                          cursor: 'pointer',
                          transition: 'transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.borderColor = 'var(--primary-red)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Article Image Container */}
                        <div
                          style={{
                            position: 'relative',
                            width: viewMode === 'list' ? '240px' : '100%',
                            height: viewMode === 'list' ? '160px' : '180px',
                            minWidth: viewMode === 'list' ? '240px' : 'auto',
                            backgroundColor: 'var(--bg-subtle)',
                            overflow: 'hidden'
                          }}
                        >
                          {articleImg ? (
                            <img
                              src={articleImg}
                              alt={articleTitle}
                              loading="lazy"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform var(--transition-normal)'
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}

                          {/* Fallback Vector box if image missing */}
                          <div
                            style={{
                              display: articleImg ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--text-muted)'
                            }}
                          >
                            <i className="fa-solid fa-file-lines" style={{ fontSize: '2rem' }} />
                          </div>

                          {/* Category Badge */}
                          {categoryLabel && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                backgroundColor: 'var(--primary-red)',
                                color: 'var(--white)',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 3,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {categoryLabel}
                            </span>
                          )}

                          {/* Video Indicator */}
                          {hasVideo && (
                            <span
                              style={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                color: 'var(--white)',
                                padding: '3px 6px',
                                borderRadius: 4,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.72rem',
                                fontWeight: 600
                              }}
                            >
                              <i className="fa-solid fa-video" style={{ fontSize: '0.75rem' }} />
                              <span>{isBn ? 'ভিডিও' : 'Video'}</span>
                            </span>
                          )}
                        </div>

                        {/* Article Text Content */}
                        <div
                          style={{
                            padding: '14px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            {/* Headline */}
                            <h3
                              style={{
                                margin: '0 0 8px 0',
                                fontSize: viewMode === 'list' ? '1.15rem' : '1.02rem',
                                fontWeight: 700,
                                lineHeight: 1.4,
                                color: 'var(--text-main)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {articleTitle}
                            </h3>

                            {/* Excerpt */}
                            {articleExcerpt && (
                              <p
                                style={{
                                  margin: '0 0 12px 0',
                                  fontSize: '0.84rem',
                                  color: 'var(--text-muted)',
                                  lineHeight: 1.45,
                                  display: '-webkit-box',
                                  WebkitLineClamp: viewMode === 'list' ? 3 : 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {articleExcerpt}
                              </p>
                            )}
                          </div>

                          {/* Footer Meta Row */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              paddingTop: 8,
                              borderTop: '1px solid var(--border-color)',
                              flexWrap: 'wrap',
                              gap: 6
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {articleDate && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <i className="fa-solid fa-clock" style={{ color: 'var(--primary-red)', fontSize: '0.75rem' }} />
                                  <span>{articleDate}</span>
                                </span>
                              )}
                              {art.district && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    backgroundColor: 'var(--bg-subtle)',
                                    padding: '1px 5px',
                                    borderRadius: 3
                                  }}
                                >
                                  <i className="fa-solid fa-location-dot" style={{ fontSize: '0.7rem' }} />
                                  <span>{art.district}</span>
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-light)' }}>
                              <i className="fa-solid fa-eye" style={{ fontSize: '0.75rem', color: 'var(--primary-red)' }} />
                              <span>{isBn ? String(art.views || 1).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : (art.views || 1)}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginTop: 32,
                      paddingTop: 20,
                      borderTop: '1px solid var(--border-color)'
                    }}
                  >
                    {/* Previous Button */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.86rem'
                      }}
                    >
                      <i className="fa-solid fa-chevron-left" style={{ fontSize: '0.8rem' }} />
                      <span>{isBn ? 'পূর্ববর্তী' : 'Prev'}</span>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                      .map((pageNum, idx, arr) => {
                        const showEllipsisBefore = idx > 0 && pageNum - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={pageNum}>
                            {showEllipsisBefore && (
                              <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentPage(pageNum);
                                window.scrollTo({ top: 180, behavior: 'smooth' });
                              }}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                border: currentPage === pageNum ? '1px solid var(--primary-red)' : '1px solid var(--border-color)',
                                backgroundColor: currentPage === pageNum ? 'var(--primary-red)' : 'var(--bg-card)',
                                color: currentPage === pageNum ? 'var(--white)' : 'var(--text-main)',
                                fontWeight: currentPage === pageNum ? 700 : 500,
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                              }}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    {/* Next Button */}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.86rem'
                      }}
                    >
                      <span>{isBn ? 'পরবর্তী' : 'Next'}</span>
                      <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.8rem' }} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
