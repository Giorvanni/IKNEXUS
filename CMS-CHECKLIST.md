# CMS Implementation Checklist

## Pre-Setup Verification

- [ ] Node.js is installed (v16 or higher)
- [ ] npm is available in command line
- [ ] Project dependencies are installed (`npm install`)
- [ ] `.env` file exists with required variables

## Setup Steps

### 1. Database Setup
- [ ] Run `npx prisma generate` successfully
- [ ] Run `npx prisma migrate dev` successfully
- [ ] Database file created at `prisma/dev.db`
- [ ] Run `npm run prisma:seed` successfully
- [ ] Seed completes without errors

### 2. Server Start
- [ ] Run `npm run dev` successfully
- [ ] Server starts on port 3100
- [ ] No compilation errors in console
- [ ] Frontend loads at http://localhost:3100

## Admin Interface Testing

### 3. Login
- [ ] Navigate to http://localhost:3100/admin
- [ ] Login form displays
- [ ] Can login with `admin@iris.local` / `admin123`
- [ ] Redirects to admin dashboard after login

### 4. Pages List
- [ ] Can access `/admin/pages`
- [ ] See list of seeded pages (Home, About, Contact, etc.)
- [ ] Each page shows title, slug, published status
- [ ] "Bewerken" and "Bekijken" buttons present
- [ ] "Nieuwe pagina" button works

### 5. Page Editor - Basic Functions
- [ ] Click "Bewerken" on Home page
- [ ] Page editor loads without errors
- [ ] See page title, description, published checkbox
- [ ] See list of existing sections
- [ ] Each section shows correct type and data

### 6. Edit Existing Content
- [ ] Change a section's text content
- [ ] Click "Opslaan" button
- [ ] Success message or page reloads
- [ ] Changes are saved (visible after refresh)
- [ ] Click "Bekijken" to preview
- [ ] Changes appear on frontend

### 7. Section Management
- [ ] Click "Sectie toevoegen" button
- [ ] New section appears at bottom
- [ ] Can change section type via dropdown
- [ ] Fields update based on section type
- [ ] Can fill in all fields
- [ ] Click "Opslaan" to save new section

### 8. Section Ordering
- [ ] Click "Omhoog" on a section
- [ ] Section moves up in list
- [ ] Click "Omlaag" on a section
- [ ] Section moves down in list
- [ ] Click "Opslaan" to save order
- [ ] Order persists after page refresh

### 9. Section Deletion
- [ ] Click "Verwijderen" on a section
- [ ] Section is removed from list
- [ ] Click "Opslaan"
- [ ] Section stays deleted after refresh

## Section Types Testing

### 10. HERO Section
- [ ] Select "Hero" section type
- [ ] See fields: Titel, Subtitel, CTA Label, CTA Link
- [ ] Fill in all fields
- [ ] Save and preview
- [ ] Hero renders correctly on frontend
- [ ] Button links to correct URL

### 11. TEXT Section
- [ ] Select "Tekst" section type
- [ ] See fields: Sectietitel (optional), Tekst
- [ ] Fill in text content
- [ ] Save and preview
- [ ] Text renders with proper formatting

### 12. FEATURES Section
- [ ] Select "Kernpunten" section type
- [ ] See fields: Sectietitel, Items (one per line)
- [ ] Add multiple bullet points
- [ ] Save and preview
- [ ] Items render as list

### 13. CTA Section
- [ ] Select "Call to Action" section type
- [ ] See fields: Titel, Tekst, Knop Label, Knop Link
- [ ] Fill in all fields
- [ ] Save and preview
- [ ] Button renders and links correctly

### 14. NEWSLETTER Section
- [ ] Select "Nieuwsbrief" section type
- [ ] See fields: Titel, Intro
- [ ] Fill in fields
- [ ] Save and preview
- [ ] Newsletter form appears

### 15. IMAGE Section
- [ ] Select "Afbeelding" section type
- [ ] See fields: Afbeeldings-URL, Alt-tekst
- [ ] Add image URL and alt text
- [ ] Save and preview
- [ ] Image displays correctly

### 16. VENTURES Section
- [ ] Select "Rituelen overzicht" section type
- [ ] See fields: Sectietitel, Aantal rituelen
- [ ] Set limit (e.g., 3)
- [ ] Save and preview
- [ ] Correct number of rituals display
- [ ] Rituals grid renders properly

### 17. CONTACT_INFO Section (NEW)
- [ ] Select "Contactinformatie" section type
- [ ] See all contact fields (business name, address, phone, etc.)
- [ ] Fill in contact details
- [ ] Use line breaks in address and hours
- [ ] Add optional fields (maps link, extra note)
- [ ] Save and preview
- [ ] Contact info renders in sidebar
- [ ] Phone and email are clickable links
- [ ] Maps link opens in new tab

## Frontend Page Testing

### 18. Home Page
- [ ] Visit http://localhost:3100
- [ ] CMS content displays (no fallback)
- [ ] Hero section visible
- [ ] Multiple sections render in order
- [ ] Rituals grid shows treatments
- [ ] All buttons work
- [ ] Mobile responsive

### 19. About Page
- [ ] Visit http://localhost:3100/about
- [ ] CMS content displays
- [ ] Text sections render properly
- [ ] Features list displays
- [ ] No console errors

### 20. Contact Page
- [ ] Visit http://localhost:3100/contact
- [ ] CMS intro text displays
- [ ] Contact form is visible
- [ ] CONTACT_INFO section renders in sidebar
- [ ] Address formatting correct (line breaks)
- [ ] Phone and email links work
- [ ] Maps link opens Google Maps
- [ ] Extra note displays if set

### 21. Rituelen Page
- [ ] Visit http://localhost:3100/rituelen
- [ ] CMS intro text displays
- [ ] All rituals listed below
- [ ] Ritual cards render properly
- [ ] Links to detail pages work

### 22. Academy Page
- [ ] Visit http://localhost:3100/academy
- [ ] CMS content displays
- [ ] All sections render
- [ ] CTAs and buttons work

## Edge Cases & Error Handling

### 23. Empty Sections
- [ ] Create section with empty fields
- [ ] Save (should work)
- [ ] Preview shows section (possibly empty)
- [ ] No crashes or errors

### 24. Unpublished Pages
- [ ] Edit a page
- [ ] Uncheck "Gepubliceerd"
- [ ] Save
- [ ] Visit page URL
- [ ] Fallback content shows (or 404)

### 25. Invalid Data
- [ ] Try saving with invalid URLs
- [ ] Try very long text content
- [ ] Try special characters (quotes, accents)
- [ ] All should save and display correctly

### 26. Session Timeout
- [ ] Wait for session to expire
- [ ] Try to edit a page
- [ ] Should redirect to login
- [ ] After login, can continue editing

### 27. Concurrent Edits
- [ ] Open page editor in two browser tabs
- [ ] Edit in both tabs
- [ ] Save in first tab
- [ ] Save in second tab
- [ ] Last save wins (expected behavior)

## Performance Testing

### 28. Page Load Times
- [ ] Frontend pages load in < 2 seconds
- [ ] Admin pages load in < 2 seconds
- [ ] No excessive database queries (check logs)

### 29. Large Content
- [ ] Create page with 15+ sections
- [ ] Editor still responsive
- [ ] Save completes quickly
- [ ] Frontend renders without lag

## Mobile Testing

### 30. Mobile Frontend
- [ ] Open frontend on mobile device/emulator
- [ ] All pages are responsive
- [ ] Touch targets are large enough
- [ ] Text is readable
- [ ] Images scale properly

### 31. Mobile Admin
- [ ] Open admin on mobile device
- [ ] Can login
- [ ] Can view pages list
- [ ] Can edit sections (may be cramped but functional)
- [ ] Save button accessible

## Documentation Testing

### 32. User Guide
- [ ] Open `docs/CMS-GUIDE.md`
- [ ] Instructions are clear
- [ ] Examples match actual interface
- [ ] All section types documented
- [ ] Common tasks have step-by-step guides

### 33. Technical Documentation
- [ ] Open `docs/CMS-IMPLEMENTATION.md`
- [ ] Architecture is clear
- [ ] Code examples are correct
- [ ] File paths are accurate
- [ ] Setup instructions work

### 34. Setup Instructions
- [ ] Open `SETUP-INSTRUCTIONS.md`
- [ ] Commands are correct
- [ ] Quick start works
- [ ] Verification checklist is accurate
- [ ] Troubleshooting is helpful

## Security Testing

### 35. Authentication
- [ ] Cannot access `/admin` without login
- [ ] Logout works
- [ ] Session persists across page loads
- [ ] Invalid credentials rejected

### 36. Authorization
- [ ] Only ADMIN/EDITOR can edit pages
- [ ] API returns 401 when not authenticated
- [ ] API returns 403 for insufficient permissions

### 37. Input Validation
- [ ] Cannot inject HTML/scripts in text fields
- [ ] Special characters are escaped properly
- [ ] API validates data structure
- [ ] Invalid data returns error (not crash)

## Browser Compatibility

### 38. Chrome
- [ ] Frontend works
- [ ] Admin works
- [ ] No console errors

### 39. Firefox
- [ ] Frontend works
- [ ] Admin works
- [ ] No console errors

### 40. Safari
- [ ] Frontend works
- [ ] Admin works
- [ ] No console errors

### 41. Edge
- [ ] Frontend works
- [ ] Admin works
- [ ] No console errors

## Final Verification

### 42. Complete Workflow
- [ ] Login to admin
- [ ] Create a new page from scratch
- [ ] Add 5 different section types
- [ ] Reorder sections
- [ ] Save and preview
- [ ] Publish page
- [ ] Visit page URL on frontend
- [ ] All content displays correctly

### 43. Owner Handoff
- [ ] Admin credentials documented
- [ ] User guide shared
- [ ] Demo provided (if possible)
- [ ] Owner can login and edit
- [ ] Owner understands basic workflow

## Post-Setup

### 44. Backup
- [ ] Database backup created
- [ ] Backup location documented
- [ ] Restore procedure tested

### 45. Monitoring
- [ ] Error tracking enabled (if applicable)
- [ ] Logs are accessible
- [ ] Performance metrics available

## Sign-Off

### Implementation Team
- [ ] All changes reviewed
- [ ] Code committed to repository
- [ ] Documentation complete
- [ ] Testing complete

### Business Owner
- [ ] Can login to admin
- [ ] Can edit content
- [ ] Understands basic workflow
- [ ] Has access to documentation
- [ ] Knows who to contact for support

---

## Notes

Use this space to document any issues found during testing:

```
Issue: [Description]
Status: [Fixed / Known Issue / Won't Fix]
Resolution: [How it was resolved]

Example:
Issue: Contact info sidebar not showing on mobile
Status: Fixed
Resolution: Added responsive grid layout in contact page
```

---

## Testing Summary

**Total Checks:** 45 categories  
**Completed:** ___/45  
**Issues Found:** ___  
**Critical Issues:** ___  
**Non-Critical Issues:** ___  

**Tested By:** _______________  
**Date:** _______________  
**Environment:** Development / Production  
**Browser(s):** _______________  

**Sign-off:** _______________  

---

## Success Criteria

✅ All critical sections completed (1-22)  
✅ No critical errors or crashes  
✅ Owner can edit content successfully  
✅ Documentation is accurate and complete  
✅ Ready for production deployment  

---

*Use this checklist to verify the CMS implementation is complete and working correctly.*
*Check off each item as you test it. Document any issues in the Notes section.*
