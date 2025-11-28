import pino, { type TransportSingleOptions } from 'pino';
import { env } from './env';

// Principle: single structured logger instance; child loggers derive context (requestId, brandId).
// In production we emit JSON; in development we use pino-pretty if available but do not fail if absent.

const isProd = env.isProd;

let transport: TransportSingleOptions | undefined;
if (!isProd) {
  try {
    transport = {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' }
    };
  } catch {
    transport = undefined;
  }
}

// In test environments disable pino transport to avoid noisy output.
const isTest = process.env.JEST_WORKER_ID !== undefined;
export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  enabled: true,
  redact: ['req.headers.authorization'],
  transport: isTest ? undefined : transport
});

export interface RequestLogContext {
  requestId?: string;
  brandId?: string | null;
  path?: string;
  method?: string;
}

export function withRequest(context: RequestLogContext) {
  return logger.child({ req: context });
}
