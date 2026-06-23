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

function redirectWwwToApex(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0];
  if (host === "www.contentloop.fun") {
    const url = req.nextUrl.clone();
    url.host = "contentloop.fun";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }
  return null;
}

const clerk = clerkMiddleware({
  // Serve Clerk Frontend API from clerk.contentloop.fun once DNS is verified.
  frontendApiProxy: { enabled: true },
});

export default clerkEnabled
  ? (req: NextRequest) => redirectWwwToApex(req) ?? clerk(req)
  : (req: NextRequest) => redirectWwwToApex(req) ?? noop(req);

export const config = {
  // Run on everything except static assets and Next internals.
  // This matches Clerk's recommended matcher so all API routes
  // (where auth() is called) are covered.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)",
  ],
};
