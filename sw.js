/* Rockhound Offline Map — service worker
   Two caches:
   - SHELL: the app itself (html/js/css/icons + Leaflet from CDN). Precached on install.
   - TILES: map tiles. Filled two ways: (a) as you pan the map online, and
            (b) in bulk when you tap "Download this area". Served cache-first
            when you're offline in the field.
*/
const SHELL = 'rockhound-shell-v4';
const TILES = 'rockhound-tiles-v1';

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

// Hosts whose responses we treat as map tiles.
const TILE_HOSTS = [
  'tile.opentopomap.org',
  'tile.openstreetmap.org',
  'server.arcgisonline.com',
  'basemaps.cartocdn.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL && k !== TILES).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isTile(url) {
  return TILE_HOSTS.some((h) => url.hostname.endsWith(h));
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  if (isTile(url)) {
    // Tiles: cache-first. Great offline; also warms cache while you browse online.
    e.respondWith(
      caches.open(TILES).then(async (cache) => {
        const hit = await cache.match(e.request);
        if (hit) return hit;
        try {
          const res = await fetch(e.request);
          if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
          return res;
        } catch (err) {
          // Offline and not cached — return a transparent tile so the map doesn't error.
          return hit || Response.error();
        }
      })
    );
    return;
  }

  // App HTML / navigations: NETWORK-FIRST so a fresh version always loads when online,
  // and falls back to the cached copy only when offline. This is what makes updates
  // show up without cache-fighting.
  const isHTML = e.request.mode === 'navigate' || e.request.destination === 'document'
    || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (url.origin === self.location.origin && isHTML) {
    e.respondWith(
      fetch(e.request).then((res) => {
        caches.open(SHELL).then((c) => c.put('./index.html', res.clone()));
        return res;
      }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // Other assets (Leaflet JS/CSS, icons): cache-first, fall back to network.
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && res.ok && (url.origin === self.location.origin || url.hostname.endsWith('unpkg.com'))) {
          caches.open(SHELL).then((c) => c.put(e.request, res.clone()));
        }
        return res;
      });
    })
  );
});

// Let the page ask how many tiles are cached / clear them.
self.addEventListener('message', async (e) => {
  if (e.data === 'tileCount') {
    const cache = await caches.open(TILES);
    const keys = await cache.keys();
    e.source.postMessage({ type: 'tileCount', count: keys.length });
  }
  if (e.data === 'clearTiles') {
    await caches.delete(TILES);
    await caches.open(TILES);
    e.source.postMessage({ type: 'tilesCleared' });
  }
});
