/**
 * Type definitions for GraphQL context and resolvers
 */
import type { PrismaClient, User, Permission } from '@prisma/client';
import type { Request, Response } from 'express';
export interface GraphQLContext {
    prisma: PrismaClient;
    request: Request & {
        userId?: string;
        user?: User | null;
    };
    response: Response;
}
export interface ItemWhereInput {
    title_contains?: string;
    description_contains?: string;
    OR?: ItemWhereInput[];
}
export type ItemOrderByInput = 'id_ASC' | 'id_DESC' | 'title_ASC' | 'title_DESC' | 'price_ASC' | 'price_DESC' | 'createdAt_ASC' | 'createdAt_DESC';
export type { Permission };
//# sourceMappingURL=types.d.ts.map