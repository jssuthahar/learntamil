/* Learn Tamil — level tests and downloadable PDF certificates.
   Questions are generated from js/data.js, so every answer is correct by construction.
   The certificate is drawn on a <canvas> (the browser shapes Tamil text correctly) and
   wrapped into a PDF by a tiny built-in writer — no external library, works offline.
   Uses: $, $$, rand, shuffle, speak, confetti, lettersOf, PULLI, VOWELS, CONS, GROUPS,
         WORDS, Rewards, Progress (rewards.js). */
'use strict';

const CERT = (() => {
  const PASS = 8, TOTAL = 10;
  const pick = a => a[rand(a.length)];
  const kuril = VOWELS.filter(v => v.len === 'குறில்'), nedil = VOWELS.filter(v => v.len === 'நெடில்');
  const SOUND_GRP = { 'ந': 'N', 'ன': 'N', 'ண': 'N', 'ல': 'L', 'ள': 'L', 'ழ': 'L', 'ர': 'R', 'ற': 'R' };
  const grp = c => SOUND_GRP[c] || c;
  const T = s => `<span class="ta">${s}</span>`;

  /* Build a question: correct option + distractors (all different labels). */
  function Q(q, correct, wrongs, explain){
    const seen = new Set([correct]);
    const w = wrongs.filter(x => !seen.has(x) && seen.add(x)).slice(0, 3);
    return { q, opts: shuffle([{ label: correct, ok: true }, ...w.map(x => ({ label: x, ok: false }))]), explain };
  }
  const others = (arr, not, n, key = x => x) => shuffle(arr.filter(x => key(x) !== key(not))).slice(0, n);

  /* ---------- Level 1: vowels ---------- */
  const qVowelPic = () => { const v = pick(VOWELS);
    return Q(`<span class="cq-emo">${v.ex[0]}</span> “${v.ex[2]}” — its Tamil name starts with which vowel?`,
      T(v.l), others(VOWELS, v, 3).map(x => T(x.l)), `${v.ex[1]} starts with ${v.l}.`); };
  const qVowelRoman = () => { const v = pick(VOWELS);
    return Q(`Which vowel says <b>“${v.r}”</b>?`, T(v.l), others(VOWELS, v, 3).map(x => T(x.l)), `${v.l} is “${v.r}”.`); };
  const qVowelLength = () => { const longQ = Math.random() < 0.5;
    const right = pick(longQ ? nedil : kuril), wrong = shuffle(longQ ? kuril : nedil).slice(0, 3);
    return Q(`Which of these is a <b>${longQ ? 'long' : 'short'}</b> vowel (${T(longQ ? 'நெடில்' : 'குறில்')})?`,
      T(right.l), wrong.map(x => T(x.l)), `${right.l} is ${longQ ? 'நெடில் (long)' : 'குறில் (short)'}.`); };
  const qVowelNext = () => { const i = rand(VOWELS.length - 1), v = VOWELS[i], n = VOWELS[i + 1];
    return Q(`Which vowel comes right after ${T(v.l)}?`, T(n.l), others(VOWELS, n, 3).map(x => T(x.l)), `${v.l} → ${n.l}`); };

  /* ---------- Level 2: consonants ---------- */
  const qMeiRoman = () => { const k = pick(CONS);
    const wr = shuffle(CONS.filter(x => grp(x.c) !== grp(k.c))).slice(0, 3);   // never offer look-alike sounds
    return Q(`Which consonant says <b>“${k.r}”</b>?`, T(k.c + PULLI), wr.map(x => T(x.c + PULLI)), `${k.c + PULLI} is “${k.r}”.`); };
  const qMeiGroup = () => { const k = pick(CONS), g = GROUPS[k.g];
    return Q(`${T(k.c + PULLI)} belongs to which group?`, `${T(g.ta)} <small>${g.en}</small>`,
      Object.entries(GROUPS).filter(([id]) => id !== k.g).map(([, x]) => `${T(x.ta)} <small>${x.en}</small>`),
      `${k.c + PULLI} is ${g.ta} (${g.en.toLowerCase()}).`); };
  const qMeiInWord = () => { const k = pick(CONS), m = k.c + PULLI;
    const wr = shuffle(CONS.filter(x => !x.ex[1].includes(m))).slice(0, 3).map(x => T(x.ex[1]));
    return Q(`Which word has the letter ${T(m)} in it?`, T(k.ex[1]), wr, `${k.ex[1]} (${k.ex[2]}) has ${m}.`); };
  const qMeiNext = () => { const i = rand(CONS.length - 1), k = CONS[i], n = CONS[i + 1];
    return Q(`Which consonant comes right after ${T(k.c + PULLI)}?`, T(n.c + PULLI), others(CONS, n, 3).map(x => T(x.c + PULLI)),
      `${k.c + PULLI} → ${n.c + PULLI}`); };

  /* ---------- Level 3: uyirmei ---------- */
  const um = (k, v) => k.c + v.s;
  const qUmBuild = () => { const k = pick(CONS), v = pick(VOWELS);
    return Q(`${T(k.c + PULLI)} + ${T(v.l)} = ?`, T(um(k, v)), others(VOWELS, v, 3).map(x => T(um(k, x))), `${k.c + PULLI} + ${v.l} = ${um(k, v)}`); };
  const qUmSplit = () => { const k = pick(CONS), v = pick(VOWELS), k2 = pick(CONS.filter(x => x !== k));
    const wr = [...others(VOWELS, v, 2).map(x => `${k.c + PULLI} + ${x.l}`), `${k2.c + PULLI} + ${v.l}`];
    return Q(`${T(um(k, v))} is made of…`, T(`${k.c + PULLI} + ${v.l}`), wr.map(T), `${um(k, v)} = ${k.c + PULLI} + ${v.l}`); };
  const qUmLength = () => { const k = pick(CONS), v = pick(VOWELS), long = v.len === 'நெடில்';
    return Q(`Is ${T(um(k, v))} short or long?`, `${T(v.len)} <small>${long ? 'long' : 'short'}</small>`,
      [`${T(long ? 'குறில்' : 'நெடில்')} <small>${long ? 'short' : 'long'}</small>`],
      `${um(k, v)} has the vowel ${v.l}, which is ${v.len}.`); };
  const qUmRoman = () => { const k = pick(CONS), v = pick(VOWELS);
    return Q(`Which letter says <b>“${k.r + v.r}”</b>?`, T(um(k, v)), others(VOWELS, v, 3).map(x => T(um(k, x))), `${um(k, v)} is “${k.r + v.r}”.`); };

  /* ---------- Level 4: reading words ---------- */
  const qWordPic = () => { const w = pick(WORDS);
    return Q(`<span class="cq-emo">${w[1]}</span> Which Tamil word means “${w[2]}”?`, T(w[0]), others(WORDS, w, 3, x => x[0]).map(x => T(x[0])), `${w[0]} = ${w[2]}`); };
  const qWordMeaning = () => { const w = pick(WORDS);
    return Q(`What does ${T(w[0])} mean?`, `${w[1]} ${w[2]}`, others(WORDS, w, 3, x => x[2]).map(x => `${x[1]} ${x[2]}`), `${w[0]} = ${w[2]}`); };
  const qWordCount = () => { const w = pick(WORDS), n = lettersOf(w[0]).length;
    const wr = shuffle([2, 3, 4, 5, 6].filter(x => x !== n)).slice(0, 3);
    return Q(`How many letters are in ${T(w[0])}?`, String(n), wr.map(String), `${w[0]} = ${lettersOf(w[0]).join(' + ')} (${n} letters)`); };
  const qWordFirst = () => { const w = pick(WORDS), f = lettersOf(w[0])[0];
    const pool = [...new Set(WORDS.map(x => lettersOf(x[0])[0]))].filter(x => x !== f);
    return Q(`Which letter does ${T(w[0])} start with?`, T(f), shuffle(pool).slice(0, 3).map(T), `${w[0]} starts with ${f}.`); };

  /* ---------- Level 5: facts (plus all of the above) ---------- */
  const FACTS = [
    () => Q('How many letters are in the Tamil alphabet?', '247', ['216', '30', '18'], '12 + 18 + 1 + 216 = 247'),
    () => Q(`How many ${T('உயிர்மெய்')} letters are there?`, '216', ['247', '18', '12'], '18 consonants × 12 vowels = 216'),
    () => Q(`How many vowels (${T('உயிர்')}) does Tamil have?`, '12', ['18', '5', '7'], 'There are 12 vowels.'),
    () => Q(`How many consonants (${T('மெய்')}) does Tamil have?`, '18', ['12', '30', '216'], 'There are 18 consonants.'),
    () => Q(`What is the letter ${T('ஃ')} called?`, T('ஆய்தம்'), [T('உயிர்'), T('மெய்'), T('உயிர்மெய்')], 'ஃ is the ஆய்த எழுத்து.'),
    () => Q('The 12 vowels and 18 consonants together are called…', T('முதல் எழுத்துகள்'),
      [T('சார்பு எழுத்துகள்'), T('உயிர்மெய் எழுத்துகள்'), T('கிரந்த எழுத்துகள்')], '12 + 18 = 30 முதல் எழுத்துகள்.')
  ];
  const qFact = () => pick(FACTS)();

  const LEVELS = [
    { n: 1, ic: '🌱', ta: 'உயிர் எழுத்துகள்', en: 'Tamil vowels', title: 'தொடக்க நிலை', titleEn: 'Starter', gen: [qVowelPic, qVowelRoman, qVowelLength, qVowelNext] },
    { n: 2, ic: '🧱', ta: 'மெய் எழுத்துகள்', en: 'Tamil consonants', title: 'அடிப்படை நிலை', titleEn: 'Beginner', gen: [qMeiRoman, qMeiGroup, qMeiInWord, qMeiNext] },
    { n: 3, ic: '🧩', ta: 'உயிர்மெய் எழுத்துகள்', en: 'Uyirmei letters', title: 'வளர்ச்சி நிலை', titleEn: 'Explorer', gen: [qUmBuild, qUmSplit, qUmLength, qUmRoman] },
    { n: 4, ic: '📖', ta: 'சொற்கள் படித்தல்', en: 'Reading words', title: 'வாசிப்பு நிலை', titleEn: 'Reader', gen: [qWordPic, qWordMeaning, qWordCount, qWordFirst] },
    { n: 5, ic: '👑', ta: 'தமிழ் எழுத்து வல்லுநர்', en: 'Tamil alphabet master', title: 'சிறப்பு நிலை', titleEn: 'Master',
      gen: [qFact, qFact, qVowelLength, qMeiGroup, qMeiInWord, qUmSplit, qUmLength, qWordCount, qWordFirst, qWordMeaning] }
  ];

  function makeTest(level){
    const out = [], seen = new Set();
    let tries = 0;
    while (out.length < TOTAL && tries++ < 400){
      const g = level.gen[out.length % level.gen.length];
      const q = g();
      if (seen.has(q.q) || q.opts.length < 2) continue;
      seen.add(q.q); out.push(q);
    }
    return shuffle(out);
  }

  /* ---------- saved results (inside Progress, localStorage only) ---------- */
  const certs = () => (Progress.d.certs = Progress.d.certs || {});
  const passed = n => !!certs()[n];
  const unlocked = n => n === 1 || passed(n - 1);

  /* ---------- level cards ---------- */
  function renderLevels(){
    $('#certQuiz').hidden = true; $('#certResult').hidden = true; $('#certLevels').hidden = false;
    $('#certLevels').innerHTML = LEVELS.map(L => {
      const c = certs()[L.n], open = unlocked(L.n);
      const status = c ? `<span class="cl-st ok">✅ Passed · ${c.score}/${TOTAL}</span>` : open ? '<span class="cl-st">Ready</span>' : `<span class="cl-st lock">🔒 Pass level ${L.n - 1} first</span>`;
      const btns = c
        ? `<button class="btn primary" data-dl="${L.n}">⬇ Certificate PDF</button><button class="btn" data-start="${L.n}">↻ Retake</button>`
        : `<button class="btn primary" data-start="${L.n}" ${open ? '' : 'disabled'}>▶ Start test</button>`;
      return `<article class="cert-level ${c ? 'done' : ''} ${open ? '' : 'locked'}" style="--d:${(L.n - 1) * 70}ms">
        <span class="cl-ic" aria-hidden="true">${open ? L.ic : '🔒'}</span>
        <div class="cl-body"><small>Level ${L.n} · ${L.titleEn}</small><b class="ta">${L.ta}</b><span class="ta cl-t">${L.title}</span>${status}</div>
        <div class="cl-btns">${btns}</div></article>`;
    }).join('');
    $$('#certLevels [data-start]').forEach(b => b.addEventListener('click', () => start(+b.dataset.start)));
    $$('#certLevels [data-dl]').forEach(b => b.addEventListener('click', () => { const c = certs()[b.dataset.dl]; downloadPdf(LEVELS[b.dataset.dl - 1], c); }));
  }

  /* ---------- the test ---------- */
  let S = null;
  function start(n){
    const level = LEVELS[n - 1];
    S = { level, qs: makeTest(level), i: 0, right: 0, answered: false };
    $('#certLevels').hidden = true; $('#certResult').hidden = true; $('#certQuiz').hidden = false;
    renderQ();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function renderQ(){
    const q = S.qs[S.i]; S.answered = false;
    $('#certQuiz').innerHTML = `
      <div class="cq-top"><button class="btn small" id="cqQuit">✕ Quit</button>
        <span class="cq-lv">${S.level.ic} Level ${S.level.n} · <span class="ta">${S.level.ta}</span></span>
        <span class="cq-n">${S.i + 1}/${TOTAL}</span></div>
      <div class="cq-bar"><i style="width:${S.i / TOTAL * 100}%"></i></div>
      <div class="cq-q">${q.q}</div>
      <div class="cq-opts">${q.opts.map((o, k) => `<button class="cq-opt" data-k="${k}" style="--d:${k * 60}ms">${o.label}</button>`).join('')}</div>
      <div class="cq-fb" id="cqFb" aria-live="polite"></div>
      <button class="btn primary cq-next" id="cqNext" hidden>${S.i + 1 < TOTAL ? 'Next question →' : 'See my result →'}</button>`;
    $('#cqQuit').onclick = () => { if (confirm('Stop this test? Your answers will not be saved.')) renderLevels(); };
    $$('#certQuiz .cq-opt').forEach(b => b.addEventListener('click', () => answer(+b.dataset.k, b)));
    $('#cqNext').onclick = next;
  }
  function answer(k, b){
    if (S.answered) return; S.answered = true;
    const q = S.qs[S.i], o = q.opts[k];
    $$('#certQuiz .cq-opt').forEach((x, j) => { x.disabled = true; if (q.opts[j].ok) x.classList.add('right'); });
    if (o.ok){ S.right++; b.classList.add('right'); Rewards.sfx.correct(); sparkle(b);
      $('#cqFb').innerHTML = `<span class="ok">✓ ${pick(['அருமை!', 'நன்று!', 'சரியான விடை!'])}</span> <small>${q.explain}</small>`; }
    else { b.classList.add('wrong'); Rewards.sfx.wrong();
      $('#cqFb').innerHTML = `<span class="bad">✗ Not quite.</span> <small>${q.explain}</small>`; }
    $('#cqNext').hidden = false; $('#cqNext').focus({ preventScroll: true });
  }
  function next(){ S.i++; if (S.i < TOTAL) renderQ(); else result(); }

  /* ---------- result ---------- */
  function result(){
    $('#certQuiz').hidden = true; const box = $('#certResult'); box.hidden = false;
    const L = S.level, ok = S.right >= PASS, pct = Math.round(S.right / TOTAL * 100);
    if (!ok){
      Rewards.sfx.wrong();
      box.innerHTML = `<div class="cr-emo" aria-hidden="true">💪</div><h3><span class="ta">பரவாயில்லை!</span> Keep practising</h3>
        <p class="cr-score">${S.right}/${TOTAL} <small>(${pct}%)</small></p><p>You need ${PASS} out of ${TOTAL} to pass. Practise in the app and try again!</p>
        <div class="cr-btns"><button class="btn primary" id="crRetry">↻ Try again</button><button class="btn" id="crBack">← All levels</button></div>`;
      $('#crRetry').onclick = () => start(L.n); $('#crBack').onclick = renderLevels;
      return;
    }
    Rewards.sfx.win(); confetti(); setTimeout(() => speak('வாழ்த்துகள்!'), 500);
    let lastName = ''; try { lastName = localStorage.getItem('lt-cert-name') || ''; } catch (e) {}
    box.innerHTML = `<div class="cr-emo" aria-hidden="true">🎓</div><h3><span class="ta">வாழ்த்துகள்!</span> You passed Level ${L.n}</h3>
      <p class="cr-score">${S.right}/${TOTAL} <small>(${pct}%)</small></p>
      <form class="cr-form" id="crForm"><label for="crName">Name for the certificate · <span class="ta">பெயர்</span></label>
        <div class="cr-row"><input id="crName" maxlength="40" autocomplete="off" required placeholder="e.g. Kavin" value="${escapeAttr(lastName)}">
        <button class="btn primary" type="submit">🎓 Make my certificate</button></div>
        <small class="muted">The name stays on this device only.</small></form>`;
    $('#crForm').onsubmit = e => {
      e.preventDefault();
      const name = $('#crName').value.replace(/\s+/g, ' ').trim().slice(0, 40); if (!name) return;
      try { localStorage.setItem('lt-cert-name', name); } catch (er) {}
      const prev = certs()[L.n];
      const c = { name, score: Math.max(S.right, prev ? prev.score : 0), date: new Date().toISOString().slice(0, 10),
        id: `LT${L.n}-${Date.now().toString(36).toUpperCase().slice(-6)}` };
      const first = !prev; certs()[L.n] = c; Progress.save();
      if (first) Progress.addTokens(20); else Progress.check();
      showCertificate(L, c);
    };
  }
  const escapeAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  function showCertificate(L, c){
    const box = $('#certResult');
    box.innerHTML = `<h3>🎓 Your certificate</h3><div class="cert-preview"><canvas id="certCanvas" width="2339" height="1654" aria-label="Certificate for ${escapeAttr(c.name)}"></canvas></div>
      <div class="cr-btns"><button class="btn primary" id="crPdf">⬇ Download PDF</button><button class="btn" id="crPng">🖼 Save image</button><button class="btn" id="crBack2">← All levels</button></div>`;
    drawCertificate($('#certCanvas'), L, c);
    $('#crPdf').onclick = () => downloadPdf(L, c);
    $('#crPng').onclick = () => { $('#certCanvas').toBlob(b => save(b, fileName(L, c, 'png')), 'image/png'); };
    $('#crBack2').onclick = renderLevels;
  }

  /* ---------- drawing the certificate (A4 landscape, 2339 × 1654 px ≈ 200 dpi) ---------- */
  async function drawCertificate(cv, L, c){
    try { await Promise.all(['800 90px "Baloo Thambi 2"', '700 60px "Noto Sans Tamil"', '600 40px "Inter"'].map(f => document.fonts.load(f, 'அஆa'))); } catch (e) {}
    const g = cv.getContext('2d'), W = cv.width, H = cv.height;
    const kid = '"Baloo Thambi 2","Noto Sans Tamil",sans-serif', ta = '"Noto Sans Tamil",sans-serif', ui = '"Inter","Segoe UI",sans-serif';
    // background
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#eef7ff'); bg.addColorStop(0.55, '#fffaf0'); bg.addColorStop(1, '#fff1e0');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const blob = (x, y, r, col) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); };
    blob(0, 0, 700, 'rgba(23,105,209,.18)'); blob(W, 0, 650, 'rgba(255,205,86,.35)'); blob(W, H, 700, 'rgba(255,138,101,.22)'); blob(0, H, 600, 'rgba(76,194,176,.2)');
    // faint floating letters
    g.save(); g.globalAlpha = 0.07; g.fillStyle = '#1769d1'; g.font = `800 150px ${kid}`;
    [['அ', 180, 360], ['க', 2050, 400], ['ழ', 230, 1420], ['ஆ', 2080, 1400], ['ம', 1150, 1560], ['இ', 1700, 260]].forEach(([l, x, y]) => g.fillText(l, x, y)); g.restore();
    // rainbow border
    const bd = g.createLinearGradient(0, 0, W, 0); ['#1769d1', '#7c3aed', '#ff5e7e', '#ff8a3d', '#2eb67d'].forEach((col, i) => bd.addColorStop(i / 4, col));
    g.lineWidth = 34; g.strokeStyle = bd; roundRect(g, 60, 60, W - 120, H - 120, 70); g.stroke();
    g.lineWidth = 4; g.strokeStyle = 'rgba(23,105,209,.35)'; g.setLineDash([18, 16]); roundRect(g, 110, 110, W - 220, H - 220, 50); g.stroke(); g.setLineDash([]);
    // corner decorations
    g.font = `110px ${ui}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('⭐', 210, 220); g.fillText('🌟', W - 210, 220); g.fillText('🎈', 210, H - 230); g.fillText('🦜', W - 220, H - 240);
    // header
    g.fillStyle = '#0b1020'; g.font = `700 40px ${ui}`; g.fillText('LEARN TAMIL · MSDEVBUILD', W / 2, 230);
    const tg = g.createLinearGradient(W / 2 - 500, 0, W / 2 + 500, 0); tg.addColorStop(0, '#1769d1'); tg.addColorStop(0.55, '#7c3aed'); tg.addColorStop(1, '#e0480c');
    g.fillStyle = tg; g.font = `800 150px ${kid}`; g.fillText('சான்றிதழ்', W / 2, 390);
    g.fillStyle = '#3b4256'; g.font = `600 52px ${ui}`; g.fillText('Certificate of Achievement', W / 2, 510);
    // presented to
    g.font = `500 40px ${ta}`; g.fillStyle = '#4a5163'; g.fillText('இந்தச் சான்றிதழ் பெருமையுடன் வழங்கப்படுகிறது · This certificate is proudly presented to', W / 2, 620);
    // name (shrink to fit)
    let size = 130; g.font = `800 ${size}px ${kid}`;
    while (g.measureText(c.name).width > W - 700 && size > 60){ size -= 6; g.font = `800 ${size}px ${kid}`; }
    g.fillStyle = '#0b1020'; g.fillText(c.name, W / 2, 770);
    g.strokeStyle = '#ffb020'; g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2 - 600, 850); g.lineTo(W / 2 + 600, 850); g.stroke();
    // level
    g.fillStyle = '#4a5163'; g.font = `500 40px ${ui}`; g.fillText('for successfully completing', W / 2, 935);
    g.fillStyle = '#1769d1'; g.font = `800 82px ${kid}`; g.fillText(`${L.ic}  நிலை ${L.n} · ${L.ta}`, W / 2, 1050);
    g.fillStyle = '#e0480c'; g.font = `700 50px ${kid}`; g.fillText(`${L.title} · Level ${L.n} ${L.titleEn} — ${L.en}`, W / 2, 1150);
    // score pill
    const pill = `Score ${c.score}/${TOTAL}  ·  ${Math.round(c.score / TOTAL * 100)}%`;
    g.font = `800 44px ${ui}`; const pw = g.measureText(pill).width + 90;
    g.fillStyle = '#fff3c4'; roundRect(g, W / 2 - pw / 2, 1205, pw, 84, 42); g.fill();
    g.fillStyle = '#7a5600'; g.fillText(pill, W / 2, 1249);
    // footer: date, medal, signature
    const date = new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    g.fillStyle = '#0b1020'; g.font = `700 40px ${ui}`; g.fillText(date, 560, 1395);
    g.fillText('Suthahar Jegatheesan', W - 560, 1395);
    g.strokeStyle = '#9aa6b8'; g.lineWidth = 3;
    [[560], [W - 560]].forEach(([x]) => { g.beginPath(); g.moveTo(x - 260, 1350); g.lineTo(x + 260, 1350); g.stroke(); });
    g.fillStyle = '#4a5163'; g.font = `500 32px ${ui}`; g.fillText('Date · தேதி', 560, 1450); g.fillText('MSDEVBUILD · Learn Tamil', W - 560, 1450);
    g.font = `190px ${ui}`; g.fillText('🏅', W / 2, 1400);
    g.fillStyle = '#6b7385'; g.font = `500 28px ${ui}`;
    g.fillText(`Certificate ID ${c.id}  ·  jssuthahar.github.io/learntamil  ·  A practice certificate for encouragement, not an official qualification`, W / 2, H - 150);
  }
  function roundRect(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  /* ---------- tiny PDF writer: one A4 landscape page with the certificate as a JPEG ---------- */
  function jpegToPdf(jpeg, w, h, title){
    const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
    const add = d => { const b = typeof d === 'string' ? enc.encode(d) : d; parts.push(b); len += b.length; };
    const obj = (n, body) => { offs[n] = len; add(`${n} 0 obj\n`); body(); add('\nendobj\n'); };
    const pdfStr = s => '(' + s.replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7e]/g, '') + ')';
    const PW = 842, PH = 595;   // A4 landscape in points
    add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, () => add('<< /Type /Catalog /Pages 2 0 R >>'));
    obj(2, () => add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
    obj(3, () => add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`));
    obj(4, () => { add(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); add(jpeg); add('\nendstream'); });
    const content = `q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`;
    obj(5, () => add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    obj(6, () => add(`<< /Title ${pdfStr(title)} /Author (Learn Tamil - MSDEVBUILD) /Creator (Learn Tamil) >>`));
    const xref = len;
    add(`xref\n0 7\n0000000000 65535 f \n${offs.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`);
    add(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: 'application/pdf' });
  }
  const fileName = (L, c, ext) => `Learn-Tamil-Certificate-Level-${L.n}-${c.name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'student'}.${ext}`;
  function save(blob, name){
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  async function downloadPdf(L, c){
    let cv = $('#certCanvas');
    if (!cv){ cv = document.createElement('canvas'); cv.width = 2339; cv.height = 1654; }
    await drawCertificate(cv, L, c);
    cv.toBlob(async b => {
      const jpeg = new Uint8Array(await b.arrayBuffer());
      save(jpegToPdf(jpeg, cv.width, cv.height, `Learn Tamil Certificate - Level ${L.n} - ${c.name}`), fileName(L, c, 'pdf'));
    }, 'image/jpeg', 0.92);
  }

  document.addEventListener('lt:section', e => { if (e.detail === 'certificate') renderLevels(); });
  return { LEVELS, makeTest, jpegToPdf, drawCertificate, start, renderLevels, _state: () => S };
})();
