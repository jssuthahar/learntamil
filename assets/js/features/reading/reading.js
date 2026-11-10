/* Learn Tamil — reading: reading practice.
   Levels by word length, word topics, letter-by-letter sounding out. */
'use strict';

/* =====================================================================
   READING PRACTICE
   ===================================================================== */
const R = { level:1, topic:null, idx:0, list:[], token:0 };
function buildReadList(){
  const t = R.topic && TOPICS.find(x=>x.id===R.topic);
  R.list = t ? t.words : WORDS.filter(w=>wordLevel(w[0])===R.level);
  R.idx = 0; renderRead();
}
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
  R.level = +b.dataset.level; R.topic = null;
  $$('#readLevels .seg-btn').forEach(x=>x.setAttribute('aria-pressed', x===b));
  $$('#readTopics .topic-chip').forEach(x=>x.setAttribute('aria-pressed', 'false'));
  buildReadList();
}));
// Word topics: numbers, colours, days, body, family, food
(function(){
  const box = $('#readTopics'); if (!box || typeof TOPICS === 'undefined') return;
  box.innerHTML = '<span class="tc-label">Topics:</span>' + TOPICS.map(t =>
    `<button class="topic-chip" type="button" data-topic="${t.id}" aria-pressed="false"><span aria-hidden="true">${t.ic}</span> <span class="ta">${t.ta}</span><small>${t.en}</small></button>`).join('');
  $$('#readTopics .topic-chip').forEach(b=>b.addEventListener('click', ()=>{
    R.topic = b.dataset.topic;
    $$('#readTopics .topic-chip').forEach(x=>x.setAttribute('aria-pressed', x===b));
    $$('#readLevels .seg-btn').forEach(x=>x.setAttribute('aria-pressed', 'false'));
    buildReadList();
  }));
})();
