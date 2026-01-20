/**
 * Stripe client configuration
 * @description Lazy initialization to allow server to start without Stripe key
 */
import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

/**
 * Get the Stripe instance (lazy initialization)
 * @throws Error if STRIPE_SECRET is not configured
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET
    if (!apiKey) {
      throw new Error(
        'Stripe is not configured. Please set STRIPE_SECRET in your .env file.'
      )
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return stripeInstance
}

export default { getStripe }
