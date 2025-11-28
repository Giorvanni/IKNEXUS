// Ensure stable NextAuth environment during tests to avoid noisy JWT decode errors
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'testsecret';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost';
// In some NextAuth setups, trusting host avoids warnings in test
process.env.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST || 'true';
