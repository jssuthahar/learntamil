/* Learn Tamil — data: read-aloud stories.
   pages: [picture, Tamil text, English meaning]. */

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
