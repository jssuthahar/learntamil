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

By default the site uses the device's Tamil text-to-speech voice. Some letters (the உ/ஊ/ஒ/ஓ forms and the ஞ row) are not pronounced reliably by these voices, so for correct sounds:

1. Open `record.html`, record the letters (start with **Problem letters**).
2. Press **Download audio.zip** and unzip it into the `audio/` folder.
3. Commit the `audio/` folder. The site plays your recordings automatically and falls back to the device voice for any letter not recorded.

## Hosting on GitHub Pages

1. Push this repository to GitHub.
2. Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
3. The site is served at `https://<username>.github.io/learntamil/`.

## Editing content

All Tamil text is in `js/data.js`. Please have changes reviewed by a Tamil teacher before publishing — this site is used by children.
