import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeEnabledServer } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook receiver.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/webhook/stripe
 *   STRIPE_WEBHOOK_SECRET=whsec_... (paste from the CLI)
 *
 * What it does today: log + ack. When you wire a DB (Postgres + Prisma/Drizzle),
 * the TODO blocks are where you update user.plan / user.subscription_status.
 */
export async function POST(req: NextRequest) {
  if (!isStripeEnabledServer()) {
    return NextResponse.json({ error: "Stripe disabled" }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not set" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Invalid Stripe webhook signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: mark user as Pro in your DB using session.client_reference_id
      // or session.customer_email.
      console.log("[stripe] checkout.session.completed", {
        id: session.id,
        customer: session.customer,
        email: session.customer_details?.email,
      });
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      // TODO: sync subscription state to your DB.
      console.log(`[stripe] ${event.type}`, {
        id: sub.id,
        status: sub.status,
        customer: sub.customer,
      });
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      // TODO: notify user.
      console.log("[stripe] invoice.payment_failed", {
        id: inv.id,
        customer: inv.customer,
      });
      break;
    }
    default:
      // Unhandled event types are fine — Stripe just needs a 2xx.
      break;
  }

  return NextResponse.json({ received: true });
}
