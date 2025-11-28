export { generateMetadata } from '../../rituelen/[slug]/page';

import { redirect } from 'next/navigation';

export default function LegacyRitualRedirect({ params }: { params: { slug: string } }) {
  redirect(`/rituelen/${params.slug}`);
}
