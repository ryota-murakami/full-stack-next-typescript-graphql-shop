/**
 * Mutation Resolvers
 * Migrated from prisma-binding to Prisma Client
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { hasPermission } from '../utils.js';
import { transport, makeANiceEmail } from '../mail.js';
import { getStripe } from '../stripe.js';
const randomBytesAsync = promisify(randomBytes);
export const Mutation = {
    /**
     * Create a new item
     */
    async createItem(_parent, args, ctx) {
        if (!ctx.request.userId) {
            throw new Error('You must be logged in to do that!');
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
        });
    },
    /**
     * Update an existing item
     */
    async updateItem(_parent, args, ctx) {
        const { id, ...updates } = args;
        return ctx.prisma.item.update({
            where: { id },
            data: updates,
            include: {
                user: true,
            },
        });
    },
    /**
     * Delete an item
     */
    async deleteItem(_parent, args, ctx) {
        const item = await ctx.prisma.item.findUnique({
            where: { id: args.id },
            include: { user: true },
        });
        if (!item) {
            throw new Error('Item not found');
        }
        const ownsItem = item.userId === ctx.request.userId;
        const hasPermissions = ctx.request.user?.permissions.some((permission) => ['ADMIN', 'ITEMDELETE'].includes(permission));
        if (!ownsItem && !hasPermissions) {
            throw new Error("You don't have permission to delete this item");
        }
        return ctx.prisma.item.delete({
            where: { id: args.id },
            include: { user: true },
        });
    },
    /**
     * Sign up a new user
     */
    async signup(_parent, args, ctx) {
        const email = args.email.toLowerCase();
        const password = await bcrypt.hash(args.password, 10);
        const user = await ctx.prisma.user.create({
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
        });
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });
        return user;
    },
    /**
     * Sign in an existing user
     */
    async signin(_parent, args, ctx) {
        const user = await ctx.prisma.user.findUnique({
            where: { email: args.email.toLowerCase() },
            include: {
                cart: {
                    include: { item: true },
                },
            },
        });
        if (!user) {
            throw new Error(`No user found for email ${args.email}`);
        }
        const valid = await bcrypt.compare(args.password, user.password);
        if (!valid) {
            throw new Error('Invalid password!');
        }
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });
        return user;
    },
    /**
     * Sign out the current user
     */
    signout(_parent, _args, ctx) {
        ctx.response.clearCookie('token');
        return { message: 'Goodbye!' };
    },
    /**
     * Request a password reset
     */
    async requestReset(_parent, args, ctx) {
        const user = await ctx.prisma.user.findUnique({
            where: { email: args.email.toLowerCase() },
        });
        if (!user) {
            throw new Error(`No user found for email ${args.email}`);
        }
        const resetToken = (await randomBytesAsync(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await ctx.prisma.user.update({
            where: { email: args.email.toLowerCase() },
            data: { resetToken, resetTokenExpiry },
        });
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
        });
        return { message: 'Thanks! Check your email for a reset link.' };
    },
    /**
     * Reset password with token
     */
    async resetPassword(_parent, args, ctx) {
        if (args.password !== args.confirmPassword) {
            throw new Error("Passwords don't match!");
        }
        const user = await ctx.prisma.user.findFirst({
            where: {
                resetToken: args.resetToken,
                resetTokenExpiry: { gte: Date.now() },
            },
        });
        if (!user) {
            throw new Error('This token is either invalid or expired!');
        }
        const password = await bcrypt.hash(args.password, 10);
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
        });
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        });
        return updatedUser;
    },
    /**
     * Update user permissions (admin only)
     */
    async updatePermissions(_parent, args, ctx) {
        if (!ctx.request.userId) {
            throw new Error('You must be logged in!');
        }
        hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
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
        });
    },
    /**
     * Add item to cart
     */
    async addToCart(_parent, args, ctx) {
        if (!ctx.request.userId) {
            throw new Error('You must be signed in!');
        }
        const existingCartItem = await ctx.prisma.cartItem.findFirst({
            where: {
                userId: ctx.request.userId,
                itemId: args.id,
            },
        });
        if (existingCartItem) {
            return ctx.prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + 1 },
                include: {
                    item: true,
                    user: true,
                },
            });
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
        });
    },
    /**
     * Remove item from cart
     */
    async removeFromCart(_parent, args, ctx) {
        const cartItem = await ctx.prisma.cartItem.findUnique({
            where: { id: args.id },
            include: { user: true },
        });
        if (!cartItem) {
            throw new Error('No cart item found!');
        }
        if (cartItem.userId !== ctx.request.userId) {
            throw new Error('This is not your cart item!');
        }
        return ctx.prisma.cartItem.delete({
            where: { id: args.id },
            include: {
                item: true,
                user: true,
            },
        });
    },
    /**
     * Create an order from cart
     */
    async createOrder(_parent, args, ctx) {
        if (!ctx.request.userId) {
            throw new Error('You must be signed in to complete this order.');
        }
        const user = await ctx.prisma.user.findUnique({
            where: { id: ctx.request.userId },
            include: {
                cart: {
                    include: { item: true },
                },
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Calculate total
        const amount = user.cart.reduce((tally, cartItem) => {
            if (!cartItem.item)
                return tally;
            return tally + cartItem.item.price * cartItem.quantity;
        }, 0);
        // Create Stripe charge
        const charge = await getStripe().charges.create({
            amount,
            currency: 'USD',
            source: args.token,
        });
        // Convert cart items to order items
        const orderItems = user.cart
            .filter((cartItem) => cartItem.item !== null)
            .map((cartItem) => ({
            title: cartItem.item.title,
            description: cartItem.item.description,
            image: cartItem.item.image || '',
            largeImage: cartItem.item.largeImage || '',
            price: cartItem.item.price,
            quantity: cartItem.quantity,
            userId: ctx.request.userId,
        }));
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
        });
        // Clear cart
        await ctx.prisma.cartItem.deleteMany({
            where: { userId: ctx.request.userId },
        });
        return order;
    },
};
//# sourceMappingURL=Mutation.js.map