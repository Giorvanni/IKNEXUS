import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { ok, unauthorized, forbidden, fail } from '../../../../lib/errors';
import prisma from '../../../../lib/prisma';

export async function GET(_req: NextRequest) {
  const session: any = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN') return forbidden();

  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) {
    return ok({ deployments: [], note: 'VERCEL_TOKEN or VERCEL_PROJECT_ID missing' });
  }
  try {
    const url = `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!res.ok) return fail('INTERNAL', 502, 'Vercel API failed', { status: res.status });
    const j = await res.json();
    const deployments = (j?.deployments || []).map((d: any) => ({
      uid: d.uid,
      url: d.url,
      name: d.name,
      readyState: d.readyState || d.state,
      createdAt: d.createdAt,
      target: d.target || (d.meta?.githubCommitRef === 'main' ? 'production' : 'preview')
    }));
    // Persist to DB (idempotent upsert by uid)
    for (const d of deployments) {
      try {
        await prisma.deploymentLog.upsert({
          where: { uid: d.uid },
          update: {
            url: d.url,
            name: d.name,
            readyState: d.readyState,
            target: d.target,
            deployedAt: d.createdAt ? new Date(d.createdAt) : new Date(),
          },
          create: {
            uid: d.uid,
            url: d.url,
            name: d.name,
            readyState: d.readyState,
            target: d.target,
            deployedAt: d.createdAt ? new Date(d.createdAt) : new Date(),
            source: 'vercel'
          }
        });
      } catch (_e) {
        // Swallow persistence errors to not block status response
      }
    }
    return ok({ deployments });
  } catch (e: any) {
    return fail('INTERNAL', 500, e.message || 'Failed to fetch deployments');
  }
}

export const runtime = 'nodejs';
