<<<<<<< HEAD
# Iris Kooij Wellness – Center for Beauty & Wellbeing

![CI](https://github.com/${GITHUB_REPOSITORY}/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/${GITHUB_REPOSITORY}/actions/workflows/deploy.yml/badge.svg)
![Staging](https://github.com/${GITHUB_REPOSITORY}/actions/workflows/deploy-staging.yml/badge.svg)

High‑end wellness website for fascia‑rituelen and natural skincare, built with Next.js (App Router), React 18, TypeScript, TailwindCSS, Prisma (Postgres), and NextAuth.

## Demo Quick Start
```powershell
git clone <repo>
cd IK Engine V2
npm install
npx prisma migrate dev   # uses Postgres if DATABASE_URL points to postgresql
npm run prisma:seed
npm run dev   # binds to 127.0.0.1:3000
```
Open:
- Site: http://127.0.0.1:3000/
- Admin: http://127.0.0.1:3000/admin/pages
- Login: http://127.0.0.1:3000/login (admin@iris.local / admin123)

Edit a page:
1. Go to Admin → Pagina’s.
2. Click a slug, add/reorder sections.
3. Save; open `/<slug>?preview=1` to view unpublished.

Rituelen demo:
1. Visit /rituelen for grid.
2. Click a card for detail (FAQ, pricing, booking CTA).
3. In Admin → Rituelen update fields; reload page to see changes.

Media upload flow (quick):
1. POST /api/media/presign via UI upload button.
2. File PUT to returned S3/Blob URL (handled automatically).
3. Trigger thumbnail generation (webp variants) with "Generate thumbnails".

Health check: http://127.0.0.1:3000/api/health returns `{ ok: true }`.

Playwright e2e:
```powershell
npm run test:e2e
```
All tests should pass (5 specs). Re-seeds DB each run.

Jest-only (unit/integration):
```powershell
npm run test:unit
npm run test:unit:coverage
```

For a clean restart (Windows):
```powershell
Get-Process node | Stop-Process -Force
npm run dev
```

If port issues: ensure firewall allows Node, or change port with `npm run dev -- -p 3100`.

## Environment Variables

Set in `.env` before running. Validation is enforced in `lib/env.ts`.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | yes | Postgres connection string (switch from prior SQLite dev) | `postgresql://user:pass@localhost:5432/ik_engine?schema=public` |
| `NEXTAUTH_SECRET` | yes | NextAuth session/JWT secret | (32+ random chars) |
| `NEXTAUTH_URL` | prod | Public base URL | `https://wellness.example` |
| `STORAGE_PROVIDER` | yes | `local` | `s3` | `vercel-blob` selection | `local` |
| `S3_BUCKET`,`S3_REGION`,`S3_ACCESS_KEY_ID`,`S3_SECRET_ACCESS_KEY` | if s3 | S3 media storage credentials |  |
| `VERCEL_BLOB_READ_WRITE_TOKEN` | if vercel-blob | Blob RW token |  |
| `UPSTASH_REDIS_REST_URL`,`UPSTASH_REDIS_REST_TOKEN` | optional | Redis-backed rate limit & queues |  |
| `ALLOWED_UPLOAD_MIME` | optional | Comma MIME whitelist | `image/png,image/jpeg` |
| `MAX_UPLOAD_SIZE_MB` | optional | Max upload size MB | `10` |

### Migrating From SQLite Dev to Postgres
1. Install Postgres & create DB (`ik_engine`).
2. Set `DATABASE_URL=postgresql://user:pass@localhost:5432/ik_engine?schema=public`.
3. Run `npx prisma migrate dev --name switch_to_postgres` (creates migration).
4. Seed: `npm run prisma:seed`.
5. Start: `npm run dev`.

Use `prisma migrate deploy` in production CI.

## Stack Rationale
- **Next.js App Router**: Hybrid static + dynamic routing, SEO, accessibility, future-ready.
- **TypeScript**: Safer iteration and enterprise maintainability.
- **TailwindCSS**: Rapid consistent design system + dark mode toggle ready.
- **Prisma + Postgres**: Production-grade relational layer; previously SQLite in dev, now standardized on Postgres.
- **NextAuth (Credentials)**: Lightweight authentication & role-based access (ADMIN / EDITOR / VIEWER).
- **Jest (multi-project)**: UI (jsdom) & DB (node) test separation for clean boundaries.

## Getting Started
```powershell
npm install
npm run dev
```
Site runs at http://localhost:3000.

## Scripts
- `dev` – start development server
- `build` – production build
- `start` – run built app
- `lint` – lint codebase
- `test` – run Jest tests (both UI + DB projects)
- `test:unit` – run Jest on `__tests__` only (DB + UI unit)
- `test:unit:coverage` – Jest-only coverage for `__tests__`
- `test:e2e` – run Playwright tests (auto-starts dev server)
- `prisma:migrate` – apply dev migration
- `prisma:generate` – regenerate Prisma client
- `prisma:seed` – seed database (brand, rituelen, admin user)

### Local Smoke (Windows)
Quick end-to-end readiness + homepage smoke with a temporary SQLite DB:

```powershell
cd "c:\Users\G. Bagmeijer\Desktop\IK Engine V2"
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
node scripts/smoke-local.js --base http://127.0.0.1:3000 --port 3000 --db file:./dev-smoke.db --secret devsecret
```

Notes:
- The smoke orchestrator migrates, seeds, (re)builds with required env, starts the server, polls `/api/ready`, runs `scripts/smoke.js`, then shuts down.
- If you see port conflicts, change `--port` and `--base` accordingly (e.g., `--port 3100 --base http://127.0.0.1:3100`).

## Deploy (Vercel)
- See `scripts/deploy-vercel.md` for one-time setup and required GitHub Secrets:
  - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
  - `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - Optional storage/Redis/Sentry secrets
- Workflow: `.github/workflows/deploy.yml` runs migrate → pre-smoke → `vercel pull/build/deploy` → post-deploy readiness + smoke.

## Structure
```
app/                      # App Router pages & layout
  components/             # Shared UI components
  rituelen/               # Rituals overview + dynamic detail pages (DB-backed)
  ventures/[slug]/        # Legacy ritueel detail route (links back to /rituelen)
  academy/                # Academy landing page
  shop/                   # Shop teaser (non-commerce)
  faq/                    # Veelgestelde vragen
  admin/                  # Protected admin portal (requires auth)
  blog/                   # Blog listing + detail pages (DB-backed)
  login/                  # Credentials login page
  api/                    # Route handlers (auth + rituelen CRUD, brands, media, roles)
    blog/                 # Blog CRUD endpoints (list/create + slug detail)
    media/                # Media upload endpoints (presign, multipart, process)
    brands/[id]/          # Brand update endpoint
    users/[id]/role/      # User role mutation endpoint
  sitemap.ts              # Generated sitemap (includes rituals)
  robots.ts               # Robots with sitemap link
config/brands.ts          # Legacy static brand registry (deprecated)
lib/seo.ts                # Metadata helpers
lib/prisma.ts             # Prisma client singleton
lib/rituals.ts            # DB ritual access abstraction
lib/blog.ts               # Blog helpers (default template + serialization)
lib/auth.ts               # NextAuth configuration
lib/storage.ts            # S3 / Vercel Blob / local storage abstraction
lib/brand.ts              # DB-backed brand resolution + cache
lib/contrast.ts           # WCAG color contrast utilities
lib/rateLimit.ts          # In-memory rate limiter (dev/staging)
prisma/schema.prisma      # Database schema
prisma/seed.js            # Seed script (brand, rituals, admin user)
styles/global.css         # Tailwind layers + serif headings
```

## Ritueel Data Shape (Legacy & DB)
UI components consume a mapped shape:
```ts
interface RitualUI {
  id: number;            // generated in mapper (not DB id)
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  valueProps: string[];
  ctaLabel: string;
  brandId: string;
}
```
Underlying Prisma model (see `schema.prisma`) uses a string `id` (cuid) and includes status + timestamps.

## Blog Pages
- **Model & validation**: `BlogPost` Prisma model (slug, content JSON, SEO fields) with schemas in `lib/validation.ts` and helpers (`buildDefaultBlogContent`, `serializeBlogPost`) in `lib/blog.ts`.
- **API routes**: `/api/blog` lists or creates posts (drafts require ADMIN/EDITOR session); `/api/blog/[slug]` provides detail plus PATCH/DELETE operations with audit logging.
- **Admin workflow**: `/admin/blog` lists articles and creates drafts with the default template. `/admin/blog/[slug]` offers a guided editor (meta, sections, quote, outro, resources) and preview link.
- **Public rendering**: `/blog` shows published summaries ordered by publish date, `/blog/[slug]` renders the structured layout (intro, sections, highlight, outro, resources).
- **Sitemap**: `app/sitemap.ts` now includes published blog URLs so search engines index new articles automatically.

## Recent Enhancements
Implemented:
- Blog platform (DB-backed `BlogPost`, default template, admin editor, public listing/detail, sitemap entries, audit + rate limits on API routes).
- Ritueelprijzen tijdelijk verborgen in de UI; toggle `ENABLE_PRICE_DISPLAY` in `RitualCard` wanneer tarieven weer zichtbaar mogen zijn.
- Sign-out button & role badge in admin sidebar.
- Role-based UI: EDITOR cannot delete rituelen; ADMIN can create/delete; both can edit.
- Zod validation for ritueel create/update with structured JSON error responses.
- Audit logging for ritueel create/update/delete actions.
- GitHub OAuth provider added (credentials still supported).
- Added Azure AD and Google OAuth providers (env scaffolding in `.env.example`).
-- MediaAsset model & upload stub API (`/api/media`) for future storage integration.
-- Brand settings admin page with WCAG contrast enforcement.
-- Slug uniqueness pre-check with alternative suggestions.
-- Caching headers & rate limiting groundwork for rituelen GET endpoint.
-- Storage abstraction (S3 / Vercel Blob / local) with media upload route.
-- DB-backed brand resolution middleware (dynamic color headers).
-- Distributed rate limiter (Upstash Redis fallback to in-memory).
-- Edge-safe middleware crypto + CSP: Node `crypto` replaced with Web Crypto in `middleware.ts` to support the Edge runtime. In development, CSP relaxes `script-src` to allow Next dev tools (`'unsafe-inline' 'unsafe-eval'`); production enforces nonce-based `script-src` with HSTS.
-- /api/brands listing endpoint (nav + branding fields).
-- NavigationLink model for DB-driven navigation.
-- S3 presigned upload endpoint (`/api/media/presign`).
-- Image processing endpoint (`/api/media/process`) producing webp thumbnails + long-term caching.
-- Multipart S3 upload endpoints (`/api/media/multipart/*`) for large files (>5GB ready design).
-- Perceptual hash duplicate detection (aHash) to avoid storing near-identical images.
-- MediaAssetVariant tracking + ImageProcessingJob async worker script (`scripts/imageWorker.ts`).
-- Navigation link drafting & publish flow (`/api/navigation/drafts`).
-- Booking & service metadata on rituelen (durationMinutes, priceCents, currency, bookingLink, contraindications, faq) with JSON-LD Service/Offer markup.
-- Admin editor UX: price entry in euros -> cents conversion, FAQ row editor (add/remove Q&A), contraindications list editor, image upload + thumbnail generation toasts, booking CTA exposure.

## Error Handling & API Envelope
- Standard JSON envelope for all API routes (see `lib/errors.ts`):
  - Success: `{ ok: true, data }`
  - Failure: `{ ok: false, error: { code, message?, details? } }`
- Helpers: `ok()`, `fail(code,status,message?,details?)`, `validation(issues)`, `unauthorized()`, `forbidden()`, `rateLimited()`.
- Typical codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMIT`, `VALIDATION`, `INVALID_JSON`, `SLUG_EXISTS`, `CREATE_FAILED`, `UPDATE_FAILED`, `DELETE_FAILED`.
- Rate limiting headers via `lib/rateLimit.ts` + `formatRateLimitHeaders()`; UI can read `X-RateLimit-Remaining` and `X-RateLimit-Reset`.
- Global error boundary: `app/error.tsx` renders a friendly message and a retry button.

Ritueel PATCH specifics:
- Partial updates allow clearing with explicit values:
  - `featuredImageUrl`, `featuredImageAlt`, `tagline`: send `null` to clear
  - `valueProps`: send `[]` to clear
- Audit logging (`lib/audit.ts`) records `fields` and `fieldsCleared`; if all modified fields are cleared, action is `CLEAR` (else `UPDATE`).


## Next Steps (Suggested)
Short-term:
- Extend admin brand UX (logo upload using presign + thumbnails generation).
- Harden storage (size/type validation) & move image processing to background job / queue.
- Harden validation (duplicate slug checks, length limits) and unify error response contract.
- Postgres migration for production scale (see `docs/POSTGRES_MIGRATION.md`).
- Add CDN layer (CloudFront/Cloudflare) for media variant caching.

Medium:
- Replace Credentials with additional OAuth / passkeys.
- Newsletter backend integration (Resend / Mailchimp).
- Media processing (thumbnails) pipeline & CDN integration.

Long-term:
- Multi-tenant domain mapping (brands from DB rather than static config) with per-brand theme & analytics isolation.
- Content versioning & draft/publish workflow.
- Analytics + privacy (Plausible / PostHog) & performance budget (Lighthouse CI).
- I18n (next-intl) and accessibility audit automation.
- Advanced edge rate limiting (KV / Redis) & anomaly detection.
- Service offering expansions: multi-currency pricing with automatic FX updates (merchant API), recurring package bundles.
- Image variant optimization pipeline (AVIF fallback chain, perceptual quality budgets).
- Admin analytics dashboard (top ritual views, conversion funnel from landing to booking link).

## Accessibility & SEO
- Semantic landmarks (`header`, `main`, `footer`, sections)
- Metadata via `lib/seo.ts`
- Descriptive headings & links

## Testing
Jest multi-project:
```
projects:
  - db (node env)       # Prisma integration tests
  - ui (jsdom env)      # Component/render tests
```
Add further tests in `__tests__/`:
- db.test.ts – ensures brand + rituelen seeded
- rituals.test.ts – data shape assertions
- home.test.tsx – basic render smoke test

Potential future tests:
- API route contract tests
- Auth flow (mock NextAuth) tests
- Accessibility (axe) integration

### Test Database Strategy
Dev & CI use SQLite for speed and hermetic setup (file-based, zero service dependency). Production runs Postgres for reliability & concurrency. Migrations are authored against Postgres; Prisma maintains compatibility with SQLite during local/unit runs. Switch by updating `DATABASE_URL` and re-running `npx prisma migrate dev`. Keep SQLite in automated Jest to avoid network + service flakiness.

### Rate Limit Test Optimization
High-frequency PATCH rate limit tests early-break after first 429 response instead of exhausting the entire quota to reduce runtime and avoid Jest timeouts. Threshold behavior is still asserted (first 429 encountered within configured limit window).

### Logger Behavior Under Test
The `lib/logger.ts` disables pretty/transport output under Jest (detected via `JEST_WORKER_ID`) to prevent stream interface errors and reduce noise. In production, structured logs (pino) include request + brand context; in tests only minimal JSON lines are emitted for actions (e.g. page update). Avoid adding console.debug in routes; rely on metrics + audit logs.

### Coverage
Run `npm run test:unit:coverage` to collect Jest-only coverage with baseline thresholds (statements 60%, branches 50%). Increase thresholds over time as critical pathways (auth, media, navigation) gain tests. Playwright e2e is separate: `npm run test:e2e`.

### Playwright Login Strategy
Admin flows log in via an in-page credentials POST (CSRF fetch + `/api/auth/callback/credentials` from `page.evaluate`) to ensure cookies apply to the browser context. This avoids flakiness from client-only redirects and keeps SSR-protected routes accessible during tests. The Playwright config auto-starts the dev server on `127.0.0.1:3000`.

### Edge Runtime Compatibility
`middleware.ts` avoids Node `crypto` and uses Web Crypto APIs so it runs under the Edge runtime. A per-request nonce is generated for CSP and a safe `requestId` is attached via headers. HSTS is sent only in production.

## Deployment
Recommended: Vercel.
1. Set environment variables: `DATABASE_URL` (switch to hosted Postgres), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
2. Run migrations in CI/CD (`prisma migrate deploy`).
3. Seed production selectively (avoid overwriting existing data).
4. Optional: Add preview environments per branch for content testing.
 5. Configure storage: set `STORAGE_PROVIDER` (`s3` recommended) and provide `S3_*` envs, or `VERCEL_BLOB_READ_WRITE_TOKEN` for Vercel Blob.
 6. Rate limiting: provide Upstash Redis envs for distributed enforcement.
 7. Sentry: set `SENTRY_DSN` to enable error reporting (`lib/sentry.ts`).

### Production Readiness & Operations
- Readiness endpoint: `/api/ready` performs deeper checks (DB, brand data presence, optional Redis & storage).
- Health endpoint: `/api/health` basic connectivity + service timing.
- Full checklist: see `docs/PRODUCTION_CHECKLIST.md`.
- Observability guidance (logs, metrics, tracing roadmap, alerting): see `docs/OBSERVABILITY.md`.
- Post-deploy smoke tests: run script (to be added) or manual hits to `/api/health`, `/api/ready`, admin login, media presign.
- Telemetry (optional OpenTelemetry): set `OTEL_EXPORTER_OTLP_ENDPOINT` and install OTEL packages; `lib/telemetry.ts` auto-initializes and offers `startSpan(name, fn)` helper.

## Docker
- Quick start: see `docs/DOCKER.md` for image build, compose services (Postgres, optional Redis), and environment setup.

## Environment Variables
See `.env.example` for full list.
Key additions:
- `STORAGE_PROVIDER` (s3 | vercel-blob | local)
- S3: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- Vercel Blob: `VERCEL_BLOB_READ_WRITE_TOKEN`
- OAuth: `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Rate limiting (Upstash Redis): `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Optional Postgres (production): `DATABASE_URL` (set provider to postgresql in `schema.prisma` + run migrations). For pooling use PgBouncer or Prisma Data Proxy.

## Media Upload Flow
1. Client requests presigned URL via `POST /api/media/presign` with `{ filename, contentType }` (auth required).
2. Client streams file directly to S3 with `PUT` to returned `url` (avoid server memory bloat for large files).
3. Optional: Call `POST /api/media/process` with `{ key, widths: [320,640,1280] }` to generate webp variants.
4. (Legacy) Direct upload via `POST /api/media` still supported for small files or non-S3 providers.

Multipart (Large Files >5GB):
1. Initiate: POST `/api/media/multipart/initiate` -> { uploadId, key }
2. For each part (5MB - 100MB typical): POST `/api/media/multipart/part` with { key, uploadId, partNumber } -> presigned PUT URL
3. Client PUT each part to URL capturing `ETag` response headers.
4. Complete: POST `/api/media/multipart/complete` with { key, uploadId, parts: [{ ETag, PartNumber }], brandId, mimeType } -> MediaAsset record.

Duplicate Detection:
- Upload route computes a perceptual average hash; compares to existing assets (Hamming distance <=10 considered duplicate).
- If duplicate, existing asset returned instead of new storage.

Async Processing:
- Queue job by inserting ImageProcessingJob row; background worker script polls + creates variants.
- Use a separate process (e.g. `node scripts/imageWorker.ts`) in production or convert to serverless cron.

Draft Navigation Workflow:
- Copywriter creates draft via POST `/api/navigation/drafts`.
- Manager/Admin reviews and publishes via POST `/api/navigation/drafts/{id}/publish`.
- Published links appear immediately in navigation.

## Brand Resolution (DB-backed)
Middleware queries Prisma for matching `domain` and injects:
- `x-brand-id`
- `x-brand-primary`
- `x-brand-secondary`
Layout can apply CSS variables for theming; fallback to first brand when domain unrecognized.

Container alternative:
```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm","start"]
```

## Admin Editor Guide
The admin portal (`/admin/rituelen`) enables non-technical editing of ritual data. Key field behaviors:

### Pricing
- Enter price in euros with comma or dot (e.g. `120,00` or `75.5`). Client converts to integer cents (`priceCents`).
- Clear price via "Wis" under the price input (sends `priceCents: null`).
- Currency defaults to `EUR`; selectable list (`EUR|USD|GBP`). Clearing currency sets it to `null` (DB default fallback).

### Duration
- `durationMinutes` input uses 15-minute step increments; minimum 15.
- "Wis" button clears (sets `durationMinutes: null`).

### Booking Link
- Accepts absolute URL or internal path (e.g. `/contact`). Clearing sets `bookingLink: null` hiding CTAs client-side.
- When present: displays prominent "Boek nu" button on ritual detail and card-level CTA enhancements.

### Contra-indicaties
- Managed as a newline-delimited list internally; each row is its own input.
- "Item toevoegen" appends an empty row; rows can be edited or removed individually.
- "Wis alles" sets field to `null` (clears entire list). Server interprets `null` as clear.

### FAQ
- Each FAQ item is `{ question, answer }`. Use "FAQ-item toevoegen" to append a blank pair.
- Removing an item updates array immediately; empty array (`[]`) clears content.
- Persisted structure stored in `faq` JSON field; exposed to SEO layer for future rich results enhancements.

### Featured Image & Thumbnails
- Paste direct URL or upload via file input (presigned PUT). Successful upload shows toast.
- "Generate thumbnails" triggers `/api/media/process` for predefined widths `[320,640,1280]` (webp). Toast indicates start; background worker later populates variants.
- "Verwijder" sets both `featuredImageUrl` and `featuredImageAlt` to `null`.

### Value Props
- Each prop entered one per line in the text area; clearing all lines sends `valueProps: []` (explicit clear).

### Saving & Rate Limiting
- Save triggers PATCH; success toast `Wijzigingen opgeslagen` appears. Remaining update quota and reset timer show above grid when rate limit headers present.
- If validation fails, first issue displayed inline; adjust and retry.

### Accessibility
- Always include meaningful `featuredImageAlt` describing image context; leaving blank removes alt text.

### Common Validation Rules
- `name` >= 2 chars; `shortDescription` >= 10 chars; optional `longDescription` either absent or >= 20 chars.
- Price: numeric after normalization; invalid numeric input ignored until corrected.

### Clearing Fields Summary
- Text fields: set blank then Save → server drops empty string OR send explicit `null` for nullable ones.
- Arrays: send `[]` to clear (`valueProps`, `faq`).
- Nullable primitives: send `null` (durationMinutes, priceCents, bookingLink, currency, featuredImageUrl, featuredImageAlt, contraindications, faq).

### Troubleshooting
- No toast after Save: check for validation error message under heading.
- FAQ not persisting: ensure both question & answer filled before Save; blank items may be filtered if server-side validation added later.
- Rate limit exhausted: wait for countdown or refresh after reset epoch.

## Testing Enhancements
Playwright e2e suite uses programmatic credential login (CSRF + callback POST) for stability, avoiding flakiness in UI form flows. Admin FAQ persistence now verified via direct API GET to ensure DB round-trip integrity.

---
© 2025 Iris Kooij Wellness
=======
# IKNEXUS
>>>>>>> bea12dda706cadcee4bb3c94fd80c03276d1dc85
