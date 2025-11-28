import { RitualSchema } from '../lib/validation';

describe('RitualSchema validation', () => {
  it('rejects invalid slug characters', () => {
    const result = RitualSchema.safeParse({
      name: 'Test',
      slug: 'Invalid Slug',
      brandId: 'b1',
      shortDescription: 'short description here',
      longDescription: 'Long description content that is sufficiently long',
      valueProps: ['One']
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid ritueel input', () => {
    const result = RitualSchema.safeParse({
      name: 'Valid',
      slug: 'valid-slug',
      brandId: 'b1',
      shortDescription: 'short description here',
      longDescription: 'Long description content that is sufficiently long',
      valueProps: ['One','Two']
    });
    expect(result.success).toBe(true);
  });
});