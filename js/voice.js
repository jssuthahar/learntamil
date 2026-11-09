/* Learn Tamil — 🎤 Say it back.
   The child hears the letter or word, records themselves saying it, then plays both to compare.
   The recording stays in this browser tab only: it is never uploaded or saved, and it is thrown
   away when the window closes. There is no speech recognition — a grown-up or the child listens.
   Uses helpers from app.js / rewards.js: speak, stopAudio, Rewards, Progress, addStar. */
'use strict';
const SayBack = (() => {
  let dlg = null, opts = null, rec = null, stream = null, url = null, player = null, stopT = 0, rewarded = false;
  const MAX_MS = 4000;
  function build(){
    dlg = document.createElement('dialog'); dlg.className = 'say-dlg'; dlg.setAttribute('aria-labelledby', 'sayText');
    dlg.innerHTML = `
      <button class="rw-x say-x" type="button" aria-label="Close">✕</button>
      <p class="say-help"><span lang="ta">கேள், பிறகு நீ சொல்!</span><small>Listen, then say it yourself</small></p>
      <div class="say-text" id="sayText" lang="ta"></div>
      <button class="say-mic" type="button" aria-label="Record my voice"><span class="say-ic" aria-hidden="true">🎤</span></button>
      <p class="say-status" aria-live="polite"></p>
      <div class="say-row">
        <button class="btn" type="button" data-act="ref">🔊 <span lang="ta">சரியான ஒலி</span></button>
        <button class="btn" type="button" data-act="mine" disabled>▶ <span lang="ta">என் குரல்</span></button>
        <button class="btn" type="button" data-act="both" disabled>🔁 Both</button>
      </div>
      <p class="say-note">🔒 Your voice stays on this device and is deleted when you close this.</p>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', cleanup);
    dlg.querySelector('.say-x').onclick = () => dlg.close();
    dlg.querySelector('.say-mic').onclick = () => rec && rec.state === 'recording' ? stopRec() : startRec();
    dlg.querySelector('[data-act="ref"]').onclick = () => playRef();
    dlg.querySelector('[data-act="mine"]').onclick = () => playMine();
    dlg.querySelector('[data-act="both"]').onclick = () => playRef(() => setTimeout(() => playMine(), 300));
  }
  const status = t => { dlg.querySelector('.say-status').textContent = t; };
  const $d = s => dlg.querySelector(s);
  function playRef(done){ stopPlayer(); opts.play ? opts.play(done) : speak(opts.text, done); }
  function stopPlayer(){ if (player){ player.onended = null; player.pause(); player = null; } }
  function playMine(done){
    if (!url) return;
    stopPlayer(); stopAudio(); try { speechSynthesis.cancel(); } catch (e) {}
    player = new Audio(url); player.onended = () => { player = null; done && done(); };
    player.play().catch(() => done && done());
  }
  async function startRec(){
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder){
      status('This browser cannot record. Try Chrome, Edge or Safari.'); return;
    }
    stopPlayer(); stopAudio(); try { speechSynthesis.cancel(); } catch (e) {}
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { status('🎤 The microphone is off. Ask a grown-up to allow it in the browser settings.'); return; }
    const chunks = [];
    rec = new MediaRecorder(stream);
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      clearTimeout(stopT); dropStream();
      $d('.say-mic').classList.remove('on'); $d('.say-ic').textContent = '🎤';
      if (!chunks.length){ status(''); return; }
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
      $d('[data-act="mine"]').disabled = $d('[data-act="both"]').disabled = false;
      status('Listen to your voice 👂');
      playMine(() => {
        status('Tap 🔁 to hear both. Tap 🎤 to try again.');
        if (!rewarded){ rewarded = true; Progress.track('said'); addStar(1); Rewards.cheer($d('.say-mic'), true); }
      });
    };
    rec.start();
    $d('.say-mic').classList.add('on'); $d('.say-ic').textContent = '⏹';
    status('🔴 Say it now…');
    stopT = setTimeout(stopRec, MAX_MS);
  }
  function stopRec(){ clearTimeout(stopT); if (rec && rec.state === 'recording') rec.stop(); }
  function dropStream(){ if (stream){ stream.getTracks().forEach(t => t.stop()); stream = null; } }
  function cleanup(){
    clearTimeout(stopT);
    if (rec && rec.state === 'recording'){ rec.onstop = null; rec.stop(); }
    rec = null; dropStream(); stopPlayer();
    if (url){ URL.revokeObjectURL(url); url = null; }
  }
  return {
    /* opts: { text: 'அ', play: done => … (plays the correct sound; optional) } */
    open(o){
      if (!dlg) build();
      cleanup(); opts = o; rewarded = false;
      $d('#sayText').textContent = o.text;
      $d('[data-act="mine"]').disabled = $d('[data-act="both"]').disabled = true;
      status('');
      if (typeof dlg.showModal === 'function'){ if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
      setTimeout(() => playRef(), 250);
    }
  };
})();
// Reading practice: say the current word.
$('#readMic').addEventListener('click', () => { const w = R.list[R.idx][0]; SayBack.open({ text: w, play: done => speak(w, done) }); });
