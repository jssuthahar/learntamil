---
name: learntamil-pages
description: Add or change a static guide page, a free printable PDF, or anything for SEO / AEO / GEO in Learn Tamil (tools/build-pages.mjs, tools/build-printables.mjs, sitemap, llms.txt, structured data, meta titles and descriptions). Use for "add a page about…", "make a worksheet / chart / PDF", "improve SEO", "rank for…", "show up in ChatGPT/Google answers".
---

# Guide pages, printables and SEO in Learn Tamil

Everything search engines and AI engines read is **generated** by `tools/build-pages.mjs` from `assets/js/data/`. Never hand-edit a generated `.html`. Background: `docs/SEO.md`.

## A. Add a guide page

**A topic page** (a word list such as animals or colours) is the easy path:
1. Make sure the topic exists in `TOPICS` (`assets/js/data/words.js`).
2. Add an entry to `TOPIC_PAGES` in `tools/build-pages.mjs`: `{ id, file, bubble, h1, title, description, lead, faq }`. Copy a neighbouring entry.
3. Add the file to `GUIDES` (same file, near the top). This puts it in the footer, the "More guides" cards, the sitemap, `llms.txt` and the offline cache.

**Any other page:** add a `write('file.html', shell({ … }))` block in section 8b of `build-pages.mjs` (see `aathichoodi.html` or `how-to-teach-tamil-to-kids.html`), add it to `GUIDES`, and add its FAQ list to `LINKS` so the Ask Kili chat can answer from it.

### The writing pattern every page must follow (AEO/GEO)

1. **Title ≤ 60 characters**, matching how people search: "Animal Names in Tamil for Kids (with Pictures)".
2. **Description 70–155 characters**, with real Tamil examples in it.
3. **One `<h1>`**, which `shell()` adds from `h1`.
4. **Open with the direct answer** in the first sentence, in `<p class="lead-doc"><strong>…</strong>`. AI engines quote this sentence.
5. **Then the content**, using H2s from `h2(id, icon, html)`.
6. **End with an FAQ** of 3–5 real questions. Answers stand alone, give the Tamil with a romanisation (யானை (yaanai)) and repeat the key fact.
7. **Link to the app** (`./#/section`) and to 2–3 related guides.
8. **Structured data** in `schema: [...]`: `faqSchemaFor(FAQ, file)` always, plus `DTS()` for word lists, `HowTo` for step-by-step guides, `CreativeWork` for poems and rhymes, `ItemList` for collections. `shell()` adds WebPage, BreadcrumbList and Article itself.

## B. Add a printable PDF

1. Add an entry to `DOCS` in `tools/build-printables.mjs` with `{ file, cat, title, html }`, where `cat` is one of `letters | words | tracing | activity | colouring`.
2. Build the HTML with `doc(css, body)` and the helpers `head(ta, en)`, `foot(label)`, `wordChart(id, cols)`, `traceRow`, `TRACE_CSS`. Each `.page` is one A4 sheet (274mm tall), so content must fit: use `grid-template-rows: repeat(n, minmax(0,1fr))` and `min-height:0`.
3. **Anything shuffled must use `shuffleBy(list, 'seed')`**, never `Math.random`, so a rebuild gives the same PDF.
4. Activity sheets need an answer-key page if the answers are not obvious.
5. Iterate on one PDF: `node tools/build-printables.mjs <file>`. Then run `npm run printables` for everything; it also rebuilds the pages.
6. **Look at every page of the PDF.** Render it to PNG with a PDFKit tool (see `learntamil-verify`) or `brew install poppler`, and check the page count in `printables/printables.json`. A chart that spills onto 2 pages means the grid rows are wrong.

The printables page, the sitemap (including the image sitemap), `llms.txt` and the smoke test all pick up the new PDF automatically.

## C. SEO changes in general

- The site URL lives in one place: `SITE` in `build-pages.mjs`, plus `index.html` head and `robots.txt`.
- `index.html` head (title, description, JSON-LD) is hand-written. Keep the title ≤ 60 characters.
- `llms.txt` holds facts and links. `llms-full.txt` holds all content as text. Both are built from data; add new key facts to the `llms.txt` template.
- Speed: pages load one stylesheet (`assets/css/app.css`, built). Don't add `<link>` tags.

## D. Verify

```bash
npm run check
```

The SEO guard in the smoke test fails if any indexable page has a title over 60 characters, a description outside 70–170 characters, no canonical, anything other than one `<h1>`, invalid JSON-LD, or is missing from `sitemap.xml` or `llms.txt`. Also take a phone screenshot of the new page (`learntamil-verify`).

Report new Tamil strings and new facts (dates, names, counts) for review. Do not invent facts; if unsure, leave the fact out.
