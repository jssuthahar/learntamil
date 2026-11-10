/* Learn Tamil — 👶 Little ones mode (ages 3–5), at #/little.
   Pictures only: no English, big buttons, sound plays by itself, and no "wrong" buzzer —
   a wrong tap just shows and says the right picture again.
   Uses (core/ and features/rewards/): $, $$, uyir, speak, sayItem, sparkle, shuffle, rand, Rewards, Progress, addStar. */
'use strict';
const LT_THEMES = TEXT.littleThemes;   // data/messages.js
const LT = { theme: 'animals', mode: 'look', target: null, busy: false };
// Each card: { pic, word (what is shown and spoken), say(done) }
function ltCards(){
  if (LT.theme === 'vowels') return uyir.map(v => ({ pic: v.ex[0], word: v.l, big: true, say: done => sayItem(v, done) }));
  return TOPICS.find(t => t.id === LT.theme).words.map(([w, e]) => ({ pic: e, word: w, say: done => speak(w, done) }));
}
function ltRender(){
  $$('#ltThemes .lt-theme').forEach(b => b.setAttribute('aria-pressed', b.dataset.theme === LT.theme));
  $$('#little .lt-mode').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === LT.mode));
  $('#ltGrid').hidden = LT.mode !== 'look'; $('#ltFind').hidden = LT.mode !== 'find';
  if (LT.mode === 'look'){
    const g = $('#ltGrid'); g.innerHTML = '';
    ltCards().forEach((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'lt-card' + (c.big ? ' is-letter' : '');
      b.style.setProperty('--d', (i * 40) + 'ms');
      b.innerHTML = `<span class="lt-pic" aria-hidden="true">${c.pic}</span><b lang="ta">${c.word}</b>`;
      b.setAttribute('aria-label', c.word);
      b.addEventListener('click', () => { b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); sparkle(b); Rewards.sfx.tap(); c.say(); });
      g.appendChild(b);
    });
  } else ltFindNext();
}
function ltFindNext(){
  LT.busy = false;
  const all = ltCards();
  let t; do { t = all[rand(all.length)]; } while (LT.target && all.length > 1 && t.word === LT.target.word);
  LT.target = t;
  const opts = shuffle([t, ...shuffle(all.filter(c => c.word !== t.word)).slice(0, 2)]);
  const box = $('#ltOpts'); box.innerHTML = '';
  opts.forEach((c, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'lt-card' + (c.big ? ' is-letter' : '');
    b.style.setProperty('--d', (i * 90) + 'ms');
    b.innerHTML = `<span class="lt-pic" aria-hidden="true">${c.pic}</span>` + (c.big ? `<b lang="ta">${c.word}</b>` : '');
    b.setAttribute('aria-label', c.word);
    b.addEventListener('click', () => ltPick(c, b));
    box.appendChild(b);
  });
  setTimeout(() => t.say(), 450);
}
function ltPick(c, b){
  if (LT.busy) return;
  if (c === LT.target){
    LT.busy = true; b.classList.add('right');
    if (!c.big) b.insertAdjacentHTML('beforeend', `<b lang="ta">${c.word}</b>`);
    Rewards.cheer(b, false); addStar(1); Progress.track('correct'); Progress.track('little');
    setTimeout(() => c.say(() => setTimeout(ltFindNext, 700)), 500);
  } else {
    // No buzzer: gently show the right one and say it again.
    const right = [...$$('#ltOpts .lt-card')].find(x => x.getAttribute('aria-label') === LT.target.word);
    if (right){ right.classList.remove('hint'); void right.offsetWidth; right.classList.add('hint'); }
    LT.target.say();
  }
}
(function(){
  const box = $('#ltThemes');
  box.innerHTML = LT_THEMES.map(t => `<button class="lt-theme" type="button" data-theme="${t.id}" aria-pressed="false" aria-label="${t.label}"><span aria-hidden="true"${t.id === 'vowels' ? ' lang="ta"' : ''}>${t.ic}</span></button>`).join('');
  $$('#ltThemes .lt-theme').forEach(b => b.addEventListener('click', () => { LT.theme = b.dataset.theme; LT.target = null; Rewards.sfx.tap(); ltRender(); }));
  $$('#little .lt-mode').forEach(b => b.addEventListener('click', () => { LT.mode = b.dataset.mode; Rewards.sfx.tap(); ltRender(); }));
  $('#ltAsk').addEventListener('click', () => LT.target && LT.target.say());
})();
document.addEventListener('lt:section', e => {
  document.body.classList.toggle('little-on', e.detail === 'little');
  if (e.detail === 'little'){ ltRender(); if (LT.mode === 'look') setTimeout(() => speak(TEXT.littleHello), 300); }
});
