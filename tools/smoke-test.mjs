#!/usr/bin/env node
/*
  Smoke test: serves the site, opens it in headless Chrome and walks through every section and
  game, failing on any JavaScript error. No npm packages — Node 22+ and Google Chrome only.

    npm test          (set CHROME=/path/to/chrome if Chrome is not in the default place)

  It catches the mistakes this no-bundler setup is prone to: a script loaded in the wrong order,
  a renamed global, a missing file, a broken path.
*/
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT } from './lib/load-data.mjs';
import { APP_SCRIPTS, SERVICES, STYLES, STYLE_BUNDLE } from './lib/assets.mjs';

const CHROME = process.env.CHROME || (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const failures = [];
const fail = m => { failures.push(m); console.log('  ✗ ' + m); };
const pass = m => console.log('  ✓ ' + m);

/* 1. every listed asset exists, and the stylesheet bundle is built */
if (!fs.existsSync(path.join(ROOT, STYLE_BUNDLE))) fail('missing ' + STYLE_BUNDLE + ' — run npm run build');
for (const f of [...STYLES, ...APP_SCRIPTS.map(s => s.src), ...SERVICES.map(s => s.src)])
  if (!fs.existsSync(path.join(ROOT, f))) fail('missing file ' + f);

/* 1b. SEO / AEO / GEO basics on every page (static checks, no browser needed) */
{
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8'), llms = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
  const seoErrors = [];
  for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))){
    const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (/<meta name="robots" content="noindex/.test(h)) continue;          // 404, recorder
    const g = re => (h.match(re) || [, ''])[1];
    const title = g(/<title>(.*?)<\/title>/s).replace(/&amp;/g, '&'), desc = g(/<meta name="description" content="(.*?)"/s).replace(/&amp;/g, '&');
    if (!title || title.length > 60) seoErrors.push(`${f}: title ${title.length} chars (1–60)`);
    if (!desc || desc.length < 70 || desc.length > 170) seoErrors.push(`${f}: description ${desc.length} chars (70–170)`);
    if (!/<link rel="canonical"/.test(h)) seoErrors.push(`${f}: no canonical`);
    if ((h.match(/<h1[\s>]/g) || []).length !== 1) seoErrors.push(`${f}: needs exactly one <h1>`);
    for (const b of h.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [])
      try { JSON.parse(b.replace(/^<script[^>]*>|<\/script>$/g, '')); } catch (e) { seoErrors.push(`${f}: invalid JSON-LD`); }
    if (f !== 'privacy.html' && f !== 'terms.html' && f !== 'index.html'){
      if (!sitemap.includes(f)) seoErrors.push(`${f}: missing from sitemap.xml`);
      if (!llms.includes(f)) seoErrors.push(`${f}: missing from llms.txt`);
    }
  }
  seoErrors.length ? seoErrors.forEach(fail) : pass('SEO basics: titles, descriptions, canonical, one h1, valid JSON-LD, sitemap and llms.txt');
}

/* 2. tiny static server */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const f = p.endsWith('/') ? p + 'index.html' : p;
  if (!f.startsWith(ROOT) || !fs.existsSync(f)){ res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;

/* 3. headless Chrome over the DevTools protocol */
const port = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lt-test-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run',
  '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required',
  ...(process.env.CI ? ['--no-sandbox'] : []),   // GitHub's Ubuntu runners block Chrome's sandbox
  'about:blank'], { stdio: 'ignore' });
let target;
for (let i = 0; i < 60 && !target; i++){ try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch (e) {} if (!target) await sleep(200); }
if (!target){ console.error('Could not start Chrome at ' + CHROME); process.exit(2); }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const waiting = new Map(), errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)){ waiting.get(m.id)(m); waiting.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon|fonts\.g|gstatic/.test(m.params.entry.url || '')) errors.push(m.params.entry.text + ' ' + (m.params.entry.url || ''));
};
const send = (method, params = {}) => new Promise(r => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const run = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text); return r.result.result.value; };
const open = async url => { await send('Page.navigate', { url: BASE + url }); await sleep(1800); };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');

async function check(name, expr){
  const before = errors.length;
  try {
    const v = await run(expr);
    // Text comes from data/messages.js: a wrong name shows up as "undefined" or an unfilled {placeholder}.
    const bad = await run(`(()=>{ const t = document.body.textContent;   // includes hidden panels and closed dialogs
      const m = t.match(/undefined|NaN|\\[object Object\\]|\\{[a-z]+\\}/); return m ? m[0] : ''; })()`);
    if (v === false) fail(name);
    else if (errors.length > before) fail(`${name}: ${errors.slice(before).join(' | ')}`);
    else if (bad) fail(`${name}: broken text on screen ("${bad}")`);
    else pass(name);
  }
  catch (e) { fail(`${name}: ${e.message.split('\n')[0]}`); }
}

console.log('Learn Tamil smoke test');
await open('index.html');
await run(`localStorage.setItem('lt-consent','no')`);
await open('index.html#/uyir');
// Errors thrown while the page loads (a script in the wrong order, a renamed name) happen before any check runs.
if (errors.length) fail('errors while the page loaded: ' + errors.join(' | '));
await check('app loads with no errors', `document.querySelectorAll('#gKuril .tile').length === 5`);
for (const s of ['mei', 'aytham', 'uyirmei', 'reading', 'stories', 'certificate', 'little', 'practice'])
  await check(`section #/${s} opens`, `(async()=>{ location.hash='/${s}'; await new Promise(r=>setTimeout(r,300)); return document.getElementById('${s}').classList.contains('on'); })()`);
for (const g of ['build', 'listen', 'spin', 'balloon', 'words', 'memory', 'quiz', 'picture', 'topics', 'spell', 'story', 'trace', 'colour'])
  await check(`game "${g}" starts`, `(async()=>{ showGame('${g}'); await new Promise(r=>setTimeout(r,250)); return true; })()`);
await check('stories: rhymes and festivals open', `(async()=>{ location.hash='/stories'; await new Promise(r=>setTimeout(r,200));
  document.querySelector('[data-kind=rhymes]').click(); document.querySelector('#rhymeList .book').click();
  const ok1 = document.querySelectorAll('#rhymeLines .rline').length > 0;
  document.querySelector('[data-kind=festivals]').click(); document.querySelector('.fest-read').click();
  return ok1 && !document.getElementById('readerView').hidden; })()`);
await check('rewards, stickers and parent corner open', `(async()=>{ document.getElementById('stars').click(); document.getElementById('rewardsDlg').close();
  document.dispatchEvent(new CustomEvent('lt:open',{detail:'stickers'})); document.getElementById('stickerDlg').close();
  document.dispatchEvent(new CustomEvent('lt:open',{detail:'parents'})); return !!document.querySelector('#parentDlg .gate-btn'); })()`);
await check('tracing accepts a traced letter', `(async()=>{ showGame('trace'); await renderTrace(); inkCv.getContext('2d').drawImage(maskCv,0,0); drawLetter(inkCv.getContext('2d'), trItem().l, '#000', 14); TR.inked=true; checkTrace(); return TR.done; })()`);
await check('messages come from data/messages.js', `(async()=>{ location.hash='/practice'; await new Promise(r=>setTimeout(r,200)); showGame('build');
  const ask = document.getElementById('qAsk').textContent;
  const o = [...document.querySelectorAll('#opts .tile')].find(b => b.textContent !== answer.l); o && o.click();
  return ask.startsWith(TEXT.buildAsk[0]) && document.getElementById('feedback').textContent.startsWith(TEXT.tryAgain[0]); })()`);
await check('Kili level, badges and greeting use data/rewards.js', `(()=>{ paintToday(); openRewards(); const ok = document.getElementById('todayStage').textContent.includes(STAGES[0].ta)
  && document.querySelectorAll('#rewardsDlg .rw-badge').length === BADGES.length && BADGES.every(b => typeof BADGE_RULES[b.id] === 'function');
  document.getElementById('rewardsDlg').close(); return ok; })()`);
await check('celebrations fill their placeholders', `(async()=>{ celebrate('🎯', TEXT.goalDone[0], fmt(TEXT.goalDone[1], { goal: 10 })); await new Promise(r=>setTimeout(r,200));
  const t = document.querySelector('.badge-pop').innerText; document.querySelectorAll('.badge-pop').forEach(x=>x.remove()); return t.includes('10 things'); })()`);
await check('certificate levels come from data/rewards.js', `CERT.LEVELS.length === CERT_LEVELS.length && CERT.LEVELS.every(L => L.gen && L.gen.length > 0)`);
await check('certificate test starts', `(async()=>{ location.hash='/certificate'; await new Promise(r=>setTimeout(r,200)); document.querySelector('#certLevels button')?.click(); return true; })()`);
for (const page of ['tamil-alphabet.html', 'tamil-printables.html', 'privacy.html', 'record.html']){
  const before = errors.length; await open(page);
  if (errors.length > before) fail(`${page}: errors while loading: ${errors.slice(before).join(' | ')}`);
  await check(`${page} loads`, 'document.readyState === "complete"');
}
/* Printables: every PDF and preview listed exists, and the menu promotes the page. */
const PRINTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'printables/printables.json'), 'utf8'));
const missingPrints = PRINTS.flatMap(d => [`printables/${d.file}.pdf`, `assets/printables/${d.file}.png`]).filter(f => !fs.existsSync(path.join(ROOT, f)));
missingPrints.length ? fail('missing printable files: ' + missingPrints.join(', ')) : pass(`all ${PRINTS.length} printables have a PDF and a preview`);
await open('tamil-printables.html');
await check('printables page lists every PDF', `document.querySelectorAll('.print-card').length === ${PRINTS.length}`);
await open('index.html');
await check('menu links to the printables', `!!document.querySelector('.mainnav a[href="tamil-printables.html"]') && !!document.querySelector('.print-btn') && document.querySelectorAll('.print-promo').length >= 3`);
await open('record.html');
await check('recorder lists all 247 letters from data/alphabet.js', 'LETTERS.length === 247');

ws.close(); chrome.kill(); server.close();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
console.log(failures.length ? `\n${failures.length} check(s) failed.` : '\nAll checks passed.');
process.exit(failures.length ? 1 : 0);
