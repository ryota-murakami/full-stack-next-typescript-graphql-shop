'use client'

/**
 * Individual cart item component
 */
import Image from 'next/image'
import { useMutation } from '@apollo/client'
import { REMOVE_FROM_CART_MUTATION } from '@/lib/graphql/mutations'
import { CURRENT_USER_QUERY } from '@/lib/graphql/queries'
import type { CartItem as CartItemType } from '@/lib/graphql/types'
import { formatMoney } from '@/lib/utils'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'

interface CartItemProps {
  cartItem: CartItemType
}

export function CartItem({ cartItem }: CartItemProps) {
  const [removeFromCart, { loading }] = useMutation(REMOVE_FROM_CART_MUTATION, {
    variables: { id: cartItem.id },
    refetchQueries: [{ query: CURRENT_USER_QUERY }],
    optimisticResponse: {
      removeFromCart: {
        __typename: 'CartItem',
        id: cartItem.id,
      },
    },
  })

  if (!cartItem.item) {
    return (
      <li className="flex items-center gap-4 rounded-lg border p-3">
        <p className="text-muted-foreground">This item has been removed</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromCart()}
          disabled={loading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </li>
    )
  }

  return (
    <li className="flex gap-4 rounded-lg border p-3">
      {cartItem.item.image && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            src={cartItem.item.image}
            alt={cartItem.item.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <h3 className="font-medium">{cartItem.item.title}</h3>
        <p className="text-sm text-muted-foreground">
          {cartItem.quantity} × {formatMoney(cartItem.item.price)}
        </p>
        <p className="font-semibold">
          {formatMoney(cartItem.item.price * cartItem.quantity)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeFromCart()}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  )
}
