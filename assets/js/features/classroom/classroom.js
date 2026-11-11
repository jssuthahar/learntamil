/* Learn Tamil — 🍎 Classroom, at #/classroom.
   Malar Akka stands beside a chalkboard and teaches three things (vowels, or words from a topic) while three
   classmates listen, ask questions, say the words with her and help when the child is stuck. Every line is
   spoken (device Tamil voice; the children speak a little higher) and shown in a speech bubble with English
   under it. The lesson ends with a tap game on the board: a wrong tap gets a classmate's kind hint, never a buzzer.
   Text: TEXT.classroom (data/messages.js). Characters: CRArt (features/classroom/characters.js).
   Uses: $, $$, fmt, shuffle, rand, confetti, speak, sayItem, stopAudio, uyir, TOPICS, Rewards, Progress, addStar, calm. */
'use strict';

const CRT = TEXT.classroom;
const CR = { run: 0, lesson: null, items: null, timers: new Set(), waiters: new Set(), skip: null, replay: null, kid: 0 };
const CR_STOP = { stop: true };
const CR_TOPICS = ['animals', 'birds', 'food', 'colours', 'numbers', 'body', 'vehicles', 'shapes', 'family'];

/* ---------- Lessons, built from the letter and word data ---------- */
const crVowel = v => ({ key: v.l, big: v.l, pic: v.ex[0], word: v.ex[1], en: v.ex[2],
  line: [fmt(CRT.letterIs[0], { l: v.l, word: v.ex[1] }), fmt(CRT.letterIs[1], { r: v.r, word: v.ex[1], en: v.ex[2] })],
  name: v.l, say: done => sayItem(v, done), sayName: done => sayItem(v, done), sayWord: done => speak(v.ex[1], done, 1.45) });
const crWord = ([w, pic, en]) => { en = String(en).split(' · ')[0];
  return { key: w, pic, word: w, en, line: [fmt(CRT.wordIs[0], { word: w }), fmt(CRT.wordIs[1], { word: w, en })],
    name: w, say: done => speak(fmt(CRT.wordIs[0], { word: w }), done), sayName: done => speak(w, done), sayWord: done => speak(w, done, 1.45) }; };
/* Each lesson: items() = the three things taught; pool() = everything in its set (decoys for the games). */
function crLessons(){
  const out = [];
  for (let i = 0; i < uyir.length; i += 3){
    const group = uyir.slice(i, i + 3);
    out.push({ id: 'v' + i, ic: group[0].l, ta: group.map(v => v.l).join(' '), en: CRT.vowelsTopic[1], letters: true,
      topic: CRT.vowelsTopic, items: () => group.map(crVowel), pool: () => uyir.map(crVowel) });
  }
  CR_TOPICS.map(id => TOPICS.find(t => t.id === id)).filter(Boolean).forEach(t => out.push({
    id: 't-' + t.id, ic: t.ic, ta: t.ta, en: t.en, topic: [t.ta, t.en.toLowerCase()],
    pool: () => t.words.map(crWord), items(){ return shuffle(this.pool()).slice(0, 3); } }));
  return out;
}
let crAll = null;
const crList = () => crAll || (crAll = crLessons());

/* ---------- Stage: who is where ---------- */
const crTeacher = () => $('#crTeacher');
const crKid = i => $$('#crKids .cr-kid')[i];
function crPose(el, cls, on){ if (el) el.classList.toggle(cls, on); }
function crGesture(g){
  const t = crTeacher(); if (!t) return;
  ['wave', 'point', 'open', 'happy'].forEach(c => t.classList.toggle(c, c === g));
}
function crClearPoses(){
  $$('#classroom .cr-char').forEach(c => c.classList.remove('talk', 'wave', 'point', 'open', 'happy', 'raise', 'cheer', 'cover'));
}
function crBubble(who, line){
  const b = $('#crBubble'); if (!b) return;
  const name = who === 't' ? CRT.teacher : who === 'all' ? CRT.all : who === 'you' ? CRT.you : CRT.kids[who];
  b.className = 'cr-bubble from-' + (who === 't' ? 't' : 'k');
  b.innerHTML = `<b class="cr-who">${CRArt.badge(who)}<span lang="ta">${name[0]}</span> <small>${name[1]}</small></b>
    <span class="cr-ta" lang="ta">${line[0]}</span><small class="cr-en">${line[1]}</small>`;
  if (!calm){ b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
}

/* ---------- Timing helpers that stop when the child leaves ---------- */
function crCheck(my){ if (my !== CR.run) throw CR_STOP; }
function crSleep(my, ms){
  return new Promise((res, rej) => {
    const w = () => rej(CR_STOP); CR.waiters.add(w);
    const t = setTimeout(() => { CR.timers.delete(t); CR.waiters.delete(w); my === CR.run ? res() : rej(CR_STOP); }, ms);
    CR.timers.add(t);
  });
}
function crHush(){ try { speechSynthesis.cancel(); } catch (e) {} try { stopAudio(); } catch (e) {} }
function crStop(){
  CR.run++; crHush();
  CR.timers.forEach(clearTimeout); CR.timers.clear();
  CR.waiters.forEach(w => w()); CR.waiters.clear();
  CR.skip = CR.replay = null; crClearPoses();
}

/* One spoken line. who: 't' (teacher), 0–2 (a classmate), 'all' (every classmate together).
   opts: { g: teacher gesture, audio(done): what to play instead of reading line[0] }. Resolves when it has been said. */
function crSay(my, who, line, opts = {}){
  crCheck(my);
  return new Promise((res, rej) => {
    const stopW = () => rej(CR_STOP); CR.waiters.add(stopW);
    const speakers = who === 't' ? [crTeacher()] : who === 'all' ? $$('#crKids .cr-kid') : [crKid(who)];
    const pitch = who === 't' ? undefined : who === 'all' ? 1.3 : 1.45;
    const audio = opts.audio || (done => speak(line[0], done, pitch));
    crBubble(who, line);
    if (who === 't') crGesture(opts.g || null);
    else if (opts.raise) crPose(speakers[0], 'raise', true);
    const t0 = Date.now(), minMs = calm ? 700 : 900 + line[0].length * 40;
    let token = 0, ended = false, safety = 0;
    const talk = on => speakers.forEach(s => crPose(s, 'talk', on));
    const fin = now => {
      if (ended) return; ended = true; clearTimeout(safety); talk(false);
      CR.skip = CR.replay = null;
      const wait = now ? 0 : Math.max(350, minMs - (Date.now() - t0));
      const t = setTimeout(() => {
        CR.timers.delete(t); CR.waiters.delete(stopW);
        speakers.forEach(s => crPose(s, 'raise', false));
        my === CR.run ? res() : rej(CR_STOP);
      }, wait);
      CR.timers.add(t);
    };
    const play = () => {
      const k = ++token; talk(true); clearTimeout(safety);
      // Some browsers never report the end of speech: move on anyway after a generous wait.
      safety = setTimeout(() => { if (k === token) fin(); }, 4500 + line[0].length * 160);
      audio(() => { if (k === token && my === CR.run) fin(); });
    };
    CR.skip = () => { token++; crHush(); fin(true); };
    CR.replay = () => { if (!ended){ crHush(); play(); } };
    play();
  });
}
const crNextKid = () => (CR.kid = (CR.kid + 1) % CRArt.count);

/* ---------- The chalkboard ---------- */
function crBoardItem(it){
  $('#crBoard').innerHTML = `<div class="cr-item${it.big ? ' is-letter' : ''}">
    <span class="cr-pic" aria-hidden="true">${it.pic}</span>
    ${it.big ? `<b class="cr-big" lang="ta">${it.big}</b>` : ''}
    <span class="cr-word" lang="ta">${it.word}</span><small class="cr-word-en">${it.en}</small></div>`;
}
function crBoardTurn(){
  $('#crBoard').innerHTML = `<div class="cr-turn"><span aria-hidden="true">🗣️</span><b lang="ta">${CRT.youSay[0]}</b><small>${CRT.youSay[1]}</small></div>`;
}
function crBoardMenu(){
  const done = (Progress.d.classroomDone || []);
  $('#crBoard').innerHTML = `<div class="cr-menu" role="group" aria-label="${CRT.pick[1]}">${crList().map((L, i) => `<button class="cr-lesson${L.letters ? ' is-letters' : ''}" type="button" data-i="${i}">
      <span class="cr-l-ic" aria-hidden="true"${L.letters ? ' lang="ta"' : ''}>${L.ic}</span>
      <b lang="ta">${L.ta}</b><small>${L.en}</small>${done.includes(L.id) ? '<i class="cr-l-done" aria-label="done">✓</i>' : ''}</button>`).join('')}</div>`;
  $$('#crBoard .cr-lesson').forEach(b => b.addEventListener('click', () => { Rewards.sfx.tap(); crStart(+b.dataset.i); }));
}
function crBoardEnd(i){
  const L = crList();
  $('#crBoard').innerHTML = `<div class="cr-end"><span class="cr-trophy" aria-hidden="true">🏆</span>
    <div class="cr-end-btns">
      <button class="btn" type="button" data-act="again">🔁 <span lang="ta">${CRT.again[0]}</span> <small>${CRT.again[1]}</small></button>
      <button class="btn" type="button" data-act="games">🎲 <span lang="ta">${CRT.moreGames[0]}</span> <small>${CRT.moreGames[1]}</small></button>
      <button class="btn primary" type="button" data-act="next">➡️ <span lang="ta">${CRT.next[0]}</span> <small>${CRT.next[1]}</small></button>
      <button class="btn" type="button" data-act="menu">📚 <span lang="ta">${CRT.lessons[0]}</span> <small>${CRT.lessons[1]}</small></button>
    </div></div>`;
  $$('#crBoard [data-act]').forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.act;
    if (a === 'again') crStart(i); else if (a === 'games') crStart(i, true); else if (a === 'next') crStart((i + 1) % L.length); else crMenu();
  }));
}

/* ---------- Games on the chalkboard ----------
   crQuiz: shows `top` (optional) and answer buttons; resolves when the right one is tapped.
   A wrong tap: soft sound, then a classmate helps (hint line + audio) and the right button glows. Never a buzzer or a timer. */
const crOptHtml = it => `<button class="cr-opt${it.big ? ' is-letter' : ''}" type="button" data-k="${it.key}" aria-label="${it.big || it.word}">
  <span class="cr-pic" aria-hidden="true">${it.pic}</span>${it.big ? `<b lang="ta">${it.big}</b>` : ''}</button>`;
function crQuiz(my, { top = '', opts, right, q, qAudio, hint, reveal, cls = '' }){
  crCheck(my); CR.right = right;   // CR.right: the answer, read by the smoke test
  $('#crBoard').innerHTML = `${top}<div class="cr-opts ${cls}">${opts.join('')}</div>`;
  return new Promise((res, rej) => {
    const stopW = () => rej(CR_STOP); CR.waiters.add(stopW);
    let locked = false;
    $$('#crBoard .cr-opt').forEach(b => b.addEventListener('click', () => {
      if (locked || my !== CR.run) return;
      if (b.dataset.k === right){
        locked = true; CR.skip && CR.skip();
        b.classList.add('right'); if (reveal) b.insertAdjacentHTML('beforeend', reveal);
        crGesture('happy'); crPose(crTeacher(), 'talk', true);
        $$('#crKids .cr-kid').forEach(k => crPose(k, 'cheer', true));
        let moved = false;
        const after = () => {
          if (moved) return; moved = true;
          crPose(crTeacher(), 'talk', false);
          $$('#crKids .cr-kid').forEach(k => crPose(k, 'cheer', false));
          CR.waiters.delete(stopW);
          my === CR.run ? res() : rej(CR_STOP);
        };
        Rewards.win(b, { after });
        setTimeout(after, 5000);   // in case the praise is never reported as spoken
      } else {
        Rewards.miss();
        b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
        const good = $$('#crBoard .cr-opt').find(x => x.dataset.k === right);
        const h = hint || { line: CRT.kidHint };
        crSay(my, crNextKid(), h.line, { raise: true, audio: h.audio }).then(() => {
          if (locked) return;
          if (good){ good.classList.remove('hint'); void good.offsetWidth; good.classList.add('hint'); }
        }).catch(() => {});
      }
    }));
    crSay(my, 't', q, { g: 'open', audio: qAudio }).catch(() => {});
  });
}
// Two things from the same set that are not on the board (pictures must differ too).
const crDecoys = (pool, not, n = 2) => shuffle(pool.filter(p => !not.some(x => x.key === p.key || x.pic === p.pic))).slice(0, n);

const CR_GAMES = {
  /* 🎯 Where is it? The teacher says the word; tap its picture. */
  async find(my, it, items){
    const q = [fmt(CRT.whereIs[0], { word: it.name }), fmt(CRT.whereIs[1], { word: it.big ? it.big : it.word + ' (' + it.en + ')' })];
    await crQuiz(my, { opts: shuffle(items.slice()).map(crOptHtml), right: it.key, q,
      reveal: it.big ? '' : `<b lang="ta">${it.word}</b>`,
      hint: { line: CRT.kidHint } });
  },
  /* 📖 Read and pick: only the written word (or, for vowels, the letter) is shown and nothing is said. */
  async read(my, it, items){
    const top = `<div class="cr-read" lang="ta">${it.big || it.word}</div>`;
    const pics = shuffle(items.slice()).map(x => `<button class="cr-opt" type="button" data-k="${x.key}" aria-label="${x.en}"><span class="cr-pic" aria-hidden="true">${x.pic}</span></button>`);
    await crQuiz(my, { top, opts: pics, right: it.key, cls: 'is-small', q: it.big ? CRT.letterWhich : CRT.readWhich,
      reveal: `<b lang="ta">${it.word}</b>`,
      hint: { line: [fmt(CRT.kidReads[0], { word: it.word }), fmt(CRT.kidReads[1], { word: it.word })], audio: it.sayWord } });
  },
  /* 🔍 What's missing? Look, close your eyes, one picture goes away, find it among two new ones. */
  async missing(my, it, items, pool){
    const row = list => `<div class="cr-row">${list.map(x => `<span class="cr-cell" aria-hidden="true">${x ? x.pic : '❓'}</span>`).join('')}</div>`;
    $('#crBoard').innerHTML = row(items);
    await crSay(my, 't', CRT.lookCarefully, { g: 'point' });
    await crSleep(my, calm ? 1500 : 2200);
    $('#crBoard').innerHTML = `<div class="cr-curtain" aria-hidden="true">🙈</div>`;
    $$('#crKids .cr-kid').forEach(k => crPose(k, 'cover', true));
    await crSay(my, 't', CRT.closeEyes, { g: 'open' });
    await crSleep(my, 900);
    $$('#crKids .cr-kid').forEach(k => crPose(k, 'cover', false));
    const opts = shuffle([it, ...crDecoys(pool, items)]).map(crOptHtml);
    await crQuiz(my, { top: row(items.map(x => x === it ? null : x)), opts, right: it.key, cls: 'is-small', q: CRT.whatMissing,
      reveal: it.big ? '' : `<b lang="ta">${it.word}</b>` });
  },
  /* 👍👎 Is my friend right? A classmate names the picture — sometimes wrongly — and the child decides. */
  async truth(my, it, items){
    const wrong = shuffle(items.filter(x => x.key !== it.key))[0];
    const honest = !wrong || Math.random() < .5, said = honest ? it : wrong;
    const k = crNextKid(), kn = CRT.kids[k];
    crBoardItem({ pic: it.pic, word: '', en: '' });
    await crSay(my, k, [fmt(CRT.kidClaim[0], { word: said.word }), fmt(CRT.kidClaim[1], { word: said.word })], { raise: true });
    const btn = (key, ic, t) => `<button class="cr-opt cr-yn" type="button" data-k="${key}" aria-label="${t[1]}"><span class="cr-pic" aria-hidden="true">${ic}</span><b lang="ta">${t[0]}</b><small>${t[1]}</small></button>`;
    await crQuiz(my, { top: `<div class="cr-item"><span class="cr-pic" aria-hidden="true">${it.pic}</span></div>`,
      opts: [btn('yes', '👍', CRT.yes), btn('no', '👎', CRT.no)], right: honest ? 'yes' : 'no', cls: 'is-yn',
      q: [fmt(CRT.isRight[0], { name: kn[0] }), fmt(CRT.isRight[1], { name: kn[1] })] });
    crBoardItem(it);
    if (honest) await crSay(my, 't', [fmt(CRT.kidWasRight[0], { name: kn[0] }), fmt(CRT.kidWasRight[1], { name: kn[1] })], { g: 'happy' });
    else {
      await crSay(my, 't', [fmt(CRT.actually[0], { word: it.word }), fmt(CRT.actually[1], { word: it.word, en: it.en })], { g: 'point' });
      await crSay(my, k, CRT.kidThanks);
    }
  }
};
/* Three rounds, three different games; "Where is it?" (the easiest) always comes first. */
async function crGames(my, L, items){
  const kinds = ['find', ...shuffle(['read', 'missing', 'truth'])].slice(0, 3);
  const order = shuffle(items.slice()), pool = L.pool();
  for (let n = 0; n < 3; n++) await CR_GAMES[kinds[n]](my, order[n % order.length], items, pool);
}

/* ---------- One lesson ---------- */
async function crLesson(my, i, gamesOnly){
  const L = crList()[i], items = CR.items && gamesOnly ? CR.items : L.items();
  CR.items = items;
  CR.lesson = i; CR.kid = rand(CRArt.count);
  $('#crCtrl').hidden = false;
  if (!gamesOnly){
  crBoardItem({ pic: '👋', word: CRT.hello[0], en: CRT.hello[1] });
  await crSay(my, 't', CRT.hello, { g: 'wave' });
  await crSay(my, 'all', CRT.kidsHello);
  await crSay(my, 't', [fmt(CRT.today[0], { topic: L.topic[0] }), fmt(CRT.today[1], { topicEn: L.topic[1] })], { g: 'open' });
  for (let n = 0; n < items.length; n++){
    const it = items[n];
    crBoardItem(it);
    if (n === 0) await crSay(my, crNextKid(), CRT.kidAsk, { raise: true });
    await crSay(my, 't', it.line, { g: 'point', audio: it.say });
    if (n === 1){
      await crSay(my, crNextKid(), CRT.kidAgain, { raise: true });
      await crSay(my, 't', CRT.sureAgain, { g: 'open' });
      await crSay(my, 't', it.line, { g: 'point', audio: it.say });
    }
    if (n === 2) await crSay(my, crNextKid(), [fmt(CRT.kidSays[0], { word: it.name }), fmt(CRT.kidSays[1], { word: it.word })], { raise: true });
    await crSay(my, 't', CRT.together, { g: 'open' });
    await crSay(my, 'all', [it.name, it.en], { audio: done => speak(it.name, done, 1.3) });
    await crSay(my, 't', CRT.youSay, { g: 'point' });
    crBoardTurn();
    await crSleep(my, calm ? 1500 : 2200);
    if (L.letters) Progress.track('letter', it.key);
  }
  }
  crBoardItem({ pic: '🎲', word: CRT.gameTime[0], en: CRT.gameTime[1] });
  await crSay(my, 't', CRT.gameTime, { g: 'wave' });
  await crGames(my, L, items);
  crBoardEnd(i);
  crGesture('happy'); confetti();
  $$('#crKids .cr-kid').forEach(k => crPose(k, 'cheer', true));
  Progress.track('classroom', L.id); addStar(3);
  await crSay(my, 't', CRT.done, { g: 'happy' });
  await crSay(my, 'all', CRT.kidsBye);
  crClearPoses();
  $('#crCtrl').hidden = true;
}
function crStart(i, gamesOnly = false){
  crStop();
  if (!gamesOnly) CR.items = null;
  const my = CR.run;
  crLesson(my, i, gamesOnly).catch(e => { if (e !== CR_STOP) console.error(e); });
}
function crMenu(){
  crStop(); CR.lesson = null;
  $('#crCtrl').hidden = true;
  crBoardMenu();
  const my = CR.run;
  crSay(my, 't', CRT.pick, { g: 'wave' }).catch(() => {});
}

/* ---------- Set up once ---------- */
(function(){
  $('#crTeacher').innerHTML = CRArt.teacher();
  $('#crKids').innerHTML = CRT.kids.map((n, i) =>
    `<figure class="cr-char cr-kid" style="--d:${i * 0.7}s">${CRArt.kid(i)}<figcaption><span lang="ta">${n[0]}</span> <small>${n[1]}</small></figcaption></figure>`).join('');
  $('#crRepeat').addEventListener('click', () => CR.replay && CR.replay());
  $('#crSkip').addEventListener('click', () => CR.skip && CR.skip());
  $('#crEnd').addEventListener('click', () => { Rewards.sfx.tap(); crMenu(); });
  // Tapping a classmate makes them wave hello.
  $$('#crKids .cr-kid').forEach(k => k.addEventListener('click', () => { if (calm) return; k.classList.remove('cheer'); void k.offsetWidth; k.classList.add('cheer'); setTimeout(() => k.classList.remove('cheer'), 1200); }));
})();
document.addEventListener('lt:section', e => {
  const on = e.detail === 'classroom';
  document.body.classList.toggle('classroom-on', on);
  if (on) setTimeout(crMenu, 250); else if (CR.run) crStop();
});
