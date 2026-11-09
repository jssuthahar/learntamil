/* Learn Tamil — 👧👦 child profiles UI, 📒 sticker book, 👪 Parent corner and ⏰ break reminder.
   Everything is saved only in this browser (see js/profiles.js); nothing is sent anywhere.
   Uses helpers from app.js / rewards.js: $, $$, speak, sparkle, sayLetter, Progress, Rewards, BADGES,
   STAGES, stageOf, todayStr, dayStr, paintToday, openRewards. */
'use strict';

/* ---------- a reusable dialog ---------- */
function famDialog(id, html){
  let d = document.getElementById(id);
  if (!d){
    d = document.createElement('dialog'); d.id = id; d.className = 'rewards-dlg fam-dlg';
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
  }
  d.innerHTML = html;
  const x = d.querySelector('.rw-x'); if (x) x.onclick = () => d.close();
  if (typeof d.showModal === 'function'){ if (!d.open) d.showModal(); } else d.setAttribute('open', '');
  return d;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const childName = (p, i) => p.name || `Child ${i + 1}`;

/* =====================================================================
   👧👦 WHO IS LEARNING? (profile switcher, from the Today card)
   ===================================================================== */
function paintProfile(){
  const p = Profiles.current(); const ic = document.getElementById('profIc'); if (ic) ic.textContent = p.ic;
  const b = document.getElementById('profileBtn'); if (b) b.setAttribute('aria-label', `Learning now: ${p.name || 'Child 1'}. Tap to switch child`);
}
function openProfiles(){
  const list = Profiles.list(), cur = Profiles.current().id;
  const d = famDialog('profDlg', `
    <div class="rw-head"><h2>👧👦 <span lang="ta">யார் படிக்கிறார்கள்?</span> · Who is learning?</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
    <div class="prof-list">${list.map((p, i) => `<button class="prof-card${p.id === cur ? ' on' : ''}" type="button" data-id="${p.id}" aria-pressed="${p.id === cur}">
      <span class="prof-ic" aria-hidden="true">${p.ic}</span><b>${esc(childName(p, i))}</b><small>${p.id === cur ? 'Learning now' : 'Tap to switch'}</small></button>`).join('')}</div>
    <p class="rw-note">Each child has their own tokens, badges, stickers and certificates.
      <button class="btn small" type="button" data-open="parents">➕ Add or change children (Parent corner)</button></p>`);
  d.querySelectorAll('.prof-card').forEach(b => b.onclick = () => { if (b.dataset.id !== cur) Profiles.switchTo(b.dataset.id); else d.close(); });
  d.querySelector('[data-open]').onclick = () => { d.close(); openParents(); };
}
$('#profileBtn').addEventListener('click', openProfiles);

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
  el.innerHTML = `<div class="bp-card"><span class="bp-ic" aria-hidden="true">🧘</span><b lang="ta">கொஞ்சம் ஓய்வெடு!</b>
    <small>Time for a little break! Stretch 🙆, drink some water 💧 and rest your eyes 👀.</small>
    <button class="btn primary" type="button" disabled>⏳ 1:00</button></div>`;
  document.body.appendChild(el);
  setTimeout(() => speak('கொஞ்சம் ஓய்வெடு!'), 300);
  const btn = el.querySelector('button'); let s = 60;
  const t = setInterval(() => {
    s--; btn.textContent = `⏳ 0:${String(s).padStart(2, '0')}`;
    if (s <= 0){ clearInterval(t); btn.disabled = false; btn.innerHTML = '▶ <span lang="ta">மீண்டும் விளையாடு</span> · Back to learning'; }
  }, 1000);
  btn.onclick = () => { sessionMins = 0; el.remove(); };
}

/* =====================================================================
   👪 PARENT CORNER — behind a "press and hold" grown-up check
   ===================================================================== */
function openParents(){
  const d = famDialog('parentDlg', `
    <div class="rw-head"><h2>👪 Parent corner</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
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
  d.innerHTML = `
    <div class="rw-head"><h2>👪 Parent corner</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
    <h3>${cur.ic} ${esc(cur.name || 'Child 1')} <small>· learning since ${esc(p.since || '')}</small></h3>
    <div class="rw-stats">
      ${stat('⏱', `${mins[t] || 0} min`, 'Today')}${stat('📅', `${weekTotal} min`, 'Last 7 days')}${stat('🔥', `${p.bestDays || 0}`, 'Best day streak')}
      ${stat('🔤', `${p.letters.length}/247`, 'Letters heard')}${stat('✍️', (p.traced || []).length, 'Letters traced')}${stat('📖', p.words, 'Words read')}
      ${stat('📚', p.stories.length, 'Stories & festivals')}${stat('🎵', (p.rhymes || []).length, 'Rhymes sung')}${stat('🎓', `${certs}/10`, 'Certificates')}
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
    <p class="pc-links"><a class="btn small" href="#/little">👶 Open Little ones mode (ages 3–5)</a> <button class="btn small" type="button" data-open="rewards">🏅 Badges</button></p>
    <p class="rw-note">🔒 All of this is saved only on this device. Nothing about your child is sent anywhere. Recordings from 🎤 Say it are never saved.</p>`;
  d.querySelector('.rw-x').onclick = () => d.close();
  d.querySelectorAll('.pc-tricky .chip').forEach(c => c.onclick = () => sayLetter(c.dataset.l, c.dataset.l.endsWith(PULLI) ? 'இ' + c.dataset.l : c.dataset.l));
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
  d.querySelectorAll('a[href^="#/"]').forEach(a => a.addEventListener('click', () => d.close()));
}

/* ---------- open from the Today card, the rewards panel and the profile switcher ---------- */
document.addEventListener('lt:open', e => { if (e.detail === 'stickers') openStickers(); if (e.detail === 'parents') openParents(); });
$$('.today-chips [data-open]').forEach(b => b.addEventListener('click', () => document.dispatchEvent(new CustomEvent('lt:open', { detail: b.dataset.open }))));
paintProfile();
