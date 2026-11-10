/* Learn Tamil — data: badges, Kili's levels and certificate levels.
   Only names live here. When a badge is earned is decided in features/rewards/progress.js (BADGE_RULES);
   the questions for each certificate level are in features/certificate/certificate.js. */

/* Badges 🏅 — id must match a rule in BADGE_RULES. */
const BADGES = [
  { id: 'first', ic: '🌱', ta: 'முதல் அடி', en: 'First step — first right answer' },
  { id: 'c10', ic: '⭐', ta: '10 சரியான விடைகள்', en: '10 right answers' },
  { id: 'c50', ic: '🌟', ta: '50 சரியான விடைகள்', en: '50 right answers' },
  { id: 'c100', ic: '🏆', ta: '100 சரியான விடைகள்', en: '100 right answers' },
  { id: 'streak5', ic: '🔥', ta: 'தொடர்ந்து 5 சரி', en: '5 right in a row' },
  { id: 'streak10', ic: '🚀', ta: 'தொடர்ந்து 10 சரி', en: '10 right in a row' },
  { id: 'vowels', ic: '🔤', ta: '12 உயிர் எழுத்துகள்', en: 'Heard all 12 vowels' },
  { id: 'mei', ic: '🧱', ta: '18 மெய் எழுத்துகள்', en: 'Heard all 18 consonants' },
  { id: 'l50', ic: '🧭', ta: '50 எழுத்துகள்', en: 'Heard 50 different letters' },
  { id: 'l247', ic: '👑', ta: '247 எழுத்துகள்', en: 'Heard all 247 letters' },
  { id: 'read10', ic: '📖', ta: '10 சொற்கள் படித்தாய்', en: 'Read 10 words' },
  { id: 'story1', ic: '📚', ta: 'ஒரு கதை முடித்தாய்', en: 'Finished a story' },
  { id: 'story5', ic: '🏰', ta: '5 கதைகளும் முடித்தாய்', en: 'Finished all 5 stories' },
  { id: 'memory', ic: '🃏', ta: 'நினைவாற்றல்', en: 'Memory master — finished a Memory game' },
  { id: 'balloon', ic: '🎈', ta: '10 பலூன்கள் உடைத்தாய்', en: 'Popped 10 balloons in one game' },
  { id: 'builder', ic: '🧩', ta: '5 சொற்கள் அமைத்தாய்', en: 'Built 5 words' },
  { id: 'spin', ic: '🎡', ta: 'சக்கர நட்சத்திரம்', en: 'Spin star — 5 right on the wheel' },
  { id: 't100', ic: '🪙', ta: '100 நாணயங்கள்', en: 'Collected 100 tokens' },
  { id: 'day3', ic: '🔥', ta: '3 நாள் தொடர்ச்சி', en: 'Learned 3 days in a row' },
  { id: 'day7', ic: '📆', ta: '7 நாள் தொடர்ச்சி', en: 'Learned 7 days in a row' },
  { id: 'goal', ic: '🎯', ta: 'இன்றைய இலக்கு', en: 'Finished a daily goal' },
  { id: 'trace5', ic: '✍️', ta: '5 எழுத்துகள் எழுதினாய்', en: 'Traced 5 different letters' },
  { id: 'say5', ic: '🎤', ta: '5 முறை சொன்னாய்', en: 'Said 5 letters or words aloud' },
  { id: 'rhyme', ic: '🎵', ta: 'பாடல் பாடினாய்', en: 'Sang along to a rhyme' },
  { id: 'colour', ic: '🎨', ta: 'வண்ணம் தீட்டினாய்', en: 'Coloured a whole picture' },
  { id: 'cert1', ic: '🎓', ta: 'முதல் சான்றிதழ்', en: 'Earned your first certificate' },
  { id: 'cert5', ic: '👑', ta: '5 சான்றிதழ்கள்', en: 'Earned 5 certificates' },
  { id: 'cert10', ic: '🏆', ta: '10 சான்றிதழ்களும்', en: 'Earned all 10 certificates' },
  { id: 'gift10', ic: '🎁', ta: '10 நாள் பரிசுகள்', en: 'Opened 10 daily gifts' },
  { id: 'path', ic: '🗺️', ta: 'கற்றல் பயணம் முடிந்தது', en: 'Finished a whole learning path' },
  /* Thirukkural milestones (#/kural) */
  { id: 'kural10', ic: '📜', ta: 'முதல் 10 குறள்கள்', en: 'Learned your first 10 Thirukkural couplets' },
  { id: 'kuralCh', ic: '📗', ta: 'முதல் அதிகாரம்', en: 'Learned a whole Thirukkural chapter' },
  { id: 'kural100', ic: '🪔', ta: '100 குறள்கள்', en: 'Learned 100 Kurals' },
  { id: 'kural500', ic: '🏵️', ta: '500 குறள்கள்', en: 'Learned 500 Kurals' },
  { id: 'kural1330', ic: '👑', ta: '1330 குறள்களும்', en: 'Learned all 1,330 Kurals' }
];

/* Age groups 👶🧒🧑‍🎓 — each child picks one; it chooses which learning path they see.
   The cards on the home page (index.html) repeat ages and titles so search engines can read them. */
const AGE_GROUPS = [
  { id: '3-5',  ic: '👶', ages: '3–5',  ta: 'சின்னஞ்சிறு',        en: 'Pictures, sounds and colours' },
  { id: '6-8',  ic: '🧒', ages: '6–8',  ta: 'எழுத்தும் சொல்லும்',  en: 'Letters, tracing and first words' },
  { id: '9-12', ic: '🧑‍🎓', ages: '9–12', ta: 'படிப்போம், எழுதுவோம்', en: 'Reading, spelling, stories and certificates' }
];

/* Lessons on each age group's learning path, in order.
   id must match a rule in LESSON_RULES (features/rewards/progress.js).
   go: '#/section', 'game:<id>' (a game in the Games hub) or 'rhymes' (the rhymes shelf). */
const LESSONS = {
  '3-5': [
    { id: 'k-little', ic: '👶', ta: '10 படங்களைக் கண்டுபிடி',     en: 'Find 10 pictures in Little ones',   go: '#/little' },
    { id: 'k-vowels', ic: '🌱', ta: '12 உயிர் எழுத்துகளைக் கேள்', en: 'Hear all 12 vowels',                go: '#/uyir' },
    { id: 'k-colour', ic: '🎨', ta: 'ஒரு படத்துக்கு வண்ணம் தீட்டு', en: 'Colour a picture',                  go: 'game:colour' },
    { id: 'k-memory', ic: '🃏', ta: 'நினைவு விளையாட்டை முடி',      en: 'Finish a Memory game',              go: 'game:memory' },
    { id: 'k-rhyme',  ic: '🎵', ta: 'ஒரு பாடல் பாடு',              en: 'Sing along to a rhyme',             go: 'rhymes' },
    { id: 'k-trace',  ic: '✍️', ta: '3 எழுத்துகளை எழுது',          en: 'Trace 3 letters with your finger',  go: 'game:trace' }
  ],
  '6-8': [
    { id: 'm-vowels',  ic: '🌱', ta: '12 உயிர் எழுத்துகளைக் கேள்', en: 'Hear all 12 vowels',               go: '#/uyir' },
    { id: 'm-mei',     ic: '🧱', ta: '18 மெய் எழுத்துகளைக் கேள்',  en: 'Hear all 18 consonants',           go: '#/mei' },
    { id: 'm-trace',   ic: '✍️', ta: '10 எழுத்துகளை எழுது',        en: 'Trace 10 different letters',       go: 'game:trace' },
    { id: 'm-correct', ic: '🧮', ta: '25 சரியான விடைகள்',          en: 'Get 25 answers right in the games', go: 'game:build' },
    { id: 'm-build',   ic: '🧩', ta: '5 சொற்களை அமை',             en: 'Build 5 words',                    go: 'game:words' },
    { id: 'm-read',    ic: '📖', ta: '10 சொற்களைப் படி',           en: 'Read 10 words',                    go: '#/reading' },
    { id: 'm-story',   ic: '📚', ta: 'ஒரு கதையை முடி',             en: 'Finish a story',                   go: '#/stories' },
    { id: 'm-cert',    ic: '🎓', ta: 'முதல் சான்றிதழ் பெறு',       en: 'Earn your first certificate',      go: '#/certificate' }
  ],
  '9-12': [
    { id: 's-letters', ic: '🧭', ta: '100 எழுத்துகளைக் கேள்',      en: 'Hear 100 different letters',       go: '#/uyirmei' },
    { id: 's-read',    ic: '📖', ta: '30 சொற்களைப் படி',           en: 'Read 30 words',                    go: '#/reading' },
    { id: 's-stories', ic: '📚', ta: '3 கதைகளை முடி',              en: 'Finish 3 stories',                 go: '#/stories' },
    { id: 's-rhymes',  ic: '🎵', ta: '3 பாடல்கள் பாடு',            en: 'Sing 3 rhymes',                    go: 'rhymes' },
    { id: 's-say',     ic: '🎤', ta: '10 முறை சொல்லிப் பார்',      en: 'Say 10 letters or words aloud',    go: '#/reading' },
    { id: 's-correct', ic: '✏️', ta: '100 சரியான விடைகள்',         en: 'Get 100 answers right (try Spelling)', go: 'game:spell' },
    { id: 's-cert3',   ic: '🎓', ta: '3 சான்றிதழ்கள் பெறு',        en: 'Earn 3 certificates',              go: '#/certificate' },
    { id: 's-cert6',   ic: '🏆', ta: '6 சான்றிதழ்கள் பெறு',        en: 'Earn 6 certificates',              go: '#/certificate' }
  ]
};

/* Kili the parrot grows with every token earned: at = tokens needed. */
const STAGES = [
  { at: 0,   ic: '🥚', ta: 'முட்டை',            en: 'Egg' },
  { at: 25,  ic: '🐣', ta: 'குஞ்சு',             en: 'Hatchling' },
  { at: 75,  ic: '🐥', ta: 'சிறு பறவை',          en: 'Little bird' },
  { at: 150, ic: '🦜', ta: 'கிளி',               en: 'Parrot' },
  { at: 300, ic: '🌟', ta: 'நட்சத்திரக் கிளி',    en: 'Star parrot' },
  { at: 500, ic: '👑', ta: 'அரசக் கிளி',          en: 'Royal parrot' }
];

/* Certificate levels 🎓 — title is printed on the certificate. total/pass default to 10/8. */
const CERT_LEVELS = [
  { n: 1, ic: '🌱', ta: 'உயிர் எழுத்துகள்', en: 'Tamil vowels', title: 'தொடக்க நிலை', titleEn: 'Starter' },
  { n: 2, ic: '🧱', ta: 'மெய் எழுத்துகள்', en: 'Tamil consonants', title: 'அடிப்படை நிலை', titleEn: 'Beginner' },
  { n: 3, ic: '🧩', ta: 'உயிர்மெய் எழுத்துகள்', en: 'Uyirmei letters', title: 'வளர்ச்சி நிலை', titleEn: 'Explorer' },
  { n: 4, ic: '📖', ta: 'சொற்கள் படித்தல்', en: 'Reading words', title: 'வாசிப்பு நிலை', titleEn: 'Reader' },
  { n: 5, ic: '👑', ta: 'தமிழ் எழுத்து வல்லுநர்', en: 'Tamil alphabet master', title: 'சிறப்பு நிலை', titleEn: 'Master' },
  { n: 6, ic: '🔢', ta: 'எண்கள், நிறங்கள், கிழமைகள்', en: 'Numbers, colours and days', title: 'சொல் நிலை', titleEn: 'Word Explorer' },
  { n: 7, ic: '🏡', ta: 'குடும்பம், உடல், உணவு', en: 'Family, body and food', title: 'அன்றாடச் சொல் நிலை', titleEn: 'Everyday Words' },
  { n: 8, ic: '✏️', ta: 'எழுத்துக்கூட்டல்', en: 'Spelling words', title: 'எழுத்துக்கூட்டல் நிலை', titleEn: 'Speller' },
  { n: 9, ic: '📚', ta: 'வாக்கியம் படித்தல்', en: 'Reading sentences', title: 'வாசிப்புத் திறன் நிலை', titleEn: 'Story Reader' },
  { n: 10, ic: '🏆', ta: 'தமிழ்ச் சாதனையாளர்', en: 'Tamil champion', title: 'சாதனை நிலை', titleEn: 'Champion', total: 15, pass: 12 }
];
