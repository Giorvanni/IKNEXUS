# CMS Migration & UX Readiness Plan

## 1. Static Page Inventory → PageSection Migration
| Route | Current State | Content Notes | Migration Approach | PageSection Types & Data | Extra Work |
|-------|---------------|---------------|--------------------|-------------------------|------------|
| `/` (Home) | Hero + Section components with CMS fallback | Mix of hero, ritual highlights, philosophy copy, newsletter | Keep slug `home` as source of truth; back-fill sections so fallback is never used | `HERO` (title/subtitle/cta), `RITUALS` (limit 3), `TEXT` (philosophy), `NEWSLETTER` | Ensure `PageRenderer` hero art can ingest custom image via `IMAGE` section if needed |
| `/about` | Already fetches `Page` but falls back to static | Short brand story paragraphs | Create `about` Page with three `TEXT` blocks to remove fallback; link CTA to `/rituelen` | `TEXT` (intro, training, philosophy) + optional `CTA` | Remove duplicate route later |
| `/over-iris` | Hard-coded clone of `/about` | Long-form profile + CTA | Either 301 to `/about` or create dedicated `Page` slug `over-iris` referencing same sections | `HERO` or `TEXT` + `CTA` | Update nav to avoid duplicate content |
| `/contact` | Mixed: `PageRenderer` sections for intro, custom aside for address | Needs editable hero text + optional FAQ snippet | Add `contact` Page with hero `HERO`/`TEXT` sections; keep aside data in DB (Brand table) or convert to `FEATURES` card grid | `TEXT`, `CTA`, optional `FEATURES` (address cards) | Evaluate exposing contact metadata via Brand settings to avoid dual sources |
| `/academy` | Static grid of cards | CTA links to four sub-paths | Model each card as `FEATURES` list or convert to `PageSectionType.CTA` entries | `HERO`, `FEATURES` (list items), `CTA` for sign-up | Consider mapping cards to separate CMS Pages if deeper content needed |
| `/rituelen` | Server component listing DB rituals, static intro copy | Intro text should be editor-managed; listing already dynamic | Add `rituelen` Page with hero + copy sections; keep `RITUALS` section for listing + CTA | `HERO`, `RITUALS` (limit 6), `CTA` | Keep `getRituals` for card data |
| `/faq` | Hard-coded array + LD-JSON | Needs editable Q&A | Either create `faq` Page with `TEXT` sections per question or introduce new `PageSectionType` (e.g., `FAQ`) with array data; ensure schema injection uses `sections` data | `FEATURES` or new `FAQ` type containing `{ question, answer }[]` | Extend renderer + validation if new type added |
| `/shop` | Static placeholder cards | Should allow owner to curate featured sets | Create `shop` Page with `HERO`, `FEATURES` for bullet list of offerings, optional `CTA` linking to contact | `HERO`, `FEATURES`, `CTA` | Consider dedicated `Product` entries later |
| `/team` | Placeholder paragraph | Future collaborator bios | Add `team` Page even if minimal now; use `HERO` + `TEXT`. Later extend with `FEATURES` for bios | `HERO`, `TEXT`, optional `IMAGE` | Could source team profiles from new table |
| `/portfolio` | Redirects to `/rituelen` | No standalone content | Keep redirect; no Page entry needed until portfolio archive exists | n/a | Document reasoning |
| `/ventures` | Redirect to `/rituelen` | Legacy route | Keep redirect; optionally add slug alias in DB for analytics continuity | n/a | |
| `/algemene-voorwaarden`, `/privacy`, `/cookiebeleid` | Single paragraph placeholders | Need legally approved content | Create dedicated `Page` entries with multi-block `TEXT` sections per chapter; optionally use `FEATURES` for bullet clauses | `TEXT` (per heading) | Allow markdown-like formatting inside `PageSection.data.body` |
| `/academy/*` detail pages | Not implemented yet | Future expansion | When ready, add slug-specific CMS entries under `[slug]` dynamic route | All existing section types | Document slug naming scheme |

**Migration Steps**
1. Create initial CMS seed entries for highlighted slugs (home, about, contact, rituelen, academy, legal set).
2. Update navigation seeds so links point to slug entries resolved through `PageRenderer` (ensures preview compatibility).
3. Remove inline fallback markup once data parity is confirmed (feature flag per route to avoid regressions).
4. Add regression Playwright test that loads each slug with `?preview=1` to verify sections render.

## 2. Responsive Component Checklist (Apply Across Marketing Pages)
- **Spacing Scale**: Use Tailwind spacing tokens in multiples of 4 (e.g., `pt-12`, `gap-6`); enforce `container` max widths per breakpoint (sm: 100%, md: 640px, lg: 768px+, xl: 960px). Avoid ad-hoc pixels.
- **Typography Clamp**: Adopt `clamp()` in CSS variables for headings (`text-4xl md:text-5xl` → `clamp(2.25rem, 3vw + 1rem, 3.25rem)`) to prevent jumps; paragraph text limited to 65ch max width.
- **Breakpoints**: Standardize at `sm (640)`, `md (768)`, `lg (1024)`, `xl (1280)`. Every grid/list needs explicit mobile-first stack, `md:grid-cols-2/3` for cards, and `lg:` for complex layouts (e.g., contact layout `lg:grid-cols-[1.1fr_0.9fr]`).
- **Imagery**: Serve responsive images via `next/image` with `sizes` attribute (`(min-width: 1024px) 50vw, 100vw`). Use storage variant generator to keep hero art <1MB; apply `loading="lazy"` for below-the-fold `IMAGE` sections.
- **Components to Audit**: `Hero`, `Section`, `RitualCard`, `Card`, `ContactForm`, navigation header, footer. Ensure each respects CSS custom properties from `BrandProvider` and supports dark mode tokens already defined.
- **Interaction Targets**: Minimum 44px tappable area; apply `focus-visible` outline class and consistent hover transitions (`transition-colors duration-200 ease-out`).
- **Performance Hooks**: Avoid layout shift by reserving image aspect ratios, preloading hero fonts, and keeping above-the-fold JS minimal (PageRenderer already streams server markup).

**Application Plan**
1. Codify checklist in `docs/ui-guidelines.md` and link from PR template.
2. Update shared components (`Hero`, `Section`, navigation) to match spacing/typography rules; propagate via marketing pages by swapping to those components exclusively.
3. Add Storybook or Chromatic viewport tests (or simple Playwright screenshots) for `/`, `/contact`, `/academy` at 375px, 768px, 1280px to enforce compliance.

## 3. Usability Validation Plan (Post-CMS Migration)
- **Goal**: Confirm site owner can edit every marketing surface through `/admin/pages` without developer help and that published changes render responsively.
- **Participants**: Primary owner (Iris) + 1 backup editor; observer from dev team to capture friction.
- **Environments**: Staging environment with brand headers + seeded content; enable preview mode + audit logging to verify actions.
- **Scenarios**:
  1. Update hero copy + CTA on Home (`home` slug) and verify preview → publish workflow.
  2. Add new Academy card (FEATURE entry) and confirm it reflects in `/academy` grid.
  3. Edit legal text block (`privacy`) and ensure formatting persists (paragraph breaks, bold text if supported).
  4. Reorder sections on `/contact` to move CTA above form; confirm front-end order updates.
  5. Publish FAQ entry edits and inspect structured data (schema snippet) via browser devtools.
- **Success Metrics**: Task completion without developer intervention, time-to-complete <5 minutes per task, zero validation errors, audit log entries capturing field changes.
- **Instrumentation**: Enable temporary console logging in admin to capture Zod validation errors; capture screenshots/recording for regression documentation.
- **Follow-up**: Triage friction points into backlog (e.g., missing preview toggles, unclear field naming). Schedule re-run after fixes.
