import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNews } from '../context/NewsContext';
import { uploadImageToStorage } from '../utils/imageUploader';
import {
  Inbox,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Lock,
  User,
  Phone,
  MapPin,
  Tag,
  X,
  Check,
  Filter,
  MoreVertical,
  Video,
  Play,
  Save,
  Upload,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

const CATEGORY_NAMES = {
  corruption: { bn: 'দুর্নীতি ও অনিয়ম', en: 'Corruption & Irregularities' },
  public_service: { bn: 'নাগরিক সেবা ও ভোগান্তি', en: 'Public Service Issues' },
  health: { bn: 'স্বাস্থ্য ও চিকিৎসা সেবা', en: 'Healthcare & Hospital' },
  education: { bn: 'শিক্ষা ও শিক্ষাপ্রতিষ্ঠান', en: 'Education & Institutions' },
  road_transport: { bn: 'সড়ক ও যোগাযোগ ব্যবস্থা', en: 'Roads & Transport' },
  crime_fraud: { bn: 'প্রতারণা ও সামাজিক অপরাধ', en: 'Fraud & Crime' },
  other: { bn: 'অন্যান্য অভিযোগ', en: 'Other Issues' }
};

export default function ComplaintsManager({ triggerSaveToast }) {
  const { adminLanguage, language, adminTheme, theme, settings, updateSiteSettings, showSuccess, showError } = useNews();
  const isBn = (adminLanguage || language) === 'bn';
  const isLight = (adminTheme || theme) === 'light';

  // Complaint Box Video Link Management
  const [complaintVideoUrl, setComplaintVideoUrl] = useState(
    settings?.complaintBoxVideo?.youtubeUrl || settings?.complaintBoxVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  );
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  useEffect(() => {
    const currentUrl = settings?.complaintBoxVideo?.youtubeUrl || settings?.complaintBoxVideoUrl;
    if (currentUrl) {
      setComplaintVideoUrl(currentUrl);
    }
  }, [settings?.complaintBoxVideo, settings?.complaintBoxVideoUrl]);

  const handleSaveVideoSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingVideo(true);
    try {
      const trimmedUrl = (complaintVideoUrl || '').trim();
      const updatedComplaintBoxVideo = {
        ...(settings?.complaintBoxVideo || {}),
        youtubeUrl: trimmedUrl
      };

      if (updateSiteSettings) {
        await updateSiteSettings({
          complaintBoxVideo: updatedComplaintBoxVideo,
          complaintBoxVideoUrl: trimmedUrl
        });
      }

      if (triggerSaveToast) {
        triggerSaveToast(isBn ? 'ভিডিও লিংক সফলভাবে সংরক্ষিত হয়েছে!' : 'Video link saved successfully!');
      } else if (showSuccess) {
        showSuccess(isBn ? 'ভিডিও লিংক সফলভাবে সংরক্ষিত হয়েছে!' : 'Video link saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save complaint box video URL:', err);
      if (showError) {
        showError(isBn ? 'ভিডিও লিংক সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save video link');
      }
    } finally {
      setIsSavingVideo(false);
    }
  };

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusEdit, setStatusEdit] = useState('');
  const [adminNotesEdit, setAdminNotesEdit] = useState('');

  // Mobile 3-dot action menu state
  const [activeMenuComplaintId, setActiveMenuComplaintId] = useState(null);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.admin-3dot-container')) {
        setActiveMenuComplaintId(null);
      }
    };
    if (activeMenuComplaintId) {
      document.addEventListener('click', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [activeMenuComplaintId]);

  // Sample initial complaints if localStorage is empty
  const defaultSampleComplaints = [
    {
      id: 'JONOGON-582914',
      title: 'উপজেলা স্বাস্থ্য কমপ্লেক্সে ডাক্তারদের অনিয়মিত উপস্থিতি ও সেবা ভোগান্তি',
      category: 'health',
      district: 'dhaka',
      name: 'মো. রফিকুল ইসলাম',
      phone: '01712-345678',
      description: 'উপজেলা স্বাস্থ্য কমপ্লেক্সে সকাল ৯টার বদলে ডাক্তাররা বেলা ১১টার পর আসেন। জরুরি বিভাগে কোনো চিকিৎসক না থাকায় রোগীরা সীমাহীন দুর্ভোগের শিকার হচ্ছেন। দ্রত তদন্তের অনুরোধ জানাচ্ছি।',
      isAnonymous: false,
      fileName: 'hospital_report.pdf',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'JONOGON-491028',
      title: 'পৌরসভার ড্রেনেজ ব্যবস্থা বন্ধ থাকায় সামান্য বৃষ্টিতেই তীব্র জলাবদ্ধতা',
      category: 'public_service',
      district: 'gazipur',
      name: 'নাম প্রকাশে অনিচ্ছুক',
      phone: '',
      description: 'গত ৩ বছর ধরে ড্রেন পরিষ্কার না করায় পুরো এলাকার রাস্তা পানিতে ডুবে থাকে। শিক্ষার্থীদের স্কুলে যেতে চরম দুর্ভোগ পোহাতে হয়। পৌরসভা কোনো পদক্ষেপ নিচ্ছে না।',
      isAnonymous: true,
      fileName: '',
      status: 'reviewing',
      adminNotes: 'স্থানীয় সাংবাদিককে তথ্য অনুসন্ধানের নির্দেশ দেওয়া হয়েছে।',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'JONOGON-831920',
      title: 'সরকারি খাদ্যবান্ধব কর্মসূচির চাল বিতরণে ওজনে কম দেওয়ার অভিযোগ',
      category: 'corruption',
      district: 'narayanganj',
      name: 'আব্দুল করিম',
      phone: '01911-987654',
      description: 'ডিলার ৩০ কেজির চালের বস্তায় ৪ থেকে ৫ কেজি চাল কম দিচ্ছেন। প্রতিবাদ করায় কার্ড বাতিলের হুমকি দেওয়া হয়েছে। দ্রত ব্যবস্থা গ্রহণ প্রয়োজন।',
      isAnonymous: false,
      fileName: 'weight_slip.jpg',
      status: 'resolved',
      adminNotes: 'তদন্ত শেষে অতিরিক্ত জেলা প্রশাসককে প্রতিবেদন পাঠানো হয়েছে এবং ওজনের অনিয়ম সমাধান হয়েছে।',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
    }
  ];

  const fetchComplaints = async () => {
    setLoading(true);
    let items = [];

    // 1. Try MariaDB API
    try {
      const res = await fetch('/api/complaints.php');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.complaints) && data.complaints.length > 0) {
        items = data.complaints;
      }
    } catch (e) {
      console.warn('Complaints API offline, loading from localStorage:', e);
    }

    // 2. Fallback / Merge with localStorage
    try {
      const local = JSON.parse(localStorage.getItem('jonogon_complaints') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        const idSet = new Set(items.map((i) => i.id));
        local.forEach((loc) => {
          if (!idSet.has(loc.id)) {
            items.push(loc);
          }
        });
      }
    } catch (e) {}

    // If still empty, seed default samples so admin immediately sees how it functions
    if (items.length === 0) {
      items = defaultSampleComplaints;
      try {
        localStorage.setItem('jonogon_complaints', JSON.stringify(items));
      } catch (e) {}
    }

    setComplaints(items);
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Update Status
  const handleUpdateStatus = async (complaintId, newStatus, notes = '') => {
    const updated = complaints.map((c) =>
      c.id === complaintId ? { ...c, status: newStatus, adminNotes: notes || c.adminNotes } : c
    );
    setComplaints(updated);
    try {
      localStorage.setItem('jonogon_complaints', JSON.stringify(updated));
    } catch (e) {}

    // MariaDB sync
    try {
      await fetch('/api/complaints.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          id: complaintId,
          status: newStatus,
          admin_notes: notes
        })
      });
    } catch (e) {}

    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint((prev) => ({ ...prev, status: newStatus, adminNotes: notes }));
    }

    if (typeof triggerSaveToast === 'function') {
      triggerSaveToast(isBn ? 'অভিযোগের স্ট্যাটাস পরিবর্তন করা হয়েছে!' : 'Complaint status updated!');
    }
  };

  // Delete Complaint
  const handleDeleteComplaint = async (complaintId) => {
    const confirm = window.confirm(
      isBn ? 'আপনি কি নিশ্চিত এই অভিযোগটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this complaint?'
    );
    if (!confirm) return;

    const remaining = complaints.filter((c) => c.id !== complaintId);
    setComplaints(remaining);
    try {
      localStorage.setItem('jonogon_complaints', JSON.stringify(remaining));
    } catch (e) {}

    // API delete
    try {
      await fetch(`/api/complaints.php?id=${encodeURIComponent(complaintId)}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint(null);
    }

    if (typeof triggerSaveToast === 'function') {
      triggerSaveToast(isBn ? 'অভিযোগ মুছে ফেলা হয়েছে!' : 'Complaint deleted!');
    }
  };

  // Open Details Modal
  const handleOpenDetails = (c) => {
    setSelectedComplaint(c);
    setStatusEdit(c.status || 'pending');
    setAdminNotesEdit(c.adminNotes || '');
  };

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      // Category filter
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (c.id || '').toLowerCase().includes(q);
        const matchesTitle = (c.title || '').toLowerCase().includes(q);
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesPhone = (c.phone || '').toLowerCase().includes(q);
        const matchesDistrict = (c.district || '').toLowerCase().includes(q);
        const matchesDesc = (c.description || '').toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesName && !matchesPhone && !matchesDistrict && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [complaints, statusFilter, categoryFilter, searchQuery]);

  // KPI Metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'pending' || !c.status).length;
  const reviewingCount = complaints.filter((c) => c.status === 'reviewing').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '0.74rem', fontWeight: 800 }}>
            <CheckCircle2 size={12} />
            <span>{isBn ? 'সমাধানকৃত' : 'Resolved'}</span>
          </span>
        );
      case 'reviewing':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontSize: '0.74rem', fontWeight: 800 }}>
            <Clock size={12} />
            <span>{isBn ? 'তদন্তাধীন' : 'Under Review'}</span>
          </span>
        );
      case 'rejected':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontSize: '0.74rem', fontWeight: 800 }}>
            <X size={12} />
            <span>{isBn ? 'বাতিল' : 'Rejected'}</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 12, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontSize: '0.74rem', fontWeight: 800 }}>
            <AlertCircle size={12} />
            <span>{isBn ? 'অপেক্ষমাণ' : 'Pending'}</span>
          </span>
        );
    }
  };

  return (
    <div className="admin-complaints-manager">
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Inbox size={26} color="var(--primary-red)" />
            <span>{isBn ? 'নাগরিক অভিযোগ বক্স' : 'Citizen Complaints Box'}</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: isLight ? '#64748B' : '#94A3B8' }}>
            {isBn
              ? 'ওয়েবসাইটের অভিযোগ বক্স সেকশনের মাধ্যমে নাগরিকদের দাখিলকৃত সকল গোপন ও উন্মুক্ত অভিযোগ'
              : 'All public & anonymous complaints submitted by citizens through the Complaint Box'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchComplaints}
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

      {/* 2. KPI Cards Bar */}
      <div
        className="complaints-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 20
        }}
      >
        <div className="admin-card" style={{ padding: '16px 18px', borderRadius: 10, margin: 0, backgroundColor: isLight ? '#FFFFFF' : '#161B26' }}>
          <div style={{ fontSize: '0.78rem', color: isLight ? '#64748B' : '#94A3B8', fontWeight: 700 }}>
            {isBn ? 'মোট অভিযোগ' : 'Total Complaints'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-red)', marginTop: 4 }}>
            {totalCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 18px', borderRadius: 10, margin: 0, backgroundColor: isLight ? '#FFFFFF' : '#161B26' }}>
          <div style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 700 }}>
            {isBn ? 'নতুন ও অপেক্ষমাণ' : 'Pending Review'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F59E0B', marginTop: 4 }}>
            {pendingCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 18px', borderRadius: 10, margin: 0, backgroundColor: isLight ? '#FFFFFF' : '#161B26' }}>
          <div style={{ fontSize: '0.78rem', color: '#3B82F6', fontWeight: 700 }}>
            {isBn ? 'তদন্ত / পর্যালোচনাধীন' : 'Under Investigation'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#3B82F6', marginTop: 4 }}>
            {reviewingCount}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 18px', borderRadius: 10, margin: 0, backgroundColor: isLight ? '#FFFFFF' : '#161B26' }}>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
            {isBn ? 'সমাধানকৃত অভিযোগ' : 'Resolved Complaints'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', marginTop: 4 }}>
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* 2.5. Complaint Box Video Link Setting */}
      <div
        className="admin-card"
        style={{
          borderRadius: 10,
          marginBottom: 20,
          padding: '16px 20px',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: isLight ? '#FFFFFF' : '#161B26',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <form onSubmit={handleSaveVideoSettings}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Video size={20} color="var(--primary-red)" />
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>
              {isBn ? 'অভিযোগ বক্স ভিডিও লিংক' : 'Complaint Box Video Link'}
            </h3>
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: isLight ? '#64748B' : '#94A3B8' }}>
            {isBn
              ? 'ওয়েবসাইটের অভিযোগ বক্সে প্রদর্শনের জন্য ইউটিউব ভিডিও লিংক পেস্ট করে সংরক্ষণ করুন।'
              : 'Paste your YouTube video link to display in the Complaint Box.'}
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="url"
                required
                className="admin-input"
                value={complaintVideoUrl}
                onChange={(e) => setComplaintVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... বা https://youtu.be/..."
                style={{ flex: 1, height: 42, borderRadius: 6, padding: '0 12px' }}
              />
              {complaintVideoUrl && (
                <a
                  href={complaintVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '0 12px',
                    height: 42,
                    borderRadius: 6,
                    fontSize: '0.8rem',
                    textDecoration: 'none'
                  }}
                  title={isBn ? 'ভিডিও দেখুন' : 'Open Video'}
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            <button
              type="submit"
              disabled={isSavingVideo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 22px',
                height: 42,
                backgroundColor: 'var(--primary-red)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 6,
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: isSavingVideo ? 'not-allowed' : 'pointer',
                opacity: isSavingVideo ? 0.7 : 1,
                whiteSpace: 'nowrap'
              }}
            >
              {isSavingVideo ? (
                <>
                  <Loader2 size={16} className="spin-anim" />
                  <span>{isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isBn ? 'সংরক্ষণ করুন' : 'Save'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Search and Filters Bar */}
      <div
        className="admin-card complaints-filter-bar"
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
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 260px', position: 'relative' }}>
          <Search size={16} color={isLight ? '#94A3B8' : '#64748B'} style={{ position: 'absolute', left: 12 }} />
          <input
            type="text"
            className="admin-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'ট্র্যাকিং আইডি, নাম, ফোন বা বিষয় দিয়ে খুঁজুন...' : 'Search by tracking ID, name, keyword...'}
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, height: 38, borderRadius: 6 }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', labelBn: 'সবগুলো', labelEn: 'All' },
            { id: 'pending', labelBn: 'অপেক্ষমাণ', labelEn: 'Pending' },
            { id: 'reviewing', labelBn: 'তদন্তাধীন', labelEn: 'Reviewing' },
            { id: 'resolved', labelBn: 'সমাধানকৃত', labelEn: 'Resolved' },
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

        {/* Category Dropdown */}
        <select
          className="admin-input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ height: 38, padding: '0 12px', borderRadius: 6, fontSize: '0.8rem' }}
        >
          <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
          {Object.entries(CATEGORY_NAMES).map(([key, val]) => (
            <option key={key} value={key}>
              {isBn ? val.bn : val.en}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Complaints List Table */}
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
        {filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Inbox size={42} style={{ color: 'var(--primary-red)', marginBottom: 12, opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4 }}>
              {isBn ? 'কোনো অভিযোগ পাওয়া যায়নি' : 'No complaints found'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: isLight ? '#64748B' : '#94A3B8', margin: 0 }}>
              {isBn ? 'ফিল্টার বা সার্চ কিওয়ার্ড পরিবর্তন করে দেখুন।' : 'Try changing your filter or search query.'}
            </p>
          </div>
        ) : (
          <div className="publish-posts-table-wrap complaints-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="admin-responsive-table complaints-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead className="desktop-only-header">
                <tr
                  style={{
                    backgroundColor: isLight ? '#F8FAFC' : '#111520',
                    borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isLight ? '#64748B' : '#94A3B8',
                    fontSize: '0.76rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'ট্র্যাকিং আইডি' : 'Tracking ID'}</th>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'অভিযোগের শিরোনাম ও বিবরণ' : 'Title & Summary'}</th>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'ক্যাটাগরি ও জেলা' : 'Category & District'}</th>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'অভিযোগকারী' : 'Complainant'}</th>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'তারিখ' : 'Date'}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => {
                  const cat = CATEGORY_NAMES[c.category] || { bn: c.category, en: c.category };
                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: isLight ? '1px solid #F1F5F9' : '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="admin-table-row"
                    >
                      {/* ID Badge (Desktop Only) */}
                      <td className="col-desktop-only" style={{ padding: '14px 16px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.06)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
                            fontSize: '0.8rem',
                            color: 'var(--primary-red)'
                          }}
                        >
                          {c.id}
                        </span>
                      </td>

                      {/* Title & Description Excerpt + Mobile Details */}
                      <td className="col-article-main" style={{ padding: '14px 16px', maxWidth: 420 }}>
                        <div style={{ width: '100%' }}>
                          {/* Mobile ID Badge */}
                          <div style={{ display: 'none', marginBottom: 6 }} className="mobile-only-id-pill">
                            <span
                              style={{
                                fontFamily: 'monospace',
                                backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.15)',
                                fontSize: '0.72rem',
                                color: 'var(--primary-red)',
                                fontWeight: 800
                              }}
                            >
                              {c.id}
                            </span>
                          </div>

                          <div
                            style={{
                              fontWeight: 800,
                              color: isLight ? '#0F172A' : '#FFFFFF',
                              lineHeight: 1.35,
                              marginBottom: 4,
                              cursor: 'pointer'
                            }}
                            onClick={() => handleOpenDetails(c)}
                          >
                            {c.title}
                          </div>
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: isLight ? '#64748B' : '#94A3B8',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 340
                            }}
                          >
                            {c.description}
                          </div>
                          {c.fileName && (
                            <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#3B82F6' }}>
                              <FileText size={11} />
                              <span>{c.fileName}</span>
                            </div>
                          )}

                          {/* Mobile metadata chips under headline */}
                          <div className="mobile-meta-under-headline">
                            {renderStatusBadge(c.status)}
                            <span
                              style={{
                                backgroundColor: 'rgba(230,0,18,0.1)',
                                color: 'var(--primary-red)',
                                padding: '2px 7px',
                                borderRadius: 4,
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}
                            >
                              {isBn ? cat.bn : cat.en}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: isLight ? '#64748B' : '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <MapPin size={11} />
                              <span>{c.district || 'ঢাকা'}</span>
                            </span>
                            {c.isAnonymous ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#EF4444', fontSize: '0.72rem', fontWeight: 700 }}>
                                <Lock size={11} />
                                <span>{isBn ? 'গোপন' : 'Anon'}</span>
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: isLight ? '#475569' : '#CBD5E1', fontSize: '0.72rem', fontWeight: 600 }}>
                                <User size={11} />
                                <span>{c.name || 'নাগরিক'}</span>
                              </span>
                            )}
                            <span style={{ fontSize: '0.72rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString('bn-BD', { day: '2-digit', month: 'short' }) : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & District (Desktop Only) */}
                      <td className="col-desktop-only" style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                          {isBn ? cat.bn : cat.en}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: isLight ? '#64748B' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                          <MapPin size={11} />
                          <span style={{ textTransform: 'capitalize' }}>{c.district || 'ঢাকা'}</span>
                        </div>
                      </td>

                      {/* Complainant Info (Desktop Only) */}
                      <td className="col-desktop-only" style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        {c.isAnonymous ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#EF4444',
                              fontSize: '0.74rem',
                              fontWeight: 700
                            }}
                          >
                            <Lock size={11} />
                            <span>{isBn ? 'পরিচয় গোপন' : 'Anonymous'}</span>
                          </span>
                        ) : (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{c.name || 'নাগরিক'}</div>
                            {c.phone && (
                              <div style={{ fontSize: '0.74rem', color: isLight ? '#64748B' : '#94A3B8', marginTop: 2 }}>
                                {c.phone}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status Badge (Desktop Only) */}
                      <td className="col-desktop-only" style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        {renderStatusBadge(c.status)}
                      </td>

                      {/* Date (Desktop Only) */}
                      <td className="col-desktop-only" style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '0.76rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>

                      {/* Actions */}
                      <td className="col-actions" style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {/* Desktop Actions */}
                        <div className="desktop-actions-wrap" style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(c)}
                            title={isBn ? 'বিস্তারিত দেখুন ও স্ট্যাটাস পরিবর্তন' : 'View Full Details'}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                              border: 'none',
                              color: isLight ? '#0F172A' : '#FFFFFF',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.76rem',
                              fontWeight: 700
                            }}
                          >
                            <Eye size={13} color="var(--primary-red)" />
                            <span>{isBn ? 'বিস্তারিত' : 'View'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteComplaint(c.id)}
                            title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 6,
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Mobile 3-Dot Action Menu */}
                        <div className="mobile-actions-wrap admin-3dot-container" style={{ position: 'relative' }}>
                          <button
                            type="button"
                            className={`admin-btn-action admin-3dot-trigger ${activeMenuComplaintId === c.id ? 'active' : ''}`}
                            style={{
                              width: 32,
                              height: 32,
                              padding: 0,
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: activeMenuComplaintId === c.id ? 'var(--bg-subtle)' : 'transparent'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuComplaintId((prev) => (prev === c.id ? null : c.id));
                            }}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {activeMenuComplaintId === c.id && (
                            <div className="admin-3dot-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="admin-menu-item-btn"
                                onClick={() => {
                                  setActiveMenuComplaintId(null);
                                  handleOpenDetails(c);
                                }}
                              >
                                <Eye size={14} color="var(--primary-red)" />
                                <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                              </button>
                              <div style={{ height: 1, backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                              <button
                                type="button"
                                className="admin-menu-item-btn"
                                style={{ color: '#EF4444' }}
                                onClick={() => {
                                  setActiveMenuComplaintId(null);
                                  handleDeleteComplaint(c.id);
                                }}
                              >
                                <Trash2 size={14} color="#EF4444" />
                                <span>{isBn ? 'মুছে ফেলুন' : 'Delete'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. FULL DETAILS & STATUS CHANGER MODAL */}
      {selectedComplaint && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedComplaint(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '92vh',
              backgroundColor: isLight ? '#FFFFFF' : '#1A1D24',
              borderRadius: 14,
              border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 22px',
                borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-red)'
                  }}
                >
                  <Inbox size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    {isBn ? 'অভিযোগের পূর্ণাঙ্গ বিবরণ' : 'Complaint Details'}
                  </h3>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--primary-red)', fontWeight: 800 }}>
                    {selectedComplaint.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isLight ? '#64748B' : '#94A3B8',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Status & Category Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: isLight ? '#64748B' : '#94A3B8', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'বর্তমান স্ট্যাটাস' : 'Current Status'}
                  </span>
                  {renderStatusBadge(selectedComplaint.status)}
                </div>

                <div>
                  <span style={{ fontSize: '0.76rem', color: isLight ? '#64748B' : '#94A3B8', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'বিভাগ ও জেলা' : 'Category & District'}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    {isBn
                      ? (CATEGORY_NAMES[selectedComplaint.category]?.bn || selectedComplaint.category)
                      : (CATEGORY_NAMES[selectedComplaint.category]?.en || selectedComplaint.category)}
                    {' • '}
                    <span style={{ textTransform: 'capitalize' }}>{selectedComplaint.district || 'ঢাকা'}</span>
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.76rem', color: isLight ? '#64748B' : '#94A3B8', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'দাখিলের সময়' : 'Submitted At'}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    {selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleString('bn-BD') : '—'}
                  </span>
                </div>
              </div>

              {/* Complainant Identity Card */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                  border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: isLight ? '#64748B' : '#94A3B8', marginBottom: 6 }}>
                  {isBn ? 'অভিযোগকারীর পরিচিতি' : 'Complainant Information'}
                </div>
                {selectedComplaint.isAnonymous ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', fontWeight: 700, fontSize: '0.86rem' }}>
                    <Lock size={16} />
                    <span>{isBn ? 'এই অভিযোগকারী পরিচয় গোপন রাখার আবেদন করেছেন।' : 'This citizen requested complete anonymity.'}</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}>
                      <User size={15} color="var(--primary-red)" />
                      <span style={{ fontWeight: 800 }}>{selectedComplaint.name || 'নাগরিক'}</span>
                    </div>
                    {selectedComplaint.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.86rem' }}>
                        <Phone size={15} color="#10B981" />
                        <span>{selectedComplaint.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Statement */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: isLight ? '#64748B' : '#94A3B8', display: 'block', marginBottom: 6 }}>
                  {isBn ? 'অভিযোগের শিরোনাম' : 'Complaint Title'}
                </label>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.4, color: isLight ? '#0F172A' : '#FFFFFF', marginBottom: 12 }}>
                  {selectedComplaint.title}
                </div>

                <label style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: isLight ? '#64748B' : '#94A3B8', display: 'block', marginBottom: 6 }}>
                  {isBn ? 'বিস্তারিত বর্ণনা ও তথ্য' : 'Full Statement / Description'}
                </label>
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 8,
                    backgroundColor: isLight ? '#F1F5F9' : 'rgba(0, 0, 0, 0.3)',
                    border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: isLight ? '#334155' : '#E2E8F0',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {selectedComplaint.description}
                </div>

                {selectedComplaint.fileName && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#3B82F6', fontWeight: 700 }}>
                    <FileText size={15} />
                    <span>{isBn ? `সংযুক্ত ফাইল: ${selectedComplaint.fileName}` : `Attached File: ${selectedComplaint.fileName}`}</span>
                  </div>
                )}
              </div>

              {/* Admin Workflow Status Changer & Notes */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(229, 9, 20, 0.05)',
                  border: '1px solid rgba(229, 9, 20, 0.2)'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--primary-red)', marginBottom: 12 }}>
                  {isBn ? 'অ্যাডমিন তদন্ত ও স্ট্যাটাস ব্যবস্থাপনা' : 'Admin Investigation & Status Control'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                      {isBn ? 'স্ট্যাটাস নির্বাচন' : 'Set Status'}
                    </label>
                    <select
                      className="admin-input"
                      value={statusEdit}
                      onChange={(e) => setStatusEdit(e.target.value)}
                      style={{ width: '100%', height: 38, borderRadius: 6, fontSize: '0.84rem' }}
                    >
                      <option value="pending">{isBn ? 'অপেক্ষমাণ (Pending)' : 'Pending'}</option>
                      <option value="reviewing">{isBn ? 'তদন্তাধীন (Under Review)' : 'Under Review'}</option>
                      <option value="resolved">{isBn ? 'সমাধানকৃত (Resolved)' : 'Resolved'}</option>
                      <option value="rejected">{isBn ? 'বাতিল (Rejected)' : 'Rejected'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                      {isBn ? 'তদন্ত নোট / অফিশিয়াল মন্তব্য' : 'Investigation Note / Admin Remarks'}
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={adminNotesEdit}
                      onChange={(e) => setAdminNotesEdit(e.target.value)}
                      placeholder={isBn ? 'তদন্ত বা পদক্ষেপের অগ্রগতি লিখুন...' : 'Enter progress or actions taken...'}
                      style={{ width: '100%', height: 38, borderRadius: 6, fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedComplaint.id, statusEdit, adminNotesEdit)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: 'var(--primary-red)',
                      color: '#FFF',
                      padding: '8px 18px',
                      borderRadius: 6,
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={14} />
                    <span>{isBn ? 'স্ট্যাটাস সংরক্ষণ করুন' : 'Save Status Update'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '12px 22px',
                borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <button
                type="button"
                onClick={() => handleDeleteComplaint(selectedComplaint.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 6,
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#EF4444',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Trash2 size={13} />
                <span>{isBn ? 'অভিযোগ মুছে ফেলুন' : 'Delete Complaint'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 6,
                  backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
