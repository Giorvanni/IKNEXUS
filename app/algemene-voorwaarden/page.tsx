export const metadata = { title: 'Algemene voorwaarden | Iris Kooij Wellness' };
import { PageRenderer } from '../components/PageRenderer';
import { loadPageForRequest } from '../../lib/pageLoader';

export default async function TermsPage() {
  const page = await loadPageForRequest('algemene-voorwaarden');
  if (page && page.published && page.sections.length > 0) {
    return <PageRenderer sections={page.sections as any} />;
  }
  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Algemene voorwaarden</h1>
        <p className="subtle mt-4 text-sm">Zorg dat de CMS-pagina voor dit juridische document is ingevuld om de inhoud hier te tonen.</p>
      </div>
    </section>
  );
}
