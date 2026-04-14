// Service worker v2 — minimal, no HTML caching
// Clears all old caches to fix stale bundle issue

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  // Delete all old caches so clients get fresh HTML/JS after each deploy
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
