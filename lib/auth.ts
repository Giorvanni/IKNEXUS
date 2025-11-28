import NextAuth, { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import AzureAD from 'next-auth/providers/azure-ad';
import Google from 'next-auth/providers/google';
import { prisma } from './prisma';
import { rateLimit } from './rateLimit';
import zxcvbn from 'zxcvbn';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  providers: [
    // GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || ''
    }),
    // Azure AD (Entra ID) OAuth
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID || 'common'
    }),
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        // Rate limit key: fallback to a stable token when request IP is unavailable in this context
        const ip = 'local';
        // Rate limit login attempts per email + ip
        try {
          const rl = await rateLimit(`login:${credentials.email}:${ip}`, 5, 60_000); // 5 attempts / minute
          if (rl.remaining <= 0) {
            return null; // treated as failed sign-in (generic message)
          }
        } catch {
          // ignore rate limit errors; fail open
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  }
};

export function getServerAuth() {
  // helper placeholder if needed later
  return authOptions;
}

// Password strength utility (to use when adding user creation APIs)
export function assessPasswordStrength(password: string) {
  const { score, feedback, crack_times_display } = zxcvbn(password);
  return { score, feedback, crackTimes: crack_times_display };
}

export function isPasswordAcceptable(password: string) {
  // Require zxcvbn score >= 3 (0-4 scale) and length >= 10
  const { score } = zxcvbn(password);
  return password.length >= 10 && score >= 3;
}
