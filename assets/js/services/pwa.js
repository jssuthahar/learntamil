/* Learn Tamil — Progressive Web App: offline support, install button, updates.
   Works on every page; it builds its own small UI. */
/* Android app mode: the Google Play app (a Trusted Web Activity) opens "./?source=twa".
   Children's apps on Play must not run analytics, location lookups, push tokens, ads or donation links,
   so window.LT_APP is set and <html class="in-app"> hides those (services/firebase.js, support.js, 60-pages.css).
   Kept in sessionStorage (this app session only), so the same phone's Chrome browser is not affected. */
window.LT_APP = (function () {
  let on = false;
  try {
    on = new URLSearchParams(location.search).get('source') === 'twa' || /^android-app:\/\//.test(document.referrer)
      || sessionStorage.getItem('lt-app') === 'android';
    if (on) sessionStorage.setItem('lt-app', 'android');
  } catch (e) {}
  if (on) document.documentElement.classList.add('in-app');
  return on;
})();

(function () {
  'use strict';
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document);
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- small toast at the bottom of the screen ---------- */
  let toastEl = null, toastT = 0;
  function toast(html, actions = [], ms = 0){
    if (!toastEl){
      toastEl = document.createElement('div');
      toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    clearTimeout(toastT);
    toastEl.innerHTML = `<div class="toast-msg">${html}</div>`;
    actions.forEach(([label, fn, primary]) => {
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'toast-btn' + (primary ? ' primary' : ''); b.textContent = label;
      b.addEventListener('click', () => { hide(); fn && fn(); });
      toastEl.appendChild(b);
    });
    toastEl.classList.add('show');
    if (ms) toastT = setTimeout(hide, ms);
  }
  function hide(){ toastEl && toastEl.classList.remove('show'); }

  /* ---------- install button (Android, Windows, macOS Chrome/Edge) ---------- */
  let deferred = null;
  function installButton(){
    let b = document.getElementById('installBtn');
    if (!b){
      const header = document.querySelector('.site-header .wrap');
      if (!header) return null;
      b = document.createElement('button');
      b.id = 'installBtn'; b.type = 'button'; b.className = 'install-btn'; b.hidden = true;
      b.innerHTML = '<span aria-hidden="true">⬇</span><span>Install app</span>';
      b.setAttribute('aria-label', 'Install Learn Tamil as an app'); b.title = 'Install app';
      const theme = document.getElementById('themeBtn');
      theme ? header.insertBefore(b, theme) : header.appendChild(b);
    }
    return b;
  }
  /* Install page (install-app.html): [data-install] buttons, [data-install-ready|done|hint] notes, [data-device] cards. */
  const all = sel => document.querySelectorAll(sel);
  const showNotes = state => {        // state: 'ready' | 'done' | 'hint'
    all('[data-install-ready]').forEach(el => { el.hidden = state !== 'ready'; });
    all('[data-install-done]').forEach(el => { el.hidden = state !== 'done'; });
    all('[data-install-hint]').forEach(el => { el.hidden = state === 'done'; });
  };
  async function install(){
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice.catch(() => ({}));
    deferred = null;
    const b = document.getElementById('installBtn'); if (b) b.hidden = true;
    all('[data-install]').forEach(el => { el.hidden = true; });
    if (choice.outcome === 'accepted') toast('🎉 Learn Tamil is being added to your home screen.', [], 4000);
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    all('[data-install]').forEach(el => { el.hidden = false; el.onclick = install; });
    showNotes('ready');
    const b = installButton(); if (!b) return;
    b.hidden = false; b.onclick = install;
  });
  window.addEventListener('appinstalled', () => {
    const b = document.getElementById('installBtn'); if (b) b.hidden = true;
    all('[data-install]').forEach(el => { el.hidden = true; });
    store.set('lt-installed', '1');
  });
  if (standalone) showNotes('done');
  const device = isIOS ? 'ios' : /android/i.test(ua) ? 'android' : /CrOS/.test(ua) ? 'chromebook' : /Mac/.test(ua) ? 'mac' : /Win/.test(ua) ? 'windows' : '';
  if (device) all('[data-device="' + device + '"]').forEach(el => el.classList.add('is-you'));
  document.addEventListener('click', e => { if (e.target.closest('[data-print]')) window.print(); });

  /* ---------- iPhone / iPad: Safari has no install prompt, so explain the two taps ---------- */
  if (isIOS && !standalone && !store.get('lt-ios-hint')){
    setTimeout(() => toast(
      '📲 <b>Use Learn Tamil like an app:</b> tap <b>Share</b> <span aria-hidden="true">⬆︎</span> then <b>Add to Home Screen</b>.',
      [['Got it', () => store.set('lt-ios-hint', '1'), true]]), 4000);
  }

  /* ---------- offline / online notice ---------- */
  window.addEventListener('offline', () => toast('📴 You are offline. Letters, reading, stories and games still work.', [], 5000));
  window.addEventListener('online',  () => toast('✅ Back online.', [], 2500));

  /* ---------- service worker ---------- */
  const canSW = 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  if (!canSW) return;
  window.addEventListener('load', async () => {
    let reg;
    try { reg = await navigator.serviceWorker.register('sw.js', { scope: './' }); }
    catch (e) { return; }

    const offerUpdate = worker => toast('✨ A new version of Learn Tamil is ready.',
      [['Refresh', () => worker.postMessage('SKIP_WAITING'), true], ['Later']]);
    if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing; if (!w) return;
      w.addEventListener('statechange', () => {
        if (w.state !== 'installed') return;
        if (navigator.serviceWorker.controller) offerUpdate(w);                       // update
        else toast('✅ Ready to use offline.', [], 3500);                                // first install
      });
    });
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded){ reloaded = true; location.reload(); } });
    // Check for a new version when the app comes back to the foreground.
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  });
})();
