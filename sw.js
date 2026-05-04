const CACHE_VERSION = 'va-v1';

// reikalingi
const PRECACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/engine.js',
  './icon.svg',
  './manifest.json',
  // Istorijos — dinamiškai
];

// Failai saugomi 1 kart
const DYNAMIC_CACHE = 'va-dynamic-v1';
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Šalinam senas versijas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION && k !== DYNAMIC_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Istorijų failai — naujausi ant viršaus
  if (url.pathname.includes('/stories/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Paveikslėliai — vietiniai pirmi, tada online
  if (url.pathname.includes('/img/')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Visa kita — vietiniai
  event.respondWith(cacheFirst(event.request));
});

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(req, res.clone());
    return res;
  } catch {
    return caches.match(req);
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    return new Response('', { status: 404 });
  }
}
