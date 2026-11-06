import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Reusable SEO component using react-helmet-async
 * Dynamically renders title, canonical URL, meta description, OpenGraph, and Twitter tags
 */
export default function SEOHead({
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
  const defaultDesc =
    description ||
    'জনগণের পক্ষে সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত ঠিকানা। দেশ-বিদেশের ব্রেকিং নিউজ, রাজনীতি, বাণিজ্য, খেলা ও বিনোদনের তাজা খবর।';

  // Normalize canonical URL to always use standard production origin
  let canonicalUrl = 'https://jonogon.news/';
  if (url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        canonicalUrl = `https://jonogon.news${parsed.pathname}${parsed.search ? parsed.search : ''}`;
      } catch (e) {
        canonicalUrl = url;
      }
    } else {
      canonicalUrl = `https://jonogon.news${url.startsWith('/') ? '' : '/'}${url}`;
    }
  } else if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    canonicalUrl = `https://jonogon.news${pathname === '/' ? '/' : pathname}`;
  }

  // Remove trailing slash if path is longer than root
  if (canonicalUrl.length > 'https://jonogon.news/'.length && canonicalUrl.endsWith('/')) {
    canonicalUrl = canonicalUrl.slice(0, -1);
  }

  const image = imageUrl || 'https://jonogon.news/logo.png';

  return (
    <Helmet>
      {/* Title */}
      <title>{fullTitle}</title>

      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Meta tags */}
      <meta name="description" content={defaultDesc} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={defaultDesc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="bn_BD" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={defaultDesc} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={canonicalUrl} />

      {/* Article specific metadata */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}

      {/* Structured data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
