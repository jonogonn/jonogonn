import React, { useState, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Layers,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
  Send,
  X,
  FileCheck,
  FileText,
  Sparkles,
  Smartphone,
  Monitor,
  Check,
  Share2,
  Image as ImageIcon
} from 'lucide-react';
import SocialNewsCardPreview from './SocialNewsCardPreview';
import { generateSocialCardJpg } from '../utils/generateSocialCardJpg';
import { getCardCategoryLabel } from '../utils/cardCategoryHelper';
import { saveArticleToMariaDb } from '../utils/mariaDbSync';

export default function ApprovePostManager({ triggerSaveToast, onNavigateToEdit, onNavigateToCreate }) {
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

  // Filters & State
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'published' | 'revision' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Preview Modal State (View-Only, No Edit Option as requested)
  const [previewArticle, setPreviewArticle] = useState(null);
  const [previewSubTab, setPreviewSubTab] = useState('article'); // 'article' | 'card'
  const [previewDevice, setPreviewDevice] = useState('desktop');

  // Revision Modal State
  const [revisionModalArticle, setRevisionModalArticle] = useState(null);
  const [revisionNote, setRevisionNote] = useState('');

  // Downloading State for .jpg generation
  const [downloadingId, setDownloadingId] = useState(null);

  // Filtered Articles for Approval
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (art.titleBn || '').toLowerCase().includes(q) || (art.titleEn || '').toLowerCase().includes(q);
        const matchKicker = (art.kicker || '').toLowerCase().includes(q);
        const matchAuthor = (art.author || '').toLowerCase().includes(q);
        if (!matchTitle && !matchKicker && !matchAuthor) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        const catMatch = art.category === categoryFilter || (art.categories || []).includes(categoryFilter);
        if (!catMatch) return false;
      }

      // 3. Tab Filter
      const s = art.status || 'published';
      if (activeTab === 'pending') {
        return s === 'pending_approval' || s === 'review' || s === 'submitted';
      }
      if (activeTab === 'published') {
        return s === 'published' || !art.status;
      }
      if (activeTab === 'revision') {
        return s === 'revision_needed';
      }

      return true; // 'all'
    });
  }, [articles, searchQuery, categoryFilter, activeTab]);

  // Counts
  const counts = useMemo(() => {
    let pending = 0;
    let published = 0;
    let revision = 0;

    articles.forEach((a) => {
      const s = a.status || 'published';
      if (s === 'pending_approval' || s === 'review' || s === 'submitted') pending++;
      else if (s === 'published' || !a.status) published++;
      else if (s === 'revision_needed') revision++;
    });

    return { all: articles.length, pending, published, revision };
  }, [articles]);

  // 1. Approve & Publish Post Handler
  const handleApproveAndPublish = async (article) => {
    const confirmed = await showConfirm({
      title: isBn ? 'সংবাদ অনুমোদন ও প্রকাশনা নিশ্চিতকরণ' : 'Confirm Post Approval & Publication',
      message: isBn
        ? `আপনি কি নিশ্চিত যে "${article.titleBn || article.titleEn}" পোস্টটি অনুমোদন করে মূল ওয়েবসাইটে প্রকাশ করতে চান?`
        : `Approve and publish "${article.titleBn || article.titleEn}" to live website?`,
      subMessage: isBn
        ? 'অনুমোদনের সাথে সাথে এটি সাইটে প্রদর্শিত হবে এবং সোশ্যাল পোস্টার .JPG ফরম্যাটে ডাউনলোড করার সুবিধা উন্মুক্ত হবে।'
        : 'Upon approval, the article goes live and the social poster JPG download becomes available.',
      confirmText: isBn ? 'হ্যাঁ, অনুমোদন ও প্রকাশ করুন' : 'Yes, Approve & Publish',
      type: 'success'
    });

    if (confirmed) {
      const publishedPayload = {
        ...article,
        status: 'published',
        approvedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };

      updateArticle(article.id, {
        status: 'published',
        approvedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      });

      // Save directly to MariaDB
      saveArticleToMariaDb(publishedPayload).catch((err) => {
        console.warn('MariaDB publish sync error:', err);
      });

      if (triggerSaveToast) {
        triggerSaveToast(isBn ? 'সংবাদটি সফলভাবে অনুমোদিত ও প্রকাশিত হয়েছে!' : 'Post approved and published successfully!');
      }

      showSuccess(
        isBn
          ? 'সংবাদটি সফলভাবে অনুমোদিত হয়েছে, MariaDB ডাটাবেজে সংরক্ষিত হয়েছে এবং মূল ওয়েবসাইটে প্রকাশিত হয়েছে! আপনি এখন নিচে থেকে সোশ্যাল ফটোকার্ড .JPG ডাউনলোড করতে পারেন।'
          : 'Post approved and saved to MariaDB! You can now download the social poster JPG.'
      );

      if (previewArticle && previewArticle.id === article.id) {
        setPreviewArticle((prev) => ({ ...prev, status: 'published' }));
      }
    }
  };

  // 2. Send Back for Revision Handler
  const handleOpenRevisionModal = (article) => {
    setRevisionModalArticle(article);
    setRevisionNote(article.revisionNotes || '');
  };

  const handleConfirmRevision = () => {
    if (!revisionModalArticle) return;
    if (!revisionNote.trim()) {
      showError(isBn ? 'অনুগ্রহ করে সংশোধনের কারণ বা নির্দেশনা লিখুন।' : 'Please enter revision instructions.');
      return;
    }

    updateArticle(revisionModalArticle.id, {
      status: 'revision_needed',
      revisionNotes: revisionNote.trim(),
      sentForRevisionAt: new Date().toISOString()
    });

    if (triggerSaveToast) {
      triggerSaveToast(isBn ? 'সংবাদটি সংশোধনের জন্য ফেরত পাঠানো হয়েছে!' : 'Sent back for revision!');
    }

    setRevisionModalArticle(null);
    setRevisionNote('');
    if (previewArticle) setPreviewArticle(null);
  };

  // 3. Download Official High-Resolution Social Poster (.JPG)
  const handleDownloadPosterJpg = async (article) => {
    try {
      setDownloadingId(article.id);
      const cleanSlug = (article.slug || article.titleBn || 'jonogon-news-card')
        .toLowerCase()
        .replace(/[^\w\u0980-\u09FF\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);

      const cardCat = article.cardCategory || getCardCategoryLabel(article.category || (article.categories && article.categories[0]), categoryMasterGroups, categories);

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

      if (triggerSaveToast) {
        triggerSaveToast(isBn ? 'সোশ্যাল পোস্টার .JPG ডাউনলোড সম্পন্ন!' : 'Poster .JPG downloaded successfully!');
      }
    } catch (err) {
      console.error('Error generating card JPG:', err);
      showError(isBn ? 'পোস্টার জেনারেট করতে সমস্যা হয়েছে।' : 'Failed to generate poster JPG.');
    } finally {
      setDownloadingId(null);
    }
  };

  // 4. Delete / Reject Post
  const handleDeletePost = async (article) => {
    const confirmed = await showConfirm({
      title: isBn ? 'পোস্ট বাতিল ও মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Post',
      message: isBn
        ? `আপনি কি নিশ্চিত যে "${article.titleBn || article.titleEn}" পোস্টটি বাতিল করে মুছে ফেলতে চান?`
        : `Are you sure you want to permanently delete "${article.titleBn || article.titleEn}"?`,
      confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
      type: 'danger'
    });

    if (confirmed) {
      deleteArticle(article.id);
      if (triggerSaveToast) triggerSaveToast(isBn ? 'পোস্ট মুছে ফেলা হয়েছে!' : 'Post deleted!');
      if (previewArticle && previewArticle.id === article.id) setPreviewArticle(null);
    }
  };

  return (
    <div className="admin-approve-post-manager">
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
            <ShieldCheck size={26} color="#10B981" />
            <span>{isBn ? 'পোস্ট অনুমোদন ও প্রকাশনা কেন্দ্র (Approve Post)' : 'Approve Post & Publishing'}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 3 }}>
            {isBn
              ? 'এখানে পর্যালোচনার জন্য জমাকৃত পোস্টগুলো পড়ুন ও অনুমোদন করুন। অনুমোদনের পর পোস্ট লাইভ হবে এবং সোশ্যাল মিডিয়া পোস্টার .JPG ডাউনলোড করা যাবে।'
              : 'Review submitted posts, approve them for live publishing, and download high-resolution .JPG social cards.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onNavigateToEdit && (
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={onNavigateToEdit}
              style={{ fontSize: '0.86rem', padding: '8px 16px' }}
            >
              <FileText size={16} />
              <span>{isBn ? 'Edit Post তালিকায় যান' : 'Go to Edit Post'}</span>
            </button>
          )}

          {onNavigateToCreate && (
            <button
              type="button"
              className="admin-btn-primary"
              onClick={onNavigateToCreate}
              style={{ fontSize: '0.86rem', padding: '8px 16px' }}
            >
              <Send size={16} />
              <span>{isBn ? 'নতুন পোস্ট তৈরি' : 'Create Post'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Counter Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 20
        }}
      >
        <div
          className="admin-card"
          style={{
            padding: '16px 18px',
            borderLeft: '4px solid #EAB308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isBn ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#EAB308', marginTop: 2 }}>
              {counts.pending}
            </div>
          </div>
          <Clock size={32} color="#EAB308" opacity={0.3} />
        </div>

        <div
          className="admin-card"
          style={{
            padding: '16px 18px',
            borderLeft: '4px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isBn ? 'অনুমোদিত ও প্রকাশিত' : 'Approved & Published'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', marginTop: 2 }}>
              {counts.published}
            </div>
          </div>
          <CheckCircle size={32} color="#10B981" opacity={0.3} />
        </div>

        <div
          className="admin-card"
          style={{
            padding: '16px 18px',
            borderLeft: '4px solid #EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isBn ? 'সংশোধনের জন্য ফেরত' : 'Sent for Revision'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#EF4444', marginTop: 2 }}>
              {counts.revision}
            </div>
          </div>
          <AlertTriangle size={32} color="#EF4444" opacity={0.3} />
        </div>
      </div>

      {/* Tabs */}
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
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: '0.84rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: activeTab === 'pending' ? '#EAB308' : 'var(--border-color)',
            backgroundColor: activeTab === 'pending' ? '#EAB308' : 'var(--bg-card)',
            color: activeTab === 'pending' ? '#000' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Clock size={14} />
          <span>{isBn ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval'}</span>
          <span style={{ backgroundColor: activeTab === 'pending' ? '#000' : '#EAB308', color: activeTab === 'pending' ? '#fff' : '#000', padding: '1px 6px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 800 }}>
            {counts.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('published')}
          style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: '0.84rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: activeTab === 'published' ? '#10B981' : 'var(--border-color)',
            backgroundColor: activeTab === 'published' ? '#10B981' : 'var(--bg-card)',
            color: activeTab === 'published' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <CheckCircle size={14} />
          <span>{isBn ? 'অনুমোদিত ও প্রকাশিত' : 'Approved & Published'}</span>
          <span style={{ backgroundColor: activeTab === 'published' ? 'rgba(0,0,0,0.3)' : 'rgba(16,185,129,0.2)', padding: '1px 6px', borderRadius: 10, fontSize: '0.72rem' }}>
            {counts.published}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('revision')}
          style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: '0.84rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: activeTab === 'revision' ? '#EF4444' : 'var(--border-color)',
            backgroundColor: activeTab === 'revision' ? '#EF4444' : 'var(--bg-card)',
            color: activeTab === 'revision' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <AlertTriangle size={14} />
          <span>{isBn ? 'সংশোধনের জন্য ফেরত' : 'Sent for Revision'}</span>
          <span style={{ backgroundColor: activeTab === 'revision' ? 'rgba(0,0,0,0.3)' : 'rgba(239,68,68,0.2)', padding: '1px 6px', borderRadius: 10, fontSize: '0.72rem' }}>
            {counts.revision}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: '0.84rem',
            fontWeight: 700,
            border: '1px solid',
            borderColor: activeTab === 'all' ? 'var(--primary-red)' : 'var(--border-color)',
            backgroundColor: activeTab === 'all' ? 'var(--primary-red)' : 'var(--bg-card)',
            color: activeTab === 'all' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          {isBn ? 'সকল পোস্ট' : 'All Posts'} ({counts.all})
        </button>
      </div>

      {/* Search Toolbar */}
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
            placeholder={isBn ? 'শিরোনাম, কিকার বা লেখক দিয়ে খুঁজুন...' : 'Search pending posts...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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

      {/* Posts List */}
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
          <FileCheck size={44} color="#10B981" opacity={0.4} style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {activeTab === 'pending'
              ? isBn
                ? 'অনুমোদনের জন্য কোনো পোস্ট অপেক্ষমাণ নেই'
                : 'No posts currently waiting for approval'
              : isBn
              ? 'কোনো পোস্ট পাওয়া যায়নি'
              : 'No posts found'}
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            {activeTab === 'pending'
              ? isBn
                ? 'লেখকরা "Edit Post" ট্যাব থেকে "Request For Approval" পাঠালে তা এখানে জমা হবে।'
                : 'Submitted requests will appear here for admin approval.'
              : isBn
              ? 'অন্যান্য ট্যাবে চেক করুন।'
              : 'Check other tabs.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredArticles.map((art) => {
            const isApproved = art.status === 'published' || !art.status;
            const isPending = art.status === 'pending_approval' || art.status === 'review' || art.status === 'submitted';
            const isRevision = art.status === 'revision_needed';

            return (
              <div
                key={art.id}
                className="admin-approve-card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  backgroundColor: 'var(--bg-card, #1A1D24)',
                  border: isPending
                    ? '1px solid rgba(234, 179, 8, 0.4)'
                    : '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  boxShadow: isPending
                    ? '0 4px 14px rgba(234, 179, 8, 0.08)'
                    : '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                {/* Left: Thumbnail & Post Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 320 }}>
                  <div
                    style={{
                      width: 85,
                      height: 64,
                      borderRadius: 6,
                      overflow: 'hidden',
                      backgroundColor: '#2A2D34',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&q=80'}
                      alt="Thumbnail"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
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
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        marginBottom: 6
                      }}
                    >
                      {art.titleBn || art.titleEn || (isBn ? 'শিরোনামহীন' : 'Untitled')}
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <span style={{ backgroundColor: 'rgba(230,0,18,0.12)', color: 'var(--primary-red)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        {art.categoryBn || art.category || 'বাংলাদেশ'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <User size={12} />
                        <span>{art.author || 'জনগণ ডেস্ক'}</span>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        <span>{art.dateBn || 'আজ'}</span>
                      </span>
                      {art.approvalRequestedAt && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#EAB308', fontWeight: 600 }}>
                          <Clock size={12} />
                          <span>সাবমিট: {new Date(art.approvalRequestedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div>
                  {isPending && (
                    <span style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#EAB308', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '4px 10px', borderRadius: 4, fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      <span>অনুমোদনের অপেক্ষায়</span>
                    </span>
                  )}
                  {isApproved && (
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: 4, fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={13} />
                      <span>অনুমোদিত ও প্রকাশিত</span>
                    </span>
                  )}
                  {isRevision && (
                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: 4, fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={13} />
                      <span>সংশোধন প্রয়োজন</span>
                    </span>
                  )}
                </div>

                {/* Right Actions: Preview, Approve, Download .JPG, Send for Revision */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {/* 1. Preview Button (Strictly view-only, no edit option) */}
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    onClick={() => {
                      setPreviewArticle(art);
                      setPreviewSubTab('article');
                    }}
                    title={isBn ? 'সংবাদটি পড়ুন ও প্রিভিউ দেখুন' : 'Read & Preview Post'}
                  >
                    <Eye size={14} color="var(--primary-red)" />
                    <span>{isBn ? 'প্রিভিউ পড়ুন' : 'Read & Preview'}</span>
                  </button>

                  {/* 2. Approve & Publish Button (If not already published) */}
                  {!isApproved && (
                    <button
                      type="button"
                      className="admin-btn-primary"
                      style={{
                        fontSize: '0.78rem',
                        padding: '6px 14px',
                        backgroundColor: '#10B981',
                        borderColor: '#10B981',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                      onClick={() => handleApproveAndPublish(art)}
                      title={isBn ? 'অনুমোদন করে লাইভ প্রকাশ করুন' : 'Approve & Publish'}
                    >
                      <CheckCircle size={14} />
                      <span>{isBn ? 'অনুমোদন করুন' : 'Approve & Publish'}</span>
                    </button>
                  )}

                  {/* 3. Download Official HD Social Poster .JPG Button (Always available in Approve Post tab) */}
                  <button
                    type="button"
                    className="admin-btn-action"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    disabled={downloadingId === art.id}
                    onClick={() => handleDownloadPosterJpg(art)}
                    title={isBn ? 'সোশ্যাল ফটোকার্ড .JPG ডাউনলোড করুন' : 'Download Social Poster .JPG'}
                  >
                    <Download size={14} />
                    <span>{downloadingId === art.id ? (isBn ? 'তৈরি হচ্ছে...' : 'Generating...') : (isBn ? 'ফটোকার্ড .JPG' : 'Card .JPG')}</span>
                  </button>

                  {/* 4. Send for Revision Button */}
                  {isPending && (
                    <button
                      type="button"
                      className="admin-btn-action"
                      style={{
                        fontSize: '0.78rem',
                        padding: '6px 12px',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                      onClick={() => handleOpenRevisionModal(art)}
                      title={isBn ? 'সংশোধনের জন্য ফেরত পাঠান' : 'Send Back for Revision'}
                    >
                      <RotateCcw size={13} />
                      <span>{isBn ? 'সংশোধন ফেরত' : 'Revision'}</span>
                    </button>
                  )}

                  {/* 5. Delete Button */}
                  <button
                    type="button"
                    className="admin-btn-danger"
                    style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handleDeletePost(art)}
                    title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- PREVIEW MODAL (Strictly View-Only, No Edit Option as requested) --- */}
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
              maxWidth: previewSubTab === 'card' ? 560 : 860,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setPreviewSubTab('article')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: previewSubTab === 'article' ? '1px solid var(--primary-red)' : '1px solid transparent',
                    backgroundColor: previewSubTab === 'article' ? 'rgba(230,0,18,0.15)' : 'transparent',
                    color: previewSubTab === 'article' ? 'var(--primary-red)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <FileText size={14} />
                  <span>{isBn ? 'সম্পূর্ণ সংবাদ পড়ুন' : 'Read Article'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSubTab('card')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: previewSubTab === 'card' ? '1px solid var(--primary-red)' : '1px solid transparent',
                    backgroundColor: previewSubTab === 'card' ? 'rgba(230,0,18,0.15)' : 'transparent',
                    color: previewSubTab === 'card' ? 'var(--primary-red)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ImageIcon size={14} />
                  <span>{isBn ? 'সোশ্যাল ফটো কার্ড' : 'Social Card'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {previewSubTab === 'article' && (
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
              {previewSubTab === 'card' ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {isBn ? 'জনগণ.নিউজ অফিসিয়াল সোশ্যাল মিডিয়া ফটোকার্ড' : 'Official Jonogon News Social Card'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {isBn
                        ? (previewArticle.status === 'published' || !previewArticle.status
                          ? 'অনুমোদিত পোস্ট! আপনি নিচে থেকে .JPG ফাইল ডাউনলোড করতে পারেন।'
                          : 'পোস্ট অনুমোদনের পর সরাসরি .JPG ডাউনলোড বাটন দৃশ্যমান হবে।')
                        : 'Social media 1024x1024 poster preview'}
                    </div>
                  </div>

                  <SocialNewsCardPreview
                    title={previewArticle.titleBn || previewArticle.titleEn}
                    kicker={previewArticle.kicker}
                    imageUrl={previewArticle.imageUrl}
                    caption={previewArticle.cardCaption || 'ছবি: সংগৃহীত'}
                    category={previewArticle.cardCategory || getCardCategoryLabel(previewArticle.category || (previewArticle.categories && previewArticle.categories[0]), categoryMasterGroups, categories)}
                    dateBn={previewArticle.dateBn}
                  />

                  {/* Direct Download Button Below Card */}
                  <div style={{ marginTop: 14, textAlign: 'center' }}>
                    <button
                      type="button"
                      className="admin-btn-primary"
                      style={{ padding: '9px 24px', fontSize: '0.9rem' }}
                      disabled={downloadingId === previewArticle.id}
                      onClick={() => handleDownloadPosterJpg(previewArticle)}
                    >
                      <Download size={16} />
                      <span>{downloadingId === previewArticle.id ? (isBn ? 'পোস্টার তৈরি হচ্ছে...' : 'Generating...') : (isBn ? 'অফিসিয়াল সোশ্যাল ফটোকার্ড ডাউনলোড (.JPG)' : 'Download Official Social Card (.JPG)')}</span>
                    </button>
                  </div>
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
                {/* Always provide HD Social Poster Download button */}
                <button
                  type="button"
                  className="admin-btn-primary"
                  disabled={downloadingId === previewArticle.id}
                  onClick={() => handleDownloadPosterJpg(previewArticle)}
                >
                  <Download size={15} />
                  <span>{downloadingId === previewArticle.id ? (isBn ? 'জেনারেট হচ্ছে...' : 'Generating...') : (isBn ? 'সোশ্যাল পোস্টার ডাউনলোড (.JPG)' : 'Download Poster .JPG')}</span>
                </button>

                {previewArticle.status !== 'published' && previewArticle.status && (
                  <>
                    <button
                      type="button"
                      className="admin-btn-revision"
                      onClick={() => {
                        const art = previewArticle;
                        handleOpenRevisionModal(art);
                      }}
                    >
                      <RotateCcw size={15} />
                      <span>{isBn ? 'সংশোধন ফেরত' : 'Send for Revision'}</span>
                    </button>

                    <button
                      type="button"
                      className="admin-btn-success"
                      onClick={() => handleApproveAndPublish(previewArticle)}
                    >
                      <CheckCircle size={15} />
                      <span>{isBn ? 'অনুমোদন ও প্রকাশ করুন' : 'Approve & Publish'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SEND FOR REVISION MODAL --- */}
      {revisionModalArticle && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setRevisionModalArticle(null)}
        >
          <div
            className="admin-modal-box"
            style={{
              width: '100%',
              maxWidth: 480,
              backgroundColor: 'var(--bg-card, #1A1D24)',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              padding: 20,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.1rem', fontWeight: 800, color: '#EF4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={18} />
              <span>{isBn ? 'সংশোধনের জন্য ফেরত পাঠান' : 'Send Back for Revision'}</span>
            </h3>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              পোস্টের লেখককে কী কী পরিবর্তন বা সংশোধন করতে হবে তা নিচে লিখে দিন। লেখক "Edit Post" ট্যাবে এই নির্দেশনা দেখতে পাবেন।
            </p>

            <div className="admin-form-group" style={{ marginBottom: 16 }}>
              <label className="admin-label">{isBn ? 'সংশোধনের নির্দেশনা / নোট' : 'Revision Instructions / Notes'}</label>
              <textarea
                className="admin-input"
                rows={4}
                style={{ resize: 'vertical' }}
                placeholder={isBn ? 'যেমন: শিরোনামটি আরও সংক্ষিপ্ত করুন এবং ছবির ক্রেডিট সঠিক দিন...' : 'e.g. Please shorten the headline and update photo credit...'}
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setRevisionModalArticle(null)}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }}
                onClick={handleConfirmRevision}
              >
                <Send size={14} />
                <span>{isBn ? 'সংশোধন নির্দেশ পাঠান' : 'Send Revision'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
