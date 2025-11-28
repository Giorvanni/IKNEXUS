## Storage Hardening

This app supports `s3`, `vercel-blob`, and `local` providers (dev). Production should use `s3` or `vercel-blob`.

### Upload Validation (App-side)
- Allowed MIME types: `ALLOWED_UPLOAD_MIME` (comma-separated).
- Max size: `MAX_UPLOAD_SIZE_MB`.
- Filenames sanitized: non `[a-zA-Z0-9._-]` replaced with `_`; prefixed with a timestamp.
- Optional `checksum` (sha256 hex) accepted and validated by route.

See `app/api/media/presign/route.ts` for enforcement.

### AWS S3 Bucket Policy (Least Privilege)
Grant only required actions on a path prefix (e.g., `ik-engine-v2/*`). Replace `YOUR_BUCKET` and account accordingly.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "IkEngineWriteRead",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET/ik-engine-v2/*"
      ]
    },
    {
      "Sid": "ListBucketForPrefix",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::YOUR_BUCKET"],
      "Condition": { "StringLike": { "s3:prefix": ["ik-engine-v2/*"] } }
    }
  ]
}
```

### Lifecycle Rules
- Keep originals; set `Cache-Control: public, max-age=31536000, immutable` for variants.
- Example rule: Transition objects under `ik-engine-v2/variants/` to Standard-IA after 30 days; expire incomplete MPU after 7 days.

### Public Access
- Prefer serving via CDN (CloudFront/Cloudflare). Keep bucket private, use OAC (CloudFront) or signed URLs, or expose only variant prefix.

### Vercel Blob
- Use `VERCEL_BLOB_READ_WRITE_TOKEN` with scope-limited tokens.
- Blob URLs are public; consider a CDN in front for caching.
