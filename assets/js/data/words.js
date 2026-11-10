/* Learn Tamil — data: picture words and word topics.
   Used by Reading, games, certificates, guide pages and printables. */

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
    ['பால்', '🥛', 'milk'], ['சோறு', '🍚', 'cooked rice'], ['முட்டை', '🥚', 'egg'] ] },
  { id: 'animals', ic: '🦁', ta: 'விலங்குகள்', en: 'Animals', words: [
    ['சிங்கம்', '🦁', 'lion'], ['புலி', '🐯', 'tiger'], ['யானை', '🐘', 'elephant'], ['குரங்கு', '🐒', 'monkey'],
    ['மான்', '🦌', 'deer'], ['கரடி', '🐻', 'bear'], ['நாய்', '🐕', 'dog'], ['பூனை', '🐈', 'cat'],
    ['பசு', '🐄', 'cow'], ['குதிரை', '🐴', 'horse'], ['ஆடு', '🐐', 'goat'], ['முயல்', '🐇', 'rabbit'] ] },
  { id: 'birds', ic: '🦜', ta: 'பறவைகள்', en: 'Birds', words: [
    ['கிளி', '🦜', 'parrot'], ['மயில்', '🦚', 'peacock'], ['கோழி', '🐔', 'hen'], ['வாத்து', '🦆', 'duck'],
    ['ஆந்தை', '🦉', 'owl'], ['புறா', '🕊️', 'dove, pigeon'], ['கழுகு', '🦅', 'eagle'], ['அன்னம்', '🦢', 'swan'], ['குருவி', '🐦', 'sparrow'] ] },
  { id: 'vehicles', ic: '🚌', ta: 'வாகனங்கள்', en: 'Vehicles', words: [
    ['மிதிவண்டி', '🚲', 'bicycle'], ['பேருந்து', '🚌', 'bus'], ['மகிழுந்து', '🚗', 'car · also கார்'], ['தொடர்வண்டி', '🚆', 'train · also ரயில்'],
    ['வானூர்தி', '✈️', 'aeroplane · also விமானம்'], ['கப்பல்', '🚢', 'ship'], ['படகு', '⛵', 'boat'], ['சரக்குந்து', '🚚', 'lorry, truck'] ] },
  { id: 'shapes', ic: '🔺', ta: 'வடிவங்கள்', en: 'Shapes', words: [
    ['வட்டம்', '⚪', 'circle'], ['சதுரம்', '🟥', 'square'], ['முக்கோணம்', '🔺', 'triangle'], ['செவ்வகம்', '▬', 'rectangle'],
    ['நட்சத்திரம்', '⭐', 'star'], ['இதயம்', '❤️', 'heart'] ] },
  { id: 'opposites', ic: '↔️', ta: 'எதிர்ச்சொற்கள்', en: 'Opposites', words: [
    ['பெரிய', '🐘', 'big · opposite of சிறிய'], ['சிறிய', '🐭', 'small · opposite of பெரிய'], ['பகல்', '☀️', 'day · opposite of இரவு'], ['இரவு', '🌙', 'night · opposite of பகல்'],
    ['சூடு', '🔥', 'hot · opposite of குளிர்'], ['குளிர்', '❄️', 'cold · opposite of சூடு'], ['மேலே', '⬆️', 'up · opposite of கீழே'], ['கீழே', '⬇️', 'down · opposite of மேலே'],
    ['உள்ளே', '📥', 'inside · opposite of வெளியே'], ['வெளியே', '📤', 'outside · opposite of உள்ளே'] ] },
  { id: 'months', ic: '🗓️', ta: 'தமிழ் மாதங்கள்', en: 'Tamil months', words: [
    ['சித்திரை', '🗓️', 'month 1 · mid-April to mid-May'], ['வைகாசி', '🗓️', 'month 2 · mid-May to mid-June'], ['ஆனி', '🗓️', 'month 3 · mid-June to mid-July'],
    ['ஆடி', '🗓️', 'month 4 · mid-July to mid-August'], ['ஆவணி', '🗓️', 'month 5 · mid-August to mid-September'], ['புரட்டாசி', '🗓️', 'month 6 · mid-September to mid-October'],
    ['ஐப்பசி', '🗓️', 'month 7 · mid-October to mid-November'], ['கார்த்திகை', '🗓️', 'month 8 · mid-November to mid-December'], ['மார்கழி', '🗓️', 'month 9 · mid-December to mid-January'],
    ['தை', '🗓️', 'month 10 · mid-January to mid-February'], ['மாசி', '🗓️', 'month 11 · mid-February to mid-March'], ['பங்குனி', '🗓️', 'month 12 · mid-March to mid-April'] ] }
];
