export const metadata = { title: 'Shop | Iris Kooij Wellness' };
import { PageRenderer } from '../components/PageRenderer';
import { loadPageForRequest } from '../../lib/pageLoader';

export default async function ShopPage() {
  const page = await loadPageForRequest('shop');
  if (page && page.published && page.sections.length > 0) {
    return <PageRenderer sections={page.sections as any} />;
  }
  return (
    <section className="pt-12">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
        <p className="subtle mt-4">CMS-inhoud ontbreekt. Voeg secties toe aan de pagina <code>shop</code>.</p>
      </div>
    </section>
  );
}
