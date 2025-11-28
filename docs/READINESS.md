## Readiness Endpoint (/api/ready)

The readiness probe performs deep checks and returns HTTP 200 only when all critical dependencies are healthy. Failure returns 503 with a structured error body.

### Checks
- `db`: Database connectivity (`SELECT 1`) and timing.
- `brandData`: Ensures at least one `Brand` exists; otherwise the site cannot render.
- `redis` (optional): If Upstash Redis envs provided, pings Redis.
- `storage` (optional): If `STORAGE_PROVIDER=s3`, HEAD bucket succeeds.
- `env`: Required variables present (`DATABASE_URL`, `NEXTAUTH_SECRET`).
- `migrations`: Compares applied migrations (`_prisma_migrations` count) to timestamped directories under `prisma/migrations` (folders matching `^\d{14}_.+`). Readiness fails if pending > 0.

### Response Shape
Success:
```json
{ "ok": true, "data": { "checks": { /* see above */ } } }
```
Failure:
```json
{ "ok": false, "error": { "code": "INTERNAL", "details": { "checks": { /* per-check */ } } } }
```

### Operational Notes
- Orchestrators should block rollout until `/api/ready` returns 200.
- CI smoke uses `scripts/smoke-local.js` which polls readiness with a timeout.
- Migrations must be applied (e.g., `prisma migrate deploy`) before starting the app in production.

### Troubleshooting
- `migrations.pending > 0`: apply migrations to the target database. Ensure readiness only counts timestamped directories; ignore non-directories (e.g., `migration_lock.toml`).
- `env.ok=false`: set missing variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, and provider-specific envs).
- `brandData.ok=false`: run `prisma/seed.js` or create a `Brand` entry.
- `storage.ok=false`: validate S3 credentials and region.
- `redis.ok=false`: verify Upstash URL/token pair.
