import { rituals } from '../data/rituals';

describe('rituals data', () => {
  it('each ritueel has required fields and brandId', () => {
    for (const ritual of rituals) {
      expect(typeof ritual.id).toBe('number');
      expect(typeof ritual.brandId).toBe('string');
      expect(ritual.name).toBeTruthy();
      expect(ritual.slug).toBeTruthy();
      expect(ritual.shortDescription).toBeTruthy();
      expect(ritual.longDescription).toBeTruthy();
      expect(Array.isArray(ritual.valueProps)).toBe(true);
      expect(ritual.valueProps.length).toBeGreaterThan(0);
      expect(ritual.ctaLabel).toBeTruthy();
    }
  });
});

