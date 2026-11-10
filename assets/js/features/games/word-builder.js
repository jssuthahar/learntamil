/* Learn Tamil — games: 🧩 Word builder.
    */
'use strict';

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
