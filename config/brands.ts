export interface BrandConfig {
  id: string;
  slug: string; // path fallback (dev)
  domain: string; // production domain
  name: string;
  logo?: string;
  colors: { primary: string; accent: string };
  navigation: Array<{ label: string; href: string }>;
  features?: { newsletter?: boolean };
}

// Deprecated: Static brand registry now replaced by DB-backed brand resolution in lib/brand.ts
// Retained as a fallback for local tooling or legacy components.
export const brands: BrandConfig[] = [];

export function getBrandByHost(_host?: string): BrandConfig {
  // Fallback brand (used only if DB not yet seeded)
    return {
      id: 'iris-fallback',
      slug: 'iris-fallback',
      domain: 'localhost',
      name: 'Iris Kooij Wellness',
      colors: { primary: '#6f865d', accent: '#D4A373' },
      navigation: [
        { label: 'Home', href: '/' },
        { label: 'Behandelingen', href: '/rituelen' },
        { label: 'Blog', href: '/blog' },
        { label: 'Over Ons', href: '/about' },
        { label: 'Professionals', href: '/academy' },
        { label: 'Shop', href: '/shop' },
        { label: 'Contact', href: '/contact' }
      ]
    };
}

export function getBrandById(_id: string) {
  return getBrandByHost();
}
