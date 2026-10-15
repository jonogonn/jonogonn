/**
 * Utility to sync news articles and admin modules directly to MariaDB / MySQL database.
 * Compatible with cPanel Hosting, Local XAMPP, and Cloud Production Servers.
 */

function isLocalEnvironment() {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname || '';
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.');
}

function getNewsEndpoints(query = '') {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isJanogon = pathname.includes('/janogon');
  const isLocal = isLocalEnvironment();
  const q = query ? (query.startsWith('?') ? query : `?${query}`) : '';

  const list = [];
  if (isJanogon || isLocal) {
    list.push(`/janogon/api/news.php${q}`);
    if (origin) list.push(`${origin}/janogon/api/news.php${q}`);
    list.push(`http://127.0.0.1/janogon/api/news.php${q}`);
    list.push(`http://localhost/janogon/api/news.php${q}`);
    list.push(`/api/news.php${q}`);
  } else {
    list.push(`/api/news.php${q}`);
    if (origin) list.push(`${origin}/api/news.php${q}`);
    list.push(`https://jonogon.news/api/news.php${q}`);
  }
  return [...new Set(list)];
}

function getSyncEndpoints() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isJanogon = pathname.includes('/janogon');
  const isLocal = isLocalEnvironment();

  const list = [];
  if (isJanogon || isLocal) {
    list.push('/janogon/api/admin_sync.php');
    if (origin) list.push(`${origin}/janogon/api/admin_sync.php`);
    list.push('http://127.0.0.1/janogon/api/admin_sync.php');
    list.push('http://localhost/janogon/api/admin_sync.php');
    list.push('/api/admin_sync.php');
  } else {
    list.push('/api/admin_sync.php');
    if (origin) list.push(`${origin}/api/admin_sync.php`);
    list.push('https://jonogon.news/api/admin_sync.php');
  }
  return [...new Set(list)];
}

export async function saveArticleToMariaDb(articlePayload) {
  let lastError = null;
  const endpoints = getNewsEndpoints();

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(articlePayload)
      });

      const contentType = response.headers.get('content-type') || '';
      let result = null;
      if (contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (jsonErr) { }
      }

      if (response.ok && result?.success) {
        console.log(`✅ Synced article to MariaDB via ${endpoint}:`, result);
        return { success: true, result, endpoint };
      } else {
        const errorMsg = result?.message || result?.error || `HTTP ${response.status} from ${endpoint}`;
        lastError = new Error(errorMsg);
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.warn('⚠️ MariaDB sync note:', lastError?.message);
  return { success: false, error: lastError?.message };
}

export async function deleteArticleFromMariaDb(postIdOrId) {
  const endpoints = getNewsEndpoints();
  for (const endpoint of endpoints) {
    try {
      const url = `${endpoint}?id=${encodeURIComponent(postIdOrId)}`;
      const response = await fetch(url, {
        method: 'DELETE'
      });
      if (response.ok) {
        return true;
      }
    } catch (err) {
      // continue
    }
  }
  return false;
}

export async function fetchArticlesFromMariaDb(options = {}) {
  let queryString = '';
  if (typeof options === 'string') {
    queryString = options;
  } else if (options && typeof options === 'object') {
    const params = new URLSearchParams();
    if (options.status) params.set('status', options.status);
    if (options.category) params.set('category', options.category);
    if (options.limit) params.set('limit', options.limit);
    if (options.admin) params.set('admin', '1');
    queryString = params.toString();
  }
  const endpoints = getNewsEndpoints(queryString);
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.success && Array.isArray(result.data)) {
          return result.data;
        }
      }
    } catch (err) {
      // continue
    }
  }
  return null;
}

export async function syncModuleToMariaDb(module, data) {
  const endpoints = getSyncEndpoints();
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ module, data })
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.success) {
          console.log(`✅ Synced module '${module}' to MariaDB:`, result);
          return { success: true, result };
        }
      }
    } catch (err) {
      // continue
    }
  }
  return { success: false };
}

export async function fetchModuleFromMariaDb(type = 'all') {
  const endpoints = getSyncEndpoints();
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?type=${encodeURIComponent(type)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.success && result.data) {
          return result.data;
        }
      }
    } catch (err) {
      // continue
    }
  }
  return null;
}

export function getPodcastEndpoints() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isJanogon = pathname.includes('/janogon');
  const isLocal = isLocalEnvironment();

  const list = [];
  if (isJanogon || isLocal) {
    list.push('/janogon/api/podcasts.php');
    if (origin) list.push(`${origin}/janogon/api/podcasts.php`);
    list.push('http://127.0.0.1/janogon/api/podcasts.php');
    list.push('http://localhost/janogon/api/podcasts.php');
    list.push('/api/podcasts.php');
  } else {
    list.push('/api/podcasts.php');
    if (origin) list.push(`${origin}/api/podcasts.php`);
    list.push('https://jonogon.news/api/podcasts.php');
  }
  return [...new Set(list)];
}

export async function savePodcastToMariaDb(podcastPayload) {
  let lastError = null;
  const endpoints = getPodcastEndpoints();

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(podcastPayload)
      });

      let result = null;
      try {
        result = await response.json();
      } catch (jsonErr) { }

      if (response.ok && result?.success) {
        console.log(`✅ Synced podcast to MariaDB via ${endpoint}:`, result);
        return { success: true, result, endpoint };
      } else {
        const errorMsg = result?.message || result?.error || `HTTP ${response.status} from ${endpoint}`;
        lastError = new Error(errorMsg);
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.warn('⚠️ MariaDB podcast sync note:', lastError?.message);
  return { success: false, error: lastError?.message };
}

export async function deletePodcastFromMariaDb(podcastId) {
  const endpoints = getPodcastEndpoints();
  for (const endpoint of endpoints) {
    try {
      const url = `${endpoint}?id=${encodeURIComponent(podcastId)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        return true;
      }
      const postFallback = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: podcastId })
      });
      if (postFallback.ok) {
        return true;
      }
    } catch (err) {
      // continue
    }
  }
  return false;
}

export async function fetchPodcastsFromMariaDb() {
  const endpoints = getPodcastEndpoints();
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.success && Array.isArray(result.data)) {
          return result.data;
        }
      }
    } catch (err) {
      // continue
    }
  }
  return null;
}

function getCommentsEndpoints(query = '') {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isJanogon = pathname.includes('/janogon');
  const isLocal = isLocalEnvironment();
  const q = query ? (query.startsWith('?') ? query : `?${query}`) : '';

  const list = [];
  if (origin) {
    if (isJanogon) {
      list.push(`${origin}/janogon/api/comments.php${q}`);
    }
    list.push(`${origin}/api/comments.php${q}`);
  }
  list.push(isJanogon ? `/janogon/api/comments.php${q}` : `/api/comments.php${q}`);
  list.push(`/api/comments.php${q}`);

  if (isLocal) {
    list.push(`http://localhost/janogon/api/comments.php${q}`);
    list.push(`http://127.0.0.1/janogon/api/comments.php${q}`);
  } else {
    list.push(`https://jonogon.news/api/comments.php${q}`);
  }
  return [...new Set(list)];
}

export async function fetchCommentsFromMariaDb(postId) {
  if (!postId) return [];
  const endpoints = getCommentsEndpoints(`post_id=${encodeURIComponent(postId)}`);
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.success && Array.isArray(result.comments)) {
          return result.comments;
        }
      }
    } catch (err) {
      // continue fallback
    }
  }
  return [];
}

export async function saveCommentToMariaDb(commentPayload) {
  let lastError = null;
  const endpoints = getCommentsEndpoints();

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(commentPayload)
      });

      let result = null;
      try {
        result = await response.json();
      } catch (jsonErr) {}

      if (response.ok && result?.success) {
        return { success: true, comment: result.comment, result };
      } else {
        let errorMsg = result?.message;
        if (!errorMsg) {
          if (response.ok && !result) {
            errorMsg = 'মন্তব্য সংরক্ষণ সার্ভার স্ক্রিপ্ট সাড়া দেয়নি। অনুগ্রহ করে অ্যাডমিনকে জানান।';
          } else {
            errorMsg = `মন্তব্য জমা দিতে ব্যর্থ হয়েছে (Status: ${response.status})`;
          }
        }
        lastError = new Error(errorMsg);
      }
    } catch (err) {
      lastError = err;
    }
  }

  return { success: false, error: lastError?.message || 'Failed to submit comment' };
}
