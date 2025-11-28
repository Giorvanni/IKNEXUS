import React from 'react';
import { headers } from 'next/headers';
import AdminLiveStats from './AdminLiveStats';

export default async function AdminDashboardPage() {
  const h = headers();
  const host = h.get('host');
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const base = host ? `${proto}://${host}` : '';
  const brandsRes = await fetch(`${base}/api/brands`, { cache: 'no-store' });
  let brandDomain: string | null = null;
  let brandId: string | null = null;
  try {
    if (brandsRes.ok) {
      const j = await brandsRes.json();
      const b = j?.data?.[0];
      brandDomain = b?.domain || b?.slug || null;
      brandId = b?.id || null;
    }
  } catch {}

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="subtle mt-2 text-sm">Operational overview for media processing and platform health.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <AdminLiveStats domain={brandDomain} brandId={brandId} />
      </div>
    </section>
  );
}
