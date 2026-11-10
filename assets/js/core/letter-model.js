/* Learn Tamil — core: letter objects built from data/alphabet.js, and word → letter helpers.
   uyir, mei, aytham, uyirmei are what every feature plays, shows and asks about. */
'use strict';

/* ---------- Build letter objects ---------- */
const uyir = VOWELS.map(v=>({
  l:v.l, say:v.l, r:v.r, fam:'uyir', kind:`உயிர் எழுத்து · ${v.len}`, hint:v.hint, ex:v.ex, len:v.len
}));
const mei = CONS.map(k=>({
  l:k.c+PULLI, say:'இ'+k.c+PULLI, r:k.r, fam:'mei', g:k.g,
  kind:`மெய் எழுத்து · ${GROUPS[k.g].ta}`, hint:k.hint, ex:k.ex
}));
const aytham = [{
  l:'ஃ', say:'எஃகு', r:'ḵ', fam:'ay', kind:'ஆய்த எழுத்து · முப்புள்ளி',
  hint:'soft breathy “kh” — heard here in the word எஃகு', ex:['🔩','எஃகு','steel']
}];
const uyirmei = CONS.map((k,ci)=>VOWELS.map(v=>({
  l:k.c+v.s, say:k.c+v.s, r:k.r+v.r, fam:'um', ci, vowel:v, cons:k,
  kind:`${k.c+PULLI} + ${v.l} = ${k.c+v.s} · உயிர்மெய் ${v.len}`,
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
function explain(g){
  if (VOWELS.some(v=>v.l===g)) return 'உயிர்';
  if (g==='ஃ') return 'ஆய்தம்';
  if (g.length===2 && g[1]===PULLI) return 'மெய்';
  const base = g[0], sign = g.slice(1);
  if (CONS.some(k=>k.c===base) && sign in SIGN_TO_VOWEL) return `${base+PULLI} + ${SIGN_TO_VOWEL[sign].l}`;
  return '';
}

/* Letters that sound alike (ந/ன/ண, ல/ள/ழ, ர/ற) share a key, so they are never offered together in Listen. */
const SOUND_GROUP = {'ந':'N','ன':'N','ண':'N','ல':'L','ள':'L','ழ':'L','ர':'R','ற':'R'};
const soundKey = it => it.fam==='uyir' ? 'V'+it.l : (SOUND_GROUP[it.cons.c]||it.cons.c)+it.vowel.l;
