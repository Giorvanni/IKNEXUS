import { POST as MultipartCompletePOST } from '../app/api/media/multipart/complete/route';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
}));

describe('multipart complete route', () => {
  it('rejects invalid mime', async () => {
    const req: any = { json: async () => ({ key: 'file.bin', uploadId: 'u', parts: [], brandId: 'b1', mimeType: 'application/octet-stream' }) };
    const res = await MultipartCompletePOST(req as any);
    expect(res.status).toBe(400);
  });
});
