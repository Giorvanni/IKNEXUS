#!/usr/bin/env node
// Simple post-deploy smoke test script.
// Usage: node scripts/smoke.js --base https://your-domain
// Exits non-zero if any critical check fails.

const https = require('https');
const http = require('http');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { base: process.env.SMOKE_BASE || 'http://127.0.0.1:3000' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base' && args[i+1]) opts.base = args[i+1];
  }
  return opts;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(data) }); }
        catch (e) { reject(new Error(`Invalid JSON from ${url}: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error(`Timeout fetching ${url}`)); });
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error(`Timeout fetching ${url}`)); });
  });
}

async function poll(checkFn, label, timeoutMs, intervalMs) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await checkFn();
      if (ok) return { ok: true };
    } catch (e) {
      lastErr = e;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return { ok: false, error: lastErr && lastErr.message ? lastErr.message : 'timeout' };
}

async function main() {
  const { base } = parseArgs();
  const timeoutMs = parseInt(process.env.SMOKE_TIMEOUT_MS || '30000', 10); // 30s default
  const intervalMs = parseInt(process.env.SMOKE_INTERVAL_MS || '1000', 10); // 1s default
  const failures = [];

  const healthResult = await poll(async () => {
    const res = await fetchJson(`${base}/api/health`);
    return res.status === 200 && res.json.ok;
  }, 'health', timeoutMs, intervalMs);
  if (!healthResult.ok) failures.push(`health (${healthResult.error || 'fail'})`);

  const readyResult = await poll(async () => {
    const res = await fetchJson(`${base}/api/ready`);
    return res.status === 200 && res.json.ok;
  }, 'ready', timeoutMs, intervalMs);
  if (!readyResult.ok) failures.push(`ready (${readyResult.error || 'fail'})`);

  // Home page single attempt (after readiness) – lightweight content check
  try {
    const home = await fetchText(`${base}/`);
    if (home.status !== 200 || !/Iris|Wellness/i.test(home.body)) failures.push('home');
  } catch (e) { failures.push(`home (${e.message})`); }

  const summary = {
    base,
    timeoutMs,
    intervalMs,
    timestamp: new Date().toISOString(),
    status: failures.length ? 'failed' : 'passed',
    failures
  };

  if (failures.length) {
    console.error('Smoke test FAILED', JSON.stringify(summary, null, 2));
    process.exit(1);
  } else {
    console.log('Smoke test PASSED', JSON.stringify(summary, null, 2));
  }
}

main().catch(e => { console.error('Smoke test error:', e); process.exit(1); });
