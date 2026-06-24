import bcrypt from 'bcryptjs'
import type { Permission } from '@prisma/client'
import prisma from '../src/db.js'

const SEED_PASSWORD = 'password123'
const ADMIN_EMAIL = 'admin@fullstack.shop'
const USER_EMAIL = 'user@fullstack.shop'
const ADMIN_PERMISSIONS: Permission[] = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
]

const demoItems = [
  {
    id: 'seed-vintage-camera',
    title: 'Vintage Camera',
    description: 'A reliable film camera for product photography demos.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
    largeImage:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200',
    price: 12900,
  },
  {
    id: 'seed-leather-bag',
    title: 'Leather Market Bag',
    description: 'A sturdy everyday bag for checkout and cart testing.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    largeImage:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
    price: 8900,
  },
  {
    id: 'seed-desk-lamp',
    title: 'Desk Lamp',
    description: 'Warm desk lighting for search, item detail, and order demos.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    largeImage:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200',
    price: 4200,
  },
]

/**
 * Seeds local demo users and products so a fresh database can exercise every page.
 * @param passwordHash - The bcrypt hash shared by local demo accounts.
 * @returns The seeded admin user used as owner for demo catalog items.
 * @example
 * const admin = await seedUsers('$2a$10...')
 */
async function seedUsers(passwordHash: string) {
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: passwordHash,
      permissions: ADMIN_PERMISSIONS,
    },
    create: {
      email: ADMIN_EMAIL,
      name: 'Local Admin',
      password: passwordHash,
      permissions: ADMIN_PERMISSIONS,
    },
  })

  await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {
      password: passwordHash,
      permissions: ['USER'],
    },
    create: {
      email: USER_EMAIL,
      name: 'Local User',
      password: passwordHash,
      permissions: ['USER'],
    },
  })

  return admin
}

/**
 * Seeds deterministic demo catalog records owned by the local admin account.
 * @param adminUserId - The seeded admin ID that owns demo items.
 * @returns The number of demo items reconciled.
 * @example
 * const count = await seedItems('user_id')
 */
async function seedItems(adminUserId: string): Promise<number> {
  for (const item of demoItems) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {
        ...item,
        userId: adminUserId,
      },
      create: {
        ...item,
        userId: adminUserId,
      },
    })
  }

  return demoItems.length
}

/**
 * Runs the local database seed from pnpm db:seed and reports demo credentials.
 * @returns Nothing; exits with a non-zero status when seeding fails.
 * @example
 * await main()
 */
async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)
  const admin = await seedUsers(passwordHash)
  const itemCount = await seedItems(admin.id)

  console.log(`Seeded ${itemCount} items.`)
  console.log(`Admin: ${ADMIN_EMAIL} / ${SEED_PASSWORD}`)
  console.log(`User: ${USER_EMAIL} / ${SEED_PASSWORD}`)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
