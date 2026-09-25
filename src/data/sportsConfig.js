/** Competitions supported by the football service (football-data.org codes). */
export const footballLeagues = [
  { code: 'PL', name: 'Premier League', country: 'England' },
  { code: 'PD', name: 'La Liga', country: 'Spain' },
  { code: 'SA', name: 'Serie A', country: 'Italy' },
  { code: 'BL1', name: 'Bundesliga', country: 'Germany' },
  { code: 'FL1', name: 'Ligue 1', country: 'France' },
  { code: 'CL', name: 'UEFA Champions League', country: 'Europe' },
  { code: 'EL', name: 'UEFA Europa League', country: 'Europe', note: 'May need a paid football-data.org plan.' },
];
export const getLeague = (code) => footballLeagues.find((l) => l.code === code);
/** Leagues shown on the schedule filter (the brief's six). */
export const scheduleLeagues = footballLeagues.filter((l) => l.code !== 'EL');

export const sportsTabs = [
  { id: 'football', label: 'Football', to: '/football' },
  { id: 'cricket', label: 'Cricket', to: '/cricket' },
  { id: 'npl', label: 'NPL', to: '/npl' },
  { id: 'f1', label: 'Formula 1' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'other', label: 'Other sports' },
];

/** Cricket filters. Classification is done from the provider's matchType and series name. */
export const cricketCategories = [
  { id: 'all', label: 'All' },
  { id: 'international', label: 'International' },
  { id: 't20', label: 'T20' },
  { id: 'odi', label: 'ODI' },
  { id: 'test', label: 'Test' },
  { id: 'domestic', label: 'Domestic' },
  { id: 'leagues', label: 'Major T20 leagues' },
];

export const T20_LEAGUE_PATTERNS = [
  /indian premier league|\bipl\b/i, /big bash/i, /pakistan super league|\bpsl\b/i, /caribbean premier league|\bcpl\b/i,
  /\bsa20\b/i, /the hundred/i, /nepal premier league|\bnpl\b/i, /bangladesh premier league|\bbpl\b/i,
  /international league t20|\bilt20\b/i, /major league cricket|\bmlc\b/i, /lanka premier league|\blpl\b/i,
];

/** Full members + prominent associates, used to tell international matches from domestic ones. */
export const NATIONAL_TEAMS = [
  'Afghanistan', 'Australia', 'Bangladesh', 'England', 'India', 'Ireland', 'New Zealand', 'Pakistan', 'South Africa',
  'Sri Lanka', 'West Indies', 'Zimbabwe', 'Nepal', 'Netherlands', 'Scotland', 'Namibia', 'Oman', 'United Arab Emirates',
  'UAE', 'United States of America', 'USA', 'Canada', 'Papua New Guinea', 'Hong Kong', 'Kenya', 'Uganda', 'Jersey',
];
