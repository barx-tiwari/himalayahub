# Backup & restore

## Database (SQLite)
- **Backup (safe while the API runs):** `npm run db:backup -w @himalayahub/api` → `apps/api/backups/hh-<timestamp>.db`.
  It uses SQLite's `VACUUM INTO`, which produces a consistent copy. **Never** just `cp` the live `.db` file:
  with WAL mode, recent writes live in the `-wal` file and a plain copy can be incomplete.
- **Schedule it** (example cron, daily 02:30): `30 2 * * * cd /srv/himalayahub && npm run db:backup -w @himalayahub/api`
  then upload the file off the server (`rclone copy apps/api/backups remote:hh-backups`). Keep ≥ 14 daily copies.
- **Restore:** stop the API → move the current `.db`, `-wal` and `-shm` files aside → copy the backup to the
  DATABASE_URL path → `npm run db:deploy` → start the API.
- (If you later move to PostgreSQL: `pg_dump` / `pg_restore`, see docs/DATABASE.md.)
- Test a restore at least once a quarter into a scratch database.
- Store dumps encrypted, off the database host (object storage with lifecycle rules).

## Media
- Object storage: enable versioning and a lifecycle rule; replicate or sync to a second bucket/provider periodically
  (`rclone sync` or the provider's replication feature). The database only stores URLs/metadata.

## Environment variables
- Keep the production `.env` values in a password manager or your host's secret store (never in Git).
- Record which provider accounts own each API key, so keys can be rotated if someone leaves.

## Safety rules
- The seed never deletes data; `SEED_UPDATE=true` is required to overwrite seeded rows.
- `prisma migrate reset` **drops the database** — use it only on local development databases.
- Run `npx prisma migrate deploy` (not `migrate dev`) in production.
