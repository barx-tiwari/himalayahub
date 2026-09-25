/**
 * Hidden Gems of Eastern Nepal — bundled content (also seeded into the database, so
 * editors can refine it in the CMS). Used as the offline fallback when the API is down.
 *
 * ACCURACY: elevations, distances, coordinates and costs are approximate and marked so.
 * `coordsApprox: true` means the map pin is near, not on, the spot. Nothing here has been
 * field-verified by an editor yet (`verifiedAt` empty) — the site says so on each page.
 * Costs are rough per-person ranges for budgeting, not quotes.
 * Photos: Wikimedia Commons files (CC BY-SA), each confirmed to exist on Commons on 2026-09-25.
 *   Credits and licences are fetched from Commons at runtime (see /image-credits). Places without a
 *   confirmed free photo of their own use a clearly labelled photo of the surrounding area
 *   (`nearby: true` → the site shows a "Nearby view" badge) until an editor adds a real one.
 */

export const HIDDEN_GEMS_DISCLAIMER =
  'Details are approximate and not yet checked on the ground by our editors. Roads, permits and prices change — confirm locally before you go.';

const permitsKanchenjunga = [
  { name: 'Kanchenjunga Restricted Area Permit', note: 'Needed by foreign visitors for the upper Taplejung valleys (including Olangchung Gola and Yangma). Issued only through a registered trekking agency, for a group of at least two, with a licensed guide.', officialUrl: 'https://www.immigration.gov.np/' },
  { name: 'Kanchenjunga Conservation Area entry', note: 'Paid at the KCAP entry point or in advance.' },
];

export const hiddenGems = [
  {
    slug: 'timbung-pokhari', rank: 1, name: 'Timbung Pokhari', district: 'Taplejung', province: 'koshi',
    lat: 27.4375, lon: 88.0583, coordsApprox: false, elevationM: 4335, difficulty: 'strenuous', distanceFromKtmKm: 620,
    photos: [
      { file: 'Mt. Kanchanjunga n Mt. Kumbhakarna as seen from Pathivara temple, Taplejung.jpg', alt: 'Kanchenjunga and Kumbhakarna from Pathibhara, Taplejung — the peaks that rise north of Timbung Pokhari', nearby: true },
    ],
    tagline: 'The “gunfire lake” — a sacred high lake on the Taplejung–Panchthar ridge, near Sikkim.',
    story: [
      { heading: 'The lake that booms', text: 'Timbung Pokhari lies at 4,335 m in Sidingwa Rural Municipality, on the ridge between Taplejung and Panchthar close to the Sikkim border. Its name comes from the Limbu word timbak — gunfire — after the sudden cracking sounds locals say rise from the water.' },
      { heading: 'A sacred shore', text: 'About 466 m long and 154 m wide, the lake is snow-covered for roughly half the year. It is sacred to the Limbu (Yakthung) community and to Hindu pilgrims, who believe wishes made here come true. Pilgrims gather above all in Shrawan (July–August), around Janai Purnima and Nag Panchami.' },
      { heading: 'Worth the walk', text: 'On clear days the Kanchenjunga massif fills the northern sky. Nepal listed Timbung among its 100 new tourist destinations in 2018, but it remains remote, with few facilities.' },
    ],
    culture: 'Sacred to the Limbu (Yakthung) community, for whom it is a Mundhum pilgrimage site, and to Hindus. Treat the shore as a temple: no washing, soap or litter in the lake.',
    travel: { nearestAirport: 'Bhadrapur (Jhapa) is the most reliable; Suketar (Taplejung) flights are infrequent', nearestBusStation: 'Phungling (Taplejung bazaar)', howToReach: 'By jeep from Phungling (around seven hours in good conditions) towards Sidingwa, then roughly a day on foot; another common approach walks about two days from Chyangthapu in Panchthar.', roadConditions: 'Rough hill roads that are often blocked by landslides in the monsoon.' },
    tourism: { weather: 'Freezing nights even in summer; snow for about six months a year. Clearest skies from late September to mid-October.', sunrisePoints: ['Ridges above the lake, weather permitting'] },
    bestTime: 'March–October; late September to mid-October for clear views. The main pilgrimage is in Shrawan (July–August).',
    activities: ['Pilgrimage trek', 'High-altitude lake', 'Kanchenjunga views', 'Camping'],
    wildlife: ['Himalayan monal', 'High-altitude birds of the Kanchenjunga Conservation Area'],
    camping: 'Very limited shelter near the lake; herders’ huts (goth) may offer shelter in summer. Carry a tent, stove and warm sleeping bag, or go with an organised pilgrim group.',
    costs: { domestic: { perDayNpr: [2500, 5000], note: 'Jeep shares, simple lodging on the way, food. Porter/guide extra.' }, international: { perDayUsd: [60, 120], note: 'Agency-supported camping trek; guide included in most quotes.' } },
    localGuides: 'Ask in Phungling or Chyangthapu for a guide who has done the route; pilgrim committees organise group walks during Shrawan.',
    safety: ['Altitude sickness is a real risk above 3,500 m — climb slowly and descend if symptoms worsen.', 'No reliable phone signal near the lake; tell someone your plans.', 'The lake is close to the Indian border — carry ID.'],
    tags: ['religious', 'lakes', 'adventure', 'mountains'],
  },
  {
    slug: 'loden-village', rank: 2, name: 'Loden Village', district: 'Taplejung', province: 'koshi',
    lat: 27.65, lon: 87.75, coordsApprox: true, elevationM: null, difficulty: 'challenging', distanceFromKtmKm: null,
    photos: [
      { file: 'River confluence.JPG', alt: 'A river valley in upper Taplejung, the region around Loden', nearby: true },
    ],
    tagline: 'A remote upper-Taplejung settlement — details still being gathered.',
    needsResearch: true,
    story: [
      { heading: 'Help us tell this story', text: 'We do not yet have verified details for Loden. If you have been there, our editors would love to hear from you through the Contact page or the Trekking community.' },
    ],
    bestTime: 'Likely April–May and October–November, like the rest of upper Taplejung.',
    activities: ['Village visit', 'Trekking'],
    permits: permitsKanchenjunga,
    tags: ['culture', 'peaceful'],
  },
  {
    slug: 'olangchung-gola', rank: 3, name: 'Olangchung Gola', district: 'Taplejung', province: 'koshi',
    lat: 27.6792, lon: 87.7792, coordsApprox: false, elevationM: 3200, difficulty: 'challenging', distanceFromKtmKm: 650,
    photos: [
      { file: 'Olangchung Gola.png', alt: 'Olangchung Gola village in upper Taplejung' },
    ],
    tagline: 'A stone-walled Walung trading village near the Tibetan border.',
    story: [
      { heading: 'Salt, wool and yaks', text: 'For centuries Olangchung Gola was a stop on the trade route between the Tamor valley and Tibet. Its Walung (Tibetan-speaking) families traded salt, wool and grain over the high passes.' },
      { heading: 'The old gompa', text: 'The village monastery, Dingsamba, is several centuries old and still the heart of village life. Ask before photographing inside.' },
      { heading: 'Quiet by design', text: 'It lies inside a restricted area, so visitor numbers stay low. That is exactly its charm — come ready to slow down.' },
    ],
    culture: 'Walung people with Tibetan Buddhist traditions. Walk clockwise around chortens and mani walls.',
    travel: { nearestAirport: 'Suketar (Taplejung), or Bhadrapur/Biratnagar by road', nearestBusStation: 'Phungling (Taplejung)', howToReach: 'Jeep up the Tamor valley as far as the road reaches, then 2–4 days on foot.', roadConditions: 'Seasonal dirt road; expect washouts in the monsoon.' },
    adventure: { trekRoutes: [{ name: 'Olangchung Gola – Nango La – Yangma – Ghunsa', days: 6, maxElevationM: 4800, notes: 'High crossing; for experienced trekkers with a guide and good weather.' }] },
    bestTime: 'April–May and October–November.',
    activities: ['Cultural trekking', 'Monastery visit', 'Photography'],
    wildlife: ['Himalayan tahr', 'Musk deer (rarely seen)', 'Red panda habitat lower down'],
    permits: permitsKanchenjunga,
    costs: { domestic: { perDayNpr: [3000, 6000], note: 'Homestay/teahouse basics are limited; carry some supplies.' }, international: { perDayUsd: [80, 150], note: 'Agency trek with restricted-area permit.' } },
    localGuides: 'Book through a registered trekking agency (required for foreigners); many use guides from Taplejung.',
    safety: ['Weather on the high passes changes quickly — carry extra days.'],
    tags: ['culture', 'heritage', 'adventure', 'mountains'],
  },
  {
    slug: 'yangma-valley', rank: 4, name: 'Yangma Valley', district: 'Taplejung', province: 'koshi',
    lat: 27.76, lon: 87.86, coordsApprox: true, elevationM: 4100, difficulty: 'strenuous', distanceFromKtmKm: 660,
    photos: [
      { file: 'Ghunsa Village.JPG', alt: 'Ghunsa village, on the trail between Yangma and Kanchenjunga Base Camp', nearby: true },
      { file: 'Kanchenjunga.JPG', alt: 'Kanchenjunga, above the upper Taplejung valleys', nearby: true },
    ],
    tagline: 'A high yak-herding valley between Olangchung Gola and Ghunsa.',
    story: [
      { heading: 'Summer pastures', text: 'Yangma is a wide, high valley where families bring yaks to graze in summer. Stone houses, prayer flags and glaciers above — few trekkers ever see it.' },
      { heading: 'On the old route', text: 'Most visitors pass through Yangma on the high route linking Olangchung Gola with the Kanchenjunga Base Camp trail at Ghunsa.' },
    ],
    culture: 'Tibetan Buddhist herding community; much quieter in winter when families move down.',
    travel: { howToReach: 'On foot only: from Olangchung Gola over the Nango La, or from Ghunsa.', nearestBusStation: 'Phungling (Taplejung)' },
    adventure: { trekRoutes: [{ name: 'Ghunsa – Yangma – Nango La – Olangchung Gola', days: 5, maxElevationM: 4800 }], camping: 'Camping is the norm; lodges are very basic or absent.' },
    bestTime: 'May and October are the safest months for the passes.',
    activities: ['High trekking', 'Glacier views', 'Yak pastures'],
    wildlife: ['Blue sheep', 'Snow leopard habitat (sightings are very rare)'],
    permits: permitsKanchenjunga,
    costs: { international: { perDayUsd: [90, 170], note: 'Fully supported camping trek.' } },
    safety: ['Serious altitude. Allow acclimatisation days and know the signs of AMS.'],
    tags: ['mountains', 'adventure', 'peaceful'],
  },
  {
    slug: 'tinjure-milke-jaljale', rank: 5, name: 'Tinjure–Milke–Jaljale', district: 'Tehrathum', province: 'koshi',
    lat: 27.2, lon: 87.47, coordsApprox: true, elevationM: 3500, difficulty: 'moderate', distanceFromKtmKm: 540,
    photos: [
      { file: 'Gufa Pokhari.jpg', alt: 'Gufa Pokhari lake on the Tinjure–Milke–Jaljale ridge' },
      { file: 'Basantapur Bazaar Terathum.jpg', alt: 'Basantapur bazaar, the starting point for the TMJ trail' },
    ],
    tagline: 'Nepal’s rhododendron ridge — a spring walk through red, pink and white forest.',
    story: [
      { heading: 'The rhododendron capital', text: 'The TMJ ridge joins three districts — Tehrathum, Sankhuwasabha and Taplejung — and is famous for some of the richest rhododendron forest in Nepal.' },
      { heading: 'Big views, easy start', text: 'From Basantapur, the trail climbs gently along the ridge towards Tinjure and Milke, with Kanchenjunga, Makalu and on clear days Everest on the horizon.' },
    ],
    culture: 'Limbu, Rai, Gurung and Chhetri villages along the ridge; simple homestays in some settlements.',
    travel: { nearestAirport: 'Biratnagar, then road via Dharan and Dhankuta', nearestBusStation: 'Basantapur', howToReach: 'Bus from Dharan or Biratnagar to Basantapur (via Dhankuta and Hile), then walk.', roadConditions: 'Paved to Basantapur; tracks beyond are rougher.' },
    adventure: { trekRoutes: [{ name: 'Basantapur – Tinjure – Milke – Jaljale', days: 5, maxElevationM: 3500 }], hikingRoutes: [{ name: 'Basantapur – Tinjure Phedi day hike', days: 1 }] },
    tourism: { weather: 'Cool and misty; clearest mornings in October–November.', sunrisePoints: ['Tinjure', 'Milke Danda viewpoints'] },
    bestTime: 'March–April for rhododendrons; October–November for clear mountain views.',
    activities: ['Rhododendron trekking', 'Homestays', 'Mountain views', 'Birdwatching'],
    wildlife: ['Red panda habitat', 'Himalayan birds'],
    costs: { domestic: { perDayNpr: [1800, 3500] }, international: { perDayUsd: [35, 80], note: 'Teahouse/homestay trek with a guide.' } },
    localGuides: 'Guides and porters can be found in Basantapur and Hile.',
    tags: ['nature', 'photography', 'adventure', 'sunrise'],
  },
  {
    slug: 'sandakpur', rank: 6, name: 'Sandakpur', district: 'Ilam', province: 'koshi',
    lat: 27.1, lon: 88.0, coordsApprox: true, elevationM: 3636, difficulty: 'moderate', distanceFromKtmKm: 610,
    photos: [
      { file: 'A view of the Kumbhakarna range containing Mt. Kangchenjunga, as seen from Sandakpur, Ilam.jpg', alt: 'Kanchenjunga and the Kumbhakarna range seen from Sandakpur' },
      { file: 'View of Ilam From Sandakpur.jpg', alt: 'View over Ilam from Sandakpur' },
      { file: 'Sun set from sandakpur.jpg', alt: 'Sunset from Sandakpur' },
    ],
    tagline: 'Four of the world’s five highest peaks from one ridge on the eastern border.',
    story: [
      { heading: 'The panorama', text: 'On a clear morning the Sandakpur ridge shows Kanchenjunga close up and Everest, Lhotse and Makalu further west — a sunrise people travel days for.' },
      { heading: 'Border ridge', text: 'The ridge forms the border with India (the same summit is known as Sandakphu on the Indian side). On the Nepal side the approach is from the villages of Maimajhuwa and Jaubari.' },
    ],
    travel: { nearestAirport: 'Bhadrapur (Jhapa)', nearestBusStation: 'Ilam bazaar', howToReach: 'Road to Ilam, jeep towards Maimajhuwa, then a steep 1–2 day hike (or a very rough jeep track in dry season).', roadConditions: 'Upper tracks are steep and muddy after rain.' },
    tourism: { weather: 'Very cold at night; clear skies most likely October–December.', sunrisePoints: ['Sandakpur summit'], sunsetPoints: ['Ridge west of the summit'] },
    bestTime: 'October–December for views; March–April for rhododendrons.',
    activities: ['Sunrise viewing', 'Ridge hiking', 'Photography'],
    costs: { domestic: { perDayNpr: [2000, 4000] }, international: { perDayUsd: [40, 90] } },
    safety: ['Do not cross the border without the right documents.'],
    tags: ['mountains', 'sunrise', 'photography'],
  },
  {
    slug: 'mai-pokhari', rank: 7, name: 'Mai Pokhari', district: 'Ilam', province: 'koshi',
    lat: 27.0, lon: 87.93, coordsApprox: true, elevationM: 2100, difficulty: 'easy', distanceFromKtmKm: 600,
    photos: [
      { file: 'Maipokhari ilam.jpg', alt: 'Mai Pokhari lake reflecting the surrounding forest' },
      { file: 'Mai Pokhari - a wetland in Ilam District of Nepal that is designated as a Ramsar site. (By Saroj Pandey).jpg', alt: 'Mai Pokhari wetland, a Ramsar site in Ilam' },
      { file: 'Reflection on water at maipokhari.jpg', alt: 'Reflections on the water at Mai Pokhari' },
    ],
    tagline: 'A sacred forest lake and protected wetland in the Ilam hills.',
    story: [
      { heading: 'A lake with nine corners', text: 'Mai Pokhari is a small lake in thick forest above Ilam, said to have nine corners. It is both a temple and a wetland of international importance, listed under the Ramsar Convention.' },
      { heading: 'Easy to love', text: 'It is one of the easiest gems to reach: a road runs almost to the shore, making it a good first stop on an Ilam tea-country trip.' },
    ],
    culture: 'A pilgrimage site with a busy fair around Kartik Purnima (autumn full moon).',
    travel: { nearestAirport: 'Bhadrapur (Jhapa)', nearestBusStation: 'Ilam bazaar', howToReach: 'Jeep or bus from Ilam bazaar (around 1–2 hours).' },
    tourism: { weather: 'Mild days, cool nights; misty in the monsoon.' },
    bestTime: 'October–April.',
    activities: ['Lake walk', 'Birdwatching', 'Temple visit', 'Tea gardens nearby'],
    wildlife: ['Wetland birds', 'Forest birds'],
    costs: { domestic: { perDayNpr: [1500, 3000] }, international: { perDayUsd: [30, 60] } },
    tags: ['lakes', 'religious', 'nature', 'peaceful'],
  },
  {
    slug: 'barun-valley', rank: 8, name: 'Barun Valley', district: 'Sankhuwasabha', province: 'koshi',
    lat: 27.8, lon: 87.1, coordsApprox: true, elevationM: 4870, difficulty: 'strenuous', distanceFromKtmKm: 500,
    photos: [
      { file: 'Barun Valley - Nghe.jpg', alt: 'Nghe, a sacred place in the Barun valley' },
      { file: 'Yangri Kharka at Barun river valley.jpg', alt: 'Yangri Kharka pastures in the Barun river valley' },
      { file: 'SP at Makalu Base Camp (3852179714).jpg', alt: 'Makalu Base Camp at the head of the Barun valley' },
    ],
    tagline: 'A wild glacial valley below Makalu, the world’s fifth-highest mountain.',
    story: [
      { heading: 'From jungle to ice', text: 'The Barun valley climbs from subtropical forest to glaciers in a few days’ walk, inside Makalu Barun National Park — one of the least-disturbed mountain ecosystems in Nepal.' },
      { heading: 'Makalu Base Camp', text: 'The valley leads to Makalu Base Camp at about 4,870 m, with huge views of Makalu’s south face.' },
    ],
    culture: 'Rai and Sherpa villages (Num, Seduwa, Tashigaon) at the start of the trek.',
    travel: { nearestAirport: 'Tumlingtar', nearestBusStation: 'Khandbari / Num', howToReach: 'Fly or drive to Tumlingtar, jeep to Num, then about a week on foot to base camp.' },
    adventure: { trekRoutes: [{ name: 'Num – Seduwa – Tashigaon – Shipton La – Makalu Base Camp', days: 14, maxElevationM: 4870 }], camping: 'Basic teahouses exist; camping is common higher up.' },
    bestTime: 'Late April–May and October–November.',
    activities: ['Expedition-style trekking', 'Glacier views', 'Wildlife'],
    wildlife: ['Red panda', 'Himalayan black bear', 'Clouded leopard habitat', 'Hundreds of bird species'],
    permits: [{ name: 'Makalu Barun National Park entry', note: 'Paid at the park office or entry point.' }],
    costs: { domestic: { perDayNpr: [3000, 6000] }, international: { perDayUsd: [70, 140] } },
    safety: ['Shipton La can hold snow late into spring — ask locally before crossing.', 'Remote: carry a first-aid kit and consider evacuation insurance.'],
    tags: ['mountains', 'adventure', 'wildlife'],
  },
  {
    slug: 'salpa-pokhari', rank: 9, name: 'Salpa Pokhari', district: 'Bhojpur', province: 'koshi',
    lat: 27.4464, lon: 86.9336, coordsApprox: false, elevationM: 3443, difficulty: 'challenging', distanceFromKtmKm: 470,
    photos: [
      { file: 'Salpa Pokhori and Sillichung Mountain.jpg', alt: 'Salpa Pokhari lake below Silichung mountain' },
    ],
    tagline: 'The ancestral lake of the Kirat Rai people, high on the Salpa ridge.',
    story: [
      { heading: 'Where the Mundhum begins', text: 'For the Kirat Rai, Salpa is an ancestral place remembered in the Mundhum, their oral scripture. Many families trace their origins to these ridges.' },
      { heading: 'A pilgrim’s trail', text: 'Kirat, Hindu and Buddhist pilgrims gather here for fairs on four full moons each year — Baisakh, Rishi, Kartik and Mangsir Purnima. Outside those days you may have the lake almost to yourself.' },
    ],
    culture: 'Kirat Rai heritage; respect offerings at the shore.',
    travel: { nearestAirport: 'Tumlingtar (Sankhuwasabha); Bhojpur has a small airstrip', nearestBusStation: 'Bhojpur bazaar', howToReach: 'One common route starts from Tumlingtar and walks via Dobhane in Bhojpur; another starts from Bhojpur bazaar. Allow 2–3 days on foot to the lake.' },
    adventure: { trekRoutes: [{ name: 'Tumlingtar or Bhojpur – Dobhane – Salpa Pokhari (and on towards Solukhumbu)', days: 6, maxElevationM: 3443 }] },
    bestTime: 'March–May and October–November.',
    activities: ['Pilgrimage trekking', 'Kirat culture', 'Forest walks'],
    costs: { domestic: { perDayNpr: [2000, 4500] }, international: { perDayUsd: [50, 110] } },
    tags: ['religious', 'lakes', 'culture'],
  },
  {
    slug: 'rauta-pokhari', rank: 10, name: 'Rauta Pokhari', district: 'Udayapur', province: 'koshi',
    lat: 27.0, lon: 86.62, coordsApprox: true,
    photos: [
      { file: 'Rauta pokhari (pond) udayapur.jpg', alt: 'Rauta Pokhari pond in Udayapur' },
    ], elevationM: null, difficulty: 'easy', distanceFromKtmKm: 420,
    tagline: 'A quiet hill lake and local pilgrimage site in Udayapur.',
    story: [
      { heading: 'Local and peaceful', text: 'Rauta Pokhari is a forest lake known mostly to people from Udayapur and nearby districts, who visit for worship and picnics. It is a good short trip from the East–West Highway.' },
    ],
    travel: { nearestBusStation: 'Gaighat (Udayapur)', howToReach: 'Road from Gaighat into the hills; the last stretch may be on foot depending on the season.' },
    bestTime: 'October–March.',
    activities: ['Day hike', 'Temple visit', 'Picnic'],
    costs: { domestic: { perDayNpr: [1200, 2500] } },
    needsResearch: true,
    tags: ['lakes', 'religious', 'peaceful'],
  },
];

export const getHiddenGem = (slug) => hiddenGems.find((g) => g.slug === slug);

/**
 * Suggested circuits combining the gems, for 3 / 5 / 7 / 14 days.
 * International variants start in Kathmandu and include permit/flight logistics.
 */
const ktmToEast = { day: 1, title: 'Fly Kathmandu → Bhadrapur or Biratnagar', detail: 'Domestic flight (about 45–60 min). Change money and buy a local SIM in Kathmandu first.' };
export const circuits = [
  { days: 3, title: 'Ilam tea hills and Mai Pokhari', gems: ['mai-pokhari'], audience: 'domestic', startFrom: 'Birtamod / Ilam',
    plan: [
      { day: 1, title: 'Birtamod → Ilam', detail: 'Bus or jeep up into tea country; walk the Kanyam tea gardens on the way.' },
      { day: 2, title: 'Mai Pokhari', detail: 'Morning at the lake, afternoon at an Ilam tea estate.' },
      { day: 3, title: 'Antu Danda sunrise → home', detail: 'Early sunrise at Shree Antu, then drive back down.' },
    ] },
  { days: 3, title: 'A taste of Ilam', gems: ['mai-pokhari'], audience: 'international', startFrom: 'Kathmandu',
    plan: [
      { ...ktmToEast, detail: 'Fly to Bhadrapur, then drive to Ilam (about 3 hours).' },
      { day: 2, title: 'Mai Pokhari and tea gardens', detail: 'Lake walk in the morning, tea tasting in the afternoon.' },
      { day: 3, title: 'Sunrise, drive and fly back', detail: 'Antu Danda sunrise, drive to Bhadrapur for the afternoon flight.' },
    ] },
  { days: 5, title: 'Sandakpur sunrise trek', gems: ['mai-pokhari', 'sandakpur'], audience: 'both', startFrom: 'Ilam',
    plan: [
      { day: 1, title: 'Arrive in Ilam', detail: 'Domestic travellers by road; international via a Bhadrapur flight.' },
      { day: 2, title: 'Mai Pokhari → Maimajhuwa', detail: 'Visit the lake, continue by jeep towards the trail-head.' },
      { day: 3, title: 'Hike up to Sandakpur', detail: 'Steep climb through forest; overnight near the top.' },
      { day: 4, title: 'Sunrise over Kanchenjunga, descend', detail: 'Be at the summit before dawn.' },
      { day: 5, title: 'Back to Ilam / Bhadrapur' },
    ] },
  { days: 7, title: 'Rhododendron ridge: Tinjure–Milke–Jaljale', gems: ['tinjure-milke-jaljale'], audience: 'both', startFrom: 'Dharan / Biratnagar',
    plan: [
      { day: 1, title: 'Dharan → Basantapur', detail: 'Via Dhankuta and Hile (Bhedetar viewpoint on the way).' },
      { day: 2, title: 'Basantapur → Tinjure Phedi' },
      { day: 3, title: 'Tinjure → Chauki', detail: 'Walk through the thickest rhododendron forest (in bloom March–April).' },
      { day: 4, title: 'Chauki → Mangalbare / Milke Danda' },
      { day: 5, title: 'Milke → Jaljale viewpoint and back', detail: 'Mountain panorama on a clear day.' },
      { day: 6, title: 'Return towards Basantapur' },
      { day: 7, title: 'Drive to Dharan / Biratnagar', detail: 'International travellers can fly Biratnagar → Kathmandu the same evening.' },
    ] },
  { days: 14, title: 'Upper Taplejung: Olangchung Gola and Yangma', gems: ['olangchung-gola', 'yangma-valley'], audience: 'international', startFrom: 'Kathmandu',
    plan: [
      { day: 1, title: 'Kathmandu: permits and briefing', detail: 'Your agency arranges the restricted-area permit (group of two or more, licensed guide).' },
      { day: 2, title: 'Fly to Bhadrapur, drive towards Taplejung' },
      { day: 3, title: 'Drive up the Tamor valley to the road-head' },
      { day: 4, title: 'Trek up the Tamor valley' },
      { day: 5, title: 'Continue towards Olangchung Gola' },
      { day: 6, title: 'Arrive Olangchung Gola' },
      { day: 7, title: 'Rest day: Dingsamba gompa and village', detail: 'Acclimatisation.' },
      { day: 8, title: 'Towards the Nango La (camp)' },
      { day: 9, title: 'Cross the Nango La → Yangma', detail: 'Long, high day; weather dependent.' },
      { day: 10, title: 'Yangma valley exploration' },
      { day: 11, title: 'Yangma → Ghunsa' },
      { day: 12, title: 'Ghunsa → Gyabla' },
      { day: 13, title: 'Trek out and drive to Taplejung' },
      { day: 14, title: 'Drive to Bhadrapur, fly to Kathmandu', detail: 'Keep one spare day in your plan for weather.' },
    ] },
  { days: 14, title: 'East Nepal highlights by road', gems: ['mai-pokhari', 'sandakpur', 'tinjure-milke-jaljale', 'salpa-pokhari'], audience: 'domestic', startFrom: 'Birtamod',
    plan: [
      { day: 1, title: 'Birtamod → Ilam' }, { day: 2, title: 'Mai Pokhari, tea gardens' },
      { day: 3, title: 'To Maimajhuwa' }, { day: 4, title: 'Hike to Sandakpur' }, { day: 5, title: 'Sunrise, descend to Ilam' },
      { day: 6, title: 'Ilam → Dhankuta via Phidim' }, { day: 7, title: 'Hile → Basantapur' },
      { day: 8, title: 'Tinjure' }, { day: 9, title: 'Milke Danda' }, { day: 10, title: 'Back to Basantapur, drive to Bhojpur' },
      { day: 11, title: 'Bhojpur → Salpa trail' }, { day: 12, title: 'Climb to Salpa Pokhari' },
      { day: 13, title: 'Descend' }, { day: 14, title: 'Drive home' },
    ] },
];
