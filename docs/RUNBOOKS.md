## Operational Runbooks

Quick response guides for common incidents.

### 1) Readiness Failing (503)
Symptoms: `/api/ready` returns 503; deploy blocked.

Steps:
1. GET `/api/ready` and inspect `error.details.checks`.
2. If `migrations.pending > 0`: run `npx prisma migrate deploy` against target DB.
3. If `env.ok=false`: set missing envs (`DATABASE_URL`, `NEXTAUTH_SECRET`, provider-specific).
4. If `brandData.ok=false`: run `node prisma/seed.js` or insert a Brand.
5. If `storage.ok=false`: validate S3 creds/region/bucket policy.
6. If `redis.ok=false`: verify Upstash URL/token pair.
7. Retry rollout; monitor `/api/ready` to 200.

### 2) Elevated 5xx Errors
Symptoms: Alert on high 5xx error rate.

Steps:
1. Check logs (Pino) around timestamps.
2. Inspect Sentry for exceptions by release.
3. Confirm DB/Redis health; check connection limits/pooling.
4. Rollback to last known good release if needed.

### 3) High Latency (p95 > 1s)
Steps:
1. Query Prometheus `histogram_quantile` for offending route (`*_ms_*`).
2. Check DB slow queries, network egress to S3/Redis.
3. Scale horizontally (more instances) or increase pool; profile endpoints.

### 4) Image Processing Backlog
Symptoms: `ik_image_processing_backlog` > threshold.

Steps:
1. Scale worker (container/VM) or reduce polling interval.
2. Verify S3 throughput and throttling.
3. Inspect recent `imageWorker.job.error` spikes.

### 5) Rate Limit Exhaustion
Symptoms: Client sees 429; `rateLimit.denied_total` increases (if tracked).

Steps:
1. Validate Redis availability and capacity.
2. Adjust burst/window for critical routes.
3. Add allowlist for internal services.

### 6) Post-Deploy Verification
1. Run local smoke: `node scripts/smoke-local.js --base https://YOUR_DOMAIN --port 443 --db $DATABASE_URL --secret $NEXTAUTH_SECRET`.
2. Check `/api/metrics` for counters and latency.
3. Watch Sentry for new errors tagged with current `SENTRY_RELEASE`.
