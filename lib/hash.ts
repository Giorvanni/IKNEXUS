import sharp from 'sharp';

// Deterministic DCT-based pHash implementation
// Steps: resize to 32x32 grayscale, compute 2D DCT, take top-left 8x8 block (excluding DC),
// threshold by median, output 64-bit hash as hex (16 hex chars) repeated to 64 bytes for compatibility.
export async function computePerceptualHash(buffer: Buffer): Promise<string> {
  const img = sharp(buffer, { failOn: 'none' })
    .removeAlpha()
    .toColorspace('b-w')
    .resize(32, 32, { fit: 'fill', kernel: sharp.kernel.cubic, withoutEnlargement: false });
  const raw = await img.raw().toBuffer(); // 32*32, 1 channel
  const N = 32;
  const f: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  // Copy into matrix row-major
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      f[y][x] = raw[y * N + x];
    }
  }
  // Precompute cos terms
  const cosTable: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let k = 0; k < N; k++) {
    for (let n = 0; n < N; n++) {
      cosTable[k][n] = Math.cos(((2 * n + 1) * k * Math.PI) / (2 * N));
    }
  }
  // 2D DCT (separable)
  function dct1D(vector: number[]): number[] {
    const out = new Array(N).fill(0);
    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) sum += vector[n] * cosTable[k][n];
      const ck = k === 0 ? Math.SQRT1_2 : 1; // normalization factor sqrt(1/2) for k=0
      out[k] = sum * ck;
    }
    return out;
  }
  // DCT rows
  const dctRows = f.map(row => dct1D(row));
  // Transpose
  const t: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) t[x][y] = dctRows[y][x];
  // DCT columns
  const dctCols = t.map(col => dct1D(col));
  // Transpose back
  const F: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) F[y][x] = dctCols[x][y];
  // Take 8x8 block excluding DC (0,0)
  const block: number[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (x === 0 && y === 0) continue;
      block.push(F[y][x]);
    }
  }
  // Median threshold
  const sorted = [...block].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  let bits = '';
  for (const v of block) bits += v > median ? '1' : '0';
  // Convert to hex string (pack bits into nibbles)
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    const nibble = bits.slice(i, i + 4);
    hex += parseInt(nibble.padEnd(4, '0'), 2).toString(16);
  }
  return hex;
}

// Hamming distance between two hex pHash values
export function hammingDistance(hexA: string, hexB: string): number {
  if (hexA.length !== hexB.length) return Infinity;
  let distance = 0;
  for (let i = 0; i < hexA.length; i++) {
    const aNib = parseInt(hexA[i], 16);
    const bNib = parseInt(hexB[i], 16);
    const xor = aNib ^ bNib;
    // count bits in xor (0-15)
    distance += ((xor & 1) + ((xor >> 1) & 1) + ((xor >> 2) & 1) + ((xor >> 3) & 1));
  }
  return distance;
}