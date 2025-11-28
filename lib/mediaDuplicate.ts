import { computePerceptualHash, hammingDistance } from './hash';
import { PrismaClient } from '@prisma/client';

export async function findDuplicate(buffer: Buffer, prisma: PrismaClient, threshold = 10) {
  const pHash = await computePerceptualHash(buffer);
  const existing = await prisma.mediaAsset.findMany({ where: { pHash: { not: null } } });
  for (const asset of existing) {
    if (!asset.pHash) continue;
    if (asset.pHash === pHash) {
      return { duplicate: true, asset, pHash };
    }
    if (hammingDistance(asset.pHash, pHash) <= threshold) {
      return { duplicate: true, asset, pHash };
    }
  }
  return { duplicate: false, pHash };
}