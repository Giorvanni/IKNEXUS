import type { Brand as BrandModel, NavigationLink as NavigationLinkModel } from '@prisma/client';
import { prisma } from './prisma';
import { trackMetric } from './metrics';

export interface NavigationItem {
  label: string;
  href: string;
  order?: number | null;
}

interface CachedBrand {
  id: string;
  domain: string | null;
  slug: string;
  name: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  showInNav?: boolean;
  navOrder?: number;
  logoUrl?: string | null;
  navigation?: NavigationItem[];
}

type BrandWithNavigation = BrandModel & { navigationLinks: NavigationLinkModel[] };

const brandCache = new Map<string, CachedBrand>(); // key: domain
let lastLoad = 0;
let defaultBrand: CachedBrand | null = null;

function mapToCachedBrand(brand: BrandWithNavigation): CachedBrand {
  return {
    id: brand.id,
    domain: brand.domain,
    slug: brand.slug,
    name: brand.name,
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    showInNav: brand.showInNav,
    navOrder: brand.navOrder,
    logoUrl: brand.logoUrl,
    navigation: brand.navigationLinks
      .sort((a, b) => a.order - b.order)
      .map((link) => ({ label: link.label, href: link.href, order: link.order }))
  };
}

async function refreshCache(force = false) {
  const now = Date.now();
  if (!force && now - lastLoad < 60_000) return; // refresh every minute
  const brands = await prisma.brand.findMany({ include: { navigationLinks: true } });
  brandCache.clear();
  defaultBrand = null;
  for (const brand of brands) {
    const cached = mapToCachedBrand(brand as BrandWithNavigation);
    if (!defaultBrand) {
      defaultBrand = cached;
    }
    if (brand.domain) {
      brandCache.set(brand.domain.toLowerCase(), cached);
    }
  }
  lastLoad = now;
  trackMetric('brand.cache.refresh', brands.length);
}

async function getBrandByDomain(domain: string): Promise<CachedBrand | null> {
  await refreshCache();
  const key = domain.split(':')[0].toLowerCase();
  const found = brandCache.get(key);
  if (found) {
    trackMetric('brand.cache.hit', 1);
    return found;
  }
  trackMetric('brand.cache.miss', 1);
  if (defaultBrand) return defaultBrand;
  const fallback = await prisma.brand.findFirst({ include: { navigationLinks: true } });
  return fallback ? mapToCachedBrand(fallback as BrandWithNavigation) : null;
}

async function getBrandById(id: string): Promise<CachedBrand | null> {
  await refreshCache();
  for (const brand of brandCache.values()) {
    if (brand.id === id) return brand;
  }
  if (defaultBrand?.id === id) return defaultBrand;
  const direct = await prisma.brand.findUnique({ where: { id }, include: { navigationLinks: true } });
  return direct ? mapToCachedBrand(direct as BrandWithNavigation) : null;
}

export type BrandLike = {
  name?: string | null;
  navigation?: NavigationItem[] | null;
};

export { getBrandByDomain, getBrandById };

