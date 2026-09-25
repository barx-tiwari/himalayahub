/**
 * Consistent online backup of the SQLite database (safe while the API is running).
 * Uses SQLite's VACUUM INTO via Node's built-in sqlite module (Node 22.5+).
 * Usage: npm run db:backup -w @himalayahub/api   → apps/api/backups/hh-YYYY-MM-DDTHH-MM.db
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL || 'file:./dev.db';
if (!url.startsWith('file:')) { console.error('db:backup is for SQLite. For PostgreSQL use pg_dump (docs/BACKUP.md).'); process.exit(1); }
const dbPath = resolve(here, '../prisma', url.slice('file:'.length).split('?')[0]);
if (!existsSync(dbPath)) { console.error(`Database not found: ${dbPath}`); process.exit(1); }
const outDir = resolve(here, '../backups'); mkdirSync(outDir, { recursive: true });
const out = resolve(outDir, `hh-${new Date().toISOString().slice(0, 16).replace(/:/g, '-')}.db`);
const db = new DatabaseSync(dbPath, { readOnly: true });
db.exec(`VACUUM INTO '${out.replace(/'/g, "''")}'`);
db.close();
console.log(`Backup written: ${out}`);
