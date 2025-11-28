# Iris Kooij Wellness – Architecture Overview (Updated)

> NOTE: This file previously described a multi-tenant "Bright Technology Ventures" platform. The project has pivoted to a single-brand wellness site for Iris Kooij. Multi-tenant sections are retained only where they remain conceptually useful; otherwise they are marked Deprecated.

This document now summarizes the current single-brand Next.js architecture, editor portal, and evolution points. Multi-tenant expansion can be reintroduced later if needed.

## 1. Current Goals
- Deliver a high‑end wellness experience (fascia & natuurlijke huidverzorging) with fast editorial iteration.
- Provide a secure `/admin` portal for rituelen (venture) management, brand settings, navigation drafts, and media uploads.
- Maintain consistent SEO/metadata; structured JSON‑LD for services and local business.
- Keep stack lean (Next.js + Prisma + NextAuth + Tailwind) while allowing future scaling.

### (Deprecated Multi-Tenant Goals)
Original multi-domain hosting and daughter brand strategy is paused. Sections referring to multiple production domains are historical.

## 2. High-Level Approach
Single Next.js App Router project with server components. A DB-backed `Brand` record (seeded) provides theming colors and navigation; domain detection is still in place but currently resolves to the single Iris brand.

```
app/                    # Public pages (shared)
  (marketing pages)
  admin/                # Editor portal (protected)
config/brands.ts        # Brand registry (static initial)
lib/brand/              # Brand context utilities
data/                   # Data (will evolve to DB or CMS pulled)
middleware.ts           # Domain → brand resolution
```

## 3. Brand Configuration
`config/brands.ts` (deprecated) originally exported an array of brand configs. This has been replaced by DB-backed brand persistence (table `Brand`). A lightweight cache in `lib/brand.ts` refreshes periodically.
```ts
export interface BrandConfig {
  id: string;            // internal identifier
  slug: string;          // path fallback (dev)
  domain: string;        // primary prod domain
  name: string;          // display name
  logo?: string;         // path to logo asset
  colors: { primary: string; accent: string; }; // theme tokens
  navigation: Array<{ label: string; href: string }>; // per-brand nav
  features?: { newsletter?: boolean; }; // flags
}
```
Legacy helper `getBrandByHost(host: string)` selected static config; now `getBrandByDomain(domain: string)` performs a cached Prisma lookup.

## 4. Middleware Domain Routing
`middleware.ts` extracts `Host` header, normalizes it (strip port), looks up the brand in the database, and sets `x-brand-id`, `x-brand-primary`, and `x-brand-secondary` headers. Optional path rewrite:
```ts
if (!request.nextUrl.pathname.startsWith('/brand/')) {
  // Optionally rewrite for dev; production can just pass header
}
```
The layout reads the header via `headers()` in server components.

### Security Headers & CSP
`middleware.ts` sets defense-in-depth headers on every request (including `/api/*`):
- `Content-Security-Policy`: nonce-based `script-src` in production; avoids inline execution without a nonce. In development, Next.js tooling allows `'unsafe-inline' 'unsafe-eval'`.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, minimal `Permissions-Policy`.
- `Strict-Transport-Security` (HSTS) is emitted only when `NODE_ENV=production`.

Client pages receive a per-request `x-csp-nonce` header; server-rendered `<script>` tags use this nonce when needed. Avoid adding inline scripts without wiring the nonce.

### Cookies (Auth)
NextAuth manages session cookies. In production behind HTTPS, cookies are set with `Secure` and `HttpOnly` flags; `SameSite` should default to `lax`. Ensure `NEXTAUTH_URL` points to the public HTTPS origin so cookie domain/path are correct. For cross-site OAuth callbacks, configure providers to the same domain (no cross-site cookies).

## 5. Brand Context & Theming
`BrandProvider` supplies brand config to client components. In `layout.tsx` we apply CSS variables derived from `brand.colors`:
```html
<html style="--brand-primary:#0ea5e9; --brand-accent:#ff7a00">
```
Tailwind utility classes can reference these via arbitrary values: `bg-[rgb(var(--brand-primary))]` or we directly use style props.

Minimal approach: use inline style variables + existing Tailwind palette; expand later by generating a Tailwind plugin if stronger design tokens are needed.

## 6. Data Layer Summary
- Prisma (SQLite dev, Postgres-ready) models: Brand, Ritual, User (role), MediaAsset (+Variant, ImageProcessingJob), NavigationLink (+Draft), AuditLog.
- `lib/ventures.ts` maps DB ventures to UI shape (synthetic numeric id). Mutations address ventures by `slug`.
- Brand cache (`lib/brand.ts`) refreshes ~60s; avoids repeated DB hits.
- Navigation drafts allow copywriters to stage changes before publish.

## 7. Editor Portal (/admin)
Features MVP:
- Auth (NextAuth.js) using email magic link or OAuth.
- Dashboard: ventures per brand, recent edits.
- Ritueel CRUD: list, create, edit, delete.
- Brand settings: update colors, upload logo.
- Media library: upload images (S3/R2/Vercel Blob) with alt text.

Tech stack additions:
- Prisma ORM for persistence.
- Zod for API validation.
- React Query (or SWR) for admin data fetching & optimistic updates.

Structure:
```
app/admin/layout.tsx        # Admin shell (sidebar, topbar)
app/admin/page.tsx          # Dashboard
app/admin/ventures/page.tsx # List
app/admin/ventures/new.tsx  # Create form
app/admin/ventures/[id]/page.tsx # Edit form
app/admin/brands/page.tsx   # Brand settings
app/api/ventures/route.ts   # CRUD handlers (REST or POST-based with action param)
```

## 8. Authentication & Authorization
- Add Users table + NextAuth configuration.
- Role-based access: `ADMIN` (all brands), `EDITOR` (specific brand), `VIEWER`.
- Middleware protects `/admin` routes; server components verify session/roles.
- Auditor: each write logs action into `AuditLog` table for traceability (implemented via `lib/audit.ts`).
- OAuth provider integration (GitHub initially; extend to Azure AD / Google for enterprise SSO).

## 9. API Validation & Error Modes
Use Zod schemas (implemented in `lib/validation.ts`):
```ts
const RitualSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  brandId: z.string(),
  shortDescription: z.string().min(10),
  longDescription: z.string().min(20),
  valueProps: z.array(z.string().min(2)).min(1)
});
```
Errors return JSON with consistent shape (implemented):
```json
{ "ok": false, "error": { "code": "VALIDATION", "details": [...] } }
```

## 10. SEO
- `lib/seo.ts` provides organization + service/offer metadata.
- LocalBusiness JSON‑LD injected on contact page.
- Ritueel detail pages include Service/Offer JSON‑LD (duration, price when present).
- Sitemap includes rituelen; canonical currently single-domain.

## 11. Accessibility Standards
- Maintain skip links across brands.
- Ensure contrasting brand colors; enforce via automated contrast check script.
- Form components: label + description IDs.
- Editor portal: keyboard navigable sidebar, focus outlines.

## 12. Performance & Rate Limiting
- Marketing pages largely static; ritueel detail dynamic for freshness.
- In-memory + Upstash-ready rate limiter (`lib/rateLimit.ts`); standard headers returned.
- Image uploads use presigned URLs (no server buffering); background processing script for variants.
- Brand lookup cached in-memory (1 minute TTL).

## 13. Storage Abstraction
Implemented in `lib/storage.ts` with three providers:
- S3 (AWS SDK v3) – supports direct server uploads and presigned PUT URLs.
- Vercel Blob – simplified public object storage with automatic URL generation.
- Local (dev fallback) – placeholder path; can be extended to write to `public/uploads`.
Selection via `STORAGE_PROVIDER` env (`s3`, `vercel-blob`, `local`). Media uploads processed by `/api/media` route; future optimization: presigned or direct client uploads, image resizing, and checksum validation.

## 13. Deployment Strategy
- Single Vercel project with multiple domains mapped.
- Environment variables prefixed per brand if needed (e.g. `BRAND_A_ANALYTICS_KEY`).
- Preview environments test all brand contexts (middleware uses preview domain subpaths if custom domains not attached).

## 14. Current Evolution Priorities
1. Harden validation (length limits, duplicate slug suggestions).
2. Postgres migration for production scale.
3. Media variant pipeline (background queue + CDN caching).
4. Improved editor UX (inline field help, accessibility hints).
5. Rate limit persistence via Redis (replace in-memory in distributed deploys).
6. Optional multi-brand reactivation (if future daughter offerings added).

## 15. Testing Strategy
- Unit: brand resolver, venture validators.
- Integration: API routes (CRUD) with an in-memory DB or test schema.
- E2E (future): Playwright tests for admin form flows & multi-domain rendering.
- Accessibility: axe-core script on static build.

## 16. Future Enhancements
- Localization (NL/EN) via next-intl.
- Advanced analytics dashboard (ritueel views, booking funnel).
- Expanded media pipeline (AVIF generation, perceptual quality budgets).
- Publication workflow (draft → review → publish for rituelen copy).
- Newsletter integration + double opt-in.

## 17. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Hard-coded color leakage | Centralize tokens in `config/brands.ts` + CSS variables. |
| SEO duplicate pages across domains | Canonical + domain-specific metadataBase. |
| Auth complexity creep | Start with minimal NextAuth email provider; add roles later. |
| Large bundle due to admin UI | Code-split admin components; isolate heavy libs to admin only. |
| Data inconsistency when migrating | Write migration script & seed test; keep venture schema stable. |

## 18. Minimal Next Steps (Actionable)
- Enforce image dimension + mime validation in presign route.
- Add Service JSON‑LD for each ritueel (structured treatment schema).
- Convert seed script to environment-aware (skip admin user if exists).
- Add Playwright smoke tests for login, edit ritueel, generate thumbnails.
- Prepare Postgres migration + connection pooling config.

---
Document version: 2.0 (Rebased to single-brand Iris Kooij Wellness).
