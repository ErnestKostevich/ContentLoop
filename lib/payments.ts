/**
 * Payment provider abstraction.
 *
 * Auto-detects which provider is wired:
 *   1. If USDT wallet addresses are set → direct on-chain USDT (tx hash verify)
 *   2. Else if NOWPAYMENTS_API_KEY is set → NOWPayments (KYC-free crypto)
 *   3. Else if STRIPE_SECRET_KEY + STRIPE_PRICE_ID_PRO_MONTHLY are set → Stripe
 *   4. Else → payments disabled (UI shows "Coming soon")
 */

import { isNowPaymentsEnabledServer } from "./nowpayments";
import { isStripeEnabledServer } from "./stripe";
import { isDirectUsdtEnabledServer } from "./usdt-payment";

export type PaymentsProvider = "direct_usdt" | "nowpayments" | "stripe" | null;

export function activeProviderServer(): PaymentsProvider {
  const forced = process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER;
  if (forced === "direct_usdt" && isDirectUsdtEnabledServer()) return "direct_usdt";
  if (forced === "nowpayments" && isNowPaymentsEnabledServer()) return "nowpayments";
  if (forced === "stripe" && isStripeEnabledServer()) return "stripe";

  if (isDirectUsdtEnabledServer()) return "direct_usdt";
  if (isNowPaymentsEnabledServer()) return "nowpayments";
  if (isStripeEnabledServer()) return "stripe";
  return null;
}

export function paymentsEnabledServer(): boolean {
  return activeProviderServer() !== null;
}

/** Pro plan price in USD (used by checkout providers). */
export const PRO_PLAN_USD = Number(process.env.USDT_PRO_AMOUNT_USD ?? process.env.PRO_PLAN_USD ?? "9");
export const PRO_PLAN_DAYS = 30;
export const PRO_PLAN_DESCRIPTION = "ContentLoop Pro — 30 days of premium features (Custom Formats, Brand Kits, Export, priority support).";
