# Postgres Migration Guide

This guide outlines how to migrate from the current SQLite dev setup to Postgres for staging/production.

## 1. Rationale
SQLite is perfect for local prototyping but lacks concurrency, performance tuning, and cloud managed features. Postgres provides:
- Better write concurrency
- Advanced indexing & JSON capabilities
- Extensions (pg_trgm for fuzzy search, etc.)
- Managed hosting (Railway, Supabase, Neon, RDS, Azure, etc.)

## 2. Preparation
1. Provision a Postgres instance (e.g. on Neon or Supabase).
2. Capture the connection string (e.g. `postgresql://user:pass@host:5432/dbname?schema=public`).
3. Add to environment variables: `DATABASE_URL=postgresql://...` (do NOT commit real credentials).

## 3. Schema Update
In `prisma/schema.prisma`, change:
```
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
to
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Run:
```powershell
npm run prisma:generate
prisma migrate deploy
```
Or for a fresh environment:
```powershell
prisma migrate reset
```

## 4. Data Migration Options
Option A (simple seed): Re-run seed script to populate baseline ventures/users.
Option B (export/import): Use `sqlite3` export then custom script to upsert into Postgres via Prisma.
Option C (Prisma introspection): Not recommended for production migration—explicit scripts are clearer.

## 5. Environment Segregation
Keep SQLite for local quick hacking by leaving `.env.development` pointing to SQLite and `.env.production` to Postgres. Use build-time injection of `DATABASE_URL`.

## 6. Testing Strategy
CI can run against an ephemeral Postgres container:
```powershell
docker run --name iris-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=iris -p 5432:5432 -d postgres:16-alpine
```
Set `DATABASE_URL` before `npm test`:
```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/iris?schema=public"
npm run prisma:generate
prisma migrate deploy
npm test
```

## 7. Pitfalls
- Missing `?schema=public` segment → migrations create unexpected schema.
- Long-running idle connections: configure `pgbouncer` or connection pooling on provider.
- Increased latency: consider edge caches for read-heavy endpoints.

## 8. Rollback Plan
Retain nightly SQLite export for a short window; on critical failure you can point back to SQLite (only if data divergence is acceptable). Otherwise rely on Postgres backups / point-in-time restore.

## 9. Next Enhancements After Migration
- Add indices to frequently used filters (e.g., venture `slug`, brand `domain`).
- Introduce optimistic locking (updatedAt checks) for concurrent edits.
- Explore `pgvector` if semantic search for ventures becomes a requirement.

---
Version: 1.0