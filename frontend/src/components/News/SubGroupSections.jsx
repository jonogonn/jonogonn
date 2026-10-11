import React, { useMemo } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  ArrowRight,
  Clock,
  Eye,
  Tag
} from 'lucide-react';
import AdSenseSlot from '../Ads/AdSenseSlot';

// Helper to render FontAwesome icon for master groups (from Admin Panel Edit 10)
const renderMasterGroupIcon = (groupId) => {
  switch (groupId) {
    case 'lifestyle-culture':
      return <i className="fa-solid fa-people-group" style={{ color: 'var(--primary-red)' }}></i>;
    case 'bangladesh-governance':
      return <i className="fa-solid fa-landmark" style={{ color: 'var(--primary-red)' }}></i>;
    case 'international-world':
      return <i className="fa-solid fa-globe" style={{ color: 'var(--primary-red)' }}></i>;
    case 'business-economy':
      return <i className="fa-solid fa-chart-line" style={{ color: 'var(--primary-red)' }}></i>;
    case 'jobs-education':
      return <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--primary-red)' }}></i>;
    case 'science-tech':
      return <i className="fa-solid fa-laptop-code" style={{ color: 'var(--primary-red)' }}></i>;
    case 'religion-society':
      return <i className="fa-solid fa-mosque" style={{ color: 'var(--primary-red)' }}></i>;
    case 'sports-health':
      return <i className="fa-solid fa-futbol" style={{ color: 'var(--primary-red)' }}></i>;
    case 'entertainment':
      return <i className="fa-solid fa-film" style={{ color: 'var(--primary-red)' }}></i>;
    case 'opinion-specials':
      return <i className="fa-solid fa-pen-nib" style={{ color: 'var(--primary-red)' }}></i>;
    default:
      return <i className="fa-solid fa-newspaper" style={{ color: 'var(--primary-red)' }}></i>;
  }
};

export default function SubGroupSections({ subGroupIds = null, targetSubGroupId = null }) {
  const {
    categoryMasterGroups,
    homepageSections,
    sectionColumnsOrder,
    articles,
    openArticle,
    setActiveCategory,
    language
  } = useNews();

  const isBn = language === 'bn';

  // Flatten all 24 Sub-Groups with master group metadata (exact structure from Admin Panel Edit 10)
  const all24SubGroups = useMemo(() => {
    const list = [];
    (categoryMasterGroups || []).forEach((masterGrp) => {
      (masterGrp.subGroups || []).forEach((subGrp, sIdx) => {
        list.push({
          id: `subgroup-${masterGrp.id}-${sIdx}`,
          masterGroupId: masterGrp.id,
          masterGroupNameBn: masterGrp.nameBn,
          masterGroupNameEn: masterGrp.nameEn,
          subGroupIndex: list.length + 1, // 1 to 24
          titleBn: subGrp.titleBn,
          titleEn: subGrp.titleEn,
          items: subGrp.items || []
        });
      });
    });
    return list;
  }, [categoryMasterGroups]);

  // Helper to extract strictly matching news articles for each sub-group from DB articles (NO random unrelated fallbacks)
  const getSubGroupExactArticles = (subGrp) => {
    if (!subGrp || !Array.isArray(subGrp.items)) return [];

    const itemIds = (subGrp.items || []).map((it) => String(it.id || '').toLowerCase().trim());
    const itemSlugs = (subGrp.items || []).map((it) => String(it.slug || '').toLowerCase().trim());
    const itemNamesBn = (subGrp.items || []).map((it) => String(it.nameBn || '').trim());
    const itemNamesEn = (subGrp.items || []).map((it) => String(it.nameEn || '').toLowerCase().trim());
    const titleBn = String(subGrp.titleBn || '').trim();
    const titleEn = String(subGrp.titleEn || '').toLowerCase().trim();

    return (articles || []).filter((art) => {
      // Must be published (or default published if status not explicitly set)
      if (art.status && art.status !== 'published') return false;

      const artCat = String(art.category || art.categoryId || '').toLowerCase().trim();
      const artCatBn = String(art.categoryBn || '').trim();
      const artCatEn = String(art.categoryEn || '').toLowerCase().trim();
      const artCardCat = String(art.cardCategory || '').trim();
      const artCategories = Array.isArray(art.categories)
        ? art.categories.map((c) => String(c).toLowerCase().trim())
        : [];
      const artTags = Array.isArray(art.tags)
        ? art.tags.map((t) => String(t).toLowerCase().trim())
        : [];

      // 1. Direct match on primary category id or slug
      if (artCat && (itemIds.includes(artCat) || itemSlugs.includes(artCat))) return true;

      // 2. Direct match on localized category name
      if (artCatBn && (itemNamesBn.includes(artCatBn) || artCatBn === titleBn)) return true;
      if (artCatEn && (itemNamesEn.includes(artCatEn) || artCatEn === titleEn)) return true;

      // 3. Match within categories array
      if (artCategories.some((c) => itemIds.includes(c) || itemSlugs.includes(c))) return true;

      // 4. Match within tags
      if (artTags.some((t) => itemIds.includes(t) || itemSlugs.includes(t))) return true;

      // 5. Match within cardCategory (e.g. "জাতীয় ও নগর । বাংলাদেশ")
      if (artCardCat && (itemNamesBn.some(n => artCardCat.includes(n)) || artCardCat.includes(titleBn))) return true;

      return false;
    });
  };

  // Filter & Order subgroups: Hide sections if no posts exist in DB, display if >= 1 post exists
  const displayedSubGroups = useMemo(() => {
    let subgroupSectionItems = (homepageSections || []).filter(
      (s) => s.type === 'subgroup' || s.id.startsWith('subgroup-')
    );

    if (targetSubGroupId) {
      subgroupSectionItems = subgroupSectionItems.filter((s) => s.id === targetSubGroupId);
    } else if (Array.isArray(subGroupIds) && subGroupIds.length > 0) {
      subgroupSectionItems = subgroupSectionItems.filter((s) => subGroupIds.includes(s.id));
    }

    const baseList = (subgroupSectionItems && subgroupSectionItems.length > 0)
      ? subgroupSectionItems
          .filter((sec) => sec.isVisible !== false)
          .map((sec) => all24SubGroups.find((sg) => sg.id === sec.id))
          .filter(Boolean)
      : (subGroupIds || targetSubGroupId ? [] : all24SubGroups);

    // Attach exact articles from DB and strictly filter out any section with 0 articles
    return baseList
      .map((sg) => ({
        ...sg,
        articles: getSubGroupExactArticles(sg)
      }))
      .filter((sg) => sg.articles && sg.articles.length > 0);
  }, [homepageSections, all24SubGroups, articles, subGroupIds, targetSubGroupId]);

  // Helper to get default columns order for a subgroup (from Admin Panel Edit 10)
  const getDefaultColumnsForSubGroup = (subGroupId, index) => {
    const pattern = index % 3;
    if (pattern === 0) return ['heroCard', 'colA', 'colB'];
    if (pattern === 1) return ['colA', 'heroCard', 'colB'];
    return ['colA', 'colB', 'heroCard'];
  };

  if (!displayedSubGroups || displayedSubGroups.length === 0) return null;

  return (
    <section className="subgroup-sections-root" aria-label="২৪টি ক্যাটাগরি সাব-গ্রুপ সংবাদ সেকশন">
      <div className="subgroup-sections-grid-stream">
        {displayedSubGroups.map((subGrp, idx) => {
          const subArticles = subGrp.articles;
          const heroArticle = subArticles[0];

          // Distribute remaining articles cleanly between Col A and Col B
          const remaining = subArticles.slice(1, 9);
          const half = Math.ceil(remaining.length / 2);
          const smallArtsColA = remaining.slice(0, Math.min(half, 4));
          const smallArtsColB = remaining.slice(Math.min(half, 4), 8);

          const firstCategoryItem = subGrp.items[0];

          // 3-Column order from custom state or dynamic default (Admin Panel Edit 10)
          const defaultColumns = getDefaultColumnsForSubGroup(subGrp.id, idx);
          const currentColumnsOrder = sectionColumnsOrder?.[subGrp.id] || defaultColumns;

          // Determine layout class based on position of heroCard
          const heroPosIndex = currentColumnsOrder.indexOf('heroCard');
          const layoutClass =
            heroPosIndex === 0
              ? 'layout-hero-left'
              : heroPosIndex === 1
              ? 'layout-hero-center'
              : 'layout-hero-right';

          // Animation variation class (exact rotation from Admin Panel Edit 10)
          const animClass =
            (idx % 3) === 0
              ? 'anim-tilt-lift'
              : (idx % 3) === 1
              ? 'anim-zoom-fade'
              : 'anim-slide-accent';

          // Insert leaderboard ad slot every 2 sections
          const shouldShowAd = idx > 0 && idx % 2 === 0;

          // Component for rendering a Column of Small News Cards (Admin Panel Edit 10)
          const renderSmallColumn = (itemsList, colKey) => (
            <div key={colKey} className="subgroup-small-col">
              {itemsList.map((art, aIdx) => (
                <article
                  key={art.id || aIdx}
                  className={`subgroup-small-card ${animClass}`}
                  onClick={() => openArticle(art)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="subgroup-small-thumb-wrap">
                    <img
                      src={art.imageUrl || art.featuredImage || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80'}
                      alt={isBn ? art.titleBn : art.titleEn}
                      className="subgroup-small-thumb"
                      loading="lazy"
                    />
                  </div>
                  <div className="subgroup-small-content">
                    <span className="subgroup-small-cat-badge">
                      {isBn ? art.categoryBn || subGrp.items[0]?.nameBn || 'সংবাদ' : art.categoryEn || subGrp.items[0]?.nameEn || 'News'}
                    </span>
                    <h5 className="subgroup-small-title">
                      {isBn ? art.titleBn : art.titleEn}
                    </h5>
                    <div className="subgroup-small-meta">
                      <Clock size={11} className="meta-clock-icon" />
                      <span>{isBn ? art.dateBn || 'আজ' : art.dateEn || 'Today'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          );

          // Component for rendering the Big Featured Hero Card (Admin Panel Edit 10)
          const renderHeroCard = () => {
            if (!heroArticle) return null;
            return (
              <div
                key="hero-col"
                className={`subgroup-hero-col ${animClass}`}
                onClick={() => openArticle(heroArticle)}
                role="button"
                tabIndex={0}
              >
                <article className="subgroup-hero-card">
                  <div className="subgroup-hero-image-wrap">
                    <img
                      src={heroArticle.imageUrl || heroArticle.featuredImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80'}
                      alt={isBn ? heroArticle.titleBn : heroArticle.titleEn}
                      className="subgroup-hero-img"
                      loading="lazy"
                    />
                    <div className="subgroup-hero-badge-overlay">
                      <span className="subgroup-hero-cat-tag">
                        {isBn ? heroArticle.categoryBn || subGrp.items[0]?.nameBn || 'প্রধান খবর' : heroArticle.categoryEn || subGrp.items[0]?.nameEn || 'Featured'}
                      </span>
                    </div>
                  </div>

                  <div className="subgroup-hero-content">
                    <h4 className="subgroup-hero-title">
                      {isBn ? heroArticle.titleBn : heroArticle.titleEn}
                    </h4>
                    <p className="subgroup-hero-excerpt">
                      {isBn ? heroArticle.excerptBn : heroArticle.excerptEn}
                    </p>
                    <div className="subgroup-hero-meta-row">
                      <div className="hero-meta-left">
                        <Clock size={12} className="meta-clock-icon" />
                        <span>{isBn ? heroArticle.dateBn || 'আজ' : heroArticle.dateEn || 'Today'}</span>
                        {heroArticle.views && (
                          <span className="meta-views-count">
                            <Eye size={12} />
                            <span>{heroArticle.views.toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            );
          };

          return (
            <React.Fragment key={subGrp.id}>
              {shouldShowAd && (
                <div className="subgroup-inline-ad-wrap">
                  <AdSenseSlot slotId="midContentBanner" customClass="ad-slot-970x90" />
                </div>
              )}

              <section className="subgroup-section-card" id={`subgroup-${subGrp.id}`}>
                {/* Section Header */}
                <div className="subgroup-card-header">
                  <div className="subgroup-header-left">
                    <h3 className="subgroup-title">
                      {isBn ? subGrp.titleBn : subGrp.titleEn}
                    </h3>
                    <span className="subgroup-master-label">
                      {renderMasterGroupIcon(subGrp.masterGroupId)}
                      <span style={{ marginLeft: 6 }}>
                        {isBn ? subGrp.masterGroupNameBn : subGrp.masterGroupNameEn}
                      </span>
                    </span>
                  </div>

                  <div className="subgroup-header-right">
                    {/* Category quick pills */}
                    <div className="subgroup-category-pills">
                      {(subGrp.items || []).slice(0, 4).map((it) => (
                        <button
                          key={it.id}
                          type="button"
                          onClick={() => setActiveCategory(it.id)}
                          className="subgroup-cat-tag-btn"
                          title={isBn ? `${it.nameBn} সংবাদ দেখুন` : `View ${it.nameEn} news`}
                        >
                          <Tag size={10} />
                          <span>{isBn ? it.nameBn : it.nameEn}</span>
                        </button>
                      ))}
                    </div>

                    {/* View All Button */}
                    <button
                      type="button"
                      onClick={() => setActiveCategory(firstCategoryItem?.id || 'latest')}
                      className="subgroup-view-all-btn"
                    >
                      <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* 3-Column Dynamic Layout Grid based on sectionColumnsOrder (Exact layout from Admin Panel Edit 10) */}
                <div className={`subgroup-3col-grid ${layoutClass}`}>
                  {currentColumnsOrder.map((colKey) => {
                    if (colKey === 'heroCard') return renderHeroCard();
                    if (colKey === 'colA') return renderSmallColumn(smallArtsColA, 'col-a');
                    if (colKey === 'colB') return renderSmallColumn(smallArtsColB, 'col-b');
                    return null;
                  })}
                </div>
              </section>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
