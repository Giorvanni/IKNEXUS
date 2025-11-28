import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { ok, unauthorized, forbidden, fail, validation } from '../../../../lib/errors';

export const runtime = 'nodejs';

export async function GET() {
  // simple reachability check
  console.log('[reports] GET /api/reports/aggregate reached');
  return ok({ message: 'reports aggregate reachable' });
}

export async function POST(req: NextRequest) {
  // Auth: ADMIN or EDITOR
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN' && role !== 'EDITOR') return forbidden();

  let body: any = null;
  try { body = await req.json(); } catch {}
  const domain: string | undefined = body?.domain;
  if (!domain) return validation({ field: 'domain', issue: 'required' });

  // Early log to confirm invocations in any environment
  console.log(`[reports] aggregate invoked for domain=${domain}`);

  // Use shared aggregator logic (no external calls here)
  try {
    const { aggregateForDomain } = require('../../../../scripts/aggregator.js');
    const report = await aggregateForDomain({ prisma, domain, outputToFile: true });
    return ok(report);
  } catch (e: any) {
    return fail('INTERNAL', 500, e.message || 'Aggregation failed');
  }
}
