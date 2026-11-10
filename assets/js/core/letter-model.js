/* Learn Tamil — core: letter objects built from data/alphabet.js, and word → letter helpers.
   uyir, mei, aytham, uyirmei are what every feature plays, shows and asks about. */
'use strict';

/* ---------- Build letter objects ---------- */
const uyir = VOWELS.map(v=>({
  l:v.l, say:v.l, r:v.r, fam:'uyir', kind:`${LETTER_LABELS.uyir} · ${v.len}`, hint:v.hint, ex:v.ex, len:v.len
}));
const mei = CONS.map(k=>({
  l:k.c+PULLI, say:MEI_SAY_PREFIX+k.c+PULLI, r:k.r, fam:'mei', g:k.g,
  kind:`${LETTER_LABELS.mei} · ${GROUPS[k.g].ta}`, hint:k.hint, ex:k.ex
}));
const aytham = [{ ...AYTHAM, fam:'ay', kind:LETTER_LABELS.aytham }];
const uyirmei = CONS.map((k,ci)=>VOWELS.map(v=>({
  l:k.c+v.s, say:k.c+v.s, r:k.r+v.r, fam:'um', ci, vowel:v, cons:k,
  kind:`${k.c+PULLI} + ${v.l} = ${k.c+v.s} · ${LETTER_LABELS.uyirmei} ${v.len}`,
  hint:`${k.r} + ${v.r}`, ex:null
})));

/* Split a word into Tamil letters (graphemes) and explain each one. */
const seg = (typeof Intl!=='undefined' && Intl.Segmenter) ? new Intl.Segmenter('ta',{granularity:'grapheme'}) : null;
const tamilOnly = w => w.normalize('NFC').replace(/[^஀-௿]/g,'');
function lettersOf(word){
  const clean = tamilOnly(word);
  if (seg) return [...seg.segment(clean)].map(s=>s.segment);
  return clean.match(/[ஃ-ஹ][ா-்ௗ]*/g) || [];
}
/* What to say for one letter: a pure consonant is read with இ before it (data/alphabet.js). */
const spokenForm = l => l.endsWith(PULLI) ? MEI_SAY_PREFIX + l : l;

function explain(g){
  if (VOWELS.some(v=>v.l===g)) return LETTER_LABELS.part.uyir;
  if (g===AYTHAM.l) return LETTER_LABELS.part.aytham;
  if (g.length===2 && g[1]===PULLI) return LETTER_LABELS.part.mei;
  const base = g[0], sign = g.slice(1);
  if (CONS.some(k=>k.c===base) && sign in SIGN_TO_VOWEL) return `${base+PULLI} + ${SIGN_TO_VOWEL[sign].l}`;
  return '';
}

/* Letters that sound alike (SOUND_GROUP, data/alphabet.js) are never offered together in Listen. */
const soundKey = it => it.fam==='uyir' ? 'V'+it.l : (SOUND_GROUP[it.cons.c]||it.cons.c)+it.vowel.l;
