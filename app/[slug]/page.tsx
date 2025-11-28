import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '../../lib/pages';
import { PageRenderer } from '../components/PageRenderer';

export default async function GenericPage({ params, searchParams }: { params: { slug: string }; searchParams?: Record<string, string | string[]> }) {
  const h = headers();
  const brandId = h.get('x-brand-id') || undefined;
  const previewParam = searchParams && (searchParams.preview === '1' || (Array.isArray(searchParams.preview) && searchParams.preview.includes('1')));
  if (!brandId) return notFound();
  const page = await getPageBySlug(params.slug, brandId);
  if (!page) return notFound();
  if (!page.published && !previewParam) return notFound();
  return <PageRenderer sections={page.sections as any} />;
}
