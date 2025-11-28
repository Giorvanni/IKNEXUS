import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.01']
  }
};

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export default function () {
  const res = http.get(`${BASE}/api/ventures`);
  check(res, {
    'status 200': r => r.status === 200,
    'ok true': r => r.json()?.ok === true,
    'has data array': r => Array.isArray(r.json()?.data)
  });
  sleep(1);
}

// Run with: k6 run scripts/load/ventures.js --env BASE_URL=http://127.0.0.1:3000