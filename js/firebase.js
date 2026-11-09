/* Learn Tamil — Firebase (project learntamil-js): anonymous usage statistics only.
   Nothing is loaded or sent until a parent or teacher taps "Allow" on the cookie notice.
   Kid-safe settings: no ad storage, no ad personalisation, no Google signals, no user IDs,
   and nothing typed by the child (like the certificate name) is ever sent.
   Other scripts log events with logEv() in app.js (→ window.ltLog); calls made before
   Analytics starts are queued in window.ltQ.
   The choice is saved in localStorage "lt-consent" ('yes' / 'no').
   window.ltConsent.show() opens the notice again (used by the privacy page). */
/* This is a Firebase *web* config. The apiKey is not a secret: it only identifies the project and is
   shipped to every browser by design (https://firebase.google.com/docs/projects/api-keys).
   Access is protected by the Realtime Database rules (database.rules.json) and by restricting the key
   to this site's address and the Firebase APIs it uses in Google Cloud Console → APIs & Services → Credentials. */
const firebaseConfig = {
  apiKey: 'AIzaSyC-_6obZcCnEDa8G4KK3DZwfotx3Rn0_n8',
  authDomain: 'learntamil-js.firebaseapp.com',
  projectId: 'learntamil-js',
  storageBucket: 'learntamil-js.firebasestorage.app',
  messagingSenderId: '144372306926',
  appId: '1:144372306926:web:f1bc78387f23a003b134ff',
  measurementId: 'G-6K0FFFY7EJ',
  databaseURL: 'https://learntamil-js-default-rtdb.asia-southeast1.firebasedatabase.app'
};
const SDK = 'https://www.gstatic.com/firebasejs/11.0.2/';
const KEY = 'lt-consent';

// Only count real visits to the published site (not local testing).
const live = location.protocol === 'https:' && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);

const getChoice = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
const setChoice = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };

let appP = null;
/* Firebase App Check: proves each request comes from this real website (invisible reCAPTCHA v3),
   so scripts that copy the apiKey are rejected once enforcement is turned on in the Firebase console.
   Uses reCAPTCHA Enterprise (Google Cloud → Security → reCAPTCHA / Fraud Defense), score-based website key.
   Paste that key's ID below (it is public). Empty = App Check off. */
const RECAPTCHA_SITE_KEY = '6LdqYRguAAAAAPneeKzgSJ_4mnt9IPN-cQSsNhwu';

const getApp = () => appP || (appP = (async () => {
  const m = await import(SDK + 'firebase-app.js');
  if (m.getApps()[0]) return m.getApps()[0];
  const app = m.initializeApp(firebaseConfig);
  if (RECAPTCHA_SITE_KEY){   // must be set up before the database, messaging or analytics start
    try {
      const ac = await import(SDK + 'firebase-app-check.js');
      ac.initializeAppCheck(app, { provider: new ac.ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
    } catch (e) { /* reCAPTCHA blocked: requests go without a token (rejected only if enforcement is on) */ }
  }
  return app;
})());

let started = false;
async function startAnalytics(){
  if (started || !live) return; started = true;
  try {
    const { initializeAnalytics, setConsent, logEvent, isSupported } = await import(SDK + 'firebase-analytics.js');
    if (!(await isSupported().catch(() => false))) return;
    const app = await getApp();
    setConsent({ ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    const analytics = initializeAnalytics(app, { config: { allow_google_signals: false, allow_ad_personalization_signals: false } });
    window.ltLog = (name, params = {}) => { try { logEvent(analytics, name, params); } catch (e) {} };
    (window.ltQ || []).forEach(([n, p]) => window.ltLog(n, p));
    window.ltQ = [];
  } catch (e) { /* offline or blocked: the site works the same without it */ }
}

/* Analytics cookies set by Google (_ga, _ga_*): removed when consent is withdrawn. */
function clearGaCookies(){
  const host = location.hostname, parts = host.split('.');
  const domains = ['', host, ...parts.map((_, i) => '.' + parts.slice(i).join('.'))];
  document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => /^_ga/.test(n)).forEach(n => {
    domains.forEach(d => { document.cookie = `${n}=; Max-Age=0; path=/${d ? '; domain=' + d : ''}`; });
  });
}

let box = null;
function showNotice(){
  if (box) return;
  box = document.createElement('div');
  box.className = 'consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-live', 'polite');
  box.setAttribute('aria-label', 'Cookie choice');
  box.innerHTML = `
    <p class="consent-msg"><b>🍪 For parents and teachers</b>
      May we count visits with Google Analytics, using cookies, and show your town on our “learning around
      the world” map? It is anonymous, has no ads, and helps us see which lessons and games children use. <a href="privacy.html#analytics">Learn more</a></p>
    <div class="consent-btns">
      <button type="button" class="toast-btn" data-c="no">No thanks</button>
      <button type="button" class="toast-btn primary" data-c="yes">Allow</button>
    </div>`;
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    const yes = b.dataset.c === 'yes', was = getChoice();
    setChoice(yes ? 'yes' : 'no');
    box.classList.remove('show'); setTimeout(() => { box && box.remove(); box = null; }, 350);
    if (yes){ startAnalytics(); liveLocate(); }
    else if (was === 'yes'){   // withdrawn: switch the running tracker off, then remove its cookies
      window['ga-disable-' + firebaseConfig.measurementId] = true; window.ltLog = null;
      clearGaCookies(); setTimeout(clearGaCookies, 1000);
    }
  });
  document.body.appendChild(box);
  requestAnimationFrame(() => requestAnimationFrame(() => box && box.classList.add('show')));
  setTimeout(() => box && box.querySelector('[data-c="yes"]').focus({ preventScroll: true }), 400);
}

window.ltConsent = { show: showNotice, choice: getChoice };

const choice = getChoice();
if (choice === 'yes') startAnalytics();
else if (choice !== 'no') setTimeout(showNotice, 1200);   // let the page settle first

// Privacy page: "Change cookie choice" buttons and a live status line.
document.querySelectorAll('[data-consent-open]').forEach(b => b.addEventListener('click', showNotice));
document.querySelectorAll('[data-consent-status]').forEach(el => {
  const c = getChoice();
  el.textContent = c === 'yes' ? 'You allowed analytics cookies on this device.'
    : c === 'no' ? 'You turned analytics cookies off on this device.' : 'You have not chosen yet.';
});

/* =====================================================================
   PUSH NOTIFICATIONS (Firebase Cloud Messaging)
   Only after a parent taps "Turn on reminders" — the browser permission prompt is never shown
   on its own. The device token is kept in localStorage "lt-push". Messages are sent from the
   Firebase console (Messaging → New campaign → Notifications, target app "Learn Tamil Web").
   sw.js shows them and opens the site when one is tapped.
   ===================================================================== */
const PUSH_KEY = 'lt-push';
const ua = navigator.userAgent;
const isIOS = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document);
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const pushCapable = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function pushState(){
  if (!pushCapable) return isIOS && !standalone ? 'ios-install' : 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  let t = null; try { t = localStorage.getItem(PUSH_KEY); } catch (e) {}
  return Notification.permission === 'granted' && t ? 'on' : 'off';
}
async function messaging(){
  const m = await import(SDK + 'firebase-messaging.js');
  if (!(await m.isSupported().catch(() => false))) throw new Error('unsupported');
  return [m, m.getMessaging(await getApp())];
}
async function pushEnable(){
  if (!pushCapable) throw new Error('unsupported');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error(perm === 'denied' ? 'blocked' : 'dismissed');
  const reg = await navigator.serviceWorker.register('sw.js', { scope: './' }).then(() => navigator.serviceWorker.ready);
  const [m, msg] = await messaging();
  // Some browsers (e.g. Brave with push off) never answer: give up after 25 s instead of spinning forever.
  const token = await Promise.race([m.getToken(msg, { serviceWorkerRegistration: reg }),
    new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 25000))]);
  if (!token) throw new Error('no-token');
  try { localStorage.setItem(PUSH_KEY, token); } catch (e) {}
  if (window.ltLog) window.ltLog('push_enabled');
  return token;
}
async function pushDisable(){
  try { const [m, msg] = await messaging(); await m.deleteToken(msg); } catch (e) {}
  try { localStorage.removeItem(PUSH_KEY); } catch (e) {}
}
window.ltPush = { state: pushState, enable: pushEnable, disable: pushDisable };

/* Buttons: any element with [data-push] becomes a reminders on/off switch. */
const PUSH_TEXT = {
  off: '🔔 Turn on reminders', on: '🔕 Turn off reminders',
  blocked: '🔕 Reminders are blocked in this browser’s site settings',
  'ios-install': '🔔 For reminders on iPhone/iPad: Share → Add to Home Screen, then open the app'
};
function paintPush(b){
  const st = pushState();
  if (st === 'unsupported'){ b.hidden = true; return; }
  b.hidden = false; b.textContent = PUSH_TEXT[st];
  b.disabled = st === 'blocked' || st === 'ios-install';
  b.setAttribute('aria-pressed', String(st === 'on'));
}
document.querySelectorAll('[data-push]').forEach(b => {
  paintPush(b);
  b.addEventListener('click', async () => {
    const was = pushState(); b.disabled = true; b.textContent = '⏳ Please wait…';
    try {
      if (was === 'on') await pushDisable(); else await pushEnable();
    } catch (e) { console.warn('Reminders:', e && e.message); }
    document.querySelectorAll('[data-push]').forEach(paintPush);
    const st = pushState();
    const note = b.parentElement && b.parentElement.querySelector('[data-push-note]');
    if (note) note.textContent = st === 'on' ? 'Reminders are on. You can turn them off here any time.'
      : st === 'blocked' ? 'Notifications are blocked. Allow them in this browser’s site settings to turn reminders on.'
      : was === 'on' ? 'Reminders are off.' : 'Reminders could not be turned on in this browser. Please try Chrome, Edge, Firefox or Safari.';
  });
});

/* =====================================================================
   🌍 LEARNING AROUND THE WORLD — visits, who is learning right now, countries and cities
   Firebase Realtime Database (rules in database.rules.json):
     stats/visits            total visits (one per browser tab session)
     countries/{CC}          { n, name }        visits per country
     cities/{CC_city-slug}   { n, city, cc }    visits per city
     live/{sessionId}        { t, cc?, city? }  open right now (removed on disconnect)
   Country and city come from an IP lookup (get.geojs.io) and are used ONLY if the visitor
   allowed the cookie notice. The IP address itself is never stored.
   The panel is drawn wherever an element #liveWorld exists (home page).
   ===================================================================== */
const LIVE_STALE = 30 * 60e3;   // ignore "live" entries older than this (safety net)
let liveDb = null, liveRefs = null, liveSid = null;
const ss = { get(k){ try { return sessionStorage.getItem(k); } catch (e) { return null; } },
             set(k, v){ try { sessionStorage.setItem(k, v); } catch (e) {} } };

async function liveStart(){
  if (!live) return;
  try {
    const m = await import(SDK + 'firebase-database.js');
    liveRefs = m; liveDb = m.getDatabase(await getApp());
    liveSid = ss.get('lt-sid') || Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    ss.set('lt-sid', liveSid);
    const me = m.ref(liveDb, 'live/' + liveSid);
    await m.onDisconnect(me).remove();
    await m.set(me, { t: m.serverTimestamp() });
    if (!ss.get('lt-counted')){ ss.set('lt-counted', '1'); await m.update(m.ref(liveDb), { 'stats/visits': m.increment(1) }); }
    if (getChoice() === 'yes') liveLocate();
    // keep the "live" entry fresh while the page is open
    setInterval(() => { if (!document.hidden) m.update(me, { t: m.serverTimestamp() }).catch(() => {}); }, 5 * 60e3);
    if (document.getElementById('liveWorld')) liveWatch();
  } catch (e) { const w = document.getElementById('liveWorld'); if (w) w.hidden = true; }
}

async function liveLocate(){
  if (!liveDb || ss.get('lt-located')) return;
  try {
    let g = null; try { g = JSON.parse(ss.get('lt-geo')); } catch (e) {}
    if (!g){
      const r = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' });
      const j = await r.json();
      g = { cc: String(j.country_code || '').toUpperCase(), country: String(j.country || '').slice(0, 60), city: String(j.city || '').slice(0, 60) };
      ss.set('lt-geo', JSON.stringify(g));
    }
    if (!/^[A-Z]{2}$/.test(g.cc)) return;
    const m = liveRefs, slug = g.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const u = { ['countries/' + g.cc + '/n']: m.increment(1), ['countries/' + g.cc + '/name']: g.country || g.cc,
                ['live/' + liveSid + '/cc']: g.cc };
    if (slug){ Object.assign(u, { ['cities/' + g.cc + '_' + slug + '/n']: m.increment(1), ['cities/' + g.cc + '_' + slug + '/city']: g.city,
                                  ['cities/' + g.cc + '_' + slug + '/cc']: g.cc, ['live/' + liveSid + '/city']: g.city }); }
    await m.update(m.ref(liveDb), u);
    ss.set('lt-located', '1');
  } catch (e) { /* lookup blocked or offline: still counted, just without a place */ }
}

/* ---------- the panel ---------- */
const flag = cc => /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map(c => 0x1F1A5 + c.charCodeAt(0))) : '🌍';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n || 0).toLocaleString('en');

function liveWatch(){
  const m = liveRefs, box = document.getElementById('liveWorld');
  let offset = 0;
  m.onValue(m.ref(liveDb, '.info/serverTimeOffset'), s => { offset = s.val() || 0; });
  const set = (id, html) => { const el = box.querySelector(id); if (el) el.innerHTML = html; };
  m.onValue(m.ref(liveDb, 'stats/visits'), s => set('[data-lw="visits"]', fmt(s.val())));
  m.onValue(m.ref(liveDb, 'live'), s => {
    const now = Date.now() + offset, all = Object.values(s.val() || {}).filter(v => v && now - (v.t || 0) < LIVE_STALE);
    set('[data-lw="now"]', fmt(Math.max(1, all.length)));
    const places = {};
    all.forEach(v => { const k = v.city ? v.cc + '|' + v.city : v.cc ? v.cc + '|' : '|'; places[k] = (places[k] || 0) + 1; });
    const chips = Object.entries(places).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, n]) => {
      const [cc, city] = k.split('|');
      const label = city ? esc(city) : cc ? esc(cc) : 'Somewhere in the world';
      return `<li class="lw-chip"><span class="lw-dot" aria-hidden="true"></span>${flag(cc)} ${label}${n > 1 ? ` <b>×${n}</b>` : ''}</li>`;
    });
    set('[data-lw="livelist"]', chips.join('') || '<li class="lw-chip">🌍 Just you right now. Welcome!</li>');
  });
  m.onValue(m.query(m.ref(liveDb, 'countries'), m.orderByChild('n'), m.limitToLast(10)), s => {
    const rows = []; s.forEach(c => { rows.push([c.key, c.val()]); });
    rows.reverse();
    set('[data-lw="toplist"]', rows.map(([cc, v]) => `<li><span>${flag(cc)} ${esc(v.name || cc)}</span><b>${fmt(v.n)}</b></li>`).join('') || '<li><span>Be the first!</span></li>');
  });
  m.onValue(m.ref(liveDb, 'countries'), s => set('[data-lw="countries"]', fmt(Object.keys(s.val() || {}).length)));
  m.onValue(m.query(m.ref(liveDb, 'cities'), m.orderByChild('n'), m.limitToLast(10)), s => {
    const rows = []; s.forEach(c => { rows.push(c.val()); }); rows.reverse();
    set('[data-lw="citylist"]', rows.map(v => `<li><span>${flag(v.cc)} ${esc(v.city)}</span><b>${fmt(v.n)}</b></li>`).join('') || '<li><span>Be the first!</span></li>');
  });
  box.hidden = false;
}

// start a moment after the page has loaded, so learning comes first
if (document.readyState === 'complete') setTimeout(liveStart, 1500);
else addEventListener('load', () => setTimeout(liveStart, 1500));
