export const company = {
  name: process.env.COMPANY_NAME || 'Sirajuddin Software Technologies Company Ltd.',
  shortName: 'Sirajuddin Software',
  description:
    'Industrial software products for welding data control, QA/QC reporting, and engineering workflow digitization.',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
  whatsapp: process.env.WHATSAPP_NUMBER || '+966500000000',
  primaryColor: 'blue',
  primaryCurrency: process.env.DEFAULT_CURRENCY || 'INR'
};

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount / 100);
}
