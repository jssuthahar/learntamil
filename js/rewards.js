/* Learn Tamil — rewards for games: appreciation sounds, celebration animation and score.
   Sounds are generated with the Web Audio API (no files, works offline).
   Uses helpers from app.js: $, speak, sparkle, confetti, calm. */
'use strict';

/* ---------- sound effects ---------- */
let sfxOn = true;
try { sfxOn = localStorage.getItem('lt-sfx') !== '0'; } catch (e) {}
let actx = null;
function audioCtx(){
  if (!actx){ const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; actx = new AC(); }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(freq, start, dur, type = 'sine', vol = 0.16, slideTo = 0){
  const a = audioCtx(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(a.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
const SFX = {
  correct(){ if (!sfxOn) return; [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.07, 0.28, 'triangle', 0.15)); },
  combo(){ if (!sfxOn) return; [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => tone(f, i * 0.06, 0.22, 'triangle', 0.13)); },
  win(){ if (!sfxOn) return;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.15));
    [523.25, 659.25, 783.99].forEach(f => tone(f, 0.5, 0.7, 'sine', 0.1)); },
  wrong(){ if (!sfxOn) return; tone(330, 0, 0.16, 'sine', 0.11, 260); tone(262, 0.14, 0.22, 'sine', 0.09, 220); },
  tick(){ if (!sfxOn) return; tone(1046.5, 0, 0.09, 'triangle', 0.08); },
  pop(){ if (!sfxOn) return; tone(700, 0, 0.12, 'square', 0.06, 180); tone(1400, 0.02, 0.06, 'triangle', 0.05); }
};

/* ---------- praise ---------- */
const PRAISES = [
  ['அருமை!', 'Excellent!'], ['நன்று!', 'Good job!'], ['மிகவும் நன்று!', 'Very good!'],
  ['சரியான விடை!', 'Correct answer!'], ['மிகச் சிறப்பு!', 'Superb!']
];
const BIG_PRAISES = [['அருமை!', 'Excellent!'], ['மிகச் சிறப்பு!', 'Superb!']];
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- celebration pop-up ---------- */
function popup(ta, en, emoji, big){
  const el = document.createElement('div');
  el.className = 'cheer' + (big ? ' big' : '');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<span class="ch-bird">🦜</span><span class="ch-emo">${emoji}</span><b lang="ta">${ta}</b><small>${en}</small>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), big ? 1900 : 1300);
}
function flyPoints(fromEl, text){
  const target = document.getElementById('sbScore');
  if (!fromEl || !target || calm) return;
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  const s = document.createElement('span'); s.className = 'fly-pts'; s.textContent = text;
  document.body.appendChild(s);
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
  s.animate([
    { transform: `translate(${x0}px,${y0}px) translate(-50%,-50%) scale(.6)`, opacity: 0 },
    { transform: `translate(${x0}px,${y0 - 50}px) translate(-50%,-50%) scale(1.3)`, opacity: 1, offset: 0.3 },
    { transform: `translate(${x1}px,${y1}px) translate(-50%,-50%) scale(.7)`, opacity: 0.2 }
  ], { duration: 900, easing: 'cubic-bezier(.3,.7,.3,1)' }).onfinish = () => s.remove();
}

/* ---------- score ---------- */
const Score = {
  game: 'build', score: 0, streak: 0, shown: 0,
  best(g = this.game){ try { return +localStorage.getItem('lt-best-' + g) || 0; } catch (e) { return 0; } },
  saveBest(){ try { if (this.score > this.best()) localStorage.setItem('lt-best-' + this.game, this.score); } catch (e) {} },
  reset(game){ this.game = game; this.score = 0; this.streak = 0; this.render(true); },
  render(instant){
    const sEl = document.getElementById('sbScore'); if (!sEl) return;
    document.getElementById('sbStreak').textContent = this.streak;
    document.getElementById('sbBest').textContent = Math.max(this.best(), this.score);
    const from = this.shown, to = this.score; this.shown = to;
    if (instant || calm || from === to){ sEl.textContent = to; return; }
    const t0 = performance.now();
    const step = t => { const k = Math.max(0, Math.min(1, (t - t0) / 450)); sEl.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    const box = sEl.closest('.sb-item'); box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump');
  }
};

/* Right answer. opts: points (10), big (round finished), quiet (no pop-up / no spoken praise),
   say (speak the praise, default true), after (callback once the praise has been spoken). */
function rewardWin(el, opts = {}){
  const { points = 10, big = false, quiet = false, say = true, after } = opts;
  Score.streak++;
  const combo = Score.streak > 0 && Score.streak % 3 === 0;
  const gain = points + (combo ? 5 : 0);
  Score.score += gain; Score.saveBest(); Score.render();
  Progress.addTokens((big ? 5 : 1) + (combo ? 1 : 0));
  Progress.track('correct'); Progress.track('streak', Score.streak);
  flyPoints(el, '+' + gain + (combo ? ' 🔥' : ''));
  if (el) sparkle(el);
  const [ta, en] = big ? pick(BIG_PRAISES) : pick(PRAISES);
  if (big){ SFX.win(); confetti(); } else if (combo) SFX.combo(); else SFX.correct();
  if (!quiet) popup(combo && !big ? `${ta} 🔥×${Score.streak}` : ta, combo && !big ? `${en} ${Score.streak} in a row!` : en, big ? '🏆' : pick(['🌟', '👏', '🎉', '⭐']), big);
  if (!quiet && say){ setTimeout(() => speak(ta, after), 250); }
  else if (after) setTimeout(after, 400);
  return { ta, en, gain };
}
/* Wrong answer: gentle sound, streak back to zero. */
function rewardMiss(){
  Score.streak = 0; Score.render(true);
  SFX.wrong();
}
/* A small appreciation outside games (e.g. reading practice): sound + pop-up, no score. */
function rewardCheer(el, say = true){
  const [ta, en] = pick(PRAISES);
  SFX.correct(); popup(ta, en, pick(['🌟', '👏', '🎉', '⭐']), false); if (el) sparkle(el);
  if (say) setTimeout(() => speak(ta), 250);
  return ta;
}
const Rewards = { win: rewardWin, miss: rewardMiss, cheer: rewardCheer, sfx: SFX, score: Score,
  setSound(on){ sfxOn = on; try { localStorage.setItem('lt-sfx', on ? '1' : '0'); } catch (e) {} } };

/* Sound on/off button in the scoreboard */
(function(){
  const b = document.getElementById('sfxBtn'); if (!b) return;
  const paint = () => { b.textContent = sfxOn ? '🔊' : '🔇'; b.setAttribute('aria-pressed', String(sfxOn)); b.setAttribute('aria-label', sfxOn ? 'Game sounds on — tap to mute' : 'Game sounds off — tap to turn on'); };
  paint();
  b.addEventListener('click', () => { Rewards.setSound(!sfxOn); paint(); if (sfxOn) SFX.tick(); });
})();


/* =====================================================================
   SAVED PROGRESS, TOKENS 🪙 AND BADGES 🏅
   Everything is stored only in this browser (localStorage "lt-progress").
   ===================================================================== */
const ALL_VOWELS = VOWELS.map(v => v.l), ALL_MEI = CONS.map(k => k.c + PULLI);
const BADGES = [
  { id: 'first',    ic: '🌱', ta: 'முதல் அடி',              en: 'First step — first right answer',     ok: p => p.correct >= 1 },
  { id: 'c10',      ic: '⭐', ta: '10 சரியான விடைகள்',       en: '10 right answers',                    ok: p => p.correct >= 10 },
  { id: 'c50',      ic: '🌟', ta: '50 சரியான விடைகள்',       en: '50 right answers',                    ok: p => p.correct >= 50 },
  { id: 'c100',     ic: '🏆', ta: '100 சரியான விடைகள்',      en: '100 right answers',                   ok: p => p.correct >= 100 },
  { id: 'streak5',  ic: '🔥', ta: 'தொடர்ந்து 5 சரி',          en: '5 right in a row',                    ok: p => p.bestStreak >= 5 },
  { id: 'streak10', ic: '🚀', ta: 'தொடர்ந்து 10 சரி',         en: '10 right in a row',                   ok: p => p.bestStreak >= 10 },
  { id: 'vowels',   ic: '🔤', ta: '12 உயிர் எழுத்துகள்',      en: 'Heard all 12 vowels',                 ok: p => ALL_VOWELS.every(l => p.letters.includes(l)) },
  { id: 'mei',      ic: '🧱', ta: '18 மெய் எழுத்துகள்',       en: 'Heard all 18 consonants',             ok: p => ALL_MEI.every(l => p.letters.includes(l)) },
  { id: 'l50',      ic: '🧭', ta: '50 எழுத்துகள்',           en: 'Heard 50 different letters',          ok: p => p.letters.length >= 50 },
  { id: 'l247',     ic: '👑', ta: '247 எழுத்துகள்',          en: 'Heard all 247 letters',               ok: p => p.letters.length >= 247 },
  { id: 'read10',   ic: '📖', ta: '10 சொற்கள் படித்தாய்',      en: 'Read 10 words',                       ok: p => p.words >= 10 },
  { id: 'story1',   ic: '📚', ta: 'ஒரு கதை முடித்தாய்',        en: 'Finished a story',                    ok: p => p.stories.length >= 1 },
  { id: 'story5',   ic: '🏰', ta: '5 கதைகளும் முடித்தாய்',     en: 'Finished all 5 stories',              ok: p => p.stories.length >= 5 },
  { id: 'memory',   ic: '🃏', ta: 'நினைவாற்றல்',              en: 'Memory master — finished a Memory game', ok: p => p.memoryWins >= 1 },
  { id: 'balloon',  ic: '🎈', ta: '10 பலூன்கள் உடைத்தாய்',     en: 'Popped 10 balloons in one game',      ok: p => p.balloonBest >= 10 },
  { id: 'builder',  ic: '🧩', ta: '5 சொற்கள் அமைத்தாய்',       en: 'Built 5 words',                       ok: p => p.built >= 5 },
  { id: 'spin',     ic: '🎡', ta: 'சக்கர நட்சத்திரம்',          en: 'Spin star — 5 right on the wheel',    ok: p => p.spins >= 5 },
  { id: 't100',     ic: '🪙', ta: '100 நாணயங்கள்',           en: 'Collected 100 tokens',                ok: p => p.tokensEver >= 100 },
  { id: 'cert1',    ic: '🎓', ta: 'முதல் சான்றிதழ்',           en: 'Earned your first certificate',       ok: p => Object.keys(p.certs || {}).length >= 1 },
  { id: 'cert5',    ic: '👑', ta: '5 சான்றிதழ்களும்',          en: 'Earned all 5 certificates',           ok: p => Object.keys(p.certs || {}).length >= 5 }
];
const DEFAULT = () => ({ tokens: 0, tokensEver: 0, correct: 0, bestStreak: 0, letters: [], words: 0, stories: [],
  memoryWins: 0, balloonBest: 0, built: 0, spins: 0, badges: [], certs: {}, since: new Date().toISOString().slice(0, 10) });

const Progress = {
  d: DEFAULT(),
  load(){
    try {
      const raw = localStorage.getItem('lt-progress');
      if (raw) this.d = Object.assign(DEFAULT(), JSON.parse(raw));
      else { const old = parseInt(localStorage.getItem('lt-stars'), 10) || 0; this.d.tokens = this.d.tokensEver = old; }   // earlier ⭐ stars become tokens
    } catch (e) {}
    this.paint(false);
  },
  save(){ try { localStorage.setItem('lt-progress', JSON.stringify(this.d)); } catch (e) {} },
  paint(bump){
    const n = document.getElementById('starN'); if (n) n.textContent = this.d.tokens;
    if (bump){ const c = document.getElementById('stars'); if (c){ c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } }
  },
  addTokens(n){ if (!n) return; this.d.tokens += n; this.d.tokensEver += n; this.save(); this.paint(true); this.check(); },
  track(what, v){
    const d = this.d;
    if (what === 'correct') d.correct++;
    else if (what === 'streak') d.bestStreak = Math.max(d.bestStreak, v || 0);
    else if (what === 'letter'){ if (!d.letters.includes(v)) d.letters.push(v); else return; }
    else if (what === 'word') d.words++;
    else if (what === 'story'){ if (!d.stories.includes(v)){ d.stories.push(v); this.addTokens(5); } else return; }
    else if (what === 'memory') d.memoryWins++;
    else if (what === 'balloon') d.balloonBest = Math.max(d.balloonBest, v || 0);
    else if (what === 'built') d.built++;
    else if (what === 'spin') d.spins++;
    this.save(); this.check();
  },
  check(){
    const fresh = BADGES.filter(b => !this.d.badges.includes(b.id) && b.ok(this.d));
    if (!fresh.length) return;
    fresh.forEach(b => this.d.badges.push(b.id));
    this.d.tokens += 10 * fresh.length; this.d.tokensEver += 10 * fresh.length;   // badge bonus
    this.save(); this.paint(true);
    fresh.forEach(b => badgeQueue.push(b)); if (!badgeShowing) nextBadge();
  },
  reset(){ this.d = DEFAULT(); this.save(); this.paint(true); try { Object.keys(localStorage).filter(k => k.startsWith('lt-best-')).forEach(k => localStorage.removeItem(k)); } catch (e) {} Score.render(true); }
};

/* ---------- "New badge!" celebration (one at a time) ---------- */
const badgeQueue = []; let badgeShowing = false;
function nextBadge(){
  const b = badgeQueue.shift(); if (!b){ badgeShowing = false; return; }
  badgeShowing = true;
  setTimeout(() => {
    const el = document.createElement('div');
    el.className = 'badge-pop'; el.setAttribute('role', 'status');
    el.innerHTML = `<div class="bp-card"><span class="bp-ribbon">🏅 புதிய பதக்கம்! · New badge!</span><span class="bp-ic" aria-hidden="true">${b.ic}</span><b lang="ta">${b.ta}</b><small>${b.en}</small><span class="bp-tok">+10 🪙</span><span class="bp-wow" lang="ta">வாழ்த்துகள்! 🎉</span></div>`;
    document.body.appendChild(el);
    SFX.win(); confetti();
    setTimeout(() => speak('வாழ்த்துகள்!'), 500);
    const close = () => { el.classList.add('out'); setTimeout(() => { el.remove(); nextBadge(); }, 300); };
    el.addEventListener('click', close);
    setTimeout(close, 3200);
  }, 1500);   // let the answer's own celebration finish first
}

/* ---------- "My rewards" panel ---------- */
function openRewards(){
  const d = Progress.d;
  let dlg = document.getElementById('rewardsDlg');
  if (!dlg){
    dlg = document.createElement('dialog'); dlg.id = 'rewardsDlg'; dlg.className = 'rewards-dlg';
    dlg.setAttribute('aria-labelledby', 'rwTitle');
    document.body.appendChild(dlg);
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }
  const stat = (ic, n, label) => `<div class="rw-stat"><span aria-hidden="true">${ic}</span><b>${n}</b><small>${label}</small></div>`;
  const got = BADGES.filter(b => d.badges.includes(b.id)).length;
  dlg.innerHTML = `
    <div class="rw-head"><h2 id="rwTitle">🏅 <span lang="ta">என் பரிசுகள்</span> · My rewards</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
    <div class="rw-tokens"><span class="rw-coin" aria-hidden="true">🪙</span><div><b>${d.tokens}</b><small>tokens · <span lang="ta">நாணயங்கள்</span></small></div></div>
    <div class="rw-stats">
      ${stat('✅', d.correct, 'Right answers')}${stat('🔥', d.bestStreak, 'Best streak')}
      ${stat('🔤', `${d.letters.length}/247`, 'Letters heard')}${stat('📖', d.words, 'Words read')}
      ${stat('📚', `${d.stories.length}/5`, 'Stories finished')}${stat('🧩', d.built, 'Words built')}
    </div>
    <h3>Badges <small>${got} / ${BADGES.length}</small></h3>
    <div class="rw-badges">${BADGES.map(b => { const on = d.badges.includes(b.id);
      return `<div class="rw-badge ${on ? 'on' : ''}" title="${b.en}"><span aria-hidden="true">${on ? b.ic : '🔒'}</span><b lang="ta">${b.ta}</b><small>${b.en}</small></div>`; }).join('')}</div>
    <p class="rw-note">Saved only on this device. <button class="rw-reset" type="button">Reset progress</button></p>`;
  dlg.querySelector('.rw-x').onclick = () => dlg.close();
  dlg.querySelector('.rw-reset').onclick = () => {
    if (confirm('Reset all tokens, badges and scores on this device?')){ Progress.reset(); openRewards(); }
  };
  if (typeof dlg.showModal === 'function'){ if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
}
const chip = document.getElementById('stars');
if (chip) chip.addEventListener('click', openRewards);
Progress.load();
