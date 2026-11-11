# Contributing to Learn Tamil

Thank you for helping children learn Tamil! 🦜

Learn Tamil is open source under the [MIT licence](LICENSE). Anyone is welcome to fix a bug, add a word, improve a game or translate a page. You don't need to ask first: open a pull request. For a big change (a new game, a new section), open an issue first so we can agree on the idea before you spend time on it.

## Ways to help

- **Report a wrong sound or a Tamil mistake.** Use [GitHub Issues → "Wrong sound or Tamil mistake"](https://github.com/jssuthahar/learntamil/issues/new/choose). This is the most valuable help of all.
- **Suggest content:** words, topics, public-domain rhymes, stories. Use the "Feedback or idea" form.
- **Fix a bug or add a feature:** read on.

Please don't include personal details (yours or a child's) in issues; they are public.

## Before you write code

1. Read **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** (setup, commands, testing) and **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** (how the scripts fit together).
2. Changing text or content? Read **[docs/CONTENT.md](docs/CONTENT.md)**.
3. Adding a page, a printable or SEO work? Read **[docs/SEO.md](docs/SEO.md)**.
4. Using Claude Code? The repo has `CLAUDE.md` and project skills in `.claude/skills/`; Claude loads them itself.

You need **Node 22+**, **Git** and **Google Chrome** (for the tests). There is nothing to install: the project has zero npm dependencies.

## The rules that matter most

1. **Zero dependencies, no bundler.** Plain HTML, CSS and JavaScript that run as they are. Please don't add a framework or an npm package.
2. **Text the child sees lives in `assets/js/data/`**, never inline in feature code.
3. **Never edit generated files.** Edit the source and run `npm run build`. The list is in DEVELOPMENT.md §4.
4. **Kind to children:** gentle feedback, no shaming, no ads, no tracking without a parent's consent.
5. **Privacy:** nothing about a child leaves the device.
6. **Tamil is reviewed** by a Tamil teacher before it is published. List new Tamil strings in your PR.
7. **`npm run check` passes**, and you looked at your change on a phone-sized screen.

## How to send your code (step by step)

Nobody pushes straight to `main`. Merging to `main` deploys the live site that children use, so every change goes through a pull request (PR) and a green CI check.

### 1. Fork and clone (first time only)

Click **Fork** on <https://github.com/jssuthahar/learntamil>, then:

```bash
git clone https://github.com/<your-username>/learntamil.git
cd learntamil
git remote add upstream https://github.com/jssuthahar/learntamil.git
npm run check          # make sure everything passes before you change anything
```

### 2. Start a branch from the latest `main`

```bash
git checkout main
git pull upstream main
git checkout -b fix/tracing-on-small-phones     # or feature/…, content/…, docs/…
```

Branch names: `fix/…` for bugs, `feature/…` for new behaviour, `content/…` for words, stories and rhymes, `docs/…` for documentation. One branch = one change.

### 3. Make your change and check it

```bash
npm run serve          # look at it on http://localhost:8080 (desktop and phone width, light and dark)
npm run check          # build + smoke test + SEO guard — must pass
```

`npm run build` rewrites generated files (guide pages, `app.css`, `sw.js`, sitemap, `llms*.txt`). That is expected: **commit them together with your source change**. Every guide page gets today's date on each build, so many HTML files change; that is normal too.

Changed printable data or design? Also run `npm run printables` (macOS).

### 4. Commit

```bash
git status             # check you are committing only what you meant to
git add -A
git commit -m "Fix tracing canvas size on small phones"
```

Commit messages: short, in the present tense, saying *what* changed ("Add vehicles topic", "Fix spin wheel on iOS"). Add more detail on the next lines if it helps. Please never commit secrets, API keys, personal data or recordings of a child's voice.

### 5. Push to your fork and open a pull request

```bash
git push -u origin fix/tracing-on-small-phones
```

GitHub prints a link: open it and create the PR against `jssuthahar/learntamil` → `main`. Then:

- Fill in the PR template checklist.
- List **every new or changed Tamil string** (or write "none").
- For visual changes, add a screenshot at phone and desktop width.
- Link the issue it fixes (`Fixes #123`).

### 6. Review and updates

CI (`.github/workflows/check.yml`) runs `npm run check` on your PR. A red check can't be merged. If the reviewer asks for changes, commit on the same branch and push again; the PR updates by itself:

```bash
git add -A
git commit -m "Use TEXT.tryAgain instead of inline text"
git push
```

### 7. Keep your fork up to date

If `main` moved on while you were working:

```bash
git checkout main
git pull upstream main
git push origin main
git checkout fix/tracing-on-small-phones
git merge main         # fix any conflicts, then npm run check again
git push
```

If a conflict is in a generated file (a guide page, `app.css`, `sw.js`, `sitemap.xml`), don't fix it by hand: take either side, run `npm run build`, and commit the result.

## What happens after you open a PR

The maintainer reviews it, usually within a few days. Tamil text is checked by a Tamil teacher before it goes live, so content PRs can take a little longer. Once it is merged, the site updates within a few minutes and you are part of Learn Tamil. 🎉

## Licence

By sending a pull request, you agree that your contribution is released under the project's [MIT licence](LICENSE). Only add pictures, sounds, stories or rhymes that you made yourself or that are in the public domain or under a licence that allows it, and say where they came from in the PR.
