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
for (const s of ['mei', 'aytham', 'uyirmei', 'reading', 'stories', 'certificate', 'little', 'classroom', 'practice'])
  await check(`section #/${s} opens`, `(async()=>{ location.hash='/${s}'; await new Promise(r=>setTimeout(r,300)); return document.getElementById('${s}').classList.contains('on'); })()`);
for (const g of ['build', 'listen', 'spin', 'balloon', 'words', 'memory', 'quiz', 'picture', 'topics', 'spell', 'story', 'trace', 'colour'])
  await check(`game "${g}" starts`, `(async()=>{ showGame('${g}'); await new Promise(r=>setTimeout(r,250)); return true; })()`);
await check('classroom: teacher, 3 classmates, lessons on the board, a lesson starts and stops', `(async()=>{
  location.hash = '/classroom'; await new Promise(r=>setTimeout(r,500));
  const ok1 = !!document.querySelector('#crTeacher svg') && document.querySelectorAll('#crKids .cr-kid svg').length === 3 && document.querySelectorAll('#crBoard .cr-lesson').length >= 10;
  document.querySelector('#crBoard .cr-lesson').click(); await new Promise(r=>setTimeout(r,400));
  const ok2 = !document.getElementById('crCtrl').hidden && document.querySelector('#crBubble .cr-ta').textContent.length > 0 && !!document.querySelector('#crBoard .cr-item');
  document.getElementById('crEnd').click(); await new Promise(r=>setTimeout(r,300));
  const ok3 = document.getElementById('crCtrl').hidden && !!document.querySelector('#crBoard .cr-lesson');
  location.hash = '/uyir'; await new Promise(r=>setTimeout(r,200));
  return ok1 && ok2 && ok3; })()`);
for (const g of ['find', 'read', 'missing', 'truth'])
  await check(`classroom game "${g}" starts and accepts a right answer`, `(async()=>{
    location.hash = '/classroom'; await new Promise(r=>setTimeout(r,400));
    crStop(); const my = CR.run, L = crList()[${g === 'read' ? 0 : 4}], items = L.items(); let done = false;
    CR_GAMES['${g}'](my, items[0], items, L.pool()).then(() => done = true).catch(() => {});
    for (let i = 0; i < 80 && !document.querySelector('#crBoard .cr-opt'); i++) await new Promise(r=>setTimeout(r,150));
    const opts = document.querySelectorAll('#crBoard .cr-opt').length;
    document.querySelector('#crBoard .cr-opt[data-k="' + CR.right + '"]').click();
    for (let i = 0; i < 80 && !done; i++) await new Promise(r=>setTimeout(r,150));
    crStop(); location.hash = '/uyir'; await new Promise(r=>setTimeout(r,200));
    return opts >= 2 && done; })()`);
await check('stories: rhymes and festivals open', `(async()=>{ location.hash='/stories'; await new Promise(r=>setTimeout(r,200));
  document.querySelector('[data-kind=rhymes]').click(); document.querySelector('#rhymeList .book').click();
  const ok1 = document.querySelectorAll('#rhymeLines .rline').length > 0;
  document.querySelector('[data-kind=festivals]').click(); document.querySelector('.fest-read').click();
  return ok1 && !document.getElementById('readerView').hidden; })()`);
await check('rewards, stickers and parent corner open', `(async()=>{ document.getElementById('stars').click(); document.getElementById('rewardsDlg').close();
  document.dispatchEvent(new CustomEvent('lt:open',{detail:'stickers'})); document.getElementById('stickerDlg').close();
  document.dispatchEvent(new CustomEvent('lt:open',{detail:'parents'})); return !!document.querySelector('#parentDlg .gate-btn'); })()`);
await check('menu: Learn, Read, Play, Print, Certificate — Read holds reading and stories', `(async()=>{
  const items = [...document.querySelectorAll('.mainnav .nav-item')].map(n => n.dataset.go || 'print');
  location.hash = '/stories'; await new Promise(r=>setTimeout(r,200));
  const readOn = document.querySelector('.nav-item[data-go=read]').classList.contains('on') && document.querySelector('#stories .read-switch [data-rs=stories]').getAttribute('aria-current') === 'page';
  location.hash = '/uyir'; await new Promise(r=>setTimeout(r,200)); document.querySelector('.nav-item[data-go=read]').click(); await new Promise(r=>setTimeout(r,200));
  return items.join() === 'letters,read,practice,print,certificate' && readOn && location.hash === '#/stories'; })()`);
await check('age groups: every lesson has a rule, and choosing an age opens its path', `(async()=>{
  const rulesOk = AGE_GROUPS.every(g => (LESSONS[g.id] || []).length && LESSONS[g.id].every(L => typeof LESSON_RULES[L.id] === 'function' && /^(#\\/|game:|rhymes$)/.test(L.go)));
  location.hash = '/uyir'; await new Promise(r=>setTimeout(r,200));
  document.querySelector('.age-card[data-age="6-8"]').click(); await new Promise(r=>setTimeout(r,100));
  const d = document.getElementById('pathDlg'); const ok = d && d.open && d.querySelectorAll('.path-step').length === LESSONS['6-8'].length
    && childAge() === '6-8' && document.querySelector('.age-card[data-age="6-8"]').getAttribute('aria-pressed') === 'true';
  d.close(); return rulesOk && ok; })()`);
await check('daily gift opens once a day after learning, and gives tokens', `(async()=>{
  const g = document.getElementById('giftBtn'); const t0 = Progress.d.tokens;
  Progress.d.giftDay = ''; Progress.d.day = ''; paintQuest(); const locked = g.dataset.state === 'locked';
  Progress.track('word'); const ready = g.dataset.state === 'ready';
  g.click(); await new Promise(r=>setTimeout(r,800)); document.querySelectorAll('.badge-pop').forEach(x=>x.remove());
  const opened = g.dataset.state === 'opened' && Progress.d.tokens > t0;
  return locked && ready && opened; })()`);
await check('settings: text size, contrast and motion reach <html>, and the parent dashboard opens', `(async()=>{
  document.getElementById('settingsBtn').click(); const d = document.getElementById('settingsDlg');
  d.querySelector('[data-size=lg]').click(); const c = d.querySelector('#setContrast'); c.checked = true; c.onchange({ target: c });
  const r = document.documentElement; const ok = r.dataset.text === 'lg' && r.dataset.contrast === 'high' && localStorage.getItem('lt-text') === 'lg';
  d.querySelector('[data-size=""]').click(); c.checked = false; c.onchange({ target: c });
  d.querySelector('[data-cast=girl]').click(); const girl = utter('அ'); const toneOk = voiceCast() === 'girl' && girl.pitch > 1.3 && d.querySelectorAll('[data-cast]').length === 4;
  d.querySelector('[data-cast=woman]').click(); const toneBack = voiceCast() === 'woman' && localStorage.getItem('lt-cast') === null && utter('அ').pitch < 1.3; d.close();
  const p = document.getElementById('parentDlg'); renderParents(p);
  const dash = !!p.querySelector('#pcAge') && p.querySelectorAll('.pc-lessons li').length === LESSONS[childAge()].length; p.close();
  return ok && toneOk && toneBack && !r.dataset.text && !r.dataset.contrast && dash; })()`);
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
await check('passing a level shows the celebration card; sharing is behind the grown-up hold and never carries the name', `(async()=>{
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  location.hash='/certificate'; await wait(200); CERT.start(1); await wait(50);
  const S = CERT._state();
  for (let q = 0; q < S.qs.length; q++){ const opts = document.querySelectorAll('#certQuiz .cq-opt');
    opts[CERT._state().qs[CERT._state().i].opts.findIndex(o => o.ok)].click(); document.getElementById('cqNext').click(); await wait(20); }
  const store = window.ltCertStore; const sent = []; window.ltCertStore = { available: () => true, save: d => { sent.push(d); return Promise.resolve(); }, shared: () => Promise.resolve() };
  localStorage.removeItem('lt-parent-contact'); localStorage.removeItem('lt-cert-sent'); localStorage.removeItem('lt-cert-outbox');
  CERT.start(1); await wait(50);
  for (let q = 0; q < CERT._state().qs.length; q++){ document.querySelectorAll('#certQuiz .cq-opt')[CERT._state().qs[CERT._state().i].opts.findIndex(o => o.ok)].click(); document.getElementById('cqNext').click(); await wait(20); }
  const f = document.getElementById('crForm'), inp = k => f.querySelector('[data-crc-in=' + k + ']');
  document.getElementById('crName').value = 'Zzkavin Test'; inp('email').value = 'not-an-email'; inp('phone').value = '98765 43210';
  f.requestSubmit(); await wait(100);
  const blocked = !document.getElementById('certCanvas') && ['email','phone','consent'].every(k => !f.querySelector('[data-crc-err=' + k + ']').hidden) && !sent.length;
  inp('email').value = ' Parent@Example.COM '; inp('phone').value = '+91 98765-43210'; inp('consent').checked = true;
  f.requestSubmit(); f.requestSubmit(); await wait(300);
  const doc = sent[0];
  const record = blocked && sent.length === 1 && doc.email === 'parent@example.com' && doc.phoneNumber === '+919876543210' && doc.studentName === 'Zzkavin Test'
    && doc.certificateId === Progress.d.certs[1].id && doc.consent === true && doc.batchId === 'letters-1' && /Level 1/.test(doc.courseName);
  document.querySelectorAll('.badge-pop').forEach(x=>x.remove());
  const card = document.querySelector('#certResult .cs-card'); if (!card) return false;
  const id1 = Progress.d.certs[1].id;
  const locked = card.querySelector('.cs-panel').hidden && !card.querySelector('.cs-title').textContent.includes('{');
  card.csUnlock();
  const panel = card.querySelector('.cs-panel'), hrefs = [...panel.querySelectorAll('a[href]')].map(a => a.href).join(' ');
  const nets = ['whatsapp','facebook','linkedin','instagram','copy','save'].every(n => panel.querySelector('[data-cs=' + n + ']'));
  panel.querySelector('[data-cs=instagram]').click(); const ig = !panel.querySelector('.cs-ig').hidden && panel.querySelectorAll('.cs-ig li').length === 4;
  const noName = !hrefs.includes('Zzkavin') && !panel.querySelector('.cs-msg').textContent.includes('Zzkavin') && !/\{\w+\}/.test(panel.textContent);
  CERT.start(1); await wait(50);   // retake: same certificate ID, details not asked again, record not stored twice
  for (let q = 0; q < CERT._state().qs.length; q++){ document.querySelectorAll('#certQuiz .cq-opt')[CERT._state().qs[CERT._state().i].opts.findIndex(o => o.ok)].click(); document.getElementById('cqNext').click(); await wait(20); }
  const remembered = !!document.querySelector('#crForm [data-crc-saved]') && document.querySelector('#crForm [data-crc-fields]').hidden;
  document.getElementById('crForm').requestSubmit(); await wait(200); document.querySelectorAll('.badge-pop').forEach(x=>x.remove());
  const once = sent.length === 1;
  // offline: the certificate is still made and the record waits in the outbox
  window.ltCertStore = { available: () => false, save: () => Promise.reject(new Error('offline')), shared: () => Promise.resolve() };
  CERT.start(2); await wait(50);
  for (let q = 0; q < CERT._state().qs.length; q++){ document.querySelectorAll('#certQuiz .cq-opt')[CERT._state().qs[CERT._state().i].opts.findIndex(o => o.ok)].click(); document.getElementById('cqNext').click(); await wait(20); }
  document.getElementById('crForm').requestSubmit(); await wait(300); document.querySelectorAll('.badge-pop').forEach(x=>x.remove());
  const queued = !!document.getElementById('certCanvas') && !!document.querySelector('#certResult .crc-note') && JSON.parse(localStorage.getItem('lt-cert-outbox')).length === 1;
  window.ltCertStore = { available: () => true, save: d => { sent.push(d); return Promise.resolve(); }, shared: () => Promise.resolve() };
  await CertRecord.flush(); const flushed = sent.length === 2 && JSON.parse(localStorage.getItem('lt-cert-outbox')).length === 0;
  window.ltCertStore = store;
  return record && locked && !panel.hidden && nets && ig && noName && remembered && once && queued && flushed && Progress.d.certs[1].id === id1 && !!document.querySelector('#certResult .cs-card'); })()`);
await check('check a certificate by ID: shows name, course and date only, handles typos, unknown IDs and offline', `(async()=>{
  const wait = ms => new Promise(r=>setTimeout(r,ms)); const store = window.ltCertStore, asked = [];
  window.ltCertStore = { available: () => true, verify: id => { asked.push(id); return Promise.resolve(id === 'LT1-AB12CD'
    ? { certificateId: id, studentName: 'Kavin <b>', courseName: 'Learn Tamil Level 1 · Starter (Tamil vowels)', issuedOn: '2026-11-11', email: 'x@y.zz' } : null); } };
  location.hash = '/certificate'; await wait(250);
  const f = document.querySelector('#certLevels [data-crv]'); if (!f) return false;
  const inp = f.querySelector('[data-crv-id]'), out = f.querySelector('[data-crv-out]');
  inp.value = 'hello'; f.requestSubmit(); await wait(50); const bad = !asked.length && !!out.querySelector('.crv-msg');
  inp.value = ' lt1-ab12cd '; f.requestSubmit(); await wait(100);
  const card = out.querySelector('.crv-card'), t = card ? card.textContent : '';
  const found = !!card && asked[0] === 'LT1-AB12CD' && t.includes('Kavin <b>') && !card.querySelector('b b') && t.includes('Level 1') && t.includes('11 November 2026') && !t.includes('x@y.zz');
  inp.value = 'LT2-ZZZZZZ'; f.requestSubmit(); await wait(100); const none = !out.querySelector('.crv-card') && out.textContent.includes('could not find');
  window.ltCertStore = { available: () => false, verify: () => Promise.reject(new Error('not-live')) };
  f.requestSubmit(); await wait(100); const off = out.textContent.includes('online');
  window.ltCertStore = store;
  return bad && found && none && off; })()`);
await check('certificate QR code: drawn only for a certificate on record, and it reads back as the check page link', `(async()=>{
  const sent = localStorage.getItem('lt-cert-sent'); localStorage.setItem('lt-cert-sent', JSON.stringify(['LT1-QRTEST']));
  const cv = document.createElement('canvas'); cv.width = cv.height = 300; const g = cv.getContext('2d');
  const none = CertRecord.drawVerifyQR(g, 'LT9-NOTSENT', 0, 0, 225) === false;
  const drew = CertRecord.drawVerifyQR(g, 'LT1-QRTEST', 0, 0, 225, 'Scan to check');
  if (sent === null) localStorage.removeItem('lt-cert-sent'); else localStorage.setItem('lt-cert-sent', sent);
  const url = CertRecord.verifyUrl('LT1-QRTEST'), m = QR.matrix(url);
  // read the modules back from the pixels (5 px each, 4-module quiet zone) and compare with the encoder
  const px = g.getImageData(0, 0, 225, 225).data, at = (c, r) => px[(((r + 4) * 5 + 2) * 225 + (c + 4) * 5 + 2) * 4] < 128;
  const same = m.every((row, r) => row.every((on, c) => on === at(c, r)));
  let scanned = true;
  if ('BarcodeDetector' in window) try { const r = await new BarcodeDetector({ formats: ['qr_code'] }).detect(cv); scanned = r.length === 1 && r[0].rawValue === url; } catch (e) {}
  return none && drew && same && scanned && url === 'https://learntamil.msdevbuild.com/verify-certificate.html?id=LT1-QRTEST'; })()`);
for (const page of ['tamil-alphabet.html', 'tamil-printables.html', 'privacy.html', 'record.html', 'thirukkural-chapters.html', 'thirukkural-chapter-1.html', 'thirukkural-chapter-133.html']){
  const before = errors.length; await open(page);
  if (errors.length > before) fail(`${page}: errors while loading: ${errors.slice(before).join(' | ')}`);
  await check(`${page} loads`, 'document.readyState === "complete"');
}
{ const before = errors.length; await open('verify-certificate.html?id=lt1-ab12cd');
  if (errors.length > before) fail(`verify-certificate.html: errors while loading: ${errors.slice(before).join(' | ')}`); }
await check('verify-certificate.html: opened from a QR code (?id=) it fills in the ID and checks it; a check puts its ID in the address bar', `(async()=>{
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  const f = document.querySelector('#certVerify [data-crv]'); if (!f) return false;
  const inp = f.querySelector('[data-crv-id]'), out = f.querySelector('[data-crv-out]');
  const auto = inp.value === 'lt1-ab12cd' && out.textContent.includes('online');   // localhost: the store is not live, so the gentle offline message
  window.ltCertStore = { available: () => true, verify: id => Promise.resolve(id === 'TKL2-AB12CD'
    ? { certificateId: id, studentName: 'Kavin', courseName: 'Learn Tamil · Thirukkural Level 2', issuedOn: '2026-11-11' } : null) };
  inp.value = ' tkl2-ab12cd'; f.requestSubmit(); await wait(150);
  const card = out.querySelector('.crv-card');
  return auto && !!card && card.textContent.includes('Thirukkural Level 2') && card.textContent.includes('Kavin') && location.search === '?id=TKL2-AB12CD'; })()`);
/* Thirukkural: its own page (thirukkural.html) with Learn · Games · Print · Certificate · Parents. */
await open('index.html');
await check('index links to the Thirukkural page from the home screen (not the letter tabs), and the games card goes there', `(async()=>{
  const link = !!document.querySelector('.hero a.kural-promo[href="thirukkural.html"]') && !document.querySelector('#letterTabs a') && !document.getElementById('kural');
  location.hash = '/practice'; await new Promise(r=>setTimeout(r,200)); return link && !!document.querySelector('.gcard[data-game=kural]'); })()`);
{ const before = errors.length; await open('thirukkural.html#/');
  if (errors.length > before) fail('thirukkural.html: errors while loading: ' + errors.slice(before).join(' | ')); }
const kw = 'await new Promise(r=>setTimeout(r,200));';
await check('thirukkural: dashboard loads the 1,330 couplets, the three divisions and the 5-item menu', `(async()=>{ for (let i=0;i<40 && !document.querySelector('.k-paal');i++) await new Promise(r=>setTimeout(r,100));
  return KU.book.k.length === 1330 && KU.book.ch.length === 133 && document.querySelectorAll('.k-paal').length === 3
    && [...document.querySelectorAll('.mainnav .nav-item')].map(n => n.dataset.kgo).join() === 'learn,games,print,certificate,parents'
    && !document.getElementById('kAbout').hidden && document.querySelector('.nav-item[data-kgo=learn]').classList.contains('on'); })()`);
await check('thirukkural: division, chapter and Kural screens open from the URL', `(async()=>{
  location.hash='/paal/2'; ${kw} const paal = document.querySelectorAll('.k-chap').length === 70 && document.getElementById('kAbout').hidden;
  location.hash='/ch/1'; ${kw} const ch = document.querySelectorAll('.k-item').length === 10;
  location.hash='/k/1'; ${kw} const k = document.querySelectorAll('.k-line').length === 2 && !!document.querySelector('#kStepBody .k-words') && document.querySelectorAll('.k-step').length === 5;
  location.hash='/k/1330'; ${kw} const last = document.querySelectorAll('.k-line').length === 2 && document.querySelectorAll('.k-step').length === 2 && !!document.querySelector('#kStepBody .k-pope');
  return paal && ch && k && last; })()`);
await check('thirukkural: every lesson is well formed (scene frames, quiz answers, word lists)', `Object.entries(KURAL_LESSONS).every(([n, L]) => +n >= 1 && +n <= 1330
  && L.words.length && L.ta && L.en && L.life.length === 2 && L.scene.length >= 3 && L.scene.every(f => f.cap.length === 2 && f.a.every(a => a.length === 5))
  && L.quiz.length >= 2 && L.quiz.every(q => q[2][q[3]]) && ['draft','reviewed'].includes(L.review))`);
await check('thirukkural: story plays, learning and bookmarks save per child, badges have rules', `(async()=>{ location.hash='/k/1'; ${kw}
  kShowStep(2); document.querySelector('#kNarrate').checked = false; document.querySelector('[data-k=scene]').click(); ${kw}
  const scene = !!document.querySelector('#kScene .ks-stage .ks-a') && document.querySelector('.ks-ta').textContent === KURAL_LESSONS[1].scene[0].cap[0];
  document.querySelector('.k-actions [data-k=learn]').click(); document.querySelector('.k-star').click();
  const saved = JSON.parse(Profiles.get('lt-progress')); kStop();
  return scene && saved.kLearned.includes(1) && saved.kMarks.includes(1) && ['kural10','kuralCh','kural100','kural500','kural1330'].every(id => BADGES.some(b => b.id === id) && typeof BADGE_RULES[id] === 'function'); })()`);
await check('thirukkural: a guided lesson goes step by step and finishing the quiz marks the Kural learned', `(async()=>{
  Progress.d.kLearned = Progress.d.kLearned.filter(x => x !== 391); location.hash='/k/391'; ${kw}
  const names = [...document.querySelectorAll('.k-step')].length === 5;
  for (let i = 0; i < 4; i++) document.getElementById('kStepNext').click();
  const quizOn = document.querySelector('.k-step.on') === document.querySelectorAll('.k-step')[4] && document.getElementById('kStepNext').hidden;
  for (let q = 0; q < 5; q++){ const box = document.getElementById('kQuiz'); if (!box || !box.kq) break;
    box.querySelectorAll('.k-opt')[box.kq.opts.findIndex(o => o.ok)].click(); box.querySelector('.k-nextq').click(); await new Promise(r=>setTimeout(r,30)); }
  document.querySelectorAll('.badge-pop').forEach(x=>x.remove()); kStop();
  return names && quizOn && !!document.querySelector('.k-done') && Progress.d.kLearned.includes(391) && !!document.querySelector('.k-done a[href="#/k/392"]'); })()`);
await check('thirukkural: 30 lessons ready, and Start here lists their chapters', `(async()=>{ location.hash='/'; ${kw}
  return Object.keys(KURAL_LESSONS).length >= 30 && document.querySelectorAll('.k-kids .k-kid-ch').length === kLessonChapters().length && kLessonChapters().join() === '1,10,40'; })()`);
for (const g of ['complete', 'match', 'arrange', 'story', 'listen'])
  await check(`thirukkural game "${g}" starts and accepts a right answer`, `(async()=>{ location.hash='/games/${g}'; ${kw}
    if ('${g}' === 'arrange') return document.querySelectorAll('#kgBox .k-wchip').length >= 5 && document.querySelector('.nav-item[data-kgo=games]').classList.contains('on');
    for (const b of document.querySelectorAll('#kgBox .k-opt')){ b.click(); if (!document.querySelector('#kgBox .k-nextq').hidden) break; }
    kStop(); return !document.querySelector('#kgBox .k-nextq').hidden; })()`);
await check('thirukkural: read as a book — all 1,330 pages, turn, jump to a chapter, remember the page', `(async()=>{ location.hash='/'; ${kw}
  const link = !!document.querySelector('.k-book-link[href="#/book"]');
  location.hash='/book/1'; ${kw} const first = document.querySelector('.k-book-count b').textContent === '1' && document.querySelector('[data-k=bprev]').disabled
    && document.querySelector('.k-book-lines .k-line').textContent === kText(1)[0];
  document.querySelector('[data-k=bnext]').click(); ${kw} const turned = location.hash === '#/book/2';
  const sel = document.querySelector('[data-kb=jump]'); sel.value = '40'; sel.dispatchEvent(new Event('change', { bubbles: true })); ${kw}
  const jumped = location.hash === '#/book/391' && Progress.d.kBook === 391;
  location.hash='/book/1330'; ${kw} const last = document.querySelector('[data-k=bnext]').disabled && !!document.querySelector('.k-book-page + .k-book-ctl + .k-done');
  location.hash='/book'; ${kw} const resume = document.querySelector('.k-book-count b').textContent === '1330';
  return link && first && turned && jumped && last && resume && !Progress.d.kLearned.includes(1330); })()`);
await check('thirukkural: games list and daily Kural open', `(async()=>{ location.hash='/games'; ${kw} const games = document.querySelectorAll('.k-games .gcard').length === 6;
  location.hash='/daily'; ${kw} kStop(); return games && document.querySelectorAll('.k-line').length === 2; })()`);
await check('thirukkural: print makes all three sheets for a chapter', `(async()=>{ location.hash='/print/40'; ${kw}
  const sheet = () => document.getElementById('kpSheet');
  const couplets = sheet().querySelectorAll('.ks-item').length === 10;
  document.querySelector('[data-sheet=copy]').click(); const copy = sheet().querySelectorAll('.ks-copy').length === 10 && sheet().querySelectorAll('.ks-trace').length === 20;
  document.querySelector('[data-sheet=missing]').click(); const missing = sheet().querySelectorAll('.ks-gap').length === 10 && sheet().querySelectorAll('.ks-key li').length === 10;
  document.querySelector('[data-sheet=couplets]').click();
  return couplets && copy && missing && document.querySelector('.nav-item[data-kgo=print]').classList.contains('on'); })()`);
await check('thirukkural: passing a chapter test earns a certificate with a PDF', `(async()=>{ location.hash='/certificate'; ${kw}
  const list = document.querySelectorAll('.k-chap').length === 108;
  location.hash='/certificate/1'; ${kw}
  for (let q = 0; q < 10; q++){ const box = document.getElementById('kcBox');
    box.querySelectorAll('.k-opt')[box.kq.opts.findIndex(o => o.ok)].click(); box.querySelector('.k-nextq').click(); await new Promise(r=>setTimeout(r,30)); }
  document.querySelectorAll('.badge-pop').forEach(x=>x.remove());
  { const f = document.getElementById('kcForm'); if (f){ const i = k => f.querySelector('[data-crc-in=' + k + ']');
      if (!f.querySelector('[data-crc-fields]').hidden){ i('email').value = 'parent@example.com'; i('phone').value = '+60123456789'; i('consent').checked = true; }
      document.getElementById('kcFName').value = 'Test'; f.requestSubmit(); await new Promise(r=>setTimeout(r,200)); } }
  const card = document.querySelector('#kcBox .cs-card'), share = !!card && card.querySelector('.cs-panel').hidden && card.querySelector('.cs-msg').textContent.includes('Thirukkural chapter 1');
  return list && share && !!Progress.d.kCerts[1] && !!document.getElementById('kcCanvas') && typeof CERT.jpegToPdf === 'function'; })()`);
await check('thirukkural page: settings, rewards and child switcher open', `(async()=>{
  document.getElementById('settingsBtn').click(); const st = document.getElementById('settingsDlg'); const a = !!st && st.open; st.close();
  document.getElementById('stars').click(); const rw = document.getElementById('rewardsDlg'); const b = rw.open && rw.querySelectorAll('.rw-badge').length === BADGES.length; rw.close();
  document.getElementById('profileBtn').click(); const pd = document.getElementById('profDlg'); const c = !!pd && pd.open; pd.close();
  return a && b && c; })()`);
await check('thirukkural: level exams — level 1 open, level 2 locked until level 1 is passed', `(async()=>{ Progress.d.kLevels = {}; location.hash='/certificate'; ${kw}
  const cards = document.querySelectorAll('.kc-level'); const shape = cards.length === KURAL_LEVELS.length && !cards[0].classList.contains('locked') && cards[1].classList.contains('locked');
  location.hash='/certificate/level/1'; ${kw}
  for (let q = 0; q < 10; q++){ const box = document.getElementById('kcBox');
    box.querySelectorAll('.k-opt')[box.kq.opts.findIndex(o => o.ok)].click(); box.querySelector('.k-nextq').click(); await new Promise(r=>setTimeout(r,30)); }
  document.querySelectorAll('.badge-pop').forEach(x=>x.remove());
  { const f = document.getElementById('kcForm'); if (f){ const i = k => f.querySelector('[data-crc-in=' + k + ']');
      if (!f.querySelector('[data-crc-fields]').hidden){ i('email').value = 'parent@example.com'; i('phone').value = '+60123456789'; i('consent').checked = true; }
      document.getElementById('kcFName').value = 'Test'; f.requestSubmit(); await new Promise(r=>setTimeout(r,200)); } }
  const passed = !!Progress.d.kLevels[1] && !!document.getElementById('kcCanvas') && !!document.querySelector('#kcBox a[href="#/certificate/level/2"]');
  location.hash='/certificate'; ${kw}
  return shape && passed && !document.querySelectorAll('.kc-level')[1].classList.contains('locked')
    && KURAL_LEVELS.every((L, i) => L.n === i + 1 && L.from >= 1 && L.to <= 1080 && L.from % 10 === 1 && L.to % 10 === 0); })()`);
await check('thirukkural: home tiles open Games, Certificate, Print and the Kural of the day', `(async()=>{ location.hash='/'; ${kw}
  return ['daily','games','certificate','print'].every(t => !!document.querySelector('.k-tiles a[href="#/' + t + '"]')) && !!document.querySelector('a.k-continue'); })()`);
await check('thirukkural: parents screen opens', `(async()=>{ location.hash='/parents'; ${kw} return document.querySelector('.nav-item[data-kgo=parents]').classList.contains('on') && document.querySelectorAll('#kuralView .k-stat').length === 4; })()`);
await check('share: footer has WhatsApp, LinkedIn, Facebook, X, Telegram, email and copy, for this page', `(() => {
  const row = document.querySelector('footer [data-share-row]'); if (!row) return false;
  const nets = [...row.querySelectorAll('a[data-net]')].map(a => a.dataset.net).join();
  const li = row.querySelector('[data-net=linkedin]').href, wa = row.querySelector('[data-net=whatsapp]').href;
  return nets === 'whatsapp,linkedin,facebook,x,telegram,email' && !!row.querySelector('[data-share-copy]')
    && li.includes(encodeURIComponent('https://learntamil.msdevbuild.com/thirukkural.html')) && wa.startsWith('https://wa.me/?text=')
    && [...row.querySelectorAll('a[data-net]')].every(a => a.target === '_blank' && a.rel.includes('noopener') || a.href.startsWith('mailto:')); })()`);
await check('share: "Share this Kural" opens a sheet with the Kural and its chapter page link', `(async()=>{ location.hash='/k/391'; ${kw}
  document.querySelector('#kuralView [data-k=share]').click(); const d = document.querySelector('dialog.share-sheet');
  const ok = !!d && d.open && d.querySelector('.share-preview').textContent.includes('கற்க கசடற')
    && d.querySelector('[data-net=linkedin]').href.includes(encodeURIComponent('https://learntamil.msdevbuild.com/thirukkural-chapter-40.html#kural-391'));
  d && d.close(); return ok; })()`);

/* Printables: every PDF and preview listed exists, and the menu promotes the page. */
const PRINTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'printables/printables.json'), 'utf8'));
const missingPrints = PRINTS.flatMap(d => [`printables/${d.file}.pdf`, `assets/printables/${d.file}.png`]).filter(f => !fs.existsSync(path.join(ROOT, f)));
missingPrints.length ? fail('missing printable files: ' + missingPrints.join(', ')) : pass(`all ${PRINTS.length} printables have a PDF and a preview`);
await open('tamil-printables.html');
await check('printables page lists every PDF', `document.querySelectorAll('.print-card').length === ${PRINTS.length}`);
await open('index.html');
await check('menu links to the printables', `!!document.querySelector('.mainnav a[href="tamil-printables.html"]') && document.querySelectorAll('.print-promo').length >= 3`);
await open('record.html');
await check('recorder lists all 247 letters from data/alphabet.js', 'LETTERS.length === 247');

ws.close(); chrome.kill(); server.close();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
console.log(failures.length ? `\n${failures.length} check(s) failed.` : '\nAll checks passed.');
process.exit(failures.length ? 1 : 0);
