/* Learn Tamil — data: Aathichoodi and sing-along rhymes (public domain).
   lines: [Tamil, English meaning]. */

/* ---------- Aathichoodi (ஆத்திசூடி) by Avvaiyar — public domain. One line for each vowel and ஃ.
   [line, simple English meaning]. ---------- */
const AATHICHOODI = [
  ['அறம் செய விரும்பு', 'Love to do good.'],
  ['ஆறுவது சினம்', 'Anger must cool down.'],
  ['இயல்வது கரவேல்', 'Do not hide what you can give.'],
  ['ஈவது விலக்கேல்', 'Do not stop others from giving.'],
  ['உடையது விளம்பேல்', 'Do not boast about what you have.'],
  ['ஊக்கமது கைவிடேல்', 'Never give up trying.'],
  ['எண் எழுத்து இகழேல்', 'Never look down on numbers and letters.'],
  ['ஏற்பது இகழ்ச்சி', 'Begging is shameful.'],
  ['ஐயம் இட்டு உண்', 'Share food with the needy, then eat.'],
  ['ஒப்புரவு ஒழுகு', 'Live in harmony with everyone.'],
  ['ஓதுவது ஒழியேல்', 'Never stop learning.'],
  ['ஔவியம் பேசேல்', 'Do not speak with jealousy.'],
  ['அஃகம் சுருக்கேல்', 'Do not cheat when measuring grain.']
];

/* ---------- Rhymes (public domain): sing along line by line. lines: [Tamil, English meaning] ---------- */
const RHYMES = [
  { id: 'nila', ic: '🌙', title: 'நிலா நிலா ஓடி வா', en: 'Moon, moon, come running', by: 'Traditional', lines: [
    ['நிலா நிலா ஓடி வா', 'Moon, moon, come running.'],
    ['நில்லாமல் ஓடி வா', 'Come running without stopping.'],
    ['மலை மேலே ஏறி வா', 'Climb over the hill and come.'],
    ['மல்லிகைப் பூ கொண்டு வா', 'Bring a jasmine flower.'] ] },
  { id: 'paappa', ic: '🧒', title: 'ஓடி விளையாடு பாப்பா', en: 'Run and play, little one', by: 'Mahakavi Bharathiyar · பாப்பா பாட்டு', lines: [
    ['ஓடி விளையாடு பாப்பா', 'Run and play, little one.'],
    ['ஓய்ந்திருக்க லாகாது பாப்பா', 'Do not sit idle, little one.'],
    ['கூடி விளையாடு பாப்பா', 'Play together with others, little one.'],
    ['ஒரு குழந்தையை வையாதே பாப்பா', 'Never scold another child, little one.'],
    ['சின்னஞ் சிறு குருவி போலே', 'Like a tiny little sparrow,'],
    ['நீ திரிந்து பறந்துவா பாப்பா', 'flutter and fly around, little one.'],
    ['வன்னப் பறவைகளைக் கண்டு', 'When you see colourful birds,'],
    ['நீ மனதில் மகிழ்ச்சிகொள்ளு பாப்பா', 'be happy in your heart, little one.'] ] },
  { id: 'aathichoodi', ic: '🌺', title: 'ஆத்திசூடி', en: 'Aathichoodi — one wise line for each vowel', by: 'Avvaiyar · ஔவையார்', lines: AATHICHOODI }
];
