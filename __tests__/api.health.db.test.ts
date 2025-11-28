import { GET as HealthGET } from '../app/api/health/route';

describe('health route', () => {
  it('returns ok with at least db status', async () => {
    const res = await HealthGET({} as any);
    expect(res.status).toBeGreaterThanOrEqual(200);
    const json = await (res as any).json();
    expect(json.services.db).toBeDefined();
  });
});
