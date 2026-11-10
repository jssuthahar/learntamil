/* Learn Tamil — data: everything the app says or shows to a child, outside the learning content.
   Tamil first, English second. Edit the words here — not in the code.
   {name}-style placeholders are filled in by fmt() (core/dom.js).
   Not here, on purpose: the page markup in index.html (search engines read it), the certificate
   question templates (features/certificate/), and grown-up screens (Parent corner, chat, support note). */

const TEXT = {
  /* Kili and greetings */
  hello: 'வணக்கம்! வா, தமிழ் கற்போம்!',          // Kili, when tapped
  greet: 'வணக்கம்! 👋',
  greetName: 'வணக்கம், {name}! 👋',
  congrats: 'வாழ்த்துகள்!',

  /* Praise after a right answer: [Tamil, English] */
  praise: [
    ['அருமை!', 'Excellent!'], ['நன்று!', 'Good job!'], ['மிகவும் நன்று!', 'Very good!'],
    ['சரியான விடை!', 'Correct answer!'], ['மிகச் சிறப்பு!', 'Superb!']
  ],
  bigPraise: [['அருமை!', 'Excellent!'], ['மிகச் சிறப்பு!', 'Superb!']],   // a round or picture finished
  great: 'அருமை!', good: 'நன்று!',

  /* After a wrong answer — always gentle */
  tryAgain: ['பரவாயில்லை, மீண்டும் முயற்சி செய்!', 'Try again'],
  noWorries: ['பரவாயில்லை!', 'Keep practising'],

  /* Celebrations */
  goalDone: ['இன்றைய இலக்கு முடிந்தது!', 'Daily goal done! {goal} things learned today · +10 🪙'],
  levelUp: ['நிலை உயர்ந்தது! · Level up!', 'Kili is now {ta} · {en} (Level {n})'],
  newBadge: ['புதிய பதக்கம்!', 'New badge!'],
  myRewards: ['என் பரிசுகள்', 'My rewards'],
  tokens: ['நாணயங்கள்', 'tokens'],

  /* Letter games */
  buildAsk: ['சரியான எழுத்தைத் தேர்ந்தெடு', 'Pick the letter these two make'],
  listenAsk: ['கேட்டுச் சரியான எழுத்தைத் தொடு', 'Listen, then tap the letter you heard'],

  /* Question games: title and what it asks */
  questionGames: {
    quiz:    ['தமிழ் வினாடி வினா', 'Mixed questions — letters, words, spelling and stories'],
    picture: ['படம் பார், சொல்லைத் தேர்ந்தெடு', 'Look at the picture and pick the Tamil word'],
    topics:  ['எண்கள், நிறங்கள், கிழமைகள்', 'Numbers, colours, days, animals, opposites, months and more'],
    spell:   ['எழுத்துக்கூட்டல்', 'Missing letters, jumbled letters and spelling'],
    story:   ['வாக்கியம் படி', 'Read sentences from the stories']
  },

  /* Trace */
  traceOffLine: ['கோட்டுக்குள் எழுது!', 'Try to stay on the letter'],
  traceScribble: ['மெதுவாக, கோட்டின் மேல் எழுது', 'Trace slowly along the letter — tap ↺ to try again'],
  traceKeepGoing: ['நன்று! தொடர்ந்து எழுது', 'Keep going'],

  /* Stories and rhymes */
  readToMe: 'படித்துக் காட்டு',
  stop: ['நிறுத்து', 'Stop'],
  sing: ['பாடு', 'Sing along'],
  readStory: ['கதை படி', 'Read the story'],

  /* Say it back */
  sayHelp: ['கேள், பிறகு நீ சொல்!', 'Listen, then say it yourself'],
  correctSound: 'சரியான ஒலி',
  myVoice: 'என் குரல்',

  /* Little ones */
  littleHello: 'வா, விளையாடலாம்!',
  littleThemes: [   // topic ids from data/words.js, plus 'vowels'
    { id: 'animals', ic: '🦁', label: 'Animals' },
    { id: 'birds', ic: '🦜', label: 'Birds' },
    { id: 'food', ic: '🍎', label: 'Fruits and food' },
    { id: 'vehicles', ic: '🚌', label: 'Vehicles' },
    { id: 'body', ic: '👂', label: 'Body' },
    { id: 'vowels', ic: 'அ', label: 'Vowels' }
  ],

  /* Family */
  whoIsLearning: ['யார் படிக்கிறார்கள்?', 'Who is learning?'],
  newSticker: ['புதிய ஸ்டிக்கர்!', 'New sticker!'],
  stickerBook: ['என் ஸ்டிக்கர் புத்தகம்', 'My sticker book'],
  breakTime: ['கொஞ்சம் ஓய்வெடு!', 'Time for a little break! Stretch 🙆, drink some water 💧 and rest your eyes 👀.'],
  backToLearning: ['மீண்டும் விளையாடு', 'Back to learning'],

  /* Certificate (printed on the PDF) */
  certificate: {
    title: 'சான்றிதழ்',
    presented: 'இந்தச் சான்றிதழ் பெருமையுடன் வழங்கப்படுகிறது · This certificate is proudly presented to',
    level: 'நிலை',
    date: 'Date · தேதி',
    id: 'Certificate ID · சான்றிதழ் எண்',
    name: 'பெயர்'
  }
};
