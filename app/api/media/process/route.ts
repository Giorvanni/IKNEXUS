import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { prisma } from '../../../../lib/prisma';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';

// Simple thumbnail generation endpoint (synchronous). For large scale move to background queue.
export async function POST(req: NextRequest) {
  if (!process.env.S3_BUCKET) return new Response('S3 not configured', { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body) return new Response('Invalid JSON', { status: 400 });
  const { key, widths = [320, 640] } = body as { key?: string; widths?: number[] };
  if (!key) return new Response('key required', { status: 400 });
  const client = new S3Client({ region: process.env.S3_REGION || 'us-east-1' });
  try {
    const original = await client.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    const arrayBuffer = await original.Body!.transformToByteArray();
    const variants: { width: number; url: string }[] = [];
    for (const w of widths.slice(0, 6)) { // safety cap
      const resized = await sharp(Buffer.from(arrayBuffer)).resize({ width: w }).toFormat('webp', { quality: 80 }).toBuffer();
      const variantKey = key.replace(/(\.[a-zA-Z0-9]+)?$/, `_${w}.webp`);
      await client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: variantKey,
        Body: resized,
        ContentType: 'image/webp',
        CacheControl: 'public,max-age=31536000,immutable'
      }));
      variants.push({ width: w, url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${encodeURIComponent(variantKey)}` });
      // Record variant in DB if original asset exists
      const originalAsset = await prisma.mediaAsset.findFirst({ where: { filename: key } });
      if (originalAsset) {
        await prisma.mediaAssetVariant.create({ data: { mediaAssetId: originalAsset.id, width: w, height: w, format: 'webp', url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${encodeURIComponent(variantKey)}` } });
      }
    }
    return Response.json({ ok: true, data: { variants } });
  } catch (e: any) {
    return Response.json({ ok: false, error: { code: 'PROCESS_FAIL', message: e.message } }, { status: 500 });
  }
}