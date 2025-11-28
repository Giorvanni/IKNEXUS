# Operations Runbook

Concise guide for common ops tasks.

## Health & Readiness
- Readiness: `GET /api/ready` → 200 when DB/brand/migrations/env OK.
- Health: `GET /api/health` → liveness check.
- Metrics: `GET /api/metrics` → Prometheus exposition.

## Deploy
- Staging: `/admin/deploy` → Trigger Staging; watch status panel.
- Production: Confirm hostname then trigger; verify `/api/ready` on prod URL.
- Rollback: Re-deploy previous commit in Vercel (Deployments → select → Redeploy).

## Smoke Test
- Local: `node scripts/smoke-local.js` (build + start + poll + smoke)
- Remote: `node scripts/smoke.js --base https://<domain>`

## Alerts
- Prometheus: use `ops/monitoring/prometheus.yml.example` to scrape `/api/metrics`.
- Rules: `ops/monitoring/alert_rules.yml.example` → add Slack or email receivers.

## Rate Limiting (Redis)
- Upstash Redis: set `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Fallback: in-memory (single instance only).

## Media Processing
- Queue: `ImageProcessingJob` → statuses: PENDING, PROCESSING, DONE, ERROR.
- Worker: `scripts/imageWorker.ts`; run externally (e.g., VM/Container) for heavy workloads.
- Backlog gauge: `ik_image_processing_backlog` (in `/api/metrics`).

## Backups
- Database: enable automatic backups in your Postgres provider (e.g., Neon). Note retention.
- Manual dump: `pg_dump $DATABASE_URL > backup.sql` (from a trusted host).
- Restore: `psql $DATABASE_URL < backup.sql`.

## Incident Checklist
- Identify scope: users/regions impacted → check `/api/ready` and Grafana panels.
- Check recent deploys in `/admin/deploy` (status + DB-backed history).
- Roll back via Vercel if regression suspected.
- Examine logs (Vercel/host) and Sentry; capture error IDs.
- Rate limit spikes? Inspect `rate_limit_denied_total` and Redis health.
- Media backlog high? Scale worker or pause heavy uploads.
- Communicate status and next update time.

## Contacts & Ownership
- Product owner: <fill>
- Ops contact: <fill>
- Incident channel: <fill>
