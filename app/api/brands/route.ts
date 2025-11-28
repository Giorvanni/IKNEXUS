import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { rateLimit, formatRateLimitHeaders } from '../../../lib/rateLimit';
import { ok, rateLimited } from '../../../lib/errors';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`brands:${ip}`, 30, 60_000); // 30 requests per minute
  if (!rl.allowed) {
    return rateLimited('Too many requests', { 'Retry-After': '60', ...formatRateLimitHeaders(rl, 30) });
  }
  const brands = await prisma.brand.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      primaryColor: true,
      secondaryColor: true,
      showInNav: true,
      navOrder: true,
      logoUrl: true
    },
    orderBy: { navOrder: 'asc' }
  });
  return ok(brands, { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', ...formatRateLimitHeaders(rl, 30) });
}