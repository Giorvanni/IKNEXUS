import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBrandByHost } from './config/brands';
import { env } from './lib/env';

export async function middleware(req: NextRequest) {
  const rawHost = req.headers.get('host') || 'localhost';
  const host = rawHost.replace(/^127\.0\.0\.1/i, 'localhost');
  const existingRequestId = req.headers.get('x-request-id');
  const requestId = existingRequestId || (globalThis.crypto && 'randomUUID' in globalThis.crypto
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  // Prefer DB-backed brand lookup; fallback to legacy config when unavailable
  let brandId: string | null = null;
  let brandSlug: string | null = null;
  let brandName: string | null = null;
  try {
    // Dynamic import to avoid bundling Prisma into the Edge runtime
    const mod = await import('./lib/brand');
    const dbBrand = await mod.getBrandByDomain(host);
    if (dbBrand && dbBrand.id) {
      brandId = dbBrand.id;
      brandSlug = (dbBrand as any).slug || null;
      brandName = (dbBrand as any).name || null;
    }
  } catch {
    // ignore DB errors in middleware; fallback below
  }
  if (!brandId) {
    const legacy = getBrandByHost(host);
    brandId = legacy?.id || null;
    brandSlug = (legacy as any)?.slug || null;
    brandName = (legacy as any)?.name || null;
  }
  const cspNonce = (() => {
    if (globalThis.crypto && 'getRandomValues' in globalThis.crypto) {
      const arr = new Uint8Array(16);
      globalThis.crypto.getRandomValues(arr);
      return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  })();
  const res = NextResponse.next();
  res.headers.set('x-request-id', requestId);
  if (brandId) res.headers.set('x-brand-id', brandId);
  if (brandSlug) res.headers.set('x-brand-slug', brandSlug);
  if (brandName) {
    const safeName = brandName.replace(/[^\x20-\x7E]/g, '');
    res.headers.set('x-brand-name', safeName);
  }
  // Security headers (principle: defense-in-depth; minimal inline allowances for current scripts)
  const scriptSrc = env.isProd
    ? `script-src 'self' 'nonce-${cspNonce}'`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  const cspParts = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "object-src 'none'"
  ];
  res.headers.set('Content-Security-Policy', cspParts.join('; '));
  res.headers.set('x-csp-nonce', cspNonce);
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (env.isProd) {
    // 6 months HSTS, include subdomains; preload optional after external verification
    res.headers.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  return res;
}

// Apply middleware to all pages for now.
export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)']
};
