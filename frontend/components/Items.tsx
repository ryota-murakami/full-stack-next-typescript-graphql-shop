'use client'

/**
 * Items grid component
 */
import { useQuery } from '@apollo/client'
import { ALL_ITEMS_QUERY } from '@/lib/graphql/queries'
import type { AllItemsData } from '@/lib/graphql/types'
import { perPage } from '@/lib/utils'
import { Item } from './Item'
import { Loader2 } from 'lucide-react'

interface ItemsProps {
  page: number
}

export function Items({ page }: ItemsProps) {
  const { data, loading, error } = useQuery<AllItemsData>(ALL_ITEMS_QUERY, {
    variables: {
      skip: (page - 1) * perPage,
      first: perPage,
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive">
        Error: {error.message}
      </div>
    )
  }

  if (!data?.items.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No items found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
      {data.items.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  )
}
