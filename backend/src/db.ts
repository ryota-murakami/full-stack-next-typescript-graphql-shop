/**
 * Prisma Client instance for database operations
 * @description Prisma 7+ requires driver adapters for database connections
 */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * Creates a new PrismaClient instance with PostgreSQL adapter
 * @returns PrismaClient instance configured with DATABASE_URL
 */
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to create the Prisma client.')
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  })
  return new PrismaClient({ adapter })
}

// Prevent multiple instances in development (hot reload)
export const prisma = global.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
