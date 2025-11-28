#!/usr/bin/env node
/*
  Local smoke orchestrator: builds if needed, migrates + seeds, starts server,
  polls readiness, runs smoke checks, then shuts down the server.
  Usage:
    node scripts/smoke-local.js --port 3000 --base http://127.0.0.1:3000 \
      --db file:./dev-smoke.db --secret devsecret
*/

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    port: parseInt(process.env.PORT || '3000', 10),
    base: process.env.SMOKE_BASE || 'http://127.0.0.1:3000',
    db: process.env.DATABASE_URL || 'file:./dev-smoke.db',
    secret: process.env.NEXTAUTH_SECRET || 'devsecret'
  };
  for (let i = 0; i < args.length; i++) {
    const k = args[i];
    const v = args[i + 1];
    if (k === '--port' && v) opts.port = parseInt(v, 10);
    if (k === '--base' && v) opts.base = v;
    if (k === '--db' && v) opts.db = v;
    if (k === '--secret' && v) opts.secret = v;
  }
  return opts;
}

function runSync(cmd, args, env = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env }, shell: process.platform === 'win32' });
  if (res.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed with code ${res.status}`);
  }
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Invalid JSON from ${url}: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

async function pollReady(base, timeoutMs = 30000, intervalMs = 1000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetchJson(`${base}/api/ready`);
      if (r.status === 200 && r.json && r.json.ok) return true;
      lastErr = new Error(`status=${r.status}`);
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw lastErr || new Error('poll timeout');
}

async function main() {
  const { port, base, db, secret } = parseArgs();
  const proj = process.cwd();
  const buildId = path.join(proj, '.next', 'BUILD_ID');

  // 1. Migrate + seed
  runSync('npx', ['prisma', 'migrate', 'deploy'], { DATABASE_URL: db });
  runSync('node', ['prisma/seed.js'], { DATABASE_URL: db });

  // 2. Build if needed
  if (!fs.existsSync(buildId)) {
    // Ensure env validation passes during build (middleware/env.ts validates at import time)
    runSync('npm', ['run', 'build'], {
      DATABASE_URL: db,
      NEXTAUTH_SECRET: secret,
      NEXTAUTH_URL: base,
      NODE_ENV: 'production'
    });
  }

  // 3. Start server
  const env = {
    ...process.env,
    DATABASE_URL: db,
    NEXTAUTH_SECRET: secret,
    NEXTAUTH_URL: base
  };
  const server = spawn('npx', ['next', 'start', '-p', String(port)], {
    env,
    stdio: 'inherit',
    shell: true
  });

  let closed = false;
  server.on('exit', (code) => {
    closed = true;
    if (code !== 0) {
      console.error('Server exited with code', code);
    }
  });

  try {
    await pollReady(base, 45000, 1000);
    // 4. Run smoke suite
    runSync('node', ['scripts/smoke.js'], { SMOKE_BASE: base });
    console.log('Local smoke: PASSED');
  } catch (e) {
    console.error('Local smoke: FAILED', e.message || e);
    try {
      const diag = await fetchJson(`${base}/api/ready`);
      console.error('Readiness diagnostics:', JSON.stringify(diag, null, 2));
    } catch {}
    process.exitCode = 1;
  } finally {
    if (!closed) {
      try { server.kill('SIGINT'); } catch {}
    }
  }
}

main().catch((e) => {
  console.error('smoke-local error', e);
  process.exit(1);
});
