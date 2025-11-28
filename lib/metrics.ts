// In-memory metrics (ephemeral; resets on deploy). Suitable for light Prometheus exposition.
const counters: Record<string, number> = {};
const latencyCount: Record<string, number> = {};
const latencySumMs: Record<string, number> = {};
const defaultBuckets = [50, 100, 250, 500, 1000, 2000];
const latencyBuckets: Record<string, Record<number, number>> = {};

export function trackMetric(name: string, value = 1, tags?: Record<string, string | number>) {
  counters[name] = (counters[name] || 0) + value;
  if (process.env.NODE_ENV !== 'test') {
    const tagStr = tags ? ' ' + Object.entries(tags).map(([k, v]) => `${k}=${v}`).join(' ') : '';
    console.log(`[metric] ${name} ${value}${tagStr}`);
  }
}

export function getMetricsSnapshot() {
  // Returns a shallow copy of counters for read-only exposition.
  return { ...counters };
}

export function recordLatency(name: string, ms: number) {
  latencyCount[name] = (latencyCount[name] || 0) + 1;
  latencySumMs[name] = (latencySumMs[name] || 0) + ms;
  const store = (latencyBuckets[name] = latencyBuckets[name] || Object.fromEntries(defaultBuckets.map(b => [b, 0])));
  for (const b of defaultBuckets) {
    if (ms <= b) {
      store[b] = (store[b] || 0) + 1;
      break;
    }
  }
}

export function getLatencySnapshot() {
  return {
    count: { ...latencyCount },
    sumMs: { ...latencySumMs },
    histogram: Object.fromEntries(
      Object.entries(latencyBuckets).map(([name, buckets]) => [
        name,
        Object.fromEntries(Object.entries(buckets).sort((a, b) => Number(a[0]) - Number(b[0])))
      ])
    ) as Record<string, Record<number, number>>
  };
}
