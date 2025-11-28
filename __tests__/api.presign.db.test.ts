import { POST as PresignPOST } from '../app/api/media/presign/route';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
}));

describe('presign route', () => {
  it('rejects unsupported mime or size', async () => {
    const req: any = { json: async () => ({ filename: 'x.exe', contentType: 'application/octet-stream', sizeMB: 1 }) };
    const res = await PresignPOST(req as any);
    expect(res.status).toBe(400);
  });
  it('accepts allowed mime within size', async () => {
    process.env.STORAGE_PROVIDER = 'local';
    const req: any = { json: async () => ({ filename: 'photo.jpg', contentType: 'image/jpeg', sizeMB: 2 }) };
    const res = await PresignPOST(req as any);
    expect(res.status).toBe(200);
  });
});
