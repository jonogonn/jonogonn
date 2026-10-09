import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Database,
  MessageSquare,
  Check,
  ExternalLink,
  ShieldCheck,
  User,
  X
} from 'lucide-react';

export default function AdminNotificationDropdown({
  isOpen,
  onClose,
  articles = [],
  pendingCount = 0,
  onNavigateTab,
  isBn = true
}) {
  const dropdownRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('jonogon_admin_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Generate dynamic notification list from active state & recent events
  const notifications = React.useMemo(() => {
    const list = [];

    // 1. Pending Approval posts
    const pendingArticles = articles.filter((a) => a.status === 'pending_approval');
    pendingArticles.forEach((art, idx) => {
      list.push({
        id: `pending-${art.id}`,
        type: 'pending_approval',
        targetTab: 'approve-post',
        titleBn: 'নতুন সংবাদ অনুমোদনের আবেদন',
        titleEn: 'Post Pending Approval',
        messageBn: `"${art.titleBn || art.titleEn}" পোস্টটি অনুমোদনের জন্য অপেক্ষা করছে।`,
        messageEn: `"${art.titleBn || art.titleEn}" is waiting for approval.`,
        timeBn: art.approvalRequestedAt
          ? new Date(art.approvalRequestedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
          : `${(idx + 1) * 3} মিনিট আগে`,
        timeEn: `${(idx + 1) * 3}m ago`,
        avatar: art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=100&q=80',
        author: art.author || 'প্রতিবেদক',
        icon: ShieldCheck,
        iconColor: '#EAB308',
        iconBg: 'rgba(234, 179, 8, 0.15)'
      });
    });

    // 2. Revision Needed posts
    const revisionArticles = articles.filter((a) => a.status === 'revision_needed');
    revisionArticles.forEach((art) => {
      list.push({
        id: `revision-${art.id}`,
        type: 'revision_needed',
        targetTab: 'edit-post',
        titleBn: 'সংবাদ সংশোধনের নির্দেশ',
        titleEn: 'Revision Requested',
        messageBn: `"${art.titleBn || art.titleEn}" এ সংশোধনের নোট যুক্ত করা হয়েছে।`,
        messageEn: `Revision requested for "${art.titleBn || art.titleEn}".`,
        timeBn: '১ ঘণ্টা আগে',
        timeEn: '1h ago',
        avatar: art.imageUrl,
        author: 'অ্যাডমিন ডেস্ক',
        icon: AlertTriangle,
        iconColor: '#EF4444',
        iconBg: 'rgba(239, 68, 68, 0.15)'
      });
    });

    // 3. System & Database connection alert
    list.push({
      id: 'sys-db-sync',
      type: 'system',
      targetTab: 'database',
      titleBn: 'ডাটাবেজ ও ক্লাউড ব্যাকআপ সিঙ্ক',
      titleEn: 'Database & Cloud Sync',
      messageBn: 'MariaDB ডাটাবেজ এবং Backblaze B2 ক্লাউড স্টোরেজ সফলভাবে সংযুক্ত রয়েছে।',
      messageEn: 'MariaDB & Backblaze B2 cloud storage are active and synced.',
      timeBn: 'আজ সকাল ০৯:১৫',
      timeEn: 'Today 09:15 AM',
      author: 'সিস্টেম অটোমেশন',
      icon: Database,
      iconColor: '#10B981',
      iconBg: 'rgba(16, 185, 129, 0.15)'
    });

    // 4. Reader comments alert
    list.push({
      id: 'comment-1',
      type: 'comment',
      targetTab: 'publish-post',
      titleBn: 'পাঠকের নতুন মন্তব্য',
      titleEn: 'New Reader Comment',
      messageBn: 'আজকের জাতীয় সংবাদে ৩টি নতুন পাঠক মন্তব্য যুক্ত হয়েছে।',
      messageEn: '3 new comments received on national news stories.',
      timeBn: '২ ঘণ্টা আগে',
      timeEn: '2h ago',
      author: 'পাঠক ফোরাম',
      icon: MessageSquare,
      iconColor: '#3B82F6',
      iconBg: 'rgba(59, 130, 246, 0.15)'
    });

    return list;
  }, [articles]);

  // Filtered by tab (all vs unread)
  const filteredList = notifications.filter((item) => {
    const isUnread = !readIds.includes(item.id);
    if (activeTab === 'unread') return isUnread;
    return true;
  });

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  // Mark single as read
  const handleItemClick = (item) => {
    if (!readIds.includes(item.id)) {
      const updated = [...readIds, item.id];
      setReadIds(updated);
      try {
        localStorage.setItem('jonogon_admin_read_notifications', JSON.stringify(updated));
      } catch (e) {}
    }
    if (typeof onNavigateTab === 'function' && item.targetTab) {
      onNavigateTab(item.targetTab);
    }
    onClose();
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem('jonogon_admin_read_notifications', JSON.stringify(allIds));
    } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: 380,
        maxWidth: '92vw',
        backgroundColor: 'var(--bg-card, #1A1D24)',
        border: '1px solid var(--border-color, #334155)',
        borderRadius: 12,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
        zIndex: 99999,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeInSlide 0.2s ease-out'
      }}
    >
      {/* 1. Header (Facebook style) */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {isBn ? 'বিজ্ঞপ্তি ও নোটিফিকেশন' : 'Notifications'}
          </h3>
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--primary-red)',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 10
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-red)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Check size={13} />
            <span>{isBn ? 'সব পঠিত চিহ্নিত করুন' : 'Mark all as read'}</span>
          </button>
        )}
      </div>

      {/* 2. Sub Tabs: All / Unread */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '8px 14px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '5px 14px',
            borderRadius: 16,
            fontSize: '0.8rem',
            fontWeight: 700,
            backgroundColor: activeTab === 'all' ? 'var(--primary-red)' : 'var(--bg-subtle)',
            color: activeTab === 'all' ? '#FFFFFF' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isBn ? 'সকল' : 'All'} ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          style={{
            padding: '5px 14px',
            borderRadius: 16,
            fontSize: '0.8rem',
            fontWeight: 700,
            backgroundColor: activeTab === 'unread' ? 'var(--primary-red)' : 'var(--bg-subtle)',
            color: activeTab === 'unread' ? '#FFFFFF' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isBn ? 'অপঠিত' : 'Unread'} ({unreadCount})
        </button>
      </div>

      {/* 3. Notification Items List */}
      <div
        style={{
          maxHeight: 380,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {filteredList.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ opacity: 0.3, margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>
              {isBn ? 'কোনো নতুন নোটিফিকেশন নেই' : 'No notifications'}
            </div>
          </div>
        ) : (
          filteredList.map((item) => {
            const isUnread = !readIds.includes(item.id);
            const ItemIcon = item.icon || Bell;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: isUnread ? 'rgba(230, 0, 18, 0.04)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = isUnread ? 'rgba(230, 0, 18, 0.04)' : 'transparent')
                }
              >
                {/* Icon or Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt="avatar"
                      style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        backgroundColor: item.iconBg || 'rgba(230,0,18,0.12)',
                        color: item.iconColor || 'var(--primary-red)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ItemIcon size={20} />
                    </div>
                  )}

                  {/* Corner Badge Icon if Avatar present */}
                  {item.avatar && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        backgroundColor: item.iconBg || '#EAB308',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--bg-card)'
                      }}
                    >
                      <ItemIcon size={10} color={item.iconColor || '#FFFFFF'} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {isBn ? item.titleBn : item.titleEn}
                  </div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginTop: 3,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {isBn ? item.messageBn : item.messageEn}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: '#EAB308', fontWeight: 600, marginTop: 4 }}>
                    <Clock size={11} />
                    <span>{isBn ? item.timeBn : item.timeEn}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.author}</span>
                  </div>
                </div>

                {/* Unread Blue Dot */}
                {isUnread && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#3B82F6',
                      marginTop: 6,
                      flexShrink: 0
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          backgroundColor: 'var(--bg-subtle)'
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (typeof onNavigateTab === 'function') onNavigateTab('approve-post');
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-red)',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          {isBn ? 'সকল জমাকৃত সংবাদ অনুমোদন প্যানেল খুলুন →' : 'Open Approvals Panel →'}
        </button>
      </div>
    </div>
  );
}
