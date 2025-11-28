import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { rateLimit, formatRateLimitHeaders } from '../../../../lib/rateLimit';
import { ok, fail, unauthorized, forbidden, validation as vfail, rateLimited } from '../../../../lib/errors';
import { validateBlogUpdatePartial } from '../../../../lib/validation';
import { computeReadingMinutes, serializeBlogPost } from '../../../../lib/blog';
import { normalizeBrandId } from '../../../../lib/brandHeaders';
import { logAudit } from '../../../../lib/audit';

function canEdit(role?: string) {
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`blog:${params.slug}:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return rateLimited('Too many requests', { ...formatRateLimitHeaders(rl, 60), 'Retry-After': '60' });
  }
  const brandId = normalizeBrandId(req.headers.get('x-brand-id')) || undefined;
  const preview = req.nextUrl.searchParams.get('preview') === '1';
  let allowDraft = false;
  if (preview) {
    const session = await getServerSession(authOptions);
    allowDraft = canEdit((session?.user as any)?.role);
  }
  const where: Record<string, unknown> = { slug: params.slug };
  if (brandId) where.brandId = brandId;
  const post = await prisma.blogPost.findFirst({ where });
  if (!post) {
    return fail('NOT_FOUND', 404, 'Blog post not found', undefined, formatRateLimitHeaders(rl, 60));
  }
  if (!post.published && !allowDraft) {
    return fail('NOT_FOUND', 404, 'Blog post not available', undefined, formatRateLimitHeaders(rl, 60));
  }
  const normalized = serializeBlogPost(post);
  return ok(normalized, { ...formatRateLimitHeaders(rl, 60), 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' });
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (!canEdit(role)) return forbidden();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`blogPatch:${params.slug}:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return fail('RATE_LIMIT', 429, 'Too many blog updates', undefined, formatRateLimitHeaders(rl, 30));
  }
  const brandId = normalizeBrandId(req.headers.get('x-brand-id')) || undefined;
  const body = await req.json().catch(() => null);
  if (!body) return fail('INVALID_JSON', 400, 'Invalid JSON payload');
  const allowedFields = ['title','excerpt','coverImageUrl','coverImageAlt','content','published','authorName','readingMinutes','seoTitle','seoDescription','publishedAt'];
  const partial: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) partial[key] = body[key];
  }
  const parsed = validateBlogUpdatePartial(partial);
  if (!parsed.success) return vfail(parsed.error.issues);
  const where: Record<string, unknown> = { slug: params.slug };
  if (brandId) where.brandId = brandId;
  const existing = await prisma.blogPost.findFirst({ where });
  if (!existing) return fail('NOT_FOUND', 404, 'Blog post not found');
  const updateData: any = {};
  if (typeof parsed.data.title === 'string') updateData.title = parsed.data.title;
  if ('excerpt' in parsed.data) updateData.excerpt = parsed.data.excerpt === null ? null : parsed.data.excerpt;
  if ('coverImageUrl' in parsed.data) updateData.coverImageUrl = parsed.data.coverImageUrl;
  if ('coverImageAlt' in parsed.data) updateData.coverImageAlt = parsed.data.coverImageAlt;
  if ('authorName' in parsed.data) updateData.authorName = parsed.data.authorName;
  if ('seoTitle' in parsed.data) updateData.seoTitle = parsed.data.seoTitle;
  if ('seoDescription' in parsed.data) updateData.seoDescription = parsed.data.seoDescription;
  if ('content' in parsed.data && parsed.data.content) {
    updateData.content = parsed.data.content;
    if (!('readingMinutes' in parsed.data)) {
      updateData.readingMinutes = computeReadingMinutes(parsed.data.content);
    }
  }
  if ('readingMinutes' in parsed.data) {
    updateData.readingMinutes = parsed.data.readingMinutes;
  }
  if ('published' in parsed.data) {
    updateData.published = parsed.data.published;
    if (parsed.data.published) {
      updateData.publishedAt = existing.publishedAt ?? new Date();
    } else {
      updateData.publishedAt = null;
    }
  }
  if ('publishedAt' in parsed.data && parsed.data.publishedAt !== undefined) {
    updateData.publishedAt = parsed.data.publishedAt;
  }
  try {
    const updated = await prisma.blogPost.update({ where: { id: existing.id }, data: updateData });
    const fields = Object.keys(parsed.data);
    const fieldsCleared = Object.entries(parsed.data)
      .filter(([, value]) => value === null)
      .map(([key]) => key);
    const action = fields.length > 0 && fields.length === fieldsCleared.length ? 'CLEAR' : 'UPDATE';
    await logAudit({ action, entity: 'BlogPost', entityId: existing.id, userId: (session.user as any).id, data: { slug: updated.slug, fields, fieldsCleared } });
    const normalized = serializeBlogPost(updated);
    return ok(normalized, formatRateLimitHeaders(rl, 30));
  } catch (e: any) {
    return fail('UPDATE_FAILED', 500, e?.message || 'Unable to update blog post');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN') return forbidden();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`blogDelete:${params.slug}:${ip}`, 15, 60_000);
  if (!rl.allowed) {
    return fail('RATE_LIMIT', 429, 'Too many deletions', undefined, formatRateLimitHeaders(rl, 15));
  }
  const brandId = normalizeBrandId(req.headers.get('x-brand-id')) || undefined;
  const where: Record<string, unknown> = { slug: params.slug };
  if (brandId) where.brandId = brandId;
  try {
    const target = await prisma.blogPost.findFirst({ where });
    if (!target) {
      return fail('NOT_FOUND', 404, 'Blog post not found', undefined, formatRateLimitHeaders(rl, 15));
    }
    const deleted = await prisma.blogPost.delete({ where: { id: target.id } });
    await logAudit({ action: 'DELETE', entity: 'BlogPost', entityId: deleted.id, userId: (session.user as any).id, data: { slug: deleted.slug } });
    return ok({ deleted: true }, formatRateLimitHeaders(rl, 15));
  } catch (e: any) {
    return fail('DELETE_FAILED', 500, e?.message || 'Unable to delete blog post');
  }
}
