import { contrastRatio, isContrastAcceptable } from '../lib/contrast';

describe('Contrast utilities', () => {
  it('calculates ratio between two colors', () => {
    const ratio = contrastRatio('#000000','#ffffff');
    expect(ratio).toBeGreaterThan(20);
  });
  it('validates acceptable ratio', () => {
    expect(isContrastAcceptable('#000000','#ffffff')).toBe(true);
    expect(isContrastAcceptable('#777777','#888888')).toBe(false);
  });
});