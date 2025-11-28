# Docker & Compose

## Build & Run (Docker)
```powershell
docker build -t ik-engine:latest .
docker run --rm -p 3000:3000 ^
  -e NODE_ENV=production ^
  -e NEXTAUTH_SECRET=replace_me ^
  -e DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public" ^
  ik-engine:latest
```

## Local Parity (docker-compose)
```powershell
docker compose up --build
```
Services:
- `db` Postgres 16 on `localhost:5432` (user `postgres` / `postgres`).
- `app` Next.js at `http://localhost:3000`.
- `redis` optional (not required if using Upstash Redis).

Environment highlights:
- `DATABASE_URL` points to the Postgres service: `postgresql://postgres:postgres@db:5432/ik_engine?schema=public`.
- `NEXTAUTH_SECRET` must be set (32+ chars) in production.
- `STORAGE_PROVIDER` defaults to `local`. For S3, set `S3_*` envs in the compose file.
- `NEXTAUTH_URL` should reflect public URL behind a proxy in deployments.

## Prisma Migrations in Containers
When deploying, run migrations before starting the app:
```bash
npx prisma migrate deploy
```
In compose, you can embed this into the command or run a one-off container for migrations.

## Notes
- The Dockerfile starts the background image worker and Next.js server in the same container for simplicity. For scale, run the worker as a separate service.
- Add a CDN in front of S3 for media variant caching in production.
