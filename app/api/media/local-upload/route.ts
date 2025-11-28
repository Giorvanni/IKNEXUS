import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const filename = url.searchParams.get('filename');
  if (!filename) return new Response('filename required', { status: 400 });
  const contentType = req.headers.get('content-type') || 'application/octet-stream';
  if (!contentType.startsWith('image/')) return new Response('unsupported contentType', { status: 400 });
  try {
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const fullPath = path.join(uploadsDir, filename);
    await fs.writeFile(fullPath, buffer);
    return Response.json({ ok: true, url: `/uploads/${filename}`, size: buffer.length, contentType });
  } catch (e: any) {
    return Response.json({ ok: false, error: { message: e.message || 'write failed' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Allow POST as alias for PUT for convenience
  return PUT(req);
}
