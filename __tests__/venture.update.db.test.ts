import { prisma } from '../lib/prisma';
import { PATCH as VenturePATCH } from '../app/api/ventures/[slug]/route';

// Mock next-auth to bypass real session handling
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockImplementation(async () => {
    // Ensure user exists in DB to avoid audit foreign key error (idempotent)
    const user = await prisma.user.upsert({
      where: { email: 'admin@iris.local' },
      update: {},
      create: { email: 'admin@iris.local', role: 'ADMIN' }
    });
    return { user: { id: user!.id, role: 'ADMIN' } } as any;
  })
}));

describe('Venture PATCH endpoint', () => {
  const slug = 'patch-test-venture';
  beforeAll(async () => {
    // Ensure a venture exists to patch
    const existing = await prisma.venture.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.venture.create({
        data: {
          slug,
          name: 'Patch Test Venture',
          brandId: (await prisma.brand.findFirst())?.id || '',
          shortDescription: 'Short description for patch test',
          longDescription: 'Long description for patch test venture ensuring length > 20',
          valueProps: ['Fast', 'Reliable'],
          ctaLabel: 'Learn more'
        }
      });
    }
  });

  it('successfully patches name and featuredImageAlt', async () => {
    const body = { name: 'Patched Venture Name', featuredImageAlt: 'Alt text sample' };
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
    expect(json.data.featuredImageAlt).toBe(body.featuredImageAlt);
  });

  it('returns validation error for too-short shortDescription', async () => {
    const invalid = { shortDescription: 'tiny' }; // < 10 chars
    const req = new Request(`http://localhost/api/ventures/${slug}?debug=1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalid)
    });
    const res = await VenturePATCH(req as any, { params: { slug } });
    expect(res.status).toBe(400);
    const json: any = await (res as any).json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe('VALIDATION');
    // Ensure path includes shortDescription
    const issuePaths = json.error.details.map((d: any) => d.path?.join('.'));
    expect(issuePaths).toContain('shortDescription');
  });

  it('no-op when only empty strings provided', async () => {
    const noop = { name: '' }; // gets stripped
    const req = new Request(`http://localhost/api/ventures/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noop)
    });
    const res = await VenturePATCH(req as any, { params: { slug } });
    expect(res.status).toBe(200);
    const json: any = await (res as any).json();
    expect(json.ok).toBe(true);
    // Original name should still be the patched one from earlier test
    expect(json.data.name).toBe('Patched Venture Name');
  });

  it('clears nullable fields when sending null', async () => {
    const body = { featuredImageAlt: null, tagline: null };
    const req = new Request(`http://localhost/api/ventures/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await VenturePATCH(req as any, { params: { slug } });
    expect(res.status).toBe(200);
    const json: any = await (res as any).json();
    expect(json.ok).toBe(true);
    expect(json.data.featuredImageAlt).toBeNull();
    expect(json.data.tagline).toBeNull();
  });

  it('clears valueProps when sending empty array', async () => {
    const body = { valueProps: [] };
    const req = new Request(`http://localhost/api/ventures/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await VenturePATCH(req as any, { params: { slug } });
    expect(res.status).toBe(200);
    const json: any = await (res as any).json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.data.valueProps)).toBe(true);
    expect(json.data.valueProps.length).toBe(0);
  });
});
