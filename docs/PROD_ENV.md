## Production Environment Variables

This file enumerates all required and optional environment variables for a production deployment. Store these as encrypted secrets (GitHub Actions `secrets.*`) or your hosting provider's managed secret store. Never commit real values.

### Required Core
| Variable | Description | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | Postgres connection string | Use pooled endpoint (PgBouncer or Data Proxy) in high concurrency. |
| `NEXTAUTH_SECRET` | NextAuth encryption/signing secret | 32+ bytes cryptographically random; rotate with dual-secret strategy. |
| `NEXTAUTH_URL` | Public site base URL | Must be the canonical HTTPS URL (no trailing slash). |
| `STORAGE_PROVIDER` | `s3` \| `vercel-blob` \| `local` | Local only for development; production should be `s3` or `vercel-blob`. |

### S3 (when `STORAGE_PROVIDER=s3`)
| Variable | Description |
|----------|-------------|
| `S3_BUCKET` | Bucket name |
| `S3_REGION` | Region (e.g. `eu-west-1`) |
| `S3_ACCESS_KEY_ID` | IAM access key with least privilege |
| `S3_SECRET_ACCESS_KEY` | Secret key |

### Vercel Blob (when `STORAGE_PROVIDER=vercel-blob`)
| Variable | Description |
|----------|-------------|
| `BLOB_READ_WRITE_TOKEN` | RW token for uploads |

### Rate Limiting (Redis/Upstash)
| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Auth token |

### Observability / Error Tracking
| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | DSN for Sentry (optional) |
| `SENTRY_RELEASE` | Release identifier (git SHA) injected by CI |

### Media / Upload Constraints
| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOWED_UPLOAD_MIME` | Comma-separated whitelist (e.g. `image/jpeg,image/png,image/webp`) | internal default if unset |
| `MAX_UPLOAD_SIZE_MB` | Maximum upload size in MB | `10` |

### Worker & Feature Toggles
| Variable | Description |
|----------|-------------|
| `IMAGE_WORKER_ENABLED` | `true` to start `imageWorker.ts` in container/VM |
| `DIRECT_AGGREGATE` | Run aggregation scripts synchronously (reports) |

### Optional Storage / CDN Enhancements
| Variable | Description |
|----------|-------------|
| `CDN_BASE_URL` | Base URL for serving optimized assets |

### Validation Script
CI uses `scripts/validate-env.js` to assert required vars before build/test.

### Rotation Guidelines
1. Add new secret alongside old (e.g. `NEXTAUTH_SECRET_NEW`).
2. Deploy with dual validation allowing either until sessions naturally expire.
3. Remove old secret after validation window.

### Least Privilege (S3)
Policy should allow: `s3:PutObject`, `s3:GetObject`, `s3:AbortMultipartUpload`, `s3:ListMultipartUploadParts` on bucket prefix only.

### Postgres Connection
Use pooled endpoint; set `PGSSLMODE=require` if provider mandates. Prisma automatically negotiates TLS when supported.

### Checklist (Automated Fail if Missing)
| Var | Required in Prod |
|-----|------------------|
| `DATABASE_URL` | ✅ |
| `NEXTAUTH_SECRET` | ✅ |
| `NEXTAUTH_URL` | ✅ |
| `STORAGE_PROVIDER` | ✅ |
| `UPSTASH_REDIS_REST_URL` | ✅ when rate limiting distributed |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ when rate limiting distributed |
| `SENTRY_DSN` | ➖ optional |
| `SENTRY_RELEASE` | ✅ for tagged releases |
| `S3_*` | ✅ when `STORAGE_PROVIDER=s3` |

Keep this document additive; do not remove existing variable definitions.
