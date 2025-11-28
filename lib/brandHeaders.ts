export function normalizeBrandId(brandId?: string | null) {
  if (!brandId) return null;
  return brandId === 'iris-fallback' ? null : brandId;
}
