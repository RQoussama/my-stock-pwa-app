const CACHE = 'stockapp-v12';

self.addEventListener('install', e => {
  // Skip waiting immediately — don't block on caching
  self.skipWaiting();
  // Cache assets in background, don't block install
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      const base = self.registration.scope;
      return Promise.allSettled([
        cache.add(base),
        cache.add(base + 'index.html'),
        cache.add(base + 'manifest.json'),
        cache.add(base + 'icon-192.png'),
        cache.add(base + 'icon-512.png')
      ]);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Network first — always try network, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp && resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
