import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  initialSiteSettings,
  initialCategories,
  categoryGroups,
  categoryMasterGroups as initialCategoryMasterGroups,
  defaultHomepageSections,
  initialBreakingNews,
  initialNewsArticles,
  initialPodcasts,
  podcastSubjects,
  initialEmergencyServices,
  bangladeshDistricts
} from '../data/initialData';
import { supabase, configureSupabase } from '../supabase';
import { fetchLiveGoogleWeather, getDefaultWeather } from '../services/weatherService';
import AppDialogModal from '../components/Modals/AppDialogModal';
import UploadProgressModal from '../components/Modals/UploadProgressModal';
import {
  saveArticleToMariaDb,
  deleteArticleFromMariaDb,
  fetchArticlesFromMariaDb,
  fetchModuleFromMariaDb,
  syncModuleToMariaDb
} from '../utils/mariaDbSync';
import { safeSetLocalStorage, safeGetLocalStorage, safeRemoveLocalStorage } from '../utils/safeStorage';

const NewsContext = createContext();

export function NewsProvider({ children }) {
  // Global Branded Modal & Alert Dialog System
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    isConfirm: false,
    type: 'info',
    title: '',
    message: '',
    subMessage: '',
    confirmText: '',
    cancelText: '',
    onConfirm: null,
    onCancel: null
  });

  const closeDialog = () => {
    setDialogConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const showAlert = ({ title = '', message = '', subMessage = '', type = 'info', confirmText = '' } = {}) => {
    return new Promise((resolve) => {
      setDialogConfig({
        isOpen: true,
        isConfirm: false,
        type,
        title,
        message,
        subMessage,
        confirmText,
        cancelText: '',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };

  const showConfirm = ({
    title = '',
    message = '',
    subMessage = '',
    type = 'warning',
    confirmText = '',
    cancelText = ''
  } = {}) => {
    return new Promise((resolve) => {
      setDialogConfig({
        isOpen: true,
        isConfirm: true,
        type,
        title,
        message,
        subMessage,
        confirmText,
        cancelText,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };

  const showError = (message, title = '', subMessage = '') => showAlert({ title, message, subMessage, type: 'error' });
  const showSuccess = (message, title = '', subMessage = '') => showAlert({ title, message, subMessage, type: 'success' });
  const showWarning = (message, title = '', subMessage = '') => showAlert({ title, message, subMessage, type: 'warning' });

  // 1. Public Website Language State (Bangla Default)
  const [language, setLanguage] = useState(() => {
    return safeGetLocalStorage('jonogon_lang', 'bn') || 'bn';
  });

  // 1b. Admin Panel Language State (Independent from public website)
  const [adminLanguage, setAdminLanguage] = useState(() => {
    return safeGetLocalStorage('jonogon_admin_lang', 'bn') || 'bn';
  });

  // 2. Public Website Theme State (Light / Dark)
  const [theme, setTheme] = useState(() => {
    return safeGetLocalStorage('jonogon_theme', 'light') || 'light';
  });

  // 2b. Admin Panel Theme State (Independent from public website)
  const [adminTheme, setAdminTheme] = useState(() => {
    return safeGetLocalStorage('jonogon_admin_theme', 'dark') || 'dark';
  });

  // 3. Site Branding & Settings
  const [settings, setSettings] = useState(() => {
    const saved = safeGetLocalStorage('jonogon_settings');
    if (saved && typeof saved === 'object') {
      try {
        const parsed = saved;
        if (
          !parsed.sloganBn ||
          parsed.sloganBn === 'সত্যের সাথে, জনতার পাশে' ||
          parsed.sloganBn === 'সত্যের সাথে, সবার আগে'
        ) {
          parsed.sloganBn = 'জনতার কণ্ঠস্বর';
          parsed.sloganEn = 'Voice of the People';
          safeSetLocalStorage('jonogon_settings', parsed);
        }
        return { ...initialSiteSettings, ...parsed };
      } catch (e) {
        return initialSiteSettings;
      }
    }
    return initialSiteSettings;
  });

  // 4. Articles Data (Auto-heal broken URLs if any cached)
  const [articles, setArticles] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_articles');
      if (saved && Array.isArray(saved) && saved.length > 0) {
        return saved.map((a) => {
          if (a.imageUrl && a.imageUrl.includes('photo-1527018607619-a508a2be00be')) {
            return { ...a, imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=80' };
          }
          return a;
        });
      }
    } catch (e) {
      console.warn('Error reading jonogon_articles', e);
    }
    return initialNewsArticles;
  });

  // 5. Category Master Groups (10 Master Groups with Sub-Groups & Category Items)
  const [categoryMasterGroups, setCategoryMasterGroups] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_master_groups');
      if (saved && Array.isArray(saved) && saved.length > 0) {
        const parsed = saved;
        const bdGroup = parsed.find((g) => g.id === 'bangladesh-governance') || parsed[0];
        if (bdGroup && Array.isArray(bdGroup.subGroups) && bdGroup.subGroups.length > 0) {
          const hasProbashi = bdGroup.subGroups.some((sg) =>
            (sg.items || []).some((it) => it.id === 'probashi' || it.nameBn === 'প্রবাসী')
          );
          if (!hasProbashi) {
            const targetSub = bdGroup.subGroups[0];
            if (targetSub && Array.isArray(targetSub.items)) {
              const bIdx = targetSub.items.findIndex((it) => it.id === 'bangladesh');
              const probashiItem = { id: 'probashi', nameBn: 'প্রবাসী', nameEn: 'Expatriates' };
              if (bIdx >= 0) {
                targetSub.items.splice(bIdx + 1, 0, probashiItem);
              } else {
                targetSub.items.push(probashiItem);
              }
              safeSetLocalStorage('jonogon_master_groups', parsed);
            }
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error parsing master groups from storage', e);
    }
    return initialCategoryMasterGroups;
  });

  // 5b. Flat Categories Data (All 132 Categories synchronized with DB & Master Groups)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_categories');
      if (saved && Array.isArray(saved) && saved.length >= 100) {
        return saved;
      }
    } catch (e) {}
    return initialCategories;
  });

  // Global Upload Progress Modal State
  const [uploadProgress, setUploadProgress] = useState({
    isOpen: false,
    progress: 0,
    statusText: '',
    fileName: '',
    isError: false
  });

  const showUploadProgress = (statusText = 'ছবি WebP রূপান্তর ও ক্লাউড আপলোড হচ্ছে...', progress = 25, fileName = '') => {
    setUploadProgress({
      isOpen: true,
      progress,
      statusText,
      fileName,
      isError: false
    });
  };

  const updateUploadProgress = (progress, statusText = '') => {
    setUploadProgress((prev) => ({
      ...prev,
      progress,
      statusText: statusText || prev.statusText
    }));
  };

  const closeUploadProgress = (delay = 600) => {
    setUploadProgress((prev) => ({ ...prev, progress: 100, statusText: 'সফলভাবে আপলোড সম্পন্ন হয়েছে!' }));
    setTimeout(() => {
      setUploadProgress((prev) => ({ ...prev, isOpen: false }));
    }, delay);
  };

  // Listen to site-wide upload events from imageUploader
  useEffect(() => {
    const handleStart = (e) => {
      const { fileName, statusText } = e.detail || {};
      showUploadProgress(statusText || 'ছবি প্রসেসিং হচ্ছে...', 15, fileName || '');
    };
    const handleProgress = (e) => {
      const { progress, statusText } = e.detail || {};
      updateUploadProgress(progress || 50, statusText);
    };
    const handleComplete = (e) => {
      const { statusText } = e.detail || {};
      setUploadProgress((prev) => ({ ...prev, progress: 100, statusText: statusText || 'আপলোড সফল হয়েছে!' }));
      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, isOpen: false }));
      }, 700);
    };
    const handleError = (e) => {
      const { message } = e.detail || {};
      setUploadProgress((prev) => ({ ...prev, isError: true, statusText: message || 'আপলোড ব্যর্থ হয়েছে' }));
      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, isOpen: false }));
      }, 2000);
    };

    window.addEventListener('site_upload_start', handleStart);
    window.addEventListener('site_upload_progress', handleProgress);
    window.addEventListener('site_upload_complete', handleComplete);
    window.addEventListener('site_upload_error', handleError);

    return () => {
      window.removeEventListener('site_upload_start', handleStart);
      window.removeEventListener('site_upload_progress', handleProgress);
      window.removeEventListener('site_upload_complete', handleComplete);
      window.removeEventListener('site_upload_error', handleError);
    };
  }, []);

  // Fetch live categories from MariaDB / API
  const refreshCategories = async () => {
    try {
      const endpoints = ['/api/categories.php', 'api/categories.php', './api/categories.php'];
      if (typeof window !== 'undefined' && window.location.origin) {
        endpoints.unshift(`${window.location.origin}/api/categories.php`);
      }
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, { headers: { Accept: 'application/json' } });
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
              const formatted = data.data.map((cat) => ({
                id: cat.slug || String(cat.id),
                nameBn: cat.name_bn || cat.name,
                nameEn: cat.name_en || cat.slug,
                slug: cat.slug
              }));
              setCategories(formatted);
              safeSetLocalStorage('jonogon_categories', formatted);
              return;
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  };

  const refreshArticles = async () => {
    try {
      const dbPosts = await fetchArticlesFromMariaDb();
      if (Array.isArray(dbPosts) && dbPosts.length > 0) {
        setArticles(dbPosts);
        safeSetLocalStorage('jonogon_articles', dbPosts);
      }
    } catch (e) {}
  };

  const isHydratedFromDbRef = React.useRef(false);

  // Fetch and hydrate all settings, categories, homepage sections, podcasts, and emergency services from MariaDB
  const refreshAllModulesFromDb = async () => {
    try {
      const data = await fetchModuleFromMariaDb('all');
      if (data) {
        if (data.siteSettings && typeof data.siteSettings === 'object' && Object.keys(data.siteSettings).length > 0) {
          setSettings((prev) => {
            const merged = { ...prev, ...data.siteSettings };
            safeSetLocalStorage('jonogon_settings', merged);
            return merged;
          });
        }
        if (Array.isArray(data.masterGroups) && data.masterGroups.length > 0) {
          setCategoryMasterGroups(data.masterGroups);
          safeSetLocalStorage('jonogon_master_groups', data.masterGroups);
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          safeSetLocalStorage('jonogon_categories', data.categories);
        }
        if (Array.isArray(data.homepageSections) && data.homepageSections.length > 0) {
          setHomepageSections(data.homepageSections);
          safeSetLocalStorage('jonogon_homepage_sections', data.homepageSections);
        }
        if (Array.isArray(data.podcasts) && data.podcasts.length > 0) {
          setPodcasts(data.podcasts);
          safeSetLocalStorage('jonogon_podcasts', data.podcasts);
        }
        if (Array.isArray(data.emergencyServices) && data.emergencyServices.length > 0) {
          setEmergencyServices(data.emergencyServices);
          safeSetLocalStorage('jonogon_emergency_services', data.emergencyServices);
        }
        if (Array.isArray(data.breakingNews) && data.breakingNews.length > 0) {
          setBreakingNews(data.breakingNews);
          safeSetLocalStorage('jonogon_breaking', data.breakingNews);
        }
      }
    } catch (e) {
      console.warn('MariaDB module hydration notice:', e);
    } finally {
      isHydratedFromDbRef.current = true;
    }
  };

  // Ensure Probashi & Expatriates sync in state on startup + fetch categories & articles from DB
  useEffect(() => {
    refreshCategories();
    refreshArticles();
    refreshAllModulesFromDb();

    setCategoryMasterGroups((prevGroups) => {
      let needsUpdate = false;
      const updated = (prevGroups || []).map((grp) => {
        if (grp.id === 'bangladesh-governance') {
          const hasProbashi = grp.subGroups?.some((sg) =>
            sg.items?.some((it) => it.id === 'probashi' || it.nameBn === 'প্রবাসী')
          );
          if (!hasProbashi && grp.subGroups && grp.subGroups.length > 0) {
            needsUpdate = true;
            const updatedSubs = [...grp.subGroups];
            const firstSub = { ...updatedSubs[0], items: [...updatedSubs[0].items] };
            const bIdx = firstSub.items.findIndex((it) => it.id === 'bangladesh');
            const probashiItem = { id: 'probashi', nameBn: 'প্রবাসী', nameEn: 'Expatriates' };
            if (bIdx >= 0) {
              firstSub.items.splice(bIdx + 1, 0, probashiItem);
            } else {
              firstSub.items.push(probashiItem);
            }
            updatedSubs[0] = firstSub;
            return { ...grp, subGroups: updatedSubs };
          }
        }
        return grp;
      });
      if (needsUpdate) {
        safeSetLocalStorage('jonogon_master_groups', updated);
        return updated;
      }
      return prevGroups;
    });

    setCategories((prev) => {
      if (!(prev || []).some((c) => c.id === 'probashi')) {
        const updated = [...(prev || []), { id: 'probashi', nameBn: 'প্রবাসী', nameEn: 'Expatriates', slug: 'probashi' }];
        safeSetLocalStorage('jonogon_categories', updated);
        return updated;
      }
      return prev;
    });
  }, []);

  // 6. Breaking News Ticker
  const [breakingNews, setBreakingNews] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_breaking');
      if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {}
    return initialBreakingNews;
  });

  // 7. Podcasts Data
  const [podcasts, setPodcasts] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_podcasts');
      if (saved && Array.isArray(saved) && saved.length > 0) {
        return saved.map((p, idx) => {
          if (!p.subjectId) {
            const fallback = initialPodcasts[idx % initialPodcasts.length] || initialPodcasts[0];
            return {
              ...p,
              subjectId: fallback?.subjectId || 'politics',
              subjectBn: fallback?.subjectBn || 'রাজনীতি ও রাষ্ট্র',
              subjectEn: fallback?.subjectEn || 'Politics & Governance'
            };
          }
          return p;
        });
      }
    } catch (e) {}
    return initialPodcasts;
  });

  // 7b. Emergency Services Data (BD Govt & Emergency Services)
  const [emergencyServices, setEmergencyServices] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_emergency_services');
      if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {}
    return initialEmergencyServices;
  });

  // 7c. Homepage Modular Sections Order & Visibility State (31 sections)
  const [homepageSections, setHomepageSections] = useState(() => {
    const saved = safeGetLocalStorage('jonogon_homepage_sections');
    if (saved && Array.isArray(saved) && saved.length > 0) {
      try {
        const cleanList = [];
        // Keep valid saved sections matched with default metadata
        saved.forEach((savedSec) => {
          const def = defaultHomepageSections.find((d) => d.id === savedSec.id);
          if (def) {
            cleanList.push({ ...def, ...savedSec });
          }
        });

        // Append any missing default sections
        defaultHomepageSections.forEach((def) => {
          if (!cleanList.some((m) => m.id === def.id)) {
            cleanList.push(def);
          }
        });

        if (cleanList.length === defaultHomepageSections.length) {
          safeSetLocalStorage('jonogon_homepage_sections', cleanList);
          return cleanList;
        }
      } catch (e) {
        console.error('Error parsing homepage sections', e);
      }
    }
    safeSetLocalStorage('jonogon_homepage_sections', defaultHomepageSections);
    return defaultHomepageSections;
  });

  // 7d. 3-Column Grid Sections Layout State (Left, Middle, Right column reordering)
  const defaultSectionColumnsOrder = {
    heroLeadGrid: ['leadSlider', 'newlyPosted', 'mostRead'],
    bangladeshSection: ['featuredLead', 'subLeads', 'weatherFollow'],
    remittanceFighter: ['featuredLead', 'subLeads', 'ratesHelpline'],
    subGroupSections: ['heroCard', 'colA', 'colB'],
    'master-international-world': ['heroCard', 'colA', 'colB'],
    'master-business-economy': ['heroCard', 'colA', 'colB'],
    'master-jobs-education': ['heroCard', 'colA', 'colB'],
    'master-science-tech': ['heroCard', 'colA', 'colB'],
    'master-religion-society': ['heroCard', 'colA', 'colB'],
    'master-sports-health': ['heroCard', 'colA', 'colB'],
    'master-entertainment': ['heroCard', 'colA', 'colB'],
    'master-lifestyle-culture': ['heroCard', 'colA', 'colB'],
    'master-opinion-specials': ['heroCard', 'colA', 'colB']
  };

  const [sectionColumnsOrder, setSectionColumnsOrder] = useState(() => {
    const saved = safeGetLocalStorage('jonogon_section_columns');
    if (saved && typeof saved === 'object') {
      return { ...defaultSectionColumnsOrder, ...saved };
    }
    return defaultSectionColumnsOrder;
  });

  // 8. Navigation & Routing View States (Synchronous detection to eliminate flash on reload)
  const getInitialRouteState = () => {
    if (typeof window === 'undefined') {
      return { page: 'home', isAdmin: false, category: 'latest', articleSlug: null };
    }
    const path = window.location.pathname || '';
    const params = new URLSearchParams(window.location.search);
    const newsParam = params.get('news') || params.get('article');
    const catParam = params.get('cat') || params.get('category');

    if (path === '/admin' || path === '/admin/' || path.startsWith('/admin')) {
      return { page: 'admin', isAdmin: true, category: 'latest', articleSlug: null };
    }
    if (path.startsWith('/news/')) {
      return { page: 'article', isAdmin: false, category: 'latest', articleSlug: decodeURIComponent(path.replace('/news/', '').trim()) };
    }
    if (newsParam) {
      return { page: 'article', isAdmin: false, category: 'latest', articleSlug: newsParam };
    }
    if (path.startsWith('/category/')) {
      return { page: 'category', isAdmin: false, category: decodeURIComponent(path.replace('/category/', '').trim()), articleSlug: null };
    }
    if (catParam) {
      return { page: 'category', isAdmin: false, category: catParam, articleSlug: null };
    }
    if (path === '/about' || path === '/about/') return { page: 'about', isAdmin: false, category: 'latest', articleSlug: null };
    if (path === '/contact' || path === '/contact/') return { page: 'contact', isAdmin: false, category: 'latest', articleSlug: null };
    if (path === '/advertisement' || path === '/advertisement/') return { page: 'advertisement', isAdmin: false, category: 'latest', articleSlug: null };
    if (path === '/editorial' || path === '/editorial/') return { page: 'editorial', isAdmin: false, category: 'latest', articleSlug: null };
    if (path === '/privacy' || path === '/privacy/') return { page: 'privacy', isAdmin: false, category: 'latest', articleSlug: null };
    if (path === '/terms' || path === '/terms/') return { page: 'terms', isAdmin: false, category: 'latest', articleSlug: null };
    if (path === '/founder' || path === '/editor') return { page: 'founder', isAdmin: false, category: 'latest', articleSlug: null };

    return { page: 'home', isAdmin: false, category: 'latest', articleSlug: null };
  };

  const initialRoute = useMemo(() => getInitialRouteState(), []);
  const [activePage, setActivePage] = useState(initialRoute.page);
  const [activeCategory, setActiveCategoryState] = useState(initialRoute.category);
  const [selectedPodcastSubject, setSelectedPodcastSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentArticle, setCurrentArticle] = useState(null);
  const [activePolicyModal, setActivePolicyModal] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(initialRoute.isAdmin);

  // 9. Real-Time Location District & Google Weather State
  const [userDistrict, setUserDistrictState] = useState(() => {
    return safeGetLocalStorage('jonogon_user_district', 'dhaka') || 'dhaka';
  });

  const [liveWeather, setLiveWeather] = useState(() => {
    return getDefaultWeather('ঢাকা', 'Dhaka');
  });

  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  const setUserDistrict = (districtId) => {
    setUserDistrictState(districtId);
    safeSetLocalStorage('jonogon_user_district', districtId);
  };

  const refreshWeather = async (districtId = userDistrict) => {
    setIsWeatherLoading(true);
    const allDistricts = bangladeshDistricts.flatMap((div) => div.districts);
    const targetDist = allDistricts.find((d) => d.id === districtId) || {
      id: 'dhaka',
      nameBn: 'ঢাকা',
      nameEn: 'Dhaka',
      lat: 23.8103,
      lng: 90.4125
    };

    const weather = await fetchLiveGoogleWeather(
      targetDist.lat,
      targetDist.lng,
      targetDist.nameBn,
      targetDist.nameEn
    );

    if (weather) {
      setLiveWeather(weather);
    }
    setIsWeatherLoading(false);
  };

  useEffect(() => {
    refreshWeather(userDistrict);
  }, [userDistrict]);

  // Handle URL parsing and Browser Back / Forward Navigation (HTML5 History API)
  const syncRouteFromLocation = () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const newsParam = params.get('news') || params.get('article');
    const catParam = params.get('cat') || params.get('category');

    if (path === '/admin' || path === '/admin/' || path.startsWith('/admin')) {
      setIsAdminOpen(true);
      setActivePage('admin');
      setCurrentArticle(null);
      return;
    }

    // Clear admin if navigated to non-admin path
    setIsAdminOpen(false);

    if (path.startsWith('/news/')) {
      const slug = decodeURIComponent(path.replace('/news/', '').trim());
      const found = articles.find((a) => a.slug === slug || a.id === slug || a.titleBn === slug || a.titleEn === slug);
      if (found) {
        setCurrentArticle(found);
        setActivePage('article');
        return;
      }
    } else if (newsParam) {
      const found = articles.find((a) => a.id === newsParam || a.slug === newsParam);
      if (found) {
        setCurrentArticle(found);
        setActivePage('article');
        return;
      }
    }

    if (path.startsWith('/category/')) {
      const slug = decodeURIComponent(path.replace('/category/', '').trim());
      setActiveCategoryState(slug);
      setActivePage('category');
      setCurrentArticle(null);
      return;
    } else if (catParam) {
      setActiveCategoryState(catParam);
      setActivePage('category');
      setCurrentArticle(null);
      return;
    }

    if (path === '/about') {
      setActivePage('about');
      setCurrentArticle(null);
      return;
    }
    if (path === '/advertisement' || path === '/advertise') {
      setActivePage('advertisement');
      setCurrentArticle(null);
      return;
    }
    if (path === '/contact') {
      setActivePage('contact');
      setCurrentArticle(null);
      return;
    }
    if (path === '/editorial-policy' || path === '/editorial') {
      setActivePage('editorial');
      setCurrentArticle(null);
      return;
    }
    if (path === '/privacy' || path === '/privacy-policy') {
      setActivePage('privacy');
      setCurrentArticle(null);
      return;
    }
    if (path === '/terms' || path === '/terms-and-conditions') {
      setActivePage('terms');
      setCurrentArticle(null);
      return;
    }
    if (path === '/founder' || path === '/found' || path === '/editor' || path === '/biplob-hossain') {
      setActivePage('founder');
      setCurrentArticle(null);
      return;
    }

    // Default Home
    setActivePage('home');
    setCurrentArticle(null);
  };

  useEffect(() => {
    syncRouteFromLocation();

    const handlePopState = () => {
      syncRouteFromLocation();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [articles]);

  // Navigate to Dedicated Full Article Page with SEO Friendly URL (/news/:slug)
  const openArticle = (art) => {
    if (!art) return;
    incrementViews(art.id);
    setCurrentArticle(art);
    setActivePage('article');
    setIsAdminOpen(false);
    const slug = art.slug || art.id;
    window.history.pushState({ page: 'article', articleId: art.id, slug }, '', `/news/${encodeURIComponent(slug)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Dedicated Category Page with SEO Friendly URL (/category/:slug)
  const setActiveCategory = (catId) => {
    if (catId === 'latest' || catId === 'all') {
      goToHome();
      return;
    }
    setActiveCategoryState(catId);
    setCurrentArticle(null);
    setActivePage('category');
    setIsAdminOpen(false);
    window.history.pushState({ page: 'category', categoryId: catId }, '', `/category/${encodeURIComponent(catId)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Admin Panel with URL /admin
  const openAdmin = () => {
    setIsAdminOpen(true);
    setActivePage('admin');
    setCurrentArticle(null);
    window.history.pushState({ page: 'admin' }, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close Admin Panel and return to Home /
  const closeAdmin = () => {
    setIsAdminOpen(false);
    goToHome();
  };

  // General Navigation Method for Standalone Pages
  const navigateTo = (path, { replace = false } = {}) => {
    const cleanPath = path.toLowerCase();
    if (cleanPath === '/' || cleanPath === '/home') {
      goToHome();
      return;
    }
    if (cleanPath === '/admin' || cleanPath === '/admin/') {
      openAdmin();
      return;
    }

    setIsAdminOpen(false);

    if (cleanPath === '/about') {
      setActivePage('about');
      setCurrentArticle(null);
    } else if (cleanPath === '/advertisement' || cleanPath === '/advertise') {
      setActivePage('advertisement');
      setCurrentArticle(null);
    } else if (cleanPath === '/contact') {
      setActivePage('contact');
      setCurrentArticle(null);
    } else if (cleanPath === '/editorial-policy' || cleanPath === '/editorial') {
      setActivePage('editorial');
      setCurrentArticle(null);
    } else if (cleanPath === '/privacy' || cleanPath === '/privacy-policy') {
      setActivePage('privacy');
      setCurrentArticle(null);
    } else if (cleanPath === '/terms' || cleanPath === '/terms-and-conditions') {
      setActivePage('terms');
      setCurrentArticle(null);
    } else if (cleanPath === '/founder' || cleanPath === '/found' || cleanPath === '/editor' || cleanPath === '/biplob-hossain') {
      setActivePage('founder');
      setCurrentArticle(null);
    } else if (cleanPath.startsWith('/category/')) {
      const slug = path.replace('/category/', '').trim();
      setActiveCategoryState(slug);
      setActivePage('category');
      setCurrentArticle(null);
    } else if (cleanPath.startsWith('/news/')) {
      const slug = path.replace('/news/', '').trim();
      const found = articles.find((a) => a.slug === slug || a.id === slug);
      if (found) {
        setCurrentArticle(found);
        setActivePage('article');
      }
    }

    if (replace) {
      window.history.replaceState({ path }, '', path);
    } else {
      window.history.pushState({ path }, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate back to Home
  const goToHome = () => {
    setIsAdminOpen(false);
    setCurrentArticle(null);
    setActiveCategoryState('latest');
    setActivePage('home');
    setSearchQuery('');
    window.history.pushState({ page: 'home' }, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync Public Language
  useEffect(() => {
    safeSetLocalStorage('jonogon_lang', language);
    const isCurrentlyAdmin = window.location.pathname.startsWith('/admin') || isAdminOpen || activePage === 'admin';
    if (!isCurrentlyAdmin) {
      document.documentElement.lang = language;
    }
  }, [language, isAdminOpen, activePage]);

  // Sync Admin Language
  useEffect(() => {
    safeSetLocalStorage('jonogon_admin_lang', adminLanguage);
    const isCurrentlyAdmin = window.location.pathname.startsWith('/admin') || isAdminOpen || activePage === 'admin';
    if (isCurrentlyAdmin) {
      document.documentElement.lang = adminLanguage;
    }
  }, [adminLanguage, isAdminOpen, activePage]);

  // Sync Public Theme & CSS Custom Properties
  useEffect(() => {
    safeSetLocalStorage('jonogon_theme', theme);
    const isCurrentlyAdmin = window.location.pathname.startsWith('/admin') || isAdminOpen || activePage === 'admin';
    if (!isCurrentlyAdmin) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, isAdminOpen, activePage]);

  // Sync Admin Theme
  useEffect(() => {
    safeSetLocalStorage('jonogon_admin_theme', adminTheme);
    const isCurrentlyAdmin = window.location.pathname.startsWith('/admin') || isAdminOpen || activePage === 'admin';
    if (isCurrentlyAdmin) {
      document.documentElement.setAttribute('data-theme', adminTheme);
    }
  }, [adminTheme, isAdminOpen, activePage]);

  // Apply Dynamic Brand Colors & Fonts from Admin Settings
  useEffect(() => {
    safeSetLocalStorage('jonogon_settings', settings);
    const root = document.documentElement;
    if (settings.primaryRed) root.style.setProperty('--primary-red', settings.primaryRed);
    if (settings.darkRed) root.style.setProperty('--dark-red', settings.darkRed);
    if (settings.black) root.style.setProperty('--black', settings.black);
    if (settings.silver) root.style.setProperty('--silver', settings.silver);
    if (settings.fontHeadline) root.style.setProperty('--font-headline', settings.fontHeadline);
    if (settings.fontSubheadline) root.style.setProperty('--font-subheadline', settings.fontSubheadline);
    if (settings.fontBody) root.style.setProperty('--font-body', settings.fontBody);
    if (settings.fontEditorial) root.style.setProperty('--font-editorial', settings.fontEditorial);
  }, [settings]);

  // Persist Articles, Categories, Master Groups, Breaking News & Podcasts
  useEffect(() => {
    safeSetLocalStorage('jonogon_articles', articles);
  }, [articles]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_master_groups', categoryMasterGroups);
    if (isHydratedFromDbRef.current && categoryMasterGroups?.length > 0) {
      syncModuleToMariaDb('categories', {
        masterGroups: categoryMasterGroups,
        categories
      }).catch(() => {});
    }
  }, [categoryMasterGroups]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_categories', categories);
    if (isHydratedFromDbRef.current && categories?.length > 0) {
      syncModuleToMariaDb('categories', {
        masterGroups: categoryMasterGroups,
        categories
      }).catch(() => {});
    }
  }, [categories]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_breaking', breakingNews);
  }, [breakingNews]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_podcasts', podcasts);
    if (isHydratedFromDbRef.current && podcasts?.length > 0) {
      syncModuleToMariaDb('podcasts', podcasts).catch(() => {});
    }
  }, [podcasts]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_emergency_services', emergencyServices);
    if (isHydratedFromDbRef.current && emergencyServices?.length > 0) {
      syncModuleToMariaDb('emergency', emergencyServices).catch(() => {});
    }
  }, [emergencyServices]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_homepage_sections', homepageSections);
    if (isHydratedFromDbRef.current && homepageSections?.length > 0) {
      syncModuleToMariaDb('sections', homepageSections).catch(() => {});
    }
  }, [homepageSections]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_section_columns', sectionColumnsOrder);
  }, [sectionColumnsOrder]);

  // Article Actions with MariaDB Sync
  const addArticle = async (newArticle) => {
    const articleWithId = {
      ...newArticle,
      id: newArticle.id || `news-${Date.now()}`,
      views: newArticle.views || 0,
      dateBn: newArticle.dateBn || new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      dateEn: newArticle.dateEn || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setArticles((prev) => [articleWithId, ...prev]);

    // Async sync to MariaDB Database
    try {
      const res = await saveArticleToMariaDb(articleWithId);
      if (!res?.success) {
        console.warn('MariaDB auto-sync notice:', res?.error);
      }
      return res;
    } catch (err) {
      console.warn('MariaDB auto-sync error:', err);
      return { success: false, error: err?.message };
    }
  };

  const updateArticle = async (id, updatedData) => {
    let fullArticle = null;
    setArticles((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          fullArticle = { ...item, ...updatedData };
          return fullArticle;
        }
        return item;
      })
    );
    if (currentArticle && currentArticle.id === id) {
      setCurrentArticle((prev) => ({ ...prev, ...updatedData }));
    }

    if (fullArticle) {
      try {
        const res = await saveArticleToMariaDb(fullArticle);
        return res;
      } catch (err) {
        console.warn('MariaDB update sync error:', err);
        return { success: false, error: err?.message };
      }
    }
  };

  const deleteArticle = (id) => {
    setArticles((prev) => prev.filter((item) => item.id !== id));
    deleteArticleFromMariaDb(id).catch((err) => {
      console.warn('MariaDB delete sync error:', err);
    });
    if (currentArticle && currentArticle.id === id) {
      goToHome();
    }
  };

  // Increment views by 5 for every article read (1 view = 5 views multiplier)
  const incrementViews = (id, count = 5) => {
    setArticles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, views: (item.views || 0) + count } : item
      )
    );
    if (currentArticle && currentArticle.id === id) {
      setCurrentArticle((prev) => (prev ? { ...prev, views: (prev.views || 0) + count } : prev));
    }
  };

  // ==========================================
  // DYNAMIC CATEGORY & MASTER GROUP CRUD ACTIONS
  // ==========================================

  // Add new Category Item to a specific Master Group and Sub-Group
  const addCategoryToMasterGroup = ({
    nameBn,
    nameEn,
    slug,
    masterGroupId,
    subGroupTitleBn,
    subGroupTitleEn
  }) => {
    const cleanSlug = (slug || nameEn || nameBn)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    const newId = cleanSlug || `cat-${Date.now()}`;

    const newCategoryObj = {
      id: newId,
      nameBn: (nameBn || '').trim(),
      nameEn: (nameEn || nameBn || '').trim(),
      slug: newId
    };

    // 1. Update categoryMasterGroups
    setCategoryMasterGroups((prevGroups) => {
      let groupFound = false;
      const updated = prevGroups.map((grp) => {
        if (grp.id === masterGroupId) {
          groupFound = true;
          let subFound = false;
          const updatedSubs = grp.subGroups.map((sub) => {
            if (sub.titleBn === subGroupTitleBn) {
              subFound = true;
              return {
                ...sub,
                items: [
                  ...sub.items.filter((it) => it.id !== newId),
                  { id: newId, nameBn: newCategoryObj.nameBn, nameEn: newCategoryObj.nameEn }
                ]
              };
            }
            return sub;
          });

          if (!subFound) {
            updatedSubs.push({
              titleBn: subGroupTitleBn || 'সাধারণ',
              titleEn: subGroupTitleEn || subGroupTitleBn || 'General',
              items: [{ id: newId, nameBn: newCategoryObj.nameBn, nameEn: newCategoryObj.nameEn }]
            });
          }

          return { ...grp, subGroups: updatedSubs };
        }
        return grp;
      });

      if (!groupFound && updated.length > 0) {
        if (updated[0].subGroups.length > 0) {
          updated[0].subGroups[0].items.push({
            id: newId,
            nameBn: newCategoryObj.nameBn,
            nameEn: newCategoryObj.nameEn
          });
        }
      }

      return updated;
    });

    // 2. Sync to flat categories list
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === newId);
      if (exists) {
        return prev.map((c) => (c.id === newId ? newCategoryObj : c));
      }
      return [...prev, newCategoryObj];
    });

    return newId;
  };

  // Update existing Category Item (Name, English Name, Slug, Group, Sub-Group)
  const updateCategoryInMasterGroup = (
    categoryId,
    {
      nameBn,
      nameEn,
      slug,
      masterGroupId,
      subGroupTitleBn,
      subGroupTitleEn,
      targetPosition
    }
  ) => {
    const cleanSlug = (slug || nameEn || nameBn)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    const updatedId = cleanSlug || categoryId;

    const updatedCategoryObj = {
      id: updatedId,
      nameBn: (nameBn || '').trim(),
      nameEn: (nameEn || nameBn || '').trim(),
      slug: updatedId
    };

    // 1. Update categoryMasterGroups: Remove from old location and insert into target location
    setCategoryMasterGroups((prevGroups) => {
      // Clean old instance
      const cleaned = prevGroups.map((grp) => ({
        ...grp,
        subGroups: grp.subGroups.map((sub) => ({
          ...sub,
          items: sub.items.filter((it) => it.id !== categoryId && it.id !== updatedId)
        }))
      }));

      // Find target group
      const targetGroup = cleaned.find((g) => g.id === masterGroupId) || cleaned[0];
      if (targetGroup) {
        let subFound = false;
        targetGroup.subGroups = targetGroup.subGroups.map((sub) => {
          if (sub.titleBn === subGroupTitleBn) {
            subFound = true;
            const items = [...sub.items];
            const newItem = { id: updatedId, nameBn: updatedCategoryObj.nameBn, nameEn: updatedCategoryObj.nameEn };
            if (typeof targetPosition === 'number' && targetPosition >= 0 && targetPosition <= items.length) {
              items.splice(targetPosition, 0, newItem);
            } else {
              items.push(newItem);
            }
            return {
              ...sub,
              items
            };
          }
          return sub;
        });

        if (!subFound) {
          targetGroup.subGroups.push({
            titleBn: subGroupTitleBn || 'সাধারণ',
            titleEn: subGroupTitleEn || subGroupTitleBn || 'General',
            items: [
              { id: updatedId, nameBn: updatedCategoryObj.nameBn, nameEn: updatedCategoryObj.nameEn }
            ]
          });
        }
      }

      return cleaned;
    });

    // 2. Sync to flat categories list
    setCategories((prev) => {
      const filtered = prev.filter((c) => c.id !== categoryId && c.id !== updatedId);
      return [...filtered, updatedCategoryObj];
    });

    // 3. Update articles referencing this category if id changed
    if (categoryId !== updatedId) {
      setArticles((prev) =>
        prev.map((art) =>
          art.category === categoryId
            ? { ...art, category: updatedId, categoryBn: updatedCategoryObj.nameBn }
            : art
        )
      );
    }
  };

  // Delete Category Item
  const deleteCategoryFromMasterGroup = (categoryId) => {
    setCategoryMasterGroups((prevGroups) =>
      prevGroups.map((grp) => ({
        ...grp,
        subGroups: grp.subGroups.map((sub) => ({
          ...sub,
          items: sub.items.filter((it) => it.id !== categoryId)
        }))
      }))
    );

    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // Legacy Category Actions (Backwards Compatibility)
  const addCategory = (cat) => {
    addCategoryToMasterGroup({
      nameBn: cat.nameBn,
      nameEn: cat.nameEn,
      slug: cat.slug,
      masterGroupId: 'bangladesh-governance',
      subGroupTitleBn: 'সাধারণ'
    });
  };

  const updateCategory = (id, updatedData) => {
    updateCategoryInMasterGroup(id, {
      ...updatedData,
      masterGroupId: 'bangladesh-governance',
      subGroupTitleBn: 'সাধারণ'
    });
  };

  const deleteCategory = (id) => {
    deleteCategoryFromMasterGroup(id);
  };

  // Master Group Operations
  const addMasterGroup = ({ nameBn, nameEn }) => {
    const newId = `grp-${Date.now()}`;
    setCategoryMasterGroups((prev) => [
      ...prev,
      {
        id: newId,
        nameBn: (nameBn || '').trim(),
        nameEn: (nameEn || nameBn || '').trim(),
        subGroups: [
          {
            titleBn: 'সাধারণ',
            titleEn: 'General',
            items: []
          }
        ]
      }
    ]);
  };

  const updateMasterGroup = (groupId, { nameBn, nameEn }) => {
    setCategoryMasterGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, nameBn: (nameBn || '').trim(), nameEn: (nameEn || g.nameEn || '').trim() }
          : g
      )
    );
  };

  const deleteMasterGroup = (groupId) => {
    setCategoryMasterGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const moveMasterGroup = (fromIndex, toIndex) => {
    setCategoryMasterGroups((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const reorderMasterGroups = (newGroups) => {
    setCategoryMasterGroups(newGroups);
  };

  const moveSubGroupOrder = (groupId, fromIndex, toIndex) => {
    setCategoryMasterGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const subs = [...g.subGroups];
          if (fromIndex < 0 || toIndex < 0 || fromIndex >= subs.length || toIndex >= subs.length) return g;
          const [moved] = subs.splice(fromIndex, 1);
          subs.splice(toIndex, 0, moved);
          return { ...g, subGroups: subs };
        }
        return g;
      })
    );
  };

  const moveCategoryItemOrder = (groupId, subGroupTitleBn, fromIndex, toIndex) => {
    setCategoryMasterGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            subGroups: g.subGroups.map((sub) => {
              if (sub.titleBn === subGroupTitleBn) {
                const items = [...(sub.items || [])];
                if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) return sub;
                const [moved] = items.splice(fromIndex, 1);
                items.splice(toIndex, 0, moved);
                return { ...sub, items };
              }
              return sub;
            })
          };
        }
        return g;
      })
    );
  };

  // Sub-Group Operations
  const addSubGroup = (groupId, { titleBn, titleEn }) => {
    setCategoryMasterGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            subGroups: [
              ...g.subGroups,
              {
                titleBn: (titleBn || '').trim(),
                titleEn: (titleEn || titleBn || '').trim(),
                items: []
              }
            ]
          };
        }
        return g;
      })
    );
  };

  const updateSubGroup = (groupId, oldTitleBn, { titleBn, titleEn, targetGroupId }) => {
    setCategoryMasterGroups((prev) => {
      const destinationGroupId = targetGroupId || groupId;

      // If transferring to another master group
      if (destinationGroupId !== groupId) {
        let subGroupToTransfer = null;
        const cleaned = prev.map((g) => {
          if (g.id === groupId) {
            const found = g.subGroups.find((s) => s.titleBn === oldTitleBn);
            if (found) {
              subGroupToTransfer = {
                ...found,
                titleBn: (titleBn || oldTitleBn).trim(),
                titleEn: (titleEn || found.titleEn || titleBn || oldTitleBn).trim()
              };
            }
            return {
              ...g,
              subGroups: g.subGroups.filter((s) => s.titleBn !== oldTitleBn)
            };
          }
          return g;
        });

        if (subGroupToTransfer) {
          return cleaned.map((g) => {
            if (g.id === destinationGroupId) {
              return {
                ...g,
                subGroups: [...g.subGroups, subGroupToTransfer]
              };
            }
            return g;
          });
        }
        return cleaned;
      }

      // If updating within the same master group
      return prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            subGroups: g.subGroups.map((sub) =>
              sub.titleBn === oldTitleBn
                ? {
                    ...sub,
                    titleBn: (titleBn || '').trim(),
                    titleEn: (titleEn || sub.titleEn || '').trim()
                  }
                : sub
            )
          };
        }
        return g;
      });
    });
  };

  const deleteSubGroup = (groupId, titleBn) => {
    setCategoryMasterGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            subGroups: g.subGroups.filter((sub) => sub.titleBn !== titleBn)
          };
        }
        return g;
      })
    );
  };

  // Reset Master Groups and Categories to System Default
  const resetMasterGroupsToDefault = () => {
    setCategoryMasterGroups(initialCategoryMasterGroups);
    setCategories(initialCategories);
    safeRemoveLocalStorage('jonogon_master_groups');
    safeRemoveLocalStorage('jonogon_categories');
  };

  // Breaking News Actions
  const addBreakingItem = (item) => {
    setBreakingNews((prev) => [...prev, { ...item, id: `break-${Date.now()}` }]);
  };

  const deleteBreakingItem = (id) => {
    setBreakingNews((prev) => prev.filter((item) => item.id !== id));
  };

  // Podcast Actions
  const addPodcast = (pod) => {
    const podWithId = {
      ...pod,
      id: `pod-${Date.now()}`,
      dateBn: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      dateEn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setPodcasts((prev) => [podWithId, ...prev]);
  };

  const updatePodcast = (id, updatedData) => {
    setPodcasts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  const deletePodcast = (id) => {
    setPodcasts((prev) => prev.filter((p) => p.id !== id));
  };

  // Emergency Services Actions
  const addEmergencyService = (service) => {
    const itemWithId = {
      ...service,
      id: `srv-${Date.now()}`
    };
    setEmergencyServices((prev) => [itemWithId, ...prev]);
  };

  const updateEmergencyService = (id, updatedData) => {
    setEmergencyServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
  };

  const deleteEmergencyService = (id) => {
    setEmergencyServices((prev) => prev.filter((s) => s.id !== id));
  };

  // ==========================================
  // HOMEPAGE MODULAR SECTIONS ACTIONS
  // ==========================================
  const moveHomepageSection = (fromIndex, toIndex) => {
    setHomepageSections((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const setHomepageSectionsOrder = (newSectionsList) => {
    if (Array.isArray(newSectionsList)) {
      setHomepageSections(newSectionsList);
    }
  };

  const toggleHomepageSectionVisibility = (sectionId) => {
    setHomepageSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId ? { ...sec, isVisible: sec.isVisible === false ? true : false } : sec
      )
    );
  };

  const resetHomepageSectionsToDefault = () => {
    setHomepageSections(defaultHomepageSections);
    safeSetLocalStorage('jonogon_homepage_sections', defaultHomepageSections);
  };

  // 3-Column Grid Order Handlers
  const moveSectionColumn = (sectionId, fromIndex, toIndex) => {
    setSectionColumnsOrder((prev) => {
      const currentList = prev[sectionId] || defaultSectionColumnsOrder[sectionId] || ['col1', 'col2', 'col3'];
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= currentList.length || toIndex >= currentList.length) return prev;
      const updated = [...currentList];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return {
        ...prev,
        [sectionId]: updated
      };
    });
  };

  const setSectionColumnOrder = (sectionId, newOrder) => {
    if (Array.isArray(newOrder)) {
      setSectionColumnsOrder((prev) => ({
        ...prev,
        [sectionId]: newOrder
      }));
    }
  };

  const resetSectionColumns = (sectionId) => {
    if (sectionId) {
      setSectionColumnsOrder((prev) => ({
        ...prev,
        [sectionId]: defaultSectionColumnsOrder[sectionId] || ['heroCard', 'colA', 'colB']
      }));
    } else {
      setSectionColumnsOrder(defaultSectionColumnsOrder);
      safeSetLocalStorage('jonogon_section_columns', defaultSectionColumnsOrder);
    }
  };

  const updateSiteSettings = (newSettings) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      safeSetLocalStorage('jonogon_settings', merged);
      syncModuleToMariaDb('settings', merged).catch((err) => {
        console.warn('MariaDB site_settings sync notice:', err);
      });
      return merged;
    });
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const toggleAdminLanguage = () => {
    setAdminLanguage((prev) => {
      const next = prev === 'bn' ? 'en' : 'bn';
      safeSetLocalStorage('jonogon_admin_lang', next);
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleAdminTheme = () => {
    setAdminTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      safeSetLocalStorage('jonogon_admin_theme', next);
      return next;
    });
  };

  return (
    <NewsContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        adminLanguage,
        setAdminLanguage,
        toggleAdminLanguage,
        theme,
        toggleTheme,
        adminTheme,
        setAdminTheme,
        toggleAdminTheme,
        settings,
        updateSiteSettings,
        articles,
        setArticles,
        addArticle,
        updateArticle,
        deleteArticle,
        incrementViews,
        categories,
        categoryGroups,
        categoryMasterGroups,
        addCategory,
        updateCategory,
        deleteCategory,
        addCategoryToMasterGroup,
        updateCategoryInMasterGroup,
        deleteCategoryFromMasterGroup,
        addMasterGroup,
        updateMasterGroup,
        deleteMasterGroup,
        moveMasterGroup,
        reorderMasterGroups,
        addSubGroup,
        updateSubGroup,
        deleteSubGroup,
        moveSubGroupOrder,
        moveCategoryItemOrder,
        resetMasterGroupsToDefault,
        homepageSections,
        moveHomepageSection,
        setHomepageSectionsOrder,
        toggleHomepageSectionVisibility,
        resetHomepageSectionsToDefault,
        sectionColumnsOrder,
        moveSectionColumn,
        setSectionColumnOrder,
        updateSectionColumnsOrder: setSectionColumnOrder,
        resetSectionColumns,
        resetSectionColumnsOrder: resetSectionColumns,
        breakingNews,
        addBreakingItem,
        deleteBreakingItem,
        podcasts,
        addPodcast,
        updatePodcast,
        deletePodcast,
        podcastSubjects,
        selectedPodcastSubject,
        setSelectedPodcastSubject,
        emergencyServices,
        addEmergencyService,
        updateEmergencyService,
        deleteEmergencyService,
        activePage,
        setActivePage,
        navigateTo,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        currentArticle,
        setCurrentArticle,
        openArticle,
        goToHome,
        activePolicyModal,
        setActivePolicyModal,
        isAdminOpen,
        setIsAdminOpen,
        openAdmin,
        closeAdmin,
        userDistrict,
        setUserDistrict,
        liveWeather,
        isWeatherLoading,
        refreshWeather,

        // Global Branded Modal & Alert Dialog System
        dialogConfig,
        showAlert,
        showConfirm,
        showError,
        showSuccess,
        showWarning,
        closeDialog,

        // Global Upload Progress Modal System
        uploadProgress,
        showUploadProgress,
        updateUploadProgress,
        closeUploadProgress,
        refreshCategories,
        refreshAllModulesFromDb,
        syncModuleToMariaDb
      }}
    >
      {children}
      <AppDialogModal />
      <UploadProgressModal />
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
}
