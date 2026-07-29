import Stripe from "stripe";

/**
 * Null when STRIPE_SECRET_KEY is not configured (local dev without Stripe).
 * Every route handler that uses this must guard with `if (!stripe)`.
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
