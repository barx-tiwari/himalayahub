# Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Inspect existing project | ✅ done — see "Findings" below |
| 2 | Backend foundation (monorepo, Express 5 + TS, envelope, errors, logging, cache, rate limiting) | ✅ done |
| 3 | Database + Prisma setup (SQLite, portable to PostgreSQL) | ✅ done |
| 4 | Authentication (email/password, sessions, CSRF, lockout, verify email, reset, Google OAuth, RBAC) | ✅ done |
| 5 | Database schema (62 models, 14 enums, indexes, FKs, soft delete) | ✅ done |
| 6 | Migrations + seed (idempotent, from existing web data; demo data gated and labelled) | ✅ done — initial migration is generated on first `db:migrate` |
| 7–10 | APIs + frontend + CMS, delivered in slices ↓ | in progress |
| 8 | Connect frontend to APIs | |
| 9 | CMS (/admin) | |
| 10 | CMS ↔ database | |
| 11 | External providers | |
| 12 | Caching + background jobs | |
| 13 | Testing | |
| 14 | Security review | |
| 15 | Production optimisation | |

## CMS slices
| Slice | Scope | Status |
|---|---|---|
| 1 | Admin shell (/admin guard, responsive sidebar, dashboard, 403, sign-in) + Site Settings, website reads settings from API | ✅ done |
| 2 | Destinations + travel categories (API, CMS editor with gallery, website/homepage read from DB) | ✅ done |
| 3 | Programs, semesters, subjects, notes (rich text) | next |
| 4 | News + categories (editor, preview, autosave, publish/archive) | |
| 5 | Courses, quizzes, users/roles/permissions, media library, emergency contacts | |
| 6 | Live-data providers, API settings, jobs, logs, alerts | |

## Phase 1 findings
- React 18.3 · Vite 5 · React Router 6 · plain JS · hand-written CSS design system · npm.
- 45+ routes, code-split. Live data via framework-agnostic handlers in `apps/web/api/_lib` (run on Vercel and inside Vite dev).
- All learner progress in one localStorage object `himalayahub:progress:v1` (profile, typing results, course progress,
  quiz results, bookmarks, XP, streak dates) managed by `ProgressContext`. Other keys: theme, weather:last,
  notes:recentSubjects, dashboard widgets, tool preferences, live-data cache.
- Content lives in `src/data/*` arrays (16 destinations, 4 programmes, 32 subjects, 44 notes, 9 courses, 38 quiz questions,
  typing texts/lessons, 16 emergency contacts, football leagues).

## Phase 7 — REST APIs (next)
Modules under `apps/api/src/modules`, each with zod schemas, pagination (`?page&limit`), consistent envelope, permission guards and audit:
news & categories · destinations & categories · programs/semesters/subjects · notes · courses/lessons/enrollment/progress ·
quizzes/attempts · typing challenges/attempts/stats · emergency · bookmarks & favorites · activity/dashboard · notifications ·
search (SQLite FTS5 virtual table kept in sync by triggers, added in a migration) · users/roles (admin) · audit/system logs (admin).
Mount the existing live-data handlers under `/api/live/*` in Express so one server serves everything. OpenAPI spec generated from the zod schemas and served at `/api/docs`.

## Phase 8 — Frontend on the API
- `apps/web/src/api/client.js` (credentials, CSRF header, envelope unwrap) + TanStack Query hooks:
  `useSiteSettings, useDestinations, useDestination, useNews, useNotes, useProgramNotes, useCourses, useQuizzes, useMe…`
- **Offline-safe:** each hook falls back to the bundled `src/data` arrays if the API is unreachable, so the site never breaks.
- WhatsApp buttons read `whatsappNumber` from `/api/site-settings` (`FloatingWhatsAppButton`, `ContactWhatsAppButton`).
- Auth pages: login, register, verify-email, forgot/reset password (React Hook Form + Zod).
- **Progress migration:** on first sign-in, offer to import `progress:v1` from this device into the account; afterwards
  ProgressContext writes to the API (optimistic, queued when offline).
- Error pages: 403, 500, offline, "API unavailable" states in the site's design.

## Phase 9–10 — CMS
`/admin` (lazy chunk) with responsive sidebar/hamburger, tables → cards on mobile. Dashboard counts + API status +
alerts. Editors for news (autosave, preview identical to public page, draft/publish/archive), notes (programme → semester →
subject), courses (lessons drag-reorder), quizzes, destinations (gallery upload/reorder/alt text, categories, coordinates),
emergency contacts, academics, users/roles/permissions (SUPER_ADMIN rules), site settings, API settings, media library,
logs and audit log. Rich text via TipTap, with server-side HTML sanitisation (allow-list) before storage.
Media: storage adapter (local/S3-compatible) + image re-encoding and responsive variants.

## Phase 11–12 — Providers, cache, jobs
Provider adapters write snapshots (`WeatherSnapshot`, `MarketSnapshot`, `Match`, …). Scheduler with per-service intervals from
`ApiSetting` (weather 15 min, crypto 2 min, football 5 min / 1 min while live, NEPSE during market hours), jittered and
back-off on failure, `SystemAlert` + admin notification on repeated failures. Cache interface → Redis option.

## Phase 13–15
Integration tests (supertest + test DB) for auth, RBAC, news, destinations, notes, courses, users; frontend tests (Vitest +
Testing Library) for typing, BMI, date converter, navigation, login, dashboard. Security review checklist; performance pass
(query plans, indexes, payload sizes, bundle analysis); deployment guides.

## Known gaps (tracked)
- Site search still indexes the bundled destination list; it moves to `GET /api/search` in the search slice, so CMS-added destinations don't appear in search results yet.
- Media uploads use the local disk driver; the S3-compatible adapter and the full Media Library screen come in slice 5.
- Image resizing uses `sharp` only if installed (optional dependency); without it, originals are stored.
- The weather-based "Where should you go?" filters use category tags; custom categories added in the CMS show on destination pages and in the editor, and become filter chips in a later update.

## v5 (Nepal tourism & community) — see docs/V5.md
| Area | Status |
|---|---|
| Remove gold prices | ✅ done |
| Auth: sign-up, Apple, guest mode, mobile JWT + refresh rotation, profile, favourites, saved trips | ✅ done (API + web) |
| Community: posts, comments, votes, search, trending, reports, spam holds, moderation queue | ✅ done |
| Screenshot deterrence (web) | ✅ done · mobile documented (no app yet) |
| Hidden Gems of Eastern Nepal: 10 places, stories, itineraries 3/5/7/14 × domestic/international | ✅ done · 2 places need local research · photos to add |
| Travel Nepal Guide | ✅ done |
| Stays: verified listings API + Google Places proxy | ✅ API + public panel · admin screen next |
| Destination content for the other ~60 listed places | next |
| NEPSE watchlist, search, filters | next |
| Football depth (lineups, players) · Cricket depth · Basketball/Tennis/Esports | provider selection needed |
| Admin: users, stays, analytics dashboard | next |
