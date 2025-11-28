import { NextRequest } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== 'ADMIN') return new Response('Unauthorized', { status: 401 });
  const draft = await prisma.navigationLinkDraft.findUnique({ where: { id: params.id } });
  if (!draft) return new Response('Draft not found', { status: 404 });
  const published = await prisma.navigationLink.create({ data: { label: draft.label, href: draft.href, order: draft.order, brandId: draft.brandId } });
  await prisma.navigationLinkDraft.delete({ where: { id: draft.id } });
  return Response.json({ ok: true, data: published });
}