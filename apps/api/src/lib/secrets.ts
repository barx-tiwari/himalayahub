import { createHmac } from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Purpose-bound secrets. When a dedicated variable is not set, a separate key is derived
 * from SESSION_SECRET with HMAC, so one leaked derived key never reveals another.
 */
const derive = (purpose: string) => createHmac('sha256', env.SESSION_SECRET).update(`himalayahub:${purpose}`).digest('base64url');
export const jwtSecret = () => env.JWT_SECRET || derive('jwt-access-v1');
export const aliasSecret = () => env.COMMUNITY_ALIAS_SECRET || derive('community-alias-v1');
/** Short, non-reversible author key so moderators can see "same author" without an identity. */
export const moderatorAuthorKey = (userId: string) => createHmac('sha256', derive('mod-author-key-v1')).update(userId).digest('hex').slice(0, 10);
