/* Learn Tamil — core: DOM shortcuts, random helpers and visual effects.
   Loaded before every feature. */
'use strict';

const $ = s=>document.querySelector(s);
const $$ = s=>[...document.querySelectorAll(s)];
const rand = n => Math.floor(Math.random()*n);
const shuffle = a => { for (let i=a.length-1;i>0;i--){ const j=rand(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };

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
