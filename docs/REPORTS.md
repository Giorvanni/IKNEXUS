# Reports Aggregation

This doc explains how brand/domain reports are generated, stored, and consumed.

## Overview

- Aggregator: `scripts/aggregator.js` exports `aggregateForDomain({ prisma, domain, outputToFile })`.
- Output: a JSON report with a stable envelope and schema version.
- Storage: selectable via `REPORTS_STORAGE` env: `local` (default) or `s3`.
- API routes:
  - `POST /api/reports/aggregate` — generate a report for a domain (ADMIN/EDITOR).
  - `GET /api/reports/list?domain=...` — list recent reports for a domain (ADMIN/EDITOR).
- UI:
  - Admin Dashboard shows the latest report timestamp and a "View JSON" link.

## JSON schema (v1)

Top-level fields (stable, additive):

- `schemaVersion`: number (currently 1)
- `generator`: "iris-aggregator"
- `generatorVersion`: app/package version if available
- `domain`: canonical domain used for the brand
- `brand`: `{ id, name, slug }`
- `counts`:
  - `ventures`: number
  - `mediaAssets`: number
  - `variants`: number
  - `jobs`: `{ pending, processing, error }`
  - `navigationLinks`: number
- `latestRituals`: array of up to 5 recent rituelen (`{ id, name, slug, status, createdAt }`)
- `thumbnails`: small inventory sample (up to 20), `{ id, width, format }`
- `generatedAt`: ISO timestamp
- When written with storage enabled:
  - `storage`: `local` | `s3`
  - `urls` (if available): `{ latest, timestamped }`
  - S3 may also include `keys`.

Consumers should treat unknown fields as optional and prefer `latest.json` for the current shape.

## Storage

- Local (default): written to `public/reports/{domain}/`
  - `latest.json`: most recent
  - `{YYYYMMDDHHmmss}.json`: timestamped snapshot (UTC)
- S3: requires
  - `REPORTS_STORAGE=s3`
  - `REPORTS_BUCKET` (or reuse `S3_BUCKET`)
  - `S3_REGION` (default `us-east-1`)
  - Objects are under `reports/{domain}/` with the same naming pattern as local.

## Running aggregation

- Single brand (Admin):
  - Admin → Brand Settings → "Generate aggregates"
- Batch via DB domains (no HTTP needed):
  ```powershell
  $env:DIRECT_AGGREGATE="true"; npm run aggregates:all
  ```
- Batch via file (no HTTP needed):
  ```powershell
  $env:DIRECT_AGGREGATE="true"; npm run aggregates:from
  ```
  Populate `config/competitors.json` with a JSON array of domains.
- Batch via HTTP (app running):
  ```powershell
  $env:SITE_URL="http://localhost:3000"; npm run aggregates:all
  ```

## Notes

- For private buckets, use signed URLs or proxy via a server route — the current implementation assumes public read for simplicity.
- To extend the report with traffic or analytics, add fields under a new section (e.g., `metrics`) while keeping `schemaVersion` stable or bump if breaking changes are introduced.
- The aggregator reads the app version from `package.json` when run in a Node context.
