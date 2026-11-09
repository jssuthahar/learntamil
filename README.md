# Learn Tamil · தமிழ் கற்போம்

A free, mobile-friendly website for children and beginners to learn the 247 Tamil letters, read simple words and stories, and practise with games. By MSDEVBUILD.

## What's inside

| Section | What it does |
| --- | --- |
| **எழுத்துகள் · Letters** | 12 உயிர், 18 மெய், ஆய்தம், 216 உயிர்மெய் — tap to hear, picture words, build-a-letter |
| **வாசிப்பு · Reading** | 46 picture words in 3 levels; sound out letter by letter, then reveal the picture |
| **கதைகள் · Stories** | 5 read-aloud stories, sing-along rhymes and Aathichoodi, and 4 festival stories — with word-tap letter breakdown and English meaning |
| **விளையாட்டு · Games** | Build a letter, Listen & pick, Spin wheel, Balloon pop, Word builder, Memory, Tamil quiz, Picture words, Topics, Spelling, Sentences, Trace, Colouring, Little ones — question games never repeat a question until all have been asked |

## Project layout

```text
index.html          page markup
record.html         letter recorder (make real audio for each letter)
css/styles.css      site styles (light/dark, phone layout)
css/record.css      recorder styles
js/profiles.js      child profiles: per-child localStorage keys (loaded first)
js/data.js          letters, words, stories, topics, rhymes, festivals (all Tamil text lives here)
js/app.js           letters, stories, speech, navigation
js/games.js         reading practice and games
js/trace.js         ✍️ trace a letter and 🎨 colouring
js/voice.js         🎤 say it back (record and compare)
js/rhymes.js        🎵 rhymes, 🌺 Aathichoodi, 🪔 festivals
js/little.js        👶 little ones mode
js/family.js        📒 stickers, 👪 parent corner, ⏰ break reminder, profile switcher
js/record.js        recorder logic
audio/manifest.js   list of recorded letter sounds (created by record.html)
```

No build step and no server code — plain HTML, CSS and JavaScript.

## Letter sounds

Device text-to-speech voices do not pronounce single letters reliably (for example short and long vowels come out the same length). Until a letter has an audio file, vowels play the letter and then their picture word (ஒ … ஒட்டகம்). For correct single-letter sounds, add audio files in one of two ways:

### A. Generate all 247 with Azure AI Speech (recommended)

```bash
export AZURE_SPEECH_KEY=<key>          # Azure portal → Speech resource → Keys and Endpoint
export AZURE_SPEECH_REGION=<region>    # e.g. centralindia
python3 tools/generate_audio.py        # or: --only vowels / --only problem
```

This writes `audio/*.mp3` and `audio/manifest.js` using the neural voice `ta-IN-PallaviNeural` (try `--voice ta-IN-ValluvarNeural` for a male voice). It never replaces your own recordings unless you pass `--force`. Listen to every letter before publishing.

### B. Record them yourself

1. Open `record.html`, record the letters (start with **Problem letters**).
2. Press **Download audio.zip** and unzip it into the `audio/` folder.
3. Commit the `audio/` folder. The site plays your recordings automatically and falls back to the device voice for any letter not recorded.

## Hosting on GitHub Pages

1. Push this repository to GitHub.
2. Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
3. Add your domain in Settings → Pages → Custom domain (this repo uses `CNAME` → `learntamil.msdevbuild.com`) and tick **Enforce HTTPS**. Set `SITE` in `tools/build-pages.mjs` to the same domain.

## Static pages, SEO and AEO

`tamil-alphabet.html`, `privacy.html`, `terms.html`, `404.html`, `sitemap.xml` and the FAQ/footer inside `index.html` are generated from `js/data.js` so every letter is readable without JavaScript (for search engines and AI answer engines). After editing `js/data.js` or `tools/build-pages.mjs`, run:

```bash
node tools/build-pages.mjs
```

The site address is set once in `tools/build-pages.mjs` (`SITE`). If you move to a custom domain, change it there, in `index.html` (canonical, Open Graph, JSON-LD), `robots.txt` and `llms.txt`, then rebuild.

After publishing:

1. Add the site to [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters) and submit `sitemap.xml`.
2. Link to the site from blog.msdevbuild.com and your profiles. Links from trusted pages matter most for ranking.
3. Check structured data with the [Rich Results Test](https://search.google.com/test/rich-results).

## Rewards and certificates

- **Games** give an appreciation chime, a celebration pop-up with spoken praise (அருமை!, நன்று! …), points (+10, +5 bonus for 3 in a row) and a scoreboard with streak and best score. Sounds are generated in the browser (Web Audio) and can be muted with 🔊.
- **Tokens 🪙 and 24 badges 🏅** are saved on the device (`localStorage`); tap 🪙 in the header to see *My rewards*.
- **Certificates 🎓**: ten level tests (vowels → consonants → uyirmei → reading words → alphabet master → numbers, colours and days → family, body and food → spelling → reading sentences → Tamil champion). Levels 1–9 have 10 questions (pass with 8); the Champion level has 15 (pass with 12). Questions are generated from `js/data.js`, so answers are always correct, and the questions already asked are remembered on the device (`lt-cert-seen`) so a retake gets different questions. The certificate has no signature; it shows the date and a certificate ID. It is drawn on a canvas (so Tamil renders correctly) and saved as a PDF by a small built-in writer in `js/cert.js`, with no external library, so it works offline. Certificates are for encouragement and are not an official qualification.

## Motivation features

- **Today card** on the home screen: greets the child by name, shows Kili's level, the daily goal ring (learn 10 things), the day streak 🔥 and a **Letter of the day**.
- **Kili grows** with every token: 🥚 முட்டை → 🐣 குஞ்சு → 🐥 சிறு பறவை → 🦜 கிளி → 🌟 நட்சத்திரக் கிளி → 👑 அரசக் கிளி, with a level-up celebration.
- **Word topics** in Reading: numbers 1–10, colours, days, body, family, fruits & food (data in `js/data.js` → `TOPICS`).

## Kids features

- **✍️ Trace** (Games → Trace, or ✍️ under the big letter): the letter is drawn faintly on a board and the child traces it with a finger, mouse or pen. It counts when about 75% of the letter is covered, most of the ink stays on the letter and the child hasn't simply scribbled over it. There is no stroke-order data, so it checks the shape, not the order of strokes. Code: `js/trace.js`.
- **🎤 Say it back** (under the big letter and in Reading): hear the right sound, record yourself (up to 4 seconds) and play both to compare. The recording is kept only in memory and thrown away when the window closes; there is no speech recognition and nothing is uploaded. Code: `js/voice.js`.
- **🎵 Rhymes and 🌺 Aathichoodi** (Stories → Rhymes): நிலா நிலா ஓடி வா (traditional), Bharathiyar's ஓடி விளையாடு பாப்பா and Avvaiyar's ஆத்திசூடி (one line for each vowel and ஃ), all public domain. Each word lights up as it is sung. An Aathichoodi *line of the day* is on the Today card. Data: `RHYMES` and `AATHICHOODI` in `js/data.js`.
- **🪔 Festivals** (Stories → Festivals): Pongal, Tamil New Year, Deepavali and Karthigai Deepam, each with a short read-aloud story and its words (`FESTIVALS` in `js/data.js`).
- **🎨 Colouring** (Games → Colouring): six line pictures; picking a colour says its Tamil name; colouring the whole picture says the picture's word.
- **👶 Little ones** (`#/little`, ages 3–5): pictures only, big buttons, sounds play by themselves and there's no wrong-answer buzzer. *Look & listen* and *Find it* modes. Code: `js/little.js`.
- **More word topics**: animals, birds, vehicles, shapes, opposites and the 12 Tamil months. They appear in Reading → Topics, the Topics and Picture words games, spelling, and the sticker book.
- **👧👦 Child profiles**: up to 6 children per device. The first child keeps the original `localStorage` keys, so existing progress is kept, and other children's keys end in `@<id>` (`js/profiles.js`). Switch child with the animal button on the Today card.
- **📒 Sticker book**: one new picture sticker for every 10 tokens earned.
- **👪 Parent corner** (press and hold for 3 seconds): minutes per day for the last 7 days, letters heard and traced, stories, rhymes, certificates, the letters missed most often in the Listen and Build games, child management and an optional **⏰ break reminder** (every 15–45 minutes, with a one-minute pause screen). Code: `js/family.js`.

New Tamil text (topics, rhymes, Aathichoodi meanings, festival stories) should be checked by a Tamil teacher before publishing.

## Printable PDFs

`node tools/build-printables.mjs` creates the free charts and tracing worksheets in `printables/` (and previews in `assets/printables/`) using headless Chrome, so Tamil text prints correctly. Run it after changing letters or topics, then run `node tools/build-pages.mjs`.

## Install as an app (PWA) and offline use

Learn Tamil is a Progressive Web App:

- **Android / Chrome / Edge:** an **Install app** button appears in the header; the app gets a home-screen icon, opens full screen and has shortcuts (long-press the icon) to Letters, Reading, Stories and Games.
- **iPhone / iPad:** Safari shows a one-time tip — tap **Share → Add to Home Screen**.
- **Offline:** after the first visit, letters, reading, stories, games, the alphabet chart and all letter audio work without internet. (Spoken sound for letters without audio files depends on the device's voice; offline voices work, online voices need internet.)
- **Updates:** when a new version is published, users see *“A new version is ready · Refresh”*.

`sw.js` is the service worker. **Always run `node tools/build-pages.mjs` before publishing** — it stamps a new version into `sw.js` so installed apps pick up your changes. If you add a new page, script or stylesheet, add it to `PRECACHE` in `sw.js`.

### Publishing to app stores (optional)

The same site can be packaged for stores with [PWABuilder](https://www.pwabuilder.com/) — enter the site URL to generate a Google Play package (Trusted Web Activity), a Microsoft Store package, or an iOS project. For Google Play you must also publish `/.well-known/assetlinks.json`, which needs a custom domain (it must sit at the domain root).

## Support the project

Learn Tamil is free, with no ads. If it helps your family or classroom, you can support it at **<https://buymeacoffee.com/jssuthahar>** ☕. The site only links there; it loads no Buy Me a Coffee script.

## Report an issue or give feedback

Found a wrong sound, a Tamil mistake or a bug, or have an idea? Please open an issue: **<https://github.com/jssuthahar/learntamil/issues>**. There are short forms for *Wrong sound or Tamil mistake*, *Bug report* and *Feedback or idea*. Issues are public, so please don't include personal details.

## Editing content

All Tamil text is in `js/data.js`. Please have changes reviewed by a Tamil teacher before publishing — this site is used by children.
