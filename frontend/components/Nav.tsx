'use client'

/**
 * Navigation component
 */
import Link from 'next/link'
import { useQuery } from '@apollo/client'
import { CURRENT_USER_QUERY } from '@/lib/graphql/queries'
import type { CurrentUserData } from '@/lib/graphql/types'
import { useCartStore } from '@/lib/store'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Signout } from './Signout'
import { ShoppingCart } from 'lucide-react'

export function Nav() {
  const { data, loading } = useQuery<CurrentUserData>(CURRENT_USER_QUERY)
  const toggleCart = useCartStore((state) => state.toggle)

  const user = data?.me

  // Calculate cart count
  const cartCount = user?.cart.reduce((count, item) => count + item.quantity, 0) || 0

  return (
    <nav className="flex items-center gap-4">
      <Link href="/items" className="text-sm font-medium hover:text-primary">
        Shop
      </Link>

      {user && (
        <>
          <Link href="/sell" className="text-sm font-medium hover:text-primary">
            Sell
          </Link>
          <Link href="/orders" className="text-sm font-medium hover:text-primary">
            Orders
          </Link>
          {user.permissions.includes('ADMIN') && (
            <Link
              href="/permissions"
              className="text-sm font-medium hover:text-primary"
            >
              Permissions
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCart}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
                {cartCount}
              </Badge>
            )}
          </Button>
          <Signout />
        </>
      )}

      {!user && !loading && (
        <Link href="/signin">
          <Button size="sm">Sign In</Button>
        </Link>
      )}
    </nav>
  )
}
