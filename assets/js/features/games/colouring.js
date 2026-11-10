/* Learn Tamil — games: 🎨 colouring.
   Pick a colour (its Tamil name is spoken), tap parts of a picture to fill them. */
'use strict';

/* =====================================================================
   🎨 COLOURING — simple line pictures; each part with class "cr" can be filled.
   ===================================================================== */
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
  COL.i = (COL.i + step + PICTURES.length) % PICTURES.length; COL.filled = new Set(); COL.done = false;
  const P = PICTURES[COL.i];
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
    const P = PICTURES[COL.i], r = Rewards.win($('#colPic'), { big: true, points: 20, after: () => speak(P.w) });
    fb($('#colFb'), `${r.ta} ${P.e} ${P.w}`, 'ok');
  }
}
$('#colWord').addEventListener('click', () => speak(PICTURES[COL.i].w));
$('#colClear').addEventListener('click', () => newPicture(0));
$('#colNext').addEventListener('click', () => newPicture(1));

document.addEventListener('lt:game', e => { if (e.detail === 'colour' && COL.i < 0) newPicture(1); });
