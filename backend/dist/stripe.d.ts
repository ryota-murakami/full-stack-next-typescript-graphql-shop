/**
 * Stripe client configuration
 * @description Lazy initialization to allow server to start without Stripe key
 */
import Stripe from 'stripe';
/**
 * Get the Stripe instance (lazy initialization)
 * @throws Error if STRIPE_SECRET is not configured
 */
export declare function getStripe(): Stripe;
declare const _default: {
    getStripe: typeof getStripe;
};
export default _default;
//# sourceMappingURL=stripe.d.ts.map