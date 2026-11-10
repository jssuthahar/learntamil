/* Learn Tamil — games: Build a letter (க் + ஆ = ?) and Listen & pick.
   Letters that sound alike are never offered together. */
'use strict';

let mode='build', answer=null, ok=0, tries=0, locked=false;

// Remember recent answers so the same letter does not come back for a long while.
const recentQ = { build: [], listen: [] };
function freshPick(list, m, keep){
  let x, t = 0; do { x = list[rand(list.length)]; } while (recentQ[m].includes(x.l) && ++t < 80);
  recentQ[m].push(x.l); if (recentQ[m].length > keep) recentQ[m].shift();
  return x;
}
function newQuestion(){
  locked = false; $('#feedback').textContent=''; $('#feedback').className='feedback';
  const box = $('#opts'); box.innerHTML='';
  let options;
  if (mode==='build'){
    answer = freshPick(uyirmei.flat(), 'build', 120);
    const ci = CONS.indexOf(answer.cons), vi = VOWELS.indexOf(answer.vowel);
    const others = shuffle([...Array(12).keys()].filter(i=>i!==vi)).slice(0,3).map(i=>uyirmei[ci][i]);
    options = shuffle([answer, ...others]);
    $('#qAsk').innerHTML = `${TEXT.buildAsk[0]}<small>${TEXT.buildAsk[1]}</small>`;
    $('#qShow').innerHTML = `<span class="m">${answer.cons.c+PULLI}</span> <span class="op">+</span> <span class="u">${answer.vowel.l}</span> <span class="op">=</span> ?`;
    $('#hear').hidden = true;
  } else {
    const pool = [...uyir, ...uyirmei.flat()];
    answer = freshPick(pool, 'listen', 120);
    const keys = new Set([soundKey(answer)]); options = [answer];
    while (options.length < 3){ const c = pool[rand(pool.length)]; const k = soundKey(c); if (!keys.has(k)){ keys.add(k); options.push(c); } }
    shuffle(options);
    $('#qAsk').innerHTML = `${TEXT.listenAsk[0]}<small>${TEXT.listenAsk[1]}</small>`;
    $('#qShow').innerHTML = '🔊';
    $('#hear').hidden = false;
  }
  options.forEach((o,oi)=>{
    const b = document.createElement('button'); b.type='button'; b.className='tile f-'+o.fam;
    b.style.setProperty('--d', (oi*80)+'ms');
    b.innerHTML = `<span class="l" lang="ta">${o.l}</span>`; b.setAttribute('aria-label', o.l);
    b.addEventListener('click', ()=>choose(o,b));
    box.appendChild(b);
  });
  if (mode==='listen') setTimeout(()=>sayItem(answer), 300);
}
function choose(o,b){
  if (locked) return;
  tries++;
  if (o===answer){
    locked = true; ok++;
    b.classList.add('right');
    // appreciation sound + pop-up + score, then say the letter, then the next question
    const r = Rewards.win(b, { after: ()=>sayItem(answer, ()=>setTimeout(newQuestion, 600)) });
    $('#feedback').textContent = mode==='build' ? `${r.ta} ${answer.cons.c+PULLI} + ${answer.vowel.l} = ${answer.l}` : `${r.ta} ${answer.l}`;
    $('#feedback').className = 'feedback ok';
  } else {
    b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
    Rewards.miss(); Progress.track('miss', answer.l);
    $('#feedback').textContent = `${TEXT.tryAgain[0]} · ${TEXT.tryAgain[1]}`;
    $('#feedback').className = 'feedback bad';
    setTimeout(()=>sayItem(o), 300);
  }
}
$('#hear').addEventListener('click', ()=>answer && sayItem(answer));
// Called by the games hub (games/hub.js) for the two quiz games.
function setQuizMode(m){ mode = m; newQuestion(); }
