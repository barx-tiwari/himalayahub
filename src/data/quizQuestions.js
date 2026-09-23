export const quizCategories = [
  { id: 'networking', name: 'Networking', icon: 'Network' },
  { id: 'programming', name: 'Programming', icon: 'Code2' },
  { id: 'database', name: 'Database', icon: 'Database' },
  { id: 'security', name: 'Cyber Security', icon: 'Shield' },
  { id: 'cloud', name: 'Cloud', icon: 'Cloud' },
  { id: 'iot', name: 'IoT', icon: 'Wifi' },
];

/** answer = index of the correct option */
export const quizQuestions = [
  // Networking
  { id: 'n1', category: 'networking', question: 'Which protocol is connection-oriented?', options: ['UDP', 'TCP', 'IP', 'ICMP'], answer: 1, explanation: 'TCP sets up a connection with a three-way handshake and guarantees reliable, ordered delivery. UDP, IP and ICMP are connectionless.' },
  { id: 'n2', category: 'networking', question: 'How many bits are in an IPv6 address?', options: ['32', '64', '128', '256'], answer: 2, explanation: 'IPv6 addresses are 128 bits long, written as eight groups of four hexadecimal digits.' },
  { id: 'n3', category: 'networking', question: 'At which OSI layer does a router operate?', options: ['Physical', 'Data Link', 'Network', 'Transport'], answer: 2, explanation: 'Routers forward packets based on IP addresses, which belongs to the Network layer (Layer 3).' },
  { id: 'n4', category: 'networking', question: 'What does DHCP primarily provide?', options: ['Domain name resolution', 'Automatic IP configuration', 'File transfer', 'Email delivery'], answer: 1, explanation: 'DHCP assigns IP address, subnet mask, gateway and DNS server automatically using the DORA process.' },
  { id: 'n5', category: 'networking', question: 'How many usable host addresses does a /26 subnet have?', options: ['62', '64', '30', '126'], answer: 0, explanation: '/26 leaves 6 host bits: 2^6 = 64 addresses, minus network and broadcast = 62 usable.' },
  { id: 'n6', category: 'networking', question: 'Which access method does Wi-Fi (802.11) use?', options: ['CSMA/CD', 'CSMA/CA', 'Token passing', 'ALOHA'], answer: 1, explanation: 'Wireless stations cannot reliably detect collisions, so 802.11 uses collision avoidance (CSMA/CA).' },
  { id: 'n7', category: 'networking', question: 'Which IPv6 feature replaces broadcast?', options: ['Anycast only', 'Multicast', 'NAT', 'ARP'], answer: 1, explanation: 'IPv6 has no broadcast; functions like neighbour discovery use multicast instead.' },
  { id: 'n8', category: 'networking', question: 'Which DNS record maps a name to an IPv6 address?', options: ['A', 'MX', 'AAAA', 'CNAME'], answer: 2, explanation: 'AAAA ("quad-A") records hold IPv6 addresses; A records hold IPv4 addresses.' },

  // Programming
  { id: 'p1', category: 'programming', question: 'Which keyword declares a block-scoped constant in JavaScript?', options: ['var', 'let', 'const', 'static'], answer: 2, explanation: 'const creates a block-scoped binding that cannot be reassigned.' },
  { id: 'p2', category: 'programming', question: 'Which Python type is immutable?', options: ['list', 'dict', 'set', 'tuple'], answer: 3, explanation: 'Tuples cannot be changed after creation; lists, dicts and sets are mutable.' },
  { id: 'p3', category: 'programming', question: 'In C, what does the & operator return when used as &x?', options: ['The value of x', 'The address of x', 'x shifted left', 'A copy of x'], answer: 1, explanation: 'The unary & operator gives the memory address of its operand.' },
  { id: 'p4', category: 'programming', question: 'Which React hook adds state to a function component?', options: ['useEffect', 'useState', 'useRef', 'useMemo'], answer: 1, explanation: 'useState returns the current value and a setter; calling the setter re-renders the component.' },
  { id: 'p5', category: 'programming', question: 'Method overriding in Java is an example of…', options: ['Compile-time polymorphism', 'Runtime polymorphism', 'Encapsulation', 'Abstraction'], answer: 1, explanation: 'Which overridden method runs is decided at runtime based on the actual object type.' },
  { id: 'p6', category: 'programming', question: 'What does [1, 2, 3].map(n => n * 2) return?', options: ['[1, 2, 3]', '6', '[2, 4, 6]', 'undefined'], answer: 2, explanation: 'map returns a new array with the callback applied to each element.' },

  // Database
  { id: 'd1', category: 'database', question: 'Which clause filters groups after GROUP BY?', options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], answer: 1, explanation: 'WHERE filters rows before grouping; HAVING filters the grouped results.' },
  { id: 'd2', category: 'database', question: 'A table with no transitive dependencies (and in 2NF) is in…', options: ['1NF', '2NF', '3NF', 'It depends on the data'], answer: 2, explanation: '3NF requires 2NF and no non-key attribute depending on another non-key attribute.' },
  { id: 'd3', category: 'database', question: 'The "A" in ACID stands for…', options: ['Availability', 'Atomicity', 'Accuracy', 'Authorization'], answer: 1, explanation: 'Atomicity means a transaction happens completely or not at all.' },
  { id: 'd4', category: 'database', question: 'In an ER diagram, a diamond represents…', options: ['An entity', 'An attribute', 'A relationship', 'A weak entity'], answer: 2, explanation: 'Rectangles are entities, ellipses are attributes and diamonds are relationships.' },
  { id: 'd5', category: 'database', question: 'Which command removes a table and its structure?', options: ['DELETE', 'TRUNCATE', 'DROP', 'REMOVE'], answer: 2, explanation: 'DROP removes the table definition and data. TRUNCATE empties it; DELETE removes chosen rows.' },
  { id: 'd6', category: 'database', question: 'Which join returns all rows from the left table?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'], answer: 1, explanation: 'LEFT JOIN keeps every left row, filling unmatched right columns with NULL.' },

  // Security
  { id: 's1', category: 'security', question: 'Which property ensures data is not altered without detection?', options: ['Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'], answer: 1, explanation: 'Integrity protects data from unauthorized modification; hashes and signatures help detect changes.' },
  { id: 's2', category: 'security', question: 'AES is an example of…', options: ['Asymmetric encryption', 'Symmetric encryption', 'Hashing', 'Encoding'], answer: 1, explanation: 'AES uses the same key to encrypt and decrypt.' },
  { id: 's3', category: 'security', question: 'Which attack floods a service to make it unavailable?', options: ['Phishing', 'SQL injection', 'DDoS', 'Keylogging'], answer: 2, explanation: 'Distributed Denial of Service attacks overwhelm a target with traffic from many machines.' },
  { id: 's4', category: 'security', question: 'Which device can automatically block detected attacks?', options: ['IDS', 'IPS', 'Hub', 'Repeater'], answer: 1, explanation: 'An IPS sits inline and can drop malicious traffic; an IDS only alerts.' },
  { id: 's5', category: 'security', question: 'MFA combines factors from different categories. Which pair qualifies?', options: ['Password + PIN', 'Password + phone OTP', 'Two passwords', 'Username + password'], answer: 1, explanation: 'A password is something you know; an OTP from your phone is something you have.' },
  { id: 's6', category: 'security', question: 'Which hash function is considered secure today?', options: ['MD5', 'SHA-1', 'SHA-256', 'CRC32'], answer: 2, explanation: 'MD5 and SHA-1 have practical collision attacks; CRC32 is not cryptographic.' },

  // Cloud
  { id: 'c1', category: 'cloud', question: 'Gmail is an example of which service model?', options: ['IaaS', 'PaaS', 'SaaS', 'FaaS'], answer: 2, explanation: 'Gmail is finished software delivered over the Internet: Software as a Service.' },
  { id: 'c2', category: 'cloud', question: 'Which hypervisor type runs directly on hardware?', options: ['Type 1', 'Type 2', 'Hosted', 'Emulated'], answer: 0, explanation: 'Type 1 (bare-metal) hypervisors like ESXi and KVM run without a host operating system.' },
  { id: 'c3', category: 'cloud', question: 'Rapid elasticity means…', options: ['Fixed capacity', 'Resources scale quickly with demand', 'Data is encrypted', 'Servers are on-premises'], answer: 1, explanation: 'Elasticity lets capacity grow and shrink automatically as demand changes.' },
  { id: 'c4', category: 'cloud', question: 'Containers differ from VMs because they…', options: ['Include a full OS each', 'Share the host kernel', 'Cannot be moved', 'Need Type 2 hypervisors'], answer: 1, explanation: 'Containers share the host OS kernel, which makes them lightweight and fast to start.' },
  { id: 'c5', category: 'cloud', question: 'A mix of private and public cloud is called…', options: ['Community cloud', 'Hybrid cloud', 'Multi-tenant cloud', 'Edge cloud'], answer: 1, explanation: 'Hybrid cloud combines private and public resources that work together.' },
  { id: 'c6', category: 'cloud', question: 'Which tool orchestrates containers across a cluster?', options: ['Git', 'Kubernetes', 'Nginx', 'Jenkins'], answer: 1, explanation: 'Kubernetes schedules, scales and heals containers across many machines.' },

  // IoT
  { id: 'i1', category: 'iot', question: 'MQTT follows which communication pattern?', options: ['Request/response', 'Publish/subscribe', 'Peer-to-peer', 'Broadcast only'], answer: 1, explanation: 'Clients publish to topics on a broker, and subscribers to those topics receive the messages.' },
  { id: 'i2', category: 'iot', question: 'Which layer of IoT architecture contains sensors?', options: ['Application', 'Network', 'Perception', 'Processing'], answer: 2, explanation: 'The perception (sensing) layer gathers data from the physical world.' },
  { id: 'i3', category: 'iot', question: 'Which MQTT QoS level guarantees exactly-once delivery?', options: ['QoS 0', 'QoS 1', 'QoS 2', 'QoS 3'], answer: 2, explanation: 'QoS 2 uses a four-step handshake to ensure a message is delivered exactly once.' },
  { id: 'i4', category: 'iot', question: 'Which protocol is designed for constrained devices over UDP?', options: ['HTTP', 'CoAP', 'FTP', 'SMTP'], answer: 1, explanation: 'CoAP is a lightweight REST-style protocol running over UDP.' },
  { id: 'i5', category: 'iot', question: 'Processing data close to the device is called…', options: ['Cloud computing', 'Edge computing', 'Grid computing', 'Mainframe computing'], answer: 1, explanation: 'Edge computing reduces latency and bandwidth by processing near the data source.' },
  { id: 'i6', category: 'iot', question: 'A relay that switches on a pump is an example of…', options: ['A sensor', 'An actuator', 'A gateway', 'A broker'], answer: 1, explanation: 'Actuators act on the physical world; sensors measure it.' },
];

export const getQuestionsByCategory = (category) => quizQuestions.filter((q) => q.category === category);
