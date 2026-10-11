import React, { useState, useMemo, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Zap,
  Sliders,
  DollarSign,
  Database,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  Download,
  Mic,
  LifeBuoy,
  PhoneCall,
  ExternalLink,
  Shield,
  AlertTriangle,
  Globe,
  Search,
  X,
  Layers,
  ChevronRight,
  MoveRight,
  RotateCcw,
  Check,
  FolderPlus,
  Tag,
  Sun,
  Moon,
  Menu,
  PenTool,
  ShieldCheck,
  FileCheck,
  LogOut,
  Bell,
  MessageSquare,
  Clock,
  TrendingUp,
  MoreVertical,
  CheckSquare,
  Square,
  User,
  Users,
  Camera
} from 'lucide-react';
import { uploadImageToStorage } from '../utils/imageUploader';
import MainMenuManager from './MainMenuManager';
import HomepageSectionManager from './HomepageSectionManager';
import GlobalSettingsManager from './GlobalSettingsManager';
import CreatePostManager from './CreatePostManager';
import EditPostManager from './EditPostManager';
import ApprovePostManager from './ApprovePostManager';
import PublishPostManager from './PublishPostManager';
import SetupAccessManager from './SetupAccessManager';
import MediaGalleryManager from './MediaGalleryManager';
import DatabaseBackupManager from './DatabaseBackupManager';
import UserProfileManager from './UserProfileManager';
import NewsCardMakerManager from './NewsCardMakerManager';
import AdminNotificationDropdown from './AdminNotificationDropdown';
import AdminLoginScreen from './AdminLoginScreen';
import AdsManager from './AdsManager';
import ConfirmModal from '../components/Modals/ConfirmModal';
import { getPodcastThumbnail } from '../components/News/PodcastSection';

// Clean bracketed numbers from emergency service name e.g. "জাতীয় জরুরি সেবা (৯৯৯)" -> "জাতীয় জরুরি সেবা"
const cleanServiceName = (name) => {
  if (!name) return '';
  return String(name).replace(/\s*[\(\[\{][০-৯0-9\s-]+[\)\]\}]\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
};

// Count words separated by whitespace
const countWords = (text) => {
  if (!text) return 0;
  return String(text).trim().split(/\s+/).filter(Boolean).length;
};

export default function AdminDashboard() {
  const {
    adminLanguage,
    toggleAdminLanguage,
    adminTheme,
    toggleAdminTheme,
    language,
    theme,
    setIsAdminOpen,
    closeAdmin,
    goToHome,
    settings,
    updateSiteSettings,
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    categories,
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
    podcasts,
    addPodcast,
    updatePodcast,
    deletePodcast,
    refreshPodcasts,
    podcastSubjects,
    addPodcastSubject,
    emergencyServices,
    addEmergencyService,
    updateEmergencyService,
    deleteEmergencyService,
    showError,
    showAlert
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';
  const isLight = (adminTheme || theme) === 'light';

  // 1. Admin Authentication State (Login Screen)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return (
      localStorage.getItem('jonogon_admin_logged_in') === 'true' ||
      sessionStorage.getItem('jonogon_admin_logged_in') === 'true'
    );
  });

  // Current Logged-in Staff/Member Profile
  const currentMember = useMemo(() => {
    try {
      const stored = localStorage.getItem('jonogon_current_member') || sessionStorage.getItem('jonogon_current_member');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, [isAuthenticated]);

  // Tab permission helper based on Supabase role & allowed_tabs
  const isTabAllowed = (tabKey) => {
    if (!currentMember || !currentMember.allowed_tabs || currentMember.role === 'Super Admin') return true;
    return Array.isArray(currentMember.allowed_tabs) && currentMember.allowed_tabs.includes(tabKey);
  };

  // Automatically switch to first allowed tab if current active tab is restricted
  useEffect(() => {
    if (currentMember && currentMember.allowed_tabs && currentMember.role !== 'Super Admin') {
      if (Array.isArray(currentMember.allowed_tabs) && !currentMember.allowed_tabs.includes(activeTab)) {
        const firstAllowed = currentMember.allowed_tabs[0] || 'overview';
        setActiveTab(firstAllowed);
      }
    }
  }, [currentMember]);

  // 2. Collapsible Sidebar State (Open/Close with Icon-Only Mode)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 3. Top Search State
  const [topSearchQuery, setTopSearchQuery] = useState('');

  // 4. Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    subMessage: undefined,
    confirmText: '',
    type: 'danger',
    onConfirm: () => { }
  });

  const openConfirm = ({ title, message, subMessage, confirmText, type = 'danger', onConfirm }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      subMessage,
      confirmText,
      type,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (typeof onConfirm === 'function') onConfirm();
      }
    });
  };

  // Active Tab State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'create-post' | 'edit-post' | 'approve-post' | 'publish-post' | 'gallery' | 'main-menu' | 'homepage-sections' | 'podcasts' | 'emergency' | 'settings' | 'ads' | 'database' | 'setup-access'
  const [dashboardEditingPostId, setDashboardEditingPostId] = useState(null);
  const [dashboardEditingPost, setDashboardEditingPost] = useState(null);
  const [saveToast, setSaveToast] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Counter for pending approval posts (Strictly pending_approval)
  const pendingApprovalCount = useMemo(() => {
    return (articles || []).filter(
      (a) => a.status === 'pending_approval'
    ).length;
  }, [articles]);

  // Counter for editable posts & drafts
  const editPostsCount = useMemo(() => {
    return (articles || []).filter(
      (a) => a.status === 'draft' || a.status === 'review' || a.status === 'revision_needed' || a.status === 'submitted'
    ).length;
  }, [articles]);

  // Real dynamic Metric KPI calculations
  const publishedCount = useMemo(() => {
    return (articles || []).filter(
      (a) => a.status === 'published' || (!a.status && a.id)
    ).length;
  }, [articles]);

  const totalReaderViews = useMemo(() => {
    return (articles || []).reduce(
      (acc, curr) => acc + (Number(curr.views) || 0),
      0
    );
  }, [articles]);

  const activeCategoriesCount = useMemo(() => {
    return (categories || []).length;
  }, [categories]);

  const [dbMediaCount, setDbMediaCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchRealMediaCount = async () => {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${origin}/api/media.php`, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && Array.isArray(json?.data) && isMounted) {
            setDbMediaCount(json.data.length);
          }
        }
      } catch (e) {}
    };
    fetchRealMediaCount();
    return () => { isMounted = false; };
  }, []);

  const totalMediaFilesCount = useMemo(() => {
    if (dbMediaCount > 0) return dbMediaCount;
    const urls = new Set();
    (articles || []).forEach((a) => {
      if (a.featuredImage) urls.add(a.featuredImage);
      if (a.imageUrl) urls.add(a.imageUrl);
      if (Array.isArray(a.galleryImages)) a.galleryImages.forEach((img) => urls.add(img));
      if (Array.isArray(a.blocks)) {
        a.blocks.forEach((b) => {
          if (b.type === 'image' && b.url) urls.add(b.url);
        });
      }
    });
    return urls.size;
  }, [articles, dbMediaCount]);

  const totalInteractionsCount = useMemo(() => {
    let complaintsCount = 0;
    try {
      const c = JSON.parse(localStorage.getItem('jonogon_complaints') || '[]');
      if (Array.isArray(c)) complaintsCount = c.length;
    } catch (e) {}
    const shares = (articles || []).reduce((acc, a) => acc + (Number(a.sharesCount) || 0), 0);
    return complaintsCount + shares;
  }, [articles]);

  const sitePerformancePercent = useMemo(() => {
    return articles && articles.length > 0 ? 100 : 98;
  }, [articles]);

  // Podcast Form State
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [isCreatingPodcast, setIsCreatingPodcast] = useState(false);
  const [isCreatingNewSubject, setIsCreatingNewSubject] = useState(false);
  const [newSubjectForm, setNewSubjectForm] = useState({ nameBn: '', nameEn: '' });
  const [podcastForm, setPodcastForm] = useState({
    titleBn: '',
    titleEn: '',
    subjectId: 'politics',
    subjectBn: 'রাজনীতি ও রাষ্ট্র',
    subjectEn: 'Politics & Governance',
    youtubeUrl: '',
    youtubeId: '',
    hostBn: 'মোঃ বিপ্লব হোসেন',
    hostEn: 'Md. Biplob Hossain',
    guestBn: '',
    guestEn: '',
    duration: '২৫:০০',
    thumbnail: ''
  });

  // Emergency Services Form State
  const [editingService, setEditingService] = useState(null);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    nameBn: '',
    nameEn: '',
    number: '',
    categoryBn: 'জরুরি সেবা',
    categoryEn: 'Emergency',
    descriptionBn: '',
    descriptionEn: '',
    websiteUrl: '',
    icon: 'phone'
  });

  // Global Settings Form State
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  // Supabase Configuration Form State
  const [sbUrl, setSbUrl] = useState(localStorage.getItem('jonogon_supabase_url') || '');
  const [sbKey, setSbKey] = useState(localStorage.getItem('jonogon_supabase_key') || '');
  const [sbConnected, setSbConnected] = useState(false);

  // Trigger Save Notification
  const triggerSaveToast = (msg = 'সফলভাবে সংরক্ষিত হয়েছে!') => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('jonogon_admin_logged_in');
    localStorage.removeItem('jonogon_admin_user');
    sessionStorage.removeItem('jonogon_admin_logged_in');
    setIsAuthenticated(false);
  };

  // Auto-refresh podcasts from MariaDB when opening podcasts tab
  useEffect(() => {
    if (activeTab === 'podcasts' && typeof refreshPodcasts === 'function') {
      refreshPodcasts();
    }
  }, [activeTab]);

  // Handle YouTube URL change with auto-detected video thumbnail
  const handlePodcastYoutubeUrlChange = (val) => {
    let ytId = '';
    const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match) {
      ytId = match[1];
    }
    const newThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : podcastForm.thumbnail;
    setPodcastForm((prev) => ({
      ...prev,
      youtubeUrl: val,
      youtubeId: ytId || prev.youtubeId,
      thumbnail: newThumb
    }));
  };

  // Handle Category selection
  const handlePodcastSubjectChange = (e) => {
    const val = e.target.value;
    if (val === '__new__') {
      setIsCreatingNewSubject(true);
      return;
    }
    setIsCreatingNewSubject(false);
    const found = (podcastSubjects || []).find((s) => s.id === val);
    if (found) {
      setPodcastForm((prev) => ({
        ...prev,
        subjectId: found.id,
        subjectBn: found.nameBn,
        subjectEn: found.nameEn || found.nameBn
      }));
    }
  };

  // Submit new category
  const handleAddNewSubjectSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newSubjectForm.nameBn.trim()) return;
    if (typeof addPodcastSubject === 'function') {
      const created = addPodcastSubject(newSubjectForm);
      setPodcastForm((prev) => ({
        ...prev,
        subjectId: created.id,
        subjectBn: created.nameBn,
        subjectEn: created.nameEn || created.nameBn
      }));
      triggerSaveToast(isBn ? 'নতুন ক্যাটাগরি তৈরি হয়েছে!' : 'New category created!');
    }
    setNewSubjectForm({ nameBn: '', nameEn: '' });
    setIsCreatingNewSubject(false);
  };

  // Open Create Podcast Modal Popup
  const handleOpenCreatePodcast = () => {
    setEditingPodcast(null);
    setIsCreatingNewSubject(false);
    setNewSubjectForm({ nameBn: '', nameEn: '' });
    setPodcastForm({
      titleBn: '',
      titleEn: '',
      subjectId: 'politics',
      subjectBn: 'রাজনীতি ও রাষ্ট্র',
      subjectEn: 'Politics & Governance',
      youtubeUrl: '',
      youtubeId: '',
      hostBn: 'মোঃ বিপ্লব হোসেন',
      hostEn: 'Md. Biplob Hossain',
      guestBn: '',
      guestEn: '',
      duration: '২৫:০০',
      thumbnail: ''
    });
    setIsCreatingPodcast(true);
  };

  // Submit Podcast Episode
  const handleSavePodcast = async (e) => {
    e.preventDefault();
    let finalPayload = { ...podcastForm };
    if (!finalPayload.thumbnail && finalPayload.youtubeId) {
      finalPayload.thumbnail = `https://img.youtube.com/vi/${finalPayload.youtubeId}/hqdefault.jpg`;
    }
    if (editingPodcast) {
      await updatePodcast(editingPodcast.id, finalPayload);
      triggerSaveToast(isBn ? 'পডকাস্ট পর্ব আপডেট হয়েছে!' : 'Podcast episode updated!');
    } else {
      await addPodcast(finalPayload);
      triggerSaveToast(isBn ? 'নতুন পডকাস্ট পর্ব যুক্ত হয়েছে!' : 'New podcast episode added!');
    }
    setEditingPodcast(null);
    setIsCreatingPodcast(false);
  };

  const handleOpenEditPodcast = (pod) => {
    setEditingPodcast(pod);
    setIsCreatingNewSubject(false);
    setNewSubjectForm({ nameBn: '', nameEn: '' });
    let ytId = pod.youtubeId || pod.youtube_id || '';
    const ytUrl = pod.youtubeUrl || pod.youtube_url || (ytId ? `https://www.youtube.com/watch?v=` + ytId : '');
    if (!ytId && ytUrl) {
      const match = ytUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) ytId = match[1];
    }
    let thumb = pod.thumbnail || '';
    if (ytId && (!thumb || thumb.includes('unsplash.com'))) {
      thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    setPodcastForm({
      titleBn: pod.titleBn || '',
      titleEn: pod.titleEn || '',
      subjectId: pod.subjectId || 'politics',
      subjectBn: pod.subjectBn || 'রাজনীতি ও রাষ্ট্র',
      subjectEn: pod.subjectEn || 'Politics & Governance',
      youtubeUrl: ytUrl,
      youtubeId: ytId,
      hostBn: pod.hostBn || 'মোঃ বিপ্লব হোসেন',
      hostEn: pod.hostEn || 'Md. Biplob Hossain',
      guestBn: pod.guestBn || '',
      guestEn: pod.guestEn || '',
      duration: pod.duration || '২৫:০০',
      thumbnail: thumb
    });
    setIsCreatingPodcast(true);
  };

  // Handle Emergency Service Description (Bangla) with strict 10-word limit
  const handleServiceDescriptionBnChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length > 10) {
      const truncated = words.slice(0, 10).join(' ');
      setServiceForm((prev) => ({
        ...prev,
        descriptionBn: truncated
      }));
      return;
    }
    setServiceForm((prev) => ({
      ...prev,
      descriptionBn: text
    }));
  };

  // Handle Emergency Service Description (English) with strict 10-word limit
  const handleServiceDescriptionEnChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length > 10) {
      const truncated = words.slice(0, 10).join(' ');
      setServiceForm((prev) => ({
        ...prev,
        descriptionEn: truncated
      }));
      return;
    }
    setServiceForm((prev) => ({
      ...prev,
      descriptionEn: text
    }));
  };

  // Submit Emergency Service
  const handleSaveService = (e) => {
    e.preventDefault();
    const descBnWords = countWords(serviceForm.descriptionBn);
    const descEnWords = countWords(serviceForm.descriptionEn);
    if (descBnWords > 10 || descEnWords > 10) {
      alert(isBn ? 'বর্ণনা সর্বোচ্চ ১০ শব্দের মধ্যে হতে হবে!' : 'Description must not exceed 10 words!');
      return;
    }
    const cleanedNameBn = cleanServiceName(serviceForm.nameBn);
    const cleanedNameEn = cleanServiceName(serviceForm.nameEn || serviceForm.nameBn);
    const payload = {
      ...serviceForm,
      nameBn: cleanedNameBn,
      nameEn: cleanedNameEn || cleanedNameBn,
      descriptionEn: serviceForm.descriptionEn || serviceForm.descriptionBn
    };
    if (editingService) {
      updateEmergencyService(editingService.id, payload);
      triggerSaveToast(isBn ? 'জরুরি সেবা তথ্য সফলভাবে আপডেট হয়েছে!' : 'Emergency service updated successfully!');
    } else {
      addEmergencyService(payload);
      triggerSaveToast(isBn ? 'নতুন জরুরি সেবা সফলভাবে যোগ হয়েছে!' : 'Emergency service added successfully!');
    }
    setEditingService(null);
    setIsCreatingService(false);
  };

  const handleOpenEditService = (srv) => {
    setEditingService(srv);
    setServiceForm({
      nameBn: cleanServiceName(srv.nameBn || ''),
      nameEn: cleanServiceName(srv.nameEn || ''),
      number: srv.number || '',
      categoryBn: srv.categoryBn || 'জরুরি সেবা',
      categoryEn: srv.categoryEn || 'Emergency',
      descriptionBn: srv.descriptionBn || '',
      descriptionEn: srv.descriptionEn || '',
      websiteUrl: srv.websiteUrl || '',
      icon: srv.icon || 'phone'
    });
    setIsCreatingService(true);
  };

  // Save Global Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSiteSettings(settingsForm);
    triggerSaveToast('গ্লোবাল সেটিংস ও ব্র্যান্ডিং সফলভাবে সেভ হয়েছে!');
  };

  // Save Supabase Configuration
  const handleConfigureSupabase = (e) => {
    e.preventDefault();
    const success = configureSupabase(sbUrl, sbKey);
    if (success) {
      setSbConnected(true);
      triggerSaveToast('Supabase ডাটাবেজ সফলভাবে কানেক্ট হয়েছে!');
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      settings,
      categories,
      breakingNews,
      articles,
      podcasts,
      emergencyServices
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jonogon_news_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerSaveToast('ব্যাকআপ ফাইল ডাউনলোড সফল হয়েছে!');
  };

  // --- 1. RENDER LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <AdminLoginScreen
        isBn={isBn}
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <div
      className="admin-dashboard-wrap"
      data-theme={adminTheme || theme}
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: isLight ? '#F8FAFC' : '#0B0F19',
        color: isLight ? '#0F172A' : '#F1F5F9'
      }}
    >
      {/* Toast Notification */}
      {saveToast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            backgroundColor: '#16A34A',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 700,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle size={20} />
          <span>{saveToast}</span>
        </div>
      )}

      {/* --- SIDEBAR (Collapsible, Scrollable Middle Nav, Fixed Top & Bottom Profile) --- */}
      <aside
        className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isLight ? 'light' : 'dark'}`}
        style={{
          width: isSidebarCollapsed ? 74 : 260,
          minWidth: isSidebarCollapsed ? 74 : 260,
          height: '100vh',
          backgroundColor: isLight ? '#FFFFFF' : '#11141E',
          borderRight: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'width 0.25s ease, min-width 0.25s ease'
        }}
      >
        {/* 1. Fixed Top: Logo & Slogan */}
        <div
          style={{
            padding: isSidebarCollapsed ? '16px 8px' : '18px 18px',
            borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            gap: 12,
            flexShrink: 0
          }}
        >
          <img
            src="/logo.svg"
            alt="Logo"
            style={{ height: 34, width: 34, objectFit: 'contain' }}
            onError={(e) => { e.target.src = settings.logoUrl || '/logo.svg'; }}
          />

          {!isSidebarCollapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: isLight ? '#0F172A' : '#FFFFFF', letterSpacing: -0.2 }}>
                {isBn ? 'জনগণ' : 'JONOGON'}
              </div>
              <div style={{ fontSize: '0.68rem', color: isLight ? '#64748B' : '#9CA3AF' }}>
                {isBn ? (settings.sloganBn || 'জনতার কণ্ঠস্বর') : (settings.sloganEn || 'Voice of the People')}
              </div>
            </div>
          )}
        </div>

        {/* 2. Scrollable Middle Navigation Menu (between Top Logo & Bottom Profile) */}
        <nav
          className="admin-nav"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isSidebarCollapsed ? '12px 6px' : '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          {/* --- GROUP 1: CORE & EDITORIAL WORKFLOW --- */}
          {!isSidebarCollapsed && (
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: isLight ? '#94A3B8' : '#64748B',
                padding: '10px 14px 4px 14px'
              }}
            >
              {isBn ? 'মূল ও সম্পাদকীয়' : 'Editorial Workflow'}
            </div>
          )}

          {/* 1. Dashboard & Analytics */}
          {isTabAllowed('overview') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              title={isBn ? 'ড্যাশবোর্ড ও অ্যানালিটিক্স' : 'Dashboard & Analytics'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <LayoutDashboard size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'ড্যাশবোর্ড ও অ্যানালিটিক্স' : 'Dashboard'}</span>}
            </button>
          )}

          {/* 2. Create News Post */}
          {isTabAllowed('create-post') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'create-post' ? 'active' : ''}`}
              onClick={() => {
                setDashboardEditingPostId(null);
                setDashboardEditingPost(null);
                setActiveTab('create-post');
              }}
              title={isBn ? 'নতুন সংবাদ তৈরি করুন' : 'Write News Article'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <PenTool size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'নতুন সংবাদ তৈরি' : 'Write Article'}</span>}
            </button>
          )}

          {/* 3. Drafts & Editorial */}
          {isTabAllowed('edit-post') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'edit-post' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit-post')}
              title={isBn ? 'খসড়া ও সম্পাদনা' : 'Drafts & Editorial'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px',
                position: 'relative'
              }}
            >
              <Edit size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'খসড়া ও সম্পাদনা' : 'Drafts & Edit'}</span>}
              {editPostsCount > 0 && (
                <span
                  style={{
                    marginLeft: isSidebarCollapsed ? 0 : 'auto',
                    position: isSidebarCollapsed ? 'absolute' : 'static',
                    top: isSidebarCollapsed ? 4 : 'auto',
                    right: isSidebarCollapsed ? 6 : 'auto',
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 10
                  }}
                >
                  {editPostsCount}
                </span>
              )}
            </button>
          )}

          {/* 4. Approve News */}
          {isTabAllowed('approve-post') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'approve-post' ? 'active' : ''}`}
              onClick={() => setActiveTab('approve-post')}
              title={isBn ? 'সংবাদ অনুমোদন ও প্রকাশনা' : 'Approve & Publish'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px',
                position: 'relative'
              }}
            >
              <ShieldCheck size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'সংবাদ অনুমোদন' : 'Approve News'}</span>}
              {pendingApprovalCount > 0 && (
                <span
                  style={{
                    marginLeft: isSidebarCollapsed ? 0 : 'auto',
                    position: isSidebarCollapsed ? 'absolute' : 'static',
                    top: isSidebarCollapsed ? 4 : 'auto',
                    right: isSidebarCollapsed ? 6 : 'auto',
                    backgroundColor: '#EAB308',
                    color: '#000000',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 10
                  }}
                >
                  {pendingApprovalCount}
                </span>
              )}
            </button>
          )}

          {/* 5. Published News Archive */}
          {isTabAllowed('publish-post') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'publish-post' ? 'active' : ''}`}
              onClick={() => setActiveTab('publish-post')}
              title={isBn ? 'সকল প্রকাশিত সংবাদ ও আর্কাইভ' : 'All Published News'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <Globe size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'সকল প্রকাশিত সংবাদ' : 'Published News'}</span>}
            </button>
          )}

          {/* --- GROUP 2: MEDIA & LAYOUT --- */}
          {!isSidebarCollapsed && (
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: isLight ? '#94A3B8' : '#64748B',
                padding: '14px 14px 4px 14px'
              }}
            >
              {isBn ? 'মিডিয়া ও বিন্যাস' : 'Media & Layout'}
            </div>
          )}

          {/* 6. Media Gallery */}
          {isTabAllowed('gallery') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
              title={isBn ? 'মিডিয়া ও ফটো গ্যালারি' : 'Media Gallery'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <ImageIcon size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'মিডিয়া ও ফটো গ্যালারি' : 'Media Gallery'}</span>}
            </button>
          )}

          {/* 6b. News Card Maker (Dedicated Tab) */}
          {isTabAllowed('news-card-maker') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'news-card-maker' || activeTab === 'card-maker' ? 'active' : ''}`}
              onClick={() => setActiveTab('news-card-maker')}
              title={isBn ? 'সোশ্যাল কার্ড জেনারেটর' : 'News Card Maker'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <Camera size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'নিউজ কার্ড মেকার' : 'News Card Maker'}</span>}
            </button>
          )}

          {/* 7. Podcasts & Multimedia */}
          {isTabAllowed('podcasts') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'podcasts' ? 'active' : ''}`}
              onClick={() => setActiveTab('podcasts')}
              title={isBn ? 'পডকাস্ট ও ভিডিও অনুষ্ঠান' : 'Podcasts & Shows'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <Mic size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'পডকাস্ট ও ভিডিও' : 'Podcasts'}</span>}
            </button>
          )}

          {/* 8. Main Menu & Categories */}
          {isTabAllowed('main-menu') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'main-menu' || activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('main-menu')}
              title={isBn ? 'মেনু ও ক্যাটাগরি' : 'Menu & Categories'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <Menu size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'মেনু ও ক্যাটাগরি' : 'Menu & Categories'}</span>}
            </button>
          )}

          {/* 9. Homepage Layout Blocks */}
          {isTabAllowed('homepage-sections') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'homepage-sections' ? 'active' : ''}`}
              onClick={() => setActiveTab('homepage-sections')}
              title={isBn ? 'হোমপেজ লেআউট ও সেকশন' : 'Homepage Layout'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <Layers size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'হোমপেজ লেআউট' : 'Homepage Layout'}</span>}
            </button>
          )}

          {/* --- GROUP 3: SERVICES & ADS --- */}
          {!isSidebarCollapsed && (
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: isLight ? '#94A3B8' : '#64748B',
                padding: '14px 14px 4px 14px'
              }}
            >
              {isBn ? 'সেবা ও বিজ্ঞাপন' : 'Services & Ads'}
            </div>
          )}

          {/* 10. Emergency Helplines */}
          {isTabAllowed('emergency') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'emergency' ? 'active' : ''}`}
              onClick={() => setActiveTab('emergency')}
              title={isBn ? 'জরুরি সেবা হেল্পলাইন' : 'Emergency Helplines'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <LifeBuoy size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'জরুরি সেবা হেল্পলাইন' : 'Emergency'}</span>}
            </button>
          )}

          {/* 11. Google AdSense & Ads */}
          {isTabAllowed('ads') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'ads' ? 'active' : ''}`}
              onClick={() => setActiveTab('ads')}
              title={isBn ? 'বিজ্ঞাপন ও মনিটাইজেশন' : 'AdSense & Ads'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <DollarSign size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'বিজ্ঞাপন ও মনিটাইজেশন' : 'AdSense & Ads'}</span>}
            </button>
          )}

          {/* --- GROUP 4: SYSTEM & ACCESS CONTROL --- */}
          {!isSidebarCollapsed && (
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: isLight ? '#94A3B8' : '#64748B',
                padding: '14px 14px 4px 14px'
              }}
            >
              {isBn ? 'সিস্টেম ও সিকিউরিটি' : 'System & Security'}
            </div>
          )}

          {/* 12. Setup Access & Permissions */}
          {isTabAllowed('setup-access') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'setup-access' ? 'active' : ''}`}
              onClick={() => setActiveTab('setup-access')}
              title={isBn ? 'টিম ও এক্সেস কন্ট্রোল' : 'Setup Access & Roles'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <Users size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'টিম ও এক্সেস কন্ট্রোল' : 'Setup Access'}</span>}
            </button>
          )}

          {/* 13. Site Settings & SEO */}
          {isTabAllowed('settings') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              title={isBn ? 'সাইট ও ব্র্যান্ডিং সেটিংস' : 'Site & SEO Settings'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <Sliders size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'সাইট ও ব্র্যান্ডিং সেটিংস' : 'Site Settings'}</span>}
            </button>
          )}

          {/* 14. Database & Supabase Cloud Backup */}
          {isTabAllowed('database') && (
            <button
              type="button"
              className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
              title={isBn ? 'ডাটাবেজ ও ক্লাউড ব্যাকআপ' : 'Database & Backup'}
              style={{
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
              }}
            >
              <Database size={18} />
              {!isSidebarCollapsed && <span>{isBn ? 'ডাটাবেজ ও ক্লাউড ব্যাকআপ' : 'Database & Cloud'}</span>}
            </button>
          )}

          {/* 15. My Profile & Password Settings (Requirement 2) */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'my-profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-profile')}
            title={isBn ? 'প্রোফাইল ও পাসওয়ার্ড পরিবর্তন' : 'My Profile & Security'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <User size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'প্রোফাইল ও পাসওয়ার্ড' : 'My Profile'}</span>}
          </button>
        </nav>

        {/* 3. Fixed Bottom: Admin Profile & Logout (Matching Screenshot) */}
        <div
          style={{
            padding: isSidebarCollapsed ? '12px 6px' : '14px 16px',
            borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: isLight ? '#F8FAFC' : '#0E1017',
            flexShrink: 0
          }}
        >
          {/* User Profile Card - Clickable to open Profile tab */}
          <div
            onClick={() => setActiveTab('my-profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              gap: 10,
              marginBottom: isSidebarCollapsed ? 10 : 12,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 8,
              transition: 'background-color 0.15s ease'
            }}
            title={isBn ? 'প্রোফাইল সেটিংস ও পাসওয়ার্ড পরিবর্তন' : 'Profile Settings'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src={
                  currentMember?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
                }
                alt="Profile Avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--primary-red)'
                }}
              />
              {!isSidebarCollapsed && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: isLight ? '#0F172A' : '#FFFFFF', lineHeight: 1.2 }}>
                    {currentMember?.name || (isBn ? 'মোঃ বিপ্লব হোসেন' : 'Md. Biplob Hossain')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isLight ? '#64748B' : '#9CA3AF' }}>
                    {currentMember?.designation || (isBn ? 'প্রধান সম্পাদক ও প্রকাশক' : 'Super Admin & Editor')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: isLight ? '#FEE2E2' : 'rgba(229, 9, 20, 0.1)',
              border: isLight ? '1px solid #FCA5A5' : '1px solid rgba(229, 9, 20, 0.35)',
              color: '#DC2626',
              padding: isSidebarCollapsed ? '8px 0' : '8px 12px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={isBn ? 'লগ আউট' : 'Log Out'}
          >
            <LogOut size={15} />
            {!isSidebarCollapsed && <span>{isBn ? 'লগ আউট' : 'Log Out'}</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* --- 6. TOP HEADER BAR (ONLY: Search, Live Site, BN/EN, Dark/Light, Notification) --- */}
        <header
          style={{
            height: 64,
            padding: '0 24px',
            backgroundColor: isLight ? '#FFFFFF' : '#11141E',
            borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          {/* Left: Hamburger Toggle & Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, maxWidth: 540 }}>
            {/* Hamburger Button (Opens / Closes Sidebar) */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
                border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
                color: isLight ? '#0F172A' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={isSidebarCollapsed ? 'সাইডবার খুলুন' : 'সাইডবার সংকুচিত করুন'}
            >
              <Menu size={19} />
            </button>

            {/* Search Bar with Red Button */}
            <div style={{ display: 'flex', flex: 1, height: 38 }}>
              <input
                type="text"
                className="admin-input"
                style={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: isLight ? '#F8FAFC' : '#0B0F19',
                  border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px 0 0 6px',
                  paddingLeft: 14,
                  fontSize: '0.85rem',
                  color: isLight ? '#0F172A' : '#FFFFFF'
                }}
                placeholder={isBn ? 'খবর, ক্যাটাগরি বা কিছু খুঁজুন...' : 'Search news, categories...'}
                value={topSearchQuery}
                onChange={(e) => setTopSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && topSearchQuery.trim()) {
                    setActiveTab('edit-post');
                  }
                }}
              />
              <button
                type="button"
                style={{
                  width: 44,
                  height: '100%',
                  backgroundColor: '#E50914',
                  border: 'none',
                  borderRadius: '0 6px 6px 0',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (topSearchQuery.trim()) setActiveTab('edit-post');
                }}
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          {/* Right: Live Site, BN/EN, Dark/Light, Notification */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View Live News Site Link */}
            <button
              type="button"
              onClick={() => closeAdmin()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 6,
                backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
                border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
                color: isLight ? '#0F172A' : '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>{isBn ? 'নিউজ সাইট দেখুন' : 'Live Site'}</span>
              <ExternalLink size={13} color="#E50914" />
            </button>

            {/* Language BN / EN Button */}
            <button
              type="button"
              onClick={toggleAdminLanguage}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
                border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
                color: isLight ? '#0F172A' : '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span style={{ color: '#E50914' }}>{isBn ? 'BN' : 'EN'}</span>
            </button>

            {/* Dark / Light Mode Switcher */}
            <button
              type="button"
              onClick={toggleAdminTheme}
              style={{
                width: 38,
                height: 38,
                borderRadius: 6,
                backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
                border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
                color: isLight ? '#0F172A' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={isLight ? 'Dark Mode' : 'Light Mode'}
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} color="#FFB800" />}
            </button>

            {/* Notification Bell with Facebook-style Popup (Requirement 2) */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                style={{
                  position: 'relative',
                  width: 38,
                  height: 38,
                  borderRadius: 6,
                  backgroundColor: isNotificationOpen
                    ? 'rgba(229, 9, 20, 0.15)'
                    : isLight
                      ? '#F1F5F9'
                      : 'rgba(255, 255, 255, 0.05)',
                  border: isNotificationOpen
                    ? '1px solid var(--primary-red)'
                    : isLight
                      ? '1px solid #E2E8F0'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                  color: isNotificationOpen ? 'var(--primary-red)' : isLight ? '#0F172A' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={isBn ? `${pendingApprovalCount || 3}টি নতুন নোটিফিকেশন` : 'Notifications'}
              >
                <Bell size={17} />
                {pendingApprovalCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 15,
                      height: 15,
                      borderRadius: '50%',
                      backgroundColor: '#E50914',
                      color: '#FFFFFF',
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {pendingApprovalCount}
                  </span>
                )}
              </button>

              {/* Facebook-style Notification Popup */}
              <AdminNotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                articles={articles}
                pendingCount={pendingApprovalCount}
                onNavigateTab={(tab) => setActiveTab(tab)}
                isBn={isBn}
              />
            </div>
          </div>
        </header>

        {/* --- TAB CONTENT BODY --- */}
        <div style={{ padding: '24px 28px', flex: 1 }}>
          {/* TAB 1: OVERVIEW (Matching Screenshot UI) */}
          {activeTab === 'overview' && (
            <div className="admin-overview-container">
              {/* 1. HERO WELCOME BANNER (Matching Screenshot) */}
              <div
                className="admin-hero-banner"
                style={{
                  background: isLight
                    ? 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 45%, #FFE4E6 100%)'
                    : 'linear-gradient(135deg, #240A0E 0%, #161922 45%, #2B0B10 100%)',
                  border: isLight ? '1px solid #FECDD3' : '1px solid rgba(230, 0, 18, 0.25)',
                  borderRadius: 12,
                  padding: '24px 28px',
                  marginBottom: 22,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  boxShadow: isLight ? '0 4px 20px rgba(225, 29, 72, 0.08)' : '0 8px 30px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 640 }}>
                  <h1
                    style={{
                      fontFamily: 'var(--font-headline, sans-serif)',
                      fontSize: '1.75rem',
                      fontWeight: 900,
                      color: isLight ? '#881337' : '#FFFFFF',
                      marginBottom: 6,
                      letterSpacing: -0.3
                    }}
                  >
                    {isBn ? 'স্বাগতম, মোঃ বিপ্লব হোসেন!' : 'Welcome, Md. Biplob Hossain!'}
                  </h1>
                  <p style={{ color: isLight ? '#475569' : '#D1D5DB', fontSize: '0.88rem', lineHeight: 1.45 }}>
                    {isBn
                      ? `আজ ${new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} — আপনার নিউজ পোর্টালের সার্বিক কার্যক্রমের সারসংক্ষেপ এখানে দেখুন।`
                      : `Today ${new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} — Summary of your news portal operations.`}
                  </p>
                </div>

                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.45)',
                    border: isLight ? '1px solid #FDA4AF' : '1px solid rgba(230, 0, 18, 0.3)',
                    backdropFilter: 'blur(6px)',
                    padding: '12px 22px',
                    borderRadius: 10,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-headline, sans-serif)', color: isLight ? '#9F1239' : '#FFFFFF', fontSize: '1.05rem', fontWeight: 800 }}>
                    “সঠিক সংবাদ, সচেতন সমাজ”
                  </div>
                </div>
              </div>

              {/* 2. 8 METRIC KPI CARDS GRID (Live Real Database Data) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                  marginBottom: 24
                }}
              >
                {/* Card 1: মোট প্রকাশিত সংবাদ */}
                <div className="admin-stat-card-modern">
                  <div className="stat-card-left">
                    <div className="stat-icon-wrap red-bg">
                      <FileText size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="stat-card-title">{isBn ? 'মোট প্রকাশিত সংবাদ' : 'Published News'}</div>
                      <div className="stat-card-number">
                        {publishedCount}
                      </div>
                      <div className="stat-card-trend green">
                        {isBn ? `সরাসরি লাইভ ডাটাবেজ` : `Live in database`}
                      </div>
                    </div>
                  </div>
                  <div className="stat-spark-bar red-spark">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                </div>

                {/* Card 2: মোট পাঠক ভিউ */}
                <div className="admin-stat-card-modern">
                  <div className="stat-card-left">
                    <div className="stat-icon-wrap red-bg">
                      <Eye size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="stat-card-title">{isBn ? 'মোট পাঠক ভিউ' : 'Total Reader Views'}</div>
                      <div className="stat-card-number">
                        {totalReaderViews.toLocaleString()}
                      </div>
                      <div className="stat-card-trend green">
                        {isBn ? `সর্বমোট পাঠক পাঠ` : `Cumulative views`}
                      </div>
                    </div>
                  </div>
                  <div className="stat-spark-bar red-spark">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                </div>

                {/* Card 3: নিউজ ক্যাটাগরি */}
                <div className="admin-stat-card-modern">
                  <div className="stat-card-left">
                    <div className="stat-icon-wrap red-bg">
                      <FolderTree size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="stat-card-title">{isBn ? 'নিউজ ক্যাটাগরি' : 'News Categories'}</div>
                      <div className="stat-card-number">{activeCategoriesCount}</div>
                      <div className="stat-card-trend muted">{isBn ? 'সক্রিয় ক্যাটাগরি' : 'Active categories'}</div>
                    </div>
                  </div>
                  <div className="stat-icon-ghost">
                    <Layers size={28} opacity={0.3} />
                  </div>
                </div>

                {/* Card 4: মিডিয়া ফাইল */}
                <div className="admin-stat-card-modern">
                  <div className="stat-card-left">
                    <div className="stat-icon-wrap orange-bg">
                      <ImageIcon size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="stat-card-title">{isBn ? 'মিডিয়া ফাইল' : 'Media Files'}</div>
                      <div className="stat-card-number">{totalMediaFilesCount.toLocaleString()}</div>
                      <div className="stat-card-trend muted">{isBn ? 'ছবি, গ্যালারি ও ব্যানার' : 'Images, Gallery'}</div>
                    </div>
                  </div>
                  <div className="stat-icon-ghost">
                    <ImageIcon size={28} opacity={0.3} />
                  </div>
                </div>

                {/* Card 5: পেন্ডিং পর্যালোচনা */}
                <div className="admin-stat-card-modern">
                  <div className="stat-card-left">
                    <div className="stat-icon-wrap amber-bg">
                      <Clock size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="stat-card-title">{isBn ? 'পেন্ডিং পর্যালোচনা' : 'Pending Review'}</div>
                      <div className="stat-card-number">{pendingApprovalCount}</div>
                      <div className="stat-card-trend amber">
                        {pendingApprovalCount > 0 ? (isBn ? 'অপেক্ষমাণ রয়েছে' : 'Awaiting Approval') : (isBn ? 'কোনো পেন্ডিং নেই' : 'All approved')}
                      </div>
                    </div>
                  </div>
                  <div className="stat-spark-bar amber-spark">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                </div>

                {/* Card 6: ড্রাফট সংবাদ */}
                <div className="admin-stat-card-modern">
                  <div className="stat-card-left">
                    <div className="stat-icon-wrap red-bg">
                      <Edit size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="stat-card-title">{isBn ? 'ড্রাফট সংবাদ' : 'Draft Posts'}</div>
                      <div className="stat-card-number">
                        {editPostsCount}
                      </div>
                      <div className="stat-card-trend muted">{isBn ? 'সংরক্ষিত খসড়া' : 'Saved Drafts'}</div>
                    </div>
                  </div>
                  <div className="stat-spark-bar blue-spark">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                </div>

                {/* Card 7: মোট মন্তব্য ও পাঠক প্রতিক্রিয়া */}
                <div className="admin-stat-card-modern">
                  <div className="stat-card-left">
                    <div className="stat-icon-wrap blue-bg">
                      <MessageSquare size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="stat-card-title">{isBn ? 'মোট পাঠক প্রতিক্রিয়া' : 'Reader Feedback'}</div>
                      <div className="stat-card-number">{totalInteractionsCount}</div>
                      <div className="stat-card-trend muted">{isBn ? 'শেয়ার ও অভিযোগ বক্স' : 'Shares & Feedback'}</div>
                    </div>
                  </div>
                  <div className="stat-spark-bar purple-spark">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                </div>

                {/* Card 8: সাইট পারফরম্যান্স */}
                <div className="admin-stat-card-modern">
                  <div className="stat-card-left">
                    <div className="stat-icon-wrap purple-bg">
                      <Zap size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="stat-card-title">{isBn ? 'সাইট পারফরম্যান্স' : 'Site Performance'}</div>
                      <div className="stat-card-number">{sitePerformancePercent}%</div>
                      <div className="stat-card-trend green">{isBn ? 'সিস্টেম স্বাভাবিক ও সক্রিয়' : 'All systems normal'}</div>
                    </div>
                  </div>
                  <div className="stat-spark-wave green-wave">
                    <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                      <path d="M2 18 C 12 12, 22 22, 32 10 C 42 2, 52 14, 58 4" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 3. RECENT ARTICLES TABLE (Matching Screenshot) */}
              <div
                className="admin-card-section"
                style={{
                  backgroundColor: isLight ? '#FFFFFF' : '#161922',
                  border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: '20px 22px',
                  boxShadow: isLight ? '0 2px 12px rgba(0, 0, 0, 0.05)' : '0 4px 20px rgba(0, 0, 0, 0.25)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    marginBottom: 18
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 4, height: 24, backgroundColor: 'var(--primary-red)', borderRadius: 2 }} />
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>
                        {isBn ? 'সাম্প্রতিক সংবাদসমূহ' : 'Recent Articles'}
                      </h2>
                      <p style={{ fontSize: '0.78rem', color: isLight ? '#64748B' : '#9CA3AF' }}>
                        {isBn ? 'সর্বশেষ প্রকাশিত সংবাদগুলোর তালিকা' : 'List of recently published articles'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      className="admin-btn-primary"
                      onClick={() => setActiveTab('create-post')}
                      style={{ fontSize: '0.84rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={15} />
                      <span>{isBn ? '+ নতুন সংবাদ লিখুন' : '+ Write New Article'}</span>
                    </button>

                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setActiveTab('edit-post')}
                      style={{ fontSize: '0.84rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>{isBn ? 'সব সংবাদ দেখুন →' : 'View All Articles →'}</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)', color: isLight ? '#64748B' : '#9CA3AF', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 10px', width: 40 }}><input type="checkbox" /></th>
                        <th style={{ padding: '12px 10px' }}>{isBn ? 'ছবি' : 'Image'}</th>
                        <th style={{ padding: '12px 10px' }}>{isBn ? 'শিরোনাম' : 'Headline'}</th>
                        <th style={{ padding: '12px 10px' }}>{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                        <th style={{ padding: '12px 10px' }}>{isBn ? 'প্রকাশের তারিখ' : 'Publish Date'}</th>
                        <th style={{ padding: '12px 10px' }}>{isBn ? 'ভিউ' : 'Views'}</th>
                        <th style={{ padding: '12px 10px' }}>{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                        <th style={{ padding: '12px 10px', textAlign: 'center' }}>{isBn ? 'অ্যাকশন' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.slice(0, 8).map((art) => (
                        <tr key={art.id} style={{ borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)', transition: 'background 0.15s' }}>
                          <td style={{ padding: '12px 10px' }}><input type="checkbox" /></td>
                          <td style={{ padding: '12px 10px' }}>
                            <img src={art.imageUrl} alt="" style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 4 }} />
                          </td>
                          <td style={{ padding: '12px 10px', fontWeight: 700, color: isLight ? '#0F172A' : '#FFFFFF', maxWidth: 320 }}>
                            {isBn ? art.titleBn : (art.titleEn || art.titleBn)}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <span
                              style={{
                                backgroundColor: 'rgba(230,0,18,0.12)',
                                color: 'var(--primary-red)',
                                border: '1px solid rgba(230,0,18,0.25)',
                                padding: '3px 8px',
                                borderRadius: 4,
                                fontSize: '0.74rem',
                                fontWeight: 700
                              }}
                            >
                              {isBn ? (art.categoryBn || art.category) : (art.categoryEn || art.categoryBn || art.category)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', color: isLight ? '#64748B' : '#9CA3AF', fontSize: '0.8rem' }}>
                            {isBn ? art.dateBn : (art.dateEn || art.dateBn)}
                          </td>
                          <td style={{ padding: '12px 10px', color: '#EF4444', fontWeight: 800 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Eye size={13} />
                              <span>{(art.views || 0).toLocaleString()}</span>
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <span
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: '#10B981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '3px 8px',
                                borderRadius: 4,
                                fontSize: '0.74rem',
                                fontWeight: 700
                              }}
                            >
                              {isBn ? 'প্রকাশিত' : 'Published'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => setActiveTab('edit-post')}
                                className="admin-btn-action"
                                style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="সম্পাদনা করুন"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTab('approve-post')}
                                className="admin-btn-action"
                                style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="প্রিভিউ"
                              >
                                <ExternalLink size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{isBn ? 'নির্বাচিত (০)' : 'Selected (0)'}</span>
                    <select className="admin-input" style={{ width: 'auto', height: 32, fontSize: '0.78rem' }}>
                      <option>{isBn ? 'অ্যাকশন নির্বাচন করুন' : 'Select action'}</option>
                      <option>{isBn ? 'মুছে ফেলুন' : 'Delete'}</option>
                    </select>
                    <button type="button" className="admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                      {isBn ? 'প্রয়োগ করুন' : 'Apply'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{isBn ? `মোট ${articles.length} টি সংবাদ` : `Total ${articles.length} posts`}</span>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <button type="button" className="admin-btn-secondary" style={{ padding: '3px 8px', fontSize: '0.78rem' }}>&lt;</button>
                      <button type="button" className="admin-btn-primary" style={{ padding: '3px 8px', fontSize: '0.78rem' }}>1</button>
                      <button type="button" className="admin-btn-secondary" style={{ padding: '3px 8px', fontSize: '0.78rem' }}>2</button>
                      <button type="button" className="admin-btn-secondary" style={{ padding: '3px 8px', fontSize: '0.78rem' }}>3</button>
                      <button type="button" className="admin-btn-secondary" style={{ padding: '3px 8px', fontSize: '0.78rem' }}>&gt;</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL CREATE POST EDITOR */}
          {activeTab === 'create-post' && (
            <CreatePostManager
              initialPostId={dashboardEditingPostId}
              initialPost={dashboardEditingPost}
              triggerSaveToast={triggerSaveToast}
              onSwitchToArticles={() => {
                setDashboardEditingPostId(null);
                setDashboardEditingPost(null);
                setActiveTab('publish-post');
              }}
            />
          )}

          {/* TAB 3: EDIT POST & SUBMISSION MANAGEMENT */}
          {activeTab === 'edit-post' && (
            <EditPostManager
              triggerSaveToast={triggerSaveToast}
              onNavigateToApprove={() => setActiveTab('approve-post')}
              onNavigateToCreate={() => {
                setDashboardEditingPostId(null);
                setDashboardEditingPost(null);
                setActiveTab('create-post');
              }}
            />
          )}

          {/* TAB 4: APPROVE POST & PUBLISHING */}
          {activeTab === 'approve-post' && (
            <ApprovePostManager
              triggerSaveToast={triggerSaveToast}
              onNavigateToEdit={() => setActiveTab('edit-post')}
              onNavigateToCreate={() => {
                setDashboardEditingPostId(null);
                setDashboardEditingPost(null);
                setActiveTab('create-post');
              }}
            />
          )}

          {/* TAB: PUBLISH POST - ALL DB & PUBLISHED POSTS (Requirement 1) */}
          {activeTab === 'publish-post' && (
            <PublishPostManager
              triggerSaveToast={triggerSaveToast}
              onNavigateToCreate={() => {
                setDashboardEditingPostId(null);
                setDashboardEditingPost(null);
                setActiveTab('create-post');
              }}
              onNavigateToEdit={() => setActiveTab('edit-post')}
            />
          )}

          {/* TAB: MEDIA GALLERY & CLOUD ASSET MANAGER */}
          {activeTab === 'gallery' && (
            <MediaGalleryManager triggerSaveToast={triggerSaveToast} />
          )}

          {/* TAB 5: MAIN MENU & CATEGORIES */}
          {(activeTab === 'main-menu' || activeTab === 'categories') && (
            <MainMenuManager triggerSaveToast={triggerSaveToast} />
          )}

          {/* TAB 6: HOMEPAGE SECTIONS */}
          {activeTab === 'homepage-sections' && (
            <HomepageSectionManager triggerSaveToast={triggerSaveToast} />
          )}

          {/* TAB 7: PODCASTS & VIDEOS */}
          {activeTab === 'podcasts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                    {isBn ? 'পডকাস্ট ও ভিডিও পর্বসমূহ' : 'Podcast & Video Management'}
                  </h1>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {isBn ? `মোট ${podcasts.length}টি পর্ব MariaDB ডাটাবেজে সংরক্ষিত রয়েছে` : `${podcasts.length} total episodes saved in MariaDB`}
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleOpenCreatePodcast}
                >
                  <Plus size={18} />
                  <span>{isBn ? 'নতুন পর্ব যোগ করুন' : 'Add New Episode'}</span>
                </button>
              </div>

              {/* PODCAST CARDS GRID */}
              {podcasts.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Mic size={40} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>
                    {isBn ? 'কোনো পডকাস্ট পর্ব পাওয়া যায়নি' : 'No podcast episodes found'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                    {isBn ? 'প্রথম পর্ব যুক্ত করতে উপরের বাটনে ক্লিক করুন।' : 'Click the button above to add the first episode.'}
                  </p>
                  <button type="button" className="admin-btn-primary" onClick={handleOpenCreatePodcast}>
                    <Plus size={16} />
                    <span>{isBn ? 'নতুন পর্ব যোগ করুন' : 'Add New Episode'}</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 }}>
                  {podcasts.map((pod) => {
                    const thumb = getPodcastThumbnail(pod);
                    return (
                      <div key={pod.id} className="admin-card" style={{ padding: 14, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', width: '100%', height: 145, borderRadius: 6, overflow: 'hidden', marginBottom: 10, backgroundColor: '#000' }}>
                          <img
                            src={thumb}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              const ytId = pod.youtubeId || pod.youtube_id;
                              if (ytId && !e.target.src.includes('hqdefault.jpg')) {
                                e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                              }
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              backgroundColor: 'rgba(0,0,0,0.75)',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            {isBn ? pod.subjectBn : (pod.subjectEn || pod.subjectBn)}
                          </span>
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              color: '#fff',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: '0.72rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Clock size={11} />
                            <span>{pod.duration || '২০:০০'}</span>
                          </span>
                        </div>

                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, lineHeight: 1.35, marginBottom: 8, flex: 1 }}>
                          {isBn ? pod.titleBn : (pod.titleEn || pod.titleBn)}
                        </h3>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mic size={14} style={{ color: 'var(--primary-red)', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pod.hostBn || 'উপস্থাপক'} {pod.guestBn ? `• অতিথি: ${pod.guestBn}` : ''}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {pod.dateBn || (pod.created_at ? new Date(pod.created_at).toLocaleDateString('bn-BD') : '')}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              className="admin-btn-action"
                              onClick={() => handleOpenEditPodcast(pod)}
                              title={isBn ? 'সম্পাদনা করুন' : 'Edit Episode'}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="admin-btn-danger"
                              onClick={() => {
                                openConfirm({
                                  title: isBn ? 'পডকাস্ট মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Podcast',
                                  message: isBn ? 'আপনি কি এই পর্বটি ডাটাবেজ থেকে মুছে ফেলতে চান?' : 'Delete this podcast from MariaDB?',
                                  confirmText: isBn ? 'মুছে ফেলুন' : 'Delete',
                                  onConfirm: async () => {
                                    await deletePodcast(pod.id);
                                    triggerSaveToast(isBn ? 'পডকাস্ট পর্ব মুছে ফেলা হয়েছে!' : 'Podcast deleted!');
                                  }
                                });
                              }}
                              title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* POPUP MODAL: ADD / EDIT PODCAST EPISODE */}
              {isCreatingPodcast && (
                <div
                  className="admin-modal-overlay"
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
                  onClick={() => {
                    setIsCreatingPodcast(false);
                    setEditingPodcast(null);
                  }}
                >
                  <div
                    className="admin-modal-box"
                    style={{
                      width: '100%',
                      maxWidth: 680,
                      maxHeight: '92vh',
                      backgroundColor: 'var(--bg-card, #1A1D24)',
                      borderRadius: 14,
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
                      display: 'flex',
                      flexDirection: 'column',
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
                        padding: '16px 22px',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary-red)'
                          }}
                        >
                          <Mic size={20} />
                        </div>
                        <div>
                          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                            {editingPodcast
                              ? (isBn ? 'পডকাস্ট পর্ব সম্পাদনা' : 'Edit Podcast Episode')
                              : (isBn ? 'নতুন পডকাস্ট পর্ব যোগ করুন' : 'Add New Podcast Episode')}
                          </h2>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {isBn ? 'YouTube ভিডিওর লিংক দিলে স্বয়ংক্রিয়ভাবে ভিডিও থাম্বনেইল সনাক্ত হবে' : 'Video thumbnail will be auto-detected from YouTube'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingPodcast(false);
                          setEditingPodcast(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 6,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={isBn ? 'বন্ধ করুন' : 'Close'}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Modal Body with Scroll */}
                    <form onSubmit={handleSavePodcast} style={{ overflowY: 'auto', padding: '20px 22px', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Title Bangla & English */}
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">
                            {isBn ? 'পর্বের শিরোনাম (বাংলা) *' : 'Episode Title (Bangla) *'}
                          </label>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder={isBn ? 'পডকাস্টের শিরোনাম লিখুন...' : 'Enter episode title...'}
                            value={podcastForm.titleBn}
                            onChange={(e) => setPodcastForm({ ...podcastForm, titleBn: e.target.value })}
                            required
                            autoFocus
                          />
                        </div>

                        {/* Category / Subject Selection with Custom Creator */}
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label className="admin-label" style={{ marginBottom: 0 }}>
                              {isBn ? 'ক্যাটাগরি / বিষয় *' : 'Category / Subject *'}
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsCreatingNewSubject(!isCreatingNewSubject)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-red)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <Plus size={13} />
                              <span>{isCreatingNewSubject ? (isBn ? 'বিদ্যমান তালিকা' : 'Existing List') : (isBn ? '+ নতুন ক্যাটাগরি তৈরি' : '+ Create Category')}</span>
                            </button>
                          </div>

                          {!isCreatingNewSubject ? (
                            <select
                              className="admin-select"
                              value={podcastForm.subjectId}
                              onChange={handlePodcastSubjectChange}
                              required
                            >
                              {(podcastSubjects || [])
                                .filter((s) => s.id !== 'all')
                                .map((sub) => (
                                  <option key={sub.id} value={sub.id}>
                                    {isBn ? sub.nameBn : (sub.nameEn || sub.nameBn)}
                                  </option>
                                ))}
                              <option value="__new__">
                                {isBn ? '➕ নতুন বিষয় / ক্যাটাগরি তৈরি করুন...' : '➕ Create New Category...'}
                              </option>
                            </select>
                          ) : (
                            <div
                              style={{
                                padding: 14,
                                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                border: '1px dashed var(--primary-red)',
                                borderRadius: 8,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10
                              }}
                            >
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                    {isBn ? 'নতুন ক্যাটাগরির নাম (বাংলা) *' : 'Category Name (Bangla) *'}
                                  </label>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    placeholder={isBn ? 'যেমন: বিজ্ঞান ও মহাকাশ' : 'e.g. Science & Space'}
                                    value={newSubjectForm.nameBn}
                                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, nameBn: e.target.value })}
                                    autoFocus
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                    {isBn ? 'Category Name (English)' : 'Category Name (English)'}
                                  </label>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="e.g. Science & Space"
                                    value={newSubjectForm.nameEn}
                                    onChange={(e) => setNewSubjectForm({ ...newSubjectForm, nameEn: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  type="button"
                                  className="admin-btn-primary"
                                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                  onClick={handleAddNewSubjectSubmit}
                                  disabled={!newSubjectForm.nameBn.trim()}
                                >
                                  <Plus size={14} />
                                  <span>{isBn ? 'ক্যাটাগরি যুক্ত করুন' : 'Add Category'}</span>
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn-secondary"
                                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  onClick={() => setIsCreatingNewSubject(false)}
                                >
                                  {isBn ? 'বাতিল' : 'Cancel'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* YouTube URL input */}
                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                          <label className="admin-label">
                            {isBn ? 'YouTube ভিডিও URL বা Video ID *' : 'YouTube Video URL or ID *'}
                          </label>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="https://www.youtube.com/watch?v=... বা MpYVwJAXDH8"
                            value={podcastForm.youtubeUrl}
                            onChange={(e) => handlePodcastYoutubeUrlChange(e.target.value)}
                            required
                          />
                          {podcastForm.youtubeId && (
                            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#10B981', fontWeight: 600 }}>
                              <CheckCircle size={14} />
                              <span>{isBn ? `ভিডিও আইডি সনাক্ত হয়েছে: ${podcastForm.youtubeId}` : `Detected Video ID: ${podcastForm.youtubeId}`}</span>
                            </div>
                          )}
                        </div>

                        {/* Live YouTube Video Thumbnail Preview */}
                        {podcastForm.thumbnail && (
                          <div
                            style={{
                              padding: 12,
                              borderRadius: 8,
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              gap: 14,
                              alignItems: 'center'
                            }}
                          >
                            <img
                              src={podcastForm.thumbnail}
                              alt="Video Thumbnail"
                              style={{ width: 140, height: 85, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)', backgroundColor: '#000' }}
                              onError={(e) => {
                                if (podcastForm.youtubeId && !e.target.src.includes('hqdefault.jpg')) {
                                  e.target.src = `https://img.youtube.com/vi/${podcastForm.youtubeId}/hqdefault.jpg`;
                                }
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#10B981',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  marginBottom: 6
                                }}
                              >
                                <CheckCircle size={12} />
                                <span>{isBn ? 'ভিডিও থাম্বনেইল সনাক্ত হয়েছে' : 'Video Thumbnail Detected'}</span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {podcastForm.thumbnail}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Host, Guest, Duration */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">{isBn ? 'উপস্থাপক (Host)' : 'Host Name'}</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={podcastForm.hostBn}
                              onChange={(e) => setPodcastForm({ ...podcastForm, hostBn: e.target.value })}
                            />
                          </div>

                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">{isBn ? 'অতিথি (Guest)' : 'Guest Name'}</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={podcastForm.guestBn}
                              onChange={(e) => setPodcastForm({ ...podcastForm, guestBn: e.target.value })}
                              placeholder={isBn ? 'অতিথির নাম ও পদবি...' : 'Guest name...'}
                            />
                          </div>

                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">{isBn ? 'ব্যপ্তিকাল (Duration)' : 'Duration'}</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={podcastForm.duration}
                              onChange={(e) => setPodcastForm({ ...podcastForm, duration: e.target.value })}
                              placeholder="যেমন: ২৫:০০"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Modal Footer Buttons */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 10,
                          marginTop: 22,
                          paddingTop: 16,
                          borderTop: '1px solid var(--border-color)'
                        }}
                      >
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          onClick={() => {
                            setIsCreatingPodcast(false);
                            setEditingPodcast(null);
                          }}
                        >
                          {isBn ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button type="submit" className="admin-btn-primary">
                          <Save size={18} />
                          <span>{editingPodcast ? (isBn ? 'আপডেট করুন' : 'Update Episode') : (isBn ? 'সংরক্ষণ করুন' : 'Save Episode')}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: EMERGENCY SERVICES */}
          {activeTab === 'emergency' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800 }}>
                  {isBn ? 'জরুরি সেবা পরিচালনা' : 'Emergency Services Management'}
                </h1>
                <button
                  className="admin-btn-primary"
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm({
                      nameBn: '',
                      nameEn: '',
                      number: '',
                      categoryBn: 'জরুরি সেবা',
                      categoryEn: 'Emergency',
                      descriptionBn: '',
                      descriptionEn: '',
                      websiteUrl: '',
                      icon: 'phone'
                    });
                    setIsCreatingService(true);
                  }}
                >
                  <Plus size={18} />
                  <span>{isBn ? 'নতুন সেবা যোগ করুন' : 'Add New Service'}</span>
                </button>
              </div>

              {/* Cards Grid: Always visible */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                {emergencyServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="admin-card"
                    style={{
                      padding: '18px 20px',
                      marginBottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, lineHeight: 1.35, color: 'var(--text-main)' }}>
                          {cleanServiceName(isBn ? srv.nameBn : (srv.nameEn || srv.nameBn))}
                        </h3>
                        {srv.number && (
                          <span
                            style={{
                              fontSize: '0.92rem',
                              fontWeight: 800,
                              color: 'var(--primary-red)',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              padding: '3px 8px',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            <PhoneCall size={13} />
                            <span>{srv.number}</span>
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.55, flex: 1 }}>
                        {isBn ? srv.descriptionBn : (srv.descriptionEn || srv.descriptionBn)}
                      </p>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 8,
                        marginTop: 'auto',
                        paddingTop: 14,
                        borderTop: '1px solid var(--border-color)'
                      }}
                    >
                      <button
                        type="button"
                        className="admin-btn-action"
                        onClick={() => handleOpenEditService(srv)}
                        title={isBn ? 'সম্পাদনা করুন' : 'Edit'}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn-danger"
                        onClick={() => {
                          openConfirm({
                            title: isBn ? 'জরুরি সেবা মুছে ফেলুন' : 'Delete Emergency Service',
                            message: isBn ? 'আপনি কি এই সেবাটি মুছে ফেলতে চান?' : 'Delete this service?',
                            confirmText: isBn ? 'মুছে ফেলুন' : 'Delete',
                            onConfirm: () => deleteEmergencyService(srv.id)
                          });
                        }}
                        title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* POPUP MODAL FOR ADDING / EDITING EMERGENCY SERVICE */}
              {isCreatingService && (
                <div
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
                  onClick={() => {
                    setIsCreatingService(false);
                    setEditingService(null);
                  }}
                >
                  <div
                    className="admin-modal-box"
                    style={{
                      width: '100%',
                      maxWidth: 640,
                      maxHeight: '92vh',
                      backgroundColor: 'var(--bg-card, #1A1D24)',
                      borderRadius: 14,
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
                      display: 'flex',
                      flexDirection: 'column',
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
                        padding: '16px 22px',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary-red)'
                          }}
                        >
                          <PhoneCall size={20} />
                        </div>
                        <div>
                          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                            {editingService
                              ? (isBn ? 'জরুরি সেবা সম্পাদনা' : 'Edit Emergency Service')
                              : (isBn ? 'নতুন জরুরি সেবা যোগ করুন' : 'Add New Emergency Service')}
                          </h2>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {isBn ? 'জরুরি হেল্পলাইন নম্বর ও সেবা বিবরণী' : 'Emergency helpline number and service details'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingService(false);
                          setEditingService(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 6,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={isBn ? 'বন্ধ করুন' : 'Close'}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Modal Form */}
                    <form onSubmit={handleSaveService} style={{ overflowY: 'auto', padding: '20px 22px', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Row 1: Bangla Name & English Name */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">{isBn ? 'সেবার নাম (বাংলা) *' : 'Service Name (Bangla) *'}</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder={isBn ? 'যেমন: জাতীয় জরুরি সেবা' : 'e.g. জাতীয় জরুরি সেবা'}
                              value={serviceForm.nameBn}
                              onChange={(e) => setServiceForm({ ...serviceForm, nameBn: e.target.value })}
                              onBlur={(e) => setServiceForm({ ...serviceForm, nameBn: cleanServiceName(e.target.value) })}
                              required
                              autoFocus
                            />
                            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {isBn ? 'নামের সাথে নম্বর বা ব্র্যাকেট (যেমন ৯৯৯) দেওয়ার প্রয়োজন নেই' : 'No brackets or number needed in name'}
                            </p>
                          </div>

                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">{isBn ? 'সেবার নাম (ইংরেজি)' : 'Service Name (English)'}</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="e.g. National Emergency Service"
                              value={serviceForm.nameEn}
                              onChange={(e) => setServiceForm({ ...serviceForm, nameEn: e.target.value })}
                              onBlur={(e) => setServiceForm({ ...serviceForm, nameEn: cleanServiceName(e.target.value) })}
                            />
                            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {isBn ? 'ইংরেজিতে নাম (ঐচ্ছিক, ব্র্যাকেট ছাড়া)' : 'English service name (optional, without brackets)'}
                            </p>
                          </div>
                        </div>

                        {/* Row 2: Hotline Number & Website URL */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">{isBn ? 'জরুরি হটলাইন নম্বর *' : 'Hotline Number *'}</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder={isBn ? 'যেমন: ৯৯৯' : 'e.g. 999'}
                              value={serviceForm.number}
                              onChange={(e) => setServiceForm({ ...serviceForm, number: e.target.value })}
                              required
                            />
                          </div>

                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <label className="admin-label">{isBn ? 'ওয়েবসাইট লিংক (ঐচ্ছিক)' : 'Website URL (Optional)'}</label>
                            <input
                              type="url"
                              className="admin-input"
                              placeholder="https://..."
                              value={serviceForm.websiteUrl}
                              onChange={(e) => setServiceForm({ ...serviceForm, websiteUrl: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Row 3: Description Bangla & English with max 10 words constraint */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          {/* Description (Bangla) */}
                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <label className="admin-label" style={{ marginBottom: 0 }}>
                                {isBn ? 'বিবরণ (বাংলা) *' : 'Description (Bangla) *'}
                              </label>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: countWords(serviceForm.descriptionBn) >= 10 ? '#EF4444' : 'var(--text-muted)'
                                }}
                              >
                                {isBn
                                  ? `শব্দ: ${countWords(serviceForm.descriptionBn)}/১০`
                                  : `Words: ${countWords(serviceForm.descriptionBn)}/10`}
                              </span>
                            </div>
                            <textarea
                              className="admin-input"
                              rows={3}
                              placeholder={isBn ? 'সেবা সম্পর্কে সংক্ষেপ বিবরণ (সর্বোচ্চ ১০ শব্দ)...' : 'Brief description in Bangla (max 10 words)...'}
                              value={serviceForm.descriptionBn}
                              onChange={handleServiceDescriptionBnChange}
                              required
                              style={{ resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                              <span style={{ fontSize: '0.72rem', color: countWords(serviceForm.descriptionBn) >= 10 ? '#EF4444' : 'var(--text-muted)' }}>
                                {isBn ? 'সর্বোচ্চ ১০ শব্দের মধ্যে বিবরণ লিখুন' : 'Maximum 10 words allowed'}
                              </span>
                              {countWords(serviceForm.descriptionBn) >= 10 && (
                                <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 600 }}>
                                  {isBn ? '⚠️ সীমা পূর্ণ' : '⚠️ Limit reached'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Description (English) */}
                          <div className="admin-form-group" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <label className="admin-label" style={{ marginBottom: 0 }}>
                                {isBn ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}
                              </label>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: countWords(serviceForm.descriptionEn) >= 10 ? '#EF4444' : 'var(--text-muted)'
                                }}
                              >
                                {`Words: ${countWords(serviceForm.descriptionEn)}/10`}
                              </span>
                            </div>
                            <textarea
                              className="admin-input"
                              rows={3}
                              placeholder="Brief description in English (maximum 10 words)..."
                              value={serviceForm.descriptionEn}
                              onChange={handleServiceDescriptionEnChange}
                              style={{ resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                              <span style={{ fontSize: '0.72rem', color: countWords(serviceForm.descriptionEn) >= 10 ? '#EF4444' : 'var(--text-muted)' }}>
                                {isBn ? 'সর্বোচ্চ ১০ শব্দ (ইংরেজি)' : 'Maximum 10 words allowed'}
                              </span>
                              {countWords(serviceForm.descriptionEn) >= 10 && (
                                <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 600 }}>
                                  ⚠️ Limit reached
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer Buttons */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 10,
                          marginTop: 22,
                          paddingTop: 16,
                          borderTop: '1px solid var(--border-color)'
                        }}
                      >
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          onClick={() => {
                            setIsCreatingService(false);
                            setEditingService(null);
                          }}
                        >
                          {isBn ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button type="submit" className="admin-btn-primary">
                          <Save size={18} />
                          <span>{editingService ? (isBn ? 'আপডেট করুন' : 'Update Service') : (isBn ? 'সংরক্ষণ করুন' : 'Save Service')}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: GLOBAL SETTINGS */}
          {activeTab === 'settings' && (
            <GlobalSettingsManager triggerSaveToast={triggerSaveToast} />
          )}

          {/* TAB 10: GOOGLE ADSENSE & BANNER ADS MANAGER */}
          {activeTab === 'ads' && (
            <AdsManager triggerSaveToast={triggerSaveToast} />
          )}

          {/* TAB 11: DATABASE & CLOUD EXPORTS (Requirement 1) */}
          {activeTab === 'database' && (
            <DatabaseBackupManager triggerSaveToast={triggerSaveToast} />
          )}

          {/* TAB: NEWS CARD MAKER STUDIO (Dedicated Tab - No Protection, Full Download & B2 Upload) */}
          {(activeTab === 'news-card-maker' || activeTab === 'card-maker') && (
            <NewsCardMakerManager triggerSaveToast={triggerSaveToast} />
          )}

          {/* TAB: MY PROFILE & PASSWORD SETTINGS (Requirement 2) */}
          {activeTab === 'my-profile' && (
            <UserProfileManager triggerSaveToast={triggerSaveToast} currentMember={currentMember} />
          )}

          {/* TAB: SETUP ACCESS & ROLE PERMISSIONS (Requirement 3) */}
          {activeTab === 'setup-access' && (
            <SetupAccessManager triggerSaveToast={triggerSaveToast} />
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        subMessage={confirmDialog.subMessage}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
