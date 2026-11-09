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
  ';this.D={PULLI,VOWELS,CONS,GROUPS,WORDS};', ctx);
const { PULLI, VOWELS, CONS, GROUPS, WORDS } = ctx.D;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- shared page shell ---------- */
export function shell({ file, title, description, h1, eyebrow, body, schema = [], ogType = 'article' }) {
  const url = SITE + (file === 'index.html' ? '' : file);
  const graph = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': url + '#page', url, name: title, description, inLanguage: ['en', 'ta'],
      isPartOf: { '@id': SITE + '#website' }, author: { '@id': SITE + '#author' }, dateModified: TODAY },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Learn Tamil', item: SITE },
      { '@type': 'ListItem', position: 2, name: h1.replace(/<[^>]+>/g, ''), item: url } ] },
    ...schema ] };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Suthahar Jegatheesan">
<meta name="theme-color" content="#0078d4">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Learn Tamil · MSDEVBUILD">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Learn Tamil — தமிழ் எழுத்துகள், 247 letters">
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
    <a class="btn primary small" href="./">Open <span class="hide-sm">the learning </span>app →</a>
  </div>
</header>
<main class="wrap doc">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="./">Learn Tamil</a> › <span>${h1.replace(/<[^>]+>/g, '')}</span></nav>
  ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
  <h1>${h1}</h1>
  <p class="doc-meta">Updated <time datetime="${TODAY}">${new Date(TODAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time> · By <a href="https://blog.msdevbuild.com/about/" rel="author">Suthahar Jegatheesan</a></p>
${body}
</main>
${FOOTER}
<script src="js/pwa.js"></script>
</body>
</html>
`;
}
export const FOOTER = `<footer>
  <div class="wrap foot">
    <div><b>Learn Tamil</b> · <span class="ta">தமிழ் கற்போம்</span><br><span class="muted">Free Tamil alphabet lessons, reading and games for children. No sign-up, no ads, no tracking.</span></div>
    <nav class="foot-links" aria-label="Footer">
      <a href="./">Learning app</a>
      <a href="tamil-alphabet.html">Tamil alphabet chart</a>
      <a href="privacy.html">Privacy &amp; data</a>
      <a href="terms.html">Terms</a>
      <a href="https://github.com/jssuthahar/learntamil/issues" rel="noopener">Report an issue / feedback</a>
      <a href="https://blog.msdevbuild.com/contact/" rel="noopener">Contact</a>
    </nav>
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
export const faqSchema = () => ({ '@type': 'FAQPage', '@id': SITE + '#faq',
  mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
export const faqHtml = () => FAQ.map(([q, a]) => `<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n');

const alphabetBody = `
<p class="lead-doc"><strong>The Tamil alphabet has 247 letters</strong>: 12 vowels (<span class="ta">உயிர்</span>), 18 consonants (<span class="ta">மெய்</span>), 1 special letter (<span class="ta">ஆய்தம்</span> ஃ) and 216 consonant-vowel letters (<span class="ta">உயிர்மெய்</span>). This page lists every letter with its romanised sound, a pronunciation tip and an example word. To <em>hear</em> each letter, use the free <a href="./">Learn Tamil app</a>.</p>

<div class="sum-grid">
  <div class="glass"><b>12</b><span class="ta">உயிர்</span><small>vowels</small></div>
  <div class="glass"><b>18</b><span class="ta">மெய்</span><small>consonants</small></div>
  <div class="glass"><b>1</b><span class="ta">ஆய்தம்</span><small>special letter</small></div>
  <div class="glass"><b>216</b><span class="ta">உயிர்மெய்</span><small>18 × 12</small></div>
  <div class="glass total"><b>247</b><span class="ta">மொத்தம்</span><small>total</small></div>
</div>

<nav class="toc glass" aria-label="On this page"><b>On this page</b>
<a href="#uyir">12 vowels</a><a href="#mei">18 consonants</a><a href="#aytham">ஆய்தம் ஃ</a><a href="#uyirmei">216 uyirmei chart</a><a href="#words">Picture words</a><a href="#faq">FAQ</a></nav>

<h2 id="uyir">1. Tamil vowels — <span class="ta">உயிர் எழுத்துகள்</span> (12)</h2>
<p>Tamil has 12 vowels. Five are short (<span class="ta">குறில்</span>): <span class="ta">${kuril.map(v => v.l).join(' ')}</span>. Seven are long (<span class="ta">நெடில்</span>): <span class="ta">${nedil.map(v => v.l).join(' ')}</span>.</p>
<div class="tbl"><table><thead><tr><th>Letter</th><th>Sound</th><th>Length</th><th>How to say it</th><th>Example</th></tr></thead><tbody>${vowelRows}</tbody></table></div>

<h2 id="mei">2. Tamil consonants — <span class="ta">மெய் எழுத்துகள்</span> (18)</h2>
<p>Each consonant is written with a dot on top (<span class="ta">புள்ளி</span>, pulli). They form three groups of six: <span class="ta">வல்லினம்</span> (hard) <span class="ta">${meiByGroup('v').map(k => k.c + PULLI).join(' ')}</span>, <span class="ta">மெல்லினம்</span> (soft) <span class="ta">${meiByGroup('m').map(k => k.c + PULLI).join(' ')}</span> and <span class="ta">இடையினம்</span> (medium) <span class="ta">${meiByGroup('i').map(k => k.c + PULLI).join(' ')}</span>.</p>
<div class="tbl"><table><thead><tr><th>Letter</th><th>Sound</th><th>Group</th><th>How to say it</th><th>Example word</th></tr></thead><tbody>${meiRows}</tbody></table></div>

<h2 id="aytham">3. The special letter — <span class="ta">ஆய்த எழுத்து</span> ஃ (1)</h2>
<p><span class="ta big-inline">ஃ</span> is called <span class="ta">ஆய்தம்</span>, <span class="ta">அஃகேனம்</span> or <span class="ta">முப்புள்ளி</span> (three dots). It comes between a short vowel and a <span class="ta">வல்லினம்</span> letter, as in <span class="ta">எஃகு</span> (steel) and <span class="ta">அஃது</span> (that). Its sound is a soft, breathy “kh”.</p>

<h2 id="uyirmei">4. Uyirmei chart — <span class="ta">உயிர்மெய் எழுத்துகள்</span> (216)</h2>
<p>Every consonant joins every vowel: <span class="ta">க் + அ = க</span>, <span class="ta">க் + ஆ = கா</span>, <span class="ta">க் + இ = கி</span> … 18 consonants × 12 vowels = 216 letters. Rows are consonants, columns are vowels.</p>
<div class="tbl um-static"><table><thead>${umHead}</thead><tbody>${umRows}</tbody></table></div>

<h2 id="words">5. First Tamil words to read</h2>
<p>After the letters, children can read these ${WORDS.length} simple picture words. Practise them in the <a href="./#/reading">Reading section</a> of the app.</p>
<ul class="word-list">${wordsList}</ul>

<h2 id="faq">Frequently asked questions</h2>
<div class="faq">${faqHtml()}</div>

<p class="doc-note">Romanisation is a simple guide for beginners; listen to a teacher or the app for exact sounds. Found a mistake, a wrong sound or a bug? Please report it on <a href="https://github.com/jssuthahar/learntamil/issues" rel="noopener">GitHub Issues</a>.</p>
`;

const alphabetSchema = [
  { '@type': 'LearningResource', '@id': SITE + 'tamil-alphabet.html#resource',
    name: 'Tamil Alphabet: all 247 letters with pronunciation',
    inLanguage: ['ta', 'en'], learningResourceType: ['Chart', 'Reference'],
    educationalLevel: 'Beginner', isAccessibleForFree: true,
    teaches: ['Tamil vowels (uyir ezhuthukal)', 'Tamil consonants (mei ezhuthukal)', 'Uyirmei letters', 'Aaytham'],
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
    author: { '@id': SITE + '#author' } },
  faqSchema()
];

const out = shell({
  file: 'tamil-alphabet.html',
  title: 'Tamil Alphabet: All 247 Letters with Pronunciation Chart',
  description: 'The Tamil alphabet has 247 letters: 12 vowels (uyir), 18 consonants (mei), ஃ and 216 uyirmei. Full chart with sounds, pronunciation tips and example words.',
  h1: 'Tamil Alphabet — all 247 letters <span class="ta">(தமிழ் எழுத்துகள்)</span>',
  eyebrow: 'Chart · Pronunciation · Examples',
  body: alphabetBody,
  schema: alphabetSchema
});
fs.writeFileSync(path.join(ROOT, 'tamil-alphabet.html'), out);

/* ---------- sitemap ---------- */
const pages = [['', '1.0', 'weekly'], ['tamil-alphabet.html', '0.9', 'monthly'], ['privacy.html', '0.3', 'yearly'], ['terms.html', '0.3', 'yearly']];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.map(([p, pr, cf]) => `  <url><loc>${SITE}${p}</loc><lastmod>${TODAY}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n') +
  `\n</urlset>\n`);

/* ---------- Privacy & data ---------- */
const CONTACT = '<a href="https://blog.msdevbuild.com/contact/" rel="noopener">contact page</a>';
const ISSUES = '<a href="https://github.com/jssuthahar/learntamil/issues" rel="noopener">GitHub Issues</a>';
const privacyBody = `
<div class="callout glass"><b>In short:</b> Learn Tamil does not collect, store or sell any personal information. There are no accounts, no cookies, no analytics, no advertising and no tracking. A few settings are saved only in your own browser.</div>

<h2>Who runs this website</h2>
<p>Learn Tamil (<a href="${SITE}">${SITE}</a>) is a free educational website made by Suthahar Jegatheesan under the MSDEVBUILD name. It is a personal, non-commercial project. Questions about privacy can be sent through the ${CONTACT}.</p>

<h2>Information we collect</h2>
<p><strong>None.</strong> The site has no sign-up, no login, no forms and no comments. We do not ask for names, email addresses, ages, photos or any other personal details, and we do not run analytics or advertising scripts.</p>

<h2>What is saved on your device</h2>
<p>To make the site work, a few small values are saved in your browser's own storage. They never leave your device and we cannot see them.</p>
<div class="tbl"><table><thead><tr><th>What</th><th>Where</th><th>Why</th></tr></thead><tbody>
<tr><td>Light or dark theme</td><td>localStorage <code>lt-theme</code></td><td>Remembers your colour choice</td></tr>
<tr><td>Stars earned</td><td>localStorage <code>lt-stars</code></td><td>Shows the star count from games</td></tr>
<tr><td>Closed voice message</td><td>sessionStorage <code>lt-notice</code></td><td>Keeps the “no Tamil voice” message closed until the tab is closed</td></tr>
<tr><td>Your letter recordings</td><td>IndexedDB (only on <code>record.html</code>)</td><td>Keeps recordings you make until you download or delete them</td></tr>
</tbody></table></div>
<p>You can remove all of this at any time by clearing this site's data in your browser settings.</p>

<h2>Microphone</h2>
<p>Only the optional <strong>Letter Recorder</strong> page uses the microphone, and only after you allow it and press <em>Record</em>. Recordings stay in your browser. They are never uploaded by this website; they leave your device only if you choose to download the zip file yourself.</p>

<h2>Services provided by others</h2>
<p>Like most websites, Learn Tamil relies on a few outside services. They may receive technical information such as your IP address and browser type when your browser contacts them:</p>
<ul>
<li><strong>GitHub Pages</strong> hosts the site and may keep standard server logs. See the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub Privacy Statement</a>.</li>
<li><strong>Google Fonts</strong> supplies the Tamil and English fonts. See the <a href="https://developers.google.com/fonts/faq/privacy" rel="noopener">Google Fonts privacy FAQ</a>.</li>
<li><strong>cdnjs (Cloudflare)</strong> supplies a zip library, only on the Letter Recorder page.</li>
<li><strong>GitHub Issues</strong> is where you can report bugs and give feedback. Issues are <em>public</em>: your GitHub username and whatever you write can be seen by anyone, and are handled under GitHub's privacy statement. Please do not include personal details, especially about children. For private questions use the ${CONTACT}.</li>
<li><strong>Your browser's text-to-speech voice</strong> reads letters and words aloud. Some voices (for example Microsoft Edge “natural” voices or Google voices) are online services: your browser may send the text being spoken — Tamil letters and words from this site — to that provider. No personal information is part of that text.</li>
</ul>

<h2>Children's privacy</h2>
<p>Learn Tamil is made for children and is designed so that it does not collect personal information from anyone, including children. There are no ads, no chat, no sharing features and no links that ask for personal details. We recommend that young children use the site with a parent or teacher.</p>

<h2>Changes to this policy</h2>
<p>If this policy changes, the new version will be posted on this page with a new “Updated” date.</p>

<h2>Contact</h2>
<p>For any privacy question or request, please use the ${CONTACT}.</p>
`;
fs.writeFileSync(path.join(ROOT, 'privacy.html'), shell({
  file: 'privacy.html', ogType: 'website',
  title: 'Privacy & Data Policy | Learn Tamil',
  description: 'Learn Tamil collects no personal data: no accounts, cookies, analytics, ads or tracking. See what is stored only on your device and which services the site uses.',
  h1: 'Privacy &amp; data policy', eyebrow: 'Legal', body: privacyBody
}));

/* ---------- Terms ---------- */
const termsBody = `
<p>These terms apply to your use of Learn Tamil (<a href="${SITE}">${SITE}</a>), a free educational website made by Suthahar Jegatheesan under the MSDEVBUILD name. By using the site you agree to them. If you do not agree, please do not use the site.</p>

<h2>1. Free educational use</h2>
<p>Learn Tamil is free for personal, family, school and classroom use. You may show it to students, link to it and share it. You must not use it for anything unlawful or try to disrupt or misuse it.</p>

<h2>2. Content and licence</h2>
<p>The website's source code and content are published on <a href="https://github.com/jssuthahar/learntamil" rel="noopener">GitHub</a> under the <a href="https://github.com/jssuthahar/learntamil/blob/main/LICENSE" rel="noopener">MIT License</a>, which allows reuse with attribution. Emoji pictures are drawn by your device's emoji font. Fonts are provided by Google Fonts under their own open licences. Names of other products and services belong to their owners.</p>

<h2>3. Accuracy and pronunciation</h2>
<p>All Tamil text on the site has been prepared and checked carefully. However:</p>
<ul>
<li>Letter sounds may be produced by your device's text-to-speech voice, which can mispronounce some single letters. Recorded or generated audio is used where it is available.</li>
<li>Romanised sounds and English hints are simple guides for beginners, not exact phonetic descriptions.</li>
<li>The site supports learning but is not a replacement for a qualified Tamil teacher.</li>
</ul>
<p>If you find a mistake, a wrong sound or a bug, or have feedback, please report it on ${ISSUES} so it can be corrected.</p>

<h2>4. Children</h2>
<p>The site is designed for children. Parents, guardians and teachers are responsible for supervising how children use the internet, including this site. Learn Tamil collects no personal information; see the <a href="privacy.html">Privacy &amp; data policy</a>.</p>

<h2>5. Links to other websites</h2>
<p>The site may link to other websites (for example the MSDEVBUILD blog or GitHub). We are not responsible for their content or practices.</p>

<h2>6. No warranty</h2>
<p>The site is provided “as is” and “as available”, without warranties of any kind, express or implied, including fitness for a particular purpose and uninterrupted or error-free operation.</p>

<h2>7. Limitation of liability</h2>
<p>To the fullest extent permitted by law, the author is not liable for any loss or damage arising from the use of, or inability to use, this free website.</p>

<h2>8. Changes</h2>
<p>These terms may be updated from time to time. The current version is always on this page with its “Updated” date. Continuing to use the site after a change means you accept the updated terms.</p>

<h2>9. Contact</h2>
<p>Questions about these terms can be sent through the ${CONTACT}.</p>
`;
fs.writeFileSync(path.join(ROOT, 'terms.html'), shell({
  file: 'terms.html', ogType: 'website',
  title: 'Terms & Conditions | Learn Tamil',
  description: 'Terms for using Learn Tamil, a free Tamil alphabet learning website for children: free educational use, MIT licence, accuracy notes, children and liability.',
  h1: 'Terms &amp; conditions', eyebrow: 'Legal', body: termsBody
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

console.log('Built tamil-alphabet.html, privacy.html, terms.html, 404.html, sitemap.xml and updated index.html');
