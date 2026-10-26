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
  initialVideoNews,
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
  fetchSingleArticleFromMariaDb,
  fetchModuleFromMariaDb,
  syncModuleToMariaDb,
  savePodcastToMariaDb,
  deletePodcastFromMariaDb,
  fetchPodcastsFromMariaDb,
  fetchVideoNewsFromMariaDb,
  saveVideoNewsToMariaDb,
  deleteVideoNewsFromMariaDb,
  normalizeImageUrl
} from '../utils/mariaDbSync';
import { safeSetLocalStorage, safeGetLocalStorage, safeRemoveLocalStorage } from '../utils/safeStorage';
import {
  VIEW_CONFIG,
  getEffectiveViews,
  calculateNextViews
} from '../config/viewConfig';

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

  // 4. Articles Data (Strict DB Articles Priority & SWR Strategy)
  const [articles, setArticles] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_articles');
      if (saved && Array.isArray(saved) && saved.length > 0) {
        // Strict DB filter: Never return dummy mock fallback items from initialData
        const dbItems = saved.filter(
          (a) =>
            a.db_id ||
            a.postId ||
            (typeof a.id === 'string' &&
              !a.id.startsWith('hero-') &&
              !a.id.startsWith('lead-') &&
              !a.id.startsWith('latest-') &&
              !a.id.startsWith('probashi-') &&
              !a.id.startsWith('grid-') &&
              !a.id.startsWith('video-') &&
              a.id !== 'bd-main')
        );
        if (dbItems.length > 0) {
          const list = dbItems.map((a) => {
            const clean = normalizeImageUrl(a.imageUrl || a.featuredImage);
            return {
              ...a,
              views: getEffectiveViews(a),
              imageUrl: clean,
              featuredImage: clean,
              thumbnail_image: clean
            };
          });
          list.sort((a, b) => {
            const dateA = new Date(a.publishedAt || a.published_at || a.createdAt || a.created_at || 0).getTime();
            const dateB = new Date(b.publishedAt || b.published_at || b.createdAt || b.created_at || 0).getTime();
            return dateB - dateA;
          });
          return list;
        }
      }
    } catch (e) {
      console.warn('Error reading cached jonogon_articles', e);
    }
    // Return empty array initially so modern Skeleton Loader shows instead of dummy posts!
    return [];
  });

  // Fast SWR Loading State: If cached DB items exist, loading is false instantly
  const [isArticlesLoading, setIsArticlesLoading] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_articles');
      return !(Array.isArray(saved) && saved.length > 0);
    } catch (e) {
      return true;
    }
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
      if (saved && Array.isArray(saved) && saved.length > 0) {
        const map = new Map();
        for (const c of saved) {
          const key = c.slug || c.id;
          if (key && !map.has(key)) {
            map.set(key, c);
          }
        }
        const uniqueList = Array.from(map.values());
        if (uniqueList.length > 0) {
          if (uniqueList.length !== saved.length) {
            safeSetLocalStorage('jonogon_categories', uniqueList);
          }
          return uniqueList;
        }
      }
    } catch (e) { }
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
        } catch (e) { }
      }
    } catch (e) { }
  };

  const refreshArticles = async () => {
    try {
      const dbPosts = await fetchArticlesFromMariaDb({ status: 'all', admin: '1' });
      if (Array.isArray(dbPosts) && dbPosts.length > 0) {
        const processed = dbPosts.map((p) => ({
          ...p,
          views: getEffectiveViews(p)
        }));
        processed.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.published_at || a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.publishedAt || b.published_at || b.createdAt || b.created_at || 0).getTime();
          return dateB - dateA;
        });
        setArticles(processed);
        safeSetLocalStorage('jonogon_articles', processed);
      }
    } catch (e) {
      console.warn('Error refreshing articles:', e);
    } finally {
      setIsArticlesLoading(false);
    }
  };

  const refreshVideoNews = async () => {
    try {
      const dbVideos = await fetchVideoNewsFromMariaDb();
      if (Array.isArray(dbVideos) && dbVideos.length > 0) {
        setVideoNews(dbVideos);
        safeSetLocalStorage('jonogon_video_news', dbVideos);
      }
    } catch (e) {
      console.warn('Error refreshing video news from MariaDB:', e);
    }
  };

  const refreshPodcasts = async () => {
    try {
      const dbPods = await fetchPodcastsFromMariaDb();
      if (Array.isArray(dbPods) && dbPods.length > 0) {
        setPodcasts(dbPods);
        safeSetLocalStorage('jonogon_podcasts', dbPods);
      }
    } catch (e) { }
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
            if (data.adSlots && typeof data.adSlots === 'object') {
              merged.adSlots = { ...(merged.adSlots || {}), ...data.adSlots };
            }
            if (data.adSenseEnabled !== undefined) merged.adSenseEnabled = data.adSenseEnabled;
            if (data.adSenseClientId) {
              merged.adSenseClientId = data.adSenseClientId;
              merged.adsenseClientId = data.adSenseClientId;
            }
            safeSetLocalStorage('jonogon_settings', merged);
            return merged;
          });
          if (data.siteSettings.sectionColumnsOrder && typeof data.siteSettings.sectionColumnsOrder === 'object') {
            setSectionColumnsOrder((prev) => ({
              ...prev,
              ...data.siteSettings.sectionColumnsOrder
            }));
            safeSetLocalStorage('jonogon_section_columns', data.siteSettings.sectionColumnsOrder);
          }
        }
        if (data.adSlots && typeof data.adSlots === 'object' && Object.keys(data.adSlots).length > 0) {
          setSettings((prev) => {
            const merged = {
              ...prev,
              adSlots: { ...(prev.adSlots || {}), ...data.adSlots },
              ...(data.adSenseEnabled !== undefined ? { adSenseEnabled: data.adSenseEnabled } : {}),
              ...(data.adSenseClientId ? { adSenseClientId: data.adSenseClientId, adsenseClientId: data.adSenseClientId } : {})
            };
            safeSetLocalStorage('jonogon_settings', merged);
            return merged;
          });
        }
        if (Array.isArray(data.masterGroups) && data.masterGroups.length > 0) {
          const hasAnySubGroups = data.masterGroups.some((g) => Array.isArray(g.subGroups) && g.subGroups.length > 0);
          if (hasAnySubGroups) {
            setCategoryMasterGroups(data.masterGroups);
            safeSetLocalStorage('jonogon_master_groups', data.masterGroups);
          }
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
          const cleaned = data.emergencyServices.map((srv) => ({
            ...srv,
            nameBn: srv.nameBn ? String(srv.nameBn).replace(/\s*[\(\[\{][০-৯0-9\s-]+[\)\]\}]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim() : '',
            nameEn: srv.nameEn ? String(srv.nameEn).replace(/\s*[\(\[\{][০-৯0-9\s-]+[\)\]\}]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim() : ''
          }));
          setEmergencyServices(cleaned);
          safeSetLocalStorage('jonogon_emergency_services', cleaned);
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
    refreshPodcasts();
    refreshVideoNews();
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
    } catch (e) { }
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
    } catch (e) { }
    return initialPodcasts;
  });

  // 7-VN. Video News State (Shown in Homepage Video News Section)
  const [videoNews, setVideoNews] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_video_news');
      if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) { }
    return initialVideoNews || [];
  });

  // 7a. Podcast Subjects / Categories State
  const [podcastSubjectsState, setPodcastSubjectsState] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_podcast_subjects');
      if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) { }
    return podcastSubjects;
  });

  // Dynamically merge subjects from active podcasts
  const dynamicPodcastSubjects = useMemo(() => {
    const map = new Map();
    (podcastSubjectsState || []).forEach(sub => map.set(sub.id, sub));
    (podcasts || []).forEach(p => {
      const sId = p.subjectId || p.subject_id;
      const sBn = p.subjectBn || p.subject_bn;
      const sEn = p.subjectEn || p.subject_en;
      if (sId && sId !== 'all' && !map.has(sId)) {
        map.set(sId, {
          id: sId,
          nameBn: sBn || sId,
          nameEn: sEn || sId,
          iconType: sId
        });
      }
    });
    return Array.from(map.values());
  }, [podcastSubjectsState, podcasts]);

  const addPodcastSubject = (newSubject) => {
    const rawId = newSubject.id || newSubject.nameEn || newSubject.nameBn || `sub-${Date.now()}`;
    const slug = rawId
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const subjectItem = {
      id: slug || `sub-${Date.now()}`,
      nameBn: newSubject.nameBn || newSubject.titleBn || '',
      nameEn: newSubject.nameEn || newSubject.titleEn || newSubject.nameBn || '',
      iconType: newSubject.iconType || 'all'
    };
    setPodcastSubjectsState((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.some(s => s.id === subjectItem.id || s.nameBn === subjectItem.nameBn)) return list;
      const updated = [...list, subjectItem];
      safeSetLocalStorage('jonogon_podcast_subjects', updated);
      syncModuleToMariaDb('podcastSubjects', updated).catch(() => {});
      return updated;
    });
    return subjectItem;
  };

  // 7b. Emergency Services Data (BD Govt & Emergency Services)
  const [emergencyServices, setEmergencyServices] = useState(() => {
    try {
      const saved = safeGetLocalStorage('jonogon_emergency_services');
      if (saved && Array.isArray(saved) && saved.length > 0) {
        const map = new Map();
        for (const srv of saved) {
          const key = srv.service_id || srv.id;
          if (key && !map.has(key)) {
            map.set(key, {
              ...srv,
              nameBn: srv.nameBn ? String(srv.nameBn).replace(/\s*[\(\[\{][০-৯0-9\s-]+[\)\]\}]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim() : '',
              nameEn: srv.nameEn ? String(srv.nameEn).replace(/\s*[\(\[\{][০-৯0-9\s-]+[\)\]\}]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim() : ''
            });
          }
        }
        const uniqueList = Array.from(map.values());
        if (uniqueList.length > 0) {
          if (uniqueList.length !== saved.length) {
            safeSetLocalStorage('jonogon_emergency_services', uniqueList);
          }
          return uniqueList;
        }
      }
    } catch (e) { }
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
    const newsMatch = path.match(/(?:news|article|p)\/([^/?#]+)/i);
    const newsParam = params.get('news') || params.get('article') || params.get('id');
    const catMatch = path.match(/category\/([^/?#]+)/i);
    const catParam = params.get('cat') || params.get('category');

    if (path === '/admin' || path === '/admin/' || path.includes('/admin')) {
      return { page: 'admin', isAdmin: true, category: 'latest', articleSlug: null };
    }
    if (newsMatch) {
      return { page: 'article', isAdmin: false, category: 'latest', articleSlug: decodeURIComponent(newsMatch[1].trim()) };
    }
    if (newsParam) {
      return { page: 'article', isAdmin: false, category: 'latest', articleSlug: decodeURIComponent(newsParam.trim()) };
    }
    if (catMatch) {
      return { page: 'category', isAdmin: false, category: decodeURIComponent(catMatch[1].trim()), articleSlug: null };
    }
    if (catParam) {
      return { page: 'category', isAdmin: false, category: decodeURIComponent(catParam.trim()), articleSlug: null };
    }
    if (path.includes('/about')) return { page: 'about', isAdmin: false, category: 'latest', articleSlug: null };
    if (path.includes('/contact')) return { page: 'contact', isAdmin: false, category: 'latest', articleSlug: null };
    if (path.includes('/advertisement') || path.includes('/advertise')) return { page: 'advertisement', isAdmin: false, category: 'latest', articleSlug: null };
    if (path.includes('/editorial')) return { page: 'editorial', isAdmin: false, category: 'latest', articleSlug: null };
    if (path.includes('/privacy')) return { page: 'privacy', isAdmin: false, category: 'latest', articleSlug: null };
    if (path.includes('/terms')) return { page: 'terms', isAdmin: false, category: 'latest', articleSlug: null };
    if (path.includes('/founder') || path.includes('/editor') || path.includes('/biplob-hossain')) return { page: 'founder', isAdmin: false, category: 'latest', articleSlug: null };
    if (path.includes('/team') || path.includes('/our-team')) return { page: 'team', isAdmin: false, category: 'latest', articleSlug: null };

    return { page: 'home', isAdmin: false, category: 'latest', articleSlug: null };
  };

  const initialRoute = useMemo(() => getInitialRouteState(), []);
  const [activePage, setActivePage] = useState(initialRoute.page);
  const [activeCategory, setActiveCategoryState] = useState(initialRoute.category);
  const [selectedPodcastSubject, setSelectedPodcastSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentArticle, setCurrentArticle] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_ARTICLE__) {
      return window.__INITIAL_ARTICLE__;
    }
    return null;
  });
  const [isSingleArticleLoading, setIsSingleArticleLoading] = useState(false);
  const [articleNotFound, setArticleNotFound] = useState(false);
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
    if (typeof window === 'undefined') return;
    const path = window.location.pathname || '';
    const params = new URLSearchParams(window.location.search);
    const newsMatch = path.match(/(?:news|article|p)\/([^/?#]+)/i);
    const newsParam = params.get('news') || params.get('article') || params.get('id');
    const targetSlug = newsMatch ? decodeURIComponent(newsMatch[1].trim()) : (newsParam ? decodeURIComponent(newsParam.trim()) : null);
    const catMatch = path.match(/category\/([^/?#]+)/i);
    const catParam = params.get('cat') || params.get('category');

    if (path === '/admin' || path === '/admin/' || path.includes('/admin')) {
      setIsAdminOpen(true);
      setActivePage('admin');
      setCurrentArticle(null);
      return;
    }

    // Clear admin if navigated to non-admin path
    setIsAdminOpen(false);

    // 1. Target Article Route (/news/:id, /article/:id, ?news=..., ?id=...)
    if (targetSlug) {
      // Check preloaded window.__INITIAL_ARTICLE__ from share.php (0ms hydration)
      if (window.__INITIAL_ARTICLE__ && typeof window.__INITIAL_ARTICLE__ === 'object') {
        const initArt = window.__INITIAL_ARTICLE__;
        window.__INITIAL_ARTICLE__ = null;
        setCurrentArticle(initArt);
        setActivePage('article');
        setArticleNotFound(false);
        incrementViews(initArt.id || initArt.postId || initArt.db_id);
        return;
      }

      // Check currentArticle state if already matches target
      if (currentArticle) {
        const cDbId = String(currentArticle.db_id || '');
        const cId = String(currentArticle.id || '');
        const cPostId = String(currentArticle.postId || currentArticle.post_id || '');
        const cSlug = String(currentArticle.slug || '');
        const tLower = targetSlug.toLowerCase();
        if (cDbId === targetSlug || cId.toLowerCase() === tLower || cPostId.toLowerCase() === tLower || cSlug.toLowerCase() === tLower) {
          setActivePage('article');
          setArticleNotFound(false);
          return;
        }
      }

      // Check in loaded articles
      const isMatch = (a) => {
        if (!a) return false;
        const s = targetSlug.toLowerCase();
        return (
          String(a.db_id) === targetSlug ||
          String(a.id || '').toLowerCase() === s ||
          String(a.postId || a.post_id || '').toLowerCase() === s ||
          String(a.slug || '').toLowerCase() === s ||
          String(a.titleBn || '').trim() === targetSlug ||
          String(a.titleEn || '').toLowerCase() === s
        );
      };

      const found = (articles || []).find(isMatch);
      if (found) {
        if (!isAdminOpen && found.status && found.status !== 'published' && found.status !== 'approved') {
          setCurrentArticle(null);
          setActivePage('home');
          return;
        }
        setCurrentArticle(found);
        setActivePage('article');
        setArticleNotFound(false);
        incrementViews(found.id || found.postId || found.db_id);
        return;
      }

      // Direct Link / Cold Start / Shared Link from WhatsApp/Facebook:
      // Keep on 'article' view, show sleek shimmer, and fetch directly from MariaDB API
      setActivePage('article');
      setIsSingleArticleLoading(true);
      setArticleNotFound(false);

      fetchSingleArticleFromMariaDb(targetSlug)
        .then((fetched) => {
          if (fetched && (fetched.status === 'published' || fetched.status === 'approved' || !fetched.status || isAdminOpen)) {
            const processed = { ...fetched, views: getEffectiveViews(fetched) };
            setCurrentArticle(processed);
            setArticleNotFound(false);
            incrementViews(processed.id || processed.postId || processed.db_id);
          } else {
            setArticleNotFound(true);
          }
        })
        .catch((err) => {
          console.warn('Failed to load article from DB:', err);
          setArticleNotFound(true);
        })
        .finally(() => {
          setIsSingleArticleLoading(false);
        });
      return;
    }

    // 2. Category Route
    if (catMatch || catParam) {
      const slug = catMatch ? decodeURIComponent(catMatch[1].trim()) : decodeURIComponent(catParam.trim());
      setActiveCategoryState(slug);
      setActivePage('category');
      setCurrentArticle(null);
      return;
    }

    // 3. Static Pages
    if (path.includes('/about')) { setActivePage('about'); setCurrentArticle(null); return; }
    if (path.includes('/advertisement') || path.includes('/advertise')) { setActivePage('advertisement'); setCurrentArticle(null); return; }
    if (path.includes('/contact')) { setActivePage('contact'); setCurrentArticle(null); return; }
    if (path.includes('/editorial')) { setActivePage('editorial'); setCurrentArticle(null); return; }
    if (path.includes('/privacy')) { setActivePage('privacy'); setCurrentArticle(null); return; }
    if (path.includes('/terms')) { setActivePage('terms'); setCurrentArticle(null); return; }
    if (path.includes('/founder') || path.includes('/editor') || path.includes('/biplob-hossain')) { setActivePage('founder'); setCurrentArticle(null); return; }
    if (path.includes('/team') || path.includes('/our-team')) { setActivePage('team'); setCurrentArticle(null); return; }

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

  // Navigate to Dedicated Full Article Page with Short SEO URL (/news/:id)
  const openArticle = (art) => {
    if (!art) return;
    if (!isAdminOpen && art.status && art.status !== 'published' && art.status !== 'approved') {
      console.warn('Cannot open draft/unpublished article publicly');
      return;
    }
    incrementViews(art.id || art.postId || art.db_id);
    setCurrentArticle(art);
    setActivePage('article');
    setIsAdminOpen(false);
    setArticleNotFound(false);
    // Short SEO-friendly canonical identifier (db_id or id)
    const shortId = art.db_id || art.id || art.slug;
    window.history.pushState({ page: 'article', articleId: art.id, slug: shortId }, '', `/news/${shortId}`);
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
    } else if (cleanPath === '/team' || cleanPath === '/our-team' || cleanPath === '/editorial-team' || cleanPath === '/editorial-board') {
      setActivePage('team');
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
        if (!isAdminOpen && found.status && found.status !== 'published' && found.status !== 'approved') {
          setCurrentArticle(null);
          setActivePage('home');
        } else {
          setCurrentArticle(found);
          setActivePage('article');
        }
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
      }).catch(() => { });
    }
  }, [categoryMasterGroups]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_categories', categories);
    if (isHydratedFromDbRef.current && categories?.length > 0) {
      syncModuleToMariaDb('categories', {
        masterGroups: categoryMasterGroups,
        categories
      }).catch(() => { });
    }
  }, [categories]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_breaking', breakingNews);
  }, [breakingNews]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_podcasts', podcasts);
    if (isHydratedFromDbRef.current && podcasts?.length > 0) {
      syncModuleToMariaDb('podcasts', podcasts).catch(() => { });
    }
  }, [podcasts]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_emergency_services', emergencyServices);
    if (isHydratedFromDbRef.current && emergencyServices?.length > 0) {
      syncModuleToMariaDb('emergency', emergencyServices).catch(() => { });
    }
  }, [emergencyServices]);

  useEffect(() => {
    safeSetLocalStorage('jonogon_homepage_sections', homepageSections);
    if (isHydratedFromDbRef.current && homepageSections?.length > 0) {
      syncModuleToMariaDb('sections', homepageSections).catch(() => { });
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
    // 1. Synchronously find current full article from state or localStorage
    const savedArticles = safeGetLocalStorage('jonogon_articles') || [];
    const sourceList = Array.isArray(articles) && articles.length > 0 ? articles : (Array.isArray(savedArticles) ? savedArticles : []);
    const existing = sourceList.find(
      (item) =>
        String(item.id) === String(id) ||
        String(item.post_id) === String(id) ||
        String(item.postId) === String(id) ||
        String(item.db_id) === String(id) ||
        item.slug === id
    ) || {};

    const fullArticle = { ...existing, ...updatedData, id: existing.id || id };

    // 2. Synchronously update state and local storage
    setArticles((prev) => {
      let found = false;
      const next = (Array.isArray(prev) ? prev : []).map((item) => {
        if (
          String(item.id) === String(id) ||
          String(item.post_id) === String(id) ||
          String(item.postId) === String(id) ||
          item.slug === id
        ) {
          found = true;
          return { ...item, ...updatedData };
        }
        return item;
      });
      if (!found) {
        const updated = [fullArticle, ...next];
        safeSetLocalStorage('jonogon_articles', updated);
        return updated;
      }
      safeSetLocalStorage('jonogon_articles', next);
      return next;
    });

    if (currentArticle && (String(currentArticle.id) === String(id) || currentArticle.slug === id)) {
      setCurrentArticle((prev) => ({ ...prev, ...updatedData }));
    }

    // 3. Persist to MariaDB with complete payload
    try {
      const res = await saveArticleToMariaDb(fullArticle);
      return res;
    } catch (err) {
      console.warn('MariaDB update sync error:', err);
      return { success: false, error: err?.message };
    }
  };

  const deleteArticle = (id, postId) => {
    setArticles((prev) => prev.filter((item) => item.id !== id && (!postId || item.id !== postId)));
    deleteArticleFromMariaDb(id).catch((err) => {
      console.warn('MariaDB delete sync error:', err);
    });
    if (postId && postId !== id) {
      deleteArticleFromMariaDb(postId).catch(() => { });
    }
    if (currentArticle && (currentArticle.id === id || (postId && currentArticle.id === postId))) {
      goToHome();
    }
  };

  // =========================================================================
  // 🚀 SMART VIEW COUNTER (১ম ১০ মিনিটে অটো ২০০ ভিউ, <২০০০ এ ৫ গুণ, >২০০০ এ ১ গুণ)
  // আপনি যেকোনো সময় নিয়ম পরিবর্তন করতে দেখতে পারেন: src/config/viewConfig.js
  // =========================================================================
  const incrementViews = (id, count) => {
    if (!id) return;

    setArticles((prev) =>
      prev.map((item) => {
        if (item.id === id || item.postId === id || item.slug === id) {
          const current = getEffectiveViews(item);
          const next = typeof count === 'number' ? current + count : calculateNextViews(current);
          return { ...item, views: next };
        }
        return item;
      })
    );

    if (currentArticle && (currentArticle.id === id || currentArticle.postId === id || currentArticle.slug === id)) {
      setCurrentArticle((prev) => {
        if (!prev) return prev;
        const current = getEffectiveViews(prev);
        const next = typeof count === 'number' ? current + count : calculateNextViews(current);
        return { ...prev, views: next };
      });
    }

    // Persist view to MariaDB
    try {
      const endpoints = [
        `/api/news.php?action=view&id=${encodeURIComponent(id)}`,
        `/janogon/api/news.php?action=view&id=${encodeURIComponent(id)}`
      ];
      if (typeof window !== 'undefined' && window.location.origin) {
        endpoints.unshift(`${window.location.origin}/api/news.php?action=view&id=${encodeURIComponent(id)}`);
      }
      (async () => {
        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, { method: 'POST' });
            if (res.ok) break;
          } catch (_) {}
        }
      })();
    } catch (e) {
      console.warn('MariaDB view sync notice:', e);
    }
  };

  // ==========================================
  // DYNAMIC CATEGORY & MASTER GROUP CRUD ACTIONS
  // ==========================================

  // Persistent MariaDB & LocalStorage sync helper for master groups
  const persistAndSyncMasterGroups = (updatedGroups, updatedCats = categories) => {
    safeSetLocalStorage('jonogon_master_groups', updatedGroups);
    syncModuleToMariaDb('categories', {
      masterGroups: updatedGroups,
      categories: updatedCats
    }).catch((err) => console.warn('MariaDB menu sync notice:', err));
  };

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

      persistAndSyncMasterGroups(updated);
      return updated;
    });

    // 2. Sync to flat categories list
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === newId);
      let updated;
      if (exists) {
        updated = prev.map((c) => (c.id === newId ? newCategoryObj : c));
      } else {
        updated = [...prev, newCategoryObj];
      }
      safeSetLocalStorage('jonogon_categories', updated);
      return updated;
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

      persistAndSyncMasterGroups(cleaned);
      return cleaned;
    });

    // 2. Sync to flat categories list
    setCategories((prev) => {
      const filtered = prev.filter((c) => c.id !== categoryId && c.id !== updatedId);
      const updated = [...filtered, updatedCategoryObj];
      safeSetLocalStorage('jonogon_categories', updated);
      return updated;
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
    setCategoryMasterGroups((prevGroups) => {
      const updated = prevGroups.map((grp) => ({
        ...grp,
        subGroups: grp.subGroups.map((sub) => ({
          ...sub,
          items: sub.items.filter((it) => it.id !== categoryId)
        }))
      }));
      persistAndSyncMasterGroups(updated);
      return updated;
    });

    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== categoryId);
      safeSetLocalStorage('jonogon_categories', updated);
      return updated;
    });
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
    setCategoryMasterGroups((prev) => {
      const updated = [
        ...prev,
        {
          id: newId,
          nameBn: (nameBn || '').trim(),
          nameEn: (nameEn || nameBn || '').trim(),
          orderIndex: prev.length,
          subGroups: [
            {
              titleBn: 'সাধারণ',
              titleEn: 'General',
              items: []
            }
          ]
        }
      ].map((g, idx) => ({ ...g, orderIndex: idx }));
      persistAndSyncMasterGroups(updated);
      return updated;
    });
  };

  const updateMasterGroup = (groupId, { nameBn, nameEn, targetPosition }) => {
    setCategoryMasterGroups((prev) => {
      let updated = prev.map((g) =>
        g.id === groupId
          ? { ...g, nameBn: (nameBn || '').trim(), nameEn: (nameEn || g.nameEn || '').trim() }
          : g
      );
      if (typeof targetPosition === 'number' && targetPosition >= 0 && targetPosition < updated.length) {
        const fromIndex = updated.findIndex((g) => g.id === groupId);
        if (fromIndex >= 0 && fromIndex !== targetPosition) {
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(targetPosition, 0, moved);
        }
      }
      const reindexed = updated.map((g, idx) => ({ ...g, orderIndex: idx }));
      persistAndSyncMasterGroups(reindexed);
      return reindexed;
    });
  };

  const deleteMasterGroup = (groupId) => {
    setCategoryMasterGroups((prev) => {
      const updated = prev.filter((g) => g.id !== groupId).map((g, idx) => ({ ...g, orderIndex: idx }));
      persistAndSyncMasterGroups(updated);
      return updated;
    });
  };

  const moveMasterGroup = (fromIndex, toIndex) => {
    setCategoryMasterGroups((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const reindexed = updated.map((g, idx) => ({ ...g, orderIndex: idx }));
      persistAndSyncMasterGroups(reindexed);
      return reindexed;
    });
  };

  const reorderMasterGroups = (newGroups) => {
    const reindexed = (newGroups || []).map((g, idx) => ({ ...g, orderIndex: idx }));
    setCategoryMasterGroups(reindexed);
    persistAndSyncMasterGroups(reindexed);
  };

  const moveSubGroupOrder = (groupId, fromIndex, toIndex) => {
    setCategoryMasterGroups((prev) => {
      const updated = prev.map((g) => {
        if (g.id === groupId) {
          const subs = [...g.subGroups];
          if (fromIndex < 0 || toIndex < 0 || fromIndex >= subs.length || toIndex >= subs.length) return g;
          const [moved] = subs.splice(fromIndex, 1);
          subs.splice(toIndex, 0, moved);
          return { ...g, subGroups: subs };
        }
        return g;
      });
      persistAndSyncMasterGroups(updated);
      return updated;
    });
  };

  const moveCategoryItemOrder = (groupId, subGroupTitleBn, fromIndex, toIndex) => {
    setCategoryMasterGroups((prev) => {
      const updated = prev.map((g) => {
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
      });
      persistAndSyncMasterGroups(updated);
      return updated;
    });
  };

  // Sub-Group Operations
  const addSubGroup = (groupId, { titleBn, titleEn }) => {
    setCategoryMasterGroups((prev) => {
      const updated = prev.map((g) => {
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
      });
      persistAndSyncMasterGroups(updated);
      return updated;
    });
  };

  const updateSubGroup = (groupId, oldTitleBn, { titleBn, titleEn, targetGroupId }) => {
    setCategoryMasterGroups((prev) => {
      const destinationGroupId = targetGroupId || groupId;
      let updated;
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
          updated = cleaned.map((g) => {
            if (g.id === destinationGroupId) {
              return {
                ...g,
                subGroups: [...g.subGroups, subGroupToTransfer]
              };
            }
            return g;
          });
        } else {
          updated = cleaned;
        }
      } else {
        updated = prev.map((g) => {
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
      }
      persistAndSyncMasterGroups(updated);
      return updated;
    });
  };

  const deleteSubGroup = (groupId, titleBn) => {
    setCategoryMasterGroups((prev) => {
      const updated = prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            subGroups: g.subGroups.filter((sub) => sub.titleBn !== titleBn)
          };
        }
        return g;
      });
      persistAndSyncMasterGroups(updated);
      return updated;
    });
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
  const addPodcast = async (pod) => {
    const podId = pod.id || `pod-${Date.now()}`;
    let thumb = pod.thumbnail || '';
    let ytId = pod.youtubeId || pod.youtube_id;
    const ytUrl = pod.youtubeUrl || pod.youtube_url || '';
    if (!ytId && ytUrl) {
      const match = ytUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) ytId = match[1];
    }
    if (ytId && (!thumb || thumb.includes('unsplash.com'))) {
      thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    const podWithId = {
      ...pod,
      id: podId,
      podcast_id: podId,
      youtubeId: ytId || pod.youtubeId,
      youtubeUrl: ytUrl,
      thumbnail: thumb,
      dateBn: pod.dateBn || new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      dateEn: pod.dateEn || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setPodcasts((prev) => [podWithId, ...(Array.isArray(prev) ? prev : [])]);
    safeSetLocalStorage('jonogon_podcasts', [podWithId, ...(Array.isArray(podcasts) ? podcasts : [])]);

    try {
      const res = await savePodcastToMariaDb(podWithId);
      syncModuleToMariaDb('podcasts', [podWithId, ...(Array.isArray(podcasts) ? podcasts : [])]).catch(() => { });
      return res;
    } catch (err) {
      console.warn('Podcast MariaDB save error:', err);
      return { success: false, error: err?.message };
    }
  };

  const updatePodcast = async (id, updatedData) => {
    let fullPod = null;
    let nextList = [];
    let thumb = updatedData.thumbnail;
    let ytId = updatedData.youtubeId || updatedData.youtube_id;
    const ytUrl = updatedData.youtubeUrl || updatedData.youtube_url;
    if (!ytId && ytUrl) {
      const match = ytUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) ytId = match[1];
    }
    if (ytId && (!thumb || thumb.includes('unsplash.com'))) {
      thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    const cleanUpdated = {
      ...updatedData,
      ...(ytId ? { youtubeId: ytId } : {}),
      ...(thumb ? { thumbnail: thumb } : {})
    };

    setPodcasts((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      let found = false;
      nextList = list.map((p) => {
        if (p.id === id || p.podcast_id === id) {
          found = true;
          fullPod = { ...p, ...cleanUpdated, id, podcast_id: id };
          return fullPod;
        }
        return p;
      });
      if (!found) {
        fullPod = { ...cleanUpdated, id, podcast_id: id };
        nextList = [fullPod, ...list];
      }
      return nextList;
    });

    const payload = fullPod || { ...cleanUpdated, id, podcast_id: id };
    safeSetLocalStorage('jonogon_podcasts', nextList);

    try {
      const res = await savePodcastToMariaDb(payload);
      syncModuleToMariaDb('podcasts', nextList).catch(() => { });
      return res;
    } catch (err) {
      console.warn('Podcast update MariaDB save error:', err);
      return { success: false, error: err?.message };
    }
  };

  const deletePodcast = async (id) => {
    let remaining = [];
    setPodcasts((prev) => {
      remaining = (Array.isArray(prev) ? prev : []).filter((p) => p.id !== id && p.podcast_id !== id);
      return remaining;
    });
    safeSetLocalStorage('jonogon_podcasts', remaining);

    try {
      const res = await deletePodcastFromMariaDb(id);
      syncModuleToMariaDb('podcasts', remaining).catch(() => { });
      return res;
    } catch (err) {
      console.warn('Podcast delete MariaDB error:', err);
      return false;
    }
  };

  // Video News Actions
  const addVideoNews = async (item) => {
    const vId = item.id || `vnews-${Date.now()}`;
    let thumb = item.imageUrl || item.thumbnail || '';
    let ytId = item.youtubeId || item.youtube_id;
    const ytUrl = item.youtubeUrl || item.youtube_url || item.videoUrl || '';
    if (!ytId && ytUrl) {
      const match = ytUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) ytId = match[1];
    }
    if (ytId && (!thumb || thumb.includes('unsplash.com'))) {
      thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    const newItem = {
      ...item,
      id: vId,
      youtubeId: ytId || item.youtubeId || '',
      youtubeUrl: ytUrl,
      imageUrl: thumb || item.imageUrl || 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80',
      thumbnail: thumb || item.thumbnail,
      videoDuration: item.videoDuration || item.duration || '২:৩০',
      dateBn: item.dateBn || new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      dateEn: item.dateEn || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setVideoNews((prev) => {
      const updated = [newItem, ...(Array.isArray(prev) ? prev : [])];
      safeSetLocalStorage('jonogon_video_news', updated);
      syncModuleToMariaDb('videoNews', updated).catch(() => {});
      saveVideoNewsToMariaDb(newItem).catch((err) => console.warn('MariaDB videoNews sync notice:', err));
      return updated;
    });
    return newItem;
  };

  const updateVideoNews = async (id, updatedData) => {
    let thumb = updatedData.imageUrl || updatedData.thumbnail;
    let ytId = updatedData.youtubeId || updatedData.youtube_id;
    const ytUrl = updatedData.youtubeUrl || updatedData.youtube_url || updatedData.videoUrl;
    if (!ytId && ytUrl) {
      const match = ytUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) ytId = match[1];
    }
    if (ytId && (!thumb || thumb.includes('unsplash.com'))) {
      thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    const cleanUpdated = {
      ...updatedData,
      ...(ytId ? { youtubeId: ytId } : {}),
      ...(thumb ? { imageUrl: thumb, thumbnail: thumb } : {}),
      ...(updatedData.duration ? { videoDuration: updatedData.duration } : {})
    };

    setVideoNews((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const updated = list.map((item) => (item.id === id ? { ...item, ...cleanUpdated } : item));
      safeSetLocalStorage('jonogon_video_news', updated);
      syncModuleToMariaDb('videoNews', updated).catch(() => {});
      saveVideoNewsToMariaDb({ ...cleanUpdated, id }).catch((err) => console.warn('MariaDB videoNews sync notice:', err));
      return updated;
    });
    return { success: true };
  };

  const deleteVideoNews = async (id) => {
    setVideoNews((prev) => {
      const remaining = (Array.isArray(prev) ? prev : []).filter((item) => item.id !== id);
      safeSetLocalStorage('jonogon_video_news', remaining);
      syncModuleToMariaDb('videoNews', remaining).catch(() => {});
      deleteVideoNewsFromMariaDb(id).catch((err) => console.warn('MariaDB videoNews delete notice:', err));
      return remaining;
    });
    return { success: true };
  };

  // Emergency Services Actions
  const addEmergencyService = (service) => {
    const itemWithId = {
      ...service,
      id: `srv-${Date.now()}`,
      nameBn: service.nameBn ? String(service.nameBn).replace(/\s*[\(\[\{][০-৯0-9\s-]+[\)\]\}]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim() : '',
      nameEn: service.nameEn ? String(service.nameEn).replace(/\s*[\(\[\{][০-৯0-9\s-]+[\)\]\}]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim() : ''
    };
    setEmergencyServices((prev) => {
      const nextList = [itemWithId, ...prev];
      safeSetLocalStorage('jonogon_emergency_services', nextList);
      syncModuleToMariaDb('emergencyServices', nextList).catch(() => {});
      return nextList;
    });
  };

  const updateEmergencyService = (id, updatedData) => {
    const cleaned = {
      ...updatedData,
      ...(updatedData.nameBn ? { nameBn: String(updatedData.nameBn).replace(/\s*[\(\[\{][০-৯0-9\s-]+[\)\]\}]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim() } : {}),
      ...(updatedData.nameEn ? { nameEn: String(updatedData.nameEn).replace(/\s*[\(\[\{][০-৯0-9\s-]+[\)\]\}]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim() } : {})
    };
    setEmergencyServices((prev) => {
      const nextList = prev.map((s) => (s.id === id ? { ...s, ...cleaned } : s));
      safeSetLocalStorage('jonogon_emergency_services', nextList);
      syncModuleToMariaDb('emergencyServices', nextList).catch(() => {});
      return nextList;
    });
  };

  const deleteEmergencyService = (id) => {
    setEmergencyServices((prev) => {
      const nextList = prev.filter((s) => s.id !== id);
      safeSetLocalStorage('jonogon_emergency_services', nextList);
      syncModuleToMariaDb('emergencyServices', nextList).catch(() => {});
      return nextList;
    });
  };

  // ==========================================
  // HOMEPAGE MODULAR SECTIONS ACTIONS
  // ==========================================
  const persistAndSyncHomepageSections = (updatedSections) => {
    safeSetLocalStorage('jonogon_homepage_sections', updatedSections);
    syncModuleToMariaDb('sections', updatedSections).catch((err) =>
      console.warn('MariaDB homepage sections sync notice:', err)
    );
  };

  const moveHomepageSection = (fromIndex, toIndex) => {
    setHomepageSections((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const reindexed = updated.map((sec, idx) => ({ ...sec, orderIndex: idx }));
      persistAndSyncHomepageSections(reindexed);
      return reindexed;
    });
  };

  const setHomepageSectionsOrder = (newSectionsList) => {
    if (Array.isArray(newSectionsList)) {
      const reindexed = newSectionsList.map((sec, idx) => ({ ...sec, orderIndex: idx }));
      setHomepageSections(reindexed);
      persistAndSyncHomepageSections(reindexed);
    }
  };

  const toggleHomepageSectionVisibility = (sectionId) => {
    setHomepageSections((prev) => {
      const updated = prev.map((sec) =>
        sec.id === sectionId ? { ...sec, isVisible: sec.isVisible === false ? true : false } : sec
      );
      persistAndSyncHomepageSections(updated);
      return updated;
    });
  };

  const resetHomepageSectionsToDefault = () => {
    const reindexed = defaultHomepageSections.map((sec, idx) => ({ ...sec, orderIndex: idx }));
    setHomepageSections(reindexed);
    persistAndSyncHomepageSections(reindexed);
  };

  // 3-Column Grid Order Handlers
  const moveSectionColumn = (sectionId, fromIndex, toIndex) => {
    setSectionColumnsOrder((prev) => {
      const currentList = prev[sectionId] || defaultSectionColumnsOrder[sectionId] || ['col1', 'col2', 'col3'];
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= currentList.length || toIndex >= currentList.length) return prev;
      const updatedList = [...currentList];
      const [moved] = updatedList.splice(fromIndex, 1);
      updatedList.splice(toIndex, 0, moved);
      const updated = {
        ...prev,
        [sectionId]: updatedList
      };
      safeSetLocalStorage('jonogon_section_columns', updated);
      syncModuleToMariaDb('siteSettings', { sectionColumnsOrder: updated }).catch(() => {});
      return updated;
    });
  };

  const setSectionColumnOrder = (sectionId, newOrder) => {
    if (Array.isArray(newOrder)) {
      setSectionColumnsOrder((prev) => {
        const updated = {
          ...prev,
          [sectionId]: newOrder
        };
        safeSetLocalStorage('jonogon_section_columns', updated);
        syncModuleToMariaDb('siteSettings', { sectionColumnsOrder: updated }).catch(() => {});
        return updated;
      });
    }
  };

  const resetSectionColumns = (sectionId) => {
    setSectionColumnsOrder((prev) => {
      let updated;
      if (sectionId) {
        updated = {
          ...prev,
          [sectionId]: defaultSectionColumnsOrder[sectionId] || ['heroCard', 'colA', 'colB']
        };
      } else {
        updated = defaultSectionColumnsOrder;
      }
      safeSetLocalStorage('jonogon_section_columns', updated);
      syncModuleToMariaDb('siteSettings', { sectionColumnsOrder: updated }).catch(() => {});
      return updated;
    });
  };

  const updateSiteSettings = (newSettings) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      safeSetLocalStorage('jonogon_settings', merged);
      syncModuleToMariaDb('settings', merged).catch((err) => {
        console.warn('MariaDB site_settings sync notice:', err);
      });
      if (newSettings.adSlots || newSettings.adSenseEnabled !== undefined || newSettings.adsenseClientId || newSettings.adSenseClientId) {
        syncModuleToMariaDb('ads', {
          adSlots: newSettings.adSlots || merged.adSlots,
          adSenseEnabled: newSettings.adSenseEnabled !== undefined ? newSettings.adSenseEnabled : merged.adSenseEnabled,
          adsenseClientId: newSettings.adsenseClientId || newSettings.adSenseClientId || merged.adsenseClientId || merged.adSenseClientId || ''
        }).catch((err) => {
          console.warn('MariaDB ads sync notice:', err);
        });
      }
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
        isArticlesLoading,
        addArticle,
        updateArticle,
        deleteArticle,
        incrementViews,
        VIEW_CONFIG,
        getEffectiveViews,
        calculateNextViews,
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
        videoNews,
        addVideoNews,
        updateVideoNews,
        deleteVideoNews,
        podcastSubjects: dynamicPodcastSubjects,
        addPodcastSubject,
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
        isSingleArticleLoading,
        articleNotFound,
        setArticleNotFound,
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
        refreshArticles,
        refreshCategories,
        refreshPodcasts,
        refreshAllModulesFromDb,
        savePodcastToMariaDb,
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
