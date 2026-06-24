/**
 * Utility functions for the backend
 */
import type { Permission, User } from '@prisma/client';
/**
 * Ensures a signed-in user has at least one required permission before admin resolvers run.
 * @param user - The current user loaded from the auth cookie.
 * @param permissionsNeeded - The accepted permissions for this operation.
 * @returns Nothing when access is allowed; throws a safe GraphQL error otherwise.
 * @example
 * hasPermission(user, ['ADMIN'])
 */
export declare function hasPermission(user: Pick<User, 'permissions'> | null | undefined, permissionsNeeded: Permission[]): void;
/**
 * Format money from cents to dollars
 */
export declare function formatMoney(amount: number): string;
//# sourceMappingURL=utils.d.ts.map