import { logger } from './logger';
import { prisma } from './prisma';

// Graceful shutdown hooks for Node (non-serverless) runtime.
// In Vercel serverless functions SIGTERM handling is not applicable; this targets long-lived processes
// like local dev, self-hosted Node, or containerized deployment.

let registered = false;

function setup() {
  if (registered) return;
  registered = true;

  const shutdown = async (signal: string) => {
    try {
      logger.warn({ signal }, 'Shutdown initiated');
      // Disconnect Prisma
      try {
        await prisma.$disconnect();
        logger.info('Prisma disconnected');
      } catch (e: any) {
        logger.error({ err: e }, 'Prisma disconnect error');
      }
      // Flush pino if flush method exists (extreme mode or transport)
      try {
        const anyLogger: any = logger as any;
        if (typeof anyLogger.flush === 'function') anyLogger.flush();
      } catch (e: any) {
        // ignore
      }
      // Small delay to allow transports to finish
      setTimeout(() => {
        logger.warn('Shutdown complete');
        process.exit(0);
      }, 50);
    } catch (outer: any) {
      // Hard exit on catastrophic failure
      process.exit(1);
    }
  };

  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  for (const s of signals) {
    process.on(s, () => shutdown(s));
  }
  process.on('beforeExit', (code) => {
    logger.debug({ code }, 'beforeExit event');
  });
}

setup();

export {}; // module side-effects only