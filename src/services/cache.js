/**
 * Client-side in-memory cache for API responses.
 * 
 * Uses a stale-while-revalidate pattern:
 * - If data is cached and fresh (< maxAge), return it immediately — no API call.
 * - If data is cached but stale (> maxAge), return it immediately AND revalidate in background.
 * - If no cache, fetch normally.
 * 
 * This eliminates loading spinners on repeat page visits.
 */

const cache = new Map();
const DEFAULT_MAX_AGE = 2 * 60 * 1000; // 2 minutes before stale
const DEFAULT_TTL = 10 * 60 * 1000;    // 10 minutes before eviction

/**
 * Build a cache key from a function name and its arguments.
 */
function buildKey(namespace, args) {
  return namespace + '::' + JSON.stringify(args);
}

/**
 * Get cached data if available.
 * Returns { data, isStale } or null if not cached.
 */
export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return {
    data: entry.data,
    isStale: age > entry.maxAge,
  };
}

/**
 * Store data in cache.
 */
export function setCache(key, data, maxAge = DEFAULT_MAX_AGE, ttl = DEFAULT_TTL) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    maxAge,
    ttl,
  });
}

/**
 * Invalidate cache entries matching a prefix.
 * Call this after mutations (create/update/delete).
 */
export function invalidateCache(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Invalidate all cache entries.
 */
export function invalidateAll() {
  cache.clear();
}

/**
 * Wraps an async API call with client-side caching.
 * 
 * @param {string} namespace - Cache namespace (e.g., 'reservations')
 * @param {Function} apiFn - The async API function to call
 * @param {Array} args - Arguments to pass to the API function
 * @param {Function} onData - Callback to set data (called immediately with cached data, and again after revalidation)
 * @param {Function} onLoading - Callback to set loading state
 * @param {object} options - { maxAge, ttl }
 */
export async function cachedFetch(namespace, apiFn, args = [], onData, onLoading, options = {}) {
  const key = buildKey(namespace, args);
  const cached = getCached(key);
  const { maxAge = DEFAULT_MAX_AGE, ttl = DEFAULT_TTL } = options;

  if (cached) {
    // Serve cached data immediately — no loading spinner!
    onData(cached.data);
    onLoading(false);

    if (!cached.isStale) {
      // Data is fresh, no need to revalidate
      return cached.data;
    }

    // Data is stale — revalidate in background (no spinner)
    try {
      const freshData = await apiFn(...args);
      setCache(key, freshData, maxAge, ttl);
      onData(freshData);
    } catch (e) {
      console.error(`Background revalidation failed for ${namespace}:`, e);
      // Keep showing stale data — it's better than nothing
    }
    return cached.data;
  }

  // No cache — normal fetch with loading spinner
  onLoading(true);
  try {
    const data = await apiFn(...args);
    setCache(key, data, maxAge, ttl);
    onData(data);
    return data;
  } finally {
    onLoading(false);
  }
}
