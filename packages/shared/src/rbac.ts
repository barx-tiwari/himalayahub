/**
 * Role-based access control — the single source of truth for web, API and CMS.
 * Roles are ordered; permissions are explicit per role (no implicit inheritance
 * surprises). The API enforces these; the UI only uses them to hide controls.
 */
export const ROLES = ['USER', 'STUDENT', 'EDITOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'users.read', 'users.create', 'users.update', 'users.delete', 'users.roles',
  'news.read', 'news.create', 'news.update', 'news.publish', 'news.delete',
  'notes.read', 'notes.create', 'notes.update', 'notes.publish', 'notes.delete',
  'courses.read', 'courses.create', 'courses.update', 'courses.publish', 'courses.delete',
  'quizzes.manage', 'typing.manage',
  'destinations.create', 'destinations.update', 'destinations.delete',
  'academics.manage', 'media.manage', 'comments.moderate', 'stays.manage', 'analytics.read',
  'sports.manage', 'weather.manage', 'markets.manage', 'emergency.manage',
  'cms.access', 'cms.manage', 'settings.manage', 'api.manage',
  'logs.read', 'audit.read', 'admins.manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const CONTENT_WRITE: Permission[] = [
  'news.read', 'news.create', 'news.update', 'notes.read', 'notes.create', 'notes.update',
  'courses.read', 'courses.create', 'courses.update', 'destinations.create', 'destinations.update', 'stays.manage', 'media.manage', 'cms.access',
];
const PUBLISH: Permission[] = ['news.publish', 'notes.publish', 'courses.publish', 'quizzes.manage', 'typing.manage'];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  USER: [],
  STUDENT: [],
  EDITOR: [...CONTENT_WRITE, ...PUBLISH],
  MODERATOR: [...CONTENT_WRITE, ...PUBLISH, 'comments.moderate', 'users.read', 'emergency.manage'],
  ADMIN: [
    ...CONTENT_WRITE, ...PUBLISH, 'comments.moderate', 'emergency.manage',
    'users.read', 'users.create', 'users.update', 'users.delete', 'users.roles',
    'news.delete', 'notes.delete', 'courses.delete', 'destinations.delete', 'academics.manage',
    'sports.manage', 'weather.manage', 'markets.manage', 'cms.manage', 'logs.read', 'audit.read', 'analytics.read',
  ],
  SUPER_ADMIN: [...PERMISSIONS],
};

export function can(role: Role | null | undefined, permission: Permission): boolean {
  return Boolean(role && ROLE_PERMISSIONS[role]?.includes(permission));
}

export const roleRank = (r: Role) => ROLES.indexOf(r);

/**
 * Who may assign which role. Nobody can grant a role at or above their own,
 * except SUPER_ADMIN who may create other SUPER_ADMINs. Ordinary admins can
 * never touch a SUPER_ADMIN account.
 */
export function canAssignRole(actor: Role, target: { currentRole: Role; newRole: Role }): boolean {
  if (actor === 'SUPER_ADMIN') return true;
  if (!can(actor, 'users.roles')) return false;
  if (target.currentRole === 'SUPER_ADMIN' || target.newRole === 'SUPER_ADMIN') return false;
  return roleRank(target.currentRole) < roleRank(actor) && roleRank(target.newRole) < roleRank(actor);
}

export const isStaff = (r: Role | null | undefined) => can(r, 'cms.access');

/**
 * Product-facing role names. The database keeps the finer-grained roles above.
 *   Visitor        — not signed in, or "Continue as guest": reads everything, cannot post/vote.
 *   Verified user  — signed in with a confirmed email (USER/STUDENT): community, favourites, trips.
 *   Moderator      — MODERATOR (and EDITOR for content): community moderation queue.
 *   Admin          — ADMIN / SUPER_ADMIN.
 */
export type ProductRole = 'VISITOR' | 'USER' | 'VERIFIED_USER' | 'MODERATOR' | 'ADMIN';
export function productRole(user: { role: Role; emailVerified?: boolean; emailVerifiedAt?: unknown } | null | undefined): ProductRole {
  if (!user) return 'VISITOR';
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return 'ADMIN';
  if (user.role === 'MODERATOR' || user.role === 'EDITOR') return 'MODERATOR';
  return user.emailVerified || user.emailVerifiedAt ? 'VERIFIED_USER' : 'USER';
}
