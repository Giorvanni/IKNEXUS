export const metadata = { title: 'Team | Iris Kooij Wellness' };
import { PageRenderer } from '../components/PageRenderer';
import { loadPageForRequest } from '../../lib/pageLoader';

export default async function TeamPage() {
  const page = await loadPageForRequest('team');
  if (page && page.published && page.sections.length > 0) {
    return <PageRenderer sections={page.sections as any} />;
  }
  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
        <p className="subtle mt-6">Maak of publiceer de CMS-pagina voor het team om deze teksten te beheren.</p>
      </div>
    </section>
  );
}
