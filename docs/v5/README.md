# HimalayaHub v5 — what changed

This folder documents the v5 update. Start here, then follow the guide you need.

| Guide | For |
|---|---|
| [MIGRATION.md](MIGRATION.md) | Upgrading an existing v4 install (database + code) |
| [ENV.md](ENV.md) | Every environment variable, old and new |
| [AUTH.md](AUTH.md) | Email/password, Google, Apple, guest mode, mobile tokens, roles |
| [GOOGLE.md](GOOGLE.md) | Google Sign-In, Maps links and the Places proxy |
| [SPORTS.md](SPORTS.md) | Football, cricket and F1 providers |
| [API.md](API.md) | New and changed endpoints |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production checklist |
| [SCREENSHOT-DETERRENCE.md](SCREENSHOT-DETERRENCE.md) | What the community capture guard does and does not do |

## Status of the v5 brief

**Done in this update**
- **Gold price feature removed** everywhere: page, widgets, `/api/gold`, navigation, search, admin, seed, env vars, and the `GoldPrice` table. `/gold` redirects to `/markets`.
- **Authentication:** account sign-up on the website, Sign in with Apple, "Continue as guest", profile (photo, country, travel interests, traveller type), favourite destinations, saved trips, and JWT access tokens with rotating refresh tokens for future mobile apps. Browsers keep the existing httpOnly cookie sessions (see AUTH.md for why).
- **Community:** six anonymous communities with posts, threaded replies, votes, hot/new/top, search, trending topics, reports, spam holding, bans and a moderation queue in `/admin/moderation`.
- **Screenshot deterrence** on community pages.
- **Hidden Gems of Eastern Nepal:** homepage section, index page and ten detail pages. Each has a story, key facts, travel and permit notes, rough costs, a map, and 3/5/7/14-day itineraries for domestic and international travellers.
- **Stays:** editor-verified listings per destination, plus optional live Google Places results.
- **Travel Nepal Guide** for foreign visitors (`/travel-guide`).
- **Destination guide fields:** elevation, difficulty, distance from Kathmandu, region, and a structured `guide` JSON (history, culture, routes, permits, costs, itineraries, videos…).

**Not done yet** (tracked in [../ROADMAP.md](../ROADMAP.md))
- CMS editor screens for the new destination guide fields and for stays. The API supports them; the admin forms don't yet.
- Full content for the ~70 other destinations in the brief. Only the ten Hidden Gems have content.
- NEPSE watchlist, search and filters (the existing dashboard already has gainers, losers, most active, sectors and history when a provider is configured).
- Football lineups, player profiles and statistics; basketball, tennis and esports; a unified sports search and favourites.
- Analytics dashboard and admin user management.
- Native Android/iOS apps (the token API is ready; `FLAG_SECURE` guidance is in SCREENSHOT-DETERRENCE.md).

## Content accuracy

The Hidden Gems content was written without field verification. Elevations, distances, map pins and costs are approximate, and each page says so. **Loden Village** and **Rauta Pokhari** have very little information and are flagged "needs research". No photos are bundled; editors should add credited photos in the CMS. When an editor has checked a page, set `guide.verifiedAt` and the warning changes to "Facts checked by an editor on …".

Stays are never invented: only listings an editor marks verified (with a note saying how) are shown, and ratings/reviews come live from Google only.
