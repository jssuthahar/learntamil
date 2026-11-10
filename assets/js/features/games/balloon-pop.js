/* Learn Tamil — games: 🎈 Balloon pop.
    */
'use strict';

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
  s.querySelector('p').innerHTML = `<span class="ta">${B.score >= 6 ? TEXT.great : TEXT.good}</span><br><b class="bal-final">🎈 ${B.score}</b><br><small class="muted">balloons popped</small>`;
  $('#balGo').textContent = '↻ Play again';
  Progress.track('balloon', B.score);
  if (B.score >= 6) Rewards.win($('#balSky'), { big: true, points: 20 });
}
$('#balGo').addEventListener('click', startBalloon);
