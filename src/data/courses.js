/**
 * Sample course catalogue. Instructors are fictional placeholders.
 * To add real videos, set `videoUrl` on a lesson to an embeddable URL
 * (e.g. https://www.youtube.com/embed/VIDEO_ID); the player picks it up automatically.
 */
export const courses = [
  {
    id: 'networking-fundamentals',
    title: 'Networking Fundamentals',
    instructor: 'Er. Anil Shrestha',
    difficulty: 'Beginner',
    duration: '3h 20m',
    color: '#2344b8',
    icon: 'Network',
    quizCategory: 'networking',
    description: 'Understand how devices talk: models, addressing and the protocols behind every web page.',
    lessons: [
      {
        id: 'nf-1', title: 'What is a network?', duration: '12 min', videoUrl: null, relatedNoteId: 'osi-model',
        content: 'A computer network is two or more devices connected to share resources and information. Networks are classified by size: PAN (personal), LAN (a building or campus), MAN (a city) and WAN (countries or the whole world, like the Internet).\n\nTopologies describe how devices are arranged: bus, star, ring, mesh and hybrid. Most modern LANs use a star topology with a switch at the centre.',
        practice: ['List four types of networks by geographical size.', 'Why is star topology preferred in offices and colleges?'],
      },
      {
        id: 'nf-2', title: 'OSI and TCP/IP models', duration: '18 min', videoUrl: null, relatedNoteId: 'tcp-ip-model',
        content: 'Layered models break communication into manageable parts. The OSI model has seven layers and is used for teaching and troubleshooting. The TCP/IP model has four layers and describes how the Internet actually works.\n\nRemember the order with "All People Seem To Need Data Processing" (Application down to Physical).',
        practice: ['Name the layer where routers operate.', 'Which OSI layers map to the TCP/IP Application layer?'],
      },
      {
        id: 'nf-3', title: 'IP addressing basics', duration: '22 min', videoUrl: null, relatedNoteId: 'ipv4',
        content: 'Every device on an IP network needs a unique address. IPv4 addresses are 32 bits long, written like 192.168.1.10. The subnet mask tells which part identifies the network and which part identifies the host.\n\nIPv6 uses 128-bit addresses written in hexadecimal and removes the address shortage of IPv4.',
        practice: ['How many usable hosts are in a /24 network?', 'Write the IPv6 loopback address.'],
      },
    ],
  },
  {
    id: 'web-development',
    title: 'Web Development',
    instructor: 'Priya Gurung',
    difficulty: 'Beginner',
    duration: '4h 10m',
    color: '#0a7f58',
    icon: 'Globe',
    quizCategory: 'programming',
    description: 'Build your first websites with semantic HTML, modern CSS and a touch of JavaScript.',
    lessons: [
      {
        id: 'wd-1', title: 'How the web works', duration: '14 min', videoUrl: null, relatedNoteId: 'how-web-works',
        content: 'When you visit a website, your browser asks a DNS server for the site\'s IP address, connects to the web server and requests the page over HTTP or HTTPS. The server sends back HTML, CSS and JavaScript, which the browser turns into the page you see.',
        practice: ['What does DNS do in the page-loading process?', 'Name the three core front-end languages and their roles.'],
      },
      {
        id: 'wd-2', title: 'Semantic HTML', duration: '20 min', videoUrl: null, relatedNoteId: 'how-web-works',
        content: 'Semantic elements describe the meaning of content: <header>, <nav>, <main>, <article>, <section>, <aside> and <footer>. They help screen readers, search engines and other developers understand your page.\n\nAlways give images an alt attribute and connect labels to form inputs.',
        practice: ['Why is <nav> better than <div class="nav">?', 'What is the purpose of the alt attribute?'],
      },
      {
        id: 'wd-3', title: 'Responsive CSS layouts', duration: '26 min', videoUrl: null, relatedNoteId: 'how-web-works',
        content: 'Responsive design makes one page work on phones, tablets and desktops. Use relative units, flexible images (max-width: 100%), Flexbox for one-dimensional layouts and Grid for two-dimensional layouts. Media queries adjust the design at breakpoints.',
        practice: ['When would you choose Grid over Flexbox?', 'Write a media query for screens narrower than 768px.'],
      },
    ],
  },
  {
    id: 'react-js',
    title: 'React.js',
    instructor: 'Suman Karki',
    difficulty: 'Intermediate',
    duration: '5h 00m',
    color: '#0e7490',
    icon: 'Code2',
    quizCategory: 'programming',
    description: 'Components, state, hooks and routing: the skills behind modern single-page apps.',
    lessons: [
      {
        id: 'rj-1', title: 'Components and JSX', duration: '18 min', videoUrl: null, relatedNoteId: 'react',
        content: 'A React component is a function that returns JSX. JSX looks like HTML but lives inside JavaScript, so you can use expressions in curly braces. Components can be nested and reused, and they receive data through props.',
        practice: ['What must a component name start with?', 'How do you pass a value from a parent to a child component?'],
      },
      {
        id: 'rj-2', title: 'State and events', duration: '24 min', videoUrl: null, relatedNoteId: 'react',
        content: 'useState gives a component memory. Calling the setter schedules a re-render with the new value. Event handlers like onClick and onChange update state in response to the user.\n\nNever modify state directly; always create a new value.',
        practice: ['Why should you not write state.count++ directly?', 'Build a counter with increment and reset buttons.'],
      },
      {
        id: 'rj-3', title: 'Effects and data fetching', duration: '28 min', videoUrl: null, relatedNoteId: 'javascript',
        content: 'useEffect runs code after rendering, for example to fetch data or subscribe to a timer. The dependency array controls when it runs again. Return a cleanup function to cancel timers or subscriptions.',
        practice: ['What happens if the dependency array is empty?', 'Why does a timer effect need a cleanup function?'],
      },
    ],
  },
  {
    id: 'javascript-essentials',
    title: 'JavaScript',
    instructor: 'Priya Gurung',
    difficulty: 'Beginner',
    duration: '4h 30m',
    color: '#9a5c00',
    icon: 'Terminal',
    quizCategory: 'programming',
    description: 'Variables, functions, arrays, objects and asynchronous code, explained with small examples.',
    lessons: [
      {
        id: 'js-1', title: 'Variables and types', duration: '15 min', videoUrl: null, relatedNoteId: 'javascript',
        content: 'Use const for values that do not change and let for values that do. JavaScript has primitive types (string, number, boolean, null, undefined, bigint, symbol) and objects. typeof tells you the type of a value.',
        practice: ['What does typeof null return?', 'When should you use let instead of const?'],
      },
      {
        id: 'js-2', title: 'Functions and arrays', duration: '22 min', videoUrl: null, relatedNoteId: 'javascript',
        content: 'Functions can be declared, stored in variables or written as arrow functions. Arrays have powerful methods: map transforms, filter selects, reduce combines. These methods return new arrays and keep your code short and readable.',
        practice: ['Use filter to keep only marks ≥ 40.', 'Use reduce to find the total of an array.'],
      },
      {
        id: 'js-3', title: 'Async JavaScript', duration: '25 min', videoUrl: null, relatedNoteId: 'javascript',
        content: 'Network requests take time. Promises represent a value that will be available later. async/await lets you write asynchronous code that reads like synchronous code. Always handle errors with try/catch.',
        practice: ['Rewrite a .then() chain using async/await.', 'What happens if a promise rejects and nothing catches it?'],
      },
    ],
  },
  {
    id: 'python-programming',
    title: 'Python',
    instructor: 'Dr. Ramesh Adhikari',
    difficulty: 'Beginner',
    duration: '4h 45m',
    color: '#1d4ed8',
    icon: 'Code2',
    quizCategory: 'programming',
    description: 'Learn to write clear programs, work with data structures and automate everyday tasks.',
    lessons: [
      {
        id: 'py-1', title: 'Getting started', duration: '14 min', videoUrl: null, relatedNoteId: 'python',
        content: 'Python programs are plain text files ending in .py. Indentation marks code blocks, so consistent spacing matters. Use print() to display output and input() to read text from the user.',
        practice: ['Write a program that asks for your name and greets you.', 'What error do you get with inconsistent indentation?'],
      },
      {
        id: 'py-2', title: 'Lists and dictionaries', duration: '22 min', videoUrl: null, relatedNoteId: 'python',
        content: 'Lists store ordered collections: marks = [72, 88, 65]. Dictionaries store key/value pairs: {"Ram": 72}. Loop over them with for, and build new lists with comprehensions.',
        practice: ['Create a dictionary of five students and their marks.', 'Use a comprehension to square numbers 1 to 10.'],
      },
      {
        id: 'py-3', title: 'Functions and files', duration: '24 min', videoUrl: null, relatedNoteId: 'python',
        content: 'Functions package reusable logic with def. Use with open("file.txt") as f: to read and write files safely; the file closes automatically when the block ends.',
        practice: ['Write a function that returns the grade for a mark.', 'Read a text file and count its lines.'],
      },
    ],
  },
  {
    id: 'database-systems',
    title: 'Database',
    instructor: 'Er. Sabina Maharjan',
    difficulty: 'Intermediate',
    duration: '3h 50m',
    color: '#7c3aed',
    icon: 'Database',
    quizCategory: 'database',
    description: 'Design, normalize and query relational databases with confidence.',
    lessons: [
      {
        id: 'db-1', title: 'Relational model', duration: '16 min', videoUrl: null, relatedNoteId: 'dbms',
        content: 'The relational model stores data in tables (relations) made of rows (tuples) and columns (attributes). A primary key uniquely identifies each row, and a foreign key links rows between tables.',
        practice: ['Differentiate primary key and foreign key.', 'Can a primary key contain NULL? Why?'],
      },
      {
        id: 'db-2', title: 'Writing SQL queries', duration: '28 min', videoUrl: null, relatedNoteId: 'sql',
        content: 'SELECT retrieves data. Filter with WHERE, sort with ORDER BY, group with GROUP BY and filter groups with HAVING. JOIN combines related tables.',
        practice: ['Write a query to list students with marks above 80.', 'Count students in each department.'],
      },
      {
        id: 'db-3', title: 'Normalization', duration: '24 min', videoUrl: null, relatedNoteId: 'normalization',
        content: 'Normalization removes redundancy. 1NF needs atomic values; 2NF removes partial dependencies; 3NF removes transitive dependencies. Well-normalized tables avoid update, insertion and deletion anomalies.',
        practice: ['Give an example of an update anomaly.', 'Normalize a table containing StudentName repeated in every result row.'],
      },
    ],
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security',
    instructor: 'Er. Bikash Thapa',
    difficulty: 'Intermediate',
    duration: '3h 40m',
    color: '#bf2233',
    icon: 'Shield',
    quizCategory: 'security',
    description: 'Threats, defences and good habits that keep people and organisations safe online.',
    lessons: [
      {
        id: 'cs-1', title: 'The CIA triad', duration: '14 min', videoUrl: null, relatedNoteId: 'cia-triad',
        content: 'Security aims to protect confidentiality, integrity and availability. Every attack targets at least one of these, and every defence protects at least one.',
        practice: ['Which part of the triad does ransomware attack most directly?', 'Give one control for each part of the triad.'],
      },
      {
        id: 'cs-2', title: 'Encryption essentials', duration: '24 min', videoUrl: null, relatedNoteId: 'cryptography',
        content: 'Symmetric encryption uses one key and is fast. Asymmetric encryption uses a public and private key pair and solves the problem of sharing keys. HTTPS uses both.',
        practice: ['Why is asymmetric encryption not used for large files?', 'What does a digital signature prove?'],
      },
      {
        id: 'cs-3', title: 'Network defences', duration: '20 min', videoUrl: null, relatedNoteId: 'firewalls',
        content: 'Firewalls filter traffic, IDS/IPS detect and block attacks, and VPNs encrypt traffic across untrusted networks. Combine them in layers (defense in depth).',
        practice: ['Differentiate IDS and IPS.', 'Where would you place a public web server: LAN or DMZ?'],
      },
    ],
  },
  {
    id: 'cloud-computing',
    title: 'Cloud Computing',
    instructor: 'Nisha Rai',
    difficulty: 'Intermediate',
    duration: '3h 15m',
    color: '#0369a1',
    icon: 'Cloud',
    quizCategory: 'cloud',
    description: 'Service models, virtualization and how modern apps run in the cloud.',
    lessons: [
      {
        id: 'cc-1', title: 'What is the cloud?', duration: '15 min', videoUrl: null, relatedNoteId: 'cloud-models',
        content: 'Cloud computing means renting computing resources over the Internet and paying for what you use. Resources can scale up and down quickly, so you do not need to buy servers for peak demand.',
        practice: ['List the five NIST characteristics of cloud computing.', 'Give two risks of moving to the cloud.'],
      },
      {
        id: 'cc-2', title: 'IaaS, PaaS and SaaS', duration: '20 min', videoUrl: null, relatedNoteId: 'cloud-models',
        content: 'IaaS gives you virtual machines, PaaS gives you a platform to deploy code, and SaaS gives you finished software. The higher the level, the less you manage yourself.',
        practice: ['Classify Gmail, AWS EC2 and Heroku by service model.', 'Which model gives the most control?'],
      },
      {
        id: 'cc-3', title: 'Virtual machines and containers', duration: '22 min', videoUrl: null, relatedNoteId: 'virtualization',
        content: 'Hypervisors run many virtual machines on one server. Containers are lighter: they share the host kernel and start in seconds. Docker builds containers; Kubernetes runs them at scale.',
        practice: ['Why do containers start faster than VMs?', 'What problem does Kubernetes solve?'],
      },
    ],
  },
  {
    id: 'iot-basics',
    title: 'IoT',
    instructor: 'Er. Deepak Joshi',
    difficulty: 'Advanced',
    duration: '3h 30m',
    color: '#0f766e',
    icon: 'Wifi',
    quizCategory: 'iot',
    description: 'Sensors, microcontrollers and protocols for building connected devices.',
    lessons: [
      {
        id: 'iot-1', title: 'IoT architecture', duration: '16 min', videoUrl: null, relatedNoteId: 'iot-architecture',
        content: 'An IoT system has layers: perception (sensors and actuators), network (Wi-Fi, LoRa, cellular), processing (cloud or edge) and application (dashboards and apps).',
        practice: ['Name the four layers of IoT architecture.', 'Suggest an IoT solution for a problem in your community.'],
      },
      {
        id: 'iot-2', title: 'Sensors and microcontrollers', duration: '24 min', videoUrl: null, relatedNoteId: 'iot-architecture',
        content: 'Sensors convert physical quantities (temperature, moisture, light) into electrical signals. Microcontrollers like Arduino and ESP32 read those signals, make decisions and control actuators such as relays and motors.',
        practice: ['Differentiate a sensor and an actuator.', 'Why is the ESP32 popular for IoT projects?'],
      },
      {
        id: 'iot-3', title: 'MQTT messaging', duration: '20 min', videoUrl: null, relatedNoteId: 'mqtt',
        content: 'MQTT uses a broker and topics. Devices publish readings to topics; dashboards and controllers subscribe. QoS levels trade reliability for overhead.',
        practice: ['What is the role of the MQTT broker?', 'Which QoS level guarantees exactly-once delivery?'],
      },
    ],
  },
];

export const getCourse = (id) => courses.find((c) => c.id === id);
