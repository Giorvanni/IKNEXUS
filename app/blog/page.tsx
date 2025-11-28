import { headers } from 'next/headers';
import Link from 'next/link';
import { getBlogPosts } from '../../lib/blog';

function formatDate(value: string | null): string {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
  } catch {
    return '';
  }
}

export default async function BlogIndexPage() {
  const brandId = headers().get('x-brand-id');
  const posts = await getBlogPosts(brandId, { includeDrafts: false });
  return (
    <section className="container py-16 lg:py-24">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Studio Blog</p>
        <h1 className="mt-4 text-4xl font-serif font-semibold tracking-tight text-slate-900 dark:text-slate-50">Verhalen uit de behandelkamer</h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
          Lees mee hoe we fascia, huid en adem combineren in de studio. Elk artikel bevat praktische tips zodat je meteen thuis verder kunt vertragen.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {posts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nog geen blogartikelen. Kom binnenkort terug.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/60">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{formatDate(post.publishedAt ?? post.createdAt)}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-50">{post.title}</h2>
              {post.excerpt && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>}
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                {post.authorName && <span>{post.authorName}</span>}
                <span aria-hidden="true">•</span>
                <span>{post.readingMinutes} min leestijd</span>
              </div>
              <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex items-center text-sm font-medium text-brand-700 transition hover:text-brand-500">
                Lees artikel
                <span className="ml-2">→</span>
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
