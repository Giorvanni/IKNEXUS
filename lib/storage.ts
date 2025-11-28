import { PutObjectCommand, S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type StoredObject = { url: string; filename: string; size: number; provider: string };

interface StorageProvider {
  upload(buffer: Buffer, filename: string, contentType?: string): Promise<StoredObject>;
  presign?(filename: string, contentType?: string): Promise<{ url: string; fields?: Record<string,string>; publicUrl?: string }>;
  initiateMultipart?(filename: string, contentType?: string): Promise<{ uploadId: string; key: string }>;
  presignPart?(key: string, uploadId: string, partNumber: number): Promise<{ url: string; partNumber: number }>;
  completeMultipart?(key: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]): Promise<{ url: string; key: string }>;
}

class S3Storage implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  constructor() {
    this.bucket = process.env.S3_BUCKET || '';
    this.client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
      } : undefined
    });
  }
  async upload(buffer: Buffer, filename: string, contentType?: string): Promise<StoredObject> {
    if (!this.bucket) throw new Error('S3 bucket not configured');
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: buffer,
      ContentType: contentType
    }));
    const url = `https://${this.bucket}.s3.amazonaws.com/${encodeURIComponent(filename)}`;
    return { url, filename, size: buffer.length, provider: 's3' };
  }
  async presign(filename: string, contentType?: string) {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: filename, ContentType: contentType });
    const url = await getSignedUrl(this.client, command, { expiresIn: 900 }); // 15m
    const publicUrl = `https://${this.bucket}.s3.amazonaws.com/${encodeURIComponent(filename)}`;
    return { url, publicUrl };
  }
  async initiateMultipart(filename: string, contentType?: string) {
    const cmd = new CreateMultipartUploadCommand({ Bucket: this.bucket, Key: filename, ContentType: contentType });
    const res = await this.client.send(cmd);
    return { uploadId: res.UploadId!, key: filename };
  }
  async presignPart(key: string, uploadId: string, partNumber: number) {
    const cmd = new UploadPartCommand({ Bucket: this.bucket, Key: key, UploadId: uploadId, PartNumber: partNumber, Body: Buffer.from('') });
    const url = await getSignedUrl(this.client, cmd, { expiresIn: 900 });
    return { url, partNumber };
  }
  async completeMultipart(key: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
    const cmd = new CompleteMultipartUploadCommand({ Bucket: this.bucket, Key: key, UploadId: uploadId, MultipartUpload: { Parts: parts } });
    await this.client.send(cmd);
    return { url: `https://${this.bucket}.s3.amazonaws.com/${encodeURIComponent(key)}`, key };
  }
}

class VercelBlobStorage implements StorageProvider {
  async upload(buffer: Buffer, filename: string, contentType?: string): Promise<StoredObject> {
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, buffer, { access: 'public', contentType });
    return { url: blob.url, filename, size: buffer.length, provider: 'vercel-blob' };
  }
}

class LocalStorage implements StorageProvider {
  async upload(buffer: Buffer, filename: string): Promise<StoredObject> {
    // In dev we could write to /public/uploads (omitted here for simplicity)
    const url = `/uploads/${Date.now()}-${filename}`;
    return { url, filename, size: buffer.length, provider: 'local' };
  }
  async presign(filename: string, _contentType?: string) {
    // Point to internal API route that will accept the binary body and persist to /public/uploads
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return { url: `/api/media/local-upload?filename=${encodeURIComponent(safe)}`, publicUrl: `/uploads/${encodeURIComponent(safe)}` };
  }
  async initiateMultipart(filename: string) {
    return { uploadId: 'local-upload', key: filename };
  }
  async presignPart(key: string, uploadId: string, partNumber: number) {
    return { url: `/local-multipart/${uploadId}/${key}/part/${partNumber}`, partNumber };
  }
  async completeMultipart(key: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
    return { url: `/uploads/${key}`, key };
  }
}

let providerInstance: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (providerInstance) return providerInstance;
  const kind = (process.env.STORAGE_PROVIDER || '').toLowerCase();
  if (kind === 's3') providerInstance = new S3Storage();
  else if (kind === 'vercel-blob') providerInstance = new VercelBlobStorage();
  else providerInstance = new LocalStorage();
  return providerInstance;
}
