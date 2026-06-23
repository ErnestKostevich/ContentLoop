"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, LogIn, X, Zap } from "lucide-react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { setProValidUntil } from "@/lib/pro";

type Network = "trc20" | "erc20";

interface PaymentConfig {
  amountUsd: number;
  amountLabel: string;
  planDays: number;
  maxAgeHours: number;
  networks: {
    trc20: { label: string; address: string };
    erc20: { label: string; address: string };
  };
}

const NETWORK_META: Record<
  Network,
  { short: string; chain: string; accent: string; ring: string; dot: string }
> = {
  trc20: {
    short: "TRC-20",
    chain: "TRON",
    accent: "from-rose-500/20 to-orange-500/5",
    ring: "ring-rose-400/50",
    dot: "bg-rose-400",
  },
  erc20: {
    short: "ERC-20",
    chain: "Ethereum",
    accent: "from-indigo-500/20 to-violet-500/5",
    ring: "ring-indigo-400/50",
    dot: "bg-indigo-400",
  },
};

const BTN =
  "mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-neutral-950 shadow-lg shadow-fuchsia-500/10 hover:bg-neutral-200 transition disabled:cursor-not-allowed disabled:opacity-60";

export function UsdtUpgradePanel({ className }: { className?: string }) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/payment/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.enabled) setConfig(data);
      })
      .catch(() => {});
  }, []);

  if (!config) return null;

  return (
    <>
      <UsdtPayTrigger
        className={className ?? BTN}
        amountLabel={config.amountLabel}
        onOpen={() => setOpen(true)}
      />
      {open && (
        <UsdtPaymentModal config={config} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function UsdtPayTrigger({
  className,
  amountLabel,
  onOpen,
}: {
  className: string;
  amountLabel: string;
  onOpen: () => void;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <button type="button" disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button type="button" className={className}>
          <LogIn className="h-4 w-4" />
          Sign in to pay {amountLabel}
        </button>
      </SignInButton>
    );
  }

  return (
    <button type="button" onClick={onOpen} className={className}>
      <Zap className="h-4 w-4" />
      Pay {amountLabel} USDT
    </button>
  );
}

function UsdtPaymentModal({
  config,
  onClose,
}: {
  config: PaymentConfig;
  onClose: () => void;
}) {
  const { isSignedIn } = useAuth();
  const [network, setNetwork] = useState<Network>("trc20");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const active = config.networks[network];
  const meta = NETWORK_META[network];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function copyAddress() {
    await navigator.clipboard.writeText(active.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function verify() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ network, txHash }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        proValidUntil?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.proValidUntil) {
        throw new Error(data.error ?? "Verification failed");
      }
      setProValidUntil(data.proValidUntil);
      setSuccess(
        `Pro active until ${new Date(data.proValidUntil).toLocaleDateString()}`
      );
      setTxHash("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="usdt-pay-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-2xl shadow-fuchsia-500/10">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-fuchsia-500/25 to-transparent blur-3xl" />

        <div className="relative border-b border-white/5 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-neutral-400 hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-300">
            upgrade to pro
          </p>
          <h2 id="usdt-pay-title" className="mt-1 font-display text-2xl text-white">
            Pay with USDT
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Send <span className="font-medium text-white">{config.amountLabel}</span>{" "}
            · {config.planDays} days of Pro · verified on-chain
          </p>
        </div>

        <div className="relative space-y-5 px-6 py-5">
          {/* Step 1 — network */}
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
              1 · Choose network
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(["trc20", "erc20"] as const).map((n) => {
                const m = NETWORK_META[n];
                const selected = network === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNetwork(n)}
                    className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                      selected
                        ? `border-white/20 bg-gradient-to-br ${m.accent} ring-2 ${m.ring}`
                        : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className={`inline-block h-2 w-2 rounded-full ${m.dot}`} />
                    <p className="mt-2 text-sm font-semibold text-white">
                      {m.short}
                    </p>
                    <p className="text-xs text-neutral-500">{m.chain}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 — send */}
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
              2 · Send payment
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-neutral-400">Amount</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-sm font-semibold text-emerald-300">
                  {config.amountLabel} USDT
                </span>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                Transfer to this {meta.chain} address (exact amount, last{" "}
                {config.maxAgeHours}h):
              </p>
              <div className="mt-3 flex items-start gap-2">
                <code className="flex-1 break-all rounded-xl border border-white/5 bg-black/50 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-fuchsia-200">
                  {active.address}
                </code>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.06]"
                  aria-label="Copy address"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 — verify */}
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
              3 · Confirm with tx hash
            </p>
            {!isSignedIn ? (
              <p className="rounded-xl border border-amber-400/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
                Sign in to link Pro to your account.
              </p>
            ) : (
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder={
                  network === "trc20"
                    ? "Paste TRON transaction hash"
                    : "Paste 0x… Ethereum transaction hash"
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-fuchsia-400/40 focus:outline-none focus:ring-1 focus:ring-fuchsia-400/20"
              />
            )}
          </div>

          <button
            type="button"
            onClick={verify}
            disabled={loading || !isSignedIn || !txHash.trim()}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-neutral-950 shadow-lg shadow-fuchsia-500/10 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying on-chain…
              </>
            ) : (
              "Verify & activate Pro"
            )}
          </button>

          {error && (
            <p className="rounded-xl border border-rose-400/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">
              {success}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}