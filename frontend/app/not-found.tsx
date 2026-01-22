/**
 * 404 Not Found Page
 * Displayed when a route doesn't exist.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-2">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/items">
            <Button variant="outline">Browse Shop</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
