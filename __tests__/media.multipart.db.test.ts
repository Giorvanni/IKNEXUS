import { getStorageProvider } from '../lib/storage';

describe('multipart upload stubs (local)', () => {
  it('initiates and completes multipart upload with local provider stubs', async () => {
    process.env.STORAGE_PROVIDER = 'local';
    const provider: any = getStorageProvider();
    const init = await provider.initiateMultipart('bigfile.bin');
    expect(init.uploadId).toBeTruthy();
    const part1 = await provider.presignPart(init.key, init.uploadId, 1);
    expect(part1.partNumber).toBe(1);
    const completed = await provider.completeMultipart(init.key, init.uploadId, [{ ETag: 'etag1', PartNumber: 1 }]);
    expect(completed.url).toContain(init.key);
  });
});