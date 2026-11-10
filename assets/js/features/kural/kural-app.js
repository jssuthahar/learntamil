/* Learn Tamil — Thirukkural page (thirukkural.html): router and page controls. Loaded last on that page,
   like app.js on index.html. Each screen is a URL hash (#/, #/k/41, #/games, #/print, #/certificate, #/parents)
   so it can be bookmarked; the menu shows Learn · Games · Print · Certificate · Parents. */
'use strict';

const K_NAV = { games: 'games', print: 'print', certificate: 'certificate', parents: 'parents' };   // anything else is "learn"
function kPaintNav(){
  const go = K_NAV[kSub()[0]] || 'learn';
  $$('.nav-item[data-kgo]').forEach(n => { const on = n.dataset.kgo === go; n.classList.toggle('on', on); n.setAttribute('aria-current', on ? 'page' : 'false'); });
  const about = $('#kAbout'); if (about) about.hidden = kSub().length > 0;   // the static guide text shows under the dashboard only
}
function kRoute(){ kPaintNav(); kRender(); window.scrollTo({ top: 0 }); }
window.addEventListener('hashchange', kRoute);
window.addEventListener('DOMContentLoaded', kRoute);

/* Theme button (the same saved choice as the rest of the site). */
$('#themeBtn').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const t = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('lt-theme', t); } catch (e) {}
});
