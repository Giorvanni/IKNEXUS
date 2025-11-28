export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMIT'
  | 'VALIDATION'
  | 'INVALID_JSON'
  | 'CREATE_FAILED'
  | 'UPDATE_FAILED'
  | 'DELETE_FAILED'
  | 'SLUG_EXISTS'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL';

export interface ErrorDetails {
  code: ErrorCode;
  message?: string;
  details?: any;
}

function json(data: any, init?: ResponseInit & { headers?: Record<string, string> }) {
  const headers = {
    'Content-Type': 'application/json',
    ...(init?.headers || {})
  } as Record<string, string>;
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function ok(data: any, headers?: Record<string, string>) {
  return json({ ok: true, data }, { headers });
}

export function fail(code: ErrorCode, status: number, message?: string, details?: any, headers?: Record<string, string>) {
  return json({ ok: false, error: { code, message, details } }, { status, headers });
}

export function validation(details: any, headers?: Record<string, string>) {
  return fail('VALIDATION', 400, undefined, details, headers);
}

export function rateLimited(message = 'Too many requests', headers?: Record<string, string>) {
  return fail('RATE_LIMIT', 429, message, undefined, headers);
}

export function notFound(message = 'Not found', headers?: Record<string, string>) {
  return fail('NOT_FOUND', 404, message, undefined, headers);
}

export function unauthorized(headers?: Record<string, string>) {
  return fail('UNAUTHORIZED', 401, 'Unauthorized', undefined, headers);
}

export function forbidden(headers?: Record<string, string>) {
  return fail('FORBIDDEN', 403, 'Forbidden', undefined, headers);
}
