import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format money from cents to currency string
 */
export function formatMoney(amount: number): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }

  // If it's a whole dollar amount, don't show cents
  if (amount % 100 === 0) {
    options.minimumFractionDigits = 0
  }

  return new Intl.NumberFormat('en-US', options).format(amount / 100)
}

/**
 * Calculate total price from cart items
 */
export function calcTotalPrice(
  cart: Array<{
    quantity: number
    item?: { price: number } | null
  }>
): number {
  return cart.reduce((tally, cartItem) => {
    if (!cartItem.item) return tally
    return tally + cartItem.quantity * cartItem.item.price
  }, 0)
}

/**
 * Items per page for pagination
 */
export const perPage = 4
