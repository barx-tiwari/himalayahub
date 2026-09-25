/** Ten progressive touch-typing lessons. `keys` are highlighted on the keyboard. */
export const typingLessons = [
  {
    id: 'home-row',
    title: 'Home Row',
    summary: 'Anchor your fingers on A S D F and J K L ;',
    explanation:
      'The home row is where your fingers rest between keystrokes. Place your left fingers on A, S, D, F and your right fingers on J, K, L and ;. Feel the small bumps on F and J; they let you find the position without looking. Thumbs rest on the space bar.',
    tips: ['Keep your wrists slightly raised, not resting on the desk.', 'Return to the home row after every key.', 'Go slowly; accuracy first.'],
    keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    text: 'asdf jkl; asdf jkl; as dad fall; sad lad; ask a lad; add a flask; all fall; jak lad; a sad dad asks; lads fall; flask adds',
  },
  {
    id: 'left-hand',
    title: 'Left Hand Practice',
    summary: 'Strengthen the left hand with QWERT, ASDFG and ZXCVB',
    explanation:
      'Your left hand covers five columns: the pinky handles Q, A, Z; ring finger W, S, X; middle finger E, D, C; and the index finger stretches across R, T, F, G, V and B. This lesson uses words typed only with the left hand.',
    tips: ['The index finger does the most work; let it reach, then return to F.', 'Keep the right hand resting on J K L ;.'],
    keys: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'],
    text: 'we are; dear bee; get a car; fast deer; grab bread; save water; best cafe; draft a verse; see the sea; tree bark; feed the cat',
  },
  {
    id: 'right-hand',
    title: 'Right Hand Practice',
    summary: 'Train YUIOP, HJKL; and NM,./ with the right hand',
    explanation:
      'The right index finger covers Y, U, H, J, N and M. The middle finger takes I, K and the comma; the ring finger takes O, L and the period; the pinky handles P, the semicolon, slash and more.',
    tips: ['Watch the screen, not your hands.', 'Relax your pinky; it should reach without the whole hand moving.'],
    keys: ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm'],
    text: 'you only; kill ink; lion pool; phylum; my jolly pony; oh my; look up; milk only; pink kiln; hook in; union hill; lumpy pillow',
  },
  {
    id: 'upper-row',
    title: 'Upper Row',
    summary: 'Reach up to Q W E R T Y U I O P',
    explanation:
      'Each finger reaches straight up from its home key: A to Q, S to W, D to E, F to R and T, J to Y and U, K to I, L to O and ; to P. Move only the finger, then return it home.',
    tips: ['Reach, press, return: three small moves.', 'Say the letter quietly as you press it to build memory.'],
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    text: 'type your quote; we write poetry; top tier router; pure tower; power output; quiet query; you require proper tree roots',
  },
  {
    id: 'lower-row',
    title: 'Lower Row',
    summary: 'Reach down to Z X C V B N M , .',
    explanation:
      'The lower row is the hardest for most learners because the fingers curl downward. A goes to Z, S to X, D to C, F to V and B, J to N and M, K to comma and L to period.',
    tips: ['Keep your fingers curved; do not flatten your hand.', 'The B key belongs to the left index finger.'],
    keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    text: 'zinc box, vacuum, maximum, cab, next van. banana, zebra, calm man, brave cave. mix, fix, zoom in, cabin, mobile, vivid.',
  },
  {
    id: 'numbers',
    title: 'Numbers',
    summary: 'Use the top number row with confidence',
    explanation:
      'Numbers sit above the upper row. The left hand covers 1 to 5 and the right hand covers 6 to 0. Your index fingers handle two columns each: 4 and 5 on the left, 6 and 7 on the right.',
    tips: ['Numbers are a long reach: lift the hand slightly, not the wrist.', 'Practise common numbers: years, phone codes and prices.'],
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    text: 'room 101 has 24 desks. the year 2083 BS is 2026 AD. call 977 01 4455667. 15 30 60 seconds. 8848 metres. 192 168 1 1',
  },
  {
    id: 'symbols',
    title: 'Symbols',
    summary: 'Shift + number keys and punctuation',
    explanation:
      'Symbols like ! @ # $ % ^ & * ( ) need the Shift key. Use the opposite hand for Shift: press left Shift for right-hand keys and right Shift for left-hand keys. This keeps your hands balanced.',
    tips: ['Hold Shift with the pinky of the opposite hand.', 'Release Shift before the next key.'],
    keys: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '=', '?', ':', '"'],
    text: 'Wow! Email me at student@himalayahub.np. Price: $25 (50% off). Q&A #1: Why? "Practice" = progress. 3 * 4 = 12; 10 - 2 = 8!',
  },
  {
    id: 'programming',
    title: 'Programming Characters',
    summary: 'Brackets, braces, operators and quotes',
    explanation:
      'Code uses characters that normal writing rarely needs: { } [ ] < > ( ) ; = + / \\ | and quotes. The right pinky does a lot of work here. Knowing these keys well makes you a faster, less frustrated programmer.',
    tips: ['Type the closing bracket right after the opening one, then fill the middle.', 'Watch for the difference between = and ==.'],
    keys: ['{', '}', '[', ']', '<', '>', '(', ')', ';', '=', '+', '/', '|', "'", '"'],
    text: 'if (a >= b) { return [a, b]; } const x = {id: 1}; arr[i] += 2; a !== b || c <= d; let s = "hi"; // done',
  },
  {
    id: 'speed',
    title: 'Speed Practice',
    summary: 'Common words, typed quickly and smoothly',
    explanation:
      'Speed comes from typing common words as single movements rather than letter by letter. This drill uses the most frequent English words. Aim for a steady rhythm instead of bursts.',
    tips: ['Keep a steady rhythm; do not pause between words.', 'If you make a mistake, keep going unless you must fix it.'],
    keys: [],
    text: 'the and that have for not with you this but his from they say her she will one all would there their what so up out if about who get which go me when make can like time no just him know take people',
  },
  {
    id: 'accuracy',
    title: 'Accuracy Practice',
    summary: 'Tricky combinations that punish rushing',
    explanation:
      'Accuracy matters more than speed: every error costs time to fix. This passage mixes capital letters, punctuation and similar-looking words. Slow down until you can finish with 97% accuracy or better.',
    tips: ['Read a few words ahead of what you are typing.', 'Slow is smooth, and smooth becomes fast.'],
    keys: [],
    text: 'Their answer was there, but they\'re unsure. Its value affects the effect; accept, except, advice, advise. Quiet, quite, quit. Loose or lose? Then, than.',
  },
];

export const LESSON_PASS_ACCURACY = 90;
