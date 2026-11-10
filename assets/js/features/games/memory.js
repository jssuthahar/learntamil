/* Learn Tamil — games: 🃏 Memory.
   Six vowels and their picture words, face down; turn two cards at a time to find the pairs. */
'use strict';

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
  b.classList.add('up'); Rewards.sfx.flip(); b.setAttribute('aria-label', c.kind==='l' ? VOWELS[c.i].l : VOWELS[c.i].ex[1]);
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
