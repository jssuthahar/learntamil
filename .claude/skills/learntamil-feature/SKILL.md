---
name: learntamil-feature
description: Add, change or fix a game, section, dialog or other feature in the Learn Tamil app (assets/js/features). Use for any request like "add a new game", "add a button to…", "change how tracing works", "fix the spin wheel", "add a setting", or any JavaScript/CSS change to the app's behaviour.
---

# Building a feature in Learn Tamil

Read `docs/ARCHITECTURE.md` §3 ("How scripts share code") first if you have not this session. Everything below follows from one fact: **scripts are classic `<script>` files sharing one global scope, loaded in the order listed in `tools/lib/assets.mjs`.**

## 1. Decide where it goes

| Kind | Folder | Example |
| --- | --- | --- |
| A game in the Games hub | `assets/js/features/games/<name>.js` | `trace.js`, `colouring.js` |
| A new section (URL `#/name`) | `assets/js/features/<name>/<name>.js` | `little/little.js` |
| A dialog for parents/children | `assets/js/features/family/` | `stickers.js` |
| Something every feature needs | `assets/js/core/` | rarely — ask first |
| Text the child sees | `assets/js/data/messages.js` → `TEXT` | never inline |

## 2. Markup

Edit `index.html` by hand, but **only outside** the `<!-- NAME:START/END -->` blocks:

- **Game:** a card in `#gamePick` (`<button class="gcard" data-game="mygame">…`) and a panel `<div class="game glass" id="g-mygame" hidden>` inside `#practice`.
- **Section:** `<section class="panel" id="mysection" role="tabpanel">` inside `<main>`, and add `'mysection'` to `SECTIONS` in `assets/js/app.js`.
- Give every icon-only button an `aria-label`. Use `lang="ta"` or `class="ta"` on Tamil text.

## 3. Script

Create the file with the standard header:

```js
/* Learn Tamil — games: 🐝 My game.
   One or two sentences: what the child does and what counts as a win. */
'use strict';
```

Then:

- **Start and stop through events, not direct calls.** Games: `document.addEventListener('lt:game', e => { if (e.detail === 'mygame') start(); })`. Sections: `document.addEventListener('lt:section', e => { if (e.detail === 'mysection') start(); else stop(); })`. Stop sound, timers and `requestAnimationFrame` when the section closes.
- **Use the shared helpers:** `$`, `$$`, `rand`, `shuffle`, `sparkle`, `confetti`, `fmt` (core/dom.js); `speak`, `sayItem`, `sayLetter` (core/speech.js); `uyir`, `mei`, `uyirmei`, `lettersOf`, `spokenForm` (core/letter-model.js); `fb(el, text, kind)` (games/game-utils.js).
- **Rewards:** `Rewards.win(el, { points, big, after })` for a right answer, `Rewards.miss()` for a wrong one, `Rewards.cheer(el)` outside games. To record learning, use `Progress.track('name', value)` and add the field to `DEFAULT()` in `features/rewards/progress.js`.
- **Per-child data:** use `Profiles.get/set('lt-…')`. Device settings use `localStorage` in `try/catch`.
- **Keep internal state** in one object (`const MG = { … }`) so you don't add many globals.
- **Respect `calm`** (prefers-reduced-motion): skip animations when it is true.

## 4. Register the script

Add it to `APP_SCRIPTS` in `tools/lib/assets.mjs`, **after every file whose names it uses while loading** (games go after `features/games/hub`, before `app`). Never add `<script>` tags to HTML by hand.

## 5. Styles

Put new styles in `assets/css/90-kids.css`, or in a new numbered file (`NN-name.css`) added to `STYLES` in `tools/lib/assets.mjs`. A higher number loads later and wins the cascade. The build joins them into `assets/css/app.css`. Use the design tokens (`--surface`, `--text`, `--accent`, `--border`, `--font-kid`, `--font-ta`) so light and dark themes both work. Check a 390px-wide phone: no horizontal scroll, and tap targets at least 44px.

## 6. Test

1. Add the game id to the list in `tools/smoke-test.mjs` (`for (const g of [...])`), or a `check(...)` for a new section or dialog.
2. Run `npm run check`.
3. Look at it with the `learntamil-verify` skill (headless screenshot at 1280px and 390px).
4. **Mutation check** for anything risky: break your feature on purpose (rename a function) and confirm `npm test` fails, then restore it.

## 7. Before you finish

- Does the change store or send anything new? If so, update the privacy page text in `tools/build-pages.mjs`.
- New child-facing text is in `TEXT`, with Tamil listed in the summary for review.
- If the feature is notable, update `docs/FEATURES.md` and the Ask Kili help entries (`HELP` in `tools/build-pages.mjs`).
- `npm run check` passes.
