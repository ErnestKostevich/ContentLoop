import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeEnabledServer, PRO_PRICE_ID } from "@/lib/stripe";
import {
  createInvoice,
  isNowPaymentsEnabledServer,
} from "@/lib/nowpayments";
import {
  activeProviderServer,
  PRO_PLAN_USD,
  PRO_PLAN_DESCRIPTION,
} from "@/lib/payments";
import { isClerkEnabledServer } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Order-id format: `pro__<userId>__<timestamp>`
 * Double underscore separator avoids collision with Clerk's user_xxx ids
 * which contain single underscores.
 */
function buildOrderId(userId: string | null): string {
  const uid = userId ?? "anon";
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `pro__${uid}__${t}${r}`;
}

async function getClerkUserId(): Promise<string | null> {
  if (!isClerkEnabledServer()) return null;
  try {
    // Dynamic import so Clerk's package isn't pulled in when it's not configured.
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const provider = activeProviderServer();
  if (!provider) {
    return NextResponse.json(
      {
        error:
          "Payments are not configured. Add either NOWPAYMENTS_API_KEY (no KYC, crypto) or STRIPE_SECRET_KEY to .env.local.",
      },
      { status: 503 }
    );
  }

  let body: { email?: string; clientReferenceId?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const userId = await getClerkUserId();

  // ─── NOWPayments (crypto, KYC-free) ───
  if (provider === "nowpayments" && isNowPaymentsEnabledServer()) {
    try {
      const orderId = buildOrderId(userId);
      const invoice = await createInvoice({
        priceAmount: PRO_PLAN_USD,
        priceCurrency: "usd",
        orderId,
        orderDescription: PRO_PLAN_DESCRIPTION,
        successUrl: `${baseUrl}/app?upgraded=1&order_id=${orderId}`,
        cancelUrl: `${baseUrl}/#pricing?cancelled=1`,
        ipnCallbackUrl: `${baseUrl}/api/webhook/nowpayments`,
        customerEmail: body.email,
      });
      return NextResponse.json({
        url: invoice.invoice_url,
        provider: "nowpayments",
        orderId,
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to create crypto invoice";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // ─── Stripe fallback ───
  if (provider === "stripe" && isStripeEnabledServer()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: PRO_PRICE_ID!, quantity: 1 }],
        customer_email: body.email,
        client_reference_id: userId ?? body.clientReferenceId,
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        success_url: `${baseUrl}/app?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/#pricing?cancelled=1`,
        subscription_data: {
          metadata: {
            plan: "pro_monthly",
            ...(userId ? { user_id: userId } : {}),
          },
        },
      });
      return NextResponse.json({ url: session.url, provider: "stripe" });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to create checkout session";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "No payment provider available." },
    { status: 503 }
  );
}
