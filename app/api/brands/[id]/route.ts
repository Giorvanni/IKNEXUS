import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { logAudit } from '../../../../lib/audit';
import { isContrastAcceptable } from '../../../../lib/contrast';
import { unauthorized, forbidden, fail, ok, validation, rateLimited } from '../../../../lib/errors';
import { rateLimit, formatRateLimitHeaders } from '../../../../lib/rateLimit';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN') return forbidden();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`brandPatch:${params.id}:${ip}`, 30, 60_000);
  if (!rl.allowed) return rateLimited('Too many updates', { ...formatRateLimitHeaders(rl, 30) });
  const body = await req.json().catch(() => null);
  if (!body) return fail('INVALID_JSON', 400, 'Invalid JSON', undefined, formatRateLimitHeaders(rl, 30));
  const { primaryColor, secondaryColor, name, showInNav, navOrder, logoUrl } = body;
  const update: any = {};
  if (primaryColor) update.primaryColor = primaryColor;
  if (secondaryColor) update.secondaryColor = secondaryColor;
  if (name) update.name = name;
  if (typeof showInNav === 'boolean') update.showInNav = showInNav;
  if (typeof navOrder === 'number') update.navOrder = navOrder;
  if (logoUrl) update.logoUrl = logoUrl;
  if (update.primaryColor && update.secondaryColor) {
    const ok = isContrastAcceptable(update.primaryColor, update.secondaryColor);
    if (!ok) return validation({ field: 'colors', issue: 'contrast', message: 'Colors do not meet WCAG contrast ratio 4.5:1' }, formatRateLimitHeaders(rl, 30));
  }
  try {
    const brand = await prisma.brand.update({ where: { id: params.id }, data: update });
    await logAudit({ action: 'UPDATE', entity: 'Brand', entityId: brand.id, userId: (session.user as any).id, data: Object.keys(update) });
    return ok(brand, formatRateLimitHeaders(rl, 30));
  } catch (e: any) {
    return fail('UPDATE_FAILED', 500, e.message, undefined, formatRateLimitHeaders(rl, 30));
  }
}