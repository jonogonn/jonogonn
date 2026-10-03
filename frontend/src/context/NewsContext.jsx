import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialSiteSettings,
  initialCategories,
  initialBreakingNews,
  initialNewsArticles
} from '../data/initialData';
import { supabase, configureSupabase } from '../supabase';

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

  // 4. Articles Data
  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem('jonogon_articles');
    return saved ? JSON.parse(saved) : initialNewsArticles;
  });

  // 5. Categories Data
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('jonogon_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  // 6. Breaking News Ticker
  const [breakingNews, setBreakingNews] = useState(() => {
    const saved = localStorage.getItem('jonogon_breaking');
    return saved ? JSON.parse(saved) : initialBreakingNews;
  });

  // 7. Navigation & View States
  const [activeCategory, setActiveCategory] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentArticle, setCurrentArticle] = useState(null); // Full page article view
  const [activePolicyModal, setActivePolicyModal] = useState(null); // 'terms' | 'privacy' | 'editorial' | null
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Parse URL on Initial Load (Support direct link to news)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newsParam = params.get('news') || params.get('article');
    if (newsParam) {
      const found = articles.find((a) => a.id === newsParam || a.slug === newsParam);
      if (found) {
        setCurrentArticle(found);
      }
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentNewsParam = currentParams.get('news') || currentParams.get('article');
      if (currentNewsParam) {
        const found = articles.find((a) => a.id === currentNewsParam || a.slug === currentNewsParam);
        if (found) setCurrentArticle(found);
      } else {
        setCurrentArticle(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [articles]);

  // Navigate to Dedicated Full Article Page
  const openArticle = (art) => {
    if (!art) return;
    incrementViews(art.id);
    setCurrentArticle(art);
    const url = new URL(window.location);
    url.searchParams.set('news', art.slug || art.id);
    window.history.pushState({ articleId: art.id }, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate back to Home
  const goToHome = () => {
    setCurrentArticle(null);
    setActiveCategory('latest');
    setSearchQuery('');
    const url = new URL(window.location);
    url.searchParams.delete('news');
    url.searchParams.delete('article');
    window.history.pushState({}, '', url.pathname);
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

  // Persist Articles, Categories & Breaking News
  useEffect(() => {
    localStorage.setItem('jonogon_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('jonogon_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('jonogon_breaking', JSON.stringify(breakingNews));
  }, [breakingNews]);

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

  // Category Actions
  const addCategory = (cat) => {
    setCategories((prev) => [...prev, { ...cat, id: `cat-${Date.now()}` }]);
  };

  const updateCategory = (id, updatedData) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updatedData } : cat))
    );
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Breaking News Actions
  const addBreakingItem = (item) => {
    setBreakingNews((prev) => [...prev, { ...item, id: `break-${Date.now()}` }]);
  };

  const deleteBreakingItem = (id) => {
    setBreakingNews((prev) => prev.filter((item) => item.id !== id));
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
        addCategory,
        updateCategory,
        deleteCategory,
        breakingNews,
        addBreakingItem,
        deleteBreakingItem,
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
        setIsAdminOpen
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
