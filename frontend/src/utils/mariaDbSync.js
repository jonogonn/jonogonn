/**
 * Utility to sync news articles directly to MariaDB / MySQL database.
 * Supports cPanel Apache PHP API, XAMPP, and Node Backend API seamlessly.
 */

const API_ENDPOINTS = [
  '/api/news.php',
  'api/news.php',
  'http://localhost/janogon/api/news.php',
  'http://localhost:5000/api/news'
];

export async function saveArticleToMariaDb(articlePayload) {
  let lastError = null;

  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(articlePayload)
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.success) {
          console.log(`✅ Synced to MariaDB via ${endpoint}:`, result);
          return { success: true, result, endpoint };
        }
      }
    } catch (err) {
      lastError = err;
      // continue to next endpoint
    }
  }

  console.warn('⚠️ MariaDB sync could not reach backend, persisted in local memory:', lastError?.message);
  return { success: false, error: lastError?.message };
}

export async function deleteArticleFromMariaDb(postIdOrId) {
  for (const endpoint of API_ENDPOINTS) {
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
  for (const endpoint of API_ENDPOINTS) {
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
