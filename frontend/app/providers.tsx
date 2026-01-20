'use client'

/**
 * Client-side providers wrapper
 */
import { ReactNode } from 'react'
import { ApolloWrapper } from '@/lib/apollo-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <ApolloWrapper>{children}</ApolloWrapper>
}
