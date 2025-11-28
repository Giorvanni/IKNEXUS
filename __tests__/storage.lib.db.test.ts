describe('getStorageProvider selection', () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original } as any;
    jest.resetModules();
  });

  function getName() {
    // require fresh module instance after env change
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getStorageProvider } = require('../lib/storage');
    const inst = getStorageProvider();
    return inst.constructor.name;
  }

  it('defaults to LocalStorage when unset', () => {
    delete process.env.STORAGE_PROVIDER;
    expect(getName()).toBe('LocalStorage');
  });

  it('selects LocalStorage explicitly', () => {
    process.env.STORAGE_PROVIDER = 'local';
    expect(getName()).toBe('LocalStorage');
  });

  it('selects S3Storage when configured', () => {
    process.env.STORAGE_PROVIDER = 's3';
    process.env.S3_BUCKET = 'test-bucket';
    expect(getName()).toBe('S3Storage');
  });

  it('selects VercelBlobStorage when configured', () => {
    process.env.STORAGE_PROVIDER = 'vercel-blob';
    expect(getName()).toBe('VercelBlobStorage');
  });
});
