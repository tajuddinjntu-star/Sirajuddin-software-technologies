import Link from 'next/link';
import { company } from '@/lib/site';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-3">
        <div>
          <h3 className="font-semibold text-slate-900">{company.name}</h3>
          <p className="mt-2 text-sm text-slate-600">{company.description}</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Company</h4>
          <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600">
            <Link href="/about">About</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Support</h4>
          <p className="mt-2 text-sm text-slate-600">Email: {company.supportEmail}</p>
          <p className="text-sm text-slate-600">WhatsApp: {company.whatsapp}</p>
        </div>
      </div>
    </footer>
  );
}
