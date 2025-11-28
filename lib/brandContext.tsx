"use client";
import React from 'react';
import type { BrandLike, NavigationItem } from './brand';

const MAX_NAV_ITEMS = 12;
const defaultNav: NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Behandelingen', href: '/rituelen' },
  { label: 'Over Ons', href: '/about' },
  { label: 'Professionals', href: '/academy' },
  { label: 'Shop', href: '/shop' },
  { label: 'Contact', href: '/contact' }
];

interface BrandContextValue {
  name: string;
  navigation: NavigationItem[];
}

const BrandContext = React.createContext<BrandContextValue>({
  name: 'Iris Kooij Wellness',
  navigation: defaultNav
});

function sanitizeNavigation(navigation?: NavigationItem[] | null): NavigationItem[] {
  if (!Array.isArray(navigation) || navigation.length === 0) {
    return defaultNav;
  }
  return navigation
    .slice(0, MAX_NAV_ITEMS)
    .filter((link): link is NavigationItem => Boolean(link?.label && link?.href))
    .map((link) => ({ label: link.label, href: link.href }));
}

export function BrandProvider({ brand, children }: { brand?: BrandLike | null; children: React.ReactNode }) {
  const navigation = sanitizeNavigation(brand?.navigation);
  const value: BrandContextValue = {
    name: brand?.name || 'Iris Kooij Wellness',
    navigation
  };
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const ctx = React.useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
}
