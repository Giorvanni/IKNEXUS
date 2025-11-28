describe('env.ts validation and flags', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  function setBase(vars: Record<string, string>) {
    process.env.NODE_ENV = vars.NODE_ENV ?? 'development';
    process.env.DATABASE_URL = vars.DATABASE_URL ?? 'file:./dev.db';
    process.env.NEXTAUTH_SECRET = vars.NEXTAUTH_SECRET ?? 'secret';
    process.env.STORAGE_PROVIDER = vars.STORAGE_PROVIDER ?? 'local';
  }

  it('loads in development with local storage', () => {
    setBase({});
    jest.isolateModules(() => {
      const { env } = require('../lib/env');
      expect(env.isProd).toBe(false);
      expect(env.storageIsS3).toBe(false);
      expect(env.storageIsBlob).toBe(false);
      expect(env.useRedis).toBe(false);
    });
  });

  it('errors in production when NEXTAUTH_SECRET missing', () => {
    setBase({ NODE_ENV: 'production', NEXTAUTH_SECRET: '' });
    expect(() => {
      jest.isolateModules(() => require('../lib/env'));
    }).toThrow(/NEXTAUTH_SECRET required in production/i);
  });

  it('validates s3 provider requires all S3_* envs', () => {
    setBase({ STORAGE_PROVIDER: 's3' });
    expect(() => {
      jest.isolateModules(() => require('../lib/env'));
    }).toThrow(/S3_BUCKET required for s3 storage/i);
  });

  it('validates vercel-blob requires token', () => {
    setBase({ STORAGE_PROVIDER: 'vercel-blob' });
    expect(() => {
      jest.isolateModules(() => require('../lib/env'));
    }).toThrow(/VERCEL_BLOB_READ_WRITE_TOKEN required/i);
  });

  it('requires both Redis URL and token together', () => {
    setBase({});
    process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = '';
    expect(() => {
      jest.isolateModules(() => require('../lib/env'));
    }).toThrow(/Both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required together/i);
  });

  it('sets useRedis=true when both Redis envs provided', () => {
    setBase({});
    process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    jest.isolateModules(() => {
      const { env } = require('../lib/env');
      expect(env.useRedis).toBe(true);
    });
  });
});
