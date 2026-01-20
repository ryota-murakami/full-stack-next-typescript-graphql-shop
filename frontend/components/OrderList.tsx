'use client'

/**
 * Order list component
 */
import Link from 'next/link'
import { useQuery } from '@apollo/client'
import { USER_ORDERS_QUERY } from '@/lib/graphql/queries'
import type { UserOrdersData } from '@/lib/graphql/types'
import { formatMoney } from '@/lib/utils'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Loader2, Package } from 'lucide-react'

export function OrderList() {
  const { data, loading, error } = useQuery<UserOrdersData>(USER_ORDERS_QUERY)

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

  if (!data?.orders.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Package className="mx-auto mb-4 h-12 w-12" />
        <p>No orders yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.orders.map((order) => (
        <Link key={order.id} href={`/order/${order.id}`}>
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {format(new Date(order.createdAt), 'MMM d, yyyy')}
                </CardTitle>
                <Badge variant="secondary">{order.items.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-2">
                {order.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="h-10 w-10 overflow-hidden rounded-full border-2 border-background bg-muted"
                  >
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
              <p className="mt-3 text-lg font-semibold">
                {formatMoney(order.total)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
