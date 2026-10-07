/**
 * Helper to compute the official "{sub_group} । {category}" label for social photo cards.
 */
export function getCardCategoryLabel(catIdOrSlug, categoryMasterGroups = [], categories = []) {
  if (!catIdOrSlug) return 'সারাদেশ । বাংলাদেশ';

  // 1. If it already contains a divider (e.g. "সারাদেশ । বাংলাদেশ" or "জাতীয় । বাংলাদেশ"), return as is
  if (typeof catIdOrSlug === 'string' && (catIdOrSlug.includes('।') || catIdOrSlug.includes('|'))) {
    return catIdOrSlug.replace(/\|/g, '।').trim();
  }

  // 2. Search categoryMasterGroups hierarchy (Master -> SubGroup -> Category Item)
  if (Array.isArray(categoryMasterGroups) && categoryMasterGroups.length > 0) {
    for (const master of categoryMasterGroups) {
      for (const sub of master.subGroups || []) {
        const item = (sub.items || []).find(
          (i) => i.id === catIdOrSlug || i.slug === catIdOrSlug || i.nameBn === catIdOrSlug || i.nameEn === catIdOrSlug
        );
        if (item) {
          const subTitle = sub.titleBn || sub.titleEn || master.nameBn || master.nameEn;
          const catName = item.nameBn || item.nameEn;
          return `${subTitle} । ${catName}`;
        }
      }
    }
  }

  // 3. Search in flat categories list
  if (Array.isArray(categories) && categories.length > 0) {
    const catObj = categories.find(
      (c) => c.id === catIdOrSlug || c.slug === catIdOrSlug || c.nameBn === catIdOrSlug
    );
    if (catObj) {
      const subGroupName = catObj.subGroupBn || catObj.subGroupName || catObj.groupBn || 'সারাদেশ';
      const catName = catObj.nameBn || catObj.nameEn || catObj.name;
      return `${subGroupName} । ${catName}`;
    }
  }

  // Fallback
  return `সারাদেশ । ${catIdOrSlug}`;
}
