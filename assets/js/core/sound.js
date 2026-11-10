/* Learn Tamil — core: sound effects.
   Generated with the Web Audio API (no files, works offline). The on/off choice is device-wide. */
'use strict';

/* ---------- sound effects ---------- */
let sfxOn = true;
try { sfxOn = localStorage.getItem('lt-sfx') !== '0'; } catch (e) {}
let actx = null;
function audioCtx(){
  if (!actx){ const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; actx = new AC(); }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(freq, start, dur, type = 'sine', vol = 0.16, slideTo = 0){
  const a = audioCtx(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(a.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
/* Kid-friendly instruments built from tones: xylophone, bell, bubble, cartoon boing / pop / whoosh. */
function xylo(freq, start, vol = 0.14, dur = 0.45){        // wooden xylophone: bright attack, quick decay
  tone(freq, start, dur, 'sine', vol); tone(freq * 4, start, dur * 0.25, 'sine', vol * 0.35); tone(freq * 10, start, 0.05, 'sine', vol * 0.08);
}
function bell(freq, start, vol = 0.09, dur = 1.1){          // soft glockenspiel bell that rings out
  tone(freq, start, dur, 'sine', vol); tone(freq * 2.76, start, dur * 0.5, 'sine', vol * 0.4); tone(freq * 5.4, start, dur * 0.25, 'sine', vol * 0.2);
}
function bubble(start, from = 280, to = 950, vol = 0.12, dur = 0.11){ tone(from, start, dur, 'sine', vol, to); }
function noise(start, dur, vol, fFrom, fTo, q = 1.2){      // filtered noise: pops and whooshes
  const a = audioCtx(); if (!a) return;
  const len = Math.ceil(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + start;
  src.buffer = buf; f.type = 'bandpass'; f.Q.value = q;
  f.frequency.setValueAtTime(fFrom, t); f.frequency.exponentialRampToValueAtTime(fTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(a.destination); src.start(t); src.stop(t + dur + 0.02);
}
function twinkle(start, n = 5, vol = 0.05){                 // fairy-dust sparkle on top of a win
  for (let i = 0; i < n; i++) bell(1568 + Math.random() * 1600, start + i * 0.06 + Math.random() * 0.03, vol, 0.4);
}
const C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5, E6 = 1318.5, G6 = 1568;
const SFX = {
  /* right answer: happy xylophone run + a little sparkle */
  correct(){ if (!sfxOn) return; [C5, E5, G5, C6].forEach((f, i) => xylo(f, i * 0.07)); twinkle(0.3, 3, 0.04); },
  /* 3 in a row: higher, faster run with a slide-whistle "whee!" */
  combo(){ if (!sfxOn) return; [G5, C6, E6, G6].forEach((f, i) => xylo(f, i * 0.055, 0.12)); tone(600, 0.24, 0.3, 'sine', 0.07, 1800); twinkle(0.4, 4); },
  /* round finished: ta-da fanfare with ringing bells */
  win(){ if (!sfxOn) return;
    [C5, E5, G5, C6, E6].forEach((f, i) => xylo(f, i * 0.08));
    [C5, E5, G5, C6].forEach(f => bell(f, 0.48, 0.06, 1.4));
    twinkle(0.55, 7); },
  /* wrong answer: soft, silly "boing" — never scary */
  wrong(){ if (!sfxOn) return; tone(420, 0, 0.12, 'sine', 0.1, 300); tone(300, 0.11, 0.26, 'sine', 0.09, 200); tone(200, 0.11, 0.26, 'triangle', 0.03, 140); },
  /* letter placed: one bright xylophone note */
  tick(){ if (!sfxOn) return; xylo(C6, 0, 0.1, 0.3); },
  /* tab, button or card tap: a water bubble "bloop" */
  tap(){ if (!sfxOn) return; bubble(0); },
  click(){ if (!sfxOn) return; xylo(1760, 0, 0.05, 0.08); },
  /* memory card turns over: swish + bloop */
  flip(){ if (!sfxOn) return; noise(0, 0.14, 0.05, 900, 3500, 0.8); bubble(0.05, 400, 1100, 0.07, 0.09); },
  /* story page turn: paper swoosh */
  page(){ if (!sfxOn) return; noise(0, 0.28, 0.06, 3000, 700, 0.6); },
  /* tokens: two-note coin ding */
  coin(){ if (!sfxOn) return; tone(988, 0, 0.09, 'square', 0.035); tone(1319, 0.08, 0.35, 'square', 0.035); bell(1319, 0.08, 0.05, 0.5); },
  spinStart(){ if (!sfxOn) return; tone(300, 0, 0.45, 'sine', 0.08, 1200); noise(0, 0.4, 0.04, 600, 4000, 0.7); },
  landed(){ if (!sfxOn) return; bell(A5, 0, 0.09, 0.6); bell(E6, 0.1, 0.08, 0.8); },
  /* balloon: cartoon pop */
  pop(){ if (!sfxOn) return; noise(0, 0.08, 0.16, 2500, 600, 0.9); tone(900, 0, 0.09, 'sine', 0.08, 200); },
  /* new badge: magic shimmer, then the fanfare */
  badge(){ if (!sfxOn) return; for (let i = 0; i < 10; i++) bell(G5 * Math.pow(2, i / 7), i * 0.045, 0.045, 0.5); setTimeout(() => SFX.win(), 420); },
  /* Kili levels up: slide-whistle rise + fanfare */
  levelUp(){ if (!sfxOn) return; tone(400, 0, 0.5, 'sine', 0.08, 1600); setTimeout(() => SFX.win(), 450); }
};
