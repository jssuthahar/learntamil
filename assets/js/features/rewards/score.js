/* Learn Tamil — rewards: praise, celebration pop-up, flying points and the game score.
   Rewards.win / miss / cheer are used by every game.
   Uses: core/sound.js, core/dom.js, core/speech.js */
'use strict';

/* ---------- praise ---------- */
const PRAISES = TEXT.praise, BIG_PRAISES = TEXT.bigPraise;   // data/messages.js
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
  best(g = this.game){ return +Profiles.get('lt-best-' + g) || 0; },
  saveBest(){ if (this.score > this.best()) Profiles.set('lt-best-' + this.game, this.score); },
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
  document.addEventListener('lt:sfx', paint);   // changed in ⚙️ Settings
})();
