"use client";

import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { SignInButton, useAuth } from "@clerk/nextjs";

const CLERK_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export function UpgradeButton({
  enabled,
  className,
}: {
  enabled: boolean;
  className?: string;
}) {
  // When Clerk is configured AND payments are live, gate Upgrade behind
  // sign-in so the payment can be tied to a real user_id (otherwise Pro
  // disappears when localStorage is cleared).
  if (enabled && CLERK_ENABLED) {
    return <GatedButton className={className} />;
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

  return <DirectButton className={className} />;
}

/* ─────────────────────────── shared checkout call ─────────────────────────── */

function useCheckout() {
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
  return { loading, error, start };
}

const BTN_BASE =
  "mt-7 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-neutral-950 hover:bg-neutral-200 transition disabled:cursor-not-allowed disabled:opacity-70";

/* ─────────────────────────── No Clerk → direct path ─────────────────────────── */

function DirectButton({ className }: { className?: string }) {
  const { loading, error, start } = useCheckout();
  const cn = className ?? BTN_BASE;
  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={cn}
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
      {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
    </>
  );
}

/* ─────────────────────────── Clerk → require sign-in first ─────────────────────────── */

function GatedButton({ className }: { className?: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { loading, error, start } = useCheckout();
  const cn = className ?? BTN_BASE;

  if (!isLoaded) {
    return (
      <button type="button" disabled className={cn}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button type="button" className={cn}>
          <LogIn className="h-4 w-4" />
          Sign in to upgrade
        </button>
      </SignInButton>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={cn}
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
      {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
    </>
  );
}
