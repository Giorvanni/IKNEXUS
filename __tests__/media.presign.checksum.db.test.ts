jest.mock('next-auth', () => ({ getServerSession: async () => ({ user: { id: 'test' } }) }));
import { NextRequest } from 'next/server';
import { POST } from '../app/api/media/presign/route';

describe('media presign checksum validation', () => {
  function makeReq(body: any) {
    return new NextRequest('http://localhost/api/media/presign', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    } as any);
  }

  beforeAll(() => {
    process.env.NEXTAUTH_SECRET = 'test';
  });

  it('rejects invalid checksum format', async () => {
    // @ts-expect-error partial body
    const req = makeReq({ filename: 'file.png', contentType: 'image/png', checksum: 'abc123' });
    const res = await POST(req);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe('VALIDATION');
    expect(JSON.stringify(json.error.details)).toContain('checksum');
  });

  it('accepts valid sha256 checksum', async () => {
    const good = 'a'.repeat(64);
    const req = makeReq({ filename: 'file.png', contentType: 'image/png', checksum: good });
    const res = await POST(req);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.checksumAccepted).toBe(true);
  });
});
