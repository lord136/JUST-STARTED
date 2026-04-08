const CACHE_NAME = 'orbiton-static-v6';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const requestUrl = new URL(e.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNavigate = e.request.mode === 'navigate';
  const isHtmlShell = isNavigate || (isSameOrigin && (requestUrl.pathname === '/' || requestUrl.pathname.endsWith('/index.html')));

  e.respondWith(
    (async () => {
      if (isHtmlShell) {
        try {
          const networkResponse = await fetch(e.request);
          const cache = await caches.open(CACHE_NAME);
          cache.put('./index.html', networkResponse.clone());
          return networkResponse;
        } catch (error) {
          const cachedShell = await caches.match('./index.html');
          if (cachedShell) return cachedShell;
          throw error;
        }
      }

      const cached = await caches.match(e.request);
      if (cached) return cached;

      const networkResponse = await fetch(e.request);
      if (isSameOrigin || /^https:\/\/(fonts\.googleapis\.com|cdnjs\.cloudflare\.com)\//.test(e.request.url)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(e.request, networkResponse.clone());
      }
      return networkResponse;
    })().catch(() => {
      if (isNavigate) return caches.match('./index.html');
      return Response.error();
    })
  );
});
