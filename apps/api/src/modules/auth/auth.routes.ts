import express, { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { cache } from '../../lib/cache.js';
import { ApiError, ok, created } from '../../lib/http.js';
import { startSession, endSession, ensureCsrfCookie } from '../../auth/session.js';
import { permissionsFor } from '../../services/permissions.js';
import * as auth from './auth.service.js';
import { changePasswordSchema, forgotSchema, loginSchema, otpSchema, registerSchema, resetSchema, tokenSchema } from './auth.schemas.js';
import { googleCallback, googleEnabled, googleStart } from './google.js';
import { appleCallback, appleEnabled, appleStart } from './apple.js';
import { tokenRoutes } from './token.routes.js';

export const authRoutes = Router();
const ipKey = (req: { ip?: string }) => req.ip || 'unknown';
const strict = rateLimit({ cache, name: 'auth', windowMs: 15 * 60 * 1000, max: 20, key: ipKey });

authRoutes.get('/providers', (_req, res) => ok(res, { password: true, google: googleEnabled(), apple: appleEnabled(), guest: true }));

authRoutes.post('/register', strict, validate({ body: registerSchema }), async (req, res) => {
  const user = await auth.register(req.body);
  const csrfToken = await startSession(req, res, user.id);
  return created(res, { user: auth.publicUser(user), csrfToken, needsVerification: true, mailSent: user.mailSent },
    user.mailSent ? 'Account created. We’ve emailed you a 6-digit code.' : 'Account created, but we couldn’t send the email just now. Press “Resend code” in a minute.');
});

authRoutes.post('/login', strict, validate({ body: loginSchema }), async (req, res) => {
  const user = await auth.login(req, req.body);
  const csrfToken = await startSession(req, res, user.id);
  return ok(res, { user: auth.publicUser(user), csrfToken }, 'Signed in');
});

authRoutes.post('/logout', async (req, res) => { await endSession(req, res); return ok(res, null, 'Signed out'); });

authRoutes.get('/me', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!req.user) return ok(res, { user: null, permissions: [], csrfToken: null });
  return ok(res, { user: auth.publicUser(req.user), permissions: await permissionsFor(req.user.role), csrfToken: ensureCsrfCookie(req, res) });
});

authRoutes.post('/verify-email', strict, validate({ body: tokenSchema }), async (req, res) => { await auth.verifyEmail(req.body.token); return ok(res, null, 'Email confirmed. Thank you!'); });
const resendLimit = rateLimit({ cache, name: 'otp-resend', windowMs: 60 * 60 * 1000, max: 5, key: (r) => r.user?.id || r.ip || 'x' });
const resendCooldown = rateLimit({ cache, name: 'otp-cool', windowMs: 60 * 1000, max: 1, key: (r) => r.user?.id || r.ip || 'x' });
authRoutes.post('/resend-verification', requireAuth, resendCooldown, resendLimit, async (req, res) => {
  if (req.user!.emailVerifiedAt) return ok(res, { alreadyVerified: true }, 'Your email is already confirmed.');
  try { await auth.sendVerification(req.user!.id, req.user!.email); }
  catch { throw new ApiError(503, 'We couldn’t send the email right now. Please try again in a few minutes.', 'MAIL_FAILED'); }
  return ok(res, { alreadyVerified: false }, 'We’ve sent a new 6-digit code to your email.');
});
/** POST /api/auth/verify-otp { code } — confirms the signed-in user's email with the emailed code. */
authRoutes.post('/verify-otp', requireAuth, strict, validate({ body: otpSchema }), async (req, res) => {
  if (req.user!.emailVerifiedAt) return ok(res, null, 'Your email is already confirmed.');
  await auth.verifyOtp(req.user!.id, req.body.code);
  return ok(res, null, 'Email confirmed. Welcome to HimalayaHub!');
});
authRoutes.post('/forgot-password', strict, validate({ body: forgotSchema }), async (req, res) => {
  await auth.forgotPassword(req.body.email);
  return ok(res, null, 'If an account exists for that email, a reset link is on its way.');
});
authRoutes.post('/reset-password', strict, validate({ body: resetSchema }), async (req, res) => {
  const user = await auth.resetPassword(req.body.token, req.body.password);
  await startSession(req, res, user.id);
  return ok(res, { user: auth.publicUser(user) }, 'Password updated. You’ve been signed out on other devices.');
});
authRoutes.post('/change-password', requireAuth, strict, validate({ body: changePasswordSchema }), async (req, res) => {
  await auth.changePassword(req.user!.id, req.sessionId, req.body.currentPassword, req.body.newPassword);
  return ok(res, null, 'Password changed. Other devices have been signed out.');
});

authRoutes.get('/google', googleStart);
authRoutes.get('/google/callback', googleCallback);

authRoutes.get('/apple', appleStart);
authRoutes.post('/apple/callback', express.urlencoded({ extended: false, limit: '20kb' }), appleCallback);

// Native apps (JWT access + rotating refresh tokens)
authRoutes.use('/token', tokenRoutes);
