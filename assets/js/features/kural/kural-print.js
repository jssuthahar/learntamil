/* Learn Tamil — Thirukkural: 🖨️ printable worksheets (#/print, #/print/<chapter>).
   Made in the browser for any of the 133 chapters, so there is nothing to download first:
   the 10 Kurals with meaning, copywork (read · trace · write) and a missing-word sheet with an answer key.
   "Print" prints only the sheet (see .k-sheet in assets/css/84-kural.css); browsers can also save it as PDF.
   The missing words are chosen by a fixed seed per chapter, so a sheet prints the same every time. */
'use strict';

const KP = (() => {
  const P = TEXT.kural.print;
  let sheet = 'couplets';

  /* A small seeded random number generator: same chapter → same worksheet. */
  const seeded = seed => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

  function render(view, c){
    c = c >= 1 && c <= 133 ? c : kChOf(kd().kLast || 1);
    view.innerHTML = kCrumbs(`🖨️ ${P.title[1]}`) + `
      <h3>🖨️ ${kPair(P.title)}</h3><p>${kPair(P.intro)}</p>
      <div class="k-card k-print-form">
        <label class="k-field"><span>${kPair(P.chapter)}</span>
          <select id="kpCh">${KU.book.ch.map(([ta, en], i) => `<option value="${i + 1}" ${i + 1 === c ? 'selected' : ''}>${i + 1}. ${ta} — ${en}</option>`).join('')}</select></label>
        <div class="k-sheet-pick" role="group" aria-label="Sheet">${Object.entries(P.sheets).map(([id, label]) =>
          `<button class="btn ${id === sheet ? 'primary' : ''}" type="button" data-sheet="${id}" aria-pressed="${id === sheet}">${kPair(label)}</button>`).join('')}</div>
        <button class="btn primary k-print-go" type="button" id="kpGo">🖨️ ${kPair(P.go)}</button>
      </div>
      <div class="k-sheet" id="kpSheet">${build(c)}</div>`;
    $('#kpCh').addEventListener('change', e => { history.replaceState(null, '', '#/print/' + e.target.value); render(view, +e.target.value); });
    view.querySelectorAll('[data-sheet]').forEach(b => b.addEventListener('click', () => { sheet = b.dataset.sheet; render(view, c); }));
    $('#kpGo').addEventListener('click', () => {
      document.body.classList.add('k-printing');
      const done = () => { document.body.classList.remove('k-printing'); removeEventListener('afterprint', done); };
      addEventListener('afterprint', done); window.print(); setTimeout(done, 1500);
    });
  }

  const head = c => { const [ta, en] = kCh(c);
    return `<header class="ks-head"><div><b class="ta" lang="ta">${KT.home[0]} · ${KT.chapter[0]} ${c}: ${ta}</b><small>Thirukkural chapter ${c}: ${en} · ${KT.kurals[1]} ${c * 10 - 9}–${c * 10}</small></div>
      <div class="ks-lines"><span>${P.name[0]} · ${P.name[1]}: ________________</span><span>${P.date[0]} · ${P.date[1]}: __________</span></div></header>`; };
  const foot = () => '<footer class="ks-foot">learntamil.msdevbuild.com · Learn Tamil · தமிழ் கற்போம்</footer>';
  const nums = c => Array.from({ length: 10 }, (_, i) => c * 10 - 9 + i);

  function build(c){
    if (sheet === 'copy') return head(c) + `<p class="ks-how">${kPair(P.howCopy)}</p>` +
      nums(c).map(n => `<div class="ks-copy"><b class="ks-n">${n}</b><div>${kText(n).slice(0, 2).map(l =>
        `<p class="ks-model" lang="ta">${l}</p><p class="ks-trace" lang="ta">${l}</p><p class="ks-write"></p>`).join('')}</div></div>`).join('') + foot();
    if (sheet === 'missing'){
      const rnd = seeded(c * 7919), answers = [];
      const rows = nums(c).map(n => {
        const words = kWords(n).flat(), ok = words.map((w, i) => [i, kClean(w)]).filter(([, w]) => lettersOf(w).length >= 2);
        const [at, word] = ok[Math.floor(rnd() * ok.length)]; answers.push([n, word]);
        let i = 0; const lines = kWords(n).map(line => line.map(w => i++ === at ? '<span class="ks-gap">____________</span>' : w).join(' '));
        return `<div class="ks-item"><b class="ks-n">${n}</b><p lang="ta">${lines.join('<br>')}</p></div>`;
      });
      const box = answers.map(a => a[1]).sort(() => rnd() - 0.5);
      return head(c) + `<p class="ks-how">${kPair(TEXT.kural.missing)}</p><div class="ks-box"><b>${kPair(P.words)}</b><p lang="ta">${box.join(' · ')}</p></div>` +
        rows.join('') + foot() +
        `<section class="ks-key"><h4>${kPair(P.answers)} — ${KT.chapter[1]} ${c}</h4><ol>${answers.map(([n, w]) => `<li value="${n}"><span lang="ta">${w}</span></li>`).join('')}</ol></section>`;
    }
    return head(c) + nums(c).map(n => { const [l1, l2, pope] = kText(n), L = kLesson(n);
      return `<div class="ks-item"><b class="ks-n">${n}</b><div><p class="ks-kural" lang="ta">${l1}<br>${l2}</p>
        ${L ? `<p class="ks-mean" lang="ta">${L.ta}</p><p class="ks-mean">${L.en}</p>` : `<p class="ks-mean"><i>${pope}</i> — G. U. Pope</p>`}</div></div>`; }).join('') + foot();
  }
  return { render };
})();
