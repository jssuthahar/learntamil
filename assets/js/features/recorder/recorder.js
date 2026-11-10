/* Learn Tamil — Letter Recorder */
'use strict';
const $ = s=>document.querySelector(s);
// Letters come from data/alphabet.js (loaded by record.html) — same set and order as the app.
const VOW = VOWELS.map(v=>v.l), SIGN = VOWELS.map(v=>v.s), CONS_L = CONS.map(k=>k.c), P = LETTER_LABELS.part;
const HARD = [4,5,9,10];   // உ ஊ ஒ ஓ forms: device voices often get these wrong — record them first
const LETTERS = [
  ...VOW.map((l,i)=>({l, how:`${P.uyir} — say the vowel only`, ou:HARD.includes(i)})),
  ...CONS_L.map(c=>({l:c+PULLI, how:`${P.mei} — say it the way you teach it (e.g. “${MEI_SAY_PREFIX}${c+PULLI}”)`, ou:c==='ஞ'})),
  {l:AYTHAM.l, how:`${P.aytham} — say it the way you teach it`, ou:false},
  ...CONS_L.flatMap(c=>SIGN.map((s,i)=>({l:c+s, how:`${LETTER_LABELS.uyirmei} — ${c+PULLI} + ${VOW[i]}`, ou:c==='ஞ' || HARD.includes(i)})))
];
const keyOf = l => [...l.normalize('NFC')].map(c=>c.codePointAt(0).toString(16).padStart(4,'0')).join('-');
LETTERS.forEach(x=>x.key = keyOf(x.l));

/* ---------- IndexedDB (recordings survive a refresh) ---------- */
let db = null;
const dbReady = new Promise(res=>{
  try{
    const r = indexedDB.open('lt-recorder',1);
    r.onupgradeneeded = ()=>r.result.createObjectStore('rec');
    r.onsuccess = ()=>{ db = r.result; res(); };
    r.onerror = ()=>res();
  }catch(e){ res(); }
});
const mem = new Map(); // key -> Blob (wav)
function store(key, blob){ mem.set(key, blob); try{ db && db.transaction('rec','readwrite').objectStore('rec').put(blob, key); }catch(e){} }
function unstore(key){ mem.delete(key); try{ db && db.transaction('rec','readwrite').objectStore('rec').delete(key); }catch(e){} }
async function loadAll(){
  await dbReady; if (!db) return;
  await new Promise(res=>{
    const tx = db.transaction('rec','readonly').objectStore('rec').openCursor();
    tx.onsuccess = e=>{ const c = e.target.result; if (c){ mem.set(c.key, c.value); c.continue(); } else res(); };
    tx.onerror = ()=>res();
  });
}

/* ---------- Audio: record → trim silence → mono 22.05 kHz WAV ---------- */
let stream=null, rec=null, chunks=[], actx=null, analyser=null, raf=0;
async function ensureMic(){
  if (stream) return;
  stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  actx = new (window.AudioContext||window.webkitAudioContext)();
  analyser = actx.createAnalyser(); analyser.fftSize = 512;
  actx.createMediaStreamSource(stream).connect(analyser);
}
function meter(){
  const d = new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(d);
  let m = 0; for (const v of d) m = Math.max(m, Math.abs(v-128));
  $('#lvl').style.width = Math.min(100, m/1.28) + '%';
  raf = requestAnimationFrame(meter);
}
async function toWav(blob){
  const buf = await actx.decodeAudioData(await blob.arrayBuffer());
  const src = buf.getChannelData(0), sr = buf.sampleRate;
  // trim: find first/last sample above 3% of peak
  let peak = 0; for (const v of src) peak = Math.max(peak, Math.abs(v));
  if (peak < 0.02) throw new Error('quiet');
  const th = peak*0.03; let a = 0, b = src.length-1;
  while (a < b && Math.abs(src[a]) < th) a++;
  while (b > a && Math.abs(src[b]) < th) b--;
  const pad = Math.floor(sr*0.06); a = Math.max(0, a-pad); b = Math.min(src.length-1, b+pad);
  const out = 22050, len = Math.ceil((b-a+1)*out/sr);
  const off = new OfflineAudioContext(1, len, out);
  const tb = off.createBuffer(1, b-a+1, sr); tb.copyToChannel(src.slice(a, b+1), 0);
  const s = off.createBufferSource(); s.buffer = tb; s.connect(off.destination); s.start();
  const r = (await off.startRendering()).getChannelData(0);
  // normalise to 90% and encode 16-bit PCM
  let pk = 0; for (const v of r) pk = Math.max(pk, Math.abs(v)); const g = pk ? 0.9/pk : 1;
  const dv = new DataView(new ArrayBuffer(44 + r.length*2));
  const w = (o,s)=>{ for (let i=0;i<s.length;i++) dv.setUint8(o+i, s.charCodeAt(i)); };
  w(0,'RIFF'); dv.setUint32(4, 36+r.length*2, true); w(8,'WAVE'); w(12,'fmt ');
  dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true);
  dv.setUint32(24,out,true); dv.setUint32(28,out*2,true); dv.setUint16(32,2,true); dv.setUint16(34,16,true);
  w(36,'data'); dv.setUint32(40, r.length*2, true);
  for (let i=0;i<r.length;i++){ const v = Math.max(-1, Math.min(1, r[i]*g)); dv.setInt16(44+i*2, v<0 ? v*0x8000 : v*0x7fff, true); }
  return new Blob([dv], {type:'audio/wav'});
}

/* ---------- UI ---------- */
let idx = 0, filter = 'all', player = null;
const status = (t,c='')=>{ const s=$('#status'); s.textContent=t; s.className='status '+c; };
function visible(){ return LETTERS.filter(x=> filter==='all' || (filter==='ou' && x.ou) || (filter==='todo' && !mem.has(x.key))); }
function renderGrid(){
  const g = $('#grid'); g.innerHTML = '';
  visible().forEach(x=>{
    const b = document.createElement('button'); b.className = 'cell'; b.lang='ta'; b.textContent = x.l;
    if (mem.has(x.key)) b.classList.add('done');
    if (LETTERS[idx]===x) b.classList.add('cur');
    b.addEventListener('click', ()=>{ idx = LETTERS.indexOf(x); render(); });
    g.appendChild(b);
  });
  $('#progress').textContent = `${mem.size} / ${LETTERS.length} recorded`;
}
function render(){
  const x = LETTERS[idx];
  $('#cur').textContent = x.l; $('#how').textContent = x.how;
  $('#pos').textContent = `Letter ${idx+1} of ${LETTERS.length}` + (mem.has(x.key) ? ' · recorded ✓' : '');
  $('#playBtn').disabled = $('#delBtn').disabled = !mem.has(x.key);
  status('');
  renderGrid();
}
function move(d){
  const v = visible(); if (!v.length) return;
  let i = v.indexOf(LETTERS[idx]);
  i = i<0 ? 0 : Math.max(0, Math.min(v.length-1, i+d));
  idx = LETTERS.indexOf(v[i]); render();
}
function play(){
  const b = mem.get(LETTERS[idx].key); if (!b) return;
  if (player) player.pause();
  player = new Audio(URL.createObjectURL(b)); player.play();
}
async function toggleRec(){
  if (rec && rec.state==='recording'){ rec.stop(); return; }
  try{ await ensureMic(); }catch(e){ status('Microphone not available. Allow it in the browser and use https or localhost.', 'bad'); return; }
  if (actx.state==='suspended') await actx.resume();
  chunks = []; rec = new MediaRecorder(stream);
  const key = LETTERS[idx].key;
  rec.ondataavailable = e=>e.data.size && chunks.push(e.data);
  rec.onstop = async ()=>{
    cancelAnimationFrame(raf); $('#lvl').style.width='0';
    $('#recBtn').classList.remove('on'); $('#recBtn').textContent = '● Record';
    try{
      const wav = await toWav(new Blob(chunks, {type: rec.mimeType}));
      store(key, wav); render(); status('Saved. Press Listen to check it.', 'ok'); play();
    }catch(e){ status(e.message==='quiet' ? 'Too quiet — nothing was heard. Try again closer to the mic.' : 'Could not process that recording. Try again.', 'bad'); }
  };
  rec.start(); meter();
  $('#recBtn').classList.add('on'); $('#recBtn').textContent = '■ Stop';
  status('Recording… say the letter, then press Stop.');
  setTimeout(()=>{ if (rec && rec.state==='recording') rec.stop(); }, 4000); // safety stop
}
async function downloadZip(){
  if (!mem.size){ status('Nothing recorded yet.', 'bad'); return; }
  if (!window.JSZip){ status('Zip library did not load. Check the internet connection.', 'bad'); return; }
  const zip = new JSZip(); const man = Object.assign({}, window.LT_AUDIO || {});   // keep generated audio entries
  for (const x of LETTERS){ const b = mem.get(x.key); if (b){ zip.file(x.key+'.wav', b); man[x.key] = x.key+'.wav'; } }
  zip.file('manifest.js', '// Made by record.html — maps each letter (hex code points) to its recording.\nwindow.LT_AUDIO = ' + JSON.stringify(man, null, 0) + ';\n');
  const blob = await zip.generateAsync({type:'blob'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audio.zip'; a.click();
  status(`audio.zip has ${mem.size} recordings. Unzip it into the audio folder.`, 'ok');
}

$('#recBtn').addEventListener('click', toggleRec);
$('#playBtn').addEventListener('click', play);
$('#delBtn').addEventListener('click', ()=>{ unstore(LETTERS[idx].key); render(); status('Deleted.'); });
$('#prevBtn').addEventListener('click', ()=>move(-1));
$('#nextBtn').addEventListener('click', ()=>move(1));
$('#zipBtn').addEventListener('click', downloadZip);
document.querySelectorAll('.filters .btn').forEach(b=>b.addEventListener('click', ()=>{
  filter = b.dataset.f;
  document.querySelectorAll('.filters .btn').forEach(x=>x.setAttribute('aria-pressed', x===b));
  const v = visible(); if (v.length && !v.includes(LETTERS[idx])) idx = LETTERS.indexOf(v[0]);
  render();
}));
document.addEventListener('keydown', e=>{
  if (e.target.closest('button') && (e.key===' '||e.key==='Enter')) { if (e.key===' ') { e.preventDefault(); toggleRec(); } return; }
  if (e.key===' '){ e.preventDefault(); toggleRec(); }
  else if (e.key==='ArrowRight') move(1);
  else if (e.key==='ArrowLeft') move(-1);
  else if (e.key.toLowerCase()==='p') play();
});
loadAll().then(render);
