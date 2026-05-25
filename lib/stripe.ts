/**
 * Stripe helpers.
 *
 * The checkout API + pricing CTA stay disabled until STRIPE_SECRET_KEY
 * and STRIPE_PRICE_ID_PRO_MONTHLY are set.
 */
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  _stripe = new Stripe(key, {
    // Pin the API version so Stripe API changes don't silently break us.
    apiVersion: "2026-04-22.dahlia",
    appInfo: {
      name: "ContentLoop",
      version: "0.1.0",
    },
  });
  return _stripe;
}

export function isStripeEnabledServer(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID_PRO_MONTHLY
  );
}

export function isStripeEnabledClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export const PRO_PRICE_ID = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
