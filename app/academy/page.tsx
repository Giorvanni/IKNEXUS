export const metadata = { title: 'Academy | Iris Kooij Wellness' };
import { PageRenderer } from '../components/PageRenderer';
import { loadPageForRequest } from '../../lib/pageLoader';

export default async function AcademyPage() {
  const page = await loadPageForRequest('academy');
  if (page && page.published && page.sections.length > 0) {
    return <PageRenderer sections={page.sections as any} />;
  }
  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Academy</h1>
        <p className="subtle mt-6">Voeg secties toe via het CMS om de Academy-inhoud te beheren.</p>
      </div>
    </section>
  );
}
