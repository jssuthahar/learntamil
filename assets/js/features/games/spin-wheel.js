/* Learn Tamil — games: 🎡 Spin wheel.
   What has been asked is remembered per child so a returning child still gets new letters. */
'use strict';

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
// Every picture word that starts with each vowel: its own example, extra words, reading words and topic words.
let SPIN_WORDS = null;
function spinWords(){
  if (SPIN_WORDS) return SPIN_WORDS;
  const extra = [...WORDS, ...TOPICS.flatMap(t=>t.words)].map(w=>[w[1], w[0], w[2].split(' · ')[0]]);
  SPIN_WORDS = VOWELS.map(v=>{
    const all = [v.ex, ...(VOWEL_WORDS[v.l] || []), ...extra.filter(w=>lettersOf(w[1])[0] === v.l)];
    return all.filter((w,i)=>all.findIndex(x=>x[1]===w[1]) === i);
  });
  return SPIN_WORDS;
}
// Spin memory is saved on this device, so a child coming back later still gets new letters and words.
const SPIN_KEY = 'lt-spin-seen';
const SP = (()=>{ let d = null; try { d = JSON.parse(Profiles.get(SPIN_KEY)); } catch (e) {}
  d = d && typeof d === 'object' ? d : {};
  return { recent: Array.isArray(d.recent) ? d.recent : [], used: d.used && typeof d.used === 'object' ? d.used : {}, shown: Array.isArray(d.shown) ? d.shown : [] }; })();
const spinRecent = SP.recent;   // letters landed on lately
const spinSave = ()=>{ Profiles.set(SPIN_KEY, JSON.stringify(SP)); };
function freshWord(i){   // the answer word: every word for this letter is used before any comes back
  const ws = spinWords()[i], used = SP.used[i] = SP.used[i] || [];
  let left = ws.filter(w=>!used.includes(w[1]));
  if (!left.length){ used.length = 0; left = ws.filter(w=>!SP.shown.slice(-3).includes(w[1])); if (!left.length) left = ws.slice(); }
  const w = left[rand(left.length)]; used.push(w[1]); return w;
}
function freshOption(i){   // a wrong option: avoid words shown in the last rounds
  const ws = spinWords()[i], left = ws.filter(w=>!SP.shown.includes(w[1]));
  return (left.length ? left : ws)[rand((left.length ? left : ws).length)];
}
function spin(){
  if (spinning) return;
  spinning = true; $('#spinBtn').disabled = true; $('#spinQ').hidden = true; fb($('#spinFb'), '');
  const pool = VOWELS.map((_,i)=>i).filter(i=>!spinRecent.includes(i));
  spinIdx = pool[rand(pool.length)];
  spinRecent.push(spinIdx); if (spinRecent.length > 5) spinRecent.shift();   // no repeat of the last 5 letters
  spinSave();
  const want = (360 - spinIdx*30) % 360, jitter = rand(17) - 8;
  const base = wheelRot - (wheelRot % 360);
  wheelRot = base + 360*5 + want + jitter;
  const svg = $('#wheel');
  if (calm){ svg.style.transition = 'none'; svg.style.transform = `rotate(${wheelRot}deg)`; landed(); return; }
  Rewards.sfx.spinStart();
  svg.style.transform = `rotate(${wheelRot}deg)`;
  spinTicks(svg);
}
/* Click each time a segment passes the pointer — follows the wheel's real angle, so the
   clicks are fast at the start and slow down as the wheel slows. */
function wheelAngle(svg){
  const m = getComputedStyle(svg).transform;
  if (!m || m === 'none') return 0;
  const v = m.match(/matrix\(([^)]+)\)/); if (!v) return 0;
  const [a, b] = v[1].split(',').map(Number);
  return Math.atan2(b, a) * 180 / Math.PI;
}
function spinTicks(svg){
  const segOf = deg => Math.floor((((deg % 360) + 360) % 360 + 15) / 30) % 12;   // segment under the pointer
  let seg = segOf(wheelAngle(svg));
  const step = ()=>{
    if (!spinning) return;
    const cur = segOf(wheelAngle(svg));
    if (cur !== seg){ seg = cur; Rewards.sfx.click(); }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function landed(){
  spinning = false; $('#spinBtn').disabled = false;
  Rewards.sfx.landed();
  const v = VOWELS[spinIdx];
  $('#spinLetter').textContent = v.l;
  sayLetter(v.l, v.l);   // only the letter: its usual example word is often not one of the pictures and confused children
  const others = shuffle(VOWELS.map((_,i)=>i).filter(i=>i!==spinIdx)).slice(0,2);
  const pics = { [spinIdx]: freshWord(spinIdx) };
  others.forEach(i=>{ pics[i] = freshOption(i); });
  Object.values(pics).forEach(w=>SP.shown.push(w[1]));
  SP.shown = SP.shown.slice(-30); spinSave();
  const box = $('#spinOpts'); box.innerHTML = '';
  shuffle([spinIdx, ...others]).forEach((i,oi)=>{
    const [emo, word, mean] = pics[i];
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
