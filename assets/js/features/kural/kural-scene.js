/* Learn Tamil — Thirukkural: 🎬 animated story player.
   Plays a Kural's own storyboard (data/kural-lessons.js → scene): 3–5 frames of cartoon actors on a
   painted background, each with a Tamil caption (English optional) and optional narration by the
   Tamil voice. About 15–25 seconds per Kural. Respects "less movement" (calm): actors appear without moving. */
'use strict';

const KScene = (() => {
  let timer = 0, run = 0;
  const FRAME_MS = 5200;

  function stop(){
    run++; clearTimeout(timer);
    try { speechSynthesis.cancel(); } catch (e) {}
  }

  /* el: the container. opts: { captions: true, en: false, narrate: true, onDone } */
  function play(el, scene, opts = {}){
    stop();
    const my = run, { captions = true, en = false, narrate = true, onDone } = opts;
    el.innerHTML = `<div class="ks-stage" aria-hidden="true"><div class="ks-actors"></div></div>
      ${captions ? '<p class="ks-cap" aria-live="polite"><span class="ks-ta" lang="ta"></span><small class="ks-en"></small></p>' : ''}
      <div class="ks-dots">${scene.map(() => '<i></i>').join('')}</div>`;
    const stage = el.querySelector('.ks-stage'), actors = el.querySelector('.ks-actors');
    const dots = [...el.querySelectorAll('.ks-dots i')];
    const show = i => {
      if (my !== run) return;
      if (i >= scene.length){ el.classList.add('ks-done'); onDone && onDone(); return; }
      el.classList.remove('ks-done');
      const f = scene[i];
      stage.className = 'ks-stage ks-bg-' + (f.bg || 'sky');
      actors.innerHTML = (f.board ? `<div class="ks-board" lang="ta">${lettersOf(f.board).map((g, j) =>
          `<span style="--d:${calm ? 0 : 400 + j * 260}ms">${g}</span>`).join('')}</div>` : '') +
        (f.a || []).map(([e, x, y, size, move], j) =>
          `<span class="ks-a ${calm ? '' : 'ks-' + move}" style="left:${x}%;top:${y}%;font-size:${size}px;--d:${j * 180}ms">${e}</span>`).join('');
      dots.forEach((d, j) => d.classList.toggle('on', j <= i));
      if (captions){
        el.querySelector('.ks-ta').textContent = f.cap[0];
        el.querySelector('.ks-en').textContent = en ? f.cap[1] : '';
      }
      const t0 = Date.now();
      const nextFrame = () => { if (my !== run) return; timer = setTimeout(() => show(i + 1), Math.max(1200, FRAME_MS - (Date.now() - t0))); };
      if (narrate && captions) speak(f.cap[0], nextFrame);
      else nextFrame();
    };
    show(0);
  }
  return { play, stop };
})();
