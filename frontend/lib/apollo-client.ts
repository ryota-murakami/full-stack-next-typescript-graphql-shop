/**
 * Apollo Client configuration for Next.js App Router
 */
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  CombinedGraphQLErrors,
  from,
} from '@apollo/client'
import { ErrorLink } from '@apollo/client/link/error'

const endpoint =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000/graphql'
    : process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'

/**
 * Logs Apollo errors without triggering Next.js dev overlay for expected GraphQL failures.
 * @param message - The printable error summary.
 * @param details - Optional structured error details from Apollo.
 * @returns Nothing; writes to the browser console only.
 * @example
 * logApolloError('[GraphQL error]: Message: Nope')
 */
const logApolloError = (message: string, details?: unknown) => {
  const logger = process.env.NODE_ENV === 'production' ? console.error : console.warn
  logger(message, details)
}

/**
 * Error handling link
 * @description Logs GraphQL and network errors to console (Apollo Client 4 API)
 */
const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path }) =>
      logApolloError(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
      )
    )
  } else if (error) {
    logApolloError('[Network error]:', error)
  }
})

/**
 * HTTP link for GraphQL requests
 */
const httpLink = new HttpLink({
  uri: endpoint,
  credentials: 'include', // Include cookies for auth
})

/**
 * Create Apollo Client instance
 * @returns ApolloClient configured for the application
 */
export function makeClient() {
  return new ApolloClient({
    link: from([errorLink, httpLink]),

    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Merge paginated items
            items: {
              keyArgs: ['where'],
              merge(existing = [], incoming) {
                void existing
                return [...incoming]
              },
            },
          },
        },
        User: {
          fields: {
            cart: {
              merge(_, incoming) {
                return incoming
              },
            },
          },
        },
      },
    }),

    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  })
}

// Singleton client for SSR
let client: ReturnType<typeof makeClient> | undefined

/**
 * Get Apollo Client instance (singleton in browser)
 * @returns ApolloClient instance
 */
export function getClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new client
    return makeClient()
  }

  // Browser: reuse client
  if (!client) {
    client = makeClient()
  }
  return client
}
