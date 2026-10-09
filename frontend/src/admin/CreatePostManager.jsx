import React, { useState, useEffect, useRef } from 'react';
import { useNews } from '../context/NewsContext';
import {
  Heading,
  Image as ImageIcon,
  Type,
  Quote,
  List,
  Code,
  Table as TableIcon,
  Minus,
  Binary,
  Feather,
  Music,
  FileDown,
  Video,
  User,
  Calendar,
  Tags,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RotateCw,
  Save,
  Rocket,
  Eye,
  FolderOpen,
  X,
  Copy,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Unlink,
  Eraser,
  Sliders,
  Camera,
  HelpCircle,
  ExternalLink,
  Clock,
  Search,
  Upload,
  Folder,
  Layers,
  FileText,
  Send,
  Lock,
  Share2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Star,
  CheckCircle,
  Filter,
  Grid,
  RefreshCw,
  Crosshair
} from 'lucide-react';
import { uploadImageToStorage } from '../utils/imageUploader';
import SocialNewsCardPreview from './SocialNewsCardPreview';
import { getCardCategoryLabel } from '../utils/cardCategoryHelper';

const GRID_POSITIONS = [
  { id: 'top left', label: 'Top Left', bn: 'উপর-বাম', arrow: '↖' },
  { id: 'top center', label: 'Top Center', bn: 'উপর-মাঝ', arrow: '⬆' },
  { id: 'top right', label: 'Top Right', bn: 'উপর-ডান', arrow: '↗' },
  { id: 'center left', label: 'Center Left', bn: 'মাঝ-বাম', arrow: '⬅' },
  { id: 'center center', label: 'Center Center', bn: 'মাঝখান', arrow: '⏺' },
  { id: 'center right', label: 'Center Right', bn: 'মাঝ-ডান', arrow: '➡️' },
  { id: 'bottom left', label: 'Bottom Left', bn: 'নিচে-বাম', arrow: '↙' },
  { id: 'bottom center', label: 'Bottom Center', bn: 'নিচে-মাঝ', arrow: '⬇' },
  { id: 'bottom right', label: 'Bottom Right', bn: 'নিচে-ডান', arrow: '↘' }
];

// Helper: Format any YouTube / Vimeo / web video URL to valid embed iframe URL
export function formatVideoEmbedUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // YouTube watch?v=ID or &v=ID
  if (trimmed.includes('youtube.com/watch')) {
    const match = trimmed.match(/[?&]v=([^&#]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  // youtu.be/ID
  if (trimmed.includes('youtu.be/')) {
    const match = trimmed.match(/youtu\.be\/([^?&#]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  // youtube.com/shorts/ID
  if (trimmed.includes('youtube.com/shorts/')) {
    const match = trimmed.match(/youtube\.com\/shorts\/([^?&#]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  // youtube.com/embed/ID
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }
  // Vimeo
  if (trimmed.includes('vimeo.com/')) {
    const match = trimmed.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
  }
  return trimmed;
}

// Helper: Parse raw HTML content into modular Editor Blocks
export function parseHtmlToBlocks(html, defaultTitle = '', defaultImage = '', defaultCaption = 'ছবি: সংগৃহীত') {
  if (!html || typeof html !== 'string' || !html.trim()) {
    return [
      { id: `heading-${Date.now()}-1`, type: 'heading', level: 'h1', content: defaultTitle || '' },
      { id: `image-${Date.now()}-2`, type: 'image', url: defaultImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80', caption: defaultCaption },
      { id: `paragraph-${Date.now()}-3`, type: 'paragraph', content: '' }
    ];
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const bodyChildren = Array.from(doc.body.children);

    if (bodyChildren.length === 0) {
      const textContent = doc.body.textContent || html;
      return [
        { id: `heading-${Date.now()}-1`, type: 'heading', level: 'h1', content: defaultTitle || '' },
        { id: `image-${Date.now()}-2`, type: 'image', url: defaultImage || '', caption: defaultCaption },
        { id: `paragraph-${Date.now()}-3`, type: 'paragraph', content: textContent }
      ];
    }

    const parsedBlocks = [];
    const uid = Date.now();

    bodyChildren.forEach((el, i) => {
      const tag = el.tagName.toLowerCase();
      const elClass = el.className || '';

      if (/^h[1-6]$/.test(tag) || elClass.includes('post-heading')) {
        const level = /^h[1-6]$/.test(tag) ? tag : (elClass.match(/h[1-6]/) ? elClass.match(/h[1-6]/)[0] : 'h2');
        parsedBlocks.push({
          id: `block-heading-${uid}-${i}`,
          type: 'heading',
          level,
          content: el.innerHTML || el.textContent || ''
        });
      } else if (tag === 'figure' || elClass.includes('post-figure') || tag === 'img' || elClass.includes('post-image')) {
        const imgEl = tag === 'img' ? el : el.querySelector('img');
        const capEl = el.querySelector('figcaption') || el.querySelector('.post-caption');
        parsedBlocks.push({
          id: `block-image-${uid}-${i}`,
          type: 'image',
          url: imgEl?.getAttribute('src') || defaultImage || '',
          caption: capEl?.textContent?.trim() || defaultCaption
        });
      } else if (elClass.includes('post-video-embed') || tag === 'iframe') {
        const iframe = tag === 'iframe' ? el : el.querySelector('iframe');
        parsedBlocks.push({
          id: `block-video-${uid}-${i}`,
          type: 'video',
          url: iframe?.getAttribute('src') || ''
        });
      } else if (elClass.includes('post-file-download') || elClass.includes('post-download-btn')) {
        const aEl = tag === 'a' ? el : el.querySelector('a');
        parsedBlocks.push({
          id: `block-file-${uid}-${i}`,
          type: 'file',
          url: aEl?.getAttribute('href') || '',
          label: aEl?.textContent?.trim() || 'Download File'
        });
      } else if (tag === 'blockquote' || elClass.includes('post-blockquote')) {
        parsedBlocks.push({
          id: `block-quote-${uid}-${i}`,
          type: 'blockquote',
          content: el.innerHTML || el.textContent || ''
        });
      } else if (tag === 'ul' || tag === 'ol' || elClass.includes('post-list')) {
        const items = Array.from(el.querySelectorAll('li')).map((li) => li.innerHTML || li.textContent || '');
        parsedBlocks.push({
          id: `block-list-${uid}-${i}`,
          type: 'list',
          listType: tag === 'ol' ? 'numbered' : 'bullet',
          items: items.length > 0 ? items : ['আইটেম ১']
        });
      } else if (tag === 'table' || elClass.includes('post-table-wrap') || el.querySelector('table')) {
        const table = tag === 'table' ? el : el.querySelector('table');
        const headers = Array.from(table?.querySelectorAll('thead th') || []).map((th) => th.textContent || '');
        const rows = Array.from(table?.querySelectorAll('tbody tr') || []).map((tr) =>
          Array.from(tr.querySelectorAll('td') || []).map((td) => td.textContent || '')
        );
        parsedBlocks.push({
          id: `block-table-${uid}-${i}`,
          type: 'table',
          headers: headers.length > 0 ? headers : ['কলাম ১', 'কলাম ২', 'কলাম ৩'],
          rows: rows.length > 0 ? rows : [['তথ্য ১', 'তথ্য ২', 'তথ্য ৩']]
        });
      } else if (tag === 'pre' || elClass.includes('post-code-wrap')) {
        const codeEl = el.querySelector('code') || el;
        parsedBlocks.push({
          id: `block-code-${uid}-${i}`,
          type: 'code',
          code: codeEl.textContent || '',
          lang: 'javascript'
        });
      } else if (tag === 'hr' || elClass.includes('post-divider')) {
        parsedBlocks.push({
          id: `block-divider-${uid}-${i}`,
          type: 'divider'
        });
      } else {
        parsedBlocks.push({
          id: `block-paragraph-${uid}-${i}`,
          type: 'paragraph',
          content: el.innerHTML || el.textContent || ''
        });
      }
    });

    if (parsedBlocks.length > 0) {
      const hasHeading = parsedBlocks.some((b) => b.type === 'heading');
      if (!hasHeading && defaultTitle) {
        parsedBlocks.unshift({
          id: `block-heading-${uid}-head`,
          type: 'heading',
          level: 'h1',
          content: defaultTitle
        });
      }
      const hasImage = parsedBlocks.some((b) => b.type === 'image');
      if (!hasImage && defaultImage) {
        const headingIdx = parsedBlocks.findIndex((b) => b.type === 'heading');
        const insertIdx = headingIdx >= 0 ? headingIdx + 1 : 0;
        parsedBlocks.splice(insertIdx, 0, {
          id: `block-image-${uid}-thumb`,
          type: 'image',
          url: defaultImage,
          caption: defaultCaption || 'ছবি: সংগৃহীত',
          isThumbnail: true
        });
      }
      return parsedBlocks;
    }
  } catch (err) {
    console.warn('parseHtmlToBlocks error:', err);
  }

  return [
    { id: `heading-${Date.now()}-1`, type: 'heading', level: 'h1', content: defaultTitle || '' },
    { id: `image-${Date.now()}-2`, type: 'image', url: defaultImage || '', caption: defaultCaption, isThumbnail: true },
    { id: `paragraph-${Date.now()}-3`, type: 'paragraph', content: html }
  ];
}

export default function CreatePostManager({ initialPostId = null, initialPost = null, triggerSaveToast, onSwitchToArticles }) {
  const {
    adminLanguage,
    language,
    articles,
    addArticle,
    updateArticle,
    categories,
    categoryMasterGroups,
    refreshCategories,
    showAlert,
    showConfirm,
    showError,
    showSuccess
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';

  // Ensure DB categories are synchronized on mount
  useEffect(() => {
    if (typeof refreshCategories === 'function') {
      refreshCategories();
    }
  }, []);

  // Custom Link Insert Modal State (Replacing browser alert/prompt with sleek custom UI)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkModalData, setLinkModalData] = useState({
    url: '',
    text: '',
    blockIndex: null,
    openInNewTab: true
  });
  const activeLinkRangeRef = useRef(null);
  const activeLinkEditorRef = useRef(null);

  // Editor Layout State
  const [isLeftToolbarOpen, setIsLeftToolbarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Post Meta State
  const [postId, setPostId] = useState(initialPost?.id || initialPostId || null);
  const existingArticle = initialPost || (postId ? articles.find((a) => String(a.id) === String(postId) || a.slug === postId) : null);
  const isAlreadyPublished = existingArticle?.status === 'published';
  const [postStatus, setPostStatus] = useState(existingArticle?.status || 'review');
  const [slug, setSlug] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [excerpt, setExcerpt] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['bangladesh']);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [author, setAuthor] = useState('জনগণ নিউজ ডেস্ক');
  const [isLeadHero, setIsLeadHero] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState('');

  // Social News Card Specific Fields
  const [kicker, setKicker] = useState(''); // e.g. "অর্থবছর ২০২৪-২৫ থেকে ২৫-২৬"
  const [cardCaption, setCardCaption] = useState('ছবি: সংগৃহীত');
  const [cardCategory, setCardCategory] = useState(''); // e.g. "{sub_group} । {category}"
  const [cardImagePosition, setCardImagePosition] = useState('center center'); // 3x3 Grid position

  // Media Gallery Picker Modal State (B2 Cloud Storage)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [activeMediaPickerBlockIndex, setActiveMediaPickerBlockIndex] = useState(null);
  const [mediaGalleryList, setMediaGalleryList] = useState([]);
  const [isMediaGalleryLoading, setIsMediaGalleryLoading] = useState(false);
  const [mediaPickerSearch, setMediaPickerSearch] = useState('');
  const [mediaPickerFormat, setMediaPickerFormat] = useState('all');

  // Blocks State
  const [blocks, setBlocks] = useState([
    {
      id: 'block-heading-1',
      type: 'heading',
      level: 'h1',
      content: ''
    },
    {
      id: 'block-image-1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
      caption: 'ছবি: সংগৃহীত',
      isThumbnail: true
    },
    {
      id: 'block-paragraph-1',
      type: 'paragraph',
      content: ''
    }
  ]);

  // Load existing article if initialPost or initialPostId provided
  useEffect(() => {
    const art = initialPost || (initialPostId ? articles.find((a) => String(a.id) === String(initialPostId) || a.slug === initialPostId) : null);
    if (art) {
      setPostId(art.id);
      setSlug(art.slug || '');
      setKicker(art.kicker || '');
      setPostStatus(art.status || 'published');
      setExcerpt(art.excerptBn || art.excerptEn || art.excerpt || '');
      setSelectedCategories(
        Array.isArray(art.categories) && art.categories.length > 0
          ? art.categories
          : (art.category ? [art.category] : ['bangladesh'])
      );
      setTags(Array.isArray(art.tags) && art.tags.length > 0 ? art.tags : ['জাতীয়', 'তাজা খবর']);
      setMetaTitle(art.metaTitle || art.titleBn || art.title || '');
      setMetaDesc(art.metaDesc || art.excerptBn || art.excerpt || '');
      setFocusKeyword(art.focusKeyword || '');
      setAuthor(art.author || 'জনগণ নিউজ ডেস্ক');
      setIsLeadHero(Boolean(art.isLeadHero));
      setIsHighlighted(Boolean(art.isHighlighted));
      setIsBreaking(Boolean(art.isBreaking));
      setIsVideo(Boolean(art.isVideo));
      setVideoDuration(art.videoDuration || '');
      setCardCaption(art.cardCaption || 'ছবি: সংগৃহীত');
      setCardCategory(art.cardCategory || '');
      if (art.cardImagePosition) setCardImagePosition(art.cardImagePosition);

      let articleBlocks = null;
      if (art.blocks) {
        if (Array.isArray(art.blocks) && art.blocks.length > 0) {
          articleBlocks = art.blocks;
        } else if (typeof art.blocks === 'string') {
          try {
            const parsed = JSON.parse(art.blocks);
            if (Array.isArray(parsed) && parsed.length > 0) {
              articleBlocks = parsed;
            }
          } catch (e) {}
        }
      }

      const postTitle = art.titleBn || art.title || art.titleEn || '';
      const postImage = art.imageUrl || art.featuredImage || art.featured_image || '';
      const postContent = art.contentBn || art.content || art.contentEn || '';

      if (articleBlocks && articleBlocks.length > 0) {
        const hasHeading = articleBlocks.some((b) => b.type === 'heading');
        if (!hasHeading && postTitle) {
          articleBlocks = [
            { id: `heading-${Date.now()}-head`, type: 'heading', level: 'h1', content: postTitle },
            ...articleBlocks
          ];
        }
        setBlocks(articleBlocks);
      } else if (postContent) {
        // Parse HTML content into structured blocks (Headings, Paragraphs, Images, Blockquotes, Tables, Lists, Videos)
        const parsedFromHtml = parseHtmlToBlocks(
          postContent,
          postTitle,
          postImage,
          art.cardCaption || 'ছবি: সংগৃহীত'
        );
        setBlocks(parsedFromHtml);
      } else {
        setBlocks([
          { id: `heading-${Date.now()}-1`, type: 'heading', level: 'h1', content: postTitle },
          { id: `image-${Date.now()}-2`, type: 'image', url: postImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80', caption: art.cardCaption || 'ছবি: সংগৃহীত', isThumbnail: true },
          { id: `paragraph-${Date.now()}-3`, type: 'paragraph', content: art.excerptBn || art.excerpt || '' }
        ]);
      }
    }
  }, [initialPostId, initialPost, articles]);

  // Tags State
  const [tags, setTags] = useState(['জাতীয়', 'তাজা খবর']);
  const [newTagInput, setNewTagInput] = useState('');

  // Drafts Modal State
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem('jonogon_editor_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState('card'); // 'card' | 'article'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  // History for Undo / Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // New Category Input & Search
  const [newCatInput, setNewCatInput] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Helper: Derive main title from first heading block
  const mainTitle = blocks.find((b) => b.type === 'heading')?.content?.replace(/<[^>]*>?/gm, '').trim() || '';

  // Helper: Featured Image (Prioritizes explicitly marked thumbnail image block, falls back to first available image)
  const featuredImageBlock =
    blocks.find((b) => b.type === 'image' && b.isThumbnail && (b.url || b.previewUrl)) ||
    blocks.find((b) => b.type === 'image' && (b.url || b.previewUrl));
  const featuredImageUrl =
    featuredImageBlock?.url ||
    featuredImageBlock?.previewUrl ||
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';

  // Helper: Primary category & Social Card Category label ({sub_group} । {category})
  const primaryCatId = selectedCategories[0] || 'bangladesh';
  const primaryCatObj = categories.find((c) => c.id === primaryCatId || c.slug === primaryCatId);
  const primaryCatName = primaryCatObj ? (isBn ? primaryCatObj.nameBn : primaryCatObj.nameEn || primaryCatObj.nameBn) : 'বাংলাদেশ';
  const cardCategoryDisplay = cardCategory || getCardCategoryLabel(primaryCatId, categoryMasterGroups, categories);

  // Calculate word count and estimated reading time
  const totalText = blocks
    .map((b) => {
      if (b.type === 'heading' || b.type === 'paragraph' || b.type === 'blockquote' || b.type === 'verse') {
        return b.content?.replace(/<[^>]*>?/gm, ' ') || '';
      }
      if (b.type === 'list') {
        return (b.items || []).join(' ');
      }
      if (b.type === 'table') {
        return (b.headers || []).join(' ') + ' ' + (b.rows || []).flat().join(' ');
      }
      return '';
    })
    .join(' ');

  const wordsCount = totalText.trim() ? totalText.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordsCount / 180));

  // Auto-generate slug when title changes (if slug not manually customized)
  useEffect(() => {
    if (mainTitle && !postId && (!slug || slug.startsWith('post-'))) {
      const generated = mainTitle
        .toLowerCase()
        .replace(/[^\w\u0980-\u09FF\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60);
      setSlug(generated || `post-${Date.now()}`);
    }
  }, [mainTitle, postId]);

  // Auto-save draft every 30 seconds if content exists
  useEffect(() => {
    if (!mainTitle && blocks.length <= 1) return;

    const interval = setInterval(() => {
      setIsAutoSaving(true);
      const draftData = {
        id: postId || `draft-${Date.now()}`,
        title: mainTitle || (isBn ? 'শিরোনামহীন খসড়া' : 'Untitled Draft'),
        kicker,
        slug: slug || `draft-${Date.now()}`,
        blocks,
        excerpt,
        selectedCategories,
        tags,
        metaTitle,
        metaDesc,
        focusKeyword,
        author,
        isLeadHero,
        isHighlighted,
        isBreaking,
        isVideo,
        videoDuration,
        cardCaption,
        cardCategory: cardCategoryDisplay,
        updatedAt: new Date().toISOString()
      };

      setSavedDrafts((prev) => {
        const filtered = prev.filter((d) => d.id !== draftData.id && d.slug !== draftData.slug);
        const updated = [draftData, ...filtered].slice(0, 20);
        try {
          localStorage.setItem('jonogon_editor_drafts', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setLastSavedTime(new Date().toLocaleTimeString());
      setTimeout(() => setIsAutoSaving(false), 600);
    }, 30000);

    return () => clearInterval(interval);
  }, [blocks, mainTitle, kicker, slug, excerpt, selectedCategories, tags, metaTitle, metaDesc, focusKeyword, author, postId, isLeadHero, isHighlighted, isBreaking, isVideo, videoDuration, cardCaption, isBn]);

  // --- BLOCK MANAGEMENT METHODS ---

  const addBlock = (type) => {
    const id = `block-${type}-${Date.now()}`;
    let newBlock = { id, type };

    switch (type) {
      case 'heading':
        newBlock.level = 'h2';
        newBlock.content = '';
        break;
      case 'image':
        newBlock.url = '';
        newBlock.caption = 'ছবি: সংগৃহীত';
        break;
      case 'paragraph':
        newBlock.content = '';
        break;
      case 'blockquote':
        newBlock.content = '';
        break;
      case 'list':
        newBlock.listType = 'bullet';
        newBlock.items = ['তালিকা তথ্য ১', 'তালিকা তথ্য ২'];
        break;
      case 'code':
        newBlock.lang = 'javascript';
        newBlock.code = '';
        break;
      case 'table':
        newBlock.headers = ['কলাম ১', 'কলাম ২', 'কলাম ৩'];
        newBlock.rows = [
          ['তথ্য ১', 'তথ্য ২', 'তথ্য ৩'],
          ['তথ্য ৪', 'তথ্য ৫', 'তথ্য ৬']
        ];
        break;
      case 'divider':
        break;
      case 'math':
        newBlock.formula = 'E = mc²';
        break;
      case 'verse':
        newBlock.content = '';
        break;
      case 'audio':
        newBlock.url = '';
        newBlock.title = 'অডিও ক্লিপ / পডকাস্ট';
        break;
      case 'file':
        newBlock.label = 'ডকুমেন্ট বা ফাইল ডাউনলোড (PDF)';
        newBlock.url = '';
        break;
      case 'video':
        newBlock.url = '';
        newBlock.caption = '';
        break;
      default:
        break;
    }

    setBlocks((prev) => [...prev, newBlock]);
    if (triggerSaveToast) triggerSaveToast(isBn ? 'নতুন ব্লক যোগ হয়েছে!' : 'Block added!');
  };

  const removeBlock = (index) => {
    if (blocks.length <= 1) {
      showError(isBn ? 'কমপক্ষে একটি ব্লক থাকতে হবে।' : 'At least one block is required.');
      return;
    }
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    setBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const updateBlock = (index, updates) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Image Upload helper for Block or Featured Image
  const handleBlockImageUpload = async (index, file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showError(isBn ? 'ছবির সাইজ সর্বোচ্চ ১৫ মেগাবাইট হতে পারবে।' : 'Image size must be less than 15MB.');
      return;
    }

    try {
      // 1. Show immediate preview via DataURL & set uploading state
      const reader = new FileReader();
      reader.onload = async (e) => {
        const previewUrl = e.target?.result;
        updateBlock(index, { url: previewUrl, previewUrl: previewUrl, isUploading: true });

        if (triggerSaveToast) triggerSaveToast(isBn ? 'ছবি WebP রূপান্তর ও ক্লাউড আপলোড হচ্ছে...' : 'Converting to WebP & uploading to cloud...');

        // 2. Upload to Backblaze B2 & MariaDB
        try {
          const newsSlugForImg = slug || mainTitle || kicker || 'news';
          const uploadedUrl = await uploadImageToStorage(file, {
            slug: newsSlugForImg,
            newsSlug: newsSlugForImg,
            associatedNews: slug || mainTitle || kicker || ''
          });
          if (uploadedUrl) {
            updateBlock(index, { url: uploadedUrl, previewUrl: previewUrl, isUploading: false });
            if (triggerSaveToast) triggerSaveToast(isBn ? 'ছবি সফলভাবে .webp ফরম্যাটে ক্লাউডে সংরক্ষিত হয়েছে!' : 'Image uploaded to cloud as .webp!');
          } else {
            updateBlock(index, { isUploading: false });
          }
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          updateBlock(index, { isUploading: false });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File load error:', err);
      updateBlock(index, { isUploading: false });
      showError(isBn ? 'ছবি আপলোড ব্যর্থ হয়েছে।' : 'Image upload failed.');
    }
  };

  // Fetch media files from B2 / MariaDB Media Gallery API
  const fetchMediaForPicker = async () => {
    setIsMediaGalleryLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const endpoints = [
      '/api/media.php',
      'api/media.php',
      './api/media.php'
    ];
    if (origin) endpoints.unshift(`${origin}/api/media.php`);
    const uniqueEndpoints = [...new Set(endpoints)];

    let fetched = false;
    for (const ep of uniqueEndpoints) {
      try {
        const res = await fetch(ep, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const result = await res.json();
          if (result && result.success && Array.isArray(result.data)) {
            setMediaGalleryList(result.data);
            fetched = true;
            break;
          }
        }
      } catch (e) {
        // continue
      }
    }
    if (!fetched) {
      setMediaGalleryList([]);
    }
    setIsMediaGalleryLoading(false);
  };

  // Open Media Gallery Picker Modal for a specific image block
  const handleOpenMediaPicker = (blockIndex) => {
    setActiveMediaPickerBlockIndex(blockIndex);
    setIsMediaPickerOpen(true);
    fetchMediaForPicker();
  };

  // Select an image from Media Gallery Picker and apply to current block
  const handleSelectMediaFromPicker = (mediaItem) => {
    if (activeMediaPickerBlockIndex === null) return;
    const selectedUrl = mediaItem.public_url || mediaItem.b2_url || mediaItem.url || '';
    if (selectedUrl) {
      const currentCaption = blocks[activeMediaPickerBlockIndex]?.caption;
      const cleanName = mediaItem.original_name ? mediaItem.original_name.replace(/\.[^/.]+$/, '') : '';
      const newCaption = currentCaption && currentCaption !== 'ছবি: সংগৃহীত'
        ? currentCaption
        : cleanName
        ? `ছবি: ${cleanName}`
        : 'ছবি: সংগৃহীত';

      updateBlock(activeMediaPickerBlockIndex, {
        url: selectedUrl,
        previewUrl: selectedUrl,
        caption: newCaption
      });

      // If this block is thumbnail, also update card caption
      if (blocks[activeMediaPickerBlockIndex]?.isThumbnail) {
        setCardCaption(newCaption);
      }

      if (triggerSaveToast) triggerSaveToast(isBn ? 'গ্যালারি থেকে ছবি যুক্ত করা হয়েছে!' : 'Image selected from gallery!');
    }
    setIsMediaPickerOpen(false);
    setActiveMediaPickerBlockIndex(null);
  };

  // Mark a specific Image Block as the Primary Article Thumbnail
  const handleMarkAsThumbnail = (targetIndex) => {
    setBlocks((prev) =>
      prev.map((b, i) => {
        if (b.type === 'image') {
          return { ...b, isThumbnail: i === targetIndex };
        }
        return b;
      })
    );
    const targetBlock = blocks[targetIndex];
    if (targetBlock?.caption) {
      setCardCaption(targetBlock.caption);
    }
    if (triggerSaveToast) triggerSaveToast(isBn ? 'মূল থাম্বনেইল হিসেবে সেট করা হয়েছে!' : 'Marked as main thumbnail!');
  };

  // Execute Rich Text Command in Paragraph with Selection Preservation
  const executeFormatCmd = (command, value = null, blockIndex = null, editorEl = null) => {
    const el = editorEl || (blockIndex !== null ? document.getElementById(`editor-paragraph-${blocks[blockIndex]?.id}`) : null);
    if (el) el.focus();
    document.execCommand(command, false, value);
    if (el && blockIndex !== null) {
      updateBlock(blockIndex, { content: el.innerHTML });
    }
  };

  // Open Custom Link Insert Modal (Preserves editor focus & selection range)
  const handleOpenLinkModal = (blockIndex, editorEl = null) => {
    const el = editorEl || (blockIndex !== null ? document.getElementById(`editor-paragraph-${blocks[blockIndex]?.id}`) : null);
    if (el) el.focus();

    const selection = window.getSelection();
    let savedRange = null;
    let selectedText = '';
    if (selection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
      selectedText = selection.toString() || '';
    }

    activeLinkRangeRef.current = savedRange;
    activeLinkEditorRef.current = el;

    setLinkModalData({
      url: '',
      text: selectedText,
      blockIndex,
      openInNewTab: true
    });
    setIsLinkModalOpen(true);
  };

  // Apply Link from Custom Modal with red color and underline
  const handleApplyLinkModal = (e) => {
    if (e) e.preventDefault();
    if (!linkModalData.url || !linkModalData.url.trim()) {
      showError(isBn ? 'অনুগ্রহ করে লিংকের URL লিখুন।' : 'Please enter a link URL.');
      return;
    }

    const rawUrl = linkModalData.url.trim();
    const formattedUrl = (
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://') ||
      rawUrl.startsWith('mailto:') ||
      rawUrl.startsWith('tel:')
    ) ? rawUrl : `https://${rawUrl}`;

    const el = activeLinkEditorRef.current || (linkModalData.blockIndex !== null ? document.getElementById(`editor-paragraph-${blocks[linkModalData.blockIndex]?.id}`) : null);
    if (el) el.focus();

    const selection = window.getSelection();
    if (activeLinkRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(activeLinkRangeRef.current);
    }

    const savedRange = activeLinkRangeRef.current;
    const hasSelection = selection && !selection.isCollapsed && savedRange && !savedRange.collapsed;
    const targetAttr = linkModalData.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';

    if (hasSelection) {
      const executed = document.execCommand('createLink', false, formattedUrl);
      if (!executed && savedRange) {
        const text = linkModalData.text || savedRange.toString() || formattedUrl;
        const a = document.createElement('a');
        a.href = formattedUrl;
        if (linkModalData.openInNewTab) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        a.textContent = text;
        a.style.color = 'var(--primary-red)';
        a.style.textDecoration = 'underline';
        savedRange.deleteContents();
        savedRange.insertNode(a);
      }
    } else {
      const displayText = linkModalData.text?.trim() || formattedUrl;
      const linkHtml = `<a href="${formattedUrl}"${targetAttr} style="color: var(--primary-red); text-decoration: underline; font-weight: 600;">${displayText}</a>&nbsp;`;
      if (savedRange) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = linkHtml;
        const frag = document.createDocumentFragment();
        let node;
        while ((node = tempDiv.firstChild)) {
          frag.appendChild(node);
        }
        savedRange.insertNode(frag);
      } else {
        document.execCommand('insertHTML', false, linkHtml);
      }
    }

    if (el && linkModalData.blockIndex !== null) {
      updateBlock(linkModalData.blockIndex, { content: el.innerHTML });
    }

    setIsLinkModalOpen(false);
    if (triggerSaveToast) triggerSaveToast(isBn ? 'লিংক সফলভাবে যুক্ত হয়েছে!' : 'Link added successfully!');
  };

  // Tag Manager
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Category Toggle
  const toggleCategory = (catId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        return prev.length > 1 ? prev.filter((c) => c !== catId) : prev;
      } else {
        return [...prev, catId];
      }
    });
  };

  // Quick Add Category
  const handleQuickAddCategory = () => {
    if (!newCatInput.trim()) return;
    const name = newCatInput.trim();
    const id = name.toLowerCase().replace(/\s+/g, '-');
    setSelectedCategories((prev) => [...prev, id]);
    setNewCatInput('');
    if (triggerSaveToast) triggerSaveToast(isBn ? `ক্যাটাগরি "${name}" যুক্ত হয়েছে!` : `Category "${name}" added!`);
  };

  // Save as Draft
  const handleManualSaveDraft = () => {
    const compiledHtml = compileBlocksToHtml();
    const draftPayload = {
      titleBn: mainTitle || (isBn ? 'শিরোনামহীন খসড়া' : 'Untitled Draft'),
      titleEn: mainTitle || 'Untitled Draft',
      kicker: kicker || '',
      slug: slug || `draft-${Date.now()}`,
      blocks: blocks,
      category: primaryCatId,
      categoryBn: primaryCatObj?.nameBn || 'বাংলাদেশ',
      categoryEn: primaryCatObj?.nameEn || 'Bangladesh',
      categories: selectedCategories,
      excerptBn: excerpt || mainTitle || '',
      excerptEn: excerpt || mainTitle || '',
      contentBn: compiledHtml,
      contentEn: compiledHtml,
      imageUrl: featuredImageUrl,
      cardCaption: cardCaption || 'ছবি: সংগৃহীত',
      cardCategory: cardCategoryDisplay,
      cardImagePosition: cardImagePosition,
      author: author || 'জনগণ নিউজ ডেস্ক',
      dateBn: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      dateEn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      views: 1,
      isLeadHero: Boolean(isLeadHero),
      isHighlighted: Boolean(isHighlighted),
      isBreaking: Boolean(isBreaking),
      isVideo: Boolean(isVideo),
      videoDuration: videoDuration || '০৩:৪৫',
      tags: tags,
      metaTitle: metaTitle || mainTitle,
      metaDesc: metaDesc || excerpt,
      focusKeyword: focusKeyword || '',
      status: 'draft'
    };

    if (postId) {
      updateArticle(postId, draftPayload);
    } else {
      const newId = `draft-${Date.now()}`;
      setPostId(newId);
      addArticle({ ...draftPayload, id: newId });
    }

    const draftData = {
      ...draftPayload,
      id: postId || `draft-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };

    setSavedDrafts((prev) => {
      const filtered = prev.filter((d) => d.id !== draftData.id && d.slug !== draftData.slug);
      const updated = [draftData, ...filtered];
      try {
        localStorage.setItem('jonogon_editor_drafts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setLastSavedTime(new Date().toLocaleTimeString());
    showSuccess(isBn ? 'পোস্টটি সফলভাবে খসড়া (Draft) হিসেবে সংরক্ষিত হয়েছে!' : 'Post saved as draft successfully!');
  };

  // Load Draft into Editor
  const handleLoadDraft = (draft) => {
    setPostId(draft.id);
    setSlug(draft.slug || '');
    setKicker(draft.kicker || '');
    setBlocks(draft.blocks || []);
    setExcerpt(draft.excerpt || '');
    setSelectedCategories(draft.selectedCategories || ['bangladesh']);
    setTags(draft.tags || []);
    setMetaTitle(draft.metaTitle || '');
    setMetaDesc(draft.metaDesc || '');
    setFocusKeyword(draft.focusKeyword || '');
    setAuthor(draft.author || 'জনগণ নিউজ ডেস্ক');
    setIsLeadHero(Boolean(draft.isLeadHero));
    setIsHighlighted(Boolean(draft.isHighlighted));
    setIsBreaking(Boolean(draft.isBreaking));
    setIsVideo(Boolean(draft.isVideo));
    setVideoDuration(draft.videoDuration || '');
    setCardCaption(draft.cardCaption || 'ছবি: সংগৃহীত');
    setCardCategory(draft.cardCategory || '');
    setIsDraftsModalOpen(false);
    showSuccess(isBn ? 'খসড়া পোস্ট এডিটরে লোড করা হয়েছে!' : 'Draft loaded into editor!');
  };

  // Delete Draft
  const handleDeleteDraft = (draftId) => {
    setSavedDrafts((prev) => {
      const updated = prev.filter((d) => d.id !== draftId);
      try {
        localStorage.setItem('jonogon_editor_drafts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (triggerSaveToast) triggerSaveToast(isBn ? 'খসড়াটি মুছে ফেলা হয়েছে!' : 'Draft deleted!');
  };

  // Discard Everything
  const handleDiscard = async () => {
    const confirmed = await showConfirm({
      title: isBn ? 'এডিটর রিসেট নিশ্চিতকরণ' : 'Confirm Discard',
      message: isBn
        ? 'আপনি কি নিশ্চিত যে বর্তমান লেখা মুছে ফেলে নতুনভাবে শুরু করতে চান?'
        : 'Are you sure you want to discard all current progress and start fresh?',
      subMessage: isBn
        ? 'বর্তমান এডিটর রিসেট করা হলে অসংরক্ষিত কোনো তথ্য থাকলে তা মুছে যাবে।'
        : 'Any unsaved progress in the editor will be cleared.',
      confirmText: isBn ? 'হ্যাঁ, রিসেট করুন' : 'Yes, Discard',
      cancelText: isBn ? 'বাতিল' : 'Cancel',
      type: 'warning'
    });

    if (confirmed) {
      setPostId(null);
      setSlug('');
      setKicker('');
      setCardCategory('');
      setExcerpt('');
      setMetaTitle('');
      setMetaDesc('');
      setFocusKeyword('');
      setTags(['জাতীয়']);
      setIsLeadHero(false);
      setIsHighlighted(false);
      setIsBreaking(false);
      setIsVideo(false);
      setBlocks([
        { id: `heading-${Date.now()}`, type: 'heading', level: 'h1', content: '' },
        { id: `image-${Date.now()}`, type: 'image', url: '', caption: 'ছবি: সংগৃহীত' },
        { id: `paragraph-${Date.now()}`, type: 'paragraph', content: '' }
      ]);
      showSuccess(isBn ? 'এডিটর রিসেট করা হয়েছে!' : 'Editor reset successfully!');
    }
  };

  // Compile Blocks to HTML
  const compileBlocksToHtml = () => {
    return blocks
      .map((b) => {
        switch (b.type) {
          case 'heading': {
            const TagName = b.level || 'h2';
            return `<${TagName} class="post-heading ${TagName}">${b.content || ''}</${TagName}>`;
          }
          case 'image': {
            const imgSrc = b.previewUrl || b.url || '';
            const fallbackSrc = b.previewUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
            return imgSrc
              ? `<figure class="post-figure" style="margin: 20px 0; text-align: center; width: 100%;"><img src="${imgSrc}" alt="${b.caption || 'Image'}" class="post-image" style="width: 100%; height: auto; max-width: 100%; object-fit: contain; border-radius: 8px; display: block; margin: 0 auto;" onerror="if(this.src!=='${fallbackSrc}'){this.src='${fallbackSrc}';}" />${
                  b.caption ? `<figcaption class="post-caption" style="font-size: 0.84rem; color: #888888; margin-top: 8px; font-style: italic; text-align: center;">${b.caption}</figcaption>` : ''
                }</figure>`
              : '';
          }
          case 'paragraph':
            return `<div class="post-paragraph">${b.content || ''}</div>`;
          case 'blockquote':
            return `<blockquote class="post-blockquote">${b.content || ''}</blockquote>`;
          case 'list': {
            const listTag = b.listType === 'numbered' ? 'ol' : 'ul';
            const itemsHtml = (b.items || []).map((it) => `<li>${it}</li>`).join('');
            return `<${listTag} class="post-list">${itemsHtml}</${listTag}>`;
          }
          case 'code':
            return `<pre class="post-code-wrap"><code class="language-${b.lang || 'javascript'}">${b.code || ''}</code></pre>`;
          case 'table': {
            const headers = (b.headers || []).map((h) => `<th>${h}</th>`).join('');
            const rows = (b.rows || [])
              .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
              .join('');
            return `<div class="post-table-wrap"><table class="post-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
          }
          case 'divider':
            return '<hr class="post-divider" />';
          case 'math':
            return `<div class="post-math-block">${b.formula || ''}</div>`;
          case 'verse':
            return `<div class="post-verse">${b.content || ''}</div>`;
          case 'audio':
            return b.url ? `<div class="post-audio"><audio controls src="${b.url}"></audio></div>` : '';
          case 'file':
            return b.url
              ? `<div class="post-file-download" style="margin: 24px auto; display: flex; justify-content: center; align-items: center; text-align: center; width: 100%;"><a href="${b.url}" target="_blank" rel="noopener noreferrer" class="post-download-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin: 0 auto; background-color: #E60012; color: #ffffff !important; padding: 11px 24px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 0.95rem; box-shadow: 0 3px 8px rgba(230,0,18,0.35); text-align: center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #ffffff;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span style="color: #ffffff !important; font-weight: 700;">${b.label || (isBn ? 'ডকুমেন্ট বা ফাইল ডাউনলোড (PDF)' : 'Download File')}</span></a></div>`
              : '';
          case 'video': {
            const embedUrl = formatVideoEmbedUrl(b.url);
            return embedUrl
              ? `<div class="post-video-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; margin: 16px 0; background-color: #000;"><iframe src="${embedUrl}" title="Video player" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`
              : '';
          }
          default:
            return '';
        }
      })
      .join('\n');
  };

  // Submit Post for Review (জমা দিন — Direct publish disallowed)
  const handleSubmitPost = async () => {
    if (!mainTitle) {
      showError(isBn ? 'অনুগ্রহ করে সংবাদের মূল শিরোনাম লিখুন।' : 'Please enter a post title.');
      return;
    }

    const compiledHtml = compileBlocksToHtml();

    const postPayload = {
      titleBn: mainTitle,
      titleEn: mainTitle,
      kicker: kicker || '',
      slug: slug || `post-${Date.now()}`,
      blocks: blocks,
      category: primaryCatId,
      categoryBn: primaryCatObj?.nameBn || 'বাংলাদেশ',
      categoryEn: primaryCatObj?.nameEn || 'Bangladesh',
      categories: selectedCategories,
      excerptBn: excerpt || mainTitle,
      excerptEn: excerpt || mainTitle,
      contentBn: compiledHtml,
      contentEn: compiledHtml,
      imageUrl: featuredImageUrl,
      cardCaption: cardCaption || 'ছবি: সংগৃহীত',
      cardCategory: cardCategoryDisplay,
      cardImagePosition: cardImagePosition,
      author: author || 'জনগণ নিউজ ডেস্ক',
      dateBn: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      dateEn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      views: 1,
      isLeadHero: Boolean(isLeadHero),
      isHighlighted: Boolean(isHighlighted),
      isBreaking: Boolean(isBreaking),
      isVideo: Boolean(isVideo),
      videoDuration: videoDuration || '০৩:৪৫',
      tags: tags,
      metaTitle: metaTitle || mainTitle,
      metaDesc: metaDesc || excerpt,
      focusKeyword: focusKeyword || '',
      status: postId ? (existingArticle?.status || postStatus || 'published') : 'draft'
    };

    let syncRes = null;
    if (postId) {
      syncRes = await updateArticle(postId, postPayload);
    } else {
      syncRes = await addArticle(postPayload);
    }

    if (syncRes && syncRes.success === false) {
      showWarning(
        isBn
          ? `সংবাদটি সংরক্ষিত হয়েছে, তবে সার্ভার নোটিশ: ${syncRes.error || 'Server notice'}`
          : `Post saved, but server notice: ${syncRes.error || 'Server notice'}`
      );
    } else {
      showSuccess(
        isBn
          ? (postId
              ? (isAlreadyPublished
                  ? 'সংবাদের পরিবর্তনসমূহ সংরক্ষিত হয়েছে এবং ওয়েবসাইটে সরাসরি লাইভ আপডেট সম্পন্ন হয়েছে।'
                  : 'সংবাদের পরিবর্তনসমূহ সফলভাবে সংরক্ষণ করা হয়েছে।')
              : 'সংবাদটি সফলভাবে সংরক্ষণ করা হয়েছে এবং সম্পাদকীয় পর্যালোচনার তালিকায় যুক্ত হয়েছে।')
          : (postId ? 'News post changes saved and updated live.' : 'News post saved successfully.'),
        isBn ? (postId ? 'আপডেট সম্পন্ন' : 'সংবাদ সংরক্ষণ সম্পন্ন') : 'Post Saved'
      );
    }

    if (typeof onSwitchToArticles === 'function') {
      setTimeout(() => onSwitchToArticles(), 1500);
    }
  };

  // Request For Approval (Directly moves to Approve Post tab with status pending_approval)
  const handleRequestApproval = async () => {
    if (!mainTitle) {
      showError(isBn ? 'অনুগ্রহ করে সংবাদের মূল শিরোনাম লিখুন।' : 'Please enter a post title.');
      return;
    }

    const compiledHtml = compileBlocksToHtml();

    const postPayload = {
      titleBn: mainTitle,
      titleEn: mainTitle,
      kicker: kicker || '',
      slug: slug || `post-${Date.now()}`,
      blocks: blocks,
      category: primaryCatId,
      categoryBn: primaryCatObj?.nameBn || 'বাংলাদেশ',
      categoryEn: primaryCatObj?.nameEn || 'Bangladesh',
      categories: selectedCategories,
      excerptBn: excerpt || mainTitle,
      excerptEn: excerpt || mainTitle,
      contentBn: compiledHtml,
      contentEn: compiledHtml,
      imageUrl: featuredImageUrl,
      cardCaption: cardCaption || 'ছবি: সংগৃহীত',
      cardCategory: cardCategoryDisplay,
      cardImagePosition: cardImagePosition,
      author: author || 'জনগণ নিউজ ডেস্ক',
      dateBn: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      dateEn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      views: 1,
      isLeadHero: Boolean(isLeadHero),
      isHighlighted: Boolean(isHighlighted),
      isBreaking: Boolean(isBreaking),
      isVideo: Boolean(isVideo),
      videoDuration: videoDuration || '০৩:৪৫',
      tags: tags,
      metaTitle: metaTitle || mainTitle,
      metaDesc: metaDesc || excerpt,
      focusKeyword: focusKeyword || '',
      status: 'pending_approval',
      approvalRequestedAt: new Date().toISOString()
    };

    let syncRes = null;
    if (postId) {
      syncRes = await updateArticle(postId, postPayload);
    } else {
      syncRes = await addArticle(postPayload);
    }

    if (syncRes && syncRes.success === false) {
      showWarning(
        isBn
          ? `অনুমোদনের আবেদন জমা হয়েছে, তবে সার্ভার নোটিশ: ${syncRes.error || 'Server notice'}`
          : `Submitted for review, but server notice: ${syncRes.error || 'Server notice'}`
      );
    } else {
      showSuccess(
        isBn
          ? 'সংবাদটি সফলভাবে সংরক্ষণ করা হয়েছে এবং অনুমোদনের জন্য সম্পাদকীয় প্যানেলে পাঠানো হয়েছে।'
          : 'Post successfully saved and submitted for editorial review.',
        isBn ? 'অনুমোদনের আবেদন সম্পন্ন' : 'Submitted for Approval'
      );
    }

    if (typeof onSwitchToArticles === 'function') {
      setTimeout(() => onSwitchToArticles(), 1500);
    }
  };

  // SEO Score calculation
  const getSeoHealth = () => {
    let score = 0;
    if (mainTitle.length >= 10) score += 25;
    if (focusKeyword && mainTitle.toLowerCase().includes(focusKeyword.toLowerCase())) score += 25;
    if (metaDesc.length >= 50 && metaDesc.length <= 160) score += 25;
    if (blocks.some((b) => b.type === 'image' && b.url)) score += 15;
    if (wordsCount >= 100) score += 10;
    return score;
  };

  const seoScore = getSeoHealth();

  return (
    <div className="create-post-master-wrap" style={{ display: 'flex', flexDirection: 'column', minHeight: '85vh', gap: 14 }}>
      {/* ========================================================
          STICKY TOP HEADER BAR
          ======================================================== */}
      <div
        className="admin-card"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          borderBottom: '2px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)'
        }}
      >
        {/* Left header controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Toggle Left Toolbar */}
          <button
            type="button"
            onClick={() => setIsLeftToolbarOpen((prev) => !prev)}
            className="admin-btn-secondary"
            style={{ padding: '7px 10px', fontSize: '0.85rem' }}
            title={isBn ? 'ইনসার্ট টুলবার টগল করুন' : 'Toggle Insert Toolbar'}
          >
            <Sliders size={16} />
          </button>

          {/* Title and Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.15rem',
                fontWeight: 800,
                margin: 0,
                color: 'var(--text-main)',
                maxWidth: 300,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {mainTitle || (isBn ? 'নতুন পোস্ট তৈরি' : 'New Post')}
            </h2>

            {isAlreadyPublished ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <CheckCircle size={11} />
                <span>{isBn ? 'লাইভ প্রকাশিত' : 'Published Live'}</span>
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#3B82F6',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Clock size={11} />
                <span>{isBn ? 'পর্যালোচনায় (Under Review)' : 'Under Review'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Center / Right header stats and action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Word Count & Reading Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid var(--border-color)'
            }}
          >
            <span>{wordsCount} {isBn ? 'শব্দ' : 'words'}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              <span>~{readingTimeMinutes} {isBn ? 'মিনিট পাঠ' : 'min read'}</span>
            </span>
          </div>

          {/* Auto-save Status */}
          <div
            style={{
              fontSize: '0.78rem',
              color: isAutoSaving ? 'var(--primary-red)' : '#16A34A',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              paddingRight: 6
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isAutoSaving ? 'var(--primary-red)' : '#16A34A'
              }}
            />
            <span>
              {isAutoSaving
                ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                : lastSavedTime
                ? (isBn ? `সংরক্ষিত (${lastSavedTime})` : `Saved (${lastSavedTime})`)
                : (isBn ? 'অটো-সেভ সক্রিয়' : 'Auto-save ready')}
            </span>
          </div>

          {/* Drafts Button */}
          <button
            type="button"
            onClick={() => setIsDraftsModalOpen(true)}
            className="admin-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.84rem' }}
            title={isBn ? 'সংরক্ষিত খসড়াগুলো দেখুন' : 'View Saved Drafts'}
          >
            <FolderOpen size={15} />
            <span>{isBn ? 'খসড়া সমূহ' : 'Drafts'}</span>
            {savedDrafts.length > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--primary-red)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  padding: '1px 5px',
                  borderRadius: 10,
                  fontWeight: 800
                }}
              >
                {savedDrafts.length}
              </span>
            )}
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleManualSaveDraft}
            className="admin-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: '0.84rem' }}
            title={isBn ? 'খসড়া সেভ করুন' : 'Save Draft'}
          >
            <Save size={15} />
            <span>{isBn ? 'খসড়া সেভ' : 'Save Draft'}</span>
          </button>

          {/* Discard Button */}
          <button
            type="button"
            onClick={handleDiscard}
            className="admin-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', fontSize: '0.84rem', color: '#EF4444' }}
            title={isBn ? 'সব মুছে ফেলুন' : 'Discard All'}
          >
            <Trash2 size={15} />
          </button>

          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="admin-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.84rem' }}
            title={isBn ? 'লাইভ প্রিভিউ ও ফটোকার্ড দেখুন' : 'Live Preview & Card'}
          >
            <Eye size={15} color="var(--primary-red)" />
            <span>{isBn ? 'প্রিভিউ' : 'Preview'}</span>
          </button>

          {/* SUBMIT POST BUTTON (জমা দিন - Direct Publish Disallowed) */}
          <button
            type="button"
            onClick={handleSubmitPost}
            className="admin-btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 22px',
              fontSize: '0.92rem',
              fontWeight: 800,
              backgroundColor: '#16A34A',
              color: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(22, 163, 74, 0.3)'
            }}
          >
            <Send size={16} />
            <span>
              {postId
                ? (isAlreadyPublished
                    ? (isBn ? 'আপডেট সংরক্ষণ করুন' : 'Save Updates')
                    : (isBn ? 'আপডেট জমা দিন' : 'Submit Update'))
                : (isBn ? 'জমা দিন' : 'Submit Post')}
            </span>
          </button>

          {/* Toggle Right Settings Sidebar */}
          <button
            type="button"
            onClick={() => setIsRightSidebarOpen((prev) => !prev)}
            className="admin-btn-secondary"
            style={{ padding: '7px 10px', fontSize: '0.85rem' }}
            title={isBn ? 'পোস্ট সেটিংস ও কার্ড প্রিভিউ টগল করুন' : 'Toggle Settings Sidebar'}
          >
            <Sliders size={16} />
          </button>
        </div>
      </div>

      {/* ========================================================
          MAIN THREE-COLUMN LAYOUT: [TOOLBAR] [EDITOR] [SIDEBAR]
          ======================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${isLeftToolbarOpen ? '200px' : '58px'} 1fr ${isRightSidebarOpen ? '380px' : '0px'}`,
          gap: 16,
          height: 'calc(100vh - 145px)',
          minHeight: 0,
          maxHeight: 'calc(100vh - 145px)',
          overflow: 'hidden',
          alignItems: 'start',
          transition: 'all 0.22s ease'
        }}
      >
        {/* ----------------------------------------------------
            LEFT COLUMN: BLOCK INSERT TOOLBAR (Strictly hugs content height)
            ---------------------------------------------------- */}
        <div
          className="admin-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: isLeftToolbarOpen ? '14px 10px' : '12px 6px',
            height: 'fit-content',
            maxHeight: '100%',
            alignSelf: 'start',
            overflowY: 'auto',
            alignItems: isLeftToolbarOpen ? 'stretch' : 'center',
            transition: 'all 0.22s ease',
            margin: 0
          }}
        >
          {/* Toolbar Header & Collapse Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isLeftToolbarOpen ? 'space-between' : 'center',
              paddingBottom: 8,
              borderBottom: '1px solid var(--border-color)',
              marginBottom: 4,
              width: '100%'
            }}
          >
            {isLeftToolbarOpen && (
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 }}>
                {isBn ? 'ব্লক যুক্ত করুন' : 'Elements'}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsLeftToolbarOpen((prev) => !prev)}
              className="admin-btn-secondary"
              style={{
                width: 28,
                height: 28,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6
              }}
              title={isLeftToolbarOpen ? (isBn ? 'আইকন মোডে ছোট করুন' : 'Collapse to Icons') : (isBn ? 'টুলবার প্রসারিত করুন' : 'Expand Toolbar')}
            >
              {isLeftToolbarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>

          {/* Block Buttons List (Clean Bengali Labels, Single Line Alignment) */}
          {[
            { type: 'heading', label: isBn ? 'শিরোনাম' : 'Heading', icon: Heading },
            { type: 'image', label: isBn ? 'ছবি ও ক্যাপশন' : 'Image & Caption', icon: ImageIcon },
            { type: 'paragraph', label: isBn ? 'অনুচ্ছেদ' : 'Paragraph', icon: Type },
            { type: 'blockquote', label: isBn ? 'উদ্ধৃতি' : 'Blockquote', icon: Quote },
            { type: 'list', label: isBn ? 'তালিকা' : 'List', icon: List },
            { type: 'table', label: isBn ? 'তথ্য টেবিল' : 'Data Table', icon: TableIcon },
            { type: 'code', label: isBn ? 'কোড ব্লক' : 'Code Block', icon: Code },
            { type: 'divider', label: isBn ? 'বিভাজক রেখা' : 'Divider', icon: Minus },
            { type: 'video', label: isBn ? 'ভিডিও এম্বেড' : 'Video Embed', icon: Video },
            { type: 'audio', label: isBn ? 'অডিও ক্লিপ' : 'Audio Clip', icon: Music },
            { type: 'verse', label: isBn ? 'কবিতা ও ছন্দ' : 'Verse', icon: Feather },
            { type: 'file', label: isBn ? 'ডাউনলোড ফাইল' : 'File Download', icon: FileDown }
          ].map((item) => {
            const IconComp = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => addBlock(item.type)}
                className="admin-btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isLeftToolbarOpen ? 'flex-start' : 'center',
                  gap: 10,
                  padding: isLeftToolbarOpen ? '8px 10px' : '9px 0',
                  width: '100%',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
                title={item.label}
              >
                <IconComp size={16} color="var(--primary-red)" style={{ flexShrink: 0 }} />
                {isLeftToolbarOpen && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* ----------------------------------------------------
            CENTER COLUMN: VISUAL BLOCK EDITOR (Smooth Independent Scroll)
            ---------------------------------------------------- */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            height: '100%',
            minHeight: 0,
            maxHeight: '100%',
            overflowY: 'auto',
            paddingRight: 8,
            paddingBottom: 60
          }}
        >
          {blocks.map((block, index) => {
            const isThisThumbnail = block.type === 'image' && Boolean(
              block.isThumbnail ||
              (!blocks.some((b) => b.type === 'image' && b.isThumbnail) && blocks.filter((b) => b.type === 'image')[0]?.id === block.id)
            );

            return (
              <div
                key={block.id}
                className="admin-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: isThisThumbnail ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                  transition: 'border-color 0.15s ease',
                  margin: 0,
                  flexShrink: 0
                }}
              >
                {/* Block Header Controls */}
                <div
                  style={{
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--primary-red)' }}>#{index + 1}</span>
                    <span style={{ textTransform: 'uppercase' }}>{block.type}</span>
                    {isThisThumbnail && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          padding: '2px 8px',
                          borderRadius: 12,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        title={isBn ? 'এই ছবিটি প্রধান থাম্বনেইল হিসেবে নির্বাচিত' : 'Selected as Main Article Thumbnail'}
                      >
                        <Star size={11} fill="#10B981" />
                        <span>{isBn ? 'মূল থাম্বনেইল' : 'Main Thumbnail'}</span>
                      </span>
                    )}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      disabled={index === 0}
                      style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: index === 0 ? 'var(--text-muted)' : 'var(--text-main)', cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      disabled={index === blocks.length - 1}
                      style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: index === blocks.length - 1 ? 'var(--text-muted)' : 'var(--text-main)', cursor: index === blocks.length - 1 ? 'not-allowed' : 'pointer' }}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      title="Remove Block"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Block Content Body */}
                <div style={{ padding: '16px 18px' }}>
                  {/* 1. HEADING BLOCK */}
                  {block.type === 'heading' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <select
                          className="admin-select"
                          style={{ width: 'auto', padding: '4px 10px', fontSize: '0.82rem' }}
                          value={block.level || 'h2'}
                          onChange={(e) => updateBlock(index, { level: e.target.value })}
                        >
                          <option value="h1">Main Title (H1)</option>
                          <option value="h2">Section Heading (H2)</option>
                          <option value="h3">Sub-section Heading (H3)</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        className="admin-input"
                        style={{
                          fontSize: block.level === 'h1' ? '1.35rem' : block.level === 'h2' ? '1.18rem' : '1.05rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-headline)'
                        }}
                        placeholder={isBn ? 'সংবাদের মূল শিরোনাম লিখুন...' : 'Enter news headline...'}
                        value={block.content || ''}
                        onChange={(e) => updateBlock(index, { content: e.target.value })}
                      />
                    </div>
                  )}

                  {/* 2. IMAGE BLOCK */}
                  {block.type === 'image' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Image Action Buttons: Upload from PC | Choose from B2 Gallery | Mark as Thumbnail */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            className="admin-btn-secondary"
                            onClick={() => document.getElementById(`image-input-${block.id}`)?.click()}
                            style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                          >
                            <Upload size={13} color="var(--primary-red)" />
                            <span>{isBn ? 'কম্পিউটার থেকে আপলোড' : 'Upload from Device'}</span>
                          </button>

                          <button
                            type="button"
                            className="admin-btn-secondary"
                            onClick={() => handleOpenMediaPicker(index)}
                            style={{
                              fontSize: '0.78rem',
                              padding: '5px 12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              backgroundColor: 'rgba(59, 130, 246, 0.12)',
                              borderColor: 'rgba(59, 130, 246, 0.35)',
                              color: '#60A5FA'
                            }}
                          >
                            <Folder size={13} />
                            <span>{isBn ? 'মিডিয়া গ্যালারি থেকে নির্বাচন (B2)' : 'Media Gallery (B2)'}</span>
                          </button>
                        </div>

                        {/* Mark as Thumbnail Button */}
                        <button
                          type="button"
                          onClick={() => handleMarkAsThumbnail(index)}
                          style={{
                            fontSize: '0.76rem',
                            padding: '5px 12px',
                            borderRadius: 6,
                            border: isThisThumbnail ? '1px solid #10B981' : '1px solid var(--border-color)',
                            backgroundColor: isThisThumbnail ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-subtle)',
                            color: isThisThumbnail ? '#10B981' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontWeight: isThisThumbnail ? 800 : 600,
                            transition: 'all 0.15s ease'
                          }}
                          title={isBn ? 'এই ছবিটিকে প্রধান থাম্বনেইল হিসেবে সেট করুন' : 'Mark this image as article thumbnail'}
                        >
                          <Star size={13} fill={isThisThumbnail ? '#10B981' : 'none'} color={isThisThumbnail ? '#10B981' : 'currentColor'} />
                          <span>{isThisThumbnail ? (isBn ? '✓ মূল থাম্বনেইল' : '✓ Main Thumbnail') : (isBn ? '☆ থাম্বনেইল হিসেবে সেট করুন' : 'Mark as Thumbnail')}</span>
                        </button>
                      </div>

                      {/* Dropzone / Preview Area */}
                      <div
                        style={{
                          border: '2px dashed var(--border-color)',
                          borderRadius: 8,
                          padding: 16,
                          textAlign: 'center',
                          backgroundColor: 'var(--bg-subtle)',
                          cursor: 'pointer'
                        }}
                        onClick={() => document.getElementById(`image-input-${block.id}`)?.click()}
                      >
                        <input
                          id={`image-input-${block.id}`}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleBlockImageUpload(index, e.target.files?.[0])}
                        />
                        {(block.url || block.previewUrl) ? (
                          <div style={{ position: 'relative' }}>
                            <img
                              src={block.url || block.previewUrl}
                              onError={(e) => {
                                if (block.previewUrl && e.currentTarget.src !== block.previewUrl) {
                                  e.currentTarget.src = block.previewUrl;
                                }
                              }}
                              alt={block.caption || 'Preview'}
                              style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 6, opacity: block.isUploading ? 0.6 : 1 }}
                            />
                            {block.isUploading && (
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'rgba(0,0,0,0.6)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 6,
                                  color: '#fff',
                                  gap: 6
                                }}
                              >
                                <div style={{ width: 22, height: 22, border: '3px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                                  {isBn ? 'WebP রূপান্তর ও ক্লাউড আপলোড হচ্ছে...' : 'Converting to WebP & uploading...'}
                                </div>
                              </div>
                            )}
                            <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {isBn ? 'ছবি পরিবর্তন করতে ক্লিক করুন অথবা উপরের বাটন ব্যবহার করুন' : 'Click to change image or use buttons above'}
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <Upload size={24} color="var(--primary-red)" />
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{isBn ? 'ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload image'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP (Max 15MB) • অথবা উপরের মিডিয়া গ্যালারি বাটন ব্যবহার করুন</div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder={isBn ? 'অথবা ছবির সরাসরি URL লিংক দিন...' : 'Or enter direct image URL...'}
                          value={block.url || ''}
                          onChange={(e) => updateBlock(index, { url: e.target.value })}
                          style={{ flex: 1 }}
                        />
                        <input
                          type="text"
                          className="admin-input"
                          placeholder={isBn ? 'ছবির ক্যাপশন / ক্রেডিট (যেমন: ছবি: সংগৃহীত)' : 'Image caption (e.g. Photo: Source)'}
                          value={block.caption || ''}
                          onChange={(e) => {
                            updateBlock(index, { caption: e.target.value });
                            setCardCaption(e.target.value);
                          }}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. PARAGRAPH BLOCK */}
                  {block.type === 'paragraph' && (
                    <ParagraphBlockEditor
                      block={block}
                      index={index}
                      isBn={isBn}
                      updateBlock={updateBlock}
                      executeFormatCmd={executeFormatCmd}
                      handleOpenLinkModal={handleOpenLinkModal}
                    />
                  )}

                  {/* 4. BLOCKQUOTE BLOCK */}
                  {block.type === 'blockquote' && (
                    <div style={{ borderLeft: '4px solid var(--primary-red)', paddingLeft: 14 }}>
                      <textarea
                        className="admin-textarea"
                        rows={3}
                        style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-main)' }}
                        placeholder={isBn ? 'এখানে উদ্ধৃতি / উক্তি লিখুন...' : 'Enter quote text here...'}
                        value={block.content || ''}
                        onChange={(e) => updateBlock(index, { content: e.target.value })}
                      />
                    </div>
                  )}

                  {/* 5. LIST BLOCK */}
                  {block.type === 'list' && (
                    <div>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <button
                          type="button"
                          className={block.listType === 'bullet' ? 'admin-btn-primary' : 'admin-btn-secondary'}
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => updateBlock(index, { listType: 'bullet' })}
                        >
                          Bullet List
                        </button>
                        <button
                          type="button"
                          className={block.listType === 'numbered' ? 'admin-btn-primary' : 'admin-btn-secondary'}
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => updateBlock(index, { listType: 'numbered' })}
                        >
                          Numbered List
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(block.items || []).map((item, itemIdx) => (
                          <div key={itemIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'var(--primary-red)', fontWeight: 800, width: 20 }}>
                              {block.listType === 'numbered' ? `${itemIdx + 1}.` : '•'}
                            </span>
                            <input
                              type="text"
                              className="admin-input"
                              value={item}
                              onChange={(e) => {
                                const newItems = [...(block.items || [])];
                                newItems[itemIdx] = e.target.value;
                                updateBlock(index, { items: newItems });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = (block.items || []).filter((_, i) => i !== itemIdx);
                                updateBlock(index, { items: newItems });
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            updateBlock(index, { items: [...(block.items || []), `তালিকা আইটেম ${(block.items || []).length + 1}`] });
                          }}
                          className="admin-btn-secondary"
                          style={{ width: 'fit-content', padding: '4px 12px', fontSize: '0.82rem', marginTop: 6 }}
                        >
                          <Plus size={14} />
                          <span>{isBn ? '+ নতুন আইটেম যোগ করুন' : '+ Add List Item'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 6. DATA TABLE BLOCK */}
                  {block.type === 'table' && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                        <thead>
                          <tr>
                            {(block.headers || []).map((head, hIdx) => (
                              <th key={hIdx} style={{ border: '1px solid var(--border-color)', padding: 8, backgroundColor: 'var(--bg-subtle)' }}>
                                <input
                                  type="text"
                                  className="admin-input"
                                  style={{ fontWeight: 800, textAlign: 'center' }}
                                  value={head}
                                  onChange={(e) => {
                                    const newHeaders = [...(block.headers || [])];
                                    newHeaders[hIdx] = e.target.value;
                                    updateBlock(index, { headers: newHeaders });
                                  }}
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(block.rows || []).map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} style={{ border: '1px solid var(--border-color)', padding: 6 }}>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    value={cell}
                                    onChange={(e) => {
                                      const newRows = [...(block.rows || [])];
                                      newRows[rIdx][cIdx] = e.target.value;
                                      updateBlock(index, { rows: newRows });
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                          onClick={() => {
                            const newRows = [...(block.rows || []), new Array((block.headers || []).length).fill('নতুন তথ্য')];
                            updateBlock(index, { rows: newRows });
                          }}
                        >
                          + Add Row
                        </button>
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                          onClick={() => {
                            const newHeaders = [...(block.headers || []), `কলাম ${(block.headers || []).length + 1}`];
                            const newRows = (block.rows || []).map((r) => [...r, 'নতুন তথ্য']);
                            updateBlock(index, { headers: newHeaders, rows: newRows });
                          }}
                        >
                          + Add Column
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 7. CODE BLOCK */}
                  {block.type === 'code' && (
                    <div>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                        <select
                          className="admin-select"
                          style={{ width: 140, padding: '4px 8px', fontSize: '0.82rem' }}
                          value={block.lang || 'javascript'}
                          onChange={(e) => updateBlock(index, { lang: e.target.value })}
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="php">PHP</option>
                          <option value="python">Python</option>
                          <option value="sql">SQL</option>
                          <option value="bash">Bash</option>
                        </select>
                      </div>
                      <textarea
                        className="admin-textarea"
                        rows={5}
                        style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                        placeholder="// Paste or write code here..."
                        value={block.code || ''}
                        onChange={(e) => updateBlock(index, { code: e.target.value })}
                      />
                    </div>
                  )}

                  {/* 8. DIVIDER BLOCK */}
                  {block.type === 'divider' && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <hr style={{ border: 'none', borderTop: '2px dashed var(--border-color)', margin: '10px 0' }} />
                      <span style={{ fontSize: '0.75rem' }}>{isBn ? 'বিভাজক রেখা' : 'Section Divider'}</span>
                    </div>
                  )}

                  {/* 9. VIDEO BLOCK */}
                  {block.type === 'video' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        type="url"
                        className="admin-input"
                        placeholder="YouTube / Vimeo embed link or direct video URL"
                        value={block.url || ''}
                        onChange={(e) => updateBlock(index, { url: e.target.value })}
                      />
                      {block.url && (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, backgroundColor: '#000' }}>
                          <iframe
                            src={formatVideoEmbedUrl(block.url)}
                            title="Video Preview"
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* 10. AUDIO BLOCK */}
                  {block.type === 'audio' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Audio File URL (mp3/wav) or direct link"
                        value={block.url || ''}
                        onChange={(e) => updateBlock(index, { url: e.target.value })}
                      />
                      {block.url && <audio controls src={block.url} style={{ width: '100%', marginTop: 6 }} />}
                    </div>
                  )}

                  {/* 11. VERSE BLOCK */}
                  {block.type === 'verse' && (
                    <div>
                      <textarea
                        className="admin-textarea"
                        rows={4}
                        style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 2, fontSize: '1rem' }}
                        placeholder={isBn ? 'এখানে কবিতা বা ছন্দ লিখুন...' : 'Enter verse or poem here...'}
                        value={block.content || ''}
                        onChange={(e) => updateBlock(index, { content: e.target.value })}
                      />
                    </div>
                  )}

                  {/* 12. FILE DOWNLOAD BLOCK */}
                  {block.type === 'file' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Button label (e.g. Download PDF)"
                        value={block.label || ''}
                        onChange={(e) => updateBlock(index, { label: e.target.value })}
                      />
                      <input
                        type="url"
                        className="admin-input"
                        placeholder="File URL"
                        value={block.url || ''}
                        onChange={(e) => updateBlock(index, { url: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bottom Add Block Fast Strip */}
          <div
            style={{
              padding: '14px',
              border: '2px dashed var(--border-color)',
              borderRadius: 8,
              textAlign: 'center',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flexWrap: 'wrap',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {isBn ? '+ নিচে দ্রুত ব্লক যোগ করুন:' : '+ Quick Insert Block:'}
            </span>
            <button type="button" onClick={() => addBlock('heading')} className="admin-btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>+ Heading</button>
            <button type="button" onClick={() => addBlock('paragraph')} className="admin-btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>+ Paragraph</button>
            <button type="button" onClick={() => addBlock('image')} className="admin-btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>+ Image</button>
            <button type="button" onClick={() => addBlock('blockquote')} className="admin-btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>+ Quote</button>
            <button type="button" onClick={() => addBlock('list')} className="admin-btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>+ List</button>
            <button type="button" onClick={() => addBlock('table')} className="admin-btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>+ Table</button>
            <button type="button" onClick={() => addBlock('video')} className="admin-btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>+ Video</button>
          </div>
        </div>

        {/* ----------------------------------------------------
            RIGHT COLUMN: SETTINGS, SOCIAL CARD & METADATA SIDEBAR (Independent Scroll)
            ---------------------------------------------------- */}
        {isRightSidebarOpen && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              height: '100%',
              minHeight: 0,
              maxHeight: '100%',
              overflowY: 'auto',
              paddingRight: 6,
              paddingBottom: 60
            }}
          >
            {/* Card 0: Live 16:9 Thumbnail Preview & 3x3 Grid Position Selector (Task 6) */}
            <div className="admin-card" style={{ padding: '16px 18px', border: '2px solid var(--border-color)', margin: 0, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.96rem', fontWeight: 800, margin: 0, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={16} />
                  <span>{isBn ? 'থাম্বনেইল প্রিভিউ ও পজিশন' : 'Thumbnail Preview & Position'}</span>
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-red)', fontWeight: 800, backgroundColor: 'rgba(230,0,18,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(230,0,18,0.2)' }}>
                  {isBn
                    ? (GRID_POSITIONS.find((p) => p.id === (cardImagePosition || 'center center').toLowerCase())?.bn || cardImagePosition)
                    : (GRID_POSITIONS.find((p) => p.id === (cardImagePosition || 'center center').toLowerCase())?.label || cardImagePosition)}
                </span>
              </div>

              {/* 16:9 Live Thumbnail Display */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: '#1E1E1E',
                  border: '1px solid var(--border-color)',
                  marginBottom: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                }}
              >
                <img
                  src={featuredImageUrl}
                  alt="Post Thumbnail"
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: cardImagePosition || 'center center',
                    display: 'block',
                    transition: 'object-position 0.2s ease'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 700,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {isBn ? '16:9 থাম্বনেইল' : '16:9 Thumbnail'}
                </div>
              </div>

              {/* 3x3 Grid Position Controls for Thumbnail Focus */}
              <div style={{ marginTop: 6, paddingTop: 8, borderTop: '1px dashed var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 700 }}>
                    <Crosshair size={13} color="var(--primary-red)" />
                    <span>{isBn ? 'থাম্বনেইল ফোকাস (3×3 Grid):' : 'Thumbnail Focus (3×3 Grid):'}</span>
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isBn ? 'পজিশন বেছে নিন' : 'Select Position'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, width: '100%', marginTop: 4 }}>
                  {GRID_POSITIONS.map((pos) => {
                    const isSelected = (cardImagePosition || 'center center').toLowerCase() === pos.id.toLowerCase();
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setCardImagePosition(pos.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 3,
                          padding: '6px 3px',
                          fontSize: '0.72rem',
                          fontWeight: isSelected ? 800 : 500,
                          borderRadius: 6,
                          border: isSelected ? '1px solid var(--primary-red)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(230, 0, 18, 0.18)' : 'var(--bg-subtle, #232731)',
                          color: isSelected ? 'var(--primary-red)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 0 6px rgba(230,0,18,0.35)' : 'none'
                        }}
                        title={`${pos.label} (${pos.bn})`}
                      >
                        <span style={{ fontSize: '0.78rem', lineHeight: 1 }}>{pos.arrow}</span>
                        <span style={{ fontSize: '0.66rem', whiteSpace: 'nowrap' }}>{isBn ? pos.bn : pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Card 1: Live Auto-Generated Social News Card (Strictly View-Only) */}
            <div className="admin-card" style={{ padding: '16px 18px', border: '2px solid var(--border-color)', margin: 0, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.96rem', fontWeight: 800, margin: 0, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Camera size={16} />
                  <span>{isBn ? 'অটো-জেনারেটেড সোশ্যাল ফটোকার্ড' : 'Auto-Generated News Card'}</span>
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Lock size={12} />
                  <span>View Only</span>
                </span>
              </div>

              {/* Live Rendered Card Component */}
              <div style={{ marginBottom: 14 }}>
                <SocialNewsCardPreview
                  isBn={isBn}
                  language={isBn ? 'bn' : 'en'}
                  title={mainTitle}
                  kicker={kicker}
                  imageUrl={featuredImageUrl}
                  caption={cardCaption}
                  category={cardCategoryDisplay}
                  dateBn={new Date(publishDate).toLocaleDateString(isBn ? 'bn-BD' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  imagePosition={cardImagePosition}
                  onPositionChange={setCardImagePosition}
                />
              </div>

              {/* Card Sub-headline (Kicker) Input */}
              <div className="admin-form-group" style={{ marginBottom: 10 }}>
                <label className="admin-label">{isBn ? 'কার্ড সাব-হেডলাইন / কিকার (ঐচ্ছিক)' : 'Card Sub-Headline / Kicker (Optional)'}</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder={isBn ? 'যেমন: অর্থবছর ২০২৪-২৫ থেকে ২৫-২৬' : 'e.g. FY 2024-25 to 25-26'}
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                />
              </div>

              {/* Card Footer Category ({sub_group} | {category}) Input */}
              <div className="admin-form-group" style={{ marginBottom: 10 }}>
                <label className="admin-label">{isBn ? 'কার্ড ফুটার ক্যাটাগরি (সাব-গ্রুপ । ক্যাটাগরি)' : 'Card Footer Category (Sub-Group | Category)'}</label>
                <input
                  type="text"
                  className="admin-input"
                  value={cardCategory}
                  onChange={(e) => setCardCategory(e.target.value)}
                  placeholder={getCardCategoryLabel(selectedCategories[0], categoryMasterGroups, categories)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">{isBn ? 'ছবির ক্রেডিট / ক্যাপশন' : 'Photo Credit / Caption'}</label>
                <input
                  type="text"
                  className="admin-input"
                  value={cardCaption}
                  onChange={(e) => setCardCaption(e.target.value)}
                  placeholder={isBn ? 'ছবি: সংগৃহীত' : 'Photo: Collected'}
                />
              </div>
            </div>

            {/* Card 2: Submission & Status Settings */}
            <div className="admin-card" style={{ padding: '16px 18px', margin: 0, flexShrink: 0 }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.95rem', fontWeight: 800, marginBottom: 12, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={16} />
                <span>{isBn ? 'পোস্ট জমা ও সময়সূচি' : 'Submission & Metadata'}</span>
              </h3>

              <div className="admin-form-group" style={{ marginBottom: 12 }}>
                <label className="admin-label">{isBn ? 'স্লাগ / URL' : 'Slug / URL'}</label>
                <input type="text" className="admin-input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-slug-url" />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 12 }}>
                <label className="admin-label">{isBn ? 'প্রকাশের তারিখ' : 'Publish Date'}</label>
                <input type="date" className="admin-input" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 12 }}>
                <label className="admin-label">{isBn ? 'সংক্ষিপ্ত বিবরণ (Excerpt)' : 'Short Excerpt'}</label>
                <textarea className="admin-textarea" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary for listings..." />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">{isBn ? 'প্রতিবেদক / লেখকের নাম' : 'Author Name'}</label>
                <input type="text" className="admin-input" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>

              {/* Submission Action Buttons in Sidebar */}
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleRequestApproval}
                  className="admin-btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '10px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    backgroundColor: '#D97706',
                    borderColor: '#D97706',
                    color: '#FFFFFF'
                  }}
                  title={isBn ? 'পোস্টটি অনুমোদনের জন্য "Approve Post" ট্যাবে পাঠান' : 'Submit to Approve Post tab'}
                >
                  <Send size={15} />
                  <span>{isBn ? 'Request For Approval' : 'Request For Approval'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitPost}
                  className="admin-btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700
                  }}
                  title={isBn ? 'খসড়া বা পর্যালোচনার জন্য জমা রাখুন' : 'Save / Submit as Review'}
                >
                  <Save size={14} />
                  <span>{isBn ? 'খসড়া জমা দিন' : 'Save as Draft / Review'}</span>
                </button>
              </div>
            </div>

            {/* Card 3: Special Highlights & Badges */}
            <div className="admin-card" style={{ padding: '16px 18px', margin: 0, flexShrink: 0 }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.95rem', fontWeight: 800, marginBottom: 12, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={16} />
                <span>{isBn ? 'বিশেষ ডিসপ্লে ফিচার' : 'Display Options'}</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isLeadHero} onChange={(e) => setIsLeadHero(e.target.checked)} />
                  <span>{isBn ? 'প্রধান লিড নিউজ (Lead Hero)' : 'Make Lead Hero'}</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isHighlighted} onChange={(e) => setIsHighlighted(e.target.checked)} />
                  <span>{isBn ? 'হাইলাইটেড সংবাদ (Highlighted)' : 'Highlighted Story'}</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} />
                  <span>{isBn ? 'জরুরি ব্রেকিং এলার্ট (Breaking)' : 'Breaking Alert'}</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isVideo} onChange={(e) => setIsVideo(e.target.checked)} />
                  <span>{isBn ? 'ভিডিও নিউজ সেকশন (Video News)' : 'Video News Item'}</span>
                </label>

                {isVideo && (
                  <input
                    type="text"
                    className="admin-input"
                    placeholder={isBn ? 'ভিডিও ব্যপ্তিকাল (যেমন: ০৩:৪৫)' : 'Duration (e.g. 03:45)'}
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    style={{ marginTop: 4 }}
                  />
                )}
              </div>
            </div>

            {/* Card 4: Categories from MariaDB */}
            <div className="admin-card" style={{ padding: '16px 18px', margin: 0, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Folder size={16} />
                  <span>{isBn ? 'ক্যাটাগরি নির্বাচন' : 'Categories'}</span>
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {categories.length} {isBn ? 'টি ক্যাটাগরি' : 'Categories'}
                </span>
              </div>

              {/* Live search input for fast category discovery */}
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="admin-input"
                  style={{ paddingLeft: 26, fontSize: '0.78rem', height: 30 }}
                  placeholder={isBn ? `ক্যাটাগরি খুঁজুন (${categories.length}টি)...` : 'Search categories...'}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
                {categorySearch && (
                  <button
                    type="button"
                    onClick={() => setCategorySearch('')}
                    style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Scrollable Categories List */}
              <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, paddingRight: 4 }}>
                {categories
                  .filter((cat) => {
                    if (!categorySearch.trim()) return true;
                    const q = categorySearch.toLowerCase().trim();
                    const name = (cat.nameBn || cat.name || '').toLowerCase();
                    const nameEn = (cat.nameEn || cat.slug || '').toLowerCase();
                    return name.includes(q) || nameEn.includes(q);
                  })
                  .map((cat) => (
                    <label key={cat.id || cat.slug} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id || cat.slug)}
                        onChange={() => toggleCategory(cat.id || cat.slug)}
                      />
                      <span>{isBn ? cat.nameBn || cat.name : cat.nameEn || cat.slug || cat.nameBn}</span>
                    </label>
                  ))}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className="admin-input"
                  style={{ fontSize: '0.8rem', padding: '5px 8px' }}
                  placeholder={isBn ? 'নতুন ক্যাটাগরি...' : 'New Category...'}
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                />
                <button type="button" onClick={handleQuickAddCategory} className="admin-btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                  {isBn ? 'যোগ' : 'Add'}
                </button>
              </div>
            </div>

            {/* Card 5: Tags */}
            <div className="admin-card" style={{ padding: '16px 18px', margin: 0, flexShrink: 0 }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.95rem', fontWeight: 800, marginBottom: 12, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tags size={16} />
                <span>{isBn ? 'ট্যাগ সমূহ (Tags)' : 'Tags'}</span>
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      padding: '3px 8px',
                      borderRadius: 14,
                      fontSize: '0.78rem'
                    }}
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className="admin-input"
                  style={{ fontSize: '0.8rem', padding: '5px 8px' }}
                  placeholder={isBn ? 'ট্যাগ লিখে Enter চাপুন...' : 'Type tag and Add...'}
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button type="button" onClick={handleAddTag} className="admin-btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                  {isBn ? 'যোগ' : 'Add'}
                </button>
              </div>
            </div>

            {/* Card 6: SEO & Meta Optimization */}
            <div className="admin-card" style={{ padding: '16px 18px', margin: 0, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Search size={16} />
                  <span>{isBn ? 'এসইও ও মেটা অপটিমাইজেশন' : 'SEO Optimization'}</span>
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: seoScore >= 75 ? 'rgba(22, 163, 74, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: seoScore >= 75 ? '#16A34A' : '#F59E0B'
                  }}
                >
                  Score: {seoScore}/100
                </span>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 12 }}>
                <label className="admin-label">{isBn ? 'মেটা টাইটেল (Meta Title)' : 'Meta Title'}</label>
                <input type="text" className="admin-input" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO Title..." />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="admin-label">{isBn ? 'মেটা ডেসক্রিপশন (Meta Desc)' : 'Meta Description'}</label>
                  <span style={{ fontSize: '0.72rem', color: metaDesc.length > 160 ? '#EF4444' : 'var(--text-muted)' }}>
                    {metaDesc.length} / 160
                  </span>
                </div>
                <textarea className="admin-textarea" rows={3} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="150-160 characters..." />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">{isBn ? 'ফোকাস কি-ওয়ার্ড (Focus Keyword)' : 'Focus Keyword'}</label>
                <input type="text" className="admin-input" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="e.g. বাংলাদেশ নির্বাচন" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: SAVED DRAFTS MODAL
          ======================================================== */}
      {isDraftsModalOpen && (
        <div
          className="app-popup-overlay"
          onClick={() => setIsDraftsModalOpen(false)}
        >
          <div
            className="app-popup-card"
            style={{ width: '100%', maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                {isBn ? 'সংরক্ষিত খসড়া পোস্ট সমূহ (Saved Drafts)' : 'Saved Draft Posts'}
              </h3>
              <button type="button" onClick={() => setIsDraftsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', maxHeight: '60vh', overflowY: 'auto' }}>
              {savedDrafts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  {isBn ? 'কোনো সংরক্ষিত খসড়া নেই।' : 'No saved drafts found.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {savedDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: 4 }}>
                          {draft.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {isBn ? 'আপডেট:' : 'Updated:'} {new Date(draft.updatedAt).toLocaleString()} • {draft.blocks?.length || 0} {isBn ? 'টি ব্লক' : 'blocks'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleLoadDraft(draft)}
                          className="admin-btn-primary"
                          style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                        >
                          {isBn ? 'লোড করুন' : 'Load'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="admin-btn-secondary"
                          style={{ padding: '5px 8px', color: '#EF4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: RESPONSIVE LIVE PREVIEW & SOCIAL CARD MODAL
          ======================================================== */}
      {isPreviewModalOpen && (
        <div
          className="app-popup-overlay"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="app-popup-card"
            style={{
              width: previewTab === 'card' ? 560 : previewDevice === 'mobile' ? 420 : previewDevice === 'tablet' ? 760 : 960,
              maxWidth: '96vw',
              maxHeight: '92vh',
              transition: 'width 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Modal Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-subtle)' }}>
              {/* Tab Selector: Photo Card vs Full Article */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setPreviewTab('card')}
                  className={previewTab === 'card' ? 'admin-btn-primary' : 'admin-btn-secondary'}
                  style={{ padding: '5px 12px', fontSize: '0.82rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Camera size={14} />
                  <span>{isBn ? 'সোশ্যাল ফটোকার্ড' : 'Social News Card'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab('article')}
                  className={previewTab === 'article' ? 'admin-btn-primary' : 'admin-btn-secondary'}
                  style={{ padding: '5px 12px', fontSize: '0.82rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FileText size={14} />
                  <span>{isBn ? 'সম্পূর্ণ আর্টিকেল' : 'Full Article View'}</span>
                </button>
              </div>

              {/* Device switcher (when in Article tab) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {previewTab === 'article' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={previewDevice === 'desktop' ? 'admin-btn-primary' : 'admin-btn-secondary'}
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('tablet')}
                      className={previewDevice === 'tablet' ? 'admin-btn-primary' : 'admin-btn-secondary'}
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      Tablet
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={previewDevice === 'mobile' ? 'admin-btn-primary' : 'admin-btn-secondary'}
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      Mobile
                    </button>
                  </>
                )}
                <button type="button" onClick={() => setIsPreviewModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 8 }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Preview Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '78vh' }}>
              {previewTab === 'card' ? (
                /* 1. AUTO-GENERATED SOCIAL PHOTO CARD */
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginBottom: 2 }}>
                      {isBn ? 'জনগণ.নিউজ অফিসিয়াল সোশ্যাল মিডিয়া ফটোকার্ড' : 'Official Jonogon News Social Card'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {isBn ? 'টাইটেল ও ছবি অনুযায়ী স্বয়ংক্রিয়ভাবে জেনারেট হচ্ছে (কপি বা স্ক্রিনশট নিষ্ক্রিয়)' : 'Auto-generated in real-time (View-Only)'}
                    </div>
                  </div>

                  <SocialNewsCardPreview
                    title={mainTitle}
                    kicker={kicker}
                    imageUrl={featuredImageUrl}
                    caption={cardCaption}
                    category={cardCategoryDisplay}
                    dateBn={new Date(publishDate).toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' })}
                    imagePosition={cardImagePosition}
                    onPositionChange={setCardImagePosition}
                  />
                </div>
              ) : (
                /* 2. FULL ARTICLE PREVIEW */
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ backgroundColor: 'var(--primary-red)', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 800 }}>
                      {primaryCatName?.toUpperCase() || 'NEWS'}
                    </span>
                  </div>

                  <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: previewDevice === 'mobile' ? '1.5rem' : '2.1rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 14 }}>
                    {mainTitle || 'সংবাদের মূল শিরোনাম'}
                  </h1>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '1px solid var(--border-color)', marginBottom: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <User size={14} />
                      <span>{author}</span>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={14} />
                      <span>{publishDate}</span>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={14} />
                      <span>~{readingTimeMinutes} min read</span>
                    </span>
                  </div>

                  {/* Render Compiled Blocks HTML */}
                  <div
                    className="article-preview-content"
                    style={{ fontSize: '1.02rem', lineHeight: 1.85, color: 'var(--text-main)' }}
                    dangerouslySetInnerHTML={{ __html: compileBlocksToHtml() }}
                  />

                  {/* Tags in preview */}
                  {tags.length > 0 && (
                    <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {tags.map((t) => (
                        <span key={t} style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-subtle, rgba(0,0,0,0.25))',
                borderRadius: '0 0 12px 12px'
              }}
            >
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                <X size={15} />
                <span>{isBn ? 'বন্ধ করুন' : 'Close'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    handleManualSaveDraft();
                  }}
                >
                  <Save size={15} />
                  <span>{isBn ? 'খসড়া সেভ করুন' : 'Save Draft'}</span>
                </button>

                <button
                  type="button"
                  className="admin-btn-success"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    handleSubmitPost();
                  }}
                >
                  <Send size={15} />
                  <span>{postId ? (isBn ? 'আপডেট জমা দিন' : 'Submit Update') : (isBn ? 'জমা দিন' : 'Submit Post')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CUSTOM LINK INSERT MODAL (Sleek Glassmorphism UI)
          ======================================================== */}
      {isLinkModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setIsLinkModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              width: 460,
              maxWidth: '95vw',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex'
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(230, 0, 18, 0.12)',
                  color: 'var(--primary-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Link size={20} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {isBn ? 'টেক্সটে লিংক যুক্ত করুন' : 'Insert Web Link'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {isBn ? 'ওয়েবসাইটের গন্তব্য ঠিকানা (URL) দিন' : 'Enter external or internal destination URL'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleApplyLinkModal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-label" style={{ fontSize: '0.84rem' }}>
                  {isBn ? 'লিংক URL *' : 'Destination URL *'}
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="https://example.com"
                  value={linkModalData.url}
                  onChange={(e) => setLinkModalData({ ...linkModalData, url: e.target.value })}
                  autoFocus
                  required
                />
              </div>

              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-label" style={{ fontSize: '0.84rem' }}>
                  {isBn ? 'প্রদর্শনযোগ্য টেক্সট (ঐচ্ছিক)' : 'Display Text (Optional)'}
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder={isBn ? 'যেমন: বিস্তারিত পড়ুন' : 'e.g. Read more'}
                  value={linkModalData.text}
                  onChange={(e) => setLinkModalData({ ...linkModalData, text: e.target.value })}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={linkModalData.openInNewTab}
                  onChange={(e) => setLinkModalData({ ...linkModalData, openInNewTab: e.target.checked })}
                />
                <span>{isBn ? 'নতুন ট্যাবে লিঙ্কটি খুলুন (Open in new tab)' : 'Open link in new tab'}</span>
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsLinkModalOpen(false)}
                  style={{ padding: '8px 16px', fontSize: '0.86rem' }}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.86rem', fontWeight: 800 }}
                >
                  <Check size={16} />
                  <span>{isBn ? 'লিংক যোগ করুন' : 'Apply Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MEDIA GALLERY PICKER MODAL (B2 Cloud Storage)
          ======================================================== */}
      {isMediaPickerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsMediaPickerOpen(false)}
        >
          <div
            className="app-popup-card"
            style={{
              width: 920,
              maxWidth: '96vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-card, #1A1D24)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: 'rgba(230, 0, 18, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-red)'
                  }}
                >
                  <Folder size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isBn ? 'মিডিয়া গ্যালারি থেকে ছবি নির্বাচন' : 'Select Image from Media Gallery'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {isBn ? 'Backblaze B2 ক্লাউডে সংরক্ষিত সকল সংবাদ ছবি' : 'All news assets stored in B2 Cloud Storage'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={fetchMediaForPicker}
                  className="admin-btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw size={13} className={isMediaGalleryLoading ? 'animate-spin' : ''} />
                  <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                backgroundColor: 'var(--bg-card)'
              }}
            >
              {/* Search Box */}
              <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 380 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="admin-input"
                  style={{ paddingLeft: 30, fontSize: '0.82rem', padding: '6px 10px 6px 30px' }}
                  placeholder={isBn ? 'ছবির নাম বা কীওয়ার্ড খুঁজুন...' : 'Search by name or keyword...'}
                  value={mediaPickerSearch}
                  onChange={(e) => setMediaPickerSearch(e.target.value)}
                />
                {mediaPickerSearch && (
                  <button
                    type="button"
                    onClick={() => setMediaPickerSearch('')}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Format Filter Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={13} color="var(--text-muted)" />
                {['all', 'webp', 'jpg', 'png'].map((fmt) => {
                  const isActive = mediaPickerFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setMediaPickerFormat(fmt)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: '0.74rem',
                        fontWeight: isActive ? 800 : 500,
                        border: isActive ? '1px solid var(--primary-red)' : '1px solid var(--border-color)',
                        backgroundColor: isActive ? 'rgba(230, 0, 18, 0.15)' : 'transparent',
                        color: isActive ? 'var(--primary-red)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                    >
                      {fmt === 'all' ? (isBn ? 'সকল' : 'All') : fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Media Grid Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
                minHeight: 280,
                maxHeight: '58vh'
              }}
            >
              {isMediaGalleryLoading ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary-red)' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                    {isBn ? 'ক্লাউড মিডিয়া গ্যালারি লোড হচ্ছে...' : 'Loading media gallery from B2 storage...'}
                  </div>
                </div>
              ) : (() => {
                const filtered = mediaGalleryList.filter((item) => {
                  if (mediaPickerSearch.trim()) {
                    const q = mediaPickerSearch.toLowerCase().trim();
                    const matchName = (item.original_name || '').toLowerCase().includes(q);
                    const matchKey = (item.storage_key || '').toLowerCase().includes(q);
                    const matchNews = (item.associated_news || '').toLowerCase().includes(q);
                    if (!matchName && !matchKey && !matchNews) return false;
                  }
                  if (mediaPickerFormat !== 'all') {
                    const fmt = (item.file_format || 'webp').toLowerCase();
                    if (fmt !== mediaPickerFormat.toLowerCase()) return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={44} style={{ margin: '0 auto 12px', opacity: 0.35 }} />
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                        {isBn ? 'কোনো মিডিয়া ছবি পাওয়া যায়নি' : 'No images found'}
                      </div>
                      <div style={{ fontSize: '0.8rem' }}>
                        {mediaPickerSearch
                          ? (isBn ? 'অন্য কোনো কীওয়ার্ড দিয়ে অনুসন্ধান করুন।' : 'Try a different search keyword.')
                          : (isBn ? 'কম্পিউটার থেকে ছবি আপলোড করলে তা স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।' : 'Upload images from your device to see them here.')}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                      gap: 14
                    }}
                  >
                    {filtered.map((item) => {
                      const itemUrl = item.public_url || item.b2_url || item.url || '';
                      const itemName = item.original_name || 'image.webp';
                      const itemFormat = (item.file_format || 'webp').toUpperCase();
                      const sizeKb = Math.round((item.size_bytes || 50000) / 1024);

                      return (
                        <div
                          key={item.id || itemUrl}
                          onClick={() => handleSelectMediaFromPicker(item)}
                          style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: 8,
                            overflow: 'hidden',
                            backgroundColor: 'var(--bg-subtle)',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary-red)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          title={isBn ? `সিলেক্ট করতে ক্লিক করুন: ${itemName}` : `Click to select: ${itemName}`}
                        >
                          {/* Image Thumbnail */}
                          <div style={{ position: 'relative', width: '100%', paddingBottom: '70%', backgroundColor: '#111827', overflow: 'hidden' }}>
                            <img
                              src={itemUrl}
                              alt={itemName}
                              loading="lazy"
                              style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                color: '#fff',
                                padding: '1px 5px',
                                borderRadius: 3,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                letterSpacing: 0.5
                              }}
                            >
                              {itemFormat}
                            </span>
                          </div>

                          {/* Info */}
                          <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {itemName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              <span>{sizeKb > 0 ? `${sizeKb} KB` : 'Cloud'}</span>
                              <span style={{ color: 'var(--primary-red)', fontWeight: 700 }}>
                                {isBn ? 'সিলেক্ট করুন' : 'Select'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}
            >
              <span>{isBn ? '💡 যে কোনো ছবিতে ক্লিক করলেই তা বর্তমান ইমেজ ব্লকে সেট হবে।' : '💡 Click any image to insert it into the active block.'}</span>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setIsMediaPickerOpen(false)}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dedicated Sub-component for Paragraph Block to preserve full browser native Undo/Redo (Ctrl+Z / Ctrl+Y)
function ParagraphBlockEditor({ block, index, isBn, updateBlock, executeFormatCmd, handleOpenLinkModal }) {
  const editorRef = useRef(null);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    if (editorRef.current) {
      if (!isInternalChangeRef.current && editorRef.current.innerHTML !== (block.content || '')) {
        editorRef.current.innerHTML = block.content || '';
      }
      isInternalChangeRef.current = false;
    }
  }, [block.id, block.content]);

  return (
    <div>
      {/* Rich Format Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap',
          marginBottom: 8,
          padding: '6px 8px',
          borderRadius: 6,
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)'
        }}
      >
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('bold', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Bold (Ctrl+B)"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('italic', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Italic (Ctrl+I)"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('underline', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Underline (Ctrl+U)"
        >
          <Underline size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('strikeThrough', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </button>

        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('justifyLeft', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('justifyCenter', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Align Center"
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('justifyRight', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Align Right"
        >
          <AlignRight size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('justifyFull', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Justify"
        >
          <AlignJustify size={14} />
        </button>

        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleOpenLinkModal(index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Insert Link"
        >
          <Link size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('unlink', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Remove Link"
        >
          <Unlink size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeFormatCmd('removeFormat', null, index, editorRef.current)}
          className="admin-btn-secondary"
          style={{ padding: '4px 8px' }}
          title="Clear Format"
        >
          <Eraser size={14} />
        </button>
      </div>

      <div
        ref={editorRef}
        id={`editor-paragraph-${block.id}`}
        contentEditable
        suppressContentEditableWarning
        style={{
          minHeight: 120,
          padding: '12px 14px',
          borderRadius: 6,
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          fontSize: '0.96rem',
          lineHeight: 1.8,
          outline: 'none'
        }}
        onInput={(e) => {
          isInternalChangeRef.current = true;
          updateBlock(index, { content: e.currentTarget.innerHTML });
        }}
        onBlur={(e) => {
          isInternalChangeRef.current = true;
          updateBlock(index, { content: e.currentTarget.innerHTML });
        }}
      />
    </div>
  );
}
