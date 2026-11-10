/* Learn Tamil — data: Tamil festivals.
   pages use the same format as STORIES; words: [word, emoji, meaning]. */

/* ---------- Festivals (பண்டிகைகள்): a short read-aloud story and a few words each.
   pages use the same format as STORIES. ---------- */
const FESTIVALS = [
  { id: 'pongal', title: 'பொங்கல்', en: 'Pongal', cover: '🌾', lvl: 'Festival', pages: [
    ['🌾', 'தை மாதம் முதல் நாள் பொங்கல் பண்டிகை.', 'Pongal is on the first day of the month Thai.'],
    ['🏺', 'புதுப் பானையில் பால் பொங்கும். “பொங்கலோ பொங்கல்!” என்போம்.', 'Milk boils over in a new pot. We say “Pongalo Pongal!”'],
    ['☀️🙏', 'சூரியனுக்கு நன்றி சொல்வோம்.', 'We say thank you to the Sun.'],
    ['🐄', 'அடுத்த நாள் மாட்டுப் பொங்கல். மாடுகளுக்கு நன்றி சொல்வோம்.', 'The next day is Maattu Pongal. We thank the cows.'],
    ['😋', 'இனிப்புப் பொங்கல் சுவையாக இருக்கும்!', 'Sweet pongal is tasty!'] ],
    words: [['பொங்கல்', '🍚', 'pongal (rice dish)'], ['பானை', '🏺', 'pot'], ['கரும்பு', '🎋', 'sugarcane'], ['கோலம்', '✳️', 'kolam'], ['சூரியன்', '☀️', 'sun']] },
  { id: 'newyear', title: 'தமிழ்ப் புத்தாண்டு', en: 'Tamil New Year', cover: '🎉', lvl: 'Festival', pages: [
    ['🗓️', 'சித்திரை முதல் நாள் தமிழ்ப் புத்தாண்டு.', 'Tamil New Year is on the first day of Chithirai.'],
    ['🥭🌸', 'வீட்டில் பழங்களும் பூக்களும் வைப்போம்.', 'We place fruits and flowers at home.'],
    ['👵🤗', 'பெரியவர்களிடம் ஆசி பெறுவோம்.', 'We receive blessings from our elders.'],
    ['🗣️', '“புத்தாண்டு வாழ்த்துகள்!” என்று சொல்வோம்.', 'We say “Happy New Year!”'] ],
    words: [['புத்தாண்டு', '🎉', 'new year'], ['பழம்', '🥭', 'fruit'], ['பூ', '🌸', 'flower'], ['வாழ்த்து', '🤗', 'wishes, greeting']] },
  { id: 'deepavali', title: 'தீபாவளி', en: 'Deepavali', cover: '🪔', lvl: 'Festival', pages: [
    ['🪔', 'தீபாவளி விளக்குகளின் பண்டிகை.', 'Deepavali is the festival of lights.'],
    ['🛁', 'காலையில் எண்ணெய் தேய்த்துக் குளிப்போம்.', 'In the morning we have an oil bath.'],
    ['👕', 'புதுத் துணி அணிவோம்.', 'We wear new clothes.'],
    ['🍬', 'இனிப்புகளை எல்லோருடனும் பகிர்வோம்.', 'We share sweets with everyone.'],
    ['✨', 'இரவில் வீடு முழுவதும் ஒளிரும்!', 'At night the whole house shines bright!'] ],
    words: [['விளக்கு', '🪔', 'lamp'], ['இனிப்பு', '🍬', 'sweet'], ['புத்தாடை', '👕', 'new clothes'], ['மத்தாப்பு', '🎇', 'sparkler']] },
  { id: 'deepam', title: 'கார்த்திகை தீபம்', en: 'Karthigai Deepam', cover: '🔥', lvl: 'Festival', pages: [
    ['🗓️', 'கார்த்திகை மாதத்தில் கார்த்திகை தீபம் வரும்.', 'Karthigai Deepam comes in the month of Karthigai.'],
    ['🪔', 'வீடு முழுவதும் அகல் விளக்குகளை ஏற்றுவோம்.', 'We light clay lamps all around the house.'],
    ['😊', 'விளக்குகள் வரிசையாக அழகாக ஒளிரும்.', 'The lamps shine beautifully in rows.'] ],
    words: [['அகல் விளக்கு', '🪔', 'clay lamp'], ['தீபம்', '🔥', 'lamp flame'], ['ஒளி', '✨', 'light']] }
];
