# CMS Implementation - Technical Documentation

## Overview

This document describes the sustainable CMS implementation that allows the business owner to edit all website text content through an admin interface.

## Architecture

### Database Schema

**Models:**
- `Page` - Represents a web page (slug, title, description, published status)
- `PageSection` - Individual content sections within a page (type, order, data JSON)

**Section Types (Enum):**
```typescript
enum PageSectionType {
  HERO          // Large banner with title, subtitle, CTA
  TEXT          // Simple text block
  FEATURES      // Bullet point list
  CTA           // Call-to-action with button
  NEWSLETTER    // Newsletter signup form
  IMAGE         // Image display
  VENTURES      // Dynamic ritual/treatment grid
  CONTACT_INFO  // Structured contact information
}
```

### File Structure

```
app/
├── admin/pages/
│   ├── page.tsx                    # Pages list view
│   └── [slug]/page.tsx             # Page editor with section management
├── components/
│   └── PageRenderer.tsx            # Renders sections based on type
├── contact/page.tsx                # Contact page (CMS-enabled)
├── rituelen/page.tsx               # Rituals page (CMS-enabled)
├── about/page.tsx                  # About page (CMS-enabled)
└── page.tsx                        # Home page (CMS-enabled)

lib/
└── pages.ts                        # Page/section data access functions

prisma/
├── schema.prisma                   # Database schema with Page & PageSection
└── seed.js                         # Seeds all pages with initial content

docs/
├── CMS-GUIDE.md                    # User guide for content editing
└── CMS-IMPLEMENTATION.md           # This file
```

## Key Components

### 1. PageRenderer Component

**Location:** `app/components/PageRenderer.tsx`

**Purpose:** Renders an array of sections based on their type

**Features:**
- Switch statement handles each section type
- Extracts data from JSON fields
- Renders appropriate UI for each type
- Client-side component for dynamic data (VENTURES)

**Usage:**
```tsx
<PageRenderer sections={page.sections} />
```

### 2. Page Editor

**Location:** `app/admin/pages/[slug]/page.tsx`

**Features:**
- Edit page metadata (title, description, published)
- Add/remove/reorder sections
- Section-specific form fields
- Real-time preview
- Save button with error handling

**Section Editor Sub-component:**
- Type selector dropdown
- Dynamic form fields based on type
- Move up/down buttons
- Delete button

### 3. API Routes

**Location:** `app/api/pages/`

**Endpoints:**
- `GET /api/pages` - List all pages for current brand
- `POST /api/pages` - Create new page
- `GET /api/pages/[slug]` - Get page with sections
- `PATCH /api/pages/[slug]` - Update page and sections

**Features:**
- Authentication required (ADMIN/EDITOR roles)
- Rate limiting
- Brand-scoped queries
- Full section replacement on update
- Audit logging

## Implementation Details

### Adding a New Section Type

1. **Update Prisma Schema:**
```prisma
enum PageSectionType {
  // ... existing types
  NEW_TYPE
}
```

2. **Run Migration:**
```bash
npx prisma migrate dev --name add_new_section_type
npx prisma generate
```

3. **Update PageRenderer:**
```tsx
case 'NEW_TYPE': {
  const t = s.data || {};
  return (
    <section key={s.id}>
      {/* Render logic here */}
    </section>
  );
}
```

4. **Update Section Editor:**
```tsx
<option value="NEW_TYPE">New Type Label</option>

// ... later in the component
{local.type === 'NEW_TYPE' && (
  <div className="grid gap-2">
    {/* Form fields here */}
  </div>
)}
```

5. **Update TypeScript Types:**
```typescript
// lib/pages.ts
export type PageSectionType = '...' | 'NEW_TYPE';

// admin/pages/[slug]/page.tsx
interface Section { 
  type: '...'|'NEW_TYPE'; 
  // ...
}
```

### Section Data Structures

Each section type stores its data in a JSON field. Here are the expected structures:

```typescript
// HERO
{
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

// TEXT
{
  title?: string;
  body: string;
}

// FEATURES
{
  title?: string;
  items: string[];
}

// CTA
{
  title: string;
  body?: string;
  buttonLabel: string;
  buttonHref: string;
}

// NEWSLETTER
{
  title?: string;
  body?: string;
}

// IMAGE
{
  url: string;
  alt: string;
}

// VENTURES
{
  title?: string;
  limit?: number;  // defaults to 3
}

// CONTACT_INFO
{
  businessName: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapsLink?: string;
  extraNoteTitle?: string;
  extraNote?: string;
}
```

## Sustainability Features

### 1. Database-Driven Content
All text is stored in the database, making it:
- Version controllable (via migrations)
- Exportable/importable
- Searchable
- Auditable

### 2. Graceful Fallbacks
Every page checks for CMS content first, then falls back to hardcoded defaults if:
- Page doesn't exist
- Page is unpublished
- No sections exist

### 3. Type Safety
- Prisma schema enforces section types
- TypeScript types for data structures
- Runtime validation on API endpoints

### 4. User-Friendly Interface
- Simple form fields for each section type
- Clear labels and placeholders
- Immediate feedback on save
- Preview functionality

### 5. Separation of Concerns
- Content (database) separated from presentation (components)
- Section types are extensible
- Pages can be added without code changes

## Setup Instructions

### Initial Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Run migrations:**
```bash
npx prisma migrate dev
```

3. **Generate Prisma client:**
```bash
npx prisma generate
```

4. **Seed database:**
```bash
npm run prisma:seed
```

5. **Start server:**
```bash
npm run dev
```

### Quick Setup (Batch Script)

Run the provided batch script:
```bash
setup-cms.bat
```

This automates steps 2-4 above.

## Seeded Content

The seed script (`prisma/seed.js`) creates:

**Pages:**
- Home page with hero, philosophy, rituals showcase
- About page with company info and testimonials
- Contact page with intro text and contact info
- Rituelen page with intro text
- Academy page with professional training info
- Gantke Fascia detail page
- Gezichtsbehandelingen detail page
- Fascia Behandelaar professional page

**Other Data:**
- Brand (Iris Kooij Wellness)
- Navigation links
- 4 sample Ventures/Rituals
- Admin user (admin@iris.local / admin123)

## Common Customizations

### Adding a New Page

**Via Admin UI:**
1. Login to /admin
2. Go to "Pagina's"
3. Click "Nieuwe pagina"
4. Edit the new page
5. Add sections
6. Publish

**Via Seed Script:**
```javascript
let myPage = await prisma.page.findFirst({ 
  where: { brandId: brand.id, slug: 'my-page' } 
});
if (!myPage) {
  myPage = await prisma.page.create({
    data: {
      brandId: brand.id,
      slug: 'my-page',
      title: 'My Page',
      description: 'Description for SEO',
      published: true
    }
  });
  await prisma.pageSection.createMany({
    data: [
      {
        pageId: myPage.id,
        order: 0,
        type: 'HERO',
        data: {
          title: 'Welcome',
          subtitle: 'This is my page'
        }
      }
    ]
  });
}
```

### Changing Section Order

Sections are ordered by the `order` field. In the admin UI, use the "Omhoog" and "Omlaag" buttons. Programmatically:

```javascript
await prisma.pageSection.updateMany({
  where: { pageId: 'page-id' },
  data: { order: newOrder }
});
```

### Bulk Content Updates

For major content changes, consider:
1. Exporting current content
2. Updating via script
3. Re-seeding with new content

Or use the API endpoints directly with admin credentials.

## Testing

### Manual Testing Checklist

- [ ] Can create a new page
- [ ] Can edit page metadata
- [ ] Can add each section type
- [ ] Can reorder sections
- [ ] Can delete sections
- [ ] Can save changes
- [ ] Can preview changes
- [ ] Can publish/unpublish pages
- [ ] Frontend displays CMS content correctly
- [ ] Fallbacks work when no CMS content exists

### Automated Testing

Consider adding tests for:
- API endpoints (create, read, update)
- PageRenderer rendering logic
- Section data validation
- Permission checks (ADMIN/EDITOR only)

## Performance Considerations

### Caching
- API routes include Cache-Control headers
- Static pages can be cached by CDN
- Consider Redis for frequently accessed pages

### Database Queries
- Sections are eager-loaded with pages
- Brand-scoped queries prevent cross-contamination
- Indexes on pageId and order for fast section retrieval

### Optimization Tips
1. Limit number of sections per page (recommend < 20)
2. Optimize images before adding to IMAGE sections
3. Use CDN for media assets
4. Consider pagination for pages list if > 50 pages

## Security

### Authentication
- NextAuth handles session management
- Only ADMIN and EDITOR roles can edit
- Session validated on every API request

### Input Validation
- Zod schemas validate input structure
- XSS protection via React's default escaping
- SQL injection prevented by Prisma ORM

### Rate Limiting
- API endpoints are rate-limited
- Prevents abuse and DoS attacks
- Configurable limits in lib/rateLimit.ts

## Deployment

### Environment Variables

Required:
```env
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3100
```

### Production Checklist

- [ ] Change admin password
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Enable HTTPS
- [ ] Configure proper CORS
- [ ] Set up database backups
- [ ] Configure CDN for assets
- [ ] Enable production error tracking

### Migration to PostgreSQL

1. Update DATABASE_URL to PostgreSQL connection string
2. Change schema.prisma provider to "postgresql"
3. Run migrations: `npx prisma migrate deploy`
4. Seed content: `npm run prisma:seed`

## Troubleshooting

### "Schema does not match database"
Run: `npx prisma migrate reset` (WARNING: deletes data) or `npx prisma migrate dev`

### "Prisma Client not found"
Run: `npx prisma generate`

### Changes not saving
- Check browser console for errors
- Verify authentication
- Check API rate limits
- Inspect network tab for 401/403 errors

### Sections not rendering
- Check PageRenderer switch statement includes the type
- Verify section data structure matches expected format
- Look for console errors in browser

## Future Enhancements

### Potential Additions
1. **Media Library** - Built-in image upload and management
2. **Versioning** - Track content changes over time
3. **Preview Mode** - See changes before publishing
4. **Scheduled Publishing** - Set future publish dates
5. **Multi-language** - Support for translations
6. **Templates** - Pre-built page templates
7. **Drag-and-Drop** - Visual page builder
8. **Rich Text Editor** - WYSIWYG for text sections

### Architecture Evolution
- Consider headless CMS (Strapi, Contentful) for larger projects
- Move to GraphQL for more flexible queries
- Add real-time collaboration features
- Implement content approval workflows

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and rotate admin passwords quarterly
- Backup database weekly
- Monitor API usage and rate limits
- Review audit logs for unusual activity

### Content Governance
- Establish content review process
- Document brand voice and style guidelines
- Train content editors on CMS usage
- Set up content calendar for updates

---

## Summary

This CMS implementation provides a sustainable, user-friendly system for managing all website text content. It balances simplicity with extensibility, allowing non-technical users to update content while giving developers clear patterns for adding new features.

**Key Benefits:**
✅ All text editable without code changes
✅ Type-safe with database constraints
✅ Graceful fallbacks for reliability
✅ Extensible section types
✅ Admin UI for easy management
✅ Comprehensive documentation
✅ Production-ready with security best practices

For questions or support, refer to the CMS-GUIDE.md for user-facing documentation or contact your development team.

---

*Last updated: November 2024*
*Version: 2.0*
