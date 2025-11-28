import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { ok, unauthorized, forbidden, fail } from '../../../../lib/errors';

export async function GET(_req: NextRequest) {
  const session: any = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN') return forbidden();

  try {
    const logs = await prisma.deploymentLog.findMany({
      orderBy: { deployedAt: 'desc' },
      take: 20,
      select: {
        uid: true,
        url: true,
        name: true,
        readyState: true,
        target: true,
        deployedAt: true,
        source: true,
      }
    });
    return ok({ logs: logs.map(l => ({
      uid: l.uid,
      url: l.url,
      name: l.name,
      readyState: l.readyState,
      target: l.target,
      deployedAt: l.deployedAt.getTime(),
      source: l.source,
    })) });
  } catch (e: any) {
    return fail('INTERNAL', 500, e?.message || 'Failed to load history');
  }
}

export const runtime = 'nodejs';
