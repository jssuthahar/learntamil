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

  const LEVELS = [
    { n: 1, ic: '🌱', ta: 'உயிர் எழுத்துகள்', en: 'Tamil vowels', title: 'தொடக்க நிலை', titleEn: 'Starter', gen: [qVowelPic, qVowelRoman, qVowelLength, qVowelNext] },
    { n: 2, ic: '🧱', ta: 'மெய் எழுத்துகள்', en: 'Tamil consonants', title: 'அடிப்படை நிலை', titleEn: 'Beginner', gen: [qMeiRoman, qMeiGroup, qMeiInWord, qMeiNext] },
    { n: 3, ic: '🧩', ta: 'உயிர்மெய் எழுத்துகள்', en: 'Uyirmei letters', title: 'வளர்ச்சி நிலை', titleEn: 'Explorer', gen: [qUmBuild, qUmSplit, qUmLength, qUmRoman] },
    { n: 4, ic: '📖', ta: 'சொற்கள் படித்தல்', en: 'Reading words', title: 'வாசிப்பு நிலை', titleEn: 'Reader', gen: [qWordPic, qWordMeaning, qWordCount, qWordFirst] },
    { n: 5, ic: '👑', ta: 'தமிழ் எழுத்து வல்லுநர்', en: 'Tamil alphabet master', title: 'சிறப்பு நிலை', titleEn: 'Master',
      gen: [qFact, qFact, qVowelLength, qMeiGroup, qMeiInWord, qUmSplit, qUmLength, qWordCount, qWordFirst, qWordMeaning] },
    { n: 6, ic: '🔢', ta: 'எண்கள், நிறங்கள், கிழமைகள்', en: 'Numbers, colours and days', title: 'சொல் நிலை', titleEn: 'Word Explorer',
      gen: [qNumWord, qNumMeaning, qNumTamilDigit, qColourPic, qColourMeaning, qDayNext, qDayBefore, qDayMeaning] },
    { n: 7, ic: '🏡', ta: 'குடும்பம், உடல், உணவு', en: 'Family, body and food', title: 'அன்றாடச் சொல் நிலை', titleEn: 'Everyday Words',
      gen: [topicPic('body'), topicMeaning('body'), topicPic('family'), topicMeaning('family'), topicPic('food'), topicMeaning('food')] },
    { n: 8, ic: '✏️', ta: 'எழுத்துக்கூட்டல்', en: 'Spelling words', title: 'எழுத்துக்கூட்டல் நிலை', titleEn: 'Speller', gen: [qMissing, qJoin, qUnscramble, qLast] },
    { n: 9, ic: '📚', ta: 'வாக்கியம் படித்தல்', en: 'Reading sentences', title: 'வாசிப்புத் திறன் நிலை', titleEn: 'Story Reader',
      gen: [qSentMeaning, qSentPick, qSentWho, qStoryTitle, qSentMeaning, qSentPick] },
    { n: 10, ic: '🏆', ta: 'தமிழ்ச் சாதனையாளர்', en: 'Tamil champion', title: 'சாதனை நிலை', titleEn: 'Champion', total: 15, pass: 12,
      gen: [qFact, qVowelRoman, qMeiRoman, qUmRoman, qUmSplit, qWordMeaning, qNumTamilDigit, qDayNext, topicMeaning('family'), topicPic('food'),
        qMissing, qUnscramble, qJoin, qSentMeaning, qSentPick] }
  ];
  const tot = L => L.total || TOTAL, need = L => L.pass || PASS;

  /* Question banks for the practice games (games.js) — same generators, endless play. */
  const bank = {
    letters: [qVowelPic, qVowelRoman, qVowelLength, qVowelNext, qMeiRoman, qMeiGroup, qMeiInWord, qMeiNext, qUmBuild, qUmSplit, qUmLength, qUmRoman],
    picture: [qWordPic, qWordMeaning, qColourPic, topicPic('body'), topicPic('family'), topicPic('food')],
    topics: [qNumWord, qNumMeaning, qNumTamilDigit, qColourMeaning, qDayNext, qDayBefore, qDayMeaning, topicMeaning('body'), topicMeaning('family'), topicMeaning('food')],
    spell: [qMissing, qJoin, qUnscramble, qLast, qWordCount, qWordFirst],
    story: [qSentMeaning, qSentPick, qSentWho, qStoryTitle],
    facts: FACTS
  };
  bank.quiz = [...new Set(Object.values(bank).flat())];

  /* ---------- no repeats: remember recently asked questions per level (this device only) ---------- */
  const keyOf = q => q.q + '|' + (q.opts.find(o => o.ok) || {}).label;
  const SEEN_KEY = 'lt-cert-seen';
  const loadSeen = () => { try { return JSON.parse(localStorage.getItem(SEEN_KEY)) || {}; } catch (e) { return {}; } };
  const saveSeen = (n, keys) => { const all = loadSeen(); all[n] = keys.slice(-150);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(all)); } catch (e) {} };

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
      $('#cqFb').innerHTML = `<span class="ok">✓ ${pick(['அருமை!', 'நன்று!', 'சரியான விடை!'])}</span> <small>${q.explain}</small>`; }
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
      box.innerHTML = `<div class="cr-emo" aria-hidden="true">💪</div><h3><span class="ta">பரவாயில்லை!</span> Keep practising</h3>
        <p class="cr-score">${S.right}/${N} <small>(${pct}%)</small></p><p>You need ${need(L)} out of ${N} to pass. Practise in the app and try again!</p>
        <div class="cr-btns"><button class="btn primary" id="crRetry">↻ Try again</button><button class="btn" id="crBack">← All levels</button></div>`;
      $('#crRetry').onclick = () => start(L.n); $('#crBack').onclick = renderLevels;
      return;
    }
    Rewards.sfx.win(); confetti(); setTimeout(() => speak('வாழ்த்துகள்!'), 500); logEv('certificate_earned', { level: L.n });
    let lastName = ''; try { lastName = localStorage.getItem('lt-cert-name') || ''; } catch (e) {}
    box.innerHTML = `<div class="cr-emo" aria-hidden="true">🎓</div><h3><span class="ta">வாழ்த்துகள்!</span> You passed Level ${L.n}</h3>
      <p class="cr-score">${S.right}/${N} <small>(${pct}%)</small></p>
      <form class="cr-form" id="crForm"><label for="crName">Name for the certificate · <span class="ta">பெயர்</span></label>
        <div class="cr-row"><input id="crName" maxlength="40" autocomplete="off" required placeholder="e.g. Kavin" value="${escapeAttr(lastName)}">
        <button class="btn primary" type="submit">🎓 Make my certificate</button></div>
        <small class="muted">The name stays on this device only.</small></form>`;
    $('#crForm').onsubmit = e => {
      e.preventDefault();
      const name = $('#crName').value.replace(/\s+/g, ' ').trim().slice(0, 40); if (!name) return;
      try { localStorage.setItem('lt-cert-name', name); } catch (er) {}
      const prev = certs()[L.n];
      const c = { name, score: Math.max(S.right, prev ? prev.score : 0), total: tot(L), date: new Date().toISOString().slice(0, 10),
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
    fitText(g, `${L.ic}  நிலை ${L.n} · ${L.ta}`, W / 2, 1050, W - 500, 82, '800', kid, '#1769d1');
    fitText(g, `${L.title} · Level ${L.n} ${L.titleEn} — ${L.en}`, W / 2, 1150, W - 500, 50, '700', kid, '#e0480c');
    // score pill
    const outOf = c.total || tot(L), pill = `Score ${c.score}/${outOf}  ·  ${Math.round(c.score / outOf * 100)}%`;
    g.font = `800 44px ${ui}`; const pw = g.measureText(pill).width + 90;
    g.fillStyle = '#fff3c4'; roundRect(g, W / 2 - pw / 2, 1205, pw, 84, 42); g.fill();
    g.fillStyle = '#7a5600'; g.fillText(pill, W / 2, 1249);
    // footer: date, medal, certificate ID (no signature)
    const date = new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    g.fillStyle = '#0b1020'; g.font = `700 40px ${ui}`; g.fillText(date, 560, 1395); g.fillText(c.id, W - 560, 1395);
    g.fillStyle = '#4a5163'; g.font = `500 32px ${ui}`; g.fillText('Date · தேதி', 560, 1450); g.fillText('Certificate ID · சான்றிதழ் எண்', W - 560, 1450);
    g.font = `190px ${ui}`; g.fillText('🏅', W / 2, 1400);
    g.fillStyle = '#6b7385'; g.font = `500 28px ${ui}`;
    g.fillText('Learn Tamil · MSDEVBUILD  ·  jssuthahar.github.io/learntamil  ·  A practice certificate for encouragement, not an official qualification', W / 2, H - 150);
  }
  function fitText(g, text, x, y, maxW, size, weight, family, color){
    g.font = `${weight} ${size}px ${family}`;
    while (g.measureText(text).width > maxW && size > 24){ size -= 2; g.font = `${weight} ${size}px ${family}`; }
    g.fillStyle = color; g.fillText(text, x, y);
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
  return { LEVELS, bank, keyOf, makeTest, jpegToPdf, drawCertificate, start, renderLevels, _state: () => S };
})();
