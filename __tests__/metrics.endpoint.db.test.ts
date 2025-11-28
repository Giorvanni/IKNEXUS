jest.mock('../lib/prisma', () => ({ __esModule: true, default: { imageProcessingJob: { count: jest.fn().mockResolvedValue(7) } } }));
import { NextRequest } from 'next/server';
import { GET } from '../app/api/metrics/route';
import { trackMetric } from '../lib/metrics';

describe('/api/metrics endpoint', () => {
  it('exposes counters and backlog gauge', async () => {
    process.env.NODE_ENV = 'test';
    trackMetric('media.process.started', 3);
    trackMetric('auth.login.success', 1);
    const req = new NextRequest('http://localhost/api/metrics');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('media_process_started_total');
    expect(text).toContain('auth_login_success_total');
    expect(text).toMatch(/ik_image_processing_backlog 7/);
  });
});
