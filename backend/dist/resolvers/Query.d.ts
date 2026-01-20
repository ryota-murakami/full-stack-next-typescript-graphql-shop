/**
 * Query Resolvers
 * Migrated from prisma-binding to Prisma Client
 */
import type { GraphQLContext, ItemWhereInput, ItemOrderByInput } from '../types.js';
export declare const Query: {
    /**
     * Get paginated list of items
     */
    items(_parent: unknown, args: {
        where?: ItemWhereInput;
        orderBy?: ItemOrderByInput;
        skip?: number;
        first?: number;
    }, ctx: GraphQLContext): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
            password: string;
            resetToken: string | null;
            resetTokenExpiry: number | null;
            permissions: import("@prisma/client").$Enums.Permission[];
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string;
        image: string | null;
        largeImage: string | null;
        price: number;
    })[]>;
    /**
     * Get single item by ID
     */
    item(_parent: unknown, args: {
        id: string;
    }, ctx: GraphQLContext): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
            password: string;
            resetToken: string | null;
            resetTokenExpiry: number | null;
            permissions: import("@prisma/client").$Enums.Permission[];
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string;
        image: string | null;
        largeImage: string | null;
        price: number;
    }) | null>;
    /**
     * Get items connection for pagination info
     */
    itemsConnection(_parent: unknown, args: {
        where?: ItemWhereInput;
    }, ctx: GraphQLContext): Promise<{
        aggregate: {
            count: number;
        };
    }>;
    /**
     * Get current logged-in user
     */
    me(_parent: unknown, _args: unknown, ctx: GraphQLContext): Promise<({
        cart: ({
            item: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                title: string;
                description: string;
                image: string | null;
                largeImage: string | null;
                price: number;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            itemId: string | null;
            userId: string;
        })[];
    } & {
        name: string;
        id: string;
        email: string;
        password: string;
        resetToken: string | null;
        resetTokenExpiry: number | null;
        permissions: import("@prisma/client").$Enums.Permission[];
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    /**
     * Get all users (admin only)
     */
    users(_parent: unknown, _args: unknown, ctx: GraphQLContext): Promise<({
        cart: ({
            item: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                title: string;
                description: string;
                image: string | null;
                largeImage: string | null;
                price: number;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            itemId: string | null;
            userId: string;
        })[];
    } & {
        name: string;
        id: string;
        email: string;
        password: string;
        resetToken: string | null;
        resetTokenExpiry: number | null;
        permissions: import("@prisma/client").$Enums.Permission[];
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    /**
     * Get single order by ID
     */
    order(_parent: unknown, args: {
        id: string;
    }, ctx: GraphQLContext): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
            password: string;
            resetToken: string | null;
            resetTokenExpiry: number | null;
            permissions: import("@prisma/client").$Enums.Permission[];
            createdAt: Date;
            updatedAt: Date;
        };
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            userId: string | null;
            title: string;
            description: string;
            image: string;
            largeImage: string;
            price: number;
            orderId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        charge: string;
    }>;
    /**
     * Get all orders for current user
     */
    orders(_parent: unknown, _args: unknown, ctx: GraphQLContext): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
            password: string;
            resetToken: string | null;
            resetTokenExpiry: number | null;
            permissions: import("@prisma/client").$Enums.Permission[];
            createdAt: Date;
            updatedAt: Date;
        };
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            userId: string | null;
            title: string;
            description: string;
            image: string;
            largeImage: string;
            price: number;
            orderId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        charge: string;
    })[]>;
};
//# sourceMappingURL=Query.d.ts.map