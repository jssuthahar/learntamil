#!/usr/bin/env node
/*
  Builds the static, crawlable pages from assets/js/data/*.js so search engines and AI
  answer engines can read every letter without running JavaScript.

    npm run build        (or: node tools/build-pages.mjs)

  Writes: the guide pages, privacy, terms, 404, sitemap.xml, llms.txt, assets/js/data/faq.js,
  the generated parts of index.html (styles, scripts, FAQ, footer, guides) and the
  service worker's PRECACHE list and VERSION.
  Change SITE below if you move to a custom domain, then run it again.
*/
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { styleTags, scriptTags, SERVICES, APP_SCRIPTS, KURAL_SCRIPTS, PRECACHE_ASSETS, STYLES, STYLE_BUNDLE } from './lib/assets.mjs';
import { loadData } from './lib/load-data.mjs';
import { qrSvg } from './lib/qr.mjs';

export const SITE = 'https://learntamil.msdevbuild.com/';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TODAY = new Date().toISOString().slice(0, 10);
const fmtDay = (d, lang) => new Date(d).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// Load the same data the app uses.
const { PULLI, VOWELS, CONS, GROUPS, WORDS, STORIES, TOPICS, AATHICHOODI, RHYMES, FESTIVALS, KURAL_PAALS, KURAL_LESSONS } =
  loadData(['PULLI', 'VOWELS', 'CONS', 'GROUPS', 'WORDS', 'STORIES', 'TOPICS', 'AATHICHOODI', 'RHYMES', 'FESTIVALS', 'KURAL_PAALS', 'KURAL_LESSONS']);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PUBLISHED = '2026-11-09';
const REPO_URL = 'https://github.com/jssuthahar/learntamil';
const ISSUES_URL = `${REPO_URL}/issues`;
export const COFFEE_URL = 'https://buymeacoffee.com/jssuthahar';
/* The yellow "Buy me a coffee" button in every page header (index.html and thirukkural.html carry the same markup by hand). */
const COFFEE_TOP = `<a class="coffee-top" href="${COFFEE_URL}" target="_blank" rel="noopener" title="Support Learn Tamil with a coffee" aria-label="Buy me a coffee: support Learn Tamil (opens a new tab)"><span class="ct-cup" aria-hidden="true">☕</span><span class="ct-t">Buy me a coffee</span></a>`;
/* Support card for parents — a plain link (no widget script), so nothing tracks visitors. */
export const SUPPORT = `<aside class="support-card" aria-label="Support Learn Tamil">
  <span class="sc-ic" aria-hidden="true">☕</span>
  <div><b>Keep Learn Tamil free</b><p>Learn Tamil is free, with no ads in the lessons or games. If it helps your family or classroom, you can support it with a coffee. <span class="ta">உங்கள் ஆதரவுக்கு நன்றி!</span></p></div>
  <a class="coffee-btn" href="${COFFEE_URL}" target="_blank" rel="noopener">☕ Buy me a coffee</a>
</aside>`;

/* Sponsor slots — only on grown-up guide pages and the parents' area of the home page, never inside
   the children's lessons or games. Plain HTML: no ad script, no cookies, no tracking, no targeting.
   Until a sponsor books a slot, each one shows a clearly marked sample that invites advertisers to get in touch.
   To run a real sponsor, replace the sample in SPONSOR_ADS[place] with { name, text, url, img? }. */
export const ADVERTISE_URL = 'advertise.html';   // the media-kit page; it sends enquiries on to CONTACT_URL
const SPONSOR_ADS = {};   // e.g. { banner: { name: 'Brand', text: 'One line about it', url: 'https://…' } }
export function SPONSOR(place) {
  const ad = SPONSOR_ADS[place];
  if (ad) return `<aside class="sponsor-slot sponsor-${place}" aria-label="Sponsor">
  <span class="sp-label">Sponsored</span>
  ${ad.img ? `<img class="sp-img" src="${ad.img}" alt="${esc(ad.name)}" width="96" height="96" loading="lazy">` : '<span class="sp-ic" aria-hidden="true">⭐</span>'}
  <div><b>${esc(ad.name)}</b><p>${esc(ad.text)}</p></div>
  <a class="sp-btn" href="${ad.url}" target="_blank" rel="sponsored noopener">Visit →</a>
</aside>`;
  // Vertical rail (desktop only, beside the guide text): a sample ad for the MSDEVBUILD blog,
  // so advertisers can see what a filled tall slot looks like.
  if (place === 'vertical') return `<div class="sky-rail"><aside class="sponsor-slot sponsor-vertical is-sample" aria-label="Sample ad">
  <span class="sp-label">Sample ad</span>
  <span class="sv-brand" aria-hidden="true">💻</span>
  <b>MSDEVBUILD Blog</b>
  <p>Real engineering stories on .NET, MAUI, Flutter, Azure and AI by Suthahar Jegatheesan.</p>
  <a class="sp-btn" href="https://blog.msdevbuild.com/" target="_blank" rel="noopener">Read the blog →</a>
  <a class="sv-adv" href="${ADVERTISE_URL}" rel="noopener">Your ad here? Advertise with us</a>
</aside></div>`;
  const copy = place === 'banner'
    ? ['Your brand here', 'This space is available for child-safe, family-friendly sponsors.']
    : ['Advertise on Learn Tamil', 'Reach parents and teachers who are helping children learn Tamil. We accept only child-safe, family-friendly sponsors, shown as a simple image or text link with no tracking.'];
  return `<aside class="sponsor-slot sponsor-${place} is-sample" aria-label="Advertise with us">
  <span class="sp-label">Sample ad · this space is available</span>
  <span class="sp-ic" aria-hidden="true">📣</span>
  <div><b>${copy[0]}</b><p>${copy[1]}</p></div>
  <a class="sp-btn" href="${ADVERTISE_URL}" rel="noopener">Advertise with us →</a>
</aside>`;
}

/* "Stay connected" — the maker's YouTube, Instagram, Buy Me a Coffee, AI & programming blog and contact.
   Grown-up places ONLY: guide pages (after the article), the parents' area of the home page, the footer and the
   Parent dashboard (behind the Hold gate). Never inside lessons, games, stories or certificates: the YouTube and
   Instagram content is for adults (Instagram is 13+). Plain links in a new tab — no embeds, no widget scripts,
   no tracking pixels — so nothing loads from those sites until a grown-up taps. */
export const YOUTUBE_URL = 'https://www.youtube.com/channel/UCDrVJHz36TVZ3eFP8n-KLSg';
export const INSTAGRAM_URL = 'https://www.instagram.com/nikibhavi/';
export const BLOG_URL = 'https://blog.msdevbuild.com/';
export const CONTACT_URL = 'https://blog.msdevbuild.com/contact/';
const ICON_YT = '<svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true" focusable="false"><rect width="28" height="20" rx="5" fill="#ff0000"/><path d="M11.2 5.6v8.8l7.6-4.4z" fill="#fff"/></svg>';
const ICON_IG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="#fff" stroke="none"/></svg>';
const CONNECT_ITEMS = [
  { id: 'yt', ic: ICON_YT, url: YOUTUBE_URL, title: 'Subscribe to NikiBhavi',
    text: 'Want to know more about Malaysia, living costs, career opportunities and life in Malaysia? Subscribe to NikiBhavi on YouTube and stay connected!',
    btn: 'Subscribe on YouTube', short: 'YouTube' },
  { id: 'ig', ic: ICON_IG, url: INSTAGRAM_URL, title: 'Follow us on Instagram',
    text: 'Follow us on Instagram for more updates, interesting content, tips and everyday experiences!',
    btn: 'Follow on Instagram', short: 'Instagram' },
  { id: 'bmc', ic: '<span aria-hidden="true">☕</span>', url: COFFEE_URL, title: 'Support our work',
    text: 'Enjoying our content? Support our work and help us create more useful learning resources. Every contribution makes a difference!',
    btn: 'Buy Me a Coffee', short: 'Buy me a coffee' },
  { id: 'ai', ic: '<span aria-hidden="true">🤖</span>', url: BLOG_URL, title: 'Learn AI and programming',
    text: 'Want to learn AI, programming, software development and real-world technology concepts? Explore our technical articles and start learning today!',
    btn: 'Explore AI & Programming', short: 'AI & programming blog' },
];
const ext = (url, cls, inner, label) => `<a class="${cls}" href="${url}" target="_blank" rel="noopener"${label ? ` aria-label="${esc(label)} (opens a new tab)"` : ''}>${inner}</a>`;
export function CONNECT(place = 'page') {
  if (place === 'footer') return `<div class="foot-connect">
      <b>Stay connected</b>
      <nav class="fc-links" aria-label="Follow and support">${CONNECT_ITEMS.map(c => ext(c.url, `fc fc-${c.id}`, `<span class="fc-ic">${c.ic}</span>${esc(c.short)}`, c.btn)).join('')}${ext(CONTACT_URL, 'fc fc-mail', '<span class="fc-ic"><span aria-hidden="true">✉️</span></span>Contact us', 'Contact us')}</nav>
    </div>`;
  // The home page already shows the coffee card right above this one, so it skips that tile.
  const items = place === 'home' ? CONNECT_ITEMS.filter(c => c.id !== 'bmc') : CONNECT_ITEMS;
  return `<section class="connect connect-${place}" aria-labelledby="connect-${place}-h">
  <span class="cn-deco" aria-hidden="true"><i>⭐</i><i>💛</i><i>✨</i><i>🌸</i></span>
  <div class="cn-top">
    <div class="cn-kili" aria-hidden="true"><span class="cn-bird">🦜</span><span class="cn-bubble" lang="ta">வணக்கம்!</span></div>
    <div>
      <p class="cn-eyebrow">For parents &amp; grown-ups</p>
      <h2 id="connect-${place}-h" class="cn-h">Stay connected with us 💛</h2>
      <p class="cn-sub">Learn Tamil stays free, with no ads in the lessons or games. If you enjoy it, here is where else you can find us. <span class="ta">நன்றி!</span></p>
    </div>
  </div>
  <div class="cn-grid">${items.map(c => `
    <div class="cn-card cn-${c.id}">
      <span class="cn-ic">${c.ic}</span>
      <b>${esc(c.title)}</b>
      <p>${esc(c.text)}</p>
      ${ext(c.url, 'cn-btn', `${esc(c.btn)} <span aria-hidden="true">↗</span>`, c.btn)}
    </div>`).join('')}
  </div>
  <div class="cn-contact">
    <span class="cn-ic" aria-hidden="true">✉️</span>
    <p><b>Let’s talk.</b> Have a question, need guidance, or want to collaborate with us? Feel free to get in touch. We’d love to hear from you! <span class="muted">Questions about Malaysia and careers, AI and programming, partnerships or a topic you’d like us to cover — all welcome.</span></p>
    ${ext(CONTACT_URL, 'cn-btn cn-btn-mail', 'Get in touch <span aria-hidden="true">↗</span>', 'Get in touch')}
  </div>
</section>`;
}

/* All guide pages — used for the footer, "More guides" cards, sitemap and llms.txt. */
export const GUIDES = [
  { file: 'learn-tamil-online.html', ic: '🚀', en: 'Learn Tamil online — free beginner’s guide', ta: 'தமிழ் கற்போம்' },
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
  { file: 'tamil-animals.html', ic: '🦁', en: 'Animals in Tamil', ta: 'விலங்குகள்' },
  { file: 'tamil-birds.html', ic: '🦜', en: 'Birds in Tamil', ta: 'பறவைகள்' },
  { file: 'tamil-vehicles.html', ic: '🚌', en: 'Vehicles in Tamil', ta: 'வாகனங்கள்' },
  { file: 'tamil-shapes.html', ic: '🔺', en: 'Shapes in Tamil', ta: 'வடிவங்கள்' },
  { file: 'tamil-opposite-words.html', ic: '↔️', en: 'Opposite words in Tamil', ta: 'எதிர்ச்சொற்கள்' },
  { file: 'tamil-months.html', ic: '🗓️', en: 'Tamil months — the 12 months', ta: 'தமிழ் மாதங்கள்' },
  { file: 'tamil-pronunciation-guide.html', ic: '👂', en: 'Tamil pronunciation guide', ta: 'உச்சரிப்பு' },
  { file: 'tamil-phrases-for-beginners.html', ic: '💬', en: 'Basic Tamil phrases', ta: 'அன்றாடச் சொற்றொடர்கள்' },
  { file: 'aathichoodi.html', ic: '🌺', en: 'Aathichoodi with meaning', ta: 'ஆத்திசூடி' },
  { file: 'tamil-rhymes-for-kids.html', ic: '🎵', en: 'Tamil rhymes for kids', ta: 'சிறுவர் பாடல்கள்' },
  { file: 'tamil-festivals-for-kids.html', ic: '🪔', en: 'Tamil festivals for kids', ta: 'பண்டிகைகள்' },
  { file: 'how-to-teach-tamil-to-kids.html', ic: '👪', en: 'How to teach Tamil to kids — parents’ guide', ta: 'பெற்றோருக்கான வழிகாட்டி' },
  { file: 'thirukkural.html', ic: '📜', en: 'Thirukkural for kids', ta: 'திருக்குறள்' },
  { file: 'thirukkural-chapters.html', ic: '📗', en: 'All 133 Thirukkural chapters', ta: 'அதிகாரங்கள்' },
  { file: 'thirukkural-topics.html', ic: '🧭', en: 'Thirukkural by topic', ta: 'தலைப்பு வாரியாக' },
  { file: 'install-app.html', ic: '📲', en: 'Install the app · QR code · share', ta: 'செயலியை நிறுவுதல்' },
  { file: 'learn-tamil-faq.html', ic: '❓', en: 'Learn Tamil FAQ & help', ta: 'கேள்வி பதில்' },
  { file: 'tamil-printables.html', ic: '🖨️', en: 'Free printable charts & worksheets', ta: 'அச்சிடும் தாள்கள்' }
];

const FLOAT = ['அ','க','ழ','ஆ','ம','இ','ஞ','ஃ','பூ','கா'];
const floaters = () => FLOAT.map((l, i) =>
  `<span style="left:${4 + (i * 61) % 90}%;top:${8 + (i * 37) % 76}%;font-size:${30 + (i * 13) % 40}px;--t:${7 + i % 5}s;--dl:${-i * 0.7}s">${l}</span>`).join('');

/* ---------- shared page shell (kid-friendly hero, schema, footer) ---------- */
export function shell({ file, title, description, h1, eyebrow, body, schema = [], ogType = 'article',
                        lang = 'en', alternates = [], bubble = '', guide = false, crumbs = [], share = ogType !== 'website' || guide }) {
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
      ...crumbs.map(([name, f], i) => ({ '@type': 'ListItem', position: i + 2, name, item: SITE + f })),
      { '@type': 'ListItem', position: crumbs.length + 2, name: plainH1, item: url } ] },
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
<script>try{var r=document.documentElement,t=localStorage.getItem('lt-theme');if(t)r.setAttribute('data-theme',t);[['text','lt-text'],['contrast','lt-contrast'],['motion','lt-motion']].forEach(function(a){var v=localStorage.getItem(a[1]);if(v)r.setAttribute('data-'+a[0],v)})}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700;800&family=Baloo+Thambi+2:wght@600;700;800&family=Inter:wght@400;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700;800&family=Baloo+Thambi+2:wght@600;700;800&family=Inter:wght@400;600;700&display=swap"></noscript>
${styleTags()}
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
    ${COFFEE_TOP}
    ${file !== 'tamil-printables.html' ? '<a class="btn small" href="tamil-printables.html"><span aria-hidden="true">🖨️</span> <span class="hide-sm">Printables</span></a>' : ''}
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
        <p class="doc-meta">${T.updated} <time datetime="${TODAY}">${fmtDay(TODAY, lang)}</time> · ${T.by} <a href="https://blog.msdevbuild.com/about/" rel="author">Suthahar Jegatheesan</a></p>
      </div>
      <div class="doc-mascot" aria-hidden="true"><span class="bird">🦜</span>${bubble ? `<span class="bubble">${bubble}</span>` : ''}</div>
    </div>
  </section>
${guide ? SPONSOR('vertical') + SPONSOR('banner') : ''}
${body}
${guide ? SPONSOR('card') : ''}
${share ? '<div class="share-row share-inline" data-share-row="Share this page"></div>' : ''}
${guide ? CONNECT('page') : ''}
${more}
</main>
${FOOTER}
${scriptTags(SERVICES)}
</body>
</html>
`;
}
export const FOOTER = `<footer>
  <div class="wrap foot">
    <div><b>Learn Tamil</b> · <span class="ta">தமிழ் கற்போம்</span><br><span class="muted">Free Tamil alphabet lessons, reading and games for children. No sign-up, no ads in lessons or games.</span></div>
    <nav class="foot-links" aria-label="Footer">
      <a href="./">Learning app</a>
      <a href="privacy.html">Privacy &amp; data</a>
      <a href="terms.html">Terms</a>
      <a href="${ISSUES_URL}" rel="noopener">Report an issue / feedback</a>
      <a href="${REPO_URL}" rel="noopener" title="Learn Tamil is open source: see the code or contribute">Open source on GitHub</a>
      <a href="${ADVERTISE_URL}" rel="noopener">Advertise with us</a>
    </nav>
    ${CONNECT('footer')}
    <div class="share-row" data-share-row="Share Learn Tamil"></div>
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
   `Yes. Learn Tamil is completely free, needs no sign-up, shows no ads inside the lessons or games and does not track users. It works in any modern browser on phones, tablets and computers.`]
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
/* Honest dates. Pages are rebuilt on every build, but a page's dateModified, "Updated" line and sitemap
   <lastmod> only move when its content really changes: tools/page-dates.json keeps a hash of each page
   (with the date taken out) and the day that hash last changed. Search engines stop trusting <lastmod>
   on sites where it is always today, so this keeps re-crawling fast for the pages that did change. */
const DATES_FILE = path.join(ROOT, 'tools', 'page-dates.json');
const DATES = (() => { try { return JSON.parse(fs.readFileSync(DATES_FILE, 'utf8')); } catch { return {}; } })();
const hashOf = x => createHash('sha256').update(x).digest('hex').slice(0, 16);
const dateFor = (file, content) => {
  const hash = hashOf(content), prev = DATES[file];
  const date = prev && prev.hash === hash ? prev.date : TODAY;
  DATES[file] = { hash, date };
  return date;
};
const stamp = (file, html) => {
  if (typeof html !== 'string' || !/\.(html|txt)$/.test(file)) return html;
  const today = [TODAY, fmtDay(TODAY, 'en'), fmtDay(TODAY, 'ta')];
  const date = dateFor(file, today.reduce((h, t) => h.split(t).join('@DATE@'), html));
  if (date === TODAY) return html;
  const then = [date, fmtDay(date, 'en'), fmtDay(date, 'ta')];
  return today.reduce((h, t, i) => h.split(t).join(then[i]), html);
};
const lastmod = p => DATES[p || 'index.html']?.date || TODAY;
const write = (file, html) => fs.writeFileSync(path.join(ROOT, file), stamp(file, html));

/* ---------- 0. stylesheet bundle: the numbered CSS files joined in order ---------- */
write(STYLE_BUNDLE, '/* Generated by tools/build-pages.mjs from assets/css/NN-*.css — do not edit; edit those files. */\n' +
  STYLES.map(f => `/* ===== ${path.basename(f)} ===== */\n` + fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n'));

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
    ] },
  { id: 'animals', file: 'tamil-animals.html', bubble: 'Roar! 🦁', h1: 'Animals in Tamil — <span class="ta">விலங்குகள்</span>',
    title: 'Animal Names in Tamil for Kids (with Pictures)',
    description: 'Animal names in Tamil for children: சிங்கம் (lion), புலி (tiger), யானை (elephant), குரங்கு (monkey) and more — with pictures and letter-by-letter reading.',
    lead: 'Learn 12 animal names in Tamil. Each word shows a picture, the Tamil letters and the English meaning.',
    faq: [
      ['What are animal names in Tamil?', 'Lion சிங்கம் (singam), tiger புலி (puli), elephant யானை (yaanai), monkey குரங்கு (kurangu), deer மான் (maan), bear கரடி (karadi), dog நாய் (naai), cat பூனை (poonai), cow பசு (pasu), horse குதிரை (kuthirai), goat ஆடு (aadu), rabbit முயல் (muyal).'],
      ['What is the Tamil word for animal?', 'Animal is விலங்கு (vilangu) in Tamil; animals is விலங்குகள் (vilangugal).'],
      ['What is elephant in Tamil?', 'Elephant in Tamil is யானை (yaanai). It has three letters: யா + னை … written யானை.']
    ] },
  { id: 'birds', file: 'tamil-birds.html', bubble: 'Tweet tweet!', h1: 'Birds in Tamil — <span class="ta">பறவைகள்</span>',
    title: 'Bird Names in Tamil for Kids (with Pictures)',
    description: 'Bird names in Tamil: கிளி (parrot), மயில் (peacock), கோழி (hen), வாத்து (duck), ஆந்தை (owl), புறா (dove) and more — with pictures for kids.',
    lead: 'Learn 9 bird names in Tamil, each with a picture, its letters and the English meaning.',
    faq: [
      ['What are bird names in Tamil?', 'Parrot கிளி (kili), peacock மயில் (mayil), hen கோழி (kozhi), duck வாத்து (vaathu), owl ஆந்தை (aanthai), dove or pigeon புறா (puraa), eagle கழுகு (kazhugu), swan அன்னம் (annam), sparrow குருவி (kuruvi).'],
      ['What is the Tamil word for bird?', 'Bird is பறவை (paravai) in Tamil; birds is பறவைகள் (paravaigal).'],
      ['What is peacock in Tamil?', 'Peacock in Tamil is மயில் (mayil). The peacock is the national bird of India.']
    ] },
  { id: 'vehicles', file: 'tamil-vehicles.html', bubble: 'Vroom!', h1: 'Vehicles in Tamil — <span class="ta">வாகனங்கள்</span>',
    title: 'Vehicle Names in Tamil for Kids — Car, Bus, Train',
    description: 'Vehicle names in Tamil: மிதிவண்டி (bicycle), பேருந்து (bus), மகிழுந்து (car), தொடர்வண்டி (train), வானூர்தி (aeroplane), கப்பல் (ship) — with pictures.',
    lead: 'Learn 8 vehicle names in Tamil. Where a borrowed word is also common (கார், ரயில், விமானம்), it is shown with the Tamil word.',
    faq: [
      ['What are vehicle names in Tamil?', 'Bicycle மிதிவண்டி (mithivandi), bus பேருந்து (perunthu), car மகிழுந்து (magizhunthu, also கார்), train தொடர்வண்டி (thodarvandi, also ரயில்), aeroplane வானூர்தி (vaanoorthi, also விமானம்), ship கப்பல் (kappal), boat படகு (padagu), lorry சரக்குந்து (sarakkunthu).'],
      ['What is car in Tamil?', 'The pure Tamil word for car is மகிழுந்து (magizhunthu). In everyday speech many people say கார் (kaar).'],
      ['What is bus in Tamil?', 'Bus in Tamil is பேருந்து (perunthu).']
    ] },
  { id: 'shapes', file: 'tamil-shapes.html', bubble: 'Circle, square…', h1: 'Shapes in Tamil — <span class="ta">வடிவங்கள்</span>',
    title: 'Shapes in Tamil for Kids — Circle, Square, Triangle',
    description: 'Shape names in Tamil: வட்டம் (circle), சதுரம் (square), முக்கோணம் (triangle), செவ்வகம் (rectangle), நட்சத்திரம் (star), இதயம் (heart).',
    lead: 'Learn 6 shape names in Tamil with a picture, the Tamil letters and the English meaning.',
    faq: [
      ['What are shape names in Tamil?', 'Circle வட்டம் (vattam), square சதுரம் (sathuram), triangle முக்கோணம் (mukkonam), rectangle செவ்வகம் (sevvagam), star நட்சத்திரம் (natchathiram), heart இதயம் (ithayam).'],
      ['What is triangle in Tamil?', 'Triangle in Tamil is முக்கோணம் (mukkonam) — from மூன்று (three) and கோணம் (angle).'],
      ['What is the Tamil word for shape?', 'Shape is வடிவம் (vadivam) in Tamil; shapes is வடிவங்கள் (vadivangal).']
    ] },
  { id: 'opposites', file: 'tamil-opposite-words.html', bubble: 'Big ↔ small', h1: 'Opposite words in Tamil — <span class="ta">எதிர்ச்சொற்கள்</span>',
    title: 'Opposite Words in Tamil for Kids (எதிர்ச்சொற்கள்)',
    description: 'Opposite words in Tamil for children: பெரிய–சிறிய (big–small), பகல்–இரவு (day–night), சூடு–குளிர் (hot–cold), மேலே–கீழே (up–down), உள்ளே–வெளியே.',
    lead: 'Learn 5 pairs of opposite words in Tamil (எதிர்ச்சொற்கள்). Say each pair together: பெரிய — சிறிய!',
    faq: [
      ['What are opposite words in Tamil called?', 'Opposite words are called எதிர்ச்சொற்கள் (ethirchorkal) in Tamil.'],
      ['What are some opposite words in Tamil?', 'பெரிய (big) — சிறிய (small); பகல் (day) — இரவு (night); சூடு (hot) — குளிர் (cold); மேலே (up) — கீழே (down); உள்ளே (inside) — வெளியே (outside).']
    ] },
  { id: 'months', file: 'tamil-months.html', bubble: 'சித்திரை first!', h1: 'Tamil months — <span class="ta">தமிழ் மாதங்கள்</span>',
    title: 'Tamil Months Names in Order (12 Tamil Months in English)',
    description: 'The 12 Tamil months in order: சித்திரை, வைகாசி, ஆனி, ஆடி, ஆவணி, புரட்டாசி, ஐப்பசி, கார்த்திகை, மார்கழி, தை, மாசி, பங்குனி — with English dates.',
    lead: 'The Tamil year has 12 months. It starts with சித்திரை in mid-April (Tamil New Year) and ends with பங்குனி. Each month runs from the middle of one English month to the middle of the next.',
    faq: [
      ['What are the 12 Tamil months in order?', '1 சித்திரை (Chithirai), 2 வைகாசி (Vaikaasi), 3 ஆனி (Aani), 4 ஆடி (Aadi), 5 ஆவணி (Aavani), 6 புரட்டாசி (Purattaasi), 7 ஐப்பசி (Aippasi), 8 கார்த்திகை (Kaarthigai), 9 மார்கழி (Maargazhi), 10 தை (Thai), 11 மாசி (Maasi), 12 பங்குனி (Panguni).'],
      ['Which is the first month of the Tamil year?', 'சித்திரை (Chithirai) is the first month. Tamil New Year (தமிழ்ப் புத்தாண்டு) is on the first day of சித்திரை, usually 14 April.'],
      ['Which Tamil month is Pongal in?', 'Pongal is on the first day of தை (Thai), usually 14 or 15 January.']
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


/* ---------- 8b. Aathichoodi, rhymes, festivals and the parents' guide (content from assets/js/data/) ---------- */
const AATHI_FAQ = [
  ['What is Aathichoodi?', 'Aathichoodi (ஆத்திசூடி) is a collection of short one-line sayings in Tamil, traditionally attributed to the poet Avvaiyar (ஔவையார்). The lines are arranged in Tamil alphabetical order, so children learn the letters and good values at the same time.'],
  ['Who wrote Aathichoodi?', 'Aathichoodi is traditionally attributed to the Tamil poet Avvaiyar (ஔவையார்).'],
  ['Why is it called Aathichoodi?', 'The name comes from its opening prayer, which praises the god who wears a garland of ஆத்தி (aathi) flowers — ஆத்தி + சூடி, “one who wears aathi”.'],
  ['What is the first line of Aathichoodi?', `The first line is “${AATHICHOODI[0][0]}” — ${AATHICHOODI[0][1]} It starts with அ, the first Tamil letter.`],
  ['How many lines does Aathichoodi have?', 'The full Aathichoodi has 109 short lines. The first 12 begin with the 12 Tamil vowels and the 13th with ஃ; these 13 are the ones children learn first and are shown on this page.']
];
write('aathichoodi.html', shell({
  file: 'aathichoodi.html', guide: true, bubble: 'அறம் செய விரும்பு!',
  title: 'Aathichoodi with Meaning in English — Uyir Lines for Kids',
  description: 'Aathichoodi (ஆத்திசூடி) by Avvaiyar with simple English meaning: அறம் செய விரும்பு, ஆறுவது சினம், இயல்வது கரவேல் … one line for each Tamil vowel.',
  h1: 'Aathichoodi with meaning — <span class="ta">ஆத்திசூடி</span>', eyebrow: `${AATHICHOODI.length} lines · Avvaiyar · Simple English meaning`,
  body: `
<p class="lead-doc"><strong>Aathichoodi (${ta('ஆத்திசூடி')}) is a set of one-line Tamil sayings traditionally attributed to the poet Avvaiyar.</strong> Each line begins with the next letter of the Tamil alphabet, so a child learns the 12 vowels and ஃ while learning to be kind, honest and hard-working. Below are the first ${AATHICHOODI.length} lines with a simple English meaning.</p>
<div class="aathi">${AATHICHOODI.map(([line, en], i) => `<div class="aathi-row" id="line-${i + 1}"><span class="aathi-l ta" aria-hidden="true">${lettersOf(line)[0]}</span><div><b class="ta">${line}</b><p>${esc(en)}</p></div></div>`).join('')}</div>
${tip('Say one line a day at breakfast and ask your child which letter it starts with. In the <a href="./#/stories">learning app</a> (Stories → Rhymes) every word lights up as the line is read aloud, and a new <b>Aathichoodi line of the day</b> is on the home screen.')}
<p>Print the <a href="printables/aathichoodi-poster.pdf">free Aathichoodi poster (PDF)</a> for your child’s wall.</p>
${h2('faq', '❓', 'Questions about Aathichoodi')}
<div class="faq">${faqHtmlFor(AATHI_FAQ)}</div>`,
  schema: [faqSchemaFor(AATHI_FAQ, 'aathichoodi.html'),
    { '@type': 'CreativeWork', '@id': SITE + 'aathichoodi.html#work', name: 'ஆத்திசூடி', alternateName: 'Aathichoodi', inLanguage: 'ta',
      creator: { '@type': 'Person', name: 'Avvaiyar', alternateName: 'ஔவையார்' }, isFamilyFriendly: true, genre: 'Tamil literature',
      text: AATHICHOODI.map(l => l[0]).join('\n') }]
}));

const RHYME_PAGE = RHYMES.filter(r => r.id !== 'aathichoodi');
const RHYME_FAQ = [
  ['What are some famous Tamil rhymes for kids?', 'Two of the best known are the traditional நிலா நிலா ஓடி வா (Nila nila odi vaa — “Moon, moon, come running”) and Mahakavi Bharathiyar’s ஓடி விளையாடு பாப்பா (Odi vilaiyadu paappa — “Run and play, little one”) from his பாப்பா பாட்டு.'],
  ['Who wrote “Odi vilaiyadu paappa”?', 'ஓடி விளையாடு பாப்பா is from பாப்பா பாட்டு (Paappa Paattu) by the poet Subramania Bharathiyar (மகாகவி பாரதியார், 1882–1921). It teaches children to play together, be kind and love learning.'],
  ['What does “Nila nila odi vaa” mean?', 'It means “Moon, moon, come running”. In the rhyme the child asks the moon to run over the hill and bring a jasmine flower. It is a traditional lullaby sung to young children in Tamil homes.']
];
write('tamil-rhymes-for-kids.html', shell({
  file: 'tamil-rhymes-for-kids.html', guide: true, bubble: 'Sing along!',
  title: 'Tamil Rhymes for Kids with Meaning — Nila Nila Odi Vaa',
  description: 'Tamil rhymes for children with English meaning: நிலா நிலா ஓடி வா and Bharathiyar’s ஓடி விளையாடு பாப்பா — sing along line by line.',
  h1: 'Tamil rhymes for kids — <span class="ta">சிறுவர் பாடல்கள்</span>', eyebrow: `${RHYME_PAGE.length} rhymes · Public domain · English meaning`,
  body: `
<p class="lead-doc">Classic Tamil rhymes for young children, line by line with the English meaning. Rhymes help a child hear the sounds of Tamil before reading them. In the <a href="./#/stories">learning app</a> (Stories → Rhymes) each word lights up as it is sung.</p>
${RHYME_PAGE.map(r => `${h2(r.id, r.ic, `${ta(r.title)} — ${esc(r.en)}`)}
<p class="muted">${esc(r.by)}</p>
<div class="rhyme-text">${r.lines.map(([l, en]) => `<p><b class="ta">${l}</b><br><span class="muted">${esc(en)}</span></p>`).join('')}</div>`).join('\n')}
${h2('aathi', '🌺', 'Aathichoodi')}
<p>Avvaiyar’s Aathichoodi is often sung too — one line for each vowel. See <a href="aathichoodi.html">Aathichoodi with meaning</a>.</p>
${h2('faq', '❓', 'Questions about Tamil rhymes')}
<div class="faq">${faqHtmlFor(RHYME_FAQ)}</div>`,
  schema: [faqSchemaFor(RHYME_FAQ, 'tamil-rhymes-for-kids.html'),
    ...RHYME_PAGE.map(r => ({ '@type': 'CreativeWork', '@id': SITE + 'tamil-rhymes-for-kids.html#' + r.id, name: r.title, alternateName: r.en, inLanguage: 'ta',
      creator: r.by.startsWith('Traditional') ? undefined : { '@type': 'Person', name: 'Subramania Bharathiyar', alternateName: 'மகாகவி பாரதியார்' },
      isFamilyFriendly: true, text: r.lines.map(l => l[0]).join('\n') }))]
}));

const FEST_FAQ = [
  ['When is Pongal?', 'Thai Pongal (தைப் பொங்கல்) is on the first day of the Tamil month தை, usually 14 or 15 January. It is a harvest festival: families boil rice with milk in a new pot until it overflows and thank the Sun. The day before is Bhogi and the day after is Maattu Pongal, when cows are thanked.'],
  ['When is Tamil New Year?', 'Tamil New Year (தமிழ்ப் புத்தாண்டு, Puthandu) is on the first day of சித்திரை, usually 14 April. Families greet each other with “புத்தாண்டு வாழ்த்துகள்!” (Happy New Year!).'],
  ['What is Karthigai Deepam?', 'Karthigai Deepam (கார்த்திகை தீபம்) is the festival of lamps in the Tamil month கார்த்திகை (November–December). Rows of small clay lamps (அகல் விளக்கு) are lit all around the house.'],
  ['How do you say Happy Pongal in Tamil?', '“பொங்கல் வாழ்த்துகள்!” (Pongal vaazhthukkal) means Happy Pongal. On the day people also shout “பொங்கலோ பொங்கல்!” when the milk boils over.']
];
write('tamil-festivals-for-kids.html', shell({
  file: 'tamil-festivals-for-kids.html', guide: true, bubble: 'பொங்கலோ பொங்கல்!',
  title: 'Tamil Festivals for Kids — Pongal, Tamil New Year, Deepavali',
  description: 'Tamil festivals for children in simple Tamil with English meaning: Pongal, Tamil New Year (Puthandu), Deepavali and Karthigai Deepam, with festival words.',
  h1: 'Tamil festivals for kids — <span class="ta">பண்டிகைகள்</span>', eyebrow: `${FESTIVALS.length} festivals · Simple Tamil · English meaning`,
  body: `
<p class="lead-doc">Short read-aloud stories about the main Tamil festivals, in simple Tamil sentences with the English meaning, plus the special words for each festival. In the <a href="./#/stories">learning app</a> (Stories → Festivals) every story is read aloud.</p>
<nav class="toc glass" aria-label="Festivals"><b>Festivals</b>${FESTIVALS.map(f => `<a href="#${f.id}"><span class="ta">${f.title}</span></a>`).join('')}</nav>
${FESTIVALS.map(f => `${h2(f.id, f.cover, `${ta(f.title)} — ${esc(f.en)}`)}
<div class="rhyme-text">${f.pages.map(([pic, t, en]) => `<p><span aria-hidden="true">${pic}</span> <b class="ta">${t}</b><br><span class="muted">${esc(en)}</span></p>`).join('')}</div>
<div class="wcards">${f.words.map(wordCard).join('')}</div>`).join('\n')}
${h2('faq', '❓', 'Questions about Tamil festivals')}
<div class="faq">${faqHtmlFor(FEST_FAQ)}</div>`,
  schema: [faqSchemaFor(FEST_FAQ, 'tamil-festivals-for-kids.html'),
    DTS('tamil-festivals-for-kids.html', 'Tamil festival words', FESTIVALS.flatMap(f => f.words.map(([w, , m]) => [w, `Tamil word meaning “${m}” (${f.en}).`])))]
}));

const PARENT_FAQ = [
  ['At what age can a child start learning Tamil letters?', 'Most children can start hearing and naming Tamil letters at about 3 to 4 years old, and start writing them at about 4 to 5. Younger children learn best by listening, singing and pointing at pictures; reading and writing come later.'],
  ['How long does it take to learn the 247 Tamil letters?', 'With 10 to 15 minutes a day, many children learn the 12 vowels and 18 consonants in a few weeks. The 216 uyirmei letters follow a pattern (a consonant plus a vowel sign), so once the vowel signs are known, a new row is quick to learn. Every child is different — short daily practice matters more than speed.'],
  ['In what order should a child learn Tamil letters?', 'Start with the 12 vowels (உயிர்), then the 18 consonants (மெய்), then the uyirmei letters one consonant row at a time (க கா கி கீ …). Then read two-letter words such as ஆடு and மீன், then three-letter words, and then short stories.'],
  ['Can I teach Tamil if I cannot read it myself?', 'Yes. Learn Tamil plays the sound of every letter and word and checks answers in the games, so a parent can learn alongside the child. Speaking Tamil at home every day helps most of all.'],
  ['How can children living outside Tamil Nadu learn Tamil?', 'Use Tamil at home for everyday things — food, family names, colours, counting — and add 10 minutes of letters a day. Rhymes, stories and festival talk keep it fun. The app works offline after the first visit, and the printable worksheets give practice away from the screen.']
];
const STEPS = [
  ['Listen first', 'Let your child hear Tamil every day: talk, sing rhymes (<a href="tamil-rhymes-for-kids.html">நிலா நிலா ஓடி வா</a>) and read short <a href="tamil-stories-for-kids.html">stories</a> aloud.'],
  ['Learn the 12 vowels', 'Tap each <a href="tamil-vowels.html">vowel (உயிர்)</a> to hear it, with its picture word. Learn the short and long pairs together: அ–ஆ, இ–ஈ, உ–ஊ.'],
  ['Learn the 18 consonants', 'Learn the <a href="tamil-consonants.html">consonants (மெய்)</a> in their three groups: hard, soft and medium sounds.'],
  ['Build uyirmei letters', 'Join a consonant and a vowel: க் + ஆ = கா. Learn one row of the <a href="uyirmei-ezhuthukal.html">uyirmei chart</a> at a time.'],
  ['Write with your finger, then a pencil', 'Trace letters on screen (Games → Trace), then on paper with the free <a href="tamil-printables.html">tracing worksheets</a>.'],
  ['Read words, then sentences', 'Read two-letter <a href="tamil-words-for-kids.html">picture words</a> letter by letter, then three-letter words, then sentences from the stories.'],
  ['Keep it short, daily and happy', 'Ten minutes a day beats an hour once a week. Celebrate every letter — the app gives tokens, badges, stickers and a daily goal.'],
  ['Check progress', 'Take the short <a href="./#/certificate">level tests</a> for a certificate, and look at the Parent dashboard to see the learning path and which letters need more practice.']
];
write('how-to-teach-tamil-to-kids.html', shell({
  file: 'how-to-teach-tamil-to-kids.html', guide: true, bubble: 'Ten minutes a day!',
  title: 'How to Teach Tamil to Kids at Home — A Parents’ Guide',
  description: 'Teach your child Tamil at home: which letters to learn first, a 10-minute daily routine, free worksheets, rhymes and games. A simple plan for parents.',
  h1: 'How to teach Tamil to kids at home', eyebrow: 'For parents · 8 steps · 10 minutes a day',
  body: `
<p class="lead-doc"><strong>To teach a child Tamil at home, start with listening, then learn the 12 vowels, the 18 consonants and the uyirmei letters one row at a time, and read simple picture words — about 10 minutes every day.</strong> This guide gives the order to follow, a daily routine and free tools that help, even if you do not read Tamil yourself.</p>
${h2('steps', '🪜', 'Step by step')}
<ol class="steps">${STEPS.map(([t, d]) => `<li><b>${t}.</b> ${d}</li>`).join('')}</ol>
${h2('routine', '⏱️', 'A 10-minute daily routine')}
<ul>
  <li><b>2 minutes — hear it:</b> the letter of the day on the app’s home screen, or one Aathichoodi line.</li>
  <li><b>3 minutes — play it:</b> one game such as Listen &amp; pick or Build a letter.</li>
  <li><b>3 minutes — write it:</b> trace the letter on screen or on a worksheet.</li>
  <li><b>2 minutes — use it:</b> find the letter in a word around the house — on a food packet, a calendar or a book.</li>
</ul>
${h2('sounds', '👂', 'Sounds that need extra practice')}
<p>Some Tamil letters sound alike to young children: ${ta('ந ன ண')} (three kinds of n), ${ta('ல ள ழ')} (l, a curled l, and the special Tamil ${ta('ழ')}) and ${ta('ர ற')} (soft and strong r). Practise them in pairs and listen carefully — the Listen game never puts letters that sound alike side by side, so a child is not confused before they are ready.</p>
${h2('age', '🧒', 'By age')}
<ul>
  <li><b>Ages 3–5:</b> listening, rhymes, pictures and the 12 vowels. Use <a href="./#/little">Little ones mode</a> — pictures only, no wrong-answer buzzer.</li>
  <li><b>Ages 5–7:</b> all 30 vowels and consonants, tracing, uyirmei rows and two-letter words.</li>
  <li><b>Ages 7 and up:</b> all 247 letters, spelling, reading sentences and the certificate levels.</li>
</ul>
${tip('Children learn a language best when it is used for real things. Name foods, family members and colours in Tamil every day — see <a href="tamil-family-words.html">family words</a>, <a href="tamil-colours.html">colours</a> and <a href="tamil-fruits-and-food.html">fruits and food</a>.')}
${h2('faq', '❓', 'Questions parents ask')}
<div class="faq">${faqHtmlFor(PARENT_FAQ)}</div>`,
  schema: [faqSchemaFor(PARENT_FAQ, 'how-to-teach-tamil-to-kids.html'),
    { '@type': 'HowTo', '@id': SITE + 'how-to-teach-tamil-to-kids.html#howto', name: 'How to teach Tamil to kids at home', inLanguage: 'en',
      totalTime: 'PT10M', step: STEPS.map(([t, d], i) => ({ '@type': 'HowToStep', position: i + 1, name: t, text: d.replace(/<[^>]+>/g, '') })) }]
}));

/* ---------- 9. Free printables page (PDFs made by tools/build-printables.mjs) ---------- */
const PRINTS = fs.existsSync(path.join(ROOT, 'printables/printables.json'))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, 'printables/printables.json'), 'utf8')) : [];
const PRINT_FAQ = [
  ['Are the Tamil worksheets free to print?', 'Yes. All charts and tracing worksheets on this page are free for home and classroom use. Download the PDF and print as many copies as you like.'],
  ['What paper size are the printables?', 'They are made for A4 paper. On US Letter paper, choose “Fit to page” in the print settings.'],
  ['How should a child use the tracing worksheets?', 'Look at the blue letter, say its sound, then trace the grey outline letters from left to right. One row a day is plenty for young children.'],
  ['Is there an answer key?', 'Yes. The missing-letter, first-letter, uyirmei joining, word search, count-and-circle and colour-word worksheets end with an answer key page for parents and teachers. The matching worksheet checks itself: each picture has exactly one word.'],
  ['Do the worksheets match the app?', 'Yes. Every chart and worksheet is made from the same words and letters as the Learn Tamil app, so your child sees the same pictures and spellings on paper and on screen.']
];
/* Sections of the printables page, in order (cat comes from tools/build-printables.mjs). */
const PRINT_CATS = [
  { id: 'letters', ic: '🔤', en: 'Alphabet charts', ta: 'எழுத்து அட்டவணைகள்', note: 'For the wall — every letter with its sound.' },
  { id: 'words', ic: '🍎', en: 'Word charts and posters', ta: 'சொல் அட்டவணைகள்', note: 'Picture words by topic, opposites, days and months, Aathichoodi.' },
  { id: 'tracing', ic: '✏️', en: 'Tracing worksheets', ta: 'எழுதிப் பழகு', note: 'Trace the letters and words — vowels, consonants, all 216 uyirmei, picture words, number words, days of the week.' },
  { id: 'activity', ic: '🧩', en: 'Activity worksheets', ta: 'பயிற்சித் தாள்கள்', note: 'Match pictures to words, missing and first letters, join consonant + vowel, word search, count and circle, short and long vowels (with answer keys).' },
  { id: 'colouring', ic: '🎨', en: 'Colouring pages', ta: 'வண்ணம் தீட்டு', note: 'Colour the picture, then trace its Tamil word — or read a colour word and colour the box.' }
];
const printCard = d => `<article class="print-card">
  <a class="pc-thumb${d.landscape ? ' land' : ''}" href="printables/${d.file}.pdf" aria-label="Download ${esc(d.title)} (PDF)"><img src="assets/printables/${d.file}.png" alt="Preview of ${esc(d.title)}" loading="lazy" width="${d.landscape ? 520 : 368}" height="${d.landscape ? 368 : 520}"></a>
  <h3>${esc(d.title)}</h3><p class="muted">PDF · ${d.pages} page${d.pages > 1 ? 's' : ''} · A4 ${d.landscape ? 'landscape' : 'portrait'}</p>
  <a class="btn primary" href="printables/${d.file}.pdf" download>⬇ Download PDF</a></article>`;
const PRINT_PAGES = PRINTS.reduce((n, d) => n + d.pages, 0);
const USED_CATS = PRINT_CATS.filter(c => PRINTS.some(d => d.cat === c.id));
if (PRINTS.length) write('tamil-printables.html', shell({
  file: 'tamil-printables.html', guide: true, bubble: 'Print and practise!',
  title: 'Free Tamil Charts, Tracing & Activity Worksheets (PDF)',
  description: `${PRINTS.length} free Tamil PDFs for kids: alphabet and word charts, tracing for all 247 letters, word search, matching and colouring sheets.`,
  h1: 'Free printable Tamil charts & worksheets', eyebrow: `${PRINTS.length} free PDFs · ${PRINT_PAGES} pages · A4 · Home & classroom`,
  body: `
<p class="lead-doc">Free printable PDFs for children learning Tamil — charts for the wall, tracing and activity worksheets for the table, and colouring pages. Print on A4 (or Letter with “Fit to page”).</p>
<nav class="print-jump" aria-label="Printable types">${USED_CATS.map(c =>
  `<a href="#${c.id}"><span aria-hidden="true">${c.ic}</span> ${c.en} <small>${PRINTS.filter(d => d.cat === c.id).length}</small></a>`).join('')}</nav>
${USED_CATS.map(c => `${h2(c.id, c.ic, `${c.en} — ${ta(c.ta)}`)}
<p>${c.note}</p>
<div class="prints">${PRINTS.filter(d => d.cat === c.id).map(printCard).join('')}</div>`).join('\n')}
${tip('Stick the alphabet chart on the wall at your child’s eye level and point to a letter each day. Pair a worksheet with the <a href="./#/uyir">learning app</a> so your child can hear each letter while writing it.')}
${h2('faq', '❓', 'Questions about the printables')}
<div class="faq">${faqHtmlFor(PRINT_FAQ)}</div>`,
  schema: [faqSchemaFor(PRINT_FAQ, 'tamil-printables.html'),
    { '@type': 'ItemList', name: 'Free Tamil printables', itemListElement: PRINTS.map((d, i) => ({ '@type': 'ListItem', position: i + 1,
      item: { '@type': 'DigitalDocument', name: d.title, url: SITE + 'printables/' + d.file + '.pdf', encodingFormat: 'application/pdf',
        thumbnailUrl: SITE + 'assets/printables/' + d.file + '.png', isAccessibleForFree: true, inLanguage: ['ta', 'en'], author: { '@id': SITE + '#author' } } })) }]
}));

/* ---------- Ask Kili chat: knowledge base (assets/js/data/faq.js) ----------
   All guide FAQs + help about using the site. [text](url) becomes a link in the chat. */
const ISS = ISSUES_URL;
const HELP = [
  ['How do I hear a letter?', 'Open 🔤 Learn (கற்றல்) and tap any letter tile. The big letter, its sound and a picture word appear at the top; press 🔊 to hear it again. Vowels play the letter and then their picture word.', 'sound hear listen play letter tap audio', './#/uyir'],
  ['The sound is wrong or there is no sound', `Sounds come from your device's Tamil text-to-speech voice, which can mispronounce single letters. To get a Tamil voice — Android: Settings → Text-to-speech → Google → install Tamil. Windows: Settings → Time & language → Speech → add Tamil. iPhone/Mac: Settings → Accessibility → Spoken Content → Voices → Tamil. Microsoft Edge has clearer Tamil voices. If you hear a mistake, please [report it on GitHub Issues](${ISS}).`, 'sound voice wrong no not working mute silent pronounce pronunciation audio speaker tts', ''],
  ['How do I install Learn Tamil as an app?', 'On Android, Chrome or Edge, tap the ⬇ Install app button at the top. On iPhone or iPad, open the site in Safari, tap Share and then Add to Home Screen. The app opens full screen and has shortcuts to Letters, Reading, Stories, Games and Certificate. Steps for every device and a QR code to scan are on the [install page](install-app.html).', 'install app download home screen phone mobile iphone android pwa qr code scan share', 'install-app.html'],
  ['Does it work offline?', 'Yes. After your first visit, letters, reading, stories, games, certificates and the guide pages work without internet. Sounds from the device voice work offline only if the voice is stored on the device.', 'offline internet wifi network connection data', ''],
  ['How do I get a certificate?', 'Open 🎓 Certificate, choose one of the 10 levels and answer the questions (10 questions, pass with 8; the Champion level has 15, pass with 12). Type the name and download the certificate as a PDF. Each level unlocks the next, and every test asks new questions. Certificates are for encouragement, not an official qualification.', 'certificate cert pdf level test exam pass download சான்றிதழ்', './#/certificate'],
  ['What are tokens and badges?', 'Children earn 🪙 tokens for right answers, finished games, words read, stories and certificates, and unlock 🏅 badges such as “முதல் அடி” (first step). Tap 🪙 at the top to see them. They are saved only on this device.', 'token tokens coin coins badge badges reward rewards star stars points score', ''],
  ['How do I reset progress?', 'Tap 🪙 at the top to open My rewards, then press Reset progress. You can also clear this site’s data in your browser settings.', 'reset clear delete progress start again restart', ''],
  ['Which games are there?', 'Fourteen games: க் + ஆ = ? (build a letter), Listen & pick, Spin wheel, Balloon pop, Word builder, Memory, Tamil quiz, Picture words, Topics, Spelling, Sentences, Trace (write letters with a finger), Colouring (colours in Tamil) and Little ones for ages 3–5. Every right answer gives points, a cheer and tokens; 3 in a row gives a bonus.', 'game games play fun quiz balloon spin memory word builder', './#/practice'],
  ['Is my child’s data safe?', 'Yes. Learn Tamil has no accounts and no ad tracking. Progress is saved only in your own browser. If a parent allows it, it counts anonymous visits and game use with Google Analytics for Firebase, with advertising features turned off. On the website, a parent or guardian gives the child’s name, their own email and phone, and their consent before a certificate is made. We keep that record privately and never show it publicly or share it with advertisers. The Android app asks for nothing. See the [Privacy & data policy](privacy.html).', 'privacy data safe tracking personal cookies child children secure gdpr coppa', 'privacy.html'],
  ['How can I report a mistake or give feedback?', `Please open an issue on [GitHub Issues](${ISS}). There are short forms for a wrong sound or Tamil mistake, a bug, or an idea. Issues are public, so please don’t include personal details.`, 'report mistake bug error wrong issue feedback idea suggest problem github', ''],
  ['How can I support Learn Tamil?', `Learn Tamil is free, with no ads in the lessons or games. If it helps your family or classroom, you can [buy me a coffee](${COFFEE_URL}) ☕. Businesses can also sponsor the parents’ guide pages: [contact us to advertise](${ADVERTISE_URL}). Thank you — உங்கள் ஆதரவுக்கு நன்றி!`, 'support donate coffee pay money help contribute sponsor', ''],
  ['Who made Learn Tamil?', 'Learn Tamil was made by Suthahar Jegatheesan (MSDEVBUILD) as a free, non-commercial project for children and beginners learning Tamil. More at [blog.msdevbuild.com](https://blog.msdevbuild.com).', 'who made author creator owner msdevbuild suthahar about contact', ''],
  ['Where can I read Tamil stories?', 'Open 📖 Read → Stories & rhymes in the app to hear five short stories read aloud — tap any word to see its letters. You can also read them as text with English meaning on the [Tamil stories page](tamil-stories-for-kids.html).', 'story stories read kathai கதை moral', './#/stories'],
  ['Where can I download printable worksheets and charts?', 'Free printable PDFs — alphabet and picture-word charts, tracing worksheets for all 247 letters, word search, matching, missing-letter and joining worksheets and colouring pages — are on the [printables page](tamil-printables.html), or tap 🖨️ Printables in the menu. Print them on A4 or Letter paper.', 'printable print worksheet worksheets pdf chart tracing trace download sheet paper', 'tamil-printables.html'],
  ['What word topics can my child learn?', 'In 📖 Read → Words choose a topic: numbers 1–10, colours, days of the week, parts of the body, family, fruits & food, animals, birds, vehicles, shapes, opposites and the 12 Tamil months. Each word shows its picture and letters and can be heard aloud.', 'topic topics numbers colours colors days week body family fruit fruits food vocabulary words', './#/reading'],
  ['How can my child practise writing Tamil letters?', 'Tap ✍️ Trace under the big letter, or open Games → Trace. The letter is shown faintly; your child traces it with a finger, mouse or pen. When enough of the letter is covered it says the letter and gives a token. Printable tracing worksheets are on the [printables page](tamil-printables.html).', 'trace tracing write writing handwriting finger draw pen letter shape', './#/practice'],
  ['What is Say it back?', 'Tap 🎤 Say it under the big letter or in Reading. Your child hears the right sound, records themselves saying it, then plays both to compare. The recording stays on the device only and is deleted when the window closes — it is never uploaded.', 'say speak record microphone mic pronounce pronunciation voice compare', ''],
  ['Are there Tamil rhymes and Aathichoodi?', 'Yes. Open Stories → 🎵 Rhymes for நிலா நிலா ஓடி வா, Bharathiyar\'s ஓடி விளையாடு பாப்பா and Avvaiyar\'s ஆத்திசூடி — one wise line for each vowel. Each word lights up as it is sung. A new Aathichoodi line of the day is on the home screen.', 'rhyme rhymes song songs sing aathichoodi athichudi avvaiyar bharathiyar paappa nila poem', './#/stories'],
  ['Are there stories about Tamil festivals?', 'Yes. Open Stories → 🪔 Festivals for Pongal, Tamil New Year, Deepavali and Karthigai Deepam — a short read-aloud story and the special words for each.', 'festival festivals pongal deepavali diwali new year puthandu karthigai deepam culture', './#/stories'],
  ['Where can my child learn Thirukkural?', 'Tap 📜 திருக்குறள் next to the letter tabs (or open thirukkural.html). All 1,330 Kurals are there by division and chapter. Each Kural can be heard (🔊, 🐢 slowly, or 🔁 say after me), and many have word meanings, a simple Tamil and English meaning, an animated story and a short quiz. There are six Thirukkural games, a Kural of the day, printable worksheets for every chapter and a certificate test for each chapter. Mark a Kural as learned to earn badges.', 'thirukkural kural kurals thiruvalluvar valluvar திருக்குறள் குறள் couplet couplets adhikaram chapter worksheet certificate', 'thirukkural.html'],
  ['Is there a mode for very young children?', 'Yes — 👶 Little ones (ages 3–5). Big pictures, no English text, sounds play by themselves and there is no wrong-answer buzzer. Open it from the home screen or Games → Little ones.', 'little ones toddler young small preschool 3 4 5 year old baby easy mode', './#/little'],
  ['Can brothers and sisters use the same device?', 'Yes. Tap the animal picture on the home screen card to switch child. Add up to 6 children in the 👪 Parent dashboard. Each child has their own tokens, badges, stickers and certificates, saved only on that device.', 'profile profiles child children sibling siblings brother sister switch user kids family', ''],
  ['What is the Parent dashboard?', 'Tap 👪 Parents on the home screen and hold the button for 3 seconds. It shows your child’s age group and learning path (lessons done and what to try next), minutes learned each day, letters heard and traced, stories, certificates and the letters your child misses most. You can also add children and turn on a break reminder.', 'parent parents corner dashboard report progress time screen time break reminder settings', ''],
  ['Which age is Learn Tamil for?', 'Children aged 3 to 12, and beginners of any age. On the home screen choose an age group: 👶 3–5 (pictures, sounds and colours in Little ones), 🧒 6–8 (letters, tracing and first words) or 🧑‍🎓 9–12 (reading, spelling, stories and certificates). Each age group has its own learning path of lessons, shown with ticks as they are done.', 'age ages old year years 3 4 5 6 7 8 9 10 11 12 toddler preschool group level path lessons which age', ''],
  ['How is the app organised?', 'The menu has five parts: 🔤 Learn (all 247 letters), 📖 Read (words, stories, rhymes and festivals), 🎮 Play (14 games), 🖨️ Print (free worksheets and charts) and 🎓 Certificate (10 level tests).', 'menu navigation where find learn read play print sections tabs organised', ''],
  ['Can I make the text bigger or change the sound?', 'Yes. Tap ⚙️ at the top. You can choose Large or Extra large text, turn on high contrast, use less movement, turn game sounds on or off, and change the voice speed and volume. The settings are saved only on this device.', 'settings accessibility bigger larger text font size zoom contrast high contrast motion animation sound volume speed voice mute dyslexia low vision', ''],
  ['What is the daily gift?', 'After your child learns the first thing each day, the 🎁 on the home screen card opens for bonus tokens. The longer the day streak, the bigger the gift (up to 10 tokens). Missing a day never takes anything away.', 'daily gift reward bonus streak every day chest present tokens motivation', ''],
  ['What is the sticker book?', 'Every 10 tokens 🪙 unlock a new picture sticker with its Tamil name. Tap 📒 Stickers on the home screen to see the book and tap a sticker to hear its name.', 'sticker stickers book collect collection reward', ''],
  ['How does reading practice work?', 'Open 📖 Read → Words. Read the word yourself, tap 🐢 to hear it letter by letter, then show the picture to check. There are three levels: 2, 3 and 4+ letter words.', 'reading read practice words level spell', './#/reading']
];

/* ---------- 8c. Thirukkural (திருக்குறள்): guide, the 133 chapters, one page per chapter ----------
   The couplets come from assets/js/data/thirukkural.json (checked by tools/import-thirukkural.mjs); children's
   meanings from assets/js/data/kural-lessons.js. Nothing here invents a fact: counts and names are read from the data. */
const KURAL = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/js/data/thirukkural.json'), 'utf8'));
const kText = n => KURAL.k[n - 1];
const kChPage = c => `thirukkural-chapter-${c}.html`;
const kPaalOf = c => KURAL_PAALS.find(p => c >= p.from && c <= p.to);
const kCouplet = (n, { lesson = true } = {}) => {
  const [l1, l2, pope] = kText(n), L = lesson && KURAL_LESSONS[n];
  return `<div class="kd-kural" id="kural-${n}"><a class="kd-n" href="#kural-${n}" aria-label="Kural ${n}">${n}</a><div>
  <p class="kd-lines ta" lang="ta">${l1}<br>${l2}</p>
  ${L ? `<p class="kd-mean"><b>Meaning for children:</b> ${esc(L.en)}</p><p class="kd-mean ta" lang="ta">${L.ta}</p>` : ''}
  <p class="kd-pope"><span class="muted">G. U. Pope (1886):</span> ${esc(pope)}</p></div></div>`;
};
const KURAL_FAQ = [
  ['What is Thirukkural?', 'Thirukkural (திருக்குறள், Thirukkuṟaḷ) is a classic Tamil book of 1,330 short couplets called Kurals (குறள்). Each Kural gives one piece of advice about living well — being kind, honest, hard-working, a good friend and a fair leader. It is one of the most loved works of Tamil literature and is often called உலகப் பொதுமறை (ulaga podhumarai), “the common scripture of the world”.'],
  ['Who wrote Thirukkural?', 'Thirukkural was written by the poet Thiruvalluvar (திருவள்ளுவர்), also called Valluvar. Very little is known for certain about his life.'],
  ['How many Kurals are there in Thirukkural?', 'There are 1,330 Kurals in 133 chapters (அதிகாரம், adhikaram). Every chapter has exactly 10 Kurals on one topic, such as கல்வி (learning) or நட்பு (friendship).'],
  ['What are the three divisions of Thirukkural?', 'Thirukkural has three divisions (பால், paal): அறத்துப்பால் (Arathuppaal, virtue) with 38 chapters and 380 Kurals; பொருட்பால் (Porutpaal, wealth and society) with 70 chapters and 700 Kurals; and காமத்துப்பால் (Kaamathuppaal, love) with 25 chapters and 250 Kurals.'],
  ['What is the first Kural of Thirukkural?', `The first Kural is “${kText(1)[0]} / ${kText(1)[1]}” — just as all letters begin with அ (a), the world has ஆதி பகவன் (Aadhi Bhagavan) as its beginning. Traditional commentators such as Parimelazhagar read ஆதி பகவன் as “God, the First One”; other readings exist, but all agree on the idea of a first source. It opens the chapter கடவுள் வாழ்த்து (The Praise of God).`],
  ['What does the word Thirukkural mean?', 'திரு (thiru) means sacred or honoured, and குறள் (kural) means short — each Kural is a short two-line verse. So Thirukkural means “the sacred short verses”.'],
  ['How many chapters are in Thirukkural?', 'Thirukkural has 133 chapters (அதிகாரம்). Chapters 1–38 are அறத்துப்பால் (virtue), 39–108 are பொருட்பால் (wealth and society) and 109–133 are காமத்துப்பால் (love).'],
  ['Which Thirukkural is easiest for children to start with?', `Many families start with Kural 1, “${kText(1)[0]}…”, because it begins with அ, the first letter children learn. Kural 391, “${kText(391)[0]}…”, about learning well, is another favourite. In the Learn Tamil app, “Start here” has ${Object.keys(KURAL_LESSONS).length} Kurals with pictures, stories and quizzes.`],
  ['Which Thirukkural chapters teach kindness?', 'Chapter 8 அன்புடைமை (love), chapter 25 அருளுடைமை (compassion), chapter 10 இனியவை கூறல் (pleasant words) and chapter 32 இன்னா செய்யாமை (not harming others). See Thirukkural by topic for friendship, learning, honesty and more.'],
  ['How can I memorise Thirukkural easily?', 'Learn one Kural a day. Say it aloud line by line, learn what each hard word means, then say the whole Kural without looking. Revise yesterday’s Kural before a new one, and say a few old ones each week. Understanding the meaning makes it far easier to remember.'],
  ['Can children learn one Thirukkural a day?', 'Yes. One Kural takes about five minutes: listen, repeat, learn the words, talk about the meaning. The app’s Kural of the day gives everyone the same Kural on the same date and keeps a day streak.'],
  ['Where can I listen to Thirukkural in Tamil?', 'The free Learn Tamil Thirukkural page reads every Kural aloud, line by line and slowly, with “say after me” practice. It uses your device’s Tamil voice, so sound quality depends on the device; nothing is recorded or sent anywhere.'],
  ['How can teachers teach Thirukkural in class?', 'Take one chapter a week, one or two Kurals a day. Read the Kural together, explain the hard words, ask children for a real-life example, then revise with a quick quiz. The app prints worksheets for every chapter (couplets with meanings, copywork, missing words with answers) and gives chapter tests with certificates.'],
  ['Is காமத்துப்பால் suitable for children?', 'காமத்துப்பால் (Kurals 1081–1330) is about love between adults. It is classic poetry, not unsafe, but it suits older children reading with a grown-up. The children’s learning path, level exams and Kural of the day use only அறத்துப்பால் and பொருட்பால் (Kurals 1–1080).'],
  ['How can children learn Thirukkural?', 'Learn one Kural a day. Listen to it, say it line by line, learn the hard words, then talk about what it means and where you could use it today. Repeat yesterday’s Kural before starting a new one. The free Learn Tamil app reads each Kural aloud, explains the words and has stories, quizzes and games.']
];
const kTitle = c => { const [ta, en] = KURAL.ch[c - 1];
  return [`Thirukkural Chapter ${c}: ${ta} with Meaning`, `Thirukkural Chapter ${c}: ${ta}`, `Thirukkural Chapter ${c} — ${en}`].find(t => t.length <= 60) || `Thirukkural Chapter ${c}`; };
const kDesc = c => { const [ta, en] = KURAL.ch[c - 1], [l1] = kText(c * 10 - 9);
  let d = `Thirukkural chapter ${c}, ${ta} (${en}): Kurals ${c * 10 - 9}–${c * 10} in Tamil with English translation. Begins: ${l1}`;
  if (d.length > 155) d = d.slice(0, 154).replace(/\s+\S*$/, '') + '…';
  return d; };

/* thirukkural.html is a hand-written app page (like index.html); its guide text and JSON-LD are generated here. */
const KURAL_ABOUT = `<section class="k-about doc" id="kAbout" aria-labelledby="kAboutT">
<h2 id="kAboutT"><span class="h-ic" aria-hidden="true">📜</span>What is Thirukkural?</h2>
<p class="lead-doc"><strong>Thirukkural (${ta('திருக்குறள்')}) is a classic Tamil book of 1,330 two-line couplets, called Kurals, written by the poet Thiruvalluvar (${ta('திருவள்ளுவர்')}).</strong> Each Kural gives one piece of wise advice — be kind, speak the truth, keep learning, choose good friends — in just seven metrical feet: four in the first line and three in the second. The book has 133 chapters of 10 Kurals each, in three divisions.</p>
${h2('divisions', '🌳', 'The three divisions (பால்)')}
<div class="kd-paals">${KURAL_PAALS.map(p => { const chs = p.to - p.from + 1;
  const groups = KURAL.iyal.filter(([, , from]) => from >= p.from && from <= p.to);
  return `<div class="kd-paal"><span aria-hidden="true">${p.ic}</span><h3>${ta(p.ta)} — ${esc(p.en)}</h3><p><b>${chs} chapters · ${chs * 10} Kurals</b> (chapters ${p.from}–${p.to}).</p><p>${esc(p.intro[1])}</p><p class="muted">Sections (இயல்): ${groups.map(([t, e]) => `${ta(t)} (${esc(e)})`).join(', ')}.</p></div>`; }).join('')}</div>
<p>See <a href="thirukkural-chapters.html">all 133 chapters with their English names</a>, or <a href="thirukkural-topics.html">Thirukkural by topic</a> — kindness, learning, friendship, honesty and more.</p>
${h2('first', '🔤', 'The first Kural, explained for children')}
${kCouplet(1)}
${KURAL_LESSONS[1] ? `<p><b>Word by word:</b> ${KURAL_LESSONS[1].words.map(([w, , en]) => `${ta(w)} — ${esc(en)}`).join('; ')}.</p>
${KURAL_LESSONS[1].note ? `<p><b>About “${ta('ஆதி பகவன்')}”:</b> ${esc(KURAL_LESSONS[1].note[1])}</p>` : ''}
<p><b>Use it today:</b> ${esc(KURAL_LESSONS[1].life[1])}</p>` : ''}
${h2('chapter-1', '📗', `Chapter 1: ${ta(KURAL.ch[0][0])} — ${esc(KURAL.ch[0][1])}`)}
<p>The first chapter has ten Kurals. Each has a simple meaning for children and G. U. Pope’s classic English translation.</p>
${Array.from({ length: 9 }, (_, i) => kCouplet(i + 2)).join('\n')}
<p><a href="${kChPage(2)}">Next: chapter 2, ${ta(KURAL.ch[1][0])} (${esc(KURAL.ch[1][1])}) →</a></p>
${h2('how', '🧒', 'How can children learn Thirukkural?')}
<ol class="steps">
  <li><b>One Kural a day.</b> Short and regular beats long and rare. Start with chapter 1, or with a chapter that matches your child’s day — கல்வி (learning, chapter 40) or நட்பு (friendship, chapter 79).</li>
  <li><b>Listen, then say it line by line.</b> In the app, 🔁 Say after me reads one line and waits for your child to repeat it.</li>
  <li><b>Learn the hard words.</b> Kurals use old Tamil words; the word-by-word meaning makes them easy.</li>
  <li><b>Talk about the meaning.</b> Ask: “When could you use this today?” A story or a real example from home or school helps it stick.</li>
  <li><b>Revise.</b> Say yesterday’s Kural before a new one. Quizzes and games in the app revise the Kurals your child has learned.</li>
</ol>
${tip('Kurals 1–380 (அறத்துப்பால்) and 381–1080 (பொருட்பால்) suit children best. காமத்துப்பால் (love) is better read with older children, with a grown-up.')}
${h2('ages', '🎂', 'Thirukkural by age')}
<div class="tbl"><table class="kd-ages"><thead><tr><th>Age</th><th>What works</th><th>In the app</th></tr></thead><tbody>
<tr><td><b>3–5</b></td><td>Listen and repeat one line at a time. Pictures and a short story; no need to understand every word.</td><td>🌟 Start here · 🎬 story · 🔁 Say after me</td></tr>
<tr><td><b>6–8</b></td><td>One Kural a day: the Kural, its simple Tamil meaning and its English meaning. Talk about one example from the child’s day.</td><td>📅 Kural of the day · 🎮 games · 🌱 levels 1–3</td></tr>
<tr><td><b>9–12</b></td><td>Word-by-word meanings, quizzes, writing the Kural from memory, whole chapters.</td><td>📖 word meanings · ❓ quiz · 🖨️ copywork · 🎓 level exams</td></tr>
<tr><td><b>13+</b></td><td>Pope’s English verse, traditional commentaries, discussion of what a Kural means today. காமத்துப்பால் with a grown-up.</td><td>📗 all 133 chapters · 🎓 chapter certificates</td></tr>
</tbody></table></div>
${h2('daily', '📅', 'Thirukkural of the day')}
<p>The <a href="#/daily">Kural of the day</a> is the same for everyone on a given date and goes through all 1,080 Kurals of அறத்துப்பால் and பொருட்பால் before repeating. Learn it, answer two questions and keep your streak going.</p>
${h2('about-text', '📚', 'About this text')}
<ul class="kd-credits">
  <li><b>Original work:</b> Thirukkural by Thiruvalluvar (${ta('திருவள்ளுவர்')}).</li>
  <li><b>Tamil text:</b> checked word by word against three independent sources (below); every correction is documented.</li>
  <li><b>English verse:</b> Rev. G. U. Pope, <i>The Sacred Kurral</i> (1886), public domain.</li>
  <li><b>Meanings, stories and quizzes for children:</b> Learn Tamil’s own simplified explanations (${Object.keys(KURAL_LESSONS).length} Kurals so far), being reviewed by a Tamil teacher. Where scholars read a Kural differently, we follow the traditional commentary and say so.</li>
  <li><b>Published by:</b> Learn Tamil · MSDEVBUILD (Suthahar Jegatheesan). <b>Last updated:</b> <time datetime="${TODAY}">${TODAY}</time>.</li>
</ul>
<p>The Tamil text of all 1,330 Kurals on this site was checked against three independent copies: <a href="https://www.projectmadurai.org/" rel="noopener">Project Madurai</a>, the open <a href="https://github.com/tk120404/thirukkural" rel="noopener">tk120404/thirukkural</a> dataset and <a href="https://ta.wikisource.org/" rel="noopener">Tamil Wikisource</a>. The English verse translation is by Rev. G. U. Pope (1886), which is in the public domain. Meanings for children are written by Learn Tamil to simplify, never change, the traditional meaning. Found a mistake? Please <a href="${ISSUES_URL}" rel="noopener">report it</a>.</p>
${h2('faq', '❓', 'Questions about Thirukkural')}
<div class="faq">${faqHtmlFor(KURAL_FAQ)}</div>
</section>`;
const KURAL_SCHEMA = { '@context': 'https://schema.org', '@graph': [faqSchemaFor(KURAL_FAQ, 'thirukkural.html'),
    { '@type': 'Book', '@id': SITE + 'thirukkural.html#book', name: 'திருக்குறள்', alternateName: ['Thirukkural', 'Tirukkural', 'Kural'], inLanguage: 'ta',
      author: { '@type': 'Person', name: 'Thiruvalluvar', alternateName: 'திருவள்ளுவர்' },
      hasPart: KURAL_PAALS.map(p => ({ '@type': 'CreativeWork', name: p.ta, alternateName: p.en, position: p.id })) },
    { '@type': 'HowTo', name: 'How children can learn Thirukkural', step: ['Learn one Kural a day', 'Listen, then say it line by line', 'Learn the hard words', 'Talk about the meaning', 'Revise'].map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s })) },
  { '@type': ['WebApplication', 'LearningResource'], '@id': SITE + 'thirukkural.html#app', name: 'Learn Thirukkural — திருக்குறள் கற்போம்', url: SITE + 'thirukkural.html',
    applicationCategory: 'EducationalApplication', operatingSystem: 'Any (web browser)', isAccessibleForFree: true, inLanguage: ['ta', 'en'], typicalAgeRange: '5-12',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, author: { '@id': SITE + '#author' }, publisher: { '@id': SITE + '#author' }, teaches: 'Thirukkural',
    learningResourceType: ['lesson', 'quiz', 'game', 'worksheet'], educationalLevel: 'Beginner', isBasedOn: { '@id': SITE + 'thirukkural.html#book' } },
  { '@type': 'WebPage', '@id': SITE + 'thirukkural.html#page', url: SITE + 'thirukkural.html', name: 'Thirukkural for Kids — Learn 1,330 Kurals with Meaning',
    inLanguage: ['en', 'ta'], isPartOf: { '@id': SITE + '#website' }, about: { '@id': SITE + 'thirukkural.html#book' }, mainEntity: { '@id': SITE + 'thirukkural.html#app' },
    author: { '@id': SITE + '#author' }, dateModified: TODAY, primaryImageOfPage: SITE + 'assets/og-image.png' },
  { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Learn Tamil', item: SITE },
    { '@type': 'ListItem', position: 2, name: 'Thirukkural for kids', item: SITE + 'thirukkural.html' }] }] };
{
  const f = path.join(ROOT, 'thirukkural.html'); let h = fs.readFileSync(f, 'utf8');
  const putK = (name, html) => { const re = new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(<!-- ${name}:END -->)`);
    if (!re.test(h)) throw new Error(`thirukkural.html is missing the ${name} markers`); h = h.replace(re, `$1\n${html}\n$2`); };
  putK('KURAL-SCHEMA', `<script type="application/ld+json">${JSON.stringify(KURAL_SCHEMA)}</script>`);
  putK('STYLES', styleTags());
  putK('KURAL-ABOUT', KURAL_ABOUT);
  putK('FOOTER', FOOTER);
  putK('SCRIPTS', scriptTags([...KURAL_SCRIPTS, ...SERVICES]));
  fs.writeFileSync(f, stamp('thirukkural.html', h));
}

const CHAPTERS_FAQ = [
  ['How many chapters are in Thirukkural?', 'Thirukkural has 133 chapters (அதிகாரம், adhikaram), each with exactly 10 Kurals — 1,330 Kurals in all.'],
  ['What is the first chapter of Thirukkural?', `Chapter 1 is ${KURAL.ch[0][0]} (${KURAL.ch[0][1]}), Kurals 1–10. It begins with “${kText(1)[0]} / ${kText(1)[1]}”.`],
  ['What is the last chapter of Thirukkural?', `Chapter 133 is ${KURAL.ch[132][0]} (${KURAL.ch[132][1]}), Kurals 1321–1330, at the end of காமத்துப்பால் (love).`],
  ['How do I find which chapter a Kural is in?', 'Divide the Kural number by 10 and round up. Kural 391 is in chapter 40 (கல்வி, Learning); Kural 1 is in chapter 1. Chapter n holds Kurals 10n − 9 to 10n.'],
  ['Which chapters of Thirukkural are best for children?', `Chapters 1–108 (அறத்துப்பால் and பொருட்பால், Kurals 1–1080). Good first chapters: 1 ${KURAL.ch[0][0]}, 10 ${KURAL.ch[9][0]} (pleasant words), 40 ${KURAL.ch[39][0]} (learning) and 79 ${KURAL.ch[78][0]} (friendship).`]
];
write('thirukkural-chapters.html', shell({
  file: 'thirukkural-chapters.html', guide: true, bubble: '133!', crumbs: [['Thirukkural for kids', 'thirukkural.html']],
  title: 'All 133 Thirukkural Chapters (Adhikaram) in Tamil & English',
  description: `All 133 Thirukkural chapters (அதிகாரம்) in order with English names, from ${KURAL.ch[0][0]} (${KURAL.ch[0][1]}) to ${KURAL.ch[132][0]}. 10 Kurals each.`,
  h1: 'All 133 Thirukkural chapters — <span class="ta">அதிகாரங்கள்</span>', eyebrow: '3 divisions · 13 sections · 133 chapters · 1,330 Kurals',
  body: `
<p class="lead-doc"><strong>Thirukkural has 133 chapters (${ta('அதிகாரம்')}, adhikaram) of exactly 10 Kurals each — 1,330 Kurals in all.</strong> The chapters are grouped into sections (${ta('இயல்')}, iyal) inside three divisions (${ta('பால்')}, paal). Chapter <i>n</i> holds Kurals 10<i>n</i> − 9 to 10<i>n</i>; for example, chapter 40, ${ta(KURAL.ch[39][0])} (${esc(KURAL.ch[39][1])}), holds Kurals 391–400.</p>
${KURAL_PAALS.map(p => `${h2('paal-' + p.id, p.ic, `${ta(p.ta)} — ${esc(p.en)} (chapters ${p.from}–${p.to})`)}
${KURAL.iyal.filter(([, , from]) => from >= p.from && from <= p.to).map(([t, e, from, to]) => `<h3>${ta(t)} · ${esc(e)}</h3>
<ol class="kd-chlist" start="${from}">${Array.from({ length: to - from + 1 }, (_, i) => from + i).map(c => `<li><a href="${kChPage(c)}">${ta(KURAL.ch[c - 1][0])} — ${esc(KURAL.ch[c - 1][1])}</a> <span class="muted">(Kurals ${c * 10 - 9}–${c * 10})</span></li>`).join('')}</ol>`).join('\n')}`).join('\n')}
${h2('faq', '❓', 'Questions about the chapters')}
<div class="faq">${faqHtmlFor(CHAPTERS_FAQ)}</div>
<p>New to Thirukkural? Start with <a href="thirukkural.html">Thirukkural for kids</a>, find chapters by subject in <a href="thirukkural-topics.html">Thirukkural by topic</a>, and learn with sound and games in the <a href="thirukkural.html">Thirukkural app</a>.</p>`,
  schema: [faqSchemaFor(CHAPTERS_FAQ, 'thirukkural-chapters.html'), { '@type': 'ItemList', '@id': SITE + 'thirukkural-chapters.html#chapters', name: 'Thirukkural chapters', numberOfItems: 133,
    itemListElement: KURAL.ch.map(([t, e], i) => ({ '@type': 'ListItem', position: i + 1, name: `${t} — ${e}`, url: SITE + kChPage(i + 1) })) }]
}));

/* Thirukkural by topic: a real index — each topic names the chapters that are about it (names read from the data)
   and shows one Kural in full. Chapter numbers follow the traditional order. */
const KURAL_TOPICS = [
  { id: 'kindness', ic: '💛', en: 'Kindness and gentle words', ch: [8, 25, 10, 32], intro: 'Love for everyone, compassion for every living thing, sweet words instead of harsh ones, and never hurting others — even those who hurt us.' },
  { id: 'learning', ic: '📚', en: 'Learning and knowledge', ch: [40, 42, 43, 41], intro: 'Learn well and live by what you learn; listen to wise people; knowledge is a wealth no one can take away.' },
  { id: 'friendship', ic: '🤝', en: 'Friendship', ch: [79, 80, 82, 83], intro: 'What true friendship is, how to choose friends carefully, and how to recognise false friends.' },
  { id: 'honesty', ic: '✅', en: 'Truth and honesty', ch: [30, 29], intro: 'Speak the truth, even when it is hard, and never take what belongs to someone else.' },
  { id: 'gratitude', ic: '🙏', en: 'Gratitude, giving and helping', ch: [11, 23, 22, 9], intro: 'Remember every kindness you receive, give to those in need, help your community and welcome guests warmly.' },
  { id: 'patience', ic: '🧘', en: 'Patience and self-control', ch: [16, 13, 31, 17], intro: 'Be patient, control your words and temper, and do not be jealous of others.' },
  { id: 'effort', ic: '💪', en: 'Hard work and courage', ch: [62, 61, 60, 63], intro: 'Keep trying, do not be lazy, stay hopeful and cheerful when things go wrong.' },
  { id: 'family', ic: '🏡', en: 'Family and home', ch: [5, 7], intro: 'A good home life, and the joy that children bring to their parents.' },
  { id: 'character', ic: '🌟', en: 'Good character and manners', ch: [14, 100, 99, 98], intro: 'Good conduct, courtesy towards everyone, and what makes a person truly great.' },
  { id: 'leadership', ic: '👑', en: 'Leadership and fairness', ch: [39, 12, 47], intro: 'What makes a good leader, being fair to everyone, and thinking carefully before acting.' }
];
const kTopicsOf = c => KURAL_TOPICS.filter(T => T.ch.includes(c));
/* Three to four short, stand-alone answers per chapter — every fact read from the data. */
const kChFaq = c => { const [cta, cen] = KURAL.ch[c - 1], p = kPaalOf(c), first = c * 10 - 9, [l1, l2] = kText(first);
  const lessons = Array.from({ length: 10 }, (_, i) => first + i).filter(n => KURAL_LESSONS[n]);
  return [
    [`What is Thirukkural chapter ${c} about?`, `Chapter ${c} of Thirukkural is ${cta} (${cen}). It has Kurals ${first}–${c * 10} and is part of ${p.ta} (${p.en}).${p.older ? ' This division is about love and is best read by older children with a grown-up.' : ''}`],
    [`What is the first Kural of chapter ${c}?`, `Kural ${first}: “${l1} / ${l2}” In G. U. Pope’s English: ${kText(first)[2]}${/[.!?'”]$/.test(kText(first)[2]) ? '' : '.'}`],
    ...lessons.slice(0, 2).map(n => [`What is the meaning of Kural ${n}?`, `Kural ${n} (“${kText(n)[0]}…”) means: ${KURAL_LESSONS[n].en} In simple Tamil: ${KURAL_LESSONS[n].ta}`])
  ]; };
for (let c = 1; c <= 133; c++){
  const [cta, cen, roman] = KURAL.ch[c - 1], p = kPaalOf(c), iy = KURAL.iyal.find(([, , from, to]) => c >= from && c <= to);
  const file = kChPage(c);
  write(file, shell({
    file, title: kTitle(c), description: kDesc(c), ogType: 'article', bubble: `${c}/133`,
    crumbs: [['Thirukkural for kids', 'thirukkural.html'], ['All 133 chapters', 'thirukkural-chapters.html']],
    h1: `Thirukkural chapter ${c}: <span class="ta">${cta}</span>`, eyebrow: `${esc(cen)} · ${p.ta} (${p.en}) · ${iy[0]} · Kurals ${c * 10 - 9}–${c * 10}`,
    body: `
<p class="lead-doc"><strong>Chapter ${c} of Thirukkural is ${ta(cta)} (${esc(roman)}, “${esc(cen)}”), with Kurals ${c * 10 - 9} to ${c * 10}.</strong> It belongs to ${ta(p.ta)} (${esc(p.en)}), section ${ta(iy[0])} (${esc(iy[1])}).${p.older ? ' This division is about love; it is best read with older children, with a grown-up.' : ''}</p>
<p><a class="cta-app" href="thirukkural.html#/ch/${c}"><span aria-hidden="true">🔊</span> Hear these Kurals and play games in the app →</a></p>
${Array.from({ length: 10 }, (_, i) => kCouplet(c * 10 - 9 + i)).join('\n')}
<nav class="kd-pn" aria-label="Chapters">${c > 1 ? `<a href="${kChPage(c - 1)}">← ${c - 1}. ${ta(KURAL.ch[c - 2][0])}</a>` : '<span></span>'}<a href="thirukkural-chapters.html">All chapters</a>${c < 133 ? `<a href="${kChPage(c + 1)}">${c + 1}. ${ta(KURAL.ch[c][0])} →</a>` : '<span></span>'}</nav>
${kTopicsOf(c).length ? `<p>More Kurals on this subject: ${kTopicsOf(c).map(T => `<a href="thirukkural-topics.html#${T.id}">${T.ic} ${esc(T.en)}</a>`).join(' · ')}.</p>` : ''}
${h2('faq', '❓', `Questions about chapter ${c}`)}
<div class="faq">${faqHtmlFor(kChFaq(c))}</div>
<p class="muted">Tamil text checked against Project Madurai, the tk120404/thirukkural dataset and Tamil Wikisource. English: Rev. G. U. Pope (1886), public domain. See <a href="thirukkural.html">Thirukkural for kids</a>.</p>`,
    schema: [faqSchemaFor(kChFaq(c), file), { '@type': 'CreativeWork', '@id': SITE + file + '#chapter', name: `${cta} — ${cen}`, position: c, inLanguage: 'ta', isFamilyFriendly: true,
      isPartOf: { '@type': 'Book', name: 'திருக்குறள்', alternateName: 'Thirukkural', author: { '@type': 'Person', name: 'Thiruvalluvar', alternateName: 'திருவள்ளுவர்' } },
      text: Array.from({ length: 10 }, (_, i) => kText(c * 10 - 9 + i).slice(0, 2).join('\n')).join('\n\n') }]
  }));
}
const KURAL_PAGES = Array.from({ length: 133 }, (_, i) => kChPage(i + 1));

const kFeatured = T => { for (const c of T.ch) for (let n = c * 10 - 9; n <= c * 10; n++) if (KURAL_LESSONS[n]) return n; return T.ch[0] * 10 - 9; };
const TOPIC_FAQ_K = KURAL_TOPICS.slice(0, 5).map(T => [`Which Thirukkural chapters are about ${T.en.toLowerCase()}?`,
  `${T.ch.map(c => `Chapter ${c}, ${KURAL.ch[c - 1][0]} (${KURAL.ch[c - 1][1]}, Kurals ${c * 10 - 9}–${c * 10})`).join('; ')}. ${T.intro}`]);
write('thirukkural-topics.html', shell({
  file: 'thirukkural-topics.html', guide: true, bubble: '🧭', crumbs: [['Thirukkural for kids', 'thirukkural.html']],
  title: 'Thirukkural by Topic — Kindness, Learning, Friendship',
  description: 'Thirukkural chapters on kindness, learning, friendship, honesty, gratitude, patience, hard work and leadership — with one Kural explained for each topic.',
  h1: 'Thirukkural by topic — <span class="ta">தலைப்பு வாரியாகத் திருக்குறள்</span>', eyebrow: `${KURAL_TOPICS.length} topics · chapters from அறத்துப்பால் and பொருட்பால்`,
  body: `
<p class="lead-doc"><strong>Every chapter of Thirukkural is about one topic, so finding Kurals about kindness, friendship or learning means finding the right chapters.</strong> Here are ${KURAL_TOPICS.length} topics children and teachers ask about most, with the chapters for each and one Kural explained. Each chapter link opens all 10 of its Kurals with meanings.</p>
<nav class="kd-topic-nav" aria-label="Topics">${KURAL_TOPICS.map(T => `<a href="#${T.id}"><span aria-hidden="true">${T.ic}</span> ${esc(T.en)}</a>`).join('')}</nav>
${KURAL_TOPICS.map(T => `${h2(T.id, T.ic, esc(T.en))}
<p>${esc(T.intro)}</p>
<ul class="kd-topic-ch">${T.ch.map(c => `<li><a href="${kChPage(c)}">Chapter ${c}: ${ta(KURAL.ch[c - 1][0])} — ${esc(KURAL.ch[c - 1][1])}</a> <span class="muted">(Kurals ${c * 10 - 9}–${c * 10})</span> · <a href="thirukkural.html#/ch/${c}">🔊 learn in the app</a></li>`).join('')}</ul>
<p class="muted">A Kural from this topic:</p>
${kCouplet(kFeatured(T))}`).join('\n')}
${h2('faq', '❓', 'Questions')}
<div class="faq">${faqHtmlFor(TOPIC_FAQ_K)}</div>
<p>New to Thirukkural? Start with <a href="thirukkural.html">Thirukkural for kids</a> or see <a href="thirukkural-chapters.html">all 133 chapters</a>.</p>`,
  schema: [faqSchemaFor(TOPIC_FAQ_K, 'thirukkural-topics.html'), { '@type': 'ItemList', '@id': SITE + 'thirukkural-topics.html#topics', name: 'Thirukkural topics',
    itemListElement: KURAL_TOPICS.map((T, i) => ({ '@type': 'ListItem', position: i + 1, name: T.en, url: SITE + 'thirukkural-topics.html#' + T.id })) }]
}));

/* ---------- 8d. Entry pages for anyone searching "learn Tamil": beginner's guide, pronunciation, phrases, FAQ & help ----------
   Defined here (after HELP) because the FAQ & help page renders the HELP list. */
const taWrap = s => s.replace(/[\u0B80-\u0BFF]+(?:[ ,+=]+[\u0B80-\u0BFF]+)*/g, m => ta(m));   // Tamil runs inside English prose get the Tamil font
const mdLinks = s => esc(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

/* Learn Tamil online — the main landing page for "learn Tamil" searches */
const ONLINE_FAQ = [
  ['Can I learn Tamil online for free?', 'Yes. Learn Tamil (learntamil.msdevbuild.com) is completely free with no sign-up. It teaches all 247 Tamil letters with sound, picture words, reading practice, read-aloud stories, rhymes, Thirukkural, 14 games, printable worksheets and certificate tests, on any phone, tablet or computer.'],
  ['Can adults and beginners use Learn Tamil?', 'Yes. Learn Tamil is made for children aged 3 to 12, but the path is the same for any beginner: hear the letters, learn the 12 vowels and 18 consonants, then the 216 uyirmei letters, then read words and short stories. Adults often use it alongside their children.'],
  ['What is the best way to start learning Tamil?', 'Start with the sounds. Learn the 12 vowels (உயிர், uyir) and the 18 consonants (மெய், mei) first, then join them into uyirmei letters such as க் + ஆ = கா. Practise about 10 to 15 minutes every day, listen to Tamil often, and read simple picture words as soon as you know a few letters.'],
  ['Can I learn Tamil from English?', 'Yes. Every letter on Learn Tamil has a romanised sound (for example அ = a, கா = kaa) and an English hint, and every word and story line has an English meaning, so English speakers can follow without knowing any Tamil.'],
  ['Does Learn Tamil work on a phone and offline?', 'Yes. It works in any modern browser and can be installed as an app on Android, iPhone, iPad and computers. After the first visit, the letters, games, stories and guides work without internet.']
];
const ONLINE_STEPS = [
  ['Hear the letters', 'Open the <a href="./">learning app</a> and tap any letter to hear it. Start with the <a href="tamil-vowels.html">12 vowels (உயிர்)</a>.'],
  ['Learn the consonants', 'Learn the <a href="tamil-consonants.html">18 consonants (மெய்)</a> in their three groups. The <a href="tamil-pronunciation-guide.html">pronunciation guide</a> explains the sounds English does not have, such as ழ.'],
  ['Join them into uyirmei letters', 'A consonant plus a vowel makes a new letter: க் + ஆ = கா. Learn one row of the <a href="uyirmei-ezhuthukal.html">uyirmei chart</a> at a time.'],
  ['Write the letters', 'Trace letters on screen (Games → Trace), then on paper with the free <a href="tamil-printables.html">tracing worksheets</a>.'],
  ['Read your first words', 'Read two-letter <a href="tamil-words-for-kids.html">picture words</a>, then words by topic: <a href="tamil-numbers.html">numbers</a>, <a href="tamil-colours.html">colours</a>, <a href="tamil-animals.html">animals</a> and more.'],
  ['Say simple phrases', 'Use everyday <a href="tamil-phrases-for-beginners.html">Tamil phrases</a> such as வணக்கம் (hello) and நன்றி (thank you) at home.'],
  ['Read stories, rhymes and Thirukkural', 'Move on to <a href="tamil-stories-for-kids.html">stories</a>, <a href="tamil-rhymes-for-kids.html">rhymes</a>, <a href="aathichoodi.html">Aathichoodi</a> and <a href="thirukkural.html">Thirukkural</a>.'],
  ['Test yourself', 'Take the 10 <a href="./#/certificate">certificate levels</a> to check what you have learned.']
];
write('learn-tamil-online.html', shell({
  file: 'learn-tamil-online.html', guide: true, bubble: 'வணக்கம்! Let’s start!',
  title: 'Learn Tamil Online Free — Step-by-Step Beginner’s Guide',
  description: 'Learn Tamil online free: hear all 247 letters, read words like அம்மா and வணக்கம், play games and earn certificates. A step-by-step path for beginners.',
  h1: 'Learn Tamil online — free, step by step', eyebrow: 'For kids · parents · beginners of any age',
  body: `
<p class="lead-doc"><strong>You can learn Tamil online for free on Learn Tamil: start by hearing the 12 vowels and 18 consonants, join them into uyirmei letters, then read picture words, phrases and short stories — about 10 to 15 minutes a day.</strong> Everything below is free, needs no sign-up and works on phones, tablets and computers.</p>
${h2('path', '🪜', 'The learning path, step by step')}
<ol class="steps">${ONLINE_STEPS.map(([t, d]) => `<li><b>${t}.</b> ${taWrap(d)}</li>`).join('')}</ol>
${h2('basics', '🔤', 'Tamil script in one minute')}
<p>Tamil has <strong>247 letters</strong>: 12 vowels (${ta('உயிர்')}), 18 consonants (${ta('மெய்')}), 1 special letter ${ta('ஃ')} and 216 consonant-vowel letters (${ta('உயிர்மெய்')}, 18 × 12). That sounds like a lot, but the 216 follow a pattern: each consonant takes the same vowel sign, so once you know the 30 main letters and the 12 signs, you can read them all. See the <a href="tamil-alphabet.html">full Tamil alphabet chart</a>.</p>
${h2('free', '🎁', 'What you get for free')}
<ul>
  <li><b>🔤 Letters with sound:</b> all 247 letters, each with a romanised sound, a tip and a picture word.</li>
  <li><b>📖 Reading:</b> ${WORDS.length} picture words in three levels, 12 word topics, ${STORIES.length} read-aloud stories, rhymes and festival stories.</li>
  <li><b>🎮 14 games:</b> build a letter, listen and pick, balloon pop, memory, spelling, sentences, tracing, colouring and more.</li>
  <li><b>📜 Thirukkural:</b> all 1,330 Kurals with meanings, stories, games and printable sheets.</li>
  <li><b>🖨️ Printables:</b> ${PRINTS.length} free PDFs — charts, tracing and activity worksheets.</li>
  <li><b>🎓 Certificates:</b> 10 levels, from first letters to champion.</li>
</ul>
${h2('who', '👪', 'Who it is for')}
<ul>
  <li><b>Children aged 3–12</b>, with an age group and learning path for 3–5, 6–8 and 9–12.</li>
  <li><b>Parents</b> who want to teach Tamil at home, even if they cannot read it — see <a href="how-to-teach-tamil-to-kids.html">how to teach Tamil to kids</a>.</li>
  <li><b>Families living outside Tamil Nadu and Sri Lanka</b>, Tamil school teachers and any beginner who wants to read Tamil.</li>
</ul>
${tip('Learn a little every day. Ten minutes daily, with lots of listening, works better than one long lesson a week. Have a question? See the <a href="learn-tamil-faq.html">Learn Tamil FAQ &amp; help</a>.')}
${h2('faq', '❓', 'Questions about learning Tamil online')}
<div class="faq">${faqHtmlFor(ONLINE_FAQ)}</div>`,
  schema: [faqSchemaFor(ONLINE_FAQ, 'learn-tamil-online.html'),
    { '@type': 'HowTo', '@id': SITE + 'learn-tamil-online.html#howto', name: 'How to learn Tamil online for free', inLanguage: 'en',
      step: ONLINE_STEPS.map(([t, d], i) => ({ '@type': 'HowToStep', position: i + 1, name: t, text: d.replace(/<[^>]+>/g, '') })) }]
}));

/* Pronunciation guide — sounds and hints come from data/alphabet.js */
const byC = c => CONS.find(k => k.c === c);
const SOUND_SETS = [
  ['n', 'Three kinds of “n”: ந ன ண', ['ந', 'ன', 'ண'], 'ந and ன sound almost the same; the difference is mainly where they are written. ண is said with the tongue curled back.'],
  ['l', 'Three kinds of “l”: ல ள ழ', ['ல', 'ள', 'ழ'], 'ல is like English “l”. For ள curl the tongue back and touch the roof of the mouth. For ழ curl it back further without touching, and let the sound flow — it is the sound in தமிழ் (Tamizh).'],
  ['r', 'Two kinds of “r”: ர ற', ['ர', 'ற'], 'ர is a light tap of the tongue. ற is stronger and rolled. When it is doubled, ற்ற sounds close to “tr”, as in காற்று (kaatru, wind).'],
  ['t', 'Two kinds of “t”: த ட', ['த', 'ட'], 'For த the tongue touches the back of the upper teeth (a soft t). For ட the tongue curls back (a hard t).']
];
const soundRows = list => list.map(c => { const k = byC(c);
  return `<tr><td class="L ta">${k.c + PULLI}</td><td>${k.r}</td><td>${esc(k.hint)}</td><td><span class="ta">${k.ex[1]}</span> — ${esc(k.ex[2])}</td></tr>`; }).join('');
const vowelPairs = [['அ', 'ஆ'], ['இ', 'ஈ'], ['உ', 'ஊ'], ['எ', 'ஏ'], ['ஒ', 'ஓ']].map(p => p.map(l => VOWELS.find(v => v.l === l)));
const PRON_FAQ = [
  ['How do you pronounce ழ (zha) in Tamil?', 'To say ழ (zha), curl the tip of your tongue far back towards the roof of your mouth without touching it, and let the sound flow. It sounds between “r” and “l”. It is the last sound of தமிழ் (Tamizh), the name of the language, and is often written “zh” in English.'],
  ['What is the difference between ல, ள and ழ?', 'ல (la) is like the English “l”, with the tongue just behind the upper teeth. ள (ḷa) is said with the tongue curled back so it touches the roof of the mouth. ழ (zha) is said with the tongue curled back even further, without touching. Practise them in pairs: பல் (tooth), தேள் (scorpion), தமிழ் (Tamil).'],
  ['What is the difference between ர and ற?', 'ர (ra) is a soft, quick tap of the tongue, as in நீர் (water). ற (ṟa) is a stronger, rolled r, as in காற்று (wind). When ற is doubled (ற்ற) it sounds close to “tr”.'],
  ['Why are there three n letters in Tamil?', 'Tamil has ந, ன and ண. ந is usually written at the start of a word or before த (பந்து, ball), ன in the middle or at the end (மீன், fish), and ண is said with the tongue curled back (கண், eye). ந and ன sound almost the same.'],
  ['Do short and long vowels change the meaning in Tamil?', 'Yes. Tamil has five short vowels (அ இ உ எ ஒ) and their long partners (ஆ ஈ ஊ ஏ ஓ). Holding a vowel longer can make a different word, so practise each short–long pair together.']
];
write('tamil-pronunciation-guide.html', shell({
  file: 'tamil-pronunciation-guide.html', guide: true, bubble: 'ழ — say தமிழ்!',
  title: 'Tamil Pronunciation Guide — ழ, ள, ல, ற, ர, ண, ன, ந',
  description: 'How to pronounce Tamil letters: the special ழ in தமிழ், the three l and three n sounds, ர and ற, and short and long vowels, with example words.',
  h1: 'Tamil pronunciation guide', eyebrow: 'Sounds that sound alike · Tips · Example words',
  body: `
<p class="lead-doc"><strong>Most Tamil sounds are easy for English speakers; the ones that need practice are the special ${ta('ழ')} (zha), the three “l” sounds ${ta('ல ள ழ')}, the three “n” sounds ${ta('ந ன ண')}, the two “r” sounds ${ta('ர ற')}, and the difference between short and long vowels.</strong> This guide explains each one with an example word. To hear them, tap the letters in the <a href="./#/mei">learning app</a>.</p>
${SOUND_SETS.map(([id, title, list, note]) => `${h2(id, '👂', title)}
<p>${taWrap(note)}</p>
<div class="tbl"><table><thead><tr><th scope="col">Letter</th><th scope="col">Sound</th><th scope="col">How to say it</th><th scope="col">Example</th></tr></thead><tbody>${soundRows(list)}</tbody></table></div>`).join('\n')}
${h2('vowels', '🌱', 'Short and long vowels')}
<p>Five Tamil vowels come in short (${ta('குறில்')}) and long (${ta('நெடில்')}) pairs. A long vowel is held about twice as long.</p>
<div class="tbl"><table><thead><tr><th scope="col">Short</th><th scope="col">Sound</th><th scope="col">Long</th><th scope="col">Sound</th></tr></thead><tbody>${vowelPairs.map(([s, l]) =>
  `<tr><td class="L ta">${s.l}</td><td>${s.r} — ${esc(s.hint)}</td><td class="L ta">${l.l}</td><td>${l.r} — ${esc(l.hint)}</td></tr>`).join('')}</tbody></table></div>
${h2('soft', '🔁', 'Letters that soften inside a word')}
<p>Some hard letters are said more softly between vowels or after a nasal sound. For example ${ta('க')} in ${ta('புத்தகம்')} (book) sounds like “g” — <i>puththagam</i> — and ${ta('த')} in ${ta('பந்து')} (ball) sounds like “dh” — <i>pandhu</i>. ${ta('ச')} can be “ch” or “s”. You will pick these up naturally by listening to words.</p>
${tip('Practise sounds that sound alike in pairs, and listen before you speak. The app’s 🎤 Say it button lets you record yourself and compare with the right sound — the recording never leaves your device.')}
<p>Next: the <a href="tamil-alphabet.html">full alphabet chart</a>, <a href="tamil-consonants.html">consonants</a> and <a href="tamil-phrases-for-beginners.html">basic phrases</a>.</p>
${h2('faq', '❓', 'Questions about Tamil pronunciation')}
<div class="faq">${faqHtmlFor(PRON_FAQ)}</div>`,
  schema: [faqSchemaFor(PRON_FAQ, 'tamil-pronunciation-guide.html')]
}));

/* Basic phrases — NEW Tamil text: needs review by a Tamil teacher */
const PHRASES = [
  ['greet', '👋', 'Greetings', [
    ['வணக்கம்', 'vanakkam', 'Hello / greetings (said with folded hands)'],
    ['காலை வணக்கம்', 'kaalai vanakkam', 'Good morning'],
    ['போய் வருகிறேன்', 'poi varugiren', 'Goodbye (literally “I will go and come back”)'],
    ['நன்றி', 'nandri', 'Thank you'],
    ['மன்னிக்கவும்', 'mannikkavum', 'Sorry / excuse me'],
    ['தயவுசெய்து', 'thayavuseydhu', 'Please']]],
  ['about', '🧒', 'About me', [
    ['உங்கள் பெயர் என்ன?', 'ungal peyar enna?', 'What is your name?'],
    ['என் பெயர் …', 'en peyar …', 'My name is …'],
    ['எப்படி இருக்கிறீர்கள்?', 'eppadi irukkireergal?', 'How are you?'],
    ['நான் நன்றாக இருக்கிறேன்', 'naan nandraaga irukkiren', 'I am fine'],
    ['நான் தமிழ் கற்கிறேன்', 'naan thamizh karkiren', 'I am learning Tamil']]],
  ['everyday', '🏠', 'Everyday words', [
    ['ஆம்', 'aam', 'Yes'],
    ['இல்லை', 'illai', 'No'],
    ['சரி', 'sari', 'OK / all right'],
    ['இது என்ன?', 'idhu enna?', 'What is this?'],
    ['எங்கே?', 'engae?', 'Where?'],
    ['தண்ணீர் வேண்டும்', 'thanneer vendum', 'I want water'],
    ['எனக்குப் பசிக்கிறது', 'enakku pasikkiradhu', 'I am hungry']]],
  ['learn', '📚', 'While learning', [
    ['எனக்குப் புரியவில்லை', 'enakku puriyavillai', 'I don’t understand'],
    ['மெதுவாகப் பேசுங்கள்', 'medhuvaaga pesungal', 'Please speak slowly'],
    ['மீண்டும் சொல்லுங்கள்', 'meendum sollungal', 'Please say it again'],
    ['இதைத் தமிழில் எப்படிச் சொல்வது?', 'idhai thamizhil eppadi solvadhu?', 'How do you say this in Tamil?']]]
];
const PHRASE_FAQ = [
  ['How do you say hello in Tamil?', 'Hello in Tamil is “வணக்கம்” (vanakkam). It is said with the palms pressed together and works at any time of day, with anyone. “காலை வணக்கம்” (kaalai vanakkam) means good morning.'],
  ['How do you say thank you in Tamil?', 'Thank you in Tamil is “நன்றி” (nandri). To say “thank you very much”, say “மிக்க நன்றி” (mikka nandri).'],
  ['How do you say “What is your name?” in Tamil?', '“What is your name?” in Tamil is “உங்கள் பெயர் என்ன?” (ungal peyar enna?). To answer, say “என் பெயர் …” (en peyar …), which means “My name is …”.'],
  ['How do you say yes and no in Tamil?', 'Yes is “ஆம்” (aam) and no is “இல்லை” (illai). “சரி” (sari) means OK or all right.']
];
write('tamil-phrases-for-beginners.html', shell({
  file: 'tamil-phrases-for-beginners.html', guide: true, bubble: 'வணக்கம்!',
  title: 'Basic Tamil Phrases for Kids & Beginners (with Meaning)',
  description: 'Easy Tamil phrases with meaning and pronunciation: வணக்கம் (hello), நன்றி (thank you), உங்கள் பெயர் என்ன? (what is your name?) and more for everyday use.',
  h1: 'Basic Tamil phrases for kids &amp; beginners', eyebrow: `${PHRASES.reduce((n, g) => n + g[3].length, 0)} phrases · Tamil · Pronunciation · English`,
  body: `
<p class="lead-doc"><strong>The most useful Tamil phrases to start with are ${ta('வணக்கம்')} (vanakkam, hello), ${ta('நன்றி')} (nandri, thank you), ${ta('ஆம்')} (aam, yes), ${ta('இல்லை')} (illai, no) and ${ta('உங்கள் பெயர் என்ன?')} (ungal peyar enna?, what is your name?).</strong> Below are easy everyday phrases with how to say them and what they mean. Use one new phrase at home every day.</p>
<nav class="toc glass" aria-label="Phrase groups"><b>Groups</b>${PHRASES.map(([id, , t]) => `<a href="#${id}">${t}</a>`).join('')}</nav>
${PHRASES.map(([id, ic, t, list]) => `${h2(id, ic, t)}
<div class="tbl"><table><thead><tr><th scope="col">Tamil</th><th scope="col">Say it</th><th scope="col">Meaning</th></tr></thead><tbody>${list.map(([tm, r, en]) =>
  `<tr><td class="ta"><b>${tm}</b></td><td><i>${esc(r)}</i></td><td>${esc(en)}</td></tr>`).join('')}</tbody></table></div>`).join('\n')}
${tip(taWrap('Polite Tamil uses “நீங்கள்” (neengal, you) and verbs ending in “-ங்கள்”, such as “சொல்லுங்கள்” (please say). Children learn these best by hearing grown-ups use them every day.'))}
<p>Learn the letters these phrases are made of on the <a href="tamil-alphabet.html">Tamil alphabet</a> page, and more words on <a href="tamil-family-words.html">family words</a> and <a href="tamil-words-for-kids.html">Tamil words for kids</a>. Not sure how to say a sound? See the <a href="tamil-pronunciation-guide.html">pronunciation guide</a>.</p>
${h2('faq', '❓', 'Questions about Tamil phrases')}
<div class="faq">${faqHtmlFor(PHRASE_FAQ)}</div>`,
  schema: [faqSchemaFor(PHRASE_FAQ, 'tamil-phrases-for-beginners.html'),
    DTS('tamil-phrases-for-beginners.html', 'Basic Tamil phrases', PHRASES.flatMap(g => g[3].map(([tm, r, en]) => [tm, `${en} — pronounced “${r}”.`])))]
}));

/* FAQ & help hub — the HELP answers (also used by Ask Kili) as a crawlable page */
const HUB = [
  ['start', '🚀', 'Start here', [
    ['learn-tamil-online.html', 'How do I start learning Tamil online?'],
    ['how-to-teach-tamil-to-kids.html', 'How do I teach Tamil to my child at home?'],
    ['tamil-alphabet.html', 'How many letters are in the Tamil alphabet?'],
    ['tamil-pronunciation-guide.html', 'How do I pronounce ழ, ள and ல?'],
    ['tamil-phrases-for-beginners.html', 'How do I say hello and thank you in Tamil?'],
    ['tamil-printables.html', 'Where are the free Tamil worksheets?']]]
];
write('learn-tamil-faq.html', shell({
  file: 'learn-tamil-faq.html', guide: true, bubble: 'Ask me anything!',
  title: 'Learn Tamil FAQ & Help for Parents and Learners',
  description: 'Answers about learning Tamil and the free Learn Tamil app: sound, offline use, games, certificates, worksheets, Thirukkural and privacy.',
  h1: 'Learn Tamil — FAQ &amp; help', eyebrow: `${HELP.length + HUB[0][3].length} answers · For parents, teachers and learners`,
  body: `
<p class="lead-doc"><strong>Learn Tamil is a free website and app that teaches all 247 Tamil letters with sound, reading, stories, rhymes, Thirukkural, 14 games, printable worksheets and certificates, for children aged 3–12 and beginners of any age.</strong> Here are answers to the questions parents, teachers and learners ask most. You can also ask 🦜 Kili, the help chat in the corner of every page.</p>
${HUB.map(([id, ic, t, list]) => `${h2(id, ic, t)}
<ul>${list.map(([f, q]) => `<li><a href="${f}">${esc(q)}</a></li>`).join('')}</ul>`).join('\n')}
${h2('faq', '❓', 'Using Learn Tamil')}
<div class="faq">${HELP.map(([q, a, , link]) => `<details class="faq-item"><summary>${esc(q)}</summary><p>${mdLinks(a)}${link ? ` <a href="${link}">Open →</a>` : ''}</p></details>`).join('\n')}</div>
${h2('more', '📬', 'Still need help?')}
<p>Report a wrong sound, a Tamil mistake or a bug on <a href="${ISSUES_URL}" rel="noopener">GitHub Issues</a> (issues are public, so please don’t include personal details). For private questions, use the <a href="https://blog.msdevbuild.com/contact/" rel="noopener">contact page</a>.</p>`,
  schema: [faqSchemaFor(HELP.map(([q, a]) => [q, a.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')]), 'learn-tamil-faq.html')]
}));

/* Install, share and QR page (install-app.html). QR codes are drawn here at build time (tools/lib/qr.mjs):
   no QR script or service, and the codes are plain links with no tracking parameters.
   pwa.js wires the [data-install] button and marks the visitor's device card ([data-device]) — all on the device. */
const QR_PAGE = SITE + 'install-app.html', QR_APP = SITE;
fs.mkdirSync(path.join(ROOT, 'assets/qr'), { recursive: true });
write('assets/qr/learntamil-install.svg', qrSvg(QR_PAGE, { title: 'Scan to install Learn Tamil', px: 600 }));
write('assets/qr/learntamil-app.svg', qrSvg(QR_APP, { title: 'Scan to open Learn Tamil', px: 600 }));
const DEVICES = [
  ['android', '🤖', 'Android phone or tablet', 'Chrome, Edge or Samsung Internet', [
    'Open <b>learntamil.msdevbuild.com</b> in Chrome (or scan the QR code).',
    'Tap <b>⬇ Install app</b> at the top of the page — or the <b>Install now</b> button here.',
    'No button? Tap the <b>⋮</b> menu and choose <b>Install app</b> or <b>Add to Home screen</b>. In Samsung Internet, tap <b>☰</b> → <b>Add page to</b> → <b>Home screen</b>.',
    'Open <b>Learn Tamil</b> from your home screen. It opens full screen, like any app.']],
  ['ios', '🍎', 'iPhone or iPad', 'Safari', [
    'Open <b>learntamil.msdevbuild.com</b> in <b>Safari</b> (or scan the QR code with the Camera app).',
    'Tap the <b>Share</b> button <span aria-hidden="true">⬆︎</span> (at the bottom on iPhone, at the top on iPad).',
    'Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.',
    'Open <b>Learn Tamil</b> from your home screen.']],
  ['windows', '🪟', 'Windows computer', 'Microsoft Edge or Google Chrome', [
    'Open <b>learntamil.msdevbuild.com</b> in Edge or Chrome.',
    'Click the <b>install icon</b> at the right end of the address bar — or the <b>Install now</b> button here.',
    'No icon? Open the browser menu (<b>⋯</b> or <b>⋮</b>) and look for <b>Install Learn Tamil</b> (in Edge under <b>Apps</b>; in Chrome under <b>Cast, save and share</b>).',
    'Learn Tamil appears in the Start menu and can be pinned to the taskbar.']],
  ['mac', '💻', 'Mac', 'Safari, Chrome or Edge', [
    '<b>Safari</b> (macOS Sonoma or later): open the site, then choose <b>File</b> → <b>Add to Dock</b>.',
    '<b>Chrome or Edge</b>: click the <b>install icon</b> in the address bar, or the <b>Install now</b> button here.',
    'Learn Tamil opens in its own window from the Dock or Launchpad.']],
  ['chromebook', '🧑‍💻', 'Chromebook', 'Chrome', [
    'Open <b>learntamil.msdevbuild.com</b> in Chrome.',
    'Click the <b>install icon</b> in the address bar, or the <b>Install now</b> button here.',
    'Find Learn Tamil in the launcher with your other apps.']]
];
const INSTALL_FAQ = [
  ['Is the Learn Tamil app free?', 'Yes. The Learn Tamil app is completely free, needs no account and has no in-app purchases. You install it straight from your web browser, so you do not need an app store.'],
  ['How do I install Learn Tamil on iPhone or iPad?', 'Open learntamil.msdevbuild.com in Safari, tap the Share button, choose Add to Home Screen and tap Add. Learn Tamil then opens from the home screen like any other app.'],
  ['How do I install Learn Tamil on Android?', 'Open learntamil.msdevbuild.com in Chrome and tap Install app at the top of the page, or open the ⋮ menu and choose Install app or Add to Home screen.'],
  ['Does the app work offline?', 'Yes. After the first visit, the letters, reading, stories, games, certificates and guides work without internet. Letter sounds offline need a Tamil voice stored on the device.'],
  ['How do I remove the app?', 'On a phone or tablet, press and hold the Learn Tamil icon and choose Remove or Uninstall. On a computer, open the app, click the ⋯ menu in its title bar and choose Uninstall. Removing the app does not change the website.']
];
const qrFig = (file, cap, sub) => `<figure class="qr-card"><img src="assets/qr/${file}" width="220" height="220" alt="QR code: ${esc(cap)}" loading="lazy"><figcaption><b>${cap}</b><small>${sub}</small><a class="btn small" href="assets/qr/${file}" download>⬇ Download QR</a></figcaption></figure>`;
write('install-app.html', shell({
  file: 'install-app.html', guide: true, share: false, bubble: 'Scan me! 📲',
  title: 'Install the Learn Tamil App — QR Code, Android, iPhone, PC',
  description: 'Install the free Learn Tamil app on Android, iPhone, iPad, Windows, Mac or Chromebook in two taps. Scan the QR code, then share the app with family and friends.',
  h1: 'Install the Learn Tamil app &amp; share it', eyebrow: 'Free · No app store · Works offline · All devices',
  body: `
<p class="lead-doc"><strong>To install Learn Tamil, open learntamil.msdevbuild.com on your phone, tablet or computer and choose “Install app” (Android, Windows, Mac, Chromebook) or Share → “Add to Home Screen” (iPhone and iPad).</strong> It is free, needs no app store or account, and works offline after the first visit. Scan the QR code below to open it on another device.</p>
<section class="install-now glass" aria-labelledby="nowT">
  <h2 id="nowT"><span class="h-ic" aria-hidden="true">⬇</span>Install on this device</h2>
  <p data-install-ready hidden>Your browser can install Learn Tamil right now.</p>
  <p data-install-done hidden>✅ You are already using the installed app.</p>
  <p data-install-hint>Follow the steps for your device below — your device is marked <b>This device</b>.</p>
  <div class="install-actions"><button type="button" class="btn primary" data-install hidden>⬇ Install now</button><a class="btn" href="./">🎮 Open the learning app</a></div>
</section>
${h2('qr', '📷', 'Scan to install on another device')}
<p>Point the phone or tablet camera at a code and tap the link that appears. Both codes are plain links to this website, with nothing added to track you.</p>
<div class="qr-row">${qrFig('learntamil-install.svg', 'Install Learn Tamil', 'Opens this page with the steps for that device')}${qrFig('learntamil-app.svg', 'Open the learning app', 'Goes straight to the letters and games')}</div>
<p><button type="button" class="btn small" data-print>🖨️ Print the QR codes</button> Stick them on a classroom wall, a Tamil school notice board or the fridge.</p>
${h2('devices', '📱', 'Step by step for every device')}
<div class="device-grid">${DEVICES.map(([id, ic, name, br, steps]) => `<article class="device-card glass" data-device="${id}" id="${id}"><h3><span aria-hidden="true">${ic}</span> ${name}</h3><p class="muted">${br}</p><ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol></article>`).join('')}</div>
${tip('The exact menu names can change a little between browser versions. If you can’t find the option, look in the browser menu for “Install” or “Add to Home Screen”.')}
${h2('share', '💛', 'Share Learn Tamil with family and friends')}
<p>Know a family, teacher or Tamil school that would like it? Send them the link. Sharing opens the app you choose with a ready-made message, and nothing is sent until you tap.</p>
<div class="share-row share-inline share-big" data-share-row="Share Learn Tamil" data-share-url="${SITE}" data-share-title="Learn Tamil — free Tamil letters, words, stories and games for kids (தமிழ் கற்போம்)"></div>
${h2('faq', '❓', 'Questions about the app')}
<div class="faq">${faqHtmlFor(INSTALL_FAQ)}</div>`,
  schema: [faqSchemaFor(INSTALL_FAQ, 'install-app.html'),
    { '@type': 'HowTo', '@id': SITE + 'install-app.html#howto', name: 'How to install the Learn Tamil app', inLanguage: 'en',
      step: DEVICES.map(([, , name, , steps], i) => ({ '@type': 'HowToSection', position: i + 1, name,
        itemListElement: steps.map((s, j) => ({ '@type': 'HowToStep', position: j + 1, text: s.replace(/<[^>]+>/g, '') })) })) }]
}));

/* ---------- Advertise with us (media kit for businesses — grown-ups only) ----------
   A plain information page: no form, no payment, no ad script. Every enquiry goes to CONTACT_URL.
   The previews are fictional demo businesses, drawn with CSS only. The formats map to the real
   SPONSOR() places above (banner, card, home, vertical); nothing here changes what those places show. */
const AD_FORMATS = [
  { id: 'compact', ic: '🏷️', size: 'Small', name: 'Compact banner', place: 'banner',
    where: 'A slim strip near the top of the parents’ and teachers’ guide pages, just under the page heading.',
    best: 'Local businesses, Tamil classes, community events and short promotions.',
    gets: ['Your logo or an icon', 'Business name and one short line', 'One link to your website or contact page'] },
  { id: 'featured', ic: '🖼️', size: 'Medium', name: 'Featured banner', place: 'card',
    where: 'A larger card at the end of each guide, where a reader has just finished the page.',
    best: 'Product promotions, services, seasonal offers and new launches.',
    gets: ['An image', 'Business name and a short description', 'A clear call-to-action button'] },
  { id: 'premium', ic: '🌟', size: 'Large', name: 'Premium banner', place: 'home',
    where: 'The parents’ area of the home page, next to the “Keep Learn Tamil free” card — the most prominent sponsor place on the site.',
    best: 'Established businesses and brand campaigns.',
    gets: ['A larger visual', 'A promotional message', 'Contact details or a website link'] },
  { id: 'business', ic: '💼', size: 'Featured', name: 'Featured business card', place: 'vertical',
    where: 'A tall card beside the guide text on wide desktop screens. It stays in view while the reader scrolls.',
    best: 'Schools, tutors, bookshops and family services that want steady visibility.',
    gets: ['Logo or promotional image', 'Business name and description', 'Website or contact link'] },
  { id: 'listing', ic: '📌', size: 'Listing', name: 'Sponsored listing', place: 'on request',
    where: 'A short listing on the guide that matches your offer — for example a Tamil book on a reading guide, or a class on the parents’ guide. We agree the page with you.',
    best: 'Products, services, events and special offers that fit one topic.',
    gets: ['Title and one or two lines of text', 'Optional small image', 'One link, always marked “Sponsored”'] }
];
const AD_BENEFITS = [
  ['👪', 'Reach families learning Tamil', 'Parents, grandparents and teachers who read our guides to help children learn Tamil.'],
  ['📣', 'Build brand awareness', 'Show your name to a focused, family audience on a trusted, ad-light site.'],
  ['🛍️', 'Promote products and services', 'Books, classes, clothing, events and family services that fit a learning site.'],
  ['✉️', 'Invite enquiries', 'Every ad links straight to your own website or contact page.'],
  ['🎯', 'Relevant placement', 'Choose the guide pages that match what you offer.'],
  ['🎉', 'Offers and new launches', 'Run a seasonal message for a festival, a new term or a launch.'],
  ['🧩', 'Flexible placements', 'Small, medium or large; one page or every guide; short or long runs.'],
  ['🤝', 'Talk to a real person', 'You deal directly with the maker of Learn Tamil — no ad network in between.']
];
const AD_STEPS = [
  ['Get in touch', 'Send us a message through the contact page with your business details and the format you like.'],
  ['Plan it together', 'We discuss the placement, size, dates and price, and agree the terms in writing.'],
  ['Send your ad', 'You send the image, text and link. We check that it suits a family website.'],
  ['Goes live', 'Once approved, your ad is published as a plain image or text link, marked “Sponsored”.']
];
const AD_FAQ = [
  ['How do I advertise on Learn Tamil?', 'Contact us through the contact page at blog.msdevbuild.com/contact with your business name, contact details and the ad format you are interested in. We reply to discuss placement, dates and price. There is no online booking or payment on the site.'],
  ['Where do sponsor ads appear on Learn Tamil?', 'Only in grown-up areas: the parents’ and teachers’ guide pages and the parents’ area of the home page. Ads never appear inside the children’s lessons, games, stories or certificates, and the Learn Tamil Android app shows no ads at all.'],
  ['Does Learn Tamil use Google Ads or track visitors for advertisers?', 'No. Learn Tamil does not use Google AdSense or any ad network. Sponsor ads are plain images or text with a link. They load no advertising script, set no cookies and are not personalised, and no visitor data is shared with advertisers.'],
  ['What kinds of businesses can advertise?', 'Child-safe, family-friendly businesses, such as bookshops, Tamil classes, schools, tutors, children’s clothing, cultural events and family services. Every ad is reviewed and must be approved before it goes live.'],
  ['How much does advertising cost?', 'Prices depend on the format, the pages and how long the ad runs. Contact us and we will share the current options and price for your campaign. Price, dates, renewal and cancellation are agreed with you before anything is published.']
];
const demoTag = '<span class="adk-demo">Demo ad · fictional business</span>';
const AD_PREVIEW = {
  compact: `<div class="adk-ad adk-compact">${demoTag}<span class="adk-sp">Sponsored</span>
    <span class="adk-logo" style="--a:#0b8a6c;--b:#16b38a" aria-hidden="true">📗</span>
    <div><b>Kolam Books</b><p>Picture books for young readers — new arrivals every month.</p></div>
    <span class="adk-cta">Visit →</span></div>`,
  featured: `<div class="adk-ad adk-featured">${demoTag}
    <div class="adk-img" style="--a:#ff9a3c;--b:#e0480c" aria-hidden="true"><span>🎨</span></div>
    <div class="adk-body"><span class="adk-sp">Sponsored</span><b>Little Kolam Art Studio</b>
      <p>Weekend art and craft classes for ages 5–12. Small groups, friendly teachers.</p>
      <span class="adk-cta">Book a free trial →</span></div></div>`,
  premium: `<div class="adk-ad adk-premium">${demoTag}
    <div class="adk-hero" style="--a:#1769d1;--b:#7c3aed" aria-hidden="true"><span>🎵</span><i>🎶</i><i>✨</i></div>
    <div class="adk-body"><span class="adk-sp">Sponsored</span><b>Yaazh Music Academy</b>
      <p>Veena, violin and vocal lessons for children and adults. Online and in person — new batches start every month.</p>
      <div class="adk-row"><span class="adk-cta">Visit our website →</span><span class="adk-contact">✉️ hello@example.com</span></div></div></div>`,
  business: `<div class="adk-ad adk-business">${demoTag}<span class="adk-sp">Sponsored</span>
    <span class="adk-logo big" style="--a:#7c3aed;--b:#b05cff" aria-hidden="true">🏫</span>
    <b>Thendral Tuition Centre</b>
    <p>Maths, English and science support for primary school children.</p>
    <span class="adk-cta wide">Learn more →</span></div>`,
  listing: `<div class="adk-ad adk-listing">${demoTag}
    <ul class="adk-list">
      <li><span class="adk-li-ic" aria-hidden="true">📘</span><div><b>Free Tamil letters chart</b><small>Learn Tamil printable</small></div></li>
      <li class="is-sp"><span class="adk-li-ic" style="--a:#e0480c;--b:#ff9a3c" aria-hidden="true">🪔</span><div><b>Pongal family craft fair <span class="adk-sp inline">Sponsored</span></b><small>Malar Events · Saturday workshops for families</small></div><span class="adk-cta">Details →</span></li>
      <li><span class="adk-li-ic" aria-hidden="true">📗</span><div><b>Tamil stories for kids</b><small>Learn Tamil guide</small></div></li>
    </ul></div>`
};
/* A tiny page sketch with the ad's place highlighted. */
const AD_WIRE = {
  compact: '<i class="w-h"></i><i class="w-ad w-strip"></i><i class="w-t"></i><i class="w-t"></i><i class="w-t s"></i>',
  featured: '<i class="w-h"></i><i class="w-t"></i><i class="w-t"></i><i class="w-t s"></i><i class="w-ad w-card"></i>',
  premium: '<i class="w-h tall"></i><i class="w-t"></i><i class="w-ad w-big"></i><i class="w-t s"></i>',
  business: '<i class="w-h"></i><span class="w-cols"><span><i class="w-t"></i><i class="w-t"></i><i class="w-t"></i><i class="w-t s"></i></span><i class="w-ad w-rail"></i></span>',
  listing: '<i class="w-h"></i><i class="w-t"></i><i class="w-li"></i><i class="w-ad w-li"></i><i class="w-li"></i>'
};
const PLACE_LABEL = { banner: 'Guide pages · top', card: 'Guide pages · end', home: 'Home page · parents’ area', vertical: 'Guide pages · desktop side', 'on request': 'Matching guide · agreed with you' };
const adCard = f => `<article class="adk-pkg glass" id="ad-${f.id}" aria-labelledby="ad-${f.id}-h">
  <div class="adk-pkg-top">
    <span class="adk-size">${f.ic} ${f.size}</span>
    <h3 id="ad-${f.id}-h">${f.name}</h3>
    <p class="adk-where"><span class="adk-wire" aria-hidden="true">${AD_WIRE[f.id]}</span><span><b>Where:</b> ${f.where}</span></p>
  </div>
  <div class="adk-preview" role="img" aria-label="Demo preview of a ${f.name.toLowerCase()} for a fictional business">${AD_PREVIEW[f.id]}</div>
  <div class="adk-pkg-info">
    <p><b>Best for:</b> ${f.best}</p>
    <ul class="adk-ticks">${f.gets.map(g => `<li>${g}</li>`).join('')}</ul>
  </div>
</article>`;
const yes = '<span class="adk-yes" aria-label="Yes">✓</span>', no = '<span class="adk-no" aria-label="No">—</span>';
const AD_TABLE = [
  ['Size on the page', 'Slim strip', 'Card', 'Large banner', 'Tall card', 'Short listing'],
  ['Where', ...AD_FORMATS.map(f => PLACE_LABEL[f.place])],
  ['Image', 'Logo or icon', yes, yes, yes, 'Small, optional'],
  ['Text', 'One line', 'Short description', 'Message + contact', 'Short description', '1–2 lines'],
  ['Link to your site', yes, yes, yes, yes, yes],
  ['Phones and tablets', yes, yes, yes, 'Desktop only', yes],
  ['Marked “Sponsored”', yes, yes, yes, yes, yes]
];
const ADV = 'advertise.html';
write(ADV, shell({
  file: ADV, ogType: 'website', share: false, bubble: 'Grow with us!',
  title: 'Advertise With Us – Grow Your Business | Learn Tamil',
  description: 'Sponsor Learn Tamil’s guides for parents and teachers: banners, featured cards and listings. No ad networks, no tracking. Contact us to plan your ad.',
  h1: 'Advertise With Us – Grow Your Business With Our Audience', eyebrow: 'For businesses · Media kit',
  body: `
<section class="adk-intro">
  <p class="adk-sub">Reach more potential customers by promoting your business through our application. Connect with our growing audience and showcase your products, services and brand.</p>
  <div class="adk-actions">
    <a class="btn primary adk-big" href="${CONTACT_URL}" target="_blank" rel="noopener">✉️ Contact us to advertise <span aria-hidden="true">↗</span></a>
    <a class="btn adk-big" href="#formats">See ad formats ↓</a>
  </div>
</section>
<p class="lead-doc"><strong>Businesses can advertise on Learn Tamil by booking a sponsor space directly with our team: we do not use Google Ads or any ad network.</strong> Ads appear only on the pages for parents and teachers, never inside the children’s lessons or games. We review every ad, publish it as a plain image or text link marked “Sponsored”, and agree price and dates with you before anything goes live.</p>
<ul class="adk-facts" aria-label="At a glance">
  <li><span aria-hidden="true">👪</span><b>Grown-up pages only</b><small>Guides and the parents’ area — never in lessons or games</small></li>
  <li><span aria-hidden="true">🚫</span><b>No ad networks</b><small>No AdSense, no ad scripts, no cookies, no tracking</small></li>
  <li><span aria-hidden="true">✅</span><b>Every ad reviewed</b><small>Child-safe, family-friendly businesses only</small></li>
  <li><span aria-hidden="true">🤝</span><b>Booked directly</b><small>No online payment — we agree terms with you</small></li>
</ul>

${h2('audience', '👪', 'Who you will reach')}
<p>Learn Tamil is a free website and app that helps children aged 3 to 12 learn the Tamil alphabet, words, stories and rhymes. The people who read our guide pages are mostly <b>parents, grandparents and teachers</b> — in Tamil-speaking homes and in Tamil families around the world — who are looking for ways to help children learn the language. When you enquire, we can share recent visit numbers, counted anonymously and only in total.</p>
<div class="adk-benefits">${AD_BENEFITS.map(([ic, t, d]) => `<div class="adk-benefit glass"><span class="adk-b-ic" aria-hidden="true">${ic}</span><b>${t}</b><p>${d}</p></div>`).join('')}</div>
<p class="muted adk-note">We do not promise a number of views, clicks, enquiries or sales. Results depend on your offer and many other things outside our control.</p>

${h2('formats', '🖼️', 'Ad formats and sizes')}
<p>Every format below is a real place on the site. The previews use <b>fictional demo businesses</b> to show how an ad looks; your own ad is designed with your logo, words and link.</p>
<div class="adk-pkgs">${AD_FORMATS.map(adCard).join('')}</div>

${h2('compare', '📊', 'Compare the formats')}
<div class="table-wrap adk-table-wrap"><table class="adk-table">
  <thead><tr><th scope="col">Feature</th>${AD_FORMATS.map(f => `<th scope="col">${f.ic} ${f.name}</th>`).join('')}</tr></thead>
  <tbody>${AD_TABLE.slice(1).concat([AD_TABLE[0]]).map(([k, ...v]) => `<tr><th scope="row">${k}</th>${v.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
</table></div>
<p class="muted adk-note">Prices, dates and the exact pages are agreed with you. Ask us about running more than one format together.</p>

${h2('never', '🛡️', 'Where ads will never appear')}
<div class="callout glass adk-never"><p>To keep Learn Tamil safe for children, sponsor ads are <b>never</b> shown in the learning app’s lessons, games, stories, rhymes, quizzes or certificates, and the Learn Tamil Android app shows <b>no ads at all</b>. This is a promise we make to parents, and it is part of what makes the guide pages a trusted place for your brand.</p></div>

${h2('how', '🪜', 'How it works')}
<ol class="adk-steps">${AD_STEPS.map(([t, d], i) => `<li class="glass"><span class="adk-n" aria-hidden="true">${i + 1}</span><b>${t}</b><p>${d}</p></li>`).join('')}</ol>

<section class="adk-cta-box" id="contact" aria-labelledby="adk-cta-h">
  <span class="adk-cta-deco" aria-hidden="true"><i>📣</i><i>✨</i><i>💛</i></span>
  <h2 id="adk-cta-h">Interested in Advertising With Us?</h2>
  <p>Let’s discuss how we can help promote your business. Contact our team to learn more about available advertising spaces, package sizes, pricing and campaign opportunities.</p>
  <div class="adk-actions center">
    <a class="btn adk-big adk-white" href="${CONTACT_URL}" target="_blank" rel="noopener">✉️ Contact us <span aria-hidden="true">↗</span></a>
    <a class="btn adk-big adk-ghost" href="${CONTACT_URL}" target="_blank" rel="noopener">💼 Advertising enquiry <span aria-hidden="true">↗</span></a>
  </div>
  <div class="adk-checklist">
    <b>To help us reply quickly, please include in your message:</b>
    <ul>
      <li>Business name</li><li>Contact person’s name</li><li>Email address</li><li>Phone number</li>
      <li>Business website (optional)</li><li>The ad format you are interested in</li><li>A short message about what you would like to promote</li>
    </ul>
    <p class="adk-small">Your message goes to the MSDEVBUILD contact page, run by the maker of Learn Tamil. This page itself has no form and sends nothing. We use the details you send only to reply to your enquiry and to arrange your advertisement, and we do not share them with anyone else.</p>
  </div>
</section>

${h2('policy', '📜', 'Advertising policy')}
<p>These rules apply to every sponsor on Learn Tamil. Price, placement, dates and other terms are agreed with each business in writing before an ad is published.</p>
<div class="adk-policy">
  <section class="glass"><h3>✅ Advertisement approval</h3><ul>
    <li>All advertisements are subject to our review and approval before they are published.</li>
    <li>We may reject, pause or remove any advertisement that does not follow this policy.</li>
    <li>Advertisers must give accurate business and promotional information.</li></ul></section>
  <section class="glass"><h3>📝 Advertising content</h3><ul>
    <li>Advertisers are responsible for the legality and accuracy of their advertising, and must own or have a licence for every image, logo and word they send.</li>
    <li>We only accept child-safe, family-friendly advertising. We do not accept misleading, fraudulent, illegal or inappropriate advertising, or advertising for adult content, gambling, alcohol, tobacco or vaping, weapons, or dating services.</li>
    <li>Ads must not ask children to buy anything or to give personal details.</li></ul></section>
  <section class="glass"><h3>🔒 User privacy</h3><ul>
    <li>We never share our visitors’ personal information, email addresses, phone numbers or other private data with advertisers.</li>
    <li>Advertisers have no access to any user data. Learn Tamil has no accounts, and the only personal details it keeps are the certificate records a parent or guardian chooses to give, which are never shared with advertisers.</li>
    <li>Ads are plain images or text with a link: no advertising scripts, tracking pixels or cookies, and no targeting or personalisation.</li>
    <li>Business details sent to us in an enquiry are used only to handle that enquiry and the advertisement, and are kept private.</li></ul></section>
  <section class="glass"><h3>⚖️ Advertisement disclaimer</h3><ul>
    <li>Every paid placement is clearly labelled “Sponsored”, and its link is marked as sponsored for search engines.</li>
    <li>We do not guarantee sales, leads, traffic or any other business result.</li>
    <li>Advertisers are responsible for their own products, services, offers and customer transactions.</li></ul></section>
  <section class="glass adk-wide"><h3>🤝 Terms and conditions</h3><ul>
    <li>Pricing, placement, duration, renewal, cancellation and refunds are agreed directly with the business before publication. There is no online booking or payment on this site.</li>
    <li>We may update our advertising formats and this policy from time to time. The current version is always on this page.</li></ul></section>
</div>
<p>Please also read our <a href="privacy.html">Privacy &amp; data policy</a> (see <a href="privacy.html#sponsors">Sponsor boxes</a>), our <a href="terms.html">Terms &amp; conditions</a> and this <a href="#policy">Advertising policy</a>.</p>

${h2('faq', '❓', 'Questions from advertisers')}
<div class="faq">${faqHtmlFor(AD_FAQ)}</div>
<p class="adk-final"><a class="btn primary adk-big" href="${CONTACT_URL}" target="_blank" rel="noopener">✉️ Contact us to advertise <span aria-hidden="true">↗</span></a></p>`,
  schema: [faqSchemaFor(AD_FAQ, ADV)]
}));

const LINKS = { 'tamil-vowels.html': VOWEL_FAQ, 'tamil-consonants.html': CONS_FAQ, 'uyirmei-ezhuthukal.html': UM_FAQ,
  'tamil-words-for-kids.html': WORD_FAQ, 'tamil-stories-for-kids.html': STORY_FAQ, 'tamil-alphabet.html': FAQ, 'ezhuthukal.html': TA_FAQ,
  ...Object.fromEntries(TOPIC_PAGES.map(T => [T.file, T.faq])), 'tamil-printables.html': PRINT_FAQ,
  'aathichoodi.html': AATHI_FAQ, 'tamil-rhymes-for-kids.html': RHYME_FAQ, 'tamil-festivals-for-kids.html': FEST_FAQ, 'how-to-teach-tamil-to-kids.html': PARENT_FAQ, 'thirukkural.html': KURAL_FAQ, 'thirukkural-topics.html': TOPIC_FAQ_K,
  'learn-tamil-online.html': ONLINE_FAQ, 'tamil-pronunciation-guide.html': PRON_FAQ, 'tamil-phrases-for-beginners.html': PHRASE_FAQ, 'install-app.html': INSTALL_FAQ };
const KB = [
  ...HELP.map(([q, a, tags, link]) => ({ q, a, tags, link, lang: 'en', help: 1 })),
  ...Object.entries(LINKS).flatMap(([file, list]) => list.map(([q, a]) => ({ q, a, tags: '', link: file, lang: file === 'ezhuthukal.html' ? 'ta' : 'en' })))
];
write('assets/js/data/faq.js', '/* Generated by tools/build-pages.mjs — knowledge base for the Ask Kili chat. Do not edit by hand. */\nwindow.LT_FAQ = ' + JSON.stringify(KB) + ';\n');

/* ---------- sitemap (with language alternates) ---------- */
const pages = [['', '1.0', 'weekly'], ...GUIDES.map(g => [g.file, g.file === 'tamil-alphabet.html' ? '0.9' : '0.8', 'monthly']),
  ...KURAL_PAGES.map(f => [f, '0.6', 'yearly']),
  ...PRINTS.map(d => ['printables/' + d.file + '.pdf', '0.6', 'monthly']),
  ['advertise.html', '0.4', 'monthly'], ['privacy.html', '0.3', 'yearly'], ['terms.html', '0.3', 'yearly']];
const altXml = p => (p === 'tamil-alphabet.html' || p === 'ezhuthukal.html')
  ? ALT.map(a => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${SITE}${a.file}"/>`).join('') : '';
const imgXml = p => p === 'tamil-printables.html' ? PRINTS.map(d =>
  `<image:image><image:loc>${SITE}assets/printables/${d.file}.png</image:loc><image:title>${esc(d.title)}</image:title></image:image>`).join('') : '';
const writeSitemap = () => write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
  pages.map(([p, pr, cf]) => `  <url><loc>${SITE}${p}</loc>${altXml(p)}${imgXml(p)}<lastmod>${lastmod(p)}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n') + `\n</urlset>\n`);

/* ---------- llms.txt (summary for AI assistants) ---------- */
write('llms.txt', `# Learn Tamil (தமிழ் கற்போம்)

> Free website for children and beginners to learn the Tamil alphabet: all 247 letters with sound, picture words, read-along stories, reading practice and games. Made by Suthahar Jegatheesan (MSDEVBUILD). No sign-up, no ads in lessons or games. Installable as an app and works offline.

Key facts:
- The Tamil alphabet has 247 letters: 12 vowels (உயிர், uyir), 18 consonants (மெய், mei), 1 special letter ஃ (ஆய்தம், aaytham) and 216 consonant-vowel letters (உயிர்மெய், uyirmei; 18 × 12).
- Vowels: ${VOWELS.map(v => v.l).join(' ')} — short (குறில்) ${kuril.map(v => v.l).join(' ')}; long (நெடில்) ${nedil.map(v => v.l).join(' ')}.
- Consonants: ${CONS.map(k => k.c + PULLI).join(' ')} — வல்லினம் ${meiByGroup('v').map(k => k.c + PULLI).join(' ')}; மெல்லினம் ${meiByGroup('m').map(k => k.c + PULLI).join(' ')}; இடையினம் ${meiByGroup('i').map(k => k.c + PULLI).join(' ')}.
- 12 vowels + 18 consonants = 30 முதல் எழுத்துகள் (primary letters). Uyirmei: 90 short (18 × 5) + 126 long (18 × 7).
- Grantha letters ஜ ஷ ஸ ஹ க்ஷ ஸ்ரீ are used for borrowed words and are not counted in the 247.
- The 12 Tamil months, in order: ${topicWords('months').map(([w, , m]) => `${w} (${m.split(' · ')[1]})`).join(', ')}. Tamil New Year is the first day of சித்திரை (usually 14 April); Pongal is the first day of தை (usually 14–15 January).
- Aathichoodi (ஆத்திசூடி), traditionally attributed to Avvaiyar, begins with one line for each vowel: ${AATHICHOODI.map(l => l[0]).join(' · ')}.
- Thirukkural (திருக்குறள்) by Thiruvalluvar (திருவள்ளுவர்) has 1,330 Kurals (two-line couplets) in 133 chapters of 10, in three divisions: அறத்துப்பால் (virtue, 38 chapters, 380 Kurals), பொருட்பால் (wealth and society, 70 chapters, 700 Kurals) and காமத்துப்பால் (love, 25 chapters, 250 Kurals). First Kural: ${kText(1)[0]} / ${kText(1)[1]}
- Thirukkural chapters by topic: ${KURAL_TOPICS.map(T => `${T.en.toLowerCase()} — ${T.ch.map(c => `${c} ${KURAL.ch[c - 1][0]}`).join(', ')}`).join('; ')}.
- Order to teach a child: listen and sing first → 12 vowels → 18 consonants → uyirmei one consonant row at a time → two-letter picture words → sentences. About 10 minutes a day.

## Guides
${GUIDES.map(g => `- [${g.en}](${SITE}${g.file})`).join('\n')}

## Thirukkural chapters (Tamil text + G. U. Pope's English translation)
${KURAL.ch.map(([t, e], i) => `- [${i + 1}. ${t} — ${e}](${SITE}${kChPage(i + 1)})`).join('\n')}

## Free printables (PDF, A4)
${PRINTS.map(d => `- [${d.title}](${SITE}printables/${d.file}.pdf): ${d.pages} page${d.pages > 1 ? 's' : ''}`).join('\n')}

## Full text
- [llms-full.txt](${SITE}llms-full.txt): every letter, word list, story, rhyme and festival on this site, and all 1,330 Kurals of Thirukkural, as plain text.

## App and policies
- [Learning app](${SITE}): interactive letters with audio, reading practice, stories and games (requires JavaScript).
- [Privacy & data](${SITE}privacy.html): no accounts and no ad tracking; certificate records (child’s name, parent’s email and phone) only with a parent’s consent, never public.
- [Terms](${SITE}terms.html)
- [Advertise with us](${SITE}advertise.html): sponsor formats for businesses, shown only on parents’ and teachers’ pages, booked directly with no ad network or tracking.
- [Report an issue](${ISSUES_URL})
`);

/* ---------- llms-full.txt (all learning content as plain text, for AI answer engines) ---------- */
const mean0 = m => m.split(' · ')[0];
write('llms-full.txt', `# Learn Tamil — full content (${SITE})

Free Tamil learning for children by Suthahar Jegatheesan (MSDEVBUILD). This file lists the learning content of the site as plain text. Every Tamil string was checked by hand.

## The Tamil alphabet: 247 letters
12 vowels (உயிர்) + 18 consonants (மெய்) + 1 ஆய்தம் (ஃ) + 216 uyirmei (உயிர்மெய், 18 × 12) = 247.

### Vowels (உயிர் எழுத்துகள்)
${VOWELS.map(v => `- ${v.l} — ${v.r} — ${v.len === 'குறில்' ? 'short (குறில்)' : 'long (நெடில்)'} — ${v.hint} — example: ${v.ex[1]} (${v.ex[2]})`).join('\n')}

### Consonants (மெய் எழுத்துகள்)
${CONS.map(k => `- ${k.c + PULLI} — ${k.r} — ${GROUPS[k.g].ta} (${GROUPS[k.g].en.toLowerCase()}) — ${k.hint} — example: ${k.ex[1]} (${k.ex[2]})`).join('\n')}

### ஆய்த எழுத்து
- ஃ — a soft breathy “kh”, heard in எஃகு (steel). Also called அஃகேனம் or முப்புள்ளி.

### Uyirmei (consonant + vowel), one row per consonant
${CONS.map(k => `- ${k.c + PULLI}: ${VOWELS.map(v => k.c + v.s).join(' ')}`).join('\n')}

## Picture words
${WORDS.map(([w, , m]) => `${w} (${m})`).join(', ')}.

## Word topics
${TOPICS.map(t => `### ${t.en} — ${t.ta}\n${t.words.map(([w, , m]) => `- ${w} — ${m}`).join('\n')}`).join('\n\n')}

## Stories (simple Tamil with English meaning)
${STORIES.map(s => `### ${s.title} — ${s.en}\n${s.pages.map(p => `- ${p[1]} — ${p[2]}`).join('\n')}`).join('\n\n')}

## Rhymes and Aathichoodi
${RHYMES.map(r => `### ${r.title} — ${r.en} (${r.by})\n${r.lines.map(([l, e]) => `- ${l} — ${e}`).join('\n')}`).join('\n\n')}

## Festivals
${FESTIVALS.map(f => `### ${f.title} — ${f.en}\n${f.pages.map(p => `- ${p[1]} — ${p[2]}`).join('\n')}\nWords: ${f.words.map(([w, , m]) => `${w} (${m})`).join(', ')}`).join('\n\n')}

## Thirukkural (திருக்குறள்) by Thiruvalluvar — all 1,330 Kurals
Tamil text checked against Project Madurai, the tk120404/thirukkural dataset and Tamil Wikisource. English verse translation by Rev. G. U. Pope (1886, public domain).
${KURAL.ch.map(([t, e], c) => `### Chapter ${c + 1}: ${t} — ${e}\n${Array.from({ length: 10 }, (_, i) => c * 10 + i + 1).map(n => `${n}. ${kText(n)[0]} / ${kText(n)[1]} — ${kText(n)[2]}${KURAL_LESSONS[n] ? ` | Meaning for children: ${KURAL_LESSONS[n].en}` : ''}`).join('\n')}`).join('\n\n')}
`);

/* ---------- Privacy & data ---------- */
const CONTACT = '<a href="https://blog.msdevbuild.com/contact/" rel="noopener">contact page</a>';
const ISSUES = '<a href="https://github.com/jssuthahar/learntamil/issues" rel="noopener">GitHub Issues</a>';
const privacyBody = `
<div class="callout glass"><b>In short:</b> Learn Tamil never sells personal information and never asks a child for it. The only personal details it keeps are certificate records that a parent or guardian gives on the website, with consent (the child’s name and the parent’s email and phone), and nobody can see them publicly. There are no accounts and no advertising scripts or ad tracking. Some parents’ guide pages show a simple sponsor box, never inside the children’s lessons or games. If you allow it, we count anonymous visits and game use with Google Analytics for Firebase, with all advertising features turned off. Progress and settings are saved only in your own browser.</div>

<h2>Who runs this website</h2>
<p>Learn Tamil (<a href="${SITE}">${SITE}</a>) is a free educational website made by Suthahar Jegatheesan under the MSDEVBUILD name. It is a personal, non-commercial project. Questions about privacy can be sent through the ${CONTACT}.</p>

<h2>Information we collect</h2>
<p><strong>Almost no personal information.</strong> The site has no sign-up, no login and no comments. The one form that sends information is the certificate form on the website, filled in by a parent or guardian with their consent (see <a href="#certificates">Certificate records</a>). Apart from that, we do not ask for names, email addresses, ages, photos or any other personal details, and we do not run advertising scripts.</p>
<h3 id="sponsors">Sponsor boxes</h3>
<p>Some guide pages for parents and teachers (and the parents’ area at the bottom of the home page) may show a small box marked <em>Sponsored</em> or <em>Sample ad</em>. It is plain text or an image with a link, chosen by us — not by an ad network. It loads <strong>no advertising script, sets no cookies, is not personalised or targeted</strong>, and sends nothing about you or your child to the sponsor. Nothing is sent until you tap the link, and then the sponsor’s own website and privacy policy apply. Sponsor boxes never appear inside the children’s lessons, games, stories or certificates. Businesses interested in sponsoring can read <a href="advertise.html">Advertise with us</a> and our <a href="advertise.html#policy">advertising policy</a>.</p>
<h3 id="microphone">Microphone (“Say it back”)</h3>
<p>The 🎤 <b>Say it</b> button lets a child record themselves saying a letter or word and play it back. The recording is kept only in the browser’s memory, is <strong>never uploaded or saved</strong>, and is deleted when the window closes. The browser asks for permission first, and nothing is recorded until the child taps 🎤. There is no speech recognition.</p>
<h3 id="profiles">Child profiles and Parent dashboard</h3>
<p>Up to six children can each have their own progress on one device. A child’s first name (if you type one), the age group you choose (3–5, 6–8 or 9–12), tokens, badges, daily gifts, lessons done, Thirukkural couplets learned and bookmarked, stickers, minutes learned and the letters they find hard are saved <strong>only in this browser</strong> (localStorage) and are never sent anywhere. You can delete a child’s progress in the Parent dashboard, or clear this site’s data in your browser settings.</p>
<h3 id="analytics">Anonymous usage statistics (only if you allow them)</h3>
<p>When you first visit, a notice asks whether we may count visits. <strong>Nothing is loaded or sent unless you tap “Allow”.</strong> If you allow it, the site uses <strong>Google Analytics for Firebase</strong> to learn which lessons and games are useful. It records pages visited and simple events such as “a game was started”, “a story was finished”, “a badge was earned” or “a certificate level was passed”, together with general technical details (approximate country, device type, browser). It stores a random visitor ID in first-party cookies (<code>_ga</code>, <code>_ga_*</code>) so repeat visits can be counted. We have turned off Google signals, advertising cookies and ad personalisation, and we never send names, the certificate name or anything your child types. Google processes this data under the <a href="https://policies.google.com/privacy" rel="noopener">Google Privacy Policy</a>. If you tap “No thanks”, or change your mind later, the site works exactly the same. Your choice is saved in this browser (localStorage <code>lt-consent</code>).</p>
<p><strong data-consent-status>Your choice is saved in this browser.</strong> <button type="button" class="btn small" data-consent-open>Change cookie choice</button></p>

<h2>What is saved on your device</h2>
<p>To make the site work, a few small values are saved in your browser's own storage. They never leave your device and we cannot see them.</p>
<div class="tbl"><table><thead><tr><th>What</th><th>Where</th><th>Why</th></tr></thead><tbody>
<tr><td>Light or dark theme</td><td>localStorage <code>lt-theme</code></td><td>Remembers your colour choice</td></tr>
<tr><td>⚙️ Settings: text size, high contrast, less movement, who speaks (woman, man, girl, boy), device voice, speed and volume</td><td>localStorage <code>lt-text</code>, <code>lt-contrast</code>, <code>lt-motion</code>, <code>lt-rate</code>, <code>lt-vol</code>, <code>lt-voice</code>, <code>lt-cast</code></td><td>Remembers how you like the app to look and sound on this device</td></tr>
<tr><td>Children’s first names, pictures and age groups</td><td>localStorage <code>lt-profiles</code>, <code>lt-profile</code></td><td>Lets each child have their own progress and the learning path for their age</td></tr>
<tr><td>Game progress: tokens, badges, daily gifts, letters heard, words read, stories finished, Thirukkural couplets learned and bookmarked, Thirukkural quiz answers</td><td>localStorage <code>lt-progress</code></td><td>Remembers your child's rewards and progress</td></tr>
<tr><td>Name typed for a certificate, and certificate results</td><td>localStorage <code>lt-cert-name</code>, <code>lt-progress</code></td><td>Puts the name on the certificate and remembers which levels are passed. The certificate PDF is made inside your browser. On the website the name is also sent with the certificate record (see <a href="#certificates">Certificate records</a>); in the Android app it is never sent.</td></tr>
<tr><td>Parent’s email and phone for certificates</td><td>localStorage <code>lt-parent-contact</code></td><td>So you are not asked again for the next certificate. Tap <em>Change</em> on the form to correct them</td></tr>
<tr><td>Certificate records sent or waiting to be sent</td><td>localStorage <code>lt-cert-sent</code>, <code>lt-cert-outbox</code></td><td>The certificate IDs already stored, so a certificate is never stored twice; and records made while offline, sent the next time the site is online</td></tr>
<tr><td>Questions and words already shown</td><td>localStorage <code>lt-cert-seen</code>, <code>lt-spin-seen</code></td><td>So certificate retakes and the Spin wheel give new questions and words instead of repeating</td></tr>
<tr><td>Reminder device token</td><td>localStorage <code>lt-push</code></td><td>Only if you turn reminders on; deleted when you turn them off</td></tr>
<tr><td>When the “support this project” note was last shown</td><td>localStorage <code>lt-support</code></td><td>So the note appears only now and then, and rests after you answer it</td></tr>
<tr><td>Visit counted, random session ID and approximate place</td><td>sessionStorage <code>lt-counted</code>, <code>lt-sid</code>, <code>lt-geo</code>, <code>lt-located</code></td><td>So one visit is counted once; removed when the tab is closed</td></tr>
<tr><td>Your cookie choice</td><td>localStorage <code>lt-consent</code></td><td>Remembers whether you allowed anonymous usage statistics</td></tr>
<tr><td>Best game scores and sound on/off</td><td>localStorage <code>lt-best-*</code>, <code>lt-sfx</code></td><td>Shows the best score for each game; remembers if game sounds are muted</td></tr>
<tr><td>Opened from the Android app</td><td>sessionStorage <code>lt-app</code></td><td>Turns off analytics, counters, reminders, sponsor boxes and donation links inside the app; removed when the app is closed</td></tr>
<tr><td>Closed voice message</td><td>sessionStorage <code>lt-notice</code></td><td>Keeps the “no Tamil voice” message closed until the tab is closed</td></tr>
<tr><td>Your letter recordings</td><td>IndexedDB (only on <code>record.html</code>)</td><td>Keeps recordings you make until you download or delete them</td></tr>
</tbody></table></div>
<p>You can remove all of this at any time with <em>Reset progress</em> in the 🪙 My rewards panel, or by clearing this site's data in your browser settings.</p>

<h2 id="certificates">Certificate records (website only, with a parent’s consent)</h2>
<p>On the website, before a certificate is made, a form asks a <strong>parent or guardian</strong> for the child’s name, <strong>their own email address and phone number</strong> (with country code), and to tick a box to agree. Nothing on the form is sent until you tick that box and tap the button.</p>
<ul>
<li><strong>What is stored:</strong> the child’s name, your email and phone, the certificate ID, the level or chapter passed, the date and time, that you agreed (and which version of the wording), and whether you later tapped a WhatsApp, Facebook, LinkedIn or Instagram share button for that certificate.</li>
<li><strong>Where:</strong> <strong>Cloud Firestore</strong> (Google Firebase, project <code>learntamil-js</code>). One record per certificate. The security rules let the website add a record once; <strong>nobody can read records from the website</strong>, so names, emails and phone numbers are never shown publicly, on the certificate or in share links. Only the site owner can see them, in the Firebase console.</li>
<li><strong>Checking a certificate:</strong> a copy of only what is printed on the certificate (the child’s name, the level or chapter, the date and the certificate ID) is kept separately, so anyone who has a certificate ID can confirm it with <em>🔎 Check a certificate</em>. The email and phone are never part of that copy and can’t be looked up. Certificates are never listed or searchable by name.</li>
<li><strong>Why:</strong> to keep a record of each certificate, so we can confirm it if asked, and to tell you about new Learn Tamil levels and lessons. We never sell your details or share them with advertisers.</li>
<li><strong>Your choices:</strong> to see, correct or delete your records, or to stop hearing from us, use the ${CONTACT}. Your email and phone are also remembered in this browser (<code>lt-parent-contact</code>) so you are not asked again; clearing this site’s data removes them from the device.</li>
<li><strong>Offline:</strong> the child always gets the certificate. If the record cannot be sent, it waits in this browser and is sent the next time the site is online.</li>
<li><strong>Android app:</strong> the form does not appear and nothing is sent.</li>
</ul>

<h2 id="android">The Learn Tamil Android app</h2>
<p>The Learn Tamil app on Android (Google Play or a test copy) shows this same website inside the phone’s Chrome engine. Because it is made for children, the app collects and sends <strong>nothing</strong>: there is no cookie notice and no Google Analytics, no “learning around the world” visit counter, no location lookup, no reminders or push token, no sponsor boxes and no donation links. Progress and settings are saved only on the phone, as listed below, and the 🎤 <b>Say it</b> microphone works the same way as on the website (never recorded to storage, never uploaded). The app remembers that it is the app only for the current session (sessionStorage <code>lt-app</code>). Uninstalling the app, or clearing Chrome’s data for this site, removes everything.</p>

<h2 id="live">“Learning around the world” counter</h2>
<p>The home page shows how many visits the site has had, how many people are learning right now, and the top countries and cities. To make this work, each visit adds one to a shared counter in <strong>Firebase Realtime Database</strong> (Google), and an open page keeps a temporary anonymous entry (a random ID, removed when the page is closed) so it can be counted as “learning right now”. No cookies are used for this.</p>
<p><strong>Only if you allowed the cookie notice</strong>, the site also asks <a href="https://www.geojs.io/" rel="noopener">GeoJS</a> for the approximate country and town of your internet connection, and adds one to that country and town on the map. Your IP address is sent to GeoJS for this lookup but is never stored by Learn Tamil; only the country and town name are kept, as part of the totals. If you tap “No thanks”, no place is looked up.</p>

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
<li><strong>Share buttons</strong> (WhatsApp, LinkedIn, Facebook, X, Telegram, email) are plain links: no script or tracking button from those sites loads on our pages. Nothing is sent until you tap one, and then only the page link and title (or the Kural you chose) go to the site you picked, under that site’s own privacy policy. We never include your child’s name or progress. After a certificate test, the share buttons sit behind a press-and-hold check for grown-ups. Their message and link never contain the child’s name. The name is only inside the certificate image, which leaves your device only if you choose to share or save it.</li>
<li><strong>Cloud Firestore</strong> (Google Firebase) keeps the certificate records a parent or guardian chooses to give (see <a href="#certificates">Certificate records</a>).</li>
<li><strong>Firebase Realtime Database</strong> keeps the anonymous visit totals for the “learning around the world” counter.</li>
<li><strong>Google reCAPTCHA</strong> (through Firebase App Check) quietly checks that requests to our Firebase services come from this real website and not from automated scripts, to keep the counter and reminders free of spam. It runs in the background, never shows a puzzle, and works under the <a href="https://policies.google.com/privacy" rel="noopener">Google Privacy Policy</a> and <a href="https://policies.google.com/terms" rel="noopener">Terms</a>.</li>
<li><strong>GeoJS</strong> looks up an approximate country and town, only if you allowed the cookie notice (see <a href="#live">the counter</a>).</li>
<li><strong>Firebase Cloud Messaging</strong> delivers reminders, only if you turn them on (see <a href="#reminders">Reminders</a>).</li>
<li><strong>Google Fonts</strong> supplies the Tamil and English fonts. See the <a href="https://developers.google.com/fonts/faq/privacy" rel="noopener">Google Fonts privacy FAQ</a>.</li>
<li><strong>cdnjs (Cloudflare)</strong> supplies a zip library, only on the Letter Recorder page.</li>
<li><strong>Buy Me a Coffee</strong>: the “Buy me a coffee” link opens buymeacoffee.com, where you can choose to support the project. This website does not load any Buy Me a Coffee script and sends it nothing. If you decide to support, Buy Me a Coffee handles the payment under <a href="https://www.buymeacoffee.com/privacy-policy" rel="noopener">its own privacy policy</a>, and may share with the creator the name and message you choose to leave.</li>
<li><strong>YouTube, Instagram and our blog</strong>: the “Stay connected” boxes on guide pages, at the bottom of the home page, in the footer and in the Parent dashboard are plain links to our NikiBhavi YouTube channel, our Instagram page and blog.msdevbuild.com. No video player, feed, follow button or other script from those sites loads on our pages, and nothing is sent to them until you tap a link; then that site’s own privacy policy applies. These links are meant for parents and grown-ups: the YouTube and Instagram content is for adults, and Instagram requires users to be 13 or older. They never appear inside the children’s lessons, games, stories or certificates.</li>
<li><strong>GitHub Issues</strong> is where you can report bugs and give feedback. Issues are <em>public</em>: your GitHub username and whatever you write can be seen by anyone, and are handled under GitHub's privacy statement. Please do not include personal details, especially about children. For private questions use the ${CONTACT}.</li>
<li><strong>Your browser's text-to-speech voice</strong> reads letters and words aloud. Some voices (for example Microsoft Edge “natural” voices or Google voices) are online services: your browser may send the text being spoken — Tamil letters and words from this site — to that provider. No personal information is part of that text.</li>
</ul>

<h2>Children's privacy</h2>
<p>Learn Tamil is made for children. It never asks a child for personal details. The only personal information it keeps is the certificate record that a <strong>parent or guardian</strong> gives on the website, with their consent (see <a href="#certificates">Certificate records</a>). Anonymous usage statistics are collected only after a parent or teacher allows them, with advertising features off. There are no ads inside the lessons or games, no ad tracking, no chat and no links that ask for personal details; sponsor boxes and links to our YouTube, Instagram and blog appear only in grown-up areas (see <a href="#sponsors">Sponsor boxes</a>). We recommend that young children use the site with a parent or teacher.</p>

<h2>Changes to this policy</h2>
<p>If this policy changes, the new version will be posted on this page with a new “Updated” date.</p>

<h2>Contact</h2>
<p>For any privacy question or request, please use the ${CONTACT}.</p>
`;
write('privacy.html', shell({
  file: 'privacy.html', ogType: 'website',
  title: 'Privacy & Data Policy | Learn Tamil',
  description: 'Learn Tamil has no accounts or ad tracking. See what is stored on your device, the certificate records parents give with consent, and the services used.',
  h1: 'Privacy &amp; data policy', eyebrow: 'Legal', bubble: 'No tracking — promise!', body: privacyBody
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
<p>The site is designed for children. Parents, guardians and teachers are responsible for supervising how children use the internet, including this site. Learn Tamil collects anonymous usage statistics (if allowed) and, on the website, a certificate record that a parent or guardian gives with consent; see the <a href="privacy.html">Privacy &amp; data policy</a>.</p>

<h2>7. Links to other websites and sponsors</h2>
<p>The site may link to other websites (for example the MSDEVBUILD blog or GitHub). Some parents’ guide pages show sponsor boxes marked “Sponsored”; sponsors are responsible for their own products, services and offers (see our <a href="advertise.html#policy">advertising policy</a>). We are not responsible for the content or practices of other websites.</p>

<h2>8. No warranty</h2>
<p>The site is provided “as is” and “as available”, without warranties of any kind, express or implied, including fitness for a particular purpose and uninterrupted or error-free operation.</p>

<h2>9. Limitation of liability</h2>
<p>To the fullest extent permitted by law, the author is not liable for any loss or damage arising from the use of, or inability to use, this free website.</p>

<h2>10. Changes</h2>
<p>These terms may be updated from time to time. The current version is always on this page with its “Updated” date. Continuing to use the site after a change means you accept the updated terms.</p>

<h2>11. Contact</h2>
<p>Questions about these terms can be sent through the ${CONTACT}.</p>
`;
write('terms.html', shell({
  file: 'terms.html', ogType: 'website',
  title: 'Terms & Conditions | Learn Tamil',
  description: 'Terms for using Learn Tamil, a free Tamil alphabet learning website for children: free educational use, MIT licence, accuracy notes, children and liability.',
  h1: 'Terms &amp; conditions', eyebrow: 'Legal', bubble: 'Simple, friendly rules', body: termsBody
}));

/* ---------- 404 ---------- */
write('404.html', shell({
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
  const re = new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(<!-- ${name}:END -->)`, 'g');
  if (!re.test(idx)) throw new Error(`index.html is missing the ${name} markers`);
  idx = idx.replace(re, `$1\n${html}\n$2`);
};
put('FAQ', faqHtml());
// FAQPage markup lives only on tamil-alphabet.html (Google: mark up repeated FAQs once).
put('FAQ-SCHEMA', '');
put('FOOTER', FOOTER);
put('STYLES', styleTags());
put('SCRIPTS', scriptTags([...APP_SCRIPTS, ...SERVICES]));
put('SUPPORT', SUPPORT + '\n' + CONNECT('home') + '\n' + SPONSOR('home'));
put('PRINT-PROMO', `<a class="print-promo" href="tamil-printables.html"><span class="pp-ic" aria-hidden="true">🖨️</span><span><b>Free printables · <span class="ta">அச்சிடும் தாள்கள்</span></b><small>${PRINTS.length} charts, tracing and activity worksheets and colouring pages — print and practise away from the screen.</small></span><span class="pp-go" aria-hidden="true">→</span></a>`);
put('GUIDES', GUIDES.map(g => `<a class="guide-card" href="${g.file}"><span class="gc-ic" aria-hidden="true">${g.ic}</span><b>${g.en}</b><span class="ta">${g.ta}</span></a>`).join(''));
fs.writeFileSync(idxPath, idx);
dateFor('index.html', idx);
/* PDFs: date from their bytes */
for (const d of PRINTS) { const pdf = 'printables/' + d.file + '.pdf';
  try { dateFor(pdf, fs.readFileSync(path.join(ROOT, pdf))); } catch {} }
writeSitemap();
fs.writeFileSync(DATES_FILE, JSON.stringify(Object.fromEntries(Object.entries(DATES).sort()), null, 1) + '\n');

/* ---------- stamp a content hash into sw.js so every change reaches installed apps ---------- */
import('node:crypto').then(({ createHash }) => {
  const swPath = path.join(ROOT, 'sw.js');
  let sw = fs.readFileSync(swPath, 'utf8');
  // PRECACHE = every page + every asset in tools/lib/assets.mjs (one list, never edited by hand).
  const pages = ['index.html', ...GUIDES.map(g => g.file), 'advertise.html', 'privacy.html', 'terms.html'];
  const list = ['./', ...pages, ...PRECACHE_ASSETS];
  sw = sw.replace(/const PRECACHE = \[[\s\S]*?\];/, `const PRECACHE = [\n  ${list.map(f => `'${f}'`).join(',\n  ')}\n];`);
  const h = createHash('sha256');
  for (const f of list.filter(f => f !== './')) h.update(f).update(fs.readFileSync(path.join(ROOT, f)));
  const version = h.digest('hex').slice(0, 10);
  sw = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`);
  fs.writeFileSync(swPath, sw);
  console.log('Service worker version', version);
});

console.log('Built ' + GUIDES.length + ' guide pages, privacy, terms, 404, sitemap.xml, llms.txt and updated index.html');
