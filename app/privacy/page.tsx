export const metadata = { title: 'Privacy | Iris Kooij Wellness' };
import { PageRenderer } from '../components/PageRenderer';
import { loadPageForRequest } from '../../lib/pageLoader';

export default async function PrivacyPage() {
  const page = await loadPageForRequest('privacy');
  if (page && page.published && page.sections.length > 0) {
    return <PageRenderer sections={page.sections as any} />;
  }
  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Privacybeleid</h1>
        <p className="subtle mt-4 text-sm">De privacy-tekst is nog niet beschikbaar. Vul de CMS-pagina <code>privacy</code> in om dit te publiceren.</p>
      </div>
    </section>
  );
}
