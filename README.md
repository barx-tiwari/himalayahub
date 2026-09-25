# HimalayaHub

> **v5:** community, Hidden Gems of Eastern Nepal, Travel Nepal Guide, stays + Google Places, sign-up, Apple sign-in, guest mode and mobile token auth; gold prices removed. **Upgrading? Read [docs/V5.md](docs/V5.md)** (migration, env vars, auth + Google setup, API reference).

**Learn • Explore • Discover** — Nepal travel discovery, IT/university learning, live news, sports, weather and markets, with a REST API and (from Phase 9) a CMS.

> **Status:** backend foundation, database, authentication, **CMS slice 1 (admin shell + Site Settings)** and **slice 2 (Destinations)** are done.
> The public website works as before; it now also reads Site Settings (WhatsApp number, name, tagline, footer) from the API, with built-in fallbacks when the API is offline. See [docs/ROADMAP.md](docs/ROADMAP.md) for what each remaining phase delivers.

## Repository layout

```
himalayahub/
├─ apps/
│  ├─ web/            React 18 + Vite site (unchanged; still uses its own /api live-data proxy)
│  └─ api/            Node.js + TypeScript + Express 5 REST API
│     ├─ prisma/      schema.prisma (SQLite) · seed.ts · seed/ (builders + dry-run check) · migrations/ (generated)
│     ├─ src/
│     │  ├─ config/   env validation (zod)
│     │  ├─ auth/     password hashing, tokens, sessions
│     │  ├─ middleware/ auth/RBAC, CSRF, validation, rate limiting, errors
│     │  ├─ modules/  one folder per feature (routes · schemas · service)
│     │  ├─ services/ permissions, audit log, system log, mailer
│     │  ├─ lib/      http envelope, prisma client, cache, logger, redaction
│     │  └─ jobs/     scheduled refresh jobs (Phase 12)
│     └─ test/
├─ packages/
│  └─ shared/         roles & permissions, API envelope + pagination, WhatsApp link, weather→travel engine
└─ docs/              ARCHITECTURE · SECURITY · BACKUP · ROADMAP
```

## Requirements

Node.js 22.5+ and npm 10+. The database is **SQLite** — a single file, nothing to install. (Switching to PostgreSQL later is documented in [docs/DATABASE.md](docs/DATABASE.md).)

## First-time setup

```bash
npm install                                  # installs all workspaces
cp .env.example .env                         # set SESSION_SECRET (DATABASE_URL already points to a local SQLite file)

npm run db:validate                          # prisma validate
npm run seed:check -w @himalayahub/api       # dry-run the seed (no database needed)
npm run db:migrate -- --name init            # creates apps/api/prisma/dev.db and prisma/migrations
npm run db:seed                              # = npx prisma db seed
```

To create the first **SUPER_ADMIN**, set `SEED_SUPERADMIN_EMAIL` and `SEED_SUPERADMIN_PASSWORD` before seeding, then delete the password from `.env`.

To look inside the database: `npm run db:studio -w @himalayahub/api` (opens Prisma Studio in the browser).

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Web (http://localhost:5173) and API (http://localhost:4000) together |
| `npm run dev:web` / `npm run dev:api` | One side only |
| `npm run build` | Builds shared → api → web |
| `npm run start` | Starts the built API |
| `npm test` | All workspace tests |
| `npm run db:generate` | `npx prisma generate` |
| `npm run db:migrate` | `npx prisma migrate dev` (development) |
| `npm run db:deploy` | `npx prisma migrate deploy` (production) |
| `npm run db:seed` | `npx prisma db seed` (safe to re-run; never deletes) |
| `npm run db:backup -w @himalayahub/api` | Consistent copy of the SQLite file into `apps/api/backups/` (safe while running) |

## Admin panel (/admin)

1. Create the first Super admin when seeding (`SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD`).
2. Run `npm run dev` and open http://localhost:5173/admin → you'll be sent to **Sign in**.
3. After signing in you'll see the **Dashboard** (users, published/draft counts, live-data source status, alerts, recent admin activity) and **Site Settings**.

**Site Settings** controls the website name, taglines, description, logo/favicon URLs, contact details, **WhatsApp number and pre-filled message**, social links, footer text, default SEO and theme. Saving updates the whole site immediately: the floating WhatsApp button, the "Have a question?" section, the Contact page and the footer all read the number from here. Only a **Super admin** can change settings (others can view them).

Access rules: signed-out visitors are redirected to sign-in; signed-in users without staff access get a **403** page; the sidebar only shows sections your role can use. Every admin action is checked again by the API.

**Destinations** (Admin → Destinations): add, edit, publish, unpublish, archive and delete destinations; set province, district, coordinates (checked to be inside Nepal), landscape, best time, trip length, activities, nearby attractions, travel tips and safety notes; choose categories and nearby destinations; SEO fields; **feature on the homepage** with one click; **Preview** drafts exactly as the public page will look. The **photo gallery** supports uploading images (JPEG/PNG/WebP/GIF/AVIF up to 8 MB, checked by their actual bytes — SVG and disguised files are refused), adding freely licensed Wikimedia Commons photos by file name, alt text (required), captions, credits, reordering and removal. **Travel Categories** can be added, renamed, reordered and deleted (deletion is blocked while a category is in use).

What happens on the website: published destinations appear on Explore Nepal, the map, the "Where should you go?" finder, the journey and their own page immediately; featured ones lead the homepage mosaic (topped up to six tiles); drafts and archived destinations are never public. If the API is unreachable, the site falls back to the last loaded list, then to the built-in data.

Other sidebar sections are marked **Soon** and open a placeholder until their update ships (next: Notes & academics, then News, …).

Giving someone staff access: the Users screen arrives in a later update. Until then, a Super admin can change a user's `role` in Prisma Studio (`npm run db:studio -w @himalayahub/api`).

**How the web app reaches the API:** in development, Vite proxies `/api/*` to the API on port 4000 (same origin, so cookies just work). In production, either
(a) keep the API on the same domain — e.g. a reverse-proxy/rewrite from `https://himalayahub.com/api/*` to your API server (recommended), or
(b) host it on a subdomain like `https://api.himalayahub.com`, set `VITE_API_URL` for the web build and add the web origin to `APP_URL`/`CORS_ORIGINS` on the API.

## API available now

All responses use `{ "success": true, "data": …, "message": … }` or `{ "success": false, "message": …, "code": … }`.

| Method & path | Access | Notes |
|---|---|---|
| `GET /api/health/live`, `/api/health/ready` | public | readiness checks the database |
| `GET /api/site-settings` | public | name, tagline, WhatsApp number + ready-made `whatsappUrl` |
| `PUT /api/site-settings` | `settings.manage` (SUPER_ADMIN) | audited |
| `POST /api/auth/register` · `login` · `logout` | public | rate-limited; lockout after 5 failures/15 min |
| `GET /api/auth/me` | public | current user + effective permissions |
| `POST /api/auth/verify-email` · `resend-verification` | public / signed in | |
| `POST /api/auth/forgot-password` · `reset-password` | public | never reveals whether an email exists |
| `POST /api/auth/change-password` | signed in | signs out other devices |
| `GET /api/auth/google` → `/callback` | public | only when Google keys are set |
| `GET /api/admin/overview` | `cms.access` (staff) | dashboard counts, provider status, alerts, recent audit entries |
| `GET /api/destinations` | public | published only; `?featured=true&category=&province=&zone=&q=&page=&limit=` |
| `GET /api/destinations/:slug` | public (`?preview=1` for staff) | drafts only visible to staff in preview |
| `GET /api/destination-categories` | public | |
| `GET/POST /api/admin/destinations`, `GET/PATCH/DELETE /api/admin/destinations/:id` | `destinations.create/update/delete` | list has status filter, search, pagination, status counts; delete = soft delete |
| `POST/PATCH/DELETE /api/admin/destinations/:id/images[/:imageId]`, `PUT …/images/order` | `destinations.update` | gallery |
| `GET/POST/PATCH/DELETE /api/admin/destination-categories[/:id]` | `destinations.update` / `.delete` | |
| `POST /api/admin/media` | `media.manage` | raw image body + `X-Filename`; stored via the storage adapter (local now; S3 in the media slice) |

Browsers authenticate with an httpOnly session cookie. State-changing requests must send the `X-CSRF-Token` header (value of the `hh_csrf` cookie) from an allowed origin.

## Deployment (provider-independent)

- **Web:** any static host (Vercel, Netlify, Cloudflare Pages). `apps/web` builds to `dist/`.
- **API:** a Node host **with a persistent disk**, because SQLite is a file: a VPS (systemd/PM2), Render with a disk, Fly.io with a volume, or a container with a mounted volume. Serverless functions (Vercel/Netlify) can't keep the file. Run `npm run db:deploy` on release, then `npm run start`.
- **Database:** the SQLite file on that disk, with scheduled `db:backup` copies stored off the server (see docs/BACKUP.md).
- **Media:** S3-compatible object storage (Phase 9).

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/SECURITY.md](docs/SECURITY.md) · [docs/BACKUP.md](docs/BACKUP.md).
