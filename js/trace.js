/* Learn Tamil — ✍️ Trace a letter and 🎨 Colouring (Games).
   Trace: the letter is drawn faintly; the child traces it with a finger, mouse or pen. When enough of
   the letter is covered (and most of the ink stays on the letter) it counts as written.
   Colouring: pick a colour (its Tamil name is spoken), tap parts of a picture to fill them.
   Uses helpers from app.js / games.js / rewards.js: $, $$, uyir, mei, uyirmei, sayItem, speak, Rewards, Progress, showGame. */
'use strict';

/* =====================================================================
   ✍️ TRACE
   ===================================================================== */
const TR = { set: 'uyir', i: 0, done: false, drawing: false, last: null, inked: false };
const TR_SETS = { uyir: () => uyir, mei: () => mei, um: () => uyirmei.flat() };
const SIZE = 600, BRUSH = 38, CELL = 12;
const trCv = $('#trCanvas'), trG = trCv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = c.height = SIZE; return c; };
const maskCv = mk(), zoneCv = mk(), inkCv = mk();
let maskCells = null, zoneCells = null;

const trItem = () => TR_SETS[TR.set]()[TR.i];
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// Draw the letter as big as fits, centred, onto a canvas context.
function drawLetter(g, l, fill, strokeW){
  let size = 420;
  g.font = `700 ${size}px "Noto Sans Tamil", "Latha", sans-serif`;
  let m = g.measureText(l);
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  size = Math.floor(size * Math.min(470 / Math.max(w, 1), 430 / Math.max(h, 1), 1.4));
  g.font = `700 ${size}px "Noto Sans Tamil", "Latha", sans-serif`;
  m = g.measureText(l);
  const x = SIZE / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  const y = SIZE / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  g.fillStyle = fill; g.fillText(l, x, y);
  if (strokeW){ g.lineJoin = 'round'; g.lineWidth = strokeW; g.strokeStyle = fill; g.strokeText(l, x, y); }
}
// Which CELL×CELL squares contain enough of a canvas's pixels.
function cellsOf(cv, minShare){
  const d = cv.getContext('2d').getImageData(0, 0, SIZE, SIZE).data, n = SIZE / CELL, out = new Uint8Array(n * n);
  for (let cy = 0; cy < n; cy++) for (let cx = 0; cx < n; cx++){
    let on = 0;
    for (let y = cy * CELL; y < cy * CELL + CELL; y += 2) for (let x = cx * CELL; x < cx * CELL + CELL; x += 2) if (d[(y * SIZE + x) * 4 + 3] > 60) on++;
    out[cy * n + cx] = on / (CELL * CELL / 4) >= minShare ? 1 : 0;
  }
  return out;
}
function paintBoard(){
  trG.clearRect(0, 0, SIZE, SIZE);
  // dotted writing lines
  trG.strokeStyle = cssVar('--border') || '#d5dfea'; trG.lineWidth = 2; trG.setLineDash([8, 10]);
  [150, 450].forEach(y => { trG.beginPath(); trG.moveTo(20, y); trG.lineTo(SIZE - 20, y); trG.stroke(); });
  trG.setLineDash([]);
  trG.globalAlpha = 0.28; trG.drawImage(maskCv, 0, 0); trG.globalAlpha = 1;
  trG.drawImage(inkCv, 0, 0);
}
async function renderTrace(){
  const it = trItem(); TR.done = false; TR.inked = false;
  $('#trName').textContent = `${it.l}  ·  ${it.r}`;
  $$('#trSets .seg-btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.set === TR.set));
  fb($('#trFb'), ''); $('#trMeter').style.width = '0%';
  try { await document.fonts.load('700 100px "Noto Sans Tamil"', it.l); } catch (e) {}
  [maskCv, zoneCv, inkCv].forEach(c => c.getContext('2d').clearRect(0, 0, SIZE, SIZE));
  drawLetter(maskCv.getContext('2d'), it.l, cssVar('--text') || '#0b1020');
  drawLetter(zoneCv.getContext('2d'), it.l, '#000', BRUSH * 1.6);
  maskCells = cellsOf(maskCv, 0.3); zoneCells = cellsOf(zoneCv, 0.05);
  paintBoard();
}
function trPoint(e){ const r = trCv.getBoundingClientRect(); return [(e.clientX - r.left) * SIZE / r.width, (e.clientY - r.top) * SIZE / r.height]; }
function inkLine(a, b){
  const g = inkCv.getContext('2d');
  g.strokeStyle = famColor(trItem().fam) || '#1769d1'; g.lineWidth = BRUSH; g.lineCap = g.lineJoin = 'round';
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0] + 0.01, b[1]); g.stroke();
}
trCv.addEventListener('pointerdown', e => {
  if (TR.done) return;
  e.preventDefault(); trCv.setPointerCapture(e.pointerId);
  TR.drawing = true; TR.last = trPoint(e); inkLine(TR.last, TR.last); TR.inked = true; paintBoard();
});
trCv.addEventListener('pointermove', e => {
  if (!TR.drawing) return;
  const p = trPoint(e); inkLine(TR.last, p); TR.last = p; paintBoard();
});
const endStroke = () => { if (!TR.drawing) return; TR.drawing = false; checkTrace(); };
trCv.addEventListener('pointerup', endStroke);
trCv.addEventListener('pointercancel', endStroke);

function checkTrace(){
  if (TR.done || !TR.inked) return;
  const ink = cellsOf(inkCv, 0.08);
  let letter = 0, covered = 0, inked = 0, outside = 0;
  for (let i = 0; i < ink.length; i++){
    if (maskCells[i]){ letter++; if (ink[i]) covered++; }
    if (ink[i]){ inked++; if (!zoneCells[i]) outside++; }
  }
  const cover = letter ? covered / letter : 0, off = inked ? outside / inked : 0;
  $('#trMeter').style.width = Math.round(Math.min(1, cover / 0.75) * 100) + '%';
  if (off > 0.35 && inked > 30){ fb($('#trFb'), 'கோட்டுக்குள் எழுது! · Try to stay on the letter', 'bad'); return; }
  if (inked > letter * 2.0){ fb($('#trFb'), 'மெதுவாக, கோட்டின் மேல் எழுது · Trace slowly along the letter — tap ↺ to try again', 'bad'); return; }
  if (cover >= 0.75){
    TR.done = true; const it = trItem();
    Progress.track('traced', it.l);
    const r = Rewards.win(trCv, { after: () => sayItem(it) });
    fb($('#trFb'), `${r.ta} ${it.l} ✍️`, 'ok');
    setTimeout(() => { if (TR.done && game === 'trace'){ TR.i = (TR.i + 1) % TR_SETS[TR.set]().length; renderTrace(); } }, 3200);
  } else if (cover > 0.3) fb($('#trFb'), 'நன்று! தொடர்ந்து எழுது · Keep going', '');
}
$$('#trSets .seg-btn').forEach(b => b.addEventListener('click', () => { TR.set = b.dataset.set; TR.i = 0; renderTrace(); }));
$('#trPrev').addEventListener('click', () => { const n = TR_SETS[TR.set]().length; TR.i = (TR.i - 1 + n) % n; renderTrace(); });
$('#trNext').addEventListener('click', () => { TR.i = (TR.i + 1) % TR_SETS[TR.set]().length; renderTrace(); });
$('#trClear').addEventListener('click', () => { inkCv.getContext('2d').clearRect(0, 0, SIZE, SIZE); TR.done = false; TR.inked = false; $('#trMeter').style.width = '0%'; fb($('#trFb'), ''); paintBoard(); });
$('#trHear').addEventListener('click', () => sayItem(trItem()));
$('#trSay').addEventListener('click', () => { const it = trItem(); SayBack.open({ text: it.l, play: done => sayItem(it, done) }); });

/* Open the tracing board for a letter (the ✍️ button under the big letter). */
const Trace = {
  open(item){
    const set = item.fam === 'uyir' ? 'uyir' : item.fam === 'mei' ? 'mei' : item.fam === 'um' ? 'um' : null;
    if (!set) return;
    TR.set = set; TR.i = Math.max(0, TR_SETS[set]().findIndex(x => x.l === item.l));
    game = 'trace';
    if (route() === 'practice') showGame('trace'); else location.hash = '/practice';
    setTimeout(() => $('#g-trace').scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
  }
};
$('#traceThis').addEventListener('click', () => Trace.open(current));
$('#sayThis').addEventListener('click', () => SayBack.open({ text: current.l, play: done => sayItem(current, done) }));
// ஃ has no tracing board: hide the ✍️ button there.
document.addEventListener('lt:section', e => { $('#traceThis').hidden = e.detail === 'aytham'; });

/* =====================================================================
   🎨 COLOURING — simple line pictures; each part with class "cr" can be filled.
   ===================================================================== */
const PICS = [
  { w: 'மீன்', e: '🐟', en: 'fish', svg: `
    <path class="cr" d="M148 100 L188 66 L180 100 L188 134 Z"/>
    <path class="cr" d="M72 66 Q96 32 124 64 Z"/>
    <ellipse class="cr" cx="95" cy="100" rx="60" ry="38"/>
    <circle class="cr" cx="62" cy="92" r="9"/>
    <path class="cl" d="M118 76 Q130 100 118 124"/>
    <circle class="cl" cx="30" cy="60" r="5"/><circle class="cl" cx="22" cy="40" r="7"/>` },
  { w: 'வீடு', e: '🏠', en: 'house', svg: `
    <rect class="cr" x="128" y="44" width="16" height="34"/>
    <path class="cr" d="M28 98 L100 36 L172 98 Z"/>
    <rect class="cr" x="46" y="98" width="108" height="80"/>
    <rect class="cr" x="88" y="128" width="26" height="50"/>
    <rect class="cr" x="58" y="112" width="22" height="22"/>
    <rect class="cr" x="122" y="112" width="22" height="22"/>
    <path class="cl" d="M10 178 L190 178"/>` },
  { w: 'மரம்', e: '🌳', en: 'tree', svg: `
    <path class="cr" d="M90 118 L110 118 L116 182 L84 182 Z"/>
    <circle class="cr" cx="66" cy="100" r="30"/>
    <circle class="cr" cx="134" cy="100" r="30"/>
    <circle class="cr" cx="100" cy="70" r="42"/>
    <circle class="cr" cx="86" cy="62" r="7"/>
    <circle class="cr" cx="118" cy="84" r="7"/>
    <path class="cl" d="M14 182 L186 182"/>` },
  { w: 'பூ', e: '🌸', en: 'flower', svg: `
    <rect class="cr" x="96" y="104" width="8" height="78"/>
    <ellipse class="cr" cx="122" cy="150" rx="20" ry="9" transform="rotate(-30 122 150)"/>
    <circle class="cr" cx="100" cy="50" r="22"/>
    <circle class="cr" cx="128" cy="71" r="22"/>
    <circle class="cr" cx="117" cy="104" r="22"/>
    <circle class="cr" cx="83" cy="104" r="22"/>
    <circle class="cr" cx="72" cy="71" r="22"/>
    <circle class="cr" cx="100" cy="80" r="17"/>` },
  { w: 'பட்டம்', e: '🪁', en: 'kite', svg: `
    <path class="cr" d="M100 18 L48 80 L100 80 Z"/>
    <path class="cr" d="M100 18 L152 80 L100 80 Z"/>
    <path class="cr" d="M48 80 L100 152 L100 80 Z"/>
    <path class="cr" d="M152 80 L100 152 L100 80 Z"/>
    <path class="cl" d="M100 152 Q80 166 100 176 Q120 186 100 196"/>
    <path class="cr" d="M96 166 L82 158 L82 174 Z"/>
    <path class="cr" d="M104 184 L118 176 L118 192 Z"/>` },
  { w: 'குடை', e: '☂️', en: 'umbrella', svg: `
    <path class="cl" d="M100 100 L100 170 Q100 184 86 178"/>
    <path class="cr" d="M100 100 L30 100 A70 70 0 0 1 65 39.4 Z"/>
    <path class="cr" d="M100 100 L65 39.4 A70 70 0 0 1 135 39.4 Z"/>
    <path class="cr" d="M100 100 L135 39.4 A70 70 0 0 1 170 100 Z"/>
    <circle class="cr" cx="100" cy="28" r="6"/>` }
];
// Tamil colour names come from the Colours topic (data.js), so they match the rest of the app.
const PAINT = { 'சிவப்பு': '#ef4444', 'நீலம்': '#3b82f6', 'பச்சை': '#22c55e', 'மஞ்சள்': '#facc15', 'ஆரஞ்சு': '#f97316',
  'ஊதா': '#a855f7', 'பழுப்பு': '#92400e', 'இளஞ்சிவப்பு': '#f9a8d4', 'கறுப்பு': '#1f2937', 'வெள்ளை': '#ffffff' };
const COL = { i: -1, colour: null, filled: new Set(), done: false };
(function buildPalette(){
  const words = TOPICS.find(t => t.id === 'colours').words;
  const box = $('#colPalette');
  words.forEach(([w, , en]) => {
    if (!PAINT[w]) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'swatch';
    b.style.setProperty('--sw', PAINT[w]); b.setAttribute('aria-label', `${w} — ${en}`); b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="ta">${w}</span>`;
    b.addEventListener('click', () => {
      COL.colour = PAINT[w]; $$('#colPalette .swatch').forEach(x => x.setAttribute('aria-pressed', x === b)); Rewards.sfx.tap(); speak(w);
    });
    box.appendChild(b);
  });
})();
function newPicture(step = 1){
  COL.i = (COL.i + step + PICS.length) % PICS.length; COL.filled = new Set(); COL.done = false;
  const P = PICS[COL.i];
  $('#colPic').innerHTML = `<svg viewBox="0 0 200 200" role="img" aria-label="${P.en}">${P.svg}</svg>`;
  $('#colEmoji').textContent = P.e; $('#colWord').textContent = P.w; $('#colMean').textContent = P.en;
  fb($('#colFb'), '');
  [...$('#colPic').querySelectorAll('.cr')].forEach((el, k) => el.addEventListener('click', () => fillPart(el, k)));
  if (!COL.colour) $('#colPalette .swatch')?.click();
}
function fillPart(el, k){
  if (!COL.colour) return;
  el.style.fill = COL.colour; Rewards.sfx.tick();
  COL.filled.add(k);
  if (!COL.done && COL.filled.size === $('#colPic').querySelectorAll('.cr').length){
    COL.done = true; Progress.track('coloured');
    const P = PICS[COL.i], r = Rewards.win($('#colPic'), { big: true, points: 20, after: () => speak(P.w) });
    fb($('#colFb'), `${r.ta} ${P.e} ${P.w}`, 'ok');
  }
}
$('#colWord').addEventListener('click', () => speak(PICS[COL.i].w));
$('#colClear').addEventListener('click', () => newPicture(0));
$('#colNext').addEventListener('click', () => newPicture(1));

document.addEventListener('lt:game', e => {
  if (e.detail === 'trace') renderTrace();
  if (e.detail === 'colour' && COL.i < 0) newPicture(1);
});
