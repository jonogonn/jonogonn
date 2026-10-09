/**
 * Janogon News - Image Upload Utility
 * 1. Converts any image to high-quality .webp client-side via HTML5 Canvas.
 * 2. Uploads via backend API (/api/upload.php) which securely uploads to Backblaze B2 & MariaDB.
 * 3. Returns permanent CDN URL (https://cdn.jonogon.news/uploads/YYYY/MM/filename.webp).
 */

/**
 * Convert any image file to a compressed .webp Blob using HTML5 Canvas
 * @param {File|Blob} file 
 * @param {number} quality 0 to 1 (default 0.85)
 * @param {number} maxDimension Max width/height in px (default 1920)
 * @returns {Promise<File>}
 */
export async function convertImageToWebp(file, quality = 0.85, maxDimension = 1920, customSlug = '') {
  if (!file) return file;

  // If already WebP and small enough, keep as is
  if (file.type === 'image/webp' && file.size < 1024 * 1024 && !customSlug) {
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

          ctx.drawImage(img, 0, 0, width, height);

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

  // 1. Client-Side WebP Conversion
  let fileToUpload = rawFile;
  try {
    emitProgress(25, 'WebP অপ্টিমাইজেশন সম্পন্ন...');
    fileToUpload = await convertImageToWebp(rawFile, 0.85, 1920, targetSlug);
    emitProgress(40, 'ক্লাউড ও সার্ভার আপলোড শুরু হচ্ছে...');
  } catch (err) {
    console.warn('WebP conversion note:', err);
  }

  // 2. Upload via backend /api/upload.php using XMLHttpRequest for real progress
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const endpoints = [
    '/api/upload.php',
    'api/upload.php',
    './api/upload.php',
    'http://localhost/janogon/api/upload.php',
    'http://127.0.0.1/janogon/api/upload.php'
  ];
  if (origin) {
    endpoints.unshift(`${origin}/api/upload.php`);
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
