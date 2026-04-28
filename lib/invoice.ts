import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/site';

export function generateInvoiceNumber(input: { purchaseId: string; issuedAt?: Date }) {
  const date = input.issuedAt || new Date();
  const year = date.getUTCFullYear();
  const suffix = input.purchaseId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return `SST-${year}-${suffix}`;
}

export async function ensureInvoiceForPurchase(input: {
  purchaseId: string;
  userId: string;
  softwareId: string;
  currency: string;
  subtotalAmount: number;
  taxAmount?: number;
  invoiceNumber?: string;
  notes?: string;
}) {
  const existing = await db.invoice.findUnique({ where: { purchaseId: input.purchaseId } });
  if (existing) return existing;

  const taxAmount = input.taxAmount || 0;
  const invoiceNumber = input.invoiceNumber || generateInvoiceNumber({ purchaseId: input.purchaseId });

  return db.invoice.create({
    data: {
      purchaseId: input.purchaseId,
      userId: input.userId,
      softwareId: input.softwareId,
      invoiceNumber,
      currency: input.currency,
      subtotalAmount: input.subtotalAmount,
      taxAmount,
      totalAmount: input.subtotalAmount + taxAmount,
      notes: input.notes
    }
  });
}

export async function voidInvoiceForPurchase(input: { purchaseId: string; reason: string }) {
  const purchase = await db.purchase.findUnique({
    where: { id: input.purchaseId },
    include: { invoice: true }
  });
  if (!purchase?.invoice) return null;

  const now = new Date();

  await db.purchase.update({
    where: { id: input.purchaseId },
    data: {
      invoiceStatus: 'VOID',
      invoiceVoidedAt: now,
      invoiceVoidReason: input.reason
    }
  });

  return db.invoice.update({
    where: { purchaseId: input.purchaseId },
    data: {
      status: 'VOID',
      voidedAt: now,
      voidReason: input.reason
    }
  });
}

export function buildInvoiceSummary(input: {
  invoiceNumber: string;
  companyName: string;
  customerName?: string | null;
  customerEmail?: string | null;
  softwareName: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  issuedAt?: Date | null;
  status: 'ISSUED' | 'VOID';
  licenseKey?: string | null;
}) {
  const issuedAt = input.issuedAt ? input.issuedAt.toLocaleString() : 'Pending issue date';
  return [
    `${input.companyName}`,
    `Invoice number: ${input.invoiceNumber}`,
    `Invoice status: ${input.status}`,
    `Issued at: ${issuedAt}`,
    '',
    `Bill to: ${input.customerName || 'Customer'} <${input.customerEmail || 'unknown'}>`,
    `Product: ${input.softwareName}`,
    `Subtotal: ${formatCurrency(input.subtotalAmount, input.currency)}`,
    `Tax: ${formatCurrency(input.taxAmount, input.currency)}`,
    `Total: ${formatCurrency(input.totalAmount, input.currency)}`,
    `License key: ${input.licenseKey || 'Assigned after payment confirmation'}`
  ].join('\n');
}
