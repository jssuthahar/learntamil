#!/usr/bin/env node
/*
  Builds the static, crawlable pages from js/data.js so search engines and AI
  answer engines can read every letter without running JavaScript.

    node tools/build-pages.mjs

  Writes: tamil-alphabet.html, sitemap.xml
  Change SITE below if you move to a custom domain, then run it again.
*/
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export const SITE = 'https://jssuthahar.github.io/learntamil/';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TODAY = new Date().toISOString().slice(0, 10);

// Load the same data the app uses.
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8') +
  ';this.D={PULLI,VOWELS,CONS,GROUPS,WORDS,STORIES,TOPICS};', ctx);
const { PULLI, VOWELS, CONS, GROUPS, WORDS, STORIES, TOPICS } = ctx.D;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PUBLISHED = '2026-11-09';
const ISSUES_URL = 'https://github.com/jssuthahar/learntamil/issues';
export const COFFEE_URL = 'https://buymeacoffee.com/jssuthahar';
/* Support card for parents — a plain link (no widget script), so nothing tracks visitors. */
export const SUPPORT = `<aside class="support-card" aria-label="Support Learn Tamil">
  <span class="sc-ic" aria-hidden="true">☕</span>
  <div><b>Keep Learn Tamil free</b><p>Learn Tamil is free, with no ads. If it helps your family or classroom, you can support it with a coffee. <span class="ta">உங்கள் ஆதரவுக்கு நன்றி!</span></p></div>
  <a class="coffee-btn" href="${COFFEE_URL}" target="_blank" rel="noopener">☕ Buy me a coffee</a>
</aside>`;

/* All guide pages — used for the footer, "More guides" cards, sitemap and llms.txt. */
export const GUIDES = [
  { file: 'tamil-alphabet.html', ic: '🔤', en: 'Tamil alphabet — all 247 letters', ta: 'தமிழ் எழுத்துகள்' },
  { file: 'tamil-vowels.html', ic: '🌱', en: 'Tamil vowels (uyir ezhuthukal)', ta: 'உயிர் எழுத்துகள்' },
  { file: 'tamil-consonants.html', ic: '🧱', en: 'Tamil consonants (mei ezhuthukal)', ta: 'மெய் எழுத்துகள்' },
  { file: 'uyirmei-ezhuthukal.html', ic: '🧩', en: 'Uyirmei chart — 216 letters', ta: 'உயிர்மெய் எழுத்துகள்' },
  { file: 'tamil-words-for-kids.html', ic: '🍎', en: 'Tamil words for kids', ta: 'படச் சொற்கள்' },
  { file: 'tamil-stories-for-kids.html', ic: '📚', en: 'Tamil stories for kids', ta: 'சிறுவர் கதைகள்' },
  { file: 'ezhuthukal.html', ic: 'அ', en: 'Tamil letters — in Tamil', ta: 'தமிழில் எழுத்துகள்' },
  { file: 'tamil-numbers.html', ic: '🔢', en: 'Tamil numbers 1 to 10', ta: 'எண்கள்' },
  { file: 'tamil-colours.html', ic: '🎨', en: 'Colours in Tamil', ta: 'நிறங்கள்' },
  { file: 'tamil-days-of-the-week.html', ic: '📅', en: 'Days of the week in Tamil', ta: 'கிழமைகள்' },
  { file: 'tamil-body-parts.html', ic: '🧒', en: 'Body parts in Tamil', ta: 'உடல் உறுப்புகள்' },
  { file: 'tamil-family-words.html', ic: '👨‍👩‍👧', en: 'Family words in Tamil', ta: 'குடும்பம்' },
  { file: 'tamil-fruits-and-food.html', ic: '🍉', en: 'Fruits and food in Tamil', ta: 'பழங்களும் உணவும்' },
  { file: 'tamil-printables.html', ic: '🖨️', en: 'Free printable charts & worksheets', ta: 'அச்சிடும் தாள்கள்' }
];

const FLOAT = ['அ','க','ழ','ஆ','ம','இ','ஞ','ஃ','பூ','கா'];
const floaters = () => FLOAT.map((l, i) =>
  `<span style="left:${4 + (i * 61) % 90}%;top:${8 + (i * 37) % 76}%;font-size:${30 + (i * 13) % 40}px;--t:${7 + i % 5}s;--dl:${-i * 0.7}s">${l}</span>`).join('');

/* ---------- shared page shell (kid-friendly hero, schema, footer) ---------- */
export function shell({ file, title, description, h1, eyebrow, body, schema = [], ogType = 'article',
                        lang = 'en', alternates = [], bubble = '', guide = false }) {
  const url = SITE + (file === 'index.html' ? '' : file);
  const plainH1 = h1.replace(/<[^>]+>/g, '');
  const T = lang === 'ta'
    ? { updated: 'புதுப்பிக்கப்பட்டது', by: 'எழுதியவர்', open: 'செயலியைத் திற', more: 'மேலும் படிக்க' }
    : { updated: 'Updated', by: 'By', open: 'Open the learning app', more: 'More guides' };
  const graph = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': url + '#page', url, name: title, description, inLanguage: lang,
      isPartOf: { '@id': SITE + '#website' }, author: { '@id': SITE + '#author' }, dateModified: TODAY,
      primaryImageOfPage: SITE + 'assets/og-image.png' },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Learn Tamil', item: SITE },
      { '@type': 'ListItem', position: 2, name: plainH1, item: url } ] },
    ...(guide ? [{ '@type': 'Article', '@id': url + '#article', headline: title.slice(0, 110), description,
      inLanguage: lang, image: SITE + 'assets/og-image.png', datePublished: PUBLISHED, dateModified: TODAY,
      author: { '@type': 'Person', '@id': SITE + '#author', name: 'Suthahar Jegatheesan', url: 'https://blog.msdevbuild.com/about/' },
      publisher: { '@id': SITE + '#author' }, mainEntityOfPage: { '@id': url + '#page' },
      isAccessibleForFree: true, educationalLevel: 'Beginner',
      audience: { '@type': 'EducationalAudience', educationalRole: 'student' } }] : []),
    ...schema ] };
  const alt = alternates.map(a => `<link rel="alternate" hreflang="${a.hreflang}" href="${SITE}${a.file}">`).join('\n');
  const more = guide ? `
<section class="more-guides" aria-labelledby="moreT">
  <h2 id="moreT"><span class="h-ic" aria-hidden="true">🧭</span>${T.more}</h2>
  <div class="guides">${GUIDES.filter(g => g.file !== file).map(g =>
    `<a class="guide-card" href="${g.file}"><span class="gc-ic" aria-hidden="true">${g.ic}</span><b>${g.en}</b><span class="ta">${g.ta}</span></a>`).join('')}</div>
  ${SUPPORT}
  <a class="cta-app" href="./"><span aria-hidden="true">🎮</span> ${lang === 'ta' ? 'ஒலியுடன் கற்க செயலியைத் திறக்கவும்' : 'Hear every letter — open the free learning app'} →</a>
</section>` : '';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${alt}
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Suthahar Jegatheesan">
<meta name="theme-color" content="#0078d4">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Learn Tamil · MSDEVBUILD">
<meta property="og:locale" content="${lang === 'ta' ? 'ta_IN' : 'en_US'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Learn Tamil — தமிழ் எழுத்துகள், 247 letters">
${guide ? `<meta property="article:published_time" content="${PUBLISHED}">\n<meta property="article:modified_time" content="${TODAY}">\n<meta property="article:author" content="Suthahar Jegatheesan">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Learn Tamil">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="application-name" content="Learn Tamil">
<script>try{var t=localStorage.getItem('lt-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700;800&family=Baloo+Thambi+2:wght@600;700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body class="doc-page">
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="./" aria-label="Learn Tamil — home">
      <span class="brand-mark" aria-hidden="true">அ</span>
      <span class="brand-name">MSDEVBUILD<small>Learn Tamil · <span class="ta">தமிழ் கற்போம்</span></small></span>
    </a>
    <span class="spacer"></span>
    <a class="btn primary small" href="./"><span aria-hidden="true">🎮</span> <span class="hide-sm">${T.open} </span>→</a>
  </div>
</header>
<main class="wrap doc">
  <section class="doc-hero">
    <div class="floaters" aria-hidden="true">${floaters()}</div>
    <div class="doc-hero-in">
      <div>
        <nav class="crumbs" aria-label="Breadcrumb"><a href="./">Learn Tamil</a> › <span>${plainH1}</span></nav>
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
        <h1>${h1}</h1>
        <p class="doc-meta">${T.updated} <time datetime="${TODAY}">${new Date(TODAY).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time> · ${T.by} <a href="https://blog.msdevbuild.com/about/" rel="author">Suthahar Jegatheesan</a></p>
      </div>
      <div class="doc-mascot" aria-hidden="true"><span class="bird">🦜</span>${bubble ? `<span class="bubble">${bubble}</span>` : ''}</div>
    </div>
  </section>
${body}
${more}
</main>
${FOOTER}
<script src="js/pwa.js"></script>
<script type="module" src="js/firebase.js"></script>
<script src="js/support.js" defer></script>
<script src="js/faq-data.js"></script>
<script src="js/chat.js"></script>
</body>
</html>
`;
}
export const FOOTER = `<footer>
  <div class="wrap foot">
    <div><b>Learn Tamil</b> · <span class="ta">தமிழ் கற்போம்</span><br><span class="muted">Free Tamil alphabet lessons, reading and games for children. No sign-up, no ads.</span></div>
    <nav class="foot-links" aria-label="Footer">
      <a href="./">Learning app</a>
      <a href="privacy.html">Privacy &amp; data</a>
      <a href="terms.html">Terms</a>
      <a href="${ISSUES_URL}" rel="noopener">Report an issue / feedback</a>
      <a href="https://blog.msdevbuild.com/contact/" rel="noopener">Contact</a>
      <a class="coffee-link" href="${COFFEE_URL}" target="_blank" rel="noopener">☕ Buy me a coffee</a>
    </nav>
    <nav class="foot-guides" aria-label="Guides"><b>Guides:</b> ${GUIDES.map(g => `<a href="${g.file}">${g.en}</a>`).join(' · ')}</nav>
    <p class="foot-disc"><b>Disclaimer:</b> Sounds are played by your device's text-to-speech voice and may sometimes be incorrect. If you hear any mistake in the voice, please <a href="${ISSUES_URL}" rel="noopener">report it here as an issue</a>.</p>
    <div class="muted">© 2026 <a href="https://blog.msdevbuild.com" rel="noopener">MSDEVBUILD</a> · Suthahar Jegatheesan</div>
  </div>
</footer>`;

/* ---------- Tamil alphabet page ---------- */
const kuril = VOWELS.filter(v => v.len === 'குறில்'), nedil = VOWELS.filter(v => v.len === 'நெடில்');
const vowelRows = VOWELS.map(v => `<tr><td class="L ta">${v.l}</td><td>${v.r}</td><td class="ta">${v.len}</td><td>${esc(v.hint)}</td><td><span class="ta">${v.ex[1]}</span> — ${esc(v.ex[2])}</td></tr>`).join('');
const meiByGroup = g => CONS.filter(k => k.g === g);
const meiRows = CONS.map(k => `<tr><td class="L ta">${k.c + PULLI}</td><td>${k.r}</td><td class="ta">${GROUPS[k.g].ta}</td><td>${esc(k.hint)}</td><td><span class="ta">${k.ex[1]}</span> — ${esc(k.ex[2])}</td></tr>`).join('');
const umHead = '<tr><th scope="col"></th>' + VOWELS.map(v => `<th scope="col" class="ta">${v.l}</th>`).join('') + '</tr>';
const umRows = CONS.map(k => `<tr><th scope="row" class="ta">${k.c + PULLI}</th>` +
  VOWELS.map(v => `<td><span class="ta">${k.c + v.s}</span><small>${k.r + v.r}</small></td>`).join('') + '</tr>').join('');
const wordsList = WORDS.map(([w, e, m]) => `<li><span aria-hidden="true">${e}</span> <span class="ta">${w}</span> — ${esc(m)}</li>`).join('');

export const FAQ = [
  ['How many letters are there in the Tamil alphabet?',
   `There are 247 letters in the Tamil alphabet: 12 vowels (உயிர் எழுத்துகள், uyir ezhuthukal), 18 consonants (மெய் எழுத்துகள், mei ezhuthukal), 1 special letter ஃ (ஆய்த எழுத்து, aaytha ezhuthu) and 216 consonant-vowel letters (உயிர்மெய் எழுத்துகள், uyirmei ezhuthukal). 12 + 18 + 1 + 216 = 247.`],
  ['What are the 12 Tamil vowels (uyir ezhuthukal)?',
   `The 12 Tamil vowels are ${VOWELS.map(v => v.l).join(' ')}. Five are short (குறில், kuril): ${kuril.map(v => v.l).join(' ')}. Seven are long (நெடில், nedil): ${nedil.map(v => v.l).join(' ')}.`],
  ['What are the 18 Tamil consonants (mei ezhuthukal)?',
   `The 18 Tamil consonants are ${CONS.map(k => k.c + PULLI).join(' ')}. Each is written with a dot on top called புள்ளி (pulli). They form three groups of six: வல்லினம் (vallinam, hard) ${meiByGroup('v').map(k => k.c + PULLI).join(' ')}; மெல்லினம் (mellinam, soft) ${meiByGroup('m').map(k => k.c + PULLI).join(' ')}; இடையினம் (idaiyinam, medium) ${meiByGroup('i').map(k => k.c + PULLI).join(' ')}.`],
  ['What are uyirmei letters and why are there 216?',
   `An uyirmei (உயிர்மெய்) letter is a consonant joined with a vowel, for example க் + அ = க, க் + ஆ = கா, க் + இ = கி. Each of the 18 consonants combines with each of the 12 vowels, so 18 × 12 = 216 uyirmei letters.`],
  ['What is the Tamil letter ஃ (aaytham)?',
   `ஃ is the ஆய்த எழுத்து (aaytha ezhuthu), also called அஃகேனம் or முப்புள்ளி (three dots). It is a single special letter that comes between a short vowel and a வல்லினம் letter, as in எஃகு (steel) and அஃது (that).`],
  ['How do you pronounce ழ (zha) in Tamil?',
   `ழ (romanised "zh") is made by curling the tip of the tongue far back and letting the sound flow, somewhere between an "r" and an "l". It is heard in the word தமிழ் (Tamil). It is different from ல (l, as in "love") and ள (ḷ, l with the tongue curled back).`],
  ['Are ஜ, ஷ, ஸ, ஹ part of the 247 Tamil letters?',
   `No. ஜ, ஷ, ஸ, ஹ, க்ஷ and ஸ்ரீ are Grantha letters used for words borrowed from other languages. They are widely used but are not counted in the 247 letters of the Tamil alphabet.`],
  ['What is the best way for a child to start learning Tamil letters?',
   `Start with the 12 uyir (vowel) letters and their sounds, then learn the 18 mei (consonant) letters. Next, learn uyirmei letters one consonant row at a time (க கா கி கீ …), then read simple two-letter words such as ஆடு (goat) and மீன் (fish). Short daily practice with sound and pictures works best.`],
  ['Is Learn Tamil free to use?',
   `Yes. Learn Tamil is completely free, needs no sign-up, shows no ads and does not track users. It works in any modern browser on phones, tablets and computers.`]
];
/* ---------- generic helpers for guide pages ---------- */
const faqSchemaFor = (list, file) => ({ '@type': 'FAQPage', '@id': SITE + file + '#faq',
  mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const faqHtmlFor = list => list.map(([q, a]) => `<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n');
export const faqSchema = () => faqSchemaFor(FAQ, 'tamil-alphabet.html');
export const faqHtml = () => faqHtmlFor(FAQ);
const h2 = (id, ic, html) => `<h2 id="${id}"><span class="h-ic" aria-hidden="true">${ic}</span>${html}</h2>`;
const tip = html => `<div class="tip"><span aria-hidden="true">💡</span><p>${html}</p></div>`;
const seg = new Intl.Segmenter('ta', { granularity: 'grapheme' });
const lettersOf = w => [...seg.segment(w.normalize('NFC'))].map(x => x.segment);
const ta = s => `<span class="ta">${s}</span>`;
const vowelCard = (v, lang = 'en') => `<div class="lcard f-uyir"><span class="lc-l ta">${v.l}</span><span class="lc-r">${v.r}</span>` +
  `<span class="lc-b ${v.len === 'குறில்' ? 'short' : 'long'}">${v.len}${lang === 'en' ? (v.len === 'குறில்' ? ' · short' : ' · long') : ''}</span>` +
  `<span class="lc-e" aria-hidden="true">${v.ex[0]}</span><span class="lc-w ta">${v.ex[1]}</span>${lang === 'en' ? `<span class="lc-m">${esc(v.ex[2])}</span>` : ''}</div>`;
const consCard = (k, lang = 'en') => `<div class="lcard f-mei"><span class="lc-l ta">${k.c + PULLI}</span><span class="lc-r">${k.r}</span>` +
  `<span class="lc-e" aria-hidden="true">${k.ex[0]}</span><span class="lc-w ta">${k.ex[1]}</span>${lang === 'en' ? `<span class="lc-m">${esc(k.ex[2])}</span>` : ''}</div>`;
const cards = arr => `<div class="lcards">${arr.join('')}</div>`;
const DTS = (file, name, terms) => ({ '@type': 'DefinedTermSet', '@id': SITE + file + '#terms', name,
  hasDefinedTerm: terms.map(([n, d]) => ({ '@type': 'DefinedTerm', name: n, description: d, inDefinedTermSet: SITE + file + '#terms' })) });
const ALT = [{ hreflang: 'en', file: 'tamil-alphabet.html' }, { hreflang: 'ta', file: 'ezhuthukal.html' }, { hreflang: 'x-default', file: 'tamil-alphabet.html' }];
const write = (file, html) => fs.writeFileSync(path.join(ROOT, file), html);

/* ---------- 1. Tamil alphabet (overview) ---------- */
const alphabetBody = `
<p class="lead-doc"><strong>The Tamil alphabet has 247 letters</strong>: 12 vowels (${ta('உயிர்')}), 18 consonants (${ta('மெய்')}), 1 special letter (${ta('ஆய்தம்')} ஃ) and 216 consonant-vowel letters (${ta('உயிர்மெய்')}). This page lists every letter with its romanised sound, a pronunciation tip and an example word. To <em>hear</em> each letter, use the free <a href="./">Learn Tamil app</a>. <a href="ezhuthukal.html" hreflang="ta" lang="ta">இந்தப் பக்கத்தைத் தமிழில் படிக்க →</a></p>

<div class="sum-grid">
  <div class="glass"><b>12</b>${ta('உயிர்')}<small>vowels</small></div>
  <div class="glass"><b>18</b>${ta('மெய்')}<small>consonants</small></div>
  <div class="glass"><b>1</b>${ta('ஆய்தம்')}<small>special letter</small></div>
  <div class="glass"><b>216</b>${ta('உயிர்மெய்')}<small>18 × 12</small></div>
  <div class="glass total"><b>247</b>${ta('மொத்தம்')}<small>total</small></div>
</div>

<nav class="toc glass" aria-label="On this page"><b>On this page</b>
<a href="#uyir">12 vowels</a><a href="#mei">18 consonants</a><a href="#aytham">ஆய்தம் ஃ</a><a href="#uyirmei">216 uyirmei chart</a><a href="#words">Picture words</a><a href="#faq">FAQ</a></nav>

${h2('uyir', '🌱', `Tamil vowels — ${ta('உயிர் எழுத்துகள்')} (12)`)}
<p>Tamil has 12 vowels. Five are short (${ta('குறில்')}): ${ta(kuril.map(v => v.l).join(' '))}. Seven are long (${ta('நெடில்')}): ${ta(nedil.map(v => v.l).join(' '))}. <a href="tamil-vowels.html">Full guide to Tamil vowels →</a></p>
<div class="tbl"><table><thead><tr><th>Letter</th><th>Sound</th><th>Length</th><th>How to say it</th><th>Example</th></tr></thead><tbody>${vowelRows}</tbody></table></div>

${h2('mei', '🧱', `Tamil consonants — ${ta('மெய் எழுத்துகள்')} (18)`)}
<p>Each consonant is written with a dot on top (${ta('புள்ளி')}, pulli). They form three groups of six: ${ta('வல்லினம்')} (hard) ${ta(meiByGroup('v').map(k => k.c + PULLI).join(' '))}, ${ta('மெல்லினம்')} (soft) ${ta(meiByGroup('m').map(k => k.c + PULLI).join(' '))} and ${ta('இடையினம்')} (medium) ${ta(meiByGroup('i').map(k => k.c + PULLI).join(' '))}. <a href="tamil-consonants.html">Full guide to Tamil consonants →</a></p>
<div class="tbl"><table><thead><tr><th>Letter</th><th>Sound</th><th>Group</th><th>How to say it</th><th>Example word</th></tr></thead><tbody>${meiRows}</tbody></table></div>

${h2('aytham', '✨', `The special letter — ${ta('ஆய்த எழுத்து')} ஃ (1)`)}
<p><span class="ta big-inline">ஃ</span> is called ${ta('ஆய்தம்')}, ${ta('அஃகேனம்')} or ${ta('முப்புள்ளி')} (three dots). It comes between a short vowel and a ${ta('வல்லினம்')} letter, as in ${ta('எஃகு')} (steel) and ${ta('அஃது')} (that). Its sound is a soft, breathy “kh”.</p>

${h2('uyirmei', '🧩', `Uyirmei chart — ${ta('உயிர்மெய் எழுத்துகள்')} (216)`)}
<p>Every consonant joins every vowel: ${ta('க் + அ = க')}, ${ta('க் + ஆ = கா')}, ${ta('க் + இ = கி')} … 18 consonants × 12 vowels = 216 letters. Rows are consonants, columns are vowels. <a href="uyirmei-ezhuthukal.html">How to read and write uyirmei letters →</a></p>
<div class="tbl um-static"><table><thead>${umHead}</thead><tbody>${umRows}</tbody></table></div>

${h2('words', '🍎', 'First Tamil words to read')}
<p>After the letters, children can read these ${WORDS.length} simple picture words. See them with letter-by-letter breakdowns in <a href="tamil-words-for-kids.html">Tamil words for kids</a>, or practise in the <a href="./#/reading">Reading section</a> of the app.</p>
<ul class="word-list">${wordsList}</ul>

${h2('faq', '❓', 'Frequently asked questions')}
<div class="faq">${faqHtml()}</div>

<p class="doc-note">Romanisation is a simple guide for beginners; listen to a teacher or the app for exact sounds. Found a mistake, a wrong sound or a bug? Please report it on <a href="${ISSUES_URL}" rel="noopener">GitHub Issues</a>.</p>
`;
write('tamil-alphabet.html', shell({
  file: 'tamil-alphabet.html', guide: true, alternates: ALT, bubble: 'All 247 letters!',
  title: 'Tamil Alphabet: All 247 Letters with Pronunciation Chart',
  description: 'The Tamil alphabet has 247 letters: 12 vowels (uyir), 18 consonants (mei), ஃ and 216 uyirmei. Full chart with sounds, pronunciation tips and example words.',
  h1: 'Tamil Alphabet — all 247 letters <span class="ta">(தமிழ் எழுத்துகள்)</span>',
  eyebrow: 'Chart · Pronunciation · Examples', body: alphabetBody,
  schema: [{ '@type': 'LearningResource', '@id': SITE + 'tamil-alphabet.html#resource',
    name: 'Tamil Alphabet: all 247 letters with pronunciation', inLanguage: ['ta', 'en'],
    learningResourceType: ['Chart', 'Reference'], educationalLevel: 'Beginner', isAccessibleForFree: true,
    teaches: ['Tamil vowels (uyir ezhuthukal)', 'Tamil consonants (mei ezhuthukal)', 'Uyirmei letters', 'Aaytham'],
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' }, author: { '@id': SITE + '#author' } },
    faqSchema()]
}));

/* ---------- 2. Tamil vowels ---------- */
const SIGN_EX = VOWELS.map(v => `<tr><td class="L ta">${v.l}</td><td class="ta sign">${v.s ? '◌' + v.s : '—'}</td><td class="ta">க் + ${v.l} = <b>${'க' + v.s}</b></td><td>${'k' + v.r}</td></tr>`).join('');
const VOWEL_FAQ = [
  ['Why are Tamil vowels called uyir (life)?', 'In Tamil grammar the vowels are called உயிர் (uyir, “life”) and the consonants மெய் (mei, “body”). When a consonant joins a vowel it becomes உயிர்மெய் (uyirmei, “life + body”), like a body that comes alive.'],
  ['What is the difference between kuril and nedil?', 'குறில் (kuril) vowels are short and are held for about one beat (one மாத்திரை, maathirai). நெடில் (nedil) vowels are long and are held for about two beats. The short vowels are அ இ உ எ ஒ and the long vowels are ஆ ஈ ஊ ஏ ஐ ஓ ஔ.'],
  ['What are mudhal ezhuthukal (primary letters)?', 'The 12 vowels and 18 consonants together — 30 letters — are called முதல் எழுத்துகள் (mudhal ezhuthukal, primary letters). Uyirmei letters and ஃ belong to the சார்பு எழுத்துகள் (saarbu ezhuthukal, dependent letters).'],
  ['How are Tamil vowels written after a consonant?', 'After a consonant, each vowel (except அ) is written as a vowel sign: ா for ஆ, ி for இ, ீ for ஈ, ு for உ, ூ for ஊ, ெ for எ, ே for ஏ, ை for ஐ, ொ for ஒ, ோ for ஓ and ௌ for ஔ. For example க் + ஆ = கா and க் + ஐ = கை. With அ the consonant simply loses its dot: க் + அ = க.']
];
write('tamil-vowels.html', shell({
  file: 'tamil-vowels.html', guide: true, bubble: "Let's learn the 12 vowels!",
  title: 'Tamil Vowels (Uyir Ezhuthukal): 12 Letters with Sounds',
  description: 'Learn the 12 Tamil vowels (உயிர் எழுத்துகள்): 5 short kuril and 7 long nedil, with sounds, vowel signs and picture words for kids.',
  h1: 'Tamil vowels — <span class="ta">உயிர் எழுத்துகள்</span>', eyebrow: '12 letters · Kuril & Nedil · Vowel signs',
  body: `
<p class="lead-doc">Tamil has <strong>12 vowels</strong>, called ${ta('உயிர் எழுத்துகள்')} (uyir ezhuthukal). “Uyir” means <em>life</em> — vowels give life to every other letter. Five vowels are short (${ta('குறில்')}) and seven are long (${ta('நெடில்')}).</p>
${h2('all', '🌱', 'The 12 Tamil vowels')}
${cards(VOWELS.map(v => vowelCard(v)))}
${tip(`Tap any vowel in the <a href="./#/uyir">learning app</a> to hear it, then hear it again inside its picture word.`)}
${h2('kuril-nedil', '⏱️', `Short and long — ${ta('குறில்')} and ${ta('நெடில்')}`)}
<p>A short vowel is held for about one beat, a long vowel for about two. Five vowels come in short–long pairs; ${ta('ஐ')} and ${ta('ஔ')} are long vowels without a short partner.</p>
<div class="pairs">${[['அ', 'ஆ'], ['இ', 'ஈ'], ['உ', 'ஊ'], ['எ', 'ஏ'], ['ஒ', 'ஓ']].map(([a, b]) => `<div class="pair"><span class="ta s">${a}</span><span class="arrow" aria-hidden="true">→</span><span class="ta l">${b}</span></div>`).join('')}<div class="pair solo"><span class="ta l">ஐ</span><span class="ta l">ஔ</span></div></div>
${h2('signs', '✍️', 'Vowel signs — how vowels join consonants')}
<p>After a consonant, a vowel is written as a small sign. Here is every vowel with ${ta('க்')}:</p>
<div class="tbl"><table><thead><tr><th>Vowel</th><th>Sign</th><th>With க்</th><th>Sound</th></tr></thead><tbody>${SIGN_EX}</tbody></table></div>
${tip(`${ta('ொ ோ ௌ')} are written in two parts — one before and one after the consonant: ${ta('கொ')} has ${ta('ெ')} before ${ta('க')} and ${ta('ா')} after it. See all 216 combinations in the <a href="uyirmei-ezhuthukal.html">uyirmei chart</a>.`)}
${h2('faq', '❓', 'Questions about Tamil vowels')}
<div class="faq">${faqHtmlFor(VOWEL_FAQ)}</div>`,
  schema: [faqSchemaFor(VOWEL_FAQ, 'tamil-vowels.html'),
    DTS('tamil-vowels.html', 'Tamil vowels (uyir ezhuthukal)', VOWELS.map(v => [v.l, `Tamil vowel “${v.r}”, ${v.len === 'குறில்' ? 'short (kuril)' : 'long (nedil)'}; ${v.hint}. Example: ${v.ex[1]} (${v.ex[2]}).`]))]
}));

/* ---------- 3. Tamil consonants ---------- */
const TRICKY = [
  ['Three “n” letters', [['ந', 'n — tongue at the teeth; mostly at the start of a word or before த', 'நாய் (dog)'], ['ன', 'ṉ — tongue at the gum; mostly in the middle or end of a word', 'மீன் (fish)'], ['ண', 'ṇ — tongue curled back', 'கண் (eye)']]],
  ['Three “l” letters', [['ல', 'l — as in “love”', 'பல் (tooth)'], ['ள', 'ḷ — tongue curled back', 'தேள் (scorpion)'], ['ழ', 'zh — tongue curled far back, special to Tamil', 'தமிழ் (Tamil)']]],
  ['Two “r” letters', [['ர', 'r — soft tapped r', 'நீர் (water)'], ['ற', 'ṟ — strong trilled r', 'காற்று (wind)']]]
];
const INAM = [['க', 'ங', 'சிங்கம்', 'lion'], ['ச', 'ஞ', 'மஞ்சள்', 'turmeric'], ['ட', 'ண', 'வண்டு', 'beetle'], ['த', 'ந', 'பந்து', 'ball'], ['ப', 'ம', 'பாம்பு', 'snake'], ['ற', 'ன', 'கன்று', 'calf']];
const CONS_FAQ = [
  ['Why do Tamil consonants have a dot on top?', 'The dot is called புள்ளி (pulli). It shows a pure consonant with no vowel sound, for example க் (k). When a vowel is added the dot goes away: க் + அ = க (ka).'],
  ['What is the difference between ந, ன and ண?', 'All three are “n” sounds. ந is said with the tongue at the teeth and mostly starts words (நாய்) or comes before த (பந்து). ன is said with the tongue at the gum and comes in the middle or end of words (மீன்). ண is said with the tongue curled back (கண்).'],
  ['What do vallinam, mellinam and idaiyinam mean?', 'They are the three groups of Tamil consonants. வல்லினம் (vallinam) are hard sounds: க் ச் ட் த் ப் ற். மெல்லினம் (mellinam) are soft, nasal sounds: ங் ஞ் ண் ந் ம் ன். இடையினம் (idaiyinam) are in-between sounds: ய் ர் ல் வ் ழ் ள்.'],
  ['How do you say a Tamil consonant on its own?', 'In school a pure consonant is usually read with a short இ before it, so க் is said “ik” and ங் is said “ing”. This makes the consonant sound easy to hear.']
];
write('tamil-consonants.html', shell({
  file: 'tamil-consonants.html', guide: true, bubble: '18 consonants — let’s go!',
  title: 'Tamil Consonants (Mei Ezhuthukal): 18 Letters & Sounds',
  description: 'Learn the 18 Tamil consonants (மெய் எழுத்துகள்): vallinam, mellinam, idaiyinam, the pulli dot and tricky letters ந ன ண, ல ள ழ, ர ற — with examples.',
  h1: 'Tamil consonants — <span class="ta">மெய் எழுத்துகள்</span>', eyebrow: '18 letters · 3 groups · Tricky sounds',
  body: `
<p class="lead-doc">Tamil has <strong>18 consonants</strong>, called ${ta('மெய் எழுத்துகள்')} (mei ezhuthukal). “Mei” means <em>body</em>. Each one is written with a dot on top — the ${ta('புள்ளி')} (pulli) — which means “no vowel yet”.</p>
${['v', 'm', 'i'].map(g => `${h2('g-' + g, g === 'v' ? '🥁' : g === 'm' ? '🎵' : '🌊', `${ta(GROUPS[g].ta)} — ${GROUPS[g].en.toLowerCase()} (6)`)}\n${cards(meiByGroup(g).map(k => consCard(k)))}`).join('\n')}
${tip(`In class, pure consonants are read with a short ${ta('இ')} in front: ${ta('க்')} is said “ik”. Hear all 18 in the <a href="./#/mei">learning app</a>.`)}
${h2('tricky', '👂', 'Tricky letters that sound alike')}
${TRICKY.map(([t, rows]) => `<h3>${t}</h3><div class="tbl"><table><thead><tr><th>Letter</th><th>How to say it</th><th>Example</th></tr></thead><tbody>${rows.map(([l, h, e]) => `<tr><td class="L ta">${l}</td><td>${esc(h)}</td><td class="ta">${e}</td></tr>`).join('')}</tbody></table></div>`).join('')}
${h2('pairs', '🤝', 'Hard and soft partners')}
<p>Each hard letter (${ta('வல்லினம்')}) has a soft partner (${ta('மெல்லினம்')}) that often comes just before it inside a word:</p>
<div class="tbl"><table><thead><tr><th>Soft + hard</th><th>Example word</th></tr></thead><tbody>${INAM.map(([h, s, w, m]) => `<tr><td class="ta">${s + PULLI} + ${h}</td><td>${ta(w)} — ${m}</td></tr>`).join('')}</tbody></table></div>
${h2('faq', '❓', 'Questions about Tamil consonants')}
<div class="faq">${faqHtmlFor(CONS_FAQ)}</div>`,
  schema: [faqSchemaFor(CONS_FAQ, 'tamil-consonants.html'),
    DTS('tamil-consonants.html', 'Tamil consonants (mei ezhuthukal)', CONS.map(k => [k.c + PULLI, `Tamil consonant “${k.r}”, ${GROUPS[k.g].ta} (${GROUPS[k.g].en.toLowerCase()}); ${k.hint}. Example: ${k.ex[1]} (${k.ex[2]}).`]))]
}));

/* ---------- 4. Uyirmei ---------- */
const ROWS = CONS.map(k => `<li><b class="ta">${k.c} வரிசை</b> <span class="ta">${VOWELS.map(v => k.c + v.s).join(' ')}</span></li>`).join('');
const UM_FAQ = [
  ['How do you read the uyirmei chart?', 'Each row is a consonant and each column is a vowel. Find the consonant on the left and the vowel at the top; the letter where they meet is the uyirmei letter. For example, row ம் and column ஆ give மா.'],
  ['How many uyirmei letters are short and how many are long?', 'An uyirmei letter is short or long depending on its vowel. With the 5 short vowels there are 18 × 5 = 90 short (குறில்) uyirmei letters, and with the 7 long vowels there are 18 × 7 = 126 long (நெடில்) uyirmei letters. 90 + 126 = 216.'],
  ['What is க வரிசை (the ka row)?', 'க வரிசை is the row of 12 letters made from க்: க கா கி கீ கு கூ கெ கே கை கொ கோ கௌ. Children usually learn uyirmei one row at a time, starting with this row.'],
  ['Which uyirmei letters are hardest to write?', 'The உ and ஊ forms (like கு, சு, டு, து, பு and கூ, சூ, டூ) change shape for each consonant, so they are best learned row by row. The ொ, ோ and ௌ forms are written on both sides of the consonant, as in கொ, கோ and கௌ.']
];
write('uyirmei-ezhuthukal.html', shell({
  file: 'uyirmei-ezhuthukal.html', guide: true, bubble: 'Mix and match letters!',
  title: 'Uyirmei Ezhuthukal Chart: All 216 Tamil Letters',
  description: 'Full uyirmei ezhuthukal (உயிர்மெய் எழுத்துகள்) chart: how 18 consonants join 12 vowels to make 216 Tamil letters, with sounds, rows and writing tips.',
  h1: 'Uyirmei chart — <span class="ta">உயிர்மெய் எழுத்துகள்</span> (216)', eyebrow: '18 × 12 · Chart · Writing tips',
  body: `
<p class="lead-doc">An <strong>uyirmei</strong> letter (${ta('உயிர்மெய்')}, “life + body”) is a consonant joined with a vowel. Each of the 18 consonants joins each of the 12 vowels, so there are <strong>18 × 12 = 216</strong> uyirmei letters — 90 short and 126 long.</p>
<div class="formula" aria-label="க் plus அ equals க"><span class="ta m">க்</span><span class="op">+</span><span class="ta u">அ</span><span class="op">=</span><span class="ta r">க</span><span class="sep"></span><span class="ta m">க்</span><span class="op">+</span><span class="ta u">ஆ</span><span class="op">=</span><span class="ta r">கா</span></div>
${h2('chart', '🧩', 'The full uyirmei chart')}
<p>Rows are consonants, columns are vowels. Build any letter yourself in the <a href="./#/uyirmei">learning app</a>.</p>
<div class="tbl um-static"><table><thead>${umHead}</thead><tbody>${umRows}</tbody></table></div>
${h2('rows', '📋', 'All 18 rows (வரிசை)')}
<ul class="rows">${ROWS}</ul>
${tip('Learn one row a day: say the row aloud, write it, then find those letters in simple words.')}
${h2('faq', '❓', 'Questions about uyirmei letters')}
<div class="faq">${faqHtmlFor(UM_FAQ)}</div>`,
  schema: [faqSchemaFor(UM_FAQ, 'uyirmei-ezhuthukal.html')]
}));

/* ---------- 5. Words for kids ---------- */
const lvl = w => { const n = lettersOf(w).length; return n <= 2 ? 1 : n === 3 ? 2 : 3; };
const ANIMALS = new Set(['ஆடு', 'மான்', 'மீன்', 'பூனை', 'நாய்', 'எலி', 'பசு', 'யானை', 'கிளி', 'ஆமை', 'கோழி', 'பாம்பு', 'முயல்', 'தவளை', 'குதிரை', 'கரடி', 'மயில்', 'வாத்து', 'சிங்கம்', 'குரங்கு', 'ஒட்டகம்']);
const wordCard = ([w, e, m]) => `<div class="wcard"><span class="wc-e" aria-hidden="true">${e}</span><span class="wc-w ta">${w}</span><span class="wc-b ta">${lettersOf(w).join(' + ')}</span><span class="wc-m">${esc(m)}</span></div>`;
const animals = WORDS.filter(w => ANIMALS.has(w[0]));
const WORD_FAQ = [
  ['What are the first Tamil words a child should learn?', 'Short two-letter words with clear pictures are best to start: ஆடு (goat), மீன் (fish), பூனை (cat), நாய் (dog), இலை (leaf), வீடு (house) and நிலா (moon). Then move on to three-letter words like மரம் (tree) and பந்து (ball).'],
  ['What are the names of animals in Tamil?', 'Some animal names in Tamil: ' + animals.map(([w, , m]) => `${w} (${m})`).join(', ') + '.'],
  ['How can I help my child read Tamil words?', 'Point to each letter and say its sound, then blend the sounds together: ஆ + டு = ஆடு. Start with two-letter words, use pictures, and practise a few words every day. The Reading section of the Learn Tamil app does this letter by letter with sound.']
];
write('tamil-words-for-kids.html', shell({
  file: 'tamil-words-for-kids.html', guide: true, bubble: 'Read with me!',
  title: 'Simple Tamil Words for Kids with Pictures (46 Words)',
  description: '46 easy Tamil words for children with pictures, English meanings and letter-by-letter breakdown — ஆடு, மீன், பூனை, யானை and more, in three reading levels.',
  h1: 'Tamil words for kids — <span class="ta">படச் சொற்கள்</span>', eyebrow: '46 words · Pictures · 3 levels',
  body: `
<p class="lead-doc">Here are <strong>${WORDS.length} simple Tamil words</strong> for children, each with a picture, its English meaning and the letters it is made of. Start with Level 1 (two letters) and move up. Practise them with sound in the <a href="./#/reading">Reading section</a> of the app.</p>
${[1, 2, 3].map(L => `${h2('level-' + L, ['🐣', '🐥', '🦅'][L - 1], `Level ${L} — ${L === 3 ? '4 or more' : L + 1} letters`)}\n<div class="wcards">${WORDS.filter(w => lvl(w[0]) === L).map(wordCard).join('')}</div>`).join('\n')}
${tip('Cover the picture, let your child read the word, then uncover the picture to check. Celebrate every word!')}
${h2('faq', '❓', 'Questions about Tamil words for kids')}
<div class="faq">${faqHtmlFor(WORD_FAQ)}</div>`,
  schema: [faqSchemaFor(WORD_FAQ, 'tamil-words-for-kids.html'),
    DTS('tamil-words-for-kids.html', 'Simple Tamil words for children', WORDS.map(([w, , m]) => [w, `Tamil word meaning “${m}”. Letters: ${lettersOf(w).join(' + ')}.`]))]
}));

/* ---------- 6. Stories for kids ---------- */
const storyHtml = s => `<article class="story glass" id="${s.id}">
  <header class="st-head"><span class="st-cover" aria-hidden="true">${s.cover}</span><div><h3 class="ta">${s.title}</h3><p>${esc(s.en)} · <span class="badge">${s.lvl}</span></p></div></header>
  <ol class="st-pages">${s.pages.map(([e, t, en]) => `<li><span class="st-e" aria-hidden="true">${e}</span><div><p class="ta st-t">${t}</p><p class="st-en">${esc(en)}</p></div></li>`).join('')}</ol>
  <a class="st-listen" href="./#/stories">🔊 Listen to this story in the app</a>
</article>`;
const moralOf = id => { const s = STORIES.find(x => x.id === id); const p = s.pages[s.pages.length - 1]; return [`${s.title} (${s.en})`, p[1], p[2]]; };
const STORY_FAQ = [
  ['Which Tamil stories are good for young children?', 'Short stories with animals and a clear lesson work well: ' + STORIES.map(s => `${s.title} (${s.en})`).join(', ') + '. Each is told in a few simple sentences.'],
  ...['crow', 'lion', 'race'].map(id => { const [t, ta2, en] = moralOf(id); return [`What is the moral of ${t}?`, `The moral of ${t} is “${ta2}” — ${en}`]; })
];
write('tamil-stories-for-kids.html', shell({
  file: 'tamil-stories-for-kids.html', guide: true, bubble: 'Story time!',
  title: 'Short Tamil Stories for Kids with English Meaning',
  description: '5 short Tamil moral stories for children — காகமும் பானையும், சிங்கமும் எலியும், முயலும் ஆமையும் and more — in simple Tamil with English meaning.',
  h1: 'Tamil stories for kids — <span class="ta">சிறுவர் கதைகள்</span>', eyebrow: '5 stories · Simple Tamil · English meaning',
  body: `
<p class="lead-doc">${STORIES.length} short, simple Tamil stories for children, page by page with the English meaning. In the <a href="./#/stories">learning app</a> each story is read aloud and every word can be tapped to see its letters.</p>
<nav class="toc glass" aria-label="Stories"><b>Stories</b>${STORIES.map(s => `<a href="#${s.id}"><span class="ta">${s.title}</span></a>`).join('')}</nav>
${STORIES.map(storyHtml).join('\n')}
${h2('faq', '❓', 'Questions about Tamil stories')}
<div class="faq">${faqHtmlFor(STORY_FAQ)}</div>`,
  schema: [faqSchemaFor(STORY_FAQ, 'tamil-stories-for-kids.html'),
    { '@type': 'ItemList', name: 'Tamil stories for kids', itemListElement: STORIES.map((s, i) => ({ '@type': 'ListItem', position: i + 1,
      item: { '@type': 'ShortStory', name: s.title, alternateName: s.en, inLanguage: 'ta', url: SITE + 'tamil-stories-for-kids.html#' + s.id,
        author: { '@id': SITE + '#author' }, isAccessibleForFree: true, audience: { '@type': 'PeopleAudience', suggestedMinAge: 4, suggestedMaxAge: 10 } } })) }]
}));

/* ---------- 7. Tamil-language page ---------- */
const TA_FAQ = [
  ['தமிழில் எத்தனை எழுத்துகள் உள்ளன?', 'தமிழில் மொத்தம் 247 எழுத்துகள் உள்ளன: 12 உயிர் எழுத்துகள், 18 மெய் எழுத்துகள், 1 ஆய்த எழுத்து, 216 உயிர்மெய் எழுத்துகள்.'],
  ['உயிர் எழுத்துகள் யாவை?', 'அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ ஆகிய 12 எழுத்துகள் உயிர் எழுத்துகள். இவற்றில் அ, இ, உ, எ, ஒ ஆகிய ஐந்தும் குறில்; ஆ, ஈ, ஊ, ஏ, ஐ, ஓ, ஔ ஆகிய ஏழும் நெடில்.'],
  ['மெய் எழுத்துகள் யாவை?', `${CONS.map(k => k.c + PULLI).join(' ')} ஆகிய 18 எழுத்துகள் மெய் எழுத்துகள். இவை வல்லினம் (${meiByGroup('v').map(k => k.c + PULLI).join(' ')}), மெல்லினம் (${meiByGroup('m').map(k => k.c + PULLI).join(' ')}), இடையினம் (${meiByGroup('i').map(k => k.c + PULLI).join(' ')}) என மூன்று வகைப்படும்.`],
  ['உயிர்மெய் எழுத்துகள் எப்படி உருவாகின்றன?', 'மெய் எழுத்துடன் உயிர் எழுத்து சேர்ந்து உயிர்மெய் எழுத்து உருவாகிறது. எடுத்துக்காட்டு: க் + அ = க, க் + ஆ = கா. 18 மெய் × 12 உயிர் = 216 உயிர்மெய் எழுத்துகள்.'],
  ['ஆய்த எழுத்து என்றால் என்ன?', 'ஃ என்பது ஆய்த எழுத்து. இதை அஃகேனம், முப்புள்ளி என்றும் அழைப்பர். எடுத்துக்காட்டு: எஃகு, அஃது.'],
  ['முதல் எழுத்துகள் எவை?', 'உயிர் எழுத்துகள் 12, மெய் எழுத்துகள் 18 — ஆக 30 எழுத்துகளும் முதல் எழுத்துகள் எனப்படும். உயிர்மெய், ஆய்தம் ஆகியவை சார்பு எழுத்துகள் வகையைச் சேர்ந்தவை.'],
  ['ஜ, ஷ, ஸ, ஹ தமிழ் எழுத்துகளா?', 'ஜ, ஷ, ஸ, ஹ, க்ஷ, ஸ்ரீ ஆகியவை கிரந்த எழுத்துகள். பிறமொழிச் சொற்களை எழுத இவை பயன்படுகின்றன; 247 தமிழ் எழுத்துகளில் இவை சேர்க்கப்படுவதில்லை.']
];
write('ezhuthukal.html', shell({
  file: 'ezhuthukal.html', lang: 'ta', guide: true, alternates: ALT, bubble: 'வா, எழுத்துகளைக் கற்போம்!',
  title: 'தமிழ் எழுத்துகள் 247 — உயிர், மெய், உயிர்மெய் அட்டவணை',
  description: 'தமிழில் உள்ள 247 எழுத்துகள்: 12 உயிர், 18 மெய், ஆய்தம், 216 உயிர்மெய் எழுத்துகள் — குழந்தைகளுக்கான எளிய விளக்கம், எடுத்துக்காட்டுச் சொற்களுடன்.',
  h1: 'தமிழ் எழுத்துகள் — 247 எழுத்துகள்', eyebrow: 'உயிர் · மெய் · ஆய்தம் · உயிர்மெய்',
  body: `
<p class="lead-doc">தமிழில் மொத்தம் <strong>247 எழுத்துகள்</strong> உள்ளன: 12 உயிர் எழுத்துகள், 18 மெய் எழுத்துகள், 1 ஆய்த எழுத்து, 216 உயிர்மெய் எழுத்துகள். ஒவ்வொரு எழுத்தையும் ஒலியுடன் கேட்க <a href="./">கற்றல் செயலியைத்</a> திறக்கவும். <a href="tamil-alphabet.html" hreflang="en" lang="en">Read this page in English →</a></p>
<div class="sum-grid">
  <div class="glass"><b>12</b><span>உயிர்</span></div><div class="glass"><b>18</b><span>மெய்</span></div>
  <div class="glass"><b>1</b><span>ஆய்தம்</span></div><div class="glass"><b>216</b><span>உயிர்மெய்</span></div>
  <div class="glass total"><b>247</b><span>மொத்தம்</span></div>
</div>
${h2('uyir', '🌱', 'உயிர் எழுத்துகள் (12)')}
<p>அ, இ, உ, எ, ஒ ஆகிய ஐந்தும் குறில் எழுத்துகள்; ஆ, ஈ, ஊ, ஏ, ஐ, ஓ, ஔ ஆகிய ஏழும் நெடில் எழுத்துகள்.</p>
${cards(VOWELS.map(v => vowelCard(v, 'ta')))}
${h2('mei', '🧱', 'மெய் எழுத்துகள் (18)')}
<p>ஒவ்வொரு மெய் எழுத்தின் மேலும் ஒரு புள்ளி இருக்கும். இவை வல்லினம், மெல்லினம், இடையினம் என மூன்று வகைப்படும்.</p>
${['v', 'm', 'i'].map(g => `<h3>${GROUPS[g].ta}</h3>${cards(meiByGroup(g).map(k => consCard(k, 'ta')))}`).join('')}
${h2('aytham', '✨', 'ஆய்த எழுத்து (1)')}
<p><span class="big-inline">ஃ</span> — இதை அஃகேனம், முப்புள்ளி என்றும் அழைப்பர். எடுத்துக்காட்டு: எஃகு, அஃது.</p>
${h2('uyirmei', '🧩', 'உயிர்மெய் எழுத்துகள் (216)')}
<p>மெய் எழுத்துடன் உயிர் எழுத்து சேரும்போது உயிர்மெய் எழுத்து உருவாகிறது. எடுத்துக்காட்டு: க் + அ = க, க் + ஆ = கா. 18 × 12 = 216 உயிர்மெய் எழுத்துகள்.</p>
<div class="tbl um-static"><table><thead>${umHead}</thead><tbody>${umRows}</tbody></table></div>
${h2('grantha', '📝', 'கிரந்த எழுத்துகள்')}
<p>ஜ, ஷ, ஸ, ஹ, க்ஷ, ஸ்ரீ ஆகியவை கிரந்த எழுத்துகள். இவை பிறமொழிச் சொற்களை எழுதப் பயன்படுகின்றன; 247 எழுத்துகளில் சேர்க்கப்படுவதில்லை.</p>
${h2('faq', '❓', 'அடிக்கடி கேட்கப்படும் கேள்விகள்')}
<div class="faq">${faqHtmlFor(TA_FAQ)}</div>
<p class="doc-note">குரலில் ஏதேனும் தவறு இருந்தால், தயவுசெய்து <a href="${ISSUES_URL}" rel="noopener">இங்கே தெரிவிக்கவும்</a>.</p>`,
  schema: [faqSchemaFor(TA_FAQ, 'ezhuthukal.html')]
}));

/* ---------- 8. Word-topic pages (numbers, colours, days, body, family, food) ---------- */
const topicWords = id => TOPICS.find(t => t.id === id).words;
const list = (id, sep = ', ') => topicWords(id).map(([w, , m]) => `${w} (${m.split(' · ')[0]})`).join(sep);
const TOPIC_PAGES = [
  { id: 'numbers', file: 'tamil-numbers.html', bubble: 'Let’s count!', h1: 'Tamil numbers 1 to 10 — <span class="ta">எண்கள்</span>',
    title: 'Tamil Numbers 1 to 10 for Kids (with Tamil Numerals)',
    description: 'Count from 1 to 10 in Tamil: ஒன்று, இரண்டு, மூன்று … பத்து — with Tamil numerals ௧ ௨ ௩, pictures and letter-by-letter reading for kids.',
    lead: 'Learn to count from 1 to 10 in Tamil. Each number shows the Tamil word, its letters and the Tamil numeral (௧, ௨, ௩ …).',
    faq: [
      ['How do you count from 1 to 10 in Tamil?', '1 ஒன்று (onru), 2 இரண்டு (irandu), 3 மூன்று (moonru), 4 நான்கு (naangu), 5 ஐந்து (ainthu), 6 ஆறு (aaru), 7 ஏழு (ezhu), 8 எட்டு (ettu), 9 ஒன்பது (onbathu), 10 பத்து (pathu).'],
      ['How are numbers written in Tamil script?', 'Tamil has its own numerals: ௧ (1), ௨ (2), ௩ (3), ௪ (4), ௫ (5), ௬ (6), ௭ (7), ௮ (8), ௯ (9) and ௰ (10). Today the digits 1, 2, 3 … are used in everyday writing; Tamil numerals are seen in older texts, calendars and formal uses.']
    ] },
  { id: 'colours', file: 'tamil-colours.html', bubble: 'So many colours!', h1: 'Colours in Tamil — <span class="ta">நிறங்கள்</span>',
    title: 'Colours in Tamil for Kids — Names with Pictures',
    description: 'Learn colour names in Tamil: சிவப்பு (red), நீலம் (blue), பச்சை (green), மஞ்சள் (yellow) and more — with pictures and letter-by-letter reading.',
    lead: 'Colour names are some of the first words children love to say. Here are ten colours in Tamil with their letters.',
    faq: [
      ['What are the colours called in Tamil?', 'Colours in Tamil: ' + list('colours') + '. The word for colour is நிறம் (niram); colours are நிறங்கள்.'],
      ['What is red in Tamil?', 'Red in Tamil is சிவப்பு (sivappu). Blue is நீலம் (neelam), green is பச்சை (pachai) and yellow is மஞ்சள் (manjal).']
    ] },
  { id: 'days', file: 'tamil-days-of-the-week.html', bubble: 'What day is it?', h1: 'Days of the week in Tamil — <span class="ta">கிழமைகள்</span>',
    title: 'Days of the Week in Tamil (கிழமைகள்) for Kids',
    description: 'The seven days of the week in Tamil: ஞாயிறு, திங்கள், செவ்வாய், புதன், வியாழன், வெள்ளி, சனி — with meanings and letter-by-letter reading.',
    lead: 'The seven days of the week in Tamil, from Sunday to Saturday. In Tamil, “day of the week” is கிழமை (kizhamai).',
    faq: [
      ['What are the days of the week in Tamil?', 'The days of the week in Tamil are ' + list('days') + '. Each is often said with கிழமை, for example திங்கள்கிழமை (Monday).'],
      ['Why are Tamil day names linked to the sun, moon and planets?', 'Each Tamil day is named after a heavenly body: ஞாயிறு (the Sun) for Sunday, திங்கள் (the Moon) for Monday, செவ்வாய் (Mars) for Tuesday, புதன் (Mercury) for Wednesday, வியாழன் (Jupiter) for Thursday, வெள்ளி (Venus) for Friday and சனி (Saturn) for Saturday.']
    ] },
  { id: 'body', file: 'tamil-body-parts.html', bubble: 'Head, eyes, ears!', h1: 'Body parts in Tamil — <span class="ta">உடல் உறுப்புகள்</span>',
    title: 'Body Parts in Tamil for Kids — Names with Pictures',
    description: 'Learn the parts of the body in Tamil: தலை (head), கண் (eye), காது (ear), மூக்கு (nose), வாய் (mouth), கை (hand) and more — with pictures.',
    lead: 'Point and say! Ten parts of the body in Tamil, each with a picture and its letters.',
    faq: [
      ['What are the parts of the body called in Tamil?', 'Parts of the body in Tamil: ' + list('body') + '. The body is உடல் (udal) and its parts are உறுப்புகள் (uruppugal).'],
      ['How can children learn body parts in Tamil?', 'Play a pointing game: say a word such as கண் (eye) or மூக்கு (nose) and let the child point to it. Then swap — the child says the word while you point.']
    ] },
  { id: 'family', file: 'tamil-family-words.html', bubble: 'My family!', h1: 'Family words in Tamil — <span class="ta">குடும்பம்</span>',
    title: 'Family Members in Tamil — Words for Kids',
    description: 'Family words in Tamil for children: அம்மா (mother), அப்பா (father), அண்ணன், அக்கா, தம்பி, தங்கை, தாத்தா, பாட்டி — with meanings and pictures.',
    lead: 'Tamil has different words for older and younger brothers and sisters. Here are eight family words every child uses.',
    faq: [
      ['How do you say family members in Tamil?', 'Family words in Tamil: ' + list('family') + '. Family is குடும்பம் (kudumbam).'],
      ['What is the difference between அண்ணன் and தம்பி?', 'அண்ணன் (annan) is an elder brother and தம்பி (thambi) is a younger brother. In the same way, அக்கா (akka) is an elder sister and தங்கை (thangai) is a younger sister.']
    ] },
  { id: 'food', file: 'tamil-fruits-and-food.html', bubble: 'Yummy words!', h1: 'Fruits and food in Tamil — <span class="ta">பழங்களும் உணவும்</span>',
    title: 'Fruits and Food Names in Tamil for Kids',
    description: 'Fruit and food names in Tamil: மாம்பழம் (mango), வாழைப்பழம் (banana), திராட்சை (grapes), தேங்காய் (coconut), பால் (milk) and more — with pictures.',
    lead: 'Delicious words! Fruits and everyday foods in Tamil, each with a picture and its letters.',
    faq: [
      ['What are fruit names in Tamil?', 'Fruit names in Tamil: ' + topicWords('food').slice(0, 8).map(([w, , m]) => `${w} (${m})`).join(', ') + '. Fruit is பழம் (pazham).'],
      ['What is mango in Tamil?', 'Mango in Tamil is மாம்பழம் (maambazham) — from மா (mango tree) and பழம் (fruit). Banana is வாழைப்பழம் (vaazhaippazham).']
    ] }
];
for (const T of TOPIC_PAGES){
  const t = TOPICS.find(x => x.id === T.id);
  write(T.file, shell({
    file: T.file, guide: true, bubble: T.bubble, title: T.title, description: T.description, h1: T.h1,
    eyebrow: `${t.words.length} words · Pictures · Letter by letter`,
    body: `
<p class="lead-doc">${T.lead} Hear every word and practise in the <a href="./#/reading">Reading section</a> of the app (choose <b>${t.ic} ${t.en}</b>).</p>
${h2('words', t.ic, `${t.en} — ${ta(t.ta)}`)}
<div class="wcards">${t.words.map(wordCard).join('')}</div>
${tip('Say each word aloud together, clap once for each letter, then find the word’s first letter in the <a href="tamil-alphabet.html">alphabet chart</a>.')}
${h2('faq', '❓', `Questions about ${t.en.toLowerCase()} in Tamil`)}
<div class="faq">${faqHtmlFor(T.faq)}</div>`,
    schema: [faqSchemaFor(T.faq, T.file),
      DTS(T.file, `${t.en} in Tamil`, t.words.map(([w, , m]) => [w, `Tamil word meaning “${m}”. Letters: ${lettersOf(w).join(' + ')}.`]))]
  }));
}

/* ---------- 9. Free printables page (PDFs made by tools/build-printables.mjs) ---------- */
const PRINTS = fs.existsSync(path.join(ROOT, 'printables/printables.json'))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, 'printables/printables.json'), 'utf8')) : [];
const PRINT_FAQ = [
  ['Are the Tamil worksheets free to print?', 'Yes. All charts and tracing worksheets on this page are free for home and classroom use. Download the PDF and print as many copies as you like.'],
  ['What paper size are the printables?', 'They are made for A4 paper. On US Letter paper, choose “Fit to page” in the print settings.'],
  ['How should a child use the tracing worksheets?', 'Look at the blue letter, say its sound, then trace the grey outline letters from left to right. One row a day is plenty for young children.']
];
if (PRINTS.length) write('tamil-printables.html', shell({
  file: 'tamil-printables.html', guide: true, bubble: 'Print and practise!',
  title: 'Free Tamil Alphabet Charts & Tracing Worksheets (PDF)',
  description: 'Download free printable Tamil alphabet charts and letter tracing worksheets (PDF): uyir, mei, uyirmei 216 chart, numbers 1–10. For home and classroom.',
  h1: 'Free printable Tamil charts & worksheets', eyebrow: `${PRINTS.length} free PDFs · A4 · Home & classroom`,
  body: `
<p class="lead-doc">Free printable PDFs for children learning Tamil: alphabet charts for the wall and tracing worksheets for practice. Print on A4 (or Letter with “Fit to page”).</p>
<div class="prints">${PRINTS.map(d => `<article class="print-card">
  <a class="pc-thumb${d.landscape ? ' land' : ''}" href="printables/${d.file}.pdf" aria-label="Download ${esc(d.title)} (PDF)"><img src="assets/printables/${d.file}.png" alt="Preview of ${esc(d.title)}" loading="lazy" width="${d.landscape ? 520 : 368}" height="${d.landscape ? 368 : 520}"></a>
  <h3>${esc(d.title)}</h3><p class="muted">PDF · ${d.pages} page${d.pages > 1 ? 's' : ''} · A4 ${d.landscape ? 'landscape' : 'portrait'}</p>
  <a class="btn primary" href="printables/${d.file}.pdf" download>⬇ Download PDF</a></article>`).join('')}</div>
${tip('Stick the alphabet chart on the wall at your child’s eye level and point to a letter each day. Pair a worksheet with the <a href="./#/uyir">learning app</a> so your child can hear each letter while writing it.')}
${h2('faq', '❓', 'Questions about the printables')}
<div class="faq">${faqHtmlFor(PRINT_FAQ)}</div>`,
  schema: [faqSchemaFor(PRINT_FAQ, 'tamil-printables.html'),
    { '@type': 'ItemList', name: 'Free Tamil printables', itemListElement: PRINTS.map((d, i) => ({ '@type': 'ListItem', position: i + 1,
      item: { '@type': 'DigitalDocument', name: d.title, url: SITE + 'printables/' + d.file + '.pdf', encodingFormat: 'application/pdf',
        thumbnailUrl: SITE + 'assets/printables/' + d.file + '.png', isAccessibleForFree: true, inLanguage: ['ta', 'en'], author: { '@id': SITE + '#author' } } })) }]
}));

/* ---------- Ask Kili chat: knowledge base (js/faq-data.js) ----------
   All guide FAQs + help about using the site. [text](url) becomes a link in the chat. */
const ISS = ISSUES_URL;
const HELP = [
  ['How do I hear a letter?', 'Open Letters (எழுத்துகள்) and tap any letter tile. The big letter, its sound and a picture word appear at the top; press 🔊 to hear it again. Vowels play the letter and then their picture word.', 'sound hear listen play letter tap audio', './#/uyir'],
  ['The sound is wrong or there is no sound', `Sounds come from your device's Tamil text-to-speech voice, which can mispronounce single letters. To get a Tamil voice — Android: Settings → Text-to-speech → Google → install Tamil. Windows: Settings → Time & language → Speech → add Tamil. iPhone/Mac: Settings → Accessibility → Spoken Content → Voices → Tamil. Microsoft Edge has clearer Tamil voices. If you hear a mistake, please [report it on GitHub Issues](${ISS}).`, 'sound voice wrong no not working mute silent pronounce pronunciation audio speaker tts', ''],
  ['How do I install Learn Tamil as an app?', 'On Android, Chrome or Edge, tap the ⬇ Install app button at the top. On iPhone or iPad, open the site in Safari, tap Share and then Add to Home Screen. The app opens full screen and has shortcuts to Letters, Reading, Stories, Games and Certificate.', 'install app download home screen phone mobile iphone android pwa', ''],
  ['Does it work offline?', 'Yes. After your first visit, letters, reading, stories, games, certificates and the guide pages work without internet. Sounds from the device voice work offline only if the voice is stored on the device.', 'offline internet wifi network connection data', ''],
  ['How do I get a certificate?', 'Open 🎓 Certificate, choose one of the 10 levels and answer the questions (10 questions, pass with 8; the Champion level has 15, pass with 12). Type the name and download the certificate as a PDF. Each level unlocks the next, and every test asks new questions. Certificates are for encouragement, not an official qualification.', 'certificate cert pdf level test exam pass download சான்றிதழ்', './#/certificate'],
  ['What are tokens and badges?', 'Children earn 🪙 tokens for right answers, finished games, words read, stories and certificates, and unlock 🏅 badges such as “முதல் அடி” (first step). Tap 🪙 at the top to see them. They are saved only on this device.', 'token tokens coin coins badge badges reward rewards star stars points score', ''],
  ['How do I reset progress?', 'Tap 🪙 at the top to open My rewards, then press Reset progress. You can also clear this site’s data in your browser settings.', 'reset clear delete progress start again restart', ''],
  ['Which games are there?', 'Six games: க் + ஆ = ? (build a letter), Listen & pick, Spin wheel, Balloon pop, Word builder and Memory. Every right answer gives points, a cheer and tokens; 3 in a row gives a bonus.', 'game games play fun quiz balloon spin memory word builder', './#/practice'],
  ['Is my child’s data safe?', 'Yes. Learn Tamil collects no personal data: no accounts and no ads. If a parent allows it, it counts anonymous visits and game use with Google Analytics for Firebase, with advertising features turned off. Progress and the certificate name are saved only in your own browser. See the [Privacy & data policy](privacy.html).', 'privacy data safe tracking personal cookies child children secure gdpr coppa', 'privacy.html'],
  ['How can I report a mistake or give feedback?', `Please open an issue on [GitHub Issues](${ISS}). There are short forms for a wrong sound or Tamil mistake, a bug, or an idea. Issues are public, so please don’t include personal details.`, 'report mistake bug error wrong issue feedback idea suggest problem github', ''],
  ['How can I support Learn Tamil?', `Learn Tamil is free with no ads. If it helps your family or classroom, you can [buy me a coffee](${COFFEE_URL}) ☕. Thank you — உங்கள் ஆதரவுக்கு நன்றி!`, 'support donate coffee pay money help contribute sponsor', ''],
  ['Who made Learn Tamil?', 'Learn Tamil was made by Suthahar Jegatheesan (MSDEVBUILD) as a free, non-commercial project for children and beginners learning Tamil. More at [blog.msdevbuild.com](https://blog.msdevbuild.com).', 'who made author creator owner msdevbuild suthahar about contact', ''],
  ['Where can I read Tamil stories?', 'Open Stories (கதைகள்) in the app to hear five short stories read aloud — tap any word to see its letters. You can also read them as text with English meaning on the [Tamil stories page](tamil-stories-for-kids.html).', 'story stories read kathai கதை moral', './#/stories'],
  ['Where can I download printable worksheets and charts?', 'Free printable PDFs — Tamil alphabet charts, an uyirmei chart, a numbers chart and letter tracing worksheets — are on the [printables page](tamil-printables.html). Print them on A4 or Letter paper.', 'printable print worksheet worksheets pdf chart tracing trace download sheet paper', 'tamil-printables.html'],
  ['What word topics can my child learn?', 'In Reading (வாசிப்பு) choose a topic: numbers 1–10, colours, days of the week, parts of the body, family and fruits & food. Each word shows its picture and letters and can be heard aloud.', 'topic topics numbers colours colors days week body family fruit fruits food vocabulary words', './#/reading'],
  ['How does reading practice work?', 'Open Reading (வாசிப்பு). Read the word yourself, tap 🐢 to hear it letter by letter, then show the picture to check. There are three levels: 2, 3 and 4+ letter words.', 'reading read practice words level spell', './#/reading']
];
const LINKS = { 'tamil-vowels.html': VOWEL_FAQ, 'tamil-consonants.html': CONS_FAQ, 'uyirmei-ezhuthukal.html': UM_FAQ,
  'tamil-words-for-kids.html': WORD_FAQ, 'tamil-stories-for-kids.html': STORY_FAQ, 'tamil-alphabet.html': FAQ, 'ezhuthukal.html': TA_FAQ,
  ...Object.fromEntries(TOPIC_PAGES.map(T => [T.file, T.faq])), 'tamil-printables.html': PRINT_FAQ };
const KB = [
  ...HELP.map(([q, a, tags, link]) => ({ q, a, tags, link, lang: 'en', help: 1 })),
  ...Object.entries(LINKS).flatMap(([file, list]) => list.map(([q, a]) => ({ q, a, tags: '', link: file, lang: file === 'ezhuthukal.html' ? 'ta' : 'en' })))
];
write('js/faq-data.js', '/* Generated by tools/build-pages.mjs — knowledge base for the Ask Kili chat. Do not edit by hand. */\nwindow.LT_FAQ = ' + JSON.stringify(KB) + ';\n');

/* ---------- sitemap (with language alternates) ---------- */
const pages = [['', '1.0', 'weekly'], ...GUIDES.map(g => [g.file, g.file === 'tamil-alphabet.html' ? '0.9' : '0.8', 'monthly']),
  ...PRINTS.map(d => ['printables/' + d.file + '.pdf', '0.6', 'monthly']),
  ['privacy.html', '0.3', 'yearly'], ['terms.html', '0.3', 'yearly']];
const altXml = p => (p === 'tamil-alphabet.html' || p === 'ezhuthukal.html')
  ? ALT.map(a => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${SITE}${a.file}"/>`).join('') : '';
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  pages.map(([p, pr, cf]) => `  <url><loc>${SITE}${p}</loc>${altXml(p)}<lastmod>${TODAY}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n') + `\n</urlset>\n`);

/* ---------- llms.txt (summary for AI assistants) ---------- */
write('llms.txt', `# Learn Tamil (தமிழ் கற்போம்)

> Free website for children and beginners to learn the Tamil alphabet: all 247 letters with sound, picture words, read-along stories, reading practice and games. Made by Suthahar Jegatheesan (MSDEVBUILD). No sign-up, no ads. Installable as an app and works offline.

Key facts:
- The Tamil alphabet has 247 letters: 12 vowels (உயிர், uyir), 18 consonants (மெய், mei), 1 special letter ஃ (ஆய்தம், aaytham) and 216 consonant-vowel letters (உயிர்மெய், uyirmei; 18 × 12).
- Vowels: ${VOWELS.map(v => v.l).join(' ')} — short (குறில்) ${kuril.map(v => v.l).join(' ')}; long (நெடில்) ${nedil.map(v => v.l).join(' ')}.
- Consonants: ${CONS.map(k => k.c + PULLI).join(' ')} — வல்லினம் ${meiByGroup('v').map(k => k.c + PULLI).join(' ')}; மெல்லினம் ${meiByGroup('m').map(k => k.c + PULLI).join(' ')}; இடையினம் ${meiByGroup('i').map(k => k.c + PULLI).join(' ')}.
- 12 vowels + 18 consonants = 30 முதல் எழுத்துகள் (primary letters). Uyirmei: 90 short (18 × 5) + 126 long (18 × 7).
- Grantha letters ஜ ஷ ஸ ஹ க்ஷ ஸ்ரீ are used for borrowed words and are not counted in the 247.

## Guides
${GUIDES.map(g => `- [${g.en}](${SITE}${g.file})`).join('\n')}

## App and policies
- [Learning app](${SITE}): interactive letters with audio, reading practice, stories and games (requires JavaScript).
- [Privacy & data](${SITE}privacy.html): no personal data is collected.
- [Terms](${SITE}terms.html)
- [Report an issue](${ISSUES_URL})
`);

/* ---------- Privacy & data ---------- */
const CONTACT = '<a href="https://blog.msdevbuild.com/contact/" rel="noopener">contact page</a>';
const ISSUES = '<a href="https://github.com/jssuthahar/learntamil/issues" rel="noopener">GitHub Issues</a>';
const privacyBody = `
<div class="callout glass"><b>In short:</b> Learn Tamil does not collect, store or sell any personal information. There are no accounts and no advertising. If you allow it, we count anonymous visits and game use with Google Analytics for Firebase, with all advertising features turned off. Progress and settings are saved only in your own browser.</div>

<h2>Who runs this website</h2>
<p>Learn Tamil (<a href="${SITE}">${SITE}</a>) is a free educational website made by Suthahar Jegatheesan under the MSDEVBUILD name. It is a personal, non-commercial project. Questions about privacy can be sent through the ${CONTACT}.</p>

<h2>Information we collect</h2>
<p><strong>No personal information.</strong> The site has no sign-up, no login, no forms and no comments. We do not ask for names, email addresses, ages, photos or any other personal details, and we do not run advertising scripts.</p>
<h3 id="analytics">Anonymous usage statistics (only if you allow them)</h3>
<p>When you first visit, a notice asks whether we may count visits. <strong>Nothing is loaded or sent unless you tap “Allow”.</strong> If you allow it, the site uses <strong>Google Analytics for Firebase</strong> to learn which lessons and games are useful. It records pages visited and simple events such as “a game was started”, “a story was finished”, “a badge was earned” or “a certificate level was passed”, together with general technical details (approximate country, device type, browser). It stores a random visitor ID in first-party cookies (<code>_ga</code>, <code>_ga_*</code>) so repeat visits can be counted. We have turned off Google signals, advertising cookies and ad personalisation, and we never send names, the certificate name or anything your child types. Google processes this data under the <a href="https://policies.google.com/privacy" rel="noopener">Google Privacy Policy</a>. If you tap “No thanks”, or change your mind later, the site works exactly the same. Your choice is saved in this browser (localStorage <code>lt-consent</code>).</p>
<p><strong data-consent-status>Your choice is saved in this browser.</strong> <button type="button" class="btn small" data-consent-open>Change cookie choice</button></p>

<h2>What is saved on your device</h2>
<p>To make the site work, a few small values are saved in your browser's own storage. They never leave your device and we cannot see them.</p>
<div class="tbl"><table><thead><tr><th>What</th><th>Where</th><th>Why</th></tr></thead><tbody>
<tr><td>Light or dark theme</td><td>localStorage <code>lt-theme</code></td><td>Remembers your colour choice</td></tr>
<tr><td>Game progress: tokens, badges, letters heard, words read, stories finished</td><td>localStorage <code>lt-progress</code></td><td>Remembers your child's rewards and progress</td></tr>
<tr><td>Name typed for a certificate, and certificate results</td><td>localStorage <code>lt-cert-name</code>, <code>lt-progress</code></td><td>Puts the name on the certificate and remembers which levels are passed. The certificate PDF is made inside your browser; the name is never sent anywhere.</td></tr>
<tr><td>Questions and words already shown</td><td>localStorage <code>lt-cert-seen</code>, <code>lt-spin-seen</code></td><td>So certificate retakes and the Spin wheel give new questions and words instead of repeating</td></tr>
<tr><td>Reminder device token</td><td>localStorage <code>lt-push</code></td><td>Only if you turn reminders on; deleted when you turn them off</td></tr>
<tr><td>When the “support this project” note was last shown</td><td>localStorage <code>lt-support</code></td><td>So the note appears only now and then, and rests after you answer it</td></tr>
<tr><td>Your cookie choice</td><td>localStorage <code>lt-consent</code></td><td>Remembers whether you allowed anonymous usage statistics</td></tr>
<tr><td>Best game scores and sound on/off</td><td>localStorage <code>lt-best-*</code>, <code>lt-sfx</code></td><td>Shows the best score for each game; remembers if game sounds are muted</td></tr>
<tr><td>Closed voice message</td><td>sessionStorage <code>lt-notice</code></td><td>Keeps the “no Tamil voice” message closed until the tab is closed</td></tr>
<tr><td>Your letter recordings</td><td>IndexedDB (only on <code>record.html</code>)</td><td>Keeps recordings you make until you download or delete them</td></tr>
</tbody></table></div>
<p>You can remove all of this at any time with <em>Reset progress</em> in the 🪙 My rewards panel, or by clearing this site's data in your browser settings.</p>

<h2 id="reminders">Reminders (push notifications)</h2>
<p>You can choose to get occasional reminders, such as “Time to learn a new letter!”. They are <strong>off</strong> until you tap <em>Turn on reminders</em> and your browser asks for permission. When you turn them on, <strong>Firebase Cloud Messaging</strong> (Google) gives this browser a random device token so a reminder can be delivered. The token is not linked to a name, email or any other personal detail, and is saved in this browser (localStorage <code>lt-push</code>). Turning reminders off deletes the token. You can also block notifications for this site in your browser settings at any time.</p>
<p class="push-row" style="align-items:flex-start;text-align:left"><button type="button" class="btn small push-btn" data-push hidden>🔔 Turn on reminders</button><small class="muted" data-push-note aria-live="polite"></small></p>

<h2>Microphone</h2>
<p>Only the optional <strong>Letter Recorder</strong> page uses the microphone, and only after you allow it and press <em>Record</em>. Recordings stay in your browser. They are never uploaded by this website; they leave your device only if you choose to download the zip file yourself.</p>

<h2>Services provided by others</h2>
<p>Like most websites, Learn Tamil relies on a few outside services. They may receive technical information such as your IP address and browser type when your browser contacts them:</p>
<ul>
<li><strong>GitHub Pages</strong> hosts the site and may keep standard server logs. See the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub Privacy Statement</a>.</li>
<li><strong>Google Analytics for Firebase</strong> (project <code>learntamil-js</code>) receives the anonymous usage statistics described above, only if you allow them.</li>
<li><strong>Firebase Cloud Messaging</strong> delivers reminders, only if you turn them on (see <a href="#reminders">Reminders</a>).</li>
<li><strong>Google Fonts</strong> supplies the Tamil and English fonts. See the <a href="https://developers.google.com/fonts/faq/privacy" rel="noopener">Google Fonts privacy FAQ</a>.</li>
<li><strong>cdnjs (Cloudflare)</strong> supplies a zip library, only on the Letter Recorder page.</li>
<li><strong>Buy Me a Coffee</strong>: the “Buy me a coffee” link opens buymeacoffee.com, where you can choose to support the project. This website does not load any Buy Me a Coffee script and sends it nothing. If you decide to support, Buy Me a Coffee handles the payment under <a href="https://www.buymeacoffee.com/privacy-policy" rel="noopener">its own privacy policy</a>, and may share with the creator the name and message you choose to leave.</li>
<li><strong>GitHub Issues</strong> is where you can report bugs and give feedback. Issues are <em>public</em>: your GitHub username and whatever you write can be seen by anyone, and are handled under GitHub's privacy statement. Please do not include personal details, especially about children. For private questions use the ${CONTACT}.</li>
<li><strong>Your browser's text-to-speech voice</strong> reads letters and words aloud. Some voices (for example Microsoft Edge “natural” voices or Google voices) are online services: your browser may send the text being spoken — Tamil letters and words from this site — to that provider. No personal information is part of that text.</li>
</ul>

<h2>Children's privacy</h2>
<p>Learn Tamil is made for children and is designed so that it does not collect personal information from anyone, including children. Anonymous usage statistics are collected only after a parent or teacher allows them, with advertising features off. There are no ads, no chat, no sharing features and no links that ask for personal details. We recommend that young children use the site with a parent or teacher.</p>

<h2>Changes to this policy</h2>
<p>If this policy changes, the new version will be posted on this page with a new “Updated” date.</p>

<h2>Contact</h2>
<p>For any privacy question or request, please use the ${CONTACT}.</p>
`;
fs.writeFileSync(path.join(ROOT, 'privacy.html'), shell({
  file: 'privacy.html', ogType: 'website',
  title: 'Privacy & Data Policy | Learn Tamil',
  description: 'Learn Tamil collects no personal data: no accounts and no ads, only anonymous usage statistics. See what is stored on your device and which services the site uses.',
  h1: 'Privacy &amp; data policy', eyebrow: 'Legal', bubble: 'No ads — promise!', body: privacyBody
}));

/* ---------- Terms ---------- */
const termsBody = `
<p>These terms apply to your use of Learn Tamil (<a href="${SITE}">${SITE}</a>), a free educational website made by Suthahar Jegatheesan under the MSDEVBUILD name. By using the site you agree to them. If you do not agree, please do not use the site.</p>

<h2>1. Free educational use</h2>
<p>Learn Tamil is free for personal, family, school and classroom use. You may show it to students, link to it and share it. You must not use it for anything unlawful or try to disrupt or misuse it.</p>

<h2>2. Content and licence</h2>
<p>The website's source code and content are published on <a href="https://github.com/jssuthahar/learntamil" rel="noopener">GitHub</a> under the <a href="https://github.com/jssuthahar/learntamil/blob/main/LICENSE" rel="noopener">MIT License</a>, which allows reuse with attribution. Emoji pictures are drawn by your device's emoji font. Fonts are provided by Google Fonts under their own open licences. Names of other products and services belong to their owners.</p>

<h2 id="disclaimer">3. Disclaimer: accuracy and pronunciation</h2>
<p>All Tamil text on the site has been prepared and checked carefully. However:</p>
<ul>
<li>Letter sounds may be produced by your device's text-to-speech voice, which can mispronounce some single letters. Recorded or generated audio is used where it is available.</li>
<li>Romanised sounds and English hints are simple guides for beginners, not exact phonetic descriptions.</li>
<li>The site supports learning but is not a replacement for a qualified Tamil teacher.</li>
</ul>
<p><strong>If you hear any mistake in the voice</strong>, or find a wrong letter, word or bug, please report it as an issue on ${ISSUES} so it can be corrected.</p>

<h2>4. Voluntary support</h2>
<p>Learn Tamil is free and will stay free. Supporting it through <a href="${COFFEE_URL}" rel="noopener">Buy Me a Coffee</a> is completely voluntary, does not unlock any extra features, and is handled by Buy Me a Coffee under its own terms. Payments should be made by a parent or adult.</p>

<h2 id="certificates">5. Certificates</h2>
<p>Level certificates are made in your browser when a test is passed. They are practice certificates to encourage children, <strong>not an official or accredited qualification</strong>, and are not verified by any school or examination board.</p>

<h2>6. Children</h2>
<p>The site is designed for children. Parents, guardians and teachers are responsible for supervising how children use the internet, including this site. Learn Tamil collects no personal information, only anonymous usage statistics; see the <a href="privacy.html">Privacy &amp; data policy</a>.</p>

<h2>7. Links to other websites</h2>
<p>The site may link to other websites (for example the MSDEVBUILD blog or GitHub). We are not responsible for their content or practices.</p>

<h2>8. No warranty</h2>
<p>The site is provided “as is” and “as available”, without warranties of any kind, express or implied, including fitness for a particular purpose and uninterrupted or error-free operation.</p>

<h2>9. Limitation of liability</h2>
<p>To the fullest extent permitted by law, the author is not liable for any loss or damage arising from the use of, or inability to use, this free website.</p>

<h2>10. Changes</h2>
<p>These terms may be updated from time to time. The current version is always on this page with its “Updated” date. Continuing to use the site after a change means you accept the updated terms.</p>

<h2>11. Contact</h2>
<p>Questions about these terms can be sent through the ${CONTACT}.</p>
`;
fs.writeFileSync(path.join(ROOT, 'terms.html'), shell({
  file: 'terms.html', ogType: 'website',
  title: 'Terms & Conditions | Learn Tamil',
  description: 'Terms for using Learn Tamil, a free Tamil alphabet learning website for children: free educational use, MIT licence, accuracy notes, children and liability.',
  h1: 'Terms &amp; conditions', eyebrow: 'Legal', bubble: 'Simple, friendly rules', body: termsBody
}));

/* ---------- 404 ---------- */
fs.writeFileSync(path.join(ROOT, '404.html'), shell({
  file: '404.html', ogType: 'website',
  title: 'Page not found | Learn Tamil',
  description: 'This page does not exist. Go back to Learn Tamil.',
  h1: 'Page not found <span class="ta">· பக்கம் இல்லை</span>', eyebrow: '404',
  body: `<p>Sorry, this page does not exist.</p><p><a class="btn primary" href="${SITE}">← Back to Learn Tamil</a> &nbsp; <a class="btn" href="${SITE}tamil-alphabet.html">Tamil alphabet chart</a></p>`
}).replace('index, follow, max-image-preview:large', 'noindex').replace(/<link rel="canonical"[^>]*>\n/, '')
  // 404 can be served at any path, so make every relative link resolve from the site root
  .replace('<head>\n', `<head>\n<base href="${SITE}">\n`));

/* ---------- inject FAQ + footer into index.html between markers ---------- */
const idxPath = path.join(ROOT, 'index.html');
let idx = fs.readFileSync(idxPath, 'utf8');
const put = (name, html) => {
  const re = new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(<!-- ${name}:END -->)`);
  if (!re.test(idx)) throw new Error(`index.html is missing the ${name} markers`);
  idx = idx.replace(re, `$1\n${html}\n$2`);
};
put('FAQ', faqHtml());
// FAQPage markup lives only on tamil-alphabet.html (Google: mark up repeated FAQs once).
put('FAQ-SCHEMA', '');
put('FOOTER', FOOTER);
put('SUPPORT', SUPPORT);
put('GUIDES', GUIDES.map(g => `<a class="guide-card" href="${g.file}"><span class="gc-ic" aria-hidden="true">${g.ic}</span><b>${g.en}</b><span class="ta">${g.ta}</span></a>`).join(''));
fs.writeFileSync(idxPath, idx);

/* ---------- stamp a content hash into sw.js so every change reaches installed apps ---------- */
import('node:crypto').then(({ createHash }) => {
  const swPath = path.join(ROOT, 'sw.js');
  let sw = fs.readFileSync(swPath, 'utf8');
  const list = JSON.parse(sw.match(/const PRECACHE = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
  const h = createHash('sha256');
  for (const f of list.filter(f => f !== './')) h.update(f).update(fs.readFileSync(path.join(ROOT, f)));
  const version = h.digest('hex').slice(0, 10);
  sw = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`);
  fs.writeFileSync(swPath, sw);
  console.log('Service worker version', version);
});

console.log('Built ' + GUIDES.length + ' guide pages, privacy, terms, 404, sitemap.xml, llms.txt and updated index.html');
