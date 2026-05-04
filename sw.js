// ═══════════════════════════════════════════════════
// sw.js — Service Worker
// Leidžia žaisti be interneto ryšio.
// Kešuoja visus žaidimo failus pirmą kartą.
// Atnaujinama automatiškai kai keičiasi CACHE_VERSION.
// ═══════════════════════════════════════════════════

const CACHE_VERSION = 'va-v1';

// Failai kurie kešuojami iš karto (žaidimui reikalingi)
const PRECACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/engine.js',
  './icon.svg',
  './manifest.json',
  // Istorijos — kešuojamos dinamiškai
];

// Failai kurie kešuojami kai pirmą kartą pasiekiami
// (paveikslėliai, istorijos)
const DYNAMIC_CACHE = 'va-dynamic-v1';

// ── Instaliacija: iš anksto kešuoti pagrindinius failus ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Aktyvacija: ištrinti senus keš versijas ──
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

// ── Fetch: network-first istorijoms, cache-first kitiems ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Istorijų failai — network first (kad atnaujinimai veiktų)
  if (url.pathname.includes('/stories/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Paveikslėliai — cache first, fallback į network
  if (url.pathname.includes('/img/')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Visa kita — cache first
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
    // Grąžinti placeholder jei paveikslėlis nepasiekiamas
    return new Response('', { status: 404 });
  }
}
