import React, { useState } from 'react';
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
  Download
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
    addCategory,
    updateCategory,
    deleteCategory,
    breakingNews,
    addBreakingItem,
    deleteBreakingItem
  } = useNews();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'articles' | 'categories' | 'breaking' | 'settings' | 'ads' | 'database'
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

  // Category Form State
  const [newCatBn, setNewCatBn] = useState('');
  const [newCatEn, setNewCatEn] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Breaking Form State
  const [newBreakBn, setNewBreakBn] = useState('');
  const [newBreakEn, setNewBreakEn] = useState('');

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

  // Submit Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatBn || !newCatSlug) return;
    addCategory({
      nameBn: newCatBn,
      nameEn: newCatEn || newCatSlug,
      slug: newCatSlug.toLowerCase().replace(/\s+/g, '-')
    });
    setNewCatBn('');
    setNewCatEn('');
    setNewCatSlug('');
    triggerSaveToast('ক্যাটাগরি যোগ হয়েছে!');
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
      articles
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

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 20 }}>
              ক্যাটাগরি পরিচালনা
            </h1>

            {/* Add Category Form */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                নতুন ক্যাটাগরি যোগ করুন
              </h2>
              <form onSubmit={handleAddCategory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
                <div>
                  <label className="admin-label">ক্যাটাগরি নাম (বাংলা) *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="যেমন: পরিবেশ"
                    value={newCatBn}
                    onChange={(e) => setNewCatBn(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Category Name (English)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Environment"
                    value={newCatEn}
                    onChange={(e) => setNewCatEn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-label">Slug (URL identifier)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="environment"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="admin-btn-primary" style={{ height: 42 }}>
                  <Plus size={16} />
                  <span>যোগ করুন</span>
                </button>
              </form>
            </div>

            {/* Existing Categories Table */}
            <div className="admin-card">
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 14 }}>
                বিদ্যমান ক্যাটাগরি তালিকা ({categories.length}টি)
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {categories.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: 12,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{c.nameBn}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.nameEn} ({c.slug})</div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`আপনি কি "${c.nameBn}" ক্যাটাগরি মুছে ফেলতে চান?`)) {
                          deleteCategory(c.id);
                          triggerSaveToast('ক্যাটাগরি ডিলিট হয়েছে!');
                        }
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
