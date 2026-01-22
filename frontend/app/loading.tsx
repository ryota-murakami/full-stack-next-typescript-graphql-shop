/**
 * Global Loading State
 * Displays during page transitions and initial load.
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
