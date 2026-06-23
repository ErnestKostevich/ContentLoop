import { NextResponse } from "next/server";
import { activeProviderServer } from "@/lib/payments";
import { getUsdtPaymentConfig, isDirectUsdtEnabledServer } from "@/lib/usdt-payment";

export const runtime = "nodejs";

export async function GET() {
  if (!isDirectUsdtEnabledServer()) {
    return NextResponse.json({ enabled: false });
  }

  const config = getUsdtPaymentConfig();
  return NextResponse.json({
    enabled: true,
    provider: activeProviderServer(),
    amountUsd: config.amountUsd,
    amountLabel: config.amountLabel,
    planDays: config.planDays,
    maxAgeHours: config.maxAgeHours,
    networks: {
      trc20: {
        label: "USDT · TRON (TRC-20)",
        address: config.trc20Address,
      },
      erc20: {
        label: "USDT · Ethereum (ERC-20)",
        address: config.erc20Address,
      },
    },
  });
}