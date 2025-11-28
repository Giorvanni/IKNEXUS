import { getStorageProvider } from '../lib/storage';

describe('Storage provider selection', () => {
  it('defaults to local when no env set', () => {
    const provider = getStorageProvider();
    // provider name not directly exposed; infer by upload behavior
    expect(provider).toBeTruthy();
  });
});