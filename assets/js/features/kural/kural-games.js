/* Learn Tamil — Thirukkural: 🎮 games (#/games/<id>).
   complete · match · arrange · story · listen · daily. Questions are drawn from the Kurals the child
   has learned, bookmarked or opened (never from காமத்துப்பால்), so the games follow their learning.
   Right answers go through Rewards.win, wrong ones through Rewards.miss — a soft sound and "பரவாயில்லை". */
'use strict';

const KG = (() => {
  const G = TEXT.kural.gameList, A = TEXT.kural.asks;
  let game = '', focusCh = 0, n = 0, right = 0;

  /* Kurals to play with: learned + bookmarked + the chapter in focus (or the last one opened); at least 10. */
  function pool(){
    const d = kd(), set = new Set([...d.kLearned, ...d.kMarks].filter(k => k <= 1080));
    const c = focusCh || kChOf(d.kLast || 1);
    for (let k = c * 10 - 9; k <= c * 10; k++) set.add(k);
    if (set.size < 10) for (let k = 1; k <= 10; k++) set.add(k);
    return [...set];
  }
  const lessonPool = key => Object.keys(KURAL_LESSONS).map(Number).filter(k => KURAL_LESSONS[k][key]);
  const others = (list, k, count) => shuffle(list.filter(x => x !== k)).slice(0, count);
  const firstLine = k => `<span lang="ta" class="ta">${kText(k)[0]} …</span>`;
  const both = k => `<span lang="ta" class="ta">${kText(k)[0]}<br>${kText(k)[1]}</span>`;

  /* ---------- question makers (also used by the Kural screen's knowledge check) ---------- */
  function missingWordQ(k, from = pool()){
    const words = kWords(k).flat();
    const choices = words.map((w, i) => [kClean(w), i]).filter(([w]) => lettersOf(w).length >= 2);
    const [answer, at] = choices[rand(choices.length)];
    const bank = [...new Set(from.filter(x => x !== k).flatMap(x => kWords(x).flat().map(kClean)))]
      .filter(w => lettersOf(w).length >= 2 && !words.some(x => kClean(x) === w));   // never a word that is in this Kural
    const wrong = shuffle(bank).slice(0, 3);
    let i = 0;
    const lines = kWords(k).map(line => line.map(w => i++ === at ? '<span class="k-blank">＿＿＿</span>' : w).join(' '));
    return { q: A.complete, show: `<p class="k-q-kural" lang="ta">${lines.join('<br>')}</p>`,
      opts: shuffle([{ html: `<span lang="ta">${answer}</span>`, ok: true }, ...wrong.map(w => ({ html: `<span lang="ta">${w}</span>`, ok: false }))]) };
  }
  function chapterQ(k){
    const c = kChOf(k), p = kPaalOf(c);
    const near = others(Array.from({ length: p.to - p.from + 1 }, (_, i) => p.from + i), c, 2);
    return { q: TEXT.kural.whichChapter, show: `<p class="k-q-kural" lang="ta">${kText(k)[0]}<br>${kText(k)[1]}</p>`,
      opts: shuffle([c, ...near].map(x => ({ html: kPair(kCh(x)), ok: x === c }))) };
  }

  /* ---------- multiple choice ---------- */
  function mcq(box, q, onAnswer, onNext){
    box.innerHTML = `<p class="k-q">${kPair(q.q)}</p>${q.show || ''}<div class="k-opts"></div><p class="feedback" aria-live="polite"></p>
      <button class="btn primary k-nextq" type="button" hidden>${kPair(TEXT.kural.nextQ)} →</button>`;
    const opts = box.querySelector('.k-opts'), fbEl = box.querySelector('.feedback'), nx = box.querySelector('.k-nextq');
    box.kq = q;   // the question on screen (the smoke test reads it)
    let first = true;
    q.opts.forEach(o => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'k-opt'; b.innerHTML = o.html;
      b.addEventListener('click', () => {
        if (b.disabled || !nx.hidden) return;
        if (o.ok){
          b.classList.add('ok'); fb(fbEl, TEXT.praise[0][0], 'ok');
          Rewards.win(b, { points: first ? 10 : 5 });
          if (first) kQuizResult(true); onAnswer && onAnswer(first);
          opts.querySelectorAll('.k-opt').forEach(x => x.disabled = true);
          nx.hidden = false; nx.focus();
        } else {
          b.classList.add('no'); b.disabled = true; fb(fbEl, TEXT.tryAgain[0], 'bad');
          if (first){ kQuizResult(false); first = false; }
          Rewards.miss();
        }
      });
      opts.appendChild(b);
    });
    nx.addEventListener('click', onNext);
  }

  /* ---------- game screens ---------- */
  function render(view, id, arg){
    game = G[id] ? id : ''; focusCh = parseInt(arg, 10) || 0;
    if (game === 'daily'){ kGo('daily'); return; }
    if (!game){
      view.innerHTML = kCrumbs(`🎮 ${TEXT.kural.games[1]}`) + `<h3>🎮 ${kPair(TEXT.kural.games)}</h3>
        <div class="k-games">${Object.entries(G).map(([g, [ic, ta, en]]) =>
          `<a class="gcard" href="#/games/${g}"><span class="gi" aria-hidden="true">${ic}</span><b class="ta" lang="ta">${ta}</b><small>${en}</small></a>`).join('')}</div>`;
      return;
    }
    const [ic, ta, en] = G[game];
    n = 0; right = 0;
    view.innerHTML = kCrumbs(`<a href="#/games">🎮 ${TEXT.kural.games[1]}</a>`, en) +
      `<div class="k-card k-game"><h3>${ic} ${kPair([ta, en])} <small class="k-count" id="kgCount"></small></h3><div id="kgBox"></div></div>`;
    round();
  }
  const count = () => { const c = $('#kgCount'); if (c) c.textContent = `✓ ${right} / ${n}`; };
  const done = ok => { n++; if (ok) right++; count(); };

  function round(){
    const box = $('#kgBox'); if (!box) return;
    count();
    const P = pool();
    if (game === 'complete'){ const k = P[rand(P.length)]; mcq(box, missingWordQ(k, P), done, round); }
    else if (game === 'match'){
      const L = lessonPool('en'), k = L[rand(L.length)], M = KURAL_LESSONS[k];
      mcq(box, { q: A.match, show: `<p class="k-q-mean"><span lang="ta">${M.ta}</span><small>${M.en}</small></p>`,
        opts: shuffle([k, ...others(L, k, 2)].map(x => ({ html: both(x), ok: x === k }))) }, done, round);
    }
    else if (game === 'story'){
      const L = lessonPool('scene'), k = L[rand(L.length)];
      mcq(box, { q: A.story, show: '<div class="k-scene k-scene-small" id="kgScene"></div>',
        opts: shuffle([k, ...others(L, k, 2)].map(x => ({ html: firstLine(x), ok: x === k }))) }, done, () => { KScene.stop(); round(); });
      KScene.play($('#kgScene'), KURAL_LESSONS[k].scene, { captions: false, narrate: false });
    }
    else if (game === 'listen'){
      const k = P[rand(P.length)];
      mcq(box, { q: A.listen, show: `<p><button class="btn" type="button" id="kgHear">🔊 ${kPair(TEXT.kural.hearAgain)}</button></p>`,
        opts: shuffle([k, ...others(P, k, 2)].map(x => ({ html: firstLine(x), ok: x === k }))) }, done, () => { kStop(); round(); });
      const hear = () => kSay(kText(k)[0] + ' ' + kText(k)[1], false);
      $('#kgHear').addEventListener('click', hear); hear();
    }
    else if (game === 'arrange') arrange(box, P[rand(P.length)]);
  }

  /* Arrange: tap the shuffled words in order to rebuild the couplet. */
  function arrange(box, k){
    const words = kWords(k), flat = words.flat(), split = words[0].length;
    let at = 0, first = true;
    box.innerHTML = `<p class="k-q">${kPair(A.arrange)}</p>
      <div class="k-built" lang="ta"><p class="k-built-l"></p><p class="k-built-l"></p></div>
      <div class="k-opts k-chips-row">${shuffle(flat.map((w, i) => [w, i])).map(([w, i]) => `<button class="k-opt k-wchip" type="button" data-i="${i}" lang="ta">${w}</button>`).join('')}</div>
      <p class="feedback" aria-live="polite"></p><button class="btn primary k-nextq" type="button" hidden>${kPair(TEXT.kural.nextQ)} →</button>`;
    const lines = box.querySelectorAll('.k-built-l'), fbEl = box.querySelector('.feedback'), nx = box.querySelector('.k-nextq');
    box.querySelectorAll('.k-wchip').forEach(b => b.addEventListener('click', () => {
      if (b.disabled) return;
      if (b.textContent === flat[at]){              // the same word twice in a couplet is fine: any copy counts
        b.disabled = true; b.classList.add('ok');
        lines[at < split ? 0 : 1].textContent += (lines[at < split ? 0 : 1].textContent ? ' ' : '') + flat[at];
        at++; fb(fbEl, '');
        if (at === flat.length){
          fb(fbEl, TEXT.praise[2][0], 'ok'); Rewards.win(box.querySelector('.k-built'), { big: true });
          kQuizResult(first); done(first); nx.hidden = false; nx.focus();
        }
      } else {
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        fb(fbEl, TEXT.tryAgain[0], 'bad'); Rewards.miss(); first = false;
      }
    }));
    nx.addEventListener('click', round);
  }

  return { render, mcq, missingWordQ, chapterQ, pool };
})();
