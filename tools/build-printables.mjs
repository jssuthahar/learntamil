#!/usr/bin/env node
/*
  Builds the free printable PDFs (charts, tracing and activity worksheets, colouring pages)
  with headless Chrome, so Tamil text is shaped correctly and stays crisp (vector text).
  Everything comes from assets/js/data/, so the PDFs always match the app.

    npm run printables                         # all PDFs + rebuild the pages
    node tools/build-printables.mjs <file>     # one PDF while designing it

  Writes printables/*.pdf and assets/printables/*.png (preview images).
  Set CHROME=/path/to/chrome if Chrome is not in the default macOS location.
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadData } from './lib/load-data.mjs';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lt-print-'));
const OUT = path.join(ROOT, 'printables'), THUMBS = path.join(ROOT, 'assets/printables');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(THUMBS, { recursive: true });

const { PULLI, VOWELS, CONS, GROUPS, TOPICS, WORDS, AATHICHOODI, PICTURES, PAINT } =
  loadData(['PULLI', 'VOWELS', 'CONS', 'GROUPS', 'TOPICS', 'WORDS', 'AATHICHOODI', 'PICTURES', 'PAINT']);
const topic = id => TOPICS.find(t => t.id === id);
const meaning = m => m.split(' · ')[0];
const seg = new Intl.Segmenter('ta', { granularity: 'grapheme' });
const lettersOf = w => [...seg.segment(w.normalize('NFC').replace(/[^\u0B80-\u0BFF]/g, ''))].map(x => x.segment);
/* Seeded shuffle: the same PDF every build (no random changes in git). */
const seeded = seed => { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; };
const shuffleBy = (a, seed) => { const r = seeded(seed), b = a.slice(); for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700;800&family=Baloo+Thambi+2:wght@600;700;800&family=Inter:wght@500;600;700;800&display=block');
*{box-sizing:border-box;margin:0}
html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Inter,sans-serif;color:#0b1020}
.ta,.L{font-family:'Baloo Thambi 2','Noto Sans Tamil',sans-serif}
.page{height:274mm;display:flex;flex-direction:column;page-break-after:always;break-after:page}
.page:last-child{page-break-after:auto;break-after:auto}
.head{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid transparent;border-image:linear-gradient(90deg,#1769d1,#7c3aed,#ff5e7e,#ff8a3d) 1;padding-bottom:6px;margin-bottom:10px}
.brand{display:flex;align-items:center;gap:8px;font-weight:800;font-size:11pt;letter-spacing:.04em}
.mark{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#1769d1,#7c3aed);color:#fff;display:grid;place-items:center;font:800 15px 'Noto Sans Tamil'}
h1{font-family:'Baloo Thambi 2','Noto Sans Tamil',sans-serif;font-size:24pt;line-height:1.15;color:#1f2a6b}
h1 small{display:block;font-family:Inter;font-size:11pt;color:#4a5163;font-weight:600}
.foot{margin-top:auto;padding-top:6px;font-size:8.5pt;color:#6b7385;display:flex;justify-content:space-between;border-top:1px solid #e3e8f0}
.grid{display:grid;gap:8px;flex:1;margin-top:8px}
.card{border-radius:14px;border:2px solid #e3e8f0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px;text-align:center;background:#fff}
.card .L{font-weight:800;line-height:1.1}
.card .r{font-weight:700;color:#4a5163;font-size:10pt}
.card .e{font-size:20pt;line-height:1.2}
.card .w{font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:700;font-size:13pt}
.card .m{font-size:8.5pt;color:#6b7385}
.uy{border-color:#bcd6f5;background:#f3f8fe} .uy .L{color:#1769d1}
.me{border-color:#b9e3d9;background:#f2fbf8} .me .L{color:#0b8a6c}
.um .L{color:#e0480c}
.gt{font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:800;font-size:13pt;color:#0b8a6c;margin:6px 0 2px}
.name{display:flex;gap:30px;font-size:11pt;margin:4px 0 6px;color:#4a5163}.name span{flex:1;border-bottom:1.5px solid #9aa6b8;padding-bottom:2px}
.tip{font-size:9.5pt;color:#4a5163;margin-bottom:2px}
`;
const head = (ta, en) => `<div class="head"><span class="brand"><span class="mark">அ</span>LEARN TAMIL · <span class="ta">தமிழ் கற்போம்</span></span><span style="font-size:9pt;color:#6b7385">Free printable</span></div><h1>${ta}<small>${en}</small></h1>`;
const foot = page => `<div class="foot"><span>learntamil.msdevbuild.com · Free for home and classroom use</span><span>${page}</span></div>`;
const doc = (css, body, landscape = false) => `<!doctype html><html lang="ta"><head><meta charset="utf-8"><style>@page{size:A4 ${landscape ? 'landscape' : 'portrait'};margin:11mm}${BASE_CSS}${landscape ? '.page{height:187mm}' : ''}${css}</style></head><body>${body}</body></html>`;

const vowelCard = v => `<div class="card uy"><span class="L" style="font-size:54pt">${v.l}</span><span class="r">${v.r} · <span class="ta">${v.len}</span></span><span class="e">${v.ex[0]}</span><span class="w">${v.ex[1]}</span><span class="m">${v.ex[2]}</span></div>`;
const consCard = k => `<div class="card me"><span class="L" style="font-size:40pt">${k.c + PULLI}</span><span class="r">${k.r}</span><span class="e" style="font-size:16pt">${k.ex[0]}</span><span class="w" style="font-size:11pt">${k.ex[1]}</span><span class="m">${k.ex[2]}</span></div>`;

/* Tracing worksheet rows: one model letter, then outline letters to trace. */
const traceRow = l => `<div class="trow"><span class="model L">${l}</span>${('<span class="tr L">' + l + '</span>').repeat(5)}</div>`;
const TRACE_CSS = `
.name{display:flex;gap:30px;font-size:11pt;margin:4px 0 6px;color:#4a5163}.name span{flex:1;border-bottom:1.5px solid #9aa6b8;padding-bottom:2px}
.rows{display:flex;flex-direction:column;gap:7px;flex:1;margin-top:4px}
.trow{flex:1;display:grid;grid-template-columns:repeat(6,1fr);align-items:center;border-radius:12px;border:2px solid #e3e8f0;padding:0 6px;
  background:linear-gradient(transparent 49%,#e8edf5 49%,#e8edf5 51%,transparent 51%)}
.trow .L{font-weight:700;font-size:50pt;line-height:1.25;text-align:center}
.model{color:#1769d1}
.tr{color:transparent;-webkit-text-stroke:1.6px #9aa6b8}
.tip{font-size:9.5pt;color:#4a5163;margin-bottom:2px}`;
const tracingPages = (letters, ta, en, perPage) => {
  const pages = []; for (let i = 0; i < letters.length; i += perPage) pages.push(letters.slice(i, i + perPage));
  return pages.map((ls, p) => `<div class="page">${head(ta, en)}<div class="name"><span>Name · பெயர்:</span><span>Date · தேதி:</span></div>
    <p class="tip">✏️ Look at the blue letter, then trace the grey letters. Say the sound each time!</p>
    <div class="rows">${ls.map(traceRow).join('')}</div>${foot(`Page ${p + 1} of ${pages.length}`)}</div>`).join('');
};

const nums = TOPICS.find(t => t.id === 'numbers').words;
const DOCS = [
  { file: 'tamil-uyir-chart', title: 'Tamil vowels chart (12 uyir ezhuthukal)', html: doc('.grid{grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr)}',
      `<div class="page">${head('உயிர் எழுத்துகள்', 'Tamil vowels · 12 letters — 5 short (குறில்) and 7 long (நெடில்)')}<div class="grid">${VOWELS.map(vowelCard).join('')}</div>${foot('Learn Tamil · Vowels chart')}</div>`) },
  { file: 'tamil-mei-chart', title: 'Tamil consonants chart (18 mei ezhuthukal)', html: doc('.grid{grid-template-columns:repeat(6,1fr);flex:none}.sec{display:flex;flex-direction:column;flex:1}.sec .grid{flex:1}',
      `<div class="page">${head('மெய் எழுத்துகள்', 'Tamil consonants · 18 letters in three groups')}${['v', 'm', 'i'].map(g => `<div class="sec"><div class="gt">${GROUPS[g].ta} <span style="font-family:Inter;font-size:9.5pt;color:#6b7385">${GROUPS[g].en}</span></div><div class="grid">${CONS.filter(k => k.g === g).map(consCard).join('')}</div></div>`).join('')}${foot('Learn Tamil · Consonants chart')}</div>`) },
  { file: 'tamil-alphabet-chart', title: 'Tamil alphabet chart — 12 vowels, 18 consonants and ஃ', html: doc('.g6{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.box{border-radius:12px;display:grid;place-items:center;padding:6px 0}.box .L{font-weight:800;font-size:34pt;line-height:1.2}.box small{font-size:9pt;font-weight:700;color:#4a5163}.sum{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:10px}.sum div{border-radius:12px;background:#f3f6fb;text-align:center;padding:6px}.sum b{display:block;font-size:20pt;font-family:"Baloo Thambi 2"}.sum .t{background:linear-gradient(135deg,#ff8a3d,#ff5e7e,#7c5cff);color:#fff}',
      `<div class="page">${head('தமிழ் எழுத்துகள்', 'The Tamil alphabet · 247 letters = 12 + 18 + 1 + 216')}
       <div class="gt" style="color:#1769d1">உயிர் எழுத்துகள் <span style="font-family:Inter;font-size:9.5pt;color:#6b7385">12 vowels</span></div><div class="g6">${VOWELS.map(v => `<div class="box uy"><span class="L" style="color:#1769d1">${v.l}</span><small>${v.r}</small></div>`).join('')}</div>
       <div class="gt">மெய் எழுத்துகள் <span style="font-family:Inter;font-size:9.5pt;color:#6b7385">18 consonants</span></div><div class="g6">${CONS.map(k => `<div class="box me"><span class="L" style="color:#0b8a6c">${k.c + PULLI}</span><small>${k.r}</small></div>`).join('')}</div>
       <div class="gt" style="color:#7c3aed">ஆய்த எழுத்து <span style="font-family:Inter;font-size:9.5pt;color:#6b7385">1 special letter</span></div><div class="g6"><div class="box" style="background:#f5f1fe"><span class="L" style="color:#7c3aed">ஃ</span><small>ḵ</small></div></div>
       <div class="sum"><div><b>12</b><span class="ta">உயிர்</span></div><div><b>18</b><span class="ta">மெய்</span></div><div><b>1</b><span class="ta">ஆய்தம்</span></div><div><b>216</b><span class="ta">உயிர்மெய்</span></div><div class="t"><b>247</b><span class="ta">மொத்தம்</span></div></div>
       ${foot('Learn Tamil · Alphabet chart')}</div>`) },
  { file: 'tamil-uyirmei-chart', title: 'Uyirmei chart — all 216 Tamil letters', landscape: true, html: doc(
      'table{border-collapse:separate;border-spacing:2px;width:100%;flex:1}th,td{text-align:center;border-radius:6px}thead th{font-family:"Baloo Thambi 2";font-size:15pt;color:#1769d1;background:#f3f8fe}tbody th{font-family:"Baloo Thambi 2";font-size:15pt;color:#0b8a6c;background:#f2fbf8;width:42px}td{font-family:"Baloo Thambi 2","Noto Sans Tamil";font-weight:700;font-size:14.5pt;color:#c2410c;background:#fff7f2;line-height:1.05;padding:0}h1{font-size:18pt}',
      `<div class="page">${head('உயிர்மெய் எழுத்துகள்', 'Uyirmei chart · 18 consonants × 12 vowels = 216 letters')}<table><thead><tr><th></th>${VOWELS.map(v => `<th>${v.l}</th>`).join('')}</tr></thead><tbody>${CONS.map(k => `<tr><th>${k.c + PULLI}</th>${VOWELS.map(v => `<td>${k.c + v.s}</td>`).join('')}</tr>`).join('')}</tbody></table>${foot('Learn Tamil · Uyirmei chart')}</div>`, true) },
  { file: 'tamil-numbers-chart', title: 'Tamil numbers 1 to 10 chart', html: doc('.grid{grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(5,1fr)}.n{display:grid;grid-template-columns:70px 1fr 60px;align-items:center;gap:8px;border-radius:14px;border:2px solid #ffd9c2;background:#fff7f2;padding:4px 14px}.n b{font-size:32pt;font-weight:800;color:#e0480c;text-align:center}.n .w{font-family:"Baloo Thambi 2","Noto Sans Tamil";font-weight:800;font-size:22pt}.n .tn{font-family:"Noto Sans Tamil";font-size:24pt;color:#7c3aed;text-align:center}.n small{display:block;font-family:Inter;font-size:9pt;color:#6b7385;font-weight:600}',
      `<div class="page">${head('எண்கள் 1 – 10', 'Tamil numbers · word and Tamil numeral')}<div class="grid">${nums.map(([w, , m], i) => `<div class="n"><b>${i + 1}</b><span class="w">${w}<small>${m.split(' · ')[0]}</small></span><span class="tn">${m.split(' · ')[2]}</span></div>`).join('')}</div>${foot('Learn Tamil · Numbers chart')}</div>`) },
  { file: 'tamil-uyir-tracing-worksheet', title: 'Tamil vowels tracing worksheet (uyir)', html: doc(TRACE_CSS, tracingPages(VOWELS.map(v => v.l), 'உயிர் எழுத்துகள் — எழுதிப் பழகு', 'Tamil vowels tracing worksheet', 6)) },
  { file: 'tamil-mei-tracing-worksheet', title: 'Tamil consonants tracing worksheet (mei)', html: doc(TRACE_CSS, tracingPages(CONS.map(k => k.c + PULLI), 'மெய் எழுத்துகள் — எழுதிப் பழகு', 'Tamil consonants tracing worksheet', 6)) }
];

/* ---------- Picture-word charts, one per topic (data/words.js → TOPICS) ---------- */
const WORD_CHART_CSS = `.grid{grid-template-columns:repeat(var(--cols),1fr);grid-template-rows:repeat(var(--rows),minmax(0,1fr))}.wc{min-height:0;overflow:hidden;border-radius:16px;border:2px solid #e3e8f0;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4px}
.wc .e{font-size:var(--emo,54pt);line-height:1.15}.wc .w{font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:800;font-size:var(--wsize,20pt);line-height:1.2;color:#1f2a6b}.wc .m{font-size:9.5pt;color:#6b7385;font-weight:600}
.sw{width:62%;flex:1 1 auto;min-height:0;max-height:60%;border-radius:14px;border:2px solid #d5dfea;margin-bottom:6px}`;
const wordChart = (id, cols, opts = {}) => { const t = topic(id);
  const card = ([w, e, m]) => `<div class="wc">${opts.swatch ? `<span class="sw" style="background:${PAINT[w] || '#fff'}"></span>` : `<span class="e">${e}</span>`}<span class="w">${w}</span><span class="m">${meaning(m)}</span></div>`;
  return { file: `tamil-${id}-chart`, cat: 'words', title: `${t.en} in Tamil — picture chart`,
    html: doc(WORD_CHART_CSS + `.grid{--cols:${cols};--rows:${Math.ceil(t.words.length / cols)};${opts.css || ''}}`, `<div class="page">${head(t.ta, `${t.en} · ${t.words.length} words`)}<div class="grid">${t.words.map(card).join('')}</div>${foot(`Learn Tamil · ${t.en}`)}</div>`) }; };

/* Opposites: the data lists each pair next to each other. */
const opp = topic('opposites').words, pairs = [];
for (let i = 0; i < opp.length; i += 2) pairs.push([opp[i], opp[i + 1]]);
const OPP_DOC = { file: 'tamil-opposites-chart', cat: 'words', title: 'Opposite words in Tamil — chart',
  html: doc(WORD_CHART_CSS + '.pairs{display:grid;grid-template-rows:repeat(5,1fr);gap:10px;flex:1;margin-top:8px}.pr{display:grid;grid-template-columns:1fr 50px 1fr;align-items:center}.pr .wc{height:100%}.ar{text-align:center;font-size:24pt;color:#7c3aed;font-weight:800}',
    `<div class="page">${head(topic('opposites').ta, 'Opposite words · எதிர்ச்சொற்கள்')}<div class="pairs">${pairs.map(([a, b]) =>
      `<div class="pr"><div class="wc"><span class="e">${a[1]}</span><span class="w">${a[0]}</span><span class="m">${meaning(a[2])}</span></div><span class="ar">↔</span><div class="wc"><span class="e">${b[1]}</span><span class="w">${b[0]}</span><span class="m">${meaning(b[2])}</span></div></div>`).join('')}</div>${foot('Learn Tamil · Opposites')}</div>`) };

/* Days of the week and the 12 Tamil months on one page. */
const listCol = (title, sub, rows, color) => `<div class="lc"><div class="gt" style="color:${color}">${title} <span style="font-family:Inter;font-size:9.5pt;color:#6b7385">${sub}</span></div>${rows}</div>`;
const DAYS_DOC = { file: 'tamil-days-and-months-chart', cat: 'words', title: 'Days of the week and Tamil months — chart',
  html: doc('.two{display:grid;grid-template-columns:1fr 1.3fr;gap:14px;flex:1;margin-top:6px}.lc{display:flex;flex-direction:column;gap:5px}.row{flex:1;display:grid;grid-template-columns:34px 1fr;align-items:center;gap:8px;border-radius:12px;border:2px solid #e3e8f0;padding:2px 10px;background:#fff}.row b{font-size:15pt;color:#94a3b8;text-align:center}.row .w{font-family:"Baloo Thambi 2","Noto Sans Tamil";font-weight:800;font-size:18pt;line-height:1.1}.row small{display:block;font-family:Inter;font-size:8.5pt;color:#6b7385;font-weight:600}',
    `<div class="page">${head('கிழமைகளும் மாதங்களும்', 'Days of the week · the 12 Tamil months')}<div class="two">
      ${listCol(topic('days').ta, '7 days', topic('days').words.map(([w, , m], i) => `<div class="row"><b>${i + 1}</b><span class="w">${w}<small>${m}</small></span></div>`).join(''), '#1769d1')}
      ${listCol(topic('months').ta, '12 months · the year starts in mid-April', topic('months').words.map(([w, , m], i) => `<div class="row"><b>${i + 1}</b><span class="w">${w}<small>${m.split(' · ')[1]}</small></span></div>`).join(''), '#e0480c')}
    </div>${foot('Learn Tamil · Days and months')}</div>`) };

/* Aathichoodi poster: one line for each vowel (data/rhymes.js). */
const AATHI_DOC = { file: 'aathichoodi-poster', cat: 'words', title: 'Aathichoodi poster — one line for each Tamil vowel',
  html: doc('.lines{display:flex;flex-direction:column;gap:5px;flex:1;margin-top:6px}.al{flex:1;display:grid;grid-template-columns:58px 1fr;align-items:center;gap:10px;border-radius:12px;border:2px solid #f5d9c8;background:#fffaf5;padding:0 12px}.al .v{font-family:"Baloo Thambi 2";font-weight:800;font-size:28pt;color:#e0480c;text-align:center;line-height:1}.al .t{font-family:"Baloo Thambi 2","Noto Sans Tamil";font-weight:800;font-size:17pt;line-height:1.15}.al small{display:block;font-family:Inter;font-size:9pt;font-weight:600;color:#6b7385}',
    `<div class="page">${head('ஆத்திசூடி', 'Aathichoodi · by Avvaiyar (ஔவையார்) · one wise line for each vowel')}<div class="lines">${AATHICHOODI.map(([ta, en]) =>
      `<div class="al"><span class="v">${lettersOf(ta)[0]}</span><span class="t">${ta}<small>${en}</small></span></div>`).join('')}</div>${foot('Learn Tamil · Aathichoodi')}</div>`) };

/* ---------- Tracing: all 216 uyirmei letters, one consonant per page ---------- */
const UM_TRACE_CSS = TRACE_CSS + '.trow{grid-template-columns:repeat(6,1fr)}.trow .L{font-size:31pt;line-height:1.2}.rows{gap:4px}.trow .eq{font-family:Inter;font-size:8pt;color:#6b7385;font-weight:600;display:block;line-height:1}';
const umTracePages = CONS.map((k, p) => `<div class="page">${head(`${k.c + PULLI} வரிசை — எழுதிப் பழகு`, `Uyirmei tracing · ${k.c + PULLI} + the 12 vowels`)}<div class="name"><span>Name · பெயர்:</span><span>Date · தேதி:</span></div>
  <div class="rows">${VOWELS.map(v => `<div class="trow"><span class="model L">${k.c + v.s}<span class="eq">${k.c + PULLI} + ${v.l}</span></span>${('<span class="tr L">' + k.c + v.s + '</span>').repeat(5)}</div>`).join('')}</div>${foot(`Page ${p + 1} of ${CONS.length}`)}</div>`).join('');

/* Tracing number words 1–10. */
const NUM_TRACE_DOC = { file: 'tamil-number-words-tracing-worksheet', cat: 'tracing', title: 'Tamil number words tracing worksheet (1–10)',
  html: doc(TRACE_CSS + '.trow{grid-template-columns:52px 1.1fr 1fr 1fr}.trow .L{font-size:22pt;text-align:left;padding-left:6px}.trow .num{font-size:22pt;font-weight:800;color:#e0480c;text-align:center}.rows{gap:5px}',
    `<div class="page">${head('எண்கள் — எழுதிப் பழகு', 'Tamil number words 1–10 · tracing worksheet')}<div class="name"><span>Name · பெயர்:</span><span>Date · தேதி:</span></div>
     <p class="tip">✏️ Read the blue word, then trace the grey words. Count on your fingers!</p>
     <div class="rows">${topic('numbers').words.map(([w], i) => `<div class="trow"><span class="num">${i + 1}</span><span class="model L">${w}</span><span class="tr L">${w}</span><span class="tr L">${w}</span></div>`).join('')}</div>${foot('Learn Tamil · Number words')}</div>`) };

/* ---------- Activities ---------- */
const MATCH_CSS = `.mt{display:grid;grid-template-columns:1fr 1fr;gap:6px 90px;flex:1;margin-top:8px;align-content:stretch}
.mi{display:flex;align-items:center;gap:10px;border-radius:14px;border:2px solid #e3e8f0;background:#fff;padding:0 14px;position:relative}
.mi .e{font-size:30pt}.mi .w{font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:800;font-size:20pt}
.mi::after{content:'';position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:#7c3aed;transform:translateY(-50%)}
.mi.l::after{right:-7px}.mi.r::after{left:-7px}.mi.r{justify-content:flex-start;padding-left:22px}
.tip{font-size:10pt;color:#4a5163;margin:2px 0}`;
const matchPage = (id, n, pageNo, total) => { const t = topic(id), ws = t.words.slice(0, n), right = shuffleBy(ws, 'match-' + id);
  return `<div class="page">${head('படத்தையும் சொல்லையும் இணை', `Match each picture to its Tamil word · ${t.en}`)}<div class="name"><span>Name · பெயர்:</span><span>Date · தேதி:</span></div>
    <p class="tip">✏️ Draw a line from each picture to its word. Say the word aloud!</p>
    <div class="mt" style="grid-template-rows:repeat(${n},1fr)">${ws.map((w, i) => `<div class="mi l"><span class="e">${w[1]}</span><span class="m" style="color:#6b7385;font-size:10pt">${meaning(w[2])}</span></div><div class="mi r"><span class="w">${right[i][0]}</span></div>`).join('')}</div>${foot(`Page ${pageNo} of ${total}`)}</div>`; };
const MATCH_TOPICS = ['animals', 'food', 'birds', 'body'];
const MATCH_DOC = { file: 'tamil-picture-word-matching-worksheet', cat: 'activity', title: 'Match the picture to the Tamil word — worksheet',
  html: doc(MATCH_CSS, MATCH_TOPICS.map((id, i) => matchPage(id, 8, i + 1, MATCH_TOPICS.length)).join('')) };

/* Missing letter: write the missing letter, choosing from three. Answer key on the last page. */
const isMei = l => l.length === 2 && l[1] === PULLI;
const MISS = shuffleBy(WORDS.filter(w => /[\u{1F300}-\u{1FAFF}]/u.test(w[1]) && lettersOf(w[0]).length >= 2 && lettersOf(w[0]).length <= 4), 'missing').slice(0, 20).map((w, i) => {
  const ls = lettersOf(w[0]), r = seeded('gap-' + w[0]), gap = Math.floor(r() * ls.length), ans = ls[gap];
  const pool = [...new Set(WORDS.flatMap(x => lettersOf(x[0])))].filter(l => l !== ans && isMei(l) === isMei(ans));
  const wrong = shuffleBy(pool, 'opt-' + w[0]).slice(0, 2);
  return { n: i + 1, w, ls, gap, ans, opts: shuffleBy([ans, ...wrong], 'o-' + w[0]) };
});
const MISS_CSS = `.mq{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(5,1fr);gap:8px;flex:1;margin-top:6px}
.mc{border-radius:14px;border:2px solid #e3e8f0;background:#fff;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:4px 12px;padding:6px 12px}
.mc .e{font-size:30pt;grid-row:span 2}.mc .wd{font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:800;font-size:24pt;letter-spacing:2px;line-height:1.15}
.gap{display:inline-block;min-width:44px;border-bottom:3px solid #7c3aed;margin:0 3px}
.ops{display:flex;gap:8px;font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:700;font-size:14pt}.ops span{border:1.5px solid #c7d2e0;border-radius:999px;padding:0 12px}
.mc small{font-family:Inter,sans-serif;letter-spacing:0;color:#6b7385;font-size:9pt;font-weight:600}.num{font-family:Inter,sans-serif;letter-spacing:0;color:#94a3b8;font-weight:800;font-size:10pt}
.key{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}.key div{border:1.5px solid #e3e8f0;border-radius:10px;padding:6px 8px;font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:700;font-size:13pt}.key small{font-family:Inter;color:#6b7385;font-size:8.5pt}`;
const missPage = (items, p) => `<div class="page">${head('விடுபட்ட எழுத்தை எழுது', 'Write the missing letter · circle the right one, then write it')}<div class="name"><span>Name · பெயர்:</span><span>Date · தேதி:</span></div>
  <div class="mq">${items.map(q => `<div class="mc"><span class="e">${q.w[1]}</span><span class="wd"><span class="num">${q.n}.</span> ${q.ls.map((l, i) => i === q.gap ? '<span class="gap"></span>' : l).join('')}<br><small>${meaning(q.w[2])}</small></span><span class="ops">${q.opts.map(o => `<span>${o}</span>`).join('')}</span></div>`).join('')}</div>${foot(`Page ${p} of 3`)}</div>`;
const MISS_DOC = { file: 'tamil-missing-letter-worksheet', cat: 'activity', title: 'Missing letter worksheet — with answer key',
  html: doc(MISS_CSS, missPage(MISS.slice(0, 10), 1) + missPage(MISS.slice(10, 20), 2) +
    `<div class="page">${head('விடைகள்', 'Answer key · for parents and teachers')}<div class="key">${MISS.map(q => `<div>${q.n}. ${q.w[0]} <small>(${q.ans})</small></div>`).join('')}</div>${foot('Page 3 of 3')}</div>`) };

/* Colouring pages: the pictures from the app (data/pictures.js), with the word to trace. */
const COLOUR_DOC = { file: 'tamil-colouring-pages', cat: 'colouring', title: 'Tamil colouring pages — colour and trace the word',
  html: doc(TRACE_CSS + '.art{flex:1;display:grid;place-items:center;margin:6px 0}.art svg{width:150mm;height:150mm}.art .cr{fill:#fff;stroke:#1f2937;stroke-width:2.5;stroke-linejoin:round}.art .cl{fill:none;stroke:#1f2937;stroke-width:2.5;stroke-linecap:round}.wr{display:grid;grid-template-columns:repeat(3,1fr);border-radius:14px;border:2px solid #e3e8f0;background:linear-gradient(transparent 49%,#e8edf5 49%,#e8edf5 51%,transparent 51%);padding:2px 0}.wr .L{font-size:40pt;font-weight:700;text-align:center;line-height:1.3}',
    PICTURES.map((P, i) => `<div class="page">${head(`வண்ணம் தீட்டு — ${P.w}`, `Colour the ${P.en}, then trace the word`)}<div class="name"><span>Name · பெயர்:</span><span>Date · தேதி:</span></div>
      <div class="art"><svg viewBox="0 0 200 200">${P.svg}</svg></div>
      <div class="wr"><span class="L model">${P.w}</span><span class="L tr">${P.w}</span><span class="L tr">${P.w}</span></div>${foot(`Page ${i + 1} of ${PICTURES.length}`)}</div>`).join('')) };

/* ================= More worksheets (all from data; shuffles are seeded) ================= */
const NAME_ROW = '<div class="name"><span>Name · பெயர்:</span><span>Date · தேதி:</span></div>';
const hasEmoji = w => /[\u{1F300}-\u{1FAFF}☀-➿]/u.test(w[1]);
const pagesOf = (list, n) => { const out = []; for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n)); return out; };
const keyPage = (items, total) => `<div class="page">${head('விடைகள்', 'Answer key · for parents and teachers')}<div class="key">${items}</div>${foot(`Page ${total} of ${total}`)}</div>`;
const KEY_CSS = `.key{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px;align-content:start}.key div{border:1.5px solid #e3e8f0;border-radius:10px;padding:6px 8px;font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:700;font-size:13pt}.key small{font-family:Inter;color:#6b7385;font-size:8.5pt}`;

/* Picture words to trace: easy words first (2–3 letters), 8 per page. */
const PW = WORDS.filter(hasEmoji).filter(w => lettersOf(w[0]).length <= 3).slice(0, 24);
const PW_PAGES = pagesOf(PW, 8);
const PW_TRACE_DOC = { file: 'tamil-picture-words-tracing-worksheet', cat: 'tracing', title: 'Picture words tracing worksheet — 24 easy Tamil words',
  html: doc(TRACE_CSS + '.trow{grid-template-columns:70px 1.15fr 1fr 1fr}.trow .L{font-size:30pt;text-align:left;padding-left:6px}.trow .pic{font-size:30pt;text-align:center;line-height:1}.trow .pic small{display:block;font-family:Inter;font-size:8pt;color:#6b7385;font-weight:600}.rows{gap:6px}',
    PW_PAGES.map((ws, p) => `<div class="page">${head('சொற்கள் — எழுதிப் பழகு', 'Picture words · read, say and trace')}${NAME_ROW}
      <p class="tip">✏️ Look at the picture, read the blue word aloud, then trace the grey words.</p>
      <div class="rows">${ws.map(([w, e, m]) => `<div class="trow"><span class="pic">${e}<small>${meaning(m)}</small></span><span class="model L">${w}</span><span class="tr L">${w}</span><span class="tr L">${w}</span></div>`).join('')}</div>${foot(`Page ${p + 1} of ${PW_PAGES.length}`)}</div>`).join('')) };

/* Days of the week to trace. */
const DAYS_TRACE_DOC = { file: 'tamil-days-tracing-worksheet', cat: 'tracing', title: 'Days of the week tracing worksheet in Tamil',
  html: doc(TRACE_CSS + '.trow{grid-template-columns:90px 1.2fr 1fr 1fr}.trow .L{font-size:24pt;text-align:left;padding-left:6px}.trow .en{font-size:10pt;font-weight:700;color:#4a5163;text-align:center}.rows{gap:7px}',
    `<div class="page">${head('கிழமைகள் — எழுதிப் பழகு', 'Days of the week · tracing worksheet')}${NAME_ROW}
     <p class="tip">✏️ Read the blue day, then trace it twice. Which day is today?</p>
     <div class="rows">${topic('days').words.map(([w, , m]) => `<div class="trow"><span class="en">${m}</span><span class="model L">${w}</span><span class="tr L">${w}</span><span class="tr L">${w}</span></div>`).join('')}</div>${foot('Learn Tamil · Days of the week')}</div>`) };

/* Consonant + vowel = uyirmei. 24 sums on 2 pages, then the answer key. */
/* Every vowel twice and every consonant at least once, so the practice is balanced. */
const SUM_K = [...shuffleBy(CONS, 'sum-k1'), ...shuffleBy(CONS, 'sum-k2').slice(0, 6)];
const SUMS = shuffleBy([...VOWELS, ...VOWELS].map((v, i) => ({ k: SUM_K[i], v })), 'uyirmei-sums');
const SUM_CSS = KEY_CSS + `.sums{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(6,minmax(0,1fr));gap:10px;flex:1;margin-top:6px}
.sm{display:flex;align-items:center;justify-content:center;gap:10px;border-radius:14px;border:2px solid #e3e8f0;background:#fff;font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:800;font-size:30pt;min-height:0}
.sm .c{color:#0b8a6c}.sm .v{color:#1769d1}.sm .op{color:#94a3b8;font-size:22pt}.sm .bx{width:70px;height:62px;border:2.5px dashed #7c3aed;border-radius:12px}.sm .num{font-family:Inter;font-size:10pt;color:#94a3b8;align-self:flex-start;margin-top:8px}`;
const sumPage = (items, p, start) => `<div class="page">${head('மெய் + உயிர் = உயிர்மெய்', 'Join the consonant and the vowel · write the new letter in the box')}${NAME_ROW}
  <p class="tip">✏️ Example: க் + ஆ = கா. Say both sounds, join them, then write the letter.</p>
  <div class="sums">${items.map((q, i) => `<div class="sm"><span class="num">${start + i}.</span><span class="c">${q.k.c + PULLI}</span><span class="op">+</span><span class="v">${q.v.l}</span><span class="op">=</span><span class="bx"></span></div>`).join('')}</div>${foot(`Page ${p} of 3`)}</div>`;
const SUM_DOC = { file: 'tamil-uyirmei-joining-worksheet', cat: 'activity', title: 'Uyirmei joining worksheet — consonant + vowel (with answer key)',
  html: doc(SUM_CSS, sumPage(SUMS.slice(0, 12), 1, 1) + sumPage(SUMS.slice(12), 2, 13) +
    keyPage(SUMS.map((q, i) => `<div>${i + 1}. ${q.k.c + PULLI} + ${q.v.l} = ${q.k.c + q.v.s}</div>`).join(''), 3)) };

/* First letter: look at the picture, circle and write its first letter. */
const FL_WORDS = shuffleBy([...new Map([...WORDS, ...TOPICS.filter(t => !['numbers', 'days', 'months', 'opposites', 'colours', 'shapes'].includes(t.id)).flatMap(t => t.words)]
  .filter(hasEmoji).map(w => [w[0], w])).values()], 'first-letter').slice(0, 20);
const FIRSTS = [...new Set(FL_WORDS.map(w => lettersOf(w[0])[0]))];
const FL = FL_WORDS.map((w, i) => { const ans = lettersOf(w[0])[0];
  return { n: i + 1, w, ans, opts: shuffleBy([ans, ...shuffleBy(FIRSTS.filter(l => l !== ans), 'fl-' + w[0]).slice(0, 2)], 'flo-' + w[0]) }; });
const FL_CSS = KEY_CSS + `.mq{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(5,minmax(0,1fr));gap:8px;flex:1;margin-top:6px}
.mc{border-radius:14px;border:2px solid #e3e8f0;background:#fff;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:6px 12px;padding:6px 12px;min-height:0}
.mc .e{font-size:40pt;line-height:1}.mc small{display:block;font-family:Inter;color:#6b7385;font-size:9pt;font-weight:600}.mc .num{font-family:Inter;color:#94a3b8;font-weight:800;font-size:10pt}
.ops{display:flex;gap:6px;font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:700;font-size:18pt}.ops span{border:1.5px solid #c7d2e0;border-radius:999px;padding:0 12px}
.bx{width:64px;height:58px;border:2.5px dashed #7c3aed;border-radius:12px}`;
const flPage = (items, p) => `<div class="page">${head('முதல் எழுத்தை எழுது', 'Write the first letter · say the word, circle its first letter, write it in the box')}${NAME_ROW}
  <div class="mq">${items.map(q => `<div class="mc"><span class="e">${q.w[1]}</span><span><span class="num">${q.n}.</span><small>${meaning(q.w[2])}</small><span class="ops">${q.opts.map(o => `<span>${o}</span>`).join('')}</span></span><span class="bx"></span></div>`).join('')}</div>${foot(`Page ${p} of 3`)}</div>`;
const FL_DOC = { file: 'tamil-first-letter-worksheet', cat: 'activity', title: 'First letter worksheet — picture sounds (with answer key)',
  html: doc(FL_CSS, flPage(FL.slice(0, 10), 1) + flPage(FL.slice(10, 20), 2) +
    keyPage(FL.map(q => `<div>${q.n}. ${q.w[0]} <small>(${q.ans})</small></div>`).join(''), 3)) };

/* Word search: Tamil letters in a grid, words go across (→) or down (↓) only. */
const SIZE = 8;
const wordSearch = (id, count) => {
  const ws = topic(id).words.filter(w => lettersOf(w[0]).length <= SIZE).slice(0, count), r = seeded('ws-' + id);
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null)), hit = new Set(), placed = [];
  for (const w of ws){ const ls = lettersOf(w[0]);
    for (let tries = 0; tries < 400; tries++){
      const down = r() < 0.5, row = Math.floor(r() * (down ? SIZE - ls.length + 1 : SIZE)), col = Math.floor(r() * (down ? SIZE : SIZE - ls.length + 1));
      const cells = ls.map((_, i) => down ? [row + i, col] : [row, col + i]);
      if (cells.every(([y, x], i) => grid[y][x] === null || grid[y][x] === ls[i])){
        cells.forEach(([y, x], i) => { grid[y][x] = ls[i]; hit.add(y * SIZE + x); }); placed.push(w); break; } } }
  const pool = [...new Set(placed.flatMap(w => lettersOf(w[0])))];
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (grid[y][x] === null) grid[y][x] = pool[Math.floor(r() * pool.length)];
  return { t: topic(id), grid, hit, placed };
};
const PUZZLES = [wordSearch('animals', 8), wordSearch('birds', 7), wordSearch('food', 7)];
const wsGrid = (P, key) => `<div class="wg${key ? ' small' : ''}">${P.grid.flat().map((l, i) => `<span${key && P.hit.has(i) ? ' class="on"' : ''}>${l}</span>`).join('')}</div>`;
const WS_CSS = `.wg{display:grid;grid-template-columns:repeat(${SIZE},1fr);gap:4px;margin:8px auto 0;width:168mm;aspect-ratio:1}
.wg span{display:grid;place-items:center;border:1.5px solid #d5dfea;border-radius:8px;font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:700;font-size:24pt;background:#fff}
.wg.small{width:78mm;gap:2px;margin:4px 0 0}.wg.small span{font-size:10pt;border-radius:4px;border-width:1px}.wg span.on{background:#ffe9a8;border-color:#f2b705}
.wl{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}.wl div{border:1.5px solid #e3e8f0;border-radius:10px;padding:4px 8px;display:flex;align-items:center;gap:6px;font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:700;font-size:14pt}.wl .e{font-size:18pt}
.keys{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px}.keys .gt{margin-top:0}`;
const WS_DOC = { file: 'tamil-word-search-worksheet', cat: 'activity', title: 'Tamil word search puzzles — animals, birds, food (with answers)',
  html: doc(WS_CSS, PUZZLES.map((P, p) => `<div class="page">${head(`சொற்களைக் கண்டுபிடி — ${P.t.ta}`, `Word search · ${P.t.en} · find each word going across → or down ↓`)}${NAME_ROW}
    <p class="tip">🔍 Each box holds one Tamil letter. Find the words below and draw a ring around them.</p>${wsGrid(P)}
    <div class="wl">${P.placed.map(([w, e]) => `<div><span class="e">${e}</span>${w}</div>`).join('')}</div>${foot(`Page ${p + 1} of ${PUZZLES.length + 1}`)}</div>`).join('') +
    `<div class="page">${head('விடைகள்', 'Answer key · the hidden words are coloured')}<div class="keys">${PUZZLES.map(P => `<div><div class="gt">${P.t.ta} <span style="font-family:Inter;font-size:9.5pt;color:#6b7385">${P.t.en}</span></div>${wsGrid(P, true)}</div>`).join('')}</div>${foot(`Page ${PUZZLES.length + 1} of ${PUZZLES.length + 1}`)}</div>`) };

/* Count and circle: count the pictures, circle the right Tamil number word. */
const NUMW = topic('numbers').words.map(w => w[0]);
const CNT_EMO = ['🍎', '🐟', '⭐', '🎈', '🐤', '🌸', '🍌', '🚗', '⚽', '🦋'];
const COUNT = shuffleBy(NUMW.map((w, i) => i + 1), 'count').map((n, i) => ({ n, e: CNT_EMO[i],
  opts: shuffleBy([n, ...shuffleBy(NUMW.map((_, j) => j + 1).filter(x => x !== n && Math.abs(x - n) <= 3), 'cn-' + n).slice(0, 2)], 'co-' + n) }));
const COUNT_DOC = { file: 'tamil-count-and-circle-worksheet', cat: 'activity', title: 'Count and circle the Tamil number word — worksheet',
  html: doc(KEY_CSS + `.cq{display:flex;flex-direction:column;gap:6px;flex:1;margin-top:6px}.cr{flex:1;min-height:0;display:grid;grid-template-columns:1.25fr 1fr;align-items:center;gap:10px;border-radius:14px;border:2px solid #e3e8f0;background:#fff;padding:0 12px}
.cr .pics{font-size:19pt;line-height:1.15;letter-spacing:2px}.ops{display:flex;gap:8px;justify-content:flex-end;font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:700;font-size:15pt}.ops span{border:1.5px solid #c7d2e0;border-radius:999px;padding:0 12px}`,
    `<div class="page">${head('எண்ணி வட்டமிடு', 'Count and circle · count the pictures, then circle the right number word')}${NAME_ROW}
     <div class="cq">${COUNT.map(q => `<div class="cr"><span class="pics">${q.e.repeat(q.n)}</span><span class="ops">${q.opts.map(o => `<span>${NUMW[o - 1]}</span>`).join('')}</span></div>`).join('')}</div>${foot('Page 1 of 2')}</div>` +
    keyPage(COUNT.map(q => `<div>${q.e} × ${q.n} = ${NUMW[q.n - 1]}</div>`).join(''), 2)) };

/* Short or long vowel: sort the 12 vowels into குறில் and நெடில் boxes. */
const KN_DOC = { file: 'tamil-kuril-nedil-worksheet', cat: 'activity', title: 'Kuril and nedil worksheet — short and long Tamil vowels',
  html: doc(KEY_CSS + `.vs{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}.vs span{width:52px;height:58px;display:grid;place-items:center;border:2px solid #bcd6f5;background:#f3f8fe;border-radius:14px;font-family:'Baloo Thambi 2';font-weight:800;font-size:26pt;color:#1769d1}
.bins{display:grid;grid-template-columns:1fr 1fr;gap:14px;flex:1;margin-top:6px}.bin{border:3px dashed #c7d2e0;border-radius:18px;padding:10px;display:flex;flex-direction:column}.bin h2{font-family:'Baloo Thambi 2','Noto Sans Tamil';font-size:22pt;text-align:center}.bin p{text-align:center;font-size:9.5pt;color:#6b7385}
.slots{flex:1;display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(4,1fr);gap:8px;margin-top:8px}.slots span{border-bottom:2px solid #9aa6b8}
.ans{margin-top:8px;font-size:9pt;color:#6b7385;transform:rotate(180deg);text-align:center}`,
    `<div class="page">${head('குறிலும் நெடிலும்', 'Short and long vowels · say each vowel, then write it in the right box')}${NAME_ROW}
     <p class="tip">🗣️ குறில் is a short sound (அ). நெடில் is a long sound (ஆ). Say them both: அ… ஆ…</p>
     <div class="vs">${shuffleBy(VOWELS, 'kn').map(v => `<span>${v.l}</span>`).join('')}</div>
     <div class="bins"><div class="bin" style="border-color:#7fb0ea"><h2 style="color:#1769d1">குறில்</h2><p>short sound</p><div class="slots">${'<span></span>'.repeat(8)}</div></div>
       <div class="bin" style="border-color:#f3a77d"><h2 style="color:#e0480c">நெடில்</h2><p>long sound</p><div class="slots">${'<span></span>'.repeat(8)}</div></div></div>
     <p class="ans ta">Answers · குறில்: ${VOWELS.filter(v => v.len === 'குறில்').map(v => v.l).join(' ')} · நெடில்: ${VOWELS.filter(v => v.len === 'நெடில்').map(v => v.l).join(' ')}</p>${foot('Learn Tamil · Kuril and nedil')}</div>`) };

/* Read the colour word, colour the box. The answer key shows each colour. */
const COLW = topic('colours').words;
const COLW_DOC = { file: 'tamil-colour-words-worksheet', cat: 'colouring', title: 'Read and colour — Tamil colour words worksheet',
  html: doc(KEY_CSS + `.cw{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(5,minmax(0,1fr));gap:10px;flex:1;margin-top:6px}.ci{display:grid;grid-template-columns:1.3fr 1fr;align-items:center;gap:10px;border-radius:14px;border:2px solid #e3e8f0;padding:8px 12px;min-height:0}
.ci .w{font-family:'Baloo Thambi 2','Noto Sans Tamil';font-weight:800;font-size:22pt;text-align:center}.ci .bx{height:100%;border:2.5px solid #1f2937;border-radius:12px}
.key div{display:flex;align-items:center;gap:8px}.key i{width:22px;height:22px;border-radius:6px;border:1px solid #9aa6b8;flex:none}`,
    `<div class="page">${head('படித்து வண்ணம் தீட்டு', 'Read and colour · read the colour word, then colour the box in that colour')}${NAME_ROW}
     <div class="cw">${shuffleBy(COLW, 'colour-words').map(([w]) => `<div class="ci"><span class="w">${w}</span><span class="bx"></span></div>`).join('')}</div>${foot('Page 1 of 2')}</div>` +
    keyPage(COLW.map(([w, , m]) => `<div><i style="background:${PAINT[w] || '#fff'}"></i>${w} <small>${meaning(m)}</small></div>`).join(''), 2)) };

DOCS.push(
  { file: 'tamil-uyirmei-tracing-worksheet', cat: 'tracing', title: 'Uyirmei tracing worksheets — all 216 letters (18 pages)', html: doc(UM_TRACE_CSS, umTracePages) },
  NUM_TRACE_DOC,
  wordChart('colours', 2, { swatch: true, css: '--wsize:22pt' }),
  wordChart('animals', 3), wordChart('birds', 3), wordChart('food', 3), wordChart('body', 2, { css: '--emo:46pt' }),
  wordChart('family', 2, { css: '--emo:60pt;--wsize:24pt' }), wordChart('vehicles', 2, { css: '--emo:60pt;--wsize:22pt' }), wordChart('shapes', 2, { css: '--emo:64pt;--wsize:26pt' }),
  OPP_DOC, DAYS_DOC, AATHI_DOC,
  MATCH_DOC, MISS_DOC, COLOUR_DOC,
  PW_TRACE_DOC, DAYS_TRACE_DOC, SUM_DOC, FL_DOC, WS_DOC, COUNT_DOC, KN_DOC, COLW_DOC
);
// Categories for the printables page (in this order).
const CAT = { 'tamil-uyir-chart': 'letters', 'tamil-mei-chart': 'letters', 'tamil-alphabet-chart': 'letters', 'tamil-uyirmei-chart': 'letters',
  'tamil-numbers-chart': 'words', 'tamil-uyir-tracing-worksheet': 'tracing', 'tamil-mei-tracing-worksheet': 'tracing' };
DOCS.forEach(d => { d.cat = d.cat || CAT[d.file]; });

const ONLY = process.argv[2];   // node tools/build-printables.mjs <file> — rebuild one
for (const d of DOCS.filter(d => !ONLY || d.file === ONLY)){
  const src = path.join(TMP, d.file + '.html');
  fs.writeFileSync(src, d.html);
  const pdf = path.join(OUT, d.file + '.pdf');
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=12000', `--print-to-pdf=${pdf}`, 'file://' + src], { stdio: 'ignore' });
  const [w, h] = d.landscape ? [1123, 794] : [794, 1123];   // A4 at 96 dpi
  const big = path.join(TMP, d.file + '.png');
  execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--disable-gpu', `--window-size=${w},${h}`, '--virtual-time-budget=12000', `--screenshot=${big}`, 'file://' + src], { stdio: 'ignore' });
  execFileSync('sips', ['-Z', '520', big, '--out', path.join(THUMBS, d.file + '.png')], { stdio: 'ignore' });
  console.log('✓', d.file + '.pdf', Math.round(fs.statSync(pdf).size / 1024) + ' KB');
}
const ORDER = ['letters', 'words', 'tracing', 'activity', 'colouring'];
DOCS.sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat));
fs.writeFileSync(path.join(OUT, 'printables.json'), JSON.stringify(DOCS.map(d => ({ file: d.file, cat: d.cat, title: d.title, landscape: !!d.landscape,
  pages: (fs.readFileSync(path.join(OUT, d.file + '.pdf'), 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length })), null, 1));
fs.rmSync(TMP, { recursive: true, force: true });
console.log('Done. Now run: node tools/build-pages.mjs');
