import 'dotenv/config';
import { prisma } from '../lib/prisma';
import sharp from 'sharp';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { captureException } from '../lib/sentry';
import { trackMetric, recordLatency } from '../lib/metrics';

async function processJob(jobId: string) {
  const started = Date.now();
  const job = await prisma.imageProcessingJob.findUnique({ where: { id: jobId } });
  if (!job) return;
  await prisma.imageProcessingJob.update({ where: { id: job.id }, data: { status: 'PROCESSING' } });
  const asset = await prisma.mediaAsset.findUnique({ where: { id: job.mediaAssetId } });
  if (!asset || !process.env.S3_BUCKET) {
    await prisma.imageProcessingJob.update({ where: { id: job.id }, data: { status: 'ERROR', error: 'Missing asset or S3 bucket' } });
    return;
  }
  const widths: number[] = Array.isArray(job.widths) ? (job.widths as any) : [320, 640];
  const client = new S3Client({ region: process.env.S3_REGION || 'us-east-1' });
  try {
    const originalKey = asset.filename;
    const originalObj = await client.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: originalKey }));
    const bytes = await originalObj.Body!.transformToByteArray();
    for (const w of widths) {
      const resized = await sharp(Buffer.from(bytes)).resize({ width: w }).toFormat('webp', { quality: 80 }).toBuffer();
      const variantKey = originalKey.replace(/(\.[a-zA-Z0-9]+)?$/, `_${w}.webp`);
      await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: variantKey, Body: resized, ContentType: 'image/webp', CacheControl: 'public,max-age=31536000,immutable' }));
      await prisma.mediaAssetVariant.create({ data: { mediaAssetId: asset.id, width: w, height: w, format: 'webp', url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${encodeURIComponent(variantKey)}` } });
    }
    await prisma.imageProcessingJob.update({ where: { id: job.id }, data: { status: 'DONE' } });
    trackMetric('imageWorker.job.done', 1);
    recordLatency('imageWorker.job_ms', Date.now() - started);
  } catch (e: any) {
    await prisma.imageProcessingJob.update({ where: { id: job.id }, data: { status: 'ERROR', error: e.message } });
    captureException(e);
    trackMetric('imageWorker.job.error', 1);
  }
}

async function loop() {
  if ((process.env.QUEUE_PROVIDER || '').toLowerCase() === 'qstash') {
    console.log('Image worker: queue mode enabled (QStash); rely on HTTP-triggered processing. Exiting poll loop.');
    return;
  }
  while (true) {
    const pending = await prisma.imageProcessingJob.findFirst({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } });
    if (pending) await processJob(pending.id);
    await new Promise(r => setTimeout(r, 3000)); // poll every 3s
  }
}

loop();