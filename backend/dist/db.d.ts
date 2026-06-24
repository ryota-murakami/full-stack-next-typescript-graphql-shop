/**
 * Prisma Client instance for database operations
 * @description Prisma 7+ requires driver adapters for database connections
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
declare global {
    var prisma: PrismaClient | undefined;
}
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/client").DefaultArgs>;
export default prisma;
//# sourceMappingURL=db.d.ts.map