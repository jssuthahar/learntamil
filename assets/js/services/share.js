/* Share buttons — WhatsApp, LinkedIn, Facebook, X, Telegram, email, copy link and the phone's own share sheet.
   Privacy: these are plain links. No third-party script or button loads; nothing is sent anywhere until someone taps,
   and then only the page link and its title go to the site they chose. Never pass a child's name or progress here.
   This is a grown-up surface, so the labels are network names in English (like the parent screens).

   Pages:  <div data-share-row></div> is filled with buttons for this page (canonical URL, og:title).
   Code:   LTShare.open({ url, title, text }) opens a small share sheet (used for "Share this Kural"). */
(function(){
  const enc = encodeURIComponent;
  const svg = inner => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">${inner}</svg>`;
  const NETS = [
    { id: 'whatsapp', name: 'WhatsApp', href: (u, t) => `https://wa.me/?text=${enc(t + '\n' + u)}`,
      ic: svg('<path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M9 7.8c.3-.4.7-.4 1-.1l.9 1.9c.1.3 0 .6-.2.8l-.5.5c.6 1.3 1.6 2.3 2.9 2.9l.5-.5c.2-.2.5-.3.8-.2l1.9.9c.3.2.3.7-.1 1-1 .9-2.2 1-3.6.3a8.6 8.6 0 0 1-3.9-3.9c-.7-1.4-.6-2.6.3-3.6z" fill="currentColor"/>') },
    { id: 'linkedin', name: 'LinkedIn', href: u => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(u)}`,
      ic: svg('<rect x="4.5" y="9.5" width="3" height="10" fill="currentColor"/><circle cx="6" cy="5.8" r="1.8" fill="currentColor"/><path d="M10.5 9.5h2.9v1.4c.5-.9 1.6-1.7 3.2-1.7 2.6 0 3.4 1.6 3.4 4.1v6.2h-3v-5.5c0-1.3-.3-2.2-1.6-2.2s-1.9 1-1.9 2.2v5.5h-3z" fill="currentColor"/>') },
    { id: 'facebook', name: 'Facebook', href: u => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}`,
      ic: svg('<path d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21z" fill="currentColor"/>') },
    { id: 'x', name: 'X (Twitter)', href: (u, t) => `https://twitter.com/intent/tweet?text=${enc(t)}&url=${enc(u)}`,
      ic: svg('<path d="M4 4h4.3l11.7 16h-4.3z" fill="currentColor"/><path d="M18.6 4 13.3 10M10.6 13.4 5.4 20" stroke="currentColor" stroke-width="2"/>') },
    { id: 'telegram', name: 'Telegram', href: (u, t) => `https://t.me/share/url?url=${enc(u)}&text=${enc(t)}`,
      ic: svg('<path d="M20.6 4.2 2.9 11c-.9.4-.9 1.4 0 1.7l4.4 1.4 1.7 5.3c.2.7 1 .9 1.5.4l2.5-2.3 4.6 3.4c.7.5 1.6.1 1.8-.7l3-14.6c.2-1-.8-1.8-1.8-1.4zM9.6 14l8-6.6-6.3 7.6-.3 3z" fill="currentColor"/>') },
    { id: 'email', name: 'Email', href: (u, t) => `mailto:?subject=${enc(t.split('\n')[0])}&body=${enc(t + '\n\n' + u)}`,
      ic: svg('<rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="m3.8 6.5 8.2 6.5 8.2-6.5" fill="none" stroke="currentColor" stroke-width="1.9"/>') }
  ];
  const IC_COPY = svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>');
  const IC_MORE = svg('<circle cx="18" cy="5.5" r="2.5" fill="currentColor"/><circle cx="6" cy="12" r="2.5" fill="currentColor"/><circle cx="18" cy="18.5" r="2.5" fill="currentColor"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" stroke="currentColor" stroke-width="1.8"/>');
  const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  function pageInfo(){
    const canon = document.querySelector('link[rel=canonical]');
    const og = document.querySelector('meta[property="og:title"]');
    return { url: canon ? canon.href : location.href.split('#')[0], title: (og && og.content) || document.title };
  }
  function buttons({ url, title, text }){
    const t = text || title;
    return NETS.map(n => `<a class="share-btn share-${n.id}" href="${attr(n.href(url, t))}" target="_blank" rel="noopener" data-net="${n.id}" aria-label="Share on ${n.name}">${n.ic}<span>${n.name}</span></a>`).join('')
      + `<button class="share-btn share-copy" type="button" data-share-copy="${attr(url)}">${IC_COPY}<span>Copy link</span></button>`
      + (navigator.share ? `<button class="share-btn share-more" type="button" data-share-native>${IC_MORE}<span>More…</span></button>` : '');
  }
  async function copy(url, btn){
    let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; } catch (e) {
      try { const ta = document.createElement('textarea'); ta.value = url; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e2) {}
    }
    const label = btn && btn.querySelector('span');
    if (label){ const old = label.textContent; label.textContent = ok ? '✓ Copied' : url; setTimeout(() => { label.textContent = old; }, 2200); }
  }
  /* One click handler for every share row and the sheet. */
  let current = null;
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-share-copy]');
    if (c){ e.preventDefault(); copy(c.dataset.shareCopy, c); return; }
    const m = e.target.closest('[data-share-native]');
    if (m){ e.preventDefault(); const box = m.closest('[data-share-for]'); const info = (box && box.shareInfo) || pageInfo();
      navigator.share({ title: info.title, text: info.text || info.title, url: info.url }).catch(() => {}); }
  });

  function fill(){
    const info = pageInfo();
    document.querySelectorAll('[data-share-row]').forEach(el => {
      el.shareInfo = info; el.setAttribute('data-share-for', '');
      el.innerHTML = `<b class="share-label">${attr(el.dataset.shareRow || 'Share')}</b><div class="share-list">${buttons(info)}</div>`;
    });
  }
  function open(info){
    info = Object.assign(pageInfo(), info || {});
    if (current) current.remove();
    const d = document.createElement('dialog');
    d.className = 'share-sheet'; d.setAttribute('aria-label', 'Share');
    d.innerHTML = `<div class="share-head"><b>Share</b><button class="share-close" type="button" aria-label="Close">✕</button></div>
      ${info.text ? `<p class="share-preview">${attr(info.text).replace(/\n/g, '<br>')}</p>` : ''}
      <div class="share-list" data-share-for>${buttons(info)}</div>`;
    d.querySelector('[data-share-for]').shareInfo = info;
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('.share-close')) d.close(); });
    d.addEventListener('close', () => { d.remove(); if (current === d) current = null; });
    document.body.appendChild(d); current = d;
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    return d;
  }
  window.LTShare = { open, fill, info: pageInfo };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();
