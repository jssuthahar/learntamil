/* Learn Tamil — 🔎 the "Check a certificate" page (verify-certificate.html) for parents, teachers and schools.
   Shows the same check form as the certificate screens (CertRecord.verifyHTML). Opened from a certificate's QR code
   (verify-certificate.html?id=LT1-AB12CD), it checks that ID straight away. Each check puts its ID in the address bar,
   so the result can be copied as a link. The lookup reads only certificateVerify/{id} (services/firebase.js). */
'use strict';
(() => {
  const box = document.getElementById('certVerify'); if (!box) return;
  const html = CertRecord.verifyHTML('vp');
  if (!html){ box.innerHTML = `<p class="crv-msg">${TEXT.certificate.verify.appOnly}</p>`; return; }   // Google Play app: nothing is sent
  box.innerHTML = html;
  const form = box.querySelector('[data-crv]'), inp = form.querySelector('[data-crv-id]');
  CertRecord.wireVerify(form);
  form.addEventListener('submit', () => {
    const id = inp.value.replace(/\s+/g, '').toUpperCase();
    if (/^[A-Z0-9-]{1,20}$/.test(id)) try { history.replaceState(null, '', '?id=' + encodeURIComponent(id)); } catch (e) {}
  });
  let id = ''; try { id = (new URLSearchParams(location.search).get('id') || '').slice(0, 20); } catch (e) {}
  if (!id) return;
  inp.value = id;
  // services/firebase.js is a module, so it runs after this file: wait for its certificate store (or give up after 4 s).
  let done = false;
  const check = () => { if (!done){ done = true; form.requestSubmit(); } };
  if (window.ltCertStore) check();
  else { document.addEventListener('lt:certstore', check, { once: true }); setTimeout(check, 4000); }
})();
