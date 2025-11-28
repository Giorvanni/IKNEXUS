import { NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';
import { getMetricsSnapshot, getLatencySnapshot, trackMetric } from '../../../lib/metrics';

// Prometheus-style exposition of in-memory counters plus dynamic gauges.
// NOTE: Ephemeral (resets on deploy). For durable metrics, introduce external backend.
export async function GET(_req: NextRequest) {
  const counters = getMetricsSnapshot();
  const latency = getLatencySnapshot();
  let backlogCount = 0;
  try {
    backlogCount = await prisma.imageProcessingJob.count({ where: { status: { in: ['PENDING','PROCESSING'] } } });
  } catch {
    // ignore DB errors; expose zero backlog
  }
  // Touch a metric for exposition health
  trackMetric('metrics.exposed', 1);
  const lines: string[] = [];
  Object.entries(counters).forEach(([name, val]) => {
    const safe = name.replace(/[^a-zA-Z0-9_]/g, '_');
    lines.push(`# TYPE ${safe}_total counter`);
    lines.push(`${safe}_total ${val}`);
  });
  // Expose latency histogram + summaries: *_ms_bucket{le=""}, *_ms_count, *_ms_sum
  Object.keys(latency.count).forEach((name) => {
    const safe = name.replace(/[^a-zA-Z0-9_]/g, '_');
    const count = latency.count[name] || 0;
    const sum = latency.sumMs[name] || 0;
    lines.push(`# TYPE ${safe}_ms histogram`);
    const buckets = latency.histogram[name] || {};
    let cumulative = 0;
    const sortedBounds = Object.keys(buckets).map(Number).sort((a,b)=>a-b);
    for (const le of sortedBounds) {
      cumulative += buckets[le] || 0;
      lines.push(`${safe}_ms_bucket{le="${le}"} ${cumulative}`);
    }
    // +Inf bucket equals total count
    lines.push(`${safe}_ms_bucket{le="+Inf"} ${count}`);
    lines.push(`${safe}_ms_count ${count}`);
    lines.push(`${safe}_ms_sum ${sum}`);
  });
  lines.push(`# TYPE ik_image_processing_backlog gauge`);
  lines.push(`ik_image_processing_backlog ${backlogCount}`);
  const body = lines.join('\n') + '\n';
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
}
