/* Learn Tamil — family: 👪 Parent dashboard (behind a press-and-hold check), ⏱ time spent and ⏰ break reminder.
   The dashboard shows the child's age group and learning path, suggested next steps, time, stats and tricky letters.
   Everything stays on this device. */
'use strict';

/* =====================================================================
   ⏱ TIME SPENT (per child, per day) and ⏰ BREAK REMINDER (device setting)
   ===================================================================== */
const BREAK_KEY = 'lt-break';
const breakMins = () => { try { return +localStorage.getItem(BREAK_KEY) || 0; } catch (e) { return 0; } };
let sessionMins = 0;
setInterval(() => {
  if (document.visibilityState !== 'visible') return;
  const d = Progress.d, t = todayStr();
  d.mins = d.mins || {}; d.mins[t] = (d.mins[t] || 0) + 1;
  Object.keys(d.mins).sort().slice(0, -14).forEach(k => delete d.mins[k]);   // keep two weeks
  Progress.save();
  sessionMins++;
  const lim = breakMins();
  if (lim && sessionMins >= lim && !document.querySelector('.break-pop')) showBreak();
}, 60000);
function showBreak(){
  try { speechSynthesis.cancel(); } catch (e) {}
  const el = document.createElement('div'); el.className = 'badge-pop break-pop'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-label', 'Time for a break');
  el.innerHTML = `<div class="bp-card"><span class="bp-ic" aria-hidden="true">🧘</span><b lang="ta">${TEXT.breakTime[0]}</b>
    <small>${TEXT.breakTime[1]}</small>
    <button class="btn primary" type="button" disabled>⏳ 1:00</button></div>`;
  document.body.appendChild(el);
  setTimeout(() => speak(TEXT.breakTime[0]), 300);
  const btn = el.querySelector('button'); let s = 60;
  const t = setInterval(() => {
    s--; btn.textContent = `⏳ 0:${String(s).padStart(2, '0')}`;
    if (s <= 0){ clearInterval(t); btn.disabled = false; btn.innerHTML = `▶ <span lang="ta">${TEXT.backToLearning[0]}</span> · ${TEXT.backToLearning[1]}`; }
  }, 1000);
  btn.onclick = () => { sessionMins = 0; el.remove(); };
}

/* =====================================================================
   👪 PARENT DASHBOARD — behind a "press and hold" grown-up check
   ===================================================================== */
function openParents(){
  const d = famDialog('parentDlg', `
    <div class="rw-head"><h2>👪 Parent dashboard</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
    <div class="gate">
      <p><b>For grown-ups.</b> Press and hold the button for 3 seconds.</p>
      <button class="gate-btn" type="button"><span class="gate-fill" aria-hidden="true"></span><span class="gate-t">✋ Hold</span></button>
    </div>`);
  const b = d.querySelector('.gate-btn'), fill = d.querySelector('.gate-fill');
  let t0 = 0, raf = 0;
  const stop = () => { cancelAnimationFrame(raf); t0 = 0; fill.style.width = '0%'; };
  const tick = now => {
    const k = Math.min(1, (now - t0) / 3000); fill.style.width = (k * 100) + '%';
    if (k >= 1){ stop(); renderParents(d); return; }
    raf = requestAnimationFrame(tick);
  };
  b.addEventListener('pointerdown', e => { e.preventDefault(); t0 = performance.now(); raf = requestAnimationFrame(tick); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { if (t0) stop(); }));
  b.addEventListener('contextmenu', e => e.preventDefault());
  // Keyboard: hold Enter or Space for 3 seconds.
  b.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !t0){ e.preventDefault(); t0 = performance.now(); raf = requestAnimationFrame(tick); } });
  b.addEventListener('keyup', () => { if (t0) stop(); });
}
function renderParents(d){
  const p = Progress.d, list = Profiles.list(), cur = Profiles.current();
  const t = todayStr(), mins = p.mins || {};
  const week = [...Array(7)].map((_, i) => { const k = dayStr(i - 6); return { k, m: mins[k] || 0, lbl: new Date(k + 'T12:00').toLocaleDateString(undefined, { weekday: 'short' }) }; });
  const maxM = Math.max(10, ...week.map(x => x.m));
  const weekTotal = week.reduce((a, x) => a + x.m, 0);
  const tricky = Object.entries(p.misses || {}).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const certs = Object.keys(p.certs || {}).length;
  const stat = (ic, n, label) => `<div class="rw-stat"><span aria-hidden="true">${ic}</span><b>${n}</b><small>${label}</small></div>`;
  const brk = breakMins();
  const P = pathOf(), G = AGE_GROUPS.find(g => g.id === P.age);
  const todo = P.list.filter(L => !lessonDone(L.id)).slice(0, 2);
  const badgesGot = BADGES.filter(b => p.badges.includes(b.id)).length;
  d.innerHTML = `
    <div class="rw-head"><h2>👪 Parent dashboard</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
    <h3>${cur.ic} ${esc(cur.name || 'Child 1')} <small>· learning since ${esc(p.since || '')}</small></h3>
    <a class="pc-coffee" href="https://buymeacoffee.com/jssuthahar" target="_blank" rel="noopener">
      <span class="pc-coffee-ic" aria-hidden="true">☕</span>
      <span class="pc-coffee-t"><b>Enjoying Learn Tamil? Buy me a coffee</b><small>It is free, with no ads in the lessons or games. Your support keeps it that way. <span class="ta">நன்றி!</span></small></span>
      <span class="pc-coffee-go" aria-hidden="true">→</span>
    </a>
    <nav class="pc-connect" aria-label="Stay connected (for grown-ups)">
      <a class="fc fc-yt" href="https://www.youtube.com/channel/UCDrVJHz36TVZ3eFP8n-KLSg" target="_blank" rel="noopener"><span aria-hidden="true">▶️</span> Subscribe to NikiBhavi on YouTube</a>
      <a class="fc fc-ig" href="https://www.instagram.com/nikibhavi/" target="_blank" rel="noopener"><span aria-hidden="true">📸</span> Follow on Instagram</a>
      <a class="fc fc-ai" href="https://blog.msdevbuild.com/" target="_blank" rel="noopener"><span aria-hidden="true">🤖</span> Learn AI &amp; programming</a>
      <a class="fc fc-mail" href="https://blog.msdevbuild.com/contact/" target="_blank" rel="noopener"><span aria-hidden="true">✉️</span> Contact us</a>
    </nav>

    <div class="pc-path">
      <label class="pc-set">🎂 Age group
        <select id="pcAge"><option value="">Not chosen yet</option>${AGE_GROUPS.map(g => `<option value="${g.id}" ${g.id === P.age ? 'selected' : ''}>Ages ${g.ages} · ${g.en}</option>`).join('')}</select></label>
      ${G ? `<p class="pc-path-sum"><b>🗺️ Learning path: ${P.done} of ${P.total} lessons done</b></p>
      <div class="path-bar" aria-hidden="true"><i style="width:${Math.round(P.done / P.total * 100)}%"></i></div>
      <ol class="pc-lessons">${P.list.map(L => `<li class="${lessonDone(L.id) ? 'done' : ''}"><span aria-hidden="true">${lessonDone(L.id) ? '✅' : '⬜'}</span> ${L.en}</li>`).join('')}</ol>
      ${todo.length ? `<p class="pc-next"><b>Suggested next:</b> ${todo.map(L => `<button class="btn small" type="button" data-lesson="${L.go}">${L.ic} ${L.en}</button>`).join(' ')}</p>`
                    : '<p class="pc-next">🎉 This path is finished. Try choosing the next age group for new lessons.</p>'}`
          : '<p class="muted">Choose an age group to see a learning path made for your child: 3–5 (pictures and sounds), 6–8 (letters, tracing, first words) or 9–12 (reading, spelling, stories, certificates).</p>'}
    </div>

    <div class="rw-stats">
      ${stat('⏱', `${mins[t] || 0} min`, 'Today')}${stat('📅', `${weekTotal} min`, 'Last 7 days')}${stat('🔥', `${p.bestDays || 0}`, 'Best day streak')}
      ${stat('🔤', `${p.letters.length}/247`, 'Letters heard')}${stat('✍️', (p.traced || []).length, 'Letters traced')}${stat('📖', p.words, 'Words read')}
      ${stat('📚', p.stories.length, 'Stories & festivals')}${stat('🎵', (p.rhymes || []).length, 'Rhymes sung')}${stat('🎓', `${certs}/10`, 'Certificates')}
      ${stat('🏅', `${badgesGot}/${BADGES.length}`, 'Badges')}${stat('🎁', p.gifts || 0, 'Daily gifts opened')}${stat('🪙', p.tokensEver, 'Tokens earned')}
    </div>
    <div class="pc-week" role="img" aria-label="Minutes learned on each of the last 7 days">${week.map(x =>
      `<div class="pc-day"><i style="height:${Math.round(x.m / maxM * 100)}%"></i><small>${x.lbl}</small><b>${x.m}</b></div>`).join('')}</div>
    <h3>Letters to practise <small>· most often missed in the Listen and Build games</small></h3>
    <div class="pc-tricky">${tricky.length ? tricky.map(([l, n]) => `<button class="chip" type="button" lang="ta" data-l="${l}">${l}<small>${n}× missed</small></button>`).join('')
      : '<p class="muted">No tricky letters yet. Play the <b>Listen</b> and <b>Build a letter</b> games and they will show up here.</p>'}</div>

    <h3>Children on this device <small>· up to 6</small></h3>
    <div class="pc-kids">${list.map((k, i) => `<div class="pc-kid${k.id === cur.id ? ' on' : ''}">
      <span class="prof-ic" aria-hidden="true">${k.ic}</span><b>${esc(childName(k, i))}</b>
      <span class="pc-kid-btns">
        ${k.id === cur.id ? '<small>Learning now</small>' : `<button class="btn small" type="button" data-sw="${k.id}">Switch</button>`}
        <button class="btn small" type="button" data-rn="${k.id}">Rename</button>
        ${k.id === 'p0' ? '' : `<button class="btn small" type="button" data-rm="${k.id}">Delete</button>`}
      </span></div>`).join('')}</div>
    ${list.length < 6 ? `<form class="pc-add">
      <input type="text" maxlength="24" placeholder="Child's first name" aria-label="Child's first name" required>
      <span class="pc-av" role="radiogroup" aria-label="Picture">${Profiles.AVATARS.map((a, i) => `<label><input type="radio" name="av" value="${a}" ${i === list.length % Profiles.AVATARS.length ? 'checked' : ''}><span>${a}</span></label>`).join('')}</span>
      <button class="btn primary small" type="submit">➕ Add child</button></form>` : ''}

    <h3>Settings</h3>
    <label class="pc-set">⏰ Break reminder
      <select id="pcBreak">${[[0, 'Off'], [15, 'Every 15 minutes'], [20, 'Every 20 minutes'], [30, 'Every 30 minutes'], [45, 'Every 45 minutes']]
        .map(([v, l]) => `<option value="${v}" ${v === brk ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <p class="pc-links"><button class="btn small" type="button" data-open="settings">⚙️ Text size, contrast &amp; sound</button> <a class="btn small" href="#/little">👶 Open Little ones mode (ages 3–5)</a> <button class="btn small" type="button" data-open="rewards">🏅 Badges</button></p>
    <p class="rw-note">🔒 All of this is saved only on this device. Nothing about your child is sent anywhere. Recordings from 🎤 Say it are never saved.</p>`;
  d.querySelector('.rw-x').onclick = () => d.close();
  d.querySelectorAll('.pc-tricky .chip').forEach(c => c.onclick = () => sayLetter(c.dataset.l, spokenForm(c.dataset.l)));
  d.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => Profiles.switchTo(b.dataset.sw));
  d.querySelectorAll('[data-rn]').forEach(b => b.onclick = () => {
    const k = list.find(x => x.id === b.dataset.rn); const n = prompt('New name', k.name || '');
    if (n !== null){ Profiles.update(k.id, { name: n }); paintToday(); paintProfile(); renderParents(d); }
  });
  d.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => {
    const k = list.find(x => x.id === b.dataset.rm);
    if (confirm(`Delete ${k.name || 'this child'} and all of their progress on this device? This cannot be undone.`)){ Profiles.remove(k.id); renderParents(d); }
  });
  const f = d.querySelector('.pc-add');
  if (f) f.onsubmit = e => {
    e.preventDefault();
    const name = f.querySelector('input[type=text]').value.trim(); if (!name) return;
    const ic = (f.querySelector('input[name=av]:checked') || {}).value;
    const k = Profiles.add(name, ic);
    if (k && confirm(`${name} was added. Switch to ${name} now?`)) Profiles.switchTo(k.id); else renderParents(d);
  };
  d.querySelector('#pcBreak').onchange = e => { try { localStorage.setItem(BREAK_KEY, e.target.value); } catch (er) {} sessionMins = 0; };
  d.querySelector('[data-open="rewards"]').onclick = () => { d.close(); openRewards(); };
  d.querySelector('[data-open="settings"]').onclick = () => { d.close(); openSettings(); };
  d.querySelector('#pcAge').onchange = e => { Profiles.update(cur.id, { age: e.target.value }); paintQuest(); renderParents(d); };
  d.querySelectorAll('[data-lesson]').forEach(b => b.onclick = () => { d.close(); goLesson(b.dataset.lesson); });
  d.querySelectorAll('a[href^="#/"]').forEach(a => a.addEventListener('click', () => d.close()));
}

/* ---------- open from the Today card, the rewards panel and the profile switcher ---------- */
document.addEventListener('lt:open', e => { if (e.detail === 'stickers') openStickers(); if (e.detail === 'parents') openParents(); });
$$('.today-chips [data-open]').forEach(b => b.addEventListener('click', () => document.dispatchEvent(new CustomEvent('lt:open', { detail: b.dataset.open }))));
paintProfile();
