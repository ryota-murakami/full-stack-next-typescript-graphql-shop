/**
 * Check if user has required permissions
 * @throws Error if user lacks permissions
 */
export function hasPermission(user, permissionsNeeded) {
    if (!user) {
        throw new Error('You must be logged in!');
    }
    const matchedPermissions = user.permissions.filter((permission) => permissionsNeeded.includes(permission));
    if (matchedPermissions.length === 0) {
        throw new Error(`You do not have sufficient permissions.
      Required: ${permissionsNeeded.join(', ')}
      You have: ${user.permissions.join(', ')}
    `);
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