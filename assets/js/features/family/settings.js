/* Learn Tamil — family: ⚙️ Settings for text size, high contrast, less movement and sound.
   Device-wide settings in localStorage (lt-text, lt-contrast, lt-motion, lt-sfx, lt-rate, lt-vol, lt-voice, lt-cast).
   The inline script in <head> applies text size, contrast and motion before the first paint;
   this file opens the dialog and keeps the voice speed slider (#rate) remembered. */
'use strict';

const A11Y = {
  get(k, def = ''){ try { const v = localStorage.getItem(k); return v === null ? def : v; } catch (e) { return def; } },
  set(k, v){ try { if (v === '' || v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} },
  // Mirror a setting onto <html data-…> so the CSS (90-kids.css → "Accessibility") can react to it.
  apply(){
    const r = document.documentElement;
    [['text', 'lt-text'], ['contrast', 'lt-contrast'], ['motion', 'lt-motion']].forEach(([a, k]) => {
      const v = this.get(k); if (v) r.setAttribute('data-' + a, v); else r.removeAttribute('data-' + a);
    });
    calm = matchMedia('(prefers-reduced-motion: reduce)').matches || this.get('lt-motion') === 'less';
  }
};

/* Voice speed: remember the slider between visits. */
(function(){
  const r = document.getElementById('rate'); if (!r) return;
  const v = parseFloat(A11Y.get('lt-rate')); if (!isNaN(v)) r.value = v;
  r.addEventListener('change', () => A11Y.set('lt-rate', r.value));
})();

function openSettings(){
  const S = TEXT.settings, rate = document.getElementById('rate');
  const lbl = p => `<span lang="ta">${p[0]}</span> · ${p[1]}`;
  const sizes = ['', 'lg', 'xl'], txt = A11Y.get('lt-text');
  const cast = voiceCast();
  const d = famDialog('settingsDlg', `
    <div class="rw-head"><h2 id="setTitle">⚙️ ${lbl(S.title)}</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
    <div class="set-row"><span class="set-l">🔠 ${lbl(S.text)}</span>
      <div class="seg set-sizes" role="group" aria-label="${S.text[1]}">${sizes.map((v, i) =>
        `<button class="seg-btn" type="button" data-size="${v}" aria-pressed="${v === txt}"><b style="font-size:${14 + i * 4}px">அ A</b><small>${S.sizes[i][1]}</small></button>`).join('')}</div></div>
    <label class="set-row set-sw"><span class="set-l">🌓 ${lbl(S.contrast)}</span><input type="checkbox" id="setContrast" ${A11Y.get('lt-contrast') ? 'checked' : ''}></label>
    <label class="set-row set-sw"><span class="set-l">🐢 ${lbl(S.motion)}</span><input type="checkbox" id="setMotion" ${A11Y.get('lt-motion') ? 'checked' : ''}></label>
    <label class="set-row set-sw"><span class="set-l">🔔 ${lbl(S.sfx)}</span><input type="checkbox" id="setSfx" ${sfxOn ? 'checked' : ''}></label>
    <label class="set-row"><span class="set-l">⏩ ${lbl(S.rate)}</span><input type="range" id="setRate" min="0.4" max="1.2" step="0.1" value="${rate ? rate.value : 0.7}"></label>
    <label class="set-row"><span class="set-l">🔊 ${lbl(S.volume)}</span><input type="range" id="setVol" min="0" max="1" step="0.1" value="${voiceVolume()}"></label>
    <div class="set-row set-who"><span class="set-l">🗣️ ${lbl(S.who)}</span>
      <div class="set-cast" role="group" aria-label="${S.who[1]}">${Object.keys(CAST).map(k =>
        `<button class="set-cast-btn" type="button" data-cast="${k}" aria-pressed="${k === cast}"><span class="set-cast-e" aria-hidden="true">${S.cast[k][0]}</span><span lang="ta">${S.cast[k][1]}</span><small>${S.cast[k][2]}</small></button>`).join('')}</div></div>
    <label class="set-row"><span class="set-l">📱 ${lbl(S.deviceVoice)}</span><select id="setVoice" class="set-voice"></select></label>
    <p class="set-try"><button class="btn primary" type="button" id="setTry">🔊 ${lbl(S.tryVoice)}</button></p>
    <p class="rw-note">Voices come from this device, so they differ between phones, tablets and computers. Most devices have grown-up voices only: the girl and boy are a grown-up voice made higher, and the man is made lower when there is no male Tamil voice. Letters with a recorded sound always play the recording. These settings are for this device and are saved only in this browser.</p>`);
  d.setAttribute('aria-labelledby', 'setTitle');
  d.querySelector('.rw-x').onclick = () => d.close();
  d.querySelectorAll('[data-size]').forEach(b => b.onclick = () => {
    A11Y.set('lt-text', b.dataset.size); A11Y.apply();
    d.querySelectorAll('[data-size]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  });
  d.querySelector('#setContrast').onchange = e => { A11Y.set('lt-contrast', e.target.checked ? 'high' : ''); A11Y.apply(); };
  d.querySelector('#setMotion').onchange = e => { A11Y.set('lt-motion', e.target.checked ? 'less' : ''); A11Y.apply(); };
  d.querySelector('#setSfx').onchange = e => { Rewards.setSound(e.target.checked); document.dispatchEvent(new Event('lt:sfx')); if (sfxOn) SFX.tick(); };
  d.querySelector('#setRate').onchange = e => { if (rate){ rate.value = e.target.value; } A11Y.set('lt-rate', e.target.value); };
  d.querySelector('#setVol').onchange = e => A11Y.set('lt-vol', e.target.value);
  const sel = d.querySelector('#setVoice');
  const fillVoices = () => {
    const cur = A11Y.get('lt-voice');
    sel.innerHTML = `<option value="">${S.voiceAuto[1]}</option>` + tamilVoices.map(v =>
      `<option value="${v.name.replace(/"/g, '&quot;')}">${v.name.replace(/</g, '&lt;')}</option>`).join('');
    sel.value = tamilVoices.some(v => v.name === cur) ? cur : '';
    sel.disabled = !tamilVoices.length;
  };
  fillVoices();
  document.addEventListener('lt:voices', fillVoices);
  d.addEventListener('close', () => document.removeEventListener('lt:voices', fillVoices), { once: true });
  sel.onchange = () => { A11Y.set('lt-voice', sel.value); if ('speechSynthesis' in window) pickVoice(); speak(TEXT.hello); };
  d.querySelectorAll('[data-cast]').forEach(b => b.onclick = () => {
    A11Y.set('lt-cast', b.dataset.cast === 'woman' ? '' : b.dataset.cast);
    A11Y.set('lt-voice', ''); fillVoices();   // a new character picks its own voice
    d.querySelectorAll('[data-cast]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    speak(TEXT.hello);
  });
  d.querySelector('#setTry').onclick = () => speak(TEXT.hello);
}

(function(){
  const b = document.getElementById('settingsBtn'); if (b) b.addEventListener('click', openSettings);
})();
document.addEventListener('lt:open', e => { if (e.detail === 'settings') openSettings(); });
A11Y.apply();
