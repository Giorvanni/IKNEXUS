import type { MetadataRoute } from 'next';
import { getRituals } from '../lib/rituals';
import { prisma } from '../lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const staticPaths = [
    '/',
    '/rituelen',
    '/about',
    '/academy',
    '/shop',
    '/contact',
    '/gantke-fascia',
    '/gezichtsbehandelingen',
    '/fascia-behandelaar',
    '/faq',
    '/privacy',
    '/algemene-voorwaarden',
    '/cookiebeleid'
  ];
  const items: MetadataRoute.Sitemap = staticPaths.map(p => ({ url: `${base}${p}`, changeFrequency: 'weekly', priority: p === '/' ? 1 : 0.6 }));
  try {
    const rituals = await getRituals();
    for (const r of rituals) {
      items.push({ url: `${base}/rituelen/${r.slug}`, changeFrequency: 'monthly', priority: 0.7 });
    }
  } catch {}
  try {
    const blogPosts = await prisma.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' }, select: { slug: true } });
    for (const post of blogPosts) {
      items.push({ url: `${base}/blog/${post.slug}`, changeFrequency: 'monthly', priority: 0.5 });
    }
  } catch {}
  return items;
}
