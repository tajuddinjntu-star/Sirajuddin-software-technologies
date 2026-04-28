import crypto from 'crypto';

function normalizeChunk(value: string) {
  return value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 5).padEnd(5, 'X');
}

export function generateLicenseKey(input: { companyCode?: string; softwareSlug: string; userId: string; purchaseId: string }) {
  const company = normalizeChunk(input.companyCode || 'SST');
  const software = normalizeChunk(input.softwareSlug);
  const user = normalizeChunk(input.userId);
  const purchase = normalizeChunk(input.purchaseId);
  return `${company}-${software}-${user}-${purchase}`;
}

export function createDownloadToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
