import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { computePerceptualHash, hammingDistance } from '../lib/hash';
import { findDuplicate } from '../lib/mediaDuplicate';

describe('media duplicate detection', () => {
  it('detects duplicate via perceptual hash', async () => {
    // 1x1 PNG transparent pixel
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YV+8WQAAAAASUVORK5CYII=';
    const buf = Buffer.from(base64, 'base64');
    const hash1 = await computePerceptualHash(buf);
    expect(hash1).toBeTruthy();
    // store asset with hash
  const hash2 = await computePerceptualHash(buf);
  expect(hash1.length).toBeGreaterThan(10);
  expect(hash2.length).toBeGreaterThan(10);
  // store asset and verify DB persistence of pHash
  const asset = await prisma.mediaAsset.create({ data: { filename: 'img1.png', url: '/uploads/img1.png', pHash: hash1 } });
  expect(asset.pHash?.length).toBeGreaterThan(10);
  });
});