/**
 * Payment provider abstraction.
 *
 * Auto-detects which provider is wired:
 *   1. If NOWPAYMENTS_API_KEY is set → use NOWPayments (KYC-free crypto)
 *   2. Else if STRIPE_SECRET_KEY + STRIPE_PRICE_ID_PRO_MONTHLY are set → Stripe
 *   3. Else → payments disabled (UI shows "Coming soon")
 */

import { isNowPaymentsEnabledServer } from "./nowpayments";
import { isStripeEnabledServer } from "./stripe";

export type PaymentsProvider = "nowpayments" | "stripe" | null;

export function activeProviderServer(): PaymentsProvider {
  if (isNowPaymentsEnabledServer()) return "nowpayments";
  if (isStripeEnabledServer()) return "stripe";
  return null;
}

export function paymentsEnabledServer(): boolean {
  return activeProviderServer() !== null;
}

/** Pro plan price in USD (used by both providers). */
export const PRO_PLAN_USD = 9;
export const PRO_PLAN_DAYS = 30;
export const PRO_PLAN_DESCRIPTION = "ContentLoop Pro — 30 days of premium features (Custom Formats, Brand Kits, Export, priority support).";
