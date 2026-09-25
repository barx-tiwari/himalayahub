export const typingLevels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const typingModes = [
  { id: 'paragraphs', label: 'Paragraphs' },
  { id: 'words', label: 'Random words' },
  { id: 'code', label: 'Programming' },
];

export const paragraphs = {
  beginner: [
    'The sun rises over the hills and the town slowly wakes up. Students walk to school with their bags and books. A small tea shop opens near the road and the smell of fresh tea fills the air.',
    'Practice a little every day and your typing will get better. Keep your eyes on the screen and your fingers on the home row. Speed will come after accuracy.',
    'A computer is a machine that follows instructions. It can store data, solve problems and help people talk to each other across the world in a few seconds.',
    'Rain falls on the green fields and the river grows wide. Farmers are happy because the rice will grow well this year. Children play near the water and laugh.',
    'Good notes make revision easy. Write short points, draw simple diagrams and read them again before the exam. Small steps each day lead to big results.',
  ],
  intermediate: [
    'Kathmandu Valley is home to seven UNESCO World Heritage monuments, including Swayambhunath, Boudhanath and the old palace squares of Kathmandu, Patan and Bhaktapur. Each site tells a story of art, trade and faith.',
    'A network allows devices to share resources such as files, printers and internet access. Routers forward packets between networks, while switches connect devices inside the same local network using MAC addresses.',
    'Learning to type without looking at the keyboard takes patience. At first you may feel slower than before, but within a few weeks your fingers remember the positions and your speed improves steadily.',
    'Cloud computing lets organisations rent computing power, storage and software over the internet instead of buying and maintaining their own servers. The main service models are IaaS, PaaS and SaaS.',
    'A good programmer writes code that other people can read. Clear variable names, small functions and helpful comments make a project easier to maintain long after it has been written.',
  ],
  advanced: [
    'Asymmetric cryptography relies on a mathematically linked key pair: data encrypted with the public key can only be decrypted with the corresponding private key. TLS uses this during the handshake to agree on a symmetric session key, which is far faster for bulk encryption.',
    'Normalization reduces redundancy by decomposing relations according to functional dependencies. A table in Third Normal Form contains no transitive dependencies: every non-key attribute depends on the key, the whole key, and nothing but the key.',
    'In Nepal, the Bikram Sambat calendar runs roughly 56 years and 8 months ahead of the Gregorian calendar; its month lengths vary between 29 and 32 days, so conversions depend on published lookup tables rather than a simple formula.',
    'Operating systems schedule processes using algorithms such as First-Come First-Served, Shortest Job First, Round Robin and priority scheduling. Each makes different trade-offs between throughput, waiting time, response time and fairness.',
    'The Internet of Things connects sensors, actuators and embedded controllers to cloud platforms. Constrained devices often use lightweight protocols like MQTT or CoAP, because bandwidth, memory and battery life are limited.',
  ],
};

export const wordBank = {
  beginner: 'the and for are but not you all any can had her was one our out day get has him his how man new now old see two way who boy did its let put say she too use sun run fun big red map cat dog sit top cup'.split(' '),
  intermediate: 'network school student keyboard practice computer science number between country problem system program question during important example because morning develop teacher letter window mountain valley river language answer simple support digital history village market'.split(' '),
  advanced: 'algorithm bandwidth encryption authentication virtualization asynchronous polymorphism infrastructure normalization throughput latency concurrency recursion middleware abstraction scalability deterministic hierarchical protocol subnetting acknowledgement transaction configuration optimization'.split(' '),
};

export const codeSnippets = {
  beginner: [
    'let total = 0;\nfor (let i = 1; i <= 10; i++) {\n  total += i;\n}\nconsole.log(total);',
    'name = input("Your name: ")\nprint("Namaste, " + name)',
    'const fruits = ["apple", "mango", "banana"];\nfruits.push("orange");',
  ],
  intermediate: [
    'function isPrime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i * i <= n; i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}',
    'SELECT name, marks FROM students\nWHERE marks >= 40\nORDER BY marks DESC;',
    'def factorial(n):\n    return 1 if n <= 1 else n * factorial(n - 1)',
  ],
  advanced: [
    'const debounce = (fn, ms = 300) => {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n};',
    'int binarySearch(int a[], int n, int key) {\n  int lo = 0, hi = n - 1;\n  while (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (a[mid] == key) return mid;\n    if (a[mid] < key) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}',
    'export async function getJSON(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return res.json();\n}',
  ],
};
