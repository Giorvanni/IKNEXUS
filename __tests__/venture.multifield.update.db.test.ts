import { prisma } from '../lib/prisma';
import { PATCH as VenturePATCH } from '../app/api/ventures/[slug]/route';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

describe('Venture multi-field & clearing PATCH', () => {
  const slug = 'multifield-patch-test';
  let userId: string;
  beforeAll(async () => {
    // Ensure admin user exists
    let user = await prisma.user.findUnique({ where: { email: 'admin@iris.local' } });
    if (!user) {
      user = await prisma.user.create({ data: { email: 'admin@iris.local', role: 'ADMIN' } });
    }
    userId = user.id;
    (getServerSession as any).mockResolvedValue({ user: { id: userId, role: 'ADMIN' } });
    // Ensure venture exists
    const brand = await prisma.brand.findFirst();
    const existing = await prisma.venture.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.venture.create({
        data: {
          slug,
          name: 'MultiField Patch Venture',
          shortDescription: 'Short description 12345',
          longDescription: 'Long description 12345678901234567890',
          valueProps: ['Alpha', 'Beta'],
          ctaLabel: 'Explore',
          brandId: brand!.id
        }
      });
    }
  });

  it('updates multiple fields and clears valueProps + tagline', async () => {
    const body = { name: 'Updated MultiField Name', valueProps: [], tagline: null };
    const req = new Request(`http://localhost/api/ventures/${slug}?debug=1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await VenturePATCH(req as any, { params: { slug } });
    expect(res.status).toBe(200);
    const json: any = await (res as any).json();
    expect(json.ok).toBe(true);
    expect(json.data.name).toBe(body.name);
    expect(Array.isArray(json.data.valueProps)).toBe(true);
    expect(json.data.valueProps.length).toBe(0);
    expect(json.data.tagline).toBeNull();
    // Verify audit log contains fieldsCleared
  const audit = await prisma.auditLog.findMany({ where: { entity: 'Venture', entityId: json.data.id }, orderBy: { createdAt: 'desc' }, take: 1 });
  const auditData: any = audit[0]?.data;
  expect(Array.isArray(auditData?.fieldsCleared)).toBe(true);
  expect(auditData.fieldsCleared).toEqual(expect.arrayContaining(['valueProps','tagline']));
  });
});
