import { getStorageProvider } from '../lib/storage';

describe('Storage provider selection (node env)', () => {
  it('defaults to local when STORAGE_PROVIDER unset', async () => {
    delete process.env.STORAGE_PROVIDER;
    const provider = getStorageProvider();
    // Upload small buffer to ensure no crash in local provider
    const result = await provider.upload(Buffer.from('test'), 'test.txt', 'text/plain');
    expect(result.url).toBeTruthy();
    expect(result.provider).toBe('local');
  });
});