// Very basic in-memory rate limiter (dev/staging). Not suitable for multi-instance production.
import { trackMetric } from './metrics';
// Distributed + fallback rate limiter.
// If Upstash Redis env vars are present, use Redis; otherwise, revert to in-memory buckets.
interface Bucket {
  count: number;
  reset: number; // epoch ms
}

const useRedis = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
let redis: any = null;
if (useRedis) {
  try {
    // Lazy require to avoid dev dependency issues if not installed yet
    const { Redis } = require('@upstash/redis');
    redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
  } catch (e) {
    // If package missing, disable redis usage silently
    redis = null;
  }
}

const buckets = new Map<string, Bucket>();

export async function rateLimit(key: string, limit: number, windowMs: number) {
  if (redis) {
    const now = Date.now();
    const redisKey = `rl:${key}`;
    // Fetch current count
  const currentRaw = await redis.get(redisKey);
  const current = typeof currentRaw === 'number' ? currentRaw : parseInt(String(currentRaw || '0'), 10) || 0;
    if (current === 0) {
      // First hit: set with expiry
      await redis.set(redisKey, 1, { px: windowMs });
      return { allowed: true, remaining: limit - 1, reset: now + windowMs };
    }
    if (current >= limit) {
      trackMetric('rate_limit.denied', 1, { backend: 'redis' });
      const pttl = await redis.pttl(redisKey);
      return { allowed: false, remaining: 0, reset: now + (pttl > 0 ? pttl : windowMs) };
    }
    await redis.incr(redisKey);
    const pttl = await redis.pttl(redisKey);
    return { allowed: true, remaining: limit - (current + 1), reset: now + (pttl > 0 ? pttl : windowMs) };
  }
  // Fallback in-memory
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    const newBucket: Bucket = { count: 1, reset: now + windowMs };
    buckets.set(key, newBucket);
    return { allowed: true, remaining: limit - 1, reset: newBucket.reset };
  }
  if (bucket.count >= limit) {
    trackMetric('rate_limit.denied', 1, { backend: 'memory' });
    return { allowed: false, remaining: 0, reset: bucket.reset };
  }
  bucket.count++;
  return { allowed: true, remaining: limit - bucket.count, reset: bucket.reset };
}

export function formatRateLimitHeaders(result: { remaining: number; reset: number }, limit: number) {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.reset / 1000))
  };
}