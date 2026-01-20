/**
 * Prisma Client instance for database operations
 * Replaces the old prisma-binding approach
 */
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prevent multiple instances in development (hot reload)
export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
