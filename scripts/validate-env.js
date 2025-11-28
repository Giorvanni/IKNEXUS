#!/usr/bin/env node
/**
 * Validates presence of required production environment variables.
 * Exits non-zero if any are missing. Used early in CI to fail fast.
 */
const REQUIRED = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'STORAGE_PROVIDER'
];

// Conditional requirements
if (process.env.STORAGE_PROVIDER === 's3') {
  ['S3_BUCKET','S3_REGION','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY'].forEach(v => REQUIRED.push(v));
}
if (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN) {
  ['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN'].forEach(v => REQUIRED.push(v));
}

const missing = REQUIRED.filter(v => !process.env[v]);
if (missing.length) {
  console.error('[env-validation] Missing required variables:', missing.join(', '));
  process.exit(1);
}
console.log('[env-validation] All required environment variables present');