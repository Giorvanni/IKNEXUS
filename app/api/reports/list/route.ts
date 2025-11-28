import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { unauthorized, forbidden, ok, fail, validation, rateLimited } from '../../../../lib/errors';
import { rateLimit, formatRateLimitHeaders } from '../../../../lib/rateLimit';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function toPublicUrlLocal(domain: string, name: string) {
  return `/reports/${encodeURIComponent(domain)}/${encodeURIComponent(name)}`;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session) return unauthorized();
  if (role !== 'ADMIN' && role !== 'EDITOR') return forbidden();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`reportsList:${ip}`, 30, 60_000);
  if (!rl.allowed) return rateLimited('Too many requests', { ...formatRateLimitHeaders(rl, 30) });
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || '';
  if (!domain) return validation({ field: 'domain', issue: 'required' }, formatRateLimitHeaders(rl, 30));

  const storage = (process.env.REPORTS_STORAGE || 'local').toLowerCase();
  if (storage === 's3') {
    try {
      const bucket = process.env.REPORTS_BUCKET || process.env.S3_BUCKET;
      if (!bucket) throw new Error('REPORTS_BUCKET or S3_BUCKET not set');
      const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
      const client = new S3Client({ region: process.env.S3_REGION || 'us-east-1' });
      const prefix = `reports/${domain}/`;
      const out = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: 20 }));
      const contents = (out.Contents || []).filter((o: any) => o.Key && o.Key.endsWith('.json'));
      contents.sort((a: any, b: any) => new Date(b.LastModified).getTime() - new Date(a.LastModified).getTime());
      const top = contents.slice(0, 5).map((o: any) => ({ key: o.Key, size: o.Size, lastModified: o.LastModified, url: `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(o.Key)}` }));
      return ok({ storage: 's3', items: top }, formatRateLimitHeaders(rl, 30));
    } catch (e: any) {
      return fail('INTERNAL', 500, e.message, undefined, formatRateLimitHeaders(rl, 30));
    }
  }

  // local
  try {
    const base = path.join(process.cwd(), 'public', 'reports', domain);
  if (!fs.existsSync(base)) return ok({ storage: 'local', items: [] }, formatRateLimitHeaders(rl, 30));
    const files = fs.readdirSync(base).filter((n) => n.endsWith('.json'));
    // Sort by name when names are timestamps, falling back to fs stats
    files.sort((a, b) => b.localeCompare(a));
    const items = files.slice(0, 5).map((name) => {
      const stat = fs.statSync(path.join(base, name));
      return { name, size: stat.size, mtime: stat.mtime.toISOString(), url: toPublicUrlLocal(domain, name) };
    });
    return ok({ storage: 'local', items }, formatRateLimitHeaders(rl, 30));
  } catch (e: any) {
    return fail('INTERNAL', 500, e.message, undefined, formatRateLimitHeaders(rl, 30));
  }
}
