import { prisma } from '../lib/prisma';
import { logAudit } from '../lib/audit';

describe('Audit logging', () => {
  it('creates an audit log entry', async () => {
    const before = await prisma.auditLog.count();
    await logAudit({ action: 'TEST', entity: 'Unit', entityId: '123', userId: null, data: { example: true } });
    const after = await prisma.auditLog.count();
    expect(after).toBeGreaterThanOrEqual(before + 1);
  });
});