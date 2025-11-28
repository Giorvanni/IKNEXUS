import { prisma } from '../lib/prisma';

export async function ensureVenture(slug: string, brandId: string) {
  const existing = await prisma.venture.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.venture.create({
    data: {
      slug,
      name: slug.replace(/-/g,' ').toUpperCase(),
      brandId,
      shortDescription: 'Short description 123',
      longDescription: 'Long description for ' + slug + ' ensuring length > 20',
      valueProps: ['One','Two'],
      ctaLabel: 'Go'
    }
  });
}

export async function ensurePage(slug: string, brandId: string) {
  const existing = await prisma.page.findFirst({ where: { slug, brandId } });
  if (existing) return existing;
  const page = await prisma.page.create({ data: { slug, title: slug.replace(/-/g,' ').toUpperCase(), brandId } });
  await prisma.pageSection.create({ data: { pageId: page.id, order: 0, type: 'TEXT', data: { markdown: 'Init' } } });
  return page;
}
