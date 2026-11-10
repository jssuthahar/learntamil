/* Learn Tamil — data: Thirukkural (திருக்குறள்) lessons for children.
   The 1,330 original couplets, chapter names and G. U. Pope's English verse translation live in
   assets/js/data/thirukkural.json (verified against two sources; see docs/THIRUKKURAL.md). It is
   fetched when the Thirukkural section opens, so it never slows down the letters app.

   This file holds what we write ourselves for children, Kural by Kural:
     words  — word-by-word meaning: [word, simple Tamil, English]
     ta, en — the meaning in simple Tamil and simple English (simplified, never changed)
     life   — how a child can use it today: [Tamil, English]
     scene  — the animated story: 3–5 frames, each { bg, cap: [Tamil, English], a: actors, board }
              actor = [emoji, x %, y %, size px, motion]   motions: see .ks-* in assets/css/84-kural.css
              bg: class | sky | sea | night | garden | path | home
     quiz   — 2–3 questions: [question Tamil, question English, [[option Tamil, option English] …], index of the right one]
     review — 'draft' until a Tamil teacher has checked it, then 'reviewed'.
   A Kural without an entry here still shows its original text, Pope's translation, audio and games.
   Add new lessons in Kural order; every new Tamil string needs a Tamil teacher's review. */

/* The three பால் (divisions). Counts are facts of the text: 38 + 70 + 25 chapters, 380 + 700 + 250 Kurals. */
const KURAL_PAALS = [
  { id: 1, ic: '🌱', ta: 'அறத்துப்பால்', en: 'Virtue', roman: 'Arathuppaal', from: 1, to: 38,
    intro: ['நல்ல பழக்கங்கள், அன்பு, உண்மை, ஒழுக்கம் பற்றிச் சொல்லும் பகுதி.', 'How to be good: kindness, truth, good habits and caring for family and guests.'] },
  { id: 2, ic: '🏛️', ta: 'பொருட்பால்', en: 'Wealth and Society', roman: 'Porutpaal', from: 39, to: 108,
    intro: ['கல்வி, நட்பு, உழைப்பு, நல்ல தலைவர் பற்றிச் சொல்லும் பகுதி.', 'Learning, friendship, hard work, good leaders and living well with others.'] },
  { id: 3, ic: '💞', ta: 'காமத்துப்பால்', en: 'Love', roman: 'Kaamathuppaal', from: 109, to: 133, older: true,
    intro: ['அன்பும் உணர்வுகளும் பற்றிய பகுதி. பெரியவர்களுடன் சேர்ந்து படிக்கலாம்.', 'Love and feelings between two people. Best read with a grown-up, for older children.'] }
];

/* Certificate levels 🎓 (#/certificate): each covers whole chapters, so a child knows what to study.
   Level n unlocks after level n − 1 is passed. 10 questions, pass with 8; the last level asks 15, pass with 12.
   Questions are made from the verified text (missing word, next line, which chapter); see features/kural/kural-cert.js. */
const KURAL_LEVELS = [
  { n: 1, ic: '🌱', ta: 'விதை', en: 'Seed', from: 1, to: 10 },
  { n: 2, ic: '🌿', ta: 'முளை', en: 'Sprout', from: 11, to: 40 },
  { n: 3, ic: '🍀', ta: 'தளிர்', en: 'Shoot', from: 41, to: 100 },
  { n: 4, ic: '🪴', ta: 'செடி', en: 'Plant', from: 101, to: 200 },
  { n: 5, ic: '🌳', ta: 'மரம்', en: 'Tree', from: 201, to: 380 },          // finishes அறத்துப்பால்
  { n: 6, ic: '🌼', ta: 'மலர்', en: 'Flower', from: 381, to: 500 },
  { n: 7, ic: '🍏', ta: 'காய்', en: 'Green fruit', from: 501, to: 700 },
  { n: 8, ic: '🥭', ta: 'கனி', en: 'Ripe fruit', from: 701, to: 900 },
  { n: 9, ic: '🏞️', ta: 'சோலை', en: 'Grove', from: 901, to: 1080 },       // finishes பொருட்பால்
  { n: 10, ic: '👑', ta: 'குறள் வேந்தர்', en: 'Kural champion', from: 1, to: 1080, total: 15, pass: 12 }
];

/* A picture for each chapter that has lessons (shown on the "Start here" cards). */
const KURAL_CH_ICONS = { 1: '🔤', 10: '🍯', 40: '📚' };

const KURAL_LESSONS = {
  /* ---------- Chapter 1 · கடவுள் வாழ்த்து · The Praise of God ---------- */
  1: {
    words: [
      ['அகர', 'அ என்ற எழுத்து', 'the letter அ (a)'],
      ['முதல', 'முதலாகக் கொண்டவை', 'begin with'],
      ['எழுத்தெல்லாம்', 'எல்லா எழுத்துகளும்', 'all letters'],
      ['ஆதி பகவன்', 'முதல்வனாகிய கடவுள்', 'God, the First One'],
      ['முதற்றே', 'முதலாகக் கொண்டது', 'has as its beginning'],
      ['உலகு', 'உலகம்', 'the world']
    ],
    ta: 'எல்லா எழுத்துகளும் அ என்ற எழுத்தில் தொடங்குகின்றன. அதுபோல இந்த உலகம் கடவுளை முதலாகக் கொண்டிருக்கிறது.',
    en: 'All letters begin with அ (a). In the same way, the whole world begins with God, the First One.',
    // ஆதி பகவன் is read in more than one way; say so, kindly and briefly (a Tamil teacher should review the Tamil).
    note: ['‘ஆதி பகவன்’ என்பதற்குப் பரிமேலழகர் முதலிய உரையாசிரியர்கள் ‘முதல்வனாகிய இறைவன்’ என்று பொருள் கூறுகின்றனர். வேறு விளக்கங்களும் உண்டு; எல்லாவற்றுக்கும் ஒரு முதல் உண்டு என்பதே கருத்து.',
           'Traditional commentators such as Parimelazhagar read ஆதி பகவன் (Aadhi Bhagavan) as “God, the First One”. Other readings exist; the shared idea is that everything has a first source.'],
    life: ['நாம் தமிழ் படிக்கும்போது அ-வில் தொடங்குகிறோம். எதைச் செய்தாலும் நல்ல தொடக்கமும் நல்ல எண்ணமும் முக்கியம்.',
           'We start learning Tamil with அ. Whatever we do, a good beginning and good thoughts matter most.'],
    scene: [
      { bg: 'class', cap: ['ஒரு குழந்தை வகுப்புக்கு வருகிறது.', 'A child walks into the classroom.'],
        a: [['🧒', 12, 62, 64, 'walk'], ['👩‍🏫', 78, 58, 72, 'in']] },
      { bg: 'class', cap: ['ஆசிரியர் பலகையில் “அ” என்று எழுதுகிறார்.', 'The teacher writes அ on the board.'],
        board: 'அ', a: [['👩‍🏫', 80, 58, 72, 'bob'], ['🧒', 22, 66, 60, 'look']] },
      { bg: 'class', cap: ['எல்லா எழுத்துகளும் அ-வில் தொடங்குகின்றன.', 'All the letters begin with அ.'],
        board: 'அ ஆ இ ஈ உ ஊ', a: [['🧒', 22, 66, 60, 'hop'], ['✨', 50, 22, 40, 'twinkle']] },
      { bg: 'sky', cap: ['அதுபோல, உலகம் கடவுளில் தொடங்குகிறது.', 'In the same way, the world begins with God.'],
        a: [['🌍', 50, 52, 110, 'spin'], ['☀️', 50, 16, 56, 'shine'], ['✨', 24, 30, 34, 'twinkle'], ['✨', 76, 34, 34, 'twinkle']] }
    ],
    quiz: [
      ['தமிழின் முதல் எழுத்து எது?', 'What is the first letter of Tamil?', [['அ', 'a'], ['க', 'ka'], ['ம', 'ma']], 0],
      ['இந்தக் குறள் எதை அ-வுடன் ஒப்பிடுகிறது?', 'This Kural compares அ with…', [['கடவுள், உலகின் முதல்வன்', 'God, the First One of the world'], ['ஒரு பெரிய மரம்', 'a big tree'], ['ஒரு நதி', 'a river']], 0],
      ['இந்தக் குறள் எந்த அதிகாரத்தில் உள்ளது?', 'Which chapter is this Kural in?', [['கடவுள் வாழ்த்து', 'The Praise of God'], ['வான்சிறப்பு', 'The Blessing of Rain'], ['கல்வி', 'Learning']], 0]
    ],
    review: 'draft'
  },
  2: {
    words: [
      ['கற்றதனால்', 'படித்ததால்', 'by learning'],
      ['ஆய பயன்', 'கிடைத்த பயன்', 'the benefit gained'],
      ['என்கொல்', 'என்ன?', 'what is it?'],
      ['வாலறிவன்', 'தூய அறிவு உடைய கடவுள்', 'God of pure knowledge'],
      ['நற்றாள்', 'நல்ல திருவடிகள்', 'good holy feet'],
      ['தொழாஅர் எனின்', 'வணங்காவிட்டால்', 'if they do not bow to']
    ],
    ta: 'தூய அறிவு உடைய கடவுளின் திருவடிகளை வணங்காவிட்டால், நிறையப் படித்தும் என்ன பயன்?',
    en: 'If we do not bow to God, the One of pure knowledge, what is the use of all our learning?',
    life: ['நிறையப் படித்தாலும் பணிவாக இருக்க வேண்டும். நமக்குக் கற்றுத் தருபவர்களை மதிக்க வேண்டும்.',
           'Even when we learn a lot, we should stay humble and respect those who teach us.'],
    scene: [
      { bg: 'home', cap: ['ஒரு குழந்தை நிறையப் புத்தகங்கள் படிக்கிறது.', 'A child reads many, many books.'],
        a: [['🧒', 30, 62, 64, 'bob'], ['📚', 62, 64, 58, 'grow'], ['📖', 46, 40, 40, 'float']] },
      { bg: 'home', cap: ['படித்து முடித்ததும் பெருமை வருகிறது.', 'After all that reading, the child feels very proud.'],
        a: [['🧒', 40, 60, 70, 'hop'], ['🎓', 40, 30, 46, 'in']] },
      { bg: 'sky', cap: ['ஆனால் அறிவின் மூலத்தை வணங்கும்போதுதான் கல்வி முழுமை பெறுகிறது.', 'Learning is complete only when we bow to the source of all knowledge.'],
        a: [['🙏', 50, 58, 80, 'bow'], ['✨', 30, 26, 36, 'twinkle'], ['✨', 70, 24, 36, 'twinkle'], ['☀️', 50, 16, 50, 'shine']] }
    ],
    quiz: [
      ['“வாலறிவன்” என்றால் யார்?', 'Who is “Vaalarivan”?', [['தூய அறிவு உடைய கடவுள்', 'God of pure knowledge'], ['ஒரு மாணவன்', 'a student'], ['ஒரு அரசன்', 'a king']], 0],
      ['இந்தக் குறள் சொல்லும் பாடம் எது?', 'What does this Kural teach?', [['படித்தாலும் பணிவு வேண்டும்', 'Stay humble even when we learn a lot'], ['படிக்கவே வேண்டாம்', 'Do not study'], ['வேகமாக ஓடு', 'Run fast']], 0]
    ],
    review: 'draft'
  },
  3: {
    words: [
      ['மலர்மிசை', 'மலரின் மேல்', 'on a flower'],
      ['ஏகினான்', 'சென்றவன் (கடவுள்)', 'the One who went (God)'],
      ['மாணடி', 'பெருமை உடைய திருவடி', 'glorious feet'],
      ['சேர்ந்தார்', 'அடைந்தவர்கள்', 'those who reach'],
      ['நிலமிசை', 'இந்த உலகில்', 'on this earth'],
      ['நீடுவாழ்வார்', 'நீண்ட காலம் வாழ்வார்கள்', 'will live long']
    ],
    ta: 'மலர் போன்ற மனத்தில் வாழும் கடவுளின் திருவடிகளை அடைந்தவர்கள் இந்த உலகில் நீண்ட காலம் நன்றாக வாழ்வார்கள்.',
    en: 'Those who reach the glorious feet of God, who lives in the flower of the heart, will live long and well on this earth.',
    life: ['நம் மனத்தை ஒரு மலர் போல மென்மையாகவும் தூய்மையாகவும் வைத்துக்கொள்வோம்.',
           'Let us keep our heart soft and clean, like a flower.'],
    scene: [
      { bg: 'garden', cap: ['ஒரு அழகான தாமரை மலர் விரிகிறது.', 'A beautiful lotus flower opens.'],
        a: [['🪷', 50, 60, 100, 'grow'], ['🦋', 24, 34, 36, 'float']] },
      { bg: 'garden', cap: ['மலர் போன்ற தூய மனத்தில் கடவுள் இருக்கிறார்.', 'God lives in a heart that is pure like a flower.'],
        a: [['🪷', 50, 60, 100, 'bob'], ['✨', 50, 34, 44, 'twinkle'], ['💛', 50, 46, 40, 'shine']] },
      { bg: 'garden', cap: ['அவரை அடைந்தவர்கள் நீண்ட காலம் மகிழ்ச்சியாக வாழ்வார்கள்.', 'Those who reach Him live long and happily.'],
        a: [['👵', 32, 60, 70, 'bob'], ['👴', 58, 60, 70, 'bob'], ['🌳', 82, 54, 90, 'grow'], ['🌞', 16, 18, 46, 'shine']] }
    ],
    quiz: [
      ['“நீடுவாழ்வார்” என்றால்?', 'What does “needuvaazhvaar” mean?', [['நீண்ட காலம் வாழ்வார்கள்', 'they will live long'], ['வேகமாக ஓடுவார்கள்', 'they will run fast'], ['தூங்குவார்கள்', 'they will sleep']], 0],
      ['இந்தக் குறளில் வரும் மலர் எதைக் குறிக்கிறது?', 'In this Kural the flower stands for…', [['தூய மனம்', 'a pure heart'], ['ஒரு தோட்டம்', 'a garden'], ['ஒரு பரிசு', 'a present']], 0]
    ],
    review: 'draft'
  },
  4: {
    words: [
      ['வேண்டுதல்', 'விருப்பம்', 'liking'],
      ['வேண்டாமை', 'வெறுப்பு', 'disliking'],
      ['இலான்', 'இல்லாதவன் (கடவுள்)', 'the One who has none (God)'],
      ['அடிசேர்ந்தார்க்கு', 'திருவடியை அடைந்தவர்களுக்கு', 'for those who reach His feet'],
      ['யாண்டும்', 'எப்போதும்', 'ever, at any time'],
      ['இடும்பை இல', 'துன்பம் இல்லை', 'there is no suffering']
    ],
    ta: 'விருப்பும் வெறுப்பும் இல்லாத கடவுளின் திருவடிகளை அடைந்தவர்களுக்கு எப்போதும் துன்பம் இல்லை.',
    en: 'God has no likes or dislikes. Those who reach His feet will never have sorrow.',
    life: ['சூரியன் எல்லோருக்கும் ஒரே மாதிரி ஒளி தருகிறது. நாமும் எல்லோரிடமும் சமமாக அன்பு காட்டுவோம்.',
           'The sun shines the same for everyone. Let us also be equally kind to everyone.'],
    scene: [
      { bg: 'sky', cap: ['சூரியன் எல்லோருக்கும் ஒரே மாதிரி ஒளி தருகிறது.', 'The sun shines the same for everyone.'],
        a: [['☀️', 50, 18, 70, 'shine'], ['🏠', 18, 66, 56, 'in'], ['🌳', 50, 64, 64, 'in'], ['🐄', 82, 68, 52, 'in']] },
      { bg: 'sky', cap: ['கடவுளுக்கும் விருப்பும் வெறுப்பும் இல்லை.', 'God, too, has no likes or dislikes.'],
        a: [['☀️', 50, 18, 70, 'shine'], ['👧', 30, 64, 60, 'bob'], ['👦', 50, 64, 60, 'bob'], ['🧓', 70, 64, 60, 'bob']] },
      { bg: 'sky', cap: ['அவரை அடைந்தவர்களுக்குத் துன்பம் இல்லை.', 'Those who reach Him have no sorrow.'],
        a: [['🌧️', 50, 20, 60, 'away'], ['🌈', 50, 30, 90, 'in'], ['😊', 50, 62, 72, 'hop']] }
    ],
    quiz: [
      ['“இடும்பை” என்றால் என்ன?', 'What does “idumbai” mean?', [['துன்பம்', 'sorrow, trouble'], ['மகிழ்ச்சி', 'happiness'], ['மழை', 'rain']], 0],
      ['இந்தக் குறளைப் புரிந்துகொள்ள உதவும் படம் எது?', 'Which picture helps explain this Kural?', [['எல்லோருக்கும் ஒளி தரும் சூரியன்', 'the sun shining on everyone'], ['உடைந்த பொம்மை', 'a broken toy'], ['ஓடும் ரயில்', 'a running train']], 0]
    ],
    review: 'draft'
  },
  5: {
    words: [
      ['இருள்சேர்', 'அறியாமையால் வரும்', 'born of darkness (not knowing)'],
      ['இருவினையும்', 'நல்வினை, தீவினை இரண்டும்', 'both kinds of deeds, good and bad'],
      ['சேரா', 'சேராது', 'will not cling'],
      ['இறைவன்', 'கடவுள்', 'God'],
      ['பொருள்சேர் புகழ்', 'உண்மையான புகழ்', 'true glory'],
      ['புரிந்தார் மாட்டு', 'போற்றுபவர்களிடம்', 'to those who praise']
    ],
    ta: 'கடவுளின் உண்மையான புகழைப் போற்றுபவர்களிடம், அறியாமையால் வரும் இரண்டு வகை வினைகளும் சேராது.',
    en: 'The two kinds of deeds that come from darkness (not knowing) do not cling to those who praise the true glory of God.',
    life: ['இருட்டில் விளக்கு ஏற்றினால் இருள் போகிறது. நல்ல எண்ணங்கள் நம் மனத்தில் வெளிச்சம் தருகின்றன.',
           'When we light a lamp, the darkness goes. Good thoughts bring light to our mind.'],
    scene: [
      { bg: 'night', cap: ['இருட்டில் இரண்டு மேகங்கள் வருகின்றன.', 'Two clouds come out of the darkness.'],
        a: [['☁️', 30, 30, 64, 'drift'], ['☁️', 70, 34, 64, 'drift'], ['🧒', 50, 66, 64, 'look']] },
      { bg: 'night', cap: ['குழந்தை கடவுளைப் போற்றிப் பாடுகிறது.', 'The child sings in praise of God.'],
        a: [['🧒', 50, 66, 64, 'bob'], ['🎶', 66, 50, 40, 'float'], ['🪔', 30, 68, 50, 'shine']] },
      { bg: 'sky', cap: ['வெளிச்சம் வந்ததும் மேகங்கள் அருகில் வருவதில்லை.', 'In the light, the clouds cannot come near.'],
        a: [['☁️', 10, 30, 50, 'away'], ['☁️', 90, 30, 50, 'away'], ['🧒', 50, 64, 64, 'hop'], ['☀️', 50, 18, 60, 'shine']] }
    ],
    quiz: [
      ['“இருவினை” என்பது எவை?', 'What are the “two deeds”?', [['நல்வினை, தீவினை', 'good deeds and bad deeds'], ['இரண்டு விளையாட்டுகள்', 'two games'], ['இரண்டு நாள்கள்', 'two days']], 0],
      ['“இருள்” என்ற சொல்லின் பொருள்?', 'What does “irul” mean?', [['இருட்டு', 'darkness'], ['ஒளி', 'light'], ['நீர்', 'water']], 0]
    ],
    review: 'draft'
  },
  6: {
    words: [
      ['பொறிவாயில் ஐந்து', 'ஐந்து புலன்கள் (கண், காது, மூக்கு, வாய், உடல்)', 'the five senses (eyes, ears, nose, mouth, skin)'],
      ['அவித்தான்', 'அடக்கியவன் (கடவுள்)', 'the One who controlled them (God)'],
      ['பொய்தீர்', 'பொய் இல்லாத', 'free of falsehood'],
      ['ஒழுக்க நெறி', 'நல்ல வாழ்க்கை வழி', 'the path of good conduct'],
      ['நின்றார்', 'பின்பற்றியவர்கள்', 'those who stay on it'],
      ['நீடுவாழ்வார்', 'நீண்ட காலம் வாழ்வார்கள்', 'will live long']
    ],
    ta: 'ஐந்து புலன்களையும் அடக்கிய கடவுள் காட்டிய பொய் இல்லாத நல்ல வழியில் நடப்பவர்கள் நீண்ட காலம் வாழ்வார்கள்.',
    en: 'God controlled all five senses. Those who walk on the true, good path He showed will live long.',
    life: ['பார்ப்பது, கேட்பது, சாப்பிடுவது எல்லாவற்றிலும் அளவோடு இருப்போம். அதிக இனிப்பு, அதிகத் திரைநேரம் வேண்டாம்!',
           'Let us keep a limit on what we watch, hear and eat. Not too many sweets, not too much screen time!'],
    scene: [
      { bg: 'garden', cap: ['நமக்கு ஐந்து புலன்கள் உள்ளன.', 'We have five senses.'],
        a: [['👁️', 14, 50, 48, 'in'], ['👂', 32, 50, 48, 'in'], ['👃', 50, 50, 48, 'in'], ['👅', 68, 50, 48, 'in'], ['✋', 86, 50, 48, 'in']] },
      { bg: 'garden', cap: ['அவற்றை அடக்கினால் மனம் அமைதியாகிறது.', 'When we control them, the mind becomes calm.'],
        a: [['🧘', 50, 58, 90, 'bob'], ['🍃', 20, 30, 36, 'drift'], ['🍃', 80, 26, 36, 'drift']] },
      { bg: 'path', cap: ['பொய் இல்லாத நல்ல வழியில் நடப்பவர் நீண்ட காலம் வாழ்வார்.', 'Those who walk the true path live long.'],
        a: [['🚶', 20, 62, 64, 'walk'], ['🌳', 70, 52, 80, 'grow'], ['🌞', 86, 18, 46, 'shine']] }
    ],
    quiz: [
      ['நமக்கு எத்தனை புலன்கள் உள்ளன?', 'How many senses do we have?', [['ஐந்து', 'five'], ['மூன்று', 'three'], ['பத்து', 'ten']], 0],
      ['“பொய்தீர்” என்றால்?', 'What does “poytheer” mean?', [['பொய் இல்லாத', 'free of lies'], ['பெரிய', 'big'], ['வேகமான', 'fast']], 0]
    ],
    review: 'draft'
  },
  7: {
    words: [
      ['தனக்குவமை', 'தனக்கு ஒப்பு', 'someone equal to Him'],
      ['இல்லாதான்', 'இல்லாதவன் (கடவுள்)', 'the One who has none (God)'],
      ['தாள்சேர்ந்தார்க்கு அல்லால்', 'திருவடி அடைந்தவர்களைத் தவிர', 'except for those who reach His feet'],
      ['மனக்கவலை', 'மனத்தில் உள்ள கவலை', 'worry in the mind'],
      ['மாற்றல்', 'போக்குவது', 'to remove'],
      ['அரிது', 'கடினம்', 'is hard']
    ],
    ta: 'தனக்கு ஒப்பு இல்லாத கடவுளின் திருவடிகளை அடைந்தவர்களைத் தவிர, மற்றவர்களுக்கு மனக்கவலையைப் போக்குவது கடினம்.',
    en: 'God has no equal. Only those who reach His feet can easily remove the worry in their mind; for others it is hard.',
    life: ['கவலையாக இருக்கும்போது அமைதியாக அமர்ந்து வேண்டிக்கொள்ளலாம், அல்லது அம்மா அப்பாவிடம் சொல்லலாம்.',
           'When you feel worried, you can sit quietly and pray, or tell Amma and Appa about it.'],
    scene: [
      { bg: 'home', cap: ['ஒரு குழந்தை கவலையாக இருக்கிறது.', 'A child is feeling worried.'],
        a: [['😟', 50, 62, 80, 'shake'], ['🌧️', 50, 24, 60, 'drift']] },
      { bg: 'home', cap: ['குழந்தை அமைதியாக அமர்ந்து வேண்டுகிறது.', 'The child sits quietly and prays.'],
        a: [['🙏', 50, 60, 80, 'bow'], ['🌧️', 50, 24, 60, 'away'], ['✨', 30, 36, 34, 'twinkle']] },
      { bg: 'sky', cap: ['கவலை மேகம் மறைந்து வானவில் தோன்றுகிறது.', 'The cloud of worry goes away and a rainbow appears.'],
        a: [['🌈', 50, 30, 100, 'in'], ['😊', 50, 62, 80, 'hop']] }
    ],
    quiz: [
      ['“மனக்கவலை” என்றால்?', 'What is “manakkavalai”?', [['மனத்தில் உள்ள கவலை', 'worry in the mind'], ['மகிழ்ச்சி', 'joy'], ['பசி', 'hunger']], 0],
      ['“அரிது” என்ற சொல்லின் பொருள்?', 'What does “arithu” mean?', [['கடினம்', 'hard, difficult'], ['எளிது', 'easy'], ['இனிப்பு', 'sweet']], 0]
    ],
    review: 'draft'
  },
  8: {
    words: [
      ['அறவாழி', 'அறக் கடல்', 'ocean of goodness (virtue)'],
      ['அந்தணன்', 'அருள் உள்ள கடவுள்', 'the gracious One (God)'],
      ['தாள்சேர்ந்தார்க்கு அல்லால்', 'திருவடி அடைந்தவர்களைத் தவிர', 'except for those who reach His feet'],
      ['பிறவாழி', 'மற்றக் கடல்கள்', 'the other oceans'],
      ['நீந்தல்', 'நீந்திக் கடப்பது', 'to swim across'],
      ['அரிது', 'கடினம்', 'is hard']
    ],
    ta: 'அறக் கடலாகிய கடவுளின் திருவடிகளை அடைந்தவர்களைத் தவிர, மற்றவர்களுக்கு வாழ்க்கை என்னும் மற்றக் கடல்களை நீந்திக் கடப்பது கடினம்.',
    en: 'God is an ocean of goodness. Except for those who reach His feet, it is hard for anyone to swim across the other oceans of life.',
    life: ['கடினமான நேரத்தில் நல்ல செயல்களும் நல்ல மனிதர்களும் படகு போல நமக்கு உதவுவார்கள்.',
           'In hard times, good deeds and good people help us, like a boat on the sea.'],
    scene: [
      { bg: 'sea', cap: ['ஒருவர் பெரிய கடலில் நீந்தக் கஷ்டப்படுகிறார்.', 'Someone struggles to swim in a big sea.'],
        a: [['🏊', 40, 60, 64, 'swim'], ['🌊', 70, 72, 70, 'wave'], ['🌊', 20, 74, 60, 'wave']] },
      { bg: 'sea', cap: ['அறம் என்னும் படகு வருகிறது.', 'A boat of goodness (aram) comes along.'],
        a: [['⛵', 20, 58, 80, 'sail'], ['🏊', 60, 62, 56, 'swim'], ['🌊', 80, 74, 60, 'wave']] },
      { bg: 'sea', cap: ['படகின் உதவியால் அவர் கரை சேர்கிறார்.', 'With the boat, they reach the shore safely.'],
        a: [['⛵', 56, 58, 80, 'sail'], ['🏝️', 84, 58, 80, 'in'], ['😊', 56, 40, 40, 'hop']] }
    ],
    quiz: [
      ['“அறவாழி” என்றால் என்ன?', 'What is “aravaazhi”?', [['அறக் கடல்', 'an ocean of goodness'], ['ஒரு மலை', 'a mountain'], ['ஒரு பறவை', 'a bird']], 0],
      ['“ஆழி” என்ற சொல்லின் பொருள்?', 'What does “aazhi” mean?', [['கடல்', 'sea, ocean'], ['காடு', 'forest'], ['வீடு', 'house']], 0]
    ],
    review: 'draft'
  },
  9: {
    words: [
      ['கோளில்', 'செயல்படாத', 'that does not work'],
      ['பொறியின்', 'புலன் உறுப்பைப் போல', 'like a sense organ'],
      ['குணமிலவே', 'பயன் இல்லாதவையே', 'are of no use'],
      ['எண்குணத்தான்', 'எட்டு நல்ல குணங்கள் உடைய கடவுள்', 'God of eight good qualities'],
      ['தாளை வணங்கா', 'திருவடியை வணங்காத', 'that does not bow to His feet'],
      ['தலை', 'தலை', 'head']
    ],
    ta: 'எட்டு நல்ல குணங்கள் உடைய கடவுளின் திருவடிகளை வணங்காத தலை, பார்க்காத கண் போல, கேட்காத காது போல, பயன் இல்லாதது.',
    en: 'A head that does not bow to God, the One of eight good qualities, is as useless as an eye that cannot see or an ear that cannot hear.',
    life: ['பெரியவர்களையும் ஆசிரியர்களையும் பணிவுடன் வணங்குவோம்.',
           'Let us greet our elders and teachers with respect.'],
    scene: [
      { bg: 'home', cap: ['பார்க்காத கண்ணால் என்ன பயன்?', 'What use is an eye that cannot see?'],
        a: [['🙈', 34, 58, 80, 'shake'], ['🔕', 70, 58, 64, 'shake']] },
      { bg: 'home', cap: ['ஒலிக்காத மணியால் என்ன பயன்?', 'What use is a bell that does not ring?'],
        a: [['🔕', 50, 54, 90, 'shake']] },
      { bg: 'sky', cap: ['அதுபோல, கடவுளை வணங்காத தலையும் பயன் இல்லாதது.', 'In the same way, a head that never bows is of no use.'],
        a: [['🙇', 50, 60, 90, 'bow'], ['🔔', 80, 30, 50, 'ring'], ['✨', 22, 30, 34, 'twinkle']] }
    ],
    quiz: [
      ['“எண்குணத்தான்” என்றால் யார்?', 'Who is “enkunaththaan”?', [['எட்டு நல்ல குணங்கள் உடைய கடவுள்', 'God of eight good qualities'], ['எட்டு வயதுச் சிறுவன்', 'an eight-year-old boy'], ['ஒரு எண்', 'a number']], 0],
      ['இந்தக் குறள் தலையை எதனுடன் ஒப்பிடுகிறது?', 'This Kural compares the head with…', [['செயல்படாத புலன் உறுப்பு', 'a sense organ that does not work'], ['ஒரு பந்து', 'a ball'], ['ஒரு மரம்', 'a tree']], 0]
    ],
    review: 'draft'
  },
  10: {
    words: [
      ['பிறவிப் பெருங்கடல்', 'பிறவி என்னும் பெரிய கடல்', 'the great ocean of births (of life)'],
      ['நீந்துவர்', 'நீந்திக் கடப்பார்கள்', 'will swim across'],
      ['நீந்தார்', 'நீந்திக் கடக்க மாட்டார்கள்', 'will not swim across'],
      ['இறைவன் அடி', 'கடவுளின் திருவடி', 'the feet of God'],
      ['சேராதார்', 'அடையாதவர்கள்', 'those who do not reach']
    ],
    ta: 'கடவுளின் திருவடிகளை அடைந்தவர்கள் பிறவி என்னும் பெரிய கடலை நீந்திக் கடப்பார்கள். அடையாதவர்கள் கடக்க மாட்டார்கள்.',
    en: 'Those who reach the feet of God swim across the great ocean of life. Those who do not, cannot.',
    life: ['பெரிய வேலையும் நல்ல வழிகாட்டுதலோடு எளிதாகும். உதவி கேட்கத் தயங்க வேண்டாம்.',
           'Even a big task becomes easier with good guidance. Never be shy to ask for help.'],
    scene: [
      { bg: 'sea', cap: ['இதோ ஒரு பெரிய கடல்.', 'Here is a great, wide ocean.'],
        a: [['🌊', 20, 66, 80, 'wave'], ['🌊', 50, 70, 80, 'wave'], ['🌊', 80, 66, 80, 'wave']] },
      { bg: 'sea', cap: ['கடவுளின் வழியைப் பின்பற்றுபவர் அதைக் கடக்கிறார்.', 'The one who follows God’s way crosses it.'],
        a: [['🏊', 20, 58, 60, 'swimAcross'], ['🌊', 50, 74, 70, 'wave'], ['✨', 30, 30, 34, 'twinkle']] },
      { bg: 'sea', cap: ['அவர் மகிழ்ச்சியாகக் கரை சேர்கிறார்!', 'They reach the shore, happy and safe!'],
        a: [['🏝️', 76, 56, 96, 'in'], ['🧍', 76, 40, 48, 'hop'], ['🌊', 30, 72, 70, 'wave']] }
    ],
    quiz: [
      ['இந்தக் குறள் வாழ்க்கையை எதனுடன் ஒப்பிடுகிறது?', 'This Kural compares life with…', [['பெரிய கடல்', 'a great ocean'], ['ஒரு சாலை', 'a road'], ['ஒரு வீடு', 'a house']], 0],
      ['இது திருக்குறளின் எத்தனையாவது குறள்?', 'Which number Kural is this?', [['பத்தாவது', 'the 10th'], ['முதலாவது', 'the 1st'], ['நூறாவது', 'the 100th']], 0]
    ],
    review: 'draft'
  },

  /* ---------- Chapter 10 · இனியவை கூறல் · Sweet words ---------- */
  91: {
    words: [['இன்சொல்', 'இனிய சொல்', 'sweet words'], ['ஈரம்', 'அன்பு', 'love, kindness'], ['அளைஇ', 'கலந்து', 'mixed with'],
      ['படிறு இல', 'ஏமாற்று இல்லாத', 'without trickery'], ['செம்பொருள் கண்டார்', 'உண்மையை அறிந்தவர்கள்', 'wise people who know the truth'], ['வாய்ச்சொல்', 'பேசும் சொல்', 'spoken words']],
    ta: 'அன்பு கலந்த, ஏமாற்று இல்லாத, அறிவுடையவர்கள் பேசும் சொற்களே இனிய சொற்கள்.',
    en: 'Sweet words are words full of love and free of trickery, like the words wise people speak.',
    life: ['பேசும்போது அன்பாகவும் உண்மையாகவும் பேசுவோம்.', 'When we talk, let us be both kind and truthful.'],
    scene: [
      { bg: 'home', cap: ['பாட்டி குழந்தையிடம் அன்பாகப் பேசுகிறார்.', 'Grandma speaks lovingly to the child.'], a: [['👵', 32, 60, 76, 'bob'], ['🧒', 68, 64, 62, 'look'], ['💬', 50, 34, 44, 'float']] },
      { bg: 'home', cap: ['அவர் சொற்களில் அன்பு கலந்திருக்கிறது.', 'Her words are full of love.'], a: [['💗', 40, 34, 40, 'float'], ['💗', 58, 28, 34, 'float'], ['👵', 32, 60, 76, 'bob'], ['😊', 68, 62, 64, 'hop']] },
      { bg: 'sky', cap: ['அன்பும் உண்மையும் கலந்த சொல்லே இனிய சொல்.', 'Love + truth = sweet words.'], a: [['💗', 30, 44, 56, 'shine'], ['➕', 50, 44, 40, 'in'], ['✅', 70, 44, 56, 'shine'], ['🍯', 50, 74, 50, 'grow']] }
    ],
    quiz: [
      ['இனிய சொல்லில் கலந்திருப்பது எது?', 'What is mixed into sweet words?', [['அன்பு', 'love'], ['கோபம்', 'anger'], ['பொய்', 'lies']], 0],
      ['“படிறு” என்றால் என்ன?', 'What does “padiru” mean?', [['ஏமாற்று', 'trickery'], ['மகிழ்ச்சி', 'happiness'], ['மழை', 'rain']], 0]
    ],
    review: 'draft'
  },
  92: {
    words: [['அகன் அமர்ந்து', 'மனம் மகிழ்ந்து', 'with a happy heart'], ['ஈதல்', 'கொடுத்தல்', 'giving'], ['நன்றே', 'நல்லது', 'is good, is better'],
      ['முகன் அமர்ந்து', 'முகம் மலர்ந்து', 'with a smiling face'], ['இன்சொலன்', 'இனிமையாகப் பேசுபவன்', 'one who speaks sweetly']],
    ta: 'மனம் மகிழ்ந்து பரிசு கொடுப்பதை விட, முகம் மலர்ந்து இனிமையாகப் பேசுவது இன்னும் நல்லது.',
    en: 'Speaking sweetly with a smiling face is even better than happily giving gifts.',
    life: ['புன்னகையுடன் “வணக்கம்”, “நன்றி” சொல்லுவோம்.', 'Let us say “hello” and “thank you” with a smile.'],
    scene: [
      { bg: 'home', cap: ['குழந்தை நண்பனுக்கு ஒரு பரிசு தருகிறது.', 'A child gives a friend a present.'], a: [['🧒', 30, 62, 64, 'bob'], ['🎁', 50, 62, 50, 'in'], ['👦', 72, 62, 64, 'look']] },
      { bg: 'home', cap: ['பிறகு புன்னகையுடன் இனிமையாகப் பேசுகிறது.', 'Then the child smiles and speaks sweetly.'], a: [['😊', 30, 60, 70, 'hop'], ['💬', 50, 36, 44, 'float'], ['👦', 72, 62, 64, 'bob']] },
      { bg: 'sky', cap: ['புன்னகையும் இனிய சொல்லும் பரிசை விடச் சிறந்தவை!', 'A smile and sweet words are even better than a gift!'], a: [['😊', 34, 56, 80, 'shine'], ['🎁', 72, 62, 46, 'in'], ['🌟', 50, 24, 50, 'twinkle']] }
    ],
    quiz: [
      ['பரிசை விடச் சிறந்தது எது?', 'What is even better than a gift?', [['புன்னகையுடன் இனிய சொல்', 'sweet words with a smile'], ['பெரிய பெட்டி', 'a big box'], ['நிறையப் பணம்', 'lots of money']], 0],
      ['“முகன் அமர்ந்து” என்றால் என்ன?', 'What does “mugan amarndhu” mean?', [['முகம் மலர்ந்து', 'with a smiling face'], ['முகம் சுளித்து', 'with a frown'], ['தூங்கி', 'sleeping']], 0]
    ],
    review: 'draft'
  },
  93: {
    words: [['முகத்தான் அமர்ந்து', 'முகம் மலர்ந்து', 'with a smiling face'], ['இனிது நோக்கி', 'அன்போடு பார்த்து', 'looking kindly'], ['அகத்தானாம்', 'மனத்திலிருந்து வரும்', 'coming from the heart'],
      ['இன்சொல்', 'இனிய சொல்', 'sweet words'], ['அறம்', 'நல்ல செயல்', 'goodness, virtue']],
    ta: 'முகம் மலர்ந்து, அன்போடு பார்த்து, மனத்திலிருந்து இனிய சொல் பேசுவதே அறம்.',
    en: 'A smiling face, a kind look and sweet words from the heart: that is true goodness.',
    life: ['நண்பர் பேசும்போது அவர் முகத்தைப் பார்த்து அன்போடு கேட்போம்.', 'When a friend talks, let us look at them kindly and really listen.'],
    scene: [
      { bg: 'garden', cap: ['முகம் மலர்ந்த புன்னகை.', 'A bright, smiling face.'], a: [['😊', 50, 54, 100, 'in']] },
      { bg: 'garden', cap: ['அன்பான பார்வை.', 'A kind look.'], a: [['🥰', 34, 58, 76, 'bob'], ['👀', 66, 40, 50, 'look'], ['💗', 66, 66, 40, 'float']] },
      { bg: 'sky', cap: ['மனத்திலிருந்து வரும் இனிய சொல் — அதுவே அறம்.', 'Sweet words from the heart: that is goodness.'], a: [['💗', 50, 62, 70, 'shine'], ['💬', 50, 30, 50, 'float'], ['✨', 26, 40, 34, 'twinkle'], ['✨', 74, 40, 34, 'twinkle']] }
    ],
    quiz: [
      ['இந்தக் குறள்படி அறம் எது?', 'In this Kural, what is goodness (aram)?', [['முகம் மலர்ந்து இனிமையாகப் பேசுவது', 'speaking sweetly with a smiling face'], ['சத்தமாகக் கத்துவது', 'shouting loudly'], ['முகத்தைத் திருப்பிக்கொள்வது', 'turning your face away']], 0],
      ['“அகத்தானாம்” என்றால் எங்கிருந்து வருவது?', '“Agaththaanaam” means coming from…', [['மனத்திலிருந்து', 'the heart'], ['கையிலிருந்து', 'the hand'], ['காலிலிருந்து', 'the foot']], 0]
    ],
    review: 'draft'
  },
  94: {
    words: [['துன்புறூஉம்', 'துன்பம் தரும்', 'that brings sorrow'], ['துவ்வாமை', 'வறுமை', 'want, being needy'], ['இல்லாகும்', 'இல்லாமல் போகும்', 'will not come'],
      ['யார்மாட்டும்', 'எல்லோரிடமும்', 'with everyone'], ['இன்புறூஉம்', 'மகிழ்ச்சி தரும்', 'that brings joy'], ['இன்சொலவர்க்கு', 'இனிமையாகப் பேசுபவர்களுக்கு', 'for those who speak sweetly']],
    ta: 'எல்லோரிடமும் மகிழ்ச்சி தரும் இனிய சொல் பேசுபவர்களுக்குத் துன்பம் தரும் வறுமை வராது.',
    en: 'People who speak sweet, happy words to everyone will not fall into sad and needy days.',
    life: ['இனிமையாகப் பேசுபவருக்கு நிறைய நண்பர்கள் கிடைப்பார்கள்.', 'People who speak kindly make many friends.'],
    scene: [
      { bg: 'garden', cap: ['குழந்தை எல்லோரிடமும் இனிமையாகப் பேசுகிறது.', 'The child speaks sweetly to everyone.'], a: [['🧒', 20, 62, 62, 'bob'], ['👩', 45, 62, 60, 'in'], ['👴', 65, 62, 60, 'in'], ['🧑', 85, 62, 60, 'in']] },
      { bg: 'garden', cap: ['எல்லோரும் மகிழ்கிறார்கள்.', 'Everyone feels happy.'], a: [['😊', 25, 56, 56, 'hop'], ['😄', 50, 56, 56, 'hop'], ['😁', 75, 56, 56, 'hop'], ['💗', 50, 26, 40, 'float']] },
      { bg: 'sky', cap: ['இனிய சொல் பேசுபவருக்குத் துன்பம் வராது.', 'Sorrow stays away from those who speak sweetly.'], a: [['🌧️', 50, 18, 56, 'away'], ['🏠', 50, 60, 90, 'in'], ['☀️', 82, 18, 50, 'shine']] }
    ],
    quiz: [
      ['“துவ்வாமை” என்றால் என்ன?', 'What does “thuvvaamai” mean?', [['வறுமை', 'want, being needy'], ['செல்வம்', 'wealth'], ['விளையாட்டு', 'a game']], 0],
      ['யாரிடம் இனிமையாகப் பேச வேண்டும்?', 'Whom should we speak sweetly to?', [['எல்லோரிடமும்', 'everyone'], ['நண்பரிடம் மட்டும்', 'only friends'], ['யாரிடமும் வேண்டாம்', 'no one']], 0]
    ],
    review: 'draft'
  },
  95: {
    words: [['பணிவுடையன்', 'பணிவு உள்ளவன்', 'humble'], ['இன்சொலன்', 'இனிமையாகப் பேசுபவன்', 'one who speaks sweetly'], ['ஒருவற்கு', 'ஒருவருக்கு', 'for a person'],
      ['அணி', 'நகை, அழகு', 'jewel, ornament'], ['அல்ல மற்றுப் பிற', 'மற்றவை அணி அல்ல', 'other things are not']],
    ta: 'பணிவும் இனிய சொல்லுமே ஒருவருக்கு உண்மையான நகைகள். மற்றவை உண்மையான அழகு அல்ல.',
    en: 'Being humble and speaking sweetly are a person’s real jewels. Nothing else is true beauty.',
    life: ['அழகான உடையை விட அன்பான பேச்சுதான் நம்மை அழகாக்கும்.', 'Kind words make us more beautiful than fancy clothes.'],
    scene: [
      { bg: 'home', cap: ['கிரீடம், நகை, புதிய உடை…', 'A crown, jewels, new clothes…'], a: [['👑', 28, 50, 60, 'in'], ['💍', 50, 50, 54, 'in'], ['👗', 72, 50, 60, 'in']] },
      { bg: 'home', cap: ['இவை உண்மையான அழகு அல்ல.', 'These are not true beauty.'], a: [['👑', 28, 50, 60, 'away'], ['💍', 50, 50, 54, 'away'], ['👗', 72, 50, 60, 'away']] },
      { bg: 'sky', cap: ['பணிவும் இனிய சொல்லுமே உண்மையான நகைகள்!', 'Humility and sweet words are the real jewels!'], a: [['🙇', 40, 60, 80, 'bow'], ['💬', 66, 40, 46, 'float'], ['✨', 26, 30, 36, 'twinkle'], ['💎', 72, 70, 40, 'shine']] }
    ],
    quiz: [
      ['ஒருவருக்கு உண்மையான நகை எது?', 'What is a person’s real jewel?', [['பணிவும் இனிய சொல்லும்', 'humility and sweet words'], ['தங்கச் சங்கிலி', 'a gold chain'], ['புதிய உடை', 'new clothes']], 0],
      ['“அணி” என்றால் என்ன?', 'What does “ani” mean?', [['நகை, அழகு', 'jewel, beauty'], ['சாப்பாடு', 'food'], ['விளையாட்டு', 'a game']], 0]
    ],
    review: 'draft'
  },
  96: {
    words: [['அல்லவை', 'தீயவை', 'bad things'], ['தேய', 'குறைய', 'shrink'], ['அறம் பெருகும்', 'நன்மை வளரும்', 'goodness grows'],
      ['நல்லவை நாடி', 'நல்லதை எண்ணி', 'thinking of what is good'], ['இனிய சொலின்', 'இனிமையாகப் பேசினால்', 'if one speaks sweetly']],
    ta: 'நல்லதை எண்ணி இனிமையாகப் பேசினால் தீமை குறையும், நன்மை வளரும்.',
    en: 'When we think of good things and speak sweetly, bad things shrink and goodness grows.',
    life: ['கோபம் வரும்போதும் நல்ல சொற்களைத் தேர்ந்தெடுப்போம்.', 'Even when we are cross, let us choose good words.'],
    scene: [
      { bg: 'garden', cap: ['ஒரு கருமேகம் இருக்கிறது.', 'There is a dark cloud.'], a: [['🌩️', 50, 26, 70, 'drift'], ['🧒', 50, 66, 62, 'look']] },
      { bg: 'garden', cap: ['குழந்தை நல்லதை எண்ணி இனிமையாகப் பேசுகிறது.', 'The child thinks good thoughts and speaks sweetly.'], a: [['🌩️', 50, 22, 50, 'away'], ['🧒', 40, 66, 62, 'bob'], ['💬', 62, 46, 44, 'float']] },
      { bg: 'garden', cap: ['தீமை குறைந்து, நன்மை மரம் போல வளர்கிறது!', 'Bad things shrink and goodness grows like a tree!'], a: [['🌳', 60, 54, 100, 'grow'], ['🧒', 28, 66, 60, 'hop'], ['☀️', 82, 16, 48, 'shine']] }
    ],
    quiz: [
      ['இனிமையாகப் பேசினால் என்ன வளரும்?', 'What grows when we speak sweetly?', [['நன்மை (அறம்)', 'goodness'], ['கோபம்', 'anger'], ['சண்டை', 'fights']], 0],
      ['“அல்லவை” என்றால் என்ன?', 'What does “allavai” mean?', [['தீயவை', 'bad things'], ['நல்லவை', 'good things'], ['பழங்கள்', 'fruits']], 0]
    ],
    review: 'draft'
  },
  97: {
    words: [['நயன் ஈன்று', 'நீதியைத் தந்து', 'bringing fairness'], ['நன்றி பயக்கும்', 'நன்மை தரும்', 'does good'], ['பயன் ஈன்று', 'பயன் தந்து', 'being useful'],
      ['பண்பின்', 'நல்ல பண்பிலிருந்து', 'from good manners'], ['தலைப்பிரியா', 'விலகாத', 'never parting'], ['சொல்', 'சொல்', 'words']],
    ta: 'பயனுள்ளதாகவும் நல்ல பண்பிலிருந்து விலகாததாகவும் உள்ள சொல் நீதியையும் நன்மையையும் தரும்.',
    en: 'Words that are useful and always polite bring fairness and goodness to everyone.',
    life: ['பயனுள்ளதையும் மரியாதையானதையும் மட்டும் பேசுவோம்.', 'Let us say things that are useful and polite.'],
    scene: [
      { bg: 'garden', cap: ['இரண்டு நண்பர்கள் சண்டை போடுகிறார்கள்.', 'Two friends are quarrelling.'], a: [['😠', 32, 60, 64, 'shake'], ['😤', 68, 60, 64, 'shake'], ['🍎', 50, 72, 40, 'in']] },
      { bg: 'garden', cap: ['மூன்றாவது நண்பர் மரியாதையாக, பயனுள்ளதாகப் பேசுகிறார்.', 'A third friend speaks politely and helpfully.'], a: [['🙂', 50, 44, 66, 'bob'], ['💬', 70, 26, 40, 'float'], ['😐', 24, 66, 52, 'look'], ['😐', 82, 66, 52, 'look']] },
      { bg: 'sky', cap: ['எல்லோருக்கும் நீதியும் நன்மையும் கிடைக்கிறது!', 'Everyone gets a fair share and feels good!'], a: [['😊', 25, 60, 58, 'hop'], ['🤝', 50, 60, 58, 'in'], ['😊', 75, 60, 58, 'hop'], ['🍎', 50, 32, 40, 'twinkle']] }
    ],
    quiz: [
      ['எந்தச் சொல் நன்மை தரும்?', 'Which words do good?', [['பயனுள்ள, மரியாதையான சொல்', 'useful, polite words'], ['கேலிச் சொல்', 'teasing words'], ['கோபச் சொல்', 'angry words']], 0],
      ['“பண்பு” என்றால் என்ன?', 'What does “panbu” mean?', [['நல்ல குணம்', 'good manners, good nature'], ['பணம்', 'money'], ['பாட்டு', 'a song']], 0]
    ],
    review: 'draft'
  },
  98: {
    words: [['சிறுமை', 'பிறருக்குத் துன்பம் தரும் கீழ்மை', 'meanness that hurts others'], ['நீங்கிய', 'இல்லாத', 'free of'], ['இன்சொல்', 'இனிய சொல்', 'sweet words'],
      ['இம்மை', 'இந்த வாழ்க்கை', 'this life'], ['மறுமை', 'அடுத்த பிறவி', 'the life to come'], ['இன்பம் தரும்', 'மகிழ்ச்சி தரும்', 'gives joy']],
    ta: 'யாருக்கும் துன்பம் தராத இனிய சொல் இந்த வாழ்க்கையிலும் அடுத்த பிறவியிலும் மகிழ்ச்சி தரும்.',
    en: 'Sweet words that hurt no one bring joy in this life and in the life to come.',
    life: ['யாரையும் கேலி செய்யாமல் பேசுவோம்.', 'Let us never use words that make fun of others.'],
    scene: [
      { bg: 'garden', cap: ['ஒருவரைக் கேலி செய்தால் அவர் வருந்துகிறார்.', 'Teasing someone makes them sad.'], a: [['😂', 32, 60, 62, 'shake'], ['😢', 68, 62, 62, 'look']] },
      { bg: 'garden', cap: ['அன்பான சொல் அவரை மகிழ்விக்கிறது.', 'Kind words make them happy again.'], a: [['🤗', 34, 60, 66, 'bob'], ['😊', 68, 60, 62, 'hop'], ['💬', 50, 34, 40, 'float']] },
      { bg: 'sky', cap: ['யாரையும் புண்படுத்தாத சொல் என்றும் மகிழ்ச்சி தரும்.', 'Words that hurt no one bring joy, now and always.'], a: [['☀️', 50, 22, 70, 'shine'], ['😊', 34, 64, 56, 'hop'], ['😊', 66, 64, 56, 'hop']] }
    ],
    quiz: [
      ['“இம்மை” என்றால் என்ன?', 'What does “immai” mean?', [['இந்த வாழ்க்கை', 'this life'], ['நாளை', 'tomorrow'], ['நேற்று', 'yesterday']], 0],
      ['எந்தச் சொல் மகிழ்ச்சி தரும்?', 'Which words bring joy?', [['யாரையும் புண்படுத்தாத இனிய சொல்', 'sweet words that hurt no one'], ['கேலிச் சொல்', 'teasing words'], ['பொய்ச் சொல்', 'lies']], 0]
    ],
    review: 'draft'
  },
  99: {
    words: [['இன்சொல்', 'இனிய சொல்', 'sweet words'], ['இனிது ஈன்றல்', 'இனிமை தருவது', 'bringing happiness'], ['காண்பான்', 'பார்ப்பவன்', 'one who sees'],
      ['எவன்கொலோ', 'ஏன்?', 'why?'], ['வன்சொல்', 'கடுஞ்சொல்', 'harsh words'], ['வழங்குவது', 'பேசுவது', 'using']],
    ta: 'இனிய சொல் மகிழ்ச்சி தருவதைப் பார்த்தவர், ஏன் கடுஞ்சொல் பேச வேண்டும்?',
    en: 'When we can see that sweet words bring happiness, why would anyone use harsh words?',
    life: ['கடுஞ்சொல் பேசிவிட்டால் “மன்னிக்கவும்” என்று சொல்லி இனிமையாகப் பேசுவோம்.', 'If we say something harsh, let us say sorry and speak kindly.'],
    scene: [
      { bg: 'home', cap: ['கடுஞ்சொல் நண்பனை வருத்தப்படுத்துகிறது.', 'Harsh words make a friend sad.'], a: [['😠', 32, 60, 62, 'shake'], ['💢', 50, 36, 40, 'in'], ['😢', 70, 62, 62, 'look']] },
      { bg: 'home', cap: ['இனிய சொல் அவனை மகிழ்விக்கிறது.', 'Sweet words make him happy.'], a: [['🙂', 32, 60, 62, 'bob'], ['💬', 50, 36, 40, 'float'], ['😊', 70, 60, 62, 'hop']] },
      { bg: 'sky', cap: ['இனிய சொல் இருக்கும்போது கடுஞ்சொல் ஏன்?', 'With sweet words to use, why choose harsh ones?'], a: [['❓', 50, 34, 70, 'shine'], ['💗', 30, 66, 46, 'float'], ['💗', 70, 66, 46, 'float']] }
    ],
    quiz: [
      ['“வன்சொல்” என்றால் என்ன?', 'What does “vansol” mean?', [['கடுஞ்சொல்', 'harsh words'], ['இனிய சொல்', 'sweet words'], ['புதிய சொல்', 'a new word']], 0],
      ['இனிய சொல் என்ன தரும்?', 'What do sweet words bring?', [['மகிழ்ச்சி', 'happiness'], ['அழுகை', 'tears'], ['சண்டை', 'fights']], 0]
    ],
    review: 'draft'
  },
  100: {
    words: [['இனிய உளவாக', 'இனிய சொற்கள் இருக்கும்போது', 'when sweet words are there'], ['இன்னாத', 'கடுமையான', 'unpleasant, harsh'], ['கூறல்', 'பேசுவது', 'speaking'],
      ['கனி இருப்ப', 'பழம் இருக்கும்போது', 'when ripe fruit is there'], ['காய் கவர்ந்தற்று', 'காயைப் பறித்தது போல', 'like picking unripe fruit']],
    ta: 'இனிய சொற்கள் இருக்கும்போது கடுஞ்சொல் பேசுவது, பழுத்த பழம் இருக்கும்போது புளிப்பான காயைப் பறிப்பது போன்றது.',
    en: 'Using harsh words when sweet words are there is like picking a sour, unripe fruit when a sweet ripe one is right there.',
    life: ['பேசும் முன் யோசிப்போம்: இனிய சொல்லா, கடுஞ்சொல்லா?', 'Before we speak, let us think: sweet words or harsh words?'],
    scene: [
      { bg: 'garden', cap: ['மரத்தில் பழுத்த பழமும் காயும் உள்ளன.', 'The tree has a ripe fruit and a green one.'], a: [['🌳', 50, 50, 140, 'in'], ['🥭', 38, 40, 40, 'twinkle'], ['🍏', 62, 42, 36, 'in']] },
      { bg: 'garden', cap: ['குழந்தை காயைப் பறிக்கிறது — புளிக்கிறது!', 'The child picks the green one. So sour!'], a: [['🍏', 40, 46, 44, 'in'], ['😖', 62, 60, 72, 'shake']] },
      { bg: 'garden', cap: ['பழம் இனிக்கும் — இனிய சொல்லும் அப்படித்தான்!', 'The ripe fruit is sweet, and so are sweet words!'], a: [['🥭', 40, 46, 48, 'shine'], ['😋', 62, 60, 72, 'hop'], ['💬', 82, 30, 40, 'float']] }
    ],
    quiz: [
      ['இந்தக் குறள் கடுஞ்சொல்லை எதனுடன் ஒப்பிடுகிறது?', 'This Kural compares harsh words with…', [['புளிப்பான காய்', 'a sour unripe fruit'], ['இனிய பழம்', 'a sweet ripe fruit'], ['ஒரு பூ', 'a flower']], 0],
      ['இனிய சொல் எதைப் போன்றது?', 'Sweet words are like…', [['பழுத்த பழம்', 'a ripe fruit'], ['புளிப்பான காய்', 'a sour fruit'], ['ஒரு கல்', 'a stone']], 0]
    ],
    review: 'draft'
  },

  /* ---------- Chapter 40 · கல்வி · Learning ---------- */
  391: {
    words: [['கற்க', 'படி', 'learn'], ['கசடு அற', 'குறை இல்லாமல்', 'fully, without mistakes'], ['கற்பவை', 'கற்க வேண்டியவை', 'what is worth learning'],
      ['கற்றபின்', 'படித்த பிறகு', 'after learning'], ['நிற்க', 'நட', 'live, stand'], ['அதற்குத் தக', 'அதற்கு ஏற்ப', 'by it, accordingly']],
    ta: 'கற்க வேண்டியவற்றைக் குறை இல்லாமல் நன்றாகக் கற்க வேண்டும். கற்ற பிறகு அதன்படி நடக்க வேண்டும்.',
    en: 'Learn what is worth learning, fully and well. Then live by what you have learned.',
    life: ['வகுப்பில் “உதவி செய்” என்று கற்றால், வீட்டிலும் உதவி செய்வோம்.', 'If we learn “help others” at school, let us help at home too.'],
    scene: [
      { bg: 'class', cap: ['குழந்தை கவனமாகப் படிக்கிறது.', 'The child reads carefully.'], board: 'கற்க', a: [['🧒', 30, 66, 62, 'bob'], ['📖', 50, 70, 44, 'in']] },
      { bg: 'class', cap: ['குறை இல்லாமல் நன்றாகக் கற்கிறது.', 'The child learns it well, with no mistakes.'], a: [['✏️', 40, 56, 50, 'bob'], ['✅', 62, 50, 56, 'shine'], ['🧒', 22, 66, 56, 'hop']] },
      { bg: 'path', cap: ['கற்றபடி நடக்கிறது — பாட்டிக்கு உதவுகிறது!', 'Then the child lives by it, helping Grandma!'], a: [['🧒', 36, 62, 60, 'walk'], ['🤝', 52, 60, 40, 'in'], ['👵', 68, 62, 66, 'bob']] }
    ],
    quiz: [
      ['கற்ற பிறகு என்ன செய்ய வேண்டும்?', 'What should we do after learning?', [['கற்றபடி நடக்க வேண்டும்', 'live by what we learned'], ['மறந்துவிட வேண்டும்', 'forget it'], ['தூங்க வேண்டும்', 'go to sleep']], 0],
      ['“கசடு அற” என்றால் என்ன?', 'What does “kasadu ara” mean?', [['குறை இல்லாமல்', 'without mistakes, fully'], ['வேகமாக', 'quickly'], ['பாதியாக', 'halfway']], 0]
    ],
    review: 'draft'
  },
  392: {
    words: [['எண்', 'எண்கள்', 'numbers'], ['ஏனை', 'மற்றது', 'the other'], ['எழுத்து', 'எழுத்துகள்', 'letters'],
      ['இவ்விரண்டும்', 'இந்த இரண்டும்', 'these two'], ['கண் என்ப', 'கண்கள் என்பர்', 'are called eyes'], ['வாழும் உயிர்க்கு', 'வாழும் மனிதர்களுக்கு', 'for living people']],
    ta: 'எண்களும் எழுத்துகளும் வாழும் மனிதர்களுக்கு இரண்டு கண்கள் போன்றவை.',
    en: 'Numbers and letters are like two eyes for every person.',
    life: ['தினமும் கொஞ்சம் கணக்கும் கொஞ்சம் தமிழும் படிப்போம்.', 'Let us practise a little maths and a little Tamil every day.'],
    scene: [
      { bg: 'class', cap: ['இதோ எண்கள்.', 'Here are numbers.'], board: '1 2 3', a: [['🔢', 50, 70, 56, 'in']] },
      { bg: 'class', cap: ['இதோ எழுத்துகள்.', 'Here are letters.'], board: 'அ ஆ இ', a: [['🔤', 50, 70, 56, 'in']] },
      { bg: 'sky', cap: ['இவை இரண்டும் நமக்கு இரண்டு கண்கள்!', 'These two are like our two eyes!'], a: [['👀', 50, 46, 100, 'shine'], ['🔢', 22, 66, 44, 'float'], ['🔤', 78, 66, 44, 'float'], ['🌍', 50, 80, 40, 'spin']] }
    ],
    quiz: [
      ['வாழ்க்கைக்கு இரண்டு கண்கள் எவை?', 'Which two are like our two eyes?', [['எண்ணும் எழுத்தும்', 'numbers and letters'], ['பந்தும் மட்டையும்', 'ball and bat'], ['பாலும் பழமும்', 'milk and fruit']], 0],
      ['“எண்” என்றால் என்ன?', 'What does “en” mean?', [['எண்கள்', 'numbers'], ['எழுத்துகள்', 'letters'], ['பூக்கள்', 'flowers']], 0]
    ],
    review: 'draft'
  },
  393: {
    words: [['கண்ணுடையர்', 'கண் உள்ளவர்கள்', 'people who have eyes'], ['கற்றோர்', 'படித்தவர்கள்', 'learned people'], ['முகத்து இரண்டு', 'முகத்தில் இரண்டு', 'two on the face'],
      ['புண்', 'காயம்', 'sores'], ['கல்லாதவர்', 'படிக்காதவர்கள்', 'people who do not learn']],
    ta: 'படித்தவர்களுக்குத்தான் உண்மையில் கண் உண்டு. படிக்காதவர்களின் முகத்தில் இருப்பவை இரண்டு புண்கள் போன்றவை.',
    en: 'Only people who learn truly have eyes. Without learning, the two eyes on our face are like two sores.',
    life: ['கல்வி நம் கண்களுக்கு ஒளி தருகிறது. எனவே தொடர்ந்து கற்போம்!', 'Learning gives light to our eyes, so let us keep learning!'],
    scene: [
      { bg: 'night', cap: ['இருட்டில் எதுவும் தெரியவில்லை.', 'In the dark, nothing can be seen.'], a: [['🧒', 50, 64, 64, 'look'], ['❓', 70, 36, 40, 'in']] },
      { bg: 'night', cap: ['புத்தகம் திறந்ததும் வெளிச்சம்!', 'Open a book, and there is light!'], a: [['📖', 50, 60, 70, 'in'], ['💡', 50, 30, 54, 'shine']] },
      { bg: 'sky', cap: ['கற்றவர்களின் கண்களுக்கு உண்மையான ஒளி.', 'Learning gives our eyes real light.'], a: [['🧒', 40, 62, 64, 'hop'], ['📚', 64, 66, 50, 'in'], ['☀️', 50, 18, 54, 'shine'], ['✨', 76, 36, 34, 'twinkle']] }
    ],
    quiz: [
      ['இந்தக் குறள்படி உண்மையில் கண் உடையவர் யார்?', 'In this Kural, who truly has eyes?', [['கற்றவர்கள்', 'people who learn'], ['உயரமானவர்கள்', 'tall people'], ['பணக்காரர்கள்', 'rich people']], 0],
      ['“கல்லாதவர்” என்றால் யார்?', 'Who are “kallaadhavar”?', [['படிக்காதவர்கள்', 'people who do not learn'], ['பேசாதவர்கள்', 'people who do not talk'], ['விளையாடாதவர்கள்', 'people who do not play']], 0]
    ],
    review: 'draft'
  },
  394: {
    words: [['உவப்ப', 'மகிழும்படி', 'so that all are happy'], ['தலைக்கூடி', 'சந்தித்து', 'meeting'], ['உள்ள', 'நினைக்கும்படி', 'so that they think of you'],
      ['பிரிதல்', 'பிரிந்து செல்லுதல்', 'parting'], ['அனைத்தே', 'அதுவே', 'that is'], ['புலவர் தொழில்', 'கற்றவர்களின் இயல்பு', 'the way of the learned']],
    ta: 'மற்றவர்கள் மகிழும்படி சந்தித்து, மீண்டும் எப்போது வருவார் என்று நினைக்கும்படி பிரிவதே கற்றவர்களின் இயல்பு.',
    en: 'Learned people meet others so that everyone feels happy, and part so that everyone wishes to meet them again.',
    life: ['நண்பர்களைச் சந்திக்கும்போது அவர்களை மகிழ்விப்போம்.', 'When we meet friends, let us make them happy.'],
    scene: [
      { bg: 'class', cap: ['கற்றவர் வருகிறார்; எல்லோரும் மகிழ்கிறார்கள்.', 'A wise teacher arrives and everyone is happy.'], a: [['🧑‍🏫', 20, 60, 70, 'walk'], ['😃', 60, 64, 52, 'hop'], ['😄', 80, 64, 52, 'hop']] },
      { bg: 'class', cap: ['அவர் பேச்சு எல்லோருக்கும் பிடிக்கிறது.', 'Everyone loves listening to the teacher.'], a: [['🧑‍🏫', 40, 60, 70, 'bob'], ['💬', 58, 34, 40, 'float'], ['🎉', 78, 40, 44, 'twinkle']] },
      { bg: 'sky', cap: ['அவர் சென்ற பிறகும் எல்லோரும் அவரை நினைக்கிறார்கள்.', 'After the teacher leaves, everyone still thinks of them.'], a: [['👋', 30, 60, 60, 'ring'], ['💭', 66, 36, 60, 'float'], ['🧑‍🏫', 66, 36, 30, 'in']] }
    ],
    quiz: [
      ['கற்றவர் பிரிந்த பிறகு மற்றவர்கள் என்ன செய்வார்கள்?', 'After a learned person leaves, what do others do?', [['அவரை அன்போடு நினைப்பார்கள்', 'think of them fondly'], ['மறந்துவிடுவார்கள்', 'forget them'], ['கோபப்படுவார்கள்', 'get angry']], 0],
      ['“உவப்ப” என்றால் என்ன?', 'What does “uvappa” mean?', [['மகிழும்படி', 'so that all are happy'], ['அழும்படி', 'so that all cry'], ['தூங்கும்படி', 'so that all sleep']], 0]
    ],
    review: 'draft'
  },
  395: {
    words: [['உடையார்முன்', 'செல்வர் முன்னால்', 'in front of the rich'], ['இல்லார்போல்', 'ஏழை போல', 'like the poor'], ['ஏக்கற்றும்', 'ஆர்வத்துடன் பணிந்து', 'humbly and eagerly'],
      ['கற்றார்', 'கற்றவர்கள்', 'those who learn'], ['கடையர்', 'கீழானவர்கள்', 'the lowest'], ['கல்லாதவர்', 'கற்காதவர்கள்', 'those who do not learn']],
    ta: 'செல்வரிடம் ஏழை பணிந்து நிற்பது போல, ஆசிரியரிடம் பணிவுடன் ஆர்வமாகக் கற்றவர்களே உயர்ந்தவர்கள். அப்படிக் கற்காதவர்கள் கீழானவர்கள்.',
    en: 'Those who learn humbly from their teachers, the way a poor person eagerly asks a rich one for help, rise high. Those who refuse to learn stay low.',
    life: ['ஆசிரியரிடம் பணிவுடன் கேள்வி கேட்டுக் கற்போம்.', 'Let us ask our teachers questions politely and keep learning.'],
    scene: [
      { bg: 'class', cap: ['குழந்தை பணிவுடன் கை உயர்த்துகிறது.', 'The child politely raises a hand.'], a: [['🙋', 30, 62, 66, 'hop'], ['👩‍🏫', 72, 58, 72, 'look']] },
      { bg: 'class', cap: ['ஆர்வத்துடன் கேள்வி கேட்டுக் கற்கிறது.', 'The child asks eagerly and learns.'], a: [['🙏', 30, 62, 60, 'bow'], ['💬', 50, 34, 40, 'float'], ['👩‍🏫', 72, 58, 72, 'bob']] },
      { bg: 'sky', cap: ['பணிவுடன் கற்பவர் உயர்கிறார்!', 'Those who learn humbly rise high!'], a: [['📶', 50, 66, 80, 'grow'], ['🧒', 62, 34, 50, 'hop'], ['⭐', 80, 18, 40, 'twinkle']] }
    ],
    quiz: [
      ['எப்படிக் கற்க வேண்டும்?', 'How should we learn?', [['பணிவுடனும் ஆர்வத்துடனும்', 'humbly and eagerly'], ['பெருமையுடன்', 'proudly'], ['கோபத்துடன்', 'angrily']], 0],
      ['“கடையர்” என்றால் என்ன?', 'What does “kadaiyar” mean?', [['கீழானவர்கள்', 'the lowest'], ['கடைக்காரர்கள்', 'shopkeepers'], ['நண்பர்கள்', 'friends']], 0]
    ],
    review: 'draft'
  },
  396: {
    words: [['தொட்டனைத்து', 'தோண்டும் அளவு', 'as much as you dig'], ['ஊறும்', 'நீர் சுரக்கும்', 'water springs up'], ['மணற்கேணி', 'மணலில் தோண்டிய கிணறு', 'a well dug in sand'],
      ['மாந்தர்க்கு', 'மனிதர்களுக்கு', 'for people'], ['கற்றனைத்து', 'கற்கும் அளவு', 'as much as you learn'], ['அறிவு', 'அறிவு', 'knowledge']],
    ta: 'மணலில் தோண்டும் அளவுக்குக் கிணற்றில் நீர் ஊறும். அதுபோல நாம் கற்கும் அளவுக்கு அறிவு வளரும்.',
    en: 'The deeper you dig a well in the sand, the more water springs up. The more you learn, the more your knowledge grows.',
    life: ['ஒவ்வொரு நாளும் கொஞ்சம் கற்றால், அறிவு நிறைய வளரும்.', 'Learn a little every day, and your knowledge will grow and grow.'],
    scene: [
      { bg: 'garden', cap: ['குழந்தை மணலில் தோண்டுகிறது.', 'The child digs in the sand.'], a: [['🧒', 36, 56, 64, 'bob'], ['🪣', 60, 66, 46, 'shake']] },
      { bg: 'garden', cap: ['தோண்டத் தோண்ட நீர் ஊறுகிறது!', 'The more the child digs, the more water comes up!'], a: [['💧', 50, 70, 40, 'grow'], ['💧', 60, 64, 34, 'grow'], ['😃', 30, 52, 60, 'hop']] },
      { bg: 'class', cap: ['கற்கக் கற்க அறிவும் அப்படியே வளரும்.', 'The more you learn, the more your knowledge grows.'], a: [['📚', 34, 66, 56, 'in'], ['💡', 50, 40, 50, 'grow'], ['💡', 66, 30, 40, 'grow']] }
    ],
    quiz: [
      ['அறிவு எப்போது வளரும்?', 'When does knowledge grow?', [['நாம் கற்கும் அளவுக்கு', 'as much as we learn'], ['தூங்கும்போது', 'while we sleep'], ['விளையாடும்போது மட்டும்', 'only while playing']], 0],
      ['“மணற்கேணி” என்றால் என்ன?', 'What is a “manarkeni”?', [['மணலில் தோண்டிய கிணறு', 'a well dug in sand'], ['பெரிய ஆறு', 'a big river'], ['மணல் வீடு', 'a sandcastle']], 0]
    ],
    review: 'draft'
  },
  397: {
    words: [['யாதானும்', 'எதுவும்', 'any'], ['நாடாம்', 'தன் நாடு ஆகும்', 'becomes one’s own country'], ['ஊராம்', 'தன் ஊர் ஆகும்', 'becomes one’s own town'],
      ['என்', 'ஏன்?', 'why?'], ['சாந்துணையும்', 'இறக்கும் வரை', 'all one’s life'], ['கல்லாதவாறு', 'கற்காமல் இருப்பது', 'staying without learning']],
    ta: 'கற்றவருக்கு எந்த நாடும் தன் நாடு, எந்த ஊரும் தன் ஊர். அப்படியிருக்க, ஒருவர் வாழ்நாள் முழுவதும் ஏன் கற்காமல் இருக்க வேண்டும்?',
    en: 'For a learned person, every country and every town feels like home. So why would anyone stay without learning all their life?',
    life: ['கற்றால் எங்கு சென்றாலும் நண்பர்கள் கிடைப்பார்கள்.', 'When we learn, we can make friends wherever we go.'],
    scene: [
      { bg: 'sky', cap: ['கற்றவர் உலகம் முழுவதும் பயணம் செய்கிறார்.', 'A learned person travels the world.'], a: [['🧑‍🎓', 30, 60, 66, 'walk'], ['🌍', 70, 50, 80, 'spin']] },
      { bg: 'sky', cap: ['எந்த ஊரும் அவரை வரவேற்கிறது.', 'Every town welcomes them.'], a: [['🏘️', 24, 64, 56, 'in'], ['🏙️', 50, 60, 60, 'in'], ['🏡', 76, 64, 56, 'in'], ['👋', 50, 28, 40, 'ring']] },
      { bg: 'class', cap: ['அப்படியிருக்க, கற்காமல் இருப்பது ஏன்?', 'So why would anyone not learn?'], a: [['❓', 70, 36, 60, 'shine'], ['📚', 36, 64, 60, 'in'], ['🧒', 54, 64, 54, 'hop']] }
    ],
    quiz: [
      ['கற்றவருக்கு எந்த ஊர் சொந்த ஊர்?', 'For a learned person, which town is home?', [['எல்லா ஊர்களும்', 'every town'], ['ஒரே ஒரு ஊர்', 'only one town'], ['எந்த ஊரும் இல்லை', 'no town']], 0],
      ['“சாந்துணையும்” என்றால் என்ன?', 'What does “saandhunaiyum” mean?', [['இறக்கும் வரை', 'all one’s life'], ['நாளை வரை', 'until tomorrow'], ['ஒரு நாள்', 'one day']], 0]
    ],
    review: 'draft'
  },
  398: {
    words: [['ஒருமைக்கண்', 'ஒரு பிறவியில்', 'in one life'], ['தான் கற்ற', 'தான் படித்த', 'that one learned'], ['கல்வி', 'கல்வி', 'learning'],
      ['ஒருவற்கு', 'ஒருவருக்கு', 'for a person'], ['எழுமையும்', 'ஏழு பிறவிகளிலும்', 'in seven lives'], ['ஏமாப்பு உடைத்து', 'பாதுகாப்பு தரும்', 'gives protection']],
    ta: 'ஒரு பிறவியில் ஒருவர் கற்ற கல்வி அவருக்கு ஏழு பிறவிகளிலும் துணையாக இருந்து காக்கும்.',
    en: 'What a person learns in one life protects and helps them for seven lives.',
    life: ['இன்று கற்றது என்றும் நமக்குத் துணையாக இருக்கும்.', 'What we learn today will help us for ever.'],
    scene: [
      { bg: 'class', cap: ['குழந்தை கற்கிறது.', 'A child learns.'], a: [['🧒', 36, 64, 62, 'bob'], ['📖', 58, 66, 48, 'in']] },
      { bg: 'sky', cap: ['கல்வி ஒரு கேடயம் போலக் காக்கிறது.', 'Learning protects us like a shield.'], a: [['🛡️', 50, 50, 100, 'shine'], ['🧒', 50, 76, 44, 'hop']] },
      { bg: 'night', cap: ['ஏழு பிறவிகளிலும் துணை வரும்!', 'It stays with us for seven lives!'], a: [['⭐', 14, 40, 34, 'twinkle'], ['⭐', 26, 30, 34, 'twinkle'], ['⭐', 38, 40, 34, 'twinkle'], ['7️⃣', 56, 56, 70, 'in'], ['🛡️', 80, 56, 50, 'bob']] }
    ],
    quiz: [
      ['கல்வி எத்தனை பிறவிகளுக்குத் துணை என்கிறது குறள்?', 'For how many lives does learning help, says this Kural?', [['ஏழு', 'seven'], ['ஒன்று', 'one'], ['இரண்டு', 'two']], 0],
      ['“ஏமாப்பு” என்றால் என்ன?', 'What does “emaappu” mean?', [['பாதுகாப்பு', 'protection'], ['ஏமாற்றம்', 'disappointment'], ['பசி', 'hunger']], 0]
    ],
    review: 'draft'
  },
  399: {
    words: [['தாம் இன்புறுவது', 'தாம் மகிழ்வது', 'what makes them happy'], ['உலகு இன்புற', 'உலகமும் மகிழ', 'the world being happy too'], ['கண்டு', 'பார்த்து', 'seeing'],
      ['காமுறுவர்', 'மேலும் விரும்புவர்', 'love it more'], ['கற்றறிந்தார்', 'கற்று அறிந்தவர்கள்', 'learned people']],
    ta: 'தாம் கற்றுப் பெறும் மகிழ்ச்சி உலகத்தையும் மகிழ்விப்பதைப் பார்த்து, கற்றவர்கள் கல்வியை மேலும் விரும்புவார்கள்.',
    en: 'When learned people see that the joy they get from learning makes the world happy too, they love learning even more.',
    life: ['நாம் கற்றதை நண்பர்களுக்குச் சொல்லிக் கொடுப்போம்; இருவரும் மகிழ்வோம்.', 'Let us teach our friends what we learn; then we are both happy.'],
    scene: [
      { bg: 'class', cap: ['குழந்தை கற்று மகிழ்கிறது.', 'The child learns and feels happy.'], a: [['😊', 40, 60, 66, 'hop'], ['📖', 62, 64, 48, 'in']] },
      { bg: 'class', cap: ['கற்றதை நண்பர்களுக்குச் சொல்லித் தருகிறது.', 'The child teaches friends what they learned.'], a: [['🧒', 28, 60, 60, 'bob'], ['💬', 46, 34, 40, 'float'], ['👧', 64, 64, 54, 'hop'], ['👦', 82, 64, 54, 'hop']] },
      { bg: 'sky', cap: ['உலகமே மகிழ்வதைப் பார்த்து, கல்வியை இன்னும் விரும்புகிறது!', 'Seeing everyone happy, the child loves learning even more!'], a: [['🌍', 50, 52, 90, 'spin'], ['💗', 26, 30, 40, 'float'], ['💗', 74, 30, 40, 'float']] }
    ],
    quiz: [
      ['கற்றவர்கள் ஏன் கல்வியை மேலும் விரும்புகிறார்கள்?', 'Why do learned people love learning even more?', [['அது உலகையும் மகிழ்விப்பதால்', 'because it makes the world happy too'], ['அது கடினமாக இருப்பதால்', 'because it is hard'], ['பரிசு கிடைப்பதால் மட்டும்', 'only for prizes']], 0],
      ['“காமுறுவர்” என்றால் என்ன?', 'What does “kaamuruvar” mean?', [['விரும்புவர்', 'they love it'], ['வெறுப்பர்', 'they hate it'], ['மறப்பர்', 'they forget it']], 0]
    ],
    review: 'draft'
  },
  400: {
    words: [['கேடு இல்', 'அழியாத', 'never destroyed'], ['விழுச்செல்வம்', 'சிறந்த செல்வம்', 'the best treasure'], ['கல்வி', 'கல்வி', 'learning'],
      ['ஒருவற்கு', 'ஒருவருக்கு', 'for a person'], ['மாடு', 'செல்வம்', 'wealth'], ['அல்ல மற்றையவை', 'மற்றவை செல்வம் அல்ல', 'other things are not']],
    ta: 'ஒருவருக்கு அழியாத சிறந்த செல்வம் கல்வி ஒன்றுதான். மற்றவை உண்மையான செல்வம் அல்ல.',
    en: 'Learning is the best treasure, one that can never be lost or destroyed. Other things are not real wealth.',
    life: ['பொம்மைகள் உடையலாம்; ஆனால் கற்றது என்றும் நம்மிடம் இருக்கும்.', 'Toys can break, but what we learn stays with us for ever.'],
    scene: [
      { bg: 'home', cap: ['பணமும் பொம்மைகளும் உள்ளன.', 'Here are coins and toys.'], a: [['🪙', 28, 56, 50, 'in'], ['🧸', 50, 58, 56, 'in'], ['💰', 72, 58, 56, 'in']] },
      { bg: 'home', cap: ['அவை தொலையலாம், உடையலாம்.', 'They can get lost or broken.'], a: [['🪙', 28, 56, 50, 'away'], ['🧸', 50, 58, 56, 'away'], ['💰', 72, 58, 56, 'away']] },
      { bg: 'sky', cap: ['கல்வி என்றும் அழியாத செல்வம்!', 'Learning is a treasure that is never lost!'], a: [['📖', 50, 54, 100, 'shine'], ['✨', 24, 30, 36, 'twinkle'], ['✨', 76, 30, 36, 'twinkle'], ['🧒', 80, 72, 44, 'hop']] }
    ],
    quiz: [
      ['அழியாத செல்வம் எது?', 'Which treasure is never lost?', [['கல்வி', 'learning'], ['பணம்', 'money'], ['பொம்மை', 'a toy']], 0],
      ['இந்தக் குறளில் “மாடு” என்றால் என்ன?', 'In this Kural, what does “maadu” mean?', [['செல்வம்', 'wealth'], ['பசு', 'a cow'], ['வீடு', 'a house']], 0]
    ],
    review: 'draft'
  }

};

/* Recorded recitations (optional): Kural number → file in assets/audio/kural/. Until a Kural has a
   recording, the device's Tamil voice reads it. Only add recordings you have the right to publish. */
const KURAL_AUDIO = {};
