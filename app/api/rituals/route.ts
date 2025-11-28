import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { rateLimit, formatRateLimitHeaders } from '../../../lib/rateLimit';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { validateRitual } from '../../../lib/validation';
import { logAudit } from '../../../lib/audit';
import { ok, validation as vfail, rateLimited, unauthorized, forbidden, fail } from '../../../lib/errors';

function resolveEntityLabel(req: Request): 'Ritual' | 'Venture' {
  try {
    const pathname = new URL(req.url).pathname;
    return pathname.includes('/api/ventures') ? 'Venture' : 'Ritual';
  } catch {
    return 'Ritual';
  }
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`rituals:${ip}`, 60, 60_000); // 60 requests per minute
  if (!rl.allowed) return rateLimited('Too many requests', { 'Retry-After': '60', ...formatRateLimitHeaders(rl, 60) });
  const rituals = await prisma.venture.findMany({ orderBy: { createdAt: 'asc' } });
  return ok(rituals, { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', ...formatRateLimitHeaders(rl, 60) });
}

export async function POST(req: NextRequest) {
  const entityLabel = resolveEntityLabel(req);
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN' && role !== 'EDITOR') return forbidden();
  const body = await req.json().catch(() => null);
  if (!body) return fail('INVALID_JSON', 400, 'Invalid JSON');
  const parsed = validateRitual(body);
  if (!parsed.success) return vfail(parsed.error.issues);
  const existing = await prisma.venture.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    const base = parsed.data.slug;
    const suggestions: string[] = [];
    for (let i = 2; i <= 4; i++) {
      const candidate = `${base}-${i}`;
      const taken = await prisma.venture.findUnique({ where: { slug: candidate } });
      if (!taken) suggestions.push(candidate);
      if (suggestions.length >= 2) break;
    }
    return fail('SLUG_EXISTS', 409, 'Slug already in use', { suggestions });
  }
  try {
    const created = await prisma.venture.create({ data: parsed.data });
    await logAudit({ action: 'CREATE', entity: entityLabel, entityId: created.id, userId: (session.user as any).id, data: { slug: created.slug } });
    return ok(created, { 'X-Created': '1' });
  } catch (e: any) {
    return fail('CREATE_FAILED', 500, e.message || 'Error creating ritueel');
  }
}

