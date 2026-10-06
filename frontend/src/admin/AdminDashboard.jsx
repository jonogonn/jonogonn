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
  Menu
} from 'lucide-react';
import { configureSupabase, uploadImageToStorage } from '../supabase';
import MainMenuManager from './MainMenuManager';
import HomepageSectionManager from './HomepageSectionManager';
import GlobalSettingsManager from './GlobalSettingsManager';
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
    addBreakingItem,
    deleteBreakingItem,
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

  // Custom Confirmation Dialog State (Modern UI Alert/Confirm Replacement)
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

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'articles' | 'categories' | 'breaking' | 'podcasts' | 'emergency' | 'settings' | 'ads' | 'database'
  const [saveToast, setSaveToast] = useState(false);

  // Article Edit / Create Modal State
  const [editingArticle, setEditingArticle] = useState(null);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [articleForm, setArticleForm] = useState({
    titleBn: '',
    titleEn: '',
    category: 'bangladesh',
    categoryBn: 'বাংলাদেশ',
    excerptBn: '',
    excerptEn: '',
    contentBn: '',
    contentEn: '',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    author: 'জনগণ নিউজ ডেস্ক',
    isLeadHero: false,
    isHighlighted: false,
    isBreaking: false,
    isVideo: false,
    videoDuration: ''
  });

  // Category & Menu Management State
  const [editingCategoryItem, setEditingCategoryItem] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryItemForm, setCategoryItemForm] = useState({
    nameBn: '',
    nameEn: '',
    slug: '',
    masterGroupId: 'bangladesh-governance',
    subGroupTitleBn: '',
    customSubGroupTitleBn: ''
  });

  // Master Group Edit / Create Modal State
  const [editingGroup, setEditingGroup] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({ nameBn: '', nameEn: '' });

  // Sub-Group Edit / Create Modal State
  const [editingSubGroup, setEditingSubGroup] = useState(null); // { groupId, oldTitleBn }
  const [isSubGroupModalOpen, setIsSubGroupModalOpen] = useState(false);
  const [subGroupForm, setSubGroupForm] = useState({ groupId: '', titleBn: '', titleEn: '' });

  // Search & Filter in Category Tab
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');

  // Breaking Form State
  const [newBreakBn, setNewBreakBn] = useState('');
  const [newBreakEn, setNewBreakEn] = useState('');

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

  // Settings Local Form State
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  // Supabase Credentials State
  const [sbUrl, setSbUrl] = useState(localStorage.getItem('jonogon_supabase_url') || '');
  const [sbKey, setSbKey] = useState(localStorage.getItem('jonogon_supabase_key') || '');
  const [sbConnected, setSbConnected] = useState(false);

  // Trigger Save Notification
  const triggerSaveToast = (msg = 'সফলভাবে সংরক্ষিত হয়েছে!') => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Handle Image Upload & Conversion to WebP
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert image to WebP using HTML5 Canvas client-side
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Export as WebP
        canvas.toBlob(
          async (blob) => {
            const webpFile = new File([blob], `${Date.now()}_image.webp`, { type: 'image/webp' });
            const uploadedUrl = await uploadImageToStorage(webpFile);
            setArticleForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
            triggerSaveToast('ইমেজ WebP অপটিমাইজ ও আপলোড সফল!');
          },
          'image/webp',
          0.85
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Submit Article Form
  const handleSaveArticle = (e) => {
    e.preventDefault();
    if (editingArticle) {
      updateArticle(editingArticle.id, articleForm);
      triggerSaveToast('সংবাদ সফলভাবে আপডেট হয়েছে!');
    } else {
      addArticle(articleForm);
      triggerSaveToast('নতুন সংবাদ সফলভাবে প্রকাশিত হয়েছে!');
    }
    setEditingArticle(null);
    setIsCreatingArticle(false);
  };

  const handleOpenEditArticle = (art) => {
    setEditingArticle(art);
    setArticleForm({
      titleBn: art.titleBn || '',
      titleEn: art.titleEn || '',
      category: art.category || 'bangladesh',
      categoryBn: art.categoryBn || 'বাংলাদেশ',
      excerptBn: art.excerptBn || '',
      excerptEn: art.excerptEn || '',
      contentBn: art.contentBn || '',
      contentEn: art.contentEn || '',
      imageUrl: art.imageUrl || '',
      author: art.author || 'জনগণ নিউজ ডেস্ক',
      isLeadHero: !!art.isLeadHero,
      isHighlighted: !!art.isHighlighted,
      isBreaking: !!art.isBreaking,
      isVideo: !!art.isVideo,
      videoDuration: art.videoDuration || ''
    });
    setIsCreatingArticle(true);
  };

  // Category & Menu Management Handlers
  const handleOpenAddCategory = (groupId = '', subGroupTitle = '') => {
    setEditingCategoryItem(null);
    const defaultGroup = groupId || (categoryMasterGroups[0]?.id || 'bangladesh-governance');
    const grpObj = categoryMasterGroups.find((g) => g.id === defaultGroup);
    const defaultSub = subGroupTitle || (grpObj?.subGroups[0]?.titleBn || 'সাধারণ');
    setCategoryItemForm({
      nameBn: '',
      nameEn: '',
      slug: '',
      masterGroupId: defaultGroup,
      subGroupTitleBn: defaultSub,
      customSubGroupTitleBn: ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (item, groupId, subGroupTitle) => {
    setEditingCategoryItem(item);
    setCategoryItemForm({
      nameBn: item.nameBn || '',
      nameEn: item.nameEn || '',
      slug: item.slug || item.id || '',
      masterGroupId: groupId,
      subGroupTitleBn: subGroupTitle,
      customSubGroupTitleBn: ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategoryItem = (e) => {
    e.preventDefault();
    if (!categoryItemForm.nameBn.trim()) {
      showError(
        isBn ? 'অনুগ্রহ করে ক্যাটাগরির বাংলা নাম লিখুন।' : 'Please enter category Bangla name.',
        isBn ? 'তথ্য অসম্পূর্ণ' : 'Required Field'
      );
      return;
    }

    const finalSubGroup = (categoryItemForm.subGroupTitleBn === '__custom__'
      ? categoryItemForm.customSubGroupTitleBn
      : categoryItemForm.subGroupTitleBn) || 'সাধারণ';

    const payload = {
      nameBn: categoryItemForm.nameBn.trim(),
      nameEn: categoryItemForm.nameEn ? categoryItemForm.nameEn.trim() : categoryItemForm.nameBn.trim(),
      slug: categoryItemForm.slug ? categoryItemForm.slug.trim() : categoryItemForm.nameBn.trim(),
      masterGroupId: categoryItemForm.masterGroupId,
      subGroupTitleBn: finalSubGroup,
      subGroupTitleEn: finalSubGroup
    };

    if (editingCategoryItem) {
      updateCategoryInMasterGroup(editingCategoryItem.id, payload);
      triggerSaveToast('ক্যাটাগরি তথ্য ও গ্রুপ স্থানান্তর সফল হয়েছে!');
    } else {
      addCategoryToMasterGroup(payload);
      triggerSaveToast('নতুন ক্যাটাগরি ও মেনু আইটেম যুক্ত হয়েছে!');
    }

    setIsCategoryModalOpen(false);
    setEditingCategoryItem(null);
  };

  // Master Group Handlers
  const handleOpenAddMasterGroup = () => {
    setEditingGroup(null);
    setGroupForm({ nameBn: '', nameEn: '' });
    setIsGroupModalOpen(true);
  };

  const handleOpenEditMasterGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({ nameBn: group.nameBn || '', nameEn: group.nameEn || '' });
    setIsGroupModalOpen(true);
  };

  const handleSaveMasterGroup = (e) => {
    e.preventDefault();
    if (!groupForm.nameBn.trim()) return;
    if (editingGroup) {
      updateMasterGroup(editingGroup.id, groupForm);
      triggerSaveToast('মাস্টার গ্রুপের নাম আপডেট হয়েছে!');
    } else {
      addMasterGroup(groupForm);
      triggerSaveToast('নতুন মাস্টার গ্রুপ যোগ হয়েছে!');
    }
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  // Sub-Group Handlers
  const handleOpenAddSubGroup = (groupId) => {
    setEditingSubGroup(null);
    setSubGroupForm({ groupId, titleBn: '', titleEn: '' });
    setIsSubGroupModalOpen(true);
  };

  const handleOpenEditSubGroup = (groupId, subGroup) => {
    setEditingSubGroup({ groupId, oldTitleBn: subGroup.titleBn });
    setSubGroupForm({
      groupId,
      titleBn: subGroup.titleBn || '',
      titleEn: subGroup.titleEn || ''
    });
    setIsSubGroupModalOpen(true);
  };

  const handleSaveSubGroup = (e) => {
    e.preventDefault();
    if (!subGroupForm.titleBn.trim() || !subGroupForm.groupId) return;
    if (editingSubGroup) {
      updateSubGroup(editingSubGroup.groupId, editingSubGroup.oldTitleBn, {
        titleBn: subGroupForm.titleBn,
        titleEn: subGroupForm.titleEn
      });
      triggerSaveToast('সাব-গ্রুপের নাম সফলভাবে আপডেট হয়েছে!');
    } else {
      addSubGroup(subGroupForm.groupId, {
        titleBn: subGroupForm.titleBn,
        titleEn: subGroupForm.titleEn
      });
      triggerSaveToast('নতুন সাব-গ্রুপ যোগ হয়েছে!');
    }
    setIsSubGroupModalOpen(false);
    setEditingSubGroup(null);
  };

  // Submit Breaking News
  const handleAddBreaking = (e) => {
    e.preventDefault();
    if (!newBreakBn) return;
    addBreakingItem({
      textBn: newBreakBn,
      textEn: newBreakEn || newBreakBn
    });
    setNewBreakBn('');
    setNewBreakEn('');
    triggerSaveToast('ব্রেকিং নিউজ টিকার যোগ হয়েছে!');
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

  return (
    <div className="admin-dashboard-wrap" data-theme={adminTheme || theme}>
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
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 700
          }}
        >
          <CheckCircle size={20} />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <img src={settings.logoUrl || '/logo.svg'} alt="Logo" style={{ height: 36, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF' }}>
                {isBn ? 'জনগণ ড্যাশবোর্ড' : 'Jonogon Admin'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#888888' }}>Control Center</div>
            </div>
          </div>

          <div className="admin-header-actions">
            {/* Language BN / EN Button */}
            <button
              type="button"
              onClick={toggleAdminLanguage}
              className="admin-header-btn admin-header-lang-btn"
              title={isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
              aria-label="Toggle Language"
            >
              {isBn ? 'BN' : 'EN'}
            </button>

            {/* Dark (moon) / Light (sun) Theme Button */}
            <button
              type="button"
              onClick={toggleAdminTheme}
              className="admin-header-btn admin-header-theme-btn"
              title={(adminTheme || theme) === 'light' ? 'Dark Mode' : 'Light Mode'}
              aria-label="Toggle Theme"
            >
              {(adminTheme || theme) === 'light' ? <Moon size={14} /> : <Sun size={14} color="#FFB800" />}
            </button>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>{isBn ? 'ওভারভিউ' : 'Overview'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            <FileText size={18} />
            <span>{isBn ? 'সংবাদ পরিচালনা' : 'Articles'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'main-menu' || activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('main-menu')}
          >
            <Menu size={18} />
            <span>{isBn ? 'মেইন মেনু' : 'Main Menu'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'homepage-sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('homepage-sections')}
          >
            <Layers size={18} />
            <span>{isBn ? 'হোমপেজ সেকশন' : 'Homepage Sections'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'breaking' ? 'active' : ''}`}
            onClick={() => setActiveTab('breaking')}
          >
            <Zap size={18} />
            <span>{isBn ? 'ব্রেকিং নিউজ' : 'Breaking News'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'podcasts' ? 'active' : ''}`}
            onClick={() => setActiveTab('podcasts')}
          >
            <Mic size={18} />
            <span>{isBn ? 'পডকাস্ট' : 'Podcasts'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            <LifeBuoy size={18} />
            <span>{isBn ? 'জরুরি সেবা' : 'Emergency Services'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Sliders size={18} />
            <span>{isBn ? 'সেটিংস' : 'Settings'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'ads' ? 'active' : ''}`}
            onClick={() => setActiveTab('ads')}
          >
            <DollarSign size={18} />
            <span>{isBn ? 'বিজ্ঞাপন' : 'Google AdSense'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            <Database size={18} />
            <span>{isBn ? 'ডাটাবেজ ও ব্যাকআপ' : 'Database & Backup'}</span>
          </button>
        </nav>

        {/* Back to Live Website Button */}
        <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid #282828' }}>
          <button
            onClick={() => closeAdmin()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: 'var(--primary-red)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 4,
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={18} />
            <span>{isBn ? 'ওয়েবসাইটে ফিরুন' : 'Back to Website'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content-area">
        {/* Admin Top Utility Header Bar with BN/EN & Dark/Light Switches */}
        <div className="admin-top-util-bar">
          <div className="admin-top-left-status">
            <span className="admin-live-pulse-badge"></span>
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
              {isBn ? 'জনগণ নিউজ কন্ট্রোল প্যানেল' : 'Jonogon News Admin Control'}
            </span>
          </div>

          <div className="admin-top-right-actions">
            {/* BN / EN Language Button */}
            <button
              type="button"
              onClick={toggleAdminLanguage}
              className="admin-util-lang-btn"
              title={isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
              aria-label="Toggle Language"
            >
              <span className="admin-lang-badge">{isBn ? 'BN' : 'EN'}</span>
              <span className="admin-lang-label">{isBn ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Dark (moon) / Light (sun) Theme Switcher */}
            <button
              type="button"
              onClick={toggleAdminTheme}
              className="admin-util-theme-btn"
              title={(adminTheme || theme) === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {(adminTheme || theme) === 'light' ? (
                <>
                  <Moon size={15} />
                  <span>{isBn ? 'ডার্ক মোড' : 'Dark Mode'}</span>
                </>
              ) : (
                <>
                  <Sun size={15} color="#FFB800" />
                  <span>{isBn ? 'লাইট মোড' : 'Light Mode'}</span>
                </>
              )}
            </button>

            {/* Live Website Button */}
            <button
              type="button"
              onClick={() => closeAdmin()}
              className="admin-util-exit-btn"
              title={isBn ? 'লাইভ ওয়েবসাইট দেখুন' : 'View Live Website'}
            >
              <ExternalLink size={14} />
              <span>{isBn ? 'লাইভ ওয়েবসাইট' : 'Live Website'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800 }}>
                  {isBn ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard Overview'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {isBn ? settings.siteNameBn : (settings.siteNameEn || settings.siteNameBn)} ({settings.domain}) - {isBn ? 'পোর্টাল রিয়েল-টাইম মেট্রিক্স' : 'Portal Real-Time Metrics'}
                </p>
              </div>

              <button
                className="admin-btn-primary"
                onClick={() => {
                  setEditingArticle(null);
                  setArticleForm({
                    titleBn: '',
                    titleEn: '',
                    category: 'bangladesh',
                    categoryBn: 'বাংলাদেশ',
                    excerptBn: '',
                    excerptEn: '',
                    contentBn: '',
                    contentEn: '',
                    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
                    author: 'জনগণ নিউজ ডেস্ক',
                    isLeadHero: false,
                    isBreaking: false,
                    isVideo: false,
                    videoDuration: ''
                  });
                  setIsCreatingArticle(true);
                  setActiveTab('articles');
                }}
              >
                <Plus size={18} />
                <span>{isBn ? 'নতুন সংবাদ লিখুন' : 'Write New Article'}</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="admin-stats-grid">
              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isBn ? 'মোট প্রকাশিত সংবাদ' : 'Total Published Articles'}
                  </div>
                  <div className="stat-value">{articles.length}</div>
                </div>
                <FileText size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isBn ? 'মোট পাঠক ভিউ' : 'Total Reader Views'}
                  </div>
                  <div className="stat-value">
                    {articles.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString()}
                  </div>
                </div>
                <Eye size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isBn ? 'নিউজ ক্যাটাগরি' : 'News Categories'}
                  </div>
                  <div className="stat-value">{categories.length}</div>
                </div>
                <FolderTree size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isBn ? 'ব্রেকিং নিউজ টিকার' : 'Breaking News Ticker'}
                  </div>
                  <div className="stat-value">{breakingNews.length}</div>
                </div>
                <Zap size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isBn ? 'পডকাস্ট পর্ব' : 'Podcast Episodes'}
                  </div>
                  <div className="stat-value">{podcasts.length}</div>
                </div>
                <Mic size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isBn ? 'জাতীয় জরুরি সেবা' : 'National Emergency Services'}
                  </div>
                  <div className="stat-value">{emergencyServices.length}</div>
                </div>
                <LifeBuoy size={36} color="var(--primary-red)" opacity={0.3} />
              </div>
            </div>

            {/* Recent Articles Table */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                {isBn ? 'সাম্প্রতিক সংবাদসমূহ' : 'Recent Articles'}
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'ছবি' : 'Image'}</th>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'শিরোনাম' : 'Headline'}</th>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'বিভাগ' : 'Category'}</th>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'তারিখ' : 'Date'}</th>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'ভিউ' : 'Views'}</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.slice(0, 6).map((art) => (
                    <tr key={art.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '8px' }}>
                        <img src={art.imageUrl} alt="" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 3 }} />
                      </td>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{isBn ? art.titleBn : (art.titleEn || art.titleBn)}</td>
                      <td style={{ padding: '8px' }}>
                        <span className="badge-outline">
                          {isBn ? (art.categoryBn || art.category) : (art.categoryEn || art.categoryBn || art.category)}
                        </span>
                      </td>
                      <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{isBn ? art.dateBn : (art.dateEn || art.dateBn)}</td>
                      <td style={{ padding: '8px', color: 'var(--primary-red)', fontWeight: 700 }}>{art.views || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ARTICLES MANAGEMENT */}
        {activeTab === 'articles' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800 }}>
                {isBn ? 'সংবাদ প্রকাশ ও সম্পাদনা' : 'Articles Management & Publishing'}
              </h1>
              {!isCreatingArticle && (
                <button
                  className="admin-btn-primary"
                  onClick={() => {
                    setEditingArticle(null);
                    setArticleForm({
                      titleBn: '',
                      titleEn: '',
                      category: 'bangladesh',
                      categoryBn: 'বাংলাদেশ',
                      excerptBn: '',
                      excerptEn: '',
                      contentBn: '',
                      contentEn: '',
                      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
                      author: 'জনগণ নিউজ ডেস্ক',
                      isLeadHero: false,
                      isBreaking: false,
                      isVideo: false,
                      videoDuration: ''
                    });
                    setIsCreatingArticle(true);
                  }}
                >
                  <Plus size={18} />
                  <span>নতুন সংবাদ লিখুন</span>
                </button>
              )}
            </div>

            {/* Article Create / Edit Form */}
            {isCreatingArticle ? (
              <div className="admin-card">
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', marginBottom: 18 }}>
                  {editingArticle ? (isBn ? 'সংবাদ সম্পাদনা করুন' : 'Edit Article') : (isBn ? 'নতুন সংবাদ লিখুন ও প্রকাশ করুন' : 'Write & Publish New Article')}
                </h2>

                <form onSubmit={handleSaveArticle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'শিরোনাম (বাংলা) *' : 'Headline (Bangla) *'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={isBn ? "বাংলায় সংবাদ শিরোনাম লিখুন..." : "News headline in Bangla..."}
                        value={articleForm.titleBn}
                        onChange={(e) => setArticleForm({ ...articleForm, titleBn: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'Headline (English)' : 'Headline (English)'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="News headline in English..."
                        value={articleForm.titleEn}
                        onChange={(e) => setArticleForm({ ...articleForm, titleEn: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'ক্যাটাগরি / বিভাগ *' : 'Category / Section *'}</label>
                      <select
                        className="admin-select"
                        value={articleForm.category}
                        onChange={(e) => {
                          const selected = categories.find((c) => c.id === e.target.value);
                          setArticleForm({
                            ...articleForm,
                            category: e.target.value,
                            categoryBn: selected ? selected.nameBn : 'সংবাদ'
                          });
                        }}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {isBn ? `${c.nameBn} (${c.nameEn})` : `${c.nameEn || c.nameBn} (${c.nameBn})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'প্রতিবেদক / লেখক' : 'Author / Reporter'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={articleForm.author}
                        onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'লেআউট টাইপ ও ডিসপ্লে' : 'Layout Type & Display'}</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem' }}>
                          <input
                            type="checkbox"
                            checked={articleForm.isLeadHero}
                            onChange={(e) => setArticleForm({ ...articleForm, isLeadHero: e.target.checked })}
                          />
                          {isBn ? 'প্রধান লিড' : 'Hero Lead'}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem' }}>
                          <input
                            type="checkbox"
                            checked={articleForm.isHighlighted}
                            onChange={(e) => setArticleForm({ ...articleForm, isHighlighted: e.target.checked })}
                          />
                          {isBn ? '✨ হাইলাইটস স্লাইডার' : '✨ Highlights'}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem' }}>
                          <input
                            type="checkbox"
                            checked={articleForm.isBreaking}
                            onChange={(e) => setArticleForm({ ...articleForm, isBreaking: e.target.checked })}
                          />
                          {isBn ? 'ব্রেকিং টিকার' : 'Breaking'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload & WebP Optimization */}
                  <div className="admin-form-group">
                    <label className="admin-label">{isBn ? 'ফিচার্ড ইমেজ (WebP অপটিমাইজড / Backblaze B2 / Supabase)' : 'Featured Image (WebP Optimized / Cloud Storage)'}</label>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Image URL..."
                        value={articleForm.imageUrl}
                        onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                      />
                      <label
                        style={{
                          backgroundColor: 'var(--primary-red)',
                          color: '#fff',
                          padding: '9px 14px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          whiteSpace: 'nowrap',
                          fontWeight: 600
                        }}
                      >
                        <Upload size={16} />
                        <span>{isBn ? 'আপলোড (.webp)' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageFileUpload}
                        />
                      </label>
                    </div>
                    {articleForm.imageUrl && (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={articleForm.imageUrl}
                          alt="Preview"
                          style={{ height: 90, width: 140, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border-color)' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div className="admin-form-group">
                    <label className="admin-label">{isBn ? 'সংক্ষিপ্ত সারসংক্ষেপ (Excerpt/Lead)' : 'Brief Excerpt / Lead'}</label>
                    <textarea
                      className="admin-textarea"
                      rows={2}
                      placeholder={isBn ? "সংবাদের মূল আকর্ষণ বা প্রথম ২ লাইন..." : "Lead summary or first 2 sentences..."}
                      value={articleForm.excerptBn}
                      onChange={(e) => setArticleForm({ ...articleForm, excerptBn: e.target.value })}
                    />
                  </div>

                  {/* Full Content */}
                  <div className="admin-form-group">
                    <label className="admin-label">{isBn ? 'সম্পূর্ণ সংবাদ বিবরণ (Full Content)' : 'Full Article Content'}</label>
                    <textarea
                      className="admin-textarea"
                      rows={6}
                      placeholder={isBn ? "বিস্তারিত সংবাদ লিখুন..." : "Write detailed news content..."}
                      value={articleForm.contentBn}
                      onChange={(e) => setArticleForm({ ...articleForm, contentBn: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="admin-btn-primary">
                      <Save size={18} />
                      <span>{editingArticle ? (isBn ? 'আপডেট করুন' : 'Update Article') : (isBn ? 'প্রকাশ করুন' : 'Publish Article')}</span>
                    </button>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setIsCreatingArticle(false)}
                    >
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* Articles List Table */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                {isBn ? `সকল সংবাদের তালিকা (${articles.length}টি)` : `All Articles List (${articles.length})`}
              </h2>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'ছবি' : 'Image'}</th>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'শিরোনাম' : 'Headline'}</th>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'তারিখ' : 'Date'}</th>
                    <th style={{ padding: '10px 8px' }}>{isBn ? 'ভিউ' : 'Views'}</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((art) => (
                    <tr key={art.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '8px' }}>
                        <img src={art.imageUrl} alt="" style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 3 }} />
                      </td>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{isBn ? art.titleBn : (art.titleEn || art.titleBn)}</td>
                      <td style={{ padding: '8px' }}>
                        <span className="badge-outline">
                          {isBn ? (art.categoryBn || art.category) : (art.categoryEn || art.categoryBn || art.category)}
                        </span>
                      </td>
                      <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{isBn ? art.dateBn : (art.dateEn || art.dateBn)}</td>
                      <td style={{ padding: '8px', color: 'var(--primary-red)', fontWeight: 700 }}>{art.views || 0}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenEditArticle(art)}
                          style={{ color: '#2563EB', marginRight: 10, padding: 4 }}
                          title={isBn ? "সম্পাদনা" : "Edit"}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            openConfirm({
                              title: isBn ? 'সংবাদ মুছে ফেলার নিশ্চিতকরণ' : 'Delete Article Confirmation',
                              message: isBn
                                ? `আপনি কি "${art.titleBn || art.titleEn}" সংবাদটি স্থায়ীভাবে মুছে ফেলতে চান?`
                                : `Are you sure you want to permanently delete article "${art.titleEn || art.titleBn}"?`,
                              confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
                              onConfirm: () => {
                                deleteArticle(art.id);
                                triggerSaveToast(isBn ? 'সংবাদ সফলভাবে মুছে ফেলা হয়েছে!' : 'Article deleted successfully!');
                              }
                            });
                          }}
                          style={{ color: '#DC2626', padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}
                          title={isBn ? "মুছে ফেলুন" : "Delete"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MAIN MENU & CATEGORIES */}
        {(activeTab === 'main-menu' || activeTab === 'categories') && (
          <MainMenuManager triggerSaveToast={triggerSaveToast} />
        )}

        {/* TAB: HOMEPAGE SECTIONS */}
        {activeTab === 'homepage-sections' && (
          <HomepageSectionManager triggerSaveToast={triggerSaveToast} />
        )}

        {/* TAB 4: BREAKING NEWS */}
        {activeTab === 'breaking' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 20 }}>
              {isBn ? 'ব্রেকিং নিউজ টিকার পরিচালনা' : 'Breaking News Ticker Management'}
            </h1>

            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                {isBn ? 'নতুন ব্রেকিং হেডলাইন যোগ করুন' : 'Add New Breaking Headline'}
              </h2>
              <form onSubmit={handleAddBreaking} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
                <div>
                  <label className="admin-label">{isBn ? 'ব্রেকিং টেক্সট (বাংলা) *' : 'Breaking Text (Bangla) *'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder={isBn ? "ব্রেকিং নিউজ শিরোনাম লিখুন..." : "Breaking headline in Bangla..."}
                    value={newBreakBn}
                    onChange={(e) => setNewBreakBn(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">{isBn ? 'ব্রেকিং টেক্সট (English)' : 'Breaking Text (English)'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Breaking headline in English..."
                    value={newBreakEn}
                    onChange={(e) => setNewBreakEn(e.target.value)}
                  />
                </div>
                <button type="submit" className="admin-btn-primary" style={{ height: 42 }}>
                  <Plus size={16} />
                  <span>{isBn ? 'যোগ করুন' : 'Add Headline'}</span>
                </button>
              </form>
            </div>

            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                {isBn ? `লাইভ ব্রেকিং আইটেমসমূহ (${breakingNews.length}টি)` : `Live Breaking Items (${breakingNews.length})`}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {breakingNews.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      padding: 12,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Zap size={16} color="var(--primary-red)" />
                      <span style={{ fontWeight: 600 }}>{isBn ? b.textBn : (b.textEn || b.textBn)}</span>
                    </div>
                    <button
                      onClick={() => {
                        openConfirm({
                          title: isBn ? 'ব্রেকিং নিউজ মুছে ফেলা' : 'Delete Breaking News',
                          message: isBn
                            ? `আপনি কি "${b.textBn}" ব্রেকিং নিউজটি তালিকা থেকে মুছে ফেলতে চান?`
                            : `Are you sure you want to remove this breaking news?`,
                          confirmText: isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete',
                          onConfirm: () => {
                            deleteBreakingItem(b.id);
                            triggerSaveToast(isBn ? 'ব্রেকিং নিউজ সরানো হয়েছে!' : 'Breaking news removed!');
                          }
                        });
                      }}
                      style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}
                      title={isBn ? "মুছে ফেলুন" : "Delete"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: OUR PODCASTS (YOUTUBE VIDEOS) */}
        {activeTab === 'podcasts' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800 }}>
                  {isBn ? '🎙️ আমাদের পডকাস্ট ভিডিও পরিচালনা' : '🎙️ Podcast Video Management'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {isBn ? 'হোমপেজের "Our Podcast" সেকশনের ইউটিউব ভিডিও ও পর্ব নিয়ন্ত্রণ করুন' : 'Manage YouTube videos and episodes in Homepage Podcast section'}
                </p>
              </div>

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
                <span>{isBn ? 'নতুন পর্ব যুক্ত করুন' : 'Add New Episode'}</span>
              </button>
            </div>

            {/* Podcast Form Modal / Drawer */}
            {isCreatingPodcast && (
              <div className="admin-card" style={{ border: '2px solid var(--primary-red)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem' }}>
                    {editingPodcast ? (isBn ? 'পডকাস্ট পর্ব সম্পাদনা' : 'Edit Podcast Episode') : (isBn ? 'নতুন পডকাস্ট পর্ব প্রকাশ' : 'Publish New Podcast Episode')}
                  </h2>
                  <button
                    onClick={() => {
                      setIsCreatingPodcast(false);
                      setEditingPodcast(null);
                    }}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {isBn ? '✕ বাতিল' : '✕ Cancel'}
                  </button>
                </div>

                <form onSubmit={handleSavePodcast}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'পর্বের শিরোনাম (বাংলা) *' : 'Episode Title (Bangla) *'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={isBn ? "পডকাস্টের শিরোনাম লিখুন..." : "Podcast episode title in Bangla..."}
                        value={podcastForm.titleBn}
                        onChange={(e) => setPodcastForm({ ...podcastForm, titleBn: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'Episode Title (English)' : 'Episode Title (English)'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Podcast episode title in English..."
                        value={podcastForm.titleEn}
                        onChange={(e) => setPodcastForm({ ...podcastForm, titleEn: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'পডকাস্টের বিষয় / বিষয়শ্রেণী (Topic / Subject) *' : 'Podcast Topic / Subject *'}</label>
                      <select
                        className="admin-input"
                        value={podcastForm.subjectId || 'politics'}
                        onChange={(e) => {
                          const selected = podcastSubjects.find((s) => s.id === e.target.value);
                          if (selected) {
                            setPodcastForm({
                              ...podcastForm,
                              subjectId: selected.id,
                              subjectBn: selected.nameBn,
                              subjectEn: selected.nameEn
                            });
                          }
                        }}
                      >
                        {podcastSubjects.filter((s) => s.id !== 'all').map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.icon} {isBn ? `${s.nameBn} (${s.nameEn})` : `${s.nameEn || s.nameBn} (${s.nameBn})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'হোস্ট / উপস্থাপক' : 'Host / Presenter'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={isBn ? podcastForm.hostBn : (podcastForm.hostEn || podcastForm.hostBn)}
                        onChange={(e) => setPodcastForm({ ...podcastForm, hostBn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'সময়কাল (Duration)' : 'Duration'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={isBn ? "যেমন: ২৫:৪০" : "e.g. 25:40"}
                        value={podcastForm.duration}
                        onChange={(e) => setPodcastForm({ ...podcastForm, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'YouTube ভিডিও লিঙ্ক বা ID *' : 'YouTube Video Link or ID *'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={isBn ? "https://www.youtube.com/watch?v=... বা ভিডিও ID" : "https://www.youtube.com/watch?v=... or Video ID"}
                        value={podcastForm.youtubeUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPodcastForm({ ...podcastForm, youtubeUrl: val });
                          // Auto thumbnail from YouTube ID if matched
                          const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                          if (match) {
                            setPodcastForm((prev) => ({
                              ...prev,
                              youtubeUrl: val,
                              thumbnail: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
                            }));
                          }
                        }}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'অতিথি (Guest Name)' : 'Guest Name'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={isBn ? "যেমন: ড. আতিকুর রহমান (অর্থনীতিবিদ)" : "e.g. Dr. Atikur Rahman"}
                        value={podcastForm.guestBn}
                        onChange={(e) => setPodcastForm({ ...podcastForm, guestBn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'কাস্টম থাম্বনেইল URL (ঐচ্ছিক)' : 'Custom Thumbnail URL (Optional)'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="https://images.unsplash.com/..."
                        value={podcastForm.thumbnail}
                        onChange={(e) => setPodcastForm({ ...podcastForm, thumbnail: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
                      <Save size={16} />
                      <span>{editingPodcast ? (isBn ? 'আপডেট করুন' : 'Update Episode') : (isBn ? 'প্রকাশ করুন' : 'Publish Episode')}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Podcasts Table List */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                {isBn ? `পডকাস্ট এপিসোড তালিকা (${podcasts.length}টি)` : `Podcast Episodes List (${podcasts.length})`}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {podcasts.map((pod) => (
                  <div
                    key={pod.id}
                    style={{
                      padding: 12,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <img
                        src={pod.thumbnail}
                        alt=""
                        style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span
                            style={{
                              backgroundColor: 'rgba(230, 0, 18, 0.1)',
                              color: 'var(--primary-red)',
                              padding: '2px 8px',
                              borderRadius: 3,
                              fontWeight: 700,
                              fontSize: '0.76rem'
                            }}
                          >
                            {isBn ? (pod.subjectBn || 'রাজনীতি ও রাষ্ট্র') : (pod.subjectEn || pod.subjectBn || 'Politics & Governance')}
                          </span>
                          <h4 style={{ fontWeight: 700, fontSize: '0.98rem', margin: 0 }}>
                            {isBn ? pod.titleBn : (pod.titleEn || pod.titleBn)}
                          </h4>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 12, marginTop: 2 }}>
                          <span>🎙️ {isBn ? pod.hostBn : (pod.hostEn || pod.hostBn)}</span>
                          {pod.guestBn && <span>👤 {isBn ? 'অতিথি: ' : 'Guest: '} {isBn ? pod.guestBn : (pod.guestEn || pod.guestBn)}</span>}
                          <span>⏱ {pod.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleOpenEditPodcast(pod)}
                        style={{ color: '#2563EB', padding: 6 }}
                        title={isBn ? "সম্পাদনা" : "Edit"}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          openConfirm({
                            title: isBn ? 'পডকাস্ট পর্ব মুছে ফেলা' : 'Delete Podcast Episode',
                            message: isBn
                              ? `আপনি কি "${pod.titleBn || pod.titleEn}" পডকাস্ট পর্বটি মুছে ফেলতে চান?`
                              : `Are you sure you want to delete podcast episode "${pod.titleEn || pod.titleBn}"?`,
                            confirmText: isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete',
                            onConfirm: () => {
                              deletePodcast(pod.id);
                              triggerSaveToast(isBn ? 'পডকাস্ট পর্ব মুছে ফেলা হয়েছে!' : 'Podcast episode deleted!');
                            }
                          });
                        }}
                        style={{ color: '#DC2626', padding: 6, background: 'none', border: 'none', cursor: 'pointer' }}
                        title={isBn ? "মুছে ফেলুন" : "Delete"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: EMERGENCY SERVICES (BD GOVT & HELPLINES) */}
        {activeTab === 'emergency' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800 }}>
                  {isBn ? '🚨 জাতীয় জরুরি সেবা ও নাগরিক হেল্পলাইন' : '🚨 National Emergency Services & Helplines'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {isBn ? 'বাংলাদেশ সরকারের জাতীয় হেল্পলাইন ও জরুরি অনলাইন সেবাসমূহ নিয়ন্ত্রণ ও আপডেট করুন' : 'Manage national helplines and emergency online government services'}
                </p>
              </div>

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
                <span>{isBn ? 'নতুন সেবা যুক্ত করুন' : 'Add New Service'}</span>
              </button>
            </div>

            {/* Service Form Modal / Card */}
            {isCreatingService && (
              <div className="admin-card" style={{ border: '2px solid var(--primary-red)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem' }}>
                    {editingService ? (isBn ? 'জরুরি সেবা তথ্য সম্পাদনা' : 'Edit Emergency Service') : (isBn ? 'নতুন জাতীয় জরুরি সেবা প্রকাশ' : 'Publish Emergency Service')}
                  </h2>
                  <button
                    onClick={() => {
                      setIsCreatingService(false);
                      setEditingService(null);
                    }}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {isBn ? '✕ বাতিল' : '✕ Cancel'}
                  </button>
                </div>

                <form onSubmit={handleSaveService}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'সেবার নাম (বাংলা) *' : 'Service Name (Bangla) *'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={isBn ? "যেমন: জাতীয় জরুরি সেবা (৯৯৯)" : "e.g. National Emergency Service (999)"}
                        value={serviceForm.nameBn}
                        onChange={(e) => setServiceForm({ ...serviceForm, nameBn: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'সেবার নাম (English)' : 'Service Name (English)'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. National Emergency Service (999)"
                        value={serviceForm.nameEn}
                        onChange={(e) => setServiceForm({ ...serviceForm, nameEn: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'হেল্পলাইন নম্বর' : 'Helpline Number'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={isBn ? "যেমন: 999 বা 333 বা 16122" : "e.g. 999 or 333 or 16122"}
                        value={serviceForm.number}
                        onChange={(e) => setServiceForm({ ...serviceForm, number: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'ক্যাটাগরি (বাংলা)' : 'Category (Bangla)'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={isBn ? "যেমন: পুলিশ, ফায়ার ও অ্যাম্বুলেন্স" : "e.g. Police, Fire & Ambulance"}
                        value={serviceForm.categoryBn}
                        onChange={(e) => setServiceForm({ ...serviceForm, categoryBn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'Category (English)' : 'Category (English)'}</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. Police, Fire & Ambulance"
                        value={serviceForm.categoryEn}
                        onChange={(e) => setServiceForm({ ...serviceForm, categoryEn: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'অফিসিয়াল ওয়েবসাইট / পোর্টাল লিংক' : 'Official Website / Portal Link'}</label>
                      <input
                        type="url"
                        className="admin-input"
                        placeholder="https://police.gov.bd"
                        value={serviceForm.websiteUrl}
                        onChange={(e) => setServiceForm({ ...serviceForm, websiteUrl: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'আইকন ধরন (Icon Style)' : 'Icon Style'}</label>
                      <select
                        className="admin-input"
                        value={serviceForm.icon}
                        onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                      >
                        <option value="phone">{isBn ? '📞 ফোন / সার্বিক জরুরি' : '📞 Phone / General Emergency'}</option>
                        <option value="shield">{isBn ? '🛡️ নিরাপত্তা / নারী-শিশু' : '🛡️ Security / Women & Child'}</option>
                        <option value="alert">{isBn ? '⚠️ অভিযোগ / দুদক' : '⚠️ Anti-Corruption / Complaints'}</option>
                        <option value="id">{isBn ? '🪪 এনআইডি ও ভোটার' : '🪪 NID & Voter Services'}</option>
                        <option value="globe">{isBn ? '🌐 ভূমি / ডিজিটাল সেবা' : '🌐 Land & Digital Services'}</option>
                        <option value="cloud">{isBn ? '☁️ আবহাওয়া / দুর্যোগ' : '☁️ Weather & Disaster'}</option>
                        <option value="link">{isBn ? '🔗 পাসপোর্ট / অনলাইন লিঙ্ক' : '🔗 Passport / Online Links'}</option>
                        <option value="gov">{isBn ? '🏛️ সরকারি সাধারণ সেবা' : '🏛️ General Gov Services'}</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'সংক্ষিপ্ত বিবরণ (বাংলা)' : 'Description (Bangla)'}</label>
                      <textarea
                        className="admin-input"
                        rows={3}
                        placeholder={isBn ? "এই জরুরি সেবার উদ্দেশ্য ও কী ধরনের সহায়তা পাওয়া যায় লিখুন..." : "Brief description of emergency service..."}
                        value={serviceForm.descriptionBn}
                        onChange={(e) => setServiceForm({ ...serviceForm, descriptionBn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">{isBn ? 'Description (English)' : 'Description (English)'}</label>
                      <textarea
                        className="admin-input"
                        rows={3}
                        placeholder="Brief description of the emergency service..."
                        value={serviceForm.descriptionEn}
                        onChange={(e) => setServiceForm({ ...serviceForm, descriptionEn: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
                      <Save size={16} />
                      <span>{editingService ? (isBn ? 'আপডেট করুন' : 'Update Service') : (isBn ? 'সংরক্ষণ করুন' : 'Save Service')}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Emergency Services Table / Cards List */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                {isBn ? `বিদ্যমান জরুরি সেবা তালিকা (${emergencyServices.length}টি)` : `Active Emergency Services (${emergencyServices.length})`}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {emergencyServices.map((srv) => (
                  <div
                    key={srv.id}
                    style={{
                      padding: 16,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.3rem' }}>
                            {srv.icon === 'shield' ? '🛡️' : srv.icon === 'alert' ? '⚠️' : srv.icon === 'id' ? '🪪' : srv.icon === 'globe' ? '🌐' : srv.icon === 'cloud' ? '☁️' : srv.icon === 'link' ? '🔗' : '📞'}
                          </span>
                          <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-color)' }}>
                            {isBn ? srv.nameBn : (srv.nameEn || srv.nameBn)}
                          </h4>
                        </div>

                        {srv.number && (
                          <span
                            style={{
                              backgroundColor: 'var(--primary-red)',
                              color: '#fff',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <PhoneCall size={12} />
                            {srv.number}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>{isBn ? 'বিভাগ: ' : 'Category: '} {isBn ? (srv.categoryBn || 'জরুরি') : (srv.categoryEn || srv.categoryBn || 'Emergency')}</span>
                        {isBn ? (srv.nameEn && <span> • {srv.nameEn}</span>) : (srv.nameBn && <span> • {srv.nameBn}</span>)}
                      </div>

                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '6px 0' }}>
                        {isBn ? srv.descriptionBn : (srv.descriptionEn || srv.descriptionBn)}
                      </p>

                      {srv.websiteUrl && (
                        <div style={{ marginTop: 6 }}>
                          <a
                            href={srv.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--primary-red)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontWeight: 600
                            }}
                          >
                            <ExternalLink size={12} />
                            <span>{srv.websiteUrl.replace(/^https?:\/\//, '')}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                      <button
                        onClick={() => handleOpenEditService(srv)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#2563EB',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          padding: '4px 8px',
                          border: '1px solid #BFDBFE',
                          borderRadius: 4,
                          backgroundColor: '#EFF6FF'
                        }}
                        title={isBn ? "সম্পাদনা করুন" : "Edit"}
                      >
                        <Edit size={14} />
                        <span>{isBn ? 'এডিট' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => {
                          openConfirm({
                            title: isBn ? 'জরুরি সেবা মুছে ফেলার নিশ্চিতকরণ' : 'Delete Emergency Service',
                            message: isBn
                              ? `আপনি কি "${srv.nameBn}" তালিকা থেকে মুছে ফেলতে চান?`
                              : `Are you sure you want to remove "${srv.nameEn || srv.nameBn}" from emergency services?`,
                            confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
                            onConfirm: () => {
                              deleteEmergencyService(srv.id);
                              triggerSaveToast(isBn ? 'জরুরি সেবা তালিকা থেকে মুছে ফেলা হয়েছে!' : 'Emergency service removed!');
                            }
                          });
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#DC2626',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          padding: '4px 8px',
                          border: '1px solid #FECACA',
                          borderRadius: 4,
                          backgroundColor: '#FEF2F2',
                          cursor: 'pointer'
                        }}
                        title={isBn ? "মুছে ফেলুন" : "Delete"}
                      >
                        <Trash2 size={14} />
                        <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GLOBAL SETTINGS (BRANDING, POPUP, ABOUT, ADVERTISEMENTS, CONTACT, POLICIES) */}
        {activeTab === 'settings' && (
          <GlobalSettingsManager triggerSaveToast={triggerSaveToast} />
        )}

        {/* TAB 6: ADSENSE & MONETIZATION */}
        {activeTab === 'ads' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 20 }}>
              {isBn ? 'Google AdSense ও বিজ্ঞাপন কনফিগারেশন' : 'Google AdSense & Advertisements'}
            </h1>

            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem' }}>
                    {isBn ? 'Google AdSense মাস্টার কন্ট্রোল' : 'Google AdSense Master Control'}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    {isBn ? 'AdSense অ্যাপ্রুভালের পর যেকোনো স্লটে কোড বসিয়ে স্বয়ংক্রিয় বিজ্ঞাপন প্রদর্শন চালু করুন' : 'Enable automated advertisements and manage custom ad unit placements'}
                  </p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.adSenseEnabled}
                    onChange={(e) => {
                      updateSiteSettings({ adSenseEnabled: e.target.checked });
                      triggerSaveToast(e.target.checked ? (isBn ? 'AdSense সক্রিয় করা হয়েছে!' : 'AdSense enabled!') : (isBn ? 'AdSense নিষ্ক্রিয় করা হয়েছে' : 'AdSense disabled'));
                    }}
                    style={{ width: 20, height: 20 }}
                  />
                  <span style={{ fontWeight: 700 }}>{isBn ? 'বিজ্ঞাপন চালু রাখুন' : 'Enable Ads'}</span>
                </label>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">{isBn ? 'Google AdSense পাবলিশার / ক্লায়েন্ট আইডি' : 'Google AdSense Publisher / Client ID'}</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  value={settings.adSenseClientId}
                  onChange={(e) => updateSiteSettings({ adSenseClientId: e.target.value })}
                />
              </div>
            </div>

            {/* Individual Slot Configs */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                {isBn ? 'বিজ্ঞাপন স্লটসমূহ (Ad Slots Placement)' : 'Ad Slots Placement'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(settings.adSlots || {}).map(([slotKey, slotVal]) => (
                  <div
                    key={slotKey}
                    style={{
                      padding: 14,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 4
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700 }}>{slotVal.fallbackText}</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={slotVal.enabled}
                          onChange={(e) => {
                            const updatedSlots = {
                              ...settings.adSlots,
                              [slotKey]: { ...slotVal, enabled: e.target.checked }
                            };
                            updateSiteSettings({ adSlots: updatedSlots });
                            triggerSaveToast(isBn ? 'স্লট আপডেট হয়েছে!' : 'Slot updated!');
                          }}
                        />
                        {isBn ? 'স্লট সক্রিয়' : 'Slot Active'}
                      </label>
                    </div>
                    <textarea
                      className="admin-textarea"
                      rows={2}
                      placeholder="Google AdSense ad unit code / HTML snippet..."
                      value={slotVal.code || ''}
                      onChange={(e) => {
                        const updatedSlots = {
                          ...settings.adSlots,
                          [slotKey]: { ...slotVal, code: e.target.value }
                        };
                        updateSiteSettings({ adSlots: updatedSlots });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SUPABASE DATABASE & BACKUP */}
        {activeTab === 'database' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 20 }}>
              {isBn ? 'Supabase ডাটাবেজ ও ক্লাউড স্টোরেজ' : 'Supabase Database & Cloud Storage'}
            </h1>

            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                {isBn ? 'Supabase কানেকশন সেটআপ' : 'Supabase Connection Setup'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                {isBn
                  ? 'প্রজেক্ট রুট ফোল্ডারে থাকা supabase_schema.sql ফাইলটি আপনার Supabase SQL Editor-এ রান করার পর নিচের তথ্যগুলো বসান:'
                  : 'Run supabase_schema.sql in your Supabase SQL Editor, then enter connection details below:'}
              </p>

              <form onSubmit={handleConfigureSupabase}>
                <div className="admin-form-group">
                  <label className="admin-label">Supabase Project URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="https://your-project.supabase.co"
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Supabase Anon Public API Key</label>
                  <input
                    type="password"
                    className="admin-input"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={sbKey}
                    onChange={(e) => setSbKey(e.target.value)}
                  />
                </div>

                <button type="submit" className="admin-btn-primary">
                  <RefreshCw size={16} />
                  <span>{isBn ? 'কানেকশন সেভ করুন' : 'Save Connection'}</span>
                </button>
              </form>
            </div>

            {/* Backblaze B2 Status */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                {isBn ? 'Backblaze B2 ক্লাউড স্টোরেজ স্ট্যাটাস' : 'Backblaze B2 Cloud Storage Status'}
              </h2>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
                <div><strong>Primary Image Bucket:</strong> <code>janogon-news-images</code></div>
                <div><strong>Backup Bucket:</strong> <code>janogon-admin-backups</code></div>
                <div><strong>Storage Endpoint:</strong> <code>https://s3.us-west-004.backblazeb2.com</code></div>
                <div><strong>CDN Routing:</strong> <code>https://cdn.jonogon.news</code></div>
              </div>
            </div>

            {/* Data Export & Backup */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                {isBn ? 'ডাটাবেজ ও কনটেন্ট ব্যাকআপ' : 'Database & Content Backup'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                {isBn
                  ? 'আপনার সমস্ত সংবাদ, সেটিংস ও ক্যাটাগরির ব্যাকআপ এক ক্লিকে ডাউনলোড করুন:'
                  : 'Download complete JSON snapshot backup of all articles, settings, and menus in one click:'}
              </p>
              <button onClick={handleExportBackup} className="admin-btn-primary">
                <Download size={18} />
                <span>{isBn ? 'সম্পূর্ণ ডাটাবেজ ব্যাকআপ ডাউনলোড করুন (.json)' : 'Download Full Database Backup (.json)'}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modern UI Confirm / Alert Modal Dialog */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        subMessage={confirmDialog.subMessage}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
        isBn={isBn}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
