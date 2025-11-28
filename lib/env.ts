import { z } from 'zod';

// Principle decisions:
// 1. Fail fast: validate at import time so misconfiguration never reaches runtime handlers.
// 2. Conditional requirements: provider-specific secrets required only when selected.
// 3. Environment differentiation: production requires stronger guarantees (NEXTAUTH_SECRET, DATABASE_URL non-empty, no default fallbacks).
// 4. Typed export: downstream code never touches process.env directly, reducing drift & typos.
// 5. Single source of truth: all env access through this module; future secret rotation logic hooks here.

const BaseSchema = z.object({
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET required'),
  NEXTAUTH_URL: z.string().optional(),
  STORAGE_PROVIDER: z.enum(['local','s3','vercel-blob']).default('local'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  VERCEL_BLOB_READ_WRITE_TOKEN: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(25),
  ALLOWED_UPLOAD_MIME: z.string().default('image/jpeg,image/png,image/webp'),
  DIRECT_AGGREGATE: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

// Refine for provider-specific requirements.
const EnvSchema = BaseSchema.superRefine((vals, ctx) => {
  if (vals.NODE_ENV === 'production') {
    if (!vals.NEXTAUTH_SECRET) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['NEXTAUTH_SECRET'], message: 'NEXTAUTH_SECRET required in production' });
    if (!vals.DATABASE_URL) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['DATABASE_URL'], message: 'DATABASE_URL required in production' });
  }
  if (vals.STORAGE_PROVIDER === 's3') {
    ['S3_BUCKET','S3_REGION','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY'].forEach(k => {
      if (!(vals as any)[k]) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [k], message: `${k} required for s3 storage` });
    });
  }
  if (vals.STORAGE_PROVIDER === 'vercel-blob') {
    if (!vals.VERCEL_BLOB_READ_WRITE_TOKEN) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['VERCEL_BLOB_READ_WRITE_TOKEN'], message: 'VERCEL_BLOB_READ_WRITE_TOKEN required for vercel-blob storage' });
  }
  const usingRedis = !!vals.UPSTASH_REDIS_REST_URL || !!vals.UPSTASH_REDIS_REST_TOKEN;
  if (usingRedis) {
    if (!vals.UPSTASH_REDIS_REST_URL || !vals.UPSTASH_REDIS_REST_TOKEN) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['UPSTASH_REDIS_REST_URL'], message: 'Both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required together' });
    }
  }
});

type Env = z.infer<typeof EnvSchema> & {
  isProd: boolean;
  storageIsS3: boolean;
  storageIsBlob: boolean;
  useRedis: boolean;
  telemetryEnabled: boolean;
};

function load(): Env {
  const raw = { ...process.env } as Record<string, unknown>;
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
  }
  const v = parsed.data;
  return {
    ...v,
    isProd: v.NODE_ENV === 'production',
    storageIsS3: v.STORAGE_PROVIDER === 's3',
    storageIsBlob: v.STORAGE_PROVIDER === 'vercel-blob',
    useRedis: !!(v.UPSTASH_REDIS_REST_URL && v.UPSTASH_REDIS_REST_TOKEN),
    telemetryEnabled: !!v.OTEL_EXPORTER_OTLP_ENDPOINT,
  };
}

// Single evaluated instance.
export const env = load();

// Helper accessors for ergonomics & future rotation.
export function requireEnv<K extends keyof Env>(key: K): Env[K] {
  const value = env[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required env: ${String(key)}`);
  }
  return value;
}

export function optionalEnv<K extends keyof Env>(key: K): Env[K] | undefined {
  return env[key] ?? undefined;
}
