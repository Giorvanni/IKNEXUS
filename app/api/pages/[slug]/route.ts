import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { rateLimit, formatRateLimitHeaders } from '../../../../lib/rateLimit';
import { ok, fail, unauthorized, forbidden, validation as vfail } from '../../../../lib/errors';
import { validatePageUpdatePartial } from '../../../../lib/validation';
import { logAudit } from '../../../../lib/audit';
import { withRequest } from '../../../../lib/logger';
import { getPageBySlug } from '../../../../lib/pages';
import { recordLatency } from '../../../../lib/metrics';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const started = Date.now();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`page:${params.slug}:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    recordLatency('api_page_get', Date.now() - started);
    return fail('RATE_LIMIT', 429, 'Too many requests', undefined, { ...formatRateLimitHeaders(rl, 60), 'Retry-After': '60' });
  }
  const brandId = req.headers.get('x-brand-id') || undefined;
  const requestId = req.headers.get('x-request-id') || 'unknown';
  const log = withRequest({ requestId, brandId, path: `/api/pages/${params.slug}`, method: 'GET' });
  try {
    const page = await getPageBySlug(params.slug, brandId);
    if (!page) {
      log.info({ slug: params.slug }, 'Page not found');
      return fail('NOT_FOUND', 404, 'Page not found', undefined, formatRateLimitHeaders(rl, 60));
    }
    log.debug({ slug: params.slug }, 'Page fetched');
    return ok(page, { ...formatRateLimitHeaders(rl, 60), 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' });
  } catch (e: any) {
    log.error({ err: e, slug: params.slug }, 'Page fetch error');
    return fail('INTERNAL', 500, 'Page query failed', undefined, formatRateLimitHeaders(rl, 60));
  } finally {
    recordLatency('api_page_get', Date.now() - started);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN' && role !== 'EDITOR') return forbidden();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`pagePatch:${params.slug}:${ip}`, 30, 60_000);
  if (!rl.allowed) return fail('RATE_LIMIT', 429, 'Too many page updates', undefined, formatRateLimitHeaders(rl,30));
  const brandId = req.headers.get('x-brand-id') || undefined;
  const requestId = req.headers.get('x-request-id') || 'unknown';
  const log = withRequest({ requestId, brandId, path: `/api/pages/${params.slug}`, method: 'PATCH' });
  const body = await req.json().catch(() => null);
  if (!body) return fail('INVALID_JSON', 400, 'Invalid JSON');
  const partial: Record<string, any> = {};
  const allowed = ['title','description','published','sections'];
  for (const k of allowed) if (k in body) partial[k] = body[k];
  const parsed = validatePageUpdatePartial(partial);
  if (!parsed.success) return vfail(parsed.error.issues);
  try {
    const page = await prisma.page.findFirst({ where: { slug: params.slug, ...(brandId ? { brandId } : {}) } });
    if (!page) return fail('NOT_FOUND', 404, 'Page not found');
    const updateData: any = {};
    if (typeof partial.title === 'string') updateData.title = partial.title;
    if ('description' in partial) updateData.description = partial.description === undefined ? undefined : partial.description;
    if (typeof partial.published === 'boolean') updateData.published = partial.published;
    if (Object.keys(updateData).length > 0) {
      await prisma.page.update({ where: { id: page.id }, data: updateData });
    }
    if (Array.isArray(partial.sections)) {
      // Replace sections with provided list (full replace)
      await prisma.pageSection.deleteMany({ where: { pageId: page.id } });
      const toCreate = partial.sections.map((s: any, idx: number) => ({ pageId: page.id, order: s.order ?? idx, type: s.type, data: s.data }));
      if (toCreate.length > 0) await prisma.pageSection.createMany({ data: toCreate });
    }
    const full = await prisma.page.findUnique({ where: { id: page.id }, include: { sections: { orderBy: { order: 'asc' } } } });
    const fields = Object.keys(partial);
    const fieldsCleared: string[] = [];
    await logAudit({ action: 'UPDATE', entity: 'Page', entityId: page.id, userId: (session.user as any).id, data: { fields, fieldsCleared, slug: page.slug }, requestId });
    log.info({ slug: page.slug, fields }, 'Page updated');
    return ok(full, formatRateLimitHeaders(rl,30));
  } catch (e: any) {
    try { log.error({ err: e, slug: params.slug }, 'Page update error'); } catch {}
    return fail('UPDATE_FAILED', 500, e.message || 'Update error', undefined, formatRateLimitHeaders(rl,30));
  }
}
