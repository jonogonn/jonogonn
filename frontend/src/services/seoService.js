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
  type = 'website',
  publishedTime,
  author,
  section,
  jsonLd
}) {
  const siteName = 'জনগণ.নিউজ';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — জনতার কণ্ঠস্বর`;
  const defaultDesc = description || 'জনগণের পক্ষে সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত ঠিকানা। দেশ-বিদেশের ব্রেকিং নিউজ, রাজনীতি, বাণিজ্য, খেলা ও বিনোদনের তাজা খবর।';
  const currentUrl = url || window.location.href;
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
