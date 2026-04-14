const CACHE = 'pianofinanziario-v1';
const STATIC = ['/', '/impara', '/prezzi'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;
  // Skip API and Supabase requests
  if (e.request.url.includes('/api/') || e.request.url.includes('supabase')) return;

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
