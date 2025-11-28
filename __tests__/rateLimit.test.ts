import { rateLimit } from '../lib/rateLimit';

describe('rateLimit', () => {
  it('allows within limit and blocks after exceeding', async () => {
    const key = 'test:ip';
    let last: any;
    for (let i = 0; i < 5; i++) {
      last = await rateLimit(key, 5, 1000);
    }
    expect(last?.allowed).toBe(true);
    const block: any = await rateLimit(key, 5, 1000);
    expect(block.allowed).toBe(false);
  });
});