import { PrismaClient } from '@prisma/client';

/** One client per process (reused across hot reloads in development). */
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;

/**
 * SQLite tuning, run once at start-up:
 * - WAL lets readers continue while a write happens (much better for a web server);
 * - busy_timeout waits briefly for a lock instead of failing immediately;
 * - foreign_keys is on by default in Prisma, set here explicitly for safety.
 * Harmless no-ops are skipped automatically on PostgreSQL.
 */
export async function initDatabase() {
  if (!String(process.env.DATABASE_URL || '').startsWith('file:')) return;
  await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000;');
  await prisma.$queryRawUnsafe('PRAGMA foreign_keys = ON;');
}
