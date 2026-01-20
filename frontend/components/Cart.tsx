'use client'

/**
 * Shopping cart sidebar component
 */
import { useQuery } from '@apollo/client'
import { CURRENT_USER_QUERY } from '@/lib/graphql/queries'
import type { CurrentUserData } from '@/lib/graphql/types'
import { useCartStore } from '@/lib/store'
import { formatMoney, calcTotalPrice } from '@/lib/utils'
import { Button } from './ui/button'
import { CartItem } from './CartItem'
import { X } from 'lucide-react'

export function Cart() {
  const { data } = useQuery<CurrentUserData>(CURRENT_USER_QUERY)
  const { isOpen, close } = useCartStore()

  const user = data?.me
  if (!user) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-background shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">{user.name}&apos;s Cart</h2>
            <Button variant="ghost" size="icon" onClick={close}>
              <X className="h-5 w-5" />
            </Button>
          </header>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {user.cart.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Your cart is empty
              </p>
            ) : (
              <ul className="space-y-4">
                {user.cart.map((cartItem) => (
                  <CartItem key={cartItem.id} cartItem={cartItem} />
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {user.cart.length > 0 && (
            <footer className="border-t p-4">
              <div className="mb-4 flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatMoney(calcTotalPrice(user.cart))}</span>
              </div>
              <Button className="w-full" size="lg">
                Checkout
              </Button>
            </footer>
          )}
        </div>
      </div>
    </>
  )
}
