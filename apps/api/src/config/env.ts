import { z } from 'zod';

/** All configuration comes from environment variables, validated once at start-up. */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  // SQLite: file:./dev.db (relative to apps/api/prisma). PostgreSQL URLs also work after switching the provider.
  DATABASE_URL: z.string().min(1).refine((v) => /^(file:|postgres(ql)?:\/\/)/.test(v), 'DATABASE_URL must start with file: (SQLite) or postgresql://'),
  APP_URL: z.string().url().default('http://localhost:5173'), // public web origin
  API_URL: z.string().url().default('http://localhost:4000'),
  CORS_ORIGINS: z.string().default(''), // extra comma-separated origins
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  COOKIE_DOMAIN: z.string().optional(),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // Sign in with Apple (optional). APPLE_PRIVATE_KEY is the .p8 contents; literal "\n" sequences are accepted.
  APPLE_CLIENT_ID: z.string().optional(), // the Services ID, e.g. com.himalayahub.web
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  // Native/mobile token auth (JWT access + rotating refresh). Defaults derive from SESSION_SECRET.
  JWT_SECRET: z.string().min(32).optional(),
  JWT_ACCESS_TTL_MIN: z.coerce.number().int().min(1).max(60).default(15),
  REFRESH_TTL_DAYS: z.coerce.number().int().min(1).max(180).default(60),
  // Community pseudonyms. Changing it only affects NEW aliases (existing ones are stored).
  COMMUNITY_ALIAS_SECRET: z.string().min(32).optional(),
  // Google Maps Platform key for the server-side Places proxy (never sent to browsers).
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  SMTP_URL: z.string().optional(),
  MAIL_PROVIDER: z.enum(['resend', 'brevo', 'smtp']).optional(),
  MAIL_API_KEY: z.string().optional(),
  MAIL_SEND_IN_DEV: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  MAIL_FROM: z.string().default('HimalayaHub <no-reply@himalayahub.example>'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof schema>;

function load(): Env {
  // `KEY=` (empty) in .env means "not set" — treat it like a missing variable so optional
  // settings copied from .env.example never stop the server from starting.
  const input = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined && v.trim() !== ''));
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    // Fail fast with a readable message (values are never printed).
    throw new Error(`Invalid environment configuration:\n${issues}\nSee .env.example.`);
  }
  if (parsed.data.NODE_ENV === 'production' && parsed.data.APP_URL.startsWith('http://')) {
    throw new Error('APP_URL must use https in production (secure cookies depend on it).');
  }
  return parsed.data;
}

export const env = load();
export const isProd = env.NODE_ENV === 'production';
export const allowedOrigins = [env.APP_URL, ...env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)];
