# Image Worker Deployment

This Dockerfile runs the image processing worker (`scripts/imageWorker.ts`).

## Build
```powershell
cd "c:\Users\G. Bagmeijer\Desktop\IK Engine V2"
docker build -f ops/worker/Dockerfile -t ik-image-worker .
```

## Run
Required env:
- `DATABASE_URL`
- `STORAGE_PROVIDER` (one of `s3|vercel-blob|local`)
- If `s3`: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- Optional: `SENTRY_DSN`

```powershell
docker run --rm \
  -e DATABASE_URL="<postgres_url>" \
  -e STORAGE_PROVIDER="vercel-blob" \
  ik-image-worker
```

## Notes
- The container uses `npx ts-node` to run TypeScript without a separate compile step.
- Ensure the app has permissions to read/write storage for variant generation.
- Monitor backlog via Prometheus metric `ik_image_processing_backlog`.
