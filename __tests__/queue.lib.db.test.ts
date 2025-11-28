import { EnqueueImagePayload } from '../lib/queue';

describe('queue.enqueueImageProcessing', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('dev short-circuit returns queued:false', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.QSTASH_ENABLE_DEV;
    const { enqueueImageProcessing } = require('../lib/queue');
    const res = await enqueueImageProcessing({ key: 'k', widths: [1] } as EnqueueImagePayload);
    expect(res.ok).toBe(true);
    expect(res.queued).toBe(false);
  });

  it('qstash provider queues when env present', async () => {
    process.env.NODE_ENV = 'production';
    process.env.QUEUE_PROVIDER = 'qstash';
    process.env.QSTASH_URL = 'https://qstash';
    process.env.QSTASH_TOKEN = 'token';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://127.0.0.1:3000';
    const publishJSON = jest.fn(async () => {});
    jest.doMock('@upstash/qstash', () => ({ Client: jest.fn(() => ({ publishJSON })) }));
    const { enqueueImageProcessing } = require('../lib/queue');
    const res = await enqueueImageProcessing({ key: 'k2', widths: [320] } as EnqueueImagePayload);
    expect(res.ok).toBe(true);
    expect(res.queued).toBe(true);
    expect(publishJSON).toHaveBeenCalled();
  });

  it('qstash path returns queued:false when env incomplete', async () => {
    process.env.NODE_ENV = 'production';
    process.env.QUEUE_PROVIDER = 'qstash';
    process.env.QSTASH_URL = '' as any;
    const { enqueueImageProcessing } = require('../lib/queue');
    const res = await enqueueImageProcessing({ key: 'k3', widths: [640] } as EnqueueImagePayload);
    expect(res.ok).toBe(true);
    expect(res.queued).toBe(false);
  });

  it('qstash errors are caught and reported', async () => {
    process.env.NODE_ENV = 'production';
    process.env.QUEUE_PROVIDER = 'qstash';
    process.env.QSTASH_URL = 'https://qstash';
    process.env.QSTASH_TOKEN = 'token';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://127.0.0.1:3000';
    jest.doMock('@upstash/qstash', () => ({ Client: jest.fn(() => ({ publishJSON: async () => { throw new Error('network'); } })) }));
    const { enqueueImageProcessing } = require('../lib/queue');
    const res = await enqueueImageProcessing({ key: 'k4', widths: [1280] } as EnqueueImagePayload);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/network/);
  });
});
