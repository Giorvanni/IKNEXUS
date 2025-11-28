describe('shutdown hook registration', () => {
  it('does not register duplicate listeners on repeated import', async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
    process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret';
    process.env.STORAGE_PROVIDER = 'local';
    const base = process.listeners('SIGTERM').length;
    // First import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../lib/shutdown');
    const afterFirst = process.listeners('SIGTERM').length;
    expect(afterFirst).toBeGreaterThanOrEqual(base + 1);
    // Second import (from cache)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../lib/shutdown');
    const afterSecond = process.listeners('SIGTERM').length;
    expect(afterSecond).toBe(afterFirst);
  });
});
