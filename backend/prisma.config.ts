/**
 * Prisma Configuration for Prisma ORM v7+
 * @description Database URL configuration moved from schema.prisma to this file
 */
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
})
