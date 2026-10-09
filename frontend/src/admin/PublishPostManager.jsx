import React, { useState, useMemo, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import {
  Globe,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Download,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { generateSocialCardJpg } from '../utils/generateSocialCardJpg';
import { getCardCategoryLabel } from '../utils/cardCategoryHelper';
import { fetchArticlesFromMariaDb } from '../utils/mariaDbSync';

export default function PublishPostManager({ triggerSaveToast, onNavigateToCreate, onNavigateToEdit }) {
  const {
    articles,
    setArticles,
    updateArticle,
    deleteArticle,
    adminLanguage,
    language,
    showConfirm,
    showSuccess,
    showError,
    categories,
    categoryMasterGroups,
    setCurrentArticle,
    setActivePage
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'pending_approval' | 'revision_needed'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'views' | 'oldest'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Preview Modal
  const [previewArticle, setPreviewArticle] = useState(null);

  // Downloading state for card JPG
  const [downloadingId, setDownloadingId] = useState(null);

  // Sync / Refresh with MariaDB database
  const handleRefreshDb = async () => {
    setIsRefreshing(true);
    try {
      const dbPosts = await fetchArticlesFromMariaDb();
      if (dbPosts && Array.isArray(dbPosts) && dbPosts.length > 0) {
        // Normalize DB posts to frontend format if needed
        const normalized = dbPosts.map((p) => ({
          ...p,
          id: p.post_id || p.id || `news-${Date.now()}`,
          titleBn: p.title || p.titleBn,
          titleEn: p.title_en || p.titleEn || p.title,
          contentBn: p.content || p.contentBn,
          contentEn: p.content_en || p.contentEn || p.content,
          excerptBn: p.excerpt || p.excerptBn,
          excerptEn: p.excerpt_en || p.excerptEn || p.excerpt,
          imageUrl: p.featured_image || p.imageUrl,
          status: p.status || 'published',
          views: parseInt(p.views || 0, 10),
          category: p.category_id || p.category || 'bangladesh',
          categoryBn: p.category_bn || p.categoryBn || 'বাংলাদেশ',
          dateBn: p.date_bn || p.dateBn,
          dateEn: p.date_en || p.dateEn
        }));

        setArticles((prev) => {
          // Merge unique by id/slug
          const map = new Map();
          normalized.forEach((item) => map.set(item.id, item));
          prev.forEach((item) => {
            if (!map.has(item.id)) map.set(item.id, item);
          });
          return Array.from(map.values());
        });

        showSuccess(
          isBn
            ? `MariaDB ডাটাবেজ থেকে মোট ${dbPosts.length} টি পোস্ট সফলভাবে সিঙ্ক হয়েছে!`
            : `Synced ${dbPosts.length} posts from MariaDB database!`
        );
      } else {
        if (triggerSaveToast) triggerSaveToast(isBn ? 'ডাটাবেজ পোস্ট আপ-টু-ডেট রয়েছে।' : 'Database posts are up-to-date.');
      }
    } catch (err) {
      console.warn('DB refresh notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    let list = [...articles];

    // 1. Status Filter
    if (statusFilter !== 'all') {
      list = list.filter((art) => {
        const s = art.status || 'published';
        if (statusFilter === 'published') return s === 'published' || !art.status;
        return s === statusFilter;
      });
    }

    // 2. Category Filter
    if (categoryFilter !== 'all') {
      list = list.filter(
        (art) => art.category === categoryFilter || (art.categories || []).includes(categoryFilter)
      );
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((art) => {
        const titleBn = (art.titleBn || '').toLowerCase();
        const titleEn = (art.titleEn || '').toLowerCase();
        const kicker = (art.kicker || '').toLowerCase();
        const author = (art.author || '').toLowerCase();
        const slug = (art.slug || '').toLowerCase();
        return (
          titleBn.includes(q) ||
          titleEn.includes(q) ||
          kicker.includes(q) ||
          author.includes(q) ||
          slug.includes(q)
        );
      });
    }

    // 4. Sorting
    list.sort((a, b) => {
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === 'oldest') {
        return (a.id || '').localeCompare(b.id || '');
      }
      // default: latest
      return (b.id || '').localeCompare(a.id || '');
    });

    return list;
  }, [articles, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Overall Database Stats
  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a) => a.status === 'published' || !a.status).length;
    const drafts = articles.filter((a) => a.status === 'draft' || a.status === 'review').length;
    const pending = articles.filter((a) => a.status === 'pending_approval').length;
    const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
    return { total, published, drafts, pending, totalViews };
  }, [articles]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredArticles.slice(start, start + itemsPerPage);
  }, [filteredArticles, currentPage, itemsPerPage]);

  // Toggle Live Status (Publish / Unpublish)
  const handleTogglePublishStatus = async (article) => {
    const isCurrentlyPublished = article.status === 'published' || !article.status;
    const newStatus = isCurrentlyPublished ? 'draft' : 'published';

    const confirmed = await showConfirm({
      title: isCurrentlyPublished
        ? (isBn ? 'সংবাদ আনপাবলিশ করার নিশ্চিতকরণ' : 'Confirm Unpublish')
        : (isBn ? 'সংবাদ সরাসরি লাইভ পাবলিশের নিশ্চিতকরণ' : 'Confirm Direct Publish'),
      message: isCurrentlyPublished
        ? (isBn ? `"${article.titleBn}" সংবাদটি সাইট থেকে সরিয়ে ড্রাফট হিসেবে রাখতে চান?` : `Move "${article.titleBn}" to drafts?`)
        : (isBn ? `"${article.titleBn}" সংবাদটি ওয়েবসাইটে সরাসরি লাইভ প্রকাশ করতে চান?` : `Publish "${article.titleBn}" to live site?`),
      confirmText: isCurrentlyPublished ? (isBn ? 'হ্যাঁ, আনপাবলিশ করুন' : 'Yes, Unpublish') : (isBn ? 'হ্যাঁ, পাবলিশ করুন' : 'Yes, Publish'),
      type: isCurrentlyPublished ? 'warning' : 'primary'
    });

    if (confirmed) {
      updateArticle(article.id, { status: newStatus });
      showSuccess(
        isCurrentlyPublished
          ? (isBn ? 'পোস্টটি আনপাবলিশ করে ড্রাফট তালিকায় রাখা হয়েছে।' : 'Post unpublished and moved to drafts.')
          : (isBn ? 'পোস্টটি সফলভাবে ওয়েবসাইটে লাইভ প্রকাশ করা হয়েছে!' : 'Post published to live website!')
      );
      if (triggerSaveToast) {
        triggerSaveToast(isCurrentlyPublished ? 'পোস্ট ড্রাফট হিসেবে সংরক্ষিত' : 'পোস্ট লাইভ পাবলিশ সম্পন্ন!');
      }
    }
  };

  // Delete Article
  const handleDelete = async (article) => {
    const confirmed = await showConfirm({
      title: isBn ? 'পোস্ট স্থায়ীভাবে মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Post',
      message: isBn
        ? `আপনি কি নিশ্চিত যে "${article.titleBn || article.titleEn}" পোস্টটি MariaDB ও সাইট থেকে স্থায়ীভাবে মুছে ফেলতে চান?`
        : `Permanently delete "${article.titleBn || article.titleEn}" from database?`,
      confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
      type: 'danger'
    });

    if (confirmed) {
      deleteArticle(article.id);
      showSuccess(isBn ? 'পোস্টটি ডাটাবেজ থেকে মুছে ফেলা হয়েছে।' : 'Post deleted successfully.');
      if (triggerSaveToast) triggerSaveToast(isBn ? 'পোস্ট মুছে ফেলা হয়েছে!' : 'Post deleted!');
      if (previewArticle && previewArticle.id === article.id) setPreviewArticle(null);
    }
  };

  // Download Social Card JPG
  const handleDownloadCard = async (article) => {
    try {
      setDownloadingId(article.id);
      const cleanSlug = (article.slug || article.titleBn || 'news')
        .toLowerCase()
        .replace(/[^\w\u0980-\u09FF\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);

      const cardCat =
        article.cardCategory ||
        getCardCategoryLabel(article.category || (article.categories && article.categories[0]), categoryMasterGroups, categories);

      await generateSocialCardJpg({
        title: article.titleBn || article.titleEn,
        kicker: article.kicker || '',
        imageUrl: article.imageUrl,
        caption: article.cardCaption || 'ছবি: সংগৃহীত',
        category: cardCat,
        dateBn: article.dateBn,
        titleFontSize: 48,
        kickerFontSize: 26,
        lineHeight: 1.18,
        colorMode: 'dual',
        fileName: `jonogon-card-${cleanSlug}.jpg`
      });

      if (triggerSaveToast) triggerSaveToast(isBn ? 'ফটোকার্ড .JPG ডাউনলোড সম্পন্ন!' : 'Card downloaded!');
    } catch (e) {
      showError(isBn ? 'ফটোকার্ড তৈরি করতে সমস্যা হয়েছে।' : 'Failed to generate card.');
    } finally {
      setDownloadingId(null);
    }
  };

  // View Live in Reader / Public Page
  const handleViewLive = (article) => {
    if (typeof setCurrentArticle === 'function' && typeof setActivePage === 'function') {
      setCurrentArticle(article);
      setActivePage('article');
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/news/${encodeURIComponent(article.slug || article.id)}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. HEADER WITH METRICS & REAL-TIME REFRESH */}
      <div
        className="admin-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '20px 24px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 12
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.45rem',
              fontWeight: 800,
              margin: '0 0 6px 0',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <Globe size={26} color="#10B981" />
            <span>{isBn ? 'প্রকাশিত ও ডাটাবেজের সকল পোস্ট (Publish Post)' : 'Published & Database Posts'}</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            {isBn
              ? 'MariaDB ডাটাবেজে সংরক্ষিত সকল সংবাদ পর্যবেক্ষণ, লাইভ প্রকাশনা নিয়ন্ত্রণ, সার্চ এবং বিশ্লেষণ।'
              : 'Complete view of all posts in the database with status management, analytics, and live inspection.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            disabled={isRefreshing}
            onClick={handleRefreshDb}
            style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title={isBn ? 'MariaDB ডাটাবেজ থেকে রিলোড করুন' : 'Refresh from Database'}
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-anim' : ''} />
            <span>{isRefreshing ? (isBn ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (isBn ? 'ডাটাবেজ সিঙ্ক' : 'Sync DB')}</span>
          </button>

          {onNavigateToCreate && (
            <button
              type="button"
              className="admin-btn-primary"
              onClick={onNavigateToCreate}
              style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={16} />
              <span>{isBn ? 'নতুন পোস্ট তৈরি' : 'Create Post'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="admin-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, margin: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isBn ? 'সর্বমোট ডাটাবেজ পোস্ট' : 'Total DB Posts'}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.total} {isBn ? 'টি' : ''}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, margin: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isBn ? 'লাইভ প্রকাশিত সংবাদ' : 'Live Published'}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10B981' }}>{stats.published} {isBn ? 'টি' : ''}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, margin: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(234,179,8,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EAB308' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isBn ? 'খসড়া ও অপেক্ষমান' : 'Drafts & Pending'}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#EAB308' }}>{stats.drafts + stats.pending} {isBn ? 'টি' : ''}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, margin: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(230,0,18,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)' }}>
            <Eye size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isBn ? 'সর্বমোট পাঠক ভিউ' : 'Total Reader Views'}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.totalViews.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 3. SEARCH, FILTERS & CONTROLS TOOLBAR */}
      <div
        className="admin-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 18px',
          margin: 0
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="admin-input"
            style={{ width: '100%', height: 38 }}
            placeholder={isBn ? 'শিরোনাম, লেখক, কিকার বা স্লাগ খুঁজুন...' : 'Search posts by title, author, slug...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            className="admin-input"
            style={{ width: 'auto', height: 38, fontSize: '0.84rem' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">{isBn ? 'সকল স্ট্যাটাস (All Status)' : 'All Status'}</option>
            <option value="published">{isBn ? 'শুধুমাত্র প্রকাশিত (Published)' : 'Published Only'}</option>
            <option value="draft">{isBn ? 'খসড়া (Draft)' : 'Drafts'}</option>
            <option value="pending_approval">{isBn ? 'অনুমোদনের অপেক্ষায় (Pending)' : 'Pending Approval'}</option>
            <option value="revision_needed">{isBn ? 'সংশোধন প্রয়োজন (Revision)' : 'Revision Needed'}</option>
          </select>

          {/* Category Filter */}
          <select
            className="admin-input"
            style={{ width: 'auto', height: 38, fontSize: '0.84rem' }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.id || c.slug}>
                {isBn ? c.nameBn || c.name : c.nameEn || c.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            className="admin-input"
            style={{ width: 'auto', height: 38, fontSize: '0.84rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">{isBn ? 'সর্বশেষ পোস্ট (Latest)' : 'Latest Posts'}</option>
            <option value="views">{isBn ? 'সর্বোচ্চ ভিউ (Most Views)' : 'Most Viewed'}</option>
            <option value="oldest">{isBn ? 'পুরাতন পোস্ট (Oldest)' : 'Oldest'}</option>
          </select>
        </div>
      </div>

      {/* 4. POSTS TABLE LIST */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden', margin: 0 }}>
        {paginatedArticles.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={44} style={{ opacity: 0.3, marginBottom: 12, margin: '0 auto' }} />
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {isBn ? 'কোনো সংবাদ খুঁজে পাওয়া যায়নি' : 'No posts found'}
            </div>
            <div style={{ fontSize: '0.84rem', marginTop: 4 }}>
              {isBn ? 'ফিল্টার পরিবর্তন করুন বা নতুন পোস্ট তৈরি করুন।' : 'Try adjusting search or status filters.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>{isBn ? 'সংবাদ বিবরণ ও শিরোনাম' : 'Article & Headline'}</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800 }}>{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800 }}>{isBn ? 'লেখক ও তারিখ' : 'Author & Date'}</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center' }}>{isBn ? 'ভিউ' : 'Views'}</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center' }}>{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedArticles.map((art) => {
                  const isPublished = art.status === 'published' || !art.status;
                  const isPending = art.status === 'pending_approval';
                  const isDraft = art.status === 'draft' || art.status === 'review';
                  const isRevision = art.status === 'revision_needed';

                  return (
                    <tr
                      key={art.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* 1. Article Info */}
                      <td style={{ padding: '14px 16px', minWidth: 320 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=160&q=80'}
                            alt="thumb"
                            style={{
                              width: 64,
                              height: 48,
                              borderRadius: 6,
                              objectFit: 'cover',
                              backgroundColor: '#2A2D34',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            {art.kicker && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--primary-red)', fontWeight: 800, marginBottom: 2 }}>
                                {art.kicker}
                              </div>
                            )}
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: '0.94rem',
                                color: 'var(--text-primary)',
                                lineHeight: 1.35,
                                cursor: 'pointer'
                              }}
                              onClick={() => setPreviewArticle(art)}
                              title={isBn ? 'প্রিভিউ দেখতে ক্লিক করুন' : 'Click to preview'}
                            >
                              {art.titleBn || art.titleEn}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                              ID: <span style={{ fontFamily: 'monospace' }}>{art.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category */}
                      <td style={{ padding: '14px 14px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            backgroundColor: 'rgba(230,0,18,0.1)',
                            color: 'var(--primary-red)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          {art.categoryBn || art.category || 'বাংলাদেশ'}
                        </span>
                      </td>

                      {/* 3. Author & Date */}
                      <td style={{ padding: '14px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)', fontWeight: 600 }}>
                            <User size={12} />
                            <span>{art.author || 'জনগণ ডেস্ক'}</span>
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} />
                            <span>{art.dateBn || 'আজ'}</span>
                          </span>
                        </div>
                      </td>

                      {/* 4. Views */}
                      <td style={{ padding: '14px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 800, color: '#3B82F6', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={13} />
                          <span>{(art.views || 0).toLocaleString()}</span>
                        </span>
                      </td>

                      {/* 5. Status Badge */}
                      <td style={{ padding: '14px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {isPublished && (
                          <span style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '3px 8px', borderRadius: 4, fontSize: '0.76rem', fontWeight: 700 }}>
                            {isBn ? 'লাইভ পাবলিশড' : 'Published'}
                          </span>
                        )}
                        {isPending && (
                          <span style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.3)', padding: '3px 8px', borderRadius: 4, fontSize: '0.76rem', fontWeight: 700 }}>
                            {isBn ? 'অনুমোদনাধীন' : 'Pending'}
                          </span>
                        )}
                        {isDraft && (
                          <span style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)', padding: '3px 8px', borderRadius: 4, fontSize: '0.76rem', fontWeight: 700 }}>
                            {isBn ? 'খসড়া' : 'Draft'}
                          </span>
                        )}
                        {isRevision && (
                          <span style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '3px 8px', borderRadius: 4, fontSize: '0.76rem', fontWeight: 700 }}>
                            {isBn ? 'রিভিশন প্রয়োজন' : 'Revision'}
                          </span>
                        )}
                      </td>

                      {/* 6. Action Buttons */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* Live Site View Button */}
                          <button
                            type="button"
                            className="admin-btn-action"
                            style={{ padding: '5px 8px' }}
                            onClick={() => handleViewLive(art)}
                            title={isBn ? 'ওয়েবসাইটে সরাসরি পোস্টটি দেখুন' : 'View live on site'}
                          >
                            <ExternalLink size={14} color="#10B981" />
                          </button>

                          {/* Preview Modal */}
                          <button
                            type="button"
                            className="admin-btn-action"
                            style={{ padding: '5px 8px' }}
                            onClick={() => setPreviewArticle(art)}
                            title={isBn ? 'প্রিভিউ পড়ুন' : 'Read & Preview'}
                          >
                            <Eye size={14} color="var(--primary-red)" />
                          </button>

                          {/* Social Card Download */}
                          <button
                            type="button"
                            className="admin-btn-action"
                            style={{ padding: '5px 8px' }}
                            disabled={downloadingId === art.id}
                            onClick={() => handleDownloadCard(art)}
                            title={isBn ? 'সোশ্যাল কার্ড .JPG ডাউনলোড' : 'Download Card .JPG'}
                          >
                            <Download size={14} color="#3B82F6" />
                          </button>

                          {/* Toggle Publish / Draft */}
                          <button
                            type="button"
                            className="admin-btn-action"
                            style={{
                              padding: '5px 8px',
                              color: isPublished ? '#EAB308' : '#10B981',
                              backgroundColor: isPublished ? 'rgba(234,179,8,0.1)' : 'rgba(16,185,129,0.1)'
                            }}
                            onClick={() => handleTogglePublishStatus(art)}
                            title={isPublished ? (isBn ? 'ড্রাফট করুন (Unpublish)' : 'Unpublish to Draft') : (isBn ? 'সরাসরি পাবলিশ করুন' : 'Publish Live')}
                          >
                            <CheckCircle size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            className="admin-btn-action"
                            style={{ padding: '5px 8px', color: '#EF4444' }}
                            onClick={() => handleDelete(art)}
                            title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredArticles.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              backgroundColor: 'var(--bg-subtle)'
            }}
          >
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {isBn
                ? `মোট ${filteredArticles.length} টি সংবাদের মধ্যে ${(currentPage - 1) * itemsPerPage + 1} থেকে ${Math.min(currentPage * itemsPerPage, filteredArticles.length)} দেখানো হচ্ছে`
                : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, filteredArticles.length)} of ${filteredArticles.length} posts`}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
              </button>

              <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0 8px' }}>
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                className="admin-btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. ARTICLE PREVIEW MODAL */}
      {previewArticle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setPreviewArticle(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              width: 780,
              maxWidth: '96vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={18} color="#10B981" />
                <span>{isBn ? 'সংবাদ বিস্তারিত প্রিভিউ' : 'Article Preview'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    backgroundColor: 'var(--primary-red)',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: 4,
                    fontSize: '0.78rem',
                    fontWeight: 800
                  }}
                >
                  {previewArticle.categoryBn || previewArticle.category || 'বাংলাদেশ'}
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 14 }}>
                {previewArticle.titleBn || previewArticle.titleEn}
              </h1>

              {previewArticle.imageUrl && (
                <div style={{ margin: '16px 0', textAlign: 'center' }}>
                  <img
                    src={previewArticle.imageUrl}
                    alt="Article"
                    style={{ maxWidth: '100%', maxHeight: 380, borderRadius: 8, objectFit: 'cover' }}
                  />
                  {previewArticle.cardCaption && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 6 }}>
                      {previewArticle.cardCaption}
                    </div>
                  )}
                </div>
              )}

              {/* Render Article HTML Content with DangerouslySetInnerHTML */}
              <div
                className="article-preview-content"
                style={{ fontSize: '1.02rem', lineHeight: 1.85, color: 'var(--text-main)', marginTop: 16 }}
                dangerouslySetInnerHTML={{
                  __html:
                    previewArticle.contentBn ||
                    previewArticle.contentEn ||
                    previewArticle.excerptBn ||
                    previewArticle.excerptEn ||
                    '<p>কোনো বিস্তারিত লেখা নেই।</p>'
                }}
              />
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setPreviewArticle(null)}
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => {
                  handleViewLive(previewArticle);
                  setPreviewArticle(null);
                }}
              >
                <ExternalLink size={14} />
                <span>{isBn ? 'লাইভ পেজে যান' : 'Go to Live Page'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
