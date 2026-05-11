
const CACHE = 'va-v3';

const FILES = [
  './index.html',
  './css/style.css',
  './js/engine.js',
  './stories/story_1.js',
  './stories/story_2.js',
  './icon.svg',
  './manifest.json',
  './img/img.zip',   // visi paveikslėliai viename faile
];

// install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .then(res => {
          // Dinamiškai kešuoti naujai rastus failus
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() => cached || new Response('', { status: 404 }))
      )
  );
});

//"skipWaiting" nauja versija įsigalioja
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
