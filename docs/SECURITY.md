# Security

Implemented in Phases 2–4 (tested where noted):

| Control | Where | Tested |
|---|---|---|
| Passwords hashed with scrypt (N=2^17, r=8, p=1), salted, constant-time verify, auto-rehash | `src/auth/password.ts` | ✅ |
| Password policy (length, common words, no name/email) | `passwordProblem()` | ✅ |
| Session tokens: 256-bit random, only SHA-256 stored, httpOnly + SameSite=Lax + Secure (prod, `__Host-` prefix) | `src/auth/session.ts` | tokens ✅ |
| Sliding session expiry; revoke-all on password reset/change | `session.ts`, `auth.service.ts` | — |
| CSRF: origin allow-list + double-submit header on cookie-authenticated writes | `src/middleware/csrf.ts` | ✅ |
| Rate limiting (global 300/min/IP; auth 20/15 min/IP) with Retry-After | `src/middleware/rateLimit.ts` | ✅ |
| Login lockout: 5 failures/15 min per email, 30 per IP (IPs stored as keyed hashes) | `auth.service.ts` | — |
| Timing-safe login for unknown emails (verifies against a dummy hash) | `auth.service.ts` | — |
| No account enumeration on forgot-password; reset tokens single-use, 30-min expiry | `auth.service.ts` | — |
| Email verification tokens single-use, 24 h | `auth.service.ts` | — |
| Google OAuth with state cookie; identity fetched server-to-server | `modules/auth/google.ts` | — |
| RBAC enforced server-side; admins cannot touch super admins | `packages/shared/src/rbac.ts`, `middleware/auth.ts` | ✅ |
| Input validation with zod on every body/query/params | `middleware/validate.ts` | — |
| Secure headers (helmet), no `x-powered-by`, strict CSP for JSON, HSTS in prod | `app.ts` | — |
| CORS allow-list with credentials | `app.ts` | — |
| Error responses never include stacks or internals | `middleware/error.ts` | — |
| Logs redact passwords, tokens, cookies, keys and mask emails; IPs anonymised in audit log | `lib/redact.ts` | ✅ |
| Env validated at start-up; https enforced for APP_URL in production | `config/env.ts` | — |
| API keys only in env vars; DB stores the variable NAME | `ApiSetting.secretEnvVar` | — |

"—" means the code is written but needs a running database to test. These get integration tests
(supertest + a test database) in Phase 13, followed by a full security review in Phase 14.

Not yet implemented (scheduled): HTML sanitisation for CMS rich text (Phase 9, before any editor ships),
upload type/size checks and image re-encoding (Phase 9), provider circuit breakers (Phase 11),
Redis-backed rate limits for multi-instance deployments (Phase 15).
