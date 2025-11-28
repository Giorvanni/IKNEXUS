import { prisma } from '../lib/prisma';

describe('Database basic checks', () => {
  it('has seeded ventures and brand', async () => {
    const brand = await prisma.brand.findFirst();
    expect(brand).toBeTruthy();
    const ventures = await prisma.venture.findMany();
    expect(ventures.length).toBeGreaterThanOrEqual(4);
    const one = ventures[0];
    expect(one).toHaveProperty('slug');
    expect(one).toHaveProperty('shortDescription');
  });
});
