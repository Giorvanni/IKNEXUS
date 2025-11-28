import { prisma } from './prisma';
import type { BlogPost } from '@prisma/client';
import { normalizeBrandId } from './brandHeaders';
import template from '../data/blogTemplate.json';
import { BlogContentSchema, type BlogContent } from './validation';

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  published: boolean;
  publishedAt: string | null;
  readingMinutes: number;
  authorName?: string | null;
  brandId: string;
  createdAt: string;
}

export interface BlogPostUI extends BlogPostSummary {
  content: BlogContent;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

const BASE_TEMPLATE: BlogContent = template as BlogContent;

function cloneTemplate(): BlogContent {
  return JSON.parse(JSON.stringify(BASE_TEMPLATE));
}

export function buildDefaultBlogContent(title?: string): BlogContent {
  const clone = cloneTemplate();
  if (title && Array.isArray(clone.sections) && clone.sections.length > 0) {
    const [first, ...rest] = clone.sections;
    clone.sections = [
      {
        ...first,
        heading: `${title}: ${first.heading}`.trim()
      },
      ...rest
    ];
  }
  return clone;
}

function parseContent(raw: unknown, title?: string): BlogContent {
  const parsed = BlogContentSchema.safeParse(raw);
  return parsed.success ? parsed.data : buildDefaultBlogContent(title);
}

export function computeReadingMinutes(content: BlogContent): number {
  const textParts: string[] = [];
  if (content.intro) textParts.push(content.intro);
  if (content.outro) textParts.push(content.outro);
  if (content.highlight?.text) textParts.push(content.highlight.text);
  if (Array.isArray(content.sections)) {
    for (const section of content.sections) {
      textParts.push(section.heading);
      textParts.push(section.body);
    }
  }
  const totalWords = textParts
    .join(' ')
    .split(/\s+/)
    .filter(Boolean)
    .length;
  const minutes = Math.ceil(totalWords / 180);
  return Math.max(2, minutes || 2);
}

export function serializeBlogPost(row: BlogPost): BlogPostUI {
  const content = parseContent(row.content, row.title);
  const readingMinutes = row.readingMinutes ?? computeReadingMinutes(content);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    coverImageAlt: row.coverImageAlt,
    published: row.published,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    authorName: row.authorName,
    readingMinutes,
    brandId: row.brandId,
    createdAt: row.createdAt.toISOString(),
    content,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription
  };
}

export async function getBlogPosts(brandId?: string | null, options?: { includeDrafts?: boolean; limit?: number }): Promise<BlogPostSummary[]> {
  const includeDrafts = options?.includeDrafts ?? false;
  const limit = options?.limit;
  const where: Record<string, unknown> = {};
  const scopedBrandId = normalizeBrandId(brandId);
  if (scopedBrandId) {
    where.brandId = scopedBrandId;
  }
  if (!includeDrafts) {
    where.published = true;
  }
  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: [
      { published: 'desc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit || undefined
  });
  return posts.map(serializeBlogPost);
}

export async function getBlogPostBySlug(slug: string, brandId?: string | null, options?: { includeDrafts?: boolean }): Promise<BlogPostUI | null> {
  const where: any = { slug };
  const scopedBrandId = normalizeBrandId(brandId);
  if (scopedBrandId) where.brandId = scopedBrandId;
  const post = await prisma.blogPost.findFirst({ where });
  if (!post) return null;
  if (!options?.includeDrafts && !post.published) return null;
  return serializeBlogPost(post);
}

export const DEFAULT_BLOG_TEMPLATE: BlogContent = cloneTemplate();
