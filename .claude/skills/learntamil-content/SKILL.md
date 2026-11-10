---
name: learntamil-content
description: Add or change any Tamil learning content or child-facing text in Learn Tamil — letters, picture words, word topics (animals, colours, months…), stories, rhymes, Aathichoodi, festivals, colouring pictures, badge names, Kili's levels, certificate level names, praise and feedback messages. Use whenever the user asks to add words, a topic, a story, a rhyme, a festival, or to change wording the child sees or hears.
---

# Changing content and text in Learn Tamil

All content and child-facing text lives in `assets/js/data/`. The same files feed the app, the build tools (guide pages, sitemap, `llms*.txt`, printables) and the tests, so **one edit updates everything**. The full field-by-field format is in `docs/CONTENT.md`; read it if a format below is unclear.

## 1. Find the right file

| Content | File → constant | Format |
| --- | --- | --- |
| Vowels, consonants, letter labels, ஃ | `alphabet.js` → `VOWELS`, `CONS`, `GROUPS`, `VOWEL_WORDS`, `AYTHAM`, `LETTER_LABELS` | objects, see docs/CONTENT.md |
| Picture words (Reading, Word builder) | `words.js` → `WORDS` | `[word, emoji, english]` |
| Word topics | `words.js` → `TOPICS` | `{ id, ic, ta, en, words: [[word, emoji, english], …] }` |
| Stories | `stories.js` → `STORIES` | `{ id, title, en, cover, lvl, pages: [[pic, tamil, english], …] }` |
| Rhymes, Aathichoodi | `rhymes.js` → `RHYMES`, `AATHICHOODI` | lines: `[tamil, english]` |
| Festivals | `festivals.js` → `FESTIVALS` | story format + `words` |
| Badges, Kili levels, certificate levels | `rewards.js` → `BADGES`, `STAGES`, `CERT_LEVELS` | names only — rules live in code |
| Colouring pictures, paint colours | `pictures.js` → `PICTURES`, `PAINT` | `{ w, e, en, svg }` |
| Praise, "try again", greetings, button labels | `messages.js` → `TEXT` | mostly `[tamil, english]` |

## 2. Rules for the text itself

- **Tamil first, English second** in every pair.
- **Use standard, child-level Tamil.** Use common words that children learn first. Where a borrowed word is common, give the pure Tamil word and note the other one in the English meaning: `['மகிழுந்து', '🚗', 'car · also கார்']`.
- **Meaning strings may contain ` · `.** Code uses the part before the first ` · ` as the short meaning (`m.split(' · ')[0]`). Keep the main meaning first.
- **Emoji must show the thing clearly.** Several games show the emoji alone and ask for the word, so two words in one topic must not share an emoji if they will be asked as picture questions. Months and days share 🗓️/📅 and are only asked as meaning or order questions.
- **Spelling checks.** Words in `WORDS`/`TOPICS` with 2 or more letters automatically enter the spelling games. Check that `lettersOf(word)` splits the way a teacher would.
- **Placeholders.** `{name}` and the like in `TEXT` are filled by `fmt()`. Keep the placeholder names when you change wording.
- **Tone.** Gentle and encouraging. Never shame a wrong answer.
- **Rights.** Only public-domain or original text. Avvaiyar, Bharathiyar and traditional rhymes are fine; modern film or school-book songs are not.

## 3. Special cases

- **New topic:** add it to `TOPICS`. Reading → Topics, the sticker book and the spelling bank pick it up automatically. To include it in the question games, add `topicPic('id')`/`topicMeaning('id')` to `bank.picture`/`bank.topics` in `features/certificate/certificate.js`. For a guide page, follow the `learntamil-pages` skill.
- **New badge:** add `{ id, ic, ta, en }` to `BADGES` **and** a rule `id: p => …` to `BADGE_RULES` in `features/rewards/progress.js`. The test fails if one is missing.
- **New story:** add it to `STORIES`. The shelf, the stories guide page, the sentence questions and `llms-full.txt` update automatically. The "all stories" badge counts every story in `STORIES`.
- **New message:** add it to `TEXT`, then use `TEXT.yourKey` in code. Never inline.
- **Changing a vowel's `len` or a label:** `LETTER_LABELS.short/long` must still equal the `len` values used in `VOWELS`.

## 4. Verify

```bash
npm run check
```

- The smoke test fails if text shows `undefined`, `NaN` or an unfilled `{placeholder}` anywhere on the page, including hidden panels.
- If printables use the changed data (topics, alphabet, Aathichoodi, pictures), also run `npm run printables`.
- `git diff assets/js/data/` and read every changed Tamil string once more.

## 5. Report

In your summary, list **every new or changed Tamil string** and say it should be reviewed by a Tamil teacher before publishing. Do not claim Tamil is correct beyond your confidence.
