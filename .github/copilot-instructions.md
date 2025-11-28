# AI Coding Agent Instructions

Concise, codebase-specific guidance. Mirror existing patterns; do not introduce new architecture unless requested.

## Core Architecture
- Next.js App Router (server components) + route handlers under `app/api/*`.
- Persistence via Prisma (`prisma/schema.prisma`); use singleton from `lib/prisma.ts` only.
- Auth: NextAuth (credentials + OAuth) in `app/api/auth/[...nextauth]/` with roles `ADMIN|EDITOR|VIEWER`.
- Brand resolution: `middleware.ts` sets `x-brand-id`, `x-brand-primary`, `x-brand-secondary`; DB-backed cache in `lib/brand.ts` (`getBrandByDomain`) refreshes ~60s. Legacy `config/brands.ts` is transitional.
- Storage abstraction (`lib/storage.ts`) selects provider by `STORAGE_PROVIDER` (`s3|vercel-blob|local`).

## Data & Mapping
- Do NOT mutate using synthetic ritueel `id` from `lib/rituals.ts`; use `slug` or DB cuid.
- Always specify `orderBy` on reads (e.g. rituelen `createdAt asc`).
- Audit every write via `logAudit` (`lib/audit.ts`) including `fields` & `fieldsCleared`. If all mutated fields cleared ⇒ action `CLEAR` else `UPDATE`.

## API Envelope & Errors
- Success: `{ ok: true, data }`; Failure: `{ ok: false, error: { code, message?, details? } }` (`lib/errors.ts`).
- Additive only: never remove existing keys; extend `ErrorCode` when introducing new error types.
- Include rate limit headers from `formatRateLimitHeaders()` when calling `rateLimit()`.

## Validation & PATCH Semantics
- Create/update validate with Zod (`lib/validation.ts`).
- Clearing rules: nullable primitives send `null`; arrays send `[]` (e.g. `valueProps: []` clears). `featuredImageUrl|Alt|tagline` allow explicit `null`.
- Reject empty PATCH bodies via `VentureUpdatePartialSchema` refine check.

## Auth & Role Enforcement
- Check session & role FIRST; return `401|403` via `unauthorized()` / `forbidden()` before heavy work.
- EDITOR: create/update; ADMIN: delete. Log attempts even on forbidden deletes for visibility.

## Media Pattern
- Presign flow: `POST /api/media/presign` (see `app/api/media/presign/route.ts`) → client PUT to returned URL; sanitize filename with safe regex; respect `ALLOWED_UPLOAD_MIME` & `MAX_UPLOAD_SIZE_MB` envs.
- Large files: multipart endpoints under `app/api/media/multipart/*` use uploadId + part presigns; complete with array of `{ ETag, PartNumber }`.
- Duplicate detection: perceptual hash (`mediaDuplicate.ts`) returns existing asset instead of storing duplicate.
- Variant generation: `POST /api/media/process` queues jobs; heavy work done by `scripts/imageWorker.ts` (never block request).

## Rate Limiting
- `lib/rateLimit.ts` auto-selects Redis (Upstash) if env set; fallback in-memory. Headers: `X-RateLimit-Limit|Remaining|Reset` (epoch seconds). Fail with `rateLimited()` 429.

## Reports Aggregation
- Generate via HTTP `POST /api/reports/aggregate` or batch: `$env:DIRECT_AGGREGATE="true"; npm run aggregates:all` → outputs to `public/reports/{domain}/latest.json`.
- Keep schema additive; bump `schemaVersion` only on breaking changes.

## Navigation Draft Workflow
- Draft create: `POST /api/navigation/drafts`; publish: `POST /api/navigation/drafts/{id}/publish`. Keep published links ordered (`order` ascending). Limit nav slice to <=12 items in `BrandProvider`.

## Implementation Conventions
- Do not leak raw Prisma models to legacy UI; map via `lib/rituals.ts`.
- Avoid circular imports; isolate env branching inside factory modules (`storage`, `rateLimit`).
- Never invent new response shape fields outside `data` or `error` envelope.
- Cache invalidation: rely on 60s TTL brand cache; force refresh only when necessary.

## CMS Pages & Sections
- Models: `Page`, `PageSection`, enum `PageSectionType` (`HERO|TEXT|FEATURES|CTA|NEWSLETTER|IMAGE|RITUALS`). JSON `data` per section holds fields.
- APIs: `GET/POST /api/pages`, `GET/PATCH /api/pages/[slug]`. `PATCH` fully replaces `sections` when provided.
- Admin UI: `/admin/pages` (list/create) and `/admin/pages/[slug]` (section editor with reorder).
- Rendering: Home/About resolve DB pages first; generic route `app/[slug]/page.tsx` renders other slugs. Use `?preview=1` to view unpublished.
- `RITUALS` (legacy `VENTURES`) section auto-fetches `/api/rituals` and renders a grid (optional `data.limit`).
- Validation: `PageCreateSchema`, `PageUpdatePartialSchema` in `lib/validation.ts`.

## Example Route Checklist
1. Early auth & role check.
2. Rate limit (if externally callable) → include headers.
3. Parse & validate JSON (Zod) → `validation()` failures.
4. Perform action (Prisma) with explicit `select`/`orderBy`.
5. Audit log with changed field list.
6. Return `ok({ ... })` plus rate limit headers.

## Testing & Scripts
- Run unit/integration: `npm test`; e2e (Playwright) requires dev server: `npm run dev` then `npm run test:e2e`.
- Regenerate Prisma: `npm run prisma:generate`; apply dev migration: `npm run prisma:migrate`; seed baseline data: `npm run prisma:seed`.

Questions or unclear areas? Ask for expansion—keep instructions concise & current.
