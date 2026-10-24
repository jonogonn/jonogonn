/**
 * Janogon News - Image Upload Utility
 * 1. Converts any image to high-quality .webp client-side via HTML5 Canvas.
 * 2. Uploads via backend API (/api/upload.php) which securely uploads to Backblaze B2 & MariaDB.
 * 3. Returns Backblaze B2 Cloud / CDN URL.
 */

let cachedWatermarkImage = null;

/**
 * Load official logo watermark image (with multi-candidate fallback)
 * @returns {Promise<HTMLImageElement|null>}
 */
export function loadWatermarkImage() {
  if (cachedWatermarkImage && cachedWatermarkImage.complete && cachedWatermarkImage.naturalWidth > 0) {
    return Promise.resolve(cachedWatermarkImage);
  }

  return new Promise((resolve) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const candidates = [
      `${origin}/logo-watermark.png`,
      `${origin}/janogon/logo-watermark.png`,
      '/logo-watermark.png',
      '/janogon/logo-watermark.png',
      'logo-watermark.png',
      './logo-watermark.png'
    ];
    let candidateIndex = 0;

    const tryNext = () => {
      if (candidateIndex >= candidates.length) {
        resolve(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (img.naturalWidth > 0) {
          cachedWatermarkImage = img;
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
      img.src = candidates[candidateIndex];
    };

    tryNext();
  });
}

/**
 * Draw logo watermark onto an HTML5 Canvas context
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} width Canvas width
 * @param {number} height Canvas height
 * @param {HTMLImageElement} watermarkImg Loaded logo-watermark image
 * @param {number} opacity Opacity (default 0.38, matching official sample)
 */
export function drawLogoWatermark(ctx, width, height, watermarkImg, opacity = 0.38) {
  if (!ctx || !watermarkImg) return;

  const wmNaturalW = watermarkImg.naturalWidth || watermarkImg.width || 400;
  const wmNaturalH = watermarkImg.naturalHeight || watermarkImg.height || 349;
  const wmAspect = wmNaturalH / wmNaturalW;

  // Proportional width: ~24% to 28% of the image width
  let wmWidth = Math.round(width * 0.25);
  if (width > 600) {
    wmWidth = Math.max(160, Math.min(wmWidth, 420));
  } else {
    wmWidth = Math.max(100, Math.min(wmWidth, Math.round(width * 0.45)));
  }
  const wmHeight = Math.round(wmWidth * wmAspect);

  // Position: Center-Center of the image (exactly where the red arrow in user screenshot points)
  const wmX = Math.round((width - wmWidth) / 2);
  const wmY = Math.round((height - wmHeight) / 2);

  ctx.save();
  // Matching user's screenshot watermark opacity: translucent (~0.38)
  ctx.globalAlpha = opacity;
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
 * @param {number} watermarkOpacity (default 0.38)
 * @returns {Promise<File>}
 */
export async function convertImageToWebp(file, quality = 0.85, maxDimension = 1920, customSlug = '', applyWatermark = true, watermarkOpacity = 0.38) {
  if (!file) return file;

  // Pre-load watermark if requested
  let watermarkImg = null;
  if (applyWatermark) {
    try {
      watermarkImg = await loadWatermarkImage();
    } catch (e) {
      console.warn('Could not load watermark:', e);
    }
  }

  // If already WebP and no watermark is required, keep as is
  if (!applyWatermark && file.type === 'image/webp' && file.size < 1024 * 1024 && !customSlug) {
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
          if (watermarkImg && applyWatermark) {
            drawLogoWatermark(ctx, width, height, watermarkImg, watermarkOpacity);
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
  const watermarkOpacity = typeof options.watermarkOpacity === 'number' ? options.watermarkOpacity : 0.38;
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
