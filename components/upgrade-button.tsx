"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function UpgradeButton({
  enabled,
  className,
}: {
  enabled: boolean;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Couldn't start checkout. Try again.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) {
    return (
      <button
        type="button"
        disabled
        className={
          className ??
          "mt-7 inline-flex h-10 w-full items-center justify-center rounded-lg bg-white text-sm font-medium text-neutral-950 opacity-90 cursor-not-allowed"
        }
      >
        Join waitlist (soon)
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={
          className ??
          "mt-7 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-neutral-950 hover:bg-neutral-200 transition disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting…
          </>
        ) : (
          "Upgrade to Pro"
        )}
      </button>
      {error && (
        <p className="mt-2 text-xs text-amber-300">{error}</p>
      )}
    </>
  );
}
