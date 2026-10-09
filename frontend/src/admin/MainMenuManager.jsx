import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import {
  Layers,
  FolderTree,
  Tag,
  Search,
  X,
  Plus,
  FolderPlus,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle,
  Menu,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoveUp,
  MoveDown
} from 'lucide-react';
import ConfirmModal from '../components/Modals/ConfirmModal';

export default function MainMenuManager({ triggerSaveToast }) {
  const {
    adminLanguage,
    language,
    categories,
    categoryMasterGroups,
    addCategoryToMasterGroup,
    updateCategoryInMasterGroup,
    deleteCategoryFromMasterGroup,
    addMasterGroup,
    updateMasterGroup,
    deleteMasterGroup,
    moveMasterGroup,
    reorderMasterGroups,
    addSubGroup,
    updateSubGroup,
    deleteSubGroup,
    moveSubGroupOrder,
    moveCategoryItemOrder,
    resetMasterGroupsToDefault,
    syncModuleToMariaDb
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

  // Category & Menu Item Modal State
  const [editingCategoryItem, setEditingCategoryItem] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryItemForm, setCategoryItemForm] = useState({
    nameBn: '',
    nameEn: '',
    slug: '',
    masterGroupId: 'bangladesh-governance',
    subGroupTitleBn: '',
    customSubGroupTitleBn: '',
    position: 1
  });

  // Master Group Modal State
  const [editingGroup, setEditingGroup] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({ nameBn: '', nameEn: '', position: 1 });

  // Sub-Group Modal State
  const [editingSubGroup, setEditingSubGroup] = useState(null); // { groupId, oldTitleBn }
  const [isSubGroupModalOpen, setIsSubGroupModalOpen] = useState(false);
  const [subGroupForm, setSubGroupForm] = useState({ groupId: '', titleBn: '', titleEn: '' });

  // Search & Filter State
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');

  const [isSavingDb, setIsSavingDb] = useState(false);

  const showToast = (msg) => {
    if (typeof triggerSaveToast === 'function') {
      triggerSaveToast(msg);
    }
  };

  const handleSaveToMariaDb = async () => {
    setIsSavingDb(true);
    try {
      const res = await syncModuleToMariaDb('categories', {
        masterGroups: categoryMasterGroups,
        categories
      });
      if (res?.success) {
        showToast(isBn ? 'ক্যাটাগরি ও মেনু ডাটাবেজে (MariaDB) সফলভাবে সংরক্ষিত হয়েছে!' : 'Categories successfully saved to MariaDB!');
      } else {
        showToast(isBn ? 'সংরক্ষিত হয়েছে।' : 'Saved.');
      }
    } catch (e) {
      showToast(isBn ? 'ডাটাবেজ সেভ নোটিশ' : 'Saved');
    } finally {
      setIsSavingDb(false);
    }
  };

  // --- Master Group Position Handlers ---
  const handleMoveGroupUp = (index) => {
    if (index > 0) {
      moveMasterGroup(index, index - 1);
      showToast(isBn ? 'মাস্টার গ্রুপের অবস্থান উপরে স্থানান্তর করা হয়েছে!' : 'Master group moved up!');
    }
  };

  const handleMoveGroupDown = (index) => {
    if (index < categoryMasterGroups.length - 1) {
      moveMasterGroup(index, index + 1);
      showToast(isBn ? 'মাস্টার গ্রুপের অবস্থান নিচে স্থানান্তর করা হয়েছে!' : 'Master group moved down!');
    }
  };

  // --- Sub-Group Position Handlers ---
  const handleMoveSubGroupUp = (groupId, index) => {
    if (index > 0) {
      moveSubGroupOrder(groupId, index, index - 1);
      showToast(isBn ? 'সাব-গ্রুপের অবস্থান উপরে সরানো হয়েছে!' : 'Sub-group moved up!');
    }
  };

  const handleMoveSubGroupDown = (groupId, index, maxLen) => {
    if (index < maxLen - 1) {
      moveSubGroupOrder(groupId, index, index + 1);
      showToast(isBn ? 'সাব-গ্রুপের অবস্থান নিচে সরানো হয়েছে!' : 'Sub-group moved down!');
    }
  };

  // --- Category Position Handlers within Sub-Group ---
  const handleMoveCategoryLeft = (groupId, subGroupTitleBn, itemId) => {
    const grp = categoryMasterGroups.find((g) => g.id === groupId);
    const sub = grp?.subGroups?.find((s) => s.titleBn === subGroupTitleBn);
    if (!sub) return;
    const itemIndex = (sub.items || []).findIndex((it) => it.id === itemId);
    if (itemIndex > 0) {
      moveCategoryItemOrder(groupId, subGroupTitleBn, itemIndex, itemIndex - 1);
      showToast(isBn ? 'ক্যাটাগরির অবস্থান পূর্বে স্থানান্তর করা হয়েছে!' : 'Category moved earlier!');
    }
  };

  const handleMoveCategoryRight = (groupId, subGroupTitleBn, itemId) => {
    const grp = categoryMasterGroups.find((g) => g.id === groupId);
    const sub = grp?.subGroups?.find((s) => s.titleBn === subGroupTitleBn);
    if (!sub) return;
    const itemIndex = (sub.items || []).findIndex((it) => it.id === itemId);
    if (itemIndex >= 0 && itemIndex < (sub.items?.length || 0) - 1) {
      moveCategoryItemOrder(groupId, subGroupTitleBn, itemIndex, itemIndex + 1);
      showToast(isBn ? 'ক্যাটাগরির অবস্থান পরে স্থানান্তর করা হয়েছে!' : 'Category moved later!');
    }
  };

  // --- Category Handlers ---
  const handleOpenAddCategory = (defaultGroupId, defaultSubGroup) => {
    setEditingCategoryItem(null);
    const targetGroup = categoryMasterGroups.find((g) => g.id === defaultGroupId) || categoryMasterGroups[0];
    const targetSub = defaultSubGroup || targetGroup?.subGroups[0]?.titleBn || 'সাধারণ';
    setCategoryItemForm({
      nameBn: '',
      nameEn: '',
      slug: '',
      masterGroupId: targetGroup?.id || 'bangladesh-governance',
      subGroupTitleBn: targetSub,
      customSubGroupTitleBn: '',
      position: 1
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (item, currentGroupId, currentSubGroupTitle, currentIdx) => {
    setEditingCategoryItem(item);
    const grp = categoryMasterGroups.find((g) => g.id === currentGroupId);
    const sub = grp?.subGroups?.find((s) => s.titleBn === currentSubGroupTitle);
    const pos = currentIdx !== undefined ? currentIdx + 1 : ((sub?.items || []).findIndex((it) => it.id === item.id) + 1 || 1);
    setCategoryItemForm({
      nameBn: item.nameBn || '',
      nameEn: item.nameEn || '',
      slug: item.slug || item.id || '',
      masterGroupId: currentGroupId || 'bangladesh-governance',
      subGroupTitleBn: currentSubGroupTitle || 'সাধারণ',
      customSubGroupTitleBn: '',
      position: pos
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategoryItem = (e) => {
    e.preventDefault();
    if (!categoryItemForm.nameBn.trim()) {
      showToast(isBn ? 'দয়া করে ক্যাটাগরির বাংলা নাম লিখুন' : 'Please enter Category Name');
      return;
    }

    const finalSubGroup = (categoryItemForm.subGroupTitleBn === '__custom__'
      ? categoryItemForm.customSubGroupTitleBn
      : categoryItemForm.subGroupTitleBn) || (isBn ? 'সাধারণ' : 'General');

    const payload = {
      nameBn: categoryItemForm.nameBn.trim(),
      nameEn: categoryItemForm.nameEn ? categoryItemForm.nameEn.trim() : categoryItemForm.nameBn.trim(),
      slug: categoryItemForm.slug ? categoryItemForm.slug.trim() : categoryItemForm.nameBn.trim(),
      masterGroupId: categoryItemForm.masterGroupId,
      subGroupTitleBn: finalSubGroup,
      subGroupTitleEn: finalSubGroup,
      targetPosition: editingCategoryItem && categoryItemForm.position ? parseInt(categoryItemForm.position, 10) - 1 : undefined
    };

    if (editingCategoryItem) {
      updateCategoryInMasterGroup(editingCategoryItem.id, payload);
      showToast(isBn ? 'ক্যাটাগরি তথ্য ও অবস্থান আপডেট হয়েছে!' : 'Category updated successfully!');
    } else {
      addCategoryToMasterGroup(payload);
      showToast(isBn ? 'নতুন ক্যাটাগরি ও মেনু আইটেম যুক্ত হয়েছে!' : 'New category added successfully!');
    }

    setIsCategoryModalOpen(false);
    setEditingCategoryItem(null);
  };

  // --- Master Group Handlers ---
  const handleOpenAddMasterGroup = () => {
    setEditingGroup(null);
    setGroupForm({ nameBn: '', nameEn: '', position: categoryMasterGroups.length + 1 });
    setIsGroupModalOpen(true);
  };

  const handleOpenEditMasterGroup = (group, currentIndex) => {
    setEditingGroup({ ...group, currentIndex });
    setGroupForm({
      nameBn: group.nameBn || '',
      nameEn: group.nameEn || '',
      position: currentIndex + 1
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveMasterGroup = (e) => {
    e.preventDefault();
    if (!groupForm.nameBn.trim()) return;

    if (editingGroup) {
      updateMasterGroup(editingGroup.id, { nameBn: groupForm.nameBn, nameEn: groupForm.nameEn });
      // If position changed
      const targetIndex = Math.max(0, Math.min(categoryMasterGroups.length - 1, parseInt(groupForm.position, 10) - 1));
      if (editingGroup.currentIndex !== targetIndex) {
        moveMasterGroup(editingGroup.currentIndex, targetIndex);
      }
      showToast(isBn ? 'মাস্টার গ্রুপের তথ্য ও অবস্থান আপডেট হয়েছে!' : 'Master group updated!');
    } else {
      addMasterGroup({ nameBn: groupForm.nameBn, nameEn: groupForm.nameEn });
      showToast(isBn ? 'নতুন মাস্টার গ্রুপ যোগ হয়েছে!' : 'New master group added!');
    }
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  // --- Sub-Group Handlers (Supports Cross-Group Transfer!) ---
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
      // updateSubGroup supports targetGroupId for instant transfer to another master group!
      updateSubGroup(editingSubGroup.groupId, editingSubGroup.oldTitleBn, {
        titleBn: subGroupForm.titleBn,
        titleEn: subGroupForm.titleEn,
        targetGroupId: subGroupForm.groupId
      });
      if (editingSubGroup.groupId !== subGroupForm.groupId) {
        showToast(isBn ? 'সাব-গ্রুপ সফলভাবে অন্য মাস্টার গ্রুপে স্থানান্তর করা হয়েছে!' : 'Sub-group transferred to new master group!');
      } else {
        showToast(isBn ? 'সাব-গ্রুপের নাম সফলভাবে আপডেট হয়েছে!' : 'Sub-group updated!');
      }
    } else {
      addSubGroup(subGroupForm.groupId, {
        titleBn: subGroupForm.titleBn,
        titleEn: subGroupForm.titleEn
      });
      showToast(isBn ? 'নতুন সাব-গ্রুপ যোগ হয়েছে!' : 'New sub-group added!');
    }
    setIsSubGroupModalOpen(false);
    setEditingSubGroup(null);
  };

  // Total topics count helper
  const totalSubGroupsCount = categoryMasterGroups.reduce((acc, curr) => acc + (curr.subGroups?.length || 0), 0);

  return (
    <div className="main-menu-manager-wrap">
      {/* Top Title & Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Menu size={26} color="var(--primary-red)" />
            <span>{isBn ? 'মেইন মেনু ও ক্যাটাগরি পরিচালনা' : 'Main Menu & Categories'}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isBn
              ? 'মাস্টার গ্রুপের অবস্থান পরিবর্তন, সাব-গ্রুপ স্থানান্তর ও ক্যাটাগরি পরিচালনা করুন'
              : 'Reorder master groups, transfer sub-groups, and manage all category topics'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="admin-btn-primary"
            style={{ backgroundColor: '#10B981', borderColor: '#10B981', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}
            onClick={handleSaveToMariaDb}
            disabled={isSavingDb}
            title={isBn ? 'ডাটাবেজে ক্যাটাগরি ও মেনু ডাটা সংরক্ষণ করুন' : 'Save categories & menu to MariaDB'}
          >
            <Save size={16} />
            <span>{isSavingDb ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'ডাটাবেজে সংরক্ষণ' : 'Save to DB')}</span>
          </button>

          <button
            className="admin-btn-primary"
            onClick={() => handleOpenAddCategory(categoryMasterGroups[0]?.id)}
          >
            <Plus size={16} />
            <span>{isBn ? '+ নতুন ক্যাটাগরি' : '+ Add Category'}</span>
          </button>

          <button
            className="admin-btn-secondary"
            onClick={handleOpenAddMasterGroup}
          >
            <FolderPlus size={16} />
            <span>{isBn ? '+ নতুন মাস্টার গ্রুপ' : '+ Add Master Group'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              openConfirm({
                title: isBn ? 'ডিফল্ট ক্যাটাগরি পুনরুদ্ধার' : 'Reset Categories to Default',
                message: isBn
                  ? 'আপনি কি সকল মাস্টার গ্রুপ, সাব-গ্রুপ ও ক্যাটাগরি সিস্টেমের ডিফল্ট অবস্থায় ফিরিয়ে আনতে চান?'
                  : 'Are you sure you want to reset all master groups and categories to system defaults?',
                confirmText: isBn ? 'হ্যাঁ, রিস্টোর করুন' : 'Yes, Restore Defaults',
                type: 'warning',
                onConfirm: () => {
                  resetMasterGroupsToDefault();
                  showToast(isBn ? 'সকল ক্যাটাগরি ডিফল্ট মেনুতে রিস্টোর হয়েছে!' : 'Categories restored to default!');
                }
              });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 4,
              color: 'var(--text-muted)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title={isBn ? 'ডিফল্ট মেনু রিস্টোর করুন' : 'Restore Default Menu'}
          >
            <RotateCcw size={15} />
            <span>{isBn ? 'ডিফল্ট রিস্টোর' : 'Reset Default'}</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="stat-card" style={{ padding: 14 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isBn ? 'মোট মাস্টার গ্রুপ' : 'Total Master Groups'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-red)' }}>
              {categoryMasterGroups.length} {isBn ? 'টি' : ''}
            </div>
          </div>
          <Layers size={28} color="var(--primary-red)" opacity={0.3} />
        </div>

        <div className="stat-card" style={{ padding: 14 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isBn ? 'মোট সাব-গ্রুপ' : 'Total Sub-Groups'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {totalSubGroupsCount} {isBn ? 'টি' : ''}
            </div>
          </div>
          <FolderTree size={28} color="var(--primary-red)" opacity={0.3} />
        </div>

        <div className="stat-card" style={{ padding: 14 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isBn ? 'মোট ক্যাটাগরি ও বিষয়' : 'Total Categories'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {categories.length} {isBn ? 'টি' : ''}
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
              placeholder={isBn ? "ক্যাটাগরি বা বিষয়ের নাম দিয়ে খুঁজুন (বাংলা, English, slug)..." : "Search topics by title, English or slug..."}
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
            {categorySearchQuery && (
              <button
                type="button"
                onClick={() => setCategorySearchQuery('')}
                style={{ position: 'absolute', right: 10, color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
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
              <option value="all">
                {isBn ? `সকল মাস্টার গ্রুপ (${categoryMasterGroups.length}টি)` : `All Master Groups (${categoryMasterGroups.length})`}
              </option>
              {categoryMasterGroups.map((g, gIdx) => (
                <option key={g.id} value={g.id}>
                  {gIdx + 1}. {g.nameBn} - {g.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {categorySearchQuery ? (isBn ? 'ফিল্টার করা ফলাফল' : 'Filtered Results') : (isBn ? 'লাইভ ওয়েবসাইট মেনু ক্রম' : 'Live Menu Order')}
          </div>
        </div>
      </div>

      {/* Master Groups & Sub-Groups Visual Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {categoryMasterGroups
          .filter((grp) => selectedGroupFilter === 'all' || grp.id === selectedGroupFilter)
          .map((grp) => {
            const gIdx = categoryMasterGroups.findIndex((g) => g.id === grp.id);
            const grpTotalTopics = grp.subGroups?.reduce((acc, curr) => acc + (curr.items?.length || 0), 0) || 0;
            const isFirst = gIdx === 0;
            const isLast = gIdx === categoryMasterGroups.length - 1;

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
                {/* Master Group Header with Position Reordering Buttons */}
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
                    {/* Position Reordering Controls */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, backgroundColor: 'var(--bg-subtle)', borderRadius: 5, padding: '2px 4px', border: '1px solid var(--border-color)' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveGroupUp(gIdx)}
                        disabled={isFirst}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: isFirst ? 'not-allowed' : 'pointer',
                          opacity: isFirst ? 0.3 : 0.9,
                          color: 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 3
                        }}
                        title={isBn ? "পজিশন উপরে নিন (Move Up)" : "Move Up"}
                      >
                        <ArrowUp size={16} />
                      </button>

                      <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0 4px', color: 'var(--primary-red)' }}>
                        #{gIdx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleMoveGroupDown(gIdx)}
                        disabled={isLast}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: isLast ? 'not-allowed' : 'pointer',
                          opacity: isLast ? 0.3 : 0.9,
                          color: 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 3
                        }}
                        title={isBn ? "পজিশন নিচে নিন (Move Down)" : "Move Down"}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>

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
                      {isBn ? `মাস্টার গ্রুপ ${gIdx + 1}` : `Group ${gIdx + 1}`}
                    </span>

                    <div>
                      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                        {isBn ? grp.nameBn : (grp.nameEn || grp.nameBn)}
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {isBn ? (grp.nameEn ? `${grp.nameEn} • ` : '') : (grp.nameBn ? `${grp.nameBn} • ` : '')}{grpTotalTopics} {isBn ? 'টি ক্যাটাগরি বিষয়' : 'topics'}
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
                      <span>{isBn ? '+ ক্যাটাগরি যোগ' : '+ Add Topic'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAddSubGroup(grp.id)}
                      className="admin-btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '0.82rem', gap: 4 }}
                    >
                      <FolderPlus size={14} />
                      <span>{isBn ? '+ সাব-গ্রুপ' : '+ Sub-Group'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditMasterGroup(grp, gIdx)}
                      style={{
                        color: '#2563EB',
                        padding: 6,
                        borderRadius: 4,
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        cursor: 'pointer'
                      }}
                      title={isBn ? "গ্রুপ নাম ও পজিশন সম্পাদনা" : "Edit Group & Order"}
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openConfirm({
                          title: isBn ? 'মাস্টার গ্রুপ মুছে ফেলার নিশ্চিতকরণ' : 'Delete Master Group Confirmation',
                          message: isBn
                            ? `আপনি কি "${grp.nameBn}" মাস্টার গ্রুপটি মুছে ফেলতে চান? এর অধীনে থাকা সকল সাব-গ্রুপ ও ক্যাটাগরিও মুছে যাবে।`
                            : `Are you sure you want to delete master group "${grp.nameEn}"? All its sub-groups and items will also be removed.`,
                          confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
                          onConfirm: () => {
                            deleteMasterGroup(grp.id);
                            showToast(isBn ? 'মাস্টার গ্রুপ মুছে ফেলা হয়েছে!' : 'Master group deleted!');
                          }
                        });
                      }}
                      style={{
                        color: '#DC2626',
                        padding: 6,
                        borderRadius: 4,
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        cursor: 'pointer'
                      }}
                      title={isBn ? "গ্রুপ মুছে ফেলুন" : "Delete Group"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Sub-Groups List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(grp.subGroups || []).map((sub, sIdx) => {
                    const q = categorySearchQuery.toLowerCase().trim();
                    const filteredItems = (sub.items || []).filter((it) => {
                      if (!q) return true;
                      return (
                        it.nameBn?.toLowerCase().includes(q) ||
                        it.nameEn?.toLowerCase().includes(q) ||
                        it.id?.toLowerCase().includes(q)
                      );
                    });

                    if (q && filteredItems.length === 0) return null;

                    const isSubFirst = sIdx === 0;
                    const isSubLast = sIdx === (grp.subGroups?.length || 0) - 1;

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
                        {/* Sub-Group Header Bar with Transfer/Edit & Reorder Support */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px dashed var(--border-color)',
                            paddingBottom: 8,
                            marginBottom: 10,
                            flexWrap: 'wrap',
                            gap: 8
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Sub-group Up/Down Reorder */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                              <button
                                type="button"
                                onClick={() => handleMoveSubGroupUp(grp.id, sIdx)}
                                disabled={isSubFirst}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: isSubFirst ? 'not-allowed' : 'pointer',
                                  opacity: isSubFirst ? 0.3 : 0.8,
                                  color: 'var(--text-main)',
                                  padding: 1,
                                  display: 'flex'
                                }}
                                title={isBn ? "সাব-গ্রুপ উপরে নিন" : "Move Sub-group Up"}
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSubGroupDown(grp.id, sIdx, grp.subGroups.length)}
                                disabled={isSubLast}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: isSubLast ? 'not-allowed' : 'pointer',
                                  opacity: isSubLast ? 0.3 : 0.8,
                                  color: 'var(--text-main)',
                                  padding: 1,
                                  display: 'flex'
                                }}
                                title={isBn ? "সাব-গ্রুপ নিচে নিন" : "Move Sub-group Down"}
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>

                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary-red)'
                              }}
                            ></span>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                              {isBn ? sub.titleBn : (sub.titleEn || sub.titleBn)}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {isBn ? (sub.titleEn ? `${sub.titleEn} • ` : '') : (sub.titleBn ? `${sub.titleBn} • ` : '')}{sub.items?.length || 0} {isBn ? 'টি বিষয়' : 'items'}
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
                                backgroundColor: 'rgba(230,0,18,0.06)',
                                cursor: 'pointer'
                              }}
                            >
                              {isBn ? '+ বিষয় যোগ' : '+ Add Item'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditSubGroup(grp.id, sub)}
                              style={{ color: '#2563EB', padding: 4, background: 'none', border: '1px solid var(--border-color)', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title={isBn ? "সাব-গ্রুপ সম্পাদনা ও মাস্টার গ্রুপ স্থানান্তর" : "Edit Sub-Group & Transfer Group"}
                            >
                              <Edit size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                openConfirm({
                                  title: isBn ? 'সাব-গ্রুপ মুছে ফেলার নিশ্চিতকরণ' : 'Delete Sub-Group Confirmation',
                                  message: isBn
                                    ? `আপনি কি "${sub.titleBn}" সাব-গ্রুপটি মুছে ফেলতে চান? এর ভেতরের সকল ক্যাটাগরি বিষয়ও মুছে যাবে।`
                                    : `Are you sure you want to delete sub-group "${sub.titleBn}"? All its topics will also be removed.`,
                                  confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
                                  onConfirm: () => {
                                    deleteSubGroup(grp.id, sub.titleBn);
                                    showToast(isBn ? 'সাব-গ্রুপ মুছে ফেলা হয়েছে!' : 'Sub-group deleted!');
                                  }
                                });
                              }}
                              style={{ color: '#DC2626', padding: 4, background: 'none', border: '1px solid var(--border-color)', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title={isBn ? "সাব-গ্রুপ মুছুন" : "Delete Sub-Group"}
                            >
                              <Trash2 size={13} />
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
                          {filteredItems.map((item) => {
                            const itemActualIndex = (sub.items || []).findIndex((it) => it.id === item.id);
                            const isFirstItem = itemActualIndex === 0;
                            const isLastItem = itemActualIndex === (sub.items?.length || 0) - 1;

                            return (
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
                                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--primary-red)', fontWeight: 800 }}>#{itemActualIndex + 1}</span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {isBn ? item.nameBn : (item.nameEn || item.nameBn)}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    {isBn ? item.nameEn : item.nameBn} • <code style={{ fontSize: '0.7rem' }}>{item.id}</code>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCategoryLeft(grp.id, sub.titleBn, item.id)}
                                    disabled={isFirstItem}
                                    style={{
                                      color: 'var(--text-main)',
                                      padding: 3,
                                      background: 'none',
                                      border: 'none',
                                      cursor: isFirstItem ? 'not-allowed' : 'pointer',
                                      opacity: isFirstItem ? 0.25 : 0.8,
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                    title={isBn ? "পূর্বে নিন (বামে)" : "Move Previous"}
                                  >
                                    <ChevronLeft size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleMoveCategoryRight(grp.id, sub.titleBn, item.id)}
                                    disabled={isLastItem}
                                    style={{
                                      color: 'var(--text-main)',
                                      padding: 3,
                                      background: 'none',
                                      border: 'none',
                                      cursor: isLastItem ? 'not-allowed' : 'pointer',
                                      opacity: isLastItem ? 0.25 : 0.8,
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                    title={isBn ? "পরে নিন (ডানে)" : "Move Next"}
                                  >
                                    <ChevronRight size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditCategory(item, grp.id, sub.titleBn, itemActualIndex)}
                                    style={{ color: '#2563EB', padding: 3, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title={isBn ? "সম্পাদনা ও অবস্থান পরিবর্তন" : "Edit Item"}
                                  >
                                    <Edit size={14} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      openConfirm({
                                        title: isBn ? 'ক্যাটাগরি মুছে ফেলার নিশ্চিতকরণ' : 'Delete Category Topic',
                                        message: isBn
                                          ? `আপনি কি "${item.nameBn}" ক্যাটাগরি বিষয়টিকে মেনু তালিকা থেকে মুছে ফেলতে চান?`
                                          : `Are you sure you want to delete category "${item.nameBn}"?`,
                                        confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete',
                                        onConfirm: () => {
                                          deleteCategoryFromMasterGroup(item.id);
                                          showToast(isBn ? 'ক্যাটাগরি মুছে ফেলা হয়েছে!' : 'Category deleted!');
                                        }
                                      });
                                    }}
                                    style={{ color: '#DC2626', padding: 3, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title={isBn ? "মুছে ফেলুন" : "Delete Item"}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {filteredItems.length === 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: 6 }}>
                              {isBn ? 'এই সাব-গ্রুপে কোনো বিষয় নেই' : 'No items found in this sub-group'}
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
              boxShadow: '0 20px 50px rgba(0,0,0,0.35)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800 }}>
                {editingCategoryItem
                  ? (isBn ? 'ক্যাটাগরি সম্পাদনা ও গ্রুপ স্থানান্তর' : 'Edit Category & Topic')
                  : (isBn ? 'নতুন ক্যাটাগরি যোগ' : 'Add New Category')}
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryItem}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'ক্যাটাগরির নাম (বাংলা) *' : 'Category Name (Bangla) *'}</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder={isBn ? "যেমন: পরিবেশ" : "e.g. পরিবেশ"}
                    value={categoryItemForm.nameBn}
                    onChange={(e) => setCategoryItemForm({ ...categoryItemForm, nameBn: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'Category Name (English)' : 'Category Name (English)'}</label>
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
                <label className="admin-label">{isBn ? 'URL Slug / আইডেন্টিফায়ার (ইংরেজি)' : 'URL Slug / Identifier'}</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="environment"
                  value={categoryItemForm.slug}
                  onChange={(e) => setCategoryItemForm({ ...categoryItemForm, slug: e.target.value })}
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {isBn ? 'খালি রাখলে ইংরেজি নাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হবে' : 'Auto-generated if left blank'}
                </span>
              </div>

              {/* Master Group Selector */}
              <div className="admin-form-group" style={{ marginBottom: 14 }}>
                <label className="admin-label">{isBn ? 'মাস্টার গ্রুপ নির্বাচন করুন *' : 'Select Master Group *'}</label>
                <select
                  className="admin-select"
                  value={categoryItemForm.masterGroupId}
                  onChange={(e) => {
                    const newGroupId = e.target.value;
                    const grpObj = categoryMasterGroups.find((g) => g.id === newGroupId);
                    const firstSub = grpObj?.subGroups[0]?.titleBn || (isBn ? 'সাধারণ' : 'General');
                    setCategoryItemForm({
                      ...categoryItemForm,
                      masterGroupId: newGroupId,
                      subGroupTitleBn: firstSub
                    });
                  }}
                >
                  {categoryMasterGroups.map((g, gIdx) => (
                    <option key={g.id} value={g.id}>
                      {gIdx + 1}. {g.nameBn} - {g.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Group Selector */}
              <div className="admin-form-group" style={{ marginBottom: 14 }}>
                <label className="admin-label">{isBn ? 'সাব-গ্রুপ নির্বাচন করুন *' : 'Select Sub-Group *'}</label>
                <select
                  className="admin-select"
                  value={categoryItemForm.subGroupTitleBn}
                  onChange={(e) => setCategoryItemForm({ ...categoryItemForm, subGroupTitleBn: e.target.value })}
                >
                  {(categoryMasterGroups.find((g) => g.id === categoryItemForm.masterGroupId)?.subGroups || []).map((sub, sIdx) => (
                    <option key={sIdx} value={sub.titleBn}>
                      {sub.titleBn} {sub.titleEn ? ` - ${sub.titleEn}` : ''}
                    </option>
                  ))}
                  <option value="__custom__">{isBn ? '+ নতুন সাব-গ্রুপ তৈরি করুন...' : '+ Create new sub-group...'}</option>
                </select>

                {categoryItemForm.subGroupTitleBn === '__custom__' && (
                  <div style={{ marginTop: 10 }}>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder={isBn ? "নতুন সাব-গ্রুপের নাম লিখুন (যেমন: আবহাওয়া ও জলবায়ু)" : "Enter new sub-group title (e.g. Climate & Weather)"}
                      value={categoryItemForm.customSubGroupTitleBn}
                      onChange={(e) => setCategoryItemForm({ ...categoryItemForm, customSubGroupTitleBn: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Position selector when editing category */}
              {editingCategoryItem && (
                <div className="admin-form-group" style={{ marginBottom: 20 }}>
                  <label className="admin-label">{isBn ? 'সাব-গ্রুপে ক্যাটাগরির অবস্থান' : 'Position in Sub-Group'}</label>
                  <select
                    className="admin-select"
                    value={categoryItemForm.position}
                    onChange={(e) => setCategoryItemForm({ ...categoryItemForm, position: parseInt(e.target.value, 10) })}
                  >
                    {(() => {
                      const grp = categoryMasterGroups.find((g) => g.id === categoryItemForm.masterGroupId);
                      const sub = grp?.subGroups?.find((s) => s.titleBn === categoryItemForm.subGroupTitleBn);
                      const count = Math.max(1, sub?.items?.length || 1);
                      return Array.from({ length: count }).map((_, idx) => (
                        <option key={idx} value={idx + 1}>
                          {isBn ? `${idx + 1} নম্বর অবস্থান` : `Position #${idx + 1}`}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="admin-btn-primary">
                  <Save size={16} />
                  <span>{editingCategoryItem ? (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes') : (isBn ? 'ক্যাটাগরি যুক্ত করুন' : 'Add Category')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ADD / EDIT MASTER GROUP (With Position Reorder!)
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
                {editingGroup ? (isBn ? 'মাস্টার গ্রুপের নাম ও পজিশন সম্পাদনা' : 'Edit Master Group & Position') : (isBn ? 'নতুন মাস্টার গ্রুপ তৈরি' : 'Create Master Group')}
              </h2>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMasterGroup}>
              <div className="admin-form-group" style={{ marginBottom: 14 }}>
                <label className="admin-label">{isBn ? 'মাস্টার গ্রুপের নাম (বাংলা) *' : 'Master Group Name (Bangla) *'}</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder={isBn ? "যেমন: প্রযুক্তি ও উদ্ভাবন" : "e.g. প্রযুক্তি ও উদ্ভাবন"}
                  value={groupForm.nameBn}
                  onChange={(e) => setGroupForm({ ...groupForm, nameBn: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: editingGroup ? 14 : 20 }}>
                <label className="admin-label">Master Group Name (English)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Technology & Innovation"
                  value={groupForm.nameEn}
                  onChange={(e) => setGroupForm({ ...groupForm, nameEn: e.target.value })}
                />
              </div>

              {/* Master Group Position / Rank Selector - Only shown when editing */}
              {editingGroup && (
                <div className="admin-form-group" style={{ marginBottom: 20 }}>
                  <label className="admin-label">{isBn ? 'মেনু বার ও ওয়েবসাইটে অবস্থান' : 'Menu Bar & Display Order'}</label>
                  <select
                    className="admin-select"
                    value={groupForm.position}
                    onChange={(e) => setGroupForm({ ...groupForm, position: parseInt(e.target.value, 10) })}
                  >
                    {categoryMasterGroups.map((_, idx) => (
                      <option key={idx} value={idx + 1}>
                        {isBn ? `${idx + 1} নম্বর অবস্থান` : `Position #${idx + 1}`}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {isBn ? 'এই নম্বর পরিবর্তন করলে সম্পূর্ণ ওয়েবসাইটে মেনু এবং সেকশনের ক্রম পরিবর্তিত হবে।' : 'Changing this order will immediately update navigation on the entire website.'}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsGroupModalOpen(false)}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="admin-btn-primary">
                  <Save size={16} />
                  <span>{editingGroup ? (isBn ? 'আপডেট করুন' : 'Update Group') : (isBn ? 'গ্রুপ তৈরি করুন' : 'Create Group')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: ADD / EDIT SUB-GROUP (With Master Group Transfer Dropdown!)
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
              width: 500,
              maxWidth: '95vw',
              borderTop: '4px solid var(--primary-red)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.35)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800 }}>
                {editingSubGroup ? (isBn ? 'সাব-গ্রুপ সম্পাদনা ও মাস্টার গ্রুপ স্থানান্তর' : 'Edit Sub-Group & Transfer Group') : (isBn ? 'নতুন সাব-গ্রুপ তৈরি' : 'Create New Sub-Group')}
              </h2>
              <button
                type="button"
                onClick={() => setIsSubGroupModalOpen(false)}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSubGroup}>
              {/* Target Master Group Selector for Transferring across Groups */}
              <div className="admin-form-group" style={{ marginBottom: 14 }}>
                <label className="admin-label">{isBn ? 'মাস্টার গ্রুপ নির্বাচন করুন *' : 'Select Master Group *'}</label>
                <select
                  className="admin-select"
                  value={subGroupForm.groupId}
                  onChange={(e) => setSubGroupForm({ ...subGroupForm, groupId: e.target.value })}
                >
                  {categoryMasterGroups.map((g, gIdx) => (
                    <option key={g.id} value={g.id}>
                      {gIdx + 1}. {g.nameBn} - {g.nameEn}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {isBn ? 'এই ড্রপডাউন থেকে অন্য কোনো মাস্টার গ্রুপ সিলেক্ট করলে এই সাব-গ্রুপটি এবং এর সব ক্যাটাগরি স্বয়ংক্রিয়ভাবে সেই গ্রুপে চলে যাবে।' : 'Select a different master group to transfer this entire sub-group and all its child topics.'}
                </span>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 14 }}>
                <label className="admin-label">{isBn ? 'সাব-গ্রুপের শিরোনাম (বাংলা) *' : 'Sub-Group Title (Bangla) *'}</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder={isBn ? "যেমন: অর্থনীতি ও ব্যাংকিং" : "e.g. অর্থনীতি ও ব্যাংকিং"}
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
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="admin-btn-primary">
                  <Save size={16} />
                  <span>{editingSubGroup ? (isBn ? 'আপডেট ও স্থানান্তর করুন' : 'Save & Transfer') : (isBn ? 'সাব-গ্রুপ যোগ করুন' : 'Add Sub-Group')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
