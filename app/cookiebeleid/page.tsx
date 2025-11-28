export const metadata = { title: 'Cookiebeleid | Iris Kooij Wellness' };
import { PageRenderer } from '../components/PageRenderer';
import { loadPageForRequest } from '../../lib/pageLoader';

export default async function CookiesPage() {
  const page = await loadPageForRequest('cookiebeleid');
  if (page && page.published && page.sections.length > 0) {
    return <PageRenderer sections={page.sections as any} />;
  }
  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Cookiebeleid</h1>
        <p className="subtle mt-4 text-sm">Nog geen CMS-inhoud. Voeg secties toe aan de cookiebeleidpagina in het admin-portaal.</p>
      </div>
    </section>
  );
}
