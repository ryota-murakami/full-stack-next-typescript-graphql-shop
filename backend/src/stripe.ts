/**
 * Stripe client configuration
 * @description Lazy initialization to allow server to start without Stripe key
 */
import Stripe from 'stripe'
import { userFacingError } from './errors.js'

let stripeInstance: Stripe | null = null

/**
 * Gets Stripe when checkout runs so local startup works without payment keys.
 * @returns Stripe client configured with STRIPE_SECRET.
 * @example
 * const charge = await getStripe().charges.create({ amount, currency: 'USD', source: 'tok_visa' })
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET
    if (!apiKey) {
      throw userFacingError(
        'Stripe is not configured. Set STRIPE_SECRET in backend/.env before checkout.',
        'PAYMENT_CONFIG_MISSING'
      )
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return stripeInstance
}

export default { getStripe }
