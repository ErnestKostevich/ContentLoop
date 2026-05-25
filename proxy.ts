import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 renamed `middleware.ts` → `proxy.ts`.
 * This file is intentionally a no-op until Clerk is configured.
 *
 * To turn on auth:
 *   1. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY to .env.local
 *   2. Uncomment the clerk block below
 *   3. List paths that require auth in the matcher
 */

const clerkEnabled = Boolean(
  process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

// ──────────────────────────────────────────────────────────
// When you enable Clerk, replace the body below with:
//
//   import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
//   const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
//   export default clerkMiddleware((auth, req) => {
//     if (isProtectedRoute(req)) auth().protect();
//   });
// ──────────────────────────────────────────────────────────

export default function proxy(request: NextRequest) {
  // No-op for now. clerkEnabled is here so the import isn't unused.
  void clerkEnabled;
  void request;
  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)",
  ],
};
