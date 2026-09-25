import type { Role } from '@prisma/client';
import { ROLE_PERMISSIONS, type Permission } from '@himalayahub/shared';
import { prisma } from '../lib/prisma.js';

/**
 * Effective permissions = shared defaults ± RolePermission overrides (editable by SUPER_ADMIN).
 * SUPER_ADMIN always has everything so nobody can lock themselves out. Cached for 60 s.
 */
let cacheAt = 0; let overrides: Map<string, boolean> = new Map();
async function load() {
  if (Date.now() - cacheAt < 60_000) return overrides;
  const rows = await prisma.rolePermission.findMany();
  overrides = new Map(rows.map((r) => [`${r.role}:${r.permission}`, r.granted]));
  cacheAt = Date.now();
  return overrides;
}
export const invalidatePermissionCache = () => { cacheAt = 0; };

export async function hasPermission(role: Role, permission: Permission): Promise<boolean> {
  if (role === 'SUPER_ADMIN') return true;
  const o = (await load()).get(`${role}:${permission}`);
  return o ?? ROLE_PERMISSIONS[role].includes(permission);
}

export async function permissionsFor(role: Role): Promise<Permission[]> {
  const { PERMISSIONS } = await import('@himalayahub/shared');
  const out: Permission[] = [];
  for (const p of PERMISSIONS) if (await hasPermission(role, p)) out.push(p);
  return out;
}
