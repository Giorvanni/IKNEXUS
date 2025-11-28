import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { getStorageProvider } from '../../../../../lib/storage';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return new Response('Invalid JSON', { status: 400 });
  const { key, uploadId, partNumber } = body as { key?: string; uploadId?: string; partNumber?: number };
  if (!key || !uploadId || !partNumber) return new Response('key, uploadId, partNumber required', { status: 400 });
  const provider = getStorageProvider();
  if (!provider.presignPart) return new Response('Multipart part presign unsupported', { status: 400 });
  const part = await provider.presignPart(key, uploadId, partNumber);
  return Response.json({ ok: true, data: part });
}