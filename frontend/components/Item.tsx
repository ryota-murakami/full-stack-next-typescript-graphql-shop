'use client';
/**
 * Individual item card component
 */
import Image from 'next/image'
import Link from 'next/link'
import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_TO_CART_MUTATION, DELETE_ITEM_MUTATION } from '@/lib/graphql/mutations'
import { ALL_ITEMS_QUERY, CURRENT_USER_QUERY } from '@/lib/graphql/queries'
import type { Item as ItemType, CurrentUserData } from '@/lib/graphql/types'
import { formatMoney } from '@/lib/utils'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter } from './ui/card'
import { ShoppingCart, Pencil, Trash2 } from 'lucide-react'

interface ItemProps {
  item: ItemType
}

export function Item({ item }: ItemProps) {
  const { data: userData } = useQuery<CurrentUserData>(CURRENT_USER_QUERY)
  const user = userData?.me

  const [addToCart, { loading: addingToCart }] = useMutation(
    ADD_TO_CART_MUTATION,
    {
      variables: { id: item.id },
      refetchQueries: [{ query: CURRENT_USER_QUERY }],
    }
  )

  const [deleteItem, { loading: deleting }] = useMutation(DELETE_ITEM_MUTATION, {
    variables: { id: item.id },
    refetchQueries: [{ query: ALL_ITEMS_QUERY }],
  })

  return (
    <Card className="overflow-hidden">
      {item.image && (
        <Link href={`/item/${item.id}`}>
          <div className="relative aspect-video overflow-hidden bg-muted">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
            <span className="absolute bottom-2 right-2 rounded bg-primary px-2 py-1 text-sm font-semibold text-primary-foreground">
              {formatMoney(item.price)}
            </span>
          </div>
        </Link>
      )}
      <CardContent className="p-4">
        <Link href={`/item/${item.id}`}>
          <h2 className="text-lg font-semibold hover:text-primary">
            {item.title}
          </h2>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2 p-4 pt-0">
        {user && (
          <>
            <Button
              size="sm"
              onClick={() => addToCart()}
              disabled={addingToCart}
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Add to Cart
            </Button>
            {user.id === item.user?.id && (
              <>
                <Link href={`/update/${item.id}`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this item?')) {
                      deleteItem()
                    }
                  }}
                  disabled={deleting}
                  aria-label="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}
