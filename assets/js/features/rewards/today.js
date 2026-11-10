/* Learn Tamil — rewards: the Today card.
   Greeting, Kili's level, daily goal, day streak and letter of the day. */
'use strict';

/* =====================================================================
   TODAY CARD: greeting, Kili's level, daily goal, streak, letter of the day
   ===================================================================== */
const GOAL = 10;
function stageOf(xp){ return STAGES.reduce((s, x, i) => xp >= x.at ? i : s, 0); }
function pad2(n){ return String(n).padStart(2, '0'); }
function dayStr(off = 0){ const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function todayStr(){ return dayStr(0); }

function celebrate(icon, ta, en){
  const el = document.createElement('div');
  el.className = 'badge-pop'; el.setAttribute('role', 'status');
  el.innerHTML = `<div class="bp-card"><span class="bp-ic" aria-hidden="true">${icon}</span><b lang="ta">${ta}</b><small>${en}</small><span class="bp-wow" lang="ta">${TEXT.congrats} 🎉</span></div>`;
  document.body.appendChild(el);
  SFX.levelUp(); confetti(); setTimeout(() => speak(TEXT.congrats), 1100);
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
  const name = (Profiles.current().name || Profiles.get('lt-cert-name') || '').split(' ')[0];
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('kiliStage', S.ic);
  set('todayHi', name ? fmt(TEXT.greetName, { name }) : TEXT.greet);
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
  if (typeof paintQuest === 'function') paintQuest();   // daily gift and learning path (features/rewards/path.js, loads later)
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
