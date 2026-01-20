/**
 * GraphQL Server Entry Point
 * Using graphql-yoga 5.x with Prisma Client
 */
import 'dotenv/config'
import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { createSchema } from 'graphql-yoga'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'

import prisma from './db.js'
import { Query, Mutation } from './resolvers/index.js'
import type { GraphQLContext } from './types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read GraphQL schema from file
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8')

// Create GraphQL schema
const schema = createSchema({
  typeDefs,
  resolvers: {
    Query,
    Mutation,
  },
})

// Create Express app for middleware
const app = express()

// Parse cookies
app.use(cookieParser())

// JWT middleware - decode user from token
app.use((req: Request, _res: Response, next: NextFunction) => {
  const { token } = req.cookies as { token?: string }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.APP_SECRET!) as {
        userId: string
      }
      ;(req as any).userId = decoded.userId
    } catch {
      // Invalid token, ignore
    }
  }
  next()
})

// Load user from database
app.use(async (req: Request, _res: Response, next: NextFunction) => {
  if (!(req as any).userId) return next()

  const user = await prisma.user.findUnique({
    where: { id: (req as any).userId },
  })
  ;(req as any).user = user
  next()
})

// Create Yoga instance with custom context
const yoga = createYoga({
  schema,
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  graphiql: true,
})

// Custom handler to pass Express req/res to Yoga context
app.use('/graphql', (req: Request, res: Response) => {
  // Store req/res on request object for context access
  ;(req as any).expressReq = req
  ;(req as any).expressRes = res

  // Create a yoga handler with proper context
  const yogaHandler = createYoga({
    schema,
    context: (): GraphQLContext => ({
      prisma,
      request: req as any,
      response: res,
    }),
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    graphiql: true,
  })

  return yogaHandler(req, res)
})

// Create HTTP server
const server = createServer(app)

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`
🚀 Server is running!
📭 GraphQL endpoint: http://localhost:${PORT}/graphql
🔧 GraphiQL: http://localhost:${PORT}/graphql
  `)
})
