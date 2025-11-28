let sentry: any = null;

export function initSentry() {
  if (sentry || !process.env.SENTRY_DSN) return;
  try {
  // Lazy import
  const Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      release: process.env.SENTRY_RELEASE,
      environment: process.env.SENTRY_ENV || process.env.NODE_ENV || 'production'
    });
    sentry = Sentry;
  } catch {
    sentry = null;
  }
}

export function captureException(e: any) {
  initSentry();
  if (sentry) sentry.captureException(e);
}

export function withSentry<T extends (...args: any[]) => any>(handler: T): T {
  // Wrap route handlers to capture errors
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (e) {
      captureException(e);
      throw e;
    }
  }) as unknown as T;
}
