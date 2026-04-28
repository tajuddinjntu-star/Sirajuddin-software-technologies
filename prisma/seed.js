const { PrismaClient, BillingType, DeliveryMethod } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.downloadGrant.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.softwareFeature.deleteMany();
  await prisma.software.deleteMany();
  await prisma.auditLog.deleteMany();

  await prisma.software.create({
    data: {
      name: 'WeldWise Assistant (32)',
      slug: 'weldwise-assistant-32',
      description: 'Oil & gas welding data software for fabrication, QA/QC, and reporting teams.',
      longDescription: 'WeldWise Assistant (32) helps welding engineers, QC inspectors, and project controls teams manage welding logs, joint tracking, report traceability, fit-up status, NDE status, and buyer-ready documentation in one place.',
      price: 1499900,
      currency: 'INR',
      billingType: BillingType.ONE_TIME,
      monthlyPrice: 199900,
      category: 'Welding QA/QC',
      platform: 'Web Tool',
      version: 'v2.0',
      downloadUrl: 'https://example.com/protected/weldwise-assistant-32',
      supportUrl: 'https://example.com/support',
      licenseEnabled: true,
      deliveryMethod: DeliveryMethod.SECURE_REDIRECT,
      features: {
        create: [
          { label: 'Centralized weld log management' },
          { label: 'Fit-up, NDE, and repair tracking' },
          { label: 'Project-ready dashboard for oil & gas teams' },
          { label: 'Secure buyer access with license key issuance' }
        ]
      }
    }
  });
}

main().finally(async () => prisma.$disconnect());
