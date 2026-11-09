/* Learn Tamil — "Ask Kili" FAQ chat.
   Answers come from js/faq-data.js (generated from the site's FAQs by tools/build-pages.mjs).
   Matching happens in the browser: no AI service, no network, nothing is sent anywhere. */
(function () {
  'use strict';
  const KB = window.LT_FAQ || [];
  if (!KB.length) return;
  const ISSUES = 'https://github.com/jssuthahar/learntamil/issues';
  const isTa = document.documentElement.lang === 'ta' && document.body.classList.contains('doc-page');

  /* ---------- text matching ---------- */
  const STOP = new Set('a an the is are am was be do does did how what which who whom why when where can could i me my we you your it its to in on of for and or with there this that these those please tell about any get have has will would should'.split(' '));
  const SYN = {
    voice: 'sound', audio: 'sound', say: 'sound', said: 'sound', pronounce: 'sound', pronunciation: 'sound', hear: 'sound', listen: 'sound', speak: 'sound', speaker: 'sound', mute: 'sound', silent: 'sound', tts: 'sound',
    uyir: 'vowel', vowel: 'vowel', 'உயிர்': 'vowel', mei: 'consonant', consonant: 'consonant', 'மெய்': 'consonant',
    alphabet: 'letter', letter: 'letter', character: 'letter', ezhuthu: 'letter', ezhuthukal: 'letter', 'எழுத்து': 'letter', 'எழுத்துகள்': 'letter', 'எழுத்துக்கள்': 'letter',
    cert: 'certificate', pdf: 'certificate', 'சான்றிதழ்': 'certificate', exam: 'test', quiz: 'test',
    coin: 'token', reward: 'token', badge: 'token', star: 'token', point: 'token',
    install: 'install', download: 'install', pwa: 'install', homescreen: 'install',
    internet: 'offline', wifi: 'offline', network: 'offline',
    privacy: 'privacy', data: 'privacy', safe: 'privacy', tracking: 'privacy', cookie: 'privacy', personal: 'privacy',
    bug: 'report', mistake: 'report', error: 'report', issue: 'report', feedback: 'report', problem: 'report',
    aytham: 'aaytham', ayutham: 'aaytham', aaytham: 'aaytham', 'ஆய்தம்': 'aaytham', 'ஃ': 'aaytham',
    donate: 'support', coffee: 'support', sponsor: 'support', contribute: 'support',
    story: 'story', kathai: 'story', 'கதை': 'story', 'கதைகள்': 'story',
    word: 'word', 'சொல்': 'word', 'சொற்கள்': 'word', count: 'many', total: 'many', number: 'number', numeral: 'number', digit: 'number', 'எத்தனை': 'many'
  };
  function tokens(s){
    return String(s).normalize('NFC').toLowerCase()
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
      .split(/\s+/).filter(Boolean)
      .map(t => (/^[a-z]+$/.test(t) && t.length > 3 && t.endsWith('s')) ? t.slice(0, -1) : t)
      .filter(t => !STOP.has(t))
      .map(t => SYN[t] || t);
  }
  const GENERIC = new Set(['letter', 'tamil', 'many', 'word']);   // common words count for less
  const same = (a, b) => a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)));   // Tamil endings, plurals
  const INDEX = KB.map(e => ({ e, q: [...new Set(tokens(e.q))], t: [...new Set(tokens(e.tags))], a: [...new Set(tokens(e.a))].slice(0, 40) }));
  function search(text){
    const qt = [...new Set(tokens(text))];
    if (!qt.length) return [];
    const qTa = /[\u0B80-\u0BFF]/.test(text);
    return INDEX.map(x => {
      let s = 0;
      for (const w of qt){
        if (x.q.some(t => same(t, w))) s += GENERIC.has(w) ? 0.8 : 2;
        else if (x.t.some(t => same(t, w))) s += 1.5;
        else if (x.a.some(t => same(t, w))) s += 0.4;
      }
      if (x.e.help) s += 0.2;
      s -= 0.01 * x.q.length;   // prefer the shorter, more direct question
      if ((x.e.lang === 'ta') === qTa) s += 0.3;   // answer in the language of the question
      return { e: x.e, s };
    }).filter(r => r.s >= 1.8).sort((a, b) => b.s - a.s);
  }

  /* ---------- rendering ---------- */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rich = s => esc(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) =>
    `<a href="${u}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`);
  const here = location.pathname.split('/').pop() || 'index.html';
  const STARTERS = isTa
    ? ['தமிழில் எத்தனை எழுத்துகள் உள்ளன?', 'உயிர் எழுத்துகள் யாவை?', 'மெய் எழுத்துகள் யாவை?', 'How do I get a certificate?']
    : ['How many letters are there in the Tamil alphabet?', 'The sound is wrong or there is no sound', 'How do I get a certificate?',
       'How do I install Learn Tamil as an app?', 'Is my child’s data safe?', 'தமிழில் எத்தனை எழுத்துகள் உள்ளன?'];

  const fab = document.createElement('button');
  fab.className = 'kili-fab'; fab.type = 'button';
  fab.setAttribute('aria-haspopup', 'dialog'); fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '<span class="kf-bird" aria-hidden="true">🦜</span><span class="kf-label">Ask Kili</span>';
  fab.setAttribute('aria-label', 'Ask Kili — questions and help');

  const panel = document.createElement('section');
  panel.className = 'kili-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'kiliTitle');
  panel.innerHTML = `
    <header class="kp-head">
      <span class="kp-av" aria-hidden="true">🦜</span>
      <div class="kp-title"><b id="kiliTitle">Ask Kili <span lang="ta">· கிளியிடம் கேள்</span></b><small><span class="kp-dot" aria-hidden="true"></span> Answers about Tamil letters and this site</small></div>
      <button class="kp-x" type="button" aria-label="Close chat">✕</button>
    </header>
    <div class="kp-log" role="log" aria-live="polite"></div>
    <div class="kp-chips" aria-label="Suggested questions"></div>
    <form class="kp-form" autocomplete="off">
      <input class="kp-in" type="text" maxlength="200" placeholder="Type a question · கேள்வி கேளுங்கள்…" aria-label="Your question">
      <button class="kp-send" type="submit" aria-label="Send">➤</button>
    </form>
    <p class="kp-foot">Kili answers from this site’s FAQ. Not sure? <a href="${ISSUES}" target="_blank" rel="noopener">Ask on GitHub</a>.</p>`;
  document.body.append(fab, panel);
  const log = panel.querySelector('.kp-log'), chips = panel.querySelector('.kp-chips'), input = panel.querySelector('.kp-in');

  function bubble(html, who){
    const m = document.createElement('div'); m.className = 'kp-msg ' + who;
    m.innerHTML = who === 'bot' ? `<span class="kp-mav" aria-hidden="true">🦜</span><div class="kp-b">${html}</div>` : `<div class="kp-b">${html}</div>`;
    log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  }
  function setChips(list){
    chips.innerHTML = '';
    list.forEach(q => { const b = document.createElement('button'); b.type = 'button'; b.className = 'kp-chip'; b.textContent = q;
      if (/[஀-௿]/.test(q)) b.lang = 'ta'; b.onclick = () => ask(q); chips.appendChild(b); });
  }
  function answerHtml(e){
    const link = e.link && e.link !== here && !(here === 'index.html' && e.link.startsWith('./#'))
      ? `<a class="kp-more" href="${e.link}">${e.link.startsWith('./#') ? 'Open in the app →' : 'Read more →'}</a>`
      : (e.link && e.link.startsWith('./#') && here === 'index.html' ? `<a class="kp-more" href="${e.link.slice(2)}">Show me →</a>` : '');
    return `<b class="kp-q"${e.lang === 'ta' ? ' lang="ta"' : ''}>${esc(e.q)}</b><p${e.lang === 'ta' ? ' lang="ta"' : ''}>${rich(e.a)}</p>${link}`;
  }
  let typingT = 0;
  function ask(text){
    text = String(text).trim(); if (!text) return;
    bubble(esc(text), 'me'); input.value = '';
    const typing = bubble('<span class="kp-typing"><i></i><i></i><i></i></span>', 'bot');
    clearTimeout(typingT);
    typingT = setTimeout(() => {
      typing.remove();
      const res = search(text);
      if (res.length){
        bubble(answerHtml(res[0].e), 'bot');
        const more = res.slice(1, 4).map(r => r.e.q).filter(q => q !== res[0].e.q);
        setChips(more.length ? more : STARTERS.slice(0, 3));
      } else {
        bubble(`I don’t know that one yet 🙈 <span lang="ta">மன்னிக்கவும்!</span> Try one of these questions, or <a href="${ISSUES}" target="_blank" rel="noopener">ask on GitHub Issues</a>.`, 'bot');
        setChips(STARTERS.slice(0, 4));
      }
    }, 450);
  }
  function open(){
    panel.hidden = false; fab.setAttribute('aria-expanded', 'true'); fab.classList.add('on');
    if (!log.children.length){
      bubble(`வணக்கம்! 👋 I’m <b>Kili</b>. Ask me about Tamil letters, sounds, games, certificates or how to use this site.`, 'bot');
      setChips(STARTERS);
    }
    requestAnimationFrame(() => panel.classList.add('show'));
    if (matchMedia('(min-width: 761px)').matches) input.focus();
  }
  function close(){
    panel.classList.remove('show'); fab.setAttribute('aria-expanded', 'false'); fab.classList.remove('on');
    setTimeout(() => { panel.hidden = true; }, 200); fab.focus();
  }
  fab.addEventListener('click', () => panel.hidden ? open() : close());
  panel.querySelector('.kp-x').addEventListener('click', close);
  panel.querySelector('.kp-form').addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  // "Show me →" links inside the app switch section; close the chat on phones so the content is visible.
  log.addEventListener('click', e => { if (e.target.closest('a.kp-more') && matchMedia('(max-width: 760px)').matches) close(); });

  window.LTChat = { open, ask, search };
})();
