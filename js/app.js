/* Learn Tamil — app logic */
'use strict';
/* ---------- Build letter objects ---------- */
const uyir = VOWELS.map(v=>({
  l:v.l, say:v.l, r:v.r, fam:'uyir', kind:`உயிர் எழுத்து · ${v.len}`, hint:v.hint, ex:v.ex, len:v.len
}));
const mei = CONS.map(k=>({
  l:k.c+PULLI, say:'இ'+k.c+PULLI, r:k.r, fam:'mei', g:k.g,
  kind:`மெய் எழுத்து · ${GROUPS[k.g].ta}`, hint:k.hint, ex:k.ex
}));
const aytham = [{
  l:'ஃ', say:'எஃகு', r:'ḵ', fam:'ay', kind:'ஆய்த எழுத்து · முப்புள்ளி',
  hint:'soft breathy “kh” — heard here in the word எஃகு', ex:['🔩','எஃகு','steel']
}];
const uyirmei = CONS.map((k,ci)=>VOWELS.map(v=>({
  l:k.c+v.s, say:k.c+v.s, r:k.r+v.r, fam:'um', ci, vowel:v, cons:k,
  kind:`${k.c+PULLI} + ${v.l} = ${k.c+v.s} · உயிர்மெய் ${v.len}`,
  hint:`${k.r} + ${v.r}`, ex:null
})));

/* ---------- Speech ---------- */
const $ = s=>document.querySelector(s);
const $$ = s=>[...document.querySelectorAll(s)];
let tamilVoice = null;
const notice = $('#notice');
let noticeClosed = false;
try{ noticeClosed = sessionStorage.getItem('lt-notice') === '1'; }catch(e){}
function showNotice(html){
  if (noticeClosed) return;
  notice.innerHTML = html + '<button class="notice-x" type="button" aria-label="Close this message">✕</button>';
  notice.querySelector('.notice-x').addEventListener('click', ()=>{
    notice.hidden = true; noticeClosed = true;
    try{ sessionStorage.setItem('lt-notice','1'); }catch(e){}
  });
  notice.hidden = false;
}
function pickVoice(){
  const vs = speechSynthesis.getVoices();
  // Prefer the clearest Tamil voice: Edge's natural voices, then Google, then enhanced system voices.
  const rank = v => (/natural|neural/i.test(v.name) ? 8 : 0) + (/online/i.test(v.name) ? 2 : 0) +
                    (/google/i.test(v.name) ? 6 : 0) + (/enhanced|premium/i.test(v.name) ? 4 : 0);
  tamilVoice = vs.filter(v=>/^ta([-_]|$)/i.test(v.lang)).sort((a,b)=>rank(b)-rank(a))[0] || null;
  if (vs.length && !tamilVoice){
    showNotice('<b>No Tamil voice on this device.</b> Letters still show their English sound. To hear Tamil — <b>Android:</b> Settings → Text-to-speech → Google → install Tamil. <b>Windows:</b> Settings → Time &amp; language → Speech → add Tamil. <b>iPhone / Mac:</b> Settings → Accessibility → Spoken Content → Voices → Tamil.');
  } else if (tamilVoice) notice.hidden = true;
}
if ('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
else showNotice('This browser cannot speak. Please open the page in Chrome, Edge or Safari.');

function utter(text){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ta-IN'; if (tamilVoice) u.voice = tamilVoice;
  u.rate = parseFloat($('#rate').value); u.pitch = 1.05;
  return u;
}
/* ---------- Recorded audio (preferred over the device voice) ----------
   audio/manifest.js (made by record.html) sets window.LT_AUDIO = {key: file}.
   key = the letter's code points in hex, e.g. கு → "0b95-0bc1". */
const REC = window.LT_AUDIO || {};
const keyOf = l => [...l.normalize('NFC')].map(c=>c.codePointAt(0).toString(16).padStart(4,'0')).join('-');
let audioEl = null;
function stopAudio(){ if (audioEl){ audioEl.onended = audioEl.onerror = null; audioEl.pause(); audioEl = null; } }
// Play a letter: the recording if there is one, otherwise the device voice.
function sayLetter(l, ttsText, onend){
  clearTimeout(speakT);   // cancel a pending follow-up word from the previous tap
  const file = REC[keyOf(l)];
  if (!file){ speak(ttsText || l, onend); return; }
  try{ speechSynthesis.cancel(); }catch(e){}
  stopAudio();
  const a = new Audio('audio/' + file); audioEl = a;
  let done = false;
  const fin = ()=>{ if (done) return; done = true; if (audioEl===a) audioEl = null; onend && onend(); };
  a.onended = fin;
  a.onerror = ()=>{ if (audioEl===a) audioEl = null; done = true; speak(ttsText || l, onend); };
  a.play().catch(()=>a.onerror && a.onerror());
}
/* Vowels: play the letter on its own, then its picture word (ஒ … ஒட்டகம்), the way a
   teacher says "ஒ as in ஒட்டகம்". Device voices are weak on a lone vowel but say it
   correctly at the start of a word, so the word always gives the right sound too.
   With a recording (audio/), only the letter is played. */
const inWord = item => item.fam==='uyir' && !REC[keyOf(item.l)] && item.ex && item.ex[1] !== item.l;
const sayItem = (item, onend)=>{
  if (inWord(item)) {
    sayLetter(item.l, item.l, ()=>{ speakT = setTimeout(()=>speak(item.ex[1], onend), 350); });
    return;
  }
  sayLetter(item.l, item.say, onend);
};

/* Chrome quirks handled here:
   - speak() straight after cancel() is sometimes dropped silently → wait a moment when something was playing;
   - an utterance can be garbage-collected before it ends (no sound / no onend) → keep a reference;
   - the engine can get stuck paused → resume(). */
let liveUtter = null, speakT = 0;
function speak(text, onend){
  stopAudio();
  clearTimeout(speakT);
  if (!('speechSynthesis' in window)) { onend && onend(); return; }
  try{
    const busy = speechSynthesis.speaking || speechSynthesis.pending;
    speechSynthesis.cancel();
    const u = utter(text); liveUtter = u;
    let done = false;
    const fin = ()=>{ if (done) return; done = true; if (liveUtter===u) liveUtter = null; onend && onend(); };
    u.onend = fin; u.onerror = fin;
    const go = ()=>{ try{ speechSynthesis.resume(); speechSynthesis.speak(u); }catch(e){ fin(); } };
    if (busy) speakT = setTimeout(go, 80); else go();
  }catch(e){ onend && onend(); }
}

/* ---------- Fun effects: sparkles, confetti, stars ---------- */
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
function particle(ch, x, y, dx, dy, dur, size){
  const s = document.createElement('span'); s.className = 'fx'; s.textContent = ch;
  if (size) s.style.fontSize = size + 'px';
  document.body.appendChild(s);
  const a = s.animate([
    {transform:`translate(${x}px,${y}px) scale(.4) rotate(0deg)`, opacity:1},
    {transform:`translate(${x+dx}px,${y+dy}px) scale(1) rotate(${(Math.random()*2-1)*360}deg)`, opacity:0}
  ], {duration:dur, easing:'cubic-bezier(.2,.7,.3,1)'});
  a.onfinish = ()=>s.remove();
}
function sparkle(el){
  if (calm || !el) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width/2 - 10, cy = r.top + r.height/2 - 10;
  for (let i=0;i<7;i++){ const ang = Math.random()*Math.PI*2, d = 40 + Math.random()*40;
    particle(['✨','⭐','💫'][i%3], cx, cy, Math.cos(ang)*d, Math.sin(ang)*d, 700, 16); }
}
function confetti(){
  if (calm) return;
  const W = innerWidth;
  for (let i=0;i<46;i++){
    particle(['🎉','⭐','🎈','✨','🌟','🍬'][i%6], Math.random()*W, -30, (Math.random()*2-1)*80, innerHeight*(.6+Math.random()*.4), 1600+Math.random()*1200, 18+Math.random()*14);
  }
}
let stars = 0;
try{ stars = parseInt(localStorage.getItem('lt-stars'),10) || 0; }catch(e){}
function renderStars(bump){
  $('#starN').textContent = stars;
  if (bump){ const s=$('#stars'); s.classList.remove('bump'); void s.offsetWidth; s.classList.add('bump'); }
}
function addStar(){ stars++; try{ localStorage.setItem('lt-stars', stars); }catch(e){} renderStars(true); }
renderStars(false);

// floating letters behind the hero
(function(){
  const f = $('#floaters'); if (!f) return;
  const ls = ['அ','ஆ','இ','ஈ','உ','க','ங','ச','ஞ','த','ம','ழ','ஃ','கா','மி','பூ'];
  ls.forEach((l,i)=>{
    const s = document.createElement('span'); s.textContent = l;
    s.style.left = (4 + (i*61)%92) + '%'; s.style.top = (6 + (i*37)%80) + '%';
    s.style.fontSize = (34 + (i*13)%46) + 'px';
    s.style.setProperty('--t', (7 + i%5) + 's'); s.style.setProperty('--dl', (-i*0.7) + 's');
    f.appendChild(s);
  });
})();

// Kili the parrot
const HELLO = 'வணக்கம்! வா, தமிழ் கற்போம்!';
$('#mascot').addEventListener('click', ()=>{ sparkle($('#mascot .bird')); speak(HELLO); });

/* ---------- Now-playing panel ---------- */
const P = {big:$('#big'), roman:$('#roman'), kind:$('#kind'), hint:$('#hint'), ex:$('#ex'), exPic:$('#exPic'), exWord:$('#exWord'), exMean:$('#exMean')};
let current = uyir[0];
function famColor(f){ return getComputedStyle(document.documentElement).getPropertyValue('--c-'+f).trim(); }
function display(item){
  current = item;
  P.big.textContent = item.l;
  P.big.style.setProperty('--fam', famColor(item.fam));
  P.roman.textContent = item.r;
  P.kind.textContent = item.kind;
  P.hint.textContent = (item.hint || '') + (inWord(item) ? ` · 🔊 ${item.l}, then ${item.ex[1]}` : '');
  if (item.ex){ P.ex.hidden = false; [P.exPic.textContent, P.exWord.textContent, P.exMean.textContent] = item.ex; }
  else P.ex.hidden = true;
  P.big.classList.remove('pop'); void P.big.offsetWidth; P.big.classList.add('pop');
  P.big.onanimationend = e=>{ if (e.animationName==='pop') P.big.classList.remove('pop'); };
}
function play(item, tileEl){
  display(item);
  $$('.tile.playing').forEach(t=>t.classList.remove('playing'));
  if (tileEl){ tileEl.classList.add('playing'); sparkle(tileEl); }
  sayItem(item, ()=>tileEl && tileEl.classList.remove('playing'));
}
$('#replay').addEventListener('click', ()=>sayItem(current));
P.ex.addEventListener('click', ()=>current.ex && speak(current.ex[1]));

function makeTile(item, opts={}){
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tile f-'+item.fam;
  b.setAttribute('aria-label', `${item.l} — ${item.r}`);
  b.innerHTML = `<span class="l" lang="ta">${item.l}</span><span class="r">${item.r}</span>` +
    (opts.pic && item.ex ? `<span class="e" aria-hidden="true">${item.ex[0]}</span>` : '');
  b.addEventListener('click', ()=>play(item, b));
  return b;
}

/* ---------- Render letter sections ---------- */
uyir.forEach(i=>$(i.len==='குறில்' ? '#gKuril' : '#gNedil').appendChild(makeTile(i,{pic:true})));
['v','m','i'].forEach(g=>{
  const h = document.createElement('div'); h.className = 'group';
  h.innerHTML = `${GROUPS[g].ta} <span class="chip-s">${GROUPS[g].en} · 6</span>`;
  const grid = document.createElement('div'); grid.className = 'grid';
  mei.filter(m=>m.g===g).forEach(i=>grid.appendChild(makeTile(i,{pic:true})));
  $('#gMei').append(h, grid);
});
aytham.forEach(i=>$('#gAy').appendChild(makeTile(i,{pic:true})));

// Uyirmei table
const tUm = $('#tUm');
const thead = document.createElement('thead');
thead.innerHTML = '<tr><th></th><th></th>' + VOWELS.map(v=>`<th scope="col" lang="ta">${v.l}</th>`).join('') + '</tr>';
tUm.appendChild(thead);
const tbody = document.createElement('tbody');
const PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';
uyirmei.forEach((row,ri)=>{
  const tr = document.createElement('tr');
  const tdBtn = document.createElement('td');
  const btn = document.createElement('button'); btn.className = 'rowplay'; btn.innerHTML = PLAY_SVG;
  btn.setAttribute('aria-label', `Play the ${CONS[ri].c} row`);
  tdBtn.appendChild(btn); tr.appendChild(tdBtn);
  const th = document.createElement('th'); th.scope = 'row'; th.lang = 'ta'; th.textContent = CONS[ri].c + PULLI; tr.appendChild(th);
  const pairs = row.map(i=>{ const td = document.createElement('td'); const b = makeTile(i); td.appendChild(b); tr.appendChild(td); return [i,b]; });
  btn.addEventListener('click', ()=>playSeq(pairs));
  tbody.appendChild(tr);
});
tUm.appendChild(tbody);

let seqToken = 0;
function playSeq(list){
  const token = ++seqToken; let k = 0;
  const step = ()=>{
    if (token !== seqToken || k >= list.length) return;
    const [i,b] = list[k++];
    display(i);
    $$('.tile.playing').forEach(x=>x.classList.remove('playing')); b.classList.add('playing');
    b.scrollIntoView({block:'nearest', inline:'center', behavior:'smooth'});
    sayItem(i, ()=>{ b.classList.remove('playing'); setTimeout(step, 250); });
  };
  step();
}

// Builder
let bC = 0, bV = 0;
function renderBuilder(){
  const item = uyirmei[bC][bV];
  $('#eqM').textContent = CONS[bC].c + PULLI;
  $('#eqU').textContent = VOWELS[bV].l;
  $('#eqR').textContent = item.l;
  $('#eqNote').textContent = `${item.r}  ·  ${VOWELS[bV].len === 'குறில்' ? 'short (குறில்)' : 'long (நெடில்)'}`;
  $$('#pickCons .pick').forEach((b,i)=>b.setAttribute('aria-pressed', i===bC));
  $$('#pickVow .pick').forEach((b,i)=>b.setAttribute('aria-pressed', i===bV));
}
CONS.forEach((k,i)=>{ const b=document.createElement('button'); b.className='pick'; b.lang='ta'; b.textContent=k.c+PULLI;
  b.addEventListener('click',()=>{ bC=i; renderBuilder(); play(uyirmei[bC][bV]); }); $('#pickCons').appendChild(b); });
VOWELS.forEach((v,i)=>{ const b=document.createElement('button'); b.className='pick'; b.lang='ta'; b.textContent=v.l;
  b.addEventListener('click',()=>{ bV=i; renderBuilder(); play(uyirmei[bC][bV]); }); $('#pickVow').appendChild(b); });
const eqR = $('#eqR');
eqR.addEventListener('click', ()=>play(uyirmei[bC][bV]));
eqR.addEventListener('keydown', e=>{ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); play(uyirmei[bC][bV]); } });
renderBuilder();

/* ---------- Global controls ---------- */
$('#showRoman').addEventListener('change', e=>document.body.classList.toggle('hide-roman', !e.target.checked));

function setTheme(t){ document.documentElement.setAttribute('data-theme', t); try{ localStorage.setItem('lt-theme', t); }catch(e){} display(current); }
$('#themeBtn').addEventListener('click', ()=>{
  const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(cur==='dark' ? 'light' : 'dark');
});

/* =====================================================================
   STORIES — simple written Tamil with English meaning per page
   ===================================================================== */
/* Split a word into Tamil letters (graphemes) and explain each one. */
const seg = (typeof Intl!=='undefined' && Intl.Segmenter) ? new Intl.Segmenter('ta',{granularity:'grapheme'}) : null;
const tamilOnly = w => w.normalize('NFC').replace(/[^஀-௿]/g,'');
function lettersOf(word){
  const clean = tamilOnly(word);
  if (seg) return [...seg.segment(clean)].map(s=>s.segment);
  return clean.match(/[ஃ-ஹ][ா-்ௗ]*/g) || [];
}
function explain(g){
  if (VOWELS.some(v=>v.l===g)) return 'உயிர்';
  if (g==='ஃ') return 'ஆய்தம்';
  if (g.length===2 && g[1]===PULLI) return 'மெய்';
  const base = g[0], sign = g.slice(1);
  if (CONS.some(k=>k.c===base) && sign in SIGN_TO_VOWEL) return `${base+PULLI} + ${SIGN_TO_VOWEL[sign].l}`;
  return '';
}

let story=null, pageIdx=0, reading=false;
STORIES.forEach(s=>{
  const b = document.createElement('button'); b.className = 'book glass';
  b.innerHTML = `<div class="cover" aria-hidden="true">${s.cover}</div><div class="bt" lang="ta">${s.title}</div><div class="be">${s.en} · ${s.pages.length} pages</div><span class="badge">${s.lvl}</span>`;
  b.addEventListener('click', ()=>openStory(s));
  $('#shelf').appendChild(b);
});
function openStory(s){ story=s; pageIdx=0; $('#shelfView').hidden=true; $('#readerView').hidden=false; $('#rTitle').textContent=s.title; renderPage(); window.scrollTo({top:$('#app').offsetTop-120,behavior:'smooth'}); }
$('#backShelf').addEventListener('click', ()=>{ stopReading(); $('#readerView').hidden=true; $('#shelfView').hidden=false; });

const BD_HINT = '<span class="muted">Tap any word to hear it and see its letters</span>';
function renderPage(){
  const [pic,text,en] = story.pages[pageIdx];
  $('#pic').textContent = pic;
  $('#pageNo').textContent = `${pageIdx+1} / ${story.pages.length}`;
  $('#pen').textContent = en; $('#pen').hidden = !$('#showEn').checked;
  $('#theEnd').hidden = true;
  const box = $('#ptext'); box.innerHTML = '';
  const sentences = text.match(/[^.!?]+[.!?]?[”"]?/g) || [text];
  sentences.forEach(st=>{
    st = st.trim(); if (!st) return;
    const sp = document.createElement('span'); sp.className = 'sent'; sp.dataset.text = st;
    let offset = 0;
    st.split(' ').forEach(w=>{
      const ws = document.createElement('span'); ws.className='w'; ws.textContent=w; ws.dataset.start=offset; offset += w.length+1;
      ws.addEventListener('click', ()=>tapWord(w, ws));
      sp.append(ws, document.createTextNode(' '));
    });
    box.appendChild(sp);
  });
  $('#breakdown').innerHTML = BD_HINT;
  $('#prev').disabled = pageIdx===0;
  $('#next').disabled = false; // on the last page ▶ shows The End
  const pg = $('#page'); pg.classList.remove('turn'); void pg.offsetWidth; pg.classList.add('turn');
}
function tapWord(w, el){
  stopReading();
  $$('.w.now').forEach(x=>x.classList.remove('now')); el.classList.add('now');
  const clean = tamilOnly(w);
  speak(clean, ()=>el.classList.remove('now'));
  const bd = $('#breakdown'); bd.innerHTML = '';
  lettersOf(w).forEach((l,i)=>{
    if (i){ const p=document.createElement('span'); p.className='plus'; p.textContent='+'; bd.appendChild(p); }
    const c = document.createElement('button'); c.className='chip'; c.lang='ta';
    c.innerHTML = `${l}<small>${explain(l)}</small>`;
    c.addEventListener('click', ()=>sayLetter(l, l.endsWith(PULLI) ? 'இ'+l : l));
    bd.appendChild(c);
  });
  const eq = document.createElement('span'); eq.className='plus'; eq.lang='ta'; eq.textContent = '= '+clean; bd.appendChild(eq);
}
function speakSentence(sp, done){
  const words = [...sp.querySelectorAll('.w')];
  sp.classList.add('reading');
  const finish = ()=>{ sp.classList.remove('reading'); words.forEach(w=>w.classList.remove('now')); done && done(); };
  try{
    speechSynthesis.cancel();
    const u = utter(sp.dataset.text.replace(/[“”"]/g,''));
    u.onboundary = e=>{ let cur=words[0]; words.forEach(w=>{ if (+w.dataset.start <= e.charIndex) cur=w; }); words.forEach(w=>w.classList.toggle('now', w===cur)); };
    u.onend = finish; u.onerror = finish;
    speechSynthesis.speak(u);
  }catch(e){ finish(); }
}
function readPage(){
  const sents = $$('#ptext .sent'); let k = 0;
  reading = true; $('#readMe').innerHTML = '<span class="ta">நிறுத்து</span> · Stop';
  const step = ()=>{
    if (!reading) return;
    if (k < sents.length){ speakSentence(sents[k++], ()=>setTimeout(step, 350)); return; }
    if ($('#autoTurn').checked && pageIdx < story.pages.length-1){ pageIdx++; renderPage(); setTimeout(readPage, 700); return; }
    stopReading();
    if (pageIdx === story.pages.length-1){ $('#theEnd').hidden = false; confetti(); }
  };
  step();
}
function stopReading(){
  reading = false; seqToken++;
  stopAudio();
  try{ speechSynthesis.cancel(); }catch(e){}
  $('#readMe').innerHTML = '<span class="ta">படித்துக் காட்டு</span>';
  $$('.sent.reading').forEach(s=>s.classList.remove('reading'));
}
$('#readMe').addEventListener('click', ()=> reading ? stopReading() : readPage());
$('#prev').addEventListener('click', ()=>{ stopReading(); if (pageIdx>0){ pageIdx--; renderPage(); } });
$('#next').addEventListener('click', ()=>{ stopReading(); if (pageIdx<story.pages.length-1){ pageIdx++; renderPage(); } else if ($('#theEnd').hidden){ $('#theEnd').hidden=false; confetti(); } });
$('#again').addEventListener('click', ()=>{ pageIdx=0; renderPage(); });
$('#showEn').addEventListener('change', e=>{ $('#pen').hidden = !e.target.checked; });

/* =====================================================================
   PRACTICE
   build  : க் + ஆ = ?   (4 choices, same consonant — no sound needed)
   listen : hear a letter, pick from 3. Letters that sound alike
            (ந/ன/ண, ல/ள/ழ, ர/ற) are never offered together.
   ===================================================================== */
const SOUND_GROUP = {'ந':'N','ன':'N','ண':'N','ல':'L','ள':'L','ழ':'L','ர':'R','ற':'R'};
const soundKey = it => it.fam==='uyir' ? 'V'+it.l : (SOUND_GROUP[it.cons.c]||it.cons.c)+it.vowel.l;
const rand = n => Math.floor(Math.random()*n);
const shuffle = a => { for (let i=a.length-1;i>0;i--){ const j=rand(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
let mode='build', answer=null, ok=0, tries=0, locked=false;
const PRAISE = ['அருமை!', 'நன்று!', 'மிகவும் நன்று!', 'சரியான விடை!'];

function newQuestion(){
  locked = false; $('#feedback').textContent=''; $('#feedback').className='feedback';
  const box = $('#opts'); box.innerHTML='';
  let options;
  if (mode==='build'){
    const ci = rand(18), vi = rand(12);
    answer = uyirmei[ci][vi];
    const others = shuffle([...Array(12).keys()].filter(i=>i!==vi)).slice(0,3).map(i=>uyirmei[ci][i]);
    options = shuffle([answer, ...others]);
    $('#qAsk').innerHTML = 'சரியான எழுத்தைத் தேர்ந்தெடு<small>Pick the letter these two make</small>';
    $('#qShow').innerHTML = `<span class="m">${answer.cons.c+PULLI}</span> <span class="op">+</span> <span class="u">${answer.vowel.l}</span> <span class="op">=</span> ?`;
    $('#hear').hidden = true;
  } else {
    const pool = [...uyir, ...uyirmei.flat()];
    answer = pool[rand(pool.length)];
    const keys = new Set([soundKey(answer)]); options = [answer];
    while (options.length < 3){ const c = pool[rand(pool.length)]; const k = soundKey(c); if (!keys.has(k)){ keys.add(k); options.push(c); } }
    shuffle(options);
    $('#qAsk').innerHTML = 'கேட்டுச் சரியான எழுத்தைத் தொடு<small>Listen, then tap the letter you heard</small>';
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
  tries++; $('#sAll').textContent = tries;
  if (o===answer){
    locked = true; ok++; $('#sOk').textContent = ok;
    b.classList.add('right');
    const praise = PRAISE[rand(PRAISE.length)];
    $('#feedback').textContent = mode==='build' ? `${praise} ${answer.cons.c+PULLI} + ${answer.vowel.l} = ${answer.l}` : `${praise} ${answer.l}`;
    addStar(); sparkle(b); if (ok % 5 === 0) confetti();
    $('#feedback').className = 'feedback ok';
    sayItem(answer, ()=>setTimeout(newQuestion, 700));
  } else {
    b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
    $('#feedback').textContent = 'பரவாயில்லை, மீண்டும் முயற்சி செய்! · Try again';
    $('#feedback').className = 'feedback bad';
    sayItem(o);
  }
}
$('#hear').addEventListener('click', ()=>answer && sayItem(answer));
// Called by the games hub (games.js) for the two quiz games.
function setQuizMode(m){ mode = m; newQuestion(); }

/* =====================================================================
   TABS (hash routing so each section can be bookmarked)
   ===================================================================== */
const LETTER_TABS = ['uyir','mei','aytham','uyirmei'];
const SECTIONS = [...LETTER_TABS, 'reading', 'stories', 'practice'];
let lastLetterTab = 'uyir';
function openTab(name){
  if (name === 'letters') name = lastLetterTab;
  if (!SECTIONS.includes(name)) name = 'uyir';
  const isLetters = LETTER_TABS.includes(name);
  if (isLetters) lastLetterTab = name;
  stopReading();
  // main navigation (header on desktop, bottom bar on phones)
  $$('.nav-item').forEach(n=>{ const on = n.dataset.go === (isLetters ? 'letters' : name); n.classList.toggle('on', on); n.setAttribute('aria-current', on ? 'page' : 'false'); });
  $('#letterTabs').hidden = !isLetters;
  $('.hero').hidden = !isLetters;
  document.dispatchEvent(new CustomEvent('lt:section', {detail:name}));
  $$('.tab').forEach(t=>{ const on = t.dataset.tab===name; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
  $$('.panel').forEach(p=>p.classList.toggle('on', p.id===name));
  // bouncy entrance for the tiles of the opened section
  const pnl = document.getElementById(name);
  pnl.querySelectorAll('.grid .tile, table.um .tile, .book, .group').forEach((t,i)=>t.style.setProperty('--d', Math.min(i*22, 700)+'ms'));
  pnl.classList.remove('enter'); void pnl.offsetWidth; pnl.classList.add('enter');
  clearTimeout(pnl._enterT); pnl._enterT = setTimeout(()=>pnl.classList.remove('enter'), 1500);
  $('#player').hidden = !LETTER_TABS.includes(name);
  $('#globalTools').querySelector('label:last-child').hidden = !LETTER_TABS.includes(name);
  if (name==='uyir') display(uyir[0]);
  if (name==='mei') display(mei[0]);
  if (name==='aytham') display(aytham[0]);
  if (name==='uyirmei') display(uyirmei[bC][bV]);
  if (!isLetters) window.scrollTo({top:0});
}
$$('.nav-item').forEach(n=>n.addEventListener('click', ()=>{
  const target = n.dataset.go === 'letters' ? lastLetterTab : n.dataset.go;
  if (route() !== target) location.hash = '/' + target; else openTab(target);
}));
const route = ()=>location.hash.replace(/^#\/?/,'');
$$('.tab').forEach(t=>t.addEventListener('click', ()=>{ if (route()!==t.dataset.tab) location.hash = '/'+t.dataset.tab; else openTab(t.dataset.tab); }));
$('.tablist').addEventListener('keydown', e=>{
  if (e.key!=='ArrowRight' && e.key!=='ArrowLeft') return;
  const tabs = $$('.tab'); const i = tabs.indexOf(document.activeElement); if (i<0) return;
  const n = tabs[(i + (e.key==='ArrowRight'?1:-1) + tabs.length) % tabs.length]; n.focus(); n.click();
});
window.addEventListener('hashchange', ()=>openTab(route()));
// games.js is loaded after this file; open the first section once everything is defined.
window.addEventListener('DOMContentLoaded', ()=>openTab(route() || 'uyir'));
