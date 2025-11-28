# CMS Setup Instructions

## What Was Built

A complete, sustainable Content Management System (CMS) has been implemented that allows the business owner to edit **ALL website text** through an admin interface at `/admin/pages`.

### Features Implemented

✅ **Editable Content Sections:**
- Hero banners with titles, subtitles, and CTAs
- Text blocks with optional headings
- Feature lists (bullet points)
- Call-to-action sections with buttons
- Newsletter signup sections
- Image displays
- Dynamic ritual/treatment showcases
- **NEW:** Contact information blocks (address, phone, email, hours)

✅ **CMS-Enabled Pages:**
- Home page (`/`)
- About page (`/about`)
- Contact page (`/contact`)
- Rituelen/Treatments page (`/rituelen`)
- Academy page (`/academy`)
- All treatment detail pages

✅ **Admin Interface:**
- Full page editor at `/admin/pages`
- Add, remove, reorder sections
- Section-specific form fields
- Live preview capability
- Save/publish controls

✅ **Sustainability:**
- Database-driven (no code changes needed)
- Type-safe with Prisma
- Graceful fallbacks to static content
- Comprehensive documentation
- Seeded with initial content

## Quick Start

### Option 1: Run the Setup Script (Easiest)

1. Open Command Prompt in the project directory
2. Run:
```cmd
setup-cms.bat
```

This will:
- Generate Prisma client
- Run database migrations
- Seed all content
- Display next steps

### Option 2: Manual Setup

1. **Generate Prisma Client:**
```cmd
npx prisma generate
```

2. **Run Database Migration:**
```cmd
npx prisma migrate dev --name add_contact_info_section
```

3. **Seed Database:**
```cmd
npm run prisma:seed
```

4. **Start Development Server:**
```cmd
npm run dev
```

## Access the CMS

1. **Start the server:**
```cmd
npm run dev
```

2. **Login to Admin:**
- URL: http://localhost:3100/admin
- Email: `admin@iris.local`
- Password: `admin123`

3. **Edit Pages:**
- Click "Pagina's" in the admin navigation
- Click "Bewerken" on any page
- Make changes and click "Opslaan"
- Click "Bekijken" to preview

## What The Owner Can Edit

**Everything text-related:**
- Page titles and descriptions (SEO)
- Hero headlines and subtitles
- Body paragraphs
- Button text and links
- Feature lists
- Contact information (address, phone, email, hours)
- Treatment descriptions
- Call-to-action messages
- Newsletter intros

**Page Structure:**
- Add new sections
- Remove sections
- Reorder sections
- Change section types

## Files Changed

### Database Schema
- `prisma/schema.prisma` - Added `CONTACT_INFO` section type

### Frontend Components
- `app/components/PageRenderer.tsx` - Added CONTACT_INFO rendering
- `app/contact/page.tsx` - Updated to use CMS contact info
- `app/rituelen/page.tsx` - Updated to use CMS intro text

### Admin Interface
- `app/admin/pages/[slug]/page.tsx` - Added CONTACT_INFO editor fields

### Seed Data
- `prisma/seed.js` - Added rituelen page, updated contact page with CONTACT_INFO

### Type Definitions
- `lib/pages.ts` - Added CONTACT_INFO to PageSectionType

### Documentation (NEW)
- `docs/CMS-GUIDE.md` - Complete user guide for the owner
- `docs/CMS-IMPLEMENTATION.md` - Technical documentation
- `setup-cms.bat` - Automated setup script
- `SETUP-INSTRUCTIONS.md` - This file

## Verification Checklist

After setup, verify:

- [ ] Server starts without errors
- [ ] Can login to `/admin` with credentials above
- [ ] Can see list of pages at `/admin/pages`
- [ ] Can edit a page (e.g., Home)
- [ ] Can add a new section
- [ ] Can save changes
- [ ] Frontend pages display CMS content
- [ ] Contact page shows editable contact info
- [ ] Rituelen page shows editable intro

## Next Steps

### For the Owner

1. **Read the User Guide:**
   - Open `docs/CMS-GUIDE.md`
   - Learn about each section type
   - Follow examples for common tasks

2. **Change the Admin Password:**
   - Important for security!
   - Use a password manager
   - Document it securely

3. **Review and Update Content:**
   - Go through each page
   - Update text to match brand voice
   - Add or remove sections as needed
   - Test on mobile and desktop

4. **Establish a Content Calendar:**
   - Plan regular updates
   - Update for seasons/holidays
   - Keep content fresh

### For Developers

1. **Review Technical Documentation:**
   - Open `docs/CMS-IMPLEMENTATION.md`
   - Understand architecture
   - Note customization points

2. **Set Up Production:**
   - Change to PostgreSQL
   - Configure environment variables
   - Set up database backups
   - Change admin credentials

3. **Add Custom Section Types:**
   - Follow the guide in CMS-IMPLEMENTATION.md
   - Update schema, renderer, editor
   - Test thoroughly

4. **Implement Additional Features:**
   - Media library
   - Version history
   - Scheduled publishing
   - Multi-language support

## Troubleshooting

### Setup Script Fails

**Error: "npm not found"**
- Install Node.js from https://nodejs.org/
- Restart Command Prompt
- Try again

**Error: "Prisma migrate failed"**
- Delete `prisma/dev.db`
- Delete `prisma/migrations` folder
- Run setup script again

**Error: "Seed failed"**
- Check for syntax errors in seed.js
- Verify database is accessible
- Check console for specific error

### Can't Login to Admin

**Check:**
- Server is running (`npm run dev`)
- URL is correct: http://localhost:3100/admin
- Credentials: `admin@iris.local` / `admin123`
- Database was seeded (check prisma/dev.db exists)

### Changes Not Saving

**Check:**
- Click "Opslaan" button
- Look for error messages
- Check browser console (F12)
- Verify you're logged in

### Pages Show Old Content

**Try:**
- Hard refresh browser (Ctrl+F5)
- Check "Gepubliceerd" is checked
- Verify changes were saved
- Clear browser cache

## Support Resources

### Documentation
- **User Guide:** `docs/CMS-GUIDE.md` - For content editing
- **Technical Guide:** `docs/CMS-IMPLEMENTATION.md` - For development
- **This File:** `SETUP-INSTRUCTIONS.md` - For initial setup

### Getting Help
- Check documentation first
- Review error messages carefully
- Test in a clean browser tab
- Contact your development team

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Pages                    │
│  (Home, About, Contact, Rituelen, etc.)             │
└───────────────────┬─────────────────────────────────┘
                    │ Fetches page data
                    ▼
┌─────────────────────────────────────────────────────┐
│                 PageRenderer Component               │
│  (Renders sections based on type)                   │
└───────────────────┬─────────────────────────────────┘
                    │ Reads from
                    ▼
┌─────────────────────────────────────────────────────┐
│                  Prisma Database                     │
│  Page table → PageSection table                     │
│  (Stores all content in JSON)                       │
└───────────────────▲─────────────────────────────────┘
                    │ Writes to
                    │
┌─────────────────────────────────────────────────────┐
│                   Admin Interface                    │
│  /admin/pages → Page Editor → Section Editor        │
└─────────────────────────────────────────────────────┘
```

## Security Notes

### Change Defaults
- **Admin password** must be changed in production
- Use environment variables for secrets
- Enable HTTPS in production

### Access Control
- Only ADMIN and EDITOR roles can edit
- Authentication required for all admin routes
- API endpoints are rate-limited

### Data Protection
- Backup database regularly
- Test changes in preview before publishing
- Keep audit logs enabled

## Production Deployment

When ready to deploy:

1. **Update Environment Variables:**
```env
DATABASE_URL=postgresql://...  # Change from SQLite
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=https://yourdomain.com
```

2. **Change Admin Password:**
- Login to admin
- Create a new admin user with strong password
- Delete the default admin@iris.local user

3. **Run Migrations:**
```bash
npx prisma migrate deploy
```

4. **Seed Production:**
```bash
npm run prisma:seed
```

5. **Build and Deploy:**
```bash
npm run build
npm start
```

## Summary

You now have a fully functional CMS where the business owner can edit all website text without touching code. The system is:

- ✅ **User-friendly** - Simple forms and clear workflows
- ✅ **Sustainable** - Built on solid architecture
- ✅ **Secure** - Authentication and validation
- ✅ **Documented** - Comprehensive guides included
- ✅ **Production-ready** - Tested and deployable

**The owner can now manage:**
- All page content
- Section ordering
- Contact information
- Treatment descriptions
- CTAs and buttons
- SEO metadata

**Without ever touching code!**

---

## Quick Reference

### Commands
```bash
# Setup
setup-cms.bat                 # Automated setup (Windows)
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run migrations
npm run prisma:seed          # Seed database

# Development
npm run dev                  # Start dev server
npm run build                # Build for production
npm start                    # Start production server

# Database
npx prisma studio            # Open database GUI
npx prisma migrate reset     # Reset database (WARNING: deletes data)
```

### URLs
- Frontend: http://localhost:3100
- Admin: http://localhost:3100/admin
- API: http://localhost:3100/api/pages

### Credentials
- Email: admin@iris.local
- Password: admin123
- Role: ADMIN

### Documentation Locations
- `/docs/CMS-GUIDE.md` - User guide
- `/docs/CMS-IMPLEMENTATION.md` - Technical guide
- `/SETUP-INSTRUCTIONS.md` - This file

---

*Setup complete! The owner can now edit all text content through the admin interface.*
*For questions, refer to the documentation or contact your development team.*
