'use client';
/**
 * Apollo Provider for Next.js App Router
 * Wraps the application with ApolloProvider
 */


import { ApolloProvider } from "@apollo/client/react";
import { makeClient } from './apollo-client'
import { useMemo, type ReactNode } from 'react'

interface ApolloWrapperProps {
  children: ReactNode
}

export function ApolloWrapper({ children }: ApolloWrapperProps) {
  const client = useMemo(() => makeClient(), [])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
