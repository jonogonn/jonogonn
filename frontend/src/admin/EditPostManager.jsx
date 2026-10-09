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
  Layers,
  Calendar,
  User,
  Tag,
  Check,
  X,
  Smartphone,
  Monitor,
  PenTool,
  RotateCcw,
  MessageSquare,
  Image as ImageIcon,
  HelpCircle
} from 'lucide-react';
import SocialNewsCardPreview from './SocialNewsCardPreview';
import CreatePostManager from './CreatePostManager';
import { getCardCategoryLabel } from '../utils/cardCategoryHelper';

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
    categories,
    categoryMasterGroups
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';

  // Active view: 'list' (Table/Grid of posts) | 'editor' (Editing a specific post)
  const [activeView, setActiveView] = useState('list');
  const [editingPostId, setEditingPostId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'draft_review' | 'revision_needed'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Preview Modal State
  const [previewArticle, setPreviewArticle] = useState(null);
  const [previewTab, setPreviewTab] = useState('card'); // 'card' | 'article'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  // Revision Note View Modal (Requirement 6)
  const [activeRevisionNote, setActiveRevisionNote] = useState(null);

  // Filtered Articles List: ONLY articles that have NOT been requested for approval yet (draft, review, revision_needed)
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const artStatus = art.status || 'review';

      // 1. Strictly exclude posts that are pending approval or published
      if (artStatus === 'pending_approval' || artStatus === 'published') {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (art.titleBn || '').toLowerCase().includes(q) || (art.titleEn || '').toLowerCase().includes(q);
        const matchKicker = (art.kicker || '').toLowerCase().includes(q);
        const matchAuthor = (art.author || '').toLowerCase().includes(q);
        const matchCat = (art.categoryBn || art.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchKicker && !matchAuthor && !matchCat) return false;
      }

      // 3. Category Filter
      if (categoryFilter !== 'all') {
        const catMatch = art.category === categoryFilter || (art.categories || []).includes(categoryFilter);
        if (!catMatch) return false;
      }

      // 4. Status Filter
      if (statusFilter === 'draft_review') {
        return artStatus === 'review' || artStatus === 'draft' || artStatus === 'submitted';
      }
      if (statusFilter === 'revision_needed') {
        return artStatus === 'revision_needed';
      }

      return true;
    });
  }, [articles, searchQuery, statusFilter, categoryFilter]);

  // Status Counts (Only for editable posts)
  const counts = useMemo(() => {
    let draftReview = 0;
    let revisionNeeded = 0;

    articles.forEach((a) => {
      const s = a.status || 'review';
      if (s === 'review' || s === 'draft' || s === 'submitted') draftReview++;
      else if (s === 'revision_needed') revisionNeeded++;
    });

    return { all: draftReview + revisionNeeded, draftReview, revisionNeeded };
  }, [articles]);

  // Request For Approval Handler (Moves to Approve Post Tab & disappears from Edit Post)
  const handleRequestApproval = async (article) => {
    const confirmed = await showConfirm({
      title: isBn ? 'অনুমোদনের জন্য প্রেরণ' : 'Submit for Editorial Review',
      message: isBn
        ? `"${article.titleBn || article.titleEn}" সংবাদটি কি পর্যালোচনার জন্য জমা দিতে চান?`
        : `Are you sure you want to submit "${article.titleBn || article.titleEn}" for editorial review?`,
      subMessage: isBn
        ? 'অনুমোদন সম্পন্ন হলে সংবাদটি মূল ওয়েবসাইটে সরাসরি প্রকাশিত হবে।'
        : 'Once approved by the editorial team, this post will be published live.',
      confirmText: isBn ? 'হ্যাঁ, অনুমোদনের জন্য পাঠান' : 'Yes, Submit for Review',
      cancelText: isBn ? 'বাতিল' : 'Cancel',
      type: 'warning'
    });

    if (confirmed) {
      updateArticle(article.id, {
        status: 'pending_approval',
        approvalRequestedAt: new Date().toISOString()
      });

      if (triggerSaveToast) {
        triggerSaveToast(isBn ? 'সংবাদটি পর্যালোচনার জন্য পাঠানো হয়েছে!' : 'Submitted for review successfully!');
      }

      showSuccess(
        isBn
          ? 'সংবাদটি সফলভাবে অনুমোদনের জন্য জমা দেওয়া হয়েছে। সম্পাদকীয় পর্যালোচনার পর এটি প্রকাশিত হবে।'
          : 'Post successfully submitted for review. It will be published upon approval.',
        isBn ? 'অনুমোদনের আবেদন সম্পন্ন' : 'Submitted for Approval'
      );
    }
  };

  // Delete Article Handler
  const handleDeleteArticle = async (article) => {
    const confirmed = await showConfirm({
      title: isBn ? 'সংবাদ মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Post',
      message: isBn
        ? `আপনি কি নিশ্চিত যে "${article.titleBn || article.titleEn}" সংবাদটি স্থায়ীভাবে মুছে ফেলতে চান?`
        : `Are you sure you want to delete "${article.titleBn || article.titleEn}"?`,
      subMessage: isBn
        ? 'এই সংবাদটি মুছে ফেললে তা আর পুনরুদ্ধার করা সম্ভব হবে না।'
        : 'This action cannot be undone.',
      confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
      cancelText: isBn ? 'বাতিল' : 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      deleteArticle(article.id);
      if (triggerSaveToast) triggerSaveToast(isBn ? 'সংবাদটি মুছে ফেলা হয়েছে!' : 'Post deleted!');
    }
  };

  // Open in Editor
  const handleOpenEditor = (articleId) => {
    setEditingPostId(articleId);
    setActiveView('editor');
  };

  // Status Badge Component
  const renderStatusBadge = (status) => {
    const s = status || 'review';
    switch (s) {
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
      default:
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
    }
  };

  // If in editor view, render the CreatePostManager preloaded with editingPostId
  if (activeView === 'editor') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => {
              setActiveView('list');
              setEditingPostId(null);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.84rem' }}
          >
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            <span>{isBn ? 'তালিকায় ফিরে যান' : 'Back to Edit Post List'}</span>
          </button>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isBn ? 'পোস্ট আইডি:' : 'Post ID:'} <code>{editingPostId}</code>
          </span>
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

  // --- LIST VIEW ---
  return (
    <div className="admin-page-container" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Header Card */}
      <div
        className="admin-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          padding: '18px 22px'
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.25rem',
              fontWeight: 800,
              margin: '0 0 4px 0',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Edit size={22} color="var(--primary-red)" />
            <span>{isBn ? 'পোস্ট সম্পাদনা ও খসড়া তালিকা' : 'Edit Post & Drafts'}</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            {isBn
              ? 'এখানে কেবলমাত্র খসড়া ও সংশোধনাধীন পোস্টগুলো সম্পাদনা করুন। "অনুমোদনের আবেদন" বাটনে ক্লিক করলে তা সরাসরি Approve Post ট্যাবে স্থানান্তরিত হবে।'
              : 'Edit your drafts and revisions. Requesting approval will move them directly to the Approve Post tab.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onNavigateToCreate && (
            <button
              type="button"
              className="admin-btn-primary"
              onClick={onNavigateToCreate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}
            >
              <PenTool size={15} />
              <span>{isBn ? 'নতুন পোস্ট লিখুন' : 'Write New Post'}</span>
            </button>
          )}

          {onNavigateToApprove && (
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={onNavigateToApprove}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}
            >
              <CheckCircle size={15} color="#10B981" />
              <span>{isBn ? 'Approve Post ট্যাবে যান' : 'Go to Approve Post'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs (Only Editable Post Statuses) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
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
          {isBn ? 'সকল খসড়া পোস্ট' : 'All Drafts'} ({counts.all})
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
      </div>

      {/* Search & Category Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4
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
            {isBn ? 'কোনো খসড়া বা সম্পাদনাযোগ্য পোস্ট নেই' : 'No draft posts to edit'}
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
          {filteredArticles.map((art) => {
            const hasRevisionNote = art.status === 'revision_needed' && (art.revisionNotes || art.revisionNote);
            return (
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
                          backgroundColor: 'rgba(0,0,0,0.75)',
                          color: '#FCA5A5',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          padding: '1px 4px',
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
                        {art.cardCategory || art.categoryBn || art.category || 'বাংলাদেশ'}
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

                {/* Middle: Status Badge & Revision Comment Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {renderStatusBadge(art.status)}

                  {hasRevisionNote && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRevisionNote({
                          title: art.titleBn || art.titleEn,
                          note: art.revisionNotes || art.revisionNote,
                          id: art.id
                        })
                      }
                      style={{
                        fontSize: '0.72rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 9px',
                        borderRadius: 4,
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                      title="এডমিনের সংশোধনী মন্তব্য পড়ুন"
                    >
                      <MessageSquare size={12} />
                      <span>{isBn ? 'মন্তব্য দেখুন' : 'View Note'}</span>
                    </button>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {/* 1. Preview Button */}
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

                  {/* 2. Edit Button */}
                  <button
                    type="button"
                    className="admin-btn-action"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    onClick={() => handleOpenEditor(art.id)}
                    title={isBn ? 'পোস্ট ও কন্টেন্ট সম্পাদনা করুন' : 'Edit Post Content'}
                  >
                    <Edit size={14} />
                    <span>{isBn ? 'এডিট করুন' : 'Edit'}</span>
                  </button>

                  {/* 3. Request For Approval Button (Only for unsubmitted posts) */}
                  <button
                    type="button"
                    className="admin-btn-warning"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    onClick={() => handleRequestApproval(art)}
                    title={isBn ? 'অনুমোদনের জন্য পাঠান' : 'Request For Approval'}
                  >
                    <Send size={13} />
                    <span>{isBn ? 'অনুমোদনের আবেদন' : 'Request Approval'}</span>
                  </button>

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
            );
          })}
        </div>
      )}

      {/* ========================================================
          REVISION NOTE POPUP MODAL (Requirement 6)
          ======================================================== */}
      {activeRevisionNote && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setActiveRevisionNote(null)}
        >
          <div
            className="admin-modal-box"
            style={{
              width: '100%',
              maxWidth: 500,
              backgroundColor: 'var(--bg-card, #1A1D24)',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', fontWeight: 800, fontSize: '0.98rem' }}>
                <MessageSquare size={18} />
                <span>{isBn ? 'অ্যাডমিন সংশোধনী নির্দেশনা' : 'Admin Revision Feedback'}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveRevisionNote(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                {isBn ? 'সংবাদের শিরোনাম:' : 'Article Title:'}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: 14 }}>
                {activeRevisionNote.title}
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-subtle, rgba(255,255,255,0.03))',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderLeft: '4px solid #EF4444',
                  borderRadius: 6,
                  padding: '14px 16px',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {activeRevisionNote.note}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
                padding: '12px 18px',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'rgba(0,0,0,0.15)'
              }}
            >
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setActiveRevisionNote(null)}
                style={{ fontSize: '0.84rem' }}
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>

              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => {
                  const targetId = activeRevisionNote.id;
                  setActiveRevisionNote(null);
                  handleOpenEditor(targetId);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.84rem' }}
              >
                <Edit size={14} />
                <span>{isBn ? 'এডিটরে সংশোধন করুন' : 'Edit Post Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PREVIEW MODAL (Social Card & Full Article - Polished UI)
          ======================================================== */}
      {previewArticle && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
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
              maxWidth: 680,
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-card, #1A1D24)',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ImageIcon size={14} />
                  <span>{isBn ? 'সোশ্যাল ফটো কার্ড' : 'Social Card'}</span>
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
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <FileText size={14} />
                  <span>{isBn ? 'সম্পূর্ণ সংবাদ' : 'Full Article'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {previewTab === 'article' && (
                  <div style={{ display: 'inline-flex', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 6 }}>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: 'none',
                        background: previewDevice === 'desktop' ? 'var(--primary-red)' : 'transparent',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                      title="ডেস্কটপ ভিউ"
                    >
                      <Monitor size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: 'none',
                        background: previewDevice === 'mobile' ? 'var(--primary-red)' : 'transparent',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                      title="মোবাইল ভিউ"
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
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {isBn ? 'জনগণ.নিউজ অফিসিয়াল সোশ্যাল মিডিয়া ফটোকার্ড' : 'Official Jonogon News Social Card'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={12} color="var(--primary-red)" />
                      <span>{isBn ? 'শুধুমাত্র দেখার জন্য (View-Only) • ডাউনলোড ও স্ক্রিনশট সুরক্ষিত' : 'View-Only DRM Protected'}</span>
                    </div>
                  </div>

                  <SocialNewsCardPreview
                    isBn={isBn}
                    language={isBn ? 'bn' : 'en'}
                    title={previewArticle.titleBn || previewArticle.titleEn}
                    kicker={previewArticle.kicker}
                    imageUrl={previewArticle.imageUrl}
                    caption={previewArticle.cardCaption || (isBn ? 'ছবি: সংগৃহীত' : 'Photo: Collected')}
                    category={previewArticle.cardCategory || getCardCategoryLabel(previewArticle.category || (previewArticle.categories && previewArticle.categories[0]), categoryMasterGroups, categories)}
                    dateBn={previewArticle.dateBn}
                  />
                </div>
              ) : (
                <div style={{ maxWidth: previewDevice === 'mobile' ? 380 : '100%', margin: '0 auto' }}>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ backgroundColor: 'var(--primary-red)', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 800 }}>
                      {previewArticle.cardCategory || previewArticle.categoryBn || previewArticle.category || 'বাংলাদেশ'}
                    </span>
                  </div>

                  {previewArticle.kicker && (
                    <div style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.95rem', marginBottom: 4 }}>
                      {previewArticle.kicker}
                    </div>
                  )}

                  <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: previewDevice === 'mobile' ? '1.4rem' : '1.9rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 12, color: 'var(--text-primary)' }}>
                    {previewArticle.titleBn || previewArticle.titleEn}
                  </h1>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <User size={13} />
                      <span>{previewArticle.author || 'জনগণ ডেস্ক'}</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} />
                      <span>{previewArticle.dateBn || 'আজ'}</span>
                    </span>
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
                padding: '14px 20px',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-subtle, rgba(0,0,0,0.25))',
                borderRadius: '0 0 12px 12px'
              }}
            >
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setPreviewArticle(null)}
              >
                <X size={15} />
                <span>{isBn ? 'বন্ধ করুন' : 'Close'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="admin-btn-action"
                  onClick={() => {
                    const artId = previewArticle.id;
                    setPreviewArticle(null);
                    handleOpenEditor(artId);
                  }}
                >
                  <Edit size={15} />
                  <span>{isBn ? 'এডিট করুন' : 'Edit This Post'}</span>
                </button>

                <button
                  type="button"
                  className="admin-btn-warning"
                  onClick={() => {
                    const art = previewArticle;
                    setPreviewArticle(null);
                    handleRequestApproval(art);
                  }}
                >
                  <Send size={15} />
                  <span>{isBn ? 'অনুমোদনের আবেদন' : 'Request Approval'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
