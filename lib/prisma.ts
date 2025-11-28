import { PrismaClient } from '@prisma/client';
import './shutdown';

// Prevent multiple instances in dev (Next.js hot reload)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export default prisma;
