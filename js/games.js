/* Learn Tamil — Reading practice and Games hub.
   Uses helpers from app.js: $, $$, rand, shuffle, sayItem, sayLetter, speak,
   sparkle, confetti, addStar, lettersOf, setQuizMode, PRAISE. */
'use strict';

const praise = ()=>PRAISE[rand(PRAISE.length)];
const say1 = l => sayLetter(l, l.endsWith(PULLI) ? 'இ'+l : l);   // one letter, recording first
function fb(el, text, kind){ el.textContent = text; el.className = 'feedback' + (kind ? ' '+kind : ''); }
function wordLevel(w){ const n = lettersOf(w).length; return n <= 2 ? 1 : n === 3 ? 2 : 3; }

/* =====================================================================
   READING PRACTICE
   ===================================================================== */
const R = { level:1, idx:0, list:[], token:0 };
function buildReadList(){ R.list = WORDS.filter(w=>wordLevel(w[0])===R.level); R.idx = 0; renderRead(); }
function renderRead(){
  if (!R.list.length) buildReadList();
  R.token++;
  const [w, emo, mean] = R.list[R.idx];
  $('#readPos').textContent = `Word ${R.idx+1} of ${R.list.length}`;
  const box = $('#readWord'); box.innerHTML = '';
  lettersOf(w).forEach(l=>{
    const s = document.createElement('button'); s.type='button'; s.className='rl'; s.textContent=l;
    s.addEventListener('click', ()=>{ R.token++; flash(s); say1(l); });
    box.appendChild(s);
  });
  $('#readAns').hidden = true; $('#readReveal').hidden = false;
  $('#readEmoji').textContent = emo; $('#readMean').textContent = mean;
  $('#readPrev').disabled = R.idx===0;
  const dots = $('#readDots'); dots.innerHTML = '';
  dots.style.setProperty('--p', ((R.idx+1)/R.list.length*100)+'%');
  const card = $('.readcard'); card.classList.remove('turn'); void card.offsetWidth; card.classList.add('turn');
}
function flash(el){ el.classList.remove('lit'); void el.offsetWidth; el.classList.add('lit'); }
function readSlow(){
  const t = ++R.token, chips = $$('#readWord .rl'); let k = 0;
  const step = ()=>{
    if (t !== R.token) return;
    if (k < chips.length){ const c = chips[k++]; flash(c); say1(c.textContent); setTimeout(step, 900); return; }
    setTimeout(()=>{ if (t===R.token){ chips.forEach(flash); speak(R.list[R.idx][0]); } }, 300);
  };
  step();
}
function reveal(){ $('#readReveal').hidden = true; $('#readAns').hidden = false; sparkle($('#readEmoji')); speak(R.list[R.idx][0]); }
$('#readReveal').addEventListener('click', reveal);
$('#readSlow').addEventListener('click', readSlow);
$('#readSay').addEventListener('click', ()=>{ R.token++; speak(R.list[R.idx][0]); });
$('#readPrev').addEventListener('click', ()=>{ if (R.idx>0){ R.idx--; renderRead(); } });
$('#readNext').addEventListener('click', ()=>{ R.idx = (R.idx+1) % R.list.length; renderRead(); });
$('#readDone').addEventListener('click', e=>{
  Rewards.cheer(e.currentTarget, false); addStar(1); Progress.track('word');
  if ($('#readAns').hidden) reveal();
  if (R.idx === R.list.length-1) confetti();
  setTimeout(()=>{ R.idx = (R.idx+1) % R.list.length; renderRead(); }, 1100);
});
$$('#readLevels .seg-btn').forEach(b=>b.addEventListener('click', ()=>{
  R.level = +b.dataset.level;
  $$('#readLevels .seg-btn').forEach(x=>x.setAttribute('aria-pressed', x===b));
  buildReadList();
}));

/* =====================================================================
   GAMES HUB
   ===================================================================== */
let game = 'build';
function showGame(g){
  game = g;
  Rewards.score.reset(g);
  $$('#gamePick .gcard').forEach(c=>c.setAttribute('aria-pressed', c.dataset.game===g));
  stopBalloon();
  const panelId = (g==='build' || g==='listen') ? 'g-quiz' : 'g-'+g;
  $$('#practice .game').forEach(x=>x.hidden = x.id !== panelId);
  if (g==='build' || g==='listen') setQuizMode(g);
  if (g==='spin') initSpin();
  if (g==='balloon') resetBalloon();
  if (g==='words') newWord();
  if (g==='memory') newMemory();
}
$$('#gamePick .gcard').forEach(c=>c.addEventListener('click', ()=>showGame(c.dataset.game)));
document.addEventListener('lt:section', e=>{
  if (e.detail === 'practice') showGame(game); else stopBalloon();
  if (e.detail === 'reading') renderRead();
});

/* ---------- 🎡 Spin wheel (12 vowels) ---------- */
const WHEEL_COLORS = ['#1769d1','#e0480c','#0b8a6c','#7c3aed','#d97706','#db2777'];
let wheelRot = 0, spinning = false, spinIdx = -1, wheelBuilt = false;
function pt(r, deg){ const a = deg*Math.PI/180; return [ (r*Math.sin(a)).toFixed(2), (-r*Math.cos(a)).toFixed(2) ]; }
function initSpin(){
  if (!wheelBuilt){
    const svg = $('#wheel'); let html = '';
    VOWELS.forEach((v,i)=>{
      const c = i*30, [x1,y1] = pt(100, c-15), [x2,y2] = pt(100, c+15), [tx,ty] = pt(70, c);
      html += `<path d="M0 0 L${x1} ${y1} A100 100 0 0 1 ${x2} ${y2} Z" fill="${WHEEL_COLORS[i%6]}" stroke="#fff" stroke-width="2"/>`;
      html += `<text x="${tx}" y="${ty}" transform="rotate(${c} ${tx} ${ty})" text-anchor="middle" dominant-baseline="central" class="wheel-t">${v.l}</text>`;
    });
    html += '<circle r="100" fill="none" stroke="#fff" stroke-width="4"/>';
    svg.innerHTML = html; wheelBuilt = true;
  }
  $('#spinQ').hidden = true; fb($('#spinFb'), '');
}
function spin(){
  if (spinning) return;
  spinning = true; $('#spinBtn').disabled = true; $('#spinQ').hidden = true; fb($('#spinFb'), '');
  spinIdx = rand(12);
  const want = (360 - spinIdx*30) % 360, jitter = rand(17) - 8;
  const base = wheelRot - (wheelRot % 360);
  wheelRot = base + 360*5 + want + jitter;
  const svg = $('#wheel');
  if (calm){ svg.style.transition = 'none'; svg.style.transform = `rotate(${wheelRot}deg)`; landed(); return; }
  svg.style.transform = `rotate(${wheelRot}deg)`;
}
function landed(){
  spinning = false; $('#spinBtn').disabled = false;
  const v = VOWELS[spinIdx];
  $('#spinLetter').textContent = v.l;
  sayItem(uyir[spinIdx]);
  const others = shuffle(VOWELS.map((_,i)=>i).filter(i=>i!==spinIdx)).slice(0,2);
  const box = $('#spinOpts'); box.innerHTML = '';
  shuffle([spinIdx, ...others]).forEach((i,oi)=>{
    const [emo, word, mean] = VOWELS[i].ex;
    const b = document.createElement('button'); b.type='button'; b.className='tile picopt f-uyir'; b.style.setProperty('--d', (oi*90)+'ms');
    b.innerHTML = `<span class="pe" aria-hidden="true">${emo}</span><span class="pw" lang="ta">${word}</span><span class="r">${mean}</span>`;
    b.addEventListener('click', ()=>{
      if (i === spinIdx){
        b.classList.add('right');
        const r = Rewards.win(b, { after: ()=>speak(word) }); Progress.track('spin');
        fb($('#spinFb'), `${r.ta} ${word} — ${v.l}`, 'ok');
        box.querySelectorAll('button').forEach(x=>x.disabled = true);
      } else { b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); Rewards.miss(); fb($('#spinFb'), 'பரவாயில்லை, மீண்டும் முயற்சி செய்!', 'bad'); setTimeout(()=>speak(word), 300); }
    });
    box.appendChild(b);
  });
  $('#spinQ').hidden = false;
}
$('#wheel').addEventListener('transitionend', e=>{ if (e.propertyName==='transform' && spinning) landed(); });
$('#spinBtn').addEventListener('click', spin);

/* ---------- 🎈 Balloon pop ---------- */
const BAL_COLORS = ['#ff5e7e','#ffb020','#2eb67d','#3b82f6','#a855f7','#f97316'];
const BAL_POOL = [...uyir, ...uyirmei.flat()];
const B = { on:false, score:0, time:40, target:null, hits:0, spawnT:0, tickT:0 };
function resetBalloon(){
  stopBalloon();
  $('#balSky').querySelectorAll('.balloon').forEach(b=>b.remove());
  $('#balStart').hidden = false; $('#balScore').textContent = '0'; $('#balTime').textContent = '40';
  $('#balBar').style.width = '100%';
  B.target = uyir[rand(12)]; $('#balTarget').textContent = B.target.l;
}
function stopBalloon(){ B.on = false; clearInterval(B.spawnT); clearInterval(B.tickT); }
function newTarget(){
  let t; do { t = BAL_POOL[rand(BAL_POOL.length)]; } while (B.target && t.l === B.target.l);
  B.target = t; const el = $('#balTarget'); el.textContent = t.l; flash(el); sayItem(t);
}
function startBalloon(){
  resetBalloon(); $('#balStart').hidden = true;
  B.on = true; B.score = 0; B.time = 40; B.hits = 0;
  newTarget();
  spawnBalloon(); B.spawnT = setInterval(spawnBalloon, 750);
  B.tickT = setInterval(()=>{
    B.time--; $('#balTime').textContent = B.time; $('#balBar').style.width = (B.time/40*100)+'%';
    if (B.time <= 0) endBalloon();
  }, 1000);
}
function spawnBalloon(){
  if (!B.on) return;
  const sky = $('#balSky');
  const isT = Math.random() < 0.38;
  let item = B.target;
  if (!isT){ do { item = BAL_POOL[rand(BAL_POOL.length)]; } while (item.l === B.target.l); }
  const b = document.createElement('button'); b.type='button'; b.className='balloon';
  b.textContent = item.l; b.lang = 'ta';
  b.style.setProperty('--c', BAL_COLORS[rand(BAL_COLORS.length)]);
  b.style.left = (4 + Math.random()*80) + '%';
  b.style.setProperty('--dur', (5.2 + Math.random()*2.3) + 's');
  b.style.setProperty('--sway', (Math.random()*30 - 15) + 'px');
  b.addEventListener('animationend', e=>{ if (e.animationName==='rise') b.remove(); });
  b.addEventListener('click', ()=>{
    if (!B.on || b.classList.contains('popped')) return;
    if (b.textContent === B.target.l){
      b.classList.add('popped'); B.score++; B.hits++;
      $('#balScore').textContent = B.score;
      Rewards.sfx.pop(); Rewards.win(b, { quiet: true });
      setTimeout(()=>b.remove(), 300);
      if (B.hits >= 3){ B.hits = 0; newTarget(); }
    } else { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); Rewards.miss(); }
  });
  sky.appendChild(b);
}
function endBalloon(){
  stopBalloon();
  $('#balSky').querySelectorAll('.balloon').forEach(b=>b.remove());
  const s = $('#balStart'); s.hidden = false;
  s.querySelector('p').innerHTML = `<span class="ta">${B.score >= 6 ? 'அருமை!' : 'நன்று!'}</span><br><b class="bal-final">🎈 ${B.score}</b><br><small class="muted">balloons popped</small>`;
  $('#balGo').textContent = '↻ Play again';
  Progress.track('balloon', B.score);
  if (B.score >= 6) Rewards.win($('#balSky'), { big: true, points: 20 });
}
$('#balGo').addEventListener('click', startBalloon);

/* ---------- 🧩 Word builder ---------- */
const W = { word:null, letters:[], filled:0, done:false };
function newWord(){
  const pool = WORDS.filter(w=>wordLevel(w[0]) <= 2 || Math.random() < 0.35);
  let next; do { next = pool[rand(pool.length)]; } while (W.word && next[0] === W.word[0]);
  W.word = next; W.letters = lettersOf(next[0]); W.filled = 0; W.done = false;
  $('#wbEmoji').textContent = next[1]; $('#wbMean').textContent = next[2];
  const slots = $('#wbSlots'); slots.innerHTML = '';
  W.letters.forEach(()=>{ const s = document.createElement('span'); s.className='slot'; slots.appendChild(s); });
  const tiles = $('#wbTiles'); tiles.innerHTML = '';
  let order = shuffle(W.letters.map((_,i)=>i));
  if (W.letters.length > 1 && order.every((v,i)=>v===i)) order.reverse();   // never already solved
  order.forEach((i,k)=>{
    const t = document.createElement('button'); t.type='button'; t.className='wtile'; t.textContent = W.letters[i];
    t.style.setProperty('--d', (k*70)+'ms');
    t.addEventListener('click', ()=>placeTile(t));
    tiles.appendChild(t);
  });
  fb($('#wbFb'), '');
}
function placeTile(t){
  if (W.done || t.disabled) return;
  if (t.textContent === W.letters[W.filled]){
    const slot = $$('#wbSlots .slot')[W.filled];
    slot.textContent = t.textContent; slot.classList.add('filled');
    t.disabled = true; t.classList.add('used'); Rewards.sfx.tick(); say1(t.textContent);
    W.filled++;
    if (W.filled === W.letters.length){
      W.done = true; Progress.track('built');
      const r = Rewards.win($('#wbSlots'), { big: true, points: 20, after: ()=>speak(W.word[0]) });
      fb($('#wbFb'), `${r.ta} ${W.word[0]}`, 'ok');
    }
  } else {
    t.classList.remove('nope'); void t.offsetWidth; t.classList.add('nope'); Rewards.miss();
    fb($('#wbFb'), 'பரவாயில்லை, மீண்டும் முயற்சி செய்!', 'bad');
  }
}
$('#wbHear').addEventListener('click', ()=>W.word && speak(W.word[0]));
$('#wbNext').addEventListener('click', newWord);

/* ---------- 🃏 Memory: vowel ↔ picture word ---------- */
const M = { open:[], matched:0, moves:0, lock:false };
function newMemory(){
  const picks = shuffle(VOWELS.map((_,i)=>i)).slice(0,6);
  const cards = shuffle(picks.flatMap(i=>[{i, kind:'l'}, {i, kind:'p'}]));
  M.open = []; M.matched = 0; M.moves = 0; M.lock = false;
  $('#memMoves').textContent = '0'; fb($('#memFb'), '');
  const g = $('#memGrid'); g.innerHTML = '';
  cards.forEach((c,k)=>{
    const v = VOWELS[c.i];
    const b = document.createElement('button'); b.type='button'; b.className='mcard';
    b.style.setProperty('--d', (k*40)+'ms');
    b.setAttribute('aria-label', 'Hidden card');
    b.innerHTML = `<span class="mface mback" aria-hidden="true">?</span><span class="mface mfront ${c.kind==='l'?'is-l':'is-p'}" lang="ta">` +
      (c.kind==='l' ? v.l : `<span class="pe">${v.ex[0]}</span><span class="pw">${v.ex[1]}</span>`) + '</span>';
    b.addEventListener('click', ()=>flip(b, c));
    g.appendChild(b);
  });
}
function flip(b, c){
  if (M.lock || b.classList.contains('up')) return;
  b.classList.add('up'); b.setAttribute('aria-label', c.kind==='l' ? VOWELS[c.i].l : VOWELS[c.i].ex[1]);
  c.kind==='l' ? sayItem(uyir[c.i]) : speak(VOWELS[c.i].ex[1]);
  M.open.push([b,c]);
  if (M.open.length < 2) return;
  M.moves++; $('#memMoves').textContent = M.moves;
  const [[b1,c1],[b2,c2]] = M.open; M.open = [];
  if (c1.i === c2.i && c1.kind !== c2.kind){
    b1.classList.add('match'); b2.classList.add('match'); M.matched++;
    if (M.matched < 6) Rewards.win(b2, { quiet: true });
    else { Progress.track('memory'); const r = Rewards.win($('#memGrid'), { big: true, points: 30 }); fb($('#memFb'), `${r.ta} ${M.moves} moves`, 'ok'); }
  } else {
    M.lock = true; Rewards.miss();
    setTimeout(()=>{ [b1,b2].forEach(x=>{ x.classList.remove('up'); x.setAttribute('aria-label','Hidden card'); }); M.lock = false; }, 1000);
  }
}
$('#memNew').addEventListener('click', newMemory);
