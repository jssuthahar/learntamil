/* Learn Tamil — service worker: offline support and fast loading.
   VERSION is updated automatically by `node tools/build-pages.mjs` whenever a cached file changes,
   so every deploy reaches users. */
const VERSION = 'b1475788b3';
const CORE = `lt-core-${VERSION}`;   // the app itself, refreshed on every new version
const RUNTIME = 'lt-runtime';        // fonts and other files fetched while using the app
const AUDIO = 'lt-audio';            // letter sounds (kept across versions)

const PRECACHE = [
  './', 'index.html', 'tamil-alphabet.html', 'tamil-vowels.html', 'tamil-consonants.html',
  'uyirmei-ezhuthukal.html', 'tamil-words-for-kids.html', 'tamil-stories-for-kids.html', 'ezhuthukal.html',
  'tamil-numbers.html', 'tamil-colours.html', 'tamil-days-of-the-week.html', 'tamil-body-parts.html',
  'tamil-family-words.html', 'tamil-fruits-and-food.html', 'tamil-printables.html',
  'privacy.html', 'terms.html',
  'css/styles.css', 'js/data.js', 'js/app.js', 'js/rewards.js', 'js/games.js', 'js/cert.js', 'js/faq-data.js', 'js/chat.js', 'js/pwa.js', 'audio/manifest.js',
  'manifest.webmanifest', 'assets/favicon.svg', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/icon-maskable-512.png', 'assets/apple-touch-icon.png'
];

// Letter audio listed in audio/manifest.js (made by tools/generate_audio.py or record.html).
function audioFiles(){
  try {
    self.window = self;               // manifest.js writes window.LT_AUDIO
    importScripts('audio/manifest.js');
    return Object.values(self.LT_AUDIO || {}).map(f => 'audio/' + f);
  } catch (e) { return []; }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const core = await caches.open(CORE);
    await core.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' })));
    // Audio is best-effort: a missing file must not break installation.
    const audio = await caches.open(AUDIO);
    const have = new Set((await audio.keys()).map(r => new URL(r.url).pathname));
    await Promise.all(audioFiles()
      .filter(u => !have.has(new URL(u, self.registration.scope).pathname))
      .map(u => audio.add(u).catch(() => {})));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys())
      if (key.startsWith('lt-core-') && key !== CORE) await caches.delete(key);
    await self.clients.claim();
  })());
});

// The page asks a waiting worker to take over when the user taps "Refresh".
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Page navigations: network first (fresh content), cache when offline.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok && url.origin === location.origin) (await caches.open(CORE)).put(req, res.clone());
        return res;
      } catch (e) {
        return (await caches.match(req, { ignoreSearch: true })) || (await caches.match('index.html')) ||
          new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      }
    })());
    return;
  }

  // Letter audio: cache first. Safari asks for byte ranges, so answer those from the cached copy.
  if (url.origin === location.origin && url.pathname.includes('/audio/') && !url.pathname.endsWith('.js')) {
    event.respondWith(audioResponse(req));
    return;
  }

  // Google Fonts and our own CSS/JS/images: serve the cached copy at once, refresh it in the background.
  if (url.origin === location.origin || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    event.respondWith(staleWhileRevalidate(event, req));
  }
});

async function staleWhileRevalidate(event, req){
  const cached = await caches.match(req, { ignoreSearch: new URL(req.url).origin === location.origin });
  const network = fetch(req).then(async res => {
    if (res.ok || res.type === 'opaque') {
      const own = new URL(req.url).origin === location.origin && PRECACHE.some(p => req.url.endsWith(p.replace(/^\.\//, '')));
      (await caches.open(own ? CORE : RUNTIME)).put(req, res.clone());
    }
    return res;
  }).catch(() => cached);
  if (cached) { event.waitUntil(network); return cached; }
  return network;
}

async function audioResponse(req){
  const cache = await caches.open(AUDIO);
  let res = await cache.match(req.url);
  if (!res) {
    try {
      res = await fetch(req.url);              // full file (no range) so it can be cached
      if (res.ok) await cache.put(req.url, res.clone());
    } catch (e) { return new Response('', { status: 504 }); }
  }
  const range = req.headers.get('range');
  if (!range || !res.ok) return res;
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
    'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
    'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
}
