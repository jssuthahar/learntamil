/* Learn Tamil — data: everything the app says or shows to a child, outside the learning content.
   Tamil first, English second. Edit the words here — not in the code.
   {name}-style placeholders are filled in by fmt() (core/dom.js).
   Not here, on purpose: the page markup in index.html (search engines read it), the certificate
   question templates (features/certificate/), and grown-up screens (Parent dashboard, chat, support note). */

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

  /* Classroom (#/classroom): Malar Akka teaches, three classmates listen, ask and help.
     [Tamil (spoken + shown), English (shown under it)]. Placeholders: {topic} {topicEn} {word} {en} {l} {r}. */
  classroom: {
    teacher: ['மலர் அக்கா', 'Malar Akka'],
    kids: [['நிலா', 'Nila'], ['கவின்', 'Kavin'], ['யாழினி', 'Yazhini']],
    all: ['எல்லோரும்', 'Everyone'],
    you: ['நீ', 'You'],
    vowelsTopic: ['உயிர் எழுத்துகள்', 'vowels'],
    pick: ['இன்று என்ன கற்போம்?', 'What shall we learn today?'],
    hello: ['வணக்கம் குழந்தைகளே!', 'Hello, children!'],
    kidsHello: ['வணக்கம் அக்கா!', 'Hello, Akka!'],
    today: ['இன்று நாம் {topic} கற்போம்.', 'Today we will learn {topicEn}.'],
    kidAsk: ['அக்கா, இது என்ன?', 'Akka, what is this?'],
    letterIs: ['இது {l}. {l} — {word}.', 'This is “{r}”, as in {word} — {en}.'],
    wordIs: ['இது {word}.', 'This is {word} — {en}.'],
    kidAgain: ['அக்கா, மீண்டும் சொல்லுங்கள்!', 'Akka, please say it again!'],
    sureAgain: ['சரி, கேளுங்கள்.', 'Sure, listen.'],
    kidSays: ['நான் சொல்கிறேன்: {word}!', 'Let me say it: {word}!'],
    together: ['எல்லோரும் சேர்ந்து சொல்லுங்கள்!', 'Everyone, say it together!'],
    youSay: ['நீயும் சொல்!', 'Now you say it too!'],
    gameTime: ['இப்போது ஒரு சின்ன விளையாட்டு!', 'Now, a little game!'],
    whereIs: ['{word} எங்கே? தொட்டுக் காட்டு!', 'Where is {word}? Tap it!'],
    kidHint: ['பரவாயில்லை! இதோ, இங்கே இருக்கிறது.', 'That’s okay! Look, it’s here.'],
    kidYay: ['ஹைய்யா!', 'Yay!'],
    // games: read and pick
    readWhich: ['இதைப் படி! இது எந்தப் படம்?', 'Read this! Which picture is it?'],
    letterWhich: ['இந்த எழுத்தில் தொடங்கும் படம் எது?', 'Which picture starts with this letter?'],
    kidReads: ['நான் படிக்கிறேன்: {word}', 'Let me read it: {word}'],
    // games: what's missing?
    lookCarefully: ['நன்றாகப் பாருங்கள்!', 'Look carefully!'],
    closeEyes: ['கண்களை மூடுங்கள்!', 'Close your eyes!'],
    whatMissing: ['கண்களைத் திறங்கள்! எது காணவில்லை?', 'Open your eyes! What is missing?'],
    // games: is my friend right?
    kidClaim: ['இது {word}!', 'This is {word}!'],
    isRight: ['{name} சொல்வது சரியா?', 'Is {name} right?'],
    yes: ['சரி', 'Right'],
    no: ['தவறு', 'Not right'],
    kidWasRight: ['ஆம், {name} சொன்னது சரி!', 'Yes, {name} is right!'],
    actually: ['இது {word}.', 'This is {word} — {en}.'],
    kidThanks: ['ஓ! நன்றி!', 'Oh! Thank you!'],
    moreGames: ['இன்னும் விளையாடு', 'More games'],
    done: ['இன்றைய பாடம் முடிந்தது! நீ நன்றாகச் செய்தாய்!', 'Today’s lesson is finished! You did very well!'],
    kidsBye: ['நன்றி அக்கா!', 'Thank you, Akka!'],
    again: ['மீண்டும்', 'Again'],
    next: ['அடுத்த பாடம்', 'Next lesson'],
    lessons: ['பாடங்கள்', 'Lessons']
  },

  /* Family */
  whoIsLearning: ['யார் படிக்கிறார்கள்?', 'Who is learning?'],
  newSticker: ['புதிய ஸ்டிக்கர்!', 'New sticker!'],
  stickerBook: ['என் ஸ்டிக்கர் புத்தகம்', 'My sticker book'],
  breakTime: ['கொஞ்சம் ஓய்வெடு!', 'Time for a little break! Stretch 🙆, drink some water 💧 and rest your eyes 👀.'],
  backToLearning: ['மீண்டும் விளையாடு', 'Back to learning'],

  /* Daily gift 🎁 (Today card): opens once a day, after the first thing learned */
  giftLocked: ['இன்று ஒன்று கற்றால் பரிசு திறக்கும்', 'Learn one thing today to open your gift'],
  giftReady: ['இன்றைய பரிசு!', 'Tap to open today’s gift'],
  giftOpened: ['இன்றைய பரிசு கிடைத்தது!', 'Come back tomorrow for another gift'],
  giftWon: ['உனக்கு ஒரு பரிசு!', '+{n} 🪙 · {days}-day streak 🔥'],

  /* Learning path 🗺️ (age groups and lessons: data/rewards.js) */
  myPath: ['என் கற்றல் பயணம்', 'My learning path'],
  chooseAge: ['உன் வயது என்ன?', 'Choose an age group'],
  lessonsDone: ['பாடங்கள் முடிந்தன', 'lessons done'],
  pathNext: ['அடுத்து', 'Next'],
  pathDone: ['பயணம் முடிந்தது!', 'You finished the ages {ages} path! Try the next one 🚀'],
  go: ['போ', 'Go'],

  /* Settings ⚙️ (text size, contrast, sound) — used by children and grown-ups */
  settings: {
    title: ['அமைப்புகள்', 'Settings'],
    text: ['எழுத்து அளவு', 'Text size'],
    sizes: [['சாதாரணம்', 'Normal'], ['பெரியது', 'Large'], ['மிகப் பெரியது', 'Extra large']],
    contrast: ['உயர் மாறுபாடு', 'High contrast'],
    motion: ['குறைந்த அசைவு', 'Less movement'],
    sfx: ['விளையாட்டு ஒலிகள்', 'Game sounds'],
    rate: ['குரல் வேகம்', 'Voice speed'],
    volume: ['குரல் ஒலி அளவு', 'Voice volume'],
    tryVoice: ['குரலைக் கேள்', 'Try the voice'],
    voice: ['குரல்', 'Voice'],
    voiceAuto: ['தானாக', 'Automatic'],
    who: ['யார் பேசட்டும்?', 'Who speaks?'],
    cast: { woman: ['👩', 'அக்கா', 'Woman'], man: ['👨', 'அண்ணா', 'Man'], girl: ['👧', 'சிறுமி', 'Girl'], boy: ['👦', 'சிறுவன்', 'Boy'] },
    deviceVoice: ['சாதனக் குரல்', 'Device voice']
  },

  /* Thirukkural 📜 (#/kural). Lessons: data/kural-lessons.js · couplets: data/thirukkural.json */
  kural: {
    title: ['திருக்குறள் கற்போம்', 'Learn Thirukkural'],
    tagline: ['திருவள்ளுவரின் அறிவுரைகளைக் கதைகள், அசைவுப்படங்கள், விளையாட்டுகள் மூலம் கற்போம்.', 'Learn the wisdom of Thiruvalluvar through stories, animations and games.'],
    about: ['1,330 குறள்களைக் கண்டுபிடி! எளிய விளக்கம், கதை, விளையாட்டு மூலம் அவற்றின் பொருளைப் புரிந்துகொள்.', 'Discover 1,330 timeless couplets and learn what they mean through simple explanations, stories and fun activities.'],
    loading: ['குறள்கள் வருகின்றன…', 'Loading the Kurals…'],
    offline: ['குறள்களைத் திறக்க முடியவில்லை. இணையத்துடன் இணைத்து மீண்டும் முயற்சி செய்.', 'Could not open the Kurals. Connect to the internet and try again.'],
    retry: ['மீண்டும் முயற்சி செய்', 'Try again'],
    total: ['மொத்தக் குறள்கள்', 'Total Kurals'],
    learned: ['கற்ற குறள்கள்', 'Kurals learned'],
    chaptersDone: ['முடித்த அதிகாரங்கள்', 'Chapters completed'],
    streak: ['தொடர் நாள்கள்', 'Day streak'],
    badges: ['பதக்கங்கள்', 'Badges'],
    chapters: ['அதிகாரங்கள்', 'chapters'],
    kurals: ['குறள்கள்', 'Kurals'],
    start: ['கற்கத் தொடங்கு', 'Start learning'],
    continue: ['தொடர்ந்து கற்போம்', 'Continue learning'],
    today: ['இன்றைய குறள்', 'Kural of the day'],
    older: ['பெரியவர்களுடன் படிக்கவும்', 'For older children, with a grown-up'],
    kural: ['குறள்', 'Kural'],
    chapter: ['அதிகாரம்', 'Chapter'],
    listen: ['கேள்', 'Listen'],
    slow: ['மெதுவாக', 'Slowly'],
    repeat: ['சொல்லிப் பழகு', 'Say after me'],
    stop: ['நிறுத்து', 'Stop'],
    yourTurn: ['இப்போது நீ சொல்!', 'Now you say it!'],
    words: ['சொற்பொருள்', 'Word by word'],
    meaningTa: ['எளிய தமிழில் பொருள்', 'Meaning in simple Tamil'],
    meaningEn: ['ஆங்கிலத்தில் பொருள்', 'Meaning in English'],
    pope: ['ஆங்கில மொழிபெயர்ப்பு', 'Classic English verse translation by G. U. Pope (1886)'],
    soon: ['இந்தக் குறளுக்கு எளிய விளக்கம் விரைவில் வரும்.', 'A child-friendly meaning for this Kural is coming soon.'],
    story: ['அசைவுக் கதை', 'Animated story'],
    play: ['கதையைப் பார்', 'Watch the story'],
    again: ['மீண்டும் பார்', 'Watch again'],
    captionsEn: ['ஆங்கில வரிகள்', 'English captions'],
    narrate: ['கதை சொல்லும் குரல்', 'Narration'],
    noStory: ['இந்தக் குறளுக்கான கதை தயாராகிறது.', 'The story for this Kural is being made.'],
    life: ['வாழ்க்கையில் பயன்படுத்துவோம்', 'Use it in daily life'],
    check: ['புரிந்ததா? பார்ப்போம்!', 'Knowledge check'],
    learn: ['கற்றுக்கொண்டேன்', 'Mark as learned'],
    learnedOk: ['கற்றுக்கொண்டாய்!', 'Learned!'],
    bookmark: ['சேமி', 'Bookmark'],
    share: ['பகிர்', 'Share'],
    shareTitle: ['திருக்குறள் {n}', 'Thirukkural {n}'],
    saved: ['சேமிக்கப்பட்டது', 'Bookmarked'],
    prev: ['முந்தைய குறள்', 'Previous'],
    next: ['அடுத்த குறள்', 'Next'],
    prevCh: ['முந்தைய அதிகாரம்', 'Previous chapter'],
    nextCh: ['அடுத்த அதிகாரம்', 'Next chapter'],
    practise: ['வினாடி வினா', 'Practise quiz'],
    games: ['குறள் விளையாட்டுகள்', 'Thirukkural games'],
    marks: ['சேமித்த குறள்கள்', 'Bookmarked Kurals'],
    noMarks: ['இன்னும் எதுவும் சேமிக்கவில்லை. ☆ தொட்டுச் சேமி.', 'Nothing bookmarked yet. Tap ☆ on a Kural to save it.'],
    parents: ['பெற்றோர், ஆசிரியர்', 'Parents & teachers'],
    home: ['திருக்குறள்', 'Thirukkural'],
    draft: ['வரைவு', 'Draft meaning, awaiting a Tamil teacher’s review'],
    missing: ['விடுபட்ட சொல் எது?', 'Which word is missing?'],
    whichChapter: ['இந்தக் குறள் எந்த அதிகாரத்தில் உள்ளது?', 'Which chapter is this Kural in?'],
    allDone: ['எல்லாக் கேள்விகளும் முடிந்தன!', 'All questions done!'],
    gameList: {
      complete: ['🧩', 'குறளை நிறைவு செய்', 'Complete the Kural'],
      match: ['🔗', 'பொருளைப் பொருத்து', 'Match the meaning'],
      arrange: ['🔀', 'சொற்களை வரிசைப்படுத்து', 'Arrange the words'],
      story: ['🎬', 'கதையைக் கண்டுபிடி', 'Identify the story'],
      listen: ['👂', 'கேட்டுக் கண்டுபிடி', 'Listen and identify'],
      daily: ['📅', 'இன்றைய குறள் சவால்', 'Daily Kural challenge']
    },
    asks: {
      complete: ['விடுபட்ட சொல்லைத் தேர்ந்தெடு', 'Pick the missing word'],
      match: ['இந்தப் பொருள் எந்தக் குறளுக்கு?', 'Which Kural has this meaning?'],
      arrange: ['சொற்களைச் சரியான வரிசையில் தொடு', 'Tap the words in the right order'],
      story: ['இந்தக் கதை எந்தக் குறளைச் சொல்கிறது?', 'Which Kural does this story show?'],
      listen: ['கேள். இது எந்தக் குறள்?', 'Listen. Which Kural is it?']
    },
    hearAgain: ['மீண்டும் கேள்', 'Hear it again'],
    nextQ: ['அடுத்தது', 'Next'],
    dailyDone: ['இன்றைய சவால் முடிந்தது!', 'Today’s challenge is done! Come back tomorrow for a new Kural.'],
    allChapters: ['133 அதிகாரங்கள்', 'All 133 chapters'],
    divisions: ['மூன்று பால்கள்', 'The 3 divisions'],
    /* "Read as a book": all 1,330 Kurals, one page at a time */
    book: {
      title: ['புத்தகமாகப் படி', 'Read as a book'],
      sub: ['1,330 குறள்களையும் ஒவ்வொன்றாகப் படி', 'All 1,330 Kurals, one page at a time'],
      page: ['பக்கம்', 'Page'],
      prev: ['முந்தைய பக்கம்', 'Previous page'],
      next: ['அடுத்த பக்கம்', 'Next page'],
      auto: ['தானாகப் படி', 'Read to me'],
      pause: ['நிறுத்து', 'Pause'],
      goTo: ['அதிகாரத்துக்குச் செல்', 'Go to chapter'],
      learn: ['இந்தக் குறளைக் கற்போம்', 'Learn this Kural'],
      end: ['நூல் முடிந்தது! வாழ்த்துகள்!', 'You reached the end of the book. Well done!'],
      swipe: ['பக்கத்தைப் புரட்ட இழு', 'Swipe or use ← → to turn the page']
    },
    /* the guided lesson on each Kural */
    steps: { words: ['சொற்கள்', 'Words'], meaning: ['பொருள்', 'Meaning'], story: ['கதை', 'Story'], life: ['வாழ்க்கை', 'Use it'], quiz: ['வினா', 'Quiz'] },
    stepNext: ['அடுத்து', 'Next'],
    stepBack: ['பின்', 'Back'],
    tapWord: ['சொல்லைத் தொட்டுக் கேள்.', 'Tap a word to hear it.'],
    lessonDone: ['அருமை! இந்தக் குறளைக் கற்றுக்கொண்டாய்!', 'Wonderful! You learned this Kural!'],
    kidsStart: ['இங்கே தொடங்கு', 'Start here: chapters with stories'],
    lessonsReady: ['{n} குறள்களுக்குக் கதைகள்', 'Stories for {n} Kurals'],
    /* the menu of thirukkural.html: [icon, Tamil, English] */
    nav: { learn: ['📖', 'கற்போம்', 'Learn'], games: ['🎮', 'விளையாட்டு', 'Games'], print: ['🖨️', 'அச்சிடு', 'Print'],
           certificate: ['🎓', 'சான்றிதழ்', 'Certificate'], parents: ['👪', 'பெற்றோர்', 'Parents'] },
    /* 🖨️ Print: worksheets made in the browser for any chapter */
    print: {
      title: ['குறள் அச்சுத் தாள்கள்', 'Thirukkural printables'],
      intro: ['ஒரு அதிகாரத்தைத் தேர்ந்தெடு, தாளைத் தேர்ந்தெடு, அச்சிடு.', 'Choose a chapter and a sheet, then print it or save it as PDF.'],
      chapter: ['அதிகாரம்', 'Chapter'],
      sheets: {
        couplets: ['குறள்களும் பொருளும்', 'The 10 Kurals with meaning'],
        copy: ['எழுதிப் பழகு', 'Copywork: read, trace and write'],
        missing: ['விடுபட்ட சொல்', 'Fill in the missing word (with answers)']
      },
      go: ['அச்சிடு', 'Print / save as PDF'],
      name: ['பெயர்', 'Name'],
      date: ['தேதி', 'Date'],
      answers: ['விடைகள்', 'Answers'],
      words: ['சொற்கள்', 'Word box'],
      howCopy: ['படி, மெல்லிய எழுத்தின் மேல் எழுது, பிறகு நீயே எழுது.', 'Read it, trace the light letters, then write it yourself.']
    },
    /* 🎓 Certificate: a 10-question test on one chapter; 8 right earns the certificate */
    cert: {
      title: ['குறள் சான்றிதழ்', 'Thirukkural certificate'],
      intro: ['ஒரு அதிகாரத்தைக் கற்றுக்கொண்டாயா? 10 கேள்விகளில் 8 சரியாகச் சொன்னால் சான்றிதழ் கிடைக்கும்!', 'Learned a chapter? Answer 8 of 10 questions right to earn its certificate.'],
      pick: ['அதிகாரத்தைத் தேர்ந்தெடு', 'Choose a chapter'],
      learnedHint: ['✅ = நீ கற்ற குறள்கள்', '✅ = Kurals you have learned'],
      start: ['தேர்வைத் தொடங்கு', 'Start the test'],
      earned: ['சான்றிதழ் பெற்றாய்', 'Certificate earned'],
      question: ['கேள்வி', 'Question'],
      passed: ['வாழ்த்துகள்! நீ வென்றாய்!', 'Congratulations! You passed!'],
      notYet: ['பரவாயில்லை! மீண்டும் படித்து முயற்சி செய்.', 'Nearly there! Read the chapter again and try once more.'],
      score: ['மதிப்பெண்', 'Score'],
      name: ['உன் பெயர்', 'Your name'],
      pdf: ['சான்றிதழ் PDF', 'Download PDF'],
      png: ['படமாகச் சேமி', 'Save image'],
      again: ['மீண்டும் முயற்சி', 'Try again'],
      learnFirst: ['முதலில் இந்த அதிகாரத்தைப் படி', 'Read this chapter first'],
      levels: ['நிலைத் தேர்வுகள்', 'Level exams'],
      levelsIntro: ['ஒவ்வொரு நிலையும் ஒரு செடி போல வளரும். ஒன்றை முடித்தால் அடுத்தது திறக்கும்!', 'Grow like a plant, level by level. Pass one to open the next!'],
      chapters: ['அதிகாரச் சான்றிதழ்கள்', 'Chapter certificates'],
      chaptersIntro: ['ஒரு அதிகாரம் — 10 குறள்கள் — ஒரு சிறிய தேர்வு.', 'One chapter, 10 Kurals, one quick test.'],
      level: ['நிலை', 'Level'],
      locked: ['முந்தைய நிலையை முடித்தால் திறக்கும்', 'Pass the level before to open this one'],
      study: ['படிக்க வேண்டியவை', 'Study'],
      nextLine: ['அடுத்த வரி எது?', 'Which line comes next?'],
      forLevel: 'திருக்குறள் நிலை {n} தேர்ச்சி பெற்றதற்காக · for passing Thirukkural level {n}',
      /* printed on the certificate */
      heading: 'திருக்குறள் சான்றிதழ் · Thirukkural Certificate',
      presented: 'இந்தச் சான்றிதழ் பெருமையுடன் வழங்கப்படுகிறது · This certificate is proudly presented to',
      forChapter: 'திருக்குறள் அதிகாரம் {n} கற்றதற்காக · for learning Thirukkural chapter {n}',
      kurals: 'குறள்கள் {from}–{to} · Kurals {from}–{to}'
    }
  },

  /* Certificate (printed on the PDF) */
  certificate: {
    title: 'சான்றிதழ்',
    presented: 'இந்தச் சான்றிதழ் பெருமையுடன் வழங்கப்படுகிறது · This certificate is proudly presented to',
    level: 'நிலை',
    date: 'Date · தேதி',
    id: 'Certificate ID · சான்றிதழ் எண்',
    name: 'பெயர்',
    /* Certificate form for a parent or guardian (features/certificate/cert-record.js). A grown-up surface, so English.
       Shown on the website only, never in the Google Play app. Bump CONSENT_VERSION in cert-record.js if `consent` changes. */
    contact: {
      head: '👪 For a parent or guardian',
      why: 'Please ask a grown-up to fill this in. We keep a record of each certificate with your child’s name and your email and phone, so we can confirm a certificate and tell you about new Learn Tamil levels and lessons. We never show your email or phone publicly, never sell them, and never put them on the certificate or in share links.',
      email: 'Parent’s email',
      phone: 'Parent’s phone, with country code',
      phoneHint: 'e.g. +91 98765 43210',
      consent: 'I am this child’s parent or guardian, and I agree that Learn Tamil may store my child’s name, my email and my phone number with this certificate, as described in the privacy policy.',
      privacyLink: 'Privacy policy',
      saved: 'Saved on this device for the next certificate.',
      change: 'Change',
      errName: 'Please type the name for the certificate.',
      errEmail: 'Please check the email address (for example name@example.com).',
      errPhone: 'Please add the phone number with the country code, starting with + (for example +91 98765 43210).',
      errConsent: 'Please tick the box to agree, so we can make the certificate.',
      notSaved: 'Your certificate is ready. We could not save the record just now, so we will try again the next time you are online.'
    },
    /* "Check a certificate" by its ID (cert-record.js). Shows only what is printed on the certificate. */
    verify: {
      head: '🔎 Check a certificate',
      intro: 'Type the certificate ID printed at the bottom of a Learn Tamil certificate to see its details.',
      label: 'Certificate ID',
      placeholder: 'e.g. LT1-AB12CD',
      button: 'Check',
      checking: 'Checking…',
      bad: 'Please type the ID as it is printed, for example LT1-AB12CD or TKL2-…',
      valid: '✅ This is a real Learn Tamil certificate',
      name: 'Name', course: 'For', date: 'Date',
      notFound: 'We could not find a certificate with this ID. Please check each letter and number. Certificates made in the Android app, or before this check existed, are not listed.',
      offline: 'Could not check right now. Please make sure you are online and try again.',
      /* Under the QR code printed on certificates that are on record (CertRecord.drawVerifyQR). */
      scan: 'Scan to check',
      /* verify-certificate.html opened inside the Google Play app, where nothing is sent. */
      appOnly: 'Certificates can be checked on the website: open learntamil.msdevbuild.com/verify-certificate.html in a web browser.'
    },
    /* Celebration card under a new certificate (features/certificate/cert-share.js).
       The share part is a grown-up surface (behind press-and-hold), so it is English like share.js.
       Share messages never contain the child's name: it is only in the image a parent chooses to share. */
    celebrate: {
      ready: ['உன் சான்றிதழ் தயார்!', 'Your certificate is ready!'],
      again: ['இன்னொரு வெற்றி!', 'Another milestone! 🏆'],
      body: 'You did it! Your hard work and practice paid off. Download your certificate, and ask a grown-up to share it with family and friends.',
      shareBtn: ['பகிர்', 'Share this achievement'],
      gate: 'For grown-ups: press and hold for 3 seconds to share.',
      hold: '✋ Hold',
      shareHead: '📣 Share your child’s achievement',
      privacy: 'Learn Tamil sends nothing. Each button opens the app or site you choose, with the message shown above. Your child’s name is only inside the certificate image, if you decide to share it.',
      message: '🎉 So proud! My child just earned a Learn Tamil certificate: {what}.\n\nEvery Tamil letter learned is a step forward. Learn Tamil for free:',
      messageAgain: '🏆 Another milestone! My child just earned another Learn Tamil certificate: {what}.\n\nEvery Tamil letter learned is a step forward. Learn Tamil for free:',
      device: 'Share image',
      copy: 'Copy message', copied: '✓ Message copied',
      pasteHint: 'The message is copied. Paste it into your post.',
      saveImg: 'Save image',
      openIg: 'Open Instagram',
      igSteps: ['Tap “Save image” to keep the certificate in your photos.', 'Tap “Copy message”.', 'Open Instagram, tap ＋, choose Post or Story and pick the certificate.', 'Paste the message as the caption and share.']
    }
  }
};
