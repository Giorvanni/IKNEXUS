import prisma from './prisma';

export interface Ritual {
  id: number; // synthetic numeric id for legacy components
  brandId: string;
  name: string;
  slug: string;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  shortDescription: string;
  longDescription: string;
  valueProps: string[];
  ctaLabel: string;
  durationMinutes?: number | null;
  priceCents?: number | null;
  currency?: string | null;
  bookingLink?: string | null;
  contraindications?: string | null;
  faq?: { question: string; answer: string }[] | null;
}

type RawRitual = Awaited<ReturnType<typeof prisma.venture.findMany>>[number];

function map(db: RawRitual, index: number): Ritual {
  return {
    id: index + 1,
    brandId: db.brandId,
    name: db.name,
    slug: db.slug,
    featuredImageUrl: (db as any).featuredImageUrl || null,
    featuredImageAlt: (db as any).featuredImageAlt || null,
    shortDescription: db.shortDescription,
    longDescription: db.longDescription,
    valueProps: (db.valueProps as string[]) || [],
    ctaLabel: db.ctaLabel || 'Ontdek ritueel',
    durationMinutes: (db as any).durationMinutes ?? null,
    priceCents: (db as any).priceCents ?? null,
    currency: (db as any).currency ?? 'EUR',
    bookingLink: (db as any).bookingLink ?? null,
    contraindications: (db as any).contraindications ?? null,
    faq: (db as any).faq ?? null
  };
}

export async function getRituals(): Promise<Ritual[]> {
  const rows = await prisma.venture.findMany({ orderBy: { createdAt: 'asc' } });
  return rows.map(map);
}

export async function getRitualBySlug(slug: string): Promise<Ritual | undefined> {
  const row = await prisma.venture.findUnique({ where: { slug } });
  if (!row) return undefined;
  return map(row, 0);
}

