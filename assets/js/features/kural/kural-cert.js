/* Learn Tamil — Thirukkural: 🎓 level exams and chapter certificates.
     #/certificate            levels (data/kural-lessons.js → KURAL_LEVELS) and the chapter list
     #/certificate/level/3    exam for level 3 (opens after level 2 is passed)
     #/certificate/40         quick test for chapter 40 (chapters 1–108; காமத்துப்பால் has no tests)
   Questions are made from the verified text only: the missing word, the next line, and which chapter.
   Passing (8 of 10 on the first try; 12 of 15 for the last level) earns a certificate with the child's name,
   drawn on a <canvas> and saved as PDF (CERT.jpegToPdf from features/certificate) or PNG.
   Results are kept per child: Progress.d.kLevels and Progress.d.kCerts; the name in lt-cert-name. */
'use strict';

const KC = (() => {
  const C = TEXT.kural.cert, LAST_CH = 108;
  const attr = v => String(v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const levelOpen = L => L.n === 1 || !!kd().kLevels[L.n - 1];

  function render(view, a, b){
    const [what, n] = kSub().slice(1);   // #/certificate/<what>/<n>
    if (what === 'level'){ const L = KURAL_LEVELS[+n - 1]; if (L && levelOpen(L)) return exam(view, levelExam(L)); }
    const c = parseInt(what, 10);
    if (c >= 1 && c <= LAST_CH) return exam(view, chapterExam(c));
    home(view);
  }

  /* ---------- the certificate home: levels first (big, kid-sized), then chapters ---------- */
  function home(view){
    const d = kd();
    const next = KURAL_LEVELS.find(L => !d.kLevels[L.n]);
    view.innerHTML = kCrumbs(`🎓 ${C.title[1]}`) + `
      <h3>🎓 ${kPair(C.levels)}</h3><p>${kPair(C.levelsIntro)}</p>
      <div class="kc-levels">${KURAL_LEVELS.map(L => {
        const got = d.kLevels[L.n], open = levelOpen(L), cur = next && next.n === L.n;
        return `<a class="kc-level ${got ? 'done' : ''} ${cur ? 'next' : ''} ${open ? '' : 'locked'}" ${open ? `href="#/certificate/level/${L.n}"` : 'aria-disabled="true"'} title="${open ? '' : C.locked[1]}">
          <span class="kc-ic" aria-hidden="true">${open ? L.ic : '🔒'}</span>
          <b>${C.level[1]} ${L.n}</b><span class="ta" lang="ta">${L.ta}</span><small>${L.en}</small>
          <small class="kc-range">${KT.kurals[1]} ${L.from}–${L.to}</small>
          ${got ? `<span class="kc-got">🎓 ${got.s}/${L.total || 10}</span>` : cur ? `<span class="kc-got kc-go">▶ ${C.start[1]}</span>` : ''}
        </a>`; }).join('')}</div>
      <h3 class="kc-sub">📗 ${kPair(C.chapters)}</h3><p>${kPair(C.chaptersIntro)} <span class="muted">${C.learnedHint[1]} · 🎓 = ${C.earned[1]}</span></p>` +
      KURAL_PAALS.filter(p => !p.older).map(p => `<h4 class="k-iyal"><span lang="ta">${p.ta}</span> · ${p.en}</h4>
        <div class="k-chapters">${range(p.from, p.to).map(ch => { const got = d.kCerts[ch];
          return `<a class="k-chap ${got ? 'done' : ''}" href="#/certificate/${ch}"><b>${ch} ${got ? '🎓' : ''}</b><span class="ta" lang="ta">${kCh(ch)[0]}</span><small>✅ ${kChapterLearned(ch)}/10${got ? ` · ${got.s}/10` : ''}</small></a>`;
        }).join('')}</div>`).join('') + CertRecord.verifyHTML('kh');
    CertRecord.wireVerify(view.querySelector('[data-crv]'));
  }

  /* ---------- question makers (verified text only) ---------- */
  function nextLineQ(k, pool){
    const wrong = shuffle(pool.filter(x => x !== k)).slice(0, 2);
    return { q: C.nextLine, show: `<p class="k-q-kural" lang="ta">${kText(k)[0]}<br><span class="k-blank">＿＿＿＿＿＿</span></p>`,
      opts: shuffle([k, ...wrong].map(x => ({ html: `<span lang="ta">${kText(x)[1]}</span>`, ok: x === k }))) };
  }
  function makeQuestions(pool, total){
    const picks = shuffle(pool.slice()).slice(0, total);
    while (picks.length < total) picks.push(pool[rand(pool.length)]);
    return picks.map((k, i) => {
      const kind = i % 5;   // a steady mix: 3 missing word, 1 next line, 1 chapter in every 5
      if (kind === 3) return () => nextLineQ(k, pool);
      if (kind === 4) return () => KG.chapterQ(k);
      return () => KG.missingWordQ(k, pool);
    });
  }
  function levelExam(L){
    const pool = range(L.from, L.to);
    return { kind: 'level', id: L.n, L, total: L.total || 10, pass: L.pass || 8, qs: makeQuestions(pool, L.total || 10),
      title: `${L.ic} ${C.level[1]} ${L.n} · <span lang="ta">${L.ta}</span> <small>${L.en}</small>`,
      crumb: `${C.level[1]} ${L.n}`, study: `${KT.kurals[1]} ${L.from}–${L.to}`, studyHref: `#/ch/${kChOf(L.from)}` };
  }
  function chapterExam(c){
    const pool = range(c * 10 - 9, c * 10);
    return { kind: 'chapter', id: c, total: 10, pass: 8, qs: shuffle(pool.slice()).map(k => () => KG.missingWordQ(k, pool)),
      title: `📗 <span lang="ta">${kCh(c)[0]}</span> <small>${kCh(c)[1]}</small>`,
      crumb: `<span lang="ta">${kCh(c)[0]}</span>`, study: `${KT.chapter[1]} ${c}`, studyHref: `#/ch/${c}` };
  }

  /* ---------- the exam ---------- */
  function exam(view, X){
    let i = 0, right = 0;
    view.innerHTML = kCrumbs(`<a href="#/certificate">🎓 ${C.title[1]}</a>`, X.crumb) + `
      <div class="k-card k-game"><h3>${X.title}</h3>
      <div class="kc-progress" aria-hidden="true">${X.qs.map(() => '<i></i>').join('')}</div>
      <p class="muted">📖 ${C.study[1]}: <a href="${X.studyHref}">${X.study}</a> · ${C.score[1]}: ${X.pass}/${X.total}</p>
      <div id="kcBox"></div></div>`;
    const box = $('#kcBox'), dots = [...view.querySelectorAll('.kc-progress i')];
    const next = () => {
      if (i >= X.qs.length) return finish(view, X, right);
      dots.forEach((d, j) => d.classList.toggle('on', j <= i));
      KG.mcq(box, X.qs[i++](), first => { if (first) right++; dots[i - 1].classList.add(first ? 'ok' : 'try'); }, next);
    };
    next();
  }

  function finish(view, X, right){
    const box = $('#kcBox'), ok = right >= X.pass;
    if (!ok){
      box.innerHTML = `<p class="k-quiz-done">🌱 ${kPair(C.notYet)}</p><p>${C.score[1]}: ${right}/${X.total} (${X.pass} needed)</p>
        <p class="k-acts"><a class="btn primary" href="${X.studyHref}">📖 ${kPair(C.learnFirst)}</a><button class="btn" type="button" id="kcAgain">🔁 ${kPair(C.again)}</button></p>`;
      $('#kcAgain').addEventListener('click', () => exam(view, X.kind === 'level' ? levelExam(X.L) : chapterExam(X.id)));
      return;
    }
    const d = kd(), store = X.kind === 'level' ? d.kLevels : d.kCerts, prev = store[X.id];
    const again = Object.keys(d.kLevels || {}).length + Object.keys(d.kCerts || {}).length - (prev ? 1 : 0) > 0;
    store[X.id] = { d: todayStr(), s: Math.max(right, prev ? prev.s : 0),
      id: prev ? prev.id : (X.kind === 'level' ? 'TKL' : 'TK') + X.id + '-' + Date.now().toString(36).toUpperCase() };
    kTouchDay(); Progress.save(); if (!prev) Progress.addTokens(X.kind === 'level' ? 20 : 10);
    celebrate(X.kind === 'level' ? X.L.ic : '🎓', C.passed[0], `${C.passed[1]} ${right}/${X.total}`);
    let name = ''; try { name = Profiles.get('lt-cert-name') || ''; } catch (e) {}
    const nextL = X.kind === 'level' && KURAL_LEVELS[X.id];
    const rec = store[X.id], what = X.kind === 'level' ? `Thirukkural Level ${X.id}` : `Thirukkural chapter ${X.id}`;
    // Website: a parent's details first (cert-record.js), then the certificate. Google Play app: straight to the certificate.
    if (CertRecord.collecting() && !CertRecord.wasSent(rec.id)){
      box.innerHTML = `<p class="k-quiz-done">🎉 ${kPair(C.passed)} ${C.score[1]}: ${right}/${X.total}</p>
        <form class="cr-form" id="kcForm" novalidate><label for="kcFName">${kPair(C.name)}</label>
          <div class="cr-row"><input id="kcFName" maxlength="40" autocomplete="off" value="${attr(name)}"></div>
          <small class="crc-err" data-crc-err="name" hidden></small>
          ${CertRecord.fieldsHTML('kc')}<button class="btn primary cr-make" type="submit">🎓 ${C.title[1]}</button></form>`;
      const f = $('#kcForm'); CertRecord.wire(f); let making = false;
      f.addEventListener('submit', async e => {
        e.preventDefault(); if (making) return;
        const nm = $('#kcFName').value.replace(/\s+/g, ' ').trim().slice(0, 40);
        const r = CertRecord.read(f, nm); if (!r.ok){ if (!nm) $('#kcFName').focus(); return; }
        making = true; try { Profiles.set('lt-cert-name', nm); } catch (e2) {}
        showCert(nm);
        const st = await CertRecord.submit({ studentName: nm, certificateId: rec.id, batchId: (X.kind === 'level' ? 'kural-level-' : 'kural-chapter-') + X.id,
          courseName: `Learn Tamil · ${what}`, source: 'kural' }, r.contact);
        const ni = $('#kcName'); if (st !== 'skipped' && ni) ni.dispatchEvent(new Event('input'));   // now on record: redraw with the QR code
        if (st === 'queued') box.querySelector('.k-acts').insertAdjacentHTML('afterend', `<p class="crc-note" role="status">${TEXT.certificate.contact.notSaved}</p>`);
      });
      return;
    }
    showCert(name);
    function showCert(name){
    box.innerHTML = `<p class="k-quiz-done">🎉 ${kPair(C.passed)} ${C.score[1]}: ${right}/${X.total}</p>
      <label class="k-field"><span>${kPair(C.name)}</span><input id="kcName" type="text" maxlength="40" autocomplete="off" value="${attr(name)}"></label>
      <div class="cert-preview"><canvas id="kcCanvas" width="2339" height="1654" aria-label="${C.title[1]}"></canvas></div>
      <p class="k-acts"><button class="btn primary" type="button" id="kcPdf">⬇ ${kPair(C.pdf)}</button><button class="btn" type="button" id="kcPng">🖼 ${kPair(C.png)}</button>
        ${nextL ? `<a class="btn" href="#/certificate/level/${nextL.n}">${nextL.ic} ${C.level[1]} ${nextL.n} →</a>` : ''}
        <a class="btn" href="#/certificate">← ${kPair(C.title)}</a></p>`;
    const cv = $('#kcCanvas'), input = $('#kcName');
    const redraw = () => draw(cv, X, input.value.trim(), store[X.id]);
    input.addEventListener('input', () => { try { Profiles.set('lt-cert-name', input.value.trim()); } catch (e) {} redraw(); });
    redraw();
    const label = X.kind === 'level' ? `Level-${X.id}` : `Chapter-${X.id}`;
    const file = ext => `Thirukkural-Certificate-${label}-${(input.value.trim() || 'student').replace(/[^\p{L}\p{N}]+/gu, '-')}.${ext}`;
    $('#kcPng').addEventListener('click', async () => { await redraw(); cv.toBlob(b => save(b, file('png')), 'image/png'); });
    $('#kcPdf').addEventListener('click', async () => { await redraw();
      cv.toBlob(async b => save(CERT.jpegToPdf(new Uint8Array(await b.arrayBuffer()), cv.width, cv.height, `Thirukkural Certificate - ${label}`), file('pdf')), 'image/jpeg', 0.92); });
    CertShare.mount(box.querySelector('.k-acts'), { again, url: 'https://learntamil.msdevbuild.com/thirukkural.html', what, certId: rec.id,
      get file(){ return file('png'); }, blob: async () => { await redraw(); return new Promise(r => cv.toBlob(r, 'image/png')); } });
    }
  }

  function save(blob, name){
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }

  async function draw(cv, X, name, rec){
    try { await Promise.all(['800 90px "Noto Sans Tamil"', '600 60px "Noto Sans Tamil"'].map(f => document.fonts.load(f))); } catch (e) {}
    const g = cv.getContext('2d'), W = cv.width, H = cv.height, TA = '"Noto Sans Tamil","Latha","Tamil Sangam MN",sans-serif';
    const text = (s, y, size, color = '#3b2a12', weight = 600) => { g.font = `${weight} ${size}px ${TA}`; g.fillStyle = color; g.textAlign = 'center';
      while (g.measureText(s).width > W - 360 && size > 20){ size -= 2; g.font = `${weight} ${size}px ${TA}`; } g.fillText(s, W / 2, y); };
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#fff8e6'); bg.addColorStop(1, '#fdebc8');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#0b8a6c'; g.lineWidth = 26; g.strokeRect(60, 60, W - 120, H - 120);
    g.strokeStyle = '#c9952b'; g.lineWidth = 6; g.strokeRect(110, 110, W - 220, H - 220);
    const lvl = X.kind === 'level' ? X.L : null, from = lvl ? lvl.from : X.id * 10 - 9, to = lvl ? lvl.to : X.id * 10;
    g.font = `130px ${TA}`; g.textAlign = 'center'; g.fillText(lvl ? lvl.ic : '📜', W / 2, 300);
    text(C.heading, 430, 92, '#0b5f4b', 800);
    text(C.presented, 560, 44, '#5b4a2e', 600);
    text(name || '…………………………', 720, 120, '#1f1a12', 800);
    g.strokeStyle = '#c9952b'; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2 - 600, 760); g.lineTo(W / 2 + 600, 760); g.stroke();
    if (lvl){
      text(fmt(C.forLevel, { n: lvl.n }), 860, 50, '#5b4a2e');
      text(`${lvl.ta} · ${lvl.en}`, 965, 84, '#0b5f4b', 800);
    } else {
      text(fmt(C.forChapter, { n: X.id }), 860, 50, '#5b4a2e');
      text(`${kCh(X.id)[0]} · ${kCh(X.id)[1]}`, 965, 74, '#0b5f4b', 800);
    }
    text(fmt(C.kurals, { from, to }), 1045, 42, '#5b4a2e');
    const [l1, l2] = kText(from);
    text(`“${l1}`, 1175, 50, '#3b2a12', 700); text(`${l2}”`, 1245, 50, '#3b2a12', 700);
    g.font = `600 36px ${TA}`; g.fillStyle = '#5b4a2e';
    g.textAlign = 'left'; g.fillText(`${TEXT.certificate.date}: ${rec.d}`, 200, H - 230);
    g.fillText(`${C.score[0]} · ${C.score[1]}: ${rec.s}/${X.total}`, 200, H - 180);
    g.textAlign = 'right'; g.fillText(`${TEXT.certificate.id}: ${rec.id}`, W - 200, H - 230);
    g.fillText('Learn Tamil · learntamil.msdevbuild.com', W - 200, H - 180);
    CertRecord.drawVerifyQR(g, rec.id, W / 2 - 90, H - 364, 180, TEXT.certificate.verify.scan);   // only when on record
  }
  return { render };
})();
