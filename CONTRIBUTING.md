# Contributing to Learn Tamil

Thank you for helping children learn Tamil! 🦜

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

## The rules that matter most

1. **Zero dependencies, no bundler.** Plain HTML, CSS and JavaScript that run as they are. Please don't add a framework or an npm package.
2. **Text the child sees lives in `assets/js/data/`**, never inline in feature code.
3. **Never edit generated files.** Run `npm run build`. The list is in DEVELOPMENT.md §4.
4. **Kind to children:** gentle feedback, no shaming, no ads, no tracking without a parent's consent.
5. **Privacy:** nothing about a child leaves the device.
6. **Tamil is reviewed** by a Tamil teacher before it is published. List new Tamil strings in your PR.
7. **`npm run check` passes**, and you looked at your change on a phone-sized screen.

## Pull requests

- Branch from `main` (`feature/…` or `fix/…`). Keep each PR to one change.
- Fill in the PR template's checklist.
- CI (`.github/workflows/check.yml`) runs `npm run check`. A red check means it can't be merged, because merging to `main` deploys the live site.

## Licence

See [LICENSE](LICENSE).
