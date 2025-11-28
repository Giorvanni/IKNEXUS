# CMS Content Management Guide

## Overview

This project now has a complete Content Management System (CMS) that allows the website owner to edit **all text content** without touching code. Every heading, paragraph, button, and contact detail can be managed through the admin interface.

## Getting Started

### 1. Access the Admin Panel

1. Start the development server: `npm run dev`
2. Visit: http://localhost:3100/admin
3. Login with:
   - Email: `admin@iris.local`
   - Password: `admin123`

### 2. Navigate to Pages

Click on **"Pagina's"** in the admin navigation to see all editable pages.

## Available Pages

All marketing pages are now CMS-driven:

- **Home** (`/`) - Homepage with hero, philosophy, rituelen showcase
- **About** (`/about`) - Company background and testimonials
- **Contact** (`/contact`) - Contact form intro and contact information
- **Rituelen** (`/rituelen`) - Treatments overview intro text
- **Academy** (`/academy`) - Professional training programs
- **Gantke Fascia** (`/gantke-fascia`) - Specific treatment details
- **Gezichtsbehandelingen** (`/gezichtsbehandelingen`) - Facial treatments
- **Fascia Behandelaar** (`/fascia-behandelaar`) - Professional certifications

## Section Types Explained

Each page is built from **sections**. Think of sections as building blocks that you can add, remove, reorder, and edit.

### 1. HERO Section
**Purpose:** Large banner at the top of a page

**Fields:**
- **Titel** - Main heading (large, prominent)
- **Subtitel** - Supporting text below the title
- **CTA Label** - Button text (e.g., "Maak nu een afspraak")
- **CTA Link** - Where the button goes (e.g., `/contact`)

**Example use:** Homepage banner, service page headers

### 2. TEXT Section
**Purpose:** Simple text content with optional title

**Fields:**
- **Sectietitel** (optional) - Heading for this text block
- **Tekst** - Main paragraph content

**Example use:** Explanatory paragraphs, descriptions, stories

### 3. FEATURES Section
**Purpose:** List of bullet points or key features

**Fields:**
- **Sectietitel** (optional) - Heading above the list
- **Items** - One feature per line

**Example use:** Service benefits, company values, training highlights

### 4. CTA (Call to Action) Section
**Purpose:** Encourage visitors to take action

**Fields:**
- **Titel** - Heading
- **Tekst** (optional) - Supporting text
- **Knop Label** - Button text
- **Knop Link** - Button destination

**Example use:** "Book now" prompts, newsletter signups, learn more buttons

### 5. NEWSLETTER Section
**Purpose:** Newsletter signup form with intro text

**Fields:**
- **Titel** (optional) - Section heading
- **Intro** (optional) - Text above the form

**Example use:** Bottom of homepage, end of blog posts

### 6. IMAGE Section
**Purpose:** Display an image

**Fields:**
- **Afbeeldings-URL** - Image location
- **Alt-tekst** - Description for accessibility

**Example use:** Treatment photos, studio images, team photos

### 7. VENTURES Section
**Purpose:** Display ritual/treatment cards from the database

**Fields:**
- **Sectietitel** - Heading (e.g., "Onze Rituelen")
- **Aantal rituelen** - How many to show (1-12)

**Example use:** Showcase services, treatment overview

### 8. CONTACT_INFO Section
**Purpose:** Structured contact information block

**Fields:**
- **Bedrijfsnaam** - Business name
- **Adres** - Full address (use Enter for new lines)
- **Telefoonnummer** - Phone number
- **E-mailadres** - Email address
- **Openingstijden** - Business hours (use Enter for new lines)
- **Google Maps link** - Link to location on maps
- **Extra notitie titel** - Optional callout heading
- **Extra notitie tekst** - Optional callout text

**Example use:** Contact page sidebar, footer information

## How to Edit a Page

### Edit Existing Content

1. Go to **Admin → Pagina's**
2. Click **"Bewerken"** on the page you want to edit
3. Edit the page metadata:
   - **Titel** - Page title (for SEO)
   - **Beschrijving** - Meta description (for Google)
   - **Gepubliceerd** - Check to make the page live
4. Edit sections:
   - Change text in any field
   - Reorder sections with **Omhoog** / **Omlaag** buttons
   - Delete sections with **Verwijderen**
   - Add new sections with **Sectie toevoegen**
5. Click **"Opslaan"** to save changes
6. Click **"Bekijken"** to preview your changes

### Add a New Section

1. Scroll to the bottom of the page editor
2. Click **"Sectie toevoegen"**
3. Choose the section **Type** from the dropdown
4. Fill in the fields for that section type
5. Click **"Opslaan"** to save

### Reorder Sections

1. Use the **Omhoog** and **Omlaag** buttons on each section
2. Sections display in order from top to bottom
3. Click **"Opslaan"** to save the new order

### Preview Changes

Click the **"Bekijken"** button to open the page in a new tab and see your changes live.

## Tips for Great Content

### Writing Effective Headlines
- Keep hero titles under 8 words
- Use active, benefit-focused language
- Match your brand voice (serene, professional, natural)

### Body Text Best Practices
- Keep paragraphs short (3-4 sentences)
- Use simple, clear language
- Break up long text with multiple TEXT sections

### Call to Action Buttons
- Use action verbs: "Boek nu", "Plan een afspraak", "Ontdek meer"
- Be specific: "Plan jouw Gantke® behandeling" beats "Klik hier"
- Test different button text to see what works

### Contact Information
- Keep address formatting consistent
- Use the international format for phone: `06 508 142 60`
- Update hours during holidays or special events

## Common Tasks

### Update Contact Hours
1. Go to **Admin → Pagina's**
2. Edit the **Contact** page
3. Find the **CONTACT_INFO** section
4. Update the **Openingstijden** field
5. Save changes

### Change Homepage Hero
1. Go to **Admin → Pagina's**
2. Edit the **Home** page
3. Find the first section (type: HERO)
4. Update **Titel**, **Subtitel**, **CTA Label**, or **CTA Link**
5. Save changes

### Add a New Testimonial
1. Go to **Admin → Pagina's**
2. Edit the **About** page
3. Add a new **TEXT** section
4. Set **Sectietitel** to "Klanten over ons"
5. Add the testimonial quote in **Tekst**
6. Move the section to the desired position
7. Save changes

### Update Treatment Descriptions
1. Go to **Admin → Pagina's**
2. Edit the relevant page (e.g., **Gantke Fascia**)
3. Find and edit the TEXT sections with treatment details
4. Save changes

## Troubleshooting

### Changes Don't Appear
- Make sure you clicked **"Opslaan"** (Save)
- Check that **Gepubliceerd** is checked
- Refresh the browser (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache if needed

### Section Looks Wrong
- Check that you selected the correct section type
- Verify all required fields are filled
- Preview the page to see actual rendering

### Can't Delete a Section
- You can delete any section except on published pages
- Make sure you're logged in as ADMIN or EDITOR

### Lost Content
- All changes are saved to the database
- Use **"Bekijken"** to confirm saves
- Contact your developer if content is truly missing

## Advanced Features

### Creating a New Page

1. Go to **Admin → Pagina's**
2. Click **"Nieuwe pagina"** button
3. The system creates a template page
4. Click **"Bewerken"** on the new page
5. Update the slug, title, and description
6. Add sections as needed
7. Check **Gepubliceerd** when ready
8. Save changes

### Unpublishing a Page

1. Edit the page
2. Uncheck **Gepubliceerd**
3. Save changes
4. The page will show a fallback or 404

### Using Markdown
Currently, the CMS uses plain text. Line breaks can be added by pressing Enter. HTML is not supported for security.

## Best Practices

### Content Strategy
1. **Plan before you edit** - Know what message you want to convey
2. **Keep it scannable** - Use headings, short paragraphs, bullet points
3. **Mobile-first thinking** - Most visitors are on phones
4. **Update regularly** - Fresh content builds trust

### SEO Tips
1. Fill in **Beschrijving** for every page (150-160 characters)
2. Use target keywords naturally in headings and body text
3. Keep page **Titel** under 60 characters
4. Update content seasonally (holidays, special events)

### Brand Voice
- Use "je/jouw" (informal) to maintain warmth
- Focus on benefits, not just features
- Emphasize natural, serene, professional themes
- Tell stories rather than just listing facts

## Technical Notes

### Database Storage
All content is stored in the SQLite database in the `PageSection` table as JSON. Each section's `data` field contains the specific content for that section type.

### Migration Path
If you need to move to production:
1. Export the database
2. Update the `DATABASE_URL` environment variable
3. Run migrations on the production database
4. Import/seed the content

### Backup Recommendations
- Export database regularly
- Keep backups before major content changes
- Document custom sections or workflows

## Getting Help

### For Content Questions
- Review this guide's section type descriptions
- Preview changes before publishing
- Test on mobile and desktop

### For Technical Issues
- Check that the server is running
- Verify you're logged in
- Contact your developer for database or deployment issues

### For New Features
- Document what you need
- Describe the use case
- Discuss with your developer

---

## Quick Reference

### Login
- URL: http://localhost:3100/admin
- Email: admin@iris.local
- Password: admin123

### Page URLs
- Home: `/` → Edit as `home`
- About: `/about`
- Contact: `/contact`
- Rituelen: `/rituelen`
- Academy: `/academy`

### Section Types Quick List
1. **HERO** - Large banner with title, subtitle, button
2. **TEXT** - Simple text block with optional heading
3. **FEATURES** - Bullet point list
4. **CTA** - Call to action with button
5. **NEWSLETTER** - Newsletter signup section
6. **IMAGE** - Single image display
7. **VENTURES** - Treatment/ritual showcase grid
8. **CONTACT_INFO** - Structured contact information

---

*Last updated: November 2024*
*Version: 2.0 - Full CMS with CONTACT_INFO support*
