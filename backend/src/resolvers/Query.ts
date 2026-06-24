/**
 * Query Resolvers
 * Migrated from prisma-binding to Prisma Client
 */
import type { GraphQLContext, ItemWhereInput, ItemOrderByInput } from '../types.js'
import { hasPermission } from '../utils.js'
import { userFacingError } from '../errors.js'
import type { Prisma } from '@prisma/client'

/**
 * Convert GraphQL where input to Prisma where
 */
function buildItemWhere(where?: ItemWhereInput): Prisma.ItemWhereInput | undefined {
  if (!where) return undefined

  const conditions: Prisma.ItemWhereInput[] = []

  if (where.title_contains) {
    conditions.push({ title: { contains: where.title_contains, mode: 'insensitive' } })
  }

  if (where.description_contains) {
    conditions.push({ description: { contains: where.description_contains, mode: 'insensitive' } })
  }

  if (where.OR && where.OR.length > 0) {
    const orConditions = where.OR.map((orWhere) => buildItemWhere(orWhere)).filter(
      (c): c is Prisma.ItemWhereInput => c !== undefined
    )
    if (orConditions.length > 0) {
      return { OR: orConditions }
    }
  }

  if (conditions.length === 0) return undefined
  if (conditions.length === 1) return conditions[0]
  return { AND: conditions }
}

/**
 * Convert GraphQL orderBy to Prisma orderBy
 */
function buildItemOrderBy(
  orderBy?: ItemOrderByInput
): Prisma.ItemOrderByWithRelationInput | undefined {
  if (!orderBy) return { createdAt: 'desc' }

  const [field, direction] = orderBy.split('_') as [string, 'ASC' | 'DESC']
  const dir = direction.toLowerCase() as 'asc' | 'desc'

  switch (field) {
    case 'id':
      return { id: dir }
    case 'title':
      return { title: dir }
    case 'price':
      return { price: dir }
    case 'createdAt':
      return { createdAt: dir }
    default:
      return { createdAt: 'desc' }
  }
}

export const Query = {
  /**
   * Get paginated list of items
   */
  async items(
    _parent: unknown,
    args: {
      where?: ItemWhereInput
      orderBy?: ItemOrderByInput
      skip?: number
      first?: number
    },
    ctx: GraphQLContext
  ) {
    const where = buildItemWhere(args.where)
    const orderBy = buildItemOrderBy(args.orderBy)

    return ctx.prisma.item.findMany({
      where,
      orderBy,
      skip: args.skip || 0,
      take: args.first || 10,
      include: {
        user: true,
      },
    })
  },

  /**
   * Get single item by ID
   */
  async item(_parent: unknown, args: { id: string }, ctx: GraphQLContext) {
    return ctx.prisma.item.findUnique({
      where: { id: args.id },
      include: {
        user: true,
      },
    })
  },

  /**
   * Get items connection for pagination info
   */
  async itemsConnection(
    _parent: unknown,
    args: { where?: ItemWhereInput },
    ctx: GraphQLContext
  ) {
    const where = buildItemWhere(args.where)
    const count = await ctx.prisma.item.count({ where })
    return {
      aggregate: { count },
    }
  },

  /**
   * Get current logged-in user
   */
  async me(_parent: unknown, _args: unknown, ctx: GraphQLContext) {
    if (!ctx.request.userId) {
      return null
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
    })
  },

  /**
   * Get all users (admin only)
   */
  async users(_parent: unknown, _args: unknown, ctx: GraphQLContext) {
    if (!ctx.request.userId) {
      throw userFacingError('You must be logged in!', 'UNAUTHENTICATED')
    }

    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

    return ctx.prisma.user.findMany({
      include: {
        cart: {
          include: {
            item: true,
          },
        },
      },
    })
  },

  /**
   * Get single order by ID
   */
  async order(_parent: unknown, args: { id: string }, ctx: GraphQLContext) {
    if (!ctx.request.userId) {
      throw userFacingError('You must be logged in!', 'UNAUTHENTICATED')
    }

    const order = await ctx.prisma.order.findUnique({
      where: { id: args.id },
      include: {
        items: true,
        user: true,
      },
    })

    if (!order) {
      throw userFacingError('Order not found', 'NOT_FOUND')
    }

    const ownsOrder = order.userId === ctx.request.userId
    const isAdmin = ctx.request.user?.permissions.includes('ADMIN')

    if (!ownsOrder && !isAdmin) {
      throw userFacingError('You cannot see this order', 'FORBIDDEN')
    }

    return order
  },

  /**
   * Get all orders for current user
   */
  async orders(_parent: unknown, _args: unknown, ctx: GraphQLContext) {
    if (!ctx.request.userId) {
      throw userFacingError('You must be signed in!', 'UNAUTHENTICATED')
    }

    return ctx.prisma.order.findMany({
      where: { userId: ctx.request.userId },
      include: {
        items: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },
}
