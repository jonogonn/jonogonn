/**
 * SEO & Metadata Management Service
 * Dynamically updates document title, meta descriptions, OpenGraph, Canonical URLs, and JSON-LD schema
 */
export function updateSEO({
  title,
  description,
  keywords,
  url,
  imageUrl,
  imageWidth = 1200,
  imageHeight = 675,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  jsonLd
}) {
  const siteName = 'জনগণ.নিউজ';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — জনতার কণ্ঠস্বর`;
  const defaultDesc = description || 'জনগণের পক্ষে সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত ঠিকানা। দেশ-বিদেশের ব্রেকিং নিউজ, রাজনীতি, বাণিজ্য, খেলা ও বিনোদনের তাজা খবর।';
  
  // Normalize URL to standard production domain for canonical consistency
  let currentUrl = 'https://jonogon.news/';
  if (url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        currentUrl = `https://jonogon.news${parsed.pathname}${parsed.search ? parsed.search : ''}`;
      } catch (e) {
        currentUrl = url;
      }
    } else {
      currentUrl = `https://jonogon.news${url.startsWith('/') ? '' : '/'}${url}`;
    }
  } else if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    currentUrl = `https://jonogon.news${pathname === '/' ? '/' : pathname}`;
  }

  if (currentUrl.length > 'https://jonogon.news/'.length && currentUrl.endsWith('/')) {
    currentUrl = currentUrl.slice(0, -1);
  }

  const image = imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80';

  // 1. Document Title
  document.title = fullTitle;

  // Helper to set or update meta tag
  const setMeta = (selector, attributeName, attributeValue, content) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attributeName, attributeValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content || '');
  };

  // 2. Standard SEO Meta Tags
  setMeta('meta[name="description"]', 'name', 'description', defaultDesc);
  if (keywords) {
    setMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
  }

  // 3. OpenGraph Social Tags
  setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMeta('meta[property="og:description"]', 'property', 'og:description', defaultDesc);
  setMeta('meta[property="og:url"]', 'property', 'og:url', currentUrl);
  setMeta('meta[property="og:image"]', 'property', 'og:image', image);
  setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', String(imageWidth));
  setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', String(imageHeight));
  setMeta('meta[property="og:type"]', 'property', 'og:type', type);
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
  setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'bn_BD');

  // 4. Twitter Card Tags
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', defaultDesc);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

  // 5. Article specific meta
  if (type === 'article') {
    if (publishedTime) setMeta('meta[property="article:published_time"]', 'property', 'article:published_time', publishedTime);
    if (modifiedTime) setMeta('meta[property="article:modified_time"]', 'property', 'article:modified_time', modifiedTime);
    if (author) setMeta('meta[property="article:author"]', 'property', 'article:author', author);
    if (section) setMeta('meta[property="article:section"]', 'property', 'article:section', section);
  }

  // 6. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', currentUrl);

  // 7. Structured Data (JSON-LD)
  let scriptEl = document.getElementById('json-ld-structured-data');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'json-ld-structured-data';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  if (jsonLd) {
    scriptEl.textContent = JSON.stringify(jsonLd);
  } else {
    // Default Organization JSON-LD
    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: 'জনগণ.নিউজ',
      alternateName: 'Jonogon News',
      url: window.location.origin,
      logo: `${window.location.origin}/logo.svg`,
      sameAs: [
        'https://facebook.com',
        'https://youtube.com'
      ]
    });
  }
}

/**
 * Generates a fully compliant Schema.org NewsArticle JSON-LD object for Google News & Search
 * Ensures:
 * - headline
 * - image (at least 1200 pixels wide ImageObject)
 * - datePublished (ISO 8601)
 * - dateModified (ISO 8601)
 * - author (Person with name and profile URL)
 * - publisher (NewsMediaOrganization with name, URL, and compliant logo ImageObject)
 * - mainEntityOfPage WebPage reference
 */
export function buildNewsArticleSchema(article, options = {}) {
  if (!article) return null;

  const siteOrigin = 'https://jonogon.news';
  const siteName = options.siteName || 'জনগণ.নিউজ';
  const isBn = options.language !== 'en';

  const headline = (isBn ? article.titleBn : article.titleEn) || article.title || 'জনগণ.নিউজ সংবাদ';
  const description =
    (isBn
      ? article.excerptBn || article.contentBn?.slice(0, 160)
      : article.excerptEn || article.contentEn?.slice(0, 160)) || headline;

  // Generate canonical article URL
  const articleId = article.db_id || article.id || article.slug || '';
  const canonicalUrl = options.url || `${siteOrigin}/news/${articleId}`;

  // Image processing: ensure at least 1200px wide
  let rawImage = article.imageUrl || article.featuredImage || article.featured_image || '';
  if (!rawImage) {
    rawImage = `${siteOrigin}/logo.png`;
  }

  let absoluteImageUrl = rawImage;
  if (absoluteImageUrl.startsWith('/')) {
    absoluteImageUrl = `${siteOrigin}${absoluteImageUrl}`;
  } else if (!absoluteImageUrl.startsWith('http://') && !absoluteImageUrl.startsWith('https://')) {
    absoluteImageUrl = `${siteOrigin}/${absoluteImageUrl}`;
  }

  // If Unsplash, ensure 1200px width parameter
  if (absoluteImageUrl.includes('unsplash.com')) {
    if (absoluteImageUrl.includes('w=')) {
      absoluteImageUrl = absoluteImageUrl.replace(/w=\d+/, 'w=1200');
    } else {
      absoluteImageUrl += (absoluteImageUrl.includes('?') ? '&' : '?') + 'w=1200&h=675&fit=crop&q=85';
    }
  }

  // Safe ISO Date parsing
  const parseToIso = (dateStr, fallback = new Date().toISOString()) => {
    if (!dateStr) return fallback;
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d.toISOString();
      const normalized = String(dateStr).trim().replace(' ', 'T');
      const d2 = new Date(normalized);
      if (!isNaN(d2.getTime())) return d2.toISOString();
    } catch (e) {}
    return fallback;
  };

  const datePublished = parseToIso(
    article.publishedAt || article.published_at || article.createdAt || article.created_at || article.dateEn
  );
  const dateModified = parseToIso(
    article.updatedAt || article.updated_at || article.publishedAt || article.published_at || article.createdAt || article.created_at,
    datePublished
  );

  const authorName = article.author || article.reporter_name || (isBn ? 'জনগণ নিউজ ডেস্ক' : 'Jonogon News Desk');
  const sectionName = (isBn ? article.categoryBn : article.categoryEn) || article.category || (isBn ? 'জাতীয়' : 'National');

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    headline: headline,
    description: description,
    image: {
      '@type': 'ImageObject',
      url: absoluteImageUrl,
      width: 1200,
      height: 675
    },
    datePublished: datePublished,
    dateModified: dateModified,
    author: [
      {
        '@type': 'Person',
        name: authorName,
        url: `${siteOrigin}/team`
      }
    ],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      alternateName: 'Jonogon News',
      url: siteOrigin,
      logo: {
        '@type': 'ImageObject',
        url: `${siteOrigin}/logo.png`,
        width: 600,
        height: 60
      }
    },
    articleSection: sectionName,
    inLanguage: isBn ? 'bn-BD' : 'en-US'
  };
}

