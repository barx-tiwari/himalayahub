# HimalayaHub

An education, tools, Nepal-information and live-updates hub for students in Nepal.
React 18 + Vite + React Router 6, plain CSS design tokens, progress saved in LocalStorage,
and a small serverless proxy (`/api`) that keeps API keys off the browser.

> Upgrading from v1? See **[UPGRADE.md](UPGRADE.md)** for every new and changed file.

## What's inside

| Area | Routes | Data |
|---|---|---|
| Typing, courses, quizzes, IT notes, dashboard, profile | `/typing` `/courses` `/quizzes` `/notes` `/dashboard` `/profile` | Bundled, offline |
| University notes (32 shared subjects) | `/notes/csit` `/notes/bca` `/notes/bim` `/notes/bba` `/notes/:program/:subject` | Bundled, offline |
| Live News (14 categories) | `/news` `/news/:category` | RSS via `/api/news` |
| Sports Center, Football, Cricket, NPL, F1 | `/sports` `/football` `/cricket` `/npl` | football-data.org, CricketData.org, Jolpica (via `/api`) |
| Markets: Crypto, NEPSE | `/markets` `/crypto` `/nepse` | CoinGecko, your NEPSE provider |
| Nepal Weather, Where Should I Go, Explore Nepal | `/weather` `/weather/:location` `/where-to-go` `/explore-nepal` | Open-Meteo (direct, keyless) |
| Emergency Help | `/emergency` | Bundled, verified 23 Sep 2026 |
| Tools: Calendar, Date Converter, Currency, World Clock, BMI | `/tools/*` `/bmi` | Offline (currency needs a rates URL) |
| Just for fun: AI Astrologer, Tarot | `/astrology` `/tarot` | Your AI backend (optional) |

Global search (`/` or Ctrl/⌘ K) covers notes, university subjects, courses, lessons, quizzes,
news categories and cached headlines, sports, markets, weather places, emergency numbers and tools.
Press `?` for keyboard shortcuts (`g` then `l` news, `s` sports, `m` markets, `w` weather, `e` emergency).

## Run it

```bash
npm install
cp .env.example .env        # fill in what you have; everything is optional
npm run dev                 # http://localhost:5173 — /api is served by Vite middleware
npm run build && npm run preview
```

Node 18+ is required (the proxy uses the built-in `fetch`). **No new npm packages** were added in v2.

### Demo mode (development only)

`VITE_DEMO_DATA=true npm run dev` fills every live section with clearly fictional sample data
("Demo United", "Sample headline…") and a visible **Demo data** label, so you can work on layouts offline.
It is ignored by `npm run build`, and demo data is cached separately from real data.

## Environment variables

Browser (`VITE_*`, public, never secrets):

| Variable | Purpose |
|---|---|
| `VITE_LIVE_API_BASE` | Where the proxy lives. Default `/api`. Set to e.g. `https://your-app.vercel.app/api` if the site is hosted elsewhere (and add that origin to `ALLOWED_ORIGINS`). |
| `VITE_DEMO_DATA` | `true` = demo data in dev only. |
| `VITE_EMERGENCY_DATA_URL` | Optional JSON you maintain (same shape as `src/data/emergencyContacts.js`) to update numbers without redeploying. Invalid entries are rejected; bundled data is the fallback. |
| `VITE_CURRENCY_API_URL`, `VITE_ASTROLOGY_API_URL`, `VITE_API_BASE_URL` | Unchanged from v1. |

Server only (set in Vercel/Netlify project settings, or `.env` for `npm run dev`; **no** `VITE_` prefix):

| Variable | Needed for | Get it |
|---|---|---|
| `FOOTBALL_DATA_API_KEY` | Football fixtures, results, tables | football-data.org (free tier: PL, La Liga, Serie A, Bundesliga, Ligue 1, UCL; Europa League may need a paid plan) |
| `CRICKETDATA_API_KEY` | Cricket scores, NPL | cricketdata.org (free tier ≈100 requests/day — the proxy caches to stay inside it) |
| `NEPSE_API_URL`, `NEPSE_API_KEY` | NEPSE dashboard | a provider you are licensed to use (see below) |
| `ALLOWED_ORIGINS` | CORS for cross-origin callers | comma-separated origins |

Keyless: news RSS, Formula 1 (Jolpica), Nepal Rastra Bank forex, Open-Meteo weather and CoinGecko crypto.

## How live data works

- `src/services/*Service.js` — one module per domain. Each returns `{ data, meta }` where `meta` holds
  `source`, `sourceUrl`, `dataAsOf` and `realtime`. Pages never talk to APIs directly.
- `src/hooks/useLiveDataRefresh.js` — shared fetching: in-memory + LocalStorage cache, de-duplicated requests,
  auto refresh (faster while a match or trading session is live), exponential backoff on errors, and pausing in hidden tabs.
- `src/components/live/LiveDataRefresh.jsx` — the source / "Updated x ago" / Refresh bar shown on every live section.
  The **LIVE** pill appears only when the provider marks data real-time, it is under 5 minutes old, and it did not come from cache.
- `DataState.jsx` — loading skeletons, "temporarily unavailable" with Retry, offline notice, and last-good cached data labelled as such.
- Nothing is invented: if a provider fails, the page says so. It never shows a guessed score, price, number or headline.

### The proxy (`/api`)

`api/news.js`, `football.js`, `cricket.js`, `f1.js` and `nepse.js` are thin wrappers over `api/_lib/handlers.js`.
They add keys server-side, normalise and sanitise responses (text stripped of HTML, only http(s) URLs), cache in memory,
set `Cache-Control`, rate-limit per IP, and return `{ error: "not_configured" }` when a key is missing. The UI turns that into
"This feed isn't connected yet". The same handlers run as Vercel functions and as Vite dev/preview middleware.

### NEPSE

There is no official public NEPSE API, and scraping nepalstock.com may breach its terms. Point `NEPSE_API_URL` at a provider
you're allowed to use and map its response in `adaptNepse()` (`api/_lib/handlers.js`) to this shape:

```json
{ "asOf": "ISO date", "marketStatus": "OPEN|CLOSED", "index": { "value": 0, "change": 0, "percentChange": 0 },
  "turnover": 0, "volume": 0, "transactions": 0,
  "gainers": [{ "symbol": "", "name": "", "ltp": 0, "change": 0, "percentChange": 0 }], "losers": [], "mostTraded": [{ "symbol": "", "ltp": 0, "turnover": 0 }],
  "sectors": [{ "name": "", "value": 0, "change": 0, "percentChange": 0 }], "history": [{ "date": "YYYY-MM-DD", "value": 0 }] }
```

## Replacing demo/mock data with live data

1. Add the server keys above to `.env` (local) or your host's environment settings.
2. Leave `VITE_DEMO_DATA` empty.
3. `npm run dev`. Each live section shows its real source; any feed without a key says "not connected".
4. To swap a provider, change only its service or proxy handler and keep the returned shape.

## Deploy

**Vercel (recommended):** import the repo — the framework preset is Vite. Add the server env vars and deploy.
`vercel.json` rewrites SPA routes to `index.html` and leaves `/api/*` for the functions.

**Netlify / static hosts:** `public/_redirects` handles SPA routing. Static hosting has no `/api`, so news, sports,
NEPSE shows "not connected" unless you deploy the proxy separately (e.g. on Vercel) and set `VITE_LIVE_API_BASE`
plus `ALLOWED_ORIGINS`. Weather and crypto still work, because they call keyless public APIs directly.

## Content and sources

- **News:** headlines, short summaries and links only; stories open on the publisher's site. Check each publisher's RSS terms before commercial use.
- **Weather:** Open-Meteo (CC BY 4.0, attribution shown). Mountain areas always link to the Department of Hydrology and Meteorology.
- **Emergency numbers:** each has a source and verification date. District and municipality contacts are intentionally empty
  until verified; the page links to official directories instead. Re-verify before relying on them.
- **University notes:** semester placement is typical, not official; every program page says to check your university's current syllabus.
- **Finance and health pages** carry "not financial advice" and "not a medical diagnosis" notices.

## Adding content

- New university subject: add an entry to `src/data/subjects/*.js`, then reference its id in `src/data/programs/index.js`.
- New news category: `src/data/newsCategories.js` (keywords) plus feeds in `api/_lib/feeds.js`.
- New destination or weather city: `src/data/nepalPlaces.js`.
- New emergency contact: `src/data/emergencyContacts.js` (include `source`, `sourceUrl` and `verifiedOn`).
