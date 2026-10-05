import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialSiteSettings,
  initialCategories,
  categoryGroups,
  categoryMasterGroups as initialCategoryMasterGroups,
  initialBreakingNews,
  initialNewsArticles,
  initialPodcasts,
  podcastSubjects,
  initialEmergencyServices,
  bangladeshDistricts
} from '../data/initialData';
import { supabase, configureSupabase } from '../supabase';
import { fetchLiveGoogleWeather, getDefaultWeather } from '../services/weatherService';

const NewsContext = createContext();

export function NewsProvider({ children }) {
  // 1. Language State (Bangla Default)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('jonogon_lang') || 'bn';
  });

  // 2. Theme State (Light / Dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('jonogon_theme') || 'light';
  });

  // 3. Site Branding & Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('jonogon_settings');
    return saved ? JSON.parse(saved) : initialSiteSettings;
  });

  // 4. Articles Data (Auto-heal broken URLs if any cached)
  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem('jonogon_articles');
    const list = saved ? JSON.parse(saved) : initialNewsArticles;
    return list.map((a) => {
      if (a.imageUrl && a.imageUrl.includes('photo-1527018607619-a508a2be00be')) {
        return { ...a, imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=80' };
      }
      return a;
    });
  });

  // 5. Category Master Groups (10 Master Groups with Sub-Groups & Category Items)
  const [categoryMasterGroups, setCategoryMasterGroups] = useState(() => {
    const saved = localStorage.getItem('jonogon_master_groups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
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
                localStorage.setItem('jonogon_master_groups', JSON.stringify(parsed));
              }
            }
          }
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing master groups from storage', e);
      }
    }
    return initialCategoryMasterGroups;
  });

  // 5b. Flat Categories Data (All Categories synchronized with Master Groups)
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('jonogon_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.some((c) => c.id === 'probashi')) {
            parsed.push({ id: 'probashi', nameBn: 'প্রবাসী', nameEn: 'Expatriates', slug: 'probashi' });
            localStorage.setItem('jonogon_categories', JSON.stringify(parsed));
          }
          return parsed;
        }
      } catch (e) {}
    }
    return initialCategories;
  });

  // Ensure Probashi & Expatriates sync in state on startup
  useEffect(() => {
    setCategoryMasterGroups((prevGroups) => {
      let needsUpdate = false;
      const updated = prevGroups.map((grp) => {
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
        localStorage.setItem('jonogon_master_groups', JSON.stringify(updated));
        return updated;
      }
      return prevGroups;
    });

    setCategories((prev) => {
      if (!prev.some((c) => c.id === 'probashi')) {
        const updated = [...prev, { id: 'probashi', nameBn: 'প্রবাসী', nameEn: 'Expatriates', slug: 'probashi' }];
        localStorage.setItem('jonogon_categories', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  // 6. Breaking News Ticker
  const [breakingNews, setBreakingNews] = useState(() => {
    const saved = localStorage.getItem('jonogon_breaking');
    return saved ? JSON.parse(saved) : initialBreakingNews;
  });

  // 7. Podcasts Data
  const [podcasts, setPodcasts] = useState(() => {
    const saved = localStorage.getItem('jonogon_podcasts');
    const list = saved ? JSON.parse(saved) : initialPodcasts;
    return list.map((p, idx) => {
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
  });

  // 7b. Emergency Services Data (BD Govt & Emergency Services)
  const [emergencyServices, setEmergencyServices] = useState(() => {
    const saved = localStorage.getItem('jonogon_emergency_services');
    return saved ? JSON.parse(saved) : initialEmergencyServices;
  });

  // 8. Navigation & Routing View States
  const [activePage, setActivePage] = useState('home'); // 'home' | 'article' | 'category' | 'about' | 'advertisement' | 'contact' | 'editorial' | 'privacy' | 'terms'
  const [activeCategory, setActiveCategoryState] = useState('latest');
  const [selectedPodcastSubject, setSelectedPodcastSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentArticle, setCurrentArticle] = useState(null); // Full page article view
  const [activePolicyModal, setActivePolicyModal] = useState(null); // Optional modal fallback
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // 9. Real-Time Location District & Google Weather State
  const [userDistrict, setUserDistrictState] = useState(() => {
    return localStorage.getItem('jonogon_user_district') || 'dhaka';
  });

  const [liveWeather, setLiveWeather] = useState(() => {
    return getDefaultWeather('ঢাকা', 'Dhaka');
  });

  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  const setUserDistrict = (districtId) => {
    setUserDistrictState(districtId);
    localStorage.setItem('jonogon_user_district', districtId);
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
    window.history.pushState({ page: 'category', categoryId: catId }, '', `/category/${encodeURIComponent(catId)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // General Navigation Method for Standalone Pages
  const navigateTo = (path, { replace = false } = {}) => {
    const cleanPath = path.toLowerCase();
    if (cleanPath === '/' || cleanPath === '/home') {
      goToHome();
      return;
    }
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
    setCurrentArticle(null);
    setActiveCategoryState('latest');
    setActivePage('home');
    setSearchQuery('');
    window.history.pushState({ page: 'home' }, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync Language
  useEffect(() => {
    localStorage.setItem('jonogon_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  // Sync Theme & CSS Custom Properties
  useEffect(() => {
    localStorage.setItem('jonogon_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply Dynamic Brand Colors & Fonts from Admin Settings
  useEffect(() => {
    localStorage.setItem('jonogon_settings', JSON.stringify(settings));
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
    localStorage.setItem('jonogon_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('jonogon_master_groups', JSON.stringify(categoryMasterGroups));
  }, [categoryMasterGroups]);

  useEffect(() => {
    localStorage.setItem('jonogon_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('jonogon_breaking', JSON.stringify(breakingNews));
  }, [breakingNews]);

  useEffect(() => {
    localStorage.setItem('jonogon_podcasts', JSON.stringify(podcasts));
  }, [podcasts]);

  useEffect(() => {
    localStorage.setItem('jonogon_emergency_services', JSON.stringify(emergencyServices));
  }, [emergencyServices]);

  // Article Actions
  const addArticle = (newArticle) => {
    const articleWithId = {
      ...newArticle,
      id: `news-${Date.now()}`,
      views: 0,
      dateBn: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      dateEn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setArticles((prev) => [articleWithId, ...prev]);
  };

  const updateArticle = (id, updatedData) => {
    setArticles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
    if (currentArticle && currentArticle.id === id) {
      setCurrentArticle((prev) => ({ ...prev, ...updatedData }));
    }
  };

  const deleteArticle = (id) => {
    setArticles((prev) => prev.filter((item) => item.id !== id));
    if (currentArticle && currentArticle.id === id) {
      goToHome();
    }
  };

  const incrementViews = (id) => {
    setArticles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, views: (item.views || 0) + 1 } : item
      )
    );
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
      subGroupTitleEn
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
            return {
              ...sub,
              items: [
                ...sub.items,
                { id: updatedId, nameBn: updatedCategoryObj.nameBn, nameEn: updatedCategoryObj.nameEn }
              ]
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

  const updateSubGroup = (groupId, oldTitleBn, { titleBn, titleEn }) => {
    setCategoryMasterGroups((prev) =>
      prev.map((g) => {
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
      })
    );
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
    localStorage.removeItem('jonogon_master_groups');
    localStorage.removeItem('jonogon_categories');
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

  const updateSiteSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <NewsContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        theme,
        toggleTheme,
        settings,
        updateSiteSettings,
        articles,
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
        addSubGroup,
        updateSubGroup,
        deleteSubGroup,
        resetMasterGroupsToDefault,
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
        userDistrict,
        setUserDistrict,
        liveWeather,
        isWeatherLoading,
        refreshWeather
      }}
    >
      {children}
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
