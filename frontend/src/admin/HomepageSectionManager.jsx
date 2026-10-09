import React, { useState, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Zap,
  LayoutGrid,
  Clock,
  Flag,
  Plane,
  MapPin,
  PlaySquare,
  Mic,
  FolderTree,
  Mail,
  MessageSquare,
  Sun,
  Globe,
  TrendingUp,
  GraduationCap,
  Cpu,
  HeartHandshake,
  Trophy,
  Film,
  PenTool,
  Grid,
  Columns,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import ConfirmModal from '../components/Modals/ConfirmModal';

// Helper to get matching Lucide icon for section
const getSectionIconComponent = (sec) => {
  if (sec.id === 'heroLeadGrid') return LayoutGrid;
  if (sec.id === 'latestNewsGrid') return Clock;
  if (sec.id === 'bangladeshSection') return Flag;
  if (sec.id === 'remittanceFighter') return Plane;
  if (sec.id === 'districtNewsSection') return MapPin;
  if (sec.id === 'videoNewsSection') return PlaySquare;
  if (sec.id === 'podcastSection') return Mic;
  if (sec.masterGroupId === 'international-world') return Globe;
  if (sec.masterGroupId === 'business-economy') return TrendingUp;
  if (sec.masterGroupId === 'jobs-education') return GraduationCap;
  if (sec.masterGroupId === 'science-tech') return Cpu;
  if (sec.masterGroupId === 'religion-society') return HeartHandshake;
  if (sec.masterGroupId === 'sports-health') return Trophy;
  if (sec.masterGroupId === 'entertainment') return Film;
  if (sec.masterGroupId === 'lifestyle-culture') return Sun;
  if (sec.masterGroupId === 'opinion-specials') return PenTool;
  return FolderTree;
};

// 3-Column Specific Configurations
const THREE_COLUMN_CONFIGS = {
  heroLeadGrid: {
    nameBn: 'হিরো লিড ৩-কলাম গ্রিড',
    nameEn: 'Hero Lead 3-Column Grid',
    defaultOrder: ['leadSlider', 'newlyPosted', 'mostRead'],
    columns: {
      leadSlider: {
        id: 'leadSlider',
        nameBn: 'হিরো লিড স্লাইডার ও ব্যানার',
        nameEn: 'Hero Lead Slider & Banner',
        descBn: 'প্রধান সংবাদ, বড় ছবি ও ব্রেকিং হাইলাইট (৫ অনুপাত প্রশস্ত)',
        descEn: 'Lead breaking stories, big image & highlight carousel (5fr width)',
        icon: Zap,
        accentColor: '#E60012'
      },
      newlyPosted: {
        id: 'newlyPosted',
        nameBn: 'সদ্য পোস্টকৃত সংবাদ',
        nameEn: 'Newly Posted News',
        descBn: 'সর্বশেষ ৪টি টাটকা সংবাদের অনুদৈর্ঘ্য কার্ড তালিকা',
        descEn: 'Recent 4 latest news cards vertical stream',
        icon: Clock,
        accentColor: '#2563EB'
      },
      mostRead: {
        id: 'mostRead',
        nameBn: 'সর্বাধিক পঠিত ও ট্রেন্ডিং',
        nameEn: 'Most Read & Trending',
        descBn: 'পাঠকদের সর্বাধিক পঠিত সংবাদ ও শীর্ষ তালিকা',
        descEn: 'Reader most viewed and weekly top trending news ranking list',
        icon: TrendingUp,
        accentColor: '#16A34A'
      }
    }
  },
  bangladeshSection: {
    nameBn: 'বাংলাদেশ ও জাতীয় সংবাদ',
    nameEn: 'Bangladesh & National Section',
    defaultOrder: ['featuredLead', 'subLeads', 'weatherFollow'],
    columns: {
      featuredLead: {
        id: 'featuredLead',
        nameBn: 'বড় ফিচার্ড লিড কার্ড',
        nameEn: 'Big Featured Lead Card',
        descBn: 'বড় ছবিসহ জাতীয় লিড নিউজ স্লাইডার (৪.৪ অনুপাত)',
        descEn: 'Large featured photo lead carousel (4.4fr width)',
        icon: Flag,
        accentColor: '#E60012'
      },
      subLeads: {
        id: 'subLeads',
        nameBn: 'জাতীয় সাব-লিড সংবাদ',
        nameEn: 'National Sub-Leads',
        descBn: '৪টি গুরুত্বপূর্ণ জাতীয় খবরের কার্ড তালিকা',
        descEn: '4 key national sub-lead news cards stream',
        icon: LayoutGrid,
        accentColor: '#2563EB'
      },
      weatherFollow: {
        id: 'weatherFollow',
        nameBn: 'লাইভ আবহাওয়া ও সোশ্যাল ফলো',
        nameEn: 'Live Weather & Social Follow',
        descBn: 'জেলা ভিত্তিক গুগল আবহাওয়া ও সোশ্যাল ফলোয়ার উইজেট',
        descEn: 'District-level Google live weather & social follower widget',
        icon: Sun,
        accentColor: '#D97706'
      }
    }
  },
  remittanceFighter: {
    nameBn: 'প্রবাসী ও রেমিট্যান্স যোদ্ধা',
    nameEn: 'Expatriates & Remittance Fighters',
    defaultOrder: ['featuredLead', 'subLeads', 'ratesHelpline'],
    columns: {
      featuredLead: {
        id: 'featuredLead',
        nameBn: 'প্রবাসী ফিচার্ড লিড সংবাদ',
        nameEn: 'Probashi Featured Lead',
        descBn: 'প্রবাসী বিশ্বের প্রধান ছবি ও সংবাদ স্লাইডার (৪.৪ অনুপাত)',
        descEn: 'Expatriate world top featured story carousel (4.4fr width)',
        icon: Plane,
        accentColor: '#E60012'
      },
      subLeads: {
        id: 'subLeads',
        nameBn: 'প্রবাসী সাব-লিড সংবাদ',
        nameEn: 'Probashi Sub-Leads',
        descBn: '৪টি গুরুত্বপূর্ণ প্রবাসী খবরের কার্ড তালিকা',
        descEn: '4 key expatriate sub-lead news cards stream',
        icon: LayoutGrid,
        accentColor: '#2563EB'
      },
      ratesHelpline: {
        id: 'ratesHelpline',
        nameBn: 'মুদ্রা বিনিময় হার ও ২৪/৭ হেল্পলাইন',
        nameEn: 'Forex Currency Rates & 24/7 Helpline',
        descBn: 'লাইভ বৈদেশিক মুদ্রা হার ও ওয়েজ আর্নার্স কল্যাণ হেল্পলাইন',
        descEn: 'Live Bangladesh Bank forex exchange rates & Probashi hotline widget',
        icon: Globe,
        accentColor: '#059669'
      }
    }
  }
};

// Generic 3-Column configuration for SubGroup Sections
const SUBGROUP_COLUMN_CONFIG = {
  columns: {
    heroCard: {
      id: 'heroCard',
      nameBn: 'বড় হিরো সংবাদ (Featured Lead)',
      nameEn: 'Big Hero Card',
      descBn: '১টি বড় ছবিযুক্ত প্রধান সংবাদ কার্ড',
      descEn: '1 Featured big image headline card',
      icon: LayoutGrid,
      accentColor: '#E60012'
    },
    colA: {
      id: 'colA',
      nameBn: 'কলাম ১ (৪টি ছোট সংবাদ)',
      nameEn: 'Column A (4 News Cards)',
      descBn: 'থাম্বনেইলসহ ৪টি সংবাদের খাড়া তালিকা',
      descEn: 'Vertical list of 4 news items with thumbnails',
      icon: Clock,
      accentColor: '#2563EB'
    },
    colB: {
      id: 'colB',
      nameBn: 'কলাম ২ (৪টি ছোট সংবাদ)',
      nameEn: 'Column B (4 News Cards)',
      descBn: 'থাম্বনেইলসহ পরবর্তী ৪টি সংবাদের খাড়া তালিকা',
      descEn: 'Vertical list of second 4 news items with thumbnails',
      icon: FolderTree,
      accentColor: '#16A34A'
    }
  }
};

export default function HomepageSectionManager({ triggerSaveToast }) {
  const {
    homepageSections,
    moveHomepageSection,
    setHomepageSectionsOrder,
    toggleHomepageSectionVisibility,
    resetHomepageSectionsToDefault,
    sectionColumnsOrder,
    updateSectionColumnsOrder,
    resetSectionColumnsOrder,
    adminLanguage,
    language,
    syncModuleToMariaDb
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';

  const [isSavingDb, setIsSavingDb] = useState(false);

  const handleSaveToMariaDb = async () => {
    setIsSavingDb(true);
    try {
      const res = await syncModuleToMariaDb('sections', homepageSections);
      if (res?.success) {
        if (triggerSaveToast) triggerSaveToast(isBn ? 'হোমপেজ লেআউট MariaDB ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে!' : 'Homepage sections saved to MariaDB!');
      } else {
        if (triggerSaveToast) triggerSaveToast(isBn ? 'সংরক্ষিত হয়েছে।' : 'Saved.');
      }
    } catch (e) {
      if (triggerSaveToast) triggerSaveToast('Notice: ' + e.message);
    } finally {
      setIsSavingDb(false);
    }
  };

  // State for active filter tab: 'all' | 'main' | 'subgroup'
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSectionId, setExpandedSectionId] = useState(null);

  // Custom Confirmation Dialog State
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

  // Convert English number to Bengali digits
  const toBnNumber = (num) => {
    if (!isBn) return num;
    const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (w) => digits[+w]);
  };

  // Filtered and Searched Sections
  const filteredSections = useMemo(() => {
    const list = homepageSections || [];
    return list.filter((sec) => {
      // Type Filter
      if (filterType === 'main' && sec.type !== 'main') return false;
      if (filterType === 'subgroup' && sec.type !== 'subgroup' && !sec.id.startsWith('subgroup-')) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesBn = (sec.nameBn || '').toLowerCase().includes(q);
        const matchesEn = (sec.nameEn || '').toLowerCase().includes(q);
        const matchesMaster = (sec.masterGroupNameBn || '').toLowerCase().includes(q);
        const matchesDesc = (sec.descriptionBn || '').toLowerCase().includes(q);
        return matchesBn || matchesEn || matchesMaster || matchesDesc;
      }
      return true;
    });
  }, [homepageSections, filterType, searchQuery]);

  // Statistics
  const totalCount = (homepageSections || []).length;
  const visibleCount = (homepageSections || []).filter((s) => s.isVisible !== false).length;
  const hiddenCount = totalCount - visibleCount;

  // Handler: Move Section Up (works seamlessly in all tabs and filtered views)
  const handleMoveUp = (secId) => {
    const viewIdx = filteredSections.findIndex((s) => s.id === secId);
    if (viewIdx > 0) {
      const prevSecId = filteredSections[viewIdx - 1].id;
      const globalFrom = (homepageSections || []).findIndex((s) => s.id === secId);
      const globalTo = (homepageSections || []).findIndex((s) => s.id === prevSecId);
      if (globalFrom !== -1 && globalTo !== -1) {
        moveHomepageSection(globalFrom, globalTo);
        if (triggerSaveToast) triggerSaveToast(isBn ? 'সেকশন ১ ধাপ উপরে স্থানান্তরিত হয়েছে!' : 'Section moved up!');
      }
    }
  };

  // Handler: Move Section Down (works seamlessly in all tabs and filtered views)
  const handleMoveDown = (secId) => {
    const viewIdx = filteredSections.findIndex((s) => s.id === secId);
    if (viewIdx >= 0 && viewIdx < filteredSections.length - 1) {
      const nextSecId = filteredSections[viewIdx + 1].id;
      const globalFrom = (homepageSections || []).findIndex((s) => s.id === secId);
      const globalTo = (homepageSections || []).findIndex((s) => s.id === nextSecId);
      if (globalFrom !== -1 && globalTo !== -1) {
        moveHomepageSection(globalFrom, globalTo);
        if (triggerSaveToast) triggerSaveToast(isBn ? 'সেকশন ১ ধাপ নিচে স্থানান্তরিত হয়েছে!' : 'Section moved down!');
      }
    }
  };

  // Handler: Move to Top
  const handleMoveToTop = (secId) => {
    const viewIdx = filteredSections.findIndex((s) => s.id === secId);
    if (viewIdx > 0) {
      const targetSecId = filteredSections[0].id;
      const globalFrom = (homepageSections || []).findIndex((s) => s.id === secId);
      const globalTo = (homepageSections || []).findIndex((s) => s.id === targetSecId);
      if (globalFrom !== -1 && globalTo !== -1) {
        moveHomepageSection(globalFrom, globalTo);
        if (triggerSaveToast) triggerSaveToast(isBn ? 'সেকশন শীর্ষে স্থানান্তরিত হয়েছে!' : 'Section moved to top!');
      }
    }
  };

  // Handler: Move to Bottom
  const handleMoveToBottom = (secId) => {
    const viewIdx = filteredSections.findIndex((s) => s.id === secId);
    if (viewIdx >= 0 && viewIdx < filteredSections.length - 1) {
      const targetSecId = filteredSections[filteredSections.length - 1].id;
      const globalFrom = (homepageSections || []).findIndex((s) => s.id === secId);
      const globalTo = (homepageSections || []).findIndex((s) => s.id === targetSecId);
      if (globalFrom !== -1 && globalTo !== -1) {
        moveHomepageSection(globalFrom, globalTo);
        if (triggerSaveToast) triggerSaveToast(isBn ? 'সেকশন নিচে স্থানান্তরিত হয়েছে!' : 'Section moved to bottom!');
      }
    }
  };

  // Handler: Toggle Visibility
  const handleToggleVisibility = (sec) => {
    toggleHomepageSectionVisibility(sec.id);
    const willBeVisible = sec.isVisible === false;
    if (triggerSaveToast) {
      triggerSaveToast(
        willBeVisible
          ? isBn ? `"${sec.nameBn}" হোমপেজে প্রদর্শন সক্রিয় করা হয়েছে!` : `"${sec.nameEn || sec.nameBn}" is now visible!`
          : isBn ? `"${sec.nameBn}" হোমপেজে আড়াল করা হয়েছে` : `"${sec.nameEn || sec.nameBn}" is now hidden`
      );
    }
  };

  // Helper to determine the default 3-column order for any section
  const getDefaultColumnsForSection = (sectionId) => {
    if (THREE_COLUMN_CONFIGS[sectionId]?.defaultOrder) {
      return THREE_COLUMN_CONFIGS[sectionId].defaultOrder;
    }
    const allSubgroups = (homepageSections || []).filter(
      (s) => s.type === 'subgroup' || s.id.startsWith('subgroup-')
    );
    const subgroupNaturalIdx = allSubgroups.findIndex((s) => s.id === sectionId);
    const patternIdx = subgroupNaturalIdx >= 0 ? subgroupNaturalIdx : 0;
    const pattern = patternIdx % 3;
    if (pattern === 0) return ['heroCard', 'colA', 'colB'];
    if (pattern === 1) return ['colA', 'heroCard', 'colB'];
    return ['colA', 'colB', 'heroCard'];
  };

  // Handler: Reorder 3-Column sub-items (Left & Right)
  const handleMoveSubColumn = (sectionId, colIndex, direction) => {
    const currentOrder =
      sectionColumnsOrder?.[sectionId] ||
      getDefaultColumnsForSection(sectionId);

    const targetIndex = direction === 'left' ? colIndex - 1 : colIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const [moved] = newOrder.splice(colIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    const updateFn = updateSectionColumnsOrder || setSectionColumnOrder;
    if (updateFn) {
      updateFn(sectionId, newOrder);
      if (triggerSaveToast) triggerSaveToast(isBn ? 'কলামের অবস্থান সফলভাবে পরিবর্তন হয়েছে!' : 'Column position updated!');
    }
  };

  return (
    <div className="homepage-section-manager">
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        subMessage={confirmDialog.subMessage}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: 'var(--primary-red)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layers size={20} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>
                {isBn ? 'হোমপেজ সেকশন কন্ট্রোল প্যানেল' : 'Homepage Sections Manager'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '3px 0 0 0' }}>
                {isBn
                  ? `হোমপেজের সকল ${toBnNumber(totalCount)}টি সেকশনের অবস্থান (উপরে-নিচে মুভ), দৃশ্যমানতা ও ৩-কলাম লেআউট নিয়ন্ত্রণ করুন`
                  : `Manage ordering, visibility and 3-column layout of all ${totalCount} homepage sections`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Save to MariaDB & Reset to Default */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="admin-btn-primary"
            style={{ backgroundColor: '#10B981', borderColor: '#10B981', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}
            onClick={handleSaveToMariaDb}
            disabled={isSavingDb}
            title={isBn ? 'হোমপেজ লেআউট MariaDB ডাটাবেজে সংরক্ষণ করুন' : 'Save homepage layout to MariaDB'}
          >
            <Save size={15} />
            <span>{isSavingDb ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'ডাটাবেজে সংরক্ষণ' : 'Save to DB')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              openConfirm({
                title: isBn ? 'ডিফল্ট অর্ডারে রিসেট নিশ্চিতকরণ' : 'Reset Homepage Sections',
                message: isBn
                  ? 'আপনি কি হোমপেজের সকল সেকশনকে সিস্টেম ডিফল্ট অর্ডারে ফিরিয়ে নিতে চান?'
                  : 'Are you sure you want to reset all homepage sections to their default order?',
                confirmText: isBn ? 'হ্যাঁ, রিসেট করুন' : 'Yes, Reset',
                type: 'danger',
                onConfirm: () => {
                  resetHomepageSectionsToDefault();
                  if (resetSectionColumnsOrder) resetSectionColumnsOrder();
                  if (triggerSaveToast) triggerSaveToast(isBn ? 'হোমপেজ সেকশনসমূহ ডিফল্ট অর্ডারে রিসেট হয়েছে!' : 'Sections reset to default!');
                }
              });
            }}
            className="admin-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <RotateCcw size={15} />
            <span>{isBn ? 'ডিফল্ট অর্ডারে রিসেট' : 'Reset to Default Order'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div
        className="admin-card"
        style={{
          padding: 14,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.84rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterType === 'all' ? 'var(--primary-red)' : 'var(--bg-subtle)',
              color: filterType === 'all' ? '#fff' : 'var(--text-main)',
              transition: 'all 0.15s ease'
            }}
          >
            {isBn ? `সকল সেকশন (${toBnNumber(totalCount)})` : `All Sections (${totalCount})`}
          </button>

          <button
            type="button"
            onClick={() => setFilterType('main')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.84rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterType === 'main' ? 'var(--primary-red)' : 'var(--bg-subtle)',
              color: filterType === 'main' ? '#fff' : 'var(--text-main)',
              transition: 'all 0.15s ease'
            }}
          >
            {isBn ? 'মূল ফিচার সেকশন (৭টি)' : 'Main Features (7)'}
          </button>

          <button
            type="button"
            onClick={() => setFilterType('subgroup')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.84rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filterType === 'subgroup' ? 'var(--primary-red)' : 'var(--bg-subtle)',
              color: filterType === 'subgroup' ? '#fff' : 'var(--text-main)',
              transition: 'all 0.15s ease'
            }}
          >
            {isBn ? 'সাব-গ্রুপ সেকশন (২৪টি)' : 'Sub-Group Sections (24)'}
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: 240, maxWidth: 360, flex: 1 }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="admin-input"
            style={{ paddingLeft: 36, height: 36, fontSize: '0.86rem' }}
            placeholder={isBn ? 'সেকশন বা ক্যাটাগরির নাম খুঁজুন...' : 'Search sections by name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredSections.map((sec, filterIdx) => {
          const globalIndex = (homepageSections || []).findIndex((s) => s.id === sec.id);
          const isFirst = filterIdx === 0;
          const isLast = filterIdx === filteredSections.length - 1;
          const isVisible = sec.isVisible !== false;
          const SecIcon = getSectionIconComponent(sec);

          const isThreeColSection =
            THREE_COLUMN_CONFIGS[sec.id] ||
            sec.type === 'subgroup' ||
            sec.id.startsWith('subgroup-');

          const isExpanded = expandedSectionId === sec.id;

          // 3-Column Order for this section
          const threeColConfig = THREE_COLUMN_CONFIGS[sec.id] || SUBGROUP_COLUMN_CONFIG;
          const currentSubColOrder =
            sectionColumnsOrder?.[sec.id] ||
            getDefaultColumnsForSection(sec.id);

          return (
            <div
              key={sec.id}
              className="admin-card"
              style={{
                padding: 16,
                border: isVisible ? '1px solid var(--border-color)' : '1px dashed #E60012',
                opacity: isVisible ? 1 : 0.75,
                backgroundColor: isVisible ? 'var(--bg-card)' : 'rgba(230, 0, 18, 0.03)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14
                }}
              >
                {/* Left: Position & Section Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260, flex: 1 }}>
                  {/* Position Badge */}
                  <div
                    style={{
                      minWidth: 38,
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: isVisible ? 'var(--bg-subtle)' : 'rgba(230,0,18,0.1)',
                      border: '1px solid var(--border-color)',
                      color: isVisible ? 'var(--text-main)' : '#DC2626',
                      fontWeight: 800,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    title={isBn ? `হোমপেজে অবস্থানের ক্রম: ${toBnNumber(globalIndex + 1)}` : `Position: ${globalIndex + 1}`}
                  >
                    {toBnNumber(globalIndex + 1)}
                  </div>

                  {/* Section Icon */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: 'rgba(230, 0, 18, 0.08)',
                      color: 'var(--primary-red)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <SecIcon size={19} />
                  </div>

                  {/* Title & Category Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: isVisible ? 'var(--text-main)' : 'var(--text-muted)'
                        }}
                      >
                        {isBn ? sec.nameBn : (sec.nameEn || sec.nameBn)}
                      </h3>

                      {sec.masterGroupNameBn && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                            padding: '2px 8px',
                            borderRadius: 12,
                            border: '1px solid var(--border-color)',
                            fontWeight: 600
                          }}
                        >
                          {isBn ? sec.masterGroupNameBn : (sec.masterGroupNameEn || sec.masterGroupNameBn)}
                        </span>
                      )}

                      {sec.type === 'main' ? (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            color: '#2563EB',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontWeight: 700
                          }}
                        >
                          {isBn ? 'মূল ফিচার' : 'Main Feature'}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: 'rgba(22, 163, 74, 0.1)',
                            color: '#16A34A',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontWeight: 700
                          }}
                        >
                          {isBn ? 'সাব-গ্রুপ (৩-কলাম)' : 'Subgroup'}
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.3
                      }}
                    >
                      {isBn ? sec.descriptionBn : (sec.descriptionEn || sec.descriptionBn)}
                    </p>
                  </div>
                </div>

                {/* Right: Move & Visibility Control Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {/* Move to Top */}
                  <button
                    type="button"
                    onClick={() => handleMoveToTop(sec.id)}
                    disabled={isFirst}
                    className="admin-header-btn"
                    style={{
                      opacity: isFirst ? 0.35 : 1,
                      cursor: isFirst ? 'not-allowed' : 'pointer',
                      padding: '7px 9px'
                    }}
                    title={isBn ? 'একবারে শীর্ষে নিয়ে যান' : 'Move to Top'}
                  >
                    <ChevronsUp size={15} />
                  </button>

                  {/* Move Up */}
                  <button
                    type="button"
                    onClick={() => handleMoveUp(sec.id)}
                    disabled={isFirst}
                    className="admin-header-btn"
                    style={{
                      opacity: isFirst ? 0.35 : 1,
                      cursor: isFirst ? 'not-allowed' : 'pointer',
                      padding: '7px 9px'
                    }}
                    title={isBn ? '১ ধাপ উপরে তুলুন' : 'Move Up'}
                  >
                    <ArrowUp size={15} />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    onClick={() => handleMoveDown(sec.id)}
                    disabled={isLast}
                    className="admin-header-btn"
                    style={{
                      opacity: isLast ? 0.35 : 1,
                      cursor: isLast ? 'not-allowed' : 'pointer',
                      padding: '7px 9px'
                    }}
                    title={isBn ? '১ ধাপ নিচে নামান' : 'Move Down'}
                  >
                    <ArrowDown size={15} />
                  </button>

                  {/* Move to Bottom */}
                  <button
                    type="button"
                    onClick={() => handleMoveToBottom(sec.id)}
                    disabled={isLast}
                    className="admin-header-btn"
                    style={{
                      opacity: isLast ? 0.35 : 1,
                      cursor: isLast ? 'not-allowed' : 'pointer',
                      padding: '7px 9px'
                    }}
                    title={isBn ? 'একবারে নিচে নিয়ে যান' : 'Move to Bottom'}
                  >
                    <ChevronsDown size={15} />
                  </button>

                  {/* 3-Column Toggle Settings Button */}
                  {isThreeColSection && (
                    <button
                      type="button"
                      onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 4,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        border: isExpanded ? '1px solid var(--primary-red)' : '1px solid var(--border-color)',
                        backgroundColor: isExpanded ? 'rgba(230, 0, 18, 0.08)' : 'var(--bg-subtle)',
                        color: isExpanded ? 'var(--primary-red)' : 'var(--text-main)'
                      }}
                      title={isBn ? '৩-কলাম লেআউট সাজান' : '3-Column Layout'}
                    >
                      <Columns size={14} />
                      <span>{isBn ? '৩-কলাম লেআউট' : '3-Column'}</span>
                    </button>
                  )}

                  {/* Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(sec)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 4,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      border: 'none',
                      backgroundColor: isVisible ? '#16A34A' : '#6B7280',
                      color: '#FFFFFF',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span>{isVisible ? (isBn ? 'প্রদর্শিত' : 'Visible') : (isBn ? 'আড়ালকৃত' : 'Hidden')}</span>
                  </button>
                </div>
              </div>

              {/* 3-Column Order Expanded Panel */}
              {isThreeColSection && isExpanded && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 6,
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--primary-red)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.88rem' }}>
                      <Columns size={16} color="var(--primary-red)" />
                      <span>{isBn ? '৩-কলামের অবস্থান সাজান (বাম ➔ মাঝ ➔ ডান)' : '3-Column Left-to-Right Ordering'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedSectionId(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {currentSubColOrder.map((colKey, colIdx) => {
                      const colMeta = threeColConfig.columns[colKey] || {
                        nameBn: colKey,
                        nameEn: colKey,
                        descBn: '',
                        icon: LayoutGrid,
                        accentColor: '#E60012'
                      };
                      const ColIcon = colMeta.icon || LayoutGrid;

                      return (
                        <div
                          key={colKey}
                          style={{
                            padding: 12,
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 8
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  color: colMeta.accentColor || 'var(--primary-red)',
                                  backgroundColor: 'rgba(230, 0, 18, 0.08)',
                                  padding: '1px 6px',
                                  borderRadius: 4
                                }}
                              >
                                {colIdx === 0 ? (isBn ? '১ম কলাম (বাম)' : 'Col 1 (Left)') : colIdx === 1 ? (isBn ? '২য় কলাম (মাঝ)' : 'Col 2 (Center)') : (isBn ? '৩য় কলাম (ডান)' : 'Col 3 (Right)')}
                              </span>
                              <ColIcon size={16} color={colMeta.accentColor} />
                            </div>

                            <h4 style={{ margin: '4px 0 2px 0', fontSize: '0.88rem', fontWeight: 700 }}>
                              {isBn ? colMeta.nameBn : colMeta.nameEn}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                              {isBn ? colMeta.descBn : colMeta.descEn}
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 6 }}>
                            <button
                              type="button"
                              onClick={() => handleMoveSubColumn(sec.id, colIdx, 'left')}
                              disabled={colIdx === 0}
                              style={{
                                opacity: colIdx === 0 ? 0.3 : 1,
                                cursor: colIdx === 0 ? 'not-allowed' : 'pointer',
                                padding: '4px 8px',
                                borderRadius: 4,
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-subtle)',
                                color: 'var(--text-main)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.74rem',
                                fontWeight: 600
                              }}
                              title={isBn ? 'বামে সরান' : 'Move Left'}
                            >
                              <ArrowLeft size={12} />
                              <span>{isBn ? 'বামে' : 'Left'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveSubColumn(sec.id, colIdx, 'right')}
                              disabled={colIdx === 2}
                              style={{
                                opacity: colIdx === 2 ? 0.3 : 1,
                                cursor: colIdx === 2 ? 'not-allowed' : 'pointer',
                                padding: '4px 8px',
                                borderRadius: 4,
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-subtle)',
                                color: 'var(--text-main)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.74rem',
                                fontWeight: 600
                              }}
                              title={isBn ? 'ডানে সরান' : 'Move Right'}
                            >
                              <span>{isBn ? 'ডানে' : 'Right'}</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div
            className="admin-card"
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <HelpCircle size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px 0' }}>
              {isBn ? 'কোনো সেকশন পাওয়া যায়নি' : 'No sections found'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {isBn ? 'অনুসন্ধানের কীওয়ার্ড পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Try adjusting your search or filter options.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
