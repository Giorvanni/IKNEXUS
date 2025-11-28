// Ensure env before importing middleware
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'testsecret';

const { middleware } = require('../middleware');
const { NextRequest } = require('next/server');

function makeReq(url: string) {
  return new NextRequest(url, { headers: { host: 'localhost' } });
}

describe('Security headers applied to API routes via middleware', () => {
  test('middleware sets security headers on /api/health path', async () => {
    const req = makeReq('http://localhost/api/health');
    const res = await middleware(req);
    expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('Permissions-Policy')).toContain('camera=()');
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});
