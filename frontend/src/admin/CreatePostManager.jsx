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
  Sparkles,
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
  ChevronRight
} from 'lucide-react';
import { uploadImageToStorage } from '../utils/imageUploader';
import SocialNewsCardPreview from './SocialNewsCardPreview';
import { getCardCategoryLabel } from '../utils/cardCategoryHelper';

export default function CreatePostManager({ initialPostId = null, triggerSaveToast, onSwitchToArticles }) {
  const {
    adminLanguage,
    language,
    articles,
    addArticle,
    updateArticle,
    categories,
    categoryMasterGroups,
    showAlert,
    showConfirm,
    showError,
    showSuccess
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';

  // Editor Layout State
  const [isLeftToolbarOpen, setIsLeftToolbarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Post Meta State
  const [postId, setPostId] = useState(initialPostId || null);
  const [postStatus, setPostStatus] = useState('review'); // Default 'review' (জমা দিন / পর্যালোচনায়)
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
      caption: 'ছবি: সংগৃহীত'
    },
    {
      id: 'block-paragraph-1',
      type: 'paragraph',
      content: ''
    }
  ]);

  // Load existing article if initialPostId provided
  useEffect(() => {
    if (initialPostId) {
      const art = articles.find((a) => a.id === initialPostId);
      if (art) {
        setPostId(art.id);
        setSlug(art.slug || '');
        setKicker(art.kicker || '');
        setPostStatus(art.status || 'review');
        setExcerpt(art.excerptBn || art.excerptEn || '');
        setSelectedCategories(art.categories || (art.category ? [art.category] : ['bangladesh']));
        setTags(art.tags || ['জাতীয়']);
        setMetaTitle(art.metaTitle || art.titleBn || '');
        setMetaDesc(art.metaDesc || art.excerptBn || '');
        setFocusKeyword(art.focusKeyword || '');
        setAuthor(art.author || 'জনগণ নিউজ ডেস্ক');
        setIsLeadHero(Boolean(art.isLeadHero));
        setIsHighlighted(Boolean(art.isHighlighted));
        setIsBreaking(Boolean(art.isBreaking));
        setIsVideo(Boolean(art.isVideo));
        setVideoDuration(art.videoDuration || '');
        setCardCaption(art.cardCaption || 'ছবি: সংগৃহীত');
        setCardCategory(art.cardCategory || '');

        if (art.blocks && art.blocks.length > 0) {
          setBlocks(art.blocks);
        } else {
          setBlocks([
            { id: `heading-${Date.now()}`, type: 'heading', level: 'h1', content: art.titleBn || art.titleEn || '' },
            { id: `image-${Date.now()}`, type: 'image', url: art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80', caption: art.cardCaption || 'ছবি: সংগৃহীত' },
            { id: `paragraph-${Date.now()}`, type: 'paragraph', content: art.contentBn || art.contentEn || art.excerptBn || '' }
          ]);
        }
      }
    }
  }, [initialPostId, articles]);

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

  // New Category Input
  const [newCatInput, setNewCatInput] = useState('');

  // Helper: Derive main title from first heading block
  const mainTitle = blocks.find((b) => b.type === 'heading')?.content?.replace(/<[^>]*>?/gm, '').trim() || '';

  // Helper: Featured Image
  const featuredImageBlock = blocks.find((b) => b.type === 'image' && b.url);
  const featuredImageUrl = featuredImageBlock?.url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';

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
    if (file.size > 10 * 1024 * 1024) {
      showError(isBn ? 'ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট হতে পারবে।' : 'Image size must be less than 10MB.');
      return;
    }

    try {
      // 1. Show immediate preview via DataURL & set uploading state
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result;
        updateBlock(index, { url: previewUrl, isUploading: true });
      };
      reader.readAsDataURL(file);

      if (triggerSaveToast) triggerSaveToast(isBn ? 'ছবি WebP রূপান্তর ও ক্লাউড আপলোড হচ্ছে...' : 'Converting to WebP & uploading to cloud...');

      // 2. Upload to Backblaze B2 (cPanel / Direct Cloud)
      const newsSlugForImg = slug || metaTitle || kicker || 'news';
      const uploadedUrl = await uploadImageToStorage(file, {
        slug: newsSlugForImg,
        newsSlug: newsSlugForImg,
        associatedNews: slug || metaTitle || kicker || ''
      });
      if (uploadedUrl) {
        updateBlock(index, { url: uploadedUrl, isUploading: false });
        if (triggerSaveToast) triggerSaveToast(isBn ? 'ছবি সফলভাবে .webp ফরম্যাটে ক্লাউডে সংরক্ষিত হয়েছে!' : 'Image uploaded to cloud as .webp!');
      } else {
        updateBlock(index, { isUploading: false });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      updateBlock(index, { isUploading: false });
      showError(isBn ? 'ছবি আপলোড ব্যর্থ হয়েছে।' : 'Image upload failed.');
    }
  };

  // Execute Rich Text Command in Paragraph
  const executeFormatCmd = (command, value = null) => {
    document.execCommand(command, false, value);
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
      confirmText: isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Discard'
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
          case 'image':
            return b.url
              ? `<figure class="post-figure"><img src="${b.url}" alt="${b.caption || 'Image'}" class="post-image" />${
                  b.caption ? `<figcaption class="post-caption">${b.caption}</figcaption>` : ''
                }</figure>`
              : '';
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
              ? `<div class="post-file-download"><a href="${b.url}" target="_blank" rel="noopener noreferrer" class="post-download-btn">${b.label || 'Download File'}</a></div>`
              : '';
          case 'video':
            return b.url
              ? `<div class="post-video-embed"><iframe src="${b.url}" title="Video player" frameborder="0" allowfullscreen></iframe></div>`
              : '';
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
      status: 'review' // Strictly 'review' (জমা দেওয়া হয়েছে / পেন্ডিং)
    };

    if (postId) {
      updateArticle(postId, postPayload);
    } else {
      addArticle(postPayload);
    }

    showSuccess(
      isBn
        ? 'আপনার সংবাদটি পর্যালোচনার জন্য সফলভাবে জমা দেওয়া হয়েছে! এডমিন অনুমোদনের পর এটি প্রকাশিত হবে।'
        : 'Your post has been submitted for review! It will be published after admin approval.',
      isBn ? 'সফলভাবে জমা হয়েছে' : 'Submission Successful'
    );

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

    if (postId) {
      updateArticle(postId, postPayload);
    } else {
      addArticle(postPayload);
    }

    showSuccess(
      isBn
        ? 'পোস্টটি সফলভাবে "Approve Post" ট্যাবে অনুমোদনের জন্য পাঠানো হয়েছে!'
        : 'Post submitted to Approve Post tab for review!',
      isBn ? 'অনুমোদনের আবেদন সফল' : 'Request Submitted'
    );

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
            <span>{postId ? (isBn ? 'আপডেট জমা দিন' : 'Submit Update') : (isBn ? 'জমা দিন' : 'Submit Post')}</span>
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
      <div style={{ display: 'grid', gridTemplateColumns: `${isLeftToolbarOpen ? '200px' : '58px'} 1fr ${isRightSidebarOpen ? '360px' : '0px'}`, gap: 16, transition: 'all 0.22s ease' }}>
        {/* ----------------------------------------------------
            LEFT COLUMN: BLOCK INSERT TOOLBAR (Collapsible)
            ---------------------------------------------------- */}
        <div
          className="admin-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: isLeftToolbarOpen ? '14px 10px' : '12px 6px',
            height: 'fit-content',
            position: 'sticky',
            top: 75,
            alignItems: isLeftToolbarOpen ? 'stretch' : 'center',
            transition: 'all 0.22s ease'
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
            CENTER COLUMN: VISUAL BLOCK EDITOR
            ---------------------------------------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {blocks.map((block, index) => {
            return (
              <div
                key={block.id}
                className="admin-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  transition: 'border-color 0.15s ease'
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
                        {block.url ? (
                          <div style={{ position: 'relative' }}>
                            <img
                              src={block.url}
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
                              {isBn ? 'ছবি পরিবর্তন করতে ক্লিক করুন' : 'Click to change image'}
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <Upload size={24} color="var(--primary-red)" />
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{isBn ? 'ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload image'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP (Max 5MB)</div>
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
                        <button type="button" onClick={() => executeFormatCmd('bold')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Bold">
                          <Bold size={14} />
                        </button>
                        <button type="button" onClick={() => executeFormatCmd('italic')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Italic">
                          <Italic size={14} />
                        </button>
                        <button type="button" onClick={() => executeFormatCmd('underline')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Underline">
                          <Underline size={14} />
                        </button>
                        <button type="button" onClick={() => executeFormatCmd('strikeThrough')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Strikethrough">
                          <Strikethrough size={14} />
                        </button>

                        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

                        <button type="button" onClick={() => executeFormatCmd('justifyLeft')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Align Left">
                          <AlignLeft size={14} />
                        </button>
                        <button type="button" onClick={() => executeFormatCmd('justifyCenter')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Align Center">
                          <AlignCenter size={14} />
                        </button>
                        <button type="button" onClick={() => executeFormatCmd('justifyRight')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Align Right">
                          <AlignRight size={14} />
                        </button>
                        <button type="button" onClick={() => executeFormatCmd('justifyFull')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Justify">
                          <AlignJustify size={14} />
                        </button>

                        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt('Enter link URL:');
                            if (url) executeFormatCmd('createLink', url);
                          }}
                          className="admin-btn-secondary"
                          style={{ padding: '4px 8px' }}
                          title="Insert Link"
                        >
                          <Link size={14} />
                        </button>
                        <button type="button" onClick={() => executeFormatCmd('unlink')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Remove Link">
                          <Unlink size={14} />
                        </button>
                        <button type="button" onClick={() => executeFormatCmd('removeFormat')} className="admin-btn-secondary" style={{ padding: '4px 8px' }} title="Clear Format">
                          <Eraser size={14} />
                        </button>
                      </div>

                      <div
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
                        onBlur={(e) => updateBlock(index, { content: e.currentTarget.innerHTML })}
                        dangerouslySetInnerHTML={{ __html: block.content || '' }}
                      />
                    </div>
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
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 6 }}>
                          <iframe
                            src={block.url.includes('watch?v=') ? block.url.replace('watch?v=', 'embed/') : block.url}
                            title="Video Preview"
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            frameBorder="0"
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
              flexWrap: 'wrap'
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
            RIGHT COLUMN: SETTINGS, SOCIAL CARD & METADATA SIDEBAR
            ---------------------------------------------------- */}
        {isRightSidebarOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'fit-content' }}>
            {/* Card 1: Live Auto-Generated Social News Card (Strictly View-Only) */}
            <div className="admin-card" style={{ padding: '16px 18px', border: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.96rem', fontWeight: 800, margin: 0, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} />
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
                  title={mainTitle}
                  kicker={kicker}
                  imageUrl={featuredImageUrl}
                  caption={cardCaption}
                  category={cardCategoryDisplay}
                  dateBn={new Date(publishDate).toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' })}
                />
              </div>

              {/* Card Sub-headline (Kicker) Input */}
              <div className="admin-form-group" style={{ marginBottom: 10 }}>
                <label className="admin-label">{isBn ? 'কার্ড সাব-হেডলাইন / কিকার (ঐচ্ছিক)' : 'Card Kicker / Subtitle (Optional)'}</label>
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
                <label className="admin-label">{isBn ? 'কার্ড ফুটার ক্যাটাগরি ({সাব-গ্রুপ} । {ক্যাটাগরি})' : 'Card Footer Category ({Sub-Group} | {Category})'}</label>
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
                  placeholder="ছবি: সংগৃহীত"
                />
              </div>
            </div>

            {/* Card 2: Submission & Status Settings */}
            <div className="admin-card" style={{ padding: '16px 18px' }}>
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
            <div className="admin-card" style={{ padding: '16px 18px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.95rem', fontWeight: 800, marginBottom: 12, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} />
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

            {/* Card 4: Categories */}
            <div className="admin-card" style={{ padding: '16px 18px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '0.95rem', fontWeight: 800, marginBottom: 12, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Folder size={16} />
                <span>{isBn ? 'ক্যাটাগরি নির্বাচন' : 'Categories'}</span>
              </h3>

              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, paddingRight: 4 }}>
                {categories.map((cat) => (
                  <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    <span>{isBn ? cat.nameBn : cat.nameEn || cat.nameBn}</span>
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
            <div className="admin-card" style={{ padding: '16px 18px' }}>
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
            <div className="admin-card" style={{ padding: '16px 18px' }}>
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
                  <Sparkles size={14} />
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
    </div>
  );
}
