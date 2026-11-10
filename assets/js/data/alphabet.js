/* Learn Tamil — data: the alphabet.
   Every Tamil string here has been checked by hand. Loaded by the app and by tools/lib/load-data.mjs. */

const PULLI = '்'; // ்

// 12 vowels: letter, vowel sign (for உயிர்மெய்), romanisation, length, English hint, example
const VOWELS = [
  {l:'அ', s:'',        r:'a',  len:'குறில்', hint:'“a” as in “about”',        ex:['👩','அம்மா','mother']},
  {l:'ஆ', s:'ா', r:'ā',  len:'நெடில்', hint:'“aa” as in “father”',      ex:['🐐','ஆடு','goat']},
  {l:'இ', s:'ி', r:'i',  len:'குறில்', hint:'“i” as in “sit”',          ex:['🍃','இலை','leaf']},
  {l:'ஈ', s:'ீ', r:'ī',  len:'நெடில்', hint:'“ee” as in “see”',         ex:['🪰','ஈ','housefly']},
  {l:'உ', s:'ு', r:'u',  len:'குறில்', hint:'“u” as in “put”',          ex:['🧂','உப்பு','salt']},
  {l:'ஊ', s:'ூ', r:'ū',  len:'நெடில்', hint:'“oo” as in “food”',        ex:['🪡','ஊசி','needle']},
  {l:'எ', s:'ெ', r:'e',  len:'குறில்', hint:'“e” as in “egg”',          ex:['🐭','எலி','rat']},
  {l:'ஏ', s:'ே', r:'ē',  len:'நெடில்', hint:'long “e”, like “a” in “gate”', ex:['🪜','ஏணி','ladder']},
  {l:'ஐ', s:'ை', r:'ai', len:'நெடில்', hint:'“ai” as in “aisle”',       ex:['✋','ஐந்து','five']},
  {l:'ஒ', s:'ொ', r:'o',  len:'குறில்', hint:'short “o”, as in “omit”',  ex:['🐫','ஒட்டகம்','camel']},
  {l:'ஓ', s:'ோ', r:'ō',  len:'நெடில்', hint:'long “o”, as in “open”',   ex:['⛵','ஓடம்','small boat']},
  {l:'ஔ', s:'ௌ', r:'au', len:'நெடில்', hint:'“au” like “ow” in “cow”',  ex:['👵','ஔவை','Avvaiyar, the poet']}
];

// 18 consonants in standard order: letter, romanisation, group, English hint, example (word contains that மெய்)
const CONS = [
  {c:'க', r:'k',  g:'v', hint:'“k” as in “kite”',                     ex:['👅','நாக்கு','tongue']},
  {c:'ங', r:'ng', g:'m', hint:'“ng” as in “sing”',                    ex:['🦁','சிங்கம்','lion']},
  {c:'ச', r:'ch', g:'v', hint:'“ch” as in “chair”; also “s”',         ex:['🟢','பச்சை','green']},
  {c:'ஞ', r:'ny', g:'m', hint:'“ny” as in “canyon”',                  ex:['🟡','மஞ்சள்','turmeric, yellow']},
  {c:'ட', r:'ṭ',  g:'v', hint:'hard “t”, tongue curled back',          ex:['🪁','பட்டம்','kite']},
  {c:'ண', r:'ṇ',  g:'m', hint:'“n” with the tongue curled back',       ex:['👁️','கண்','eye']},
  {c:'த', r:'th', g:'v', hint:'soft “t”, tongue touching the teeth',   ex:['📖','புத்தகம்','book']},
  {c:'ந', r:'n',  g:'m', hint:'“n”, tongue at the teeth — mostly at the start of a word or before த', ex:['⚽','பந்து','ball']},
  {c:'ப', r:'p',  g:'v', hint:'“p” as in “pen”',                      ex:['👨','அப்பா','father']},
  {c:'ம', r:'m',  g:'m', hint:'“m” as in “man”',                      ex:['🌳','மரம்','tree']},
  {c:'ய', r:'y',  g:'i', hint:'“y” as in “yes”',                      ex:['🐕','நாய்','dog']},
  {c:'ர', r:'r',  g:'i', hint:'soft tapped “r”',                       ex:['💧','நீர்','water']},
  {c:'ல', r:'l',  g:'i', hint:'“l” as in “love”',                     ex:['🦷','பல்','tooth']},
  {c:'வ', r:'v',  g:'i', hint:'“v” as in “van”',                      ex:['🔴','செவ்வாய்','Tuesday; the planet Mars']},
  {c:'ழ', r:'zh', g:'i', hint:'special to Tamil — tongue curled far back, between “r” and “l”', ex:['📜','தமிழ்','Tamil']},
  {c:'ள', r:'ḷ',  g:'i', hint:'“l” with the tongue curled back',       ex:['🦂','தேள்','scorpion']},
  {c:'ற', r:'ṟ',  g:'v', hint:'strong trilled “r”',                    ex:['🌬️','காற்று','wind']},
  {c:'ன', r:'ṉ',  g:'m', hint:'“n”, tongue at the gum — mostly in the middle or end of a word', ex:['🐟','மீன்','fish']}
];
const GROUPS = {
  v:{ta:'வல்லினம்', en:'Hard sounds'},
  m:{ta:'மெல்லினம்', en:'Soft (nasal) sounds'},
  i:{ta:'இடையினம்', en:'Medium sounds'}
};
// More picture words that start with each vowel (Spin wheel). [emoji, word, English meaning]
const VOWEL_WORDS = {
  'அ':[['🐿️','அணில்','squirrel'], ['🍚','அரிசி','rice']],
  'ஆ':[['🦉','ஆந்தை','owl'], ['🌳','ஆலமரம்','banyan tree']],
  'இ':[['🪶','இறகு','feather'], ['❤️','இதயம்','heart']],
  'உ':[['🌍','உலகம்','world'], ['👄','உதடு','lips'], ['🥔','உருளைக்கிழங்கு','potato']],
  'ஊ':[['🏘️','ஊர்','village, town']],
  'எ':[['🐜','எறும்பு','ant'], ['🐃','எருமை','buffalo']],
  'ஏ':[['🏞️','ஏரி','lake']],
  'ஐ':[['🍦','ஐஸ்கிரீம்','ice cream']],
  'ஒ':[['🦒','ஒட்டகச்சிவிங்கி','giraffe']],
  'ஓ':[['🐺','ஓநாய்','wolf'], ['🦎','ஓணான்','garden lizard']],
  'ஔ':[['💊','ஔடதம்','medicine']]
};
const SIGN_TO_VOWEL = Object.fromEntries(VOWELS.map(v=>[v.s,v]));

/* The special letter ஃ (ஆய்த எழுத்து). Read aloud inside a word, because it has no sound on its own. */
const AYTHAM = { l:'ஃ', say:'எஃகு', r:'ḵ', hint:'soft breathy “kh” — heard here in the word எஃகு', ex:['🔩','எஃகு','steel'] };

/* Names shown with a letter. short/long must match the len values in VOWELS. */
const LETTER_LABELS = {
  uyir:'உயிர் எழுத்து', mei:'மெய் எழுத்து', aytham:'ஆய்த எழுத்து · முப்புள்ளி', uyirmei:'உயிர்மெய்',
  short:'குறில்', long:'நெடில்',
  part:{ uyir:'உயிர்', mei:'மெய்', aytham:'ஆய்தம்' }      // under each letter in a word breakdown
};

/* In school a pure consonant is read with a short இ before it: க் is said “ik”. */
const MEI_SAY_PREFIX = 'இ';

/* Letters that sound alike share a key, so Listen & pick never offers them together. */
const SOUND_GROUP = {'ந':'N','ன':'N','ண':'N','ல':'L','ள':'L','ழ':'L','ர':'R','ற':'R'};

/* Big faint letters floating behind the home screen (decoration). */
const FLOATING_LETTERS = ['அ','ஆ','இ','ஈ','உ','க','ங','ச','ஞ','த','ம','ழ','ஃ','கா','மி','பூ'];
