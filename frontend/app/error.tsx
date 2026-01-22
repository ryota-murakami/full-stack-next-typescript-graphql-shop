'use client'

/**
 * Global Error Boundary
 * Catches runtime errors in the app and provides a recovery option.
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try again or contact support if the
            problem persists.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 overflow-auto rounded bg-muted p-4 text-left text-xs">
              {error.message}
            </pre>
          )}
        </CardContent>
        <CardFooter className="justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
