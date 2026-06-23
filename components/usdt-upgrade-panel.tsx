"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { setProValidUntil } from "@/lib/pro";

type Network = "trc20" | "erc20";

interface PaymentConfig {
  amountLabel: string;
  planDays: number;
  maxAgeHours: number;
  networks: {
    trc20: { label: string; address: string };
    erc20: { label: string; address: string };
  };
}

export function UsdtUpgradePanel({ className }: { className?: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [network, setNetwork] = useState<Network>("trc20");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/payment/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.enabled) setConfig(data);
      })
      .catch(() => {});
  }, []);

  if (!config) return null;

  const active = config.networks[network];

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
      setSuccess(`Pro active until ${new Date(data.proValidUntil).toLocaleDateString()}`);
      setTxHash("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className ?? "mt-7 space-y-4 text-left"}>
      <div className="flex gap-2">
        {(["trc20", "erc20"] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNetwork(n)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              network === n
                ? "bg-white text-black"
                : "border border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]"
            }`}
          >
            {config.networks[n].label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm text-neutral-300">
          Send exactly{" "}
          <span className="font-semibold text-white">{config.amountLabel} USDT</span>{" "}
          to:
        </p>
        <div className="mt-3 flex items-start gap-2">
          <code className="flex-1 break-all rounded-lg bg-black/40 px-3 py-2 text-xs text-fuchsia-200">
            {active.address}
          </code>
          <button
            type="button"
            onClick={copyAddress}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-neutral-300 hover:bg-white/[0.06]"
            aria-label="Copy address"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Payment must be within the last {config.maxAgeHours} hours. You get{" "}
          {config.planDays} days of Pro after verification.
        </p>
      </div>

      {!isLoaded ? (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
        </div>
      ) : !isSignedIn ? (
        <p className="text-xs text-amber-300">Sign in first, then paste your tx hash below.</p>
      ) : null}

      <div>
        <label htmlFor="tx-hash" className="text-xs uppercase tracking-wider text-neutral-500">
          Transaction hash
        </label>
        <input
          id="tx-hash"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder={network === "trc20" ? "TRON tx hash" : "0x… Ethereum tx hash"}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-fuchsia-400/40 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={verify}
        disabled={loading || !isSignedIn || !txHash.trim()}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-neutral-950 hover:bg-neutral-200 transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying on-chain…
          </>
        ) : (
          "Verify payment & activate Pro"
        )}
      </button>

      {error && <p className="text-xs text-rose-300">{error}</p>}
      {success && <p className="text-xs text-emerald-300">{success}</p>}
    </div>
  );
}