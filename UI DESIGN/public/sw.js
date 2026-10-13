/**
 * NegoMind AI - Progressive Web App Service Worker
 * Secure, privacy-preserving caching policy.
 */

const CACHE_NAME = 'negomind-pwa-v1';

// Static application assets for fast local load & offline UI shell
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/logo-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/manifest.webmanifest'
];

// URLs that MUST NEVER be cached to prevent leaking tokens, auth status, or stale live negotiation states
const SENSITIVE_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /\/oauth\//,
  /code=/,
  /token=/,
  /session/,
  /health/,
  /settings/
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.debug('[SW] Precache completed with non-blocking warnings:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Only process GET requests; never cache POST, PUT, DELETE, etc.
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 2. Strict bypass: API, OAuth, tokens, or private endpoints are NEVER cached
  const isSensitive = SENSITIVE_PATTERNS.some((pattern) => pattern.test(url.pathname) || pattern.test(url.search));
  if (isSensitive) {
    // Direct network pass-through
    return;
  }

  // 3. Navigation requests (HTML pages): Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 4. Static assets (JS, CSS, fonts, images): Cache-first with network fallback & background update
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background for up-to-date assets
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network fetch
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
