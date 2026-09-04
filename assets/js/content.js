/* =============================================================
   CONTENT — all the words live here.
   Edit freely. Nothing below affects how the app works.
   ============================================================= */
window.CONTENT = (function () {
  'use strict';

  /* ---------------------------------------------------------
     Floating idea bubbles around the chat box.
     `chip` is the short thing that floats; `prompt` is what
     actually gets sent. Add/remove at will — layout adapts.
     Keep chips under ~26 characters so they don't get clipped.
     --------------------------------------------------------- */
  var IDEAS = [
    { chip: 'fishing off the pier',    prompt: 'pa and grant fishing off the pier at sunrise' },
    { chip: 'bocce in a hill town',    prompt: 'pa and grant playing bocce in a tiny Italian village, locals watching' },
    { chip: 'white suits, disco kings', prompt: 'pa and grant as 1977 disco kings in matching white three-piece suits' },
    { chip: 'Cadillac on the bridge',  prompt: 'pa and grant crossing the Verrazzano bridge in a convertible Cadillac' },
    { chip: 'winning the dance-off',   prompt: 'pa and grant winning a dance-off with the entire club watching' },
    { chip: 'a gritty 70s cop show',   prompt: 'pa and grant as detectives in a gritty 1970s cop show, leaning on a car' },
    { chip: 'F train, one lobster',    prompt: 'pa and grant riding the F train holding one enormous live lobster' },
    { chip: 'our one-slice pizzeria',  prompt: 'pa and grant running a Brooklyn pizzeria that sells exactly one slice' },
    { chip: 'spaghetti in orbit',      prompt: 'pa and grant as astronauts eating spaghetti in zero gravity' },
    { chip: 'a Renaissance painting',  prompt: 'pa and grant in a Renaissance oil painting holding a hero sandwich' },
    { chip: 'one Vespa, both scared',  prompt: 'pa and grant sharing one Vespa in Rome, both visibly terrified' },
    { chip: 'rival barbers, 86th St',  prompt: 'pa and grant as rival barbers facing off on 86th Street' },
    { chip: 'golf on the roof',        prompt: 'pa and grant golfing on the tar roof of a Brooklyn walk-up' },
    { chip: 'thrown out of a museum',  prompt: 'pa and grant being escorted out of a very fancy museum by security' },
    { chip: 'a 1978 funk record',      prompt: 'pa and grant on the cover of a 1978 funk record, full album art pose' },
    { chip: 'tuxedos, deep sea',       prompt: 'pa and grant in tuxedos deep sea fishing, completely unbothered' }
  ];

  /* ---------------------------------------------------------
     Look presets appended to every prompt.
     --------------------------------------------------------- */
  var STYLES = {
    film: {
      label: '70s Film',
      suffix: 'Shot on 35mm film in the late 1970s. Warm Kodak color, fine grain, gentle ' +
              'halation on the highlights, natural light, candid snapshot energy, slightly ' +
              'faded corners.'
    },
    disco: {
      label: 'Disco Inferno',
      suffix: 'Set in a packed 1977 Brooklyn discotheque. Mirror ball scattering light, an ' +
              'illuminated multicolour dance floor, wide lapels, gold chains, platform shoes, ' +
              'haze in the air, saturated magenta and gold club lighting, motion in the crowd.'
    },
    poster: {
      label: 'Movie Poster',
      suffix: 'Composed like a vintage 1970s movie poster: painted illustration style, dramatic ' +
              'rim lighting, heroic low camera angle, rich airbrushed colour, subtle paper ' +
              'texture and print grain.'
    },
    polaroid: {
      label: 'Polaroid',
      suffix: 'An instant-camera snapshot with direct on-camera flash, slight overexposure on ' +
              'the faces, deep falloff into the background, square composition, faded corners, ' +
              'a little motion blur.'
    }
  };

  /* Wrapped around every prompt so the two of them stay recognisable.
     This wording is what actually worked when the roll was shot: name the
     people explicitly, demand the real faces rather than a likeness, and
     insist on close framing — left to itself the model composes wide
     landscapes with both faces small and in profile, which throws the
     likeness away entirely. */
  function buildPrompt(userPrompt, styleKey, crew) {
    var style = STYLES[styleKey] || STYLES.film;
    var lines = [];

    lines.push('Create a single photorealistic image — one frame, no collage, no borders, no text.');
    lines.push('');

    if (crew && crew.length) {
      lines.push('IDENTITY — the most important requirement. The attached reference photographs');
      lines.push('are of two real men, and the image must show THESE TWO MEN and nobody else:');
      crew.forEach(function (c, i) {
        lines.push('  • Reference ' + (i + 1) + ': ' + (c.who || 'both of them') + '.');
      });
      lines.push('Copy their actual facial features — face shape, nose, eyes, smile, hairline,');
      lines.push('skin tone, the exact grey of PA\'s hair and the shape of GRANT\'s beard. Someone');
      lines.push('who knows these two must recognise them instantly. Do NOT invent generic');
      lines.push('handsome faces and do NOT substitute a different person. PA wears his glasses.');
      lines.push('PA is 68; GRANT is his grown son.');
    } else {
      lines.push('Two men: PA, a warm, sharp 68-year-old with Brooklyn in his posture, and');
      lines.push('GRANT, his grown son. They obviously like each other.');
    }

    lines.push('');
    lines.push('FRAMING: a medium shot. Both men close to camera, BOTH FACES CLEARLY VISIBLE,');
    lines.push('turned toward the camera, well lit and large in the frame. Not a wide landscape,');
    lines.push('not from behind, not in profile, no small distant figures. Faces first, scenery second.');
    lines.push('');
    lines.push('SCENE: ' + userPrompt);
    lines.push('');
    lines.push('LOOK: ' + style.suffix);
    lines.push('');
    lines.push('Both men look genuinely happy and completely at ease — the joke is the situation,');
    lines.push('never the people. Flattering, affectionate, funny. Full colour.');
    lines.push('No text, captions, logos or watermarks anywhere in the image.');

    return lines.join('\n');
  }

  /* ---------------------------------------------------------
     Booth operator patter while frames develop.
     --------------------------------------------------------- */
  var PATTER = [
    'Hold still. Loading the good film.',
    'Setting up the lights. Nobody move.',
    'This one\'s gonna be a problem, in a good way.',
    'Ok. Rolling.',
    'Give me one second, I\'m fixing your collar.',
    'Beautiful. Terrible. Beautiful.',
    'Developing. Don\'t look yet.',
    'The lab guy owes me a favour.'
  ];

  /* =========================================================
     LETTER 1 — THE REAL ONE  (password: the one on the card)
     ---------------------------------------------------------
     >>> GRANT: THIS IS THE ONE HE READS. PUT YOUR OWN WORDS HERE. <<<
     It's just HTML. <p> for paragraphs, <em> for italics,
     <strong> for the gold highlighter, <hr> for a divider.
     ========================================================= */
  var REAL_LETTER = [
    '<h1>For Pa, at sixty‑eight</h1>',
    '<p class="dateline">The card said the word. The word worked. Hello.</p>',

    '<p>Dad —</p>',

    '<p>I built a whole website so I could hide a piece of paper inside it. I want you to ' +
    'appreciate how stupid that is, and I want you to appreciate that I did it anyway, because ' +
    'that is exactly the kind of thing you taught me: <strong>if you\'re going to do something ' +
    'ridiculous, do it all the way, and do it for somebody.</strong></p>',

    '<p>Sixty‑eight. I keep turning that number over. It doesn\'t sound like you. You still take ' +
    'the stairs like the elevator personally insulted you. You still tell a story with your ' +
    'hands. You still walk into a room and somehow, within four minutes, know the guy\'s name, ' +
    'where he\'s from, and whether his brother-in-law is any good at his job.</p>',

    '<p>Here is what I actually want to say, and I\'m going to say it plainly because you never ' +
    'had much patience for the long way around.</p>',

    '<h2>Thank you</h2>',

    '<p>Thank you for never once making it about you. Not at my games, not at my worst years, ' +
    'not on the phone calls where I clearly needed something and was too proud to ask. You just ' +
    'showed up and stayed at the edge of the frame until I was ready.</p>',

    '<p>Thank you for the way you answer the phone when it\'s me. You say my name like it\'s good ' +
    'news. Thirty‑some years of that. I don\'t think you know you do it.</p>',

    '<p>Thank you for teaching me that being generous is a decision you make <em>before</em> you ' +
    'know what it\'s going to cost. And that you don\'t announce it afterward.</p>',

    '<p>Thank you for the stories. Even the ones that changed. <em>Especially</em> the ones that ' +
    'changed. I know now that a story that stays exactly the same isn\'t being told, it\'s just ' +
    'being recited — and you were never reciting. You were performing, for an audience of one ' +
    'kid who thought his father had personally lived through every interesting thing that ever ' +
    'happened in Brooklyn.</p>',

    '<p>I still kind of think that.</p>',

    '<hr>',

    '<h2>What I know now that I didn\'t then</h2>',

    '<p>When I was small I thought you were the strongest guy alive. Then there was a stretch — ' +
    'you know the one — where I thought I had you figured out and you were just a man who worked ' +
    'a lot and had opinions about parking. And now I\'m old enough to see what was actually ' +
    'happening in those years, and honestly, Dad? The first version was closer.</p>',

    '<p>You carried a lot quietly. You made it look like nothing. That\'s not nothing. That\'s ' +
    'the whole thing.</p>',

    '<p><strong>I got very, very lucky.</strong> People don\'t pick their fathers and I somehow ' +
    'came out of the draft with you. I\'ve met a lot of people\'s dads by now. I\'d run it back ' +
    'every time.</p>',

    '<hr>',

    '<h2>The plan for year sixty‑nine</h2>',

    '<p>Less worrying. More of that laugh — the real one, the one that starts silent and then ' +
    'has to sit down. More sun. More of you telling me the same story a fourth way. More ' +
    'dinners where you try to grab the check and I let you win, because I\'ve learned that ' +
    'letting you win <em>is</em> the present.</p>',

    '<p>And at least one photograph of the two of us in white suits. Non‑negotiable. Scroll back ' +
    'up, I built you a machine for exactly that.</p>',

    '<p>Happy birthday, Pa. You\'re the best man I know and you\'re still the best dancer on the ' +
    'floor. Everybody else is just occupying space out there.</p>',

    '<p class="sig">— Grant</p>',

    '<p class="ps"><em>P.S. — If one of my sisters is reading this over your shoulder: they got ' +
    'a different letter. Ask them how the coffin story ends. Watch what happens.</em></p>'
  ].join('\n');

  /* =========================================================
     LETTER 2 — THE DECOY  (pin: 1315)
     ---------------------------------------------------------
     Long. Meandering. Contradicts itself on purpose.
     Designed to be read all the way to the bottom by somebody
     who is fairly sure they're missing something.
     ========================================================= */
  var DECOY_LETTER = [
    '<h1>The coffin, the puppets, and the 3&nbsp;a.m. express</h1>',
    '<p class="dateline">A story Pa told me · written down as close as I can get it</p>',

    '<p>Dad —</p>',

    '<p>You told me this one maybe four times. Possibly five. Never once the same way, which I ' +
    'have decided is the point rather than a problem. I wrote down everything I could hold onto. ' +
    'Where the versions disagreed I kept both, because I couldn\'t work out which one you meant ' +
    'more.</p>',

    '<h2>I. The flat</h2>',

    '<p>Third floor. You always said third floor, except the times you said fourth, and once you ' +
    'said <em>"third, but you climbed four,"</em> which took me until I was about twenty‑six to ' +
    'understand, and I want to be honest with you, I no longer understand it.</p>',

    '<p>It was a railroad flat, so the rooms ran one into the next in a straight line, front to ' +
    'back, no hallway to speak of. You said you could stand in the kitchen and see all the way ' +
    'through to the street window, and that if the doors were open and somebody sneezed at the ' +
    'front of the apartment you\'d hear it twice. <strong>The rooms went in a line like train ' +
    'cars,</strong> which is either a coincidence or the entire explanation for everything that ' +
    'follows, depending on how much credit you want to give a nine‑year‑old.</p>',

    '<p>Your mother — my grandmother, who I only ever met in stories and one photograph where ' +
    'she is aggressively not smiling — ran the place on a system nobody ever wrote down. There ' +
    'was a rule about the hallway. I asked you three separate times what the rule about the ' +
    'hallway was and you gave me three answers: that you weren\'t allowed to run in it, that you ' +
    'weren\'t allowed to <em>be</em> in it after supper, and, the last time, that there was no ' +
    'hallway, which as established there wasn\'t. She made a soup on Thursdays that had celery ' +
    'in it and, you claimed, "everything else." She hung the laundry on a line that ran out the ' +
    'back window to a pole, and you told me that twice a year the line came down and there was ' +
    'nothing to be done about it and everybody on the block simply accepted this as weather.</p>',

    '<h2>II. Rosy</h2>',

    '<p>Rosy is where I lose the thread, and I\'ve made peace with it.</p>',

    '<p>Rosy was your mother\'s sister. Rosy was also the woman who lived above the bakery. ' +
    'These may have been the same person and I think for a period of about ten years I assumed ' +
    'they were, until the night you referred to <em>"Rosy, and also the other Rosy,"</em> and ' +
    'then immediately started talking about a car.</p>',

    '<p>What I know about Rosy: she was small. She was extremely difficult to surprise, which ' +
    'becomes relevant. She kept something in a tin that you were not to touch, and when I asked ' +
    'what was in the tin you said "the tin," in the tone of a man who has answered a question. ' +
    'She could get up the stairs faster than anybody and she did not like the fan. She was, and ' +
    'I\'m quoting you here, "the only one who ever caught me, and she never once told." That ' +
    'line I\'ve kept. I think about it more than you\'d guess.</p>',

    '<h2>III. The acquisition</h2>',

    '<p>Now. The coffin.</p>',

    '<p>There was a place down the avenue. A funeral home, or a place that supplied funeral ' +
    'homes, or — one telling — a man named Sal who had a garage and an arrangement with a place ' +
    'down the avenue. I have never been able to establish whether Sal existed. You have described ' +
    'Sal as your cousin, as your mother\'s cousin, and as "not really anybody\'s cousin, if you ' +
    'want to get technical about it." I do not want to get technical about it.</p>',

    '<p>The point is there was a coffin. It was a display model. It had a crack down one side ' +
    'that made it unsellable, or the lining was the wrong colour, or it had been ordered by a ' +
    'family who then had a disagreement — you\'ve given me all three and once you gave me all ' +
    'three in the same evening, in order, as though they were chapters. It was going to be ' +
    'thrown out. You were nine. That is the whole motive; I\'ve stopped looking for a better ' +
    'one.</p>',

    '<p>You and, allegedly, two other boys got it up the stairs. <strong>You have always ' +
    'insisted it took four flights and the building had three.</strong> When I pointed this out ' +
    'you said, "you didn\'t carry it," which, fair.</p>',

    '<p>It went under your father\'s bed. My grandfather\'s bed. There was, you said, exactly ' +
    'enough clearance, "if you didn\'t breathe," and it sat under there for — and here the ' +
    'accounts really come apart — either one night, or the better part of a season. In one ' +
    'version your mother knew the entire time and simply decided this was not the hill. In ' +
    'another she never knew and went to her grave not knowing, and you said that part quietly, ' +
    'and I didn\'t push.</p>',

    '<h2>IV. The puppets</h2>',

    '<p>A church basement was clearing out a puppet theatre. This was, you said, "a whole thing ' +
    'in those days," which I have never been able to verify and have chosen to believe. ' +
    'Marionettes — the real kind, wooden, with the crossbars and the strings, painted faces, one ' +
    'of them dressed as a soldier and one of them, memorably, as a fish.</p>',

    '<p>There were six. There were also eight. On one occasion there were "nine, if you counted ' +
    'the one with no head, which I did not." I have run this problem for years and I no longer ' +
    'think it has a solution.</p>',

    '<p>You hung them from the ceiling fan in your father\'s room. Fishing line, because it ' +
    'disappears in the dark, which is a genuinely sophisticated observation for a child and the ' +
    'detail that first made me suspect you were a little bit dangerous as a kid. You hung them ' +
    'at different lengths so they wouldn\'t knock into each other, and you set the fan on speed ' +
    'one.</p>',

    '<p><em>The fan.</em> The fan had three speeds. Two of them worked. And every single time ' +
    'you told this story you said, without appearing to notice, that <strong>the one that worked ' +
    'was the one that didn\'t.</strong> I asked you about it once. You looked at me like I was ' +
    'being difficult. We moved on. I\'ve moved on. Mostly.</p>',

    '<p>On speed one the fan turned slowly enough that the puppets didn\'t swing, they ' +
    '<em>drifted</em>. You were very specific about that word. Six of them, or eight, going ' +
    'around in a slow circle over a sleeping man in a dark room in Brooklyn, with a coffin under ' +
    'the bed.</p>',

    '<h2>V. The train</h2>',

    '<p>And then, because apparently that was not sufficient: the train.</p>',

    '<p>Lionel. O gauge. A loop of track, which you had assembled <em>under the bed,</em> around ' +
    'the coffin, which means — and I want to be clear that I only worked this out as an adult — ' +
    'the coffin was inside the loop. The coffin was the scenery. The coffin was, functionally, ' +
    'a mountain.</p>',

    '<p>You ran a wire from the transformer, out from under the bed, along the baseboard, under ' +
    'the door, and into the next room, where you slept. You extended it with, in your words, "a ' +
    'lamp cord and some hope." I have no idea if that was safe. I am confident it was not safe. ' +
    'It was 1967, or 1966, or "right around when the thing happened with the roof," and I think ' +
    'safety was more of a suggestion.</p>',

    '<p>So you\'d lie in bed in the dark with the transformer in your hands and wait for the ' +
    'apartment to go quiet, and then you\'d turn the knob about a quarter turn, and a little ' +
    'electric train would start moving in a slow circle under your father\'s bed. Around the ' +
    'coffin. Under six drifting puppets. And the engine had a whistle.</p>',

    '<p>You used the whistle exactly once per night. You said any more than that was "greedy," ' +
    'and I think that\'s the funniest sentence anyone in our family has ever produced.</p>',

    '<h2>VI. The night all three ran at once</h2>',

    '<p>It was February. It was also the week before Easter. On one telling it was "a Tuesday, ' +
    'definitely a Tuesday," in the fall. I record these things as I received them.</p>',

    '<p>Your father — a man who, by every account including yours, worked more hours than exist ' +
    'in a day and had approximately one facial expression — went to bed at whatever hour he went ' +
    'to bed. You waited. You said you always waited longer than you needed to, because the ' +
    'waiting was the best part, and I think that might be the single most Pa thing you have ever ' +
    'said to me.</p>',

    '<p>Then: fan on. Puppets drifting. Quarter turn on the transformer. Train moving. And you ' +
    'lay there in the next room, nine years old, listening to the sound of a small locomotive ' +
    'circling a coffin under your sleeping father.</p>',

    '<p>And then you pulled the whistle.</p>',

    '<h2>VII. What he did</h2>',

    '<p>Here is the part I have never gotten a straight answer about and have therefore decided ' +
    'is true in every version.</p>',

    '<p>He didn\'t yell. Everyone always assumes he yelled. He didn\'t. According to you he lay ' +
    'there for a while, in the dark, with a train going around underneath him and six or eight ' +
    'marionettes turning slowly over his face, and he worked out — because he was not a stupid ' +
    'man and he had a specific son — exactly what was happening and roughly how long it had been ' +
    'happening.</p>',

    '<p>Then he got up. He didn\'t turn on the light. He walked through the rooms in a straight ' +
    'line, past you, into the kitchen. He put the pot on. He made two cups of coffee. ' +
    '<strong>Two.</strong> At whatever hour it was. And he sat down at the table and he waited, ' +
    'and after a couple of minutes you came in and sat down across from him, and he pushed one ' +
    'of the cups over, and you drank coffee with your father in the dark.</p>',

    '<p>And you told me he said one thing. And every single time you told me this story, he said ' +
    'a different thing.</p>',

    '<p>He said, <em>"the whistle was too much."</em> He said, <em>"how long did it take you to ' +
    'get it up the stairs?"</em> He said — and this is the one I think about, the one you told ' +
    'me the last time, when you were tired and it was late and I don\'t think you were performing ' +
    '— he said, <em>"don\'t wake your mother."</em> And then, after a while: <em>"do it again ' +
    'Friday."</em></p>',

    '<h2>VIII. Aftermath, such as it was</h2>',

    '<p>The coffin came back down the stairs eventually. Or it didn\'t and it became a toy box. ' +
    'Or Rosy took it, which raises questions I have elected not to pursue. The puppets went to ' +
    'Rosy — this part is consistent across all versions, and it is the only part that is, which ' +
    'makes me think it\'s the only part that\'s entirely true. She kept them for years. One of ' +
    'them, the fish, allegedly ended up in our house at some point in the seventies, and I have ' +
    'searched two attics.</p>',

    '<p>The train stayed. The train always stayed. You never once told a version where the train ' +
    'didn\'t stay.</p>',

    '<p>Your father never mentioned it to anybody, as far as you know. Your mother either knew ' +
    'everything or nothing. Rosy caught you and never told. And a nine‑year‑old in a railroad ' +
    'flat in Brooklyn learned that the correct response to somebody going to an absurd amount of ' +
    'trouble for you — even when the trouble is aimed <em>at</em> you — is to get up, say ' +
    'nothing, and pour them a cup of coffee.</p>',

    '<h2>IX. Why I wrote it down</h2>',

    '<p>Because you\'re sixty‑eight, and because at some point I realised I had stopped ' +
    'listening to these stories for the facts. There aren\'t any facts. There\'s a fan with three ' +
    'speeds where the one that works is the one that doesn\'t, and there\'s four flights in a ' +
    'three‑storey building, and there are two Rosys, and somewhere in the middle of all of it ' +
    'there\'s a man making two cups of coffee at three in the morning instead of losing his ' +
    'temper.</p>',

    '<p>You gave me a childhood where the stories were better than the truth and nobody ever ' +
    'made me choose between them. I have tried to do the same thing and I am not as good at it ' +
    'as you.</p>',

    '<p><strong>Happy birthday, Pa.</strong> Sixty‑eight years. Still the best storyteller in ' +
    'the room, still slightly dangerous, still — I suspect — capable of getting something ' +
    'enormous up more flights of stairs than a building has.</p>',

    '<p>I love you. Do it again Friday.</p>',

    '<p class="sig">— Grant</p>',

    '<p class="ps"><em>P.S. — I asked you last year whether the coffin story and the train story ' +
    'were actually the same night or whether I\'d welded them together myself over about twenty ' +
    'years of retellings. You thought about it for a genuinely long time. Then you said "yes." ' +
    'That\'s the whole inheritance right there.</em></p>'
  ].join('\n');

  /* ---------------------------------------------------------
     THE STANDING CREW.
     Close crops of Pa and Grant, loaded automatically so every
     generation has them as reference without anyone uploading
     anything. These four are what produced the roll below.

     Wide shots do not work here — in a full-scene photo the faces
     are a couple of percent of the frame and the model invents
     strangers. Crop tight on the face before adding one.
     --------------------------------------------------------- */
  var DEFAULT_CREW = [
    { file: 'assets/crew/pa-1.jpg',    who: 'PA, the older man' },
    { file: 'assets/crew/pa-2.jpg',    who: 'PA, the older man' },
    { file: 'assets/crew/grant-1.jpg', who: 'GRANT, the younger man' },
    { file: 'assets/crew/grant-2.jpg', who: 'GRANT, the younger man' }
  ];

  /* The five frames shot ahead of time live in assets/roll/ — kept for the
     README, printing, and anything you want to hand out. They are deliberately
     NOT loaded into the strip: the booth always opens blank so the first thing
     anyone does is shoot their own. */

  return {
    IDEAS: IDEAS,
    DEFAULT_CREW: DEFAULT_CREW,
    STYLES: STYLES,
    PATTER: PATTER,
    buildPrompt: buildPrompt,
    REAL_LETTER: REAL_LETTER,
    DECOY_LETTER: DECOY_LETTER
  };
})();
