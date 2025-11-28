import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { rateLimit, formatRateLimitHeaders } from '../../../lib/rateLimit';
import { ok, fail, unauthorized, forbidden, validation as vfail, rateLimited } from '../../../lib/errors';
import { validatePageCreate } from '../../../lib/validation';
import { logAudit } from '../../../lib/audit';
import { withRequest } from '../../../lib/logger';
import { recordLatency } from '../../../lib/metrics';

export async function GET(req: NextRequest) {
  const started = Date.now();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`pages:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    recordLatency('api_pages_list', Date.now() - started);
    return rateLimited('Too many requests', { ...formatRateLimitHeaders(rl, 60), 'Retry-After': '60' });
  }
  const brandId = req.headers.get('x-brand-id') || undefined;
  const where = brandId ? { brandId } : {};
  const requestId = req.headers.get('x-request-id') || 'unknown';
  const log = withRequest({ requestId, brandId, path: '/api/pages', method: 'GET' });
  try {
    const pages = await prisma.page.findMany({ where, orderBy: { createdAt: 'asc' }, select: { id: true, slug: true, title: true, published: true } });
    log.debug({ count: pages.length }, 'Pages listed');
    return ok(pages, { ...formatRateLimitHeaders(rl, 60), 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' });
  } catch (e: any) {
    log.error({ err: e }, 'Pages list failed');
    return fail('INTERNAL', 500, 'Unable to list pages', undefined, formatRateLimitHeaders(rl, 60));
  } finally {
    recordLatency('api_pages_list', Date.now() - started);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN' && role !== 'EDITOR') return forbidden();
  const body = await req.json().catch(() => null);
  if (!body) return fail('INVALID_JSON', 400, 'Invalid JSON');
  // Allow server to inject brandId from middleware header when omitted
  const hdrBrandId = req.headers.get('x-brand-id') || undefined;
  const parsed = validatePageCreate({ ...body, brandId: body.brandId || hdrBrandId });
  if (!parsed.success) return vfail(parsed.error.issues);
  const { slug, title, description, published = true, brandId, sections = [] } = parsed.data;
  // Ensure slug unique within brand
  const existing = await prisma.page.findFirst({ where: { brandId, slug } });
  if (existing) return fail('SLUG_EXISTS', 409, 'Slug already in use');
  try {
    const created = await prisma.page.create({ data: { slug, title, description, published, brandId } });
    if (Array.isArray(sections) && sections.length > 0) {
      const toCreate = sections.map((s, idx) => ({ pageId: created.id, order: s.order ?? idx, type: s.type, data: s.data }));
      await prisma.pageSection.createMany({ data: toCreate });
    }
    await logAudit({ action: 'CREATE', entity: 'Page', entityId: created.id, userId: (session.user as any).id, data: { slug: created.slug } });
    const full = await prisma.page.findUnique({ where: { id: created.id }, include: { sections: { orderBy: { order: 'asc' } } } });
    return ok(full);
  } catch (e: any) {
    return fail('CREATE_FAILED', 500, e.message || 'Error creating page');
  }
}
