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
  Tag
} from 'lucide-react';
import { configureSupabase, uploadImageToStorage } from '../supabase';

export default function AdminDashboard() {
  const {
    language,
    setIsAdminOpen,
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
    deleteEmergencyService
  } = useNews();

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
      alert('ক্যাটাগরির বাংলা নাম লিখুন');
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
    <div className="admin-dashboard-wrap">
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
          <img src={settings.logoUrl || '/logo.svg'} alt="Logo" style={{ height: 38 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>জনগণ ড্যাশবোর্ড</div>
            <div style={{ fontSize: '0.75rem', color: '#999' }}>Admin Control Center</div>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>ওভারভিউ (Overview)</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            <FileText size={18} />
            <span>সংবাদ পরিচালনা (Articles)</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <FolderTree size={18} />
            <span>ক্যাটাগরি (Categories)</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'breaking' ? 'active' : ''}`}
            onClick={() => setActiveTab('breaking')}
          >
            <Zap size={18} />
            <span>ব্রেকিং নিউজ (Ticker)</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'podcasts' ? 'active' : ''}`}
            onClick={() => setActiveTab('podcasts')}
          >
            <Mic size={18} />
            <span>পডকাস্ট ভিডিও (Podcasts)</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            <LifeBuoy size={18} />
            <span>জরুরি সেবা (Emergency)</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Sliders size={18} />
            <span>গ্লোবাল সেটিংস (Branding)</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'ads' ? 'active' : ''}`}
            onClick={() => setActiveTab('ads')}
          >
            <DollarSign size={18} />
            <span>Google AdSense / বিজ্ঞাপন</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            <Database size={18} />
            <span>Supabase ও ব্যাকআপ</span>
          </button>
        </nav>

        {/* Back to Live Website Button */}
        <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid #282828' }}>
          <button
            onClick={() => setIsAdminOpen(false)}
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
            <span>ওয়েবসাইটে ফিরুন</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content-area">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800 }}>
                  ড্যাশবোর্ড ওভারভিউ
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {settings.siteNameBn} ({settings.domain}) - পোর্টাল রিয়েল-টাইম মেট্রিক্স
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
                <span>নতুন সংবাদ লিখুন</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="admin-stats-grid">
              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>মোট প্রকাশিত সংবাদ</div>
                  <div className="stat-value">{articles.length}</div>
                </div>
                <FileText size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>মোট পাঠক ভিউ</div>
                  <div className="stat-value">
                    {articles.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString()}
                  </div>
                </div>
                <Eye size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>নিউজ ক্যাটাগরি</div>
                  <div className="stat-value">{categories.length}</div>
                </div>
                <FolderTree size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ব্রেকিং নিউজ টিকার</div>
                  <div className="stat-value">{breakingNews.length}</div>
                </div>
                <Zap size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>পডকাস্ট পর্ব</div>
                  <div className="stat-value">{podcasts.length}</div>
                </div>
                <Mic size={36} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>জাতীয় জরুরি সেবা</div>
                  <div className="stat-value">{emergencyServices.length}</div>
                </div>
                <LifeBuoy size={36} color="var(--primary-red)" opacity={0.3} />
              </div>
            </div>

            {/* Recent Articles Table */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                সাম্প্রতিক সংবাদসমূহ
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    <th style={{ padding: '10px 8px' }}>ছবি</th>
                    <th style={{ padding: '10px 8px' }}>শিরোনাম</th>
                    <th style={{ padding: '10px 8px' }}>বিভাগ</th>
                    <th style={{ padding: '10px 8px' }}>তারিখ</th>
                    <th style={{ padding: '10px 8px' }}>ভিউ</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.slice(0, 6).map((art) => (
                    <tr key={art.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '8px' }}>
                        <img src={art.imageUrl} alt="" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 3 }} />
                      </td>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{art.titleBn}</td>
                      <td style={{ padding: '8px' }}><span className="badge-outline">{art.categoryBn || art.category}</span></td>
                      <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{art.dateBn}</td>
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
                সংবাদ প্রকাশ ও সম্পাদনা
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
                  {editingArticle ? 'সংবাদ সম্পাদনা করুন' : 'নতুন সংবাদ লিখুন ও প্রকাশ করুন'}
                </h2>

                <form onSubmit={handleSaveArticle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">শিরোনাম (বাংলা) *</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="বাংলায় সংবাদ শিরোনাম লিখুন..."
                        value={articleForm.titleBn}
                        onChange={(e) => setArticleForm({ ...articleForm, titleBn: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Headline (English)</label>
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
                      <label className="admin-label">ক্যাটাগরি / বিভাগ *</label>
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
                            {c.nameBn} ({c.nameEn})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">প্রতিবেদক / লেখক</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={articleForm.author}
                        onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">লেআউট টাইপ ও ডিসপ্লে</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem' }}>
                          <input
                            type="checkbox"
                            checked={articleForm.isLeadHero}
                            onChange={(e) => setArticleForm({ ...articleForm, isLeadHero: e.target.checked })}
                          />
                          প্রধান লিড
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem' }}>
                          <input
                            type="checkbox"
                            checked={articleForm.isHighlighted}
                            onChange={(e) => setArticleForm({ ...articleForm, isHighlighted: e.target.checked })}
                          />
                          ✨ হাইলাইটস স্লাইডার
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem' }}>
                          <input
                            type="checkbox"
                            checked={articleForm.isBreaking}
                            onChange={(e) => setArticleForm({ ...articleForm, isBreaking: e.target.checked })}
                          />
                          ব্রেকিং টিকার
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload & WebP Optimization */}
                  <div className="admin-form-group">
                    <label className="admin-label">ফিচার্ড ইমেজ (WebP অপটিমাইজড / Backblaze B2 / Supabase)</label>
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
                        <span>আপলোড (.webp)</span>
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
                    <label className="admin-label">সংক্ষিপ্ত সারসংক্ষেপ (Excerpt/Lead)</label>
                    <textarea
                      className="admin-textarea"
                      rows={2}
                      placeholder="সংবাদের মূল আকর্ষণ বা প্রথম ২ লাইন..."
                      value={articleForm.excerptBn}
                      onChange={(e) => setArticleForm({ ...articleForm, excerptBn: e.target.value })}
                    />
                  </div>

                  {/* Full Content */}
                  <div className="admin-form-group">
                    <label className="admin-label">সম্পূর্ণ সংবাদ বিবরণ (Full Content)</label>
                    <textarea
                      className="admin-textarea"
                      rows={6}
                      placeholder="বিস্তারিত সংবাদ লিখুন..."
                      value={articleForm.contentBn}
                      onChange={(e) => setArticleForm({ ...articleForm, contentBn: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="admin-btn-primary">
                      <Save size={18} />
                      <span>{editingArticle ? 'আপডেট করুন' : 'প্রকাশ করুন'}</span>
                    </button>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setIsCreatingArticle(false)}
                    >
                      বাতিল
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* Articles List Table */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                সকল সংবাদের তালিকা ({articles.length}টি)
              </h2>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    <th style={{ padding: '10px 8px' }}>ছবি</th>
                    <th style={{ padding: '10px 8px' }}>শিরোনাম</th>
                    <th style={{ padding: '10px 8px' }}>ক্যাটাগরি</th>
                    <th style={{ padding: '10px 8px' }}>তারিখ</th>
                    <th style={{ padding: '10px 8px' }}>ভিউ</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((art) => (
                    <tr key={art.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '8px' }}>
                        <img src={art.imageUrl} alt="" style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 3 }} />
                      </td>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{art.titleBn}</td>
                      <td style={{ padding: '8px' }}>
                        <span className="badge-outline">{art.categoryBn || art.category}</span>
                      </td>
                      <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{art.dateBn}</td>
                      <td style={{ padding: '8px', color: 'var(--primary-red)', fontWeight: 700 }}>{art.views || 0}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenEditArticle(art)}
                          style={{ color: '#2563EB', marginRight: 10, padding: 4 }}
                          title="সম্পাদনা"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('আপনি কি এই সংবাদটি মুছে ফেলতে চান?')) {
                              deleteArticle(art.id);
                              triggerSaveToast('সংবাদ ডিলিট করা হয়েছে!');
                            }
                          }}
                          style={{ color: '#DC2626', padding: 4 }}
                          title="মুছে ফেলুন"
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

        {/* TAB 3: CATEGORIES & MEGA MENU MANAGEMENT */}
        {activeTab === 'categories' && (
          <div>
            {/* Top Title & Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800 }}>
                  ক্যাটাগরি ও মেগা মেনু পরিচালনা (Mega Menu Control)
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  সাইটের মূল মেনু বার, মেগা মেনুর ১০টি মাস্টার গ্রুপ, সাব-গ্রুপ এবং সকল বিষয়ের নাম, গ্রুপ ও সাব-গ্রুপ নিয়ন্ত্রণ করুন
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => handleOpenAddCategory()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={17} />
                  <span>+ নতুন ক্যাটাগরি / মেনু আইটেম</span>
                </button>

                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={handleOpenAddMasterGroup}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FolderPlus size={17} />
                  <span>+ নতুন মাস্টার গ্রুপ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('আপনি কি নিশ্চিত যে সকল ক্যাটাগরি ও মেনু বারকে সিস্টেম ডিফল্ট অবস্থায় রিস্টোর করতে চান?')) {
                      resetMasterGroupsToDefault();
                      triggerSaveToast('সিস্টেম ডিফল্ট মেনু রিস্টোর হয়েছে!');
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 4,
                    border: '1px solid #DC2626',
                    color: '#DC2626',
                    backgroundColor: 'transparent',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="ডিফল্ট মেনু রিস্টোর করুন"
                >
                  <RotateCcw size={15} />
                  <span>ডিফল্ট রিস্টোর</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div className="stat-card" style={{ padding: 14 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>মোট মাস্টার গ্রুপ</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-red)' }}>
                    {categoryMasterGroups.length} টি
                  </div>
                </div>
                <Layers size={28} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card" style={{ padding: 14 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>মোট সাব-গ্রুপ</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {categoryMasterGroups.reduce((acc, curr) => acc + (curr.subGroups?.length || 0), 0)} টি
                  </div>
                </div>
                <FolderTree size={28} color="var(--primary-red)" opacity={0.3} />
              </div>

              <div className="stat-card" style={{ padding: 14 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>মোট ক্যাটাগরি / বিষয়</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {categories.length} টি
                  </div>
                </div>
                <Tag size={28} color="var(--primary-red)" opacity={0.3} />
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="admin-card" style={{ marginBottom: 20, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: 14, alignItems: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="ক্যাটাগরি বা বিষয়ের নাম দিয়ে খুঁজুন (বাংলা, English, slug)..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    style={{ paddingLeft: 36 }}
                  />
                  {categorySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCategorySearchQuery('')}
                      style={{ position: 'absolute', right: 10, color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div>
                  <select
                    className="admin-select"
                    value={selectedGroupFilter}
                    onChange={(e) => setSelectedGroupFilter(e.target.value)}
                  >
                    <option value="all">সকল মাস্টার গ্রুপ ({categoryMasterGroups.length}টি)</option>
                    {categoryMasterGroups.map((g, gIdx) => (
                      <option key={g.id} value={g.id}>
                        {gIdx + 1}. {g.nameBn} ({g.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {categorySearchQuery ? 'ফিল্টার করা ফলাফল' : 'লাইভ মেনু প্রিভিউ'}
                </div>
              </div>
            </div>

            {/* Master Groups & Sub-Groups Visual Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {categoryMasterGroups
                .filter((grp) => selectedGroupFilter === 'all' || grp.id === selectedGroupFilter)
                .map((grp, gIdx) => {
                  const grpTotalTopics = grp.subGroups.reduce((acc, curr) => acc + curr.items.length, 0);

                  return (
                    <div
                      key={grp.id}
                      className="admin-card"
                      style={{
                        borderTop: '3px solid var(--primary-red)',
                        backgroundColor: 'var(--bg-card)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                    >
                      {/* Master Group Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid var(--border-color)',
                          paddingBottom: 12,
                          marginBottom: 16,
                          flexWrap: 'wrap',
                          gap: 10
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              backgroundColor: 'rgba(230, 0, 18, 0.1)',
                              color: 'var(--primary-red)',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              padding: '4px 10px',
                              borderRadius: 4
                            }}
                          >
                            গ্রুপ {gIdx + 1}
                          </span>
                          <div>
                            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                              {grp.nameBn}
                            </h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {grp.nameEn} • {grpTotalTopics} টি ক্যাটাগরি বিষয়
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenAddCategory(grp.id)}
                            className="admin-btn-primary"
                            style={{ padding: '5px 10px', fontSize: '0.82rem', gap: 4 }}
                          >
                            <Plus size={14} />
                            <span>+ ক্যাটাগরি যোগ</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenAddSubGroup(grp.id)}
                            className="admin-btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.82rem', gap: 4 }}
                          >
                            <FolderPlus size={14} />
                            <span>+ সাব-গ্রুপ</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditMasterGroup(grp)}
                            style={{
                              color: '#2563EB',
                              padding: 6,
                              borderRadius: 4,
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="গ্রুপ নাম সম্পাদনা"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`আপনি কি "${grp.nameBn}" মাস্টার গ্রুপটি মুছে ফেলতে চান?`)) {
                                deleteMasterGroup(grp.id);
                                triggerSaveToast('মাস্টার গ্রুপ মুছে ফেলা হয়েছে!');
                              }
                            }}
                            style={{
                              color: '#DC2626',
                              padding: 6,
                              borderRadius: 4,
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="গ্রুপ মুছে ফেলুন"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Sub-Groups List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {grp.subGroups.map((sub, sIdx) => {
                          // Filter items by search query if present
                          const q = categorySearchQuery.toLowerCase().trim();
                          const filteredItems = sub.items.filter((it) => {
                            if (!q) return true;
                            return (
                              it.nameBn?.toLowerCase().includes(q) ||
                              it.nameEn?.toLowerCase().includes(q) ||
                              it.id?.toLowerCase().includes(q)
                            );
                          });

                          if (q && filteredItems.length === 0) return null;

                          return (
                            <div
                              key={sIdx}
                              style={{
                                backgroundColor: 'var(--bg-subtle)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 6,
                                padding: 14
                              }}
                            >
                              {/* Sub-Group Header Bar */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderBottom: '1px dashed var(--border-color)',
                                  paddingBottom: 8,
                                  marginBottom: 10
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: 'var(--primary-red)'
                                    }}
                                  ></span>
                                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                                    {sub.titleBn}
                                  </span>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    ({sub.titleEn || sub.titleBn}) • {sub.items.length} টি বিষয়
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddCategory(grp.id, sub.titleBn)}
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      color: 'var(--primary-red)',
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      border: '1px solid rgba(230,0,18,0.3)',
                                      backgroundColor: 'rgba(230,0,18,0.06)'
                                    }}
                                  >
                                    + বিষয় যোগ
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditSubGroup(grp.id, sub)}
                                    style={{ color: '#2563EB', padding: 3 }}
                                    title="সাব-গ্রুপ রিনেম"
                                  >
                                    <Edit size={14} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`আপনি কি "${sub.titleBn}" সাব-গ্রুপটি মুছে ফেলতে চান?`)) {
                                        deleteSubGroup(grp.id, sub.titleBn);
                                        triggerSaveToast('সাব-গ্রুপ মুছে ফেলা হয়েছে!');
                                      }
                                    }}
                                    style={{ color: '#DC2626', padding: 3 }}
                                    title="সাব-গ্রুপ মুছুন"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Category Items Grid */}
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                  gap: 8
                                }}
                              >
                                {filteredItems.map((item) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      backgroundColor: 'var(--bg-surface)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: 4,
                                      padding: '7px 10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 6
                                    }}
                                  >
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                                        {item.nameBn}
                                      </div>
                                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        {item.nameEn} • <code style={{ fontSize: '0.7rem' }}>{item.id}</code>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditCategory(item, grp.id, sub.titleBn)}
                                        style={{ color: '#2563EB', padding: 3 }}
                                        title="সম্পাদনা ও গ্রুপ চেঞ্জ"
                                      >
                                        <Edit size={14} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm(`আপনি কি "${item.nameBn}" ক্যাটাগরি মুছে ফেলতে চান?`)) {
                                            deleteCategoryFromMasterGroup(item.id);
                                            triggerSaveToast('ক্যাটাগরি মুছে ফেলা হয়েছে!');
                                          }
                                        }}
                                        style={{ color: '#DC2626', padding: 3 }}
                                        title="মুছে ফেলুন"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {filteredItems.length === 0 && (
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: 6 }}>
                                    এই সাব-গ্রুপে কোনো বিষয় নেই
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* ========================================================
                MODAL 1: ADD / EDIT CATEGORY ITEM
                ======================================================== */}
            {isCategoryModalOpen && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 99999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16
                }}
                onClick={() => setIsCategoryModalOpen(false)}
              >
                <div
                  className="admin-card"
                  style={{
                    width: 540,
                    maxWidth: '95vw',
                    borderTop: '4px solid var(--primary-red)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                    animation: 'drawerSlideIn 0.22s ease forwards'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                    <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800 }}>
                      {editingCategoryItem ? 'ক্যাটাগরি সম্পাদনা ও গ্রুপ স্থানান্তর' : 'নতুন ক্যাটাগরি / মেনু আইটেম যোগ'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCategoryItem}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div className="admin-form-group">
                        <label className="admin-label">ক্যাটাগরির নাম (বাংলা) *</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="যেমন: পরিবেশ"
                          value={categoryItemForm.nameBn}
                          onChange={(e) => setCategoryItemForm({ ...categoryItemForm, nameBn: e.target.value })}
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">Category Name (English)</label>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="e.g. Environment"
                          value={categoryItemForm.nameEn}
                          onChange={(e) => setCategoryItemForm({ ...categoryItemForm, nameEn: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 14 }}>
                      <label className="admin-label">URL Slug / আইডেন্টিফায়ার (ইংরেজি)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="environment"
                        value={categoryItemForm.slug}
                        onChange={(e) => setCategoryItemForm({ ...categoryItemForm, slug: e.target.value })}
                      />
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        খালি রাখলে ইংরেজি নাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হবে
                      </span>
                    </div>

                    {/* Master Group Selector */}
                    <div className="admin-form-group" style={{ marginBottom: 14 }}>
                      <label className="admin-label">মাস্টার গ্রুপ নির্বাচন করুন *</label>
                      <select
                        className="admin-select"
                        value={categoryItemForm.masterGroupId}
                        onChange={(e) => {
                          const newGroupId = e.target.value;
                          const grpObj = categoryMasterGroups.find((g) => g.id === newGroupId);
                          const firstSub = grpObj?.subGroups[0]?.titleBn || 'সাধারণ';
                          setCategoryItemForm({
                            ...categoryItemForm,
                            masterGroupId: newGroupId,
                            subGroupTitleBn: firstSub
                          });
                        }}
                      >
                        {categoryMasterGroups.map((g, gIdx) => (
                          <option key={g.id} value={g.id}>
                            {gIdx + 1}. {g.nameBn} ({g.nameEn})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub-Group Selector */}
                    <div className="admin-form-group" style={{ marginBottom: 20 }}>
                      <label className="admin-label">সাব-গ্রুপ নির্বাচন করুন *</label>
                      <select
                        className="admin-select"
                        value={categoryItemForm.subGroupTitleBn}
                        onChange={(e) => setCategoryItemForm({ ...categoryItemForm, subGroupTitleBn: e.target.value })}
                      >
                        {(categoryMasterGroups.find((g) => g.id === categoryItemForm.masterGroupId)?.subGroups || []).map((sub, sIdx) => (
                          <option key={sIdx} value={sub.titleBn}>
                            {sub.titleBn} ({sub.titleEn || sub.titleBn})
                          </option>
                        ))}
                        <option value="__custom__">+ নতুন সাব-গ্রুপ তৈরি করুন...</option>
                      </select>

                      {categoryItemForm.subGroupTitleBn === '__custom__' && (
                        <div style={{ marginTop: 10 }}>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="নতুন সাব-গ্রুপের নাম লিখুন (যেমন: আবহাওয়া ও জলবায়ু)"
                            value={categoryItemForm.customSubGroupTitleBn}
                            onChange={(e) => setCategoryItemForm({ ...categoryItemForm, customSubGroupTitleBn: e.target.value })}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => setIsCategoryModalOpen(false)}
                      >
                        বাতিল
                      </button>
                      <button type="submit" className="admin-btn-primary">
                        <Save size={16} />
                        <span>{editingCategoryItem ? 'পরিবর্তন সংরক্ষণ করুন' : 'ক্যাটাগরি যুক্ত করুন'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================
                MODAL 2: ADD / EDIT MASTER GROUP
                ======================================================== */}
            {isGroupModalOpen && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 99999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16
                }}
                onClick={() => setIsGroupModalOpen(false)}
              >
                <div
                  className="admin-card"
                  style={{
                    width: 480,
                    maxWidth: '95vw',
                    borderTop: '4px solid var(--primary-red)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.35)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                    <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800 }}>
                      {editingGroup ? 'মাস্টার গ্রুপের নাম সম্পাদনা' : 'নতুন মাস্টার গ্রুপ তৈরি'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsGroupModalOpen(false)}
                      style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveMasterGroup}>
                    <div className="admin-form-group" style={{ marginBottom: 14 }}>
                      <label className="admin-label">মাস্টার গ্রুপের নাম (বাংলা) *</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="যেমন: প্রযুক্তি ও উদ্ভাবন"
                        value={groupForm.nameBn}
                        onChange={(e) => setGroupForm({ ...groupForm, nameBn: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 20 }}>
                      <label className="admin-label">Master Group Name (English)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. Technology & Innovation"
                        value={groupForm.nameEn}
                        onChange={(e) => setGroupForm({ ...groupForm, nameEn: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => setIsGroupModalOpen(false)}
                      >
                        বাতিল
                      </button>
                      <button type="submit" className="admin-btn-primary">
                        <Save size={16} />
                        <span>{editingGroup ? 'আপডেট করুন' : 'গ্রুপ তৈরি করুন'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================
                MODAL 3: ADD / EDIT SUB-GROUP
                ======================================================== */}
            {isSubGroupModalOpen && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 99999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16
                }}
                onClick={() => setIsSubGroupModalOpen(false)}
              >
                <div
                  className="admin-card"
                  style={{
                    width: 480,
                    maxWidth: '95vw',
                    borderTop: '4px solid var(--primary-red)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.35)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                    <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800 }}>
                      {editingSubGroup ? 'সাব-গ্রুপের শিরোনাম সম্পাদনা' : 'নতুন সাব-গ্রুপ তৈরি'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsSubGroupModalOpen(false)}
                      style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveSubGroup}>
                    <div className="admin-form-group" style={{ marginBottom: 14 }}>
                      <label className="admin-label">সাব-গ্রুপের নাম (বাংলা) *</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="যেমন: অর্থনীতি ও ব্যাংকিং"
                        value={subGroupForm.titleBn}
                        onChange={(e) => setSubGroupForm({ ...subGroupForm, titleBn: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 20 }}>
                      <label className="admin-label">Sub-Group Title (English)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. Economy & Banking"
                        value={subGroupForm.titleEn}
                        onChange={(e) => setSubGroupForm({ ...subGroupForm, titleEn: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => setIsSubGroupModalOpen(false)}
                      >
                        বাতিল
                      </button>
                      <button type="submit" className="admin-btn-primary">
                        <Save size={16} />
                        <span>{editingSubGroup ? 'আপডেট করুন' : 'সাব-গ্রুপ তৈরি করুন'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BREAKING NEWS */}
        {activeTab === 'breaking' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 20 }}>
              ব্রেকিং নিউজ টিকার পরিচালনা
            </h1>

            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                নতুন ব্রেকিং হেডলাইন যোগ করুন
              </h2>
              <form onSubmit={handleAddBreaking} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
                <div>
                  <label className="admin-label">ব্রেকিং টেক্সট (বাংলা) *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="ব্রেকিং নিউজ শিরোনাম লিখুন..."
                    value={newBreakBn}
                    onChange={(e) => setNewBreakBn(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Breaking Text (English)</label>
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
                  <span>যোগ করুন</span>
                </button>
              </form>
            </div>

            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                লাইভ ব্রেকিং আইটেমসমূহ ({breakingNews.length}টি)
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
                      <span style={{ fontWeight: 600 }}>{b.textBn}</span>
                    </div>
                    <button
                      onClick={() => {
                        deleteBreakingItem(b.id);
                        triggerSaveToast('ব্রেকিং নিউজ সরানো হয়েছে!');
                      }}
                      style={{ color: '#DC2626' }}
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
                  🎙️ আমাদের পডকাস্ট ভিডিও পরিচালনা
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  হোমপেজের "Our Podcast" সেকশনের ইউটিউব ভিডিও ও পর্ব নিয়ন্ত্রণ করুন
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
                <span>নতুন পর্ব যুক্ত করুন</span>
              </button>
            </div>

            {/* Podcast Form Modal / Drawer */}
            {isCreatingPodcast && (
              <div className="admin-card" style={{ border: '2px solid var(--primary-red)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem' }}>
                    {editingPodcast ? 'পডকাস্ট পর্ব সম্পাদনা' : 'নতুন পডকাস্ট পর্ব প্রকাশ'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsCreatingPodcast(false);
                      setEditingPodcast(null);
                    }}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ✕ বাতিল
                  </button>
                </div>

                <form onSubmit={handleSavePodcast}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">পর্বের শিরোনাম (বাংলা) *</label>
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
                      <label className="admin-label">Episode Title (English)</label>
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
                      <label className="admin-label">পডকাস্টের বিষয় / বিষয়শ্রেণী (Topic / Subject) *</label>
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
                            {s.icon} {s.nameBn} ({s.nameEn})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">হোস্ট / উপস্থাপক</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={podcastForm.hostBn}
                        onChange={(e) => setPodcastForm({ ...podcastForm, hostBn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">সময়কাল (Duration)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="যেমন: ২৫:৪০"
                        value={podcastForm.duration}
                        onChange={(e) => setPodcastForm({ ...podcastForm, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">YouTube ভিডিও লিঙ্ক বা ID *</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="https://www.youtube.com/watch?v=... বা ভিডিও ID"
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
                      <label className="admin-label">অতিথি (Guest Name - বাংলা)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="যেমন: ড. আতিকুর রহমান (অর্থনীতিবিদ)"
                        value={podcastForm.guestBn}
                        onChange={(e) => setPodcastForm({ ...podcastForm, guestBn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">কাস্টম থাম্বনেইল URL (ঐচ্ছিক)</label>
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
                      বাতিল
                    </button>
                    <button type="submit" className="admin-btn-primary">
                      <Save size={16} />
                      <span>{editingPodcast ? 'আপডেট করুন' : 'প্রকাশ করুন'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Podcasts Table List */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                পডকাস্ট এপিসোড তালিকা ({podcasts.length}টি)
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
                            {pod.subjectBn || 'রাজনীতি ও রাষ্ট্র'}
                          </span>
                          <h4 style={{ fontWeight: 700, fontSize: '0.98rem', margin: 0 }}>{pod.titleBn}</h4>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 12, marginTop: 2 }}>
                          <span>🎙️ {pod.hostBn}</span>
                          {pod.guestBn && <span>👤 অতিথি: {pod.guestBn}</span>}
                          <span>⏱ {pod.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleOpenEditPodcast(pod)}
                        style={{ color: '#2563EB', padding: 6 }}
                        title="সম্পাদনা"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          deletePodcast(pod.id);
                          triggerSaveToast('পডকাস্ট পর্ব মুছে ফেলা হয়েছে!');
                        }}
                        style={{ color: '#DC2626', padding: 6 }}
                        title="মুছে ফেলুন"
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
                  🚨 জাতীয় জরুরি সেবা ও নাগরিক হেল্পলাইন
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  বাংলাদেশ সরকারের জাতীয় হেল্পলাইন ও জরুরি অনলাইন সেবাসমূহ নিয়ন্ত্রণ ও আপডেট করুন
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
                <span>নতুন সেবা যুক্ত করুন</span>
              </button>
            </div>

            {/* Service Form Modal / Card */}
            {isCreatingService && (
              <div className="admin-card" style={{ border: '2px solid var(--primary-red)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem' }}>
                    {editingService ? 'জরুরি সেবা তথ্য সম্পাদনা' : 'নতুন জাতীয় জরুরি সেবা প্রকাশ'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsCreatingService(false);
                      setEditingService(null);
                    }}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ✕ বাতিল
                  </button>
                </div>

                <form onSubmit={handleSaveService}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">সেবার নাম (বাংলা) *</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="যেমন: জাতীয় জরুরি সেবা (৯৯৯)"
                        value={serviceForm.nameBn}
                        onChange={(e) => setServiceForm({ ...serviceForm, nameBn: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Service Name (English)</label>
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
                      <label className="admin-label">হেল্পলাইন নম্বর (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="যেমন: 999 বা 333 বা 16122"
                        value={serviceForm.number}
                        onChange={(e) => setServiceForm({ ...serviceForm, number: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">ক্যাটাগরি (বাংলা)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="যেমন: পুলিশ, ফায়ার ও অ্যাম্বুলেন্স"
                        value={serviceForm.categoryBn}
                        onChange={(e) => setServiceForm({ ...serviceForm, categoryBn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Category (English)</label>
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
                      <label className="admin-label">অফিসিয়াল ওয়েবসাইট / পোর্টাল লিংক</label>
                      <input
                        type="url"
                        className="admin-input"
                        placeholder="https://police.gov.bd"
                        value={serviceForm.websiteUrl}
                        onChange={(e) => setServiceForm({ ...serviceForm, websiteUrl: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">আইকন ধরন (Icon Style)</label>
                      <select
                        className="admin-input"
                        value={serviceForm.icon}
                        onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                      >
                        <option value="phone">📞 ফোন / সার্বিক জরুরি</option>
                        <option value="shield">🛡️ নিরাপত্তা / নারী-শিশু</option>
                        <option value="alert">⚠️ অভিযোগ / দুদক</option>
                        <option value="id">🪪 এনআইডি ও ভোটার</option>
                        <option value="globe">🌐 ভূমি / ডিজিটাল সেবা</option>
                        <option value="cloud">☁️ আবহাওয়া / দুর্যোগ</option>
                        <option value="link">🔗 পাসপোর্ট / অনলাইন লিঙ্ক</option>
                        <option value="gov">🏛️ সরকারি সাধারণ সেবা</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div className="admin-form-group">
                      <label className="admin-label">সংক্ষিপ্ত বিবরণ (বাংলা)</label>
                      <textarea
                        className="admin-input"
                        rows={3}
                        placeholder="এই জরুরি সেবার উদ্দেশ্য ও কী ধরনের সহায়তা পাওয়া যায় লিখুন..."
                        value={serviceForm.descriptionBn}
                        onChange={(e) => setServiceForm({ ...serviceForm, descriptionBn: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Description (English)</label>
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
                      বাতিল
                    </button>
                    <button type="submit" className="admin-btn-primary">
                      <Save size={16} />
                      <span>{editingService ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Emergency Services Table / Cards List */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                বিদ্যমান জরুরি সেবা তালিকা ({emergencyServices.length}টি)
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
                          <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-color)' }}>{srv.nameBn}</h4>
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
                        <span>বিভাগ: {srv.categoryBn || 'জরুরি'}</span>
                        {srv.nameEn && <span> • {srv.nameEn}</span>}
                      </div>

                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '6px 0' }}>
                        {srv.descriptionBn}
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
                        title="সম্পাদনা করুন"
                      >
                        <Edit size={14} />
                        <span>এডিট</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`আপনি কি "${srv.nameBn}" তালিকা থেকে মুছে ফেলতে চান?`)) {
                            deleteEmergencyService(srv.id);
                            triggerSaveToast('জরুরি সেবা তালিকা থেকে মুছে ফেলা হয়েছে!');
                          }
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
                          backgroundColor: '#FEF2F2'
                        }}
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={14} />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GLOBAL SETTINGS (BRANDING, COLORS, FONTS, CONTACT, TERMS) */}
        {activeTab === 'settings' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 20 }}>
              গ্লোবাল সাইট সেটিংস ও ব্র্যান্ডিং
            </h1>

            <form onSubmit={handleSaveSettings}>
              {/* 1. Brand Colors (NO Gradients) */}
              <div className="admin-card">
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                  🎨 সাইটের ব্র্যান্ড কালার (Zero Gradient)
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  <div>
                    <label className="admin-label">Primary Red</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={settingsForm.primaryRed}
                        onChange={(e) => setSettingsForm({ ...settingsForm, primaryRed: e.target.value })}
                        style={{ width: 44, height: 40, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={settingsForm.primaryRed}
                        onChange={(e) => setSettingsForm({ ...settingsForm, primaryRed: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Dark Red</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={settingsForm.darkRed}
                        onChange={(e) => setSettingsForm({ ...settingsForm, darkRed: e.target.value })}
                        style={{ width: 44, height: 40, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={settingsForm.darkRed}
                        onChange={(e) => setSettingsForm({ ...settingsForm, darkRed: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Black Accent</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={settingsForm.black}
                        onChange={(e) => setSettingsForm({ ...settingsForm, black: e.target.value })}
                        style={{ width: 44, height: 40, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={settingsForm.black}
                        onChange={(e) => setSettingsForm({ ...settingsForm, black: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-label">Silver/Gray Border</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={settingsForm.silver}
                        onChange={(e) => setSettingsForm({ ...settingsForm, silver: e.target.value })}
                        style={{ width: 44, height: 40, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={settingsForm.silver}
                        onChange={(e) => setSettingsForm({ ...settingsForm, silver: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Brand Identity & URLs */}
              <div className="admin-card">
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                  📰 পোর্টাল নাম ও তথ্য
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="admin-form-group">
                    <label className="admin-label">ওয়েবসাইট নাম (বাংলা)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settingsForm.siteNameBn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteNameBn: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Website Name (English)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settingsForm.siteNameEn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteNameEn: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">স্লোগান / ট্যাগলাইন (বাংলা)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settingsForm.sloganBn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, sloganBn: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Domain URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settingsForm.websiteUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, websiteUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Founder & Office Contact Info */}
              <div className="admin-card">
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                  🏢 প্রতিষ্ঠাতা ও কার্যালয়ের যোগাযোগ তথ্য
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="admin-form-group">
                    <label className="admin-label">প্রতিষ্ঠাতা / সম্পাদক (বাংলা)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settingsForm.founderBn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, founderBn: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Founder / Editor (English)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settingsForm.founderEn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, founderEn: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">পদবি (Designation)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settingsForm.designationBn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, designationBn: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">মোবাইল ফোন নম্বর</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">অফিসিয়াল ইমেইল</label>
                    <input
                      type="email"
                      className="admin-input"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">ফেসবুক পেজ লিংক</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settingsForm.facebook}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">কার্যালয়ের পূর্ণাঙ্গ ঠিকানা</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  />
                </div>
              </div>

              {/* 4. Terms & Conditions and Policies (from tcpp.txt) */}
              <div className="admin-card">
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                  📜 নীতিমালা ও শর্তাবলী (Terms & Policies)
                </h2>
                <div className="admin-form-group">
                  <label className="admin-label">ব্যবহারের শর্তাবলী (Terms & Conditions)</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={settingsForm.termsAndConditions}
                    onChange={(e) => setSettingsForm({ ...settingsForm, termsAndConditions: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">গোপনীয়তা নীতি (Privacy Policy)</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={settingsForm.privacyPolicy}
                    onChange={(e) => setSettingsForm({ ...settingsForm, privacyPolicy: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">সম্পাদকীয় নীতি (Editorial Policy)</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={settingsForm.editorialPolicy}
                    onChange={(e) => setSettingsForm({ ...settingsForm, editorialPolicy: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="admin-btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                <Save size={18} />
                <span>সব গ্লোবাল সেটিংস সংরক্ষণ করুন</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: ADSENSE & MONETIZATION */}
        {activeTab === 'ads' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 20 }}>
              Google AdSense ও বিজ্ঞাপন কনফিগারেশন
            </h1>

            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem' }}>
                    Google AdSense মাস্টার কন্ট্রোল
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    AdSense অ্যাপ্রুভালের পর যেকোনো স্লটে কোড বসিয়ে স্বয়ংক্রিয় বিজ্ঞাপন প্রদর্শন চালু করুন
                  </p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.adSenseEnabled}
                    onChange={(e) => {
                      updateSiteSettings({ adSenseEnabled: e.target.checked });
                      triggerSaveToast(e.target.checked ? 'AdSense সক্রিয় করা হয়েছে!' : 'AdSense নিষ্ক্রিয় করা হয়েছে');
                    }}
                    style={{ width: 20, height: 20 }}
                  />
                  <span style={{ fontWeight: 700 }}>বিজ্ঞাপন চালু রাখুন</span>
                </label>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Google AdSense Publisher / Client ID</label>
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
                বিজ্ঞাপন স্লটসমূহ (Ad Slots Placement)
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
                            triggerSaveToast();
                          }}
                        />
                        স্লট সক্রিয়
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
              Supabase ডাটাবেজ ও ক্লাউড স্টোরেজ
            </h1>

            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                Supabase Connection Setup
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                প্রজেক্ট রুট ফোল্ডারে থাকা <code>supabase_schema.sql</code> ফাইলটি আপনার Supabase SQL Editor-এ রান করার পর নিচের তথ্যগুলো বসান:
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
                  <span>কানেকশন সেভ করুন</span>
                </button>
              </form>
            </div>

            {/* Backblaze B2 Status */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginBottom: 14 }}>
                Backblaze B2 Cloud Storage Status
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
                ডাটাবেজ ও কনটেন্ট ব্যাকআপ
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                আপনার সমস্ত সংবাদ, সেটিংস ও ক্যাটাগরির ব্যাকআপ এক ক্লিকে ডাউনলোড করুন:
              </p>
              <button onClick={handleExportBackup} className="admin-btn-primary">
                <Download size={18} />
                <span>সম্পূর্ণ ডাটাবেজ ব্যাকআপ ডাউনলোড করুন (.json)</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
