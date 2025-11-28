import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'ADMIN' && role !== 'EDITOR')) return new Response('Unauthorized', { status: 401 });
  const count = await prisma.imageProcessingJob.count({ where: { status: 'PENDING' } });
  return Response.json({ ok: true, data: { pending: count } });
}
