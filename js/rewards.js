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
/* Kid-friendly instruments built from tones: xylophone, bell, bubble, cartoon boing / pop / whoosh. */
function xylo(freq, start, vol = 0.14, dur = 0.45){        // wooden xylophone: bright attack, quick decay
  tone(freq, start, dur, 'sine', vol); tone(freq * 4, start, dur * 0.25, 'sine', vol * 0.35); tone(freq * 10, start, 0.05, 'sine', vol * 0.08);
}
function bell(freq, start, vol = 0.09, dur = 1.1){          // soft glockenspiel bell that rings out
  tone(freq, start, dur, 'sine', vol); tone(freq * 2.76, start, dur * 0.5, 'sine', vol * 0.4); tone(freq * 5.4, start, dur * 0.25, 'sine', vol * 0.2);
}
function bubble(start, from = 280, to = 950, vol = 0.12, dur = 0.11){ tone(from, start, dur, 'sine', vol, to); }
function noise(start, dur, vol, fFrom, fTo, q = 1.2){      // filtered noise: pops and whooshes
  const a = audioCtx(); if (!a) return;
  const len = Math.ceil(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + start;
  src.buffer = buf; f.type = 'bandpass'; f.Q.value = q;
  f.frequency.setValueAtTime(fFrom, t); f.frequency.exponentialRampToValueAtTime(fTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(a.destination); src.start(t); src.stop(t + dur + 0.02);
}
function twinkle(start, n = 5, vol = 0.05){                 // fairy-dust sparkle on top of a win
  for (let i = 0; i < n; i++) bell(1568 + Math.random() * 1600, start + i * 0.06 + Math.random() * 0.03, vol, 0.4);
}
const C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5, E6 = 1318.5, G6 = 1568;
const SFX = {
  /* right answer: happy xylophone run + a little sparkle */
  correct(){ if (!sfxOn) return; [C5, E5, G5, C6].forEach((f, i) => xylo(f, i * 0.07)); twinkle(0.3, 3, 0.04); },
  /* 3 in a row: higher, faster run with a slide-whistle "whee!" */
  combo(){ if (!sfxOn) return; [G5, C6, E6, G6].forEach((f, i) => xylo(f, i * 0.055, 0.12)); tone(600, 0.24, 0.3, 'sine', 0.07, 1800); twinkle(0.4, 4); },
  /* round finished: ta-da fanfare with ringing bells */
  win(){ if (!sfxOn) return;
    [C5, E5, G5, C6, E6].forEach((f, i) => xylo(f, i * 0.08));
    [C5, E5, G5, C6].forEach(f => bell(f, 0.48, 0.06, 1.4));
    twinkle(0.55, 7); },
  /* wrong answer: soft, silly "boing" — never scary */
  wrong(){ if (!sfxOn) return; tone(420, 0, 0.12, 'sine', 0.1, 300); tone(300, 0.11, 0.26, 'sine', 0.09, 200); tone(200, 0.11, 0.26, 'triangle', 0.03, 140); },
  /* letter placed: one bright xylophone note */
  tick(){ if (!sfxOn) return; xylo(C6, 0, 0.1, 0.3); },
  /* tab, button or card tap: a water bubble "bloop" */
  tap(){ if (!sfxOn) return; bubble(0); },
  click(){ if (!sfxOn) return; xylo(1760, 0, 0.05, 0.08); },
  /* memory card turns over: swish + bloop */
  flip(){ if (!sfxOn) return; noise(0, 0.14, 0.05, 900, 3500, 0.8); bubble(0.05, 400, 1100, 0.07, 0.09); },
  /* story page turn: paper swoosh */
  page(){ if (!sfxOn) return; noise(0, 0.28, 0.06, 3000, 700, 0.6); },
  /* tokens: two-note coin ding */
  coin(){ if (!sfxOn) return; tone(988, 0, 0.09, 'square', 0.035); tone(1319, 0.08, 0.35, 'square', 0.035); bell(1319, 0.08, 0.05, 0.5); },
  spinStart(){ if (!sfxOn) return; tone(300, 0, 0.45, 'sine', 0.08, 1200); noise(0, 0.4, 0.04, 600, 4000, 0.7); },
  landed(){ if (!sfxOn) return; bell(A5, 0, 0.09, 0.6); bell(E6, 0.1, 0.08, 0.8); },
  /* balloon: cartoon pop */
  pop(){ if (!sfxOn) return; noise(0, 0.08, 0.16, 2500, 600, 0.9); tone(900, 0, 0.09, 'sine', 0.08, 200); },
  /* new badge: magic shimmer, then the fanfare */
  badge(){ if (!sfxOn) return; for (let i = 0; i < 10; i++) bell(G5 * Math.pow(2, i / 7), i * 0.045, 0.045, 0.5); setTimeout(() => SFX.win(), 420); },
  /* Kili levels up: slide-whistle rise + fanfare */
  levelUp(){ if (!sfxOn) return; tone(400, 0, 0.5, 'sine', 0.08, 1600); setTimeout(() => SFX.win(), 450); }
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

/* Little taps everywhere: tabs and menu make a bubble, story pages swish. */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('.tab, .nav-item, #prev, #next, #again');
  if (!t || t.disabled) return;
  if (t.matches('#prev, #next, #again')) SFX.page(); else SFX.tap();
});

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
  { id: 'day3',     ic: '🔥', ta: '3 நாள் தொடர்ச்சி',          en: 'Learned 3 days in a row',             ok: p => p.bestDays >= 3 },
  { id: 'day7',     ic: '📆', ta: '7 நாள் தொடர்ச்சி',          en: 'Learned 7 days in a row',             ok: p => p.bestDays >= 7 },
  { id: 'goal',     ic: '🎯', ta: 'இன்றைய இலக்கு',            en: 'Finished a daily goal',               ok: p => !!p.goalDay },
  { id: 'cert1',    ic: '🎓', ta: 'முதல் சான்றிதழ்',           en: 'Earned your first certificate',       ok: p => Object.keys(p.certs || {}).length >= 1 },
  { id: 'cert5',    ic: '👑', ta: '5 சான்றிதழ்கள்',            en: 'Earned 5 certificates',               ok: p => Object.keys(p.certs || {}).length >= 5 },
  { id: 'cert10',   ic: '🏆', ta: '10 சான்றிதழ்களும்',         en: 'Earned all 10 certificates',          ok: p => Object.keys(p.certs || {}).length >= 10 }
];
const DEFAULT = () => ({ tokens: 0, tokensEver: 0, correct: 0, bestStreak: 0, letters: [], words: 0, stories: [],
  memoryWins: 0, balloonBest: 0, built: 0, spins: 0, badges: [], certs: {},
  day: '', today: 0, goalDay: '', streakDays: 0, bestDays: 0, stage: 0, since: new Date().toISOString().slice(0, 10) });

const Progress = {
  d: DEFAULT(),
  load(){
    try {
      const raw = localStorage.getItem('lt-progress');
      if (raw) this.d = Object.assign(DEFAULT(), JSON.parse(raw));
      else { const old = parseInt(localStorage.getItem('lt-stars'), 10) || 0; this.d.tokens = this.d.tokensEver = old; }   // earlier ⭐ stars become tokens
    } catch (e) {}
    this.paint(false);   // the Today card is painted at the end of this file
  },
  save(){ try { localStorage.setItem('lt-progress', JSON.stringify(this.d)); } catch (e) {} },
  paint(bump){
    const n = document.getElementById('starN'); if (n) n.textContent = this.d.tokens;
    if (bump){ const c = document.getElementById('stars'); if (c){ c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } }
  },
  addTokens(n){ if (!n) return; this.d.tokens += n; this.d.tokensEver += n; this.save(); this.paint(true); this.check(); this.grow(); },
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
    if (what !== 'streak') this.activity();
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
  /* ---- day streak and daily goal ---- */
  rollDay(){
    const t = todayStr(); if (this.d.day === t) return;
    if (this.d.day !== dayStr(-1)) this.d.streakDays = 0;
    this.d.today = 0;
  },
  activity(){
    const d = this.d, t = todayStr();
    if (d.day !== t){ this.rollDay(); d.streakDays += 1; d.day = t; d.bestDays = Math.max(d.bestDays, d.streakDays); }
    d.today++;
    if (d.today >= GOAL && d.goalDay !== t){
      d.goalDay = t; this.save();
      setTimeout(() => celebrate('🎯', 'இன்றைய இலக்கு முடிந்தது!', `Daily goal done! ${GOAL} things learned today · +10 🪙`), 1400);
      setTimeout(() => this.addTokens(10), 1500);
    }
    paintToday();
  },
  /* ---- Kili grows with every token earned ---- */
  grow(){
    const st = stageOf(this.d.tokensEver);
    if (st > this.d.stage){
      this.d.stage = st; this.save();
      const S = STAGES[st];
      setTimeout(() => celebrate(S.ic, 'நிலை உயர்ந்தது! · Level up!', `Kili is now ${S.ta} · ${S.en} (Level ${st + 1})`), 2200);
    }
    paintToday();
  },
  reset(){ this.d = DEFAULT(); setTimeout(paintToday); this.save(); this.paint(true); try { Object.keys(localStorage).filter(k => k.startsWith('lt-best-')).forEach(k => localStorage.removeItem(k)); } catch (e) {} Score.render(true); }
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
    SFX.badge(); confetti();
    setTimeout(() => speak('வாழ்த்துகள்!'), 1100);
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


/* =====================================================================
   TODAY CARD: greeting, Kili's level, daily goal, streak, letter of the day
   ===================================================================== */
const GOAL = 10;
const STAGES = [
  { at: 0,   ic: '🥚', ta: 'முட்டை',            en: 'Egg' },
  { at: 25,  ic: '🐣', ta: 'குஞ்சு',             en: 'Hatchling' },
  { at: 75,  ic: '🐥', ta: 'சிறு பறவை',          en: 'Little bird' },
  { at: 150, ic: '🦜', ta: 'கிளி',               en: 'Parrot' },
  { at: 300, ic: '🌟', ta: 'நட்சத்திரக் கிளி',    en: 'Star parrot' },
  { at: 500, ic: '👑', ta: 'அரசக் கிளி',          en: 'Royal parrot' }
];
function stageOf(xp){ return STAGES.reduce((s, x, i) => xp >= x.at ? i : s, 0); }
function pad2(n){ return String(n).padStart(2, '0'); }
function dayStr(off = 0){ const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function todayStr(){ return dayStr(0); }

function celebrate(icon, ta, en){
  const el = document.createElement('div');
  el.className = 'badge-pop'; el.setAttribute('role', 'status');
  el.innerHTML = `<div class="bp-card"><span class="bp-ic" aria-hidden="true">${icon}</span><b lang="ta">${ta}</b><small>${en}</small><span class="bp-wow" lang="ta">வாழ்த்துகள்! 🎉</span></div>`;
  document.body.appendChild(el);
  SFX.levelUp(); confetti(); setTimeout(() => speak('வாழ்த்துகள்!'), 1100);
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
  el.addEventListener('click', close); setTimeout(close, 3400);
}

/* Letter of the day: the same letter for everyone on a given date. */
function letterOfDay(){
  const all = [...uyir, ...mei, ...aytham, ...uyirmei.flat()];
  let h = 0; for (const c of todayStr()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return all[h % all.length];
}
function paintToday(){
  const box = document.getElementById('today'); if (!box) return;
  const d = Progress.d, st = stageOf(d.tokensEver), S = STAGES[st], N = STAGES[st + 1];
  let name = ''; try { name = (localStorage.getItem('lt-cert-name') || '').split(' ')[0]; } catch (e) {}
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('kiliStage', S.ic);
  set('todayHi', name ? `வணக்கம், ${name}! 👋` : 'வணக்கம்! 👋');
  set('todayStage', `Level ${st + 1} · ${S.ta} · ${S.en}`);
  const bar = document.getElementById('lvlBar');
  if (N){ bar.style.width = Math.min(100, (d.tokensEver - S.at) / (N.at - S.at) * 100) + '%'; set('lvlNext', `${N.at - d.tokensEver} 🪙 more to grow into ${N.ic} ${N.en}`); }
  else { bar.style.width = '100%'; set('lvlNext', 'Top level reached — amazing! 🎉'); }
  const today = d.day === todayStr() ? d.today : 0;
  set('goalN', Math.min(today, GOAL));
  document.getElementById('goalRing').style.setProperty('--p', Math.min(1, today / GOAL));
  set('streakN', (d.day === todayStr() || d.day === dayStr(-1)) ? d.streakDays : 0);
  set('todayGoal', today >= GOAL ? '🎯 Today’s goal done! Come back tomorrow to keep your streak 🔥'
                                 : `🎯 Today’s goal: learn ${GOAL} things — ${GOAL - today} to go!`);
  set('lotdL', letterOfDay().l);
}
(function(){
  const b = document.getElementById('lotd'); if (!b) return;
  b.addEventListener('click', () => {
    const L = letterOfDay();
    const tab = L.fam === 'uyir' ? 'uyir' : L.fam === 'mei' ? 'mei' : L.fam === 'ay' ? 'aytham' : 'uyirmei';
    if (L.fam === 'um'){ bC = L.ci; bV = VOWELS.indexOf(L.vowel); renderBuilder(); }
    if (location.hash !== '#/' + tab) location.hash = '/' + tab;
    setTimeout(() => { play(L); document.getElementById('player').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 250);
  });
})();
Progress.rollDay(); paintToday();
