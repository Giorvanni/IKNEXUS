export interface EnqueueImagePayload {
  key: string;
  widths: number[];
}

export async function enqueueImageProcessing(payload: EnqueueImagePayload) {
  const provider = (process.env.QUEUE_PROVIDER || '').toLowerCase();
  // In development, avoid initializing external queues by default to reduce noise
  if (process.env.NODE_ENV === 'development' && process.env.QSTASH_ENABLE_DEV !== 'true') {
    return { ok: true, queued: false };
  }
  if (provider === 'qstash' && process.env.QSTASH_URL && process.env.QSTASH_TOKEN && process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      // Lazy import to keep optional dependency
      const { Client } = require('@upstash/qstash');
      const client = new Client({ token: process.env.QSTASH_TOKEN });
      const target = `${process.env.NEXT_PUBLIC_SITE_URL}/api/media/process`;
      await client.publishJSON({ url: target, body: payload });
      return { ok: true, queued: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }
  // Fallback: no-op; polling worker will pick up ImageProcessingJob rows if used
  return { ok: true, queued: false };
}
