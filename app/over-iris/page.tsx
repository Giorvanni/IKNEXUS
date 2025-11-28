export const metadata = { title: 'Over Iris | Iris Kooij Wellness' };
import { PageRenderer } from '../components/PageRenderer';
import { loadPageForRequest } from '../../lib/pageLoader';

export default async function OverIrisPage() {
  const page = await loadPageForRequest('over-iris');
  if (page && page.published && page.sections.length > 0) {
    return <PageRenderer sections={page.sections as any} />;
  }
  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Over Iris</h1>
        <p className="subtle mt-6">Deze route verwacht CMS-content voor het slug <code>over-iris</code>. Maak of publiceer de pagina in /admin.</p>
      </div>
    </section>
  );
}
