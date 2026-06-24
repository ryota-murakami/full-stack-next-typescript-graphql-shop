import { GraphQLError } from 'graphql';
/**
 * Creates a GraphQL error whose message is safe for clients in local UI flows.
 * @param message - The user-facing message to expose through GraphQL.
 * @param code - The GraphQL extension code used by clients and tooling.
 * @returns A GraphQLError that Yoga will not mask as an internal failure.
 * @example
 * throw userFacingError('You must be signed in!', 'UNAUTHENTICATED')
 */
export function userFacingError(message, code = 'BAD_USER_INPUT') {
    return new GraphQLError(message, {
        extensions: { code },
    });
}
//# sourceMappingURL=errors.js.map