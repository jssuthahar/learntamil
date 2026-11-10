---
name: learntamil-verify
description: Verify, test, debug or release a change to Learn Tamil — run the checks, open the real app in headless Chrome, take screenshots at phone and desktop widths, render printable PDFs to images, find the cause of a failing smoke test, and prepare a commit or PR. Use before saying any Learn Tamil task is done, when a test fails, or when asked to run, check, screenshot, release or deploy.
---

# Verifying and releasing Learn Tamil

A change is done only when `npm run check` passes **and** you have looked at the result.

## 1. Run the checks

```bash
npm run check          # = npm run build && npm test
```

What `npm test` (`tools/smoke-test.mjs`) does:
1. Checks that every listed CSS/JS file and the built `assets/css/app.css` exist.
2. Runs the **SEO guard** on every indexable page: title, description, canonical, one h1, valid JSON-LD, listed in the sitemap and `llms.txt`.
3. Starts its own Node static server and headless Chrome over the DevTools protocol.
4. Fails on any **error while the page loads**: a wrong script order, a renamed name.
5. Opens every section, starts every game, opens the rhymes, festivals, rewards, stickers and parent dialogs, traces a letter, and starts a certificate test.
6. After each step, fails if the page text (`textContent`, including hidden panels) contains `undefined`, `NaN`, `[object Object]` or an unfilled `{placeholder}`.
7. Checks that every printable PDF and preview exists and that the menu links to the printables page.

Set `CHROME=/path/to/chrome` if Chrome is not installed in the default place.

## 2. When a test fails

- **"errors while the page loaded: ReferenceError: X is not defined"**: X is used while a file loads, before the file that defines it. Fix the order in `tools/lib/assets.mjs`, or move the use into a function or handler. Also grep for a botched rename (`grep -rn "X" assets/js`).
- **Many checks fail at once**: one early script threw while loading, and everything after it is missing. Fix the **first** error only, then rerun.
- **"broken text on screen"**: a `TEXT.something` name is wrong, or `fmt()` is missing a value.
- **SEO guard**: shorten the title or description in `tools/build-pages.mjs` (or the `index.html` head), then rebuild.

To read the real browser errors, run a quick CDP script, or temporarily `console.log` from the test. `node --check file.js` finds syntax errors.

## 3. Look at it (screenshots)

Chrome headless can screenshot a page directly:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --window-size=390,844 --screenshot=/tmp/phone.png "http://127.0.0.1:8766/index.html#/practice"
```

- Serve the site with a **Node** static server (copy the server from `tools/smoke-test.mjs`), not `python -m http.server`, which drops some of the ~45 files on first load and gives false errors.
- To click through a flow first (start a game, open a dialog), drive Chrome with `--remote-debugging-port` and `Runtime.evaluate`. `tools/smoke-test.mjs` shows the whole pattern in ~40 lines.
- Check **1280px desktop** and **390px phone** (`Emulation.setDeviceMetricsOverride` with `mobile: true`). The header has been measured to fit from 360px to 1600px. If you change the header, measure overflow (`scrollWidth > clientWidth` on `.site-header .wrap`) at several widths rather than eyeballing it.
- Set `localStorage['lt-consent']='no'` and reload so the cookie notice doesn't cover the screenshot.

## 4. Look at PDFs

The PDFs need rendering to images before you can look at them. On macOS, compile this once and run it:

```swift
// pdfpages.swift — swiftc -O -o pdfpages pdfpages.swift ; ./pdfpages in.pdf out   → out-1.png, out-2.png …
import PDFKit; import AppKit
let a = CommandLine.arguments; let d = PDFDocument(url: URL(fileURLWithPath: a[1]))!
for i in 0..<d.pageCount { let p = d.page(at: i)!; let r = p.bounds(for: .mediaBox); let s: CGFloat = 1.2
  let img = NSImage(size: NSSize(width: r.width*s, height: r.height*s)); img.lockFocus()
  NSColor.white.set(); NSRect(x: 0, y: 0, width: r.width*s, height: r.height*s).fill()
  let c = NSGraphicsContext.current!.cgContext; c.scaleBy(x: s, y: s); p.draw(with: .mediaBox, to: c); img.unlockFocus()
  try! NSBitmapImageRep(data: img.tiffRepresentation!)!.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: "\(a[2])-\(i+1).png")) }
```

Alternatively, `brew install poppler` lets you read PDFs directly. Check the page counts in `printables/printables.json` against what you expect.

## 5. Commit and release

- **Branch first:** never commit straight to `main` (`git checkout -b feature/short-name`).
- **Run `npm run check` right before committing.** Commit generated files together with their sources; the site is served straight from the repo.
- **One commit per logical change.** Use clear messages: "Add birds topic page", not "update".
- **Deploying:** GitHub Pages serves `main` from the repo root. A push to `main` *is* a deploy, so only merge a branch that passes its checks. The `check` workflow in `.github/workflows/check.yml` runs on every PR.
- **After a deploy:** installed apps show "A new version is ready", because `sw.js` `VERSION` changes on every build.
- **Firebase Realtime Database rules** (`database.rules.json`) are deployed separately, with `firebase deploy --only database`. Only the owner can do this.

## 6. Report honestly

State which checks ran and their result, what you looked at (screenshots), what you could not verify (a real phone, real microphone, real speech voice), and the Tamil strings that need human review.
