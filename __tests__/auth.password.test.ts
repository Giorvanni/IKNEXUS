describe('password strength helpers', () => {
  let assessPasswordStrength: (p: string) => any;
  let isPasswordAcceptable: (p: string) => boolean;
  beforeAll(() => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
    process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret';
    process.env.STORAGE_PROVIDER = 'local';
    jest.resetModules();
    const mod = require('../lib/auth');
    assessPasswordStrength = mod.assessPasswordStrength;
    isPasswordAcceptable = mod.isPasswordAcceptable;
  });
  it('flags weak passwords as unacceptable', () => {
    expect(isPasswordAcceptable('password1')).toBe(false);
    expect(isPasswordAcceptable('short')).toBe(false);
  });
  it('accepts strong passwords', () => {
    // A reasonably complex password should pass length >=10 and zxcvbn score >=3
    expect(isPasswordAcceptable('Str0ng!Passw0rd-2025')).toBe(true);
    const assess = assessPasswordStrength('Str0ng!Passw0rd-2025');
    expect(assess.score).toBeGreaterThanOrEqual(3);
  });
});
