import { NextResponse } from "next/server";
import { hasServerKey } from "@/lib/anthropic";
import { isStripeEnabledServer } from "@/lib/stripe";
import { isClerkEnabledServer } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Returns what's enabled on this deploy. The client uses this to decide
 * whether the user MUST bring their own key, and whether Pro/auth UI
 * should appear.
 */
export async function GET() {
  return NextResponse.json({
    // True when the deploy itself has an ANTHROPIC_API_KEY — in zero-cost
    // mode this is false and users must add their own key in Settings.
    serverKey: hasServerKey(),
    auth: isClerkEnabledServer(),
    payments: isStripeEnabledServer(),
  });
}
