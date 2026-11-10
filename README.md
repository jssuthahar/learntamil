# Learn Tamil · தமிழ் கற்போம்

**A free, ad-free web app that helps children (ages 3–12) and beginners learn Tamil:** all 247 letters with sound, reading practice, stories, rhymes, 14 games, certificates and 23 printable worksheets. It works on any phone, tablet or computer, can be installed as an app, and works offline.

🌐 **<https://learntamil.msdevbuild.com>** · made by Suthahar Jegatheesan ([MSDEVBUILD](https://blog.msdevbuild.com)) · [MIT licence](LICENSE)

---

## Contents

- [What's inside](#whats-inside)
- [Quick start for developers](#quick-start-for-developers)
- [Documentation map](#documentation-map)
- [Project layout](#project-layout)
- [Letter sounds](#letter-sounds)
- [Install as an app and offline use](#install-as-an-app-and-offline-use)
- [Hosting](#hosting)
- [Privacy](#privacy)
- [Support, issues and contributing](#support-issues-and-contributing)

---

## What's inside

| Area | For the child |
| --- | --- |
| **எழுத்துகள் · Letters** | 12 உயிர், 18 மெய், ஆய்தம், 216 உயிர்மெய் — tap to hear each one, see a picture word, build letters (க் + ஆ = கா), ✍️ trace, 🎤 say it back |
| **வாசிப்பு · Reading** | picture words in 3 levels and 12 topics (numbers, colours, days, body, family, food, animals, birds, vehicles, shapes, opposites, Tamil months); sound them out letter by letter |
| **கதைகள் · Stories** | 5 read-aloud stories, sing-along rhymes and Aathichoodi, 4 festival stories — every word can be tapped to see its letters |
| **விளையாட்டு · Games** | build a letter, listen & pick, spin wheel, balloon pop, word builder, memory, quiz, picture words, topics, spelling, sentences, trace, colouring, little ones |
| **சான்றிதழ் · Certificates** | 10 level tests, each giving a downloadable PDF certificate |
| **👶 Little ones** | ages 3–5: pictures only, big buttons, no wrong-answer buzzer |
| **Motivation** | tokens 🪙, 28 badges, Kili the parrot who grows, a daily goal, a day streak, a sticker book 📒, letter of the day |
| **For parents** | child profiles (up to 6), Parent corner (time, progress, letters to practise), break reminder, a parents' guide |
| **🖨️ Printables** | 23 free PDFs: alphabet and word charts, tracing worksheets for all 247 letters, matching and missing-letter sheets, colouring pages |
| **Guides** | 24 pages that work without JavaScript (alphabet, vowels, consonants, words, numbers, colours, months, Aathichoodi, rhymes, festivals, how to teach Tamil to kids …) |

Full feature reference: **[docs/FEATURES.md](docs/FEATURES.md)**.

## Quick start for developers

Requirements: **Node.js 22+** and **Google Chrome**. No `npm install`: the project has zero dependencies.

```bash
git clone https://github.com/jssuthahar/learntamil.git && cd learntamil
npm run check     # build everything and run all tests → "All checks passed."
npm run serve     # http://localhost:8080
```

| Command | Does |
| --- | --- |
| `npm run build` | regenerates guide pages, CSS bundle, sitemap, `llms.txt`, chat data, `index.html` blocks and the service worker lists. **Run it after any change.** |
| `npm test` | smoke test in headless Chrome + SEO guard |
| `npm run check` | build + test. **Run it before every commit.** |
| `npm run printables` | rebuilds the 23 PDFs (macOS), then the pages |

There is no bundler and no framework: the browser runs the files in the repo as they are. Scripts are plain `<script>` files that share globals and load in the order listed in `tools/lib/assets.mjs`. **Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before adding a script.**

## Documentation map

| Read this | When you want to… |
| --- | --- |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | set up, learn the commands, test, debug, know which files are generated, deploy |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | understand the design: script load order, events, routing, storage, build pipeline, decisions |
| [docs/CONTENT.md](docs/CONTENT.md) | change words, stories, rhymes, badge names or messages: every data file field by field |
| [docs/FEATURES.md](docs/FEATURES.md) | find where a feature lives and how it works, plus all storage keys |
| [docs/SEO.md](docs/SEO.md) | understand or extend SEO / AEO / GEO, or add a guide page |
| [CONTRIBUTING.md](CONTRIBUTING.md) | open an issue or a pull request |
| [CLAUDE.md](CLAUDE.md) + [.claude/skills/](.claude/skills) | work on the project with Claude Code: rules and step-by-step skills (`learntamil-content`, `learntamil-feature`, `learntamil-pages`, `learntamil-verify`) |

## Project layout

```text
index.html                 the learning app (hand-written; blocks between <!-- X:START/END --> are generated)
*.html                     24 guide pages + privacy, terms, 404 (generated); record.html (letter recorder, noindex)
sw.js                      service worker (offline); PRECACHE + VERSION generated
manifest.webmanifest       PWA manifest and app shortcuts
robots.txt, sitemap.xml, llms.txt, llms-full.txt   for search and AI engines (sitemap + llms generated)
assets/
  css/                     00-tokens … 90-kids (numbered = cascade order) → built into app.css
  js/
    core/                  profiles (per-child storage), dom, letter-model, speech, sound, analytics
    data/                  ALL content and child-facing text: alphabet, words, stories, rhymes, festivals,
                           rewards, pictures, messages, faq (generated)
    features/              letters, reading, stories, games/*, rewards/*, certificate, voice, little, family/*, recorder
    services/              pwa, firebase (analytics, reminders, world map), support note, Ask Kili chat
    app.js                 router: loads last
  audio/                   recorded letter sounds + manifest.js
  printables/, *.png       preview images and icons (public URLs: keep in place)
printables/                the 23 PDFs + printables.json
tools/
  lib/assets.mjs           THE ordered list of styles and scripts
  lib/load-data.mjs        loads assets/js/data/ in Node for the tools
  build-pages.mjs          generates pages, sitemap, llms*.txt, chat data, CSS bundle, sw lists
  build-printables.mjs     generates the PDFs with headless Chrome
  smoke-test.mjs           headless-Chrome test + SEO guard
  generate_audio.py        letter audio with Azure AI Speech
docs/                      developer documentation
.claude/skills/            Claude Code project skills
.github/                   issue forms, PR template, CI workflow
database.rules.json        Firebase Realtime Database rules (world map counters)
```

## Letter sounds

Device text-to-speech voices don't pronounce single Tamil letters reliably (short and long vowels can come out the same). Until a letter has a recording, a vowel is read as the letter followed by its picture word (ஒ … ஒட்டகம்). For correct single-letter sounds, add recordings in one of two ways.

### A. Generate all 247 letters with Azure AI Speech (recommended)

```bash
export AZURE_SPEECH_KEY=<key>          # Azure portal → Speech resource → Keys and Endpoint
export AZURE_SPEECH_REGION=<region>    # e.g. centralindia
python3 tools/generate_audio.py        # or: --only vowels / --only problem / --voice ta-IN-ValluvarNeural
```

This writes `assets/audio/*.mp3` and `assets/audio/manifest.js`. It never replaces your own recordings unless you pass `--force`. **Listen to every letter before publishing.**

### B. Record them yourself

Open `record.html`, record the letters (start with **Problem letters**), press **Download audio.zip**, unzip it into `assets/audio/`, run `npm run build`, and commit. Any letter you didn't record still uses the device voice.

## Install as an app and offline use

- **Android / Chrome / Edge:** the **Install app** button in the header. The installed app opens full screen, with long-press shortcuts to Letters, Reading, Stories, Games, Certificate and Printables.
- **iPhone / iPad:** Safari shows a one-time tip: **Share → Add to Home Screen**.
- **Offline:** after the first visit, everything works without internet, including recorded letter audio. Device voices may need internet for letters without a recording.
- **Updates:** users see "A new version is ready · Refresh", because every build changes the service worker version.
- **App stores (optional):** [PWABuilder](https://www.pwabuilder.com/) can package the site for Google Play (which needs `/.well-known/assetlinks.json`), the Microsoft Store or iOS.

## Hosting

GitHub Pages: Settings → Pages → *Deploy from a branch* → `main` / `(root)`. The custom domain is in `CNAME` (`learntamil.msdevbuild.com`), with **Enforce HTTPS** on. If the domain changes, update `SITE` in `tools/build-pages.mjs`, the `index.html` head and `robots.txt`, then rebuild. **Merging to `main` deploys**, so CI must be green first. After publishing, submit `sitemap.xml` to Google Search Console and Bing Webmaster Tools (see [docs/SEO.md](docs/SEO.md)).

## Privacy

There are no accounts and no ads. A child's progress, name, stickers and minutes stay **only in the browser**. Microphone recordings (🎤 Say it) are never saved or uploaded. Anonymous visit statistics load only after a parent taps **Allow**, with all advertising features off. Details are on [privacy.html](https://learntamil.msdevbuild.com/privacy.html); its text lives in `tools/build-pages.mjs` and must be updated in the same change as any feature that changes what is stored or sent.

## Support, issues and contributing

- **Support:** Learn Tamil is free with no ads. If it helps your family or classroom: **<https://buymeacoffee.com/jssuthahar>** ☕. The site only links there; it loads no third-party script.
- **Issues:** wrong sound, Tamil mistake, bug or idea → **<https://github.com/jssuthahar/learntamil/issues>** (short forms for each). Issues are public, so please don't include personal details.
- **Contributing:** see [CONTRIBUTING.md](CONTRIBUTING.md). All Tamil text lives in `assets/js/data/` and must be reviewed by a Tamil teacher before publishing.
