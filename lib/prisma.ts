// lib/prisma.ts
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { withAccelerate } from "@prisma/extension-accelerate"

const connectionString = `${process.env.DATABASE_URL}`


const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString })
export const prisma =
  globalForPrisma.prisma ??

new PrismaClient({ adapter }) //.$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
