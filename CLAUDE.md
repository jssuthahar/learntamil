# CLAUDE.md — working on Learn Tamil

Learn Tamil (https://learntamil.msdevbuild.com) is a free Tamil-learning web app for **children aged 3–12** and their parents: 247 letters with sound, reading, stories, rhymes, 14 games, certificates, printables. It is a static PWA on GitHub Pages: **no bundler, no framework, no server**. Plain HTML, CSS and JavaScript run in the browser as they are. Node 22+ is used only by the tools in `tools/`.

Owner: Suthahar Jegatheesan (MSDEVBUILD). The audience is children, so correctness of Tamil, kindness of tone and privacy matter more than anything else.

## Commands

```bash
npm run build       # regenerate pages, tags, CSS bundle, sitemap, llms*.txt, sw.js lists — run after ANY change
npm test            # headless-Chrome smoke test + SEO guard (needs Google Chrome)
npm run check       # build + test — must pass before you say a task is done
npm run printables  # rebuild the 23 PDFs (macOS: uses Chrome + sips), then the pages
npm run serve       # python server on :8080 for a quick look (flaky under load; tests use their own server)
```

There is no `npm install`; the project has zero dependencies.

## Rules (each one exists because breaking it caused a real bug)

1. **Script load order is the contract.** Scripts are classic `<script>` files sharing one global scope, listed in order in `tools/lib/assets.mjs`. While a file *loads* it may only use names from files *earlier* in the list; inside handlers it may use anything. Add a script there, never by hand in HTML. `app.js` (router) is always last.
2. **All child-facing text lives in `assets/js/data/`.** Never write Tamil (or a praise/feedback message) inline in feature code. Use `TEXT.*` (`data/messages.js`), `BADGES`/`STAGES`/`CERT_LEVELS` (`data/rewards.js`), `LETTER_LABELS` (`data/alphabet.js`). Placeholders: `fmt(TEXT.greetName, { name })`. Exceptions on purpose: page markup in `index.html` (SEO), certificate question templates, grown-up screens.
3. **Never edit generated files.** They are overwritten by `npm run build` / `npm run printables`:
   all guide pages (`tamil-*.html`, `aathichoodi.html`, `how-to-teach-tamil-to-kids.html`, `ezhuthukal.html`, `uyirmei-ezhuthukal.html`), `privacy.html`, `terms.html`, `404.html`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `assets/js/data/faq.js`, `assets/css/app.css`, the `<!-- NAME:START/END -->` blocks in `index.html`, `PRECACHE`/`VERSION` in `sw.js`, `printables/*.pdf`, `printables/printables.json`, `assets/printables/*.png`. Edit the source (`tools/build-pages.mjs`, `tools/build-printables.mjs`, `assets/css/NN-*.css`, data files) instead.
4. **Public URLs never change.** Pages, `sw.js`, `manifest.webmanifest`, images in `assets/` and PDFs in `printables/` are linked from Google, social cards and installed apps.
5. **Renames must use word boundaries.** A plain substring replace of `PICS` → `PICTURES` once turned `TOPICS` into `TOPICTURES` and broke the colouring game. Use `\bNAME\b` regexes, then `grep -rn` for the old and new names.
6. **Progress is per child.** Read/write a child's data through `Profiles.get/set(key)` (keys: `lt-progress`, `lt-best-*`, `lt-cert-name`, `lt-cert-seen`, `lt-spin-seen`). New progress fields go in `DEFAULT()` in `features/rewards/progress.js`. Device settings use `localStorage` directly, always inside `try/catch`.
7. **Privacy.** Nothing about a child leaves the device. Microphone recordings are never saved or uploaded. Analytics loads only after a parent taps Allow. If a feature changes what is stored or sent, update the privacy page text in `tools/build-pages.mjs` in the same change.
8. **Kind to children.** Wrong answers get a soft sound and "பரவாயில்லை" — never red alarms, timers that punish, or shame. Little ones mode has no wrong-answer sound at all.
9. **Tamil must be right.** New Tamil text should be reviewed by a Tamil teacher. Say so in your summary and list the new strings. Never "fix" Tamil you are unsure about; ask.
10. **Prove it works.** `npm run check` must pass. For visual changes, take a screenshot in headless Chrome (see the `learntamil-verify` skill). Report failures honestly with the output.

## Where things are

| You want to… | Go to |
| --- | --- |
| change words, stories, praise, badge names | `assets/js/data/*.js` → `docs/CONTENT.md` |
| add or change a game / feature | `assets/js/features/…` → skill `learntamil-feature`, `docs/FEATURES.md` |
| add a guide page, printable, SEO | `tools/build-pages.mjs`, `tools/build-printables.mjs` → skill `learntamil-pages`, `docs/SEO.md` |
| styles | `assets/css/NN-*.css` (numbered = cascade order; `90-kids.css` for new feature styles) |
| understand the design | `docs/ARCHITECTURE.md` |
| set up, test, debug, deploy | `docs/DEVELOPMENT.md` |

Project skills (in `.claude/skills/`): `learntamil-content`, `learntamil-feature`, `learntamil-pages`, `learntamil-verify`. Load the matching one before starting such a task.

## Known traps

- `lt:section` fires *before* the router toggles panel visibility; don't measure layout in its handler without a `setTimeout`.
- Checking rendered text for broken placeholders? Use `textContent` (includes hidden panels), not `innerText`.
- Python's `http.server` drops parallel requests (50+ files on first load) → false "file failed to load" errors. The smoke test has its own Node server.
- Tamil graphemes: split words with `lettersOf()` (`Intl.Segmenter`), never `split('')`.
- `npm run build` stamps today's date into every guide page (`dateModified`), so many HTML files change on every build. That is expected.
- The phone bottom bar fits exactly 5 tabs; Tamil labels are already 10px. Don't add a 6th; put entry points elsewhere.
- Shell heredocs with backticks and `${}` can trip the command safety checker. Write long patch scripts to a scratch file and run them.
