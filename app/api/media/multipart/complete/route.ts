import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { getStorageProvider } from '../../../../../lib/storage';
import { prisma } from '../../../../../lib/prisma';
import { enqueueImageProcessing } from '../../../../../lib/queue';
import { withSentry } from '../../../../../lib/sentry';
import { trackMetric } from '../../../../../lib/metrics';
import crypto from 'crypto';
import { env } from '../../../../../lib/env';
import { fail, ok, unauthorized, validation as validationError } from '../../../../../lib/errors';
import { logAudit } from '../../../../../lib/audit';

const ALLOWED_MIME = env.ALLOWED_UPLOAD_MIME.split(',').map((type) => type.trim()).filter(Boolean);
const ALLOWED_MIME_SET = new Set(ALLOWED_MIME);
const MAX_MB = env.MAX_UPLOAD_SIZE_MB;

export const POST = withSentry(async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body) return fail('INVALID_JSON', 400, 'Invalid JSON');
  const { key, uploadId, parts, brandId, mimeType, sizeMB, sha256 } = body as { key?: string; uploadId?: string; parts?: { ETag: string; PartNumber: number }[]; brandId?: string; mimeType?: string; sizeMB?: number; sha256?: string };
  const issues: string[] = [];
  if (!key) issues.push('key required');
  if (!uploadId) issues.push('uploadId required');
  if (!Array.isArray(parts) || !parts.length) issues.push('parts required');
  if (!brandId) issues.push('brandId required');
  if (!mimeType) issues.push('mimeType required');
  if (mimeType && !ALLOWED_MIME_SET.has(mimeType)) issues.push('unsupported mimeType');
  if (typeof sizeMB === 'number' && sizeMB > MAX_MB) issues.push(`file exceeds ${MAX_MB}MB limit`);
  if (issues.length) return validationError({ issues });
  const provider = getStorageProvider();
  if (!provider.completeMultipart) return fail('CREATE_FAILED', 400, 'Multipart complete unsupported for current provider');
  const completed = await provider.completeMultipart(key!, uploadId!, parts!);

  // Optional integrity verification for smaller files
  const MAX_VERIFY_MB = Number(process.env.MAX_VERIFY_SIZE_MB || '50');
  if (sha256 && typeof sizeMB === 'number' && sizeMB <= MAX_VERIFY_MB && process.env.S3_BUCKET) {
    try {
      const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
      const client = new S3Client({ region: process.env.S3_REGION || 'us-east-1' });
      const obj = await client.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key! }));
      const bytes = await obj.Body!.transformToByteArray();
      const hash = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
      if (hash !== sha256.toLowerCase()) {
        return fail('VALIDATION', 422, 'Checksum mismatch');
      }
    } catch (e) {
      // If verification fails unexpectedly, continue but log via metrics; production may opt to fail hard
      trackMetric('media.multipart.verify.error', 1);
    }
  }
  const asset = await prisma.mediaAsset.create({ data: { filename: key!, url: completed.url, mimeType: mimeType!, brandId, uploadedByUserId: (session.user as any).id } });
  await logAudit({ action: 'UPLOAD_MEDIA', entity: 'MediaAsset', entityId: asset.id, userId: (session.user as any).id, data: { filename: asset.filename } });
  // Enqueue background processing for variants
  const defaultWidths = (process.env.IMAGE_VARIANT_WIDTHS || '320,640,1280').split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n) && n > 0).slice(0, 6);
  try {
    await prisma.imageProcessingJob.create({ data: { mediaAssetId: asset.id, widths: defaultWidths, status: 'PENDING' } });
    await enqueueImageProcessing({ key: asset.filename, widths: defaultWidths });
  } catch {}
  trackMetric('media.multipart.complete', 1);
  return ok(asset);
});