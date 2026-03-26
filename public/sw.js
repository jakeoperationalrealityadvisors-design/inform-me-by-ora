const CACHE_NAME = 'informme-v1';
const OFFLINE_CACHE = 'informme-offline-v1';

// Core app shell assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

// API paths worth caching for offline reads
const CACHEABLE_API_PATTERNS = [
  '/api/entities/FormTemplate',
  '/api/entities/ChecklistTemplate',
  '/api/entities/Category',
  '/api/entities/Task',
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== OFFLINE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Navigation requests: network-first, fallback to cached /index.html (SPA)
// - Cacheable API reads (GET): stale-while-revalidate
// - Everything else: network-first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POSTs handled by background sync via IndexedDB)
  if (request.method !== 'GET') return;

  // Navigation — serve SPA shell from cache if network fails
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // API reads for forms/checklists/categories — stale-while-revalidate
  const isDataRequest = CACHEABLE_API_PATTERNS.some((p) => url.pathname.includes(p));
  if (isDataRequest) {
    event.respondWith(
      caches.open(OFFLINE_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cache.match(request));
      })
    );
    return;
  }

  // Static assets — cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
  }
});

// Background sync — replay queued submissions when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-submissions') {
    event.waitUntil(replaySyncQueue());
  }
});

async function replaySyncQueue() {
  // Notify all open clients to trigger their sync
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => client.postMessage({ type: 'TRIGGER_SYNC' }));
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
