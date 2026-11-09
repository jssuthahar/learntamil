/* Learn Tamil — data. Every Tamil string here has been checked by hand. */
/* =====================================================================
   DATA — every Tamil string below has been checked by hand.
   ===================================================================== */
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
const SIGN_TO_VOWEL = Object.fromEntries(VOWELS.map(v=>[v.s,v]));

/* ---------- Stories: simple written Tamil with English meaning per page ---------- */
const STORIES = [
  {id:'morning', title:'என் காலை', en:'My Morning', cover:'☀️', lvl:'Starter', pages:[
    ['☀️','காலை வந்தது. நான் எழுந்தேன்.','Morning came. I woke up.'],
    ['🪥','நான் பல் துலக்கினேன்.','I brushed my teeth.'],
    ['🥛','அம்மா பால் தந்தார். நான் பால் குடித்தேன்.','Amma gave me milk. I drank the milk.'],
    ['🎒','நான் பையை எடுத்தேன். பள்ளிக்குச் சென்றேன்.','I took my bag. I went to school.'],
    ['🤗','அம்மா, நன்றி! அப்பா, நன்றி!','Thank you, Amma! Thank you, Appa!']
  ]},
  {id:'crow', title:'காகமும் பானையும்', en:'The Thirsty Crow', cover:'🐦', lvl:'Easy', pages:[
    ['🐦☀️','ஒரு காகம் இருந்தது. வெயில் அதிகம். காகத்துக்குத் தாகம் எடுத்தது.','There was a crow. It was very hot. The crow became thirsty.'],
    ['🏺','காகம் ஒரு பானையைப் பார்த்தது. பானையில் கொஞ்சம் தண்ணீர் இருந்தது.','The crow saw a pot. There was a little water in the pot.'],
    ['😟','காகத்தின் அலகு தண்ணீரை எட்டவில்லை.','The crow’s beak could not reach the water.'],
    ['🪨','காகம் யோசித்தது. கற்களைப் பொறுக்கிப் பானையில் போட்டது.','The crow thought. It picked up pebbles and dropped them into the pot.'],
    ['💧😊','தண்ணீர் மேலே வந்தது. காகம் தண்ணீர் குடித்தது!','The water came up. The crow drank the water!'],
    ['💡','முயற்சி செய்தால் வெற்றி கிடைக்கும்.','If you keep trying, you will succeed.']
  ]},
  {id:'lion', title:'சிங்கமும் எலியும்', en:'The Lion and the Mouse', cover:'🦁', lvl:'Easy', pages:[
    ['🦁💤','காட்டில் ஒரு சிங்கம் தூங்கிக்கொண்டிருந்தது.','In the forest, a lion was sleeping.'],
    ['🐭','ஒரு சிறிய எலி சிங்கத்தின் மேல் ஓடியது. சிங்கம் எழுந்தது.','A small mouse ran over the lion. The lion woke up.'],
    ['🦁🐭','சிங்கம் கோபத்துடன் எலியைப் பிடித்தது.','The lion angrily caught the mouse.'],
    ['🙏','“என்னை விட்டுவிடு. நான் உனக்கு உதவுவேன்” என்றது எலி.','“Let me go. I will help you,” said the mouse.'],
    ['😄','சிங்கம் சிரித்தது. எலியை விட்டுவிட்டது.','The lion laughed. It let the mouse go.'],
    ['🕸️','ஒரு நாள் சிங்கம் ஒரு வலையில் மாட்டிக்கொண்டது.','One day, the lion was caught in a net.'],
    ['🐭✂️','எலி ஓடி வந்தது. வலையைக் கடித்து அறுத்தது. சிங்கம் தப்பித்தது!','The mouse came running. It bit through the net. The lion escaped!'],
    ['🤝','சிறியவர்களும் பெரிய உதவி செய்ய முடியும்.','Even the small can give big help.']
  ]},
  {id:'race', title:'முயலும் ஆமையும்', en:'The Hare and the Tortoise', cover:'🐢', lvl:'Medium', pages:[
    ['🐇🐢','முயல் வேகமாக ஓடும். ஆமை மெதுவாக நடக்கும்.','The hare runs fast. The tortoise walks slowly.'],
    ['🏁','“வா, ஓட்டப் பந்தயம் வைப்போம்” என்றது முயல். ஆமையும் சரி என்றது.','“Come, let’s have a race,” said the hare. The tortoise agreed.'],
    ['💨','முயல் வேகமாக ஓடியது. ஆமை மெதுவாகப் பின்னால் வந்தது.','The hare ran fast. The tortoise came slowly behind.'],
    ['🌳😴','“ஆமை வர நேரம் ஆகும்” என்று நினைத்து, முயல் மரத்தடியில் தூங்கியது.','“The tortoise will take a long time,” the hare thought, and slept under a tree.'],
    ['🐢','ஆமை நிற்காமல் நடந்துகொண்டே இருந்தது.','The tortoise kept walking without stopping.'],
    ['🏆','முயல் எழுந்து பார்த்தது. ஆமை முதலில் வந்து வென்றது!','The hare woke up and looked. The tortoise had reached first and won!'],
    ['💡','நிதானமாகத் தொடர்ந்து செய்தால் வெற்றி நிச்சயம்.','Slow and steady wins the race.']
  ]},
  {id:'mango', title:'பாட்டியின் மாம்பழம்', en:'Grandma’s Mango', cover:'🥭', lvl:'Easy', pages:[
    ['👵🌳','பாட்டி வீட்டில் ஒரு மாமரம் இருந்தது.','There was a mango tree at Grandma’s house.'],
    ['🥭','மரத்தில் ஒரு பெரிய மாம்பழம் தொங்கியது.','A big mango hung on the tree.'],
    ['👦👧','அண்ணனும் தங்கையும் அதைப் பார்த்தார்கள்.','Big brother and little sister saw it.'],
    ['🔪','பாட்டி மாம்பழத்தைப் பறித்து இரண்டாக வெட்டினார்.','Grandma picked the mango and cut it in two.'],
    ['😋','“பகிர்ந்து சாப்பிட்டால் இனிமை அதிகம்” என்றார் பாட்டி.','“Food tastes sweeter when we share,” said Grandma.']
  ]}
];

/* ---------- Picture words for Reading and Word builder ----------
   [word, emoji, English meaning]. Level is worked out from the number of letters. */
const WORDS = [
  ['ஆடு','🐐','goat'], ['மான்','🦌','deer'], ['பால்','🥛','milk'], ['மீன்','🐟','fish'],
  ['பூனை','🐈','cat'], ['நாய்','🐕','dog'], ['கண்','👁️','eye'], ['பல்','🦷','tooth'],
  ['இலை','🍃','leaf'], ['எலி','🐭','rat'], ['பசு','🐄','cow'], ['யானை','🐘','elephant'],
  ['கிளி','🦜','parrot'], ['தேன்','🍯','honey'], ['வீடு','🏠','house'], ['நிலா','🌙','moon'],
  ['மழை','🌧️','rain'], ['ஆமை','🐢','tortoise'], ['கோழி','🐔','hen'], ['குடை','☂️','umbrella'],
  ['மணி','🔔','bell'], ['கொடி','🚩','flag'],
  ['மரம்','🌳','tree'], ['பாம்பு','🐍','snake'], ['பந்து','⚽','ball'], ['கடல்','🌊','sea'],
  ['முயல்','🐇','rabbit'], ['தவளை','🐸','frog'], ['மேகம்','☁️','cloud'], ['குதிரை','🐴','horse'],
  ['கரடி','🐻','bear'], ['மயில்','🦚','peacock'], ['வாத்து','🦆','duck'], ['ரொட்டி','🍞','bread'],
  ['தொப்பி','🧢','cap'],
  ['சிங்கம்','🦁','lion'], ['பட்டம்','🪁','kite'], ['கப்பல்','🚢','ship'], ['சூரியன்','☀️','sun'],
  ['குரங்கு','🐒','monkey'], ['தக்காளி','🍅','tomato'], ['மிட்டாய்','🍬','sweet, candy'], ['மாம்பழம்','🥭','mango'],
  ['புத்தகம்','📖','book'], ['ஒட்டகம்','🐫','camel'], ['கடிகாரம்','⏰','clock']
];

/* ---------- Word topics (Reading → Topics, and the topic guide pages) ----------
   [word, emoji, English meaning]. Common, standard words children learn first. */
const TOPICS = [
  { id: 'numbers', ic: '🔢', ta: 'எண்கள்', en: 'Numbers 1–10', words: [
    ['ஒன்று', '1️⃣', 'one · 1 · ௧'], ['இரண்டு', '2️⃣', 'two · 2 · ௨'], ['மூன்று', '3️⃣', 'three · 3 · ௩'], ['நான்கு', '4️⃣', 'four · 4 · ௪'],
    ['ஐந்து', '5️⃣', 'five · 5 · ௫'], ['ஆறு', '6️⃣', 'six · 6 · ௬'], ['ஏழு', '7️⃣', 'seven · 7 · ௭'], ['எட்டு', '8️⃣', 'eight · 8 · ௮'],
    ['ஒன்பது', '9️⃣', 'nine · 9 · ௯'], ['பத்து', '🔟', 'ten · 10 · ௰'] ] },
  { id: 'colours', ic: '🎨', ta: 'நிறங்கள்', en: 'Colours', words: [
    ['சிவப்பு', '🔴', 'red'], ['நீலம்', '🔵', 'blue'], ['பச்சை', '🟢', 'green'], ['மஞ்சள்', '🟡', 'yellow'],
    ['ஆரஞ்சு', '🟠', 'orange'], ['ஊதா', '🟣', 'purple'], ['பழுப்பு', '🟤', 'brown'], ['வெள்ளை', '⚪', 'white'],
    ['கறுப்பு', '⚫', 'black'], ['இளஞ்சிவப்பு', '🌸', 'pink'] ] },
  { id: 'days', ic: '📅', ta: 'கிழமைகள்', en: 'Days of the week', words: [
    ['ஞாயிறு', '☀️', 'Sunday'], ['திங்கள்', '🌙', 'Monday'], ['செவ்வாய்', '📅', 'Tuesday'], ['புதன்', '📅', 'Wednesday'],
    ['வியாழன்', '📅', 'Thursday'], ['வெள்ளி', '📅', 'Friday'], ['சனி', '📅', 'Saturday'] ] },
  { id: 'body', ic: '🧒', ta: 'உடல் உறுப்புகள்', en: 'Parts of the body', words: [
    ['தலை', '👤', 'head'], ['கண்', '👁️', 'eye'], ['காது', '👂', 'ear'], ['மூக்கு', '👃', 'nose'], ['வாய்', '👄', 'mouth'],
    ['பல்', '🦷', 'tooth'], ['முடி', '💇', 'hair'], ['கை', '✋', 'hand'], ['விரல்', '☝️', 'finger'], ['கால்', '🦵', 'leg'] ] },
  { id: 'family', ic: '👨‍👩‍👧', ta: 'குடும்பம்', en: 'Family', words: [
    ['அம்மா', '👩', 'mother'], ['அப்பா', '👨', 'father'], ['அண்ணன்', '👦', 'elder brother'], ['அக்கா', '👧', 'elder sister'],
    ['தம்பி', '👦', 'younger brother'], ['தங்கை', '👧', 'younger sister'], ['தாத்தா', '👴', 'grandfather'], ['பாட்டி', '👵', 'grandmother'] ] },
  { id: 'food', ic: '🍎', ta: 'பழங்களும் உணவும்', en: 'Fruits and food', words: [
    ['மாம்பழம்', '🥭', 'mango'], ['வாழைப்பழம்', '🍌', 'banana'], ['திராட்சை', '🍇', 'grapes'], ['ஆப்பிள்', '🍎', 'apple'],
    ['தர்பூசணி', '🍉', 'watermelon'], ['அன்னாசி', '🍍', 'pineapple'], ['எலுமிச்சை', '🍋', 'lemon'], ['தேங்காய்', '🥥', 'coconut'],
    ['பால்', '🥛', 'milk'], ['சோறு', '🍚', 'cooked rice'], ['முட்டை', '🥚', 'egg'] ] }
];
