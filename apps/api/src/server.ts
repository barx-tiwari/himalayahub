import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma, initDatabase } from './lib/prisma.js';
import { logger } from './lib/logger.js';

await initDatabase();
const server = createApp().listen(env.PORT, () => logger.info('HimalayaHub API listening', { port: env.PORT, env: env.NODE_ENV }));

/** Graceful shutdown so in-flight requests finish and DB connections close cleanly. */
async function shutdown(signal: string) {
  logger.info('Shutting down', { signal });
  server.close(async () => { await prisma.$disconnect(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (e) => logger.error('Unhandled rejection', { error: (e as Error)?.message }));
