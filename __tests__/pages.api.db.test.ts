import { prisma } from '../lib/prisma';
import { GET as PagesGET, POST as PagesPOST } from '../app/api/pages/route';
import { PATCH as PagePATCH } from '../app/api/pages/[slug]/route';

// Mock auth to provide ADMIN user
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

describe('Pages API', () => {
  let brandId: string;
  const slug = 'cms-test';
  beforeAll(async () => {
    brandId = (await prisma.brand.findFirst())!.id;
    // Ensure clean slate: delete sections first to satisfy FK constraints
    const existingPages = await prisma.page.findMany({ where: { brandId, slug }, select: { id: true } });
    for (const p of existingPages) {
      await prisma.pageSection.deleteMany({ where: { pageId: p.id } });
    }
    await prisma.page.deleteMany({ where: { brandId, slug } });
  });

  it('creates page with sections', async () => {
    const body = {
      slug,
      title: 'CMS Test Page',
      description: 'Desc',
      brandId,
      sections: [
        { type: 'HERO', data: { heading: 'Hero', subheading: 'Sub' }, order: 0 },
        { type: 'TEXT', data: { markdown: 'Hello **world**' }, order: 1 }
      ]
    };
    const req = new Request('http://localhost/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-brand-id': brandId },
      body: JSON.stringify(body)
    });
    const res = await PagesPOST(req as any);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.sections.length).toBe(2);
    expect(json.data.slug).toBe(slug);
  });

  it('lists pages including created one', async () => {
    const req = new Request('http://localhost/api/pages', { headers: { 'x-brand-id': brandId } });
    const res = await PagesGET(req as any);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.ok).toBe(true);
    const slugs = json.data.map((p: any) => p.slug);
    expect(slugs).toContain(slug);
  });

  it('updates page with section replacement and unpublishes', async () => {
    const patch = {
      published: false,
      sections: [
        { type: 'TEXT', data: { markdown: 'Replaced body' }, order: 0 },
        { type: 'CTA', data: { label: 'Klik hier', href: '/contact' }, order: 1 }
      ]
    };
    const req = new Request(`http://localhost/api/pages/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-brand-id': brandId },
      body: JSON.stringify(patch)
    });
    const res = await PagePATCH(req as any, { params: { slug } });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.published).toBe(false);
    expect(json.data.sections.length).toBe(2);
    const types = json.data.sections.map((s: any) => s.type);
    expect(types).toEqual(['TEXT','CTA']);
  });
});