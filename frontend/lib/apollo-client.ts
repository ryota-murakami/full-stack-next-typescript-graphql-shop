/**
 * Apollo Client configuration for Next.js App Router
 */
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

const endpoint =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000/graphql'
    : process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'

/**
 * Error handling link
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
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
let client: ApolloClient<unknown> | undefined

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
