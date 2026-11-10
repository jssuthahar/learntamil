/* Learn Tamil — 🎵 Rhymes, 🌺 Aathichoodi and 🪔 Festivals (in the Stories section),
   plus the Aathichoodi "line of the day" on the Today card.
   Uses (core/, story-reader.js): $, $$, speak, speakSentence, openStory, lettersOf, explain, sayLetter,
   stopReading, track, todayStr (rewards/today.js), Rewards, Progress. */
'use strict';

/* ---------- Stories · Rhymes · Festivals switch ---------- */
let storyKind = 'books';
function showKind(k){
  storyKind = k;
  stopRhyme(); stopReading();
  $$('#storyKinds .seg-btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.kind === k));
  $('#storyKinds').hidden = false;
  $('#shelfView').hidden = k !== 'books';
  $('#readerView').hidden = true;
  $('#rhymeShelf').hidden = k !== 'rhymes';
  $('#rhymeView').hidden = true;
  $('#festShelf').hidden = k !== 'festivals';
}
$$('#storyKinds .seg-btn').forEach(b => b.addEventListener('click', () => showKind(b.dataset.kind)));
// The story reader hides the switch; "← back" returns to the shelf it came from.
$('#shelf').addEventListener('click', e => { if (e.target.closest('.book')) $('#storyKinds').hidden = true; });
$('#backShelf').addEventListener('click', () => showKind(storyKind));

/* ---------- Rhymes ---------- */
const RH = { cur: null, singing: false };
RHYMES.forEach(r => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'book glass';
  b.innerHTML = `<div class="cover" aria-hidden="true">${r.ic}</div><div class="bt" lang="ta">${r.title}</div><div class="be">${r.en} · ${r.lines.length} lines</div><span class="badge">${r.by.split(' · ')[0]}</span>`;
  b.addEventListener('click', () => openRhyme(r));
  $('#rhymeList').appendChild(b);
});
function openRhyme(r){
  RH.cur = r;
  $('#rhymeShelf').hidden = true; $('#storyKinds').hidden = true; $('#rhymeView').hidden = false;
  $('#rhymeTitle').textContent = r.title; $('#rhymeBy').textContent = r.by;
  const box = $('#rhymeLines'); box.innerHTML = '';
  r.lines.forEach(([ta, en]) => {
    const line = document.createElement('div'); line.className = 'rline';
    const sp = document.createElement('span'); sp.className = 'sent'; sp.dataset.text = ta;
    let offset = 0;
    ta.split(' ').forEach(w => {
      const ws = document.createElement('span'); ws.className = 'w'; ws.textContent = w; ws.dataset.start = offset; offset += w.length + 1;
      ws.addEventListener('click', () => tapRhymeWord(w, ws));
      sp.append(ws, document.createTextNode(' '));
    });
    const e = document.createElement('small'); e.className = 'rline-en'; e.lang = 'en'; e.textContent = en; e.hidden = !$('#rhymeEn').checked;
    line.append(sp, e); box.appendChild(line);
  });
  $('#rhymeBd').innerHTML = '<span class="muted">Tap any word to hear it and see its letters</span>';
  window.scrollTo({ top: $('#app').offsetTop - 120, behavior: 'smooth' });
}
function tapRhymeWord(w, el){
  stopRhyme();
  $$('#rhymeLines .w.now').forEach(x => x.classList.remove('now')); el.classList.add('now');
  const clean = tamilOnly(w);
  speak(clean, () => el.classList.remove('now'));
  const bd = $('#rhymeBd'); bd.innerHTML = '';
  lettersOf(w).forEach((l, i) => {
    if (i){ const p = document.createElement('span'); p.className = 'plus'; p.textContent = '+'; bd.appendChild(p); }
    const c = document.createElement('button'); c.className = 'chip'; c.lang = 'ta'; c.type = 'button';
    c.innerHTML = `${l}<small>${explain(l)}</small>`;
    c.addEventListener('click', () => sayLetter(l, spokenForm(l)));
    bd.appendChild(c);
  });
}
function sing(){
  const lines = $$('#rhymeLines .sent'); let k = 0;
  RH.singing = true; $('#rhymeSing').innerHTML = `⏹ <span class="ta">${TEXT.stop[0]}</span> · ${TEXT.stop[1]}`;
  const step = () => {
    if (!RH.singing) return;
    if (k < lines.length){ lines[k].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); speakSentence(lines[k++], () => setTimeout(step, 450)); return; }
    stopRhyme();
    Rewards.sfx.win(); confetti(); Progress.track('rhyme', RH.cur.id);
    addStar(1);
  };
  step();
}
function stopRhyme(){
  if (!RH.singing) return;
  RH.singing = false;
  try { speechSynthesis.cancel(); } catch (e) {}
  $('#rhymeSing').innerHTML = `▶ <span class="ta">${TEXT.sing[0]}</span> · ${TEXT.sing[1]}`;
}
$('#rhymeSing').addEventListener('click', () => RH.singing ? stopRhyme() : sing());
$('#rhymeBack').addEventListener('click', () => showKind('rhymes'));
$('#rhymeEn').addEventListener('change', e => $$('#rhymeLines .rline-en').forEach(x => { x.hidden = !e.target.checked; }));
document.addEventListener('lt:section', e => { if (e.detail !== 'stories') stopRhyme(); });

/* ---------- Festivals ---------- */
FESTIVALS.forEach(f => {
  const card = document.createElement('div'); card.className = 'fest glass';
  card.innerHTML = `<div class="fest-top"><span class="cover" aria-hidden="true">${f.cover}</span><div><b lang="ta">${f.title}</b><small>${f.en}</small></div></div>
    <div class="fest-words">${f.words.map(([w, e, m]) => `<button class="fw" type="button" data-w="${w}"><span aria-hidden="true">${e}</span><b lang="ta">${w}</b><small>${m}</small></button>`).join('')}</div>
    <button class="btn primary fest-read" type="button">📖 <span class="ta">${TEXT.readStory[0]}</span> · ${TEXT.readStory[1]}</button>`;
  card.querySelectorAll('.fw').forEach(b => b.addEventListener('click', () => { sparkle(b); speak(b.dataset.w); }));
  card.querySelector('.fest-read').addEventListener('click', () => { $('#festShelf').hidden = true; $('#storyKinds').hidden = true; openStory(f); });
  $('#festList').appendChild(card);
});

/* ---------- Aathichoodi line of the day (Today card) ---------- */
(function(){
  const b = $('#lineOfDay'); if (!b) return;
  let h = 0; for (const c of todayStr() + 'ஆ') h = (h * 33 + c.charCodeAt(0)) >>> 0;
  const kind = AATHICHOODI.filter((_, i) => i !== 7 && i !== 12);   // the lines that speak to young children
  const [ta, en] = kind[h % kind.length];
  $('#lineTa').textContent = ta; $('#lineEn').textContent = en;
  b.addEventListener('click', () => { sparkle(b); speak(ta); });
})();
