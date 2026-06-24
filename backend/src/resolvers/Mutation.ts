/**
 * Mutation Resolvers
 * Migrated from prisma-binding to Prisma Client
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { promisify } from 'util'
import { Prisma } from '@prisma/client'
import type { GraphQLContext, Permission } from '../types.js'
import { hasPermission } from '../utils.js'
import { transport, makeANiceEmail } from '../mail.js'
import { getStripe } from '../stripe.js'
import { userFacingError } from '../errors.js'

const randomBytesAsync = promisify(randomBytes)
const duplicateAccountMessage = 'An account already exists for that email.'

/**
 * Detects Prisma unique constraint errors so concurrent signup attempts still return safe form feedback.
 * @param error - The caught Prisma or runtime error.
 * @returns True when Prisma reports a unique constraint violation.
 * @example
 * isUniqueConstraintError(error) // => true
 */
const isUniqueConstraintError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'

export const Mutation = {
  /**
   * Create a new item
   */
  async createItem(
    _parent: unknown,
    args: {
      title: string
      description: string
      image?: string
      largeImage?: string
      price: number
    },
    ctx: GraphQLContext
  ) {
    if (!ctx.request.userId) {
      throw userFacingError(
        'You must be logged in to do that!',
        'UNAUTHENTICATED'
      )
    }

    return ctx.prisma.item.create({
      data: {
        title: args.title,
        description: args.description,
        image: args.image,
        largeImage: args.largeImage,
        price: args.price,
        user: {
          connect: { id: ctx.request.userId },
        },
      },
      include: {
        user: true,
      },
    })
  },

  /**
   * Update an existing item
   */
  async updateItem(
    _parent: unknown,
    args: {
      id: string
      title?: string
      description?: string
      price?: number
    },
    ctx: GraphQLContext
  ) {
    const { id, ...updates } = args
    if (!ctx.request.userId) {
      throw userFacingError('You must be logged in!', 'UNAUTHENTICATED')
    }

    const item = await ctx.prisma.item.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!item) {
      throw userFacingError('Item not found', 'NOT_FOUND')
    }

    const ownsItem = item.userId === ctx.request.userId
    const hasPermissions = ctx.request.user?.permissions.some((permission) =>
      ['ADMIN', 'ITEMUPDATE'].includes(permission)
    )

    if (!ownsItem && !hasPermissions) {
      throw userFacingError("You don't have permission to update this item", 'FORBIDDEN')
    }

    return ctx.prisma.item.update({
      where: { id },
      data: updates,
      include: {
        user: true,
      },
    })
  },

  /**
   * Delete an item
   */
  async deleteItem(_parent: unknown, args: { id: string }, ctx: GraphQLContext) {
    const item = await ctx.prisma.item.findUnique({
      where: { id: args.id },
      include: { user: true },
    })

    if (!item) {
      throw userFacingError('Item not found', 'NOT_FOUND')
    }

    const ownsItem = item.userId === ctx.request.userId
    const hasPermissions = ctx.request.user?.permissions.some((permission) =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    )

    if (!ownsItem && !hasPermissions) {
      throw userFacingError("You don't have permission to delete this item", 'FORBIDDEN')
    }

    return ctx.prisma.item.delete({
      where: { id: args.id },
      include: { user: true },
    })
  },

  /**
   * Sign up a new user
   */
  async signup(
    _parent: unknown,
    args: { email: string; password: string; name: string },
    ctx: GraphQLContext
  ) {
    const email = args.email.toLowerCase()
    const existingUser = await ctx.prisma.user.findUnique({ where: { email } })

    // Show a stable form error instead of leaking database internals.
    if (existingUser) {
      throw userFacingError(duplicateAccountMessage, 'BAD_USER_INPUT')
    }

    const password = await bcrypt.hash(args.password, 10)

    const user = await ctx.prisma.user
      .create({
        data: {
          email,
          password,
          name: args.name,
          permissions: ['USER'],
        },
        include: {
          cart: {
            include: { item: true },
          },
        },
      })
      .catch((error: unknown) => {
        // Concurrent requests can pass the pre-check, so keep the DB constraint as the final guard.
        if (isUniqueConstraintError(error)) {
          throw userFacingError(duplicateAccountMessage, 'BAD_USER_INPUT')
        }
        throw error
      })

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET!)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })

    return user
  },

  /**
   * Sign in an existing user
   */
  async signin(
    _parent: unknown,
    args: { email: string; password: string },
    ctx: GraphQLContext
  ) {
    const user = await ctx.prisma.user.findUnique({
      where: { email: args.email.toLowerCase() },
      include: {
        cart: {
          include: { item: true },
        },
      },
    })

    if (!user) {
      throw userFacingError(`No user found for email ${args.email}`, 'NOT_FOUND')
    }

    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
      throw userFacingError('Invalid password!', 'BAD_USER_INPUT')
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET!)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })

    return user
  },

  /**
   * Sign out the current user
   */
  signout(_parent: unknown, _args: unknown, ctx: GraphQLContext) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  },

  /**
   * Request a password reset
   */
  async requestReset(
    _parent: unknown,
    args: { email: string },
    ctx: GraphQLContext
  ) {
    const user = await ctx.prisma.user.findUnique({
      where: { email: args.email.toLowerCase() },
    })

    if (!user) {
      throw userFacingError(`No user found for email ${args.email}`, 'NOT_FOUND')
    }

    const resetToken = (await randomBytesAsync(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour

    await ctx.prisma.user.update({
      where: { email: args.email.toLowerCase() },
      data: { resetToken, resetTokenExpiry },
    })

    try {
      await transport.sendMail({
        from: 'shop@fullstack.dev',
        to: user.email,
        subject: 'Your Password Reset Token',
        html: makeANiceEmail(`
          Your password reset token is here!
          <br />
          <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
            Click here to reset your password
          </a>
        `),
      })
    } catch {
      throw userFacingError(
        'Password reset email could not be sent. Start Mailpit with pnpm db:up or configure MAIL_HOST, MAIL_PORT, MAIL_USER, and MAIL_PASS.',
        'MAIL_CONFIG_MISSING'
      )
    }

    return { message: 'Thanks! Check your email for a reset link.' }
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    _parent: unknown,
    args: { resetToken: string; password: string; confirmPassword: string },
    ctx: GraphQLContext
  ) {
    if (args.password !== args.confirmPassword) {
      throw userFacingError("Passwords don't match!", 'BAD_USER_INPUT')
    }

    const user = await ctx.prisma.user.findFirst({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry: { gte: Date.now() },
      },
    })

    if (!user) {
      throw userFacingError('This token is either invalid or expired!', 'BAD_USER_INPUT')
    }

    const password = await bcrypt.hash(args.password, 10)

    const updatedUser = await ctx.prisma.user.update({
      where: { id: user.id },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
      include: {
        cart: {
          include: { item: true },
        },
      },
    })

    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET!)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })

    return updatedUser
  },

  /**
   * Update user permissions (admin only)
   */
  async updatePermissions(
    _parent: unknown,
    args: { userId: string; permissions: Permission[] },
    ctx: GraphQLContext
  ) {
    if (!ctx.request.userId) {
      throw userFacingError('You must be logged in!', 'UNAUTHENTICATED')
    }

    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

    return ctx.prisma.user.update({
      where: { id: args.userId },
      data: {
        permissions: args.permissions,
      },
      include: {
        cart: {
          include: { item: true },
        },
      },
    })
  },

  /**
   * Add item to cart
   */
  async addToCart(_parent: unknown, args: { id: string }, ctx: GraphQLContext) {
    if (!ctx.request.userId) {
      throw userFacingError('You must be signed in!', 'UNAUTHENTICATED')
    }

    const existingCartItem = await ctx.prisma.cartItem.findFirst({
      where: {
        userId: ctx.request.userId,
        itemId: args.id,
      },
    })

    if (existingCartItem) {
      return ctx.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
        include: {
          item: true,
          user: true,
        },
      })
    }

    return ctx.prisma.cartItem.create({
      data: {
        user: { connect: { id: ctx.request.userId } },
        item: { connect: { id: args.id } },
      },
      include: {
        item: true,
        user: true,
      },
    })
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(
    _parent: unknown,
    args: { id: string },
    ctx: GraphQLContext
  ) {
    const cartItem = await ctx.prisma.cartItem.findUnique({
      where: { id: args.id },
      include: { user: true },
    })

    if (!cartItem) {
      throw userFacingError('No cart item found!', 'NOT_FOUND')
    }

    if (cartItem.userId !== ctx.request.userId) {
      throw userFacingError('This is not your cart item!', 'FORBIDDEN')
    }

    return ctx.prisma.cartItem.delete({
      where: { id: args.id },
      include: {
        item: true,
        user: true,
      },
    })
  },

  /**
   * Create an order from cart
   */
  async createOrder(
    _parent: unknown,
    args: { token: string },
    ctx: GraphQLContext
  ) {
    if (!ctx.request.userId) {
      throw userFacingError(
        'You must be signed in to complete this order.',
        'UNAUTHENTICATED'
      )
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.request.userId },
      include: {
        cart: {
          include: { item: true },
        },
      },
    })

    if (!user) {
      throw userFacingError('User not found', 'NOT_FOUND')
    }

    if (user.cart.length === 0) {
      throw userFacingError('Your cart is empty.', 'BAD_USER_INPUT')
    }

    const orderItems: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = []
    let amount = 0

    // Deleted items remain as null references, so skip them before charging.
    for (const cartItem of user.cart) {
      if (!cartItem.item) {
        continue
      }

      amount += cartItem.item.price * cartItem.quantity
      orderItems.push({
        title: cartItem.item.title,
        description: cartItem.item.description,
        image: cartItem.item.image || '',
        largeImage: cartItem.item.largeImage || '',
        price: cartItem.item.price,
        quantity: cartItem.quantity,
        userId: ctx.request.userId,
      })
    }

    if (orderItems.length === 0) {
      throw userFacingError(
        'Your cart does not contain available items.',
        'BAD_USER_INPUT'
      )
    }

    // Create Stripe charge
    const charge = await getStripe().charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    })

    // Create order
    const order = await ctx.prisma.order.create({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: {
          create: orderItems,
        },
        user: { connect: { id: ctx.request.userId } },
      },
      include: {
        items: true,
        user: true,
      },
    })

    // Clear cart
    await ctx.prisma.cartItem.deleteMany({
      where: { userId: ctx.request.userId },
    })

    return order
  },
}
