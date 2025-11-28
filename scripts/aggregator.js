const fs = require('fs');
const path = require('path');

/**
 * Aggregate a per-domain report and optionally write it to public/reports/{domain}.json
 * @param {{ prisma: import('@prisma/client').PrismaClient, domain: string, outputToFile?: boolean }} params
 */
async function aggregateForDomain({ prisma, domain, outputToFile = true }) {
  // Resolve version for provenance
  let appVersion = 'unknown';
  try {
    const pkg = require(path.join(process.cwd(), 'package.json'));
    appVersion = pkg.version || appVersion;
  } catch {}
  if (!domain || typeof domain !== 'string') throw new Error('domain is required');
  const d = domain.toLowerCase();
  const brand = await prisma.brand.findFirst({
    where: {
      OR: [
        { domain: d },
        { domain: d.replace(/^https?:\/\//, '').replace(/:\\d+$/, '') },
        { slug: d }
      ]
    },
    select: { id: true, name: true, slug: true, domain: true, createdAt: true }
  });
  if (!brand) throw new Error(`Brand not found for domain '${domain}'`);

  const [ventures, mediaAssets, variants, jobsPending, jobsProcessing, jobsError, navLinks] = await Promise.all([
    prisma.venture.count({ where: { brandId: brand.id } }),
    prisma.mediaAsset.count({ where: { brandId: brand.id } }),
    prisma.mediaAssetVariant.count({ where: { mediaAsset: { brandId: brand.id } } }),
    prisma.imageProcessingJob.count({ where: { status: 'PENDING', mediaAsset: { brandId: brand.id } } }),
    prisma.imageProcessingJob.count({ where: { status: 'PROCESSING', mediaAsset: { brandId: brand.id } } }),
    prisma.imageProcessingJob.count({ where: { status: 'ERROR', mediaAsset: { brandId: brand.id } } }),
    prisma.navigationLink.count({ where: { brandId: brand.id } })
  ]);

  // Recent ventures sample
  const latestVentures = await prisma.venture.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, slug: true, status: true, createdAt: true }
  });

  const report = {
    schemaVersion: 1,
    generator: 'iris-aggregator',
    generatorVersion: appVersion,
    domain: brand.domain || domain,
    brand: { id: brand.id, name: brand.name, slug: brand.slug },
    counts: {
      ventures,
      mediaAssets,
      variants,
      jobs: { pending: jobsPending, processing: jobsProcessing, error: jobsError },
      navigationLinks: navLinks
    },
    latestVentures,
    thumbnails: await prisma.mediaAssetVariant.findMany({ where: { mediaAsset: { brandId: brand.id } }, select: { id: true, width: true, format: true }, take: 20 }),
    generatedAt: new Date().toISOString()
  };

  if (outputToFile) {
    const storage = String(process.env.REPORTS_STORAGE || 'local').toLowerCase();
    const targetDomain = (brand.domain || domain).toLowerCase();
    const ts = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${ts.getUTCFullYear()}${pad(ts.getUTCMonth()+1)}${pad(ts.getUTCDate())}${pad(ts.getUTCHours())}${pad(ts.getUTCMinutes())}${pad(ts.getUTCSeconds())}`;
    if (storage === 's3') {
      const bucket = process.env.REPORTS_BUCKET || process.env.S3_BUCKET;
      if (!bucket) throw new Error('REPORTS_BUCKET or S3_BUCKET not set');
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      const client = new S3Client({ region: process.env.S3_REGION || 'us-east-1' });
      const prefix = `reports/${targetDomain}/`;
      const keyTs = `${prefix}${stamp}.json`;
      const keyLatest = `${prefix}latest.json`;
      const body = Buffer.from(JSON.stringify(report, null, 2));
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: keyTs, Body: body, ContentType: 'application/json', CacheControl: 'public,max-age=60' }));
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: keyLatest, Body: body, ContentType: 'application/json', CacheControl: 'public,max-age=60' }));
      return { ...report, storage: 's3', urls: { latest: `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(keyLatest)}`, timestamped: `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(keyTs)}` }, keys: { latest: keyLatest, timestamped: keyTs } };
    } else {
      const outDir = path.join(process.cwd(), 'public', 'reports', targetDomain);
      fs.mkdirSync(outDir, { recursive: true });
      const fileTs = path.join(outDir, `${stamp}.json`);
      const fileLatest = path.join(outDir, `latest.json`);
      const json = JSON.stringify(report, null, 2);
      fs.writeFileSync(fileTs, json, 'utf8');
      fs.writeFileSync(fileLatest, json, 'utf8');
      return { ...report, storage: 'local', urls: { latest: `/reports/${encodeURIComponent(targetDomain)}/latest.json`, timestamped: `/reports/${encodeURIComponent(targetDomain)}/${stamp}.json` } };
    }
  }

  return { ...report, storage: 'none' };
}

module.exports = { aggregateForDomain };
