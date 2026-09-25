import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import { allowedOrigins, env } from './config/env.js';
import { loadUser } from './middleware/auth.js';
import { csrfProtection } from './middleware/csrf.js';
import { rateLimit } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/error.js';
import { cache } from './lib/cache.js';
import { CSRF_COOKIE, SESSION_COOKIE } from './auth/session.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { settingsRoutes } from './modules/settings/settings.routes.js';
import { adminOverviewRoutes } from './modules/admin/overview.routes.js';
import { destinationRoutes, destinationCategoryRoutes } from './modules/destinations/destinations.routes.js';
import { adminDestinationRoutes, adminDestinationCategoryRoutes } from './modules/destinations/destinations.admin.routes.js';
import { mediaRoutes } from './modules/media/media.routes.js';
import { communityRoutes } from './modules/community/community.routes.js';
import { adminCommunityRoutes } from './modules/community/community.admin.routes.js';
import { meRoutes } from './modules/me/me.routes.js';
import { staysRoutes, placesRoutes, adminStaysRoutes } from './modules/stays/stays.routes.js';
import { LOCAL_UPLOAD_ROOT } from './lib/storage.js';

/** Builds the Express app (no listen) so tests can drive it with supertest. */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY); // correct req.ip behind Vercel/Render/Nginx

  app.use((req, res, next) => { req.requestId = randomUUID(); res.setHeader('X-Request-Id', req.requestId); next(); });
  app.use(helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } }, // JSON API: nothing to render
    crossOriginResourcePolicy: { policy: 'same-site' },
    strictTransportSecurity: env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  }));
  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
    credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization', 'X-Filename', 'X-Alt'], maxAge: 600,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  if (env.STORAGE_DRIVER === 'local') {
    app.use('/uploads', express.static(LOCAL_UPLOAD_ROOT, { index: false, dotfiles: 'deny', maxAge: '30d', setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff') }));
  }
  app.use('/api', rateLimit({ cache, name: 'global', windowMs: 60_000, max: 300, key: (r) => r.ip || 'unknown' }));
  app.use('/api', csrfProtection({ allowedOrigins, sessionCookie: SESSION_COOKIE, csrfCookie: CSRF_COOKIE }));
  app.use('/api', loadUser);

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/site-settings', settingsRoutes);
  app.use('/api/admin/overview', adminOverviewRoutes);
  app.use('/api/destinations', staysRoutes); // /:slug/stays (before the destination router's /:slug)
  app.use('/api/destinations', destinationRoutes);
  app.use('/api/destination-categories', destinationCategoryRoutes);
  app.use('/api/admin/destinations', adminDestinationRoutes);
  app.use('/api/admin/destination-categories', adminDestinationCategoryRoutes);
  app.use('/api/admin/media', mediaRoutes);
  app.use('/api/me', meRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/admin/community', adminCommunityRoutes);
  app.use('/api/places', placesRoutes);
  app.use('/api/admin/stays', adminStaysRoutes);
  // Phase 7 mounts: news, categories, destinations, weather, sports, markets, academics,
  // notes, courses, quizzes, typing, emergency, bookmarks, dashboard, search, admin/*.

  app.use('/api', notFound);
  app.use(errorHandler);
  return app;
}
