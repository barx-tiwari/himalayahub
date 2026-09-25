/**
 * News sources used by /api/news. Headlines, a short summary and a link back
 * to the publisher are shown — full articles are never copied.
 * Before going to production, review each publisher's RSS terms of use and
 * edit this list freely (add Nepali-language feeds, remove any you prefer not to use).
 */
const F = {
  kpost: { url: 'https://kathmandupost.com/rss', source: 'The Kathmandu Post', region: 'Nepal' },
  okhabar: { url: 'https://english.onlinekhabar.com/feed', source: 'Onlinekhabar English', region: 'Nepal' },
  bbcWorld: { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', region: 'World' },
  bbcAsia: { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC News', region: 'World' },
  aje: { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', region: 'World' },
  bbcPolitics: { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC News', region: 'World' },
  bbcBusiness: { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC News', region: 'World' },
  bbcTech: { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC News', region: 'World' },
  verge: { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', region: 'World' },
  bbcScience: { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC News', region: 'World' },
  bbcEducation: { url: 'https://feeds.bbci.co.uk/news/education/rss.xml', source: 'BBC News', region: 'World' },
  bbcHealth: { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', source: 'BBC News', region: 'World' },
  bbcEnt: { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC News', region: 'World' },
  bbcSport: { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', region: 'World' },
  bbcFootball: { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', source: 'BBC Sport', region: 'World' },
  bbcCricket: { url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml', source: 'BBC Sport', region: 'World' },
  cricinfo: { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', source: 'ESPNcricinfo', region: 'World' },
};

const NEPAL = [F.kpost, F.okhabar];
const RX = {
  politics: /\b(parliament|minister|cabinet|election|party|government|prime minister|president|congress|uml|maoist|rsp|coalition|lawmakers?|policy)\b/i,
  business: /\b(business|economy|economic|market|bank|nrb|budget|trade|investment|inflation|remittance|stock|nepse|company|revenue|tax)\b/i,
  education: /\b(school|university|college|exam|students?|teachers?|education|scholarship|\bsee\b|neb|tribhuvan|curriculum)\b/i,
  health: /\b(health|hospital|disease|dengue|vaccine|patients?|doctors?|medical|outbreak|covid|cholera)\b/i,
  sport: /\b(cricket|football|sport|match|tournament|olympic|athlete|league|cup|goal|wicket)\b/i,
  cricket: /\bcricket|wicket|t20|odi|npl\b/i,
  weather: /\b(weather|monsoon|rain(fall)?|flood(s|ing)?|landslides?|snow(fall)?|cold wave|heat ?wave|lightning|drought|storm|fog|meteorolog)/i,
  ai: /\b(ai|artificial intelligence|machine learning|chatbot|openai|chatgpt|gemini|anthropic|claude|llm|neural|deep learning|copilot)\b/i,
};

/** Each category: `feeds` are used as-is; `filtered` feeds keep only matching items. */
export const CATEGORIES = {
  latest: { feeds: [...NEPAL, F.bbcWorld, F.aje] },
  nepal: { feeds: NEPAL },
  world: { feeds: [F.bbcWorld, F.aje, F.bbcAsia] },
  politics: { feeds: [F.bbcPolitics], filtered: [{ feeds: [...NEPAL, F.aje], match: RX.politics }] },
  business: { feeds: [F.bbcBusiness], filtered: [{ feeds: NEPAL, match: RX.business }] },
  technology: { feeds: [F.bbcTech, F.verge] },
  ai: { filtered: [{ feeds: [F.bbcTech, F.verge, ...NEPAL], match: RX.ai }] },
  science: { feeds: [F.bbcScience] },
  education: { feeds: [F.bbcEducation], filtered: [{ feeds: NEPAL, match: RX.education }] },
  health: { feeds: [F.bbcHealth], filtered: [{ feeds: NEPAL, match: RX.health }] },
  entertainment: { feeds: [F.bbcEnt] },
  sports: { feeds: [F.bbcSport], filtered: [{ feeds: NEPAL, match: RX.sport }] },
  football: { feeds: [F.bbcFootball] },
  cricket: { feeds: [F.cricinfo, F.bbcCricket], filtered: [{ feeds: NEPAL, match: RX.cricket }] },
  weather: { filtered: [{ feeds: NEPAL, match: RX.weather }] },
};

export const CATEGORY_IDS = Object.keys(CATEGORIES);
