## Database Backups & Restore

This document defines a pragmatic backup strategy for Postgres and how to verify restores. Adapt the cadence to your provider (RDS, Neon, Supabase, Aiven, etc.).

### Strategy
- Daily full snapshots (provider automated backups) retained 14–30 days.
- Hourly WAL/point‑in‑time recovery (PITR) where supported (retain 3–7 days).
- Monthly archive snapshot retained 6–12 months.
- S3 bucket versioning enabled for uploaded media (not a DB backup but part of RPO).

### Operational RPO/RTO
- RPO: ≤ 1 hour (≤ 5 minutes with PITR).
- RTO: ≤ 30 minutes (scripted restore, redeploy, readiness green).

### Restore Test (Quarterly)
1. Provision a temporary Postgres instance.
2. Restore from the latest snapshot (or PITR to a timestamp).
3. Update an environment with `DATABASE_URL` pointing to the restored DB.
4. Run `npx prisma migrate status` to ensure no pending migrations.
5. Run smoke against it: `node scripts/smoke-local.js --base http://127.0.0.1:3001 --port 3001 --db "$DATABASE_URL" --secret devsecret`.
6. Destroy the temporary instance.

### Manual Dump/Restore (Fallback)
```bash
# Dump (from production)
PGPASSWORD=$PGPASSWORD pg_dump \
  --format=custom --no-owner --no-privileges \
  --host=$PGHOST --port=$PGPORT --username=$PGUSER \
  --file=backup_$(date +%F).dump $PGDATABASE

# Restore (to fresh database)
PGPASSWORD=$PGPASSWORD pg_restore \
  --clean --if-exists --no-owner --no-privileges \
  --host=$PGHOST --port=$PGPORT --username=$PGUSER \
  --dbname=$PGDATABASE backup_YYYY-MM-DD.dump
```

### Automation Notes
- Prefer provider native backups over self‑managed dumps.
- Tag backups by app + environment (e.g. `ik-engine-v2-prod`).
- Keep runbook steps in `docs/RUNBOOKS.md`.
