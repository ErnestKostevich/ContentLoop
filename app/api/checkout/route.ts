import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeEnabledServer, PRO_PRICE_ID } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeEnabledServer()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID_PRO_MONTHLY to .env.local.",
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
    process.env.NEXT_PUBLIC_APP_URL ??
    new URL(req.url).origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      // Re-use existing customer if we know the email; otherwise Stripe will collect one.
      customer_email: body.email,
      client_reference_id: body.clientReferenceId,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${baseUrl}/app?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing?cancelled=1`,
      subscription_data: {
        metadata: {
          plan: "pro_monthly",
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Failed to create checkout session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
