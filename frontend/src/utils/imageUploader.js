/**
 * Janogon News - Image Upload Utility
 * 1. Converts any image to high-quality .webp client-side via HTML5 Canvas.
 * 2. Uploads via backend API (/api/upload.php) which securely uploads to Backblaze B2 & MariaDB.
 * 3. Returns Backblaze B2 Cloud / CDN URL.
 */

let cachedWatermarkImage = null;
let cachedWatermarkUrl = null;

/**
 * Get watermark configuration from localStorage or defaults
 */
export function getWatermarkSettings() {
  if (typeof window === 'undefined') {
    return {
      enabled: true,
      imageUrl: '/news-card-jonogon-watermark.png',
      position: 'bottom-full',
      scale: 100,
      opacity: 100,
      margin: 0
    };
  }
  try {
    const raw = localStorage.getItem('jonogon_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.watermark) {
        return {
          enabled: parsed.watermark.enabled !== false,
          imageUrl: parsed.watermark.imageUrl || '/news-card-jonogon-watermark.png',
          position: parsed.watermark.position || 'bottom-full',
          scale: typeof parsed.watermark.scale === 'number' ? parsed.watermark.scale : (parseInt(parsed.watermark.scale, 10) || 100),
          opacity: typeof parsed.watermark.opacity === 'number' ? parsed.watermark.opacity : (parseInt(parsed.watermark.opacity, 10) || 100),
          margin: typeof parsed.watermark.margin === 'number' ? parsed.watermark.margin : (parseInt(parsed.watermark.margin, 10) || 0)
        };
      }
    }
  } catch (e) {
    // fallback
  }
  return {
    enabled: true,
    imageUrl: '/news-card-jonogon-watermark.png',
    position: 'bottom-full',
    scale: 100,
    opacity: 100,
    margin: 0
  };
}

/**
 * Load logo watermark image (with dynamic settings & multi-candidate fallback)
 * @param {string} customUrl
 * @returns {Promise<HTMLImageElement|null>}
 */
export function loadWatermarkImage(customUrl = '') {
  const currentSettings = getWatermarkSettings();
  const targetUrl = customUrl || currentSettings.imageUrl || '/news-card-jonogon-watermark.png';

  if (cachedWatermarkImage && cachedWatermarkUrl === targetUrl && cachedWatermarkImage.complete && cachedWatermarkImage.naturalWidth > 0) {
    return Promise.resolve(cachedWatermarkImage);
  }

  return new Promise((resolve) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const candidates = [];
    if (targetUrl) {
      candidates.push(targetUrl);
      if (!targetUrl.startsWith('http') && !targetUrl.startsWith('data:')) {
        candidates.push(`${origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`);
      }
    }
    candidates.push(
      `${origin}/news-card-jonogon-watermark.png`,
      `${origin}/janogon/news-card-jonogon-watermark.png`,
      '/news-card-jonogon-watermark.png',
      '/janogon/news-card-jonogon-watermark.png',
      'news-card-jonogon-watermark.png'
    );
    const uniqueCandidates = [...new Set(candidates)];
    let candidateIndex = 0;

    const tryNext = () => {
      if (candidateIndex >= uniqueCandidates.length) {
        resolve(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (img.naturalWidth > 0) {
          cachedWatermarkImage = img;
          cachedWatermarkUrl = targetUrl;
          resolve(img);
        } else {
          candidateIndex++;
          tryNext();
        }
      };
      img.onerror = () => {
        candidateIndex++;
        tryNext();
      };
      img.src = uniqueCandidates[candidateIndex];
    };

    tryNext();
  });
}

/**
 * Draw official watermark onto an HTML5 Canvas context
 * Supports position, scale, opacity, and margin controls
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} width Canvas width
 * @param {number} height Canvas height
 * @param {HTMLImageElement} watermarkImg Loaded watermark image
 * @param {object|number} options Configuration or opacity number
 */
export function drawLogoWatermark(ctx, width, height, watermarkImg, options = {}) {
  if (!ctx || !watermarkImg) return;

  const storedConfig = getWatermarkSettings();
  const config = typeof options === 'object' && options !== null
    ? { ...storedConfig, ...options }
    : { ...storedConfig, opacity: typeof options === 'number' ? options : storedConfig.opacity };

  if (config.enabled === false) {
    return;
  }

  const wmNaturalW = watermarkImg.naturalWidth || watermarkImg.width || 8711;
  const wmNaturalH = watermarkImg.naturalHeight || watermarkImg.height || 691;
  const wmAspect = wmNaturalH / wmNaturalW;

  const scaleFactor = Math.max(0.1, Math.min(1.5, (Number(config.scale) || 100) / 100));
  const rawOpacity = Number(config.opacity);
  const opacityVal = !isNaN(rawOpacity) ? (rawOpacity > 1 ? rawOpacity / 100 : rawOpacity) : 1.0;
  const marginPx = Math.max(0, Number(config.margin) || 0);
  const pos = config.position || 'bottom-full';

  let wmWidth = width;
  let wmHeight = Math.round(width * wmAspect);

  if (pos === 'bottom-full') {
    wmWidth = Math.round(width * scaleFactor);
    wmHeight = Math.round(wmWidth * wmAspect);
    if (wmHeight > Math.round(height * 0.35)) {
      wmHeight = Math.round(height * 0.25);
      wmWidth = Math.round(wmHeight / wmAspect);
    }
  } else {
    const baseW = Math.round(width * 0.40);
    wmWidth = Math.round(baseW * scaleFactor);
    wmHeight = Math.round(wmWidth * wmAspect);

    if (wmWidth > width - marginPx * 2) {
      wmWidth = Math.max(50, width - marginPx * 2);
      wmHeight = Math.round(wmWidth * wmAspect);
    }
    if (wmHeight > height - marginPx * 2) {
      wmHeight = Math.max(20, height - marginPx * 2);
      wmWidth = Math.round(wmHeight / wmAspect);
    }
  }

  let wmX = 0;
  let wmY = 0;

  switch (pos) {
    case 'top-left':
      wmX = marginPx;
      wmY = marginPx;
      break;
    case 'top-right':
      wmX = width - wmWidth - marginPx;
      wmY = marginPx;
      break;
    case 'center':
      wmX = Math.round((width - wmWidth) / 2);
      wmY = Math.round((height - wmHeight) / 2);
      break;
    case 'bottom-left':
      wmX = marginPx;
      wmY = height - wmHeight - marginPx;
      break;
    case 'bottom-right':
      wmX = width - wmWidth - marginPx;
      wmY = height - wmHeight - marginPx;
      break;
    case 'bottom-center':
      wmX = Math.round((width - wmWidth) / 2);
      wmY = height - wmHeight - marginPx;
      break;
    case 'bottom-full':
    default:
      wmX = Math.round((width - wmWidth) / 2);
      wmY = height - wmHeight - marginPx;
      break;
  }

  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(1.0, opacityVal));
  ctx.drawImage(watermarkImg, wmX, wmY, wmWidth, wmHeight);
  ctx.restore();
}

/**
 * Convert any image file to a compressed .webp Blob using HTML5 Canvas with embedded logo watermark
 * @param {File|Blob} file 
 * @param {number} quality 0 to 1 (default 0.85)
 * @param {number} maxDimension Max width/height in px (default 1920)
 * @param {string} customSlug
 * @param {boolean} applyWatermark (default true)
 * @param {object|number} watermarkOptions Options or opacity
 * @returns {Promise<File>}
 */
export async function convertImageToWebp(file, quality = 0.85, maxDimension = 1920, customSlug = '', applyWatermark = true, watermarkOptions = null) {
  if (!file) return file;

  const wmSettings = getWatermarkSettings();
  const shouldApplyWatermark = applyWatermark && (wmSettings.enabled !== false);

  // Pre-load watermark if requested
  let watermarkImg = null;
  if (shouldApplyWatermark) {
    try {
      const customUrl = watermarkOptions?.imageUrl || wmSettings.imageUrl;
      watermarkImg = await loadWatermarkImage(customUrl);
    } catch (e) {
      console.warn('Could not load watermark:', e);
    }
  }

  // If already WebP and no watermark is required, keep as is
  if (!shouldApplyWatermark && file.type === 'image/webp' && file.size < 1024 * 1024 && !customSlug) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // Scale down if exceeds max dimensions
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(file);
            return;
          }

          // Draw original image
          ctx.drawImage(img, 0, 0, width, height);

          // Apply logo watermark
          if (watermarkImg && shouldApplyWatermark) {
            drawLogoWatermark(ctx, width, height, watermarkImg, watermarkOptions || wmSettings);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const baseRaw = customSlug || file.name || 'image';
                const baseName = baseRaw.replace(/\.[^/.]+$/, '');
                const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'news-img';
                const webpFile = new File([blob], `${cleanName}.webp`, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                resolve(webpFile);
              } else {
                resolve(file);
              }
            },
            'image/webp',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    } catch (e) {
      resolve(file);
    }
  });
}

/**
 * Upload an image file via the backend API to Backblaze B2 & cPanel MariaDB
 * @param {File} rawFile
 * @param {object} options { slug, newsSlug, associatedNews, caption, title, onProgress, silent }
 * @returns {Promise<string>} Permanent CDN WebP URL
 */
export async function uploadImageToStorage(rawFile, options = {}) {
  if (!rawFile) return '';

  const targetSlug = options.slug || options.newsSlug || options.associatedNews || '';
  const fileName = rawFile.name || 'Image';
  const silent = options.silent === true;

  const emitProgress = (progress, statusText) => {
    if (typeof options.onProgress === 'function') {
      options.onProgress(progress, statusText);
    }
    if (!silent && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('site_upload_progress', {
          detail: { progress, statusText, fileName }
        })
      );
    }
  };

  if (!silent && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('site_upload_start', {
        detail: { progress: 15, statusText: 'WebP রূপান্তর হচ্ছে...', fileName }
      })
    );
  }

  // 1. Client-Side WebP Conversion & Watermark Embedding
  let fileToUpload = rawFile;
  const applyWatermark = options.skipWatermark !== true;
  const watermarkOpacity = typeof options.watermarkOpacity === 'number' ? options.watermarkOpacity : 1.0;
  try {
    emitProgress(25, applyWatermark ? 'ছবিতে অফিসিয়াল ওয়াটারমার্ক ও WebP অপ্টিমাইজ হচ্ছে...' : 'WebP অপ্টিমাইজেশন সম্পন্ন...');
    fileToUpload = await convertImageToWebp(rawFile, 0.85, 1920, targetSlug, applyWatermark, watermarkOpacity);
    emitProgress(40, 'ক্লাউড ও সার্ভার আপলোড শুরু হচ্ছে...');
  } catch (err) {
    console.warn('WebP conversion note:', err);
  }

  // 2. Upload via backend /api/upload.php using XMLHttpRequest for real progress
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
  const endpoints = [
    '/janogon/api/upload.php',
    '/api/upload.php',
    'api/upload.php'
  ];
  if (isLocal) {
    endpoints.push('http://localhost/janogon/api/upload.php');
    endpoints.push('http://127.0.0.1/janogon/api/upload.php');
  } else {
    endpoints.push('https://jonogon.news/api/upload.php');
  }
  if (origin) {
    endpoints.unshift(`${origin}/janogon/api/upload.php`);
    endpoints.push(`${origin}/api/upload.php`);
  }
  const uniqueEndpoints = [...new Set(endpoints)];

  const formData = new FormData();
  formData.append('image', fileToUpload);
  formData.append('file', fileToUpload);
  if (targetSlug) {
    formData.append('slug', targetSlug);
    formData.append('news_slug', targetSlug);
  }
  if (options.caption) formData.append('caption', options.caption);
  if (options.associatedNews) formData.append('associated_news', options.associatedNews);
  if (options.title) formData.append('title', options.title);
  if (options.skipWatermark === true || (applyWatermark && fileToUpload !== rawFile)) {
    formData.append('skip_watermark', '1');
  }

  let lastError = null;

  for (const endpoint of uniqueEndpoints) {
    try {
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(95, Math.round(40 + (event.loaded / event.total) * 55));
            emitProgress(percent, `আপলোড হচ্ছে (${percent}%)...`);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`Server returned HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.ontimeout = () => reject(new Error('Upload request timed out'));
        xhr.send(formData);
      });

      if (result && result.success && (result.url || result.imageUrl)) {
        const finalUrl = result.url || result.imageUrl;
        console.log(`✅ [Storage API] Uploaded via ${endpoint}:`, finalUrl);
        if (!silent && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('site_upload_complete', {
              detail: { progress: 100, statusText: 'সফলভাবে ক্লাউডে আপলোড হয়েছে!', fileName }
            })
          );
        }
        return finalUrl;
      } else if (result && result.message) {
        lastError = new Error(result.message);
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.warn('⚠️ Server image upload failed:', lastError?.message);

  if (!silent && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('site_upload_error', {
        detail: { message: 'সার্ভার আপলোড ব্যাহত, লোকাল প্রিভিউ ব্যবহার করা হচ্ছে' }
      })
    );
  }

  // 3. Fallback: Return persistent DataURL (so preview stays visible without broken blob)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(fileToUpload);
  });
}

export default uploadImageToStorage;
