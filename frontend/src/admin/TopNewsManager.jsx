import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import {
  Flame,
  Plus,
  Play,
  Edit,
  Trash2,
  Clock,
  ExternalLink,
  X,
  Tag,
  Check,
  AlertCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  Upload,
  RefreshCw,
  Video
} from 'lucide-react';

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&h=1000&fit=crop&q=80';

export default function TopNewsManager({ triggerSaveToast }) {
  const {
    adminTheme,
    theme,
    topNews,
    addTopNews,
    updateTopNews,
    deleteTopNews,
    reorderTopNews,
    refreshTopNews
  } = useNews();

  const isLight = (adminTheme || theme) === 'light';

  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({
    titleBn: '',
    titleEn: '',
    category: 'national',
    categoryBn: 'জাতীয়',
    categoryEn: 'National',
    youtubeUrl: '',
    youtubeId: '',
    videoUrl: '',
    imageUrl: '',
    videoDuration: '০০:৫৮',
    views: 1500,
    rank: 1
  });

  const extractYoutubeId = (url) => {
    if (!url) return '';
    const match = url.match(/(?:shorts\/|youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : '';
  };

  const handleYoutubeUrlChange = (val) => {
    const ytId = extractYoutubeId(val);
    const newThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : formState.imageUrl;
    setFormState((prev) => ({
      ...prev,
      youtubeUrl: val,
      youtubeId: ytId || prev.youtubeId,
      imageUrl: newThumb || prev.imageUrl
    }));
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    const nextRank = (topNews || []).length + 1;
    setFormState({
      titleBn: '',
      titleEn: '',
      category: 'national',
      categoryBn: 'জাতীয়',
      categoryEn: 'National',
      youtubeUrl: '',
      youtubeId: '',
      videoUrl: '',
      imageUrl: '',
      videoDuration: '০০:৫৮',
      views: 1500 + Math.floor(Math.random() * 1000),
      rank: nextRank
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormState({
      titleBn: item.titleBn || '',
      titleEn: item.titleEn || item.titleBn || '',
      category: item.category || 'top-10',
      categoryBn: item.categoryBn || 'শীর্ষ সংবাদ',
      categoryEn: item.categoryEn || 'Top News',
      youtubeUrl: item.youtubeUrl || (item.youtubeId ? `https://www.youtube.com/shorts/${item.youtubeId}` : ''),
      youtubeId: item.youtubeId || extractYoutubeId(item.youtubeUrl || ''),
      videoUrl: item.videoUrl || '',
      imageUrl: item.imageUrl || item.thumbnail || '',
      videoDuration: item.videoDuration || item.duration || '০০:৫৮',
      views: item.views || 1500,
      rank: item.rank || 1
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formState.titleBn.trim() && !formState.titleEn.trim()) {
      alert('Please provide a title in Bengali or English.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        titleBn: formState.titleBn.trim(),
        titleEn: formState.titleEn.trim() || formState.titleBn.trim(),
        category: formState.category,
        categoryBn: formState.categoryBn,
        categoryEn: formState.categoryEn,
        youtubeUrl: formState.youtubeUrl.trim(),
        youtubeId: formState.youtubeId || extractYoutubeId(formState.youtubeUrl),
        videoUrl: formState.videoUrl.trim(),
        imageUrl: formState.imageUrl.trim() || (formState.youtubeId ? `https://img.youtube.com/vi/${formState.youtubeId}/hqdefault.jpg` : FALLBACK_THUMB),
        thumbnail: formState.imageUrl.trim() || (formState.youtubeId ? `https://img.youtube.com/vi/${formState.youtubeId}/hqdefault.jpg` : FALLBACK_THUMB),
        videoDuration: formState.videoDuration || '০০:৫৮',
        duration: formState.videoDuration || '০০:৫৮',
        views: parseInt(formState.views, 10) || 1500,
        rank: parseInt(formState.rank, 10) || 1,
        orderIndex: parseInt(formState.rank, 10) || 1,
        isActive: true
      };

      if (editingItem) {
        await updateTopNews(editingItem.id || editingItem.newsId, payload);
        if (triggerSaveToast) triggerSaveToast('Top 10 News updated successfully in database!');
      } else {
        await addTopNews(payload);
        if (triggerSaveToast) triggerSaveToast('Top 10 News added successfully to database!');
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving top news:', err);
      alert('Failed to save Top 10 News. Please check database connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this item'}" from Top 10 News?`)) {
      return;
    }
    try {
      await deleteTopNews(id);
      if (triggerSaveToast) triggerSaveToast('Top News deleted from database!');
    } catch (err) {
      console.error('Error deleting top news:', err);
    }
  };

  const handleMove = async (index, direction) => {
    const list = [...(topNews || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    await reorderTopNews(list);
    if (triggerSaveToast) triggerSaveToast('Order updated and saved to database!');
  };

  const sortedList = [...(topNews || [])].sort((a, b) => (a.orderIndex || a.rank || 0) - (b.orderIndex || b.rank || 0));

  return (
    <div className="admin-content-section" style={{ padding: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'inline-flex', padding: '8px', backgroundColor: 'var(--primary-red)', color: '#fff', borderRadius: '8px' }}>
              <Flame size={22} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Top 10 News Manager (YouTube Shorts Style)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-light)' }}>
                Manage vertical short-form news videos displayed directly below the Video News section
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => refreshTopNews()}
            title="Refresh from MariaDB database"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <RefreshCw size={16} />
            <span>Sync DB</span>
          </button>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              backgroundColor: 'var(--primary-red)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            <span>Add Top News</span>
          </button>
        </div>
      </div>

      {/* Counter & Info Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          backgroundColor: isLight ? '#F1F5F9' : '#1E293B',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid var(--border-color)',
          fontSize: '0.9rem'
        }}
      >
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
          Total Items: <span style={{ color: 'var(--primary-red)', fontWeight: 800 }}>{sortedList.length}</span> (Top 10 display format)
        </span>
        <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>
          Target Database: <code>`top_news`</code> (MariaDB / MySQL synced)
        </span>
      </div>

      {/* Cards Grid */}
      {sortedList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px dashed var(--border-color)' }}>
          <Flame size={48} color="var(--text-light)" style={{ opacity: 0.5, marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>No Top News Found</h4>
          <p style={{ margin: '0 0 16px 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            Click "Add Top News" or "Sync DB" to populate the Top 10 News stories.
          </p>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleOpenCreate}
            style={{ padding: '8px 16px', backgroundColor: 'var(--primary-red)', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            Create First Top News
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          {sortedList.map((item, idx) => {
            const ytId = item.youtubeId || extractYoutubeId(item.youtubeUrl);
            const thumbUrl = item.imageUrl || item.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : FALLBACK_THUMB);

            return (
              <div
                key={item.id || item.newsId || idx}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  position: 'relative'
                }}
              >
                {/* Vertical Thumbnail with 9:16 Aspect ratio container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '140%', // 9:14 or 9:16 portrait ratio
                    backgroundColor: '#000',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={thumbUrl}
                    alt={item.titleEn || item.titleBn}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_THUMB;
                    }}
                  />

                  {/* Rank Badge #01 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: 'var(--primary-red)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>#{idx + 1}</span>
                  </div>

                  {/* Duration Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Clock size={11} />
                    <span>{item.videoDuration || '00:58'}</span>
                  </div>

                  {/* Play Button Overlay */}
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    title="Play Preview"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(230, 0, 18, 0.9)',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <Play size={20} fill="#fff" style={{ marginLeft: 3 }} />
                  </button>

                  {/* Views Count Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 10,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={11} />
                    <span>{(item.views || 1500).toLocaleString()} views</span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: isLight ? '#F1F5F9' : '#334155',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--primary-red)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {item.categoryEn || item.category || 'Top News'}
                    </span>
                  </div>

                  <h4
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: 'var(--text-main)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                    title={item.titleBn}
                  >
                    {item.titleBn}
                  </h4>

                  {item.titleEn && item.titleEn !== item.titleBn && (
                    <p
                      style={{
                        margin: '0 0 12px 0',
                        fontSize: '0.8rem',
                        color: 'var(--text-light)',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.titleEn}
                    </p>
                  )}

                  {/* Reorder and Action Buttons */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {/* Reorder controls */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        title="Move Up"
                        style={{
                          padding: '5px 8px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: isLight ? '#F8FAFC' : '#1E293B',
                          borderRadius: '4px',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          opacity: idx === 0 ? 0.4 : 1,
                          color: 'var(--text-main)'
                        }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedList.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        title="Move Down"
                        style={{
                          padding: '5px 8px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: isLight ? '#F8FAFC' : '#1E293B',
                          borderRadius: '4px',
                          cursor: idx === sortedList.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: idx === sortedList.length - 1 ? 0.4 : 1,
                          color: 'var(--text-main)'
                        }}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Item"
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#2563EB',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id || item.newsId, item.titleEn || item.titleBn)}
                        title="Delete Item"
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#DC2626',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              width: '100%',
              maxWidth: '640px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} color="var(--primary-red)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {editingItem ? 'Edit Top 10 News' : 'Add New Top 10 News'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Bangla Title */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Headline (Bengali) <span style={{ color: 'var(--primary-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: স্মার্ট জাতীয় পরিচয়পত্র নিয়ে নির্বাচন কমিশনের নতুন নির্দেশনা"
                  value={formState.titleBn}
                  onChange={(e) => setFormState({ ...formState, titleBn: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* English Title */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Headline (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Election Commission announces new Smart NID guidelines"
                  value={formState.titleEn}
                  onChange={(e) => setFormState({ ...formState, titleEn: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* YouTube Shorts / Video URL */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  YouTube Shorts / Video URL <span style={{ color: 'var(--primary-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/shorts/... or https://youtu.be/..."
                  value={formState.youtubeUrl}
                  onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
                <small style={{ color: 'var(--text-light)', marginTop: '4px', display: 'block', fontSize: '0.78rem' }}>
                  Paste any YouTube Shorts link or standard YouTube video link. The thumbnail will auto-extract.
                </small>
              </div>

              {/* Thumbnail URL */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Thumbnail Image URL (9:16 Portrait Recommended)
                </label>
                <input
                  type="text"
                  placeholder="https://... or uploaded image path"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Category & Rank */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const bnMap = {
                        national: 'জাতীয়',
                        sports: 'খেলাধুলা',
                        bangladesh: 'বাংলাদেশ',
                        technology: 'প্রযুক্তি',
                        economy: 'অর্থনীতি',
                        international: 'আন্তর্জাতিক',
                        education: 'শিক্ষা',
                        health: 'স্বাস্থ্য',
                        lifestyle: 'লাইফস্টাইল',
                        entertainment: 'বিনোদন'
                      };
                      setFormState({
                        ...formState,
                        category: cat,
                        categoryBn: bnMap[cat] || 'শীর্ষ সংবাদ',
                        categoryEn: cat.charAt(0).toUpperCase() + cat.slice(1)
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="national">National (জাতীয়)</option>
                    <option value="bangladesh">Bangladesh (বাংলাদেশ)</option>
                    <option value="sports">Sports (খেলাধুলা)</option>
                    <option value="technology">Technology (প্রযুক্তি)</option>
                    <option value="economy">Economy (অর্থনীতি)</option>
                    <option value="international">International (আন্তর্জাতিক)</option>
                    <option value="education">Education (শিক্ষা)</option>
                    <option value="health">Health (স্বাস্থ্য)</option>
                    <option value="entertainment">Entertainment (বিনোদন)</option>
                    <option value="lifestyle">Lifestyle (লাইফস্টাইল)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Rank / Order (1 - 10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formState.rank}
                    onChange={(e) => setFormState({ ...formState, rank: parseInt(e.target.value, 10) || 1 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              {/* Duration & Views */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Video Duration
                  </label>
                  <input
                    type="text"
                    placeholder="00:58"
                    value={formState.videoDuration}
                    onChange={(e) => setFormState({ ...formState, videoDuration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    View Count
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={formState.views}
                    onChange={(e) => setFormState({ ...formState, views: parseInt(e.target.value, 10) || 1500 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--primary-red)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={18} />
                  <span>{isSubmitting ? 'Saving to DB...' : editingItem ? 'Update in DB' : 'Save to DB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
              height: '80vh',
              maxHeight: '660px',
              backgroundColor: '#000',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
              {previewItem.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${previewItem.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={previewItem.titleEn || previewItem.titleBn}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : previewItem.videoUrl ? (
                <video
                  src={previewItem.videoUrl}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img
                    src={previewItem.imageUrl || FALLBACK_THUMB}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', textAlign: 'center', padding: '20px' }}>
                    <p>No valid video stream URL found</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 16px', backgroundColor: '#111', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ backgroundColor: 'var(--primary-red)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                  #{previewItem.rank || 1}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#ccc' }}>
                  {previewItem.categoryEn || previewItem.category}
                </span>
              </div>
              <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                {previewItem.titleBn}
              </h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

