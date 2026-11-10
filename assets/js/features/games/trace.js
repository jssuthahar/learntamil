/* Learn Tamil — games: ✍️ trace a letter.
   The letter is drawn faintly; the child traces it. It counts when ~75% of the letter is covered, most ink is on the letter and it was not just scribbled over. */
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

document.addEventListener('lt:game', e => { if (e.detail === 'trace') renderTrace(); });
