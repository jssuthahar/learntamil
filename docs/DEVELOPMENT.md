# Development guide

Everything you need to set up, change, test, debug and ship Learn Tamil. Read `docs/ARCHITECTURE.md` for *why* it is built this way.

## 1. Setup

| Need | Why | Check |
| --- | --- | --- |
| Node.js **22 or newer** | build tools and the smoke test (built-in `WebSocket`, `Intl.Segmenter`) | `node -v` |
| Google Chrome | smoke test, printables, screenshots | `CHROME=/path/to/chrome` if it isn't in the default place |
| Python 3 | optional: `npm run serve`, `tools/generate_audio.py` | `python3 --version` |
| macOS `sips` | printables only (preview images) | built into macOS |
| Firebase CLI | only to deploy the database rules | `firebase --version` |

```bash
git clone https://github.com/jssuthahar/learntamil.git
cd learntamil
npm run check        # build everything + run all tests — should end with "All checks passed."
npm run serve        # open http://localhost:8080
```

There is no `npm install`: the project has **zero dependencies**. The browser runs the files in the repo as they are.

## 2. Commands

| Command | What it does | When |
| --- | --- | --- |
| `npm run build` | `node tools/build-pages.mjs`: guide pages, privacy, terms, 404, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `assets/js/data/faq.js`, `assets/css/app.css`, the generated blocks in `index.html`, `sw.js` `PRECACHE` + `VERSION` | after **any** change |
| `npm test` | `node tools/smoke-test.mjs`: SEO guard + headless-Chrome walk through the app | before every commit |
| `npm run check` | build + test | the one to remember |
| `npm run printables` | all PDFs + previews, then build | after changing data used by printables, or `tools/build-printables.mjs` |
| `node tools/build-printables.mjs <file>` | rebuild one PDF | while designing a printable |
| `npm run serve` | Python static server on :8080 | quick manual look |
| `python3 tools/generate_audio.py` | letter audio with Azure AI Speech | see `docs/FEATURES.md` → Speech |

## 3. Daily workflow

1. `git checkout -b feature/short-name` (never work on `main`).
2. Make the change, following the matching guide:
   - **text or content:** `docs/CONTENT.md` (skill `learntamil-content`)
   - **feature or game:** skill `learntamil-feature`
   - **page, printable or SEO:** `docs/SEO.md` (skill `learntamil-pages`)
3. `npm run check`.
4. Look at it in a browser at **desktop and phone width**, in **light and dark** themes.
5. Commit the sources **and** the generated files together, then open a PR. CI runs the same checks.

## 4. Generated vs. hand-written files

**Never edit generated files**; your change will be overwritten.

| Generated | By | Edit instead |
| --- | --- | --- |
| guide pages (`tamil-*.html`, `aathichoodi.html`, `how-to-teach-tamil-to-kids.html`, `ezhuthukal.html`, `uyirmei-ezhuthukal.html`), `privacy.html`, `terms.html`, `404.html` | build-pages | `tools/build-pages.mjs` |
| `sitemap.xml`, `llms.txt`, `llms-full.txt` | build-pages | `tools/build-pages.mjs` |
| `assets/js/data/faq.js` | build-pages | FAQ lists / `HELP` in `tools/build-pages.mjs` |
| `assets/css/app.css` | build-pages | `assets/css/NN-*.css` |
| `index.html` blocks between `<!-- NAME:START -->` and `<!-- NAME:END -->` (`STYLES`, `SCRIPTS`, `FAQ`, `FOOTER`, `SUPPORT`, `GUIDES`, `PRINT-PROMO`) | build-pages | `tools/build-pages.mjs`, `tools/lib/assets.mjs` |
| `sw.js` `PRECACHE` and `VERSION` | build-pages | `tools/lib/assets.mjs` (asset list) |
| `printables/*.pdf`, `printables/printables.json`, `assets/printables/*.png` | build-printables | `tools/build-printables.mjs`, data |

Hand-written: everything in `assets/js/` except `data/faq.js`, `assets/css/NN-*.css`, the rest of `index.html`, `record.html`, `sw.js` (logic), `manifest.webmanifest`, `robots.txt`, `database.rules.json`, `tools/`, `docs/`.

`npm run build` writes today's date into every guide page (`dateModified`), so many HTML files change on every build. That is expected.

## 5. Testing

`tools/smoke-test.mjs` uses only Node and Chrome:

1. **Static checks:** every listed CSS/JS file exists, the CSS bundle exists, and the **SEO guard** runs on every indexable page (title ≤ 60 characters, description 70–170, canonical, exactly one h1, valid JSON-LD, listed in `sitemap.xml` and `llms.txt`).
2. **Browser checks:** its own Node static server and headless Chrome over the DevTools protocol.
   - Fails on any **error while a page loads**.
   - Opens every section, starts every game, opens rhymes, festivals, rewards, stickers and the parent corner, traces a letter, starts a certificate test, and loads the static pages and the recorder.
   - After each step it fails if the page's `textContent` contains `undefined`, `NaN`, `[object Object]` or an unfilled `{placeholder}`.
   - Checks that every printable has its PDF and preview, and that the menu promotes the printables.

**Adding a test:** add a game id to the `for (const g of [...])` list, or a `check('name', 'expression that returns true')`. **Make sure a new test can fail:** break the code on purpose, see the test fail, then restore. A load-time bug once passed silently because errors during page load weren't counted; that gap is closed now.

**CI:** `.github/workflows/check.yml` runs `npm run check` on every push and pull request (Ubuntu, Node 22, Chrome).

## 6. Debugging

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Many smoke checks fail at once | one script threw while loading; everything after it is missing | fix the **first** error in "errors while the page loaded" |
| `ReferenceError: X is not defined` (or "Cannot access X before initialization") | X used while loading, before the file that defines it | reorder in `tools/lib/assets.mjs`, or move the use into a function |
| A name like `TOPICTURES` appears | substring rename (`PICS` → `PICTURES` hit `TOPICS`) | rename with `\b` word boundaries; `grep -rn` old and new names |
| "broken text on screen (undefined)" | wrong `TEXT.key`, or `fmt()` missing a value | check `data/messages.js` |
| Change not visible in the browser | service worker served the old version | run `npm run build` (new `VERSION`); in DevTools → Application → Service workers → Update / Unregister; or a private window |
| Random "failed to load" errors with `npm run serve` | Python's `http.server` drops parallel requests | ignore, or use the smoke test's Node server |
| A printable spills onto 2 pages | grid rows grow with content | `grid-template-rows: repeat(n, minmax(0,1fr))` and `min-height:0` on cells |
| A letter sounds wrong | device TTS voice | add a recording (`/record.html` or `generate_audio.py`); the disclaimer and issue form exist for this |
| No sound at all | browser has no Tamil voice, or sound effects muted | see the notice on the page; 🔊 in the scoreboard |

**Looking at the app headless:** see the `learntamil-verify` skill (screenshots with Chrome `--screenshot`, and a 15-line Swift tool that renders PDF pages to PNG on macOS).

## 7. Conventions

- **File header:** every JS file starts with `/* Learn Tamil — <area>: <what>.\n   <one or two sentences> */` and `'use strict';` (except data files).
- **Globals:** keep a feature's state in one object (`TR`, `COL`, `LT`, `MQ`). Shared helper names are listed in `docs/ARCHITECTURE.md`.
- **Text:** child-facing text comes from `data/` (`TEXT`, …), Tamil first.
- **Storage:** per-child keys go through `Profiles.get/set`; every `localStorage` access goes in `try/catch`.
- **CSS:** use the tokens from `00-tokens.css`. Support dark mode (`@media (prefers-color-scheme: dark)` plus `[data-theme]`), `prefers-reduced-motion`, a 360px width and 44px tap targets.
- **Accessibility:** icon-only buttons need an `aria-label`; Tamil text gets `lang="ta"` or `class="ta"`; dialogs use `<dialog>`.
- **Comments:** explain *why*, not what.
- **Commits:** one logical change each, with a clear imperative message; generated files go in the same commit as their source.

## 8. Deploying

- **Hosting:** GitHub Pages serves `main` from the repo root. The custom domain is in `CNAME` (`learntamil.msdevbuild.com`). **Merging to `main` deploys.**
- **Updates:** installed apps get "A new version is ready · Refresh", because the service worker `VERSION` changes on every build.
- **Firebase database rules** deploy separately (owner only): `firebase deploy --only database`. The project id is in `.firebaserc`.
- **After a release:**
  1. Open the live site on a phone and check that it updates.
  2. Check Search Console for errors.
  3. Watch GitHub Issues: there are forms for a wrong sound or Tamil mistake, a bug, and feedback.

### App stores (optional)
[PWABuilder](https://www.pwabuilder.com/) can package the live site for Google Play (Trusted Web Activity, which needs `/.well-known/assetlinks.json` on the domain), the Microsoft Store or iOS.

## 9. Content review

This site teaches children, so every new Tamil string goes to a Tamil teacher before it is published. PR descriptions should list new or changed Tamil text. See `docs/CONTENT.md`.
