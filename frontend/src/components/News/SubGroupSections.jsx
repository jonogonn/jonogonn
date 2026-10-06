import React, { useMemo } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  ArrowRight,
  Clock,
  Eye,
  Tag
} from 'lucide-react';
import AdSenseSlot from '../Ads/AdSenseSlot';

// Helper to render FontAwesome icon for master groups
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

export default function SubGroupSections() {
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

  // Flatten all 24 Sub-Groups with master group metadata
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

  // Filter & Order subgroups based on homepageSections
  const displayedSubGroups = useMemo(() => {
    const subgroupSectionItems = (homepageSections || []).filter(
      (s) => s.type === 'subgroup' || s.id.startsWith('subgroup-')
    );

    if (!subgroupSectionItems || subgroupSectionItems.length === 0) {
      return all24SubGroups;
    }

    const result = [];
    subgroupSectionItems.forEach((sec) => {
      if (sec.isVisible !== false) {
        const foundSub = all24SubGroups.find((sg) => sg.id === sec.id);
        if (foundSub) {
          result.push(foundSub);
        }
      }
    });

    return result;
  }, [homepageSections, all24SubGroups]);

  // Helper to extract 9 news articles (1 Big Hero + 4 in Col A + 4 in Col B = 9 total) for each sub-group
  const getSubGroup9Articles = (subGrp) => {
    const itemIds = (subGrp.items || []).map((it) => it.id);
    const itemSlugs = (subGrp.items || []).map((it) => it.slug || it.id);

    // 1. Find exact matches
    const exactMatches = (articles || []).filter((art) => {
      const artCat = (art.category || '').toLowerCase();
      const artId = (art.id || '').toLowerCase();
      return (
        itemIds.includes(artCat) ||
        itemSlugs.includes(artCat) ||
        itemIds.some((id) => artId.includes(id)) ||
        (art.tags && art.tags.some((t) => itemIds.includes(t.toLowerCase())))
      );
    });

    if (exactMatches.length >= 9) {
      return exactMatches.slice(0, 9);
    }

    // 2. Fill pool to 9 items with related articles
    const usedIds = new Set(exactMatches.map((a) => a.id));
    const fallbacks = [];

    for (const art of articles || []) {
      if (usedIds.has(art.id)) continue;
      fallbacks.push(art);
      if (exactMatches.length + fallbacks.length >= 9) break;
    }

    return [...exactMatches, ...fallbacks].slice(0, 9);
  };

  // Helper to get default columns order for a subgroup
  const getDefaultColumnsForSubGroup = (subGroupId, index) => {
    const pattern = index % 3;
    if (pattern === 0) return ['heroCard', 'colA', 'colB'];
    if (pattern === 1) return ['colA', 'heroCard', 'colB'];
    return ['colA', 'colB', 'heroCard'];
  };

  if (displayedSubGroups.length === 0) return null;

  return (
    <section className="subgroup-sections-root" aria-label="২৪টি ক্যাটাগরি সাব-গ্রুপ সংবাদ সেকশন">
      <div className="subgroup-sections-grid-stream">
        {displayedSubGroups.map((subGrp, idx) => {
          const subArticles = getSubGroup9Articles(subGrp);
          const heroArticle = subArticles[0] || (articles && articles[0]);
          const smallArtsColA = subArticles.slice(1, 5); // 4 articles for Column A
          const smallArtsColB = subArticles.slice(5, 9); // 4 articles for Column B
          const firstCategoryItem = subGrp.items[0];

          // 3-Column order from custom state or dynamic default
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

          // Animation variation class
          const animClass =
            (idx % 3) === 0
              ? 'anim-tilt-lift'
              : (idx % 3) === 1
              ? 'anim-zoom-fade'
              : 'anim-slide-accent';

          // Insert leaderboard ad slot every 2 sections
          const shouldShowAd = idx > 0 && idx % 2 === 0;

          // Component for rendering a Column of 4 Small News Cards
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
                      src={art.imageUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80'}
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

          // Component for rendering the Big Featured Hero Card (1 Item)
          const renderHeroCard = () => (
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
                    src={heroArticle.imageUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80'}
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

                {/* 3-Column Dynamic Layout Grid based on sectionColumnsOrder */}
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
