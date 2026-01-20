import { hasPermission } from '../utils.js';
/**
 * Convert GraphQL where input to Prisma where
 */
function buildItemWhere(where) {
    if (!where)
        return undefined;
    const conditions = [];
    if (where.title_contains) {
        conditions.push({ title: { contains: where.title_contains, mode: 'insensitive' } });
    }
    if (where.description_contains) {
        conditions.push({ description: { contains: where.description_contains, mode: 'insensitive' } });
    }
    if (where.OR && where.OR.length > 0) {
        const orConditions = where.OR.map((orWhere) => buildItemWhere(orWhere)).filter((c) => c !== undefined);
        if (orConditions.length > 0) {
            return { OR: orConditions };
        }
    }
    if (conditions.length === 0)
        return undefined;
    if (conditions.length === 1)
        return conditions[0];
    return { AND: conditions };
}
/**
 * Convert GraphQL orderBy to Prisma orderBy
 */
function buildItemOrderBy(orderBy) {
    if (!orderBy)
        return { createdAt: 'desc' };
    const [field, direction] = orderBy.split('_');
    const dir = direction.toLowerCase();
    switch (field) {
        case 'id':
            return { id: dir };
        case 'title':
            return { title: dir };
        case 'price':
            return { price: dir };
        case 'createdAt':
            return { createdAt: dir };
        default:
            return { createdAt: 'desc' };
    }
}
export const Query = {
    /**
     * Get paginated list of items
     */
    async items(_parent, args, ctx) {
        const where = buildItemWhere(args.where);
        const orderBy = buildItemOrderBy(args.orderBy);
        return ctx.prisma.item.findMany({
            where,
            orderBy,
            skip: args.skip || 0,
            take: args.first || 10,
            include: {
                user: true,
            },
        });
    },
    /**
     * Get single item by ID
     */
    async item(_parent, args, ctx) {
        return ctx.prisma.item.findUnique({
            where: { id: args.id },
            include: {
                user: true,
            },
        });
    },
    /**
     * Get items connection for pagination info
     */
    async itemsConnection(_parent, args, ctx) {
        const where = buildItemWhere(args.where);
        const count = await ctx.prisma.item.count({ where });
        return {
            aggregate: { count },
        };
    },
    /**
     * Get current logged-in user
     */
    async me(_parent, _args, ctx) {
        if (!ctx.request.userId) {
            return null;
        }
        return ctx.prisma.user.findUnique({
            where: { id: ctx.request.userId },
            include: {
                cart: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    },
    /**
     * Get all users (admin only)
     */
    async users(_parent, _args, ctx) {
        if (!ctx.request.userId) {
            throw new Error('You must be logged in!');
        }
        hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
        return ctx.prisma.user.findMany({
            include: {
                cart: {
                    include: {
                        item: true,
                    },
                },
            },
        });
    },
    /**
     * Get single order by ID
     */
    async order(_parent, args, ctx) {
        if (!ctx.request.userId) {
            throw new Error('You must be logged in!');
        }
        const order = await ctx.prisma.order.findUnique({
            where: { id: args.id },
            include: {
                items: true,
                user: true,
            },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        const ownsOrder = order.userId === ctx.request.userId;
        const isAdmin = ctx.request.user?.permissions.includes('ADMIN');
        if (!ownsOrder && !isAdmin) {
            throw new Error('You cannot see this order');
        }
        return order;
    },
    /**
     * Get all orders for current user
     */
    async orders(_parent, _args, ctx) {
        if (!ctx.request.userId) {
            throw new Error('You must be signed in!');
        }
        return ctx.prisma.order.findMany({
            where: { userId: ctx.request.userId },
            include: {
                items: true,
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    },
};
//# sourceMappingURL=Query.js.map