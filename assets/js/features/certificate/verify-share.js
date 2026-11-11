/* Learn Tamil — 🎓 a checked certificate on verify-certificate.html (a grown-up page; this is what a QR code scan shows).
   VerifyShare.mount(out, result) adds, under the "✅ real certificate" card:
     1. About this certificate: what the child did, what that level or chapter covers, how a certificate is earned.
     2. The certificate itself, redrawn exactly as printed (CertDraw), to download as PDF or image.
     3. Share buttons: device share sheet (with the image), WhatsApp, LinkedIn, Facebook, X, Telegram, email, Instagram steps.
   Level and chapter details come from the page's own JSON block (#certInfo, written by tools/build-pages.mjs from
   CERT_LEVELS, KURAL_LEVELS and thirukkural.json), so this page does not load the big lesson files.
   Privacy: nothing is sent by Learn Tamil. Share buttons are plain links or the device's own share sheet. The message never
   contains the name; the name is on the certificate and on this page, which anyone with the ID can already open.
   Text: TEXT.certificate.verify.about / .share. */
'use strict';
const VerifyShare = (() => {
  const V = () => TEXT.certificate.verify;
  const enc = encodeURIComponent;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => k in vars ? vars[k] : m);
  const icon = id => (window.LTShare && LTShare.icon) ? LTShare.icon(id) : '';
  const IG = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>';

  let INFO = null;
  const info = () => { if (!INFO) try { INFO = JSON.parse(document.getElementById('certInfo').textContent); } catch (e) { INFO = {}; } return INFO; };

  /* What kind of certificate an ID is, from its prefix: LT3-… letter level 3, TKL2-… Thirukkural level 2, TK5-… chapter 5. */
  function describe(r){
    const m = /^(LT|TKL|TK)(\d{1,3})-/.exec(r.certificateId || ''); if (!m) return null;
    const n = +m[2], I = info(), score = Number.isInteger(r.score) ? r.score : null;
    if (m[1] === 'LT'){
      const L = (I.letters || [])[n - 1]; if (!L) return null;
      const total = r.total || L.total || 10;
      return { kind: 'letters', n, L, total, pass: L.pass || 8, score,
        draw: cv => CertDraw.letters(cv, L, { name: r.studentName, date: r.issuedOn, id: r.certificateId, score, total }, { qr: true }),
        file: `Learn-Tamil-Certificate-Level-${n}` };
    }
    const chapter = c => (I.chapters || [])[c - 1];          // [Tamil name, English name, line 1, line 2] of the chapter's first Kural
    if (m[1] === 'TKL'){
      const K = (I.kuralLevels || [])[n - 1]; if (!K) return null;
      const first = chapter(Math.ceil(K.from / 10)); if (!first) return null;
      const X = { kind: 'level', id: n, L: K, total: r.total || K.total || 10 };
      return { kind: 'kuralLevel', n, K, total: X.total, pass: K.pass || 8, score,
        draw: cv => CertDraw.kural(cv, X, r.studentName, { d: r.issuedOn, s: score, id: r.certificateId }, { couplet: [first[2], first[3]] }, { qr: true }),
        file: `Thirukkural-Certificate-Level-${n}` };
    }
    const ch = chapter(n); if (!ch) return null;
    const X = { kind: 'chapter', id: n, total: r.total || 10 };
    return { kind: 'chapter', n, ch, total: X.total, pass: 8, score,
      draw: cv => CertDraw.kural(cv, X, r.studentName, { d: r.issuedOn, s: score, id: r.certificateId }, { chapter: [ch[0], ch[1]], couplet: [ch[2], ch[3]] }, { qr: true }),
      file: `Thirukkural-Certificate-Chapter-${n}` };
  }

  function aboutHTML(r, d){
    const A = V().about, name = esc(r.studentName || ''), p = s => `<p>${s}</p>`;
    let did = '', covers = '';
    if (d.kind === 'letters'){
      did = fill(A.didLevel, { name, n: d.n, title: `${esc(d.L.titleEn)} · ${esc(d.L.en)}`, en: `<span class="ta" lang="ta">${esc(d.L.ta)}</span>` });
      covers = esc(d.L.about || '');
    } else if (d.kind === 'kuralLevel'){
      did = fill(A.didKuralLevel, { name, n: d.n, en: esc(d.K.en), ta: `<span class="ta" lang="ta">${esc(d.K.ta)}</span>`, from: d.K.from, to: d.K.to });
      covers = esc(fill(A.kuralCovers, { from: d.K.from, to: d.K.to, chFrom: Math.ceil(d.K.from / 10), chTo: Math.ceil(d.K.to / 10) }));
    } else {
      did = fill(A.didChapter, { name, n: d.n, chEn: esc(d.ch[1]), chTa: `<span class="ta" lang="ta">${esc(d.ch[0])}</span>` });
      covers = fill(esc(A.chapterCovers), { n: d.n, l1: `<span class="ta" lang="ta">${esc(d.ch[2])}`, l2: `${esc(d.ch[3])}</span>` });
    }
    const facts = [did];
    if (r.dateText) facts.push(fill(A.onDate, { date: esc(r.dateText) }));
    if (d.score !== null) facts.push(fill(A.score, { score: d.score, total: d.total, pct: Math.round(d.score / d.total * 100) }));
    const how = [fill(A.how, { total: d.total, pass: d.pass })];
    if (d.kind !== 'chapter' && d.n > 1) how.push(fill(A.howLevels, { n: d.n, name, prev: d.n - 1 }));
    return `<section class="vs-about"><h4>${A.head}</h4>${p(facts.join(' '))}
      <h5>${fill(A.coversHead, { name })}</h5>${p(covers)}
      <h5>${A.howHead}</h5>${p(how.join(' '))}${p(A.record)}${p(A.app)}</section>`;
  }

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

  function mount(out, r){
    const t = V().share, url = CertRecord.verifyUrl(r.certificateId), d = describe(r);
    const msg = fill(t.message, { course: r.courseName || '', date: r.dateText || '' }), full = `${msg}\n${url}`;
    const base = (d ? d.file : 'Learn-Tamil-Certificate') + '-' + r.certificateId;
    const box = document.createElement('div');
    box.className = 'vs-panel';
    box.innerHTML = `${d ? aboutHTML(r, d) : ''}
      ${d ? `<div class="vs-cert"><img alt="${esc(t.title)}: ${esc(r.studentName || '')}" hidden><div class="cr-btns">
        <button class="btn primary" type="button" data-vs="pdf">⬇ ${t.pdf}</button><button class="btn" type="button" data-vs="save">🖼 ${t.download}</button></div></div>` : ''}
      <h4>${t.head}</h4>
      <p class="cs-msg">${esc(full).replace(/\n/g, '<br>')}</p>
      <div class="share-list cs-list">
        ${d && navigator.share ? `<button class="share-btn share-more" type="button" data-vs="device">${icon('more')}<span>${t.device}</span></button>` : ''}
        <a class="share-btn share-whatsapp" href="https://wa.me/?text=${enc(full)}" target="_blank" rel="noopener" data-vs="whatsapp" aria-label="Share on WhatsApp">${icon('whatsapp')}<span>WhatsApp</span></a>
        <a class="share-btn share-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}" target="_blank" rel="noopener" data-vs="linkedin" data-copy aria-label="Share on LinkedIn">${icon('linkedin')}<span>LinkedIn</span></a>
        <a class="share-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}" target="_blank" rel="noopener" data-vs="facebook" data-copy aria-label="Share on Facebook">${icon('facebook')}<span>Facebook</span></a>
        <a class="share-btn share-x" href="https://twitter.com/intent/tweet?text=${enc(msg)}&url=${enc(url)}" target="_blank" rel="noopener" data-vs="x" aria-label="Share on X">${icon('x')}<span>X</span></a>
        <a class="share-btn share-telegram" href="https://t.me/share/url?url=${enc(url)}&text=${enc(msg)}" target="_blank" rel="noopener" data-vs="telegram" aria-label="Share on Telegram">${icon('telegram')}<span>Telegram</span></a>
        <a class="share-btn share-email" href="mailto:?subject=${enc(t.title)}&body=${enc(full)}" data-vs="email" aria-label="Share by email">${icon('email')}<span>Email</span></a>
        ${d ? `<button class="share-btn share-instagram" type="button" data-vs="instagram" aria-expanded="false">${IG}<span>Instagram</span></button>` : ''}
        <button class="share-btn share-copy" type="button" data-vs="copy">${icon('copy')}<span>${t.copy}</span></button>
      </div>
      <p class="cs-note" role="status" hidden></p>
      ${d ? `<div class="cs-ig" hidden>
        <ol>${t.igSteps.map(s => `<li>${s}</li>`).join('')}</ol>
        <div class="cr-btns"><button class="btn" type="button" data-vs="save">🖼 ${t.download}</button><button class="btn" type="button" data-vs="copy">📋 ${t.copy}</button>
          <a class="btn primary" href="https://www.instagram.com/" target="_blank" rel="noopener" data-vs="open-ig">${IG} ${t.openIg}</a></div>
      </div>` : ''}
      <p class="cs-privacy">🔒 ${t.privacy}</p>`;
    out.appendChild(box);

    // Draw once: the preview is exactly the certificate that is downloaded or shared.
    const cv = CertDraw.canvas();
    const ready = d ? d.draw(cv).then(async () => { const b = await CertDraw.pngOf(cv);
      if (b && box.isConnected){ const img = box.querySelector('.vs-cert img'); img.src = URL.createObjectURL(b); img.hidden = false; }
      return b; }) : Promise.resolve(null);
    box.vsReady = ready.then(() => cv);   // used by the smoke test
    const note = text => { const n = box.querySelector('.cs-note'); n.textContent = text; n.hidden = !text; };

    box.addEventListener('click', async e => {
      const b = e.target.closest('[data-vs]'); if (!b) return;
      const what = b.dataset.vs;
      if (b.hasAttribute('data-copy')){ if (await copyText(full)) note(t.pasteHint); return; }   // the link still opens
      if (b.tagName === 'A') return;                                                             // WhatsApp, X, Telegram, email, Instagram
      e.preventDefault();
      if (what === 'save'){ const blob = await ready; if (blob) saveBlob(blob, base + '.png'); }
      else if (what === 'pdf'){ await ready; saveBlob(await CertDraw.pdfOf(cv, `${t.title} - ${r.certificateId}`), base + '.pdf'); }
      else if (what === 'copy'){ const ok = await copyText(full); note(ok ? t.copied : full); }
      else if (what === 'instagram'){ const ig = box.querySelector('.cs-ig'); ig.hidden = !ig.hidden; b.setAttribute('aria-expanded', String(!ig.hidden)); }
      else if (what === 'device'){
        const data = { title: t.title, text: full };
        try { const blob = await ready; const f = blob && new File([blob], base + '.png', { type: 'image/png' });
          if (f && navigator.canShare && navigator.canShare({ files: [f] })) data.files = [f]; } catch (err) {}
        navigator.share(data).catch(() => {});
      }
    });
    return box;
  }

  return { mount, describe };
})();
