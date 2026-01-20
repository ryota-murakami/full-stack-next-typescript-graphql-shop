'use client'

/**
 * Pagination component
 */
import Link from 'next/link'
import { useQuery } from '@apollo/client'
import { PAGINATION_QUERY } from '@/lib/graphql/queries'
import type { PaginationData } from '@/lib/graphql/types'
import { perPage } from '@/lib/utils'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
}

export function Pagination({ page }: PaginationProps) {
  const { data, loading } = useQuery<PaginationData>(PAGINATION_QUERY)

  const count = data?.itemsConnection.aggregate.count || 0
  const pages = Math.ceil(count / perPage)

  if (loading || pages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4">
      <Link href={`/?page=${page - 1}`}>
        <Button variant="outline" size="sm" disabled={page <= 1}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Prev
        </Button>
      </Link>
      <span className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </span>
      <Link href={`/?page=${page + 1}`}>
        <Button variant="outline" size="sm" disabled={page >= pages}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
