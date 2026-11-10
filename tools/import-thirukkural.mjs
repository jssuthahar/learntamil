#!/usr/bin/env node
/*
  Builds assets/js/data/thirukkural.json — the 1,330 Thirukkural couplets, the 133 chapter names
  and G. U. Pope's English verse translation — from public sources, and checks every couplet.
  Run it only when the text itself has to change; the JSON is committed. See docs/THIRUKKURAL.md.

    node tools/import-thirukkural.mjs --tk thirukkural.json --detail detail.json --pm pmuni0001.html [--ws wikisource-dir]

  Sources (download them into an empty folder first):
    --tk      https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json   (Apache-2.0)
              Used for: Line1/Line2 and "couplet" (Pope's 1886 translation, public domain) only.
              Its Tamil commentaries (mv, sp, mk) are modern, copyrighted works and are NOT used.
    --detail  https://raw.githubusercontent.com/tk120404/thirukkural/master/detail.json        (Apache-2.0)
              பால் / இயல் / அதிகாரம் names and Pope's English chapter titles.
    --pm      https://www.projectmadurai.org/pm_etexts/utf8/pmuni0001.html  (Project Madurai, free to distribute)
              Second, independent copy of the couplets.
    --ws      Tamil Wikisource, "திருக்குறள் பரிமேலழகர் உரை/<chapter>" pages saved as 001.txt … 133.txt
              (wikitext). Third witness: every word of every couplet must appear in its chapter page.

  Rules: where --tk and --pm agree (ignoring spaces and punctuation) the --tk text is used. Where they
  differ, the couplet must be listed in CORRECTIONS below with the reading to use and why — otherwise the
  import fails. Nothing here is generated or "fixed" by guesswork: every correction cites its evidence.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/js/data/thirukkural.json');
const arg = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
if (!arg('tk') || !arg('detail') || !arg('pm')) { console.error('Usage: see the comment at the top of this file.'); process.exit(2); }

/* Couplets where the two copies disagree (or share an error). 'pm' / 'tk' = take that copy;
   [line1, line2] = the reading confirmed by Tamil Wikisource (Parimelazhagar edition, split form). */
const CORRECTIONS = {
  27: ['tk', 'PM lost the first half of line 1'],
  34: ['tk', 'spacing only (அனைத்தறன் = அனைத்து + அறன்); WS sandhi form agrees'],
  49: ['tk', 'spacing only'],
  50: ['tk', 'PM typo வான்உநற்யும்'],
  67: ['tk', 'PM dropped ம் (மகற்காற்றும்); WS agrees with TK'],
  79: ['tk', 'PM typo செய்பு ம்'],
  143: ['tk', 'PM has stray code points'],
  153: ['tk', 'PM typo இன்நம்யுள்'],
  154: [['நிறையுடைமை நீங்காமை வேண்டின் பொறையுடைமை', 'போற்றி யொழுகப் படும்.'], 'both wrong (பொற்யுடைமை / பொநற்யுடைமை); WS: பொறையுடைமை'],
  196: ['tk', 'PM typo பராட்டு'],
  254: ['tk', 'PM lost அ; WS poem form: அருளல்ல தியாதெனிற்'],
  288: ['tk', 'PM typo அளவறாந்தார்'],
  330: ['tk', 'spacing only'],
  357: ['tk', 'PM உணரான்; WS: உணரின்'],
  360: [['காமம் வெகுளி மயக்கம் இவைமூன்றன்', 'நாமம் கெடக்கெடும் நோய்.'], 'both wrong (இவ்மூன்றன் / இநவ்முன்றன்); WS: இவை மூன்றன்'],
  479: ['tk', 'PM has an unassigned code point'],
  483: ['pm', 'TK has an unassigned code point'],
  593: ['tk', 'PM lost ஆ (ஆக்கம்)'],
  594: ['tk', 'PM lost ஆ (ஆக்கம்)'],
  599: [['பரியது கூர்ங்கோட்டது ஆயினும் யானை', 'வெரூஉம் புலிதாக் குறின்.'], 'both have an unassigned code point; WS: வெரூஉம்'],
  650: [['இணரூழ்த்தும் நாறா மலரனையர் கற்றது', 'உணர விரித்துரையா தார்.'], 'both wrong (இணருழ்த்தும் / இண்ருழ்த்தும்); WS: இணர் ஊழ்த்தும்'],
  666: ['tk', 'PM dropped வர் (எய்துவர்)'],
  673: ['tk', 'PM typo ஙல்லும்வா'],
  701: ['tk', 'PM நோக்கிக்; WS and TK: நோக்கக்'],
  812: [['உறின்நட்டு அறினொரூஉம் ஒப்பிலார் கேண்மை', 'பெறினும் இழப்பினும் என்?'], 'both wrong (அறினொருஉம் / அறின்ஙருஉம்); WS: ஒரூஉம்'],
  851: ['pm', 'TK has an unassigned code point'],
  895: ['tk', 'spacing only'],
  913: ['pm', 'TK has an unassigned code point'],
  927: ['tk', 'PM has a stray digit'],
  934: ['pm', 'TK typo சீரழக்கும்'],
  957: ['pm', 'TK has an unassigned code point'],
  994: ['tk', 'PM lost ந (நயனொடு)'],
  1117: ['pm', 'TK repeats க்குப்'],
  1118: ['pm', 'TK has an unassigned code point'],
  1192: ['pm', 'TK has an unassigned code point'],
  1202: [['எனைத்தொன்று இனிதேகாண் காமம்தாம் வீழ்வார்', 'நினைப்ப வருவதொன்று இல்.'], 'both wrong (தொனறு, ஏல்); WS: எனைத்து ஒன்று … வருவது ஒன்று இல்'],
  1321: ['pm', 'TK has an unassigned code point']
};
/* Word-level errors found by the Wikisource check (both copies had them). [wrong, right, evidence] — applied after the
   choice above; each "wrong" must be found exactly once, so a fix can never silently miss or double-apply. */
const WORD_FIXES = {
  51: [['மனைக்தக்க', 'மனைத்தக்க', 'WS: மனைத் தக்க']],
  86: [['நல்வருந்து', 'நல்விருந்து', 'WS: னல்விருந்து']],
  90: [['குநழ்யும்', 'குழையும்', 'WS: குழையும்']],
  98: [['சிறுமையுவு', 'சிறுமையுள்', 'WS: சிறுமையுள் நீங்கிய (found by reading; the last-letter allowance hid it)']],
  165: [['வழுக்காயும்', 'வழுக்கியும்', 'WS: வழுக்கியும்']],
  183: [['அறங்கூற்றும்', 'அறங்கூறும்', 'WS: அறங்கூறு மாக்கந்']],
  204: [['அறஞ்சூழம்', 'அறஞ்சூழும்', 'WS: அறஞ்சூழுஞ்']],
  208: [['அஇஉறைந்', 'அடிஉறைந்', 'WS: அடி உறைந்தற்று']],
  214: [['தறவோன்', 'தறிவான்', 'WS: ஒத்த தறிவா னுயிர்வாழ்வான்']],
  253: [['நன்னூக்காது', 'நன்றூக்காது', 'WS: நன்றூக்கா தொன்ற']],
  290: [['உயிர்நிலை கள்வார்க்குத்', 'உயிர்நிலை கள்ளார்க்குத்', 'WS: கள்ளார்க்குத் (those who do not steal) — the line repeated கள்வார்க்குத்'],
        ['ளுளகு', 'ளுலகு', 'WS: புத்தே ளுலகு']],
  298: [['புறள்தூய்மை', 'புறந்தூய்மை', 'WS: புறந்தூய்மை']],
  318: [['தன்னுயிர்ககு ஏன்னாமை', 'தன்னுயிர்க்கு இன்னாமை', 'WS: தன்னுயிர்க் கின்னாமை']],
  387: [['வல்லார்க்குத்', 'வல்லாற்குத்', 'WS: வல்லாற்குத்']],
  408: [['பட் ட', 'பட்ட', 'stray space; WS: பட்ட']],
  412: [['செவுக்குண', 'செவிக்குண', 'WS: செவிக்குண']],
  445: [['சூழ்வாரைக் சூழ்ந்து', 'சூழ்வாரைச் சூழ்ந்து', 'WS: சூழ்வாரைச் சூழ்ந்து (க் cannot come before ச)']],
  469: [['தவுறுண்டு', 'தவறுண்டு', 'WS: தவறுண்']],
  470: [['தம்மோடு', 'தம்மொடு', 'WS: தம்மொடு']],
  477: [['அறவறிந்து', 'அளவறிந்து', 'WS: னளவறிந் தீக']],
  738: [['நாட்டிவ் வைந்து', 'நாட்டிற்கிவ் வைந்து', 'WS: நாட்டிற்கிவ் வைந்து (நாட்டிற்கு இவ் ஐந்து); some modern copies print நாட்டிவ் — flagged for teacher review']],
  784: [['மேற்செனறு', 'மேற்சென்று', 'WS: மேற்சென் றிடித்தற்']],
  855: [['மிக்லூக்கும்', 'மிகலூக்கும்', 'WS: மிகலூக்குந்']],
  858: [['மிக்லூக்கின்', 'மிகலூக்கின்', 'WS: மிகலூக்கி னூக்குமாங்']],
  917: [['தோய்வார்', 'தோய்வர்', 'WS: தோய்வர்']],
  529: [['தமராகிக் தற்றுறந்தார்', 'தமராகித் தற்றுறந்தார்', 'WS: தமராகித் தற்றுறந்தார்']],
  639: [['பக்கததுள்', 'பக்கத்துள்', 'WS: பக்கத்துள்']],
  651: [['த்ருஉம்', 'தரூஉம்', 'WS: தரூஉம்']],
  653: [['ஒஓதல்', 'ஓஒதல்', 'WS: ஓஒதல்']],
  689: [['வாய்சேரா', 'வாய்சோரா', 'WS: வாய்சோரா']],
  711: [['அவையறிநது', 'அவையறிந்து', 'WS: அவை யறிந்தாராய்ந்து']],
  719: [['நன்குசலச்', 'நன்குசெலச்', 'WS: நன்கு செலச்']],
  795: [['வல்லார்நடபு', 'வல்லார்நட்பு', 'WS: வல்லார்நட் பாய்ந்து']],
  901: [['வினைவிழையார்', 'வினைவிழைவார்', 'WS: வினைவிழைவார்']],
  943: [['அறவறிந்து', 'அளவறிந்து', 'WS: லளவறிந் துண்க']],
  1114: [['கண்ணொவ்வேம்', 'கண்ணொவ்வோம்', 'WS: கண்ணொவ்வோ மென்று']],
  1115: [['நுகப்பிற்கு', 'நுசுப்பிற்கு', 'WS: நுசுப்பிற்கு']],
  1126: [['பருகுவரா', 'பருவரார்', 'WS: பருவரார்']],
  1143: [['கெளவை', 'கௌவை', 'ெ + ள typed for the vowel sign ௌ; WS: கௌவை']],
  1147: [['கெளவை', 'கௌவை', 'as 1143']],
  1148: [['கெளவையால்', 'கௌவையால்', 'as 1143']],
  1150: [['கெளவை', 'கௌவை', 'as 1143']],
  1217: [['கனவனால்', 'கனவினால்', 'WS: கனவினான்']]
};
/* Section (இயல்) names misspelt in --detail. */
const IYAL_FIX = { 'படையில்': ['படையியல்', 'missing இ; the section on the army is படையியல், like அரசியல், அமைச்சியல், அரணியல்'] };
/* Couplets that Project Madurai's page does not number in a way the parser can read; TK is checked against WS instead. */
const PM_UNREADABLE = [72, 753, 781, 1293];

const nfc = s => s.normalize('NFC').replace(/\s+/g, ' ').trim();
const bare = s => s.replace(/[\s.,;:!?'"]/g, '');

/* --- read the sources --- */
const tk = JSON.parse(fs.readFileSync(arg('tk'), 'utf8')).kural;
const detail = JSON.parse(fs.readFileSync(arg('detail'), 'utf8'))[0].section.detail;
const pmText = fs.readFileSync(arg('pm'), 'utf8').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '\n')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const pm = {};
{ let prev = null;
  for (const l of pmText.split('\n').map(x => x.trim()).filter(Boolean)) {
    const m = l.match(/^(.*?\S)\s+(\d{1,4})$/);
    if (m && prev && /[஀-௿]/.test(m[1])) { const n = +m[2]; if (n >= 1 && n <= 1330 && !pm[n]) pm[n] = [prev, m[1]]; }
    prev = l;
  } }

/* --- choose each couplet --- */
const problems = [], used = new Set();
const kurals = tk.map(k => {
  const n = k.Number, t = [nfc(k.Line1), nfc(k.Line2)], p = pm[n] && pm[n].map(nfc);
  const fix = CORRECTIONS[n];
  let lines;
  if (fix) { used.add(n); lines = Array.isArray(fix[0]) ? fix[0].map(nfc) : fix[0] === 'pm' ? p : t; }
  else if (!p) { if (!PM_UNREADABLE.includes(n)) problems.push(`${n}: missing from Project Madurai`); lines = t; }
  else if (bare(t.join('')) !== bare(p.join(''))) { problems.push(`${n}: sources differ and no correction is listed\n   TK: ${t.join(' / ')}\n   PM: ${p.join(' / ')}`); lines = t; }
  else lines = t;
  for (const [wrong, right] of WORD_FIXES[n] || []) {
    const i = lines.findIndex(l => l.includes(wrong));
    if (i < 0 || lines.join('\n').split(wrong).length !== 2) problems.push(`${n}: word fix "${wrong}" does not match exactly once`);
    else lines = lines.map((l, j) => j === i ? l.replace(wrong, right) : l);
  }
  for (const ch of lines.join(''))
    if (/[஀-௿]/.test(ch) && !/[ஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௗ]/.test(ch))
      problems.push(`${n}: unassigned or unexpected Tamil code point U+${ch.codePointAt(0).toString(16)}`);
  if (/[^஀-௿ .,;:!?'"]/.test(lines.join(''))) problems.push(`${n}: unexpected characters in ${lines.join(' / ')}`);
  return [lines[0], lines[1], nfc(k.couplet)];
});
for (const n of Object.keys(CORRECTIONS)) if (!used.has(+n)) problems.push(`${n}: correction listed but not used`);
if (kurals.length !== 1330) problems.push(`expected 1330 couplets, got ${kurals.length}`);

/* --- chapters, இயல், பால் --- */
const paal = [], iyal = [], ch = [];
for (const p of detail) {
  const first = ch.length + 1;
  for (const g of p.chapterGroup.detail) {
    const from = ch.length + 1;
    for (const c of g.chapters.detail) {
      if (c.number !== ch.length + 1 || c.start !== c.number * 10 - 9 || c.end !== c.number * 10) problems.push(`chapter ${c.number}: unexpected numbering`);
      ch.push([nfc(c.name), nfc(c.translation), nfc(c.transliteration)]);
    }
    const name = nfc(g.name);
    iyal.push([IYAL_FIX[name] ? IYAL_FIX[name][0] : name, nfc(g.translation), from, ch.length]);
  }
  paal.push([nfc(p.name), nfc(p.translation), first, ch.length]);
}
if (ch.length !== 133) problems.push(`expected 133 chapters, got ${ch.length}`);
if (paal.map(p => p[3] - p[2] + 1).join() !== '38,70,25') problems.push('பால் sizes are not 38, 70, 25');

/* --- third witness: Tamil Wikisource --- */
if (arg('ws')) {
  const MARK = 'ஂா-்ௗ';
  const graphemes = w => w.match(new RegExp(`[^${MARK}][${MARK}]*`, 'gu')) || [];
  const page = c => { const f = path.join(arg('ws'), String(c).padStart(3, '0') + '.txt');
    return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').normalize('NFC').replace(/<[^>]+>|\{\{[^}]*\}\}|'''|\[\[|\]\]/g, ' ').replace(/[^஀-௿]/g, '') : null; };
  // Sandhi can change a word's first letter (இ → யி) and its last (ம் → ம), so those two may differ; the rest must match exactly.
  const found = (w, pg) => { const g = graphemes(w);
    for (const [from, to] of [[0, g.length], [0, g.length - 1], [1, g.length], [1, g.length - 1]]) { if (to - from < 2) continue;
      const re = (from ? '' : '') + g.slice(from, to).join('').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + `(?![${MARK}])`;
      if (new RegExp(re, 'u').test(pg)) return true; }
    return false; };
  const ACCEPTED = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/thirukkural-ws-accepted.json'), 'utf8'));
  let missingPages = 0;
  kurals.forEach(([l1, l2], i) => {
    const n = i + 1, pg = page(Math.ceil(n / 10));
    if (!pg) { missingPages++; return; }
    const bad = `${l1} ${l2}`.split(' ').map(w => w.replace(/[^஀-௿]/g, '')).filter(w => w && graphemes(w).length > 2 && !found(w, pg));   // 1–2 letter words (தீ, ஆறு) are too short to check
    const ok = (ACCEPTED[n] || {}).words || [];
    const left = bad.filter(w => !ok.includes(w));
    if (left.length) problems.push(`${n}: not found in Wikisource chapter ${Math.ceil(n / 10)}: ${left.join(', ')}  (${l1} / ${l2})`);
  });
  if (missingPages) problems.push(`${missingPages} couplets could not be checked: Wikisource pages missing`);
}

if (problems.length) { console.error(problems.join('\n')); console.error(`\n${problems.length} problem(s); thirukkural.json was not written.`); process.exit(1); }

const json = `{"about":"Thirukkural (திருக்குறள்) by Thiruvalluvar: 1,330 couplets in 133 chapters. Tamil text checked against Project Madurai, the tk120404/thirukkural dataset (Apache-2.0) and Tamil Wikisource; English verse translation by Rev. G. U. Pope (1886, public domain). Built by tools/import-thirukkural.mjs; see docs/THIRUKKURAL.md.",
"paal":${JSON.stringify(paal)},
"iyal":${JSON.stringify(iyal)},
"ch":[
${ch.map(c => JSON.stringify(c)).join(',\n')}
],
"k":[
${kurals.map(k => JSON.stringify(k)).join(',\n')}
]}
`;
fs.writeFileSync(OUT, json);
console.log(`Wrote ${path.relative(ROOT, OUT)}: ${kurals.length} couplets, ${ch.length} chapters, ${Object.keys(CORRECTIONS).length} resolved differences.`);
