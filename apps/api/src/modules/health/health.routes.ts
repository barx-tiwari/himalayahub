import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

export const healthRoutes = Router();

/** Liveness (process up) and readiness (database reachable). No internals exposed. */
healthRoutes.get('/live', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
healthRoutes.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, data: { status: 'ok', database: 'up' } });
  } catch {
    res.status(503).json({ success: false, message: 'Database unavailable', code: 'DB_DOWN' });
  }
});
