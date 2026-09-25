/**
 * DEMO DATA — development only (VITE_DEMO_DATA=true with `npm run dev`).
 * Names are deliberately fictional ("Demo United", "Sample headline") so they
 * can never be mistaken for real news, scores or prices. Production builds
 * never import values from here into the UI (see services/config.js).
 */
const t = (mins) => new Date(Date.now() + mins * 60_000).toISOString();
const day = (d) => new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);

export const demoNews = (category = 'latest') => Array.from({ length: 14 }, (_, i) => ({
  id: `demo-${category}-${i}`,
  title: `Sample headline ${i + 1}: placeholder story for the ${category} layout`,
  description: 'This is demo text used to preview the news layout. It is not a real news story and has no source.',
  url: 'https://example.com/demo-story',
  source: i % 2 ? 'Demo Wire' : 'Sample Times',
  publishedAt: t(-(i * 37 + 12)),
  image: null,
  category: i % 3 ? 'world' : 'nepal',
  region: i % 3 ? 'World' : 'Nepal',
}));

const team = (name) => ({ name, short: name.split(' ')[0], crest: null });
export const demoMatches = () => [
  { id: 1, utcDate: t(-50), status: 'IN_PLAY', competition: { code: 'PL', name: 'Premier League' }, home: team('Demo United'), away: team('Sample City'), score: { home: 1, away: 1 } },
  { id: 2, utcDate: t(-200), status: 'FINISHED', competition: { code: 'PD', name: 'La Liga' }, home: team('Example Real'), away: team('Placeholder FC'), score: { home: 2, away: 0 } },
  { id: 3, utcDate: t(180), status: 'TIMED', competition: { code: 'SA', name: 'Serie A' }, home: team('Test Rovers'), away: team('Mock Athletic'), score: { home: null, away: null } },
  { id: 4, utcDate: t(60 * 26), status: 'SCHEDULED', competition: { code: 'CL', name: 'UEFA Champions League' }, home: team('Demo United'), away: team('Sample Sporting'), score: { home: null, away: null } },
  { id: 5, utcDate: t(60 * 50), status: 'TIMED', competition: { code: 'BL1', name: 'Bundesliga' }, home: team('Beispiel SV'), away: team('Muster 04'), score: { home: null, away: null } },
];
export const demoStandings = () => ['Demo United', 'Sample City', 'Example Real', 'Placeholder FC', 'Test Rovers', 'Mock Athletic'].map((n, i) => ({
  position: i + 1, team: team(n), played: 6, won: 5 - i > 0 ? 5 - i : 0, draw: 1, lost: i, goalDiff: 8 - i * 3, points: 16 - i * 3,
}));

const cm = (id, name, over) => ({
  id, name, matchType: 't20', status: 'Demo match in progress', venue: 'Sample Ground', startsAt: t(-90),
  teams: ['Demo XI', 'Sample XI'], teamInfo: [{ name: 'Demo XI', short: 'DEM', img: null }, { name: 'Sample XI', short: 'SAM', img: null }],
  score: [{ inning: 'Demo XI Inning 1', r: 168, w: 6, o: 20 }, { inning: 'Sample XI Inning 1', r: 92, w: 3, o: 11.2 }],
  seriesId: 'demo', started: true, ended: false, tossWinner: 'Demo XI', tossChoice: 'bat', ...over,
});
export const demoCricket = () => [
  cm('c1', 'Demo XI vs Sample XI, 3rd T20I'),
  cm('c2', 'Example Lions vs Test Tigers, 1st ODI', { matchType: 'odi', status: 'Example Lions won by 42 runs', started: true, ended: true, teams: ['Example Lions', 'Test Tigers'], teamInfo: [], score: [{ inning: 'Example Lions Inning 1', r: 281, w: 7, o: 50 }, { inning: 'Test Tigers Inning 1', r: 239, w: 10, o: 46.3 }] }),
  cm('c3', 'Mock Kings vs Sample Royals, Demo Premier League', { status: 'Match starts at 14:15 GMT', started: false, ended: false, startsAt: t(300), score: [], teams: ['Mock Kings', 'Sample Royals'], teamInfo: [] }),
];
export const demoNpl = () => ({
  series: { id: 'demo', name: 'Demo Premier League (sample)', startDate: day(-10), endDate: day(10) },
  live: [cm('n1', 'Demo Kings vs Sample Royals, Match 12', { teams: ['Demo Kings', 'Sample Royals'], teamInfo: [] })],
  upcoming: [cm('n2', 'Mock Tigers vs Example Rhinos, Match 13', { started: false, startsAt: t(60 * 20), score: [], teams: ['Mock Tigers', 'Example Rhinos'], teamInfo: [], status: 'Match not started' })],
  completed: [],
  anyLive: true,
});
export const demoF1 = () => ({
  next: { name: 'Demo Grand Prix', round: 18, startsAt: t(60 * 24 * 4), timeKnown: true, circuit: 'Sample Circuit', locality: 'Exampleville', country: 'Demoland' },
  last: { name: 'Sample Grand Prix', results: [{ position: 1, driver: 'Driver A', team: 'Team Demo', points: 25, status: '1:32:10' }, { position: 2, driver: 'Driver B', team: 'Team Sample', points: 18, status: '+4.2s' }] },
  standings: [{ position: 1, driver: 'Driver A', team: 'Team Demo', points: 310, wins: 7 }, { position: 2, driver: 'Driver B', team: 'Team Sample', points: 280, wins: 5 }],
});
export const demoGold = () => ({
  nepal: { fineGoldTola: 100000, tejabiGoldTola: null, silverTola: 1000, fineGold10g: 85700, silver10g: 857, fineGoldGram: 8570, silverGram: 85.7, change: null, percentChange: null, source: 'Demo data', sourceUrl: null },
  international: { gold: { name: 'Gold (XAU)', price: 1000, change: 5, percentChange: 0.5, perGram24k: 32.15 }, silver: { name: 'Silver (XAG)', price: 10, change: -0.1, percentChange: -1 }, currency: 'USD', unit: 'troy ounce', source: 'Demo data' },
  fx: { sell: 100, date: day(0), source: 'Demo data' },
  reference: { goldNprPerTola: 37500, silverNprPerTola: 375 },
});
export const demoCrypto = () => ['Democoin', 'Samplecoin', 'Examplecoin', 'Testcoin', 'Mockcoin', 'Placeholdercoin'].map((name, i) => ({
  id: name.toLowerCase(), symbol: name.slice(0, 3).toUpperCase(), name, image: null,
  price: 1000 / (i + 1), change24h: (i % 2 ? -1 : 1) * (i + 0.5), high24h: 1050 / (i + 1), low24h: 950 / (i + 1),
  marketCap: 1e9 / (i + 1), volume: 1e8 / (i + 1), sparkline: Array.from({ length: 30 }, (_, k) => 100 + Math.sin(k / 3 + i) * 5 + (i % 2 ? -k : k) / 4),
  lastUpdated: t(-1),
}));
export const demoNepse = () => ({
  asOf: t(-3), marketStatus: 'DEMO', index: { value: 1000, change: 5, percentChange: 0.5 }, turnover: 1e9, volume: 1e6, transactions: 10000,
  gainers: [{ symbol: 'DEMO1', name: 'Demo Bank', ltp: 100, change: 5, percentChange: 5 }], losers: [{ symbol: 'SMPL1', name: 'Sample Hydro', ltp: 90, change: -4, percentChange: -4.3 }],
  mostTraded: [{ symbol: 'EXMP', name: 'Example Insurance', ltp: 500, turnover: 5e7 }],
  sectors: [{ name: 'Demo sector', value: 1000, change: 3, percentChange: 0.3 }],
  history: Array.from({ length: 30 }, (_, i) => ({ date: day(i - 30), value: 980 + Math.sin(i / 4) * 15 + i })),
  source: 'Demo data',
});
export const demoWeather = (lat = 27.7, lon = 85.3) => {
  const d = new Date();
  const days = Array.from({ length: 7 }, (_, i) => new Date(d.getTime() + i * 86_400_000).toISOString().slice(0, 10));
  return {
    latitude: lat, longitude: lon, demo: true,
    current: { time: new Date().toISOString().slice(0, 16), temperature_2m: 22, apparent_temperature: 23, relative_humidity_2m: 70, weather_code: 2, wind_speed_10m: 8, wind_direction_10m: 200, visibility: 18000, is_day: 1, precipitation: 0 },
    hourly: { time: [new Date().toISOString().slice(0, 13) + ':00'], precipitation_probability: [30], uv_index: [5] },
    daily: {
      time: days, weather_code: [2, 61, 3, 1, 80, 95, 0], temperature_2m_max: [26, 24, 25, 27, 23, 22, 28], temperature_2m_min: [16, 15, 15, 17, 16, 15, 17],
      precipitation_probability_max: [30, 85, 40, 10, 65, 90, 5], precipitation_sum: [0, 18, 1, 0, 6, 30, 0],
      sunrise: days.map((x) => `${x}T05:55`), sunset: days.map((x) => `${x}T18:05`), uv_index_max: [7, 4, 6, 8, 5, 3, 8], wind_speed_10m_max: [12, 18, 10, 9, 20, 35, 8],
    },
  };
};
