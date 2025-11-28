import { prisma } from '../lib/prisma';
import { GET as BlogListGET, POST as BlogPOST } from '../app/api/blog/route';
import { GET as BlogDetailGET, PATCH as BlogPATCH, DELETE as BlogDELETE } from '../app/api/blog/[slug]/route';

// Mock auth to always provide an ADMIN session
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockImplementation(async () => {
    const user = await prisma.user.upsert({
      where: { email: 'admin@iris.local' },
      update: { role: 'ADMIN' },
      create: { email: 'admin@iris.local', role: 'ADMIN' }
    });
    return { user: { id: user.id, role: 'ADMIN' } } as any;
  })
}));

describe('Blog API routes', () => {
  const slug = 'test-blog-post';
  let brandId: string;

  beforeAll(async () => {
    brandId = (await prisma.brand.findFirst())!.id;
    await prisma.blogPost.deleteMany({ where: { slug, brandId } });
  });

  afterAll(async () => {
    await prisma.blogPost.deleteMany({ where: { slug, brandId } });
  });

  it('creates a blog post with default template content', async () => {
    const body = {
      title: 'Test blog artikel',
      slug,
      excerpt: 'Intro copy voor het artikel.',
      brandId,
      published: false
    };
    const req = new Request('http://localhost/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-brand-id': brandId },
      body: JSON.stringify(body)
    });
    const res = await BlogPOST(req as any);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.slug).toBe(slug);
    expect(Array.isArray(json.data.content.sections)).toBe(true);
    expect(json.data.content.sections.length).toBeGreaterThan(0);
    expect(json.data.readingMinutes).toBeGreaterThan(0);
  });

  it('updates the blog post content and publishes it', async () => {
    const updatedContent = {
      kicker: 'Studio nieuws',
      intro: 'Een langere introductie die uitlegt waar dit artikel over gaat en waarom het belangrijk is.',
      sections: [
        {
          heading: 'Hoofdstuk 1',
          body: 'Dit is een langere paragraaf met uitleg over fascia en ademwerk in de praktijk.',
          kicker: 'Eerste sectie'
        }
      ],
      outro: 'Sluit af met een uitnodiging voor een sessie.',
      resources: [{ label: 'Plan een ritueel', href: '/contact' }]
    };
    const req = new Request(`http://localhost/api/blog/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-brand-id': brandId },
      body: JSON.stringify({
        title: 'Bijgewerkte titel',
        published: true,
        readingMinutes: 7,
        content: updatedContent
      })
    });
    const res = await BlogPATCH(req as any, { params: { slug } });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.title).toBe('Bijgewerkte titel');
    expect(json.data.published).toBe(true);
    expect(json.data.readingMinutes).toBe(7);
    expect(json.data.content.sections[0].heading).toBe('Hoofdstuk 1');
  });

  it('lists published blog posts without leaking full content payload', async () => {
    const req = new Request('http://localhost/api/blog', { headers: { 'x-brand-id': brandId } });
    (req as any).nextUrl = new URL(req.url);
    const res = await BlogListGET(req as any);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.ok).toBe(true);
    const match = json.data.find((row: any) => row.slug === slug);
    expect(match).toBeDefined();
    expect(match.content).toBeUndefined();
    expect(match.published).toBe(true);
  });

  it('fetches the blog post detail', async () => {
    const req = new Request(`http://localhost/api/blog/${slug}`, { headers: { 'x-brand-id': brandId } });
    (req as any).nextUrl = new URL(req.url);
    const res = await BlogDetailGET(req as any, { params: { slug } });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.slug).toBe(slug);
    expect(json.data.content.sections.length).toBeGreaterThan(0);
  });

  it('deletes the blog post', async () => {
    const req = new Request(`http://localhost/api/blog/${slug}`, {
      method: 'DELETE',
      headers: { 'x-brand-id': brandId }
    });
    const res = await BlogDELETE(req as any, { params: { slug } });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.deleted).toBe(true);
    const exists = await prisma.blogPost.findFirst({ where: { slug, brandId } });
    expect(exists).toBeNull();
  });
});
