const version = 'workspace-v2';
const fallbackCache = 'arpit-fallback-' + version;
const assetsCache = 'arpit-assets-' + version;
const stateCache = 'arpit-offline-state';
const fallbackPage = '/app-offline.html';
const packs = {
  essentials: [
    '/widgets',
    '/widgets/clock',
    '/widgets/focus',
    '/widgets/tasks',
    '/widgets/calculator',
    '/widgets/game',
    '/productivity/pomodoro',
    '/productivity/todo',
    '/projects/calculator',
  ],
  games: ['/games/2048', '/games/memory', '/games/sudoku', '/games/tictactoe'],
};
const packCache = (id) => 'arpit-pack-' + version + '-' + id;
const packKey = (id) => '/__offline-pack-' + id;

async function installedPacks() {
  const state = await caches.open(stateCache);
  return (
    await Promise.all(
      Object.keys(packs).map(async (id) => {
        const item = await state.match(packKey(id));
        return item && (await caches.has(packCache(id))) ? id : null;
      }),
    )
  ).filter(Boolean);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(fallbackCache).then((cache) => cache.add(fallbackPage)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith('arpit-') &&
              name !== stateCache &&
              name !== assetsCache &&
              name !== fallbackCache &&
              !Object.keys(packs).some((id) => name === packCache(id)),
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

async function savePack(id, port, resources) {
  const routes = packs[id];
  if (!routes) throw new Error('Unknown offline pack.');
  const pack = await caches.open(packCache(id));
  const staged = [];
  const assets = new Set([
    '/app-icons/brand-192.png',
    '/app-icons/brand-512.png',
    '/app-icons/brand-maskable-512.png',
    '/app-icons/brand-touch-180.png',
    '/app-icons/brand-32.png',
    '/app-icons/brand-16.png',
  ]);
  for (const resource of (Array.isArray(resources) ? resources : []).slice(
    0,
    200,
  )) {
    try {
      const url = new URL(resource, self.location.origin);
      if (
        url.origin === self.location.origin &&
        /^\/_next\/static\/[^?#]+\.(js|css|woff2?|ttf)$/.test(url.pathname)
      )
        assets.add(url.pathname);
    } catch {}
  }
  for (const [index, route] of routes.entries()) {
    port?.postMessage({
      progress:
        'Downloading ' + (index + 1) + ' of ' + routes.length + ' tools…',
    });
    const response = await fetch(route, {
      cache: 'reload',
      credentials: 'same-origin',
    });
    if (
      !response.ok ||
      !response.headers.get('content-type')?.includes('text/html')
    )
      throw new Error(
        'A tool is unavailable. Reconnect and retry the download.',
      );
    const html = await response.clone().text();
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const url = new URL(
        match[1].replace(/&amp;/g, '&'),
        self.location.origin,
      );
      if (
        url.origin === self.location.origin &&
        url.pathname.startsWith('/_next/static/')
      )
        assets.add(url.pathname);
    }
    staged.push([route, response]);
  }
  const cache = await caches.open(assetsCache);
  for (const asset of assets) {
    const response = await fetch(asset, {cache: 'reload'});
    if (!response.ok)
      throw new Error('An app resource could not be downloaded. Please retry.');
    await cache.put(asset, response);
  }
  for (const [route, response] of staged) await pack.put(route, response);
  const state = await caches.open(stateCache);
  await state.put(
    packKey(id),
    new Response(JSON.stringify({version, time: Date.now()})),
  );
}

let operation = Promise.resolve();
self.addEventListener('message', (event) => {
  if (
    !event.source ||
    new URL(event.source.url).origin !== self.location.origin
  )
    return;
  const {type, pack, resources} = event.data ?? {};
  const port = event.ports[0];
  if (!['INSTALL_PACK', 'REMOVE_PACK', 'PACK_STATUS'].includes(type) || !port)
    return;
  operation = operation
    .then(async () => {
      if (type === 'INSTALL_PACK') await savePack(pack, port, resources);
      if (type === 'REMOVE_PACK') {
        if (!packs[pack]) throw new Error('Unknown pack.');
        await caches.delete(packCache(pack));
        await (await caches.open(stateCache)).delete(packKey(pack));
        if (!(await installedPacks()).length) await caches.delete(assetsCache);
      }
      port.postMessage({installed: await installedPacks()});
    })
    .catch(() =>
      port.postMessage({
        error:
          'The offline pack could not be prepared. Check your connection and free storage, then retry.',
      }),
    );
  event.waitUntil(operation);
});

self.addEventListener('fetch', (event) => {
  const {request} = event;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    /^\/(account|admin|owner|login|api|download)(\/|$)/.test(url.pathname)
  )
    return;

  // Flight requests cannot receive a document response. A failed prefetch falls back
  // to the browser's normal full-page navigation, which can use the saved document.
  if (request.headers.get('RSC') === '1') return;
  if (request.mode === 'navigate' && request.destination === 'document') {
    event.respondWith(
      (async () => {
        const installed = await installedPacks();
        const id = installed.find((id) => packs[id].includes(url.pathname));
        try {
          const response = await fetch(request);
          if (
            id &&
            response.ok &&
            response.headers.get('content-type')?.includes('text/html')
          ) {
            await (
              await caches.open(packCache(id))
            ).put(url.pathname, response.clone());
          }
          return response;
        } catch {
          if (id) {
            const saved = await (
              await caches.open(packCache(id))
            ).match(url.pathname);
            if (saved) return saved;
          }
          return (
            (await caches.match(fallbackPage, {cacheName: fallbackCache})) ??
            Response.error()
          );
        }
      })(),
    );
  } else if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/app-icons/')
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(assetsCache);
        const saved = await cache.match(url.pathname);
        if (saved) return saved;
        const response = await fetch(request);
        if (response.ok && (await installedPacks()).length)
          await cache.put(url.pathname, response.clone());
        return response;
      })(),
    );
  }
});
