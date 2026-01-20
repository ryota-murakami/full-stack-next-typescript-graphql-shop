/**
 * Utility functions for the backend
 */
import type { Permission, User } from '@prisma/client';
/**
 * Check if user has required permissions
 * @throws Error if user lacks permissions
 */
export declare function hasPermission(user: Pick<User, 'permissions'> | null | undefined, permissionsNeeded: Permission[]): void;
/**
 * Format money from cents to dollars
 */
export declare function formatMoney(amount: number): string;
//# sourceMappingURL=utils.d.ts.map