import { prisma } from './prisma';
import type { PageSection, MediaAsset } from '@prisma/client';

export type PageSectionType =
  | 'HERO'
  | 'TEXT'
  | 'FEATURES'
  | 'CTA'
  | 'NEWSLETTER'
  | 'IMAGE'
  | 'FAQ'
  | 'RITUALS'
  | 'VENTURES'
  | 'CONTACT_INFO'
  | 'TESTIMONIALS'
  | 'TIMELINE';

export interface MediaAssetVariantUI {
  width: number;
  height: number;
  format: string;
  url: string;
}

export interface MediaAssetUI {
  id: string;
  url: string;
  mimeType?: string | null;
  altText?: string | null;
  variants: MediaAssetVariantUI[];
}

type MediaAssetWithVariants = MediaAsset & { variants: { width: number; height: number; format: string; url: string }[] };

export interface PageSectionUI {
  id: string;
  order: number;
  type: PageSectionType;
  data: any;
  mediaAsset?: MediaAssetUI;
}

export interface PageUI {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  published: boolean;
  brandId: string;
  sections: PageSectionUI[];
}

export async function getPageBySlug(slug: string, brandId?: string): Promise<PageUI | null> {
  const where: Record<string, unknown> = { slug };
  if (brandId) where.brandId = brandId;
  const page = await prisma.page.findFirst({
    where,
    include: { sections: { orderBy: { order: 'asc' } } }
  });
  if (!page) return null;
  const sections = await hydrateSections(page.sections);
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    description: page.description,
    published: page.published,
    brandId: page.brandId,
    sections
  };
}

export async function listPages(brandId: string): Promise<Pick<PageUI,'id'|'slug'|'title'|'published'>[]> {
  const rows = await prisma.page.findMany({ where: { brandId }, orderBy: { createdAt: 'asc' }, select: { id: true, slug: true, title: true, published: true } });
  return rows.map(r => ({ id: r.id, slug: r.slug, title: r.title, published: r.published }));
}

function pickAssetId(data: any): string | null {
  if (!data || typeof data !== 'object') return null;
  if (typeof (data as any).mediaAssetId === 'string') return (data as any).mediaAssetId;
  if (typeof (data as any).assetId === 'string') return (data as any).assetId;
  if (typeof (data as any).media?.assetId === 'string') return (data as any).media.assetId;
  if (typeof (data as any).asset?.assetId === 'string') return (data as any).asset.assetId;
  return null;
}

async function hydrateSections(sections: PageSection[]): Promise<PageSectionUI[]> {
  const assetIds = Array.from(
    new Set(
      sections
        .map((section) => pickAssetId(section.data))
        .filter((id): id is string => Boolean(id))
    )
  );
  const assets: MediaAssetWithVariants[] = assetIds.length
    ? await prisma.mediaAsset.findMany({
        where: { id: { in: assetIds } },
        include: { variants: { orderBy: { width: 'asc' } } }
      })
    : [];
  const assetMap = Object.fromEntries(assets.map((asset) => [asset.id, asset]));

  return sections.map((section) => {
    const assetId = pickAssetId(section.data);
    const asset = assetId ? assetMap[assetId] : undefined;
    return {
      id: section.id,
      order: section.order,
      type: section.type as PageSectionType,
      data: section.data,
      mediaAsset: asset ? serializeAsset(asset) : undefined
    };
  });
}

function serializeAsset(asset: MediaAssetWithVariants): MediaAssetUI {
  const variants = Array.isArray(asset.variants)
    ? asset.variants
        .filter((variant) => typeof variant?.width === 'number' && typeof variant?.url === 'string')
        .map((variant) => ({
          width: variant.width,
          height: variant.height,
          format: variant.format,
          url: variant.url
        }))
    : [];
  return {
    id: asset.id,
    url: asset.url,
    mimeType: asset.mimeType,
    altText: asset.altText,
    variants
  };
}
