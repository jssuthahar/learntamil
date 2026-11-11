/* Learn Tamil — certificates: 👪 the parent's details form and the certificate record (Cloud Firestore).
   Website only: in the Google Play app (window.LT_APP) nothing is asked and nothing is sent.
   Flow (certificate.js, kural-cert.js): name + parent's email + phone + consent → validate → make the certificate →
   CertRecord.submit() saves one Firestore document per certificate ID (services/firebase.js → window.ltCertStore).
   - Not asked twice: a valid email/phone/consent is remembered on this device (localStorage lt-parent-contact,
     device-wide because brothers and sisters share a parent) and shown as "Saved · Change".
   - Never stored twice: IDs already sent are kept in lt-cert-sent; a retake keeps its certificate ID.
   - Never blocks the child: if saving fails or the device is offline, the certificate is still made and the record waits
     in lt-cert-outbox until the next time the site is online.
   Text: TEXT.certificate.contact (grown-up surface, English). Privacy page: tools/build-pages.mjs → #certificates. */
'use strict';
const CertRecord = (() => {
  const CONSENT_VERSION = 1;
  const K_CONTACT = 'lt-parent-contact', K_SENT = 'lt-cert-sent', K_OUT = 'lt-cert-outbox';
  const C = () => TEXT.certificate.contact;
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const collecting = () => !window.LT_APP;
  const cleanEmail = v => String(v || '').trim().toLowerCase();
  const cleanPhone = v => { const p = String(v || '').replace(/[\s\-(). ]/g, ''); return p.startsWith('00') ? '+' + p.slice(2) : p; };
  const okEmail = v => v.length >= 6 && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const okPhone = v => /^\+[1-9]\d{6,14}$/.test(v);
  const saved = () => { const c = load(K_CONTACT, null); return c && c.v === CONSENT_VERSION && okEmail(c.email) && okPhone(c.phone) ? c : null; };
  const mask = {
    email: e => e.replace(/^(.)(.*)(@.*)$/, (m, a, b, d) => a + '•'.repeat(Math.min(6, b.length)) + d),
    phone: p => p.slice(0, 3) + ' ••• ' + p.slice(-3)
  };

  /* The parent's part of a certificate form. `p` makes the element IDs unique. */
  function fieldsHTML(p){
    if (!collecting()) return '';
    const c = C(), s = saved();
    return `<fieldset class="crc" data-crc>
      <legend>${c.head}</legend>
      <p class="crc-why">${c.why} <a href="privacy.html#certificates" target="_blank" rel="noopener">${c.privacyLink}</a></p>
      ${s ? `<p class="crc-saved" data-crc-saved>📧 ${esc(mask.email(s.email))} · 📱 ${esc(mask.phone(s.phone))}
        <button class="btn small" type="button" data-crc-change>${c.change}</button><br><small class="muted">${c.saved}</small></p>` : ''}
      <div class="crc-fields" data-crc-fields ${s ? 'hidden' : ''}>
        <label for="${p}Email">${c.email}</label>
        <input id="${p}Email" data-crc-in="email" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="name@example.com" value="${s ? esc(s.email) : ''}">
        <small class="crc-err" data-crc-err="email" hidden></small>
        <label for="${p}Phone">${c.phone}</label>
        <input id="${p}Phone" data-crc-in="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="22" placeholder="${c.phoneHint}" value="${s ? esc(s.phone) : ''}">
        <small class="crc-err" data-crc-err="phone" hidden></small>
        <label class="crc-consent"><input type="checkbox" data-crc-in="consent"> <span>${c.consent}</span></label>
        <small class="crc-err" data-crc-err="consent" hidden></small>
      </div>
    </fieldset>`;
  }
  /* Wire the "Change" button. Call after the form is in the page. */
  function wire(form){
    const b = form.querySelector('[data-crc-change]'); if (!b) return;
    b.addEventListener('click', () => { form.querySelector('[data-crc-saved]').hidden = true; const f = form.querySelector('[data-crc-fields]'); f.hidden = false; f.querySelector('input').focus(); });
  }
  /* Validate. Returns { ok, contact } and shows a gentle message under each field that needs a fix. */
  function read(form, name){
    const c = C(), errs = {};
    if (!name) errs.name = c.errName;
    let contact = null;
    if (collecting()){
      const fields = form.querySelector('[data-crc-fields]'), s = saved();
      if (s && fields.hidden) contact = s;
      else {
        const v = k => form.querySelector(`[data-crc-in="${k}"]`);
        const email = cleanEmail(v('email').value), phone = cleanPhone(v('phone').value);
        if (!okEmail(email)) errs.email = c.errEmail;
        if (!okPhone(phone)) errs.phone = c.errPhone;
        if (!v('consent').checked) errs.consent = c.errConsent;
        contact = { email, phone, v: CONSENT_VERSION };
      }
    }
    form.querySelectorAll('[data-crc-err]').forEach(el => { const m = errs[el.dataset.crcErr]; el.textContent = m || ''; el.hidden = !m; });
    form.querySelectorAll('[data-crc-in]').forEach(el => el.toggleAttribute('aria-invalid', !!errs[el.dataset.crcIn]));
    const first = Object.keys(errs).find(k => k !== 'name'); if (first) form.querySelector(`[data-crc-in="${first}"]`).focus();
    const ok = !Object.keys(errs).length;
    if (ok && contact) store(K_CONTACT, contact);
    return { ok, errs, contact };
  }

  /* Save one certificate record. Resolves to 'saved', 'queued' (offline or failed: retried later) or 'skipped'. */
  async function submit(rec, contact){
    if (!collecting() || !contact) return 'skipped';
    const sent = load(K_SENT, []);
    if (sent.includes(rec.certificateId)) return 'skipped';   // already stored (a retake keeps its ID)
    const doc = { studentName: rec.studentName.slice(0, 40), email: contact.email, phoneNumber: contact.phone,
      certificateId: rec.certificateId, batchId: rec.batchId, courseName: rec.courseName.slice(0, 160), source: rec.source,
      consent: true, consentVersion: contact.v };
    try { await send(doc); return 'saved'; }
    catch (e) { const out = load(K_OUT, []).filter(d => d.certificateId !== doc.certificateId); out.push(doc); store(K_OUT, out); return 'queued'; }
  }
  async function send(doc, retry){
    if (!window.ltCertStore || !ltCertStore.available()) throw new Error('offline');
    try { await ltCertStore.save(doc); }
    catch (e) {
      // permission-denied on a retry = the first try did reach the server (a document can be created only once)
      if (!(e && e.code === 'permission-denied' && retry)) throw e;
    }
    store(K_SENT, [...load(K_SENT, []), doc.certificateId].slice(-200));
  }
  let flushing = false;
  async function flush(){
    if (flushing || !navigator.onLine || !window.ltCertStore || !ltCertStore.available()) return;
    flushing = true;
    try {
      for (const d of load(K_OUT, [])){
        try { await send(d, true); store(K_OUT, load(K_OUT, []).filter(x => x.certificateId !== d.certificateId)); } catch (e) {}
      }
    } finally { flushing = false; }
  }
  /* A parent tapped a share button: switch that flag on in the record (only if this certificate was stored). */
  function shared(certificateId, net){
    if (!['linkedin', 'whatsapp', 'facebook', 'instagram'].includes(net) || !load(K_SENT, []).includes(certificateId) || !window.ltCertStore) return;
    ltCertStore.shared(certificateId, net).catch(() => {});
  }
  const wasSent = id => load(K_SENT, []).includes(id);

  /* 🔎 "Check a certificate": type an ID, see the name, course and date (certificateVerify — never the email or phone). */
  function verifyHTML(p){
    if (!collecting()) return '';
    const v = TEXT.certificate.verify;
    return `<form class="crv" data-crv novalidate><h3>${v.head}</h3><p class="muted">${v.intro}</p>
      <label for="${p}Vid">${v.label}</label>
      <div class="cr-row"><input id="${p}Vid" data-crv-id maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${v.placeholder}">
        <button class="btn primary" type="submit">${v.button}</button></div>
      <div class="crv-out" data-crv-out role="status" aria-live="polite"></div></form>`;
  }
  function wireVerify(form){
    if (!form) return;
    const v = TEXT.certificate.verify, out = form.querySelector('[data-crv-out]'), inp = form.querySelector('[data-crv-id]');
    let busy = false;
    form.addEventListener('submit', async e => {
      e.preventDefault(); if (busy) return;
      const id = inp.value.replace(/\s+/g, '').toUpperCase();
      if (!/^(LT|TKL|TK)[0-9]{1,3}-[A-Z0-9]{4,12}$/.test(id)){ out.innerHTML = `<p class="crv-msg">${v.bad}</p>`; inp.focus(); return; }
      busy = true; out.innerHTML = `<p class="crv-msg">${v.checking}</p>`;
      try {
        if (!window.ltCertStore) throw new Error('offline');
        const r = await ltCertStore.verify(id);
        if (!r){ out.innerHTML = `<p class="crv-msg">${v.notFound}</p>`; return; }
        const date = r.issuedOn ? new Date(r.issuedOn + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        out.innerHTML = `<div class="crv-card"><b>${v.valid}</b><dl>
          <dt>${v.name}</dt><dd>${esc(r.studentName)}</dd><dt>${v.course}</dt><dd>${esc(r.courseName)}</dd>
          ${date ? `<dt>${v.date}</dt><dd>${esc(date)}</dd>` : ''}<dt>${v.label}</dt><dd><code>${esc(id)}</code></dd></dl></div>`;
      } catch (err) { out.innerHTML = `<p class="crv-msg">${v.offline}</p>`; }
      finally { busy = false; }
    });
  }

  document.addEventListener('lt:certstore', () => setTimeout(flush, 3000));
  addEventListener('online', () => setTimeout(flush, 2000));
  if (window.ltCertStore) setTimeout(flush, 3000);

  return { collecting, fieldsHTML, wire, read, submit, flush, shared, wasSent, verifyHTML, wireVerify, cleanPhone, okPhone, okEmail, CONSENT_VERSION };
})();
