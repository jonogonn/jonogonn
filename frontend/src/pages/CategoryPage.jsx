import React, { useEffect, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import { updateSEO } from '../services/seoService';
import {
  Clock,
  ChevronRight,
  ArrowLeft,
  FolderTree,
  Tag,
  Eye,
  Layers,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import AdSenseSlot from '../components/Ads/AdSenseSlot';

export default function CategoryPage() {
  const {
    activeCategory,
    setActiveCategory,
    categories,
    categoryMasterGroups,
    articles,
    openArticle,
    goToHome,
    language,
    searchQuery,
    setSearchQuery
  } = useNews();

  const isBn = language === 'bn';

  // Find Category Object & its Master Group
  const activeCategoryObj = useMemo(() => {
    return (
      (categories || []).find((c) => c.id === activeCategory || c.slug === activeCategory) || {
        id: activeCategory,
        nameBn: activeCategory,
        nameEn: activeCategory,
        slug: activeCategory
      }
    );
  }, [categories, activeCategory]);

  // Find parent Master Group and sibling sub-group topics
  const parentGroup = useMemo(() => {
    return (categoryMasterGroups || []).find((grp) =>
      grp.subGroups?.some((sg) => sg.items?.some((it) => it.id === activeCategory || it.slug === activeCategory))
    );
  }, [categoryMasterGroups, activeCategory]);

  const currentSubGroup = useMemo(() => {
    if (!parentGroup) return null;
    return parentGroup.subGroups.find((sg) =>
      sg.items?.some((it) => it.id === activeCategory || it.slug === activeCategory)
    );
  }, [parentGroup, activeCategory]);

  // Filter Articles for this Category & Search
  const filteredArticles = useMemo(() => {
    return (articles || []).filter((art) => {
      const matchesSearch =
        !searchQuery ||
        (art.titleBn && art.titleBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (art.titleEn && art.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (art.contentBn && art.contentBn.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        activeCategory === 'latest' ||
        activeCategory === 'all' ||
        art.category === activeCategory ||
        art.category === activeCategoryObj?.id;

      return matchesSearch && matchesCat;
    });
  }, [articles, activeCategory, activeCategoryObj, searchQuery]);

  // Separate Lead Article and Grid Articles
  const leadArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  // SEO Update
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const catName = isBn ? activeCategoryObj?.nameBn || activeCategory : activeCategoryObj?.nameEn || activeCategory;
    const catSlug = activeCategoryObj?.slug || activeCategory;

    updateSEO({
      title: `${catName} সংবাদ ও সর্বশেষ খবর`,
      description: isBn
        ? `${catName} সম্পর্কিত দেশ-বিদেশের ব্রেকিং নিউজ, বিশেষ প্রতিবেদন ও সর্বশেষ খবর পড়ুন জনগণ.নিউজ-এ।`
        : `Read latest ${catName} news, updates, and in-depth reports on Jonogon News.`,
      url: `${window.location.origin}/category/${catSlug}`,
      type: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${catName} সংবাদ`,
        description: `Latest news and updates about ${catName}`,
        url: `${window.location.origin}/category/${catSlug}`
      }
    });
  }, [activeCategory, activeCategoryObj, isBn]);

  return (
    <div className="category-page-container" style={{ padding: '20px 0 50px 0' }}>
      <div className="container">
        {/* 1. Breadcrumbs */}
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <button onClick={goToHome} className="breadcrumb-link">
            {isBn ? 'প্রচ্ছদ' : 'Home'}
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          {parentGroup && (
            <>
              <span className="breadcrumb-muted">
                {isBn ? parentGroup.nameBn : parentGroup.nameEn}
              </span>
              <ChevronRight size={14} className="breadcrumb-separator" />
            </>
          )}
          <span className="breadcrumb-current">
            {isBn ? activeCategoryObj?.nameBn : activeCategoryObj?.nameEn}
          </span>
        </nav>

        {/* 2. Category Page Header */}
        <header className="category-page-banner">
          <div className="category-banner-left">
            <div className="category-tag-badge">
              <FolderTree size={16} />
              <span>{isBn ? 'সংবাদ বিভাগ' : 'Category Section'}</span>
            </div>
            <h1 className="category-banner-title">
              {searchQuery
                ? `${isBn ? 'অনুসন্ধানের ফলাফল:' : 'Search Results for:'} "${searchQuery}"`
                : isBn
                ? activeCategoryObj?.nameBn || activeCategory
                : activeCategoryObj?.nameEn || activeCategory}
            </h1>
            <p className="category-banner-subtitle">
              {isBn
                ? `এই বিভাগে মোট ${filteredArticles.length} টি সংবাদ প্রতিবেদন প্রকাশিত হয়েছে`
                : `Showing ${filteredArticles.length} curated articles in this section`}
            </p>
          </div>

          <div className="category-banner-actions">
            <button onClick={goToHome} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} />
              <span>{isBn ? 'প্রচ্ছদে ফিরে যান' : 'Back to Home'}</span>
            </button>
          </div>
        </header>

        {/* 3. Sub-Category Sibling Topic Chips (if in a master group) */}
        {currentSubGroup && currentSubGroup.items?.length > 1 && (
          <div className="category-subtopics-bar">
            <span className="subtopics-label">
              <Tag size={14} color="var(--primary-red)" />
              <span>{isBn ? currentSubGroup.titleBn : currentSubGroup.titleEn}:</span>
            </span>
            <div className="subtopics-chips">
              {currentSubGroup.items.map((it) => (
                <button
                  type="button"
                  key={it.id}
                  onClick={() => setActiveCategory(it.id)}
                  className={`subtopic-chip-btn ${activeCategory === it.id ? 'active' : ''}`}
                >
                  {isBn ? it.nameBn : it.nameEn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. In-Feed Ad Banner */}
        <AdSenseSlot slotId="topHeaderBanner" customClass="ad-slot-728x90" />

        {/* 5. Articles Stream */}
        {filteredArticles.length === 0 ? (
          <div className="no-news-card">
            <Search size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h3>{isBn ? 'এই বিভাগে বর্তমানে কোনো সংবাদ নেই।' : 'No articles published in this section yet.'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6 }}>
              {isBn ? 'অন্যান্য বিভাগের তাজা খবর পড়তে মূল পাতায় ফিরে যান।' : 'Explore other news categories from homepage.'}
            </p>
            <button onClick={goToHome} className="btn-primary" style={{ marginTop: 16 }}>
              {isBn ? 'মূল পাতায় ফিরে যান' : 'Back to Homepage'}
            </button>
          </div>
        ) : (
          <div className="category-articles-layout">
            {/* Featured Lead Card */}
            {leadArticle && (
              <article
                className="category-lead-card"
                onClick={() => openArticle(leadArticle)}
                title={isBn ? leadArticle.titleBn : leadArticle.titleEn}
              >
                <div className="category-lead-img-wrap">
                  <img
                    src={leadArticle.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&q=80'}
                    alt={isBn ? leadArticle.titleBn : leadArticle.titleEn}
                    className="category-lead-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&q=80';
                    }}
                  />
                  <span className="category-lead-badge">
                    {isBn ? leadArticle.categoryBn || activeCategoryObj?.nameBn : activeCategoryObj?.nameEn}
                  </span>
                </div>
                <div className="category-lead-body">
                  <span className="lead-tag-label">{isBn ? 'প্রধান সংবাদ' : 'Lead Story'}</span>
                  <h2 className="category-lead-title">
                    {isBn ? leadArticle.titleBn : leadArticle.titleEn}
                  </h2>
                  {leadArticle.excerptBn && (
                    <p className="category-lead-excerpt">
                      {isBn ? leadArticle.excerptBn : leadArticle.excerptEn}
                    </p>
                  )}
                  <div className="category-lead-meta">
                    <div className="meta-time">
                      <Clock size={14} color="var(--primary-red)" />
                      <span>{isBn ? leadArticle.dateBn : leadArticle.dateEn}</span>
                    </div>
                    <span className="meta-dot">•</span>
                    <span className="meta-author">{leadArticle.author || 'জনগণ নিউজ ডেস্ক'}</span>
                    <span className="meta-dot">•</span>
                    <div className="meta-views">
                      <Eye size={14} />
                      <span>{leadArticle.views || 0} {isBn ? 'বার পঠিত' : 'reads'}</span>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Grid of Remaining Articles */}
            {remainingArticles.length > 0 && (
              <div className="category-grid-stream">
                {remainingArticles.map((item) => (
                  <article
                    key={item.id}
                    className="category-news-card"
                    onClick={() => openArticle(item)}
                    title={isBn ? item.titleBn : item.titleEn}
                  >
                    <div className="category-card-img-wrap">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80'}
                        alt={isBn ? item.titleBn : item.titleEn}
                        className="category-card-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';
                        }}
                      />
                      <span className="category-card-badge">
                        {isBn ? item.categoryBn || item.category : item.category}
                      </span>
                    </div>
                    <div className="category-card-body">
                      <h3 className="category-card-title">
                        {isBn ? item.titleBn : item.titleEn}
                      </h3>
                      {item.excerptBn && (
                        <p className="category-card-excerpt">
                          {isBn ? item.excerptBn : item.excerptEn}
                        </p>
                      )}
                      <div className="category-card-footer">
                        <div className="category-card-date">
                          <Clock size={12} color="var(--primary-red)" />
                          <span>{isBn ? item.dateBn : item.dateEn}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
