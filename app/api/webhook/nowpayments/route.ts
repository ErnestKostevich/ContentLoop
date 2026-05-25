import { NextRequest, NextResponse } from "next/server";
import {
  verifyIpnSignature,
  PAID_STATUSES,
  type IpnPayload,
} from "@/lib/nowpayments";

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

  // TODO (v0.5): When DB is wired, on paid → upsert subscription:
  //   - lookup user by order_id mapping
  //   - set validUntil = max(now, currentValidUntil) + 30 days
  //   - notify user (optional)

  return NextResponse.json({ received: true });
}
