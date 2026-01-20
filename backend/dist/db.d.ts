/**
 * Prisma Client instance for database operations
 * Replaces the old prisma-binding approach
 */
import { PrismaClient } from '@prisma/client';
declare global {
    var prisma: PrismaClient | undefined;
}
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=db.d.ts.map