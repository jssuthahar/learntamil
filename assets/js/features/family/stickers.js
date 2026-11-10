/* Learn Tamil — family: 📒 sticker book.
   One new picture sticker for every 10 tokens earned. */
'use strict';

/* =====================================================================
   📒 STICKER BOOK — one new picture sticker for every 10 tokens earned
   ===================================================================== */
const STICKERS = (() => {
  const seen = new Set(), out = [];
  ['animals', 'birds', 'food', 'vehicles', 'shapes'].forEach(id => TOPICS.find(t => t.id === id).words.forEach(([w, e]) => {
    if (!seen.has(w)){ seen.add(w); out.push([e, w]); }
  }));
  WORDS.forEach(([w, e]) => { if (!seen.has(w) && /[\u{1F300}-\u{1FAFF}]/u.test(e)){ seen.add(w); out.push([e, w]); } });
  return out;
})();
const PER_STICKER = 10;
const stickersEarned = () => Math.min(STICKERS.length, Math.floor(Progress.d.tokensEver / PER_STICKER));
function checkStickers(quiet){
  const d = Progress.d, n = stickersEarned();
  if (n <= (d.stickers || 0)) return;
  const from = d.stickers || 0; d.stickers = n; Progress.save();
  if (quiet) return;
  const [e, w] = STICKERS[n - 1];
  setTimeout(() => {
    const t = document.createElement('button'); t.type = 'button'; t.className = 'sticker-toast';
    t.innerHTML = `<span class="st-pic" aria-hidden="true">${e}</span><span><small>📒 New sticker! · <span lang="ta">புதிய ஸ்டிக்கர்!</span></small><b lang="ta">${w}</b></span>`;
    t.onclick = () => { t.remove(); openStickers(); };
    document.body.appendChild(t);
    Rewards.sfx.coin();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 4200);
  }, from ? 900 : 2600);
}
const _addTokens = Progress.addTokens.bind(Progress);
Progress.addTokens = n => { _addTokens(n); checkStickers(false); };
checkStickers(true);   // stickers already earned before this feature existed: unlock quietly

function openStickers(){
  const n = stickersEarned(), left = PER_STICKER - (Progress.d.tokensEver % PER_STICKER);
  const d = famDialog('stickerDlg', `
    <div class="rw-head"><h2>📒 <span lang="ta">என் ஸ்டிக்கர் புத்தகம்</span> · My sticker book</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
    <p class="st-progress"><b>${n} / ${STICKERS.length}</b> stickers · ${n < STICKERS.length ? `next one in <b>${left} 🪙</b>` : 'the book is full — amazing! 🎉'}</p>
    <div class="st-grid">${STICKERS.map(([e, w], i) => i < n
      ? `<button class="st on" type="button" data-w="${w}"><span aria-hidden="true">${e}</span><b lang="ta">${w}</b></button>`
      : `<div class="st" aria-label="Locked sticker"><span aria-hidden="true">❔</span></div>`).join('')}</div>
    <p class="rw-note">Earn 🪙 tokens in games, reading and stories to fill your book. Tap a sticker to hear its name.</p>`);
  d.querySelectorAll('.st.on').forEach(b => b.onclick = () => { sparkle(b); speak(b.dataset.w); });
}
