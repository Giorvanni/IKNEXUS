#!/usr/bin/env node
// Emits a sample trace span if telemetry initialized. Safe no-op otherwise.
const { startSpan } = require('../lib/telemetry');

function work() {
  let sum = 0;
  for (let i = 0; i < 100000; i++) sum += i;
  return sum;
}

const result = startSpan('otel-demo.work', () => work());
console.log('otel-demo result:', result);
console.log('If OTEL_EXPORTER_OTLP_ENDPOINT was set and dependencies installed, a span was exported.');
