import { trackMetric } from '../lib/metrics';

describe('metrics.trackMetric', () => {
  const ORIGINAL_ENV = process.env;
  const origLog = console.log;

  beforeEach(() => {
    jest.resetModules();
    console.log = jest.fn();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    console.log = origLog;
  });

  it('does not log when NODE_ENV=test', () => {
    process.env.NODE_ENV = 'test';
    trackMetric('unit.metric', 1, { a: 'b' });
    expect(console.log).not.toHaveBeenCalled();
  });

  it('logs when NODE_ENV!=test and formats tags', () => {
    process.env.NODE_ENV = 'development';
    trackMetric('unit.metric', 2, { a: 'b', n: 3 });
    expect(console.log).toHaveBeenCalled();
    const call = (console.log as jest.Mock).mock.calls[0][0];
    expect(call).toContain('[metric] unit.metric 2');
    expect(call).toContain('a=b');
    expect(call).toContain('n=3');
  });
});
