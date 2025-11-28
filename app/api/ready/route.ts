import { NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';
import { ok, fail } from '../../../lib/errors';
import fs from 'fs';
import path from 'path';

// Extended readiness probe: deeper than /api/health.
// Focus: required services & critical data presence (brands), optional external integrations.
export async function GET(_req: NextRequest) {
  const started = Date.now();
  const checks: Record<string, any> = {
    db: { ok: false },
    redis: { ok: null },
    storage: { ok: null },
    brandData: { ok: false },
    env: { ok: true },
    migrations: { ok: null }
  };
  let overallOk = true;

  // DB connectivity + simple query timing
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const brandCount = await prisma.brand.count();
    checks.db = { ok: true, ms: Date.now() - t0 };
    checks.brandData = { ok: brandCount > 0, count: brandCount };
    if (brandCount === 0) overallOk = false;
  } catch (e: any) {
    checks.db = { ok: false, error: e.message };
    overallOk = false;
  }

  // Redis (Upstash) optional
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const t0 = Date.now();
      const { Redis } = require('@upstash/redis');
      const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
      const pong = await redis.ping();
      checks.redis = { ok: pong === 'PONG' || pong === 'pong', ms: Date.now() - t0 };
      if (!checks.redis.ok) overallOk = false;
    } catch (e: any) {
      checks.redis = { ok: false, error: e.message };
      overallOk = false;
    }
  }

  // Storage provider presence (S3 bucket head) optional
  if (process.env.STORAGE_PROVIDER === 's3' && process.env.S3_BUCKET) {
    try {
      const t0 = Date.now();
      const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
      const s3 = new S3Client({ region: process.env.S3_REGION || 'us-east-1' });
      await s3.send(new HeadBucketCommand({ Bucket: process.env.S3_BUCKET }));
      checks.storage = { ok: true, ms: Date.now() - t0, provider: 's3' };
    } catch (e: any) {
      checks.storage = { ok: false, error: e.message, provider: 's3' };
      overallOk = false;
    }
  } else if (process.env.STORAGE_PROVIDER) {
    // Non-s3 providers considered ready if env set
    checks.storage = { ok: true, provider: process.env.STORAGE_PROVIDER };
  }

  // Minimal env surface summary (do not leak secrets)
  const requiredEnv = ['DATABASE_URL','NEXTAUTH_SECRET'];
  const missing = requiredEnv.filter(k => !(process.env as any)[k]);
  if (missing.length) {
    checks.env = { ok: false, missing };
    overallOk = false;
  } else {
    checks.env = { ok: true };
  }

  // Migration readiness: compare applied vs files present
  try {
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
    let files: string[] = [];
    if (fs.existsSync(migrationsDir)) {
      try {
        const entries = (fs as any).readdirSync(migrationsDir, { withFileTypes: true });
        files = entries
          .filter((e: any) => e.isDirectory())
          .map((e: any) => e.name)
          .filter((name: string) => /^\d{14}_.+/.test(name));
      } catch {
        // Fallback for environments without withFileTypes support
        files = fs.readdirSync(migrationsDir).filter((d) => /^\d{14}_.+/.test(d));
      }
    }
    const applied = await (prisma as any).$queryRawUnsafe(`SELECT COUNT(*) as count FROM _prisma_migrations`).then((rows: any) => {
      const row = Array.isArray(rows) ? rows[0] : rows;
      return typeof row?.count === 'number' ? row.count : parseInt(row?.count || '0', 10) || 0;
    }).catch(() => 0);
    const pending = Math.max(files.length - applied, 0);
    checks.migrations = { ok: pending === 0, applied, files: files.length, pending };
    if (pending > 0) overallOk = false;
  } catch (e: any) {
    checks.migrations = { ok: null, error: e.message };
  }

  if (!overallOk) {
    const ms = Date.now() - started;
    try { const { recordLatency } = require('../../../lib/metrics'); recordLatency('api_ready', ms); } catch {}
    return fail('INTERNAL', 503, 'Service not ready', { checks });
  }
  const ms = Date.now() - started;
  try { const { recordLatency } = require('../../../lib/metrics'); recordLatency('api_ready', ms); } catch {}
  return ok({ checks });
}
export const runtime = 'nodejs';