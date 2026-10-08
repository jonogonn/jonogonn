/**
 * Janogon News - Enterprise Image Upload & Backblaze B2 Sync Engine
 * 1. Converts any image to high-quality .webp client-side via HTML5 Canvas.
 * 2. Uploads to /api/upload.php (cPanel Production & Local Apache).
 * 3. Falls back seamlessly to Direct Backblaze B2 REST API if local server is unreachable.
 * 4. Returns permanent CDN URL: https://cdn.jonogon.news/uploads/YYYY/MM/filename.webp
 */

const B2_CONFIG = {
  keyId: '8de54e8fbbf8',
  applicationKey: '00536cd00fc9f8135855e357dbad747e7801e4757a',
  bucketId: '785d6e1534fef8dfab0b0f18',
  bucketName: 'jonogon.news',
  cdnBaseUrl: 'https://cdn.jonogon.news'
};

/**
 * Convert any image file to a compressed .webp Blob using HTML5 Canvas
 * @param {File|Blob} file 
 * @param {number} quality 0 to 1 (default 0.85)
 * @param {number} maxDimension Max width/height in px (default 1920)
 * @returns {Promise<File>}
 */
export async function convertImageToWebp(file, quality = 0.85, maxDimension = 1920) {
  if (!file) return file;

  // If already WebP and small enough, keep as is
  if (file.type === 'image/webp' && file.size < 1024 * 1024) {
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
                const baseName = (file.name || 'image').replace(/\.[^/.]+$/, '');
                const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'news-img';
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
 * Direct Client-Side Upload to Backblaze B2 (when backend server is offline or proxy unreachable)
 */
async function uploadDirectlyToBackblazeB2(file) {
  const basicAuth = btoa(`${B2_CONFIG.keyId}:${B2_CONFIG.applicationKey}`);

  // 1. Authorize
  const authRes = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    headers: { Authorization: `Basic ${basicAuth}` }
  });
  if (!authRes.ok) throw new Error(`B2 Auth Failed: ${authRes.status}`);
  const auth = await authRes.json();

  // 2. Get Upload URL
  const urlRes = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      Authorization: auth.authorizationToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bucketId: B2_CONFIG.bucketId })
  });
  if (!urlRes.ok) throw new Error(`B2 Get Upload URL Failed: ${urlRes.status}`);
  const uploadData = await urlRes.json();

  // 3. Upload File
  const arrayBuffer = await file.arrayBuffer();
  const dateObj = new Date();
  const yearMonth = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
  const baseName = (file.name || 'image').replace(/\.[^/.]+$/, '');
  const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 35) || 'news';
  const fileName = `uploads/${yearMonth}/${cleanName}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.webp`;

  const uploadRes = await fetch(uploadData.uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: uploadData.authorizationToken,
      'X-Bz-File-Name': encodeURIComponent(fileName),
      'Content-Type': 'image/webp',
      'Content-Length': String(arrayBuffer.byteLength),
      'X-Bz-Content-Sha1': 'do_not_verify'
    },
    body: arrayBuffer
  });

  if (!uploadRes.ok) throw new Error(`B2 Upload Failed: ${uploadRes.status}`);
  const result = await uploadRes.json();

  const cdnUrl = `${B2_CONFIG.cdnBaseUrl}/${fileName}`;
  console.log('✅ [Direct Backblaze B2 Upload]:', cdnUrl, result.fileId);
  return cdnUrl;
}

/**
 * Upload an image file to Backblaze B2 & cPanel MariaDB storage
 * @param {File} rawFile
 * @param {object} options
 * @returns {Promise<string>} Permanent CDN WebP URL
 */
export async function uploadImageToStorage(rawFile, options = {}) {
  if (!rawFile) return '';

  // 1. Client-Side WebP Conversion
  let fileToUpload = rawFile;
  try {
    fileToUpload = await convertImageToWebp(rawFile, 0.85, 1920);
  } catch (err) {
    console.warn('WebP conversion note:', err);
  }

  // 2. Try Server API endpoints (cPanel & Local Apache)
  const endpoints = ['/api/upload.php', 'api/upload.php', './api/upload.php'];
  const formData = new FormData();
  formData.append('image', fileToUpload);
  formData.append('file', fileToUpload);
  if (options.caption) formData.append('caption', options.caption);
  if (options.associatedNews) formData.append('associated_news', options.associatedNews);

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const result = await response.json();
        if (result && result.success && (result.url || result.imageUrl)) {
          const finalUrl = result.url || result.imageUrl;
          console.log(`✅ [Server Storage] Uploaded via ${endpoint}:`, finalUrl);
          return finalUrl;
        }
      }
    } catch (err) {
      // Continue to next or direct cloud upload
    }
  }

  // 3. Direct Backblaze B2 Cloud Upload Fallback
  try {
    const directUrl = await uploadDirectlyToBackblazeB2(fileToUpload);
    if (directUrl) return directUrl;
  } catch (b2Err) {
    console.warn('Direct B2 upload note:', b2Err?.message);
  }

  // 4. Base64 fallback (guaranteed never to expire unlike blob URLs)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(fileToUpload);
  });
}

export default uploadImageToStorage;
