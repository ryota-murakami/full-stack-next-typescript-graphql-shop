import { userFacingError } from './errors.js';
/**
 * Ensures a signed-in user has at least one required permission before admin resolvers run.
 * @param user - The current user loaded from the auth cookie.
 * @param permissionsNeeded - The accepted permissions for this operation.
 * @returns Nothing when access is allowed; throws a safe GraphQL error otherwise.
 * @example
 * hasPermission(user, ['ADMIN'])
 */
export function hasPermission(user, permissionsNeeded) {
    if (!user) {
        throw userFacingError('You must be logged in!', 'UNAUTHENTICATED');
    }
    const matchedPermissions = user.permissions.filter((permission) => permissionsNeeded.includes(permission));
    if (matchedPermissions.length === 0) {
        throw userFacingError(`You do not have sufficient permissions.
      Required: ${permissionsNeeded.join(', ')}
      You have: ${user.permissions.join(', ')}
    `, 'FORBIDDEN');
    }
}
/**
 * Format money from cents to dollars
 */
export function formatMoney(amount) {
    const options = {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    };
    // If it's a whole dollar amount, don't show cents
    if (amount % 100 === 0) {
        options.minimumFractionDigits = 0;
    }
    return new Intl.NumberFormat('en-US', options).format(amount / 100);
}
//# sourceMappingURL=utils.js.map