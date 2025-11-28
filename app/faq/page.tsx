export const metadata = { title: 'FAQ | Iris Kooij Wellness' };
import { PageRenderer } from '../components/PageRenderer';
import { loadPageForRequest } from '../../lib/pageLoader';

export default async function FaqPage() {
  const page = await loadPageForRequest('faq');
  const sections = page?.sections ?? [];
  const faqEntries = sections
    .filter((s) => s.type === 'FAQ')
    .flatMap((s) => (Array.isArray(s.data?.items) ? s.data.items : []))
    .filter((item): item is { question: string; answer: string } => Boolean(item?.question && item?.answer));

  if (page && page.published && sections.length > 0) {
    return (
      <>
        <PageRenderer sections={sections as any} />
        {faqEntries.length > 0 && (
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqEntries.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: { '@type': 'Answer', text: item.answer }
                }))
              })
            }}
          />
        )}
      </>
    );
  }

  return (
    <section className="pt-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Veelgestelde vragen</h1>
        <p className="subtle mt-6">De FAQ-pagina heeft nog geen secties. Voeg een FAQ-sectie toe via /admin.</p>
      </div>
    </section>
  );
}
