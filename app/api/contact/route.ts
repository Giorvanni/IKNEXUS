import { NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, formatRateLimitHeaders } from '../../../lib/rateLimit';
import { ok, validation, rateLimited, fail } from '../../../lib/errors';
import { logAudit } from '../../../lib/audit';
import { logger } from '../../../lib/logger';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  topic: z.string().max(120).optional(),
  message: z.string().min(20).max(2000)
});

const MAX_REQUESTS_PER_MINUTE = 5;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rl = await rateLimit(`contact:${ip}`, MAX_REQUESTS_PER_MINUTE, 60_000);
  if (!rl.allowed) {
    return rateLimited('Even geduld, probeer het over een minuut opnieuw.', formatRateLimitHeaders(rl, MAX_REQUESTS_PER_MINUTE));
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return fail('INVALID_JSON', 400, 'Ongeldig verzoek', undefined, formatRateLimitHeaders(rl, MAX_REQUESTS_PER_MINUTE));
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return validation(parsed.error.issues, formatRateLimitHeaders(rl, MAX_REQUESTS_PER_MINUTE));
  }

  try {
    await logAudit({
      action: 'CONTACT_SUBMIT',
      entity: 'Contact',
      data: { ...parsed.data, ip }
    });
    logger.info({ event: 'contact.submit', ip, topic: parsed.data.topic || 'general' }, 'Contactverzoek ontvangen');
  } catch (error) {
    logger.error({ err: error, event: 'contact.submit' }, 'Contactverzoek loggen mislukt');
  }

  return ok({ received: true }, formatRateLimitHeaders(rl, MAX_REQUESTS_PER_MINUTE));
}

