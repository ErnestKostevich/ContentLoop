import { NextRequest, NextResponse } from "next/server";
import {
  verifyIpnSignature,
  PAID_STATUSES,
  type IpnPayload,
} from "@/lib/nowpayments";
import { getDb, schema } from "@/lib/db";

export const runtime = "nodejs";

/**
 * NOWPayments IPN (Instant Payment Notification) receiver.
 *
 * Local testing:
 *   NOWPayments has a "Test" mode in the dashboard that lets you
 *   simulate IPN callbacks. Use ngrok or a tunnel for development:
 *     ngrok http 3000
 *     → set the public URL in NOWPayments dashboard as IPN callback
 *
 * What this does today: verifies signature, logs status. When the DB
 * lands (v0.5), we'll persist the subscription state per user.
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-nowpayments-sig");
  const rawBody = await req.text();

  const valid = await verifyIpnSignature(rawBody, sig);
  if (!valid) {
    console.warn("[nowpayments] rejected webhook: invalid signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let payload: IpnPayload;
  try {
    payload = JSON.parse(rawBody) as IpnPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = payload.payment_status;
  const isPaid = PAID_STATUSES.has(status);

  console.log(
    `[nowpayments] order=${payload.order_id} status=${status} ${isPaid ? "(GRANT ACCESS)" : ""}`
  );

  // Persist subscription state when DB is available
  const db = getDb();
  if (db && isPaid) {
    // order_id format: `pro__<userId>__<timestamp>` (set in /api/checkout)
    // userId is the Clerk user id, or "anon" for anonymous checkouts.
    const parts = String(payload.order_id ?? "").split("__");
    const userId = parts.length >= 3 ? parts[1] : "anon";
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    try {
      await db
        .insert(schema.proSubscriptions)
        .values({
          userId,
          id: String(payload.payment_id),
          provider: "nowpayments",
          orderId: payload.order_id,
          status,
          validUntil,
        })
        .onConflictDoUpdate({
          target: [
            schema.proSubscriptions.userId,
            schema.proSubscriptions.id,
          ],
          set: { status, validUntil },
        });
    } catch (e) {
      console.error("[nowpayments] failed to persist subscription", e);
    }
  }

  return NextResponse.json({ received: true });
}
