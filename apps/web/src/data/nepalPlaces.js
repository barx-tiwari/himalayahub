/**
 * Nepal geography used by Weather, Explore Nepal and Emergency Help.
 * 7 provinces / 77 districts (post-2015 federal structure).
 * Coordinates are approximate town/area centres used only to request
 * forecasts; they are not survey-grade.
 */
export const provinces = [
  { id: 'koshi', name: 'Koshi Province', districts: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'] },
  { id: 'madhesh', name: 'Madhesh Province', districts: ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'] },
  { id: 'bagmati', name: 'Bagmati Province', districts: ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'] },
  { id: 'gandaki', name: 'Gandaki Province', districts: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'] },
  { id: 'lumbini', name: 'Lumbini Province', districts: ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Eastern Rukum', 'Gulmi', 'Kapilvastu', 'Palpa', 'Parasi', 'Pyuthan', 'Rolpa', 'Rupandehi'] },
  { id: 'karnali', name: 'Karnali Province', districts: ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Salyan', 'Surkhet', 'Western Rukum'] },
  { id: 'sudurpashchim', name: 'Sudurpashchim Province', districts: ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur'] },
];

export const getProvince = (id) => provinces.find((p) => p.id === id);
export const provinceOfDistrict = (district) => provinces.find((p) => p.districts.includes(district));

/** Cities offered as quick picks on the Weather page. */
export const weatherCities = [
  { id: 'kathmandu', name: 'Kathmandu', district: 'Kathmandu', province: 'bagmati', lat: 27.7172, lon: 85.324 },
  { id: 'lalitpur', name: 'Lalitpur', district: 'Lalitpur', province: 'bagmati', lat: 27.6644, lon: 85.3188 },
  { id: 'bhaktapur', name: 'Bhaktapur', district: 'Bhaktapur', province: 'bagmati', lat: 27.671, lon: 85.4298 },
  { id: 'pokhara', name: 'Pokhara', district: 'Kaski', province: 'gandaki', lat: 28.2096, lon: 83.9856 },
  { id: 'biratnagar', name: 'Biratnagar', district: 'Morang', province: 'koshi', lat: 26.4525, lon: 87.2718 },
  { id: 'dharan', name: 'Dharan', district: 'Sunsari', province: 'koshi', lat: 26.812, lon: 87.2836 },
  { id: 'birgunj', name: 'Birgunj', district: 'Parsa', province: 'madhesh', lat: 27.0104, lon: 84.877 },
  { id: 'janakpur', name: 'Janakpur', district: 'Dhanusha', province: 'madhesh', lat: 26.7288, lon: 85.9266 },
  { id: 'bharatpur', name: 'Bharatpur', district: 'Chitwan', province: 'bagmati', lat: 27.6833, lon: 84.4333 },
  { id: 'hetauda', name: 'Hetauda', district: 'Makwanpur', province: 'bagmati', lat: 27.4284, lon: 85.0322 },
  { id: 'butwal', name: 'Butwal', district: 'Rupandehi', province: 'lumbini', lat: 27.7006, lon: 83.4484 },
  { id: 'nepalgunj', name: 'Nepalgunj', district: 'Banke', province: 'lumbini', lat: 28.05, lon: 81.6167 },
  { id: 'dhangadhi', name: 'Dhangadhi', district: 'Kailali', province: 'sudurpashchim', lat: 28.6833, lon: 80.6 },
];

export const getCity = (id) => weatherCities.find((c) => c.id === id);

/**
 * Destinations for Explore Nepal, the destination pages, "Where should you go?"
 * and the home page.
 *
 * - `mountain: true` marks trekking/high-altitude areas where model forecasts are
 *   least reliable and official safety checks matter most.
 * - `zone` places a destination on the Himalaya → Hills → Valleys → Terai journey.
 * - `tags` drive the experience filters (sunny and cool weather come from the live
 *   forecast instead of tags).
 * - `photos[].file` is a Wikimedia Commons file name (freely licensed). Author and
 *   licence are read from Commons at runtime and listed on /image-credits.
 *   To use your own photo instead, give `{ src: '/images/pokhara.jpg', alt, credit }`.
 *
 * Travel notes are deliberately general: routes, permits, prices and flights change.
 * Nothing here is a guarantee — pages always point people to official sources.
 */
export const EXPERIENCES = [
  { id: 'sunny', emoji: '☀️', label: 'Sunny', live: true },
  { id: 'mountains', emoji: '🏔', label: 'Mountains' },
  { id: 'lakes', emoji: '🌊', label: 'Lakes' },
  { id: 'nature', emoji: '🌳', label: 'Nature' },
  { id: 'culture', emoji: '🏛', label: 'Culture' },
  { id: 'adventure', emoji: '🥾', label: 'Adventure' },
  { id: 'peaceful', emoji: '🧘', label: 'Peaceful' },
  { id: 'photography', emoji: '📸', label: 'Photography' },
  { id: 'cool', emoji: '🌧', label: 'Cool Weather', live: true },
  { id: 'sunrise', emoji: '🌅', label: 'Sunrise' },
];

export const ZONES = [
  { id: 'himalaya', name: 'Himalayas', altitude: 'Roughly 3,000 m and above', blurb: 'Glaciers, high passes and the world’s tallest peaks.' },
  { id: 'hill', name: 'Hills', altitude: 'Roughly 1,000–3,000 m', blurb: 'Terraced ridges, tea gardens and old trading towns.' },
  { id: 'valley', name: 'Valleys', altitude: 'Roughly 800–1,400 m', blurb: 'Lakes, temples and Nepal’s two biggest cities.' },
  { id: 'terai', name: 'Terai', altitude: 'Roughly 60–300 m', blurb: 'Lowland jungle, wildlife and sacred plains.' },
];

export const destinations = [
  {
    id: 'pokhara', name: 'Pokhara', province: 'gandaki', lat: 28.2096, lon: 83.9856, emoji: '🏞️', zone: 'valley', featured: true,
    tagline: 'Lake views, mountain landscapes and adventure.',
    knownFor: 'Phewa Lake, Lakeside and views of the Annapurna range',
    tags: ['lakes', 'mountains', 'adventure', 'photography', 'sunrise', 'nature'],
    activities: ['Lakeside walks', 'Boating on Phewa Lake', 'Sunrise mountain views', 'Short hikes', 'Paragliding (weather permitting)'],
    nearbyAttractions: ['Sarangkot viewpoint', 'World Peace Pagoda', 'Davis Falls', 'Begnas and Rupa lakes'],
    bestTime: 'Autumn (roughly October–November) and spring (roughly March–May) usually bring the clearest mountain views. Summer monsoon months are wetter and often cloudy.',
    duration: '2–4 days',
    tips: ['Mountain views are clearest early in the morning.', 'Book adventure activities only with registered operators.', 'Carry a light rain layer outside the dry season.'],
    safety: ['Wear a life jacket when boating.', 'Paragliding and other adventure sports depend on weather; operators may cancel at short notice.'],
    travel: 'Roughly 200 km west of Kathmandu. Commonly reached by tourist bus or a short domestic flight.',
    nearby: ['begnas', 'bandipur', 'annapurna'],
    outdoor: true,
    photos: [
      { file: 'Annapurna Range and the Phewa Lake.jpg', alt: 'Pokhara Phewa Lake and Himalayan mountains' },
      { file: 'Machhapuchchhre & Phewa Lake.jpg', alt: 'Machhapuchchhre (Fishtail) peak rising above Phewa Lake' },
      { file: 'Phewa Lake, Talbarahi Temple and the Pokhara City.JPG', alt: 'Tal Barahi temple on Phewa Lake with Pokhara city behind' },
      { file: 'Mt. Machhapuchchhre view.jpg', alt: 'Snow-covered Machhapuchchhre seen from Pokhara' },
    ],
  },
  {
    id: 'everest', name: 'Everest Region', province: 'koshi', lat: 27.8046, lon: 86.714, emoji: '🏔️', zone: 'himalaya', featured: true,
    tagline: 'Home to some of the world’s most iconic mountain landscapes.',
    knownFor: 'Khumbu valley, Sherpa villages and trekking routes towards Everest',
    tags: ['mountains', 'adventure', 'photography', 'cool'],
    activities: ['Trekking (Namche Bazaar and beyond)', 'Monastery visits', 'Mountain viewpoints'],
    nearbyAttractions: ['Namche Bazaar', 'Tengboche Monastery', 'Kala Patthar viewpoint', 'Sagarmatha National Park'],
    bestTime: 'Most trekkers go in autumn (roughly October–November) or spring (roughly March–May). Winter is very cold at altitude; the monsoon brings cloud and flight delays.',
    duration: 'Around 12–16 days for a typical base-camp trek; shorter treks are possible',
    tips: ['Build rest days into your plan to acclimatise.', 'Keep spare days for weather-delayed Lukla flights.', 'Arrange permits and insurance that covers high-altitude trekking before you go.'],
    safety: ['Altitude sickness can be serious. Descend if symptoms get worse and seek local medical help.', 'Trek with a licensed guide or registered agency where rules require it.'],
    travel: 'Most trekkers fly to Lukla; flights are frequently delayed by weather. Park and local permits are required. Forecast shown is for the Namche area.',
    nearby: ['gosaikunda', 'nagarkot'],
    outdoor: true, mountain: true,
    photos: [
      { file: 'Everest, Nuptse, Khumbu Glacier, Nepal, Himalayas.jpg', alt: 'Mount Everest Himalayan landscape with Nuptse and the Khumbu Glacier' },
      { file: 'Mount Everest, Nepal, Himalayas.jpg', alt: 'Mount Everest seen from Kala Patthar' },
      { file: 'Everest panorama from Kala Patthar.jpg', alt: 'Panorama of the Everest massif from Kala Patthar' },
    ],
  },
  {
    id: 'mustang', name: 'Mustang', province: 'gandaki', lat: 28.7804, lon: 83.723, emoji: '🏜️', zone: 'himalaya', featured: true,
    tagline: 'Unique Himalayan desert landscapes, cliffs and ancient culture.',
    knownFor: 'High, dry trans-Himalayan landscape; Jomsom, Kagbeni, Muktinath and Lo Manthang',
    tags: ['mountains', 'culture', 'adventure', 'photography', 'cool'],
    activities: ['Muktinath pilgrimage', 'Jeep or trek routes', 'Apple orchards in Marpha', 'Walled city of Lo Manthang (Upper Mustang)'],
    nearbyAttractions: ['Muktinath temple', 'Kagbeni village', 'Marpha', 'Lo Manthang'],
    bestTime: 'Spring to autumn is the usual season. Mustang sits in a rain shadow, so it is often drier than the rest of Nepal during the monsoon, but roads can still be affected.',
    duration: '4–7 days for Lower Mustang; Upper Mustang trips are usually longer',
    tips: ['Afternoon winds in the Kali Gandaki valley can be strong; travel early.', 'Carry sun protection — the air is dry and UV is high.'],
    safety: ['Upper Mustang requires a special restricted-area permit and is usually visited with a registered agency.', 'Check road conditions before driving; landslides can close routes.'],
    travel: 'Commonly reached via Pokhara by flight to Jomsom or by road. Upper Mustang requires a special restricted-area permit.',
    nearby: ['annapurna', 'tilicho', 'pokhara'],
    outdoor: true, mountain: true,
    photos: [
      { file: 'The kingdom of Lo, Lomangthang, Upper Mustang (Pano).jpg', alt: 'Upper Mustang landscape around the walled city of Lo Manthang' },
      { file: 'Upper Mustang Lomanthang.jpg', alt: 'Lo Manthang in Upper Mustang' },
      { file: 'Mustang-Lo Manthang-02-gje.jpg', alt: 'Traditional buildings in Lo Manthang, Mustang' },
      { file: 'Chhoser Upper Mustang (168).jpg', alt: 'Cliffs near Chhoser in Upper Mustang' },
    ],
  },
  {
    id: 'chitwan', name: 'Chitwan', province: 'bagmati', lat: 27.5786, lon: 84.4983, emoji: '🐘', zone: 'terai', featured: true,
    tagline: 'Wildlife, jungle experiences and nature.',
    knownFor: 'Chitwan National Park, lowland forest and wildlife',
    tags: ['nature', 'culture', 'photography', 'peaceful'],
    activities: ['Guided jungle walks', 'Canoeing', 'Tharu cultural programmes', 'Bird watching'],
    nearbyAttractions: ['Sauraha', 'Rapti River', 'Tharu villages', 'Devghat'],
    bestTime: 'Roughly October to March is cooler and popular for wildlife viewing. April–June can be very hot; the monsoon brings heavy rain.',
    duration: '2–3 days',
    tips: ['Wildlife sightings are never guaranteed.', 'Wear neutral colours and carry insect repellent.'],
    safety: ['Enter the park only with a licensed guide and follow park rules.', 'Keep a safe distance from rhinos, elephants and other wild animals.'],
    travel: 'About 150 km south-west of Kathmandu by road; Bharatpur has a domestic airport. Park activities require permits and licensed guides.',
    nearby: ['lumbini', 'bandipur', 'kathmandu-valley'],
    outdoor: true,
    photos: [
      { file: 'Chitwan national Park.jpg', alt: 'Elephants bathing in the Rapti River, Chitwan National Park' },
      { file: 'Greater one-horned rhinoceros at Chitwan.jpg', alt: 'Greater one-horned rhinoceros in Chitwan' },
      { file: 'Sun rise in rapti river by reflecting sunlight towards chitwan national park.jpg', alt: 'Sunrise over the Rapti River near Chitwan National Park' },
      { file: 'Tourists crossing Rapti river in a boat at Sauraha , Chitwan.jpg', alt: 'Visitors crossing the Rapti River by boat at Sauraha' },
    ],
  },
  {
    id: 'lumbini', name: 'Lumbini', province: 'lumbini', lat: 27.4833, lon: 83.2763, emoji: '☸️', zone: 'terai', featured: true,
    tagline: 'The birthplace of Gautama Buddha.',
    knownFor: 'Birthplace of the Buddha and the monastic zone',
    tags: ['culture', 'peaceful', 'photography'],
    activities: ['Maya Devi Temple', 'Monastic zone', 'Cycling between monasteries', 'Museum visits'],
    nearbyAttractions: ['Ashoka Pillar', 'World Peace Pagoda (Lumbini)', 'Tilaurakot', 'Kapilvastu area'],
    bestTime: 'Roughly October to March is most comfortable. Summer afternoons in the plains can be very hot.',
    duration: '1–2 days',
    tips: ['Dress modestly and remove shoes where asked.', 'The monastic zone is large — a bicycle or rickshaw helps.'],
    safety: ['Drink plenty of water in hot months and avoid midday sun.'],
    travel: 'Near Bhairahawa, which has an international airport (Gautam Buddha International). Summer afternoons in the plains can be very hot.',
    nearby: ['chitwan', 'janakpur'],
    outdoor: true,
    photos: [
      { file: 'Maya Devi Temple and Ashoka Pillar, Lumbini, Rupandehi, Nepal.jpg', alt: 'Maya Devi Temple and the Ashoka Pillar in Lumbini' },
      { file: 'Mayadevi Temple Lumbini front view.jpg', alt: 'Front view of the Maya Devi Temple, Lumbini' },
      { file: 'Monks Praying at Lumbini.jpg', alt: 'Monks praying at Lumbini' },
    ],
  },
  {
    id: 'rara', name: 'Rara Lake', province: 'karnali', lat: 29.527, lon: 82.088, emoji: '💧', zone: 'himalaya', featured: true,
    tagline: 'Peaceful turquoise water surrounded by mountains.',
    knownFor: "Nepal's largest lake, inside Rara National Park",
    tags: ['lakes', 'nature', 'peaceful', 'photography', 'cool'],
    activities: ['Lakeside walks', 'Short hikes', 'Camping (with park rules)'],
    nearbyAttractions: ['Murma Top viewpoint', 'Rara National Park', 'Gamgadhi'],
    bestTime: 'Spring and autumn are the usual seasons. Winter brings snow and very cold nights; monsoon travel is harder.',
    duration: '4–7 days including travel',
    tips: ['Services are limited — carry cash, snacks and warm layers.', 'Allow buffer days for flights and road delays.'],
    safety: ['This is a remote area; plan transport and accommodation in advance.', 'Nights can drop below freezing outside summer.'],
    travel: 'Remote. Usually reached by flight via Nepalgunj to Talcha, or a long road journey. Services are limited.',
    nearby: ['lumbini'],
    outdoor: true, mountain: true,
    photos: [
      { file: 'Rara lake, Murma top.jpg', alt: 'Rara Lake Nepal seen from Murma Top' },
      { file: 'Rara Lake in its reflection.jpg', alt: 'Hills reflected in the still water of Rara Lake' },
      { file: 'Rara lake and reflection.jpg', alt: 'Morning reflection on Rara Lake' },
      { file: 'Rara lake from afar.jpg', alt: 'Rara Lake surrounded by forest' },
    ],
  },
  {
    id: 'bandipur', name: 'Bandipur', province: 'gandaki', lat: 27.9381, lon: 84.4069, emoji: '🏘️', zone: 'hill', featured: true,
    tagline: 'Heritage architecture and Himalayan views.',
    knownFor: 'Preserved Newar hill town with Himalayan views',
    tags: ['culture', 'peaceful', 'photography', 'mountains', 'sunrise'],
    activities: ['Old bazaar walk', 'Viewpoints', 'Short hikes', 'Caves nearby'],
    nearbyAttractions: ['Thani Mai viewpoint', 'Siddha Cave', 'Ramkot village'],
    bestTime: 'Autumn and spring usually give the clearest views. It is pleasant most of the year outside heavy monsoon rain.',
    duration: '1–2 days',
    tips: ['Stay overnight to see the bazaar quiet in the evening and the mountains at sunrise.', 'Wear good shoes for steep stone paths.'],
    safety: ['Cave visits should be done with a local guide and a torch.'],
    travel: 'A short uphill drive from Dumre on the Kathmandu–Pokhara highway.',
    nearby: ['pokhara', 'chitwan'],
    outdoor: true, viewDependent: true,
    photos: [
      { file: 'Bandipur, Nepal-WLV-1852.jpg', alt: 'Traditional houses in Bandipur bazaar' },
      { file: 'Bandipur, Nepal.jpg', alt: 'Bandipur hill town street' },
      { file: 'Mountain view from Bandipur, Nepal.jpg', alt: 'Himalayan view from Bandipur' },
      { file: 'Bandipur Tanahun, Nepal.jpg', alt: 'Bandipur, Tanahun, on its ridge' },
    ],
  },
  {
    id: 'nagarkot', name: 'Nagarkot', province: 'bagmati', lat: 27.7154, lon: 85.5204, emoji: '🌄', zone: 'hill', featured: true,
    tagline: 'Popular for sunrise and mountain views near Kathmandu.',
    knownFor: 'Sunrise and sunset views over the Himalaya on clear days',
    tags: ['sunrise', 'mountains', 'peaceful', 'photography'],
    activities: ['Sunrise viewpoint', 'Ridge walks', 'Hike to Changunarayan'],
    nearbyAttractions: ['Nagarkot view tower', 'Changunarayan Temple', 'Bhaktapur'],
    bestTime: 'Clear mornings are most likely roughly October to March. Haze and cloud are common in late spring and the monsoon.',
    duration: '1 night',
    tips: ['Check the forecast the evening before — views depend on clear skies.', 'Mornings are cold; bring a jacket even in spring.'],
    safety: ['Roads are narrow and winding; travel with an experienced driver after dark.'],
    travel: 'Around 30 km east of Kathmandu by road.',
    nearby: ['dhulikhel', 'kathmandu-valley'],
    outdoor: true, viewDependent: true,
    photos: [
      { file: 'Sunrise in Nagarkot, 9 May 2019.jpg', alt: 'Himalayan sunrise from Nagarkot' },
      { file: 'Sunrise View from the Nagarkot View Tower.jpg', alt: 'Orange sunrise seen from the Nagarkot view tower' },
      { file: 'Mountains seen from the Nagarkot.jpg', alt: 'Himalayan range seen from Nagarkot' },
      { file: 'View from Nagarkot, nepal.jpg', alt: 'Hills and valleys below Nagarkot' },
    ],
  },
  {
    id: 'ilam', name: 'Ilam', province: 'koshi', lat: 26.9112, lon: 87.9236, emoji: '🍃', zone: 'hill', featured: true,
    tagline: 'Green tea gardens and peaceful eastern Nepal landscapes.',
    knownFor: 'Tea gardens and green hills in the far east',
    tags: ['nature', 'peaceful', 'photography', 'sunrise'],
    activities: ['Tea garden walks', 'Viewpoints', 'Local tea tasting'],
    nearbyAttractions: ['Kanyam tea gardens', 'Antu Danda (Shree Antu) sunrise point', 'Mai Pokhari'],
    bestTime: 'Spring and autumn are popular. The monsoon keeps the hills very green but can bring heavy rain.',
    duration: '2–3 days',
    tips: ['Visit a tea estate early in the day to see picking.', 'Sunrise points get busy on holidays — arrive early.'],
    safety: ['Hill roads can be slippery after rain.'],
    travel: 'In eastern Nepal; Bhadrapur (Jhapa) is the nearest domestic airport, then by road.',
    nearby: ['janakpur'],
    outdoor: true,
    photos: [
      { file: 'Tea garden at ilam nepal.jpg', alt: 'Rows of tea bushes in an Ilam tea garden' },
      { file: 'Kanyam Ilam.jpg', alt: 'Kanyam tea gardens, Ilam' },
      { file: 'Ilam green.jpg', alt: 'Green hills and tea gardens in Ilam' },
      { file: 'Sunny day tea garden kanyam ilam.jpg', alt: 'Tea garden in Kanyam on a sunny day' },
    ],
  },
  {
    id: 'gosaikunda', name: 'Gosaikunda', province: 'bagmati', lat: 28.082, lon: 85.415, emoji: '🗻', zone: 'himalaya', featured: true,
    tagline: 'A high-altitude Himalayan lake and pilgrimage destination.',
    knownFor: 'Sacred alpine lakes in Langtang National Park',
    tags: ['lakes', 'mountains', 'adventure', 'cool', 'culture'],
    activities: ['High-altitude trekking', 'Pilgrimage (Janai Purnima)'],
    nearbyAttractions: ['Langtang National Park', 'Laurebina Pass', 'Dhunche'],
    bestTime: 'Autumn and spring are the usual trekking seasons. The lake can freeze in winter, and the pilgrimage around Janai Purnima is very busy.',
    duration: '4–6 days round trip',
    tips: ['Ascend gradually — the lake sits at roughly 4,380 m.', 'Carry warm layers even in summer.'],
    safety: ['Altitude sickness is a real risk. Descend if symptoms worsen.', 'Check trail and weather conditions locally; snow can make passes dangerous.'],
    travel: 'Treks usually start from Dhunche in Rasuwa. High altitude: acclimatise and go with local guidance.',
    nearby: ['kathmandu-valley', 'everest'],
    outdoor: true, mountain: true,
    photos: [
      { file: 'Gosaikunda of Rasuwa.jpg', alt: 'Gosaikunda lake, Rasuwa' },
      { file: 'Morning at Gosainkunda Lake.jpg', alt: 'Morning light over Gosaikunda lake' },
      { file: 'View of Gosaikunda.jpg', alt: 'Gosaikunda lake among rocky mountain slopes' },
      { file: 'Himalyan Range Gosainkunda 04 Langtang National Park.jpg', alt: 'Himalayan range near Gosaikunda in Langtang National Park' },
    ],
  },
  {
    id: 'kathmandu-valley', name: 'Kathmandu Valley', province: 'bagmati', lat: 27.7172, lon: 85.324, emoji: '🛕', zone: 'valley',
    tagline: 'Durbar Squares, stupas and living heritage.',
    knownFor: 'Durbar Squares, stupas and temples across Kathmandu, Lalitpur and Bhaktapur',
    tags: ['culture', 'photography'],
    activities: ['Heritage sites', 'Museums', 'Food walks', 'Day hikes on the valley rim'],
    nearbyAttractions: ['Boudhanath', 'Swayambhunath', 'Patan Durbar Square', 'Bhaktapur Durbar Square'],
    bestTime: 'Pleasant for much of the year. Autumn and spring are drier; winter mornings are cold and hazy.',
    duration: '2–4 days',
    tips: ['Many heritage sites charge an entry fee — keep the ticket.', 'Walk clockwise around stupas.'],
    safety: ['Traffic is heavy; take care crossing roads.', 'Air quality can be poor in the dry season; a mask helps.'],
    travel: 'Tribhuvan International Airport is in Kathmandu. Most sites are reachable by taxi or ride-hailing.',
    nearby: ['nagarkot', 'dhulikhel', 'gosaikunda'],
    outdoor: true,
    photos: [
      { file: 'Boudha Stupa 2018 04.jpg', alt: 'Boudhanath stupa, Kathmandu' },
      { file: 'Boudhanath stupa , Kathmandu, Nepal.jpg', alt: 'Prayer flags on Boudhanath stupa' },
      { file: 'Boudhanath Stupa, Kathmandu (16095442425).jpg', alt: 'The dome and spire of Boudhanath' },
    ],
  },
  {
    id: 'annapurna', name: 'Annapurna Region', province: 'gandaki', lat: 28.4, lon: 83.7, emoji: '🥾', zone: 'himalaya',
    tagline: 'Classic treks, rhododendron forests and big mountain views.',
    knownFor: 'Classic treks such as Poon Hill, Annapurna Base Camp and the Circuit',
    tags: ['mountains', 'adventure', 'sunrise', 'photography', 'nature', 'cool'],
    activities: ['Trekking', 'Sunrise at Poon Hill', 'Hot springs'],
    nearbyAttractions: ['Poon Hill', 'Ghandruk', 'Annapurna Base Camp', 'Tatopani hot springs'],
    bestTime: 'Autumn and spring are the main trekking seasons; spring brings rhododendron blossom.',
    duration: 'From about 4 days (Poon Hill) to 2–3 weeks (Circuit)',
    tips: ['Start early to catch clear morning views.', 'Tea-house lodges fill up in peak season.'],
    safety: ['Avalanche and landslide risk rises with heavy snow or rain — ask locally about trail conditions.', 'Altitude sickness is possible on higher routes.'],
    travel: 'Treks usually start from the Pokhara area. Annapurna Conservation Area permit required. Forecast shown is for the Ghorepani area.',
    nearby: ['pokhara', 'mustang', 'tilicho'],
    outdoor: true, mountain: true,
    photos: [
      { file: 'Landscape view of Poon Hill.jpg', alt: 'Annapurna range from Poon Hill' },
      { file: 'Mount Dhaulagiri From Poon Hill.jpg', alt: 'Dhaulagiri seen from Poon Hill' },
      { file: 'A view of Annapurna range from Ghandruk.jpg', alt: 'Annapurna range from Ghandruk village' },
    ],
  },
  {
    id: 'tilicho', name: 'Tilicho Lake', province: 'gandaki', lat: 28.6917, lon: 83.8528, emoji: '🧊', zone: 'himalaya',
    tagline: 'One of the highest lakes of its size in the world.',
    knownFor: 'Glacial lake at roughly 4,900 m in the Annapurna range',
    tags: ['lakes', 'mountains', 'adventure', 'cool', 'photography'],
    activities: ['High-altitude trekking', 'Side trip from the Annapurna Circuit'],
    nearbyAttractions: ['Manang village', 'Tilicho Base Camp', 'Thorong La'],
    bestTime: 'Usually autumn and spring. Snow can block the route in winter and early spring.',
    duration: 'Around 2–3 days as a side trip from Manang',
    tips: ['Acclimatise in Manang before going up.', 'Start early — afternoon winds are strong.'],
    safety: ['Parts of the trail cross landslide-prone slopes; follow local advice.', 'Altitude sickness risk is high at this elevation.'],
    travel: 'Reached on foot from Manang on the Annapurna Circuit. Annapurna Conservation Area permit required.',
    nearby: ['annapurna', 'mustang'],
    outdoor: true, mountain: true,
    photos: [
      { file: 'Tilicho Lake.jpg', alt: 'Tilicho Lake beneath snowy peaks' },
      { file: 'Tilicho Lake in Summer.jpg', alt: 'Tilicho Lake in summer' },
      { file: 'Tilicho Tal.jpg', alt: 'Tilicho Lake and Tilicho Peak' },
    ],
  },
  {
    id: 'begnas', name: 'Begnas Lake', province: 'gandaki', lat: 28.1733, lon: 84.1, emoji: '🛶', zone: 'valley',
    tagline: 'A quieter lake on the edge of Pokhara.',
    knownFor: 'Calm lake, fish farms and forested hills east of Pokhara',
    tags: ['lakes', 'peaceful', 'nature'],
    activities: ['Rowing', 'Lakeside walks', 'Village homestays'],
    nearbyAttractions: ['Rupa Lake', 'Pokhara Lakeside', 'Panchabhaiya viewpoint'],
    bestTime: 'Pleasant most of the year; autumn and spring usually give the best mountain views.',
    duration: 'Half a day to 1 day',
    tips: ['Combine with Rupa Lake for a quiet day away from Lakeside crowds.'],
    safety: ['Wear a life jacket when boating.'],
    travel: 'Around 15 km east of central Pokhara by road.',
    nearby: ['pokhara', 'bandipur'],
    outdoor: true,
    photos: [
      { file: 'Begnas taal Pokhara 02.jpg', alt: 'Begnas Lake, Pokhara' },
      { file: 'Begnas Lake with Mt. Annapurna.jpg', alt: 'Begnas Lake with the Annapurna range behind' },
      { file: 'Begnas lake20.JPG', alt: 'Boats on Begnas Lake' },
    ],
  },
  {
    id: 'dhulikhel', name: 'Dhulikhel', province: 'bagmati', lat: 27.618, lon: 85.555, emoji: '⛰️', zone: 'hill',
    tagline: 'Hill town lanes and wide Himalayan horizons.',
    knownFor: 'Hill town with mountain views and heritage lanes',
    tags: ['mountains', 'peaceful', 'culture', 'sunrise'],
    activities: ['Namobuddha hike', 'Old town walk', 'Viewpoints'],
    nearbyAttractions: ['Namobuddha monastery', 'Panauti', 'Banepa'],
    bestTime: 'Clearest views are usually from roughly October to March.',
    duration: '1–2 days',
    tips: ['The Namobuddha walk is a good day hike; start early.'],
    safety: ['Carry water and sun protection on ridge walks.'],
    travel: 'Around 30 km east of Kathmandu on the Araniko Highway.',
    nearby: ['nagarkot', 'kathmandu-valley'],
    outdoor: true, viewDependent: true,
    photos: [
      { file: 'With beautiful cloud Dhulikhel.jpg', alt: 'Dhulikhel hills under a cloudy sky' },
      { file: 'Namo Buddha, view from main Gumba. Namo Buddha, Kavrepalanchowk, Nepal.jpg', alt: 'View from the Namobuddha monastery near Dhulikhel' },
      { file: 'Dhulikhel0830.JPG', alt: 'Dhulikhel town' },
    ],
  },
  {
    id: 'janakpur', name: 'Janakpur', province: 'madhesh', lat: 26.7288, lon: 85.9266, emoji: '🏯', zone: 'terai',
    tagline: 'Janaki Mandir and the colours of Mithila.',
    knownFor: 'Janaki Mandir and Mithila art and culture',
    tags: ['culture', 'photography'],
    activities: ['Janaki Mandir', 'Mithila art', 'Ponds and temples', 'Local markets'],
    nearbyAttractions: ['Ram Mandir', 'Dhanush Sagar', 'Janakpur Women’s Art Centre'],
    bestTime: 'Roughly October to March is most comfortable; festivals such as Vivaha Panchami draw large crowds.',
    duration: '1–2 days',
    tips: ['Look for Mithila paintings made by local artists.', 'Temples are busiest in the evening.'],
    safety: ['Summer heat in the Terai can be intense — stay hydrated.'],
    travel: 'Domestic flights and road connections. Summer heat in the Terai can be intense.',
    nearby: ['chitwan', 'lumbini'],
    outdoor: true,
    photos: [
      { file: 'Janki Mandir.JPG', alt: 'Janaki Mandir, Janakpur' },
      { file: 'Janaki Mandir of Janakpurdham, Nepal.jpg', alt: 'Janaki Mandir under a blue sky' },
      { file: 'Janaki Mandir night view, Janakpur 20221101.jpg', alt: 'Janaki Mandir lit up at night' },
    ],
  },
];

/** Hero image for the home page (Wikimedia Commons, CC BY 4.0). */
export const HERO_PHOTO = { file: 'Everest, Nuptse, Khumbu Glacier, Nepal, Himalayas.jpg', alt: 'Mount Everest and Nuptse above the Khumbu Glacier in the Nepal Himalaya' };

export const getDestination = (id) => destinations.find((d) => d.id === id);
export const featuredDestinations = destinations.filter((d) => d.featured);
export const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Every photo used on the site (for the credits page). */
export const allPhotos = [HERO_PHOTO, ...destinations.flatMap((d) => d.photos.map((p) => ({ ...p, destination: d.id })))]
  .filter((p, i, list) => list.findIndex((q) => q.file === p.file) === i);
