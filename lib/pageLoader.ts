"use server";
import { headers } from 'next/headers';
import { getPageBySlug } from './pages';

export async function loadPageForRequest(slug: string) {
  const h = headers();
  const brandId = h.get('x-brand-id') || undefined;
  if (!brandId) return null;
  return getPageBySlug(slug, brandId);
}
