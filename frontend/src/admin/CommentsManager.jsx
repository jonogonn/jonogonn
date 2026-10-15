import React, { useState, useEffect, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  User,
  Mail,
  FileText,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

export default function CommentsManager({ triggerSaveToast }) {
  const { adminLanguage, language, adminTheme, theme, articles, openArticle } = useNews();
  const isBn = (adminLanguage || language) === 'bn';
  const isLight = (adminTheme || theme) === 'light';

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/comments.php?admin=1');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
      } else {
        // Sample comments for preview if table is clean
        setComments([
          {
            id: '1',
            post_id: 'post-1',
            name: 'তাহমিদ হাসান',
            email: 'tahmid@example.com',
            text: 'খুবই সময়োপযোগী ও বস্তুনিষ্ঠ প্রতিবেদন। সত্য প্রকাশের জন্য আপনাদের সাধুবাদ জানাই।',
            status: 'approved',
            date: '১০ মিনিট আগে',
            date_en: '10 mins ago',
            created_at: new Date(Date.now() - 600000).toISOString()
          },
          {
            id: '2',
            post_id: 'post-2',
            name: 'সাবিহা সুলতানা',
            email: 'sabiha@gmail.com',
            text: 'এই বিষয়ে সংশ্লিষ্ট মন্ত্রণালয় ও কর্তৃপক্ষের তাৎক্ষণিক নজর দেওয়া প্রয়োজন।',
            status: 'pending',
            date: '১ ঘণ্টা আগে',
            date_en: '1 hour ago',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '3',
            post_id: 'post-3',
            name: 'Spam User',
            email: 'promo@spamlink.xyz',
            text: 'Visit our promotional casino website for free bonus cash!',
            status: 'rejected',
            date: 'গতকাল',
            date_en: 'Yesterday',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
    } catch (err) {
      console.warn('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Update Status (approve / reject)
  const handleUpdateStatus = async (commentId, newStatus) => {
    try {
      const res = await fetch('/api/comments.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          id: commentId,
          status: newStatus
        })
      });
      const data = await res.json();
      if (data && data.success) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId || c.id === String(commentId) ? { ...c, status: newStatus } : c))
        );
        if (typeof triggerSaveToast === 'function') {
          triggerSaveToast(
            newStatus === 'approved'
              ? (isBn ? 'মন্তব্যটি অনুমোদন করা হয়েছে!' : 'Comment approved!')
              : (isBn ? 'মন্তব্যটি বাতিল করা হয়েছে!' : 'Comment rejected!')
          );
        }
      }
    } catch (e) {
      // Optimistic update
      setComments((prev) =>
        prev.map((c) => (c.id === commentId || c.id === String(commentId) ? { ...c, status: newStatus } : c))
      );
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      isBn ? 'আপনি কি নিশ্চিত এই মন্তব্যটি চিরতরে মুছে ফেলতে চান?' : 'Are you sure you want to permanently delete this comment?'
    );
    if (!confirmed) return;

    try {
      await fetch(`/api/comments.php?id=${encodeURIComponent(commentId)}`, {
        method: 'DELETE'
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.id !== String(commentId)));
      if (typeof triggerSaveToast === 'function') {
        triggerSaveToast(isBn ? 'মন্তব্য মুছে ফেলা হয়েছে!' : 'Comment deleted!');
      }
    } catch (e) {
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.id !== String(commentId)));
    }
  };

  // Find article details by post_id
  const getArticleForComment = (postId) => {
    if (!postId || !Array.isArray(articles)) return null;
    return articles.find((a) => a.id === postId || a.post_id === postId || a.slug === postId);
  };

  // Filtered comments
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesEmail = (c.email || '').toLowerCase().includes(q);
        const matchesText = (c.text || '').toLowerCase().includes(q);
        const matchesPost = (c.post_id || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesText && !matchesPost) return false;
      }
      return true;
    });
  }, [comments, statusFilter, searchQuery]);

  // KPI Metrics
  const totalCount = comments.length;
  const approvedCount = comments.filter((c) => c.status === 'approved').length;
  const pendingCount = comments.filter((c) => c.status === 'pending').length;
  const rejectedCount = comments.filter((c) => c.status === 'rejected').length;

  return (
    <div className="admin-comments-manager">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={26} color="var(--primary-red)" />
            <span>{isBn ? 'পাঠক মন্তব্য ব্যবস্থাপনা' : 'Reader Comments Management'}</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: isLight ? '#64748B' : '#94A3B8' }}>
            {isBn
              ? 'নিউজ পোর্টালের প্রকাশিত সংবাদের নিচে পাঠকদের জমাকৃত সকল মন্তব্য ও অনুমোদন'
              : 'All reader comments submitted on published articles with approval control'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchComments}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 6,
            backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
            border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
            color: isLight ? '#0F172A' : '#FFFFFF',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
          <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 20
        }}
      >
        <div className="admin-card" style={{ padding: '16px 18px', borderRadius: 10, margin: 0, backgroundColor: isLight ? '#FFFFFF' : '#161B26' }}>
          <div style={{ fontSize: '0.78rem', color: isLight ? '#64748B' : '#94A3B8', fontWeight: 700 }}>
            {isBn ? 'মোট মন্তব্য' : 'Total Comments'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-red)', marginTop: 4 }}>
            {totalCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 18px', borderRadius: 10, margin: 0, backgroundColor: isLight ? '#FFFFFF' : '#161B26' }}>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
            {isBn ? 'অনুমোদিত মন্তব্য' : 'Approved Comments'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', marginTop: 4 }}>
            {approvedCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 18px', borderRadius: 10, margin: 0, backgroundColor: isLight ? '#FFFFFF' : '#161B26' }}>
          <div style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 700 }}>
            {isBn ? 'অপেক্ষমাণ মন্তব্য' : 'Pending Approval'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F59E0B', marginTop: 4 }}>
            {pendingCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 18px', borderRadius: 10, margin: 0, backgroundColor: isLight ? '#FFFFFF' : '#161B26' }}>
          <div style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 700 }}>
            {isBn ? 'বাতিল / স্প্যাম' : 'Rejected / Spam'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#EF4444', marginTop: 4 }}>
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div
        className="admin-card"
        style={{
          padding: '14px 18px',
          borderRadius: 10,
          marginBottom: 18,
          backgroundColor: isLight ? '#FFFFFF' : '#161B26',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 260px', position: 'relative' }}>
          <Search size={16} color={isLight ? '#94A3B8' : '#64748B'} style={{ position: 'absolute', left: 12 }} />
          <input
            type="text"
            className="admin-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'মন্তব্যকারীর নাম, ইমেইল বা টেক্সট দিয়ে খুঁজুন...' : 'Search by name, email, comment...'}
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, height: 38, borderRadius: 6 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', labelBn: 'সবগুলো', labelEn: 'All' },
            { id: 'approved', labelBn: 'অনুমোদিত', labelEn: 'Approved' },
            { id: 'pending', labelBn: 'অপেক্ষমাণ', labelEn: 'Pending' },
            { id: 'rejected', labelBn: 'বাতিল', labelEn: 'Rejected' }
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatusFilter(s.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: statusFilter === s.id ? '1px solid var(--primary-red)' : isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: statusFilter === s.id ? 'rgba(229, 9, 20, 0.12)' : 'transparent',
                color: statusFilter === s.id ? 'var(--primary-red)' : isLight ? '#475569' : '#94A3B8',
                fontWeight: statusFilter === s.id ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {isBn ? s.labelBn : s.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div
        className="admin-card"
        style={{
          padding: 0,
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: isLight ? '#FFFFFF' : '#161B26',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {filteredComments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <MessageSquare size={42} style={{ color: 'var(--primary-red)', marginBottom: 12, opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4 }}>
              {isBn ? 'কোনো মন্তব্য পাওয়া যায়নি' : 'No comments found'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: isLight ? '#64748B' : '#94A3B8', margin: 0 }}>
              {isBn ? 'অন্য কোনো ফিল্টার বা অনুসন্ধান ব্যবহার করে দেখুন।' : 'Try changing your search or filter.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredComments.map((comment) => {
              const matchedArticle = getArticleForComment(comment.post_id);
              const isApproved = comment.status === 'approved';
              const isRejected = comment.status === 'rejected';

              return (
                <div
                  key={comment.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: isLight ? '1px solid #F1F5F9' : '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  {/* Top: User info, Status badge, Timestamp */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          backgroundColor: isApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(229, 9, 20, 0.15)',
                          color: isApproved ? '#10B981' : 'var(--primary-red)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.88rem'
                        }}
                      >
                        {comment.name ? comment.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isLight ? '#0F172A' : '#FFFFFF' }}>
                          {comment.name}
                        </div>
                        {comment.email && (
                          <div style={{ fontSize: '0.74rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                            {comment.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Status Tag */}
                      {isApproved && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '0.72rem', fontWeight: 800 }}>
                          <CheckCircle2 size={11} />
                          <span>{isBn ? 'অনুমোদিত' : 'Approved'}</span>
                        </span>
                      )}
                      {comment.status === 'pending' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontSize: '0.72rem', fontWeight: 800 }}>
                          <Clock size={11} />
                          <span>{isBn ? 'অপেক্ষমাণ' : 'Pending'}</span>
                        </span>
                      )}
                      {isRejected && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontSize: '0.72rem', fontWeight: 800 }}>
                          <XCircle size={11} />
                          <span>{isBn ? 'বাতিল' : 'Rejected'}</span>
                        </span>
                      )}

                      <span style={{ fontSize: '0.75rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                        {isBn ? comment.date : (comment.date_en || comment.date)}
                      </span>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      backgroundColor: isLight ? '#F8FAFC' : 'rgba(0, 0, 0, 0.25)',
                      border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.86rem',
                      lineHeight: 1.5,
                      color: isLight ? '#334155' : '#E2E8F0'
                    }}
                  >
                    {comment.text}
                  </div>

                  {/* Bottom: Attached Article and Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: '0.76rem', color: isLight ? '#64748B' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={12} color="var(--primary-red)" />
                      <span>{isBn ? 'সংবাদ:' : 'Article:'}</span>
                      {matchedArticle ? (
                        <button
                          type="button"
                          onClick={() => openArticle(matchedArticle)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: 'var(--primary-red)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '0.76rem'
                          }}
                        >
                          {isBn ? matchedArticle.titleBn : matchedArticle.titleEn}
                        </button>
                      ) : (
                        <span style={{ fontFamily: 'monospace' }}>{comment.post_id || 'ID: General'}</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(comment.id, 'approved')}
                          title={isBn ? 'অনুমোদন করুন' : 'Approve Comment'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            borderRadius: 6,
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={12} />
                          <span>{isBn ? 'অনুমোদন' : 'Approve'}</span>
                        </button>
                      )}

                      {!isRejected && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                          title={isBn ? 'বাতিল করুন' : 'Reject Comment'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            borderRadius: 6,
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <X size={12} />
                          <span>{isBn ? 'বাতিল' : 'Reject'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                        style={{
                          padding: '5px 8px',
                          borderRadius: 6,
                          backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                          color: isLight ? '#64748B' : '#94A3B8',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
