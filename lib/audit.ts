import { prisma } from './prisma';

// Structured audit data (extend cautiously; prefer additive changes).
export interface AuditLogDataBase {
  slug?: string;
  fields?: string[];          // all mutated fields
  fieldsCleared?: string[];    // subset of fields explicitly cleared (null or empty array)
  meta?: Record<string, any>;  // reserved for future small metadata items
}

interface AuditParams {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string | null;
  data?: AuditLogDataBase | Record<string, any>;
  requestId?: string;
}

export async function logAudit({ action, entity, entityId, userId, data, requestId }: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: userId || undefined,
        data: { ...(data as any), meta: { ...(data as any)?.meta, requestId } }
      }
    });
  } catch (e) {
    // Fail silently to not block main action; could add monitoring later
    console.error('Audit log failed', e);
  }
}