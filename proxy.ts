/**
 * Next.js 16 renamed `middleware.ts` → `proxy.ts`.
 *
 * When Clerk env vars are present, we mount clerkMiddleware so
 * `auth()` works in API routes and Server Components.
 * When not, we export a no-op so the file still satisfies the
 * matcher convention without pulling Clerk into the bundle path.
 */
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const clerkEnabled = Boolean(
  process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

const noop = (_req: NextRequest) => NextResponse.next();

export default clerkEnabled ? clerkMiddleware() : noop;

export const config = {
  // Run on everything except static assets and Next internals.
  // This matches Clerk's recommended matcher so all API routes
  // (where auth() is called) are covered.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)",
  ],
};
