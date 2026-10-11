/**
 * Utility to sync news articles and admin modules directly to MariaDB / MySQL database.
 * Compatible with cPanel Hosting, Local XAMPP, and Cloud Production Servers.
 */

function getNewsEndpoints() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isJanogon = pathname.includes('/janogon');
  const list = [
    isJanogon ? '/janogon/api/news.php' : '/api/news.php',
    '/janogon/api/news.php',
    '/api/news.php',
    'api/news.php',
    './api/news.php',
    'http://localhost/janogon/api/news.php',
    'http://127.0.0.1/janogon/api/news.php',
    'https://jonogon.news/api/news.php'
  ];
  if (origin) {
    if (isJanogon) {
      list.unshift(`${origin}/janogon/api/news.php`);
    }
    list.unshift(`${origin}/api/news.php`);
  }
  return [...new Set(list)];
}

function getSyncEndpoints() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isJanogon = pathname.includes('/janogon');
  const list = [
    isJanogon ? '/janogon/api/admin_sync.php' : '/api/admin_sync.php',
    '/janogon/api/admin_sync.php',
    '/api/admin_sync.php',
    'api/admin_sync.php',
    './api/admin_sync.php',
    'http://localhost/janogon/api/admin_sync.php',
    'http://127.0.0.1/janogon/api/admin_sync.php',
    'https://jonogon.news/api/admin_sync.php'
  ];
  if (origin) {
    if (isJanogon) {
      list.unshift(`${origin}/janogon/api/admin_sync.php`);
    }
    list.unshift(`${origin}/api/admin_sync.php`);
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

export async function fetchArticlesFromMariaDb() {
  const endpoints = getNewsEndpoints();
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
  const list = [
    isJanogon ? '/janogon/api/podcasts.php' : '/api/podcasts.php',
    '/janogon/api/podcasts.php',
    '/api/podcasts.php',
    'api/podcasts.php',
    './api/podcasts.php',
    'http://localhost/janogon/api/podcasts.php',
    'http://127.0.0.1/janogon/api/podcasts.php',
    'https://jonogon.news/api/podcasts.php'
  ];
  if (origin) {
    if (isJanogon) {
      list.unshift(`${origin}/janogon/api/podcasts.php`);
    }
    list.unshift(`${origin}/api/podcasts.php`);
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
  const q = query ? (query.startsWith('?') ? query : `?${query}`) : '';
  const list = [
    isJanogon ? `/janogon/api/comments.php${q}` : `/api/comments.php${q}`,
    `/janogon/api/comments.php${q}`,
    `/api/comments.php${q}`,
    `api/comments.php${q}`,
    `./api/comments.php${q}`,
    `http://localhost/janogon/api/comments.php${q}`,
    `http://127.0.0.1/janogon/api/comments.php${q}`,
    `https://jonogon.news/api/comments.php${q}`
  ];
  if (origin) {
    if (isJanogon) {
      list.unshift(`${origin}/janogon/api/comments.php${q}`);
    }
    list.unshift(`${origin}/api/comments.php${q}`);
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
        const errorMsg = result?.message || `HTTP ${response.status} from ${endpoint}`;
        lastError = new Error(errorMsg);
      }
    } catch (err) {
      lastError = err;
    }
  }

  return { success: false, error: lastError?.message || 'Failed to submit comment' };
}
