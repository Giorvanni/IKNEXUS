import { Metadata } from 'next';

export function orgMetadata(): Metadata {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    title: 'Iris Kooij Wellness | Rituelen voor lichaam, huid en geest',
    description: 'High‑end fascia‑rituelen en natuurlijke huidverzorging in een serene setting. Vertraag, laat los en kom thuis in jezelf.',
    openGraph: {
      title: 'Iris Kooij Wellness',
      description: 'Fascia‑rituelen en natuurlijke huidverzorging voor diepe ontspanning en herstel.',
      type: 'website',
      url: base,
      siteName: 'Iris Kooij Wellness',
      locale: 'nl_NL'
    },
    robots: { index: true, follow: true },
    metadataBase: new URL(base)
  };
}

export function ritualMetadata(name: string, description: string): Metadata {
  return {
    title: `${name} | Iris Kooij Wellness`,
    description,
    openGraph: { title: name, description }
  };
}

// JSON-LD generators
export function jsonLdForOrg() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Iris Kooij Wellness',
    url: base,
    description: 'High‑end fascia‑rituelen en natuurlijke huidverzorging in een serene setting.',
    foundingDate: '2025',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Crommelinbaan 29K',
      postalCode: '2142 EX',
      addressLocality: 'Cruquius',
      addressCountry: 'NL'
    }
  };
}

export function jsonLdForRitual(name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: 'Iris Kooij Wellness'
    }
  };
}

export function jsonLdForServiceOffer(opts: {
  name: string;
  description: string;
  durationMinutes?: number | null;
  priceCents?: number | null;
  currency?: string | null;
  bookingLink?: string | null;
  image?: string | null;
}) {
  const price = typeof opts.priceCents === 'number' ? (opts.priceCents / 100).toFixed(2) : undefined;
  const hasOffer = price && opts.currency;
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    provider: { '@type': 'LocalBusiness', name: 'Iris Kooij Wellness' },
  };
  if (opts.durationMinutes) {
    // ISO 8601 duration in minutes
    data['duration'] = `PT${Math.max(1, Math.floor(opts.durationMinutes))}M`;
  }
  if (hasOffer) {
    data['offers'] = {
      '@type': 'Offer',
      priceCurrency: (opts.currency || 'EUR').toUpperCase(),
      price,
      url: opts.bookingLink || undefined,
      availability: 'https://schema.org/InStock'
    };
  }
  if (opts.image) {
    data['image'] = opts.image;
  }
  return data;
}
