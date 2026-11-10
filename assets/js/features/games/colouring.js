/* Learn Tamil — games: 🎨 colouring.
   Pick a colour (its Tamil name is spoken), tap parts of a picture to fill them. */
'use strict';

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
// Tamil colour names come from the Colours topic (data/words.js), so they match the rest of the app.
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

document.addEventListener('lt:game', e => { if (e.detail === 'colour' && COL.i < 0) newPicture(1); });
