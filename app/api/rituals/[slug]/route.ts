import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { validateRitualUpdatePartial } from '../../../../lib/validation';
import { rateLimit, formatRateLimitHeaders } from '../../../../lib/rateLimit';
import { logAudit } from '../../../../lib/audit';
import { trackMetric } from '../../../../lib/metrics';
import { captureException } from '../../../../lib/sentry';

function resolveEntityLabel(req: Request): 'Ritual' | 'Venture' {
  try {
    const pathname = new URL(req.url).pathname;
    return pathname.includes('/api/ventures/') ? 'Venture' : 'Ritual';
  } catch {
    return 'Ritual';
  }
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const started = Date.now();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`ritual:${params.slug}:${ip}`, 60, 60_000);
  const ritual = await prisma.venture.findUnique({ where: { slug: params.slug } });
  if (!ritual) {
    try { const { recordLatency } = require('../../../../lib/metrics'); recordLatency('api_ritual_get', Date.now() - started); } catch {}
    return new Response(JSON.stringify({ ok: false, error: { code: 'NOT_FOUND' } }), { status: 404, headers: { 'Content-Type': 'application/json', ...formatRateLimitHeaders(rl,60) } });
  }
  try { const { recordLatency } = require('../../../../lib/metrics'); recordLatency('api_ritual_get', Date.now() - started); } catch {}
  return new Response(JSON.stringify({ ok: true, data: ritual }), { headers: { 'Content-Type': 'application/json', ...formatRateLimitHeaders(rl,60), 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const entityLabel = resolveEntityLabel(req);
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    return Response.json({ ok: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`ritualPatch:${params.slug}:${ip}`, 30, 60_000); // stricter limit for mutations
  if (!rl.allowed) {
    return Response.json({ ok: false, error: { code: 'RATE_LIMIT', message: 'Too many updates' } }, { status: 429, headers: formatRateLimitHeaders(rl,30) });
  }
  const body = await req.json().catch(() => null);
  if (!body) return new Response('Invalid JSON', { status: 400 });
  const debug = (() => { try { return new URL(req.url).searchParams.get('debug') === '1'; } catch { return false; } })();
  // Allow partial updates with schema refinement
  const allowedFields = [
    'name','shortDescription','longDescription','valueProps','ctaLabel','tagline','status',
    'featuredImageUrl','featuredImageAlt',
    'durationMinutes','priceCents','currency','bookingLink','contraindications','faq'
  ];
  const partial: Record<string, any> = {};
  for (const key of allowedFields) if (key in body) partial[key] = body[key];
  // Normalize empty string values to undefined (skip validation) to prevent URL/length validators from failing on ""
  for (const k of Object.keys(partial)) {
    if (typeof partial[k] === 'string' && partial[k].trim() === '') {
      delete partial[k];
    }
    // For arrays remove empty strings inside valueProps
    if (k === 'valueProps' && Array.isArray(partial[k])) {
      // Filter out empty strings; allow clearing to empty array explicitly
      partial[k] = partial[k].filter((v: any) => typeof v === 'string' ? v.trim().length > 0 : true);
      if (!Array.isArray(partial[k])) delete partial[k];
    }
    // Treat null as a clear only for explicitly nullable clearable fields, otherwise drop (no-op)
    if (partial[k] === null) {
      const clearable = ['featuredImageUrl','featuredImageAlt','tagline','durationMinutes','priceCents','currency','bookingLink','contraindications','faq'];
      if (!clearable.includes(k)) delete partial[k];
    }
  }
  try {
    if (Object.keys(partial).length === 0) {
      // Treat as a no-op instead of error; return current ritueel for better UX
      const current = await prisma.venture.findUnique({ where: { slug: params.slug } });
      if (!current) return new Response('Not found', { status: 404 });
      trackMetric('rituals.patch.noop', 1, { slug: params.slug });
      return Response.json({ ok: true, data: current, rateLimit: formatRateLimitHeaders(rl,30) });
    }
    // Validate only provided fields
    const parsed = validateRitualUpdatePartial(partial);
    if (!parsed.success) {
      // Validation failed; emit structured metric only (avoid noisy console logs long-term)
      if (debug) {
        try {
          // When explicitly debugging, surface received bodies
          console.error('[rituals.patch] debug validation fail', { body, partial, issues: parsed.error.issues });
        } catch {}
      }
      trackMetric('rituals.patch.validation_fail', 1, { slug: params.slug });
      return Response.json({ ok: false, error: { code: 'VALIDATION', details: parsed.error.issues, received: partial, rawBody: debug ? body : undefined } }, { status: 400 });
    }
    const updated = await prisma.venture.update({ where: { slug: params.slug }, data: partial });
    const fields = Object.keys(partial);
    const fieldsCleared = fields.filter(f => {
      const v = (partial as any)[f];
      return v === null || (Array.isArray(v) && v.length === 0);
    });
    const actionType = fields.length > 0 && fields.length === fieldsCleared.length ? 'CLEAR' : 'UPDATE';
    await logAudit({
      action: actionType,
      entity: entityLabel,
      entityId: updated.id,
      userId: (session.user as any).id,
      data: { fields, fieldsCleared, slug: updated.slug }
    });
    trackMetric('rituals.patch.success', 1, { slug: params.slug, fields: Object.keys(partial).length });
    return Response.json({ ok: true, data: updated, rateLimit: formatRateLimitHeaders(rl,30) });
  } catch (e: any) {
    if (debug) {
      try {
        console.error('[rituals.patch] debug error context', { body, partial });
      } catch {}
    }
    captureException(e);
    trackMetric('rituals.patch.error', 1, { slug: params.slug });
    return Response.json({ ok: false, error: { code: e.code === 'P2025' ? 'NOT_FOUND' : 'UPDATE_FAILED', message: e.message || 'Update error' } }, { status: e.code === 'P2025' ? 404 : 500, headers: formatRateLimitHeaders({ remaining: 0, reset: Date.now()+60_000 },30) });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const entityLabel = resolveEntityLabel(req);
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  if (role !== 'ADMIN') return Response.json({ ok: false, error: { code: 'FORBIDDEN' } }, { status: 403 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`ritualDelete:${params.slug}:${ip}`, 10, 60_000);
  if (!rl.allowed) return Response.json({ ok: false, error: { code: 'RATE_LIMIT', message: 'Too many deletes' } }, { status: 429, headers: formatRateLimitHeaders(rl,10) });
  try {
    const deleted = await prisma.venture.delete({ where: { slug: params.slug } });
    await logAudit({ action: 'DELETE', entity: entityLabel, entityId: deleted.id, userId: (session.user as any).id, data: { slug: deleted.slug } });
    return Response.json({ ok: true, data: deleted, rateLimit: formatRateLimitHeaders(rl,10) });
  } catch (e: any) {
    return Response.json({ ok: false, error: { code: e.code === 'P2025' ? 'NOT_FOUND' : 'DELETE_FAILED', message: e.message || 'Delete error' } }, { status: e.code === 'P2025' ? 404 : 500, headers: formatRateLimitHeaders({ remaining: 0, reset: Date.now()+60_000 },10) });
  }
}
