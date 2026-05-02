import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { formatCurrency } from '@/lib/site';
import { getAdminMetrics } from '@/lib/products';
import { createAuditLog } from '@/lib/audit';
import { buildReceiptEmail } from '@/lib/receipt';
import { createEmailDispatch, markReceiptAsSent } from '@/lib/email';
import { voidInvoiceForPurchase } from '@/lib/invoice';

async function createSoftware(formData: FormData) {
  'use server';
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const name = String(formData.get('name') || '');
  const slug = String(formData.get('slug') || '');
  const description = String(formData.get('description') || '');
  const longDescription = String(formData.get('longDescription') || '');
  const price = Number(formData.get('price') || 0);
  const currency = String(formData.get('currency') || 'INR');
  const billingType = String(formData.get('billingType') || 'ONE_TIME') as 'ONE_TIME' | 'MONTHLY';
  const category = String(formData.get('category') || 'Software');
  const platform = String(formData.get('platform') || 'Web tool');
  const version = String(formData.get('version') || 'v1.0');
  const downloadUrl = String(formData.get('downloadUrl') || '');
  const supportUrl = String(formData.get('supportUrl') || '');
  const deliveryMethod = String(formData.get('deliveryMethod') || 'SECURE_REDIRECT') as 'SECURE_REDIRECT' | 'MANUAL_FULFILLMENT';
  const featureText = String(formData.get('features') || '');
  const features = featureText.split('\n').map((x) => x.trim()).filter(Boolean);

  const software = await db.software.create({
    data: {
      name,
      slug,
      description,
      longDescription,
      price: Math.round(price * 100),
      currency,
      billingType,
      category,
      platform,
      version,
      downloadUrl,
      supportUrl,
      deliveryMethod,
      features: {
        create: features.map((label) => ({ label }))
      }
    }
  });

  await createAuditLog({
    userId: session.user.id,
    action: 'SOFTWARE_CREATED',
    entityType: 'Software',
    entityId: software.id,
    meta: { slug, currency, deliveryMethod }
  });

  revalidatePath('/');
  revalidatePath('/pricing');
  revalidatePath('/admin');
}

async function revokeLicense(formData: FormData) {
  'use server';
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
  const purchaseId = String(formData.get('purchaseId') || '');
  const reason = String(formData.get('reason') || 'Admin action');

  const purchase = await db.purchase.update({
    where: { id: purchaseId },
    data: {
      licenseStatus: 'REVOKED',
      licenseRevokedAt: new Date(),
      licenseRevokedReason: reason
    },
    include: { user: true, software: true }
  });

  await db.downloadGrant.updateMany({
    where: { purchaseId, status: 'ACTIVE' },
    data: { status: 'REVOKED' }
  });

  await createAuditLog({
    userId: session.user.id,
    action: 'LICENSE_REVOKED',
    entityType: 'Purchase',
    entityId: purchaseId,
    meta: { reason, customerEmail: purchase.user.email, software: purchase.software.name }
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

async function reactivateLicense(formData: FormData) {
  'use server';
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
  const purchaseId = String(formData.get('purchaseId') || '');

  const purchase = await db.purchase.update({
    where: { id: purchaseId },
    data: {
      licenseStatus: 'ACTIVE',
      licenseRevokedAt: null,
      licenseRevokedReason: null
    },
    include: { user: true, software: true }
  });

  await createAuditLog({
    userId: session.user.id,
    action: 'LICENSE_REACTIVATED',
    entityType: 'Purchase',
    entityId: purchaseId,
    meta: { customerEmail: purchase.user.email, software: purchase.software.name }
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

async function queueReceiptPreview(formData: FormData) {
  'use server';
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
  const purchaseId = String(formData.get('purchaseId') || '');

  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
    include: { user: true, software: true, invoice: true }
  });
  if (!purchase || !purchase.user.email || purchase.status !== 'PAID') return;

  const receipt = buildReceiptEmail({
    companyName: process.env.COMPANY_NAME || 'Sirajuddin Software Technologies Company Ltd.',
    customerName: purchase.user.name,
    customerEmail: purchase.user.email,
    softwareName: purchase.software.name,
    invoiceNumber: purchase.invoiceNumber || purchase.invoice?.invoiceNumber || 'Pending',
    amount: purchase.amount,
    currency: purchase.currency,
    paidAt: purchase.paidAt || purchase.createdAt,
    licenseKey: purchase.licenseKey
  });

  await createEmailDispatch({
    purchaseId: purchase.id,
    invoiceId: purchase.invoice?.id,
    userId: purchase.userId,
    softwareId: purchase.softwareId,
    toEmail: purchase.user.email,
    subject: receipt.subject,
    templateKey: 'purchase-receipt',
    previewText: receipt.text,
    provider: process.env.EMAIL_PROVIDER || 'preview',
    status: 'PREVIEW'
  });

  await db.purchase.update({
    where: { id: purchaseId },
    data: {
      receiptStatus: 'PREPARED',
      receiptPreparedAt: new Date(),
      lastReceiptError: null
    }
  });

  await createAuditLog({
    userId: session.user.id,
    action: 'RECEIPT_PREVIEW_QUEUED',
    entityType: 'Purchase',
    entityId: purchaseId,
    meta: { customerEmail: purchase.user.email }
  });

  revalidatePath('/admin');
}

async function markReceiptSent(formData: FormData) {
  'use server';
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
  const purchaseId = String(formData.get('purchaseId') || '');

  await markReceiptAsSent({ purchaseId, providerId: 'manual-admin-confirmation' });

  await createAuditLog({
    userId: session.user.id,
    action: 'RECEIPT_MARKED_SENT',
    entityType: 'Purchase',
    entityId: purchaseId
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

async function voidInvoice(formData: FormData) {
  'use server';
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/');
  const purchaseId = String(formData.get('purchaseId') || '');
  const reason = String(formData.get('reason') || 'Admin void');

  const invoice = await voidInvoiceForPurchase({ purchaseId, reason });
  if (!invoice) return;

  await createAuditLog({
    userId: session.user.id,
    action: 'INVOICE_VOIDED',
    entityType: 'Invoice',
    entityId: invoice.id,
    meta: { reason, invoiceNumber: invoice.invoiceNumber }
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  const [products, orders, metrics, auditLogs, invoices, emailDispatches] = await Promise.all([
    db.software.findMany({ include: { features: true }, orderBy: { createdAt: 'desc' } }),
    db.purchase.findMany({ include: { software: true, user: true, invoice: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
    getAdminMetrics(),
    db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 12 }),
    db.invoice.findMany({ include: { software: true, user: true }, orderBy: { issuedAt: 'desc' }, take: 10 }),
    db.emailDispatch.findMany({ orderBy: { createdAt: 'desc' }, take: 10 })
  ]);

  return (
    <main className="section">
      <div className="container">
        <span className="badge">Admin</span>
        <h1 style={{ fontSize: 38, margin: '12px 0' }}>Store management</h1>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 24 }}>
          <div className="card"><h3>Total software</h3><p style={{ fontSize: 28, fontWeight: 700 }}>{metrics.softwareCount}</p></div>
          <div className="card"><h3>Paid orders</h3><p style={{ fontSize: 28, fontWeight: 700 }}>{metrics.paidPurchases}</p></div>
          <div className="card"><h3>Gross sales</h3><p style={{ fontSize: 28, fontWeight: 700 }}>{formatCurrency(metrics.grossSales, 'INR')}</p></div>
          <div className="card"><h3>Customers</h3><p style={{ fontSize: 28, fontWeight: 700 }}>{metrics.activeCustomers}</p></div>
          <div className="card"><h3>Receipts sent</h3><p style={{ fontSize: 28, fontWeight: 700 }}>{metrics.receiptsSent}</p></div>
          <div className="card"><h3>Receipt backlog</h3><p style={{ fontSize: 28, fontWeight: 700 }}>{metrics.receiptBacklog}</p></div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
          <div className="card">
            <h2>Add software</h2>
            <form action={createSoftware} className="grid">
              <input name="name" placeholder="Software name" required />
              <input name="slug" placeholder="software-slug" required />
              <input name="description" placeholder="Short description" required />
              <textarea name="longDescription" placeholder="Detailed description" rows={5} required />
              <input name="price" type="number" step="0.01" placeholder="Price e.g. 4999" required />
              <input name="currency" defaultValue="INR" />
              <select name="billingType" defaultValue="ONE_TIME"><option value="ONE_TIME">One-time</option><option value="MONTHLY">Monthly</option></select>
              <select name="deliveryMethod" defaultValue="SECURE_REDIRECT"><option value="SECURE_REDIRECT">Secure redirect</option><option value="MANUAL_FULFILLMENT">Manual fulfillment</option></select>
              <input name="category" placeholder="Category" />
              <input name="platform" placeholder="Platform" />
              <input name="version" placeholder="Version" />
              <input name="downloadUrl" placeholder="Protected target URL (optional)" />
              <input name="supportUrl" placeholder="Support URL (optional)" />
              <textarea name="features" placeholder="One feature per line" rows={5} />
              <button className="btn-primary">Save software</button>
            </form>
          </div>

          <div className="card">
            <h2>Operations notes</h2>
            <ul className="muted" style={{ lineHeight: 1.8, paddingLeft: 18 }}>
              <li>Buyer downloads go through a signed one-time route.</li>
              <li>Each grant expires after 15 minutes.</li>
              <li>Webhook generates invoice, receipt preview, and license key.</li>
              <li>Email dispatches are logged even before a real provider is connected.</li>
              <li>Admin can revoke/reactivate licenses and void invoices.</li>
            </ul>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 24 }}>
          <div className="card">
            <h2>Recent software</h2>
            <table className="table">
              <thead><tr><th>Name</th><th>Delivery</th><th>Currency</th></tr></thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id}><td>{product.name}</td><td>{product.deliveryMethod}</td><td>{product.currency}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2>Audit log</h2>
            <table className="table">
              <thead><tr><th>Action</th><th>Entity</th><th>Time</th></tr></thead>
              <tbody>
                {auditLogs.map((log: any) => (
                  <tr key={log.id}><td>{log.action}</td><td>{log.entityType}</td><td>{new Date(log.createdAt).toLocaleDateString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Recent invoices</h2>
          <table className="table">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Software</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}><td>{invoice.invoiceNumber}</td><td>{invoice.user.email}</td><td>{invoice.software.name}</td><td>{formatCurrency(invoice.totalAmount, invoice.currency)}</td><td>{invoice.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Recent email dispatches</h2>
          <table className="table">
            <thead><tr><th>To</th><th>Subject</th><th>Template</th><th>Status</th><th>Provider</th></tr></thead>
            <tbody>
              {emailDispatches.map((dispatch) => (
                <tr key={dispatch.id}><td>{dispatch.toEmail}</td><td>{dispatch.subject}</td><td>{dispatch.templateKey}</td><td>{dispatch.status}</td><td>{dispatch.provider}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2>Recent orders</h2>
          <table className="table">
            <thead><tr><th>Customer</th><th>Software</th><th>Status</th><th>License</th><th>Receipt</th><th>Invoice</th><th>Amount</th><th>Action</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.user.email}</td>
                  <td>{order.software.name}</td>
                  <td>{order.status}</td>
                  <td>{order.licenseStatus}</td>
                  <td>{order.receiptStatus}</td>
                  <td>{order.invoiceStatus}</td>
                  <td>{formatCurrency(order.amount, order.currency)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {order.licenseStatus === 'ACTIVE' ? (
                        <form action={revokeLicense}>
                          <input type="hidden" name="purchaseId" value={order.id} />
                          <input type="hidden" name="reason" value="Admin review" />
                          <button className="btn-secondary">Revoke</button>
                        </form>
                      ) : (
                        <form action={reactivateLicense}>
                          <input type="hidden" name="purchaseId" value={order.id} />
                          <button className="btn-primary">Reactivate</button>
                        </form>
                      )}

                      <form action={queueReceiptPreview}>
                        <input type="hidden" name="purchaseId" value={order.id} />
                        <button className="btn-secondary">Queue receipt</button>
                      </form>

                      {order.receiptStatus !== 'SENT' ? (
                        <form action={markReceiptSent}>
                          <input type="hidden" name="purchaseId" value={order.id} />
                          <button className="btn-secondary">Mark sent</button>
                        </form>
                      ) : null}

                      {order.invoiceStatus !== 'VOID' ? (
                        <form action={voidInvoice}>
                          <input type="hidden" name="purchaseId" value={order.id} />
                          <input type="hidden" name="reason" value="Admin void" />
                          <button className="btn-secondary">Void invoice</button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
