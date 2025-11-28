import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { logAudit } from '../../../lib/audit';
import { getStorageProvider } from '../../../lib/storage';
import { enqueueImageProcessing } from '../../../lib/queue';
import { findDuplicate } from '../../../lib/mediaDuplicate';
import { env } from '../../../lib/env';
import { fail, unauthorized, validation as validationError } from '../../../lib/errors';

export const runtime = 'nodejs'; // Use Next.js supported runtime identifier

const ALLOWED_MIME = env.ALLOWED_UPLOAD_MIME.split(',').map((type) => type.trim()).filter(Boolean);
const ALLOWED_MIME_SET = new Set(ALLOWED_MIME);
const MAX_BYTES = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();
  const formData = await req.formData().catch(() => null);
  if (!formData) return validationError({ message: 'Invalid form data' });
  const file = formData.get('file');
  const brandId = String(formData.get('brandId') || '');
  if (!(file instanceof File)) return validationError({ message: 'file field required' });
  if (!brandId) return validationError({ message: 'brandId required' });
  if (!file.type || !ALLOWED_MIME_SET.has(file.type)) {
    return fail('VALIDATION', 400, 'Unsupported file type', { allowed: ALLOWED_MIME });
  }
  if (file.size > MAX_BYTES) {
    return fail('PAYLOAD_TOO_LARGE', 413, `File exceeds ${env.MAX_UPLOAD_SIZE_MB}MB limit`);
  }
  const arrayBuffer = await file.arrayBuffer();
  const provider = getStorageProvider();
  const filename = `${Date.now()}-${file.name}`;
  const buffer = Buffer.from(arrayBuffer);
  let pHash: string | undefined;
  try {
    const dup = await findDuplicate(buffer, prisma);
    pHash = dup.pHash;
    if (dup.duplicate && dup.asset) {
      return Response.json({ ok: true, data: dup.asset, duplicateOf: dup.asset.id, provider: dup.asset.url.includes('s3') ? 's3' : 'unknown', duplicate: true }, { status: 200 });
    }
  } catch (e) {
    pHash = undefined;
  }
  const stored = await provider.upload(buffer, filename, file.type);
  const asset = await prisma.mediaAsset.create({
    data: {
      filename: stored.filename,
      url: stored.url,
      mimeType: file.type,
      brandId,
      uploadedByUserId: (session.user as any).id
      , pHash
    }
  });
  await logAudit({ action: 'UPLOAD_MEDIA', entity: 'MediaAsset', entityId: asset.id, userId: (session.user as any).id, data: { filename: asset.filename } });
  // Enqueue image processing job (background variants)
  const defaultWidths = (process.env.IMAGE_VARIANT_WIDTHS || '320,640,1280').split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n) && n > 0).slice(0, 6);
  try {
    await prisma.imageProcessingJob.create({ data: { mediaAssetId: asset.id, widths: defaultWidths, status: 'PENDING' } });
    await enqueueImageProcessing({ key: asset.filename, widths: defaultWidths });
  } catch {}
  return Response.json({ ok: true, data: asset, provider: stored.provider }, { status: 201 });
}