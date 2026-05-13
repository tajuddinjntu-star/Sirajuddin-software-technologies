import { db } from '@/lib/db';

type DispatchStatus = 'PREVIEW' | 'QUEUED' | 'SENT' | 'FAILED';

export async function createEmailDispatch(input: {
  purchaseId?: string;
  invoiceId?: string;
  userId?: string;
  softwareId?: string;
  toEmail: string;
  subject: string;
  templateKey: string;
  previewText?: string;
  provider?: string;
  status?: DispatchStatus;
  errorMessage?: string;
  sentAt?: Date;
}) {
return db.emailDispatch.create({
  data: {
    purchaseId: input.purchaseId,
    invoiceId: input.invoiceId,
    userId: input.userId,

    toEmail: input.toEmail,
    subject: input.subject,

    templateKey: input.templateKey || "receipt",

    status: input.errorMessage ? "FAILED" : "SENT",
    errorMessage: input.errorMessage || null,
    sentAt: input.errorMessage ? null : new Date(),
  },
});
    data: {
  status: input.errorMessage ? "FAILED" : "SENT",
  errorMessage: input.errorMessage,
  sentAt: input.errorMessage ? null : now
}
  });
}

export async function queueReceiptEmail(input: {
  purchaseId: string;
  invoiceId?: string | null;
  userId: string;
  softwareId: string;
  toEmail: string;
  subject: string;
  previewText: string;
}) {
  const provider = process.env.EMAIL_PROVIDER || 'preview';
  const dispatch = await createEmailDispatch({
    purchaseId: input.purchaseId,
    invoiceId: input.invoiceId || undefined,
    userId: input.userId,
    softwareId: input.softwareId,
    toEmail: input.toEmail,
    subject: input.subject,
    templateKey: 'purchase-receipt',
    previewText: input.previewText,
    provider,
    status: provider === 'preview' ? 'PREVIEW' : 'QUEUED'
  });

  return dispatch;
}

export async function markReceiptAsSent(input: { purchaseId: string; providerId?: string; errorMessage?: string }) {
  const now = new Date();
  await db.purchase.update({
    where: { id: input.purchaseId },
    data: {
      receiptStatus: input.errorMessage ? 'FAILED' : 'SENT',
      receiptSentAt: input.errorMessage ? null : now,
      lastReceiptError: input.errorMessage || null
    }
  });

  const dispatch = await db.emailDispatch.findFirst({
    where: { purchaseId: input.purchaseId },
    orderBy: { createdAt: 'desc' }
  });

  if (dispatch) {
    await db.emailDispatch.update({
      where: { id: dispatch.id },
      data: {
        status: input.errorMessage ? 'FAILED' : 'SENT',
        lastError: input.errorMessage,
        sentAt: input.errorMessage ? null : now
      }
    });
  }

  const purchase = await db.purchase.findUnique({ where: { id: input.purchaseId }, include: { invoice: true } });
  if (purchase?.invoice && !input.errorMessage) {
    await db.invoice.update({
      where: { id: purchase.invoice.id },
      data: { receiptSentAt: now }
    });
  }
}
