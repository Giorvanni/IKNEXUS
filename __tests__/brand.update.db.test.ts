import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

describe('brand update extended fields', () => {
  it('updates showInNav, navOrder, logoUrl', async () => {
    const brand = await prisma.brand.findFirst();
    const updated = await prisma.brand.update({ where: { id: brand.id }, data: { showInNav: false, navOrder: 99, logoUrl: 'https://cdn.example/logo.png' } });
    expect(updated.showInNav).toBe(false);
    expect(updated.navOrder).toBe(99);
    expect(updated.logoUrl).toContain('logo.png');
  });
});