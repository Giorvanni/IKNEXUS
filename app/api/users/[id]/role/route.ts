import { NextRequest } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { logAudit } from '../../../../../lib/audit';
import { unauthorized, forbidden, fail, ok, validation } from '../../../../../lib/errors';
import { rateLimit, formatRateLimitHeaders } from '../../../../../lib/rateLimit';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN') return forbidden();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`userRolePatch:${params.id}:${ip}`, 30, 60_000);
  if (!rl.allowed) return fail('RATE_LIMIT', 429, 'Too many updates', undefined, formatRateLimitHeaders(rl, 30));
  const body = await req.json().catch(() => null);
  if (!body) return fail('INVALID_JSON', 400, 'Invalid JSON', undefined, formatRateLimitHeaders(rl, 30));
  const { role: newRole } = body as { role?: string };
  if (!newRole || !['ADMIN','EDITOR','VIEWER'].includes(newRole)) {
    return validation({ field: 'role', issue: 'invalid' }, formatRateLimitHeaders(rl, 30));
  }
  try {
    const user = await prisma.user.update({ where: { id: params.id }, data: { role: newRole as any } });
    await logAudit({ action: 'ROLE_CHANGE', entity: 'User', entityId: user.id, userId: (session.user as any).id, data: { role: newRole } });
    return ok(user, formatRateLimitHeaders(rl, 30));
  } catch (e: any) {
    return fail('UPDATE_FAILED', 500, e.message, undefined, formatRateLimitHeaders(rl, 30));
  }
}