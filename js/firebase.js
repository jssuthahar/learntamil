/* Learn Tamil — Firebase (project learntamil-js): anonymous usage statistics only.
   Nothing is loaded or sent until a parent or teacher taps "Allow" on the cookie notice.
   Kid-safe settings: no ad storage, no ad personalisation, no Google signals, no user IDs,
   and nothing typed by the child (like the certificate name) is ever sent.
   Other scripts log events with logEv() in app.js (→ window.ltLog); calls made before
   Analytics starts are queued in window.ltQ.
   The choice is saved in localStorage "lt-consent" ('yes' / 'no').
   window.ltConsent.show() opens the notice again (used by the privacy page). */
const firebaseConfig = {
  apiKey: 'AIzaSyC-_6obZcCnEDa8G4KK3DZwfotx3Rn0_n8',
  authDomain: 'learntamil-js.firebaseapp.com',
  projectId: 'learntamil-js',
  storageBucket: 'learntamil-js.firebasestorage.app',
  messagingSenderId: '144372306926',
  appId: '1:144372306926:web:f1bc78387f23a003b134ff',
  measurementId: 'G-6K0FFFY7EJ'
};
const SDK = 'https://www.gstatic.com/firebasejs/11.0.2/';
const KEY = 'lt-consent';

// Only count real visits to the published site (not local testing).
const live = location.protocol === 'https:' && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);

const getChoice = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
const setChoice = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };

let started = false;
async function startAnalytics(){
  if (started || !live) return; started = true;
  try {
    const [{ initializeApp }, { initializeAnalytics, setConsent, logEvent, isSupported }] =
      await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-analytics.js')]);
    if (!(await isSupported().catch(() => false))) return;
    const app = initializeApp(firebaseConfig);
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
      May we count visits with Google Analytics, using cookies? It is anonymous, has no ads, and helps us
      see which lessons and games children use. <a href="privacy.html#analytics">Learn more</a></p>
    <div class="consent-btns">
      <button type="button" class="toast-btn" data-c="no">No thanks</button>
      <button type="button" class="toast-btn primary" data-c="yes">Allow</button>
    </div>`;
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    const yes = b.dataset.c === 'yes', was = getChoice();
    setChoice(yes ? 'yes' : 'no');
    box.classList.remove('show'); setTimeout(() => { box && box.remove(); box = null; }, 350);
    if (yes) startAnalytics();
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
