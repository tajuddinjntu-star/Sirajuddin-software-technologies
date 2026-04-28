import { db } from '@/lib/db';

export async function getPublishedSoftware() {
  return db.software.findMany({
    where: { isPublished: true },
    include: { features: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getSoftwareBySlug(slug: string) {
  return db.software.findUnique({
    where: { slug },
    include: { features: true }
  });
}

export async function getAdminMetrics() {
  const [softwareCount, paidPurchases, grossSales, activeCustomers, recentDownloads, invoiceCount, revokedLicenses, receiptsSent, receiptBacklog] = await Promise.all([
    db.software.count(),
    db.purchase.count({ where: { status: 'PAID' } }),
    db.purchase.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    }),
    db.purchase.findMany({
      where: { status: 'PAID' },
      distinct: ['userId'],
      select: { userId: true }
    }),
    db.purchase.count({ where: { downloadCount: { gt: 0 } } }),
    db.invoice.count(),
    db.purchase.count({ where: { licenseStatus: 'REVOKED' } }),
    db.purchase.count({ where: { receiptStatus: 'SENT' } }),
    db.purchase.count({ where: { status: 'PAID', receiptStatus: { in: ['PENDING', 'PREPARED', 'FAILED'] } } })
  ]);

  return {
    softwareCount,
    paidPurchases,
    grossSales: grossSales._sum.amount || 0,
    activeCustomers: activeCustomers.length,
    recentDownloads,
    invoiceCount,
    revokedLicenses,
    receiptsSent,
    receiptBacklog
  };
}
