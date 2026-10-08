import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNews } from '../context/NewsContext';
import {
  Image as ImageIcon,
  Download,
  Upload,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  Eye,
  RefreshCw,
  FolderArchive,
  ExternalLink,
  Layers,
  Sparkles,
  Calendar,
  HardDrive,
  FileCheck,
  X,
  Grid,
  List as ListIcon,
  CheckSquare,
  Square,
  FileDown
} from 'lucide-react';
import { uploadImageToStorage } from '../utils/imageUploader';

export default function MediaGalleryManager({ triggerSaveToast }) {
  const {
    adminLanguage,
    language,
    articles,
    showConfirm,
    showSuccess,
    showError
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';

  // Media items state
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all'); // 'all' | 'webp' | 'jpg' | 'png'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modal / Preview
  const [previewItem, setPreviewItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // File Upload input ref
  const fileInputRef = useRef(null);

  // Fetch Media List from API
  const fetchMediaList = async () => {
    setLoading(true);
    const endpoints = [
      '/api/media.php',
      'api/media.php',
      'http://localhost/janogon/api/media.php'
    ];

    let fetched = false;

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const result = await res.json();
          if (result && result.success && Array.isArray(result.data)) {
            setMediaList(result.data);
            fetched = true;
            break;
          }
        }
      } catch (err) {
        // continue
      }
    }

    if (!fetched) {
      setMediaList([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMediaList();
  }, [articles]);

  // Filtered List
  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (item.original_name || '').toLowerCase().includes(q);
        const matchKey = (item.storage_key || '').toLowerCase().includes(q);
        const matchNews = (item.associated_news || '').toLowerCase().includes(q);
        if (!matchName && !matchKey && !matchNews) return false;
      }

      // 2. Format Filter
      if (selectedFormat !== 'all') {
        const fmt = (item.file_format || 'webp').toLowerCase();
        if (fmt !== selectedFormat.toLowerCase()) return false;
      }

      return true;
    });
  }, [mediaList, searchQuery, selectedFormat]);

  // Overall Stats
  const stats = useMemo(() => {
    const totalCount = mediaList.length;
    let totalBytes = 0;
    let webpCount = 0;

    mediaList.forEach((item) => {
      totalBytes += (item.size_bytes || 80000);
      if ((item.file_format || 'webp').toLowerCase() === 'webp') webpCount++;
    });

    const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
    const webpRatio = totalCount > 0 ? Math.round((webpCount / totalCount) * 100) : 100;

    return { totalCount, totalMb, webpRatio };
  }, [mediaList]);

  // Handle Direct Image Upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploadedUrl = await uploadImageToStorage(file);
        if (uploadedUrl) uploadedCount++;
      } catch (err) {
        console.error('Upload error:', err);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (uploadedCount > 0) {
      if (triggerSaveToast) {
        triggerSaveToast(isBn ? `${uploadedCount}টি ছবি সফলভাবে WebP কনভার্ট হয়ে আপলোড হয়েছে!` : `${uploadedCount} images uploaded as WebP!`);
      }
      showSuccess(isBn ? `${uploadedCount}টি ছবি সফলভাবে অপ্টিমাইজড হয়ে ক্লাউড স্টোরেজে আপলোড হয়েছে!` : `${uploadedCount} images uploaded successfully!`);
      fetchMediaList();
    }
  };

  // Copy Link to Clipboard
  const handleCopyLink = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    if (triggerSaveToast) {
      triggerSaveToast(isBn ? 'ছবির CDN লিংক কপি হয়েছে!' : 'CDN Link copied to clipboard!');
    }
    setTimeout(() => setCopiedId(null), 2500);
  };

  // -------------------------------------------------------------
  // ALL IMAGES BULK DOWNLOAD (.ZIP ARCHIVE)
  // -------------------------------------------------------------
  const handleDownloadAllZip = async () => {
    if (mediaList.length === 0) {
      showError(isBn ? 'ডাউনলোড করার মতো কোনো ছবি পাওয়া যায়নি।' : 'No images available to download.');
      return;
    }

    setIsDownloadingZip(true);
    setDownloadProgress(10);

    // 1. Try Server-Side Direct Zip Stream (Fastest & natively creates uploads/ folder hierarchy)
    const serverEndpoints = [
      '/api/media.php?action=download_zip',
      'api/media.php?action=download_zip',
      'http://localhost/janogon/api/media.php?action=download_zip'
    ];

    let serverSuccess = false;
    for (const ep of serverEndpoints) {
      try {
        const checkRes = await fetch(ep, { method: 'HEAD' });
        if (checkRes.ok) {
          // Trigger direct browser download
          const link = document.createElement('a');
          link.href = ep;
          link.setAttribute('download', `jonogon_media_archive_${new Date().toISOString().slice(0, 10)}.zip`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          serverSuccess = true;
          break;
        }
      } catch (err) {
        // continue to client-side fallback
      }
    }

    if (serverSuccess) {
      setIsDownloadingZip(false);
      setDownloadProgress(100);
      if (triggerSaveToast) {
        triggerSaveToast(isBn ? 'সকল ছবির ZIP আর্কাইভ ডাউনলোড শুরু হয়েছে!' : 'Media ZIP archive download started!');
      }
      return;
    }

    // 2. Client-side JSZip Fallback (Packages all images with proper uploads/ paths)
    try {
      let JSZip = window.JSZip;
      if (!JSZip) {
        JSZip = await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          script.onload = () => resolve(window.JSZip);
          script.onerror = () => reject(new Error('Failed to load JSZip'));
          document.head.appendChild(script);
        });
      }

      if (!JSZip) {
        window.open(serverEndpoints[0], '_blank');
        setIsDownloadingZip(false);
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder('uploads');

      let completed = 0;
      const total = mediaList.length;

      for (const item of mediaList) {
        const imgUrl = item.public_url;
        if (!imgUrl) continue;

        try {
          const res = await fetch(imgUrl, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            const filename = (item.storage_key ? item.storage_key.replace(/^uploads[\/\\]/, '') : item.original_name) || `image_${completed}.webp`;
            folder.file(filename, blob);
          }
        } catch (e) {
          // If CORS prevents direct blob, save URL pointer
          folder.file(`links/${item.id}.txt`, `Image URL: ${imgUrl}\r\nStorage Key: ${item.storage_key}\r\n`);
        }

        completed++;
        setDownloadProgress(Math.round((completed / total) * 90) + 10);
      }

      // Add Readme / Archive Details
      zip.file('README_MEDIA_ARCHIVE.txt', `JONOGON NEWS MEDIA ARCHIVE\r\nExported: ${new Date().toLocaleString()}\r\nTotal Assets: ${mediaList.length}\r\nAll assets are stored in standard WebP format.\r\n`);

      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = `jonogon_media_archive_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(blobUrl);

      if (triggerSaveToast) {
        triggerSaveToast(isBn ? 'সকল ছবি সফলভাবে ZIP ফরম্যাটে ডাউনলোড হয়েছে!' : 'All images downloaded as ZIP archive!');
      }
    } catch (zipErr) {
      console.error('ZIP creation error:', zipErr);
      showError(isBn ? 'ZIP ফাইল তৈরিতে সমস্যা হয়েছে।' : 'Failed to generate ZIP file.');
    } finally {
      setIsDownloadingZip(false);
      setDownloadProgress(0);
    }
  };

  // Single Item Delete
  const handleDeleteItem = async (item) => {
    const confirmed = await showConfirm({
      title: isBn ? 'ছবি মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Image',
      message: isBn
        ? `আপনি কি নিশ্চিত যে "${item.original_name}" ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?`
        : `Are you sure you want to remove "${item.original_name}" from gallery?`,
      confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await fetch(`/api/media.php?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      } catch (e) {
        // continue
      }
      setMediaList((prev) => prev.filter((m) => m.id !== item.id));
      if (previewItem && previewItem.id === item.id) setPreviewItem(null);
      if (triggerSaveToast) {
        triggerSaveToast(isBn ? 'ছবিটি সফলভাবে মুছে ফেলা হয়েছে।' : 'Image removed successfully.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* -------------------------------------------------------------
          1. HEADER WITH STATS & ENTERPRISE EXPORT ACTIONS
          ------------------------------------------------------------- */}
      <div
        className="admin-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '20px 24px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(230,0,18,0.04) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 12
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.45rem',
              fontWeight: 800,
              margin: '0 0 6px 0',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <ImageIcon size={26} color="var(--primary-red)" />
            <span>{isBn ? 'মিডিয়া গ্যালারি ও ক্লাউড অ্যাসেট সেন্টার' : 'Media Gallery & Asset Manager'}</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            {isBn
              ? 'নিউজ পোর্টালে ব্যবহৃত সকল অপ্টিমাইজড WebP ছবি পরিচালনা, প্রিভিউ ও সম্পূর্ণ মিডিয়া অফলাইন আর্কাইভ ব্যাকআপ।'
              : 'Manage, optimize, preview, and download complete offline backups of all portal media assets.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.86rem', padding: '9px 16px' }}
          >
            <Upload size={16} color="var(--primary-red)" />
            <span>{isUploading ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'নতুন ছবি আপলোড' : 'Upload Images')}</span>
          </button>

          {/* ALL IMAGES ZIP ARCHIVE DOWNLOAD BUTTON */}
          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleDownloadAllZip}
            disabled={isDownloadingZip || mediaList.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.88rem',
              padding: '9px 18px',
              backgroundColor: '#1E222B',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
            title={isBn ? 'সকল ছবি ফোল্ডার স্ট্রাকচার সহ .ZIP ফরম্যাটে ডাউনলোড করুন' : 'Export and download all images as ZIP archive'}
          >
            <FolderArchive size={17} color="#F59E0B" />
            <span>
              {isDownloadingZip
                ? (isBn ? `আর্কাইভ তৈরি হচ্ছে (${downloadProgress}%)...` : `Archiving (${downloadProgress}%)...`)
                : (isBn ? 'সকল ছবি ব্যাকআপ ডাউনলোড (.ZIP)' : 'Download All Media (.ZIP)')}
            </span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={fetchMediaList}
            disabled={loading}
            style={{ padding: '9px 12px' }}
            title={isBn ? 'তালিকাসমূহ রিফ্রেশ করুন' : 'Refresh List'}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          2. METRIC STATS OVERVIEW CARDS
          ------------------------------------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="admin-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, margin: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(230,0,18,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)' }}>
            <ImageIcon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isBn ? 'সর্বমোট সংরক্ষিত ছবি' : 'Total Media Files'}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.totalCount} {isBn ? 'টি' : 'files'}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, margin: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA' }}>
            <HardDrive size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isBn ? 'ব্যবহৃত স্টোরেজ সাইজ' : 'Estimated Storage Size'}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.totalMb} MB</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, margin: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isBn ? 'WebP অপ্টিমাইজেশন রেট' : 'WebP Compression Rate'}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10B981' }}>{stats.webpRatio}%</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, margin: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{isBn ? 'সক্রিয় ক্লাউড সিডিএন' : 'Active Storage Provider'}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Backblaze B2</div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          3. SEARCH, FORMAT FILTER, & VIEW TOGGLE
          ------------------------------------------------------------- */}
      <div
        className="admin-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 18px',
          margin: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="admin-input"
              style={{ paddingLeft: 32, fontSize: '0.84rem' }}
              placeholder={isBn ? 'ছবির নাম, পাথ বা শিরোনাম দিয়ে খুঁজুন...' : 'Search media by file name or slug...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Format Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              className="admin-select"
              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="all">{isBn ? 'সকল ফরম্যাট' : 'All Formats'}</option>
              <option value="webp">WebP ({isBn ? 'সুপারিশকৃত' : 'Optimized'})</option>
              <option value="jpg">JPG / JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: 'var(--bg-subtle)', padding: 3, borderRadius: 6 }}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '5px 10px',
              borderRadius: 4,
              border: 'none',
              background: viewMode === 'grid' ? 'var(--primary-red)' : 'transparent',
              color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.78rem'
            }}
          >
            <Grid size={14} />
            <span>{isBn ? 'গ্রিড' : 'Grid'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              padding: '5px 10px',
              borderRadius: 4,
              border: 'none',
              background: viewMode === 'list' ? 'var(--primary-red)' : 'transparent',
              color: viewMode === 'list' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.78rem'
            }}
          >
            <ListIcon size={14} />
            <span>{isBn ? 'তালিকা' : 'List'}</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          4. MEDIA ASSETS DISPLAY (GRID / LIST VIEW)
          ------------------------------------------------------------- */}
      {loading ? (
        <div className="admin-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary-red)' }} />
          <div>{isBn ? 'মিডিয়া গ্যালারি লোড হচ্ছে...' : 'Loading media gallery...'}</div>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="admin-card" style={{ padding: 48, textAlign: 'center' }}>
          <ImageIcon size={48} color="var(--text-muted)" opacity={0.4} style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {isBn ? 'কোনো ছবি বা মিডিয়া ফাইল পাওয়া যায়নি' : 'No media assets found'}
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            {searchQuery ? (isBn ? 'সার্চ ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Try adjusting your search criteria.') : (isBn ? 'নতুন ছবি আপলোড করতে উপরের বাটনে ক্লিক করুন।' : 'Upload your first news images to see them here.')}
          </div>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => fileInputRef.current?.click()}
            style={{ fontSize: '0.84rem' }}
          >
            <Upload size={15} />
            <span>{isBn ? 'ছবি আপলোড করুন' : 'Upload Images'}</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16
          }}
        >
          {filteredMedia.map((item) => {
            const isWebp = (item.file_format || 'webp').toLowerCase() === 'webp';
            const sizeKb = Math.round((item.size_bytes || 80000) / 1024);

            return (
              <div
                key={item.id}
                className="admin-card"
                style={{
                  padding: 0,
                  margin: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {/* Image Container with Hover Actions */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '68%',
                    backgroundColor: '#1E222B',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={item.public_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&q=80'}
                    alt={item.original_name || 'Media'}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Format Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: isWebp ? '#10B981' : 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    {item.file_format || 'WEBP'}
                  </span>

                  {/* Action Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      cursor: 'pointer'
                    }}
                    className="gallery-hover-overlay"
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    onClick={() => setPreviewItem(item)}
                  >
                    <button
                      type="button"
                      style={{ width: 32, height: 32, borderRadius: 6, border: 'none', backgroundColor: 'var(--primary-red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title={isBn ? 'বড় করে প্রিভিউ দেখুন' : 'Preview'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }}
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      style={{ width: 32, height: 32, borderRadius: 6, border: 'none', backgroundColor: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title={isBn ? 'সিডিএন লিংক কপি করুন' : 'Copy CDN Link'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(item.public_url, item.id);
                      }}
                    >
                      {copiedId === item.id ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>

                    <a
                      href={item.public_url}
                      download={item.original_name || 'image.webp'}
                      target="_blank"
                      rel="noreferrer"
                      style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                      title={isBn ? 'এই ছবিটি ডাউনলোড করুন' : 'Download This Image'}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={15} />
                    </a>
                  </div>
                </div>

                {/* Card Meta Footer */}
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={item.original_name || item.storage_key}
                  >
                    {item.original_name || item.storage_key}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{sizeKb} KB</span>
                    <span>{item.width && item.height ? `${item.width}x${item.height}` : 'HD'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'ছবি' : 'Thumbnail'}</th>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'ফাইলের নাম ও পাথ' : 'File Name & Storage Path'}</th>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'ফরম্যাট' : 'Format'}</th>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'সাইজ' : 'Size'}</th>
                  <th style={{ padding: '12px 16px' }}>{isBn ? 'প্রোভাইডার' : 'Storage'}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ width: 54, height: 40, borderRadius: 4, overflow: 'hidden', backgroundColor: '#1E222B' }}>
                        <img src={item.public_url} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{item.original_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.storage_key}</div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', padding: '2px 8px', borderRadius: 4, fontSize: '0.74rem', fontWeight: 800 }}>
                        {item.file_format || 'WEBP'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>
                      {Math.round((item.size_bytes || 80000) / 1024)} KB
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Backblaze B2
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          style={{ padding: '5px 8px' }}
                          onClick={() => setPreviewItem(item)}
                          title="Preview"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn-action"
                          style={{ padding: '5px 8px' }}
                          onClick={() => handleCopyLink(item.public_url, item.id)}
                          title="Copy Link"
                        >
                          {copiedId === item.id ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                        </button>
                        <a
                          href={item.public_url}
                          download={item.original_name || 'image.webp'}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn-secondary"
                          style={{ padding: '5px 8px', textDecoration: 'none' }}
                          title="Download"
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          5. IMAGE PREVIEW MODAL
          ------------------------------------------------------------- */}
      {previewItem && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="admin-modal-box"
            style={{
              width: '100%',
              maxWidth: 720,
              backgroundColor: 'var(--bg-card, #1A1D24)',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ImageIcon size={18} color="var(--primary-red)" />
                <span>{previewItem.original_name || 'Image Preview'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image Body */}
            <div style={{ padding: 20, textAlign: 'center', backgroundColor: '#0D1117' }}>
              <img
                src={previewItem.public_url}
                alt={previewItem.original_name}
                style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
              />
            </div>

            {/* Metadata & Actions */}
            <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16, fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>{isBn ? 'স্টোরেজ পাথ:' : 'Storage Path:'}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{previewItem.storage_key || 'uploads/...'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>{isBn ? 'ফরম্যাট ও সাইজ:' : 'Format & Size:'}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{previewItem.file_format?.toUpperCase() || 'WEBP'} • {Math.round((previewItem.size_bytes || 80000) / 1024)} KB</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>{isBn ? 'প্রোভাইডার:' : 'Cloud Storage:'}</span>
                  <strong style={{ color: '#10B981' }}>Backblaze B2 (Bucket: jonogon.news)</strong>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setPreviewItem(null)}
                >
                  <X size={15} />
                  <span>{isBn ? 'বন্ধ করুন' : 'Close'}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className="admin-btn-action"
                    onClick={() => handleCopyLink(previewItem.public_url, previewItem.id)}
                  >
                    {copiedId === previewItem.id ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    <span>{isBn ? 'CDN লিংক কপি করুন' : 'Copy CDN Link'}</span>
                  </button>

                  <a
                    href={previewItem.public_url}
                    download={previewItem.original_name || 'image.webp'}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    <Download size={15} />
                    <span>{isBn ? 'ছবিটি ডাউনলোড করুন' : 'Download Image'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
