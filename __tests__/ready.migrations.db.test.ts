jest.mock('fs', () => ({
  __esModule: true,
  default: {
    existsSync: () => true,
    // Simulate Next/Prisma timestamped migration directories (14-digit prefix)
    readdirSync: () => ['20250101010101_init', '20250202020202_add'],
  }
}));
jest.mock('../lib/prisma', () => ({ __esModule: true, default: { $queryRawUnsafe: jest.fn(async () => [{ count: 1 }]), brand: { count: jest.fn(async () => 1) } } }));

import { NextRequest } from 'next/server';

describe('/api/ready migration readiness', () => {
  it('returns 503 when pending migrations exist', async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db';
    process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret';
    const { GET } = await import('../app/api/ready/route');
    const req = new NextRequest('http://localhost/api/ready');
    const res = await GET(req);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.details.checks.migrations.ok).toBe(false);
    expect(json.error.details.checks.migrations.pending).toBeGreaterThan(0);
  });
});
