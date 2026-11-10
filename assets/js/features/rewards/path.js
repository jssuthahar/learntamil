/* Learn Tamil — rewards: 🗺️ age groups and learning paths, and the 🎁 daily gift.
   A child picks an age group (3–5, 6–8, 9–12) on the home page; it is saved on their profile and chooses
   the lessons on their learning path (data/rewards.js → LESSONS, rules in progress.js → LESSON_RULES).
   The daily gift on the Today card opens once a day, after the first thing learned, and gives more
   tokens the longer the day streak (2 + streak, up to 10). Everything stays on this device. */
'use strict';

const ageOf = id => AGE_GROUPS.find(g => g.id === id);

/* ---------- Open a lesson's activity ---------- */
function goLesson(go){
  if (go.startsWith('#/')){ if (location.hash !== go) location.hash = go.slice(1); return; }
  if (go === 'rhymes'){
    if (location.hash !== '#/stories') location.hash = '/stories';
    setTimeout(() => { const b = document.querySelector('#storyKinds [data-kind="rhymes"]'); if (b) b.click(); }, 250);
    return;
  }
  if (go.startsWith('game:')){
    if (location.hash !== '#/practice') location.hash = '/practice';
    setTimeout(() => { showGame(go.slice(5)); const g = document.getElementById('g-' + go.slice(5)); if (g) g.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' }); }, 250);
  }
}

/* ---------- Choose an age group ---------- */
function setAge(id){
  const cur = Profiles.current(); if (!cur || !ageOf(id)) return;
  Profiles.update(cur.id, { age: id });
  paintQuest();
}

/* ---------- 🗺️ The learning path dialog ---------- */
function openPath(age){
  if (age) setAge(age);
  const P = pathOf();
  const d = famDialog('pathDlg', '');
  d.setAttribute('aria-labelledby', 'pathTitle');
  const ages = AGE_GROUPS.map(g => `<button class="seg-btn" type="button" data-age="${g.id}" aria-pressed="${g.id === P.age}"><b>${g.ic} ${g.ages}</b><small class="ta">${g.ta}</small></button>`).join('');
  let body;
  if (!P.age){
    body = `<p class="path-ask"><b lang="ta">${TEXT.chooseAge[0]}</b> · ${TEXT.chooseAge[1]}</p>`;
  } else {
    const G = ageOf(P.age), pct = Math.round(P.done / P.total * 100);
    body = `
      <p class="path-sum"><span aria-hidden="true">${G.ic}</span> <span>${G.en}</span></p>
      <div class="path-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${P.total}" aria-valuenow="${P.done}" aria-label="${TEXT.lessonsDone[1]}"><i style="width:${pct}%"></i></div>
      <p class="path-count"><b>${P.done} / ${P.total}</b> <span lang="ta">${TEXT.lessonsDone[0]}</span> · ${TEXT.lessonsDone[1]}</p>
      ${P.next ? '' : `<p class="path-done" role="status">🎉 <b lang="ta">${TEXT.pathDone[0]}</b> ${fmt(TEXT.pathDone[1], { ages: G.ages })}</p>`}
      <ol class="path-list">${P.list.map((L, i) => {
        const done = lessonDone(L.id), next = P.next && P.next.id === L.id;
        return `<li class="path-step${done ? ' done' : ''}${next ? ' next' : ''}">
          <span class="ps-n" aria-hidden="true">${done ? '✓' : i + 1}</span>
          <span class="ps-ic" aria-hidden="true">${L.ic}</span>
          <span class="ps-t"><b lang="ta">${L.ta}</b><small>${L.en}${done ? ' · ✅ Done' : ''}</small></span>
          ${done ? '' : `<button class="btn small${next ? ' primary' : ''}" type="button" data-go="${L.go}">${next ? `${TEXT.pathNext[1]} ▶` : `▶ ${TEXT.go[1]}`}</button>`}
        </li>`; }).join('')}</ol>`;
  }
  d.innerHTML = `
    <div class="rw-head"><h2 id="pathTitle">🗺️ <span lang="ta">${TEXT.myPath[0]}</span> · ${TEXT.myPath[1]}</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
    <div class="seg path-ages" role="group" aria-label="${TEXT.chooseAge[1]}">${ages}</div>
    ${body}`;
  d.querySelector('.rw-x').onclick = () => d.close();
  d.querySelectorAll('[data-age]').forEach(b => b.onclick = () => { Rewards.sfx.tap(); openPath(b.dataset.age); });
  d.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { d.close(); goLesson(b.dataset.go); });
}

/* ---------- 🎁 Daily gift ---------- */
function giftState(){
  const d = Progress.d, t = todayStr();
  if (d.giftDay === t) return 'opened';
  return d.day === t && d.today > 0 ? 'ready' : 'locked';
}
function openGift(){
  const st = giftState(), b = document.getElementById('giftBtn');
  if (st === 'locked'){ speak(TEXT.giftLocked[0]); if (b && !calm){ b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle'); } return; }
  if (st === 'opened'){ speak(TEXT.giftOpened[0]); return; }
  const d = Progress.d, n = Math.min(10, 2 + (d.streakDays || 1));
  d.giftDay = todayStr(); d.gifts = (d.gifts || 0) + 1; Progress.save();
  logEv('daily_gift');
  celebrate('🎁', TEXT.giftWon[0], fmt(TEXT.giftWon[1], { n, days: d.streakDays || 1 }));
  setTimeout(() => Progress.addTokens(n), 600);
  paintQuest();
}

/* ---------- Paint the Today card's gift and path buttons, and the age cards ---------- */
function paintQuest(){
  const gb = document.getElementById('giftBtn');
  if (gb){
    const st = giftState(), T = st === 'opened' ? TEXT.giftOpened : st === 'ready' ? TEXT.giftReady : TEXT.giftLocked;
    gb.dataset.state = st;
    gb.setAttribute('aria-disabled', String(st !== 'ready'));
    gb.innerHTML = `<span class="q-ic" aria-hidden="true">${st === 'opened' ? '✅' : '🎁'}</span><span class="q-t"><b lang="ta">${T[0]}</b><small>${T[1]}</small></span>`;
  }
  const P = pathOf();
  const pb = document.getElementById('pathBtn');
  if (pb){
    const G = ageOf(P.age);
    pb.innerHTML = `<span class="q-ic" aria-hidden="true">🗺️</span><span class="q-t"><b lang="ta">${TEXT.myPath[0]}</b><small>${G
      ? `${TEXT.myPath[1]} · ${P.done}/${P.total}${P.next ? ` · ${TEXT.pathNext[1]}: ${P.next.en}` : ' 🎉'}`
      : TEXT.chooseAge[1]}</small></span>`;
  }
  document.querySelectorAll('.age-card').forEach(c => {
    const on = c.dataset.age === P.age, list = LESSONS[c.dataset.age] || [];
    c.setAttribute('aria-pressed', String(on));
    const bar = c.querySelector('.age-bar i');
    if (bar) bar.style.width = on && list.length ? Math.round(P.done / list.length * 100) + '%' : '0%';
    const s = c.querySelector('.age-prog');
    if (s) s.textContent = on ? `${P.done}/${P.total} ${TEXT.lessonsDone[1]}` : '';
  });
}

/* ---------- Wire up ---------- */
document.querySelectorAll('.age-card').forEach(c => c.addEventListener('click', () => {
  // Ages 3–5 go straight to Little ones the first time; the path is one tap away on the Today card.
  const first = childAge() !== c.dataset.age;
  if (c.dataset.age === '3-5' && first){ setAge('3-5'); location.hash = '/little'; return; }
  openPath(c.dataset.age);
}));
(function(){
  const g = document.getElementById('giftBtn'); if (g) g.addEventListener('click', openGift);
  const p = document.getElementById('pathBtn'); if (p) p.addEventListener('click', () => openPath());
})();
document.addEventListener('lt:open', e => { if (e.detail === 'path') openPath(); });
paintQuest();
