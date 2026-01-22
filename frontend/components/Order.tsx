'use client'

/**
 * Single Order Detail Component
 * Displays order information including items, totals, and timestamps.
 */
import { useQuery } from '@apollo/client'
import { SINGLE_ORDER_QUERY } from '@/lib/graphql/queries'
import type { SingleOrderData } from '@/lib/graphql/types'
import { formatMoney } from '@/lib/utils'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Loader2, Package, CreditCard, Calendar } from 'lucide-react'

interface OrderProps {
  id: string
}

export function Order({ id }: OrderProps) {
  const { data, loading, error } = useQuery<SingleOrderData>(SINGLE_ORDER_QUERY, {
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

  if (!data?.order) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        <Package className="mx-auto mb-4 h-12 w-12" />
        <p>Order not found</p>
      </div>
    )
  }

  const order = data.order
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Details</CardTitle>
            <Badge variant="secondary">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Order Date</dt>
                <dd className="font-medium">
                  {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Charge ID</dt>
                <dd className="font-mono text-sm">{order.charge}</dd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Total</dt>
                <dd className="text-lg font-bold text-primary">
                  {formatMoney(order.total)}
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                {item.image && (
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
