"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

/**
 * Renders nothing if Clerk isn't configured (env key absent).
 * Otherwise shows a SignIn button for anonymous users and a UserButton
 * for signed-in users.
 *
 * Note: Clerk 7 removed <SignedIn>/<SignedOut> in favor of the
 * useAuth() hook, so we gate visibility manually.
 */
export function AuthButtons() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return null;
  return <Inner />;
}

function Inner() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div
        aria-hidden
        className="h-8 w-16 animate-pulse rounded-lg bg-white/[0.04]"
      />
    );
  }

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
          },
        }}
      />
    );
  }

  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-100 hover:bg-white/[0.07] transition"
      >
        Sign in
      </button>
    </SignInButton>
  );
}
