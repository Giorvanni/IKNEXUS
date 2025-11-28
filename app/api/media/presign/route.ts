import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getStorageProvider } from '../../../../lib/storage';
import { withSentry } from '../../../../lib/sentry';
import { trackMetric } from '../../../../lib/metrics';
import { env } from '../../../../lib/env';
import { unauthorized, validation, fail, ok, rateLimited } from '../../../../lib/errors';
import { rateLimit, formatRateLimitHeaders } from '../../../../lib/rateLimit';

const ALLOWED_MIME = env.ALLOWED_UPLOAD_MIME.split(',');
const MAX_MB = env.MAX_UPLOAD_SIZE_MB;

export const POST = withSentry(async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();
  // Simple rate limit: 20 presigns per user per minute
  const userId = (session as any)?.user?.id || 'anon';
  const rl = await rateLimit(`media:presign:${userId}`, 20, 60_000);
  if (!rl.allowed) {
    return rateLimited('Too many upload presign requests', formatRateLimitHeaders(rl, 20));
  }
  const body = await req.json().catch(() => null);
  if (!body) return fail('INVALID_JSON', 400, 'Invalid JSON');
  const { filename, contentType, sizeMB, checksum } = body as { filename?: string; contentType?: string; sizeMB?: number; checksum?: string };
  const issues: string[] = [];
  if (!filename) issues.push('filename required');
  if (filename && filename.length > 180) issues.push('filename too long');
  if (!contentType) issues.push('contentType required');
  if (contentType && !ALLOWED_MIME.includes(contentType)) issues.push('unsupported contentType');
  if (typeof sizeMB === 'number' && sizeMB > MAX_MB) issues.push('file too large');
  if (checksum && !/^[a-fA-F0-9]{64}$/.test(checksum)) issues.push('checksum must be 64 hex chars (sha256)');
  if (issues.length) return validation({ issues });
  const provider = getStorageProvider();
  if (!provider.presign) return fail('CREATE_FAILED', 400, 'Presign unsupported for current provider');
  const safeName = `${Date.now()}-${filename!.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const presigned = await provider.presign(safeName, contentType!);
  trackMetric('media.presign.success', 1);
  return ok({ url: presigned.url, filename: safeName, contentType, publicUrl: presigned.publicUrl || null, maxSizeMB: MAX_MB, allowedMime: ALLOWED_MIME, checksumAccepted: !!checksum }, formatRateLimitHeaders(rl, 20));
});