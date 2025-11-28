import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { rateLimit, formatRateLimitHeaders } from '../../../lib/rateLimit';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { ok, fail, unauthorized, forbidden, validation as vfail, rateLimited } from '../../../lib/errors';
import { validateBlogCreate } from '../../../lib/validation';
import { buildDefaultBlogContent, serializeBlogPost } from '../../../lib/blog';
import { normalizeBrandId } from '../../../lib/brandHeaders';
import { logAudit } from '../../../lib/audit';

function canEdit(role?: string) {
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`blog:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return rateLimited('Too many requests', { ...formatRateLimitHeaders(rl, 60), 'Retry-After': '60' });
  }
  const brandId = normalizeBrandId(req.headers.get('x-brand-id')) || undefined;
  const includeDrafts = req.nextUrl.searchParams.get('drafts') === '1';
  let allowDrafts = false;
  if (includeDrafts) {
    const session = await getServerSession(authOptions);
    allowDrafts = canEdit((session?.user as any)?.role);
  }
  const where: Record<string, unknown> = {};
  if (brandId) where.brandId = brandId;
  if (!allowDrafts) where.published = true;
  const rows = await prisma.blogPost.findMany({
    where,
    orderBy: [
      { published: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ]
  });
  const items = rows.map((row) => {
    const { content, seoDescription, seoTitle, ...summary } = serializeBlogPost(row);
    return summary;
  });
  return ok(items, { ...formatRateLimitHeaders(rl, 60), 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (!canEdit(role)) return forbidden();
  const body = await req.json().catch(() => null);
  if (!body) return fail('INVALID_JSON', 400, 'Invalid JSON payload');
  const hdrBrandId = normalizeBrandId(req.headers.get('x-brand-id')) || undefined;
  const parsed = validateBlogCreate({ ...body, brandId: body.brandId || hdrBrandId });
  if (!parsed.success) return vfail(parsed.error.issues);
  const { brandId, title, slug, excerpt, coverImageUrl, coverImageAlt, published = false, authorName, readingMinutes, seoTitle, seoDescription } = parsed.data;
  const fields = Object.keys(parsed.data);
  if (!brandId) return fail('VALIDATION', 400, 'Brand context missing');
  const existing = await prisma.blogPost.findFirst({ where: { brandId, slug } });
  if (existing) return fail('SLUG_EXISTS', 409, 'Slug already in use');
  const content = parsed.data.content || buildDefaultBlogContent(title);
  try {
    const created = await prisma.blogPost.create({
      data: {
        brandId,
        title,
        slug,
        excerpt,
        coverImageUrl,
        coverImageAlt,
        content,
        published,
        authorName,
        readingMinutes: readingMinutes ?? null,
        seoTitle,
        seoDescription,
        publishedAt: published ? new Date() : null
      }
    });
    await logAudit({ action: 'CREATE', entity: 'BlogPost', entityId: created.id, userId: (session.user as any).id, data: { slug: created.slug, fields } });
    const normalized = serializeBlogPost(created);
    return ok(normalized);
  } catch (e: any) {
    return fail('CREATE_FAILED', 500, e?.message || 'Unable to create blog post');
  }
}
