"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/blog?drafts=1', { cache: 'no-store' });
      const payload = await res.json().catch(() => ({}));
      const data = Array.isArray(payload) ? payload : payload?.data;
      setPosts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Kon blogartikelen niet laden');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createPost() {
    setCreating(true);
    setError(null);
    try {
      const slug = `blog-${Date.now()}`;
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nieuw blogartikel',
          slug,
          excerpt: 'Schrijf hier de intro van het artikel.'
        })
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error?.message || 'Aanmaken mislukt');
      }
      const payload = await res.json();
      const created = payload?.data || payload;
      setPosts((prev) => [...prev, created]);
      router.push(`/admin/blog/${created.slug}`);
    } catch (e: any) {
      setError(e?.message || 'Kon nieuw artikel niet aanmaken');
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="subtle text-sm">Beheer standaard blogpagina&apos;s met een vaste lay-out.</p>
        </div>
        <button onClick={createPost} disabled={creating} className="btn-primary text-xs disabled:opacity-60">
          {creating ? 'Bezig...' : 'Nieuw artikel'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Blogartikelen laden...</p>
      ) : posts.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Nog geen blogartikelen.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {posts
            .sort((a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt))
            .map((post) => (
              <div key={post.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{post.title}</p>
                  <p className="text-xs text-slate-500">
                    {post.published ? 'Gepubliceerd' : 'Concept'} · {post.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/blog/${post.slug}`} className="btn-secondary text-xs" target="_blank" rel="noreferrer">
                    Bekijken
                  </Link>
                  <Link href={`/admin/blog/${post.slug}`} className="btn-secondary text-xs">
                    Bewerken
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
