describe('sentry.ts wrappers', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.SENTRY_DSN = 'https://exampledsn@ingest.sentry.io/123';
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('initializes and captures exceptions', () => {
    const captureSpy = jest.fn();
    const initSpy = jest.fn();
    jest.doMock('@sentry/node', () => ({ init: initSpy, captureException: captureSpy }));
    const sentry = require('../lib/sentry');
    const err = new Error('boom');
    sentry.captureException(err);
    expect(initSpy).toHaveBeenCalled();
    expect(captureSpy).toHaveBeenCalledWith(err);
  });

  it('withSentry wraps handler and forwards errors', async () => {
    const captureSpy = jest.fn();
    const initSpy = jest.fn();
    jest.doMock('@sentry/node', () => ({ init: initSpy, captureException: captureSpy }));
    const { withSentry } = require('../lib/sentry');
    const failing = withSentry(async () => { throw new Error('fail'); });
    await expect(failing()).rejects.toThrow('fail');
    expect(captureSpy).toHaveBeenCalled();
  });
});
