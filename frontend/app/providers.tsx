'use client'

/**
 * Client-side providers wrapper
 * Includes:
 * - ApolloWrapper: GraphQL client provider
 * - ThemeProvider: Dark/light mode support via next-themes
 */
import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { ApolloWrapper } from '@/lib/apollo-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ApolloWrapper>{children}</ApolloWrapper>
    </ThemeProvider>
  )
}
