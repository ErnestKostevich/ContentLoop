/**
 * Auth feature flags + helpers.
 *
 * The whole site works without Clerk keys set — auth UI just hides.
 * To enable: add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
 * to your .env.local, then redeploy.
 *
 * Add to .env.local:
 *   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
 *   CLERK_SECRET_KEY=sk_test_xxx
 *
 * Once both are set, ClerkProvider in app/layout.tsx will mount,
 * <SignedIn>/<SignedOut> work in components, and the proxy below
 * starts enforcing routes you list in PROTECTED_ROUTES.
 */

export function isClerkEnabledClient(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 0
  );
}

export function isClerkEnabledServer(): boolean {
  return Boolean(
    process.env.CLERK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );
}

/**
 * Routes that require auth once Clerk is enabled.
 * Adjust as needed in proxy.ts.
 */
export const PROTECTED_ROUTES = [
  // "/dashboard(.*)",
  // "/api/checkout(.*)",
];
