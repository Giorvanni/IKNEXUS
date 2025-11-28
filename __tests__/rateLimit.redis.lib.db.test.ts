describe('rateLimit with mocked Redis', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('uses Redis path: first hit allowed, then blocks at limit', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.example';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

    const state: Record<string, { value: number; expiresAt: number }> = {};
    const mockRedis = {
      get: jest.fn(async (k: string) => {
        const v = state[k];
        if (!v) return 0;
        if (Date.now() > v.expiresAt) return 0;
        return v.value;
      }),
      set: jest.fn(async (k: string, val: number, opts: any) => {
        state[k] = { value: val, expiresAt: Date.now() + (opts?.px || 0) };
      }),
      incr: jest.fn(async (k: string) => {
        if (!state[k]) state[k] = { value: 0, expiresAt: Date.now() + 1000 };
        state[k].value += 1;
      }),
      pttl: jest.fn(async (k: string) => {
        const v = state[k];
        if (!v) return -1;
        return Math.max(0, v.expiresAt - Date.now());
      })
    };

    jest.doMock('@upstash/redis', () => ({ Redis: jest.fn(() => mockRedis) }));

    const { rateLimit } = require('../lib/rateLimit');
    const key = 'jest:redis:case';
    const limit = 2;
    const windowMs = 2000;
    const r1 = await rateLimit(key, limit, windowMs);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(1);
    const r2 = await rateLimit(key, limit, windowMs);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(0);
    const r3 = await rateLimit(key, limit, windowMs);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });
});
