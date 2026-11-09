# Learn Tamil · தமிழ் கற்போம்

A free, mobile-friendly website for children and beginners to learn the 247 Tamil letters, read simple words and stories, and practise with games. By MSDEVBUILD.

## What's inside

| Section | What it does |
| --- | --- |
| **எழுத்துகள் · Letters** | 12 உயிர், 18 மெய், ஆய்தம், 216 உயிர்மெய் — tap to hear, picture words, build-a-letter |
| **வாசிப்பு · Reading** | 46 picture words in 3 levels; sound out letter by letter, then reveal the picture |
| **கதைகள் · Stories** | 5 read-aloud stories with word-tap letter breakdown and English meaning |
| **விளையாட்டு · Games** | Build a letter, Listen & pick, Spin wheel, Balloon pop, Word builder, Memory |

## Project layout

```text
index.html          page markup
record.html         letter recorder (make real audio for each letter)
css/styles.css      site styles (light/dark, phone layout)
css/record.css      recorder styles
js/data.js          letters, words and stories (all Tamil text lives here)
js/app.js           letters, stories, speech, navigation
js/games.js         reading practice and games
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
3. The site is served at `https://<username>.github.io/learntamil/`.

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

Learn Tamil is free, with no ads and no tracking. If it helps your family or classroom, you can support it at **<https://buymeacoffee.com/jssuthahar>** ☕. The site only links there; it loads no Buy Me a Coffee script.

## Report an issue or give feedback

Found a wrong sound, a Tamil mistake or a bug, or have an idea? Please open an issue: **<https://github.com/jssuthahar/learntamil/issues>**. There are short forms for *Wrong sound or Tamil mistake*, *Bug report* and *Feedback or idea*. Issues are public, so please don't include personal details.

## Editing content

All Tamil text is in `js/data.js`. Please have changes reviewed by a Tamil teacher before publishing — this site is used by children.
