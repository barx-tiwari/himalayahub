export const otherNotes = [
  // ---------------- Cyber Security ----------------
  {
    id: 'cia-triad',
    title: 'CIA Triad & Security Basics',
    category: 'security',
    summary: 'Confidentiality, integrity and availability, plus common threats.',
    tags: ['threats', 'malware', 'phishing'],
    explanation:
      'Information security protects data and systems. Every control can be mapped to one of three goals: Confidentiality (only authorized people can read), Integrity (data is not altered without detection) and Availability (systems work when needed).',
    keyPoints: [
      'Threats: malware (virus, worm, trojan, ransomware), phishing, DoS/DDoS, SQL injection, XSS, man-in-the-middle.',
      'Authentication (who you are) vs authorization (what you may do).',
      'MFA combines something you know, have and are.',
      'Defense in depth: several layers of security controls.',
      'Principle of least privilege: give only the access needed.',
    ],
    examples: ['A hospital encrypts records (C), uses checksums on backups (I) and runs redundant servers (A).'],
    examQuestions: ['Explain the CIA triad with examples.', 'Differentiate virus, worm and trojan.', 'What is phishing? How can it be prevented?'],
    revision: ['C, I, A.', 'AuthN vs AuthZ.', 'Least privilege, defense in depth.'],
  },
  {
    id: 'cryptography',
    title: 'Cryptography',
    category: 'security',
    summary: 'Symmetric and asymmetric encryption, hashing and digital signatures.',
    tags: ['encryption', 'rsa', 'aes', 'hash'],
    explanation:
      'Cryptography turns readable plaintext into unreadable ciphertext using an algorithm and a key. Symmetric encryption uses one shared key (fast); asymmetric encryption uses a public/private key pair (solves key sharing). Hash functions create a fixed-size fingerprint of data.',
    diagram: { type: 'flow', title: 'Digital signature', steps: ['Hash the message', 'Encrypt hash with sender private key', 'Send message + signature', 'Receiver decrypts with public key', 'Compare hashes'] },
    keyPoints: [
      'Symmetric: AES, DES, 3DES, ChaCha20.',
      'Asymmetric: RSA, ECC, Diffie–Hellman (key exchange).',
      'Hashing: SHA-256, SHA-3 (MD5 and SHA-1 are broken for security).',
      'Digital signatures give integrity, authentication and non-repudiation.',
      'TLS combines both: asymmetric to agree a key, symmetric for data.',
    ],
    numericals: [
      {
        q: 'RSA: p = 3, q = 11, e = 7. Find n, φ(n), d and encrypt M = 2.',
        a: 'n = p × q = 33\nφ(n) = (p−1)(q−1) = 20\nd: 7 × d ≡ 1 (mod 20) → d = 3 (21 mod 20 = 1)\nC = M^e mod n = 2^7 mod 33 = 128 mod 33 = 29\nCheck: 29^3 mod 33 = 24389 mod 33 = 2 ✓',
      },
    ],
    examQuestions: ['Differentiate symmetric and asymmetric encryption.', 'Explain the RSA algorithm with an example.', 'What is a digital signature?'],
    revision: ['Symmetric = 1 key, fast.', 'Asymmetric = key pair.', 'Hash = one-way fingerprint.'],
  },
  {
    id: 'firewalls',
    title: 'Firewalls, IDS & VPN',
    category: 'security',
    summary: 'Network defences that filter, detect and protect traffic.',
    tags: ['firewall', 'ids', 'ips', 'vpn'],
    explanation:
      'A firewall enforces rules about which traffic may enter or leave a network. An Intrusion Detection System (IDS) watches traffic for attacks and raises alerts; an Intrusion Prevention System (IPS) can also block them. A VPN creates an encrypted tunnel across an untrusted network.',
    keyPoints: [
      'Firewall types: packet filtering, stateful inspection, proxy/application gateway, next-generation (NGFW).',
      'IDS detection: signature-based (known attacks) and anomaly-based (unusual behaviour).',
      'DMZ: a separate zone for public servers.',
      'VPN protocols: IPsec, SSL/TLS VPN, WireGuard.',
    ],
    examQuestions: ['Explain types of firewalls.', 'Differentiate IDS and IPS.', 'How does a VPN protect data?'],
    revision: ['Firewall filters.', 'IDS alerts, IPS blocks.', 'VPN = encrypted tunnel.'],
  },

  // ---------------- Cloud ----------------
  {
    id: 'cloud-models',
    title: 'Cloud Service & Deployment Models',
    category: 'cloud',
    summary: 'IaaS, PaaS, SaaS and public, private, hybrid clouds.',
    tags: ['iaas', 'paas', 'saas', 'aws', 'azure'],
    explanation:
      'Cloud computing delivers computing resources on demand over the Internet with pay-as-you-go pricing. NIST lists five characteristics: on-demand self-service, broad network access, resource pooling, rapid elasticity and measured service.',
    diagram: {
      type: 'layers',
      title: 'Who manages what',
      items: [['SaaS', 'Software as a Service', 'Provider manages everything (Gmail, Microsoft 365)'], ['PaaS', 'Platform as a Service', 'You manage app + data (Heroku, App Engine)'], ['IaaS', 'Infrastructure as a Service', 'You manage OS upward (AWS EC2, Azure VMs)']],
    },
    keyPoints: [
      'Deployment models: public, private, hybrid, community.',
      'Benefits: scalability, lower upfront cost, global reach, reliability.',
      'Concerns: security, vendor lock-in, compliance, internet dependency.',
      'Shared responsibility: the provider secures the cloud; you secure what you put in it.',
    ],
    examQuestions: ['Explain IaaS, PaaS and SaaS with examples.', 'Compare public, private and hybrid clouds.', 'List the characteristics of cloud computing.'],
    revision: ['IaaS < PaaS < SaaS (more managed).', 'Public/private/hybrid/community.', 'Pay as you go.'],
  },
  {
    id: 'virtualization',
    title: 'Virtualization',
    category: 'cloud',
    summary: 'Running many virtual machines or containers on one physical host.',
    tags: ['hypervisor', 'containers', 'docker'],
    explanation:
      'Virtualization creates software-based versions of hardware. A hypervisor lets several virtual machines, each with its own OS, share one physical server. Containers go lighter: they share the host kernel and package only the app and its dependencies.',
    keyPoints: [
      'Type 1 (bare-metal) hypervisor: VMware ESXi, Hyper-V, KVM.',
      'Type 2 (hosted): VirtualBox, VMware Workstation.',
      'Containers (Docker) start in seconds and use fewer resources than VMs.',
      'Kubernetes orchestrates many containers across machines.',
    ],
    examQuestions: ['Differentiate Type 1 and Type 2 hypervisors.', 'Compare virtual machines and containers.'],
    revision: ['Hypervisor runs VMs.', 'Containers share the kernel.', 'Kubernetes orchestrates.'],
  },

  // ---------------- IoT ----------------
  {
    id: 'iot-architecture',
    title: 'IoT Architecture',
    category: 'iot',
    summary: 'Layers of an Internet of Things system from sensor to cloud.',
    tags: ['sensors', 'arduino', 'raspberry pi'],
    explanation:
      'The Internet of Things connects physical devices with sensors and actuators to the Internet so they can collect data and be controlled remotely. A smart irrigation system, for example, reads soil moisture and switches a pump automatically.',
    diagram: {
      type: 'layers',
      title: 'Common 4-layer IoT architecture',
      items: [['4', 'Application', 'Dashboards, mobile apps, analytics'], ['3', 'Processing', 'Cloud / edge: storage, rules, AI'], ['2', 'Network', 'Wi-Fi, LoRaWAN, Zigbee, cellular, MQTT'], ['1', 'Perception', 'Sensors, actuators, microcontrollers']],
    },
    keyPoints: [
      'Microcontrollers: Arduino, ESP32; single-board computers: Raspberry Pi.',
      'Edge computing processes data near the device to reduce latency.',
      'Challenges: security, power, interoperability, privacy.',
      'Applications: smart home, agriculture, healthcare, smart cities, industry 4.0.',
    ],
    examQuestions: ['Explain the layered architecture of IoT.', 'What are the challenges of IoT?', 'Describe an IoT application for agriculture in Nepal.'],
    revision: ['Perception, network, processing, application.', 'Edge = near device.'],
  },
  {
    id: 'mqtt',
    title: 'MQTT & IoT Protocols',
    category: 'iot',
    summary: 'Lightweight publish/subscribe messaging for constrained devices.',
    tags: ['publish subscribe', 'coap', 'broker'],
    explanation:
      'MQTT is a lightweight publish/subscribe protocol over TCP. Devices publish messages to topics on a broker, and any client subscribed to that topic receives them. Publishers and subscribers never talk directly.',
    diagram: { type: 'flow', title: 'Publish/subscribe', steps: ['Sensor publishes farm/soil/moisture', 'Broker', 'Dashboard & pump controller receive'] },
    keyPoints: [
      'Default ports: 1883 (plain), 8883 (TLS).',
      'QoS 0: at most once; QoS 1: at least once; QoS 2: exactly once.',
      'Retained messages and Last Will messages.',
      'CoAP: REST-like protocol over UDP for very constrained devices.',
    ],
    examQuestions: ['Explain MQTT architecture.', 'Describe MQTT QoS levels.', 'Compare MQTT and CoAP.'],
    revision: ['Broker in the middle.', 'Topics.', 'QoS 0/1/2.'],
  },

  // ---------------- Operating Systems ----------------
  {
    id: 'cpu-scheduling',
    title: 'CPU Scheduling',
    category: 'os',
    summary: 'FCFS, SJF, Round Robin and priority scheduling with worked numericals.',
    tags: ['process', 'fcfs', 'sjf', 'round robin'],
    explanation:
      'The CPU scheduler decides which ready process runs next. Scheduling can be non-preemptive (a process runs until it finishes or blocks) or preemptive (the OS can interrupt it).',
    keyPoints: [
      'Turnaround time = Completion − Arrival.',
      'Waiting time = Turnaround − Burst.',
      'FCFS: simple, suffers from the convoy effect.',
      'SJF: minimum average waiting time, but may starve long jobs.',
      'Round Robin: time quantum; good response time for time-sharing.',
      'Priority: may starve low priority; solved by aging.',
    ],
    numericals: [
      {
        q: 'FCFS: P1 (AT 0, BT 5), P2 (AT 1, BT 3), P3 (AT 2, BT 8). Find average waiting time.',
        a: 'Gantt: | P1 0–5 | P2 5–8 | P3 8–16 |\nTAT: P1 = 5, P2 = 7, P3 = 14\nWT: P1 = 0, P2 = 4, P3 = 6\nAverage WT = 10 / 3 = 3.33 ms',
      },
      {
        q: 'Round Robin, quantum 2: P1 (BT 5), P2 (BT 3), P3 (BT 1), all arrive at 0. Find average waiting time.',
        a: 'Gantt: P1 0–2 | P2 2–4 | P3 4–5 | P1 5–7 | P2 7–8 | P1 8–9\nCompletion: P1 = 9, P2 = 8, P3 = 5\nWT = CT − BT: P1 = 4, P2 = 5, P3 = 4\nAverage WT = 13 / 3 = 4.33',
      },
    ],
    examQuestions: ['Compare FCFS, SJF and Round Robin.', 'What is starvation? How does aging solve it?', 'Differentiate preemptive and non-preemptive scheduling.'],
    revision: ['TAT = CT − AT.', 'WT = TAT − BT.', 'SJF optimal average WT.'],
  },
  {
    id: 'deadlock',
    title: 'Deadlock',
    category: 'os',
    summary: 'When processes wait on each other forever, and how to handle it.',
    tags: ['bankers algorithm', 'resource allocation'],
    explanation:
      'A deadlock occurs when a set of processes each hold a resource and wait for another resource held by a different process in the set, so none can continue.',
    keyPoints: [
      'Coffman conditions (all four needed): mutual exclusion, hold and wait, no preemption, circular wait.',
      'Handling: prevention (break a condition), avoidance (Banker\'s algorithm), detection & recovery, ignore (ostrich).',
      'Banker\'s algorithm grants a request only if the system stays in a safe state.',
      'Need = Max − Allocation.',
    ],
    numericals: [
      {
        q: 'Available = 3. P0: Alloc 1, Max 4. P1: Alloc 2, Max 3. P2: Alloc 2, Max 7. Is the state safe?',
        a: 'Need: P0 = 3, P1 = 1, P2 = 5\nWork = 3 → P1 (need 1) runs → Work = 3 + 2 = 5\nP0 (need 3) runs → Work = 5 + 1 = 6\nP2 (need 5) runs → Work = 8\nSafe sequence: P1 → P0 → P2 ✓',
      },
    ],
    examQuestions: ['State the necessary conditions for deadlock.', 'Explain Banker\'s algorithm with an example.', 'Differentiate deadlock prevention and avoidance.'],
    revision: ['4 conditions.', 'Need = Max − Alloc.', 'Safe state = some order finishes.'],
  },
  {
    id: 'memory-paging',
    title: 'Memory Management & Paging',
    category: 'os',
    summary: 'Paging, segmentation, virtual memory and page replacement.',
    tags: ['virtual memory', 'page fault', 'lru', 'fifo'],
    explanation:
      'Paging divides a process into fixed-size pages and physical memory into frames of the same size, removing external fragmentation. Virtual memory lets a process use more memory than is physically available by keeping some pages on disk.',
    keyPoints: [
      'Logical address = page number + offset.',
      'Page table maps pages to frames; the TLB caches recent entries.',
      'Page fault: the page is not in memory and must be loaded.',
      'Replacement algorithms: FIFO, Optimal, LRU.',
      'Belady\'s anomaly: FIFO can get more faults with more frames.',
      'Thrashing: too much time spent swapping pages.',
    ],
    numericals: [
      {
        q: 'Reference string 7 0 1 2 0 3 0 4 with 3 frames. Count page faults using FIFO and LRU.',
        a: 'FIFO: 7 0 1 (3 faults), 2 replaces 7 (4), 0 hit, 3 replaces 0 (5), 0 replaces 1 (6), 4 replaces 2 (7) → 7 faults.\nLRU: 7 0 1 (3), 2 replaces 7 (4), 0 hit, 3 replaces 1 (5), 0 hit, 4 replaces 2 (6) → 6 faults.',
      },
    ],
    examQuestions: ['Explain paging with a diagram.', 'Compare FIFO, LRU and Optimal replacement.', 'What is thrashing?'],
    revision: ['Pages ↔ frames.', 'TLB speeds lookup.', 'LRU usually beats FIFO.'],
  },

  // ---------------- Web Development ----------------
  {
    id: 'how-web-works',
    title: 'How the Web Works',
    category: 'web',
    summary: 'From typing a URL to seeing a page: HTML, CSS, JS and the browser.',
    tags: ['html', 'css', 'browser', 'frontend'],
    explanation:
      'When you enter a URL, the browser finds the server\'s IP through DNS, opens a TCP (and TLS) connection, sends an HTTP request and receives HTML. It then parses HTML into the DOM, CSS into the CSSOM, combines them into a render tree, lays out the page and paints it. JavaScript can then change the DOM.',
    diagram: { type: 'flow', title: 'Page load', steps: ['DNS lookup', 'TCP + TLS', 'HTTP request', 'HTML → DOM', 'CSS → CSSOM', 'Layout & paint', 'JS runs'] },
    keyPoints: [
      'HTML = structure, CSS = presentation, JavaScript = behaviour.',
      'Semantic HTML (header, nav, main, article, footer) improves accessibility and SEO.',
      'Responsive design uses fluid layouts, flexbox/grid and media queries.',
      'Front end runs in the browser; back end runs on the server.',
    ],
    examQuestions: ['Explain what happens when you type a URL into a browser.', 'What is semantic HTML?', 'Differentiate front-end and back-end development.'],
    revision: ['DNS → TCP → HTTP → render.', 'HTML/CSS/JS roles.', 'Semantic + responsive.'],
  },
  {
    id: 'rest-api',
    title: 'REST APIs',
    category: 'web',
    summary: 'Designing resource-based HTTP APIs that clients can consume.',
    tags: ['api', 'json', 'backend', 'http'],
    explanation:
      'REST (Representational State Transfer) is an architectural style where resources are identified by URLs and manipulated with standard HTTP methods. Responses are usually JSON. REST APIs are stateless: every request carries everything the server needs.',
    diagram: {
      type: 'code',
      title: 'Resource design',
      content: 'GET    /api/courses          list courses\nGET    /api/courses/42       one course\nPOST   /api/courses          create\nPATCH  /api/courses/42       update part\nDELETE /api/courses/42       remove',
    },
    keyPoints: [
      'Constraints: client–server, stateless, cacheable, uniform interface, layered system.',
      'Use nouns for resources, HTTP verbs for actions.',
      'Return meaningful status codes (201 Created, 400, 401, 404).',
      'Authenticate with tokens (e.g. JWT) sent in the Authorization header.',
      'GraphQL is an alternative where the client specifies the exact data needed.',
    ],
    examQuestions: ['What is REST? List its constraints.', 'Design REST endpoints for a student management system.', 'Compare REST and GraphQL.'],
    revision: ['URL = resource.', 'Verb = action.', 'Stateless + JSON.'],
  },

  // ---------------- Software Engineering ----------------
  {
    id: 'sdlc',
    title: 'SDLC Models',
    category: 'se',
    summary: 'Waterfall, spiral, V-model, incremental and agile life cycles.',
    tags: ['waterfall', 'spiral', 'life cycle'],
    explanation:
      'The Software Development Life Cycle describes the phases of building software: requirements, design, implementation, testing, deployment and maintenance. Different models arrange these phases differently depending on risk and how stable the requirements are.',
    diagram: { type: 'flow', title: 'Waterfall', steps: ['Requirements', 'Design', 'Implementation', 'Testing', 'Deployment', 'Maintenance'] },
    keyPoints: [
      'Waterfall: sequential; good for fixed, well-understood requirements.',
      'V-model: each development phase has a matching testing phase.',
      'Spiral: iterative with explicit risk analysis in each loop.',
      'Incremental/iterative: deliver working parts early.',
      'Agile: short iterations, customer collaboration, embrace change.',
    ],
    examQuestions: ['Explain the waterfall model with its advantages and disadvantages.', 'Why is the spiral model called a risk-driven model?', 'Which SDLC model suits a project with changing requirements? Why?'],
    revision: ['Req → Design → Code → Test → Deploy → Maintain.', 'Spiral = risk.', 'Agile = change.'],
  },
  {
    id: 'agile-scrum',
    title: 'Agile & Scrum',
    category: 'se',
    summary: 'Iterative delivery with sprints, roles, events and artifacts.',
    tags: ['sprint', 'backlog', 'kanban'],
    explanation:
      'Agile values individuals and interactions, working software, customer collaboration and responding to change (Agile Manifesto, 2001). Scrum is a popular Agile framework that delivers work in fixed-length sprints, usually two weeks.',
    keyPoints: [
      'Roles: Product Owner, Scrum Master, Developers.',
      'Events: Sprint, Sprint Planning, Daily Scrum, Sprint Review, Retrospective.',
      'Artifacts: Product Backlog, Sprint Backlog, Increment.',
      'User story format: As a <user>, I want <goal> so that <benefit>.',
      'Kanban visualizes work on a board and limits work in progress.',
    ],
    examQuestions: ['Explain Scrum roles, events and artifacts.', 'Differentiate Scrum and Kanban.', 'Write three user stories for an online course platform.'],
    revision: ['PO, SM, Devs.', 'Sprint cycle.', 'Backlogs + increment.'],
  },

  // ---------------- AI ----------------
  {
    id: 'ai-ml-basics',
    title: 'AI & Machine Learning Basics',
    category: 'ai',
    summary: 'Supervised, unsupervised and reinforcement learning explained simply.',
    tags: ['machine learning', 'supervised', 'classification'],
    explanation:
      'Artificial Intelligence is the broad field of making machines perform tasks that normally need human intelligence. Machine Learning is a subset where systems learn patterns from data instead of being explicitly programmed. Deep Learning is a subset of ML using multi-layer neural networks.',
    diagram: {
      type: 'layers',
      title: 'Nested fields',
      items: [['AI', 'Artificial Intelligence', 'Search, reasoning, planning, learning'], ['ML', 'Machine Learning', 'Learns from data'], ['DL', 'Deep Learning', 'Neural networks with many layers']],
    },
    keyPoints: [
      'Supervised: labelled data; classification (spam or not) and regression (house price).',
      'Unsupervised: unlabelled data; clustering (k-means), dimensionality reduction (PCA).',
      'Reinforcement: an agent learns from rewards and penalties.',
      'Overfitting: great on training data, poor on new data.',
      'Metrics: accuracy, precision, recall, F1 score.',
    ],
    numericals: [
      {
        q: 'A spam filter gives TP = 40, FP = 10, FN = 5, TN = 45. Find accuracy, precision and recall.',
        a: 'Accuracy = (TP + TN) / total = 85 / 100 = 85%\nPrecision = TP / (TP + FP) = 40 / 50 = 80%\nRecall = TP / (TP + FN) = 40 / 45 = 88.9%',
      },
    ],
    examQuestions: ['Differentiate AI, ML and DL.', 'Compare supervised and unsupervised learning.', 'What is overfitting and how can it be reduced?'],
    revision: ['AI ⊃ ML ⊃ DL.', 'Labelled = supervised.', 'Precision vs recall.'],
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks',
    category: 'ai',
    summary: 'Neurons, layers, activation functions and backpropagation.',
    tags: ['deep learning', 'perceptron', 'backpropagation'],
    explanation:
      'An artificial neural network is made of layers of neurons. Each neuron computes a weighted sum of its inputs plus a bias, then applies an activation function. Training adjusts the weights with gradient descent, using backpropagation to compute how much each weight contributed to the error.',
    diagram: { type: 'flow', title: 'One neuron', steps: ['Inputs x₁…xₙ', 'Weighted sum Σwᵢxᵢ + b', 'Activation f( )', 'Output'] },
    keyPoints: [
      'Layers: input, hidden, output.',
      'Activations: sigmoid, tanh, ReLU, softmax (for class probabilities).',
      'Loss functions: MSE (regression), cross-entropy (classification).',
      'CNNs for images, RNNs/LSTMs and Transformers for sequences and language.',
      'A single perceptron cannot solve XOR; a hidden layer can.',
    ],
    numericals: [
      {
        q: 'Perceptron with inputs x = (1, 0), weights w = (0.6, 0.4), bias −0.5, step activation (output 1 if sum ≥ 0). Find the output.',
        a: 'Sum = 0.6 × 1 + 0.4 × 0 − 0.5 = 0.1\n0.1 ≥ 0 → output = 1',
      },
    ],
    examQuestions: ['Explain the structure of an artificial neuron.', 'What is backpropagation?', 'Why can a single-layer perceptron not solve XOR?'],
    revision: ['Weighted sum + bias + activation.', 'Backprop + gradient descent.', 'ReLU common in hidden layers.'],
  },

  // ---------------- Computer Architecture ----------------
  {
    id: 'von-neumann',
    title: 'Von Neumann Architecture',
    category: 'architecture',
    summary: 'Stored-program design: CPU, memory, I/O and the instruction cycle.',
    tags: ['cpu', 'alu', 'instruction cycle', 'harvard'],
    explanation:
      'In the Von Neumann architecture, instructions and data are stored in the same memory and travel over the same bus. The CPU repeatedly fetches an instruction, decodes it and executes it.',
    diagram: { type: 'flow', title: 'Instruction cycle', steps: ['Fetch (PC → MAR → memory → MDR → IR)', 'Decode (control unit)', 'Execute (ALU)', 'Store result', 'PC + 1'] },
    keyPoints: [
      'CPU = ALU + Control Unit + registers (PC, IR, MAR, MDR, accumulator).',
      'Buses: data, address, control.',
      'Von Neumann bottleneck: shared bus limits speed.',
      'Harvard architecture uses separate memories for instructions and data (common in microcontrollers).',
      'RISC: simple fixed-length instructions; CISC: complex, variable-length instructions.',
    ],
    examQuestions: ['Explain Von Neumann architecture with a diagram.', 'Differentiate Von Neumann and Harvard architecture.', 'Compare RISC and CISC.'],
    revision: ['Shared memory for code and data.', 'Fetch–decode–execute.', 'Bottleneck = shared bus.'],
  },
  {
    id: 'cache-memory',
    title: 'Memory Hierarchy & Cache',
    category: 'architecture',
    summary: 'Why cache exists, mapping techniques and effective access time.',
    tags: ['cache', 'hit ratio', 'mapping'],
    explanation:
      'The memory hierarchy trades speed for size and cost: registers → cache → main memory (RAM) → secondary storage. Cache memory keeps recently or frequently used data close to the CPU, exploiting locality of reference.',
    diagram: {
      type: 'layers',
      title: 'Memory hierarchy (fastest first)',
      items: [['1', 'Registers', 'Inside the CPU, < 1 ns'], ['2', 'Cache L1/L2/L3', 'SRAM, a few ns'], ['3', 'Main memory', 'DRAM, ~60–100 ns'], ['4', 'Secondary storage', 'SSD/HDD, µs to ms']],
    },
    keyPoints: [
      'Temporal locality: recently used data is likely reused; spatial locality: nearby data is likely used.',
      'Mapping: direct, fully associative, set-associative.',
      'Replacement: LRU, FIFO, random. Write policies: write-through, write-back.',
      'Hit ratio h = hits / total accesses.',
    ],
    numericals: [
      {
        q: 'Cache access 10 ns, main memory 100 ns, hit ratio 0.9. Find effective access time (hierarchical access).',
        a: 'EAT = h × Tc + (1 − h) × (Tc + Tm)\n= 0.9 × 10 + 0.1 × (10 + 100)\n= 9 + 11 = 20 ns',
      },
    ],
    examQuestions: ['Explain the memory hierarchy.', 'Compare cache mapping techniques.', 'What is locality of reference?'],
    revision: ['Faster = smaller + costlier.', 'Locality makes cache work.', 'EAT formula.'],
  },
];
