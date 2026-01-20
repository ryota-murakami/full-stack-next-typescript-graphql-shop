import type { GraphQLContext, Permission } from '../types.js';
export declare const Mutation: {
    /**
     * Create a new item
     */
    createItem(_parent: unknown, args: {
        title: string;
        description: string;
        image?: string;
        largeImage?: string;
        price: number;
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
    }>;
    /**
     * Update an existing item
     */
    updateItem(_parent: unknown, args: {
        id: string;
        title?: string;
        description?: string;
        price?: number;
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
    }>;
    /**
     * Delete an item
     */
    deleteItem(_parent: unknown, args: {
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
    }>;
    /**
     * Sign up a new user
     */
    signup(_parent: unknown, args: {
        email: string;
        password: string;
        name: string;
    }, ctx: GraphQLContext): Promise<{
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
    }>;
    /**
     * Sign in an existing user
     */
    signin(_parent: unknown, args: {
        email: string;
        password: string;
    }, ctx: GraphQLContext): Promise<{
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
    }>;
    /**
     * Sign out the current user
     */
    signout(_parent: unknown, _args: unknown, ctx: GraphQLContext): {
        message: string;
    };
    /**
     * Request a password reset
     */
    requestReset(_parent: unknown, args: {
        email: string;
    }, ctx: GraphQLContext): Promise<{
        message: string;
    }>;
    /**
     * Reset password with token
     */
    resetPassword(_parent: unknown, args: {
        resetToken: string;
        password: string;
        confirmPassword: string;
    }, ctx: GraphQLContext): Promise<{
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
    }>;
    /**
     * Update user permissions (admin only)
     */
    updatePermissions(_parent: unknown, args: {
        userId: string;
        permissions: Permission[];
    }, ctx: GraphQLContext): Promise<{
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
    }>;
    /**
     * Add item to cart
     */
    addToCart(_parent: unknown, args: {
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
    }>;
    /**
     * Remove item from cart
     */
    removeFromCart(_parent: unknown, args: {
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
    }>;
    /**
     * Create an order from cart
     */
    createOrder(_parent: unknown, args: {
        token: string;
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
};
//# sourceMappingURL=Mutation.d.ts.map