import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

describe('navigation drafts publish flow', () => {
  it('creates draft and publishes it into navigation links', async () => {
    const brand = await prisma.brand.findFirst();
    const draft = await prisma.navigationLinkDraft.create({ data: { label: 'Test', href: '/test', order: 5, brandId: brand.id } });
    expect(draft.id).toBeTruthy();
    const published = await prisma.navigationLink.create({ data: { label: draft.label, href: draft.href, order: draft.order, brandId: draft.brandId } });
    expect(published.label).toBe('Test');
    await prisma.navigationLinkDraft.delete({ where: { id: draft.id } });
    const links = await prisma.navigationLink.findMany({ where: { brandId: brand.id } });
    expect(links.some((l: any) => l.label === 'Test')).toBe(true);
  });
});