/* Learn Tamil — Thirukkural: 📜 the screens of thirukkural.html (its own page; router: kural-app.js).
   Screens, chosen by the URL hash:
     #/ dashboard · #/paal/1 a division's chapters · #/ch/5 a chapter's 10 Kurals · #/k/41 one Kural ·
     #/book[/n] read all 1,330 as a book, one page each · #/daily · #/marks bookmarks · #/parents grown-up view · #/games[/<id>] (kural-games.js) ·
     #/print (kural-print.js) · #/certificate (kural-cert.js)
   The 1,330 couplets (assets/js/data/thirukkural.json) are fetched when the page opens.
   Progress is per child (Progress.d.kLearned, kMarks, kDays …) and never leaves the device. */
'use strict';

const KU = { book: null, loading: null, n: 0, timers: [], quiz: null };
const KT = TEXT.kural;
const K_TOTAL = 1330;

/* ---------- data ---------- */
function kuralBook(){
  if (KU.book) return Promise.resolve(KU.book);
  if (!KU.loading) KU.loading = fetch('assets/js/data/thirukkural.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(b => (KU.book = b))
    .catch(e => { KU.loading = null; throw e; });
  return KU.loading;
}
const kText = n => KU.book.k[n - 1];                       // [line 1, line 2, Pope's English]
const kChOf = n => Math.ceil(n / 10);                      // chapter 1–133
const kCh = c => KU.book.ch[c - 1];                         // [Tamil name, English name, romanised]
const kPaalOf = c => KURAL_PAALS.find(p => c >= p.from && c <= p.to);
const kWords = n => kText(n).slice(0, 2).map(l => l.trim().split(/\s+/));
const kClean = w => w.replace(/[.,;:!?]+$/, '');
const kPair = (p, cls = '') => `<span class="ta ${cls}" lang="ta">${p[0]}</span> <small>${p[1]}</small>`;
const kLesson = n => KURAL_LESSONS[n] || null;
/* Kural of the day: the same one for everyone on a date; cycles through all 1,080 Kurals of அறம் and பொருள். */
function kDailyN(){ const d = new Date(); const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); return (day * 373) % 1080 + 1; }

/* ---------- progress (per child, saved in lt-progress) ---------- */
const kd = () => Progress.d;
const kLearned = n => kd().kLearned.includes(n);
const kChapterLearned = c => { let x = 0; for (let n = c * 10 - 9; n <= c * 10; n++) if (kLearned(n)) x++; return x; };
function kTouchDay(){
  const d = kd(), t = todayStr();
  if (d.kDay === t) return;
  d.kDays = d.kDay === dayStr(-1) ? d.kDays + 1 : 1;
  d.kDay = t; d.kBestDays = Math.max(d.kBestDays, d.kDays);
}
function kMarkLearned(n, el){
  if (kLearned(n)) return false;
  kTouchDay(); Progress.track('kural', n);   // saves, gives tokens, checks badges
  Rewards.cheer(el, false);
  return true;
}
function kToggleMark(n){
  const m = kd().kMarks, i = m.indexOf(n);
  if (i < 0) m.push(n); else m.splice(i, 1);
  Progress.save(); return i < 0;
}
function kQuizResult(ok){ const d = kd(); d.kAsked++; if (ok){ d.kRight++; kTouchDay(); } Progress.save(); }

/* ---------- speech: recordings first, then the device voice ---------- */
function kStop(){
  KU.timers.forEach(clearTimeout); KU.timers = [];
  try { speechSynthesis.cancel(); } catch (e) {}
  if (typeof stopAudio === 'function') stopAudio();
  if (KU.audio){ KU.audio.pause(); KU.audio = null; }
  KScene.stop();
  $$('#kuralView .k-line.on').forEach(l => l.classList.remove('on'));
}
/* Say text with the device voice; slow uses a lower rate for this one sentence. */
function kSay(text, slow, onend){
  const r = $('#rate'), old = r.value;
  if (slow) r.value = Math.max(0.4, old * 0.65);
  speak(text, onend);   // the utterance takes its rate now, so the slider can be restored straight away
  r.value = old;
}
/* Read a Kural line by line, lighting up each line. mode: 'normal' | 'slow' | 'repeat' (pause after each line for the child). */
function kRecite(n, mode = 'normal', done){
  kStop();
  const file = KURAL_AUDIO[n];
  const lines = $$('#kuralView .k-line');
  if (file && mode !== 'repeat'){
    const a = new Audio('assets/audio/kural/' + file); KU.audio = a;
    a.playbackRate = mode === 'slow' ? 0.75 : 1; a.volume = voiceVolume();
    lines.forEach(l => l.classList.add('on'));
    a.onended = a.onerror = () => { lines.forEach(l => l.classList.remove('on')); KU.audio = null; done && done(); };
    a.play().catch(() => a.onerror());
    return;
  }
  const [l1, l2] = kText(n);
  const step = i => {
    lines.forEach((l, j) => l.classList.toggle('on', j === i));
    if (i > 1){ done && done(); return; }
    kSay(i ? l2 : l1, mode !== 'normal', () => {
      if (mode !== 'repeat'){ KU.timers.push(setTimeout(() => step(i + 1), 250)); return; }
      const turn = $('#kTurn'); if (turn){ turn.hidden = false; }
      KU.timers.push(setTimeout(() => { if (turn) turn.hidden = true; step(i + 1); }, 4500));
    });
  };
  step(0);
}

/* ---------- router (inside the section) ---------- */
const kSub = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
function kGo(path){ location.hash = '/' + (path || ''); }

function kRender(){
  kStop();
  if (kSub()[0] !== 'book') KU.auto = false;   // "Read to me" only runs inside the book
  const view = $('#kuralView');
  if (!KU.book){
    view.innerHTML = `<p class="k-loading">${kPair(KT.loading)}</p>`;
    kuralBook().then(kRender).catch(() => {
      view.innerHTML = `<div class="k-card"><p>${kPair(KT.offline)}</p><button class="btn" type="button" data-k="retry">${kPair(KT.retry)}</button></div>`;
    });
    return;
  }
  const [what, arg, arg2] = kSub(), num = parseInt(arg, 10);
  if (what === 'k' && num >= 1 && num <= K_TOTAL) kKuralView(view, num);
  else if (what === 'ch' && num >= 1 && num <= 133) kChapterView(view, num);
  else if (what === 'paal' && num >= 1 && num <= 3) kPaalView(view, num);
  else if (what === 'book') kBookView(view, num >= 1 && num <= K_TOTAL ? num : (kd().kBook || 1));
  else if (what === 'marks') kMarksView(view);
  else if (what === 'parents') kParentsView(view);
  else if (what === 'daily') kKuralView(view, kDailyN(), true);
  else if (what === 'games') KG.render(view, arg, arg2);
  else if (what === 'print') KP.render(view, num);
  else if (what === 'certificate') KC.render(view, num);
  else kHomeView(view);
}

/* ---------- screens ---------- */
const kCrumbs = (...parts) => `<nav class="k-crumbs" aria-label="Thirukkural">${[`<a href="#/">📜 ${KT.home[0]}</a>`, ...parts].join('<span aria-hidden="true">›</span>')}</nav>`;
const kStat = (ic, n, label) => `<div class="k-stat"><span aria-hidden="true">${ic}</span><b>${n}</b>${kPair(label)}</div>`;

/* Chapters that have full children's lessons (word meanings, stories, quizzes), in order. */
const kLessonChapters = () => [...new Set(Object.keys(KURAL_LESSONS).map(n => kChOf(+n)))].sort((a, b) => a - b);
/* What "Continue" opens: the next Kural with a lesson the child has not learned (children start with stories),
   then any unlearned Kural of அறம் and பொருள் from where they left off. */
function kNextToLearn(){
  const d = kd(), withLesson = Object.keys(KURAL_LESSONS).map(Number).sort((a, b) => a - b);
  const last = d.kLast || 0;
  const after = withLesson.find(n => n >= last && !kLearned(n)) || withLesson.find(n => !kLearned(n));
  if (after) return after;
  for (let n = Math.max(1, last); n <= 1080; n++) if (!kLearned(n)) return n;
  for (let n = 1; n <= 1080; n++) if (!kLearned(n)) return n;
  return 1;
}
function kHomeView(view){
  const d = kd(), learned = d.kLearned.length;
  let chDone = 0; for (let c = 1; c <= 133; c++) if (kChapterLearned(c) === 10) chDone++;
  const daily = kDailyN(), [dl1, dl2] = kText(daily);
  const nextN = kNextToLearn();
  const [nl1] = kText(nextN), nextLevel = KURAL_LEVELS.find(L => !d.kLevels[L.n]) || KURAL_LEVELS[KURAL_LEVELS.length - 1];
  const tile = (to, ic, pair, sub, cls = '') => `<a class="k-tile ${cls}" href="#/${to}"><span class="k-tile-ic" aria-hidden="true">${ic}</span><b class="ta" lang="ta">${pair[0]}</b><small>${pair[1]}</small>${sub ? `<em>${sub}</em>` : ''}</a>`;
  view.innerHTML = `
    <a class="k-continue" href="#/k/${nextN}">
      <span class="k-continue-ic" aria-hidden="true">▶</span>
      <span class="k-continue-t"><b class="ta" lang="ta">${(learned ? KT.continue : KT.start)[0]}</b><small>${(learned ? KT.continue : KT.start)[1]} · ${KT.kural[1]} ${nextN}</small>
        <span class="k-continue-k" lang="ta">${nl1} …</span></span>
    </a>
    <a class="k-book-link" href="#/book"><span class="k-book-ic" aria-hidden="true">📖</span>
      <span class="k-continue-t"><b class="ta" lang="ta">${KT.book.title[0]}</b><small>${KT.book.title[1]} · ${KT.book.sub[1]}</small>
        <small lang="ta">${KT.book.sub[0]}${d.kBook > 1 ? ` · ${KT.book.page[1]} ${d.kBook}` : ''}</small></span></a>
    <div class="k-tiles">
      ${tile('daily', '📅', KT.today, d.kDaily === todayStr() ? '✅' : `${KT.kural[1]} ${daily}`, 't-today')}
      ${tile('games', '🎮', KT.games, '6', 't-games')}
      ${tile('certificate', nextLevel.ic, TEXT.kural.cert.title, `${TEXT.kural.cert.level[1]} ${nextLevel.n}`, 't-cert')}
      ${tile('print', '🖨️', TEXT.kural.print.title, '133', 't-print')}
    </div>
    <h3 class="k-sec-title">🌟 ${kPair(KT.kidsStart)}</h3>
    <div class="k-kids">${kLessonChapters().map(c => { const done = kChapterLearned(c);
      return `<a class="k-kid-ch" href="#/ch/${c}"><span class="k-kid-ic" aria-hidden="true">${KURAL_CH_ICONS[c] || '📗'}</span><b class="ta" lang="ta">${kCh(c)[0]}</b><small>${kCh(c)[1]}</small><i class="k-bar" style="--p:${done * 10}%" aria-label="${done} of 10 learned"></i></a>`; }).join('')}</div>
    <div class="k-stats k-stats-sm">
      ${kStat('✅', learned, KT.learned)}${kStat('📗', `${chDone}/133`, KT.chaptersDone)}
      ${kStat('🔥', d.kDay === todayStr() || d.kDay === dayStr(-1) ? d.kDays : 0, KT.streak)}${kStat('🎓', Object.keys(d.kLevels).length + Object.keys(d.kCerts).length, TEXT.kural.cert.earned)}
    </div>
    <h3 class="k-sec-title">📚 ${kPair(KT.divisions)}</h3>
    <div class="k-paals">${KURAL_PAALS.map(p => {
      const chs = p.to - p.from + 1;
      let got = 0; for (let c = p.from; c <= p.to; c++) got += kChapterLearned(c);
      return `<a class="k-paal k-paal-${p.id}" href="#/paal/${p.id}">
        <div class="k-paal-art" aria-hidden="true">${p.ic}</div>
        <h3><span class="ta" lang="ta">${p.ta}</span> <small>${p.en}</small></h3>
        <p class="k-paal-n">${chs} ${KT.chapters[1]} · ${chs * 10} ${KT.kurals[1]}${got ? ` · ✅ ${got}` : ''}</p>
        <p>${kPair(p.intro)}</p>
        ${p.older ? `<p class="k-older">🧑‍🤝‍🧑 ${kPair(KT.older)}</p>` : ''}
        <i class="k-bar" style="--p:${Math.round(got / (chs * 10) * 100)}%" aria-hidden="true"></i>
      </a>`; }).join('')}</div>
    <p class="k-acts k-more"><a class="btn small" href="#/marks">⭐ ${kPair(KT.marks)} (${d.kMarks.length})</a>
      <a class="btn small" href="thirukkural-chapters.html">📚 ${kPair(KT.allChapters)}</a></p>`;
}

function kPaalView(view, id){
  const p = KURAL_PAALS[id - 1];
  const groups = KU.book.iyal.filter(([, , from]) => from >= p.from && from <= p.to);
  view.innerHTML = kCrumbs(`<span lang="ta">${p.ta}</span>`) + `
    <div class="k-head k-paal-${p.id}"><span class="k-head-ic" aria-hidden="true">${p.ic}</span><div><h3><span class="ta" lang="ta">${p.ta}</span> <small>${p.en}</small></h3><p>${kPair(p.intro)}</p></div></div>
    ${p.older ? `<p class="k-older">🧑‍🤝‍🧑 ${kPair(KT.older)}</p>` : ''}
    ${groups.map(([ta, en, from, to]) => `<h4 class="k-iyal"><span lang="ta">${ta}</span> · ${en}</h4>
      <div class="k-chapters">${Array.from({ length: to - from + 1 }, (_, i) => from + i).map(c => {
        const done = kChapterLearned(c), [cta, cen] = kCh(c);
        return `<a class="k-chap ${done === 10 ? 'done' : ''}" href="#/ch/${c}"><b>${c}</b><span class="ta" lang="ta">${cta}</span><small>${cen}</small><i class="k-bar" style="--p:${done * 10}%" aria-label="${done} of 10 learned"></i></a>`;
      }).join('')}</div>`).join('')}`;
}

function kChapterView(view, c){
  const p = kPaalOf(c), [cta, cen] = kCh(c);
  view.innerHTML = kCrumbs(`<a href="#/paal/${p.id}" lang="ta">${p.ta}</a>`, `<span lang="ta">${cta}</span>`) + `
    <div class="k-head k-paal-${p.id}"><span class="k-head-ic" aria-hidden="true">${c}</span><div><h3><span class="ta" lang="ta">${cta}</span> <small>${cen}</small></h3>
      <p>${KT.chapter[1]} ${c} · ${KT.kurals[1]} ${c * 10 - 9}–${c * 10} · ✅ ${kChapterLearned(c)}/10</p></div></div>
    <ol class="k-list">${Array.from({ length: 10 }, (_, i) => c * 10 - 9 + i).map(n => {
      const [l1, l2, en] = kText(n), L = kLesson(n);
      return `<li><a class="k-item ${kLearned(n) ? 'done' : ''}" href="#/k/${n}">
        <b class="k-num">${n}</b>
        <span class="k-item-text"><span lang="ta" class="ta">${l1}<br>${l2}</span><small>${L ? L.en : en}</small></span>
        <span class="k-chips"><span title="Audio" aria-label="Audio">🔊</span>${L && L.scene ? '<span title="Animated story" aria-label="Animated story">🎬</span>' : ''}${kLearned(n) ? '<span title="Learned" aria-label="Learned">✅</span>' : ''}${kd().kMarks.includes(n) ? '<span aria-label="Bookmarked">⭐</span>' : ''}</span>
      </a></li>`; }).join('')}</ol>
    <p class="k-acts k-nav">${c > 1 ? `<a class="btn" href="#/ch/${c - 1}">← ${kPair(KT.prevCh)}</a>` : ''}
      <button class="btn" type="button" data-k="go" data-to="games/complete/${c}">🎮 ${kPair(KT.practise)}</button>
      ${c < 133 ? `<a class="btn" href="#/ch/${c + 1}">${kPair(KT.nextCh)} →</a>` : ''}</p>`;
}

function kKuralView(view, n, daily = false){
  const c = kChOf(n), p = kPaalOf(c), [cta, cen] = kCh(c), [l1, l2, pope] = kText(n), L = kLesson(n);
  const d = kd(); d.kLast = n; Progress.save();
  const line = (l, i) => `<p class="k-line" data-line="${i}">${l.trim().split(/\s+/).map(w => `<button class="k-w" type="button" data-k="word" data-w="${kClean(w)}">${w}</button>`).join(' ')}</p>`;
  view.innerHTML = kCrumbs(`<a href="#/paal/${p.id}" lang="ta">${p.ta}</a>`, `<a href="#/ch/${c}" lang="ta">${cta}</a>`, `${KT.kural[1]} ${n}`) + `
    ${daily ? `<p class="k-daily-tag">📅 ${kPair(KT.today)}</p>` : ''}
    <article class="k-card k-couplet k-paal-${p.id}">
      <header><h3><span lang="ta">${KT.kural[0]}</span> ${n}</h3><small lang="ta">${cta} · ${cen}</small>
        <button class="k-star" type="button" data-k="mark" aria-pressed="${d.kMarks.includes(n)}" aria-label="${KT.bookmark[1]}">${d.kMarks.includes(n) ? '⭐' : '☆'}</button></header>
      <div class="k-lines" lang="ta">${line(l1, 0)}${line(l2, 1)}</div>
      <p class="k-turn" id="kTurn" hidden>🎤 ${kPair(KT.yourTurn)}</p>
      <div class="k-audio" role="group" aria-label="Listen">
        <button class="btn primary" type="button" data-k="say">🔊 ${kPair(KT.listen)}</button>
        <button class="btn" type="button" data-k="slow">🐢 ${kPair(KT.slow)}</button>
        <button class="btn" type="button" data-k="repeat">🔁 ${kPair(KT.repeat)}</button>
        <button class="btn" type="button" data-k="stop">⏹ ${kPair(KT.stop)}</button>
      </div>
    </article>
    <nav class="k-steps" aria-label="Lesson steps">${kSteps(n).map((st, i) =>
      `<button class="k-step" type="button" data-k="step" data-i="${i}"><span aria-hidden="true">${st.ic}</span><small class="ta" lang="ta">${st.label[0]}</small></button>`).join('')}</nav>
    <section class="k-card k-step-body" id="kStepBody" aria-live="polite"></section>
    <div class="k-step-nav"><button class="btn" type="button" data-k="stepback" id="kStepBack">← ${kPair(KT.stepBack)}</button>
      <button class="btn primary k-step-next" type="button" data-k="stepnext" id="kStepNext">${kPair(KT.stepNext)} →</button></div>
    <div class="k-actions">
      <button class="btn primary" type="button" data-k="learn" ${kLearned(n) ? 'disabled' : ''}>✅ ${kPair(kLearned(n) ? KT.learnedOk : KT.learn)}</button>
      <button class="btn" type="button" data-k="mark">⭐ ${kPair(d.kMarks.includes(n) ? KT.saved : KT.bookmark)}</button>
      <button class="btn" type="button" data-k="go" data-to="games/complete/${c}">🎮 ${kPair(KT.practise)}</button>
      <button class="btn" type="button" data-k="share">📤 ${kPair(KT.share)}</button>
    </div>
    <p class="k-acts k-nav">${n > 1 ? `<a class="btn" href="#/k/${n - 1}">← ${kPair(KT.prev)}</a>` : ''}${n < K_TOTAL ? `<a class="btn primary" href="#/k/${n + 1}">${kPair(KT.next)} →</a>` : ''}</p>`;
  KU.n = n; KU.daily = daily;
  kShowStep(0);
}

/* ---------- the guided lesson: one small step at a time ----------
   Kurals with a lesson: Words → Meaning → Story → Use it → Quiz. Others: Meaning (Pope) → Quiz.
   Finishing the quiz marks the Kural as learned and offers the next one. */
function kSteps(n){
  const L = kLesson(n), [, , pope] = kText(n);
  const draft = L && L.review !== 'reviewed' ? ` <span class="k-draft" title="${KT.draft[1]}">📝 ${KT.draft[0]}</span>` : '';
  const steps = [];
  if (L) steps.push({ id: 'words', ic: '📖', label: KT.steps.words, html: `<h4>📖 ${kPair(KT.words)}</h4><p class="muted">${kPair(KT.tapWord)}</p>
    <dl class="k-words">${L.words.map(([w, ta, en]) => `<div><dt lang="ta"><button class="k-w" type="button" data-k="word" data-w="${w}">🔊 ${w}</button></dt><dd><span lang="ta">${ta}</span><small>${en}</small></dd></div>`).join('')}</dl>` });
  steps.push({ id: 'meaning', ic: '🌱', label: KT.steps.meaning, html: L
    ? `<h4>🌱 ${kPair(KT.meaningTa)}${draft}</h4><p class="k-big-mean ta" lang="ta">${L.ta}</p><button class="btn small" type="button" data-k="saymean">🔊 ${kPair(KT.listen)}</button>
       <h4>🌍 ${kPair(KT.meaningEn)}</h4><p class="k-big-mean">${L.en}</p>${L.note ? `<p class="k-note">ℹ️ ${kPair(L.note)}</p>` : ''}<details class="k-pope-box"><summary>🇬🇧 ${KT.pope[1]}</summary><p class="k-pope">${pope}</p></details>`
    : `<p class="muted">${kPair(KT.soon)}</p><h4>🇬🇧 ${KT.pope[1]}</h4><p class="k-pope">${pope}</p>` });
  if (L && L.scene) steps.push({ id: 'story', ic: '🎬', label: KT.steps.story, html: `<h4>🎬 ${kPair(KT.story)}</h4>
    <div class="k-scene" id="kScene"><button class="k-scene-play" type="button" data-k="scene" aria-label="${KT.play[1]}"><span aria-hidden="true">▶</span>${kPair(KT.play)}</button></div>
    <p class="k-acts"><label class="k-toggle"><input type="checkbox" id="kCapEn"> ${kPair(KT.captionsEn)}</label>
    <label class="k-toggle"><input type="checkbox" id="kNarrate" checked> ${kPair(KT.narrate)}</label>
    <button class="btn small" type="button" data-k="scene">🔁 ${kPair(KT.again)}</button></p>` });
  if (L) steps.push({ id: 'life', ic: '💡', label: KT.steps.life, html: `<div class="k-life-in"><h4>💡 ${kPair(KT.life)}</h4><p class="k-big-mean ta" lang="ta">${L.life[0]}</p><p class="k-big-mean">${L.life[1]}</p></div>` });
  steps.push({ id: 'quiz', ic: '❓', label: KT.steps.quiz, html: `<h4>❓ ${kPair(KT.check)}</h4><div id="kQuiz"></div>` });
  return steps;
}
function kShowStep(i){
  const steps = kSteps(KU.n); i = Math.max(0, Math.min(steps.length - 1, i)); KU.step = i;
  KScene.stop();
  const body = $('#kStepBody'); if (!body) return;
  body.innerHTML = steps[i].html;
  $$('#kuralView .k-step').forEach((b, j) => { b.classList.toggle('on', j === i); b.classList.toggle('seen', j < i); b.setAttribute('aria-current', j === i ? 'step' : 'false'); });
  $('#kStepBack').hidden = i === 0;
  $('#kStepNext').hidden = steps[i].id === 'quiz';
  if (steps[i].id === 'quiz') kQuizStart(KU.n, KU.daily);
}
function kLessonDone(n, right, total){
  const fresh = !kLearned(n);
  if (fresh) kMarkLearned(n, $('#kStepBody'));
  const btn = $('#kuralView [data-k=learn]'); if (btn){ btn.disabled = true; btn.innerHTML = `✅ ${kPair(KT.learnedOk)}`; }
  $('#kStepBody').innerHTML = `<div class="k-done"><span class="k-done-ic" aria-hidden="true">🎉</span><b class="ta" lang="ta">${KT.lessonDone[0]}</b><small>${KT.lessonDone[1]} ✓ ${right}/${total}</small>
    <p class="k-acts">${n < K_TOTAL ? `<a class="btn primary k-step-next" href="#/k/${n + 1}">${kPair(KT.next)} →</a>` : ''}<button class="btn" type="button" data-k="step" data-i="0">🔁 ${kPair(KT.again)}</button></p></div>`;
  $('#kStepNext').hidden = true;
  if (fresh && !calm) confetti();
}

/* Knowledge check: the lesson's own questions, or — for Kurals without a lesson yet — questions made
   from the verified text itself (the missing word, the chapter), so every Kural has a check. */
function kQuestions(n){
  const L = kLesson(n);
  if (L && L.quiz) return L.quiz.map(([qta, qen, opts, ok]) => ({ q: [qta, qen], opts: opts.map((o, i) => ({ html: kPair(o), ok: i === ok })) }));
  return [KG.missingWordQ(n), KG.chapterQ(n)];
}
function kQuizStart(n, daily){
  const box = $('#kQuiz'); if (!box) return;
  const qs = kQuestions(n); let i = 0, right = 0;
  const next = () => {
    if (i >= qs.length){
      if (daily && kd().kDaily !== todayStr()){ kd().kDaily = todayStr(); kTouchDay(); Progress.save(); Progress.addTokens(3);
        celebrate('📅', KT.dailyDone[0], KT.dailyDone[1]); }
      kLessonDone(n, right, qs.length);
      return;
    }
    KG.mcq(box, qs[i++], ok => { if (ok) right++; }, next);
  };
  next();
}

/* ---------- "Read as a book": one Kural per page, 1 → 1,330 ----------
   Turn pages with the buttons, a swipe or the arrow keys. "Read to me" reads each page aloud and turns it.
   The open page is remembered per child (kBook); reading does not mark a Kural as learned. */
function kBookView(view, n){
  const c = kChOf(n), p = kPaalOf(c), [cta, cen] = kCh(c), [l1, l2, pope] = kText(n), L = kLesson(n);
  const d = kd(); d.kBook = n; Progress.save();
  const firstOfCh = n % 10 === 1, firstOfPaal = firstOfCh && c === p.from;
  view.innerHTML = kCrumbs(`📖 ${KT.book.title[1]}`) + `
    <div class="k-book-bar">
      <label class="k-book-jump">
        <select data-kb="jump" aria-label="${KT.book.goTo[1]}">${KU.book.ch.map(([ta], i) => `<option value="${i + 1}" ${i + 1 === c ? 'selected' : ''}>${i + 1}. ${ta}</option>`).join('')}</select></label>
      <span class="k-book-count">${KT.book.page[1]} <b>${n}</b> / 1,330</span>
    </div>
    <i class="k-bar k-book-prog" style="--p:${(n / K_TOTAL * 100).toFixed(2)}%" aria-hidden="true"></i>
    <article class="k-book-page k-paal-${p.id} ${calm ? '' : 'turn-' + (KU.dir || 'next')}" aria-label="${KT.kural[1]} ${n}">
      ${firstOfPaal ? `<p class="k-book-paal"><span aria-hidden="true">${p.ic}</span> <span lang="ta">${p.ta}</span> · ${p.en}</p>${p.older ? `<p class="k-older">🧑‍🤝‍🧑 ${kPair(KT.older)}</p>` : ''}` : ''}
      <header class="k-book-head ${firstOfCh ? 'first' : ''}"><small>${KT.chapter[1]} ${c} · ${n - c * 10 + 10}/10</small>
        <h3><span lang="ta">${cta}</span> <small>${cen}</small></h3></header>
      <p class="k-book-num" aria-hidden="true">${n}</p>
      <div class="k-book-lines" lang="ta"><p class="k-line">${l1}</p><p class="k-line">${l2}</p></div>
      <p class="k-book-mean">${L ? `<span class="ta" lang="ta">${L.ta}</span><small>${L.en}</small>` : `<small>${pope}</small>`}</p>
      <div class="k-book-foot"><a href="#/k/${n}">🌱 ${kPair(KT.book.learn)}</a></div>
    </article>
    <div class="k-book-ctl" role="group" aria-label="${KT.book.title[1]}">
      <button class="btn k-book-turn" type="button" data-k="bprev" ${n === 1 ? 'disabled' : ''} aria-label="${KT.book.prev[1]}">←<small class="ta" lang="ta">${KT.book.prev[0]}</small></button>
      <button class="btn" type="button" data-k="say">🔊 ${kPair(KT.listen)}</button>
      <button class="btn primary" type="button" data-k="bauto" aria-pressed="${!!KU.auto}">${KU.auto ? `⏸ ${kPair(KT.book.pause)}` : `▶ ${kPair(KT.book.auto)}`}</button>
      <button class="btn k-book-turn" type="button" data-k="bnext" ${n === K_TOTAL ? 'disabled' : ''} aria-label="${KT.book.next[1]}">→<small class="ta" lang="ta">${KT.book.next[0]}</small></button>
    </div>
    ${n === K_TOTAL ? `<p class="k-done"><span class="k-done-ic" aria-hidden="true">🎉</span>${kPair(KT.book.end)}</p>` : ''}
    <p class="muted k-book-hint">${kPair(KT.book.swipe)}</p>`;
  KU.n = n; KU.dir = '';
  if (KU.auto) kBookRead(n);
}
function kBookTurn(step){
  const n = KU.n + step; if (n < 1 || n > K_TOTAL) return false;
  KU.dir = step > 0 ? 'next' : 'prev'; kGo('book/' + n); return true;
}
/* Read this page aloud, wait a moment, then turn to the next page (until Pause, or the last page). */
function kBookRead(n){
  kRecite(n, 'normal', () => {
    if (!KU.auto || KU.n !== n) return;
    KU.timers.push(setTimeout(() => { if (KU.auto && KU.n === n && !kBookTurn(1)) kBookAuto(false); }, 1800));
  });
}
function kBookAuto(on){
  KU.auto = on;
  const b = $('#kuralView [data-k=bauto]');
  if (b){ b.setAttribute('aria-pressed', on); b.innerHTML = on ? `⏸ ${kPair(KT.book.pause)}` : `▶ ${kPair(KT.book.auto)}`; }
  if (on) kBookRead(KU.n); else kStop();
}
$('#kuralView').addEventListener('change', e => {
  if (e.target.matches('[data-kb=jump]')){ KU.dir = ''; kGo('book/' + (e.target.value * 10 - 9)); }
});
document.addEventListener('keydown', e => {
  if (kSub()[0] !== 'book' || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (e.key === 'ArrowRight' && kBookTurn(1)) e.preventDefault();
  else if (e.key === 'ArrowLeft' && kBookTurn(-1)) e.preventDefault();
});
{ let sx = null, sy = 0;
  $('#kuralView').addEventListener('touchstart', e => { if (kSub()[0] === 'book' && e.touches.length === 1){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; } else sx = null; }, { passive: true });
  $('#kuralView').addEventListener('touchend', e => {
    if (sx === null || !e.target.closest('.k-book-page')) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) kBookTurn(dx < 0 ? 1 : -1);
  }, { passive: true });
}

function kMarksView(view){
  const m = kd().kMarks.slice().sort((a, b) => a - b);
  view.innerHTML = kCrumbs(`⭐ ${KT.marks[1]}`) + `<h3>⭐ ${kPair(KT.marks)}</h3>` +
    (m.length ? `<ol class="k-list">${m.map(n => `<li><a class="k-item" href="#/k/${n}"><b class="k-num">${n}</b><span class="k-item-text"><span lang="ta" class="ta">${kText(n)[0]}<br>${kText(n)[1]}</span></span></a></li>`).join('')}</ol>`
      : `<p class="muted">${kPair(KT.noMarks)}</p>`);
}

/* Grown-up screen (English on purpose, like the Parent dashboard). */
function kParentsView(view){
  const d = kd(), learned = d.kLearned.slice().sort((a, b) => a - b);
  const chapters = []; for (let c = 1; c <= 133; c++){ const x = kChapterLearned(c); if (x) chapters.push([c, x]); }
  const next = (() => { for (let n = 1; n <= 1080; n++) if (!kLearned(n)) return n; return 0; })();
  const revise = shuffle(learned.slice()).slice(0, 3);
  const lessons = Object.keys(KURAL_LESSONS).length, reviewed = Object.values(KURAL_LESSONS).filter(L => L.review === 'reviewed').length;
  view.innerHTML = kCrumbs('👪 Parents & teachers') + `
    <h3>👪 Thirukkural — for parents and teachers</h3>
    <div class="k-stats">${kStat('✅', learned.length, KT.learned)}${kStat('📗', chapters.filter(([, x]) => x === 10).length, KT.chaptersDone)}
      ${kStat('❓', d.kAsked ? Math.round(100 * d.kRight / d.kAsked) + '%' : '–', ['வினா', `Quiz score (${d.kRight}/${d.kAsked})`])}${kStat('🔥', d.kBestDays, ['சிறந்த தொடர்', 'Best day streak'])}</div>
    <section class="k-card"><h4>What to do next</h4><ul>
      ${next ? `<li>Next new Kural: <a href="#/k/${next}">Kural ${next}</a> (${kCh(kChOf(next))[1]})</li>` : '<li>Every Kural of அறம் and பொருள் is learned. Wonderful!</li>'}
      ${revise.length ? `<li>Revise: ${revise.map(n => `<a href="#/k/${n}">Kural ${n}</a>`).join(', ')} — ask your child to say it and explain it in their own words.</li>` : ''}
      <li>Play <a href="#/games">Thirukkural games</a> on the Kurals already learned; they adapt to what your child has opened.</li></ul></section>
    <section class="k-card"><h4>Chapters in progress</h4>${chapters.length ? `<ul class="k-plist">${chapters.map(([c, x]) => `<li><a href="#/ch/${c}">${c}. <span lang="ta">${kCh(c)[0]}</span></a> — ${x}/10</li>`).join('')}</ul>` : '<p class="muted">No Kurals marked as learned yet.</p>'}</section>
    <section class="k-card"><h4>Bookmarked Kurals</h4>${d.kMarks.length ? d.kMarks.map(n => `<a href="#/k/${n}">${n}</a>`).join(' · ') : '<p class="muted">None yet.</p>'}</section>
    <section class="k-card"><h4>For the classroom</h4>
      <p><a href="#/print">🖨️ Print</a> makes worksheets for any chapter: the 10 couplets with meanings, copywork and a missing-word sheet with answers. <a href="#/certificate">🎓 Certificate</a> has a 10-question test per chapter. Every chapter also has a plain page for a projector: <a href="thirukkural-chapters.html">all 133 chapters</a>.</p>
      <p class="muted">About the content: the 1,330 couplets were checked against independent sources (Project Madurai, an open dataset and Tamil Wikisource). Child-friendly meanings, stories and quizzes exist so far for ${lessons} Kurals (${reviewed} reviewed by a Tamil teacher); they are written to simplify, never change, the traditional meaning. Progress is saved only on this device.</p></section>`;
}

/* ---------- one click handler for every screen ---------- */
$('#kuralView').addEventListener('click', e => {
  const b = e.target.closest('[data-k]'); if (!b) return;
  const act = b.dataset.k, n = KU.n;
  if (act === 'go') kGo(b.dataset.to);
  else if (act === 'retry') kRender();
  else if (act === 'say') kRecite(n, 'normal');
  else if (act === 'slow') kRecite(n, 'slow');
  else if (act === 'repeat') kRecite(n, 'repeat');
  else if (act === 'stop') kStop();
  else if (act === 'bprev') kBookTurn(-1);
  else if (act === 'bnext') kBookTurn(1);
  else if (act === 'bauto') kBookAuto(!KU.auto);
  else if (act === 'word'){ kStop(); kSay(b.dataset.w, true); }
  else if (act === 'share' && window.LTShare){ const [l1, l2] = kText(n);
    const root = LTShare.info().url.replace(/[^/]*$/, '');   // from the canonical link, so it is always the public site
    LTShare.open({ url: `${root}thirukkural-chapter-${kChOf(n)}.html#kural-${n}`,
      title: fmt(KT.shareTitle[1], { n }), text: `${fmt(KT.shareTitle[0], { n })}\n${l1}\n${l2}` }); }
  else if (act === 'mark'){
    const on = kToggleMark(n);
    $$('#kuralView [data-k=mark]').forEach(x => {
      if (x.classList.contains('k-star')){ x.textContent = on ? '⭐' : '☆'; x.setAttribute('aria-pressed', on); }
      else x.innerHTML = `⭐ ${kPair(on ? KT.saved : KT.bookmark)}`;
    });
  }
  else if (act === 'learn'){
    if (kMarkLearned(n, b)){ b.disabled = true; b.innerHTML = `✅ ${kPair(KT.learnedOk)}`; }
  }
  else if (act === 'step') kShowStep(+b.dataset.i);
  else if (act === 'stepnext') kShowStep(KU.step + 1);
  else if (act === 'stepback') kShowStep(KU.step - 1);
  else if (act === 'saymean'){ const L = kLesson(n); if (L){ kStop(); kSay(L.ta, false); } }
  else if (act === 'scene'){
    const L = kLesson(n); if (!L || !L.scene) return;
    kStop();
    KScene.play($('#kScene'), L.scene, { en: $('#kCapEn').checked, narrate: $('#kNarrate').checked });
  }
});
