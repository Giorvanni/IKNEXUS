import { rateLimit, formatRateLimitHeaders } from '../lib/rateLimit';

describe('rateLimit (in-memory fallback)', () => {
  it('allows up to limit then blocks within window', async () => {
    const key = 'jest:rl:unit';
    const limit = 2;
    const windowMs = 500;
    const r1 = await rateLimit(key, limit, windowMs);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(limit - 1);
    const r2 = await rateLimit(key, limit, windowMs);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(0);
    const r3 = await rateLimit(key, limit, windowMs);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
    const headers = formatRateLimitHeaders(r3, limit);
    expect(headers['X-RateLimit-Limit']).toBe(String(limit));
    expect(Number(headers['X-RateLimit-Reset'])).toBeGreaterThan(0);
  });
});
