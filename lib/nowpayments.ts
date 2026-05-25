/**
 * NOWPayments — KYC-free crypto payment processor.
 *
 * Docs: https://documenter.getpostman.com/view/7907941/2s93JusNJt
 *
 * Why this exists: Stripe requires KYC for the operator. NOWPayments
 * doesn't — you create an account, paste an API key, and start
 * receiving crypto. Withdrawals to a crypto wallet stay KYC-free;
 * converting to fiat may require KYC at the exchange you use, but
 * that's outside of NOWPayments.
 *
 * Set in .env.local:
 *   NOWPAYMENTS_API_KEY=...        (required)
 *   NOWPAYMENTS_IPN_SECRET=...     (recommended — for webhook verification)
 */

const API_BASE = "https://api.nowpayments.io/v1";

export interface CreateInvoiceArgs {
  priceAmount: number; // USD
  priceCurrency?: string; // default "usd"
  orderId: string;
  orderDescription: string;
  successUrl: string;
  cancelUrl: string;
  ipnCallbackUrl?: string;
  customerEmail?: string;
}

export interface InvoiceResponse {
  id: string;
  order_id: string;
  invoice_url: string;
  price_amount: string;
  price_currency: string;
  created_at: string;
  expiration_estimate_date?: string;
}

export function isNowPaymentsEnabledServer(): boolean {
  return Boolean(process.env.NOWPAYMENTS_API_KEY);
}

export async function createInvoice(
  args: CreateInvoiceArgs
): Promise<InvoiceResponse> {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) {
    throw new Error("NOWPAYMENTS_API_KEY is not set.");
  }

  const body = {
    price_amount: args.priceAmount,
    price_currency: args.priceCurrency ?? "usd",
    order_id: args.orderId,
    order_description: args.orderDescription,
    ipn_callback_url: args.ipnCallbackUrl,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    customer_email: args.customerEmail,
    // Let user pick their crypto on NOWPayments' hosted page
    is_fixed_rate: true,
    is_fee_paid_by_user: true,
  };

  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `NOWPayments invoice creation failed (${res.status}): ${text || "no body"}`
    );
  }

  return (await res.json()) as InvoiceResponse;
}

/**
 * Verify an IPN webhook signature.
 *
 * NOWPayments signs the **sorted** JSON of the raw body with HMAC-SHA512
 * using your IPN secret, sends it in the `x-nowpayments-sig` header.
 */
export async function verifyIpnSignature(
  rawBody: string,
  receivedSignature: string | null
): Promise<boolean> {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !receivedSignature) return false;

  // NOWPayments sorts top-level keys alphabetically before signing
  let sortedJson: string;
  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>;
    const sorted = Object.keys(parsed)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = parsed[k];
        return acc;
      }, {});
    sortedJson = JSON.stringify(sorted);
  } catch {
    return false;
  }

  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha512", secret).update(sortedJson).digest("hex");

  // Defensive constant-time compare
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(receivedSignature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type NowPaymentsStatus =
  | "waiting"
  | "confirming"
  | "confirmed"
  | "sending"
  | "partially_paid"
  | "finished"
  | "failed"
  | "refunded"
  | "expired";

export interface IpnPayload {
  payment_id: number | string;
  payment_status: NowPaymentsStatus;
  order_id: string;
  order_description?: string;
  price_amount: number;
  price_currency: string;
  pay_amount?: number;
  pay_currency?: string;
}

/** Statuses that mean "the user has paid and we should grant access". */
export const PAID_STATUSES: ReadonlySet<NowPaymentsStatus> = new Set([
  "finished",
  "confirmed",
]);
