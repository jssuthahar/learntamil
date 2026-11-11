/* Learn Tamil — a gentle, heartfelt "support this free project" note for parents.
   When it appears (never on a first visit, never in the middle of a celebration):
     • only from the 2nd day someone uses the site, after ~40 s on a page;
     • "Maybe later" or closing  → rests for 7 days;
     • "Buy me a coffee"         → rests for 60 days (thank you!);
     • "I've already supported"  → rests for 120 days.
   Everything is remembered only in this browser (localStorage "lt-support"). */
(function () {
  'use strict';
  if (window.LT_APP) return;   // no donation prompts inside the Google Play app (Play payments policy)
  const KEY = 'lt-support', DAY = 864e5;
  const COFFEE = 'https://buymeacoffee.com/jssuthahar';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };

  // count the different days this browser has used the site
  const d = load(), today = new Date().toISOString().slice(0, 10);
  if (d.last !== today){ d.days = (d.days || 0) + 1; d.last = today; save(d); }
  if ((d.days || 0) < 2 || Date.now() < (d.next || 0)) return;

  /* A personal line about the child's progress, when the rewards data is on this page. */
  function progressLine(){
    try {
      const p = typeof Progress !== 'undefined' && Progress.d; if (!p) return '';
      const bits = [];
      if (p.letters && p.letters.length) bits.push(`<b>${p.letters.length}</b> Tamil letter${p.letters.length > 1 ? 's' : ''}`);
      if (p.stories && p.stories.length) bits.push(`<b>${p.stories.length}</b> stor${p.stories.length > 1 ? 'ies' : 'y'}`);
      if (p.badges && p.badges.length) bits.push(`<b>${p.badges.length}</b> badge${p.badges.length > 1 ? 's' : ''}`);
      if (!bits.length) return '';
      return `<p class="sp-progress">🌱 Your little one has already discovered ${bits.join(', ').replace(/, ([^,]*)$/, ' and $1')} here. That makes my day.</p>`;
    } catch (e) { return ''; }
  }

  function busy(){   // don't interrupt another pop-up, the cookie notice or a game in progress
    return document.querySelector('.badge-pop, .consent, .cheer, .kili-panel:not([hidden]), .cert-run') ||
      (window.ltConsent && !window.ltConsent.choice()) || document.hidden;
  }

  function show(){
    const el = document.createElement('div');
    el.className = 'support-pop'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'spTitle');
    el.innerHTML = `
      <div class="sp-card">
        <button type="button" class="sp-x" data-a="later" aria-label="Close">×</button>
        <div class="sp-art" aria-hidden="true"><span class="sp-bird">🦜</span><span class="sp-heart">💛</span><span class="sp-cup">☕</span></div>
        <h2 id="spTitle"><span lang="ta">வணக்கம்!</span> A little note from me</h2>
        <p>I’m Suthahar. I made Learn Tamil on my own, in my own time, so that every child, wherever they live, can hear, read and love our beautiful language. It’s <b>completely free</b>: no ads in the lessons or games, no subscriptions, no sign-up.</p>
        ${progressLine()}
        <p>If this little app has helped your child say their first Tamil words, or brought a smile at bedtime, would you buy me a coffee? Every cup keeps the website running and helps me add new letters, stories and games for your kids. ☕</p>
        <p class="sp-ta" lang="ta">உங்கள் அன்புக்கும் ஆதரவுக்கும் நன்றி! 🙏</p>
        <div class="sp-btns">
          <a class="coffee-btn sp-coffee" data-a="coffee" href="${COFFEE}" target="_blank" rel="noopener">☕ Buy me a coffee</a>
          <button type="button" class="btn" data-a="later">Maybe later</button>
        </div>
        <button type="button" class="sp-done" data-a="done">I’ve already supported 💛</button>
      </div>`;
    const prevFocus = document.activeElement;
    const close = (action) => {
      const rest = { coffee: 60, done: 120 }[action] || 7;
      const s = load(); s.next = Date.now() + rest * DAY; s.shown = (s.shown || 0) + 1; save(s);
      if (window.ltLog) window.ltLog('support_prompt', { action });
      el.classList.add('out'); setTimeout(() => el.remove(), 300);
      document.removeEventListener('keydown', onKey);
      if (action === 'done' || action === 'coffee') thanks();
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
    };
    const onKey = e => { if (e.key === 'Escape') close('later'); };
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-a]');
      if (a) { close(a.dataset.a); return; }          // the coffee link still opens (no preventDefault)
      if (e.target === el) close('later');             // tap outside the card
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(el);
    if (window.ltLog) window.ltLog('support_prompt', { action: 'shown' });
    setTimeout(() => { const c = el.querySelector('.sp-coffee'); c && c.focus({ preventScroll: true }); }, 350);
  }

  function thanks(){
    const t = document.createElement('div');
    t.className = 'sp-thanks'; t.setAttribute('role', 'status');
    t.innerHTML = '<span lang="ta">மிக்க நன்றி!</span> Thank you from my heart 💛';
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3000);
  }

  // wait ~40 s, then for a quiet moment (checks every 10 s for up to 3 minutes)
  let tries = 0;
  const attempt = () => { if (busy()) { if (++tries < 18) setTimeout(attempt, 10000); return; } show(); };
  setTimeout(attempt, 40000);
})();
