import type { Request } from 'express';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../lib/http.js';
import { dummyHash, hashPassword, needsRehash, passwordProblem, verifyPassword } from '../../auth/password.js';
import { hashToken, keyedHash, newToken } from '../../auth/tokens.js';
import { cache } from '../../lib/cache.js';
import { newOtp, otpHash } from '../../auth/otp.js';
import { revokeAllSessions } from '../../auth/session.js';
import { resetPasswordMail, sendMail, verifyEmailMail } from '../../services/mailer.js';
import { recordLog } from '../../services/systemLog.js';

const LOCK_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 30;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

export const publicUser = (u: { id: string; name: string; email: string; role: string; avatar: string | null; emailVerifiedAt: Date | null }) =>
  ({ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, emailVerified: Boolean(u.emailVerifiedAt) });

export async function register(input: { name: string; email: string; password: string }) {
  const problem = passwordProblem(input.password, [input.name, input.email]);
  if (problem) throw ApiError.badRequest(problem, [{ path: 'password', message: problem }]);
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('An account with this email already exists. Try signing in.');
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash: await hashPassword(input.password), role: 'USER', profile: { create: {} } },
  });
  let mailSent = true;
  try { await sendVerification(user.id, user.email); } catch (e) {
    mailSent = false; // account still exists; the user can press "Resend code"
    await recordLog('ERROR', 'mail', 'Verification email failed at sign-up', { error: (e as Error).message });
  }
  return Object.assign(user, { mailSent });
}

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_TRIES = 5;

/**
 * Sends a 6-digit code (valid 10 min) plus a fallback link (valid 24 h).
 * Any earlier unused verification codes/links are invalidated first.
 */
export async function sendVerification(userId: string, email: string) {
  await prisma.authToken.updateMany({ where: { userId, type: 'EMAIL_VERIFICATION', usedAt: null }, data: { usedAt: new Date() } });
  const token = newToken(); const code = newOtp();
  await prisma.authToken.createMany({ data: [
    { userId, type: 'EMAIL_VERIFICATION', tokenHash: hashToken(token), expiresAt: new Date(Date.now() + VERIFY_TTL_MS) },
    { userId, type: 'EMAIL_VERIFICATION', tokenHash: otpHash(userId, code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  ] });
  await cache.del(`otp-tries:${userId}`);
  await sendMail(verifyEmailMail(email, `${env.APP_URL}/verify-email?token=${token}`, code));
}

async function markVerified(userId: string) {
  const user = await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  await prisma.authToken.updateMany({ where: { userId, type: 'EMAIL_VERIFICATION', usedAt: null }, data: { usedAt: new Date() } });
  // Verified learners become STUDENTs (unlocks progress sync); staff roles are left alone.
  if (user.role === 'USER') await prisma.user.update({ where: { id: user.id }, data: { role: 'STUDENT' } });
}

/** Checks a 6-digit code. 5 wrong tries (per code sent) and the user must request a new one. */
export async function verifyOtp(userId: string, code: string) {
  const tries = await cache.incr(`otp-tries:${userId}`, OTP_TTL_MS);
  if (tries > OTP_MAX_TRIES) throw new ApiError(429, 'Too many wrong codes. Request a new code and try again.', 'OTP_LOCKED');
  const row = await prisma.authToken.findUnique({ where: { tokenHash: otpHash(userId, code) } });
  if (!row || row.userId !== userId || row.type !== 'EMAIL_VERIFICATION' || row.usedAt || row.expiresAt < new Date()) {
    const left = OTP_MAX_TRIES - tries;
    throw ApiError.badRequest(left > 0 ? `That code isn’t right or has expired. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong codes. Request a new code.', [{ path: 'code', message: 'Wrong or expired code.' }]);
  }
  await markVerified(userId);
  await cache.del(`otp-tries:${userId}`);
}

/** Lockout by email and by (hashed) IP, with constant-time behaviour for unknown accounts. */
export async function login(req: Request, input: { email: string; password: string }) {
  const since = new Date(Date.now() - LOCK_WINDOW_MS);
  const ipHash = req.ip ? keyedHash(env.SESSION_SECRET, req.ip) : null;
  const [emailFails, ipFails] = await Promise.all([
    prisma.loginAttempt.count({ where: { email: input.email, success: false, createdAt: { gte: since } } }),
    ipHash ? prisma.loginAttempt.count({ where: { ipHash, success: false, createdAt: { gte: since } } }) : Promise.resolve(0),
  ]);
  if (emailFails >= MAX_FAILS_PER_EMAIL || ipFails >= MAX_FAILS_PER_IP) {
    throw ApiError.tooMany('Too many sign-in attempts. Please wait 15 minutes or reset your password.');
  }
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = await verifyPassword(input.password, user?.passwordHash ?? (await dummyHash()));
  const allowed = Boolean(user && valid && user.isActive && !user.deletedAt);
  await prisma.loginAttempt.create({ data: { email: input.email, ipHash, success: allowed } });
  if (!allowed || !user) {
    void recordLog('WARN', 'auth', 'Failed sign-in', { reason: user ? (user.isActive ? 'bad_password' : 'inactive') : 'unknown_email' });
    throw ApiError.unauthorized('Email or password is incorrect.');
  }
  if (user.passwordHash && needsRehash(user.passwordHash)) {
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(input.password) } });
  }
  return user;
}

async function consumeToken(token: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
  const row = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!row || row.type !== type || row.usedAt || row.expiresAt < new Date()) throw ApiError.badRequest('This link is invalid or has expired. Request a new one.');
  await prisma.authToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return row;
}

export async function verifyEmail(token: string) {
  const row = await consumeToken(token, 'EMAIL_VERIFICATION');
  await markVerified(row.userId);
}

/** Always succeeds from the caller's point of view, so it can't be used to discover accounts. */
export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive || user.deletedAt) return;
  const recent = await prisma.authToken.count({ where: { userId: user.id, type: 'PASSWORD_RESET', createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } } });
  if (recent >= 3) return;
  const token = newToken();
  await prisma.authToken.create({ data: { userId: user.id, type: 'PASSWORD_RESET', tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) } });
  await sendMail(resetPasswordMail(user.email, `${env.APP_URL}/reset-password?token=${token}`));
}

export async function resetPassword(token: string, password: string) {
  const row = await consumeToken(token, 'PASSWORD_RESET');
  const user = await prisma.user.findUniqueOrThrow({ where: { id: row.userId } });
  const problem = passwordProblem(password, [user.name, user.email]);
  if (problem) throw ApiError.badRequest(problem, [{ path: 'password', message: problem }]);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password), emailVerifiedAt: user.emailVerifiedAt ?? new Date() } });
  await revokeAllSessions(user.id);
  return user;
}

export async function changePassword(userId: string, sessionId: string | undefined, current: string, next: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(current, user.passwordHash))) throw ApiError.badRequest('Current password is incorrect.', [{ path: 'currentPassword', message: 'Current password is incorrect.' }]);
  const problem = passwordProblem(next, [user.name, user.email]);
  if (problem) throw ApiError.badRequest(problem, [{ path: 'newPassword', message: problem }]);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(next) } });
  await revokeAllSessions(userId, sessionId);
}
