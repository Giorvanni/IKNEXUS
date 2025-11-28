import { NextRequest } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'ADMIN' && role !== 'EDITOR')) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get('brandId') || undefined;
  const where = brandId ? { brandId } : {};
  const count = await prisma.venture.count({ where });
  return Response.json({ ok: true, data: { count } });
}
