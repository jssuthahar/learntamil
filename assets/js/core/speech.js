/* Learn Tamil — core: speech.
   Plays a recorded letter (assets/audio/) when there is one, otherwise the device Tamil voice.
   Uses: $ (core/dom.js) and the letter objects (core/letter-model.js). */
'use strict';

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

/* Voice volume, 0–1 (device setting "lt-vol", changed in ⚙️ Settings). */
function voiceVolume(){ try { const v = parseFloat(localStorage.getItem('lt-vol')); return isNaN(v) ? 1 : Math.max(0, Math.min(1, v)); } catch (e) { return 1; } }
function utter(text){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ta-IN'; if (tamilVoice) u.voice = tamilVoice;
  u.rate = parseFloat($('#rate').value); u.pitch = 1.05; u.volume = voiceVolume();
  return u;
}
/* ---------- Recorded audio (preferred over the device voice) ----------
   assets/audio/manifest.js (made by record.html) sets window.LT_AUDIO = {key: file}.
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
  const a = new Audio('assets/audio/' + file); audioEl = a; a.volume = voiceVolume();
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
let tapId = 0;   // only the latest tap may play its follow-up word
const sayItem = (item, onend)=>{
  const id = ++tapId;
  if (inWord(item)) {
    sayLetter(item.l, item.l, ()=>{
      if (id !== tapId) return;               // a newer tap stopped this one
      speakT = setTimeout(()=>{ if (id === tapId) speak(item.ex[1], onend); }, 350);
    });
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
