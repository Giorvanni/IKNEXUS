// Optional OpenTelemetry bootstrap. Initializes only when OTEL_EXPORTER_OTLP_ENDPOINT is set.
// Keeps footprint minimal; no instrumentation libraries unless explicitly expanded.
import { env } from './env';

let initialized = false;

export function initTelemetry() {
  if (initialized || !env.telemetryEnabled) return false;
  try {
    // Dynamically import to avoid bundling for environments without telemetry.
    const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
    const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
    const { Resource } = require('@opentelemetry/resources');
    const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
    const provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'ik-engine-app',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.NODE_ENV,
      })
    });
    const exporter = new OTLPTraceExporter({ url: env.OTEL_EXPORTER_OTLP_ENDPOINT });
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register();
    initialized = true;
    return true;
  } catch (e) {
    // Silent failure: missing deps or runtime not supporting modules.
    return false;
  }
}

export function startSpan(name: string, fn: () => any) {
  if (!initialized) return fn();
  try {
    const api = require('@opentelemetry/api');
    const tracer = api.trace.getTracer('ik-engine');
    return api.context.with(api.trace.setSpan(api.context.active(), tracer.startSpan(name)), () => {
      try {
        const result = fn();
        const span = api.trace.getSpan(api.context.active());
        span?.end();
        return result;
      } catch (e: any) {
        const span = api.trace.getSpan(api.context.active());
        span?.recordException(e);
        span?.setStatus({ code: 2, message: e.message });
        span?.end();
        throw e;
      }
    });
  } catch {
    return fn();
  }
}

// Initialize immediately when module imported in server runtime.
initTelemetry();
