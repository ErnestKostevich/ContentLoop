import { NextResponse } from "next/server";
import { hasServerKey } from "@/lib/anthropic";
import { activeProviderServer } from "@/lib/payments";
import { isClerkEnabledServer } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Returns what's enabled on this deploy. The client uses this to decide
 * whether the user MUST bring their own key, whether to show Sign in,
 * and what payment provider to surface in the UI.
 */
export async function GET() {
  return NextResponse.json({
    serverKey: hasServerKey(),
    auth: isClerkEnabledServer(),
    paymentsProvider: activeProviderServer(), // "nowpayments" | "stripe" | null
  });
}
