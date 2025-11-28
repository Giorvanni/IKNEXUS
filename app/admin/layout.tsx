import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminSessionProvider from './AdminSessionProvider';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'ADMIN' && role !== 'EDITOR')) {
    redirect('/login');
  }
  return (
    <AdminSessionProvider session={session}>
      <div className="min-h-screen grid md:grid-cols-[220px_1fr]">
        <aside className="border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold tracking-tight">Admin</h2>
            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Role: <span className="font-mono">{role}</span></p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Brand ID: <span className="font-mono">{(session?.user as any)?.brandId || 'n/a'}</span></p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/admin" className="hover:text-brand-600">Dashboard</Link>
            <Link href="/admin/pages" className="hover:text-brand-600">Pagina&apos;s</Link>
            <Link href="/admin/blog" className="hover:text-brand-600">Blog</Link>
            <Link href="/admin/rituelen" className="hover:text-brand-600">Rituelen</Link>
            <Link href="/admin/brands" className="hover:text-brand-600">Brand Settings</Link>
            <Link href="/admin/deploy" className="hover:text-brand-600">Deploy</Link>
            <Link href="/admin/help" className="hover:text-brand-600">Help</Link>
          </nav>
          <form action="/api/auth/signout" method="post" className="mt-auto">
            <button className="btn-secondary w-full text-xs" formAction="/api/auth/signout">Sign Out</button>
          </form>
        </aside>
        <div>{children}</div>
      </div>
    </AdminSessionProvider>
  );
}
