import React, { useState, useMemo } from 'react';
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
  Square
} from 'lucide-react';
import { uploadImageToStorage } from '../utils/imageUploader';
import MainMenuManager from './MainMenuManager';
import HomepageSectionManager from './HomepageSectionManager';
import GlobalSettingsManager from './GlobalSettingsManager';
import CreatePostManager from './CreatePostManager';
import EditPostManager from './EditPostManager';
import ApprovePostManager from './ApprovePostManager';
import MediaGalleryManager from './MediaGalleryManager';
import AdminLoginScreen from './AdminLoginScreen';
import ConfirmModal from '../components/Modals/ConfirmModal';

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
    podcastSubjects,
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
    onConfirm: () => {}
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

  // Active Tab State (Removed 'articles' and 'breaking' as requested)
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'create-post' | 'edit-post' | 'approve-post' | 'main-menu' | 'homepage-sections' | 'podcasts' | 'emergency' | 'settings' | 'ads' | 'database'
  const [saveToast, setSaveToast] = useState(false);

  // Counter for pending approval posts
  const pendingApprovalCount = useMemo(() => {
    return (articles || []).filter(
      (a) => a.status === 'pending_approval' || a.status === 'review' || a.status === 'submitted'
    ).length;
  }, [articles]);

  // Podcast Form State
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [isCreatingPodcast, setIsCreatingPodcast] = useState(false);
  const [podcastForm, setPodcastForm] = useState({
    titleBn: '',
    titleEn: '',
    subjectId: 'politics',
    subjectBn: 'রাজনীতি ও রাষ্ট্র',
    subjectEn: 'Politics & Governance',
    youtubeUrl: '',
    hostBn: 'মোঃ বিপ্লব হোসেন',
    hostEn: 'Md. Biplob Hossain',
    guestBn: '',
    guestEn: '',
    duration: '২৫:০০',
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80'
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

  // Submit Podcast Episode
  const handleSavePodcast = (e) => {
    e.preventDefault();
    if (editingPodcast) {
      updatePodcast(editingPodcast.id, podcastForm);
      triggerSaveToast('পডকাস্ট পর্ব আপডেট হয়েছে!');
    } else {
      addPodcast(podcastForm);
      triggerSaveToast('নতুন পডকাস্ট পর্ব যুক্ত হয়েছে!');
    }
    setEditingPodcast(null);
    setIsCreatingPodcast(false);
  };

  const handleOpenEditPodcast = (pod) => {
    setEditingPodcast(pod);
    setPodcastForm({
      titleBn: pod.titleBn || '',
      titleEn: pod.titleEn || '',
      subjectId: pod.subjectId || 'politics',
      subjectBn: pod.subjectBn || 'রাজনীতি ও রাষ্ট্র',
      subjectEn: pod.subjectEn || 'Politics & Governance',
      youtubeUrl: pod.youtubeUrl || (pod.youtubeId ? `https://www.youtube.com/watch?v=` + pod.youtubeId : ''),
      hostBn: pod.hostBn || 'মোঃ বিপ্লব হোসেন',
      hostEn: pod.hostEn || 'Md. Biplob Hossain',
      guestBn: pod.guestBn || '',
      guestEn: pod.guestEn || '',
      duration: pod.duration || '২৫:০০',
      thumbnail: pod.thumbnail || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80'
    });
    setIsCreatingPodcast(true);
  };

  // Submit Emergency Service
  const handleSaveService = (e) => {
    e.preventDefault();
    if (editingService) {
      updateEmergencyService(editingService.id, serviceForm);
      triggerSaveToast('জরুরি সেবা তথ্য সফলভাবে আপডেট হয়েছে!');
    } else {
      addEmergencyService(serviceForm);
      triggerSaveToast('নতুন জরুরি সেবা সফলভাবে যোগ হয়েছে!');
    }
    setEditingService(null);
    setIsCreatingService(false);
  };

  const handleOpenEditService = (srv) => {
    setEditingService(srv);
    setServiceForm({
      nameBn: srv.nameBn || '',
      nameEn: srv.nameEn || '',
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
          {/* Dashboard Overview */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            title={isBn ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard Overview'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <LayoutDashboard size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>}
          </button>

          {/* Create Post */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'create-post' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-post')}
            title={isBn ? 'পোস্ট তৈরি করুন' : 'Create Post'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <PenTool size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'পোস্ট তৈরি করুন' : 'Create Post'}</span>}
          </button>

          {/* Edit Post */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'edit-post' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit-post')}
            title={isBn ? 'পোস্ট সম্পাদনা ও সাবমিশন' : 'Edit Post & Submissions'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <Edit size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'পোস্ট সম্পাদনা' : 'Edit Post'}</span>}
          </button>

          {/* Approve Post */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'approve-post' ? 'active' : ''}`}
            onClick={() => setActiveTab('approve-post')}
            title={isBn ? 'পোস্ট অনুমোদন ও প্রকাশনা' : 'Approve Post & Publish'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px',
              position: 'relative'
            }}
          >
            <ShieldCheck size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'পোস্ট অনুমোদন' : 'Approve Post'}</span>}
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

          {/* Media Gallery Tab */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
            title={isBn ? 'মিডিয়া গ্যালারি ও ক্লাউড অ্যাসেট' : 'Media Gallery & Assets'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <ImageIcon size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'গ্যালারি' : 'Gallery'}</span>}
          </button>

          {/* Main Menu & Categories */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'main-menu' || activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('main-menu')}
            title={isBn ? 'মেইন মেনু ও ক্যাটাগরি' : 'Main Menu & Categories'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <Menu size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'মেইন মেনু' : 'Main Menu'}</span>}
          </button>

          {/* Homepage Sections */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'homepage-sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('homepage-sections')}
            title={isBn ? 'হোমপেজ সেকশন পরিচালনা' : 'Homepage Sections'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <Layers size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'হোমপেজ সেকশন' : 'Homepage Sections'}</span>}
          </button>

          {/* Podcasts */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'podcasts' ? 'active' : ''}`}
            onClick={() => setActiveTab('podcasts')}
            title={isBn ? 'পডকাস্ট পর্বসমূহ' : 'Podcasts'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <Mic size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'পডকাস্ট' : 'Podcasts'}</span>}
          </button>

          {/* Emergency Services */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
            title={isBn ? 'জরুরি সেবা' : 'Emergency Services'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <LifeBuoy size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'জরুরি সেবা' : 'Emergency Services'}</span>}
          </button>

          {/* Global Settings */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title={isBn ? 'সাইট সেটিংস ও ব্র্যান্ডিং' : 'Site Settings'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <Sliders size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'সাইট সেটিংস' : 'Site Settings'}</span>}
          </button>

          {/* Google AdSense */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'ads' ? 'active' : ''}`}
            onClick={() => setActiveTab('ads')}
            title={isBn ? 'বিজ্ঞাপন স্লট' : 'Google AdSense'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <DollarSign size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'বিজ্ঞাপন' : 'Google AdSense'}</span>}
          </button>

          {/* Database & Backup */}
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
            title={isBn ? 'ডাটাবেজ ও ব্যাকআপ' : 'Database & Backup'}
            style={{
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '10px 0' : '10px 14px'
            }}
          >
            <Database size={18} />
            {!isSidebarCollapsed && <span>{isBn ? 'ডাটাবেজ ও ব্যাকআপ' : 'Database & Backup'}</span>}
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
          {/* User Profile Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              gap: 10,
              marginBottom: isSidebarCollapsed ? 10 : 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80"
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
                    আরিফ রহমান
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isLight ? '#64748B' : '#9CA3AF' }}>
                    অ্যাডমিন
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

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setActiveTab('approve-post')}
              style={{
                position: 'relative',
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
              title={isBn ? `${pendingApprovalCount || 5}টি নতুন নোটিফিকেশন` : 'Notifications'}
            >
              <Bell size={17} />
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
                {pendingApprovalCount || 5}
              </span>
            </button>
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
                    {isBn ? 'স্বাগতম, আরিফ রহমান!' : 'Welcome, Arif Rahman!'}
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

              {/* 2. 8 METRIC KPI CARDS GRID (2 Rows of 4 Cards Matching Screenshot) */}
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
                        {articles.filter((a) => a.status === 'published' || !a.status).length || 27}
                      </div>
                      <div className="stat-card-trend green">↑ 12% গত ৭ দিনের তুলনায়</div>
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
                        {(articles.reduce((acc, curr) => acc + (curr.views || 0), 0) || 252800).toLocaleString()}
                      </div>
                      <div className="stat-card-trend green">↑ 18% গত ৭ দিনের তুলনায়</div>
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
                      <div className="stat-card-number">{categories.length || 131}</div>
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
                      <div className="stat-card-number">3,452</div>
                      <div className="stat-card-trend muted">{isBn ? 'ছবি, ভিডিও ও অন্যান্য' : 'Images, Videos'}</div>
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
                      <div className="stat-card-number">{pendingApprovalCount || 6}</div>
                      <div className="stat-card-trend amber">{isBn ? 'অপেক্ষমাণ রয়েছে' : 'Awaiting Approval'}</div>
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
                        {articles.filter((a) => a.status === 'draft' || a.status === 'review').length || 8}
                      </div>
                      <div className="stat-card-trend muted">{isBn ? 'প্রকাশের অপেক্ষায়' : 'Saved Drafts'}</div>
                    </div>
                  </div>
                  <div className="stat-spark-bar blue-spark">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                </div>

                {/* Card 7: মোট মন্তব্য */}
                <div className="admin-stat-card-modern">
                  <div className="stat-card-left">
                    <div className="stat-icon-wrap blue-bg">
                      <MessageSquare size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="stat-card-title">{isBn ? 'মোট মন্তব্য' : 'Total Comments'}</div>
                      <div className="stat-card-number">245</div>
                      <div className="stat-card-trend muted">{isBn ? 'গত ৭ দিনে' : 'Past 7 Days'}</div>
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
                      <div className="stat-card-number">98%</div>
                      <div className="stat-card-trend green">{isBn ? 'সর্বমোট ঠিক আছে' : 'All systems normal'}</div>
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
              triggerSaveToast={triggerSaveToast}
              onSwitchToArticles={() => setActiveTab('edit-post')}
            />
          )}

          {/* TAB 3: EDIT POST & SUBMISSION MANAGEMENT */}
          {activeTab === 'edit-post' && (
            <EditPostManager
              triggerSaveToast={triggerSaveToast}
              onNavigateToApprove={() => setActiveTab('approve-post')}
              onNavigateToCreate={() => setActiveTab('create-post')}
            />
          )}

          {/* TAB 4: APPROVE POST & PUBLISHING */}
          {activeTab === 'approve-post' && (
            <ApprovePostManager
              triggerSaveToast={triggerSaveToast}
              onNavigateToEdit={() => setActiveTab('edit-post')}
              onNavigateToCreate={() => setActiveTab('create-post')}
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

          {/* TAB 7: PODCASTS */}
          {activeTab === 'podcasts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800 }}>
                  {isBn ? 'পডকাস্ট পর্বসমূহ' : 'Podcast Management'}
                </h1>
                {!isCreatingPodcast && (
                  <button
                    className="admin-btn-primary"
                    onClick={() => {
                      setEditingPodcast(null);
                      setPodcastForm({
                        titleBn: '',
                        titleEn: '',
                        subjectId: 'politics',
                        subjectBn: 'রাজনীতি ও রাষ্ট্র',
                        subjectEn: 'Politics & Governance',
                        youtubeUrl: '',
                        hostBn: 'মোঃ বিপ্লব হোসেন',
                        hostEn: 'Md. Biplob Hossain',
                        guestBn: '',
                        guestEn: '',
                        duration: '২৫:০০',
                        thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80'
                      });
                      setIsCreatingPodcast(true);
                    }}
                  >
                    <Plus size={18} />
                    <span>নতুন পর্ব যোগ করুন</span>
                  </button>
                )}
              </div>

              {isCreatingPodcast ? (
                <div className="admin-card">
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', marginBottom: 18 }}>
                    {editingPodcast ? (isBn ? 'পডকাস্ট পর্ব সম্পাদনা' : 'Edit Podcast') : (isBn ? 'নতুন পডকাস্ট পর্ব যোগ করুন' : 'Add New Podcast')}
                  </h2>

                  <form onSubmit={handleSavePodcast}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="admin-form-group">
                        <label className="admin-label">{isBn ? 'পর্বের শিরোনাম (বাংলা) *' : 'Episode Title (Bangla) *'}</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="পডকাস্টের শিরোনাম লিখুন..."
                          value={podcastForm.titleBn}
                          onChange={(e) => setPodcastForm({ ...podcastForm, titleBn: e.target.value })}
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">{isBn ? 'YouTube ভিডিও URL বা Video ID' : 'YouTube Video URL or ID'}</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={podcastForm.youtubeUrl}
                          onChange={(e) => setPodcastForm({ ...podcastForm, youtubeUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <div className="admin-form-group">
                        <label className="admin-label">{isBn ? 'উপস্থাপক (Host)' : 'Host Name'}</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={podcastForm.hostBn}
                          onChange={(e) => setPodcastForm({ ...podcastForm, hostBn: e.target.value })}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">{isBn ? 'অতিথি (Guest)' : 'Guest Name'}</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={podcastForm.guestBn}
                          onChange={(e) => setPodcastForm({ ...podcastForm, guestBn: e.target.value })}
                          placeholder="অতিথির নাম ও পদবি..."
                        />
                      </div>

                      <div className="admin-form-group">
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

                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button type="submit" className="admin-btn-primary">
                        <Save size={18} />
                        <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Episode'}</span>
                      </button>
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
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
                  {podcasts.map((pod) => (
                    <div key={pod.id} className="admin-card" style={{ padding: 14, marginBottom: 0 }}>
                      <img src={pod.thumbnail} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 4, marginBottom: 10 }} />
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary-red)', fontWeight: 700, marginBottom: 4 }}>
                        {isBn ? pod.subjectBn : pod.subjectEn}
                      </div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
                        {isBn ? pod.titleBn : (pod.titleEn || pod.titleBn)}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mic size={14} style={{ color: 'var(--primary-red)' }} />
                        <span>{pod.hostBn} {pod.guestBn ? `• অতিথি: ${pod.guestBn}` : ''}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          <span>{pod.duration}</span>
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button type="button" className="admin-btn-action" onClick={() => handleOpenEditPodcast(pod)}>
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn-danger"
                            onClick={() => {
                              openConfirm({
                                title: isBn ? 'পডকাস্ট মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Podcast',
                                message: isBn ? 'আপনি কি এই পর্বটি মুছে ফেলতে চান?' : 'Delete this podcast?',
                                confirmText: isBn ? 'মুছে ফেলুন' : 'Delete',
                                onConfirm: () => deletePodcast(pod.id)
                              });
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                {!isCreatingService && (
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
                    <span>নতুন সেবা যোগ করুন</span>
                  </button>
                )}
              </div>

              {isCreatingService ? (
                <div className="admin-card">
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', marginBottom: 18 }}>
                    {editingService ? (isBn ? 'জরুরি সেবা সম্পাদনা' : 'Edit Service') : (isBn ? 'নতুন জরুরি সেবা যোগ করুন' : 'Add New Service')}
                  </h2>

                  <form onSubmit={handleSaveService}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="admin-form-group">
                        <label className="admin-label">{isBn ? 'সেবার নাম (বাংলা) *' : 'Service Name (Bangla) *'}</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={serviceForm.nameBn}
                          onChange={(e) => setServiceForm({ ...serviceForm, nameBn: e.target.value })}
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">{isBn ? 'জরুরি হটলাইন নম্বর *' : 'Hotline Number *'}</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="যেমন: ৯৯৯"
                          value={serviceForm.number}
                          onChange={(e) => setServiceForm({ ...serviceForm, number: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button type="submit" className="admin-btn-primary">
                        <Save size={18} />
                        <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Service'}</span>
                      </button>
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
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {emergencyServices.map((srv) => (
                    <div key={srv.id} className="admin-card" style={{ padding: 16, marginBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{isBn ? srv.nameBn : (srv.nameEn || srv.nameBn)}</h3>
                        <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary-red)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <PhoneCall size={15} />
                          <span>{srv.number}</span>
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                        {isBn ? srv.descriptionBn : (srv.descriptionEn || srv.descriptionBn)}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button type="button" className="admin-btn-action" onClick={() => handleOpenEditService(srv)}>
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
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: GLOBAL SETTINGS */}
          {activeTab === 'settings' && (
            <GlobalSettingsManager triggerSaveToast={triggerSaveToast} />
          )}

          {/* TAB 10: GOOGLE ADSENSE */}
          {activeTab === 'ads' && (
            <div className="admin-card">
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
                {isBn ? 'Google AdSense ও ব্যানার বিজ্ঞাপন' : 'Google AdSense & Ad Management'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
                ওয়েবসাইটের বিভিন্ন পজিশনে Google AdSense স্ক্রিপ্ট ও ব্যানার কোড কনফিগার করুন।
              </p>

              <form onSubmit={handleSaveSettings}>
                <div className="admin-form-group">
                  <label className="admin-label">AdSense Client ID (Publisher ID)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    value={settingsForm.adsenseClientId || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adsenseClientId: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">হেডার টপ ব্যানার স্লট কোড</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    placeholder="AdSense বা কাস্টম ব্যানার HTML কোড..."
                    value={settingsForm.headerAdCode || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, headerAdCode: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">সংবাদ বিস্তারিত পেজ ব্যানার স্লট</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    placeholder="Article page ad script..."
                    value={settingsForm.articleAdCode || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, articleAdCode: e.target.value })}
                  />
                </div>

                <button type="submit" className="admin-btn-primary">
                  <Save size={18} />
                  <span>বিজ্ঞাপন সেটিংস সংরক্ষণ করুন</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 11: DATABASE & BACKUP */}
          {activeTab === 'database' && (
            <div>
              <div className="admin-card">
                <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
                  {isBn ? 'Supabase ক্লাউড ডাটাবেজ ইন্টিগ্রেশন' : 'Supabase Cloud Database'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                  কানেক্ট করুন Supabase PostgreSQL এবং ক্লাউড স্টোরেজ।
                </p>

                <form onSubmit={handleConfigureSupabase}>
                  <div className="admin-form-group">
                    <label className="admin-label">Project URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="https://your-project.supabase.co"
                      value={sbUrl}
                      onChange={(e) => setSbUrl(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Public Anon Key</label>
                    <input
                      type="password"
                      className="admin-input"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      value={sbKey}
                      onChange={(e) => setSbKey(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="admin-btn-primary">
                    <Database size={18} />
                    <span>কানেক্ট ও টেস্ট করুন</span>
                  </button>
                </form>
              </div>

              <div className="admin-card">
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', marginBottom: 8 }}>
                  {isBn ? 'সম্পূর্ণ পোর্টাল ব্যাকআপ ডাউনলোড (JSON)' : 'Full Portal JSON Backup'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                  সকল সংবাদ, ক্যাটাগরি, সেটিংস এবং মিডিয়া মেটাডাটার একটি পূর্ণ ব্যাকআপ ফাইল সংরক্ষণ করুন।
                </p>
                <button type="button" className="admin-btn-secondary" onClick={handleExportBackup}>
                  <Download size={18} />
                  <span>ব্যাকআপ ফাইল ডাউনলোড করুন (.json)</span>
                </button>
              </div>
            </div>
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
