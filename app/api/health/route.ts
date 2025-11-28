import { NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(_req: NextRequest) {
  let version = 'unknown';
  let commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || null;
  try {
    // Correct relative path to project root from app/api/health/route.ts
    const pkg = require('../../../package.json');
    version = pkg.version || version;
  } catch {}
  const result: any = {
    ok: true,
    build: { version, commit },
    services: {
      db: { ok: false, ms: null },
      redis: { ok: null, ms: null },
      s3: { ok: null, ms: null }
    }
  };

  // DB check
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    result.services.db.ok = true;
    result.services.db.ms = Date.now() - t0;
  } catch (e: any) {
    result.ok = false;
    result.services.db = { ok: false, error: e.message };
  }

  // Redis (Upstash) check if configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const t0 = Date.now();
      const { Redis } = require('@upstash/redis');
      const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
      const pong = await redis.ping();
      result.services.redis = { ok: pong === 'PONG' || pong === 'pong', ms: Date.now() - t0 };
      if (!result.services.redis.ok) result.ok = false;
    } catch (e: any) {
      result.ok = false;
      result.services.redis = { ok: false, error: e.message };
    }
  }

  // S3 check if configured
  if (process.env.S3_BUCKET) {
    try {
      const t0 = Date.now();
      const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
      const s3 = new S3Client({ region: process.env.S3_REGION || 'us-east-1' });
      await s3.send(new HeadBucketCommand({ Bucket: process.env.S3_BUCKET }));
      result.services.s3 = { ok: true, ms: Date.now() - t0 };
    } catch (e: any) {
      result.ok = false;
      result.services.s3 = { ok: false, error: e.message };
    }
  }

  const status = result.ok ? 200 : 503;
  return new Response(JSON.stringify(result), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
