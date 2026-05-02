import { addMinutes } from '@/lib/time';
import { db } from '@/lib/db';
import { createDownloadToken, hashToken } from '@/lib/license';
import { createAuditLog } from '@/lib/audit';

export async function issueDownloadGrant(purchaseId: string) {
  const rawToken = createDownloadToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = addMinutes(new Date(), 15);

  await db.downloadGrant.create({
    data: {
      purchaseId,
      tokenHash,
      expiresAt
    }
  });

  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
    include: { software: true }
  });

  await createAuditLog({
    userId: purchase?.userId,
    action: 'DOWNLOAD_LINK_ISSUED',
    entityType: 'Purchase',
    entityId: purchaseId,
    meta: { softwareId: purchase?.softwareId, expiresAt: expiresAt.toISOString() }
  });

  return rawToken;
}

export async function consumeDownloadGrant(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const now = new Date();
 const grant = await db.downloadGrant.findFirst({
  where: { tokenHash }
});
  if (!grant) return { ok: false as const, reason: 'invalid' };
  if (grant.status !== 'ACTIVE') return { ok: false as const, reason: 'inactive' };
  if (grant.expiresAt < now) {
    await db.downloadGrant.update({ where: { id: grant.id }, data: { status: 'EXPIRED' } });
    return { ok: false as const, reason: 'expired' };
  }
  if (grant.usedAt) return { ok: false as const, reason: 'used' };
  if (grant.purchase.status !== 'PAID') return { ok: false as const, reason: 'unpaid' };
  if (grant.purchase.licenseStatus !== 'ACTIVE') return { ok: false as const, reason: 'revoked' };

  await db.$transaction([
    db.downloadGrant.update({
      where: { id: grant.id },
      data: { usedAt: now, status: 'USED' }
    }),
    db.purchase.update({
      where: { id: grant.purchase.id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: now,
        grantedAt: grant.purchase.grantedAt || now
      }
    })
  ]);

  await createAuditLog({
    userId: grant.purchase.userId,
    action: 'DOWNLOAD_LINK_USED',
    entityType: 'Purchase',
    entityId: grant.purchase.id,
    meta: { softwareId: grant.purchase.softwareId }
  });

  return { ok: true as const, grant };
}
