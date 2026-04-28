import Link from 'next/link';
import { formatCurrency } from '@/lib/site';

export function ProductCard({ product }: { product: any }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
        {product.category || 'Software'}
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{product.name}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
      <div className="mt-4 text-2xl font-bold text-blue-900">{formatCurrency(product.price, product.currency)}</div>
      <p className="mt-1 text-xs text-slate-500">
        {product.billingType === 'MONTHLY' ? 'Monthly plan' : 'One-time license'}
      </p>
      <Link
        href={`/software/${product.slug}`}
        className="mt-6 inline-flex rounded-full bg-blue-900 px-4 py-2 text-sm font-medium text-white"
      >
        View software
      </Link>
    </div>
  );
}
