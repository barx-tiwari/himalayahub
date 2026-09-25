import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ok } from '../../lib/http.js';
import { requirePermission } from '../../middleware/auth.js';
import { hasPermission } from '../../services/permissions.js';

export const adminOverviewRoutes = Router();

const byStatus = async (model: 'newsArticle' | 'note' | 'course' | 'destination') => {
  const rows = await (prisma[model] as unknown as { groupBy: (a: object) => Promise<{ status: string; _count: { _all: number } }[]> })
    .groupBy({ by: ['status'], where: { deletedAt: null }, _count: { _all: true } });
  const out = { total: 0, PUBLISHED: 0, DRAFT: 0, ARCHIVED: 0 } as Record<string, number>;
  for (const r of rows) { out[r.status] = r._count._all; out.total! += r._count._all; }
  return out;
};

/** Dashboard numbers for staff. Counts only — no personal data. */
adminOverviewRoutes.get('/', requirePermission('cms.access'), async (req, res) => {
  const [users, news, notes, courses, destinations, apis, alerts] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    byStatus('newsArticle'), byStatus('note'), byStatus('course'), byStatus('destination'),
    prisma.apiSetting.findMany({ select: { service: true, provider: true, enabled: true, lastSuccessAt: true, lastErrorAt: true, lastError: true }, orderBy: { service: 'asc' } }),
    prisma.systemAlert.findMany({ where: { resolvedAt: null }, orderBy: { lastSeen: 'desc' }, take: 10, select: { id: true, source: true, severity: true, message: true, count: true, lastSeen: true } }),
  ]);
  const recentActivity = (await hasPermission(req.user!.role, 'audit.read'))
    ? await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, action: true, resource: true, resourceId: true, createdAt: true, user: { select: { name: true } } } })
    : [];
  const content = { news, notes, courses, destinations };
  const totals = Object.values(content).reduce<{ published: number; drafts: number }>((a, c) => ({ published: a.published + (c.PUBLISHED ?? 0), drafts: a.drafts + (c.DRAFT ?? 0) }), { published: 0, drafts: 0 });
  return ok(res, {
    users, content, totals,
    api: apis.map((a) => ({ ...a, status: !a.enabled ? 'disabled' : a.lastErrorAt && (!a.lastSuccessAt || a.lastErrorAt > a.lastSuccessAt) ? 'failing' : a.lastSuccessAt ? 'ok' : 'unknown' })),
    alerts, recentActivity, analytics: null, // aggregate analytics arrive with the analytics slice
  });
});
