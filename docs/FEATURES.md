# Features: what each one does and where its code lives

Paths are relative to `assets/js/` unless they start with `/`. Text the child sees comes from `data/` (see `docs/CONTENT.md`).

## Sections (URL hash routes)

The router (`app.js`) shows one `<section class="panel">` at a time and fires `lt:section` with its id.

| Route | Section | Code |
| --- | --- | --- |
| `#/uyir` `#/mei` `#/aytham` `#/uyirmei` | the four letter tabs | `features/letters/letters.js` |
| `#/reading` | reading practice | `features/reading/reading.js` |
| `#/stories` | stories, rhymes, festivals | `features/stories/story-reader.js`, `features/stories/rhymes.js` |
| `#/practice` | games hub and every game | `features/games/*.js` |
| `#/certificate` | level tests and certificates | `features/certificate/certificate.js` |
| `#/little` | Little ones mode | `features/little/little.js` |
| `#/classroom` | Classroom with Malar Akka | `features/classroom/classroom.js` |

The **main menu** has exactly 5 items, the same on desktop and the phone bottom bar: 🔤 **Learn** (the letter tabs), 📖 **Read** (`#/reading` and `#/stories`, with a Words · Stories & rhymes switch at the top of both), 🎮 **Play** (games), 🖨️ **Print** (a link to `tamil-printables.html`) and 🎓 **Certificate**. `navOf()` / `lastOf()` in `app.js` map sections to menu items; Read reopens whichever of the two was open last. The phone bar fits exactly 5 items — don't add a 6th.

**Thirukkural** is a separate page, `thirukkural.html` (Learn · Games · Print · Certificate · Parents), linked by a big **📜 திருக்குறள் கற்போம்** card on the home screen and a card in the games hub. See [THIRUKKURAL.md](THIRUKKURAL.md).

The header also has 🪙 My rewards, ⚙️ Settings and the theme button. Below 440px the brand words are hidden (the அ mark stays) so the ⚙️ button fits.

---

## Letters (`features/letters/letters.js`)

- **Tiles for all 247 letters.** Tapping one plays its sound and shows it in the now-playing panel with romanisation, kind, hint and a picture word.
- **Vowel sound fallback.** If a vowel has no recording, the device voice says the letter and then its picture word ("ஒ … ஒட்டகம்"), because device voices are weak on a lone vowel. See `core/speech.js`.
- **Uyirmei table.** ▶ plays a whole row.
- **Build a letter.** Pick a consonant and a vowel; it shows க் + ஆ = கா.
- **Buttons under the big letter.** ✍️ Trace opens the tracing game on that letter; 🎤 Say it opens Say it back.
- **Kili the parrot** says hello when tapped. The letters float in the hero background.

## Speech (`core/speech.js`)

- **Recordings first.** It plays a recording from `/assets/audio/` if `/assets/audio/manifest.js` lists one; otherwise it uses the device's Tamil text-to-speech voice, choosing the best one available (Edge natural, then Google, then enhanced).
- **Chrome workarounds:** a short delay after `cancel()`, keeping a reference to the utterance so it isn't garbage-collected, and `resume()`.
- **No Tamil voice.** If the device has none, a notice explains how to install one (Android, Windows, iPhone/Mac).
- **Recording keys:** a letter's key is its code points in hex, for example கு → `0b95-0bc1`.

**Getting real recordings:**
- **Azure AI Speech:** `AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=… python3 /tools/generate_audio.py` (`--only vowels|problem`, `--voice ta-IN-ValluvarNeural`). It never replaces your own recordings without `--force`.
- **Record them yourself:** open `/record.html` (noindex), record the letters, then **Download audio.zip** and unzip it into `/assets/audio/`. Its code is `features/recorder/recorder.js`; recordings are kept in IndexedDB `lt-recorder` until downloaded.

## Reading (`features/reading/reading.js`)
- **Levels:** 1–3, by letter count. Or choose a word topic.
- **Per word:** read it yourself, 🐢 letter by letter, 🔊 whole word, then ❓ show the picture.
- **Rewards:** "⭐ I read it" gives a token. 🎤 opens Say it back for the word.

## Stories, rhymes, festivals

**Stories** (`features/stories/story-reader.js`)
- **Reader:** one page at a time. Read aloud with words highlighted as they are spoken (speech `onboundary`).
- **Word breakdown:** tap a word to hear it and see its letters (`க் + அ`).
- **Options:** English meaning on/off, auto page turn.
- **Rewards:** finishing a story gives tokens and counts toward badges.

**Rhymes, Aathichoodi and festivals** (`features/stories/rhymes.js`)
- **Switch:** the Stories · Rhymes · Festivals control at the top of the Stories section.
- **Rhymes:** the reader highlights each line's words while singing; tap a word for its breakdown. Finishing a rhyme gives a token.
- **Festivals:** cards with tappable words; "Read the story" opens the festival in the story reader.
- **Line of the day:** the same Aathichoodi line for everyone on a given date, on the Today card.

## Games (`features/games/`)

The hub (`hub.js`) resets the score, shows the panel and fires `lt:game`. Every right answer goes through `Rewards.win` (points, a token, praise, sound); every wrong one through `Rewards.miss` (a soft sound, and the streak resets).

| Card | `data-game` | File | What the child does |
| --- | --- | --- | --- |
| க் + ஆ = ? | `build` | `letter-quiz.js` | pick the letter a consonant + vowel make |
| Listen | `listen` | `letter-quiz.js` | hear a letter, tap it; sound-alike letters are never together |
| Spin wheel | `spin` | `spin-wheel.js` | spin to a vowel, pick the picture that starts with it; remembered per child |
| Balloon pop | `balloon` | `balloon-pop.js` | 40 s, pop balloons with the target letter |
| Word builder | `words` | `word-builder.js` | tap letters in order to build a picture word |
| Memory | `memory` | `memory.js` | match 6 vowels with their picture words |
| Tamil quiz / Picture words / Topics / Spelling / Sentences | `quiz` `picture` `topics` `spell` `story` | `question-games.js` | multiple-choice questions from the certificate generators; no repeats until all have been asked |
| Trace | `trace` | `trace.js` | trace a faint letter with a finger: ≥75% covered, ≤35% of ink off the letter, ink ≤ 2× the letter area |
| Colouring | `colour` | `colouring.js` | tap a colour (its Tamil name is spoken), fill the picture's parts; finishing says the word |
| Little ones | `little` | → `#/little` | opens Little ones mode |
| Classroom | `classroom` | → `#/classroom` | opens the Classroom |

## Age groups and learning paths (`features/rewards/path.js`)
- **Age cards on the home page:** 👶 3–5, 🧒 6–8, 🧑‍🎓 9–12. The choice is saved on the child's profile (`Profiles.update(id, { age })`, in `lt-profiles`). The first tap on 3–5 opens Little ones; the others open the path.
- **Learning path dialog:** the lessons for that age, in order, with ✓ for done and a **Next ▶** / **Go** button that opens the activity. Names, order and links: `AGE_GROUPS` and `LESSONS` in `data/rewards.js`; when a lesson counts as done: `LESSON_RULES` in `features/rewards/progress.js` (computed from saved progress, so nothing extra is stored). `go` is `#/section`, `game:<id>` or `rhymes`.
- **Where it shows:** the 🗺️ button on the Today card (with "Next: …"), a stat in My rewards, and the Parent dashboard. Finishing a whole path earns the 🗺️ badge.

## Little ones mode (`features/little/little.js`, `#/little`)
- **For ages 3–5:** pictures only, no English, big buttons, and sounds play by themselves.
- **Two modes:** 👀 look & listen, and 🎯 find it.
- **Themes:** animals, birds, food, vehicles, body, vowels.
- **No buzzer:** a wrong tap makes the right picture wiggle and says its word again.

## Classroom (`features/classroom/`, `#/classroom`)
- **Who:** Malar Akka (teacher) and three classmates, Nila, Kavin and Yazhini. They are inline SVG in `characters.js`, with named parts (arms, eyes, mouth, head) that CSS moves. The `talk`, `wave`, `point`, `open`, `happy`, `raise` and `cheer` states are classes on `.cr-char`.
- **Layout:** the teacher, a speech bubble, the chalkboard and the classmates sit in a grid. The characters never cover the board or the navigation. On phones the Ask Kili button is hidden here.
- **Lessons:** 4 vowel groups (3 vowels each, from `uyir`) and 9 word topics (3 random words from `TOPICS`). Each lesson goes: greeting → each item on the board (a classmate asks, the teacher explains, "say it again", everyone repeats, "your turn" pause) → three game rounds on the board → praise and thank-you.
- **Games** (`CR_GAMES`, all built on `crQuiz`): 🎯 `find` (where is it? always first), 📖 `read` (only the written word, or for vowels the letter, is shown, so the child picks the picture without hearing it), 🔍 `missing` (look, close your eyes, one picture goes, find it among two new ones from the same set) and 👍👎 `truth` (a classmate names the picture, sometimes wrongly; the child says சரி or தவறு). Each lesson plays `find` plus two of the others. **More games** on the end screen plays three new rounds with the same items. Decoys come from the lesson's `pool()`.
- **Voices:** every line is spoken with `speak()`. The children use a higher `pitch` (the third argument of `speak`). Letters use `sayItem`, so recordings are used when they exist. Again (🔁), Next (⏭️) and Lessons (📚) control the flow. A safety timer moves on if a browser never reports the end of speech.
- **Kindness:** a wrong tap gives the soft miss sound, and a classmate says "பரவாயில்லை! இதோ, இங்கே இருக்கிறது." while the right card glows. Nothing is recorded.
- **Saved:** `classroom` (lessons finished) and `classroomDone` (lesson ids, shown as ✓ on the board) in `lt-progress`. Vowels taught count as letters heard. All text is in `TEXT.classroom`.

## Say it back (`features/voice/say-back.js`)
- **Flow:** it plays the correct sound, the child taps 🎤 and records up to 4 s, then hears their own voice; 🔁 plays both.
- **Privacy:** `MediaRecorder` in memory only, revoked on close. **Never uploaded or saved.** There is no speech recognition.
- **Entry points:** under the big letter, in Reading and on the trace board.

## Certificates (`features/certificate/certificate.js`)
- **Levels:** 10, from vowels up to Tamil champion. Names in `data/rewards.js` → `CERT_LEVELS`; questions in `LEVEL_QUESTIONS`.
- **Passing:** 8 of 10 (level 10: 12 of 15). Each level unlocks the next.
- **No repeats:** questions already asked are remembered per child (`lt-cert-seen`).
- **The certificate:** drawn on a canvas, so Tamil is shaped correctly, then turned into a PDF by a tiny built-in writer. No library, and it works offline.
- **One ID per level:** retaking a passed level keeps its certificate ID (the name and score can change).
- **Parent's details and the certificate record** (`cert-record.js`, website only, never in the Google Play app): before a certificate is made, a parent or guardian gives the child's name, their email and phone (with country code) and ticks consent. Valid details are remembered on the device (`lt-parent-contact`) and shown as "Saved · Change" next time. After the certificate is drawn, one Cloud Firestore document per certificate ID is created (`services/firebase.js` → `window.ltCertStore`, rules in `firestore.rules`: create once, no reads, only `sharingStatus` can change). Already-stored IDs are in `lt-cert-sent`; failures and offline saves wait in `lt-cert-outbox` and are retried when online. The child always gets the certificate. Text in `TEXT.certificate.contact`; the privacy page explains it under `#certificates`.
- **Celebration and sharing** (`cert-share.js`, also used by the Thirukkural certificates): a 🎉 card under every new certificate ("Another milestone!" once the child already has one). The share options (device share sheet with the image, WhatsApp, Facebook, LinkedIn, Instagram steps, copy message, save image) sit behind the same 3-second press-and-hold as the Parent dashboard. Messages and links never contain the child's name; nothing is sent by the app. Text in `TEXT.certificate.celebrate`.
- **Also used by games:** `CERT.bank` holds the question generators the question games use.

## Rewards and motivation (`features/rewards/`)

| What | Rule |
| --- | --- |
| Tokens 🪙 | +1 per right answer, +5 for a big win, +1 bonus on every 3-in-a-row, +5 per new story, +10 per badge, +10 for the daily goal, +20 for a certificate passed the first time |
| Badges 🏅 | 30 in `data/rewards.js`; rules in `BADGE_RULES` (`progress.js`) |
| Kili grows | `STAGES`: egg → … → royal parrot, by tokens ever earned (`today.js`) |
| Daily goal | 10 things learned today (`GOAL`) |
| Daily gift 🎁 | on the Today card; opens once a day after the first thing learned; gives 2 + day streak tokens (max 10). Missing a day never takes anything away. `giftDay`, `gifts` in progress |
| Day streak | consecutive days with any activity |
| Letter of the day | same letter for everyone on a date (hash of the date) |
| Score | per game, best score per child (`lt-best-<game>`) |

The 🪙 button in the header opens **My rewards** (stats, badges, reset, and links to the learning path, stickers and the Parent dashboard).

## Family (`features/family/`, `core/profiles.js`)

| Feature | Details |
| --- | --- |
| Child profiles | Up to 6. The first child uses the plain keys; others use `key@<id>`. Switching reloads the page. Switch from the animal button on the Today card. |
| Sticker book 📒 | one sticker per 10 tokens ever, from the animals, birds, food, vehicles and shapes topics and the picture words; a toast when a new one unlocks |
| Parent dashboard 👪 | opens after a 3-second press-and-hold; age group picker, learning path with ticks and **Suggested next** buttons, minutes for the last 7 days, stats (badges, daily gifts, tokens), letters missed most often (Listen and Build games), child management, break reminder, link to ⚙️ Settings |
| Settings ⚙️ (`features/family/settings.js`) | header button. Text size (Normal / Large / Extra large), high contrast, less movement, game sounds, voice speed and voice volume. Device-wide: `lt-text`, `lt-contrast`, `lt-motion`, `lt-sfx`, `lt-rate`, `lt-vol`. The inline script in `<head>` (index.html and every guide page) puts text/contrast/motion on `<html data-…>` before the first paint; CSS is in `90-kids.css` → "Accessibility". Larger text uses CSS `zoom` on the reading areas, never on the trace/colouring canvases (zoom would move their touch points). |
| Break reminder ⏰ | off by default; every 15/20/30/45 min of visible time it shows a 1-minute rest screen (`lt-break`, device-wide) |

## PWA and offline (`services/pwa.js`, `/sw.js`)
- **Install:** an "Install app" button where supported, and an iOS "Add to Home Screen" tip.
- **Offline:** the service worker precaches every page and asset. `PRECACHE` and `VERSION` are generated by `npm run build`. Letter audio is cached separately (`lt-audio`) and kept across versions.
- **Updates:** a new `VERSION` → the "A new version is ready · Refresh" toast.
- **Shortcuts:** `/manifest.webmanifest` has long-press shortcuts (Letters, Reading, Stories, Games, Certificate, Printables).

## Services shared by every page
- **Firebase** (`services/firebase.js`). Nothing loads until a grown-up taps **Allow** on the cookie notice (`lt-consent`).
  - **Analytics:** with advertising features off, and nothing a child types is sent. Events go through `logEv()` (`core/analytics.js`), queued until Firebase loads.
  - **Reminders (push):** only after a parent taps "Turn on reminders" (`lt-push`). Notifications are sent from the Firebase console.
  - **Learning around the world:** visit counts and live presence in the Realtime Database, country and city only. Rules are in `/database.rules.json` and allow only `+1` increments; deploy them with `firebase deploy --only database`.
  - **App Check** (reCAPTCHA Enterprise) is optional; there is a key slot in the file.
- **Ask Kili chat** (`services/chat.js`). It answers from `data/faq.js` (generated from every FAQ on the site plus the `HELP` list in `tools/build-pages.mjs`). Matching happens in the browser; no AI service, nothing is sent.
- **Support note** (`services/support.js`). A gentle "Buy me a coffee" note: never on a first visit, it rests 7/60/120 days after each choice, and it is a plain link with no third-party script.

## Static pages and printables (generated)
- **24 guide pages, privacy, terms and 404:** built by `/tools/build-pages.mjs`. See `docs/SEO.md`.
- **23 PDFs (53 pages):** built by `/tools/build-printables.mjs`, in five groups: letters, words, tracing, activity, colouring. The printables page groups them by type. They are promoted in the menu, the phone header, a home chip, in-app cards, a guide-page header button and an app shortcut.

## Storage keys (localStorage unless noted)

| Key | Scope | Holds |
| --- | --- | --- |
| `lt-progress` | per child | tokens, badges, letters heard, stories, traced, minutes, misses, stickers, streaks, certificates, Little ones finds, Classroom lessons, daily gifts |
| `lt-best-<game>` | per child | best score |
| `lt-cert-name`, `lt-cert-seen` | per child | name for the certificate; questions already asked |
| `lt-spin-seen` | per child | spin-wheel memory |
| `lt-profiles`, `lt-profile` | device | the children (name, picture, age group); who is learning now |
| `lt-theme`, `lt-sfx`, `lt-break` | device | theme, sound on/off, break reminder |
| `lt-text`, `lt-contrast`, `lt-motion`, `lt-rate`, `lt-vol` | device | ⚙️ Settings: text size, high contrast, less movement, voice speed, voice volume |
| `lt-consent`, `lt-push` | device | cookie choice, push token |
| `lt-support`, `lt-installed`, `lt-ios-hint` | device | support note timing, install state |
| `lt-notice`, `lt-counted`, `lt-sid`, `lt-geo`, `lt-located` | session (sessionStorage) | notice closed, visit counted, live session id, approximate town for the world map |
| IndexedDB `lt-recorder` | device | recordings in `/record.html` until downloaded |
