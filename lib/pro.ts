/**
 * Pro entitlement check (v0.5: time-window model).
 *
 * Storage shape:
 *   contentloop:pro_valid_until  →  ISO date string (e.g. "2026-06-25T15:30:00Z")
 *
 * After a successful payment the workspace receives `?upgraded=1` from
 * the provider's success_url and calls extendPro(30) to push validUntil
 * to max(now, current) + 30 days. The flag is rechecked on every load.
 *
 * When Stripe/NOWPayments isn't configured at all, Pro is "open" so
 * self-hosters and the operator get every feature for free.
 *
 * This is honest enough for an MVP — bypassable by anyone technical, but
 * sufficient for normal users. Real server-side validation lands with
 * Clerk + Postgres in v0.6.
 */

const KEY_VALID_UNTIL = "contentloop:pro_valid_until";

const DAY_MS = 24 * 60 * 60 * 1000;

function safeWindow(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getProValidUntil(): Date | null {
  const ls = safeWindow();
  if (!ls) return null;
  const raw = ls.getItem(KEY_VALID_UNTIL);
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function isProUnlocked(): boolean {
  const until = getProValidUntil();
  if (!until) return false;
  return until.getTime() > Date.now();
}

/**
 * Extend validity by `days`. Use this from the workspace when the user
 * lands back from a successful checkout.
 */
export function extendPro(days: number): Date {
  const ls = safeWindow();
  const now = Date.now();
  const current = getProValidUntil()?.getTime() ?? 0;
  const base = Math.max(now, current);
  const next = new Date(base + days * DAY_MS);
  if (ls) ls.setItem(KEY_VALID_UNTIL, next.toISOString());
  return next;
}

/** Legacy alias kept so existing call sites keep compiling. */
export function setProUnlocked(value: boolean): void {
  const ls = safeWindow();
  if (!ls) return;
  if (value) {
    extendPro(30);
  } else {
    ls.removeItem(KEY_VALID_UNTIL);
  }
}

export function clearPro(): void {
  const ls = safeWindow();
  if (!ls) return;
  ls.removeItem(KEY_VALID_UNTIL);
}

/** Stripe or NOWPayments configured? (Client side — uses public env vars.) */
export function isPaymentsEnabledClient(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER
  );
}

/**
 * Pro features available?
 *   - Payments not configured → open mode → true
 *   - Payments configured + valid until > now → true
 *   - Otherwise → false
 */
export function canUseProFeatures(): boolean {
  return !isPaymentsEnabledClient() || isProUnlocked();
}

/** Days remaining in the current Pro window (0 if expired or unset). */
export function daysRemaining(): number {
  const until = getProValidUntil();
  if (!until) return 0;
  const diff = until.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / DAY_MS));
}
