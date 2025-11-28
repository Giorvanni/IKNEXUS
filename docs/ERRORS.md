# Error Handling & Response Contract

This project uses a consistent JSON envelope across all API endpoints.

- Success: `{ ok: true, data }`
- Failure: `{ ok: false, error: { code, message?, details? } }`

See `lib/errors.ts` for helpers:
- `ok(data, headers?)`
- `fail(code, status, message?, details?, headers?)`
- `validation(details, headers?)` — use with Zod `.issues`
- `unauthorized()`, `forbidden()`, `notFound(message?)`
- `rateLimited(message?, headers?)`

Rate Limiting
- Use `rateLimit(key, limit, windowMs)` + `formatRateLimitHeaders()` from `lib/rateLimit.ts`.
- Include headers on responses:
  - `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (epoch seconds)
- UI may display remaining quota and a countdown to reset.

Audit Logging
- `lib/audit.ts` provides `logAudit({ action, entity, entityId, userId, data })`.
- Data shape (`AuditLogDataBase`): `{ slug?, fields?, fieldsCleared?, meta? }`.
- PATCH conventions:
  - If all modified fields are cleared (null or empty array) ⇒ action `CLEAR`.
  - Otherwise ⇒ action `UPDATE`.

Validation
- Centralized in `lib/validation.ts` (Zod). Return validation errors with `validation(issues)`.
- Ritueel PATCH allows explicit clearing:
  - `featuredImageUrl`, `featuredImageAlt`, `tagline`: `null`
  - `valueProps`: `[]`

Examples
```ts
import { ok, validation, fail } from '@/lib/errors';
import { rateLimit, formatRateLimitHeaders } from '@/lib/rateLimit';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  const rl = await rateLimit(`foo:${ip}`, 60, 60_000);
  if (!rl.allowed) return fail('RATE_LIMIT', 429, 'Too many requests', undefined, formatRateLimitHeaders(rl,60));
  return ok({ hello: 'world' }, formatRateLimitHeaders(rl,60));
}
```

Notes
- Prefer adding new error codes to `ErrorCode` in `lib/errors.ts`.
- Keep response contract stable; add fields additively.
