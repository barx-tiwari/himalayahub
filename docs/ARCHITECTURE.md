# Architecture

```
                    HimalayaHub
   ┌──────────────┬──────────────┬──────────────┐
   │  Website     │  CMS (/admin)│  REST API    │
   │  apps/web    │  apps/web    │  apps/api    │
   └──────┬───────┴──────┬───────┴──────┬───────┘
          └──────────────┴──────────────┘
                         │  HTTPS + session cookie
                     Express 5 API
          ┌──────────────┼──────────────┐
        SQLite         Cache        External APIs
      (Prisma)    (memory → Redis)  (news, weather, sports, markets)
```

## Decisions (and why)

**SQLite database (owner's choice), kept portable to PostgreSQL.**
One file, zero setup, fast for a single server. The schema avoids SQLite-only features so switching providers
later is a config change plus a fresh migration (docs/DATABASE.md). List fields are JSON arrays; search in Phase 7
uses SQLite FTS5 instead of PostgreSQL tsvector.

**Keep the existing React + Vite frontend (JavaScript) rather than migrating to Next.js/TypeScript/Tailwind.**
The site works, is fast, and has a hand-built design system. A framework or CSS migration would mean
rewriting every page — exactly what the brief says not to do. The backend and shared package are
TypeScript. New frontend data code (Phase 8) uses TanStack Query, and forms use React Hook Form + Zod.
Individual files can move to `.tsx` gradually; Vite supports mixing.

**The CMS lives inside the web app under `/admin` (lazy-loaded), not as a third app.**
It reuses the same components, theme and auth session; one deployment; the admin bundle is code-split so
public visitors never download it. Admin *security* is enforced by the API — hiding routes in the UI is only UX.

**Express 5 + modules, not Next.js API routes.**
The web app is a Vite SPA, so a separate API is the natural fit. Express 5 forwards async errors
natively. Each feature is a folder in `src/modules/<feature>` with `routes`, `schemas` (zod) and `service`.

**Sessions, not JWTs, for the browser.**
Opaque random tokens in an httpOnly, SameSite=Lax cookie; only their SHA-256 is stored (`Session` table).
This gives instant revocation (logout everywhere, role changes, password resets) without a refresh-token
dance, and no token is readable by JavaScript. CSRF is handled by origin checks + a double-submit token.
If a native mobile app is added later, it can use the same session tokens via the Authorization header.

**Passwords: scrypt from Node's crypto** (OWASP parameters, self-describing hash format, transparent rehash).
No native addon, so builds don't break on serverless hosts.

**Live data is cache, not truth.** Weather/sports/markets are stored as snapshots with `source` and
`recordedAt`, shown with "Last updated", and never hand-edited. Admins configure providers and competitions
(`ApiSetting`, `League`), not scores.

**Seed reuses the web data files.** `prisma/seed/build.ts` imports `apps/web/src/data/*`, so the first
database contents are exactly what the site shows today. Once Phase 8 switches pages to the API, the CMS
becomes the place to edit content, and those arrays remain only as the offline/fallback copy.

**RBAC in one place.** `packages/shared/src/rbac.ts` defines roles → permissions; the API adds optional
database overrides (`RolePermission`) editable by SUPER_ADMIN. SUPER_ADMIN always keeps every permission,
and ordinary admins can never modify super-admin accounts or grant roles at their own level.

## Request pipeline

requestId → helmet (secure headers) → CORS allow-list → JSON body (1 MB) → cookies → global rate limit →
CSRF (unsafe methods) → load session user → route (validate → requirePermission → service) → 404 → error handler.

## Data model overview (62 models)

- **Identity:** User, UserProfile, OAuthAccount, Session, AuthToken, LoginAttempt, RolePermission
- **News:** NewsArticle, NewsCategory, NewsSource, Tag (+ join)
- **Travel:** Destination, DestinationImage, DestinationCategory (+ join), self-relation "nearby"
- **Live cache:** WeatherSnapshot, MarketSnapshot, CryptoAsset, GoldPrice, NepseMarketSnapshot, NepseSecurity
- **Sports:** Sport, League, Competition (season), Team, Player, Venue, Match, CricketInnings — NPL is a League like any other
- **Academics:** University, Program, Semester, Subject, SemesterSubject (a subject can appear in several programmes), Note, NoteCategory
- **Learning:** Course, CourseLesson, CourseEnrollment, CourseProgress, Quiz, Question, AnswerOption, QuizAttempt, TypingChallenge, TypingAttempt
- **Personal:** Bookmark, Favorite, Activity, Notification
- **System:** SiteSettings (single row), ApiSetting, MediaAsset, AuditLog, SystemLog, SystemAlert, Holiday, EmergencyService
- **Analytics (aggregate only):** PageViewDaily, ContentViewDaily
