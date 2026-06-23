import { NextRequest, NextResponse } from "next/server";
import { isClerkEnabledServer } from "@/lib/auth";
import { grantProSubscription } from "@/lib/grant-pro";
import {
  isDirectUsdtEnabledServer,
  verifyUsdtPayment,
  type UsdtNetwork,
} from "@/lib/usdt-payment";

export const runtime = "nodejs";

interface VerifyBody {
  network?: UsdtNetwork;
  txHash?: string;
}

export async function POST(req: NextRequest) {
  if (!isDirectUsdtEnabledServer()) {
    return NextResponse.json(
      { error: "Direct USDT payments are not configured." },
      { status: 503 }
    );
  }

  if (!isClerkEnabledServer()) {
    return NextResponse.json(
      { error: "Sign in is required before verifying payment." },
      { status: 401 }
    );
  }

  let body: VerifyBody;
  try {
    body = (await req.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const network = body.network;
  const txHash = body.txHash?.trim();

  if (network !== "trc20" && network !== "erc20") {
    return NextResponse.json(
      { error: 'network must be "trc20" or "erc20".' },
      { status: 400 }
    );
  }
  if (!txHash) {
    return NextResponse.json({ error: "txHash is required." }, { status: 400 });
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to verify your payment." },
      { status: 401 }
    );
  }

  try {
    const verified = await verifyUsdtPayment(network, txHash);
    const provider = network === "trc20" ? "usdt_trc20" : "usdt_erc20";
    const { validUntil } = await grantProSubscription(
      userId,
      verified.txHash,
      provider
    );

    return NextResponse.json({
      ok: true,
      proValidUntil: validUntil,
      network: verified.network,
      txHash: verified.txHash,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}