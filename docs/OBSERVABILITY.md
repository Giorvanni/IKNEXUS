## Observability: Metrics, Tracing, Alerts

This app exposes ephemeral in-memory metrics at `/api/metrics`. For production, scrape these with Prometheus (or push to a gateway) and set alerts.

### Metrics Exposed
  - `${name}_ms_bucket{le="50|100|250|500|1000|2000|+Inf"}`
  - `${name}_ms_count`, `${name}_ms_sum`

## Grafana

Import the starter dashboard from `ops/monitoring/grafana/ik-dashboard.json`.

- Set your Prometheus datasource UID (update `PROM_DS` if needed).
- Panels include:
  - Readiness p95 via `histogram_quantile(0.95, sum(rate(api_ready_ms_bucket[5m])) by (le))`
  - Readiness request rate via `sum(rate(api_ready_ms_count[5m]))`
  - `ik_image_processing_backlog` as a stat
  - `increase(rate_limit_denied_total[5m])`
  - `rate(metrics_exposed_total[5m])`

### Prometheus Integration (Expanded)
Example config files are provided under `ops/monitoring/`:
- `prometheus.yml.example` – scrape job for the app (`/api/metrics`).
- `alert_rules.yml.example` – starter alert rules (latency, cache miss ratio, image worker errors, low traffic).

Production considerations:
- Run Prometheus near the app (same VPC / cluster) to avoid cross‑region latency skew.
- Protect `/api/metrics` via network policy or basic auth reverse proxy if exposed publicly.
- Histogram quantiles: use `histogram_quantile(0.95, sum by (le) (rate(<metric>_ms_bucket[5m])))` for p95.
- Counters reset on deploy; rely on rate() / increase() not absolute values for alerts.

Starter alert examples (see file for full set):
```yaml
- alert: APIReadyHighLatency95p
  expr: histogram_quantile(0.95, sum by (le) (rate(api_ready_ms_bucket[5m]))) > 750
  for: 2m
  labels: { severity: warning }
  annotations:
    summary: 95p readiness latency high
```

### Prometheus Scrape Config (example)
```yaml
scrape_configs:
  - job_name: 'ik-engine'
    scrape_interval: 15s
    static_configs:
      - targets: ['ik-engine.example.com']
        labels:
          __metrics_path__: /api/metrics
```

### Suggested Alerts (Prometheus rule examples)
```yaml
groups:
  - name: ik-engine
    rules:
      # Readiness failing (probe your /api/ready via blackbox_exporter or 5xx rate)
      - alert: IkEngineReadinessFailing
        expr: probe_success{job="blackbox", instance="https://ik-engine.example.com/api/ready"} == 0
        for: 5m
        labels: { severity: critical }
        annotations:
          summary: Readiness failing
          description: "/api/ready is not returning 200 for 5m"

      # High 5xx rate (requires ingress/exported metrics or log-based metric)
      - alert: IkEngineHigh5xx
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 10m
        labels: { severity: warning }
        annotations:
          summary: High 5xx error rate
          description: ">5% 5xx over 10m"

      # Latency p95 > 1s using histogram_quantile over *_ms buckets
      - alert: IkEngineHighLatency
        expr: histogram_quantile(0.95, sum(rate(api_ready_ms_bucket[5m])) by (le)) > 1000
        for: 10m
        labels: { severity: warning }
        annotations:
          summary: High p95 latency
          description: "p95 of api_ready over 5m > 1s"

      # Image processing backlog
      - alert: IkEngineImageBacklog
        expr: ik_image_processing_backlog > 50
        for: 15m
        labels: { severity: warning }
        annotations:
          summary: Image backlog high
          description: "> 50 queued/processing for >15m"
```

### Sentry
- `lib/sentry.ts` uses `SENTRY_DSN`, tags `release` (`SENTRY_RELEASE`) and `environment` (`SENTRY_ENV`/`NODE_ENV`).

### Notes
- In-memory metrics reset on deploy; rely on Prometheus for durability.
- Consider adding a Prometheus sidecar or scraping via a secure endpoint/IP allowlist.
## Observability & Monitoring

Holistic guidance for logging, metrics, tracing, dashboards, and alerting. Keep additive; expand as system evolves.

### 1. Logging
- Structured logs via Pino (requestId, brandId, action fields).
- Level usage: `info` (mutations, worker lifecycle), `warn` (transient recoverable issues), `error` (exceptions), no `debug` in production unless feature-flagged.
- Redaction: never log secrets (env values, raw passwords). Password strength checks only log rejection meta.
- Shipping: forward stdout to aggregator (Datadog, Logtail, Vector). Include service name & version labels.
- Retention: 14–30 days hot, archive >90 days if compliance requires.

### 2. Metrics
- Counters: `media.process.started`, `media.process.error`, `media.process.duplicate`, `rate_limit.denied`, `auth.login.success`, `auth.login.failure`.
- Timers: image variant generation latency (sum & p95), API request duration (middleware wrapper future enhancement).
- Gauges: worker backlog depth (# pending ImageProcessingJob records).
- Collection strategy: initial lightweight internal counters; future: expose Prometheus `/metrics` or use OpenTelemetry exporters.
	- Endpoint: `/api/metrics` now provides Prometheus-style text exposition with `_total` counters and `ik_image_processing_backlog` gauge (ephemeral, resets on deploy).
	- `rate_limit.denied` counter increments with `backend` tag (`redis` or `memory`) when a request is blocked.
  - See `ops/monitoring/prometheus.yml.example` and `ops/monitoring/alert_rules.yml.example` for baseline scrape + rules.

### 3. Tracing (Future)
- Integrate OpenTelemetry SDK when `OTEL_EXPORTER_OTLP_ENDPOINT` env present.
- Trace boundaries: API route handlers, image worker job lifecycle, external calls (Redis, S3, Postgres).
- Span attributes: `brand.id`, `request.id`, `venture.slug`, `media.asset.id`.
- Sampling: always sample errors; baseline 10% of success traffic.

### 4. Dashboards
| Dashboard | Panels | Notes |
|-----------|--------|-------|
| API Health | Request rate, p95 latency, error % | Group by route pattern. |
| Media Pipeline | Backlog depth, variant latency p95, duplicate ratio | Alert if backlog > threshold. |
| Rate Limiting | 429 count, top offending IPs/domains | Use to tune limits & detect abuse. |
| Auth | Login successes/failures, failure codes | Spike in failures could indicate attack or config issue. |
| Database | Slow query count, connection utilization | PgBouncer/Proxy metrics when added. |

### 5. Alerting
| Condition | Threshold (suggested) | Action |
|-----------|-----------------------|--------|
| Error rate >5% over 5 min | dynamic baseline compare | Investigate deploy/recent changes; rollback if persistent. |
| Variant backlog age > 2m | sustained >2 cycles | Scale worker / optimize processing. |
| Rate limit denials spike 3x baseline | rolling 15 min | Check for abusive patterns; consider IP blocking. |
| Auth failure spike >10x norm | rolling 10 min | Potential credential stuffing; enable extra monitoring. |
| DB connection utilization >80% | sustained 10 min | Increase pool / optimize queries. |

### 6. SLOs (Draft)
- Availability (API): 99.9% monthly.
- Media variant latency: p95 < 30s from upload to first variant.
- Auth response time: p95 < 400ms.
- Error rate: <1% of total requests (excluding 4xx expected). 

### 7. Instrumentation Roadmap
1. Wrap API handlers with timing + error counter increment.
2. Add Prometheus endpoint for counters/gauges.
3. Introduce OpenTelemetry traces for critical flows (upload → process → variant ready).
4. Correlate logs & traces via `requestId` and `trace_id` injection.

### 8. Operational Runbooks
- High error spike: confirm failing route(s), check recent deployments, gather Sentry sample, roll back if necessary.
- Slow variants: inspect worker logs, confirm S3 latency, verify image sizes (oversized originals). Consider parallelization.
- Redis failures: fallback rate limit becomes per-instance; scale in caution until Redis restored.
- DB hotspots: enable slow query logging temporarily; prioritize index addition & query optimization.

### 9. Data Quality & Cardinality Control
- Limit label cardinality in metrics (avoid raw IDs as direct labels; prefer type or small buckets).
- Log large arrays/maps trimmed to reasonable length (e.g. first 5 valueProps). 

### 10. Privacy & Compliance
- Avoid logging user personal data beyond email (necessary for auth events). Hash or redact when adding analytics.
- Plan deletion/anonymization script for GDPR requests (future). 

### 11. Tooling Suggestions
- Metrics/Tracing: Prometheus + Grafana or OTEL to vendor (Honeycomb/DataDog).
- Logs: Vector sidecar to forward to chosen destination.
- Alert orchestration: PagerDuty or Opsgenie integrated with monitoring stack.

### 12. Future Enhancements
- Automated weekly accessibility and performance synthetic run results exported to dashboards.
- Error budget tracking (burn rate alerts for availability SLO). 
- Synthetic journey monitoring (login → edit venture → generate thumbnail). 

---
Update this document when new subsystems (queue, payments, passkeys) are introduced.
