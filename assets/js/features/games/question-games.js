/* Learn Tamil — games: question games (quiz, pictures, topics, spelling, sentences).
   Questions come from the certificate generators (features/certificate/certificate.js). */
'use strict';

/* ---------- 🧠 Question games: quiz, pictures, topics, spelling, sentences ----------
   Questions come from the certificate generators (features/certificate/certificate.js), so there are hundreds of them.
   Each game remembers what it has asked and never repeats a question until all have been seen. */
/* Title and description of each question game: data/messages.js → TEXT.questionGames */
const MCQ_INFO = Object.fromEntries(Object.entries(TEXT.questionGames).map(([k, [ta, en]]) => [k, { ta, en }]));
const MQ = { mode:null, seen:{}, q:null, done:false, n:0, right:0, t:0 };
function startMcq(g){
  MQ.mode = g; MQ.n = 0; MQ.right = 0; MQ.seen[g] = MQ.seen[g] || new Set();
  $('#mqAsk').innerHTML = `<span class="ta">${MCQ_INFO[g].ta}</span><small>${MCQ_INFO[g].en}</small>`;
  newMcq();
}
function newMcq(){
  clearTimeout(MQ.t);
  const bank = CERT.bank[MQ.mode], seen = MQ.seen[MQ.mode];
  let q, k, tries = 0;
  do { q = bank[rand(bank.length)](); k = CERT.keyOf(q); }
  while (++tries < 400 && (q.opts.length < 2 || seen.has(k)));
  if (tries >= 400) seen.clear();   // every question asked — begin a fresh round
  seen.add(k); MQ.q = q; MQ.done = false;
  $('#mqCount').textContent = `✓ ${MQ.right} / ${MQ.n}`;
  $('#mqQ').innerHTML = q.q;
  $('#mqNext').hidden = true; fb($('#mqFb'), '');
  const box = $('#mqOpts'); box.innerHTML = '';
  q.opts.forEach((o, i)=>{
    const b = document.createElement('button'); b.type='button'; b.className='cq-opt'; b.innerHTML = o.label;
    b.style.setProperty('--d', (i*60)+'ms');
    b.addEventListener('click', ()=>answerMcq(o, b));
    box.appendChild(b);
  });
}
function answerMcq(o, b){
  if (MQ.done) return; MQ.done = true; MQ.n++;
  $$('#mqOpts .cq-opt').forEach((x, j)=>{ x.disabled = true; if (MQ.q.opts[j].ok) x.classList.add('right'); });
  if (o.ok){
    MQ.right++; b.classList.add('right');
    const big = MQ.n % 10 === 0 && MQ.right >= MQ.n - 2;   // a round of 10 with 8+ right
    const r = Rewards.win(b, big ? { big: true, points: 20, say: false } : { say: false });
    $('#mqFb').innerHTML = `<span>✓ ${r.ta}</span> <small>${MQ.q.explain}</small>`; $('#mqFb').className = 'feedback ok';
    MQ.t = setTimeout(newMcq, 1800);
  } else {
    b.classList.add('wrong'); Rewards.miss();
    $('#mqFb').innerHTML = `<span>✗ ${TEXT.noWorries[0]}</span> <small>${MQ.q.explain}</small>`; $('#mqFb').className = 'feedback bad';
    $('#mqNext').hidden = false; $('#mqNext').focus({ preventScroll: true });
  }
  $('#mqCount').textContent = `✓ ${MQ.right} / ${MQ.n}`;
}
$('#mqNext').addEventListener('click', newMcq);
$('#mqSkip').addEventListener('click', newMcq);
