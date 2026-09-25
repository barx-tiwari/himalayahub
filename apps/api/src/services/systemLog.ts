import type { LogLevel } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { redact } from '../lib/redact.js';

/** Persists WARN/ERROR events for /admin/logs (redacted). Never throws. */
export async function recordLog(level: LogLevel, category: string, message: string, context?: Record<string, unknown>, requestId?: string) {
  try {
    await prisma.systemLog.create({ data: { level, category, message: message.slice(0, 1000), context: context ? (redact(context) as object) : undefined, requestId } });
  } catch { /* logging must never break a request */ }
}
