"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminPageItem { id: string; slug: string; title: string; published: boolean }

export default function AdminPagesList() {
  const [pages, setPages] = useState<AdminPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/pages');
    const j = await res.json().catch(() => ({}));
    setPages(Array.isArray(j) ? j : (j.data || []));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createPage() {
    setSaving(true);
    setError(null);
    try {
      const base = `nieuwe-pagina-${Date.now()}`;
      const body = { slug: base, title: 'Nieuwe Pagina', brandId: '' } as any;
      // fetch brandId from list item or ask backend to infer via header; here leave empty to let API require it
      // Better: hit GET /api/brands and pick first; keeping simple: try server infers from x-brand-id header when body brandId is empty
      const res = await fetch('/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error?.message || 'Kon pagina niet aanmaken');
      }
      const j = await res.json();
      const created = j.data || j;
      setPages(prev => [...prev, { id: created.id, slug: created.slug, title: created.title, published: created.published }]);
    } catch (e: any) {
      setError(e?.message || 'Fout bij aanmaken pagina');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Pagina’s</h1>
        <button onClick={createPage} disabled={saving} className="btn-primary text-xs disabled:opacity-60">{saving ? 'Maken…' : 'Nieuwe pagina'}</button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {loading ? (
        <p className="subtle mt-4 text-sm">Pagina’s laden…</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {pages.length === 0 ? <p className="text-sm subtle">Nog geen pagina’s.</p> : pages.map(p => (
            <div key={p.id} className="rounded-md border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-[11px] subtle">/{p.slug} · {p.published ? 'Gepubliceerd' : 'Concept'}</p>
              </div>
              <div className="flex gap-2">
                <Link className="btn-secondary text-xs" href={`/admin/pages/${p.slug}`}>Bewerken</Link>
                <a className="btn-secondary text-xs" href={`/${p.slug === 'home' ? '' : p.slug}`} target="_blank" rel="noreferrer">Bekijken</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
