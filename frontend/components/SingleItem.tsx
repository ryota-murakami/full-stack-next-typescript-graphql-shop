'use client'

/**
 * Single item detail component
 */
import Image from 'next/image'
import { useQuery } from '@apollo/client'
import { SINGLE_ITEM_QUERY } from '@/lib/graphql/queries'
import type { SingleItemData } from '@/lib/graphql/types'
import { formatMoney } from '@/lib/utils'
import { Card, CardContent } from './ui/card'
import { Loader2 } from 'lucide-react'

interface SingleItemProps {
  id: string
}

export function SingleItem({ id }: SingleItemProps) {
  const { data, loading, error } = useQuery<SingleItemData>(SINGLE_ITEM_QUERY, {
    variables: { id },
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

  if (!data?.item) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Item not found
      </div>
    )
  }

  const { item } = data

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-2">
        {item.largeImage && (
          <div className="relative aspect-square bg-muted">
            <Image
              src={item.largeImage}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardContent className="flex flex-col justify-center p-8">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {formatMoney(item.price)}
          </p>
          <p className="mt-4 text-muted-foreground">{item.description}</p>
        </CardContent>
      </div>
    </Card>
  )
}
