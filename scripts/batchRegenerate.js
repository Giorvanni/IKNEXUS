#!/usr/bin/env node
/*
  Batch-regenerate aggregates by domain.
  - Source of domains: either Brand domains from DB (default) or a JSON file with an array of domain strings.
  - Invokes the Next API route /api/reports/aggregate for each domain.
  - Requires the app to be running and SITE_URL set (defaults to http://localhost:3000).
*/

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { file: null, source: 'db' };
  for (const a of args) {
    if (a.startsWith('--file=')) out.file = a.split('=')[1];
    if (a.startsWith('--source=')) out.source = a.split('=')[1];
  }
  return out;
}

async function getDomainsFromDb() {
  const prisma = new PrismaClient();
  try {
    const brands = await prisma.brand.findMany({ where: { NOT: { domain: null } }, select: { domain: true } });
    return brands.map(b => b.domain).filter(Boolean);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

function getDomainsFromFile(path) {
  const raw = fs.readFileSync(path, 'utf8');
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error('File must contain a JSON array of domain strings');
  return arr;
}

async function postAggregate(siteUrl, domain) {
  const endpoint = `${siteUrl.replace(/\/$/, '')}/api/reports/aggregate`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain })
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function directAggregate(prisma, domain) {
  const { aggregateForDomain } = require('./aggregator');
  const report = await aggregateForDomain({ prisma, domain, outputToFile: true });
  return { ok: true, data: report };
}

(async () => {
  const { file, source } = parseArgs();
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const useDirect = String(process.env.DIRECT_AGGREGATE || '').toLowerCase() === 'true';
  const prisma = new PrismaClient();
  if (typeof fetch !== 'function') {
    console.error('Global fetch not available. Please use Node 18+ or install node-fetch and require it here.');
    process.exit(1);
  }
  let domains = [];
  if (source === 'file') {
    if (!file) {
      console.error('Missing --file=path/to/domains.json');
      process.exit(1);
    }
    domains = getDomainsFromFile(file);
  } else {
    domains = await getDomainsFromDb();
  }
  if (!domains.length) {
    console.log('No domains found to process.');
    process.exit(0);
  }
  console.log(`Batch starting for ${domains.length} domain(s) -> ${siteUrl}`);
  const results = [];
  for (const d of domains) {
    process.stdout.write(`- ${d} ... `);
    try {
      const r = useDirect ? await directAggregate(prisma, d) : await postAggregate(siteUrl, d);
      console.log('OK');
      results.push({ domain: d, ok: true, data: r });
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      results.push({ domain: d, ok: false, error: e.message });
    }
  }
  const ok = results.filter(r => r.ok).length;
  const fail = results.length - ok;
  console.log(`\nDone. Success: ${ok}, Failed: ${fail}`);
  await prisma.$disconnect().catch(() => {});
  process.exit(fail ? 1 : 0);
})();
