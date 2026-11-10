# Thirukkural (திருக்குறள் கற்போம்)

> Related: [FEATURES.md](FEATURES.md) · [CONTENT.md](CONTENT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [SEO.md](SEO.md)

The Thirukkural module teaches children all 1,330 Kurals. It is **its own page, `thirukkural.html`** (served at `/thirukkural`), with a 5-item menu: 📖 Learn · 🎮 Games · 🖨️ Print · 🎓 Certificate · 👪 Parents. It shares speech, rewards, per-child progress, settings, the child switcher and styles with the main app. The main app only links to it: a big **📜 திருக்குறள் கற்போம்** card on the home screen (the hero, not the letter tabs), and a 📜 card in the games hub.

## 1. What is where

| Part | File |
| --- | --- |
| The 1,330 couplets, 133 chapter names, இயல் and பால், G. U. Pope's English | `assets/js/data/thirukkural.json` (**built** by `tools/import-thirukkural.mjs`; fetched when `#/kural` opens) |
| Children's lessons: word meanings, simple Tamil and English meaning, real-life example, animated story, quiz, review status | `assets/js/data/kural-lessons.js` → `KURAL_LESSONS` |
| The three divisions with children's introductions | `assets/js/data/kural-lessons.js` → `KURAL_PAALS` |
| Recorded recitations (optional) | `KURAL_AUDIO` in the same file, files in `assets/audio/kural/` |
| Every word on screen | `assets/js/data/messages.js` → `TEXT.kural` |
| The page (hand-written, like `index.html`; marker blocks filled by the build) | `thirukkural.html` |
| Router, menu highlight, theme button (the page's `app.js`) | `assets/js/features/kural/kural-app.js` |
| Screens (dashboard, division, chapter, Kural, bookmarks, parents) | `assets/js/features/kural/kural.js` |
| 🖨️ Print: worksheets made in the browser for any chapter | `assets/js/features/kural/kural-print.js` |
| 🎓 Certificate: chapter tests and certificates (PDF via `CERT.jpegToPdf`) | `assets/js/features/kural/kural-cert.js` |
| Script list for the page | `KURAL_SCRIPTS` and `KURAL_DATA` in `tools/lib/assets.mjs` |
| Animated story player | `assets/js/features/kural/kural-scene.js` |
| Six games and the multiple-choice helper | `assets/js/features/kural/kural-games.js` |
| Styles (app and static pages) | `assets/css/84-kural.css` |
| Progress fields and milestone badges | `features/rewards/progress.js` (`kLearned`, `kMarks`, `kRight`, `kAsked`, `kDay`, `kDays`, `kBestDays`, `kDaily`, `kLast`; `kural10 … kural1330`), names in `data/rewards.js` |
| Generated parts | section 8c of `tools/build-pages.mjs` → the About text and JSON-LD inside `thirukkural.html`; `thirukkural-chapters.html`, `thirukkural-chapter-1.html` … `-133.html` |

### Routes

All on `thirukkural.html`: `#/` dashboard (plus the static About text) · `#/paal/1` a division · `#/ch/40` a chapter · `#/k/391` a Kural · `#/daily` Kural of the day · `#/marks` bookmarks · `#/games` and `#/games/<complete|match|arrange|story|listen>[/<chapter>]` · `#/print[/<chapter>]` · `#/certificate[/<chapter>]` · `#/parents`.

The page loads only what it needs (`KURAL_SCRIPTS`): the shared core, rewards, family dialogs, settings, `game-utils` (for `fb()`) and `certificate.js` (for its PDF writer), then its own files. The main app does not load any Thirukkural code or lessons.

## 2. The text: sources and checks

No couplet, chapter name or traditional meaning is generated. The text was assembled from public sources and checked three ways:

| Source | Licence | Used for |
| --- | --- | --- |
| [tk120404/thirukkural](https://github.com/tk120404/thirukkural) `thirukkural.json`, `detail.json` | Apache-2.0 | Line 1, line 2, Pope's translation (`couplet`), chapter/இயல்/பால் names |
| [Project Madurai](https://www.projectmadurai.org/) etext 0001 (Unicode) | Free to distribute with credit | Second copy of the couplets |
| [Tamil Wikisource](https://ta.wikisource.org/), *திருக்குறள் பரிமேலழகர் உரை* | CC BY-SA / public domain text | Third witness for every word |

**Not used:** the dataset's Tamil commentaries (`mv` Mu. Varadarajan, `sp` Solomon Pappaiah, `mk` Kalaignar) and its prose English (`explanation`, `Translation`). They are modern, copyrighted works or of unclear origin. Pope's 1886 verse translation is in the public domain.

**How the importer decides** (`tools/import-thirukkural.mjs`):

1. Where the two copies agree (ignoring spaces and punctuation), the dataset's text is used.
2. Where they differ, the Kural must be listed in `CORRECTIONS` with the reading to use and the evidence. Otherwise the import fails. 37 Kurals are listed. Most are a typo or an invalid Unicode code point in one copy.
3. Some errors were in **both** copies (for example 154 பொறையுடைமை, 360 இவைமூன்றன், 599 வெரூஉம், 650 இணரூழ்த்தும், 812 அறினொரூஉம், 1202 எனைத்தொன்று … இல்). They are corrected from Wikisource, so the two copies are not fully independent.
4. With `--ws`, every word of every Kural must appear in that chapter's Wikisource page. Sandhi may change a word's first and last letters (இலானடி → யிலானடி), so only the rest must match exactly. Words flagged only because Wikisource joins or splits them differently were read by hand and listed, with the reason, in `tools/thirukkural-ws-accepted.json`. This check found errors in 39 more Kurals that **both** copies shared, such as மனைக்தக்க, நல்வருந்து, குநழ்யும் and கெளவை typed with ெ + ள instead of ௌ. They are fixed in `WORD_FIXES`, each with its evidence.
   - **Limits:** words of one or two letters are not checked; a typo in a word's first or last letter can slip through; and a correct word in the wrong place still passes. Kural 290 had கள்வார்க்குத் where கள்ளார்க்குத் belongs, and 318 had ஏன்னாமை for இன்னாமை. Both were caught only by reading. A Tamil teacher's read-through of all 1,330 is still worth doing.
   - A second audit compared each word's last letter with Wikisource and skipped the usual sandhi changes. It found 98 சிறுமையுள், 445 சூழ்வாரைச், 529 தமராகித் and 738 நாட்டிற்கிவ் (fixed).
   - **Known variant readings kept (teacher, please confirm):** 738 நாட்டிற்கிவ் வைந்து (some modern copies: நாட்டிவ் வைந்து); 276 வன்கணார் (Wikisource: வண்கணார்); 720 தங்கணத்தார் (Wikisource poem: தங்கணத்தர்); 801 கிழமையைக் (Wikisource: கிழைமையைக்); 1140 word order "நகுப அறிவில்லார்" (Wikisource: "அறிவில்லார் நகுப").
5. It also rejects unassigned Tamil code points, unexpected characters, a count other than 1,330 / 133, and chapter ranges other than 10 Kurals each.

To rebuild the JSON, download the sources into an empty folder and run the command at the top of the importer. The JSON is committed; `npm run build` only reads it.

## 3. Children's lessons (the part that needs teachers)

`KURAL_LESSONS[n]` holds what we write for children. The fields are documented at the top of `kural-lessons.js`. Rules:

- **Simplify, never change** the traditional meaning. If you are unsure of the meaning, leave the Kural without a lesson.
- Every lesson starts as `review: 'draft'`. The app shows a small 📝 *draft* tag. A Tamil teacher reviews it, then sets `review: 'reviewed'`. The parents' screen counts reviewed lessons.
- **Story (`scene`):** 3–5 frames, each with its own picture of *this* Kural's meaning. Never reuse a generic scene. Actors are emoji placed in % of the stage. Motions are the `.ks-*` classes in `84-kural.css`. Backgrounds: `class`, `sky`, `sea`, `night`, `garden`, `path`, `home`.
- **Quiz:** store the right option at any index; options are shuffled on screen.
- Kurals without a lesson still get the original text, Pope's translation, audio, a two-question check made from the text itself (missing word, chapter) and every game except *Match the meaning* and *Identify the story*.

**Status today:** 30 Kurals have full lessons, all in **draft**: chapter 1 கடவுள் வாழ்த்து (1–10), chapter 10 இனியவை கூறல் (91–100) and chapter 40 கல்வி (391–400). The other 1,300 have text, translation, audio (device voice) and generated checks. The home screen's *Start here* row lists the chapters with lessons; give each new chapter a picture in `KURAL_CH_ICONS`.

**The guided lesson:** the couplet and its audio buttons stay at the top. Below, one step shows at a time: 📖 Words → 🌱 Meaning → 🎬 Story → 💡 Use it → ❓ Quiz, with a big *Next* button. Kurals without a lesson get 🌱 Meaning (Pope) → ❓ Quiz. Finishing the quiz marks the Kural as learned (+2 🪙, confetti) and offers the next Kural. *Continue* on the home screen opens the next unlearned Kural that has a lesson, then carries on in order.

### Suggested order for new lessons

அறத்துப்பால் first, in chapter order. Good early chapters for children: 2 வான்சிறப்பு, 8 அன்புடைமை, 10 இனியவை கூறல், 11 செய்ந்நன்றியறிதல், 40 கல்வி, 79 நட்பு. காமத்துப்பால் is shown with a "with a grown-up" note and is never used in games or the Kural of the day.

## 4. Behaviour worth knowing

- **Audio:** a recording from `KURAL_AUDIO` if there is one (🐢 plays it at 0.75×), otherwise the device's Tamil voice, line by line with the line highlighted. 🐢 lowers the voice rate for that sentence only. 🔁 *Say after me* reads a line, shows "இப்போது நீ சொல்!" and waits 4.5 s. Tap any word to hear it slowly.
- **Story player:** about 5 s per frame, longer if the narration is longer. English captions and narration can be switched on and off. With *less movement* on, actors appear without moving.
- **Kural of the day:** `(day number × 373) mod 1080 + 1`. It is the same for everyone and cycles through all 1,080 Kurals of அறம் and பொருள். Finishing its check gives +3 🪙 once a day.
- **Learned:** only the child's own **Mark as learned** tap (+2 🪙). A Kural streak (`kDays`) counts days with a Kural learned or a right Kural answer.
- **Games** draw from Kurals the child has learned, bookmarked, or the chapter in focus (at least chapter 1). Wrong answers get `Rewards.miss()` (soft sound, பரவாயில்லை), never a penalty.
- **Print:** pick a chapter and a sheet: (1) the 10 Kurals with the children's meaning (or Pope's translation); (2) copywork, where each line is printed, then shown light for tracing, then left blank to write; (3) missing word, with a word box and an answer key on a new page. The missing words use a fixed seed per chapter, so a sheet is the same every time. *Print* prints only the sheet; the browser can save it as PDF.
- **Level exams:** 10 levels in `KURAL_LEVELS` (data/kural-lessons.js), named like a growing plant: 🌱 விதை (1–10), 🌿 முளை (11–40), 🍀 தளிர் (41–100), 🪴 செடி (101–200), 🌳 மரம் (201–380, all of அறம்), 🌼 மலர் (381–500), 🍏 காய் (501–700), 🥭 கனி (701–900), 🏞️ சோலை (901–1080, all of பொருள்), 👑 குறள் வேந்தர் (1–1080 mixed, 15 questions, pass 12). Each level unlocks the next. Every 5 questions mix 3 *missing word*, 1 *next line* and 1 *which chapter*, all built from the verified text. Passing gives +20 🪙 and a certificate. Results: `Progress.d.kLevels`.
- **Chapter certificates:** for chapters 1–108 (not காமத்துப்பால்). Ten "missing word" questions, one per Kural, with wrong options from the same chapter. Eight right on the first try passes (+10 🪙 the first time). The certificate (name, chapter, its first Kural, date, score, ID) is drawn on a canvas and saved as PDF or PNG. Results: `Progress.d.kCerts`; name: `lt-cert-name`.
- **Privacy:** all of it is in `lt-progress` per child. Nothing is sent. The privacy page lists it.

## 5. Testing

`npm run check` covers it (`tools/smoke-test.mjs`):

- the dashboard loads 1,330 couplets, 133 chapters and 3 divisions;
- the division, chapter, first and last Kural screens open from the URL;
- every lesson is well formed;
- the story plays, and learning and bookmarks save per child;
- all milestone badges have rules;
- each game starts and accepts an answer;
- the games-hub card and the Kural of the day work;
- the static pages load;
- the SEO guard passes for all 135 new pages.

By hand, before a release: listen on a real phone (Android Chrome and iPhone Safari voices differ); try 🔁 *Say after me*; watch a story with narration; check dark mode and *less movement*.

## 6. Deployment

Nothing special: it is part of the static site. `npm run build` writes the 135 pages, the sitemap, `llms.txt`, `llms-full.txt` (all 1,330 Kurals as text) and the service worker. The service worker precaches `thirukkural.json` (~385 KB, ~115 KB gzipped) and the two guide pages; chapter pages load from the network. Ship only after the draft lessons have been reviewed (or set the ones you are not ready to publish aside).

## 7. Not built yet (roadmap)

| Asked for | Status | Next step |
| --- | --- | --- |
| Lessons, stories and quizzes for all 1,330 Kurals | 30 drafted (chapters 1, 10, 40) | Write chapter by chapter with a Tamil teacher; ~10 Kurals per review session |
| A unique animation for every Kural | Player done; 10 storyboards | Storyboards are data. Add one per lesson. For richer art later, an `svg` field per frame could hold illustrated scenes |
| Recorded recitation | Hook ready (`KURAL_AUDIO`); device voice for now | Record (or license) a recitation; check rights before publishing |
| Background music | Not added (no licensed track) | Add a royalty-free loop with a mute switch, off by default |
| Ready-made PDF worksheets on the printables page | In-browser sheets for every chapter | Add a few to `tools/build-printables.mjs` if teachers want downloadable files |
| Parent-controlled accounts / sync | Local only (by design) | Only if families ask; would need a privacy review |
