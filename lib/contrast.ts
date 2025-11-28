// WCAG contrast ratio calculation between two hex colors
function hexToRgb(hex: string) {
  const clean = hex.replace('#','');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r,g,b];
}

function relChannel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function contrastRatio(hexA: string, hexB: string) {
  const [r1,g1,b1] = hexToRgb(hexA);
  const [r2,g2,b2] = hexToRgb(hexB);
  const l1 = 0.2126 * relChannel(r1) + 0.7152 * relChannel(g1) + 0.0722 * relChannel(b1);
  const l2 = 0.2126 * relChannel(r2) + 0.7152 * relChannel(g2) + 0.0722 * relChannel(b2);
  const lighter = Math.max(l1,l2) + 0.05;
  const darker = Math.min(l1,l2) + 0.05;
  return +(lighter / darker).toFixed(2);
}

export function isContrastAcceptable(a: string, b: string, ratio = 4.5) {
  return contrastRatio(a,b) >= ratio;
}