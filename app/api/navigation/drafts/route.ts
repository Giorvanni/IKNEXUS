import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const drafts = await prisma.navigationLinkDraft.findMany({ orderBy: { order: 'asc' } });
  return Response.json({ ok: true, data: drafts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'ADMIN' && role !== 'EDITOR')) return new Response('Unauthorized', { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return new Response('Invalid JSON', { status: 400 });
  const { label, href, order = 0, brandId } = body as any;
  if (!label || !href || !brandId) return new Response('label, href, brandId required', { status: 400 });
  const draft = await prisma.navigationLinkDraft.create({ data: { label, href, order, brandId } });
  return Response.json({ ok: true, data: draft }, { status: 201 });
}