import { prisma } from '../lib/prisma';
import { PATCH as VenturePATCH } from '../app/api/ventures/[slug]/route';
import { PATCH as PagePATCH } from '../app/api/pages/[slug]/route';
import { ensureVenture, ensurePage } from './helpers';

// Mock next-auth to always authenticate as ADMIN
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockImplementation(async () => {
    const user = await prisma.user.upsert({
      where: { email: 'admin@iris.local' },
      update: {},
      create: { email: 'admin@iris.local', role: 'ADMIN' }
    });
    return { user: { id: user.id, role: 'ADMIN' } } as any;
  })
}));

describe('Mutation rate limits', () => {
  const ventureSlug = 'rl-test-venture';
  const pageSlug = 'rl-test-page';
  let brandId: string;

  beforeAll(async () => {
    brandId = (await prisma.brand.findFirst())!.id;
    await ensureVenture(ventureSlug, brandId);
    await ensurePage(pageSlug, brandId);
  });

  it('blocks venture PATCH after exceeding limit', async () => {
    let hit429 = false;
    for (let i = 0; i < 31; i++) {
      if (hit429) break; // early break for sustainability & speed
      const req = new Request(`http://localhost/api/ventures/${ventureSlug}` , {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagline: `Tag ${i}` })
      });
      const res = await VenturePATCH(req as any, { params: { slug: ventureSlug } });
      if (res.status === 429) {
        const json: any = await res.json();
        expect(json.ok).toBe(false);
        expect(json.error.code).toBe('RATE_LIMIT');
        hit429 = true;
      }
    }
    expect(hit429).toBe(true);
  }, 60000);

  it('blocks page PATCH after exceeding limit', async () => {
    let hit429 = false;
    for (let i = 0; i < 31; i++) {
      if (hit429) break;
      const req = new Request(`http://localhost/api/pages/${pageSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-brand-id': brandId },
        body: JSON.stringify({ title: `Title ${i}` })
      });
      const res = await PagePATCH(req as any, { params: { slug: pageSlug } });
      if (res.status === 429) {
        const json: any = await res.json();
        expect(json.ok).toBe(false);
        expect(json.error.code).toBe('RATE_LIMIT');
        hit429 = true;
      }
    }
    expect(hit429).toBe(true);
  }, 60000);
});