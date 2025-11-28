// Purge obsolete venture slugs (e.g., legacy IoT ventures)
// Usage examples:
//  Dry run: npm run purge:ventures -- slugA slugB
//  Apply: npm run purge:ventures:apply -- slugA slugB
//  From file: node scripts/purgeVentures.js --file=obsolete-slugs.txt
// Flags:
//  --dry-run            Report only (default if using purge:ventures script)
//  --file=path          Load newline-separated slugs from file
//  --brandSlug=slug     Restrict purging to ventures belonging to this brand slug
// Notes:
//  Provide slugs as CLI args after '--' to avoid npm swallowing them.
//  Creates AUDIT logs per deletion.

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

function parseArgs() {
  const flags = {}; const positional = [];
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=');
      flags[k] = v === undefined ? true : v;
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

async function loadSlugs(flags, positional) {
  let slugs = [...positional];
  if (flags.file) {
    const filePath = path.resolve(process.cwd(), String(flags.file));
    if (!fs.existsSync(filePath)) {
      console.error(`Slug file not found: ${filePath}`); process.exit(1);
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fromFile = fileContent.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    slugs = slugs.concat(fromFile);
  }
  slugs = Array.from(new Set(slugs)); // dedupe
  return slugs;
}

async function main() {
  const { flags, positional } = parseArgs();
  const dryRun = !!flags['dry-run'];
  const brandSlug = flags.brandSlug || null;
  let brandId = null;
  if (brandSlug) {
    const brand = await prisma.brand.findFirst({ where: { slug: brandSlug } });
    if (!brand) { console.error(`Brand slug not found: ${brandSlug}`); process.exit(1); }
    brandId = brand.id;
  }

  let slugs = await loadSlugs(flags, positional);
  if (slugs.length === 0) {
    console.error('No venture slugs provided. Pass slugs or --file=path.');
    process.exit(1);
  }
  console.log(`Loaded ${slugs.length} unique slug(s) to purge.`);

  const toDelete = [];
  for (const slug of slugs) {
    const venture = await prisma.venture.findUnique({ where: { slug } });
    if (!venture) {
      console.log(`[SKIP] Venture not found: ${slug}`);
      continue;
    }
    if (brandId && venture.brandId !== brandId) {
      console.log(`[SKIP] Venture ${slug} belongs to different brand.`);
      continue;
    }
    toDelete.push(venture);
  }

  console.log(`Ventures eligible for deletion: ${toDelete.length}`);

  for (const v of toDelete) {
    if (dryRun) {
      console.log(`[DRY] Would delete venture slug='${v.slug}' id=${v.id}`);
      continue;
    }
    await prisma.venture.delete({ where: { id: v.id } });
    await prisma.auditLog.create({
      data: {
        action: 'VENTURE_DELETE',
        entity: 'Venture',
        entityId: v.id,
        data: { slug: v.slug }
      }
    }).catch(() => {});
    console.log(`Deleted venture '${v.slug}'.`);
  }

  if (dryRun) {
    console.log('Dry run complete. Re-run without --dry-run (npm run purge:ventures:apply) to apply.');
  } else {
    console.log('Purge complete.');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
