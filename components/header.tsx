import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { company } from '@/lib/site';

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-blue-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-blue-900">
          {company.shortName}
        </Link>
        <nav className="flex items-center gap-5 text-sm text-slate-700">
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About</Link>
          <Link href="/dashboard">Dashboard</Link>
          {session?.user?.role === 'ADMIN' ? <Link href="/admin">Admin</Link> : null}
          {session ? (
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button className="rounded-full bg-blue-900 px-4 py-2 text-white">Logout</button>
            </form>
          ) : (
            <Link href="/login" className="rounded-full bg-blue-900 px-4 py-2 text-white">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
