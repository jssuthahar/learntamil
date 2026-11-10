/* Learn Tamil — family: "Who is learning?" child switcher and shared dialog helpers.
   Profiles themselves live in core/profiles.js. */
'use strict';

/* ---------- a reusable dialog ---------- */
function famDialog(id, html){
  let d = document.getElementById(id);
  if (!d){
    d = document.createElement('dialog'); d.id = id; d.className = 'rewards-dlg fam-dlg';
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
  }
  d.innerHTML = html;
  const x = d.querySelector('.rw-x'); if (x) x.onclick = () => d.close();
  if (typeof d.showModal === 'function'){ if (!d.open) d.showModal(); } else d.setAttribute('open', '');
  return d;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const childName = (p, i) => p.name || `Child ${i + 1}`;

/* =====================================================================
   👧👦 WHO IS LEARNING? (profile switcher, from the Today card)
   ===================================================================== */
function paintProfile(){
  const p = Profiles.current(); const ic = document.getElementById('profIc'); if (ic) ic.textContent = p.ic;
  const b = document.getElementById('profileBtn'); if (b) b.setAttribute('aria-label', `Learning now: ${p.name || 'Child 1'}. Tap to switch child`);
}
function openProfiles(){
  const list = Profiles.list(), cur = Profiles.current().id;
  const d = famDialog('profDlg', `
    <div class="rw-head"><h2>👧👦 <span lang="ta">${TEXT.whoIsLearning[0]}</span> · ${TEXT.whoIsLearning[1]}</h2><button class="rw-x" type="button" aria-label="Close">✕</button></div>
    <div class="prof-list">${list.map((p, i) => `<button class="prof-card${p.id === cur ? ' on' : ''}" type="button" data-id="${p.id}" aria-pressed="${p.id === cur}">
      <span class="prof-ic" aria-hidden="true">${p.ic}</span><b>${esc(childName(p, i))}</b><small>${p.id === cur ? 'Learning now' : 'Tap to switch'}</small></button>`).join('')}</div>
    <p class="rw-note">Each child has their own tokens, badges, stickers and certificates.
      <button class="btn small" type="button" data-open="parents">➕ Add or change children (Parent dashboard)</button></p>`);
  d.querySelectorAll('.prof-card').forEach(b => b.onclick = () => { if (b.dataset.id !== cur) Profiles.switchTo(b.dataset.id); else d.close(); });
  d.querySelector('[data-open]').onclick = () => { d.close(); openParents(); };
}
$('#profileBtn').addEventListener('click', openProfiles);
