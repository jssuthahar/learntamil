/* Learn Tamil — app shell: global controls and the router.
   Loaded after every feature. Each section is a URL hash (#/uyir, #/reading, #/practice …) so it can be bookmarked;
   opening one fires "lt:section" so features can start or stop themselves. */
'use strict';

/* ---------- Global controls ---------- */
$('#showRoman').addEventListener('change', e=>document.body.classList.toggle('hide-roman', !e.target.checked));

function setTheme(t){ document.documentElement.setAttribute('data-theme', t); try{ localStorage.setItem('lt-theme', t); }catch(e){} display(current); }
$('#themeBtn').addEventListener('click', ()=>{
  const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(cur==='dark' ? 'light' : 'dark');
});

/* =====================================================================
   TABS (hash routing so each section can be bookmarked)
   ===================================================================== */
/* The main menu groups sections: Learn (the letter tabs), Read (reading + stories), Play (games), Print (a page), Certificate. */
const LETTER_TABS = ['uyir','mei','aytham','uyirmei'];
const READ_TABS = ['reading','stories'];
const SECTIONS = [...LETTER_TABS, ...READ_TABS, 'practice', 'certificate', 'little', 'classroom'];
let lastLetterTab = 'uyir', lastReadTab = 'reading';
const navOf = n => LETTER_TABS.includes(n) || n === 'little' || n === 'classroom' ? 'letters' : READ_TABS.includes(n) ? 'read' : n;
const lastOf = go => go === 'letters' ? lastLetterTab : go === 'read' ? lastReadTab : go;
function openTab(name){
  name = lastOf(name);
  if (!SECTIONS.includes(name)) name = 'uyir';
  const isLetters = LETTER_TABS.includes(name);
  if (isLetters) lastLetterTab = name;
  if (READ_TABS.includes(name)) lastReadTab = name;
  stopReading();
  // main navigation (header on desktop, bottom bar on phones) and the Words · Stories switch inside Read
  $$('.nav-item[data-go]').forEach(n=>{ const on = n.dataset.go === navOf(name); n.classList.toggle('on', on); n.setAttribute('aria-current', on ? 'page' : 'false'); });
  $$('.read-switch [data-rs]').forEach(a=>{ if (a.dataset.rs === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#letterTabs').hidden = !isLetters;
  $('.hero').hidden = !isLetters;
  document.dispatchEvent(new CustomEvent('lt:section', {detail:name}));
  $$('.tab').forEach(t=>{ const on = t.dataset.tab===name; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
  $$('.panel').forEach(p=>p.classList.toggle('on', p.id===name));
  // bouncy entrance for the tiles of the opened section
  const pnl = document.getElementById(name);
  pnl.querySelectorAll('.grid .tile, table.um .tile, .book, .group').forEach((t,i)=>t.style.setProperty('--d', Math.min(i*22, 700)+'ms'));
  pnl.classList.remove('enter'); void pnl.offsetWidth; pnl.classList.add('enter');
  clearTimeout(pnl._enterT); pnl._enterT = setTimeout(()=>pnl.classList.remove('enter'), 1500);
  $('#player').hidden = !LETTER_TABS.includes(name);
  $('#globalTools').querySelector('label:last-child').hidden = !LETTER_TABS.includes(name);
  if (name==='uyir') display(uyir[0]);
  if (name==='mei') display(mei[0]);
  if (name==='aytham') display(aytham[0]);
  if (name==='uyirmei') display(uyirmei[bC][bV]);
  if (!isLetters) window.scrollTo({top:0});
}
$$('.nav-item[data-go]').forEach(n=>n.addEventListener('click', ()=>{
  const target = lastOf(n.dataset.go);
  if (route() !== target) location.hash = '/' + target; else openTab(target);
}));
const route = ()=>location.hash.replace(/^#\/?/,'');
$$('.tab').forEach(t=>t.addEventListener('click', ()=>{ if (route()!==t.dataset.tab) location.hash = '/'+t.dataset.tab; else openTab(t.dataset.tab); }));
$('.tablist').addEventListener('keydown', e=>{
  if (e.key!=='ArrowRight' && e.key!=='ArrowLeft') return;
  const tabs = $$('.tab'); const i = tabs.indexOf(document.activeElement); if (i<0) return;
  const n = tabs[(i + (e.key==='ArrowRight'?1:-1) + tabs.length) % tabs.length]; n.focus(); n.click();
});
window.addEventListener('hashchange', ()=>openTab(route()));
// Every script has loaded by DOMContentLoaded; open the first section then.
window.addEventListener('DOMContentLoaded', ()=>openTab(route() || 'uyir'));
