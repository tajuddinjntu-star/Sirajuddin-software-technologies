# Sirajuddin Software Technologies Company Ltd. website starter — Business operations upgrade

This is the upgraded Next.js starter for publishing and selling software online with:

- Google / Gmail login
- Stripe Checkout payments
- admin-managed software catalog
- buyer dashboard for purchased software
- generated license keys on successful payment
- secure time-limited download grants instead of direct public download links
- invoice-ready purchase records and invoice table
- receipt email preview plus dispatch log scaffolding
- admin revoke/reactivate controls for licenses
- admin queue / mark-sent receipt controls
- admin invoice void controls
- Prisma database models for users, products, purchases, invoices, download grants, email dispatches, and audit events
- primary INR pricing with one-time purchases, plus monthly-plan support

## What changed in this upgrade

This version pushes the project from storefront starter toward operations starter:

1. payment completes via Stripe webhook
2. license key is generated for the purchase
3. invoice number is generated and stored
4. invoice record is created for finance tracking
5. receipt preview content is generated and logged into an email dispatch table
6. admin can revoke or reactivate licenses per order
7. admin can queue a receipt preview, mark receipts sent, and void invoices
8. buyer dashboard shows invoice summary, receipt state, license state, and latest email dispatch status

## Your configured business profile

- Company: **Sirajuddin Software Technologies Company Ltd.**
- UI direction: **professional blue product website**
- Featured product: **WeldWise Assistant (32)**
- Product type: **web tool**
- Primary currency: **INR**
- Main sales flow: **one-time purchase**
- Subscription support: **included in data model for future monthly plans**
- Domain: **not yet selected**

## Stack

- Next.js App Router
- Auth.js with Google provider
- Prisma ORM
- SQLite for local development
- Stripe Checkout

## Quick start

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name business_ops_upgrade
node prisma/seed.js
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/admin`
- `http://localhost:3000/dashboard`

## New database coverage in this upgrade

- `Invoice` remains the finance record for each paid purchase
- `EmailDispatch` tracks receipt/invoice delivery attempts or preview logs
- purchase-level fields now include `receiptSentAt`, `lastReceiptError`, `invoiceStatus`, `invoiceIssuedAt`, `invoiceVoidedAt`, and `invoiceVoidReason`
- secure delivery models remain in place

## Admin improvements

- receipt backlog and receipt sent metrics
- email dispatch table
- queue receipt preview action
- mark receipt sent action
- void invoice action
- existing license revoke/reactivate controls remain available

## Operations notes

This starter now supports **invoice-ready** commerce data and **receipt/email dispatch** scaffolding. It does not yet send real emails. To make that live, connect a provider such as Resend, Postmark, SendGrid, or SMTP, then replace the preview dispatch flow with a provider call inside `lib/email.ts`.

Recommended production path:

- PostgreSQL instead of SQLite
- object storage or signed URLs for downloads
- actual receipt emails
- invoice PDF generation
- coupon codes
- support desk integration
- finer-grained admin permissions

## Environment variables

Fill these in your `.env` file:

- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `ADMIN_EMAILS`
- `DEFAULT_CURRENCY`
- `COMPANY_NAME`
- `SUPPORT_EMAIL`
- `WHATSAPP_NUMBER`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`

## Notes

This is a strong commercial starter for your developer or agency to continue from. It includes the right primitives for license issuance, invoicing, delivery gating, and receipt operations, but it does **not** yet include:
update  deployment
- actual binary file hosting
- encrypted license activation with device binding
- real email provider integration
- tax invoice PDFs
- coupons and promotions
- reseller / affiliate flows
