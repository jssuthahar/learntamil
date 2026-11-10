/* Learn Tamil — rewards: saved progress, tokens 🪙, badges 🏅 and the "My rewards" panel.
   Saved per child with Profiles (core/profiles.js); nothing leaves the device. */
'use strict';

// Shortcuts used across features: give tokens, record what was learned.
function addStar(n = 1){ if (typeof Progress !== 'undefined') Progress.addTokens(n); }
const track = (what, v)=>{ if (typeof Progress !== 'undefined') Progress.track(what, v); if (what === 'story') logEv('story_complete', { story: String(v) }); };

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
  { id: 'story5',   ic: '🏰', ta: '5 கதைகளும் முடித்தாய்',     en: 'Finished all 5 stories',              ok: p => STORIES.every(s => p.stories.includes(s.id)) },
  { id: 'memory',   ic: '🃏', ta: 'நினைவாற்றல்',              en: 'Memory master — finished a Memory game', ok: p => p.memoryWins >= 1 },
  { id: 'balloon',  ic: '🎈', ta: '10 பலூன்கள் உடைத்தாய்',     en: 'Popped 10 balloons in one game',      ok: p => p.balloonBest >= 10 },
  { id: 'builder',  ic: '🧩', ta: '5 சொற்கள் அமைத்தாய்',       en: 'Built 5 words',                       ok: p => p.built >= 5 },
  { id: 'spin',     ic: '🎡', ta: 'சக்கர நட்சத்திரம்',          en: 'Spin star — 5 right on the wheel',    ok: p => p.spins >= 5 },
  { id: 't100',     ic: '🪙', ta: '100 நாணயங்கள்',           en: 'Collected 100 tokens',                ok: p => p.tokensEver >= 100 },
  { id: 'day3',     ic: '🔥', ta: '3 நாள் தொடர்ச்சி',          en: 'Learned 3 days in a row',             ok: p => p.bestDays >= 3 },
  { id: 'day7',     ic: '📆', ta: '7 நாள் தொடர்ச்சி',          en: 'Learned 7 days in a row',             ok: p => p.bestDays >= 7 },
  { id: 'goal',     ic: '🎯', ta: 'இன்றைய இலக்கு',            en: 'Finished a daily goal',               ok: p => !!p.goalDay },
  { id: 'trace5',   ic: '✍️', ta: '5 எழுத்துகள் எழுதினாய்',    en: 'Traced 5 different letters',          ok: p => (p.traced || []).length >= 5 },
  { id: 'say5',     ic: '🎤', ta: '5 முறை சொன்னாய்',          en: 'Said 5 letters or words aloud',       ok: p => (p.said || 0) >= 5 },
  { id: 'rhyme',    ic: '🎵', ta: 'பாடல் பாடினாய்',            en: 'Sang along to a rhyme',               ok: p => (p.rhymes || []).length >= 1 },
  { id: 'colour',   ic: '🎨', ta: 'வண்ணம் தீட்டினாய்',          en: 'Coloured a whole picture',            ok: p => (p.coloured || 0) >= 1 },
  { id: 'cert1',   ic: '🎓', ta: 'முதல் சான்றிதழ்',           en: 'Earned your first certificate',       ok: p => Object.keys(p.certs || {}).length >= 1 },
  { id: 'cert5',    ic: '👑', ta: '5 சான்றிதழ்கள்',            en: 'Earned 5 certificates',               ok: p => Object.keys(p.certs || {}).length >= 5 },
  { id: 'cert10',   ic: '🏆', ta: '10 சான்றிதழ்களும்',         en: 'Earned all 10 certificates',          ok: p => Object.keys(p.certs || {}).length >= 10 }
];
const DEFAULT = () => ({ tokens: 0, tokensEver: 0, correct: 0, bestStreak: 0, letters: [], words: 0, stories: [],
  memoryWins: 0, balloonBest: 0, built: 0, spins: 0, badges: [], certs: {},
  misses: {}, traced: [], rhymes: [], coloured: 0, said: 0, stickers: 0, mins: {},
  day: '', today: 0, goalDay: '', streakDays: 0, bestDays: 0, stage: 0, since: new Date().toISOString().slice(0, 10) });

const Progress = {
  d: DEFAULT(),
  load(){
    try {
      const raw = Profiles.get('lt-progress');
      if (raw) this.d = Object.assign(DEFAULT(), JSON.parse(raw));
      else { const old = parseInt(Profiles.get('lt-stars'), 10) || 0; this.d.tokens = this.d.tokensEver = old; }   // earlier ⭐ stars become tokens
    } catch (e) {}
    this.paint(false);   // the Today card is painted at the end of this file
  },
  save(){ Profiles.set('lt-progress', JSON.stringify(this.d)); },
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
    else if (what === 'miss'){ d.misses[v] = (d.misses[v] || 0) + 1; this.save(); return; }   // letters to practise (Parent corner)
    else if (what === 'traced'){ if (!d.traced.includes(v)) d.traced.push(v); }
    else if (what === 'rhyme'){ if (!d.rhymes.includes(v)) d.rhymes.push(v); else return; }
    else if (what === 'coloured') d.coloured++;
    else if (what === 'said') d.said++;
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
      const S = STAGES[st]; logEv('level_up', { level: st + 1 });
      setTimeout(() => celebrate(S.ic, 'நிலை உயர்ந்தது! · Level up!', `Kili is now ${S.ta} · ${S.en} (Level ${st + 1})`), 2200);
    }
    paintToday();
  },
  reset(){ this.d = DEFAULT(); setTimeout(paintToday); this.save(); this.paint(true); try { Object.keys(localStorage).filter(k => k.startsWith('lt-best-') && Profiles.mine(k)).forEach(k => localStorage.removeItem(k)); } catch (e) {} Score.render(true); }
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
    SFX.badge(); confetti(); logEv('badge_earned', { badge: b.id });
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
      ${stat('📚', `${d.stories.filter(id => STORIES.some(s => s.id === id)).length}/${STORIES.length}`, 'Stories finished')}${stat('🧩', d.built, 'Words built')}
      ${stat('✍️', d.traced.length, 'Letters traced')}${stat('🎤', d.said, 'Said aloud')}${stat('🎨', d.coloured, 'Pictures coloured')}
    </div>
    <p class="rw-links"><button class="btn small" type="button" data-open="stickers">📒 Sticker book</button> <button class="btn small" type="button" data-open="parents">👪 Parent corner</button></p>
    <h3>Badges <small>${got} / ${BADGES.length}</small></h3>
    <div class="rw-badges">${BADGES.map(b => { const on = d.badges.includes(b.id);
      return `<div class="rw-badge ${on ? 'on' : ''}" title="${b.en}"><span aria-hidden="true">${on ? b.ic : '🔒'}</span><b lang="ta">${b.ta}</b><small>${b.en}</small></div>`; }).join('')}</div>
    <p class="rw-note">Saved only on this device. <button class="rw-reset" type="button">Reset progress</button></p>`;
  dlg.querySelector('.rw-x').onclick = () => dlg.close();
  dlg.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { dlg.close(); document.dispatchEvent(new CustomEvent('lt:open', { detail: b.dataset.open })); });
  dlg.querySelector('.rw-reset').onclick = () => {
    if (confirm('Reset all tokens, badges and scores on this device?')){ Progress.reset(); openRewards(); }
  };
  if (typeof dlg.showModal === 'function'){ if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
}
const chip = document.getElementById('stars');
if (chip) chip.addEventListener('click', openRewards);
Progress.load();
