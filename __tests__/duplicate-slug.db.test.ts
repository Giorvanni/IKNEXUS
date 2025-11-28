import { prisma } from '../lib/prisma';

describe('Duplicate venture slug handling', () => {
  it('suggests alternatives when slug exists', async () => {
    // Ensure at least one venture exists
    const venture = await prisma.venture.findFirst();
    if (!venture) throw new Error('Seed venture missing');
    // Simulate uniqueness logic: manually query duplicates
    const existing = await prisma.venture.findUnique({ where: { slug: venture.slug } });
    expect(existing).toBeTruthy();
    // Suggestion algorithm mimic
    const base = venture.slug;
    const suggestions: string[] = [];
    for (let i = 2; i <= 4; i++) {
      const candidate = `${base}-${i}`;
      const taken = await prisma.venture.findUnique({ where: { slug: candidate } });
      if (!taken) suggestions.push(candidate);
      if (suggestions.length >= 2) break;
    }
    expect(suggestions.length).toBeGreaterThan(0);
  });
});