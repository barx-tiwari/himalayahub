# Database: SQLite

HimalayaHub uses **SQLite** through Prisma. The whole database is one file (default `apps/api/prisma/dev.db`).

## Why it fits
- Nothing to install or host; `npm run db:migrate` creates the file.
- Very fast for reads, which is most of this site's traffic (destinations, notes, courses, news).
- WAL mode (enabled automatically at start-up) lets visitors keep reading while the CMS saves.

## Limits to know
- **One server.** SQLite lives on one machine's disk. Run the API as a single instance with a persistent disk (VPS, Render
  disk, Fly volume). Serverless platforms can't keep the file between requests.
- **One writer at a time.** Writes queue for a few milliseconds each; this is fine for a content site and CMS. Very write-heavy
  features (thousands of typing attempts per minute) would be the signal to move to PostgreSQL.
- **No native arrays**, so fields like `activities` and `travelTips` are stored as JSON arrays (the API returns them as normal arrays).
- **Case-insensitive search:** SQLite `LIKE` is case-insensitive for English letters; Prisma's `mode: 'insensitive'` isn't available,
  so the API doesn't use it. Full-text search uses FTS5 (Phase 7).

## Everyday commands
```bash
npm run db:migrate -- --name <change>     # after editing schema.prisma (development)
npm run db:deploy                         # apply migrations in production
npm run db:seed                           # add seed content (never deletes)
npm run db:studio -w @himalayahub/api     # browse data in Prisma Studio
npm run db:backup -w @himalayahub/api     # consistent backup copy
```

## Switching to PostgreSQL later
The schema deliberately avoids SQLite-specific features, so moving is straightforward:
1. In `apps/api/prisma/schema.prisma` set `provider = "postgresql"`.
2. Set `DATABASE_URL=postgresql://…` in `.env`.
3. Move the old SQLite migrations aside (`prisma/migrations` → `prisma/migrations-sqlite`) and run `npm run db:migrate -- --name init`
   (migrations are provider-specific, so Postgres needs its own fresh history).
4. Copy the data across (e.g. with `pgloader`, or export/import scripts) and run `npm run db:seed` to fill anything missing.
5. Optional upgrades on PostgreSQL: turn the JSON-array fields back into native `String[]` lists, add `@db.Decimal`/`@db.Date`
   types, and switch search from FTS5 to `tsvector`.
