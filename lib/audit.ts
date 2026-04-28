import { db } from '@/lib/db';

export async function createAuditLog(input: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  meta?: Record<string, unknown> | null;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId || undefined,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || undefined,
        meta: input.meta ? JSON.stringify(input.meta) : undefined
      }
    });
  } catch {
    // fail quietly in starter template
  }
}
