/* Learn Tamil — level tests and downloadable PDF certificates.
   Questions are generated from assets/js/data/, so every answer is correct by construction.
   The certificate is drawn on a <canvas> (the browser shapes Tamil text correctly) and
   wrapped into a PDF by a tiny built-in writer — no external library, works offline.
   Uses: $, $$, rand, shuffle, speak, confetti, lettersOf, PULLI, VOWELS, CONS, GROUPS,
         WORDS, Rewards, Progress (features/rewards/). */
'use strict';

const CERT = (() => {
  const PASS = 8, TOTAL = 10;
  const pick = a => a[rand(a.length)];
  const kuril = VOWELS.filter(v => v.len === LETTER_LABELS.short), nedil = VOWELS.filter(v => v.len === LETTER_LABELS.long);
  const SOUND_GRP = SOUND_GROUP;   // data/alphabet.js
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
  const qUmLength = () => { const k = pick(CONS), v = pick(VOWELS), long = v.len === LETTER_LABELS.long;
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
  const groupCount = id => CONS.filter(k => k.g === id).length;
  const FACTS = [
    () => Q('How many letters are in the Tamil alphabet?', '247', ['216', '30', '18'], '12 + 18 + 1 + 216 = 247'),
    () => Q(`How many ${T('உயிர்மெய்')} letters are there?`, '216', ['247', '18', '12'], '18 consonants × 12 vowels = 216'),
    () => Q(`How many vowels (${T('உயிர்')}) does Tamil have?`, '12', ['18', '5', '7'], 'There are 12 vowels.'),
    () => Q(`How many consonants (${T('மெய்')}) does Tamil have?`, '18', ['12', '30', '216'], 'There are 18 consonants.'),
    () => Q(`What is the letter ${T('ஃ')} called?`, T('ஆய்தம்'), [T('உயிர்'), T('மெய்'), T('உயிர்மெய்')], 'ஃ is the ஆய்த எழுத்து.'),
    () => Q('The 12 vowels and 18 consonants together are called…', T('முதல் எழுத்துகள்'),
      [T('சார்பு எழுத்துகள்'), T('உயிர்மெய் எழுத்துகள்'), T('கிரந்த எழுத்துகள்')], '12 + 18 = 30 முதல் எழுத்துகள்.'),
    () => Q(`How many short vowels (${T('குறில்')}) are there?`, String(kuril.length), ['7', '12', '3'].filter(x => x !== String(kuril.length)),
      `${kuril.map(v => v.l).join(' ')} — ${kuril.length} short vowels.`),
    () => Q(`How many long vowels (${T('நெடில்')}) are there?`, String(nedil.length), ['5', '12', '6'].filter(x => x !== String(nedil.length)),
      `${nedil.map(v => v.l).join(' ')} — ${nedil.length} long vowels.`),
    () => Q(`How many consonants are ${T('வல்லினம்')} (hard sounds)?`, String(groupCount('v')), ['3', '9', '12'],
      `${CONS.filter(k => k.g === 'v').map(k => k.c + PULLI).join(' ')} — ${groupCount('v')} letters.`),
    () => Q('Which letter is special to Tamil — the tongue curls far back, between “r” and “l”?', T('ழ்'), [T('ல்'), T('ர்'), T('ள்')], 'ழ் as in தமிழ்.'),
    () => Q('A consonant joined with a vowel makes an…', T('உயிர்மெய் எழுத்து'), [T('உயிர் எழுத்து'), T('மெய் எழுத்து'), T('ஆய்த எழுத்து')],
      'க் + அ = க — an உயிர்மெய் எழுத்து.'),
    () => Q(`Which is the first letter of the Tamil alphabet?`, T('அ'), [T('க'), T('ஆ'), T('ஃ')], 'அ comes first.'),
    () => Q(`Which is the last consonant (${T('மெய்')})?`, T('ன்'), [T('ண்'), T('ழ்'), T('ற்')], `The consonants end with ${CONS[CONS.length - 1].c + PULLI}.`)
  ];
  const qFact = () => pick(FACTS)();

  /* ---------- Level 6: numbers, colours and days ---------- */
  const topic = id => TOPICS.find(t => t.id === id).words;
  const NUMS = topic('numbers').map(w => { const [en, dig, tn] = w[2].split(' · '); return { w: w[0], en, dig, tn }; });
  const COLOURS = topic('colours'), DAYS = topic('days');
  const qNumWord = () => { const n = pick(NUMS);
    return Q(`Which Tamil word is the number <b>${n.dig}</b>?`, T(n.w), others(NUMS, n, 3).map(x => T(x.w)), `${n.dig} = ${n.w} (${n.en})`); };
  const qNumMeaning = () => { const n = pick(NUMS);
    return Q(`What number is ${T(n.w)}?`, n.dig, others(NUMS, n, 3).map(x => x.dig), `${n.w} = ${n.dig} (${n.en})`); };
  const qNumTamilDigit = () => { const n = pick(NUMS);
    return Q(`The Tamil numeral ${T(n.tn)} means…`, n.dig, others(NUMS, n, 3).map(x => x.dig), `${n.tn} = ${n.dig} = ${n.w}`); };
  const qColourPic = () => { const c = pick(COLOURS);
    return Q(`<span class="cq-emo">${c[1]}</span> Which Tamil word means <b>${c[2]}</b>?`, T(c[0]), others(COLOURS, c, 3).map(x => T(x[0])), `${c[0]} = ${c[2]}`); };
  const qColourMeaning = () => { const c = pick(COLOURS);
    return Q(`What colour is ${T(c[0])}?`, `${c[1]} ${c[2]}`, others(COLOURS, c, 3).map(x => `${x[1]} ${x[2]}`), `${c[0]} = ${c[2]}`); };
  const qDayNext = () => { const i = rand(DAYS.length), d = DAYS[i], n = DAYS[(i + 1) % DAYS.length];
    return Q(`Which day comes after ${T(d[0])} <small>(${d[2]})</small>?`, T(n[0]), others(DAYS, n, 3).map(x => T(x[0])), `${d[0]} → ${n[0]} (${d[2]} → ${n[2]})`); };
  const qDayBefore = () => { const i = rand(DAYS.length), d = DAYS[i], p = DAYS[(i + DAYS.length - 1) % DAYS.length];
    return Q(`Which day comes before ${T(d[0])} <small>(${d[2]})</small>?`, T(p[0]), others(DAYS, p, 3).map(x => T(x[0])), `${p[0]} → ${d[0]} (${p[2]} → ${d[2]})`); };
  const qDayMeaning = () => { const d = pick(DAYS);
    return Q(`What is ${T(d[0])} in English?`, d[2], others(DAYS, d, 3).map(x => x[2]), `${d[0]} = ${d[2]}`); };

  /* ---------- Level 7: family, body and food ---------- */
  const topicPic = id => () => { const ws = topic(id), w = pick(ws);
    return Q(`<span class="cq-emo">${w[1]}</span> Which Tamil word means “${w[2]}”?`, T(w[0]), others(ws, w, 3, x => x[0]).map(x => T(x[0])), `${w[0]} = ${w[2]}`); };
  const topicMeaning = id => () => { const ws = topic(id), w = pick(ws);
    return Q(`What does ${T(w[0])} mean?`, w[2], others(ws, w, 3, x => x[2]).map(x => x[2]), `${w[0]} = ${w[2]}`); };

  /* ---------- More topics (practice games only): animals, birds, vehicles, shapes, opposites, months ---------- */
  const OPP = topic('opposites').map(w => ({ w: w[0], e: w[1], en: w[2].split(' · ')[0], opp: w[2].split(' of ')[1] }));
  const qOpposite = () => { const o = pick(OPP), ans = OPP.find(x => x.w === o.opp);
    return Q(`<span class="cq-emo">${o.e}</span> What is the opposite of ${T(o.w)} <small>(${o.en})</small>?`, T(ans.w),
      others(OPP.filter(x => x.w !== o.w), ans, 3, x => x.w).map(x => T(x.w)), `${o.w} (${o.en}) ↔ ${ans.w} (${ans.en})`); };
  const MONTHS = topic('months');
  const qMonthNext = () => { const i = rand(MONTHS.length), m = MONTHS[i], n = MONTHS[(i + 1) % MONTHS.length];
    return Q(`Which Tamil month comes after ${T(m[0])}?`, T(n[0]), others(MONTHS, n, 3).map(x => T(x[0])), `${m[0]} → ${n[0]}`); };
  const qMonthFirst = () => Q('Which is the first month of the Tamil year?', T('சித்திரை'), shuffle(MONTHS.slice(1)).slice(0, 3).map(x => T(x[0])),
    'The Tamil year starts with சித்திரை (mid-April) — Tamil New Year.');

  /* ---------- Level 8: spelling ---------- */
  const SPELL = [...WORDS, ...TOPICS.filter(t => t.id !== 'numbers').flatMap(t => t.words), ...topic('numbers')]
    .filter((w, i, a) => lettersOf(w[0]).length >= 2 && a.findIndex(x => x[0] === w[0]) === i)
    .map(w => [w[0], w[1], w[2].split(' · ')[0]]);
  const ALL_LETTERS = [...new Set(SPELL.flatMap(w => lettersOf(w[0])))];
  const isMei = l => l.length === 2 && l[1] === PULLI;
  const qMissing = () => { const w = pick(SPELL), ls = lettersOf(w[0]), i = rand(ls.length), c = ls[i];
    const shown = ls.map((l, j) => j === i ? '<u class="cq-gap">?</u>' : l).join('');
    const wr = shuffle(ALL_LETTERS.filter(l => l !== c && isMei(l) === isMei(c) && grp(l[0]) !== grp(c[0]))).slice(0, 3);
    return Q(`<span class="cq-emo">${w[1]}</span> “${w[2]}” — which letter is missing? ${T(shown)}`, T(c), wr.map(T), `${w[0]} = ${ls.join(' + ')}`); };
  const qJoin = () => { const w = pick(SPELL), ls = lettersOf(w[0]);
    const same = SPELL.filter(x => x[0] !== w[0] && lettersOf(x[0]).length === ls.length);
    return Q(`${ls.map(T).join(' + ')} = ?`, T(w[0]), shuffle(same.length >= 3 ? same : SPELL.filter(x => x[0] !== w[0])).slice(0, 3).map(x => T(x[0])),
      `${ls.join(' + ')} = ${w[0]} (${w[2]})`); };
  const qUnscramble = () => { const pool = SPELL.filter(x => lettersOf(x[0]).length >= 3), w = pick(pool), ls = lettersOf(w[0]);
    const perms = new Set(); let t = 0;
    while (perms.size < 4 && t++ < 60){ const p = shuffle(ls.slice()).join(''); if (p !== w[0]) perms.add(p); }
    const [mix, ...wr] = [...perms];
    return Q(`<span class="cq-emo">${w[1]}</span> “${w[2]}” — put these letters in order: ${lettersOf(mix).map(T).join(' ')}`, T(w[0]), wr.map(T),
      `${w[0]} = ${ls.join(' + ')}`); };
  const qLast = () => { const w = pick(SPELL), ls = lettersOf(w[0]), l = ls[ls.length - 1];
    const pool = [...new Set(SPELL.map(x => { const y = lettersOf(x[0]); return y[y.length - 1]; }))].filter(x => x !== l);
    return Q(`Which letter does ${T(w[0])} end with?`, T(l), shuffle(pool).slice(0, 3).map(T), `${w[0]} ends with ${l}.`); };

  /* ---------- Level 9: reading sentences from the stories ---------- */
  const PAGES = STORIES.flatMap(s => s.pages.map(p => ({ ta: p[1], en: p[2], story: s })));
  const TS = s => `<span class="ta ta-s">${s}</span>`;
  const qSentMeaning = () => { const p = pick(PAGES);
    return Q(`What does this mean?<br>${TS(p.ta)}`, p.en, others(PAGES, p, 3, x => x.en).map(x => x.en), `From “${p.story.en}”.`); };
  const qSentPick = () => { const p = pick(PAGES);
    return Q(`Which sentence means: <b>${p.en}</b>`, TS(p.ta), others(PAGES, p, 3, x => x.ta).map(x => TS(x.ta)), `${p.ta} = ${p.en}`); };
  const qStoryTitle = () => { const s = pick(STORIES);
    return Q(`<span class="cq-emo">${s.cover}</span> What is the story ${T(s.title)} called in English?`, s.en, others(STORIES, s, 3).map(x => x.en), `${s.title} = ${s.en}`); };
  const qSentWho = () => { const s = pick(STORIES), p = pick(s.pages);
    return Q(`Which story is this sentence from?<br>${TS(p[1])}`, `${s.cover} ${s.en}`, others(STORIES, s, 3).map(x => `${x.cover} ${x.en}`), `${p[1]} — ${p[2]}`); };

  /* Level names live in data/rewards.js (CERT_LEVELS); each level's questions are chosen here. */
  const LEVEL_QUESTIONS = {
    1: [qVowelPic, qVowelRoman, qVowelLength, qVowelNext],
    2: [qMeiRoman, qMeiGroup, qMeiInWord, qMeiNext],
    3: [qUmBuild, qUmSplit, qUmLength, qUmRoman],
    4: [qWordPic, qWordMeaning, qWordCount, qWordFirst],
    5: [qFact, qFact, qVowelLength, qMeiGroup, qMeiInWord, qUmSplit, qUmLength, qWordCount, qWordFirst, qWordMeaning],
    6: [qNumWord, qNumMeaning, qNumTamilDigit, qColourPic, qColourMeaning, qDayNext, qDayBefore, qDayMeaning],
    7: [topicPic('body'), topicMeaning('body'), topicPic('family'), topicMeaning('family'), topicPic('food'), topicMeaning('food')],
    8: [qMissing, qJoin, qUnscramble, qLast],
    9: [qSentMeaning, qSentPick, qSentWho, qStoryTitle, qSentMeaning, qSentPick],
    10: [qFact, qVowelRoman, qMeiRoman, qUmRoman, qUmSplit, qWordMeaning, qNumTamilDigit, qDayNext, topicMeaning('family'), topicPic('food'),
        qMissing, qUnscramble, qJoin, qSentMeaning, qSentPick]
  };
  const LEVELS = CERT_LEVELS.map(L => ({ ...L, gen: LEVEL_QUESTIONS[L.n] }));
  const tot = L => L.total || TOTAL, need = L => L.pass || PASS;

  /* Question banks for the practice games (features/games/question-games.js) — same generators, endless play. */
  const bank = {
    letters: [qVowelPic, qVowelRoman, qVowelLength, qVowelNext, qMeiRoman, qMeiGroup, qMeiInWord, qMeiNext, qUmBuild, qUmSplit, qUmLength, qUmRoman],
    picture: [qWordPic, qWordMeaning, qColourPic, topicPic('body'), topicPic('family'), topicPic('food'),
      topicPic('animals'), topicPic('birds'), topicPic('vehicles'), topicPic('shapes')],
    topics: [qNumWord, qNumMeaning, qNumTamilDigit, qColourMeaning, qDayNext, qDayBefore, qDayMeaning, topicMeaning('body'), topicMeaning('family'), topicMeaning('food'),
      topicMeaning('animals'), topicMeaning('birds'), topicMeaning('vehicles'), topicMeaning('shapes'), qOpposite, qOpposite, qMonthNext, qMonthFirst],
    spell: [qMissing, qJoin, qUnscramble, qLast, qWordCount, qWordFirst],
    story: [qSentMeaning, qSentPick, qSentWho, qStoryTitle],
    facts: FACTS
  };
  bank.quiz = [...new Set(Object.values(bank).flat())];

  /* ---------- no repeats: remember recently asked questions per level (this device only) ---------- */
  const keyOf = q => q.q + '|' + (q.opts.find(o => o.ok) || {}).label;
  const SEEN_KEY = 'lt-cert-seen';
  const loadSeen = () => { try { return JSON.parse(Profiles.get(SEEN_KEY)) || {}; } catch (e) { return {}; } };
  const saveSeen = (n, keys) => { const all = loadSeen(); all[n] = keys.slice(-150);
    Profiles.set(SEEN_KEY, JSON.stringify(all)); };

  function makeTest(level){
    const N = tot(level), past = loadSeen()[level.n] || [], hist = new Set(past);
    const out = [], seenQ = new Set(), keys = [], gens = shuffle(level.gen.slice());
    let tries = 0, fresh = true;
    while (out.length < N && tries++ < 3000){
      // Every question has been asked: start a new round, but still never repeat the previous test.
      if (tries === 1500){ fresh = false; hist.clear(); past.slice(-N).forEach(k => hist.add(k)); }
      const q = gens[(out.length + (tries >> 4)) % gens.length]();
      const k = keyOf(q);
      if (q.opts.length < 2 || seenQ.has(q.q) || hist.has(k)) continue;
      seenQ.add(q.q); keys.push(k); out.push(q);
    }
    saveSeen(level.n, fresh ? [...(loadSeen()[level.n] || []), ...keys] : keys);
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
      const status = c ? `<span class="cl-st ok">✅ Passed · ${c.score}/${tot(L)}</span>` : open ? '<span class="cl-st">Ready</span>' : `<span class="cl-st lock">🔒 Pass level ${L.n - 1} first</span>`;
      const btns = c
        ? `<button class="btn primary" data-dl="${L.n}">⬇ Certificate PDF</button><button class="btn" data-start="${L.n}">↻ Retake</button>`
        : `<button class="btn primary" data-start="${L.n}" ${open ? '' : 'disabled'}>▶ Start test</button>`;
      return `<article class="cert-level ${c ? 'done' : ''} ${open ? '' : 'locked'}" style="--d:${(L.n - 1) * 70}ms">
        <span class="cl-ic" aria-hidden="true">${open ? L.ic : '🔒'}</span>
        <div class="cl-body"><small>Level ${L.n} · ${L.titleEn}</small><b class="ta">${L.ta}</b><span class="ta cl-t">${L.title}</span>${status}</div>
        <div class="cl-btns">${btns}</div></article>`;
    }).join('') + CertRecord.verifyHTML('cl');
    CertRecord.wireVerify($('#certLevels [data-crv]'));
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
        <span class="cq-n">${S.i + 1}/${S.qs.length}</span></div>
      <div class="cq-bar"><i style="width:${S.i / S.qs.length * 100}%"></i></div>
      <div class="cq-q">${q.q}</div>
      <div class="cq-opts">${q.opts.map((o, k) => `<button class="cq-opt" data-k="${k}" style="--d:${k * 60}ms">${o.label}</button>`).join('')}</div>
      <div class="cq-fb" id="cqFb" aria-live="polite"></div>
      <button class="btn primary cq-next" id="cqNext" hidden>${S.i + 1 < S.qs.length ? 'Next question →' : 'See my result →'}</button>`;
    $('#cqQuit').onclick = () => { if (confirm('Stop this test? Your answers will not be saved.')) renderLevels(); };
    $$('#certQuiz .cq-opt').forEach(b => b.addEventListener('click', () => answer(+b.dataset.k, b)));
    $('#cqNext').onclick = next;
  }
  function answer(k, b){
    if (S.answered) return; S.answered = true;
    const q = S.qs[S.i], o = q.opts[k];
    $$('#certQuiz .cq-opt').forEach((x, j) => { x.disabled = true; if (q.opts[j].ok) x.classList.add('right'); });
    if (o.ok){ S.right++; b.classList.add('right'); Rewards.sfx.correct(); sparkle(b);
      $('#cqFb').innerHTML = `<span class="ok">✓ ${pick(TEXT.praise)[0]}</span> <small>${q.explain}</small>`; }
    else { b.classList.add('wrong'); Rewards.sfx.wrong();
      $('#cqFb').innerHTML = `<span class="bad">✗ Not quite.</span> <small>${q.explain}</small>`; }
    $('#cqNext').hidden = false; $('#cqNext').focus({ preventScroll: true });
  }
  function next(){ S.i++; if (S.i < S.qs.length) renderQ(); else result(); }

  /* ---------- result ---------- */
  function result(){
    $('#certQuiz').hidden = true; const box = $('#certResult'); box.hidden = false;
    const L = S.level, N = S.qs.length, ok = S.right >= Math.min(need(L), N), pct = Math.round(S.right / N * 100);
    if (!ok){
      Rewards.sfx.wrong();
      box.innerHTML = `<div class="cr-emo" aria-hidden="true">💪</div><h3><span class="ta">${TEXT.noWorries[0]}</span> ${TEXT.noWorries[1]}</h3>
        <p class="cr-score">${S.right}/${N} <small>(${pct}%)</small></p><p>You need ${need(L)} out of ${N} to pass. Practise in the app and try again!</p>
        <div class="cr-btns"><button class="btn primary" id="crRetry">↻ Try again</button><button class="btn" id="crBack">← All levels</button></div>`;
      $('#crRetry').onclick = () => start(L.n); $('#crBack').onclick = renderLevels;
      return;
    }
    Rewards.sfx.win(); confetti(); setTimeout(() => speak(TEXT.congrats), 500); logEv('certificate_earned', { level: L.n });
    const lastName = Profiles.get('lt-cert-name') || Profiles.current().name || '';
    box.innerHTML = `<div class="cr-emo" aria-hidden="true">🎓</div><h3><span class="ta">${TEXT.congrats}</span> You passed Level ${L.n}</h3>
      <p class="cr-score">${S.right}/${N} <small>(${pct}%)</small></p>
      <form class="cr-form" id="crForm" novalidate><label for="crName">Name for the certificate · <span class="ta">${TEXT.certificate.name}</span></label>
        <div class="cr-row"><input id="crName" maxlength="40" autocomplete="off" required placeholder="e.g. Kavin" value="${escapeAttr(lastName)}">
        ${CertRecord.collecting() ? '' : '<button class="btn primary" type="submit">🎓 Make my certificate</button>'}</div>
        <small class="crc-err" data-crc-err="name" hidden></small>
        ${CertRecord.collecting() ? CertRecord.fieldsHTML('cr') + '<button class="btn primary cr-make" type="submit">🎓 Make my certificate</button>'
          : '<small class="muted">The name stays on this device only.</small>'}</form>`;
    CertRecord.wire($('#crForm'));
    let making = false;   // a double tap makes one certificate, not two
    $('#crForm').onsubmit = async e => {
      e.preventDefault(); if (making) return;
      const name = $('#crName').value.replace(/\s+/g, ' ').trim().slice(0, 40);
      const r = CertRecord.read($('#crForm'), name); if (!r.ok){ if (!name) $('#crName').focus(); return; }
      making = true;
      Profiles.set('lt-cert-name', name);
      const prev = certs()[L.n];
      const again = Object.keys(certs()).some(k => +k !== L.n);   // another level was already earned
      // Retaking a passed level keeps its certificate ID, so one level never has two IDs.
      const c = { name, score: Math.max(S.right, prev ? prev.score : 0), total: tot(L), date: new Date().toISOString().slice(0, 10),
        id: prev && prev.id ? prev.id : `LT${L.n}-${Date.now().toString(36).toUpperCase().slice(-6)}` };
      const first = !prev; certs()[L.n] = c; Progress.save();
      if (first) Progress.addTokens(20); else Progress.check();
      showCertificate(L, c, again);
      const st = await CertRecord.submit({ studentName: name, certificateId: c.id, batchId: `letters-${L.n}`, source: 'letters', score: c.score, total: c.total,
        courseName: `Learn Tamil Level ${L.n} · ${L.titleEn} (${L.en})` }, r.contact);
      if (st !== 'skipped' && $('#certCanvas')) drawCertificate($('#certCanvas'), L, c);   // now on record: add the QR code
      if (st === 'queued') $('#certResult .cr-btns').insertAdjacentHTML('afterend', `<p class="crc-note" role="status">${TEXT.certificate.contact.notSaved}</p>`);
    };
  }
  const escapeAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  function showCertificate(L, c, again){
    const box = $('#certResult');
    box.innerHTML = `<h3>🎓 Your certificate</h3><div class="cert-preview"><canvas id="certCanvas" width="2339" height="1654" aria-label="Certificate for ${escapeAttr(c.name)}"></canvas></div>
      <div class="cr-btns"><button class="btn primary" id="crPdf">⬇ Download PDF</button><button class="btn" id="crPng">🖼 Save image</button><button class="btn" id="crBack2">← All levels</button></div>`;
    drawCertificate($('#certCanvas'), L, c);
    $('#crPdf').onclick = () => downloadPdf(L, c);
    $('#crPng').onclick = () => { $('#certCanvas').toBlob(b => save(b, fileName(L, c, 'png')), 'image/png'); };
    $('#crBack2').onclick = renderLevels;
    CertShare.mount(box.querySelector('.cr-btns'), { what: `Level ${L.n} · ${L.titleEn} (${L.en})`, again, url: 'https://learntamil.msdevbuild.com/',
      certId: c.id, file: fileName(L, c, 'png'), blob: () => new Promise(r => $('#certCanvas').toBlob(r, 'image/png')) });
  }

  /* ---------- drawing the certificate: features/certificate/cert-draw.js (shared with the check page) ---------- */
  const drawCertificate = (cv, L, c) => CertDraw.letters(cv, L, c, { qr: CertRecord.onRecord(c.id) });
  const jpegToPdf = CertDraw.jpegToPdf;
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
  return { LEVELS, bank, keyOf, makeTest, jpegToPdf, drawCertificate, start, renderLevels, _state: () => S };
})();
