import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import {
  Video,
  Plus,
  Play,
  Edit,
  Trash2,
  Clock,
  ExternalLink,
  X,
  Tag,
  Check,
  AlertCircle
} from 'lucide-react';

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80';

export default function VideoNewsManager({ triggerSaveToast }) {
  const {
    adminLanguage,
    language,
    adminTheme,
    theme,
    videoNews,
    addVideoNews,
    updateVideoNews,
    deleteVideoNews,
    categories
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';
  const isLight = (adminTheme || theme) === 'light';

  const [editingVideo, setEditingVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

  const [videoForm, setVideoForm] = useState({
    titleBn: '',
    titleEn: '',
    category: 'bangladesh',
    categoryBn: 'বাংলাদেশ',
    youtubeUrl: '',
    youtubeId: '',
    imageUrl: '',
    videoDuration: '০:৩২'
  });

  const extractYoutubeId = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : '';
  };

  const handleYoutubeUrlChange = (val) => {
    const ytId = extractYoutubeId(val);
    const newThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : videoForm.imageUrl;
    setVideoForm((prev) => ({
      ...prev,
      youtubeUrl: val,
      youtubeId: ytId || prev.youtubeId,
      imageUrl: newThumb || prev.imageUrl
    }));
  };

  const handleOpenCreate = () => {
    setEditingVideo(null);
    setVideoForm({
      titleBn: '',
      titleEn: '',
      category: 'bangladesh',
      categoryBn: 'বাংলাদেশ',
      youtubeUrl: '',
      youtubeId: '',
      imageUrl: '',
      videoDuration: '১:৩০'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vid) => {
    setEditingVideo(vid);
    setVideoForm({
      titleBn: vid.titleBn || '',
      titleEn: vid.titleEn || vid.titleBn || '',
      category: vid.category || 'bangladesh',
      categoryBn: vid.categoryBn || 'বাংলাদেশ',
      youtubeUrl: vid.youtubeUrl || (vid.youtubeId ? `https://www.youtube.com/watch?v=${vid.youtubeId}` : ''),
      youtubeId: vid.youtubeId || extractYoutubeId(vid.youtubeUrl || ''),
      imageUrl: vid.imageUrl || vid.thumbnail || '',
      videoDuration: vid.videoDuration || '১:৩০'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!videoForm.titleBn.trim()) return;

    let ytId = videoForm.youtubeId || extractYoutubeId(videoForm.youtubeUrl);
    let finalThumb = videoForm.imageUrl;
    if (ytId && (!finalThumb || finalThumb.includes('unsplash.com'))) {
      finalThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    const payload = {
      ...videoForm,
      youtubeId: ytId,
      imageUrl: finalThumb || FALLBACK_THUMB,
      thumbnail: finalThumb || FALLBACK_THUMB
    };

    if (editingVideo) {
      await updateVideoNews(editingVideo.id, payload);
      if (typeof triggerSaveToast === 'function') {
        triggerSaveToast(isBn ? 'ভিডিও সংবাদ সফলভাবে আপডেট হয়েছে!' : 'Video news successfully updated!');
      }
    } else {
      await addVideoNews(payload);
      if (typeof triggerSaveToast === 'function') {
        triggerSaveToast(isBn ? 'নতুন ভিডিও সংবাদ সফলভাবে যুক্ত হয়েছে!' : 'New video news successfully added!');
      }
    }

    setIsModalOpen(false);
    setEditingVideo(null);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      isBn ? 'আপনি কি নিশ্চিত এই ভিডিও সংবাদটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this video news?'
    );
    if (!confirmed) return;

    await deleteVideoNews(id);
    if (typeof triggerSaveToast === 'function') {
      triggerSaveToast(isBn ? 'ভিডিও সংবাদ মুছে ফেলা হয়েছে!' : 'Video news deleted!');
    }
  };

  const getVideoThumbnail = (vid) => {
    if (vid.imageUrl && !vid.imageUrl.includes('unsplash.com')) return vid.imageUrl;
    const ytId = vid.youtubeId || extractYoutubeId(vid.youtubeUrl || '');
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    return vid.imageUrl || vid.thumbnail || FALLBACK_THUMB;
  };

  const getEmbedUrl = (vid) => {
    if (!vid) return '';
    const ytId = vid.youtubeId || extractYoutubeId(vid.youtubeUrl || '');
    return ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0` : '';
  };

  return (
    <div className="admin-video-news-manager">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Video size={26} color="var(--primary-red)" />
            <span>{isBn ? 'ভিডিও সংবাদ ব্যবস্থাপনা' : 'Video News Management'}</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: isLight ? '#64748B' : '#94A3B8' }}>
            {isBn
              ? `মোট ${(videoNews || []).length}টি ভিডিও সংবাদ হোমপেজের ভিডিও সংবাদ সেকশনে প্রদর্শিত হচ্ছে`
              : `${(videoNews || []).length} total video news items displayed on Homepage Video News section`}
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-primary"
          onClick={handleOpenCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--primary-red)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(229, 9, 20, 0.35)'
          }}
        >
          <Plus size={18} />
          <span>{isBn ? 'নতুন ভিডিও যোগ করুন' : 'Add New Video'}</span>
        </button>
      </div>

      {/* Grid of Video Cards (Modeled exactly after Podcasts tab) */}
      {(videoNews || []).length === 0 ? (
        <div
          className="admin-card"
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            borderRadius: 12,
            border: isLight ? '1px dashed #CBD5E1' : '1px dashed rgba(255, 255, 255, 0.15)',
            backgroundColor: isLight ? '#FFFFFF' : '#141824'
          }}
        >
          <Video size={48} style={{ color: 'var(--primary-red)', marginBottom: 14, opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: 6, fontWeight: 800 }}>
            {isBn ? 'কোনো ভিডিও সংবাদ নেই' : 'No video news found'}
          </h3>
          <p style={{ fontSize: '0.86rem', color: isLight ? '#64748B' : '#94A3B8', marginBottom: 18 }}>
            {isBn
              ? 'হোমপেজে প্রদর্শনের জন্য প্রথম ভিডিও সংবাদটি যোগ করতে উপরের বাটনে ক্লিক করুন।'
              : 'Click the button above to add the first video news.'}
          </p>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--primary-red)',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>{isBn ? 'নতুন ভিডিও যোগ করুন' : 'Add New Video'}</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20
          }}
        >
          {(videoNews || []).map((vid) => {
            const thumb = getVideoThumbnail(vid);
            return (
              <div
                key={vid.id}
                className="admin-card"
                style={{
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: isLight ? '#FFFFFF' : '#161B26',
                  border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
              >
                {/* Video Screen Thumbnail with Play Overlay */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 165,
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginBottom: 12,
                    backgroundColor: '#000',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPreviewVideo(vid)}
                  title={isBn ? 'ভিডিও প্লে করুন' : 'Play Video'}
                >
                  <img
                    src={thumb}
                    alt={isBn ? vid.titleBn : vid.titleEn}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_THUMB;
                    }}
                  />

                  {/* Red Center Play Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(229, 9, 20, 0.9)',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                    }}
                  >
                    <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
                  </div>

                  {/* Category Pill Tag */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      color: '#FFF',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.15)'
                    }}
                  >
                    {isBn ? vid.categoryBn || vid.category : vid.category}
                  </span>

                  {/* Duration Tag */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.85)',
                      color: '#FFF',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.72rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 700
                    }}
                  >
                    <Clock size={11} />
                    <span>{vid.videoDuration || '০:৩২'}</span>
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    lineHeight: 1.4,
                    marginBottom: 10,
                    flex: 1,
                    color: isLight ? '#0F172A' : '#FFFFFF'
                  }}
                >
                  {isBn ? vid.titleBn : vid.titleEn || vid.titleBn}
                </h3>

                {/* Footer with Date & Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 10,
                    borderTop: isLight ? '1px solid #F1F5F9' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                    {isBn ? vid.dateBn : vid.dateEn || vid.dateBn}
                  </span>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setPreviewVideo(vid)}
                      title={isBn ? 'প্রিভিউ দেখুন' : 'Watch Preview'}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: 'var(--primary-red)',
                        cursor: 'pointer'
                      }}
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(vid)}
                      title={isBn ? 'সম্পাদনা করুন' : 'Edit Video'}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: isLight ? '#334155' : '#E2E8F0',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vid.id)}
                      title={isBn ? 'মুছে ফেলুন' : 'Delete Video'}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer'
                      }}
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

      {/* POPUP MODAL: ADD / EDIT VIDEO NEWS */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="admin-modal-box"
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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
                  <Video size={20} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {editingVideo
                      ? (isBn ? 'ভিডিও সংবাদ সম্পাদনা' : 'Edit Video News')
                      : (isBn ? 'নতুন ভিডিও সংবাদ যোগ করুন' : 'Add New Video News')}
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                    {isBn
                      ? 'YouTube ভিডিও লিংক দিলে স্বয়ংক্রিয়ভাবে থাম্বনেইল সনাক্ত হবে'
                      : 'Video thumbnail will be auto-detected from YouTube link'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isLight ? '#64748B' : '#94A3B8',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} style={{ overflowY: 'auto', padding: '20px 22px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Bangla Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                    {isBn ? 'ভিডিও শিরোনাম (বাংলা) *' : 'Video Title (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={videoForm.titleBn}
                    onChange={(e) => setVideoForm({ ...videoForm, titleBn: e.target.value })}
                    placeholder={isBn ? 'ভিডিও সংবাদের শিরোনাম লিখুন...' : 'Enter video news headline...'}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 6 }}
                  />
                </div>

                {/* English Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                    {isBn ? 'ভিডিও শিরোনাম (English)' : 'Video Title (English)'}
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={videoForm.titleEn}
                    onChange={(e) => setVideoForm({ ...videoForm, titleEn: e.target.value })}
                    placeholder="English headline for international visitors..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 6 }}
                  />
                </div>

                {/* YouTube Video URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                    {isBn ? 'YouTube ভিডিও লিংক (স্বয়ংক্রিয় থাম্বনেইল সনাক্তকরণ)' : 'YouTube Video Link (Auto-detects Thumbnail)'}
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    value={videoForm.youtubeUrl}
                    onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 6 }}
                  />
                  {videoForm.youtubeId && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: '0.78rem', fontWeight: 700 }}>
                      <Check size={14} />
                      <span>{isBn ? `YouTube Video ID সনাক্ত হয়েছে: ${videoForm.youtubeId}` : `Detected YouTube ID: ${videoForm.youtubeId}`}</span>
                    </div>
                  )}
                </div>

                {/* Category & Duration Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                      {isBn ? 'ক্যাটাগরি / বিভাগ' : 'Category'}
                    </label>
                    <select
                      className="admin-input"
                      value={videoForm.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const found = (categories || []).find((c) => c.slug === val || c.id === val);
                        setVideoForm({
                          ...videoForm,
                          category: val,
                          categoryBn: found ? found.nameBn : val
                        });
                      }}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 6 }}
                    >
                      <option value="bangladesh">{isBn ? 'বাংলাদেশ' : 'Bangladesh'}</option>
                      <option value="international">{isBn ? 'আন্তর্জাতিক' : 'International'}</option>
                      <option value="politics">{isBn ? 'রাজনীতি' : 'Politics'}</option>
                      <option value="economy">{isBn ? 'অর্থনীতি' : 'Economy'}</option>
                      <option value="education">{isBn ? 'শিক্ষা' : 'Education'}</option>
                      <option value="sports">{isBn ? 'খেলাধুলা' : 'Sports'}</option>
                      <option value="technology">{isBn ? 'প্রযুক্তি' : 'Technology'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                      {isBn ? 'ভিডিও ব্যাপ্তি (Duration)' : 'Video Duration'}
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={videoForm.videoDuration}
                      onChange={(e) => setVideoForm({ ...videoForm, videoDuration: e.target.value })}
                      placeholder="e.g. ২:৩০"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 6 }}
                    />
                  </div>
                </div>

                {/* Custom Thumbnail URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                    {isBn ? 'কাস্টম থাম্বনেইল ইমেজ URL (ঐচ্ছিক)' : 'Custom Thumbnail URL (Optional)'}
                  </label>
                  <input
                    type="url"
                    className="admin-input"
                    value={videoForm.imageUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 6 }}
                  />
                  {videoForm.imageUrl && (
                    <div style={{ marginTop: 10 }}>
                      <img
                        src={videoForm.imageUrl}
                        alt="Preview"
                        style={{ width: 140, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 6,
                    backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 22px',
                    borderRadius: 6,
                    backgroundColor: 'var(--primary-red)',
                    color: '#FFF',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isBn ? (editingVideo ? 'সংরক্ষণ করুন' : 'যোগ করুন') : (editingVideo ? 'Save Changes' : 'Add Video')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {previewVideo && (
        <div
          className="admin-modal-overlay"
          onClick={() => setPreviewVideo(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
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
              maxWidth: 820,
              backgroundColor: '#0F172A',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0,0,0,0.4)'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FFF', fontWeight: 800 }}>
                {isBn ? previewVideo.titleBn : (previewVideo.titleEn || previewVideo.titleBn)}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={getEmbedUrl(previewVideo)}
                title={isBn ? previewVideo.titleBn : previewVideo.titleEn}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
