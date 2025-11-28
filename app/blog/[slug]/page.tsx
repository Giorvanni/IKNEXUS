import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '../../../lib/blog';
import { ResponsiveImage } from '../../components/ResponsiveImage';

function formatDate(value: string | null): string {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
  } catch {
    return '';
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const brandId = headers().get('x-brand-id');
  const post = await getBlogPostBySlug(params.slug, brandId);
  if (!post) return notFound();
  const { content } = post;
  const publishedLabel = formatDate(post.publishedAt ?? post.createdAt);
  return (
    <article className="container py-16 lg:py-24">
      <div className="max-w-3xl">
        {content.kicker && <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{content.kicker}</p>}
        <h1 className="mt-4 text-4xl font-serif font-semibold tracking-tight text-slate-900 dark:text-slate-50">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{post.excerpt}</p>}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
          {post.authorName && <span>{post.authorName}</span>}
          {publishedLabel && <span>{publishedLabel}</span>}
          <span>{post.readingMinutes} min leestijd</span>
        </div>
      </div>
      {post.coverImageUrl && (
        <div className="mt-10">
          <ResponsiveImage
            src={post.coverImageUrl}
            alt={post.coverImageAlt || post.title}
            aspectRatio={16 / 9}
            placeholderText="Studio visual"
          />
        </div>
      )}
      {content.intro && <p className="mt-10 max-w-2xl text-lg text-slate-700 dark:text-slate-200">{content.intro}</p>}
      <div className="mt-12 grid gap-12 max-w-3xl">
        {content.sections.map((section, idx) => (
          <section key={`${section.heading}-${idx}`}>
            {section.kicker && <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{section.kicker}</p>}
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">{section.heading}</h2>
            <p className={`mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-200 ${section.emphasis ? 'font-medium' : ''}`}>
              {section.body}
            </p>
          </section>
        ))}
      </div>
      {content.highlight && (
        <blockquote className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-lg italic text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
          &ldquo;{content.highlight.text}&rdquo;
          {content.highlight.attribution && <cite className="mt-3 block text-sm not-italic text-slate-500">— {content.highlight.attribution}</cite>}
        </blockquote>
      )}
      {content.outro && <p className="mt-10 max-w-2xl text-base text-slate-700 dark:text-slate-200">{content.outro}</p>}
      {content.resources && content.resources.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-4">
          {content.resources.map((resource, idx) => (
            <a key={`${resource.label}-${idx}`} href={resource.href} className="btn-secondary text-sm">
              {resource.label}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
