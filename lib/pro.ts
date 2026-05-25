/**
 * Pro entitlement check.
 *
 * Current model (pre-DB):
 *   - When Stripe ISN'T configured (no NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
 *     all Pro features are open. Self-hosters and devs get everything.
 *   - When Stripe IS configured, Pro features require a localStorage flag
 *     set by the Stripe Checkout success_url callback (?upgraded=1).
 *
 * This is honest enough for an MVP — bypassable by anyone technical, but
 * sufficient for normal users. Real server-side validation lands with
 * Clerk + Postgres in v0.4.
 */

const KEY_PRO = "contentloop:pro_unlocked";

export function isProUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY_PRO) === "true";
  } catch {
    return false;
  }
}

export function setProUnlocked(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(KEY_PRO, "true");
    else window.localStorage.removeItem(KEY_PRO);
  } catch {
    /* ignore */
  }
}

/** Stripe is "live" on this deploy. */
export function isPaymentsEnabledClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

/**
 * The user can use Pro features. Returns true when payments are off
 * (open-mode), or when payments are on and the user has the flag set.
 */
export function canUseProFeatures(): boolean {
  return !isPaymentsEnabledClient() || isProUnlocked();
}
