// Cleanup legacy / duplicate navigation links
// Usage examples:
//  Dry run (default): npm run cleanup:navigation
//  Apply deletions: npm run cleanup:navigation:apply
//  With flags: node scripts/cleanupNavigation.js --brandSlug=iris-kooij --dry-run
// Flags:
//  --dry-run            Only report actions (default if provided)
//  --brandSlug=slug     Target brand by slug
//  --domain=domain      Target brand by domain (alternative)
//  --keep=/path,/path2  Comma-separated hrefs to force-keep even if duplicate
//  --min-order=N        Only consider links with order >= N for pruning (optional)
//  --max-duplicates=N   Stop deleting if more than N duplicates found (safety)
//  --strategy=href|label  Grouping key (default: href)
// Notes:
//  We keep the first-created link per group and delete the rest.
//  Adjust the strategy or flags for refined control.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {};
  for (const a of args) {
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=');
      flags[k] = v === undefined ? true : v;
    }
  }
  return flags;
}

async function main() {
  const flags = parseArgs();
  const dryRun = !!flags['dry-run'];
  const brandSlug = flags.brandSlug;
  const domain = flags.domain;
  const keepSet = new Set(
    (flags.keep ? String(flags.keep).split(',').map(s => s.trim()).filter(Boolean) : [])
  );
  const minOrder = flags['min-order'] ? parseInt(flags['min-order'], 10) : null;
  const maxDuplicates = flags['max-duplicates'] ? parseInt(flags['max-duplicates'], 10) : Infinity;
  const strategy = flags.strategy === 'label' ? 'label' : 'href';

  let brand;
  if (brandSlug) {
    brand = await prisma.brand.findFirst({ where: { slug: brandSlug } });
  } else if (domain) {
    brand = await prisma.brand.findFirst({ where: { domain } });
  } else {
    brand = await prisma.brand.findFirst();
  }
  if (!brand) {
    console.error('No brand resolved. Provide --brandSlug or --domain.');
    process.exit(1);
  }

  const links = await prisma.navigationLink.findMany({ where: { brandId: brand.id }, orderBy: { createdAt: 'asc' } });
  console.log(`Loaded ${links.length} navigation links for brand '${brand.slug}'.`);

  const groups = new Map();
  for (const link of links) {
    if (minOrder !== null && link.order < minOrder) continue; // skip low-order kept items
    const key = String(link[strategy]).toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(link);
  }

  const duplicates = [];
  for (const [key, arr] of groups.entries()) {
    if (arr.length <= 1) continue;
    // Sort by createdAt then order for deterministic retention
    arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt) || a.order - b.order);
    const [keep, ...dupes] = arr;
    for (const d of dupes) {
      if (keepSet.has(d.href) || keepSet.has(d.label)) continue; // forced keep override
      duplicates.push({ groupKey: key, keepId: keep.id, deleteId: d.id, href: d.href, label: d.label });
    }
  }

  console.log(`Identified ${duplicates.length} duplicate link(s) using strategy '${strategy}'.`);
  if (duplicates.length > maxDuplicates) {
    console.error(`Aborting: duplicates (${duplicates.length}) exceed max (${maxDuplicates}). Adjust --max-duplicates.`);
    process.exit(1);
  }

  for (const dup of duplicates) {
    if (dryRun) {
      console.log(`[DRY] Would delete link id=${dup.deleteId} (label='${dup.label}', href='${dup.href}') kept group key='${dup.groupKey}'.`);
    } else {
      await prisma.navigationLink.delete({ where: { id: dup.deleteId } });
      await prisma.auditLog.create({
        data: {
          action: 'NAV_LINK_DELETE_DUPLICATE',
            entity: 'NavigationLink',
            entityId: dup.deleteId,
            data: { groupKey: dup.groupKey, keptId: dup.keepId, href: dup.href, label: dup.label }
        }
      }).catch(() => {});
      console.log(`Deleted duplicate link id=${dup.deleteId} (group '${dup.groupKey}').`);
    }
  }

  if (!dryRun) {
    console.log('Cleanup complete. Remaining links:', await prisma.navigationLink.count({ where: { brandId: brand.id } }));
  } else {
    console.log('Dry run complete. Re-run without --dry-run (or use npm run cleanup:navigation:apply) to apply.');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
