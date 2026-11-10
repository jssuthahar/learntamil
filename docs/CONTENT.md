# Content guide: every data file, field by field

All learning content and every word the app says to a child lives in `assets/js/data/`. These are plain JavaScript files of constants: no logic, no DOM. The browser loads them first, and the build tools load the same files in a Node VM (`tools/lib/load-data.mjs`), so one edit updates:

- the app,
- the guide pages, sitemap, `llms.txt` and `llms-full.txt` (`npm run build`),
- the printable PDFs (`npm run printables`),
- the certificate questions and the question games,
- the Ask Kili chat answers.

> **Every Tamil string must be checked by a Tamil teacher before publishing.** This site is used by children.

Load order (from `tools/lib/assets.mjs`): `alphabet → words → stories → rhymes → festivals → rewards → pictures → messages`. A file may refer to constants from files before it (for example, `rhymes.js` puts `AATHICHOODI` inside `RHYMES`).

---

## alphabet.js

### `PULLI`
The dot sign `்` that makes a pure consonant (க + ் = க்).

### `VOWELS`: the 12 uyir letters, in order
```js
{ l:'அ', s:'', r:'a', len:'குறில்', hint:'“a” as in “about”', ex:['👩','அம்மா','mother'] }
```
| Field | Meaning |
| --- | --- |
| `l` | the vowel letter |
| `s` | its vowel sign when joined to a consonant (`'ா'` for ஆ; empty for அ) |
| `r` | romanisation shown under the letter |
| `len` | `'குறில்'` (short) or `'நெடில்'` (long). Must equal `LETTER_LABELS.short/long` |
| `hint` | English pronunciation hint |
| `ex` | example `[emoji, word starting with the vowel, English]` |

### `CONS`: the 18 mei letters, in order
```js
{ c:'க', r:'k', g:'v', hint:'“k” as in “kite”', ex:['👅','நாக்கு','tongue'] }
```
`c` is the consonant **without** the pulli; `g` is the group key (`v` hard, `m` soft, `i` medium) from `GROUPS`; `ex` is a word that **contains** that mei.

### `GROUPS`
`{ v:{ta:'வல்லினம்', en:'Hard sounds'}, m:{…}, i:{…} }`

### `VOWEL_WORDS`
Extra picture words that start with each vowel (Spin wheel): `{'அ':[[emoji, word, english], …], …}`.

### `SIGN_TO_VOWEL`
Derived from `VOWELS`. Do not edit.

### `AYTHAM`
The special letter ஃ: `{ l, say, r, hint, ex }`. `say` is what the device voice reads, because ஃ has no sound on its own.

### `LETTER_LABELS`
Names shown with letters (உயிர் எழுத்து, மெய் எழுத்து …), `short`/`long`, and `part` (the small label under each letter in a word breakdown).

### `MEI_SAY_PREFIX`
`'இ'`. A pure consonant is read "ik" for க். Used by `spokenForm()`.

### `SOUND_GROUP`
Letters that sound alike (ந ன ண / ல ள ழ / ர ற). Listen & pick never offers two of them together.

### `FLOATING_LETTERS`
Decoration behind the home screen.

---

## words.js

### `WORDS`: picture words for Reading and Word builder
```js
['ஆடு','🐐','goat']        // [word, emoji, English]
```
- The reading level comes from the letter count: 2 → level 1, 3 → level 2, 4+ → level 3.
- Words of 2+ letters enter the spelling games automatically.

### `TOPICS`: word topics
```js
{ id:'animals', ic:'🦁', ta:'விலங்குகள்', en:'Animals', words:[ ['சிங்கம்','🦁','lion'], … ] }
```
- **The English meaning may have extra parts after ` · `.** Code uses the part before the first ` · ` as the short meaning. Some topics depend on the format:
  - `numbers`: `'one · 1 · ௧'` (meaning · digit · Tamil numeral). The numbers chart and the number questions read all three parts.
  - `months`: `'month 1 · mid-April to mid-May'`.
  - `opposites`: `'big · opposite of சிறிய'`. **List pairs next to each other**; the opposites chart and the "opposite of" question read `opposite of X`.
- **Topic ids used by code:** `numbers`, `colours`, `days`, `body`, `family`, `food` (certificate levels 6–7); `colours` (colouring palette, with `PAINT`); `opposites`, `months` (special questions); `animals`, `birds`, `food`, `vehicles`, `shapes` (sticker book); `animals`, `birds`, `food`, `vehicles`, `body` (Little ones themes). Don't rename an id without searching for it.
- **Guide pages** exist for most topics (`TOPIC_PAGES` in `tools/build-pages.mjs`).

---

## stories.js: `STORIES`
```js
{ id:'crow', title:'காகமும் பானையும்', en:'The Thirsty Crow', cover:'🐦', lvl:'Easy',
  pages:[ ['🐦☀️', 'ஒரு காகம் இருந்தது. …', 'There was a crow. …'], … ] }
```
- `pages`: `[picture, Tamil text, English meaning]`.
- The reader splits the Tamil into sentences at `. ! ?` and into words at spaces. Each word can be tapped, so use normal spacing.
- The **last page** is used as the moral in the stories guide FAQ.
- `id` is stored in each child's progress (finished stories), so **never change an existing id**.

---

## rhymes.js

### `AATHICHOODI`
`[line, English meaning]`, one for each vowel and ஃ, in order. Used by the rhyme reader, the line of the day, the Aathichoodi page, the poster PDF and `llms*.txt`. The line of the day skips index 7 and 12 (less suited to young children); see `features/stories/rhymes.js`.

### `RHYMES`
```js
{ id, ic, title, en, by, lines:[[Tamil line, English], …] }
```
`by` starting with `Traditional` means no author in the structured data. **Public domain only.**

---

## festivals.js: `FESTIVALS`
Same shape as a story, plus `words: [[word, emoji, english], …]`. Festival stories open in the story reader and count as finished stories.

---

## rewards.js

### `BADGES`
`{ id, ic, ta, en }`. **Every id needs a rule** with the same id in `BADGE_RULES` (`features/rewards/progress.js`). The smoke test checks this. Never change an existing id: earned badges are stored by id.

### `STAGES`
Kili's growth levels: `{ at: tokens needed, ic, ta, en }`, in increasing `at`.

### `CERT_LEVELS`
`{ n, ic, ta, en, title, titleEn, total?, pass? }`. `title` is printed on the certificate. The questions for level `n` are chosen in `LEVEL_QUESTIONS` in `features/certificate/certificate.js`. `total`/`pass` default to 10/8.

---

## pictures.js

### `PICTURES`
Colouring pictures: `{ w: Tamil word, e: emoji, en, svg }`.
- The SVG is drawn in a 200×200 viewBox.
- Parts with `class="cr"` can be coloured; `class="cl"` lines are only drawn.
- Order matters: later shapes are drawn on top.
- The same SVG is printed in the colouring-pages PDF.

### `PAINT`
Tamil colour name → hex. The names must match the `colours` topic.

---

## messages.js: `TEXT`

Everything the app says or shows to a child, other than the learning content. Most values are `[Tamil, English]`.

| Key | Where it appears |
| --- | --- |
| `hello`, `greet`, `greetName` | Kili when tapped; Today card greeting (`{name}`) |
| `congrats` | celebrations (spoken) |
| `praise`, `bigPraise`, `great`, `good` | after right answers; Rewards picks one at random |
| `tryAgain`, `noWorries` | after wrong answers (gentle) |
| `goalDone` (`{goal}`), `levelUp` (`{ta} {en} {n}`), `newBadge`, `myRewards`, `tokens` | rewards pop-ups and panel |
| `buildAsk`, `listenAsk` | Build a letter / Listen game prompts |
| `questionGames.{quiz,picture,topics,spell,story}` | question-game titles |
| `traceOffLine`, `traceScribble`, `traceKeepGoing` | tracing feedback |
| `readToMe`, `stop`, `sing`, `readStory` | story and rhyme buttons |
| `sayHelp`, `correctSound`, `myVoice` | Say it back dialog |
| `littleHello`, `littleThemes` | Little ones mode |
| `whoIsLearning`, `newSticker`, `stickerBook`, `breakTime`, `backToLearning` | family features |
| `certificate.{title,presented,level,date,id,name}` | printed on the PDF certificate |

**Adding a message:** add a key here, use `TEXT.key` in code, and keep placeholders named. The smoke test fails if a wrong key shows `undefined` on screen.

---

## Not in data/ (on purpose)

| Text | Lives in | Why |
| --- | --- | --- |
| Page headings and buttons in `index.html` | `index.html` | search engines read it without JavaScript |
| Certificate question templates ("Which letter comes after …?") | `features/certificate/certificate.js` | the sentence and the logic that fills it belong together |
| Grown-up screens: Parent dashboard, Ask Kili chat UI, support note, recorder | their feature files | parent-facing copy, mostly English |
| Guide pages, FAQs, privacy, printables wording | `tools/build-pages.mjs`, `tools/build-printables.mjs` | page templates |
