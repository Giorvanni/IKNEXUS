import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { getStorageProvider } from '../../../../../lib/storage';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return new Response('Invalid JSON', { status: 400 });
  const { filename, contentType } = body as { filename?: string; contentType?: string };
  if (!filename) return new Response('filename required', { status: 400 });
  const provider = getStorageProvider();
  if (!provider.initiateMultipart) return new Response('Multipart unsupported for provider', { status: 400 });
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const init = await provider.initiateMultipart(safeName, contentType);
  return Response.json({ ok: true, data: { uploadId: init.uploadId, key: init.key } });
}