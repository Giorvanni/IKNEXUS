# Vercel Deploy Guide

This project’s `deploy.yml` uses the Vercel CLI with prebuilt output.

## One-time Setup
1. Create a Vercel project (link to this repo) and note:
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID
   - Generate a VERCEL_TOKEN (Account Settings → Tokens).
2. Add GitHub Secrets on the repo:
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID
   - NEXTAUTH_SECRET (32+ chars)
   - NEXTAUTH_URL (your production URL, e.g., https://your-domain)
   - DATABASE_URL (Neon Postgres recommended)
   - STORAGE_PROVIDER (e.g., `vercel-blob` or `s3`)
   - If `s3`: S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
   - Optional: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, SENTRY_DSN

4. (Optional) Create Vercel Deploy Hooks (Vercel → Project → Settings → Git → Deploy Hooks)
   - Create a hook for staging (preview) and copy the URL → set `VERCEL_DEPLOY_HOOK_STAGING`.
   - (Optional) Create a hook for production and copy the URL → set `VERCEL_DEPLOY_HOOK_PROD`.
   - Admin can trigger staging and (optionally) production deploys from `/admin/deploy`.

3. Configure Environment Variables in Vercel Project (Dashboard → Settings → Environment Variables) to match production.
   - `vercel pull` in CI will fetch .vercel metadata and env for the build/deploy steps.

## Pipeline Overview
- CI validates env, runs tests and smoke.
- Deploy workflow:
  - Runs Prisma `migrate deploy` against `DATABASE_URL`.
  - Runs local `smoke-local.js` to ensure readiness.
  - Vercel: `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`.
  - Post-deploy readiness + smoke against `NEXTAUTH_URL`.

## Admin Controls
- `/admin/deploy` (ADMIN only): Trigger staging via `VERCEL_DEPLOY_HOOK_STAGING`, and production via `VERCEL_DEPLOY_HOOK_PROD` (with confirmation).
- Recommendation: keep production deploys primarily through Actions. The admin button is a convenience trigger that still respects your Vercel deploy hook rules.

## Status Panel (Admin)
- The admin Deploy page shows the 5 most recent Vercel deployments.
- Requires `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` to be set in the app environment (Vercel Project Env or local `.env`).

## Troubleshooting
- 401 from Vercel CLI: check `VERCEL_TOKEN` and that it belongs to the correct org/team.
- Env mismatches at runtime: ensure Vercel Project Env matches repo secrets; `vercel pull` should reflect.
- Prisma migrations failing: verify `DATABASE_URL` points to the managed Postgres and security group allows access.
- Cold starts on Hobby: acceptable for low scale; upgrade Vercel plan or add ISR where helpful.
