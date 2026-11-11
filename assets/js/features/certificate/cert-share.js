/* Learn Tamil — certificates: 🎉 celebration card and grown-up sharing.
   Shown under every new certificate (letter levels in certificate.js, Thirukkural in kural-cert.js).
   The share options sit behind a 3-second press-and-hold, so only a grown-up reaches them.
   Privacy: nothing is sent by Learn Tamil. Buttons are plain links or the device's own share sheet, started by the
   grown-up. Messages and links never contain the child's name; the name is only inside the certificate image,
   which leaves the device only if the grown-up picks it in the share sheet or saves it.

   CertShare.mount(afterEl, { what, again, url, file, blob })
     what  — e.g. "Level 2 · Tamil Words" (no personal data)
     again — true when the child already had another certificate (shows "Another milestone!")
     url   — the page to share (the app home, or the Thirukkural page)
     file  — file name for the saved PNG
     blob  — async () => PNG Blob of the drawn certificate */
'use strict';
const CertShare = (() => {
  const T = () => TEXT.certificate.celebrate;
  const enc = encodeURIComponent;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const IG = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>';
  const icon = id => (window.LTShare && LTShare.icon) ? LTShare.icon(id) : '';

  function messageFor(o){ return fmt(o.again ? T().messageAgain : T().message, { what: o.what }); }

  async function copyText(text){
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      try { const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e2) { return false; }
    }
  }
  function saveBlob(blob, name){
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  const note = (card, text) => { const n = card.querySelector('.cs-note'); if (n){ n.textContent = text; n.hidden = !text; } };
  const log = net => { try { logEv('certificate_share', { net }); } catch (e) {} };   // anonymous: only which button

  function mount(after, o){
    const old = after.parentNode.querySelector('.cs-card'); if (old) old.remove();
    const t = T(), msg = messageFor(o), full = `${msg}\n${o.url}`;
    const card = document.createElement('div');
    card.className = 'cs-card';
    const head = o.again ? t.again : t.ready;
    card.innerHTML = `
      <div class="cs-burst" aria-hidden="true">🎉</div>
      <h3 class="cs-title"><span class="ta">${TEXT.congrats} ${head[0]}</span><small>${head[1]}</small></h3>
      <p class="cs-body">${t.body}</p>
      <button class="btn primary cs-open" type="button">📣 <span class="ta">${t.shareBtn[0]}</span> · ${t.shareBtn[1]}</button>
      <div class="gate cs-gate" hidden>
        <p>${t.gate}</p>
        <button class="gate-btn" type="button"><span class="gate-fill" aria-hidden="true"></span><span class="gate-t">${t.hold}</span></button>
      </div>
      <div class="cs-panel" hidden>
        <h4>${t.shareHead}</h4>
        <p class="cs-msg">${esc(full).replace(/\n/g, '<br>')}</p>
        <div class="share-list cs-list">
          ${navigator.share ? `<button class="share-btn share-more" type="button" data-cs="device">${icon('more')}<span>${t.device}</span></button>` : ''}
          <a class="share-btn share-whatsapp" href="https://wa.me/?text=${enc(full)}" target="_blank" rel="noopener" data-cs="whatsapp" aria-label="Share on WhatsApp">${icon('whatsapp')}<span>WhatsApp</span></a>
          <a class="share-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${enc(o.url)}" target="_blank" rel="noopener" data-cs="facebook" data-copy aria-label="Share on Facebook">${icon('facebook')}<span>Facebook</span></a>
          <a class="share-btn share-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(o.url)}" target="_blank" rel="noopener" data-cs="linkedin" data-copy aria-label="Share on LinkedIn">${icon('linkedin')}<span>LinkedIn</span></a>
          <button class="share-btn share-instagram" type="button" data-cs="instagram" aria-expanded="false">${IG}<span>Instagram</span></button>
          <button class="share-btn share-copy" type="button" data-cs="copy">${icon('copy')}<span>${t.copy}</span></button>
          <button class="share-btn share-save" type="button" data-cs="save">🖼<span>${t.saveImg}</span></button>
        </div>
        <p class="cs-note" role="status" hidden></p>
        <div class="cs-ig" hidden>
          <ol>${t.igSteps.map(s => `<li>${s}</li>`).join('')}</ol>
          <div class="cr-btns"><button class="btn" type="button" data-cs="save">🖼 ${t.saveImg}</button><button class="btn" type="button" data-cs="copy">📋 ${t.copy}</button>
            <a class="btn primary" href="https://www.instagram.com/" target="_blank" rel="noopener" data-cs="open-ig">${IG} ${t.openIg}</a></div>
        </div>
        <p class="cs-privacy">🔒 ${t.privacy}</p>
      </div>`;
    after.insertAdjacentElement('afterend', card);
    if (!calm) setTimeout(() => sparkle(card.querySelector('.cs-burst')), 300);

    const gate = card.querySelector('.cs-gate'), panel = card.querySelector('.cs-panel');
    const unlock = () => { gate.hidden = true; panel.hidden = false; card.querySelector('.cs-open').hidden = true; panel.querySelector('h4').scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' }); };
    card.csUnlock = unlock;   // used by the smoke test
    card.querySelector('.cs-open').addEventListener('click', () => { gate.hidden = !gate.hidden; if (!gate.hidden) gate.querySelector('.gate-btn').focus(); });
    holdToOpen(gate.querySelector('.gate-btn'), unlock);

    panel.addEventListener('click', async e => {
      const b = e.target.closest('[data-cs]'); if (!b) return;
      const net = b.dataset.cs; log(net); if (o.certId) CertRecord.shared(o.certId, net === 'open-ig' ? 'instagram' : net);
      if (b.hasAttribute('data-copy')){ if (await copyText(full)) note(card, t.pasteHint); return; }   // the link opens normally
      if (net === 'whatsapp' || net === 'open-ig') return;
      e.preventDefault();
      if (net === 'copy'){ const ok = await copyText(full); note(card, ok ? t.copied : full); }
      else if (net === 'save'){ const blob = await o.blob(); if (blob) saveBlob(blob, o.file); }
      else if (net === 'instagram'){ const ig = card.querySelector('.cs-ig'); ig.hidden = !ig.hidden; b.setAttribute('aria-expanded', String(!ig.hidden)); }
      else if (net === 'device'){
        const data = { title: 'Learn Tamil certificate', text: full };
        try { const blob = await o.blob(); const f = blob && new File([blob], o.file, { type: 'image/png' });
          if (f && navigator.canShare && navigator.canShare({ files: [f] })) data.files = [f]; } catch (err) {}
        navigator.share(data).catch(() => {});
      }
    });
    return card;
  }

  /* Same grown-up check as the Parent dashboard: hold the button (or Enter/Space) for 3 seconds. */
  function holdToOpen(b, done){
    const fill = b.querySelector('.gate-fill'); let t0 = 0, raf = 0;
    const stop = () => { cancelAnimationFrame(raf); t0 = 0; fill.style.width = '0%'; };
    const tick = now => { const k = Math.min(1, (now - t0) / 3000); fill.style.width = (k * 100) + '%';
      if (k >= 1){ stop(); done(); return; } raf = requestAnimationFrame(tick); };
    const go = () => { t0 = performance.now(); raf = requestAnimationFrame(tick); };
    b.addEventListener('pointerdown', e => { e.preventDefault(); go(); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { if (t0) stop(); }));
    b.addEventListener('contextmenu', e => e.preventDefault());
    b.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !t0){ e.preventDefault(); go(); } });
    b.addEventListener('keyup', () => { if (t0) stop(); });
  }

  return { mount, messageFor };
})();
