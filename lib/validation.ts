import { z } from 'zod';

// Ritueel creation/update schema
// Helper: accept either absolute URL (with protocol) or root-relative path (/uploads/..)
const RelativeOrAbsoluteUrl = z.string().min(1).refine(v => {
  if (/^https?:\/\//i.test(v)) return true; // absolute
  if (/^\/.+/.test(v)) return true; // root-relative
  return false;
}, { message: 'Must be an absolute URL (http/https) or a root-relative path starting with /' });

export const RitualSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  brandId: z.string().min(1),
  shortDescription: z.string().min(10),
  longDescription: z.string().min(20),
  featuredImageUrl: RelativeOrAbsoluteUrl.optional(),
  featuredImageAlt: z.string().max(200).optional(),
  valueProps: z.array(z.string().min(2)).min(1),
  ctaLabel: z.string().optional(),
  tagline: z.string().optional(),
  status: z.enum(['ACTIVE','INACTIVE','ARCHIVED']).optional(),
  // Booking fields (optional)
  durationMinutes: z.number().int().positive().max(24 * 60).optional(),
  priceCents: z.number().int().positive().max(1_000_000_00).optional(),
  currency: z.string().length(3).optional(),
  bookingLink: RelativeOrAbsoluteUrl.optional(),
  contraindications: z.string().max(2000).optional(),
  faq: z.array(z.object({
    question: z.string().min(3),
    answer: z.string().min(3)
  })).optional()
});

export type RitualInput = z.infer<typeof RitualSchema>;

export function validateRitual(input: unknown) {
  return RitualSchema.safeParse(input);
}

export function validationError(details: any) {
  return Response.json({ ok: false, error: { code: 'VALIDATION', details } }, { status: 400 });
}

// Schema for partial updates (PATCH). Only validates provided fields.
export const RitualUpdatePartialSchema = z.object({
  name: z.string().min(2).optional(),
  shortDescription: z.string().min(10).optional(),
  longDescription: z.string().min(20).optional(),
  featuredImageUrl: RelativeOrAbsoluteUrl.nullable().optional(), // allow explicit null to clear
  featuredImageAlt: z.string().max(200).nullable().optional(),   // allow explicit null to clear
  valueProps: z.array(z.string().min(2)).optional(), // allow clearing to empty array
  ctaLabel: z.string().optional(),
  tagline: z.string().nullable().optional(), // allow explicit null to clear
  status: z.enum(['ACTIVE','INACTIVE','ARCHIVED']).optional(),
  durationMinutes: z.number().int().positive().max(24 * 60).nullable().optional(),
  priceCents: z.number().int().positive().max(1_000_000_00).nullable().optional(),
  currency: z.string().length(3).nullable().optional(),
  bookingLink: RelativeOrAbsoluteUrl.nullable().optional(),
  contraindications: z.string().max(2000).nullable().optional(),
  faq: z.array(z.object({ question: z.string().min(3), answer: z.string().min(3) })).nullable().optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'No valid fields' });

export function validateRitualUpdatePartial(input: unknown) {
  return RitualUpdatePartialSchema.safeParse(input);
}

// Pages & Sections
export const PageSectionTypeEnum = z.enum([
  'HERO',
  'TEXT',
  'FEATURES',
  'CTA',
  'NEWSLETTER',
  'IMAGE',
  'FAQ',
  'VENTURES',
  'RITUALS',
  'CONTACT_INFO',
  'TESTIMONIALS',
  'TIMELINE'
]);
const JsonRecord = z.record(z.any());

export const PageSectionSchema = z.object({
  order: z.number().int().min(0).optional(),
  type: PageSectionTypeEnum,
  data: JsonRecord
});

export const PageCreateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  description: z.string().max(500).optional(),
  published: z.boolean().optional(),
  brandId: z.string().min(1),
  sections: z.array(PageSectionSchema).optional()
});

export const PageUpdatePartialSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().max(500).nullable().optional(),
  published: z.boolean().optional(),
  sections: z.array(PageSectionSchema).optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'No valid fields' });

export function validatePageCreate(input: unknown) {
  return PageCreateSchema.safeParse(input);
}

export function validatePageUpdatePartial(input: unknown) {
  return PageUpdatePartialSchema.safeParse(input);
}

// Blog content + validation
const BlogSectionSchema = z.object({
  heading: z.string().min(3),
  body: z.string().min(20),
  kicker: z.string().max(120).optional(),
  emphasis: z.boolean().optional()
});

const BlogResourceSchema = z.object({
  label: z.string().min(2),
  href: RelativeOrAbsoluteUrl
});

export const BlogContentSchema = z.object({
  kicker: z.string().max(120).optional(),
  intro: z.string().max(600).optional(),
  sections: z.array(BlogSectionSchema).min(1).max(10),
  highlight: z.object({
    text: z.string().min(10),
    attribution: z.string().max(120).optional()
  }).optional(),
  outro: z.string().max(400).optional(),
  resources: z.array(BlogResourceSchema).max(5).optional()
});

export type BlogContent = z.infer<typeof BlogContentSchema>;

export const BlogCreateSchema = z.object({
  title: z.string().min(5),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(400).optional(),
  coverImageUrl: RelativeOrAbsoluteUrl.optional(),
  coverImageAlt: z.string().max(200).optional(),
  content: BlogContentSchema.optional(),
  published: z.boolean().optional(),
  brandId: z.string().min(1),
  authorName: z.string().max(120).optional(),
  readingMinutes: z.number().int().positive().max(180).optional(),
  seoTitle: z.string().max(80).optional(),
  seoDescription: z.string().max(200).optional()
});

export const BlogUpdatePartialSchema = z.object({
  title: z.string().min(5).optional(),
  excerpt: z.string().max(400).nullable().optional(),
  coverImageUrl: RelativeOrAbsoluteUrl.nullable().optional(),
  coverImageAlt: z.string().max(200).nullable().optional(),
  content: BlogContentSchema.optional(),
  published: z.boolean().optional(),
  authorName: z.string().max(120).nullable().optional(),
  readingMinutes: z.number().int().positive().max(180).nullable().optional(),
  seoTitle: z.string().max(80).nullable().optional(),
  seoDescription: z.string().max(200).nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional()
}).refine(obj => Object.keys(obj).length > 0, { message: 'No valid fields' });

export function validateBlogCreate(input: unknown) {
  return BlogCreateSchema.safeParse(input);
}

export function validateBlogUpdatePartial(input: unknown) {
  return BlogUpdatePartialSchema.safeParse(input);
}