/* Learn Tamil — service worker: offline support and fast loading.
   VERSION is updated automatically by `node tools/build-pages.mjs` whenever a cached file changes,
   so every deploy reaches users. */
const VERSION = '2008900912';
const CORE = `lt-core-${VERSION}`;   // the app itself, refreshed on every new version
const RUNTIME = 'lt-runtime';        // fonts and other files fetched while using the app
const AUDIO = 'lt-audio';            // letter sounds (kept across versions)

const PRECACHE = [
  './',
  'index.html',
  'tamil-alphabet.html',
  'tamil-vowels.html',
  'tamil-consonants.html',
  'uyirmei-ezhuthukal.html',
  'tamil-words-for-kids.html',
  'tamil-stories-for-kids.html',
  'ezhuthukal.html',
  'tamil-numbers.html',
  'tamil-colours.html',
  'tamil-days-of-the-week.html',
  'tamil-body-parts.html',
  'tamil-family-words.html',
  'tamil-fruits-and-food.html',
  'tamil-animals.html',
  'tamil-birds.html',
  'tamil-vehicles.html',
  'tamil-shapes.html',
  'tamil-opposite-words.html',
  'tamil-months.html',
  'aathichoodi.html',
  'tamil-rhymes-for-kids.html',
  'tamil-festivals-for-kids.html',
  'how-to-teach-tamil-to-kids.html',
  'tamil-printables.html',
  'privacy.html',
  'terms.html',
  'assets/css/app.css',
  'assets/js/core/profiles.js',
  'assets/audio/manifest.js',
  'assets/js/data/alphabet.js',
  'assets/js/data/words.js',
  'assets/js/data/stories.js',
  'assets/js/data/rhymes.js',
  'assets/js/data/festivals.js',
  'assets/js/data/rewards.js',
  'assets/js/data/pictures.js',
  'assets/js/data/messages.js',
  'assets/js/core/dom.js',
  'assets/js/core/letter-model.js',
  'assets/js/core/speech.js',
  'assets/js/core/sound.js',
  'assets/js/core/analytics.js',
  'assets/js/features/rewards/score.js',
  'assets/js/features/rewards/progress.js',
  'assets/js/features/rewards/today.js',
  'assets/js/features/letters/letters.js',
  'assets/js/features/stories/story-reader.js',
  'assets/js/features/games/game-utils.js',
  'assets/js/features/games/letter-quiz.js',
  'assets/js/features/reading/reading.js',
  'assets/js/features/games/hub.js',
  'assets/js/features/games/spin-wheel.js',
  'assets/js/features/games/balloon-pop.js',
  'assets/js/features/games/word-builder.js',
  'assets/js/features/games/memory.js',
  'assets/js/features/games/question-games.js',
  'assets/js/features/certificate/certificate.js',
  'assets/js/features/games/trace.js',
  'assets/js/features/games/colouring.js',
  'assets/js/features/voice/say-back.js',
  'assets/js/features/stories/rhymes.js',
  'assets/js/features/little/little.js',
  'assets/js/features/family/profile-switcher.js',
  'assets/js/features/family/stickers.js',
  'assets/js/features/family/parent-corner.js',
  'assets/js/app.js',
  'assets/js/services/pwa.js',
  'assets/js/services/firebase.js',
  'assets/js/services/support.js',
  'assets/js/data/faq.js',
  'assets/js/services/chat.js',
  'manifest.webmanifest',
  'assets/favicon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable-512.png',
  'assets/apple-touch-icon.png'
];

// Letter audio listed in assets/audio/manifest.js (made by tools/generate_audio.py or record.html).
function audioFiles(){
  try {
    self.window = self;               // manifest.js writes window.LT_AUDIO
    importScripts('assets/audio/manifest.js');
    return Object.values(self.LT_AUDIO || {}).map(f => 'assets/audio/' + f);
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

/* Push notifications from Firebase Cloud Messaging (sent from the Firebase console). */
self.addEventListener('push', event => {
  let p = {}; try { p = event.data ? event.data.json() : {}; } catch (e) { p = { notification: { body: event.data && event.data.text() } }; }
  const n = p.notification || {}, d = p.data || {};
  const link = (p.fcmOptions && p.fcmOptions.link) || (p.fcm_options && p.fcm_options.link) || d.link || d.url || n.click_action || './';
  event.waitUntil(self.registration.showNotification(n.title || d.title || 'Learn Tamil · தமிழ் கற்போம்', {
    body: n.body || d.body || 'Time to learn a new Tamil letter! 🦜',
    icon: n.icon || 'assets/icon-192.png', badge: 'assets/icon-192.png',
    image: n.image || d.image, tag: p.collapse_key || 'lt-reminder', renotify: true,
    data: { link }
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.link) || './', self.registration.scope).href;
  event.waitUntil((async () => {
    for (const c of await self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      if (c.url.startsWith(self.registration.scope) && 'focus' in c){ if (c.url !== url && 'navigate' in c) await c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
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
