#!/usr/bin/env node
/*
  Builds the free printable PDFs (charts and tracing worksheets) with headless Chrome,
  so Tamil text is shaped correctly and stays crisp (vector text).

    node tools/build-printables.mjs            # then: node tools/build-pages.mjs

  Writes printables/*.pdf and assets/printables/*.png (preview images).
  Set CHROME=/path/to/chrome if Chrome is not in the default macOS location.
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lt-print-'));
const OUT = path.join(ROOT, 'printables'), THUMBS = path.join(ROOT, 'assets/printables');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(THUMBS, { recursive: true });

const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8') + ';this.D={PULLI,VOWELS,CONS,GROUPS,TOPICS};', ctx);
const { PULLI, VOWELS, CONS, GROUPS, TOPICS } = ctx.D;

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
`;
const head = (ta, en) => `<div class="head"><span class="brand"><span class="mark">அ</span>LEARN TAMIL · <span class="ta">தமிழ் கற்போம்</span></span><span style="font-size:9pt;color:#6b7385">Free printable</span></div><h1>${ta}<small>${en}</small></h1>`;
const foot = page => `<div class="foot"><span>jssuthahar.github.io/learntamil · Free for home and classroom use</span><span>${page}</span></div>`;
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

for (const d of DOCS){
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
fs.writeFileSync(path.join(OUT, 'printables.json'), JSON.stringify(DOCS.map(d => ({ file: d.file, title: d.title, landscape: !!d.landscape,
  pages: (fs.readFileSync(path.join(OUT, d.file + '.pdf'), 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length })), null, 1));
fs.rmSync(TMP, { recursive: true, force: true });
console.log('Done. Now run: node tools/build-pages.mjs');
