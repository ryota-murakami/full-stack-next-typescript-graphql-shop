/**
 * GraphQL Server Entry Point
 * Using graphql-yoga 5.x with Prisma Client
 */
import 'dotenv/config';
import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import express from 'express';
import prisma from './db.js';
import { Query, Mutation } from './resolvers/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Read GraphQL schema from file
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');
// Create GraphQL schema
const schema = createSchema({
    typeDefs,
    resolvers: {
        Query,
        Mutation,
    },
});
// Create Express app for middleware
const app = express();
// Parse cookies
app.use(cookieParser());
// JWT middleware - decode user from token
app.use((req, _res, next) => {
    const { token } = req.cookies;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.APP_SECRET);
            req.userId = decoded.userId;
        }
        catch {
            // Invalid token, ignore
        }
    }
    next();
});
// Load user from database
app.use(async (req, _res, next) => {
    if (!req.userId)
        return next();
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
    });
    req.user = user;
    next();
});
// Create Yoga instance with custom context
const yoga = createYoga({
    schema,
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    graphiql: true,
});
// Custom handler to pass Express req/res to Yoga context
app.use('/graphql', (req, res) => {
    // Store req/res on request object for context access
    ;
    req.expressReq = req;
    req.expressRes = res;
    // Create a yoga handler with proper context
    const yogaHandler = createYoga({
        schema,
        context: () => ({
            prisma,
            request: req,
            response: res,
        }),
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        graphiql: true,
    });
    return yogaHandler(req, res);
});
// Create HTTP server
const server = createServer(app);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`
🚀 Server is running!
📭 GraphQL endpoint: http://localhost:${PORT}/graphql
🔧 GraphiQL: http://localhost:${PORT}/graphql
  `);
});
//# sourceMappingURL=index.js.map