import { prisma } from '../lib/prisma';
import { getBrandByDomain } from '../lib/brand';

describe('Brand domain resolution', () => {
  it('resolves brand by localhost domain', async () => {
    const brand = await getBrandByDomain('localhost');
    expect(brand).toBeTruthy();
    expect(brand?.slug).toEqual('iris-kooij');
  });
});