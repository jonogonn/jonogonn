import React, { useState, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import {
  FileText,
  Search,
  Filter,
  Edit,
  Eye,
  Send,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
  User,
  Tag,
  Check,
  X,
  Smartphone,
  Monitor,
  PenTool,
  RotateCcw
} from 'lucide-react';
import SocialNewsCardPreview from './SocialNewsCardPreview';
import CreatePostManager from './CreatePostManager';

export default function EditPostManager({ triggerSaveToast, onNavigateToApprove, onNavigateToCreate }) {
  const {
    articles,
    updateArticle,
    deleteArticle,
    adminLanguage,
    language,
    showConfirm,
    showSuccess,
    showError,
    categories
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';

  // Active view: 'list' (Table/Grid of posts) | 'editor' (Editing a specific post)
  const [activeView, setActiveView] = useState('list');
  const [editingPostId, setEditingPostId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'draft_review' | 'pending_approval' | 'revision_needed' | 'published'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Preview Modal State
  const [previewArticle, setPreviewArticle] = useState(null);
  const [previewTab, setPreviewTab] = useState('card'); // 'card' | 'article'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  // Filtered Articles List
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (art.titleBn || '').toLowerCase().includes(q) || (art.titleEn || '').toLowerCase().includes(q);
        const matchKicker = (art.kicker || '').toLowerCase().includes(q);
        const matchAuthor = (art.author || '').toLowerCase().includes(q);
        const matchCat = (art.categoryBn || art.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchKicker && !matchAuthor && !matchCat) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        const catMatch = art.category === categoryFilter || (art.categories || []).includes(categoryFilter);
        if (!catMatch) return false;
      }

      // 3. Status Filter
      const artStatus = art.status || 'published'; // Default legacy items are considered published
      if (statusFilter === 'draft_review') {
        return artStatus === 'review' || artStatus === 'draft' || artStatus === 'submitted';
      }
      if (statusFilter === 'pending_approval') {
        return artStatus === 'pending_approval';
      }
      if (statusFilter === 'revision_needed') {
        return artStatus === 'revision_needed';
      }
      if (statusFilter === 'published') {
        return artStatus === 'published' || !art.status;
      }

      return true;
    });
  }, [articles, searchQuery, statusFilter, categoryFilter]);

  // Status Counts
  const counts = useMemo(() => {
    let draftReview = 0;
    let pendingApproval = 0;
    let revisionNeeded = 0;
    let published = 0;

    articles.forEach((a) => {
      const s = a.status || 'published';
      if (s === 'review' || s === 'draft' || s === 'submitted') draftReview++;
      else if (s === 'pending_approval') pendingApproval++;
      else if (s === 'revision_needed') revisionNeeded++;
      else if (s === 'published') published++;
    });

    return { all: articles.length, draftReview, pendingApproval, revisionNeeded, published };
  }, [articles]);

  // Request For Approval Handler
  const handleRequestApproval = async (article) => {
    const confirmed = await showConfirm({
      title: isBn ? 'অনুমোদনের জন্য আবেদন নিশ্চিতকরণ' : 'Confirm Request For Approval',
      message: isBn
        ? `"${article.titleBn || article.titleEn}" পোস্টটি অনুমোদনের জন্য "Approve Post" ট্যাবে পাঠাতে চান?`
        : `Send "${article.titleBn || article.titleEn}" for review to the Approve Post tab?`,
      subMessage: isBn
        ? 'অনুমোদনের পর এটি সাইটে লাইভ প্রকাশিত হবে এবং পোস্টার ডাউনলোড করা যাবে।'
        : 'Once approved by admin, it will be published and the poster will be available for download.',
      confirmText: isBn ? 'হ্যাঁ, অনুমোদনের জন্য পাঠান' : 'Yes, Request Approval',
      type: 'warning'
    });

    if (confirmed) {
      updateArticle(article.id, {
        status: 'pending_approval',
        approvalRequestedAt: new Date().toISOString()
      });

      if (triggerSaveToast) {
        triggerSaveToast(isBn ? 'পোস্টটি অনুমোদনের জন্য পাঠানো হয়েছে!' : 'Request for approval sent successfully!');
      }

      showSuccess(
        isBn
          ? 'পোস্টটি সফলভাবে "Approve Post" ট্যাবে জমা দেওয়া হয়েছে! অ্যাডমিন অনুমোদনের পর তা সাইটে প্রকাশিত হবে।'
          : 'Post submitted to Approve Post tab! It will be published once approved.'
      );
    }
  };

  // Delete Article Handler
  const handleDeleteArticle = async (article) => {
    const confirmed = await showConfirm({
      title: isBn ? 'পোস্ট মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Post',
      message: isBn
        ? `আপনি কি নিশ্চিত যে "${article.titleBn || article.titleEn}" পোস্টটি স্থায়ীভাবে মুছে ফেলতে চান?`
        : `Are you sure you want to delete "${article.titleBn || article.titleEn}"?`,
      confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
      type: 'danger'
    });

    if (confirmed) {
      deleteArticle(article.id);
      if (triggerSaveToast) triggerSaveToast(isBn ? 'পোস্ট মুছে ফেলা হয়েছে!' : 'Post deleted!');
    }
  };

  // Open in Editor
  const handleOpenEditor = (articleId) => {
    setEditingPostId(articleId);
    setActiveView('editor');
  };

  // Status Badge Component
  const renderStatusBadge = (status) => {
    const s = status || 'published';
    switch (s) {
      case 'pending_approval':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              color: '#EAB308',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            <Clock size={12} />
            <span>{isBn ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval'}</span>
          </span>
        );
      case 'revision_needed':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            <AlertTriangle size={12} />
            <span>{isBn ? 'সংশোধন প্রয়োজন' : 'Revision Needed'}</span>
          </span>
        );
      case 'review':
      case 'draft':
      case 'submitted':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60A5FA',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            <Edit size={12} />
            <span>{isBn ? 'খসড়া / পর্যালোচনায়' : 'Draft / In Review'}</span>
          </span>
        );
      case 'published':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ADE80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            <CheckCircle size={12} />
            <span>{isBn ? 'অনুমোদিত ও প্রকাশিত' : 'Published'}</span>
          </span>
        );
    }
  };

  // If in 'editor' view, render CreatePostManager populated with the editing post!
  if (activeView === 'editor') {
    const targetPost = articles.find((a) => a.id === editingPostId);
    return (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card, #1A1D24)',
            padding: '10px 18px',
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => {
                setActiveView('list');
                setEditingPostId(null);
              }}
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            >
              ← {isBn ? 'তালিকায় ফিরে যান' : 'Back to Edit Post List'}
            </button>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isBn ? 'পোস্ট সম্পাদনা মোড' : 'Post Editing Mode'}:{' '}
              <span style={{ color: 'var(--primary-red)' }}>{targetPost?.titleBn || targetPost?.titleEn || 'Untitled'}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {renderStatusBadge(targetPost?.status)}
            <button
              type="button"
              className="admin-btn-primary"
              style={{ fontSize: '0.82rem', padding: '6px 14px', backgroundColor: '#D97706', borderColor: '#D97706' }}
              onClick={() => targetPost && handleRequestApproval(targetPost)}
            >
              <Send size={14} />
              <span>{isBn ? 'Request For Approval' : 'Request For Approval'}</span>
            </button>
          </div>
        </div>

        <CreatePostManager
          initialPostId={editingPostId}
          triggerSaveToast={triggerSaveToast}
          onSwitchToArticles={() => {
            setActiveView('list');
            setEditingPostId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="admin-edit-post-manager">
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          marginBottom: 20
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <PenTool size={26} color="var(--primary-red)" />
            <span>{isBn ? 'পোস্ট সম্পাদনা ও সাবমিশন কেন্দ্র' : 'Edit Post & Submissions'}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 3 }}>
            {isBn
              ? 'এখানে তৈরিকৃত ও জমাকৃত সকল পোস্ট সম্পাদনা করুন, প্রিভিউ দেখুন এবং অনুমোদনের জন্য "Request For Approval" পাঠান।'
              : 'Edit submitted posts, inspect view-only social cards, and request admin approval.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onNavigateToCreate && (
            <button
              type="button"
              className="admin-btn-primary"
              onClick={onNavigateToCreate}
              style={{ fontSize: '0.86rem', padding: '8px 16px' }}
            >
              <PenTool size={16} />
              <span>{isBn ? 'নতুন পোস্ট লিখুন' : 'Write New Post'}</span>
            </button>
          )}

          {onNavigateToApprove && (
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={onNavigateToApprove}
              style={{ fontSize: '0.86rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <CheckCircle size={16} color="#10B981" />
              <span>{isBn ? 'Approve Post ট্যাবে যান' : 'Go to Approve Post'}</span>
              {counts.pendingApproval > 0 && (
                <span
                  style={{
                    backgroundColor: '#EAB308',
                    color: '#000',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 10
                  }}
                >
                  {counts.pendingApproval}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs (Pills) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 12
        }}
      >
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: statusFilter === 'all' ? 'var(--primary-red)' : 'var(--border-color)',
            backgroundColor: statusFilter === 'all' ? 'var(--primary-red)' : 'var(--bg-card)',
            color: statusFilter === 'all' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isBn ? 'সকল পোস্ট' : 'All Posts'} ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('draft_review')}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: statusFilter === 'draft_review' ? '#3B82F6' : 'var(--border-color)',
            backgroundColor: statusFilter === 'draft_review' ? '#3B82F6' : 'var(--bg-card)',
            color: statusFilter === 'draft_review' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isBn ? 'খসড়া ও পর্যালোচনায়' : 'Draft / Review'} ({counts.draftReview})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pending_approval')}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: statusFilter === 'pending_approval' ? '#EAB308' : 'var(--border-color)',
            backgroundColor: statusFilter === 'pending_approval' ? '#EAB308' : 'var(--bg-card)',
            color: statusFilter === 'pending_approval' ? '#000' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isBn ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval'} ({counts.pendingApproval})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('revision_needed')}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: statusFilter === 'revision_needed' ? '#EF4444' : 'var(--border-color)',
            backgroundColor: statusFilter === 'revision_needed' ? '#EF4444' : 'var(--bg-card)',
            color: statusFilter === 'revision_needed' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isBn ? 'সংশোধন প্রয়োজন' : 'Revision Needed'} ({counts.revisionNeeded})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('published')}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: statusFilter === 'published' ? '#10B981' : 'var(--border-color)',
            backgroundColor: statusFilter === 'published' ? '#10B981' : 'var(--bg-card)',
            color: statusFilter === 'published' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isBn ? 'অনুমোদিত ও প্রকাশিত' : 'Published'} ({counts.published})
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 440 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="admin-input"
            style={{ paddingLeft: 36, height: 38, fontSize: '0.85rem' }}
            placeholder={isBn ? 'শিরোনাম, কিকার বা লেখক দিয়ে খুঁজুন...' : 'Search by title, kicker, or author...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="admin-input"
            style={{ width: 'auto', height: 38, fontSize: '0.84rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {isBn ? c.nameBn : (c.nameEn || c.nameBn)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles List / Table */}
      {filteredArticles.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            backgroundColor: 'var(--bg-card, #1A1D24)',
            borderRadius: 8,
            border: '1px solid var(--border-color)'
          }}
        >
          <FileText size={44} color="var(--text-muted)" opacity={0.4} style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {isBn ? 'কোনো পোস্ট পাওয়া যায়নি' : 'No posts found'}
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            {searchQuery || statusFilter !== 'all'
              ? isBn
                ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।'
                : 'Try adjusting your filters.'
              : isBn
              ? 'নতুন পোস্ট তৈরি করতে "নতুন পোস্ট লিখুন" বাটনে ক্লিক করুন।'
              : 'Create a new post to get started.'}
          </div>
          {onNavigateToCreate && (
            <button
              type="button"
              className="admin-btn-primary"
              onClick={onNavigateToCreate}
              style={{ fontSize: '0.84rem' }}
            >
              <PenTool size={15} />
              <span>{isBn ? 'নতুন পোস্ট লিখুন' : 'Write New Post'}</span>
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="admin-post-row-card"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                backgroundColor: 'var(--bg-card, #1A1D24)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '12px 16px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              {/* Left: Image Thumbnail & Title Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 320 }}>
                <div
                  style={{
                    width: 80,
                    height: 60,
                    borderRadius: 6,
                    overflow: 'hidden',
                    backgroundColor: '#2A2D34',
                    flexShrink: 0,
                    position: 'relative'
                  }}
                >
                  <img
                    src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&q=80'}
                    alt={art.titleBn || 'Thumb'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {art.kicker && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#FCA5A5',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        padding: '1px 3px',
                        borderRadius: 2
                      }}
                    >
                      কিকার
                    </div>
                  )}
                </div>

                <div>
                  {art.kicker && (
                    <div style={{ fontSize: '0.74rem', color: '#EF4444', fontWeight: 800, marginBottom: 2 }}>
                      {art.kicker}
                    </div>
                  )}

                  <h3
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '0.98rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      marginBottom: 6
                    }}
                  >
                    {art.titleBn || art.titleEn || (isBn ? 'শিরোনামহীন' : 'Untitled')}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span style={{ backgroundColor: 'rgba(230,0,18,0.12)', color: 'var(--primary-red)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                      {art.categoryBn || art.category || 'বাংলাদেশ'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <User size={11} />
                      <span>{art.author || 'জনগণ ডেস্ক'}</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Calendar size={11} />
                      <span>{art.dateBn || art.dateEn || 'আজ'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle: Status Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                {renderStatusBadge(art.status)}
                {art.revisionNotes && art.status === 'revision_needed' && (
                  <span style={{ fontSize: '0.7rem', color: '#F87171', maxWidth: 180 }}>
                    মন্তব্য: {art.revisionNotes}
                  </span>
                )}
              </div>

              {/* Right: Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {/* 1. Preview Button (Opens Modal with Protected Social Card & Article) */}
                <button
                  type="button"
                  className="admin-btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  onClick={() => {
                    setPreviewArticle(art);
                    setPreviewTab('card');
                  }}
                  title={isBn ? 'পোস্ট ও সোশ্যাল কার্ড প্রিভিউ দেখুন' : 'Preview Post & Social Card'}
                >
                  <Eye size={14} color="var(--primary-red)" />
                  <span>{isBn ? 'প্রিভিউ' : 'Preview'}</span>
                </button>

                {/* 2. Edit Button (Opens interactive full editor) */}
                <button
                  type="button"
                  className="admin-btn-action"
                  style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                  onClick={() => handleOpenEditor(art.id)}
                  title={isBn ? 'পোস্ট ও কন্টেন্ট সম্পাদনা করুন' : 'Edit Post Content'}
                >
                  <Edit size={14} />
                  <span>{isBn ? 'এডিট করুন' : 'Edit'}</span>
                </button>

                {/* 3. Request For Approval Button */}
                {art.status !== 'pending_approval' && art.status !== 'published' && (
                  <button
                    type="button"
                    className="admin-btn-action"
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700
                    }}
                    onClick={() => handleRequestApproval(art)}
                    title={isBn ? 'অনুমোদনের জন্য পাঠান' : 'Request For Approval'}
                  >
                    <Send size={13} />
                    <span>{isBn ? 'অনুমোদনের আবেদন' : 'Request Approval'}</span>
                  </button>
                )}

                {/* 4. Delete Button */}
                <button
                  type="button"
                  className="admin-btn-danger"
                  style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => handleDeleteArticle(art)}
                  title={isBn ? 'পোস্ট মুছে ফেলুন' : 'Delete Post'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PREVIEW MODAL (Protected Social Card & Full Article Preview) --- */}
      {previewArticle && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setPreviewArticle(null)}
        >
          <div
            className="admin-modal-box"
            style={{
              width: '100%',
              maxWidth: previewTab === 'card' ? 560 : 860,
              maxHeight: '92vh',
              backgroundColor: 'var(--bg-card, #1A1D24)',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setPreviewTab('card')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: previewTab === 'card' ? '1px solid var(--primary-red)' : '1px solid transparent',
                    backgroundColor: previewTab === 'card' ? 'rgba(230,0,18,0.15)' : 'transparent',
                    color: previewTab === 'card' ? 'var(--primary-red)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  🖼️ {isBn ? 'সোশ্যাল ফটো কার্ড' : 'Social Card'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('article')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: previewTab === 'article' ? '1px solid var(--primary-red)' : '1px solid transparent',
                    backgroundColor: previewTab === 'article' ? 'rgba(230,0,18,0.15)' : 'transparent',
                    color: previewTab === 'article' ? 'var(--primary-red)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  📰 {isBn ? 'সম্পূর্ণ সংবাদ' : 'Full Article'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {previewTab === 'article' && (
                  <div style={{ display: 'inline-flex', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 6 }}>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        border: 'none',
                        background: previewDevice === 'desktop' ? 'var(--primary-red)' : 'transparent',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <Monitor size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        border: 'none',
                        background: previewDevice === 'mobile' ? 'var(--primary-red)' : 'transparent',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <Smartphone size={14} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewArticle(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
              {previewTab === 'card' ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {isBn ? 'জনগণ.নিউজ অফিসিয়াল সোশ্যাল মিডিয়া ফটোকার্ড' : 'Official Jonogon News Social Card'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={12} color="var(--primary-red)" />
                      <span>{isBn ? 'শুধুমাত্র দেখার জন্য (View-Only) • ডাউনলোড ও স্ক্রিনশট নিষ্ক্রিয়' : 'View-Only DRM Protected'}</span>
                    </div>
                  </div>

                  <SocialNewsCardPreview
                    title={previewArticle.titleBn || previewArticle.titleEn}
                    kicker={previewArticle.kicker}
                    imageUrl={previewArticle.imageUrl}
                    caption={previewArticle.cardCaption || 'ছবি: সংগৃহীত'}
                    category={previewArticle.categoryBn || previewArticle.category || 'বাংলাদেশ'}
                    dateBn={previewArticle.dateBn}
                  />
                </div>
              ) : (
                <div style={{ maxWidth: previewDevice === 'mobile' ? 380 : '100%', margin: '0 auto' }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ backgroundColor: 'var(--primary-red)', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 800 }}>
                      {previewArticle.categoryBn || previewArticle.category || 'বাংলাদেশ'}
                    </span>
                  </div>

                  {previewArticle.kicker && (
                    <div style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.95rem', marginBottom: 4 }}>
                      {previewArticle.kicker}
                    </div>
                  )}

                  <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: previewDevice === 'mobile' ? '1.4rem' : '1.9rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 14 }}>
                    {previewArticle.titleBn || previewArticle.titleEn}
                  </h1>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                    <span>✍️ {previewArticle.author || 'জনগণ ডেস্ক'}</span>
                    <span>📅 {previewArticle.dateBn || 'আজ'}</span>
                  </div>

                  {previewArticle.imageUrl && (
                    <div style={{ marginBottom: 18, borderRadius: 8, overflow: 'hidden' }}>
                      <img src={previewArticle.imageUrl} alt="Featured" style={{ width: '100%', maxHeight: 380, objectFit: 'cover' }} />
                      {previewArticle.cardCaption && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                          {previewArticle.cardCaption}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}
                    dangerouslySetInnerHTML={{
                      __html: previewArticle.contentBn || previewArticle.contentEn || previewArticle.excerptBn || previewArticle.excerptEn || '<p>কোনো বিস্তারিত লেখা নেই।</p>'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Bottom Footer Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'rgba(0,0,0,0.2)'
              }}
            >
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setPreviewArticle(null)}
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="admin-btn-action"
                  onClick={() => {
                    const artId = previewArticle.id;
                    setPreviewArticle(null);
                    handleOpenEditor(artId);
                  }}
                >
                  <Edit size={14} />
                  <span>{isBn ? 'এডিট করুন' : 'Edit This Post'}</span>
                </button>

                {previewArticle.status !== 'pending_approval' && previewArticle.status !== 'published' && (
                  <button
                    type="button"
                    className="admin-btn-primary"
                    style={{ backgroundColor: '#D97706', borderColor: '#D97706' }}
                    onClick={() => {
                      const art = previewArticle;
                      setPreviewArticle(null);
                      handleRequestApproval(art);
                    }}
                  >
                    <Send size={14} />
                    <span>{isBn ? 'Request For Approval' : 'Request For Approval'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
