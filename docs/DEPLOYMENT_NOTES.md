## Deployment & Operations

### Processes
Run Next.js app and background image worker separately:

```bash
# Production mode
node scripts/imageWorker.ts &
next start -p 3000
```

On platforms like Vercel (serverless), move worker logic to a scheduled function or external container (e.g. Fly.io, AWS Fargate). Alternatively replace polling with a queue (Upstash QStash, SQS) invoking a serverless function per job.

### Environment Variables
| Name | Purpose |
|------|---------|
| DATABASE_URL | Postgres connection string (production) |
| NEXTAUTH_SECRET | Auth session encryption |
| NEXTAUTH_URL | Public base URL for callbacks/cookies |
| STORAGE_PROVIDER | `s3` | `vercel-blob` | `local` |
| S3_BUCKET / S3_REGION / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY | S3 credentials |
| UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN | Distributed rate limiting |
| SENTRY_DSN | Error reporting (optional) |
| IMAGE_WORKER_ENABLED | (optional) toggle worker start |

### Scaling Notes
1. Enable Postgres + PgBouncer or Prisma Data Proxy for connection pooling.
2. Attach CDN (CloudFront/Cloudflare) over S3 bucket for media variant caching.
3. Use object lifecycle rules to archive original large assets post-variant generation.
4. Monitor worker latency & queue depth; alert if > N pending jobs.

#### Connection Pooling (Recommended)
- PgBouncer in transaction pooling mode in front of Postgres.
- Use a pooled connection string for the app, e.g.: `postgres://user:pass@pgbouncer:6432/db?pgbouncer=true&connection_limit=10`.
- Disable prepared statements via `?pgbouncer=true` to avoid session pinning.
- Keep Prisma pool conservative: prefer more app instances over large per‑instance pools.

Example environment split:
```env
# App uses PgBouncer
DATABASE_URL=postgres://user:pass@pgbouncer:6432/app_db?pgbouncer=true
# Admin scripts can talk directly when needed
DATABASE_URL_DIRECT=postgres://user:pass@postgres:5432/app_db
```

If using Prisma Data Proxy, replace `DATABASE_URL` with the Data Proxy URL and follow Prisma guidance for connection limits.

### Monitoring & Observability
- Health endpoint `/api/health` returns `{ ok: true }` with DB connectivity checks in integration tests.
- Readiness endpoint `/api/ready` performs deeper checks and returns 200 only when:
	- DB connectivity is healthy and at least one brand exists.
	- Optional Redis and storage checks pass when configured.
	- Required envs are present.
	- Prisma migrations have no pending items (compares `_prisma_migrations` applied count with `prisma/migrations` folder entries).
- Capture logs for image worker (stdout) -> centralized logging (Datadog / Logtail).
- Metrics: number of variants generated, duplicate images avoided count (hash matches), rate limit denials.
- Error tracking: Sentry instrumentation around upload & processing routes.

### Security
- Enforce MIME type whitelist for uploads (PNG, JPEG, WEBP, SVG) and size cap at edge (TODO: add `Content-Length` validation on presign requests).
- Use signed URLs with short TTL (15m) and random prefixes for object keys.
- Consider checksum validation on multipart complete (client sends SHA256 of concatenated parts).
- Middleware runs at the Edge: uses Web Crypto APIs for `requestId` and CSP nonce. In production, CSP `script-src` requires a nonce; in development, `unsafe-inline` and `unsafe-eval` are allowed for Next dev tools. HSTS is sent only in production.

### Production Readiness Checklist
- [ ] Database: Set `DATABASE_URL` to managed Postgres; run `prisma migrate deploy` during release.
- [ ] Auth: Set `NEXTAUTH_SECRET` (32+ random chars) and `NEXTAUTH_URL` to public domain.
- [ ] Storage: Choose `STORAGE_PROVIDER` and set corresponding envs (S3 recommended).
- [ ] Rate Limiting: Provide Upstash Redis envs for consistent limits across instances.
- [ ] Error Tracking: Set `SENTRY_DSN` to capture exceptions (`lib/sentry.ts`).
- [ ] Caching: Place CDN in front of S3 for media; verify cache headers on variants.
- [ ] Security: Confirm CSP in prod (nonce-based), HSTS enabled, headers validated in tests.
- [ ] Health & Readiness: `/api/health` wired in monitoring; `/api/ready` used by orchestrators (fails when migrations pending).
- [ ] CI/CD: Add build, unit tests, e2e (Playwright) with `webServer` step; run migrations on deploy.
- [ ] Backups: Enable Postgres automated backups; version S3 bucket with lifecycle rules.

### Future Enhancements
- Background queue via QStash or SQS instead of polling worker.
- Domain-based multi-tenancy: isolate navigation drafts per brand domain and add preview tokens.
- Signed cookies for temporary access to draft images prior to publish.
- Automatic accessibility audit workflow (axe + Pa11y) in CI.