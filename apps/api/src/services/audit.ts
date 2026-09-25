import type { Request } from 'express';
import { prisma } from '../lib/prisma.js';
import { anonymizeIp } from '../lib/redact.js';
import { logger } from '../lib/logger.js';

/**
 * Accountability trail for staff actions, e.g. ADMIN_CREATED_NEWS, USER_ROLE_CHANGED.
 * `metadata` should hold changed field NAMES / ids, never passwords, tokens or full content.
 */
export async function audit(req: Request, action: string, resource: string, resourceId?: string | null, metadata?: Record<string, unknown>) {
  try {
    await prisma.auditLog.create({
      data: { userId: req.user?.id ?? null, action, resource, resourceId: resourceId ?? null, ipAddress: anonymizeIp(req.ip), metadata: (metadata ?? undefined) as object | undefined },
    });
  } catch (e) {
    logger.error('Audit write failed', { action, resource, error: (e as Error).message });
  }
}
