## Production Environment & Secrets Checklist

Comprehensive, additive reference to prepare and operate the app in production. Complements `DEPLOYMENT_NOTES.md`.

### 1. Core Environment Variables
Must be present at build (some also at runtime). Never bake secrets into the image; supply via platform secrets store.

| Variable | Requirement | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | REQUIRED | Postgres URL with pooled user; run `prisma migrate deploy` before traffic. |
| `NEXTAUTH_SECRET` | REQUIRED | 32+ bytes cryptographically random. Rotation: invalidate existing sessions. |
| `NEXTAUTH_URL` | REQUIRED | Public HTTPS base (e.g. `https://app.example.com`). No trailing slash. |
| `STORAGE_PROVIDER` | REQUIRED | One of `s3`, `vercel-blob`, `local` (local only for dev). |
| `S3_BUCKET` / `S3_REGION` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | REQUIRED if `STORAGE_PROVIDER=s3` | Use dedicated IAM user with least privilege (PutObject/GetObject/ListBucket). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | OPTIONAL | Enables distributed rate limiting; without these falls back to in-memory per instance. |
| `SENTRY_DSN` | OPTIONAL | Error and performance telemetry. Set before first request. |
| `IMAGE_WORKER_ENABLED` | OPTIONAL | `true` to start variant worker in container/VM. Off when using external processing queue. |
| `ALLOWED_UPLOAD_MIME` | OPTIONAL | Comma list (default covers JPEG, PNG, WEBP, SVG). Restrict aggressively. |
| `MAX_UPLOAD_SIZE_MB` | OPTIONAL | Enforced during presign logic before client PUT. |
| `DIRECT_AGGREGATE` | OPTIONAL | `true` to run report aggregation directly in process (batch jobs). |

### 2. Secrets Management
- Use platform secrets vault (AWS SSM/Secrets Manager, GCP Secret Manager, Azure Key Vault, or Vercel project envs). Avoid `.env` committed to repo.
- Enforce mandatory review for changes to authentication or database credentials.
- Rotation playbook: prepare new secret → deploy with dual-read (if applicable) → cut over → revoke old.
- Audit: enable access logging for secret reads (cloud provider feature) and correlate with deployment pipeline timestamps.

### 3. Database & Migrations
1. Provision managed Postgres (automatic backups, PITR enabled). Minimum retention 7–14 days.
2. Pre-deploy step: `prisma migrate deploy` (idempotent) in CI/CD before switching traffic.
3. Run `prisma:seed` only for initial environment bootstrap (NOT on every deploy). Guard with an explicit flag if kept.
4. Monitor connection usage; consider PgBouncer or Prisma Data Proxy for bursty workloads.

### 4. Storage & Media
- S3 bucket with versioning (optional) + lifecycle rules to expire original large assets after variant confirmation.
- Public access via CDN (CloudFront/Cloudflare) for image variants; restrict direct bucket access.
- Object keys: ensure randomness/prefixing to mitigate enumeration.
- Validate MIME & size in presign route; plan checksum validation for multipart completion (future enhancement).

### 5. Rate Limiting
- With Redis (Upstash): consistent limits across horizontally scaled instances; headers included from `formatRateLimitHeaders()`.
- Without Redis: per-instance memory limiter; plan to enable Redis before traffic spike.
- Alerting threshold: spike in 429 responses (>5% over rolling 5 min) triggers investigation (possible abuse or misconfigured client).

### 6. Authentication & Sessions
- Credentials user seeding: ensure admin account is created exactly once; change default password immediately after first login.
- Session hardening: set secure, HTTP-only cookies; verify `NEXTAUTH_URL` matches canonical host to avoid cross-domain issues.
- Password policy: enforced via strength scoring (zxcvbn); log rejected weak attempts for audit (without password contents).

### 7. Observability & Monitoring
| Aspect | Implementation | Action |
|--------|---------------|--------|
| Health | `/api/health` | Add uptime check (30–60s interval). |
| Errors | Sentry (if DSN set) | Configure alert rules (new issue, increasing error rate). |
| Logs | Structured (Pino) | Ship stdout to aggregator (Datadog/Logtail). Include requestId & brandId. |
| Metrics | Minimal counters (variants, duplicates, rate limit denials) | Expand to Prometheus endpoints or push gateway later. |
| Worker | Image variant processing latency | Alert if backlog age > configured SLA (e.g. 2m). |

### 8. Security Posture
- HTTPS enforced (HSTS header active in production middleware);
- CSP nonce-based `script-src` (verify absence of `unsafe-inline` in production). Dev mode relaxes policy automatically.
- Regular review of dependency updates (enable Dependabot / Renovate with security PRs).
- Ensure no credentials in logs: scan sample log stream before go-live.
- Validate upload sanitization: reject unsupported MIME early; plan antivirus scan for untrusted binary types if expanded.

### 9. Deployment Pipeline
1. CI stages: lint → unit/integration → build → e2e (Playwright) → publish image/artifacts.
2. CD stages: run migrations → deploy app → start/verify worker → run post-deploy smoke tests.
3. Rollback: keep last N images; rollback strategy is re-point traffic + run schema compatibility check (no destructive down migrations without manual approval).

### 10. Post-Deploy Verification (Smoke Tests)
Run these immediately after traffic switch:
- 200 from `/api/health` with expected JSON shape.
- Admin login executes and loads `/admin/ventures` grid.
- Image presign returns signed URL; perform a small test upload; variant job enqueued.
- Rate limit: burst a test endpoint to ensure headers populate and 429 appears at expected threshold.

### 11. Incident Response Playbook (Condensed)
| Incident | Immediate Action | Follow-up |
|----------|------------------|-----------|
| Elevated 5xx errors | Check Sentry + recent deploy diff; rollback if spike persists >5 min. | Root cause analysis & postmortem. |
| DB latency spike | Inspect DB CPU / slow queries; consider enabling Prisma query logs temporarily. | Optimize queries / add indexes. |
| Media upload failures | Verify S3 IAM / presign route logs; test direct PUT with curl. | Rotate keys / adjust ACL policies. |
| Rate limit false positives | Confirm client burst patterns; adjust thresholds cautiously. | Re-evaluate limit strategy (token bucket vs fixed window). |

### 12. Backup & Recovery
- Postgres automated: verify daily backup job + periodic restore test (quarterly).
- S3: enable versioning or replicate critical bucket to secondary region (optional). Document restore procedure.
- Configuration: store infrastructure-as-code (Terraform/CloudFormation) to allow environment reconstruction.

### 13. Future Hardening Opportunities
- Replace polling worker with queue-triggered serverless tasks (QStash / SQS + Lambda).
- Add `/api/ready` endpoint separate from `/api/health` (ensures migrations ran & caches warmed).
- Enhance metrics: adopt OpenTelemetry exporters for traces around media processing.
- Add automated accessibility audits in CI (axe / Pa11y). Document exceptions.

### 14. Quick Final Pre-Live Checklist (Condensed)
- [ ] All required env vars present (no placeholder values).
- [ ] `prisma migrate deploy` succeeded; schema matches expectations.
- [ ] Admin user password rotated.
- [ ] S3 bucket + CDN configured; direct object access locked down.
- [ ] Redis (if enabled) responding; test rate limit headers.
- [ ] Sentry events visible from test error.
- [ ] Worker processing sample image → variant appears.
- [ ] Logs show requestId + brandId; no sensitive data.
- [ ] CSP response in prod free of dev relaxations.
- [ ] Monitoring dashboards & alerts active (errors, latency, 429%, worker backlog).

---
Keep this file additive; extend rather than rewrite. For changes crossing architectural boundaries, also update `ARCHITECTURE.md` and `DEPLOYMENT_NOTES.md`.
