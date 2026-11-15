const offlineCache = 'arpit-app-offline-v1';
const offlinePage = '/app-offline.html';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(offlineCache).then(cache => cache.add(offlinePage)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('arpit-app-offline-') && key !== offlineCache)
      .map(key => caches.delete(key)),
  )));
});

self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || request.mode !== 'navigate' ||
      request.destination !== 'document' || url.origin !== self.location.origin ||
      /^\/(account|admin|owner|login|api)(\/|$)/.test(url.pathname)) return;

  // Cache only the generic fallback, so authenticated and live content stays current.
  event.respondWith(fetch(request).catch(async () =>
    (await caches.match(offlinePage, {cacheName: offlineCache})) ?? Response.error(),
  ));
});
