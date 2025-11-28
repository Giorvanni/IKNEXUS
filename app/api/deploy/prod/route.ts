import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { ok, fail, unauthorized, forbidden } from '../../../../lib/errors';
import { logAudit } from '../../../../lib/audit';

export async function POST(_req: NextRequest) {
  const session: any = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN') return forbidden();

  const hook = process.env.VERCEL_DEPLOY_HOOK_PROD;
  if (!hook) {
    return fail('INTERNAL', 500, 'Production deploy hook not configured');
  }

  try {
    const res = await fetch(hook, { method: 'POST' });
    const text = await res.text();
    await logAudit({
      action: 'TRIGGER',
      entity: 'Deploy',
      data: { environment: 'production', responseStatus: res.status, meta: { path: '/api/deploy/prod' } },
      userId: session?.user?.id
    });
    if (!res.ok) {
      return fail('INTERNAL', 502, 'Deploy hook call failed', { status: res.status, body: text });
    }
    return ok({ triggered: true, status: res.status });
  } catch (e: any) {
    return fail('INTERNAL', 500, e.message || 'Deploy trigger failed');
  }
}

export const runtime = 'nodejs';
