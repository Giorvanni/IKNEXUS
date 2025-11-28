import { PageRenderer } from '../components/PageRenderer';
import { loadPageForRequest } from '../../lib/pageLoader';

export const metadata = { title: 'Rituelen | Iris Kooij Wellness' };

const FALLBACK_RITUAL_SECTION = [
  {
    id: 'fallback-rituals',
    order: 0,
    type: 'RITUALS',
    data: {
      title: 'Onze Rituelen',
      limit: 6
    }
  }
];

export default async function RituelenPage() {
  const page = await loadPageForRequest('rituelen');
  const hasSections = Boolean(page && page.published && page.sections?.length);
  const sections = hasSections ? page!.sections : FALLBACK_RITUAL_SECTION;
  return <PageRenderer sections={sections as any} />;
}
