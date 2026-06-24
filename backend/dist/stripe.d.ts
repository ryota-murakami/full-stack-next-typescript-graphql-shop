/**
 * Stripe client configuration
 * @description Lazy initialization to allow server to start without Stripe key
 */
import Stripe from 'stripe';
/**
 * Gets Stripe when checkout runs so local startup works without payment keys.
 * @returns Stripe client configured with STRIPE_SECRET.
 * @example
 * const charge = await getStripe().charges.create({ amount, currency: 'USD', source: 'tok_visa' })
 */
export declare function getStripe(): Stripe;
declare const _default: {
    getStripe: typeof getStripe;
};
export default _default;
//# sourceMappingURL=stripe.d.ts.map